import { API_URL } from './config.js'

async function req(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'X-Admin-Key': token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = new Error(`API ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

// Público
export const getInvitation = (token) => req(`/invitations/${token}`)
export const rsvpInvitation = (token, attendees) =>
  req(`/invitations/${token}/rsvp`, { method: 'POST', body: { attendees } })
export const postSong = (body) => req('/songs', { method: 'POST', body })

// Admin (requieren X-Admin-Key)
export const adminLogin = (body) =>
  req('/admin/login', { method: 'POST', body })
export const getResumen = (token) => req('/admin/resumen', { token })
export const listInvitations = (token) => req('/invitations', { token })
export const listSongs = (token) => req('/songs', { token })
export const createInvitation = (token, body) =>
  req('/invitations', { method: 'POST', body, token })
export const updateInvitation = (token, admToken, body) =>
  req(`/invitations/${token}`, { method: 'PUT', body, token: admToken })
export const deleteInvitation = (token, admToken) =>
  req(`/invitations/${token}`, { method: 'DELETE', token: admToken })
