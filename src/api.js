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
export const markOpened = (token) =>
  req(`/invitations/${token}/opened`, { method: 'POST' })
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

// Lista de deseos — público
export const getWishlistSettings = () => req('/wishlist/settings')
export const getWishlist = (token) =>
  req(`/wishlist?token=${encodeURIComponent(token)}`)
export const reserveGift = (id, token) =>
  req(`/wishlist/${id}/reserve`, { method: 'POST', body: { token } })
export const releaseGift = (id, token) =>
  req(`/wishlist/${id}/release`, { method: 'POST', body: { token } })

// Lista de deseos — admin
export const adminWishlist = (t) => req('/wishlist/admin/list', { token: t })
export const adminWishlistSettings = (t) =>
  req('/wishlist/admin/settings', { token: t })
export const adminSetWishlistSettings = (t, body) =>
  req('/wishlist/admin/settings', { method: 'PUT', body, token: t })
export const adminCreateGift = (t, body) =>
  req('/wishlist/admin/items', { method: 'POST', body, token: t })
export const adminUpdateGift = (t, id, body) =>
  req(`/wishlist/admin/items/${id}`, { method: 'PUT', body, token: t })
export const adminReleaseGift = (t, id) =>
  req(`/wishlist/admin/items/${id}/release`, { method: 'POST', token: t })
export const adminDeleteGift = (t, id) =>
  req(`/wishlist/admin/items/${id}`, { method: 'DELETE', token: t })
export const adminPreviewGift = (t, url) =>
  req('/wishlist/admin/preview', { method: 'POST', body: { url }, token: t })
export const adminSearchGifts = (t, q, minPrice, maxPrice) =>
  req(
    `/wishlist/admin/search?q=${encodeURIComponent(q)}&min_price=${minPrice || 0}&max_price=${maxPrice || 0}`,
    { token: t }
  )
