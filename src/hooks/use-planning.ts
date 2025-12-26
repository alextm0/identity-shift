/**
 * Planning Mutation Hook
 * 
 * Provides a hook for managing planning mutations with loading states,
 * error handling, and optimistic updates.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePlanningAction, solidifyPlanAction } from "@/actions/planning";
import { PlanningFormData } from "@/lib/validators";
import { usePlanningStore } from "./stores/use-planning-store";
import { getErrorMessage } from "@/lib/errors";
import { getRedirectPathForClient } from "@/lib/actions/redirect";

export function usePlanning() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { setLoading, setError, resetForm } = usePlanningStore();

    const savePlanning = async (formData: PlanningFormData) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await savePlanningAction(formData);
                if (result.success) {
                    toast.success(result.message || "Planning data saved successfully");
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

    const solidifyPlan = async (formData: PlanningFormData) => {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            try {
                const result = await solidifyPlanAction(formData);
                if (result.success) {
                    toast.success(result.message || "Plan solidified successfully");
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

    return {
        savePlanning,
        solidifyPlan,
        isPending,
    };
}

