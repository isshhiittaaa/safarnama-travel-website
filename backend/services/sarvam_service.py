"""
backend/services/sarvam_service.py

Wraps Sarvam AI's Speech-to-Text (Saaras), Text-to-Speech (Bulbul),
Translation, and Language Identification APIs. Reuses the same auth
pattern as backend/rag/pdf_ingest.py (SarvamAI client with
api_subscription_key from config.settings).
"""

import os
import re

from sarvamai import SarvamAI

from config.settings import SARVAM_API_KEY


client = SarvamAI(api_subscription_key=SARVAM_API_KEY)


# ====================================================
# Shared helper — chunk long text for APIs with per-request limits
# ====================================================

def _chunk_text(text: str, max_chars: int) -> list[str]:
    """
    Splits text into chunks under max_chars. Breaks on sentence
    boundaries first (English ". " or Hindi "। "), and as a hard
    guarantee, force-slices any single "sentence" that is itself
    still longer than max_chars (so Hindi/Devanagari text without
    English-style punctuation never produces an oversized chunk).
    """

    if len(text) <= max_chars:
        return [text]

    sentences = re.split(r"(?<=[.।])\s+", text.replace("\n", " "))
    chunks = []
    current = ""

    for sentence in sentences:

        # Hard guarantee: force-slice any oversized single sentence
        while len(sentence) > max_chars:
            if current:
                chunks.append(current.strip())
                current = ""
            chunks.append(sentence[:max_chars])
            sentence = sentence[max_chars:]

        if not sentence:
            continue

        candidate = f"{current} {sentence}".strip() if current else sentence

        if len(candidate) > max_chars:
            if current:
                chunks.append(current.strip())
            current = sentence
        else:
            current = candidate

    if current:
        chunks.append(current.strip())

    return chunks


# ====================================================
# Speech-to-Text (Saaras)
# ====================================================

def speech_to_text(
    file_path: str,
    language_code: str = "hi-IN",
    mode: str = "translate",
) -> str:
    """
    Transcribes (or translates) an audio file using Saaras v3.

    Args:
        file_path: path to the uploaded audio file (.wav/.mp3, <30s
                    for the REST API — use Batch API for longer clips).
        language_code: BCP-47 source language (e.g. "hi-IN", "en-IN").
        mode: "translate" -> returns English text directly (recommended
              for feeding straight into the existing RAG pipeline).
              "transcribe" -> native-script transcript of the source
              language, if you need the original-language text instead.

    Returns:
        The resulting text (English if mode="translate").
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    with open(file_path, "rb") as f:
        response = client.speech_to_text.transcribe(
            file=f,
            model="saaras:v3",
            mode=mode,
            language_code=language_code,
        )

    return response.transcript


# ====================================================
# Text-to-Speech (Bulbul)
# ====================================================

def text_to_speech(
    text: str,
    output_path: str,
    language_code: str = "hi-IN",
    speaker: str = "shubh",
) -> str:
    """
    Converts text to speech and saves it as an audio file. Chunks
    input over 2400 chars (Bulbul v3's 2500-char limit, with buffer)
    and concatenates the resulting audio into one file.

    Args:
        text: text to speak.
        output_path: where to save the resulting audio (.mp3 recommended).
        language_code: BCP-47 target language (e.g. "hi-IN", "en-IN").
        speaker: Bulbul v3 speaker voice (e.g. "anushka", "shubh", "priya").

    Returns:
        output_path, for convenience chaining.
    """

    chunks = _chunk_text(text, max_chars=2400)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "wb") as f:
        for chunk in chunks:
            for audio_bytes in client.text_to_speech.convert_stream(
                text=chunk,
                target_language_code=language_code,
                speaker=speaker,
                model="bulbul:v3",
                output_audio_codec="mp3",
            ):
                f.write(audio_bytes)

    return output_path


# ====================================================
# Translation (Sarvam-Translate) — for TEXT input flows
# (any Indian language text query -> English, English response -> back)
# ====================================================

def translate_text(
    text: str,
    target_language_code: str,
    source_language_code: str = "auto",
) -> str:
    """
    Translates text between languages using sarvam-translate:v1
    (2000-char limit, 22 languages) instead of the default mayura:v1
    (1000-char limit). Chunks input and stitches translated pieces
    back together.
    """

    chunks = _chunk_text(text, max_chars=1900)

    translated_parts = []

    for chunk in chunks:
        response = client.text.translate(
            input=chunk,
            source_language_code=source_language_code,
            target_language_code=target_language_code,
            model="sarvam-translate:v1",
        )
        translated_parts.append(response.translated_text)

    return " ".join(translated_parts)


# ====================================================
# Language Identification (LID)
# ====================================================

def detect_language(text: str) -> str:
    """
    Detects the BCP-47 language code of a text snippet using
    Sarvam's Language Identification API (max 1000 chars per the
    API — this truncates only for the detection call itself, not
    the actual query that gets processed downstream).

    Returns "en-IN" as a safe fallback if detection is inconclusive.
    """

    sample = text[:1000]

    response = client.text.identify_language(input=sample)

    return response.language_code or "en-IN"