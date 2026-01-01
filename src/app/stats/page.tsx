"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface ExerciseStats {
    exercise_name: string;
    total_reps: number;
    total_seconds: number;
    total_sets: number;
}

interface WeeklyStats {
    workouts_completed: number;
    workouts_goal: number;
    exercise_stats: ExerciseStats[];
}

export default function StatisticsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<WeeklyStats | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user) {
            const token = localStorage.getItem('token');
            api.get('/stats/weekly', { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => setStats(res.data))
                .catch(console.error);
        }
    }, [user, isLoading, router]);

    if (!stats) return <div className="p-8">Loading stats...</div>;

    return (
        <div className="min-h-screen p-8 bg-[var(--color-background)]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-[var(--color-primary)]">Statistics</h1>
                    <Button variant="outline" onClick={() => router.push('/')}>Back to Dashboard</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                            {stats.workouts_completed} / {stats.workouts_goal}
                        </div>
                        <p className="text-muted-foreground">Workouts Completed This Week</p>
                    </CardContent>
                </Card>

                <h2 className="text-xl font-semibold text-[var(--color-secondary)]">Exercise Breakdown</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {stats.exercise_stats.length === 0 && <p>No exercises logged this week.</p>}
                    {stats.exercise_stats.map((ex, idx) => (
                        <Card key={idx}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{ex.exercise_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-xl font-bold">{ex.total_sets}</div>
                                        <div className="text-xs text-muted-foreground">Sets</div>
                                    </div>
                                    {ex.total_reps > 0 && (
                                        <div>
                                            <div className="text-xl font-bold">{ex.total_reps}</div>
                                            <div className="text-xs text-muted-foreground">Total Reps</div>
                                        </div>
                                    )}
                                    {ex.total_seconds > 0 && (
                                        <div>
                                            <div className="text-xl font-bold">{Math.round(ex.total_seconds / 60)}m {ex.total_seconds % 60}s</div>
                                            <div className="text-xs text-muted-foreground">Time</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
