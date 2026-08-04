import client from './client'

export const sendVoiceQuery = ({ audioBlob, sessionId = null, languageCode = 'hi-IN' }) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'speech.webm')
  if (sessionId) formData.append('session_id', sessionId)
  formData.append('language_code', languageCode)

  return client.post('/voice/query', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getVoiceAudioUrl = (filename) => `/api/voice/audio/${filename}`