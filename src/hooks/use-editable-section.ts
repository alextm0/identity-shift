"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionResult } from "@/lib/actions/result";

interface UseEditableSectionProps<T> {
    initialValue: T;
    onSave: (value: T) => Promise<ActionResult<unknown>>;
    successMessage?: string;
    errorMessage?: string;
    onSaveSuccess?: () => void;
}

export function useEditableSection<T>({
    initialValue,
    onSave,
    successMessage = "Saved successfully",
    errorMessage = "Failed to save",
    onSaveSuccess,
}: UseEditableSectionProps<T>) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [value, setValue] = useState<T>(initialValue);

    // Sync with initialValue changes from props
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await onSave(value);
            if (result.success) {
                toast.success(successMessage);
                setIsEditing(false);
                router.refresh();
                onSaveSuccess?.();
            } else {
                toast.error(result.error || errorMessage);
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setValue(initialValue);
        setIsEditing(false);
    };

    return {
        isEditing,
        setIsEditing,
        isSaving,
        value,
        setValue,
        handleSave,
        handleCancel
    };
}
