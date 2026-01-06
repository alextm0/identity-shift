"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSprintAction } from "@/actions/sprints";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteSprintButtonProps {
    sprintId: string;
    sprintName: string;
    variant?: "ghost" | "outline" | "destructive";
    showLabel?: boolean;
}

export function DeleteSprintButton({
    sprintId,
    sprintName,
    variant = "ghost",
    showLabel = false
}: DeleteSprintButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteSprintAction(sprintId);
            toast.success("Sprint deleted permanently");
            router.refresh();
            setShowConfirm(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete sprint");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <Button
                variant={variant}
                size={showLabel ? "default" : "sm"}
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className={variant === "ghost" ? "text-white/20 hover:text-bullshit-crimson hover:bg-bullshit-crimson/10" : ""}
            >
                {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                )}
                {showLabel && (isDeleting ? "Deleting..." : "Delete Sprint")}
            </Button>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Delete Sprint Permanently"
                description={`Are you sure you want to delete "${sprintName}"? This will permanently remove all associated metrics and data. This action cannot be undone.`}
                confirmText="Delete Permanently"
                cancelText="Cancel"
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={isDeleting}
            />
        </>
    );
}
