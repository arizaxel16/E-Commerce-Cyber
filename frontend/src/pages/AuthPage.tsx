// src/pages/AuthPage.tsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/Auth/AuthContext'
import { signin, signup } from '@/lib/api'
import { toast } from 'sonner'

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const { setToken } = useAuth()
    const navigate = useNavigate()

    function validateEmail(e: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validateEmail(email)) {
            toast.error('Please enter a valid email')
            return
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        if (mode === 'signup' && password !== confirm) {
            toast.error("Passwords don't match")
            return
        }

        setLoading(true)
        try {
            if (mode === 'login') {
                const res = await signin(email, password)
                if (res.ok && res.token) {
                    setToken(res.token)
                    toast.success('Signed in successfully')
                    navigate('/dashboard')
                } else {
                    toast.error(res.message || 'Invalid credentials')
                }
            } else {
                const res = await signup(email, password)
                if (res.ok) {
                    toast.success('Account created. You can sign in now')
                    setMode('login')
                    setPassword('')
                    setConfirm('')
                } else {
                    toast.error(res.message || 'Unable to create account')
                }
            }
        } catch (err) {
            toast.error('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-chart-2 p-6">
            <header className="p-6">
                <div className="max-w-7xl mx-auto flex flex-col items-start">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                        E-Commerce Arepabuelas
                    </h1>
                    <h2 className="text-lg sm:text-xl font-medium text-gray-200 mt-2 font-serif italic">
                        by: COGNITO
                    </h2>
                </div>
            </header>
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <div className="flex gap-2 mb-6 justify-start">
                        <button
                            className={`px-4 py-2 rounded-md font-medium ${mode === 'login' ? 'bg-slate-900 text-white' : 'bg-white border'}`}
                            onClick={() => setMode('login')}
                        >
                        Sign in
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md font-medium ${mode === 'signup' ? 'bg-slate-900 text-white' : 'bg-white border'}`}
                            onClick={() => setMode('signup')}
                        >
                            Sign up
                        </button>
                    </div>
                </CardHeader>
                <CardContent>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                                   placeholder="you@example.com"/>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                                   placeholder="••••••••"/>
                        </div>

                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirm password</label>
                                <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password"
                                       placeholder="Confirm password"/>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <Button type="submit" disabled={loading}>
                                {loading ? (mode === 'login' ? 'Signing in...' : 'Creating...') : (mode === 'login' ? 'Sign in' : 'Create account')}
                            </Button>
                            <div className="text-sm">
                                {mode === 'login' ? (
                                    <button type="button" className="underline" onClick={() => setMode('signup')}>
                                        Need an account?
                                    </button>
                                ) : (
                                    <button type="button" className="underline" onClick={() => setMode('login')}>
                                        Have an account?
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                </CardContent>
            </Card>
        </div>
    )
}
