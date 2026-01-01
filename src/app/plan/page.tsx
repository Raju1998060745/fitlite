"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface PlanItem {
    id: number;
    exercise: { name: string; category: string };
    target_reps?: number;
    target_seconds?: number;
    target_minutes?: number;
}

interface PlanSession {
    id?: number; // Add ID field
    session_type: string;
    items: PlanItem[];
}

interface PlanDay {
    weekday: number;
    sessions: PlanSession[];
}

interface Plan {
    id: number;
    name: string;
    days: PlanDay[];
}

interface Exercise {
    id: number;
    name: string;
}

export default function PlanPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // For Adding Items
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [addingToSession, setAddingToSession] = useState<number | null>(null); // session ID we are adding to
    const [newExerciseId, setNewExerciseId] = useState("");
    const [newTarget, setNewTarget] = useState("");
    const [targetType, setTargetType] = useState<"reps" | "seconds">("reps");

    useEffect(() => {
        fetchPlan();
        fetchExercises();
    }, []);

    const fetchPlan = async () => {
        try {
            const response = await api.get("/plans/active");
            setPlan(response.data);
        } catch (error) {
            console.log("No active plan found");
        } finally {
            setLoading(false);
        }
    };

    const fetchExercises = async () => {
        try {
            const res = await api.get('/exercises');
            setExercises(res.data);
        } catch (e) {
            console.error("Failed to load exercises");
        }
    };

    const createDefaultPlan = async () => {
        setLoading(true);
        try {
            await api.post("/plans/default");
            fetchPlan();
        } catch (error) {
            console.error("Failed to create plan", error);
            alert("Failed to create default plan.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId: number) => {
        if (!confirm("Remove this exercise?")) return;
        try {
            await api.delete(`/plans/items/${itemId}`);
            fetchPlan(); // Refresh
        } catch (e) {
            alert("Failed to delete item");
        }
    };

    const handleAddItem = async () => {
        if (!addingToSession || !newExerciseId || !newTarget) return;

        try {
            await api.post('/plans/items', {
                plan_session_id: addingToSession,
                exercise_id: parseInt(newExerciseId),
                target_reps: targetType === 'reps' ? parseInt(newTarget) : undefined,
                target_seconds: targetType === 'seconds' ? parseInt(newTarget) : undefined
            });
            setAddingToSession(null);
            setNewExerciseId("");
            setNewTarget("");
            fetchPlan();
        } catch (e) {
            alert("Failed to add item");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen p-8 bg-[var(--color-background)]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-[var(--color-primary)]">Your Plan</h1>
                    <div className="space-x-4">
                        {plan && (
                            <Button variant={editMode ? "secondary" : "outline"} onClick={() => setEditMode(!editMode)}>
                                {editMode ? "Done Editing" : "Edit Plan"}
                            </Button>
                        )}
                        <Button onClick={() => router.back()} variant="outline">Back</Button>
                    </div>
                </div>

                {!plan ? (
                    <Card>
                        <CardContent className="pt-6 text-center space-y-4">
                            <p>You don't have an active workout plan yet.</p>
                            <Button onClick={createDefaultPlan} variant="primary">Create Starter Plan</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">{plan.name}</h2>
                        {plan.days.sort((a, b) => a.weekday - b.weekday).map((day) => (
                            <Card key={day.weekday}>
                                <CardHeader className="pb-2">
                                    <CardTitle>Day {day.weekday + 1}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {day.sessions.map((session, idx) => (
                                            <div key={session.id || idx} className="border p-4 rounded-md relative flex flex-col">
                                                <h4 className="font-semibold capitalize mb-2 text-[var(--color-accent)]">{session.session_type} Session</h4>
                                                <ul className="text-sm space-y-2 flex-grow">
                                                    {session.items.map((item) => (
                                                        <li key={item.id} className="flex justify-between items-center group">
                                                            <span>
                                                                • {item.exercise.name}
                                                                <span className="text-muted-foreground ml-1">
                                                                    {item.target_reps ? `(${item.target_reps} reps)` : `(${item.target_seconds}s)`}
                                                                </span>
                                                            </span>
                                                            {editMode && (
                                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-bold px-2">
                                                                    &times;
                                                                </button>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {editMode && (
                                                    <div className="mt-4 pt-2 border-t">
                                                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setAddingToSession(session.id!)}>
                                                            + Add Exercise
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Item Modal (Simple overlay for MVP) */}
            {addingToSession && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Add Exercise</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Exercise</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={newExerciseId}
                                    onChange={(e) => setNewExerciseId(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Target</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2"
                                        placeholder="Value"
                                        value={newTarget}
                                        onChange={(e) => setNewTarget(e.target.value)}
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select className="w-full border rounded p-2" value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
                                        <option value="reps">Reps</option>
                                        <option value="seconds">Secs</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <Button variant="ghost" onClick={() => setAddingToSession(null)}>Cancel</Button>
                                <Button onClick={handleAddItem}>Add</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
