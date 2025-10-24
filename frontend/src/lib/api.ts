// Lightweight fake API used while backend is developed.
// Contract: POST /signup, GET /signin.

type SigninResult = { ok: boolean; token?: string; message?: string }

// --- Auth helpers ---
export function authHeaders() {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function authFetch(url: string, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options.headers || {}),
    }
    const response = await fetch(url, { ...options, headers })
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()
    return { ok: response.ok, status: response.status, data }
}

// --- Fake endpoints ---
export async function signup(email: string, password: string): Promise<{ ok: boolean; message?: string }>{
    await new Promise((res) => setTimeout(res, 300))
    if (!email || !password) return { ok: false, message: 'Missing fields' }
    if (password.length < 6) return { ok: false, message: 'Password too short' }
    if (email === 'existing@demo.com') return { ok: false, message: 'Email already exists' }
    return { ok: true }
}

export async function signin(email: string, password: string): Promise<SigninResult> {
    await new Promise((res) => setTimeout(res, 300))
    if (email === 'user@demo.com' && password === 'password') {
        return { ok: true, token: 'demo-token-123' }
    }
    if (email.endsWith('@test.com')) return { ok: true, token: `token-${Math.random().toString(36).slice(2,8)}` }
    return { ok: false, message: 'Invalid credentials' }
}