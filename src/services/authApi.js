import axios from 'axios'

const backendUrl = import.meta.env.BACKEND_URL

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }
  if (error?.response) {
    return fallback
  }
  return 'Could not reach the server. Check that the backend is running.'
}

export async function registerUser({ name, email, password }) {
  try {
    const res = await axios.post(`${backendUrl}/auth/register`, {
      name,
      email,
      password,
    })
    return res.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'))
  }
}

export async function loginUser({ email, password }) {
  try {
    const res = await axios.post(`${backendUrl}/auth/login`, {
      email,
      password,
    })
    return res.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed. Please try again.'))
  }
}
