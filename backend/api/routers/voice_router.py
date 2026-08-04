"""
backend/api/routers/voice_router.py

Voice flow: audio upload -> Saaras (STT, mode="translate" -> English)
-> existing RAG pipeline (untouched, via chat_service) -> English
response -> translated back to user's language if needed ->
Bulbul (TTS) -> audio response.
"""

import os
import shutil
import traceback
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.services.chat_service import run_chat_pipeline
from backend.services.sarvam_service import (
    speech_to_text,
    text_to_speech,
    translate_text,
)
from backend.api.auth.auth_router import get_current_user


router = APIRouter()

TEMP_AUDIO_DIR = os.path.abspath("data/audio/uploads")
OUTPUT_AUDIO_DIR = os.path.abspath("data/audio/responses")


@router.post("/query")
def voice_query(
    audio: UploadFile = File(...),
    session_id: str | None = Form(default=None),
    language_code: str = Form(default="hi-IN"),
    current_user: dict = Depends(get_current_user),
):
    """
    Accepts an audio file, transcribes+translates it to English via
    Saaras, runs it through the normal chat pipeline, translates the
    response back to the user's language if needed, and returns both
    the text and a filename for the synthesized audio reply.
    """

    if not language_code:
        language_code = "hi-IN"

    os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)
    os.makedirs(OUTPUT_AUDIO_DIR, exist_ok=True)

    temp_path = None

    try:
        # ------------------------------------------------
        # Save uploaded audio to a temp file
        # ------------------------------------------------

        upload_ext = os.path.splitext(audio.filename or "")[1] or ".wav"
        temp_path = os.path.join(TEMP_AUDIO_DIR, f"{uuid.uuid4()}{upload_ext}")

        with open(temp_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)

        # ------------------------------------------------
        # Saaras: audio -> English text (mode="translate")
        # ------------------------------------------------

        try:
            english_query = speech_to_text(
                file_path=temp_path,
                language_code=language_code,
                mode="translate",
            )
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)  # don't keep raw uploads around

        if not english_query or not english_query.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not transcribe any speech from the audio.",
            )

        # ------------------------------------------------
        # Existing RAG pipeline — untouched
        # ------------------------------------------------

        result = run_chat_pipeline(
            query=english_query,
            session_id=session_id,
            user_id=current_user["user_id"],
        )

        english_response = result["response"]

        # ------------------------------------------------
        # Translate response back to the user's language
        # (skip the round-trip if they spoke English)
        # ------------------------------------------------

        if language_code.startswith("en"):
            spoken_response = english_response
        else:
            spoken_response = translate_text(
                text=english_response,
                source_language_code="en-IN",
                target_language_code=language_code,
            )

        # ------------------------------------------------
        # Bulbul: text -> speech
        # ------------------------------------------------

        audio_filename = f"{uuid.uuid4()}.mp3"
        output_path = os.path.join(OUTPUT_AUDIO_DIR, audio_filename)

        text_to_speech(
            text=spoken_response,
            output_path=output_path,
            language_code=language_code,
        )

        return {
            "session_id": result["session_id"],
            "transcribed_query": english_query,
            "response_text": spoken_response,
            "audio_filename": audio_filename,
            "preferred_categories": result["preferred_categories"],
            "map_images": result["map_images"],
        }

    except HTTPException:
        raise  # already has the right status code + message, pass through

    except Exception as e:
        traceback.print_exc()  # full traceback still prints to terminal
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {e}",
        )


@router.get("/audio/{filename}")
def get_voice_audio(filename: str):
    """
    Serves a synthesized voice response by filename
    (same pattern as maps_router.py).
    """

    file_path = os.path.abspath(os.path.join(OUTPUT_AUDIO_DIR, filename))

    if not file_path.startswith(OUTPUT_AUDIO_DIR):
        raise HTTPException(status_code=400, detail="Invalid filename.")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found.")

    return FileResponse(file_path, media_type="audio/mpeg")