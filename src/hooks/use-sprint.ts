/**
 * Sprint Mutation Hook
 * 
 * Provides a hook for managing sprint mutations with loading states,
 * error handling, and optimistic updates.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
    startSprintAction, 
    updateSprintAction, 
    deleteSprintAction,
    closeSprintAction 
} from "@/actions/sprints";
import { SprintFormData } from "@/lib/validators";
import { useSprintStore } from "./stores/use-sprint-store";
import { getErrorMessage } from "@/lib/errors";
import { getRedirectPathForClient } from "@/lib/actions/redirect";

export function useSprint() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { setLoading, setError, resetForm, setActiveSprint } = useSprintStore();

    const startSprint = async (formData: SprintFormData) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await startSprintAction(formData);
                if (result?.success) {
                    toast.success(result.message || "Sprint started successfully");
                    resetForm();
                    if (result.redirect) {
                        const redirectPath = getRedirectPathForClient(result.redirect);
                        if (redirectPath) {
                            router.push(redirectPath);
                        } else {
                            router.refresh();
                        }
                    } else {
                        router.refresh();
                    }
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        });
    };

    const updateSprint = async (sprintId: string, formData: Partial<SprintFormData>) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await updateSprintAction(sprintId, formData);
                if (result?.success) {
                    toast.success(result.message || "Sprint updated successfully");
                    resetForm();
                    if (result.redirect) {
                        const redirectPath = getRedirectPathForClient(result.redirect);
                        if (redirectPath) {
                            router.push(redirectPath);
                        } else {
                            router.refresh();
                        }
                    } else {
                        router.refresh();
                    }
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        });
    };

    const deleteSprint = async (sprintId: string) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await deleteSprintAction(sprintId);
                if (result?.success) {
                    toast.success(result.message || "Sprint deleted successfully");
                    setActiveSprint(null);
                    if (result.redirect) {
                        const redirectPath = getRedirectPathForClient(result.redirect);
                        if (redirectPath) {
                            router.push(redirectPath);
                        } else {
                            router.refresh();
                        }
                    } else {
                        router.refresh();
                    }
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        });
    };

    const closeSprint = async (sprintId: string) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await closeSprintAction(sprintId);
                if (result?.success) {
                    toast.success(result.message || "Sprint closed successfully");
                    setActiveSprint(null);
                    if (result.redirect) {
                        const redirectPath = getRedirectPathForClient(result.redirect);
                        if (redirectPath) {
                            router.push(redirectPath);
                        } else {
                            router.refresh();
                        }
                    } else {
                        router.refresh();
                    }
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        });
    };

    return {
        startSprint,
        updateSprint,
        deleteSprint,
        closeSprint,
        isPending,
    };
}

