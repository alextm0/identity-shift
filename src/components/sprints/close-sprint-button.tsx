"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeSprintAction } from "@/actions/sprints";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CloseSprintButtonProps {
  sprintId: string;
}

export function CloseSprintButton({ sprintId }: CloseSprintButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleClose() {
    setIsPending(true);
    try {
      await closeSprintAction(sprintId);
      toast.success("Sprint closed successfully");
      router.push("/dashboard/sprint");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close sprint");
      setIsPending(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="bg-bullshit-crimson/10 border-bullshit-crimson/20 text-bullshit-crimson hover:bg-bullshit-crimson/20 h-12 px-6 rounded-xl font-mono text-xs uppercase tracking-widest shadow-none"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <X className="h-4 w-4 mr-2" />
            Close Sprint
          </>
        )}
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Close Sprint"
        description="Are you sure you want to close this sprint? You won't be able to log daily progress for it anymore."
        confirmText="Close Sprint"
        cancelText="Cancel"
        onConfirm={handleClose}
        variant="destructive"
      />
    </>
  );
}

