/**
 * Daily Log Mutation Hook
 * 
 * Provides a hook for managing daily log mutations with loading states,
 * error handling, and optimistic updates.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
    saveDailyLogAction, 
    updateDailyLogByIdAction, 
    deleteDailyLogAction 
} from "@/actions/daily-logs";
import { DailyLogFormData } from "@/lib/validators";
import { useDailyStore } from "./stores/use-daily-store";
import { getErrorMessage } from "@/lib/errors";
import { getRedirectPathForClient } from "@/lib/actions/redirect";

export function useDailyLog() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { setLoading, setError, resetForm } = useDailyStore();

    const saveDailyLog = async (formData: DailyLogFormData) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await saveDailyLogAction(formData);
                if (result.success) {
                    toast.success(result.message || "Daily log saved successfully");
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

    const updateDailyLog = async (logId: string, formData: DailyLogFormData) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await updateDailyLogByIdAction(logId, formData);
                if (result.success) {
                    toast.success(result.message || "Daily log updated successfully");
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

    const deleteDailyLog = async (logId: string) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                await deleteDailyLogAction(logId);
                toast.success("Daily log deleted successfully");
                router.refresh();
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
        saveDailyLog,
        updateDailyLog,
        deleteDailyLog,
        isPending,
    };
}

