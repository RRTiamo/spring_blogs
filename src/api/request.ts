import axios from 'axios'

const browserApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api').replace(/\/+$/, '')

function getServerApiBaseURL() {
  return (
    process.env.SERVER_API_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'http://127.0.0.1:8080/api'
      : 'http://localhost:8080/api')
  ).replace(/\/+$/, '')
}

export function getApiBaseURL() {
  if (typeof window !== 'undefined') {
    return browserApiBaseUrl
  }

  return getServerApiBaseURL()
}

export function getServerApiURL(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getServerApiBaseURL()}${normalizedPath}`
}

const request = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 15000,
})

export default request
