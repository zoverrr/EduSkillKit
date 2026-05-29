const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '请求失败')
  }
  return res.json()
}

// Skills
export const fetchSkills = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/skills${qs ? '?' + qs : ''}`)
}

export const fetchSkill = (name) => request(`/skills/${name}`)

export const deleteSkill = (name) =>
  request(`/skills/${name}`, { method: 'DELETE' })

export const createSkill = (data) =>
  request('/skills', { method: 'POST', body: JSON.stringify(data) })

// Chat (SSE stream)
export async function* streamChat(skillName, params, message, provider, model) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skill_name: skillName,
      params,
      message,
      provider,
      model,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '请求失败')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.done) return
        if (data.error) throw new Error(data.error)
        if (data.content) yield data.content
      } catch (e) {
        if (e.message && !e.message.includes('JSON')) throw e
      }
    }
  }
}

// Conversations
export const fetchConversations = (limit = 50) =>
  request(`/conversations?limit=${limit}`)

export const fetchConversation = (id) => request(`/conversations/${id}`)

export const saveConversation = (data) =>
  request('/conversations', { method: 'POST', body: JSON.stringify(data) })

export const updateConversation = (id, data) =>
  request(`/conversations/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteConversation = (id) =>
  request(`/conversations/${id}`, { method: 'DELETE' })

// Settings
export const fetchSettings = () => request('/settings')

export const saveSettings = (data) =>
  request('/settings', { method: 'PUT', body: JSON.stringify(data) })

export const saveApiKeys = (data) =>
  request('/settings/api-keys', { method: 'PUT', body: JSON.stringify(data) })

// Upload
export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('文件上传失败')
  return res.json()
}
