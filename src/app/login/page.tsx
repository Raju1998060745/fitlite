"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Convert email/password to URLSearchParams for application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        try {
            const response = await api.post('/auth/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            login(response.data.access_token);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login to FitLog Lite</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">Sign In</Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Link href="/register" className="text-[var(--color-accent)] hover:underline">
                            Don't have an account? Register
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
