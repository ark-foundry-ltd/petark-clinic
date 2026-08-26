// components/clinic/delete-lab-result-btn.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { deleteLabResult } from "@/lib/lab-results";

interface DeleteLabResultBtnProps {
    labResultId: string;
    testName: string;
    onDeleted: () => void;
}

export default function DeleteLabResultBtn({
    labResultId,
    testName,
    onDeleted,
}: Readonly<DeleteLabResultBtnProps>) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleConfirm() {
        setDeleting(true);
        try {
            await deleteLabResult(labResultId);
            toast.success("Lab result deleted");
            onDeleted();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete lab result");
        } finally {
            setDeleting(false);
            setConfirming(false);
        }
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-700 flex-1">Delete &quot;{testName}&quot;?</span>
                <button
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
                >
                    <X size={13} />
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={deleting}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                >
                    {deleting ? <Loader2 size={12} className="animate-spin" /> : "Delete"}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
        >
            <Trash2 size={12} /> Delete
        </button>
    );
}