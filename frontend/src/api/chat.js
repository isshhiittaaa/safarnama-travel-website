import client from './client'

export const sendQuery = (query, session_id = null, selected_language = 'hi-IN') =>
  client.post('/chat/query', { query, session_id, selected_language })

export const newChat = () => client.post('/chat/new')

export const listChatHistory = () => client.get('/chat/history')

export const getChatHistoryDetail = (sessionId) =>
  client.get(`/chat/history/${sessionId}`)

export const deleteChatHistory = (sessionId) =>
  client.delete(`/chat/history/${sessionId}`)