import { useEffect, useRef } from "react";
import { AUTO_SAVE_DEBOUNCE_MS } from "@/lib/constants/review";

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  isDirty: boolean;
  enabled: boolean;
  debounceMs?: number;
  // Optional: dependencies that should trigger auto-save when they change
  dependencies?: unknown[];
}

/**
 * Custom hook for auto-saving with debouncing
 * 
 * Automatically saves data when isDirty becomes true or when dependencies change,
 * with a debounce delay. Useful for form auto-save functionality.
 */
export function useAutoSave({
  onSave,
  isDirty,
  enabled,
  debounceMs = AUTO_SAVE_DEBOUNCE_MS,
  dependencies = [],
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, enabled, debounceMs, onSave, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}

