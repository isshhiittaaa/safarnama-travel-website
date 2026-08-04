@router.post("/query")
def voice_query(
    audio_file: UploadFile,
    session_id: str | None = None,
    reply_with_audio: bool = False,
    current_user: dict = Depends(get_current_user),   # JWT-protected
):
    text = voice_service.speech_to_text(audio_file)

    # Reuse the EXACT same chat pipeline used by text queries
    result = process_chat_query(text, session_id, current_user["id"])

    audio_response = None
    if reply_with_audio:
        audio_response = voice_service.text_to_speech(result["response"])

    return {
        "transcribed_text": text,
        "response": result["response"],
        "audio_url": audio_response,
    }