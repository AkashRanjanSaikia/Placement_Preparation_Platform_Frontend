import axios from 'axios'

import { getApiBase } from '../../../config/apiBase.js'

const backendUrl = getApiBase()
const ADMIN_KEY_STORAGE = 'prepify_contest_admin_key'

export function getStoredAdminKey() {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE)
}

export function setStoredAdminKey(key) {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function adminHeaders() {
  const key = getStoredAdminKey()
  return key ? { 'X-Admin-Key': key } : {}
}

export async function listContests({ status, token }) {
  const res = await axios.get(`${backendUrl}/contest`, {
    params: status ? { status } : undefined,
    headers: authHeaders(token),
  })
  return res.data
}

export async function getContest(id, token) {
  const res = await axios.get(`${backendUrl}/contest/${id}`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function registerForContest(id, token, joinCode) {
  const body =
    joinCode != null && String(joinCode).trim()
      ? { joinCode: String(joinCode).trim() }
      : {}
  const res = await axios.post(`${backendUrl}/contest/${id}/register`, body, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function getContestAttempt(id, token) {
  const res = await axios.get(`${backendUrl}/contest/${id}/attempt`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function saveContestAnswer(id, token, body) {
  const res = await axios.put(`${backendUrl}/contest/${id}/answers`, body, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function runContestDsaCode(id, token, body) {
  const res = await axios.post(`${backendUrl}/contest/${id}/run`, body, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function finalizeContestExam(id, token, body) {
  const res = await axios.post(`${backendUrl}/contest/${id}/finalize`, body, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function getMyContestSubmissions(id, token) {
  const res = await axios.get(`${backendUrl}/contest/${id}/my-submissions`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function getContestLeaderboard(id, token) {
  const res = await axios.get(`${backendUrl}/contest/${id}/leaderboard`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function browseContestLibrary({ type, search, page, limit }, mode, token) {
  const isHost = mode === 'host'
  const url = isHost
    ? `${backendUrl}/contest/host/library`
    : `${backendUrl}/admin/contest/library`
  const res = await axios.get(url, {
    params: { type, search, page, limit },
    headers: isHost ? authHeaders(token) : adminHeaders(),
  })
  return res.data
}

export async function createContestDraft(payload, mode, token) {
  const isHost = mode === 'host'
  const url = isHost ? `${backendUrl}/contest/host` : `${backendUrl}/admin/contest`
  const res = await axios.post(url, payload, {
    headers: isHost ? authHeaders(token) : adminHeaders(),
  })
  return res.data
}

export async function updateContestDraft(id, payload, mode, token) {
  const isHost = mode === 'host'
  const url = isHost
    ? `${backendUrl}/contest/host/${id}`
    : `${backendUrl}/admin/contest/${id}`
  const res = await axios.put(url, payload, {
    headers: isHost ? authHeaders(token) : adminHeaders(),
  })
  return res.data
}

export async function publishContest(id, mode, token) {
  const isHost = mode === 'host'
  const url = isHost
    ? `${backendUrl}/contest/host/${id}/publish`
    : `${backendUrl}/admin/contest/${id}/publish`
  const res = await axios.post(url, {}, {
    headers: isHost ? authHeaders(token) : adminHeaders(),
  })
  return res.data
}

export async function listMyHostedContests(token) {
  const res = await axios.get(`${backendUrl}/contest/host/mine`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function getHostContest(id, token) {
  const res = await axios.get(`${backendUrl}/contest/host/${id}`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function deleteHostContestDraft(id, token) {
  const res = await axios.delete(`${backendUrl}/contest/host/${id}`, {
    headers: authHeaders(token),
  })
  return res.data
}

export async function regenerateJoinCode(contestId, token) {
  const res = await axios.post(
    `${backendUrl}/contest/host/${contestId}/regenerate-join-code`,
    {},
    { headers: authHeaders(token) },
  )
  return res.data
}

export async function verifyAdminKey(passcode) {
  const res = await axios.get(`${backendUrl}/admin/contest/library`, {
    params: { type: 'DSA', limit: 1 },
    headers: { 'X-Admin-Key': passcode },
  })
  return res.data
}
