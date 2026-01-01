"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CheckinPage() {
    const [weight, setWeight] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/checkins/", { weight_kg: parseFloat(weight) });
            router.push("/");
        } catch (error) {
            console.error("Failed to log check-in", error);
            alert("Failed to log check-in");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Log Body Check-in</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                        />
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" variant="primary" className="w-full">Save</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
