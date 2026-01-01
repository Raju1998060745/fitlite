"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

// ... existing imports ...

// Reuse types from PlanPage or define shared types
interface Exercise { id: number; name: string; category: string }
interface PlanItem { id: number; exercise: Exercise; target_reps?: number; target_seconds?: number; order_index: number; exercise_id: number; }
interface PlanSession { id: number; items: PlanItem[] }
interface WorkoutItem { id: number; exercise_id: number; performed_sets?: number; performed_reps?: number; performed_seconds?: number; is_completed?: boolean }
interface WorkoutSession { id: number; plan_session?: PlanSession; items: WorkoutItem[] }

function WorkoutSessionLogger() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('id');

    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);

    // Track local state for inputs before logging
    const [logs, setLogs] = useState<Record<number, { reps: string, seconds: string }>>({});

    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [selectedExId, setSelectedExId] = useState<string>("");
    // We need a state for extra items not in plan
    const [extraItems, setExtraItems] = useState<PlanItem[]>([]);

    useEffect(() => {
        if (sessionId) fetchSession(sessionId);
    }, [sessionId]);

    useEffect(() => {
        api.get('/exercises').then(res => setAllExercises(res.data)).catch(console.error);
    }, []);

    const fetchSession = async (id: string) => {
        try {
            const response = await api.get(`/workouts/${id}`);
            setSession(response.data);
        } catch (error) {
            console.error("Failed to fetch session", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLog = async (planItemId: number, exerciseId: number) => {
        if (!session) return;
        const input = logs[planItemId] || {};

        try {
            await api.post(`/workouts/${session.id}/items`, {
                exercise_id: exerciseId,
                performed_reps: input.reps ? parseInt(input.reps) : undefined,
                performed_seconds: input.seconds ? parseInt(input.seconds) : undefined,
                performed_sets: 1 // Assume 1 set per log for now or aggregate
            });
            // Refresh session to show logged status (simple way)
            fetchSession(session.id.toString());
        } catch (error) {
            alert("Failed to log set");
        }
    };

    const handleAddExercise = async () => {
        if (!selectedExId || !session) return;

        const ex = allExercises.find(e => e.id === parseInt(selectedExId));
        if (ex) {
            setExtraItems(prev => [...prev, {
                id: Date.now(), // temp id
                exercise: ex,
                order_index: 999,
                exercise_id: ex.id
            }]);
            setSelectedExId("");
        }
    };

    if (loading) return <div className="p-8">Loading session...</div>;
    if (!session) return <div className="p-8">Session not found</div>;

    const planItems = session.plan_session?.items || [];
    // const combinedItems = [...planItems, ...extraItems];

    const handleFinish = async () => {
        // Check for incomplete items
        const plannedIds = new Set(planItems.map(i => i.exercise_id));
        const loggedIds = new Set(session?.items.map(i => i.exercise_id && i.exercise_id !== -1)); // filter invalid? valid check

        // Actually simplest check:
        // For every planItem, is there a log?
        const incompleteCount = planItems.filter(item =>
            !session?.items.some(log => log.exercise_id === item.exercise_id)
        ).length;

        if (incompleteCount > 0) {
            const confirmed = window.confirm(`You have ${incompleteCount} incomplete exercises. Finishing will close this session PERMANENTLY and you cannot resume it.\n\nClick OK to Finish anyway.\nClick Cancel to keep it open (you can use 'Save & Exit' to resume later).`);
            if (!confirmed) return;
        }

        await api.put(`/workouts/${session!.id}/complete`);
        router.push('/');
    };

    return (
        <div className="min-h-screen p-8 bg-[var(--color-background)]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-[var(--color-primary)]">Active Session</h1>
                    <Button onClick={() => router.push('/')} variant="ghost" className="text-muted-foreground hover:text-foreground">
                        Save & Exit (Resume Later)
                    </Button>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">Planned</h3>
                    {planItems.sort((a, b) => a.order_index - b.order_index).map((item) => {
                        // Calculate progress
                        const associatedLogs = session.items.filter(log => log.exercise_id === item.exercise_id);
                        const totalReps = associatedLogs.reduce((acc, log) => acc + (log.performed_reps || 0), 0);
                        const totalSeconds = associatedLogs.reduce((acc, log) => acc + (log.performed_seconds || 0), 0);

                        const targetReps = item.target_reps || 0;
                        const targetSeconds = item.target_seconds || 0;

                        const remainingReps = Math.max(0, targetReps - totalReps);
                        const remainingSeconds = Math.max(0, targetSeconds - totalSeconds);

                        const isComplete = (targetReps > 0 && remainingReps === 0) || (targetSeconds > 0 && remainingSeconds === 0);

                        return (
                            <Card key={item.id} className={isComplete ? "opacity-50 border-green-200 bg-green-50/50" : ""}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex justify-between items-start">
                                        <div>
                                            {item.exercise.name}
                                            <div className="text-sm font-normal text-[var(--color-secondary)] mt-1">
                                                Goal: {targetReps ? `${targetReps} reps` : `${targetSeconds}s`}
                                            </div>
                                        </div>
                                        {!isComplete && (
                                            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                To Go: {targetReps ? `${remainingReps} reps` : `${remainingSeconds}s`}
                                            </span>
                                        )}
                                        {isComplete && <span className="text-sm font-bold text-green-600">Done!</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 items-end">
                                        <Input
                                            placeholder={targetReps ? "Reps" : "Seconds"}
                                            type="number" className="w-24"
                                            value={logs[item.id]?.reps || ""} // Using 'reps' key for both for simplicity in local state or rename to 'value'
                                            onChange={(e) => setLogs({ ...logs, [item.id]: { ...logs[item.id], reps: e.target.value } })}
                                        />
                                        <Button disabled={isComplete} onClick={() => handleLog(item.id, item.exercise_id)}>
                                            {isComplete ? "Add Bonus Set" : "Log Set"}
                                        </Button>
                                    </div>
                                    {associatedLogs.length > 0 && (
                                        <div className="mt-4 text-xs text-muted-foreground">
                                            History: {associatedLogs.map((l, i) => (
                                                <span key={l.id} className="mr-2">
                                                    Set {i + 1}: {l.performed_reps || l.performed_seconds}{targetReps ? 'r' : 's'}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {extraItems.length > 0 && (
                        <>
                            <h3 className="text-lg font-semibold text-[var(--color-secondary)] mt-8">Extra Exercises</h3>
                            {extraItems.map((item) => {
                                // const alreadyLogged = session.items.some(log => log.exercise_id === item.exercise_id && log.id !== -1);
                                return (
                                    <Card key={item.id}>
                                        <CardHeader className="pb-2"><CardTitle>{item.exercise.name}</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="flex gap-4 items-end">
                                                <Input
                                                    placeholder="Reps" type="number" className="w-24"
                                                    value={logs[item.id]?.reps || ""}
                                                    onChange={(e) => setLogs({ ...logs, [item.id]: { ...logs[item.id], reps: e.target.value } })}
                                                />
                                                <Button onClick={() => handleLog(item.id, item.exercise_id)}>Log Set</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </>
                    )}

                    <Card className="border-dashed border-2">
                        <CardHeader><CardTitle className="text-base">Add Exercise</CardTitle></CardHeader>
                        <CardContent className="flex gap-4">
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedExId}
                                onChange={(e) => setSelectedExId(e.target.value)}
                            >
                                <option value="">Select Exercise...</option>
                                {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                            </select>
                            <Button variant="outline" onClick={handleAddExercise}>Add</Button>
                        </CardContent>
                    </Card>

                    <Button size="lg" className="w-full" variant="primary" onClick={handleFinish}>
                        Finish Workout
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function WorkoutPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <WorkoutSessionLogger />
        </Suspense>
    );
}
