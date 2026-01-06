
/**
 * Factory for creating safe JSON parsers with security limits.
 * Protects against JSON-based DoS attacks (size/depth).
 */

interface ParserOptions<T> {
    defaultValue: T;
    context: string;
    isArray?: boolean;
    maxSize?: number; // bytes, default 100KB
    maxDepth?: number; // nesting levels, default 10
}

/**
 * Checks the depth of a JSON object/array
 */
function checkDepth(obj: unknown, depth: number, maxDepth: number): boolean {
    if (depth > maxDepth) return false;
    if (obj === null || typeof obj !== 'object') return true;

    // Arrays
    if (Array.isArray(obj)) {
        for (const item of obj) {
            if (!checkDepth(item, depth + 1, maxDepth)) return false;
        }
        return true;
    }

    // Objects
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (!checkDepth((obj as Record<string, unknown>)[key], depth + 1, maxDepth)) return false;
        }
    }
    return true;
}

export function createJsonParser<T>({
    defaultValue,
    context,
    isArray = false,
    maxSize = 100 * 1024, // 100KB limit default
    maxDepth = 10 // 10 levels default
}: ParserOptions<T>) {
    return (input: unknown): T => {
        if (input === null || input === undefined) {
            return defaultValue;
        }

        if (typeof input === 'object') {
            // Guard: Expected array but got object, or vice-versa
            if (isArray && !Array.isArray(input)) return defaultValue;
            if (!isArray && Array.isArray(input)) return defaultValue;

            // Enforce depth limit even on pre-parsed objects to prevent bypasses
            if (!checkDepth(input, 0, maxDepth)) {
                console.error(`[${context}] Pre-parsed object too deeply nested (max ${maxDepth})`);
                return defaultValue;
            }

            return input as T;
        }

        if (typeof input === 'string') {
            // 1. Check size limit
            if (input.length > maxSize) {
                console.error(`[${context}] JSON input too large: ${input.length} bytes (max ${maxSize})`);
                return defaultValue;
            }

            try {
                const parsed = JSON.parse(input);

                // 2. Check depth
                if (!checkDepth(parsed, 0, maxDepth)) {
                    console.error(`[${context}] JSON too deeply nested (max ${maxDepth})`);
                    return defaultValue;
                }

                if (isArray && !Array.isArray(parsed)) {
                    return defaultValue;
                }
                return parsed as T;
            } catch (error) {
                console.error(`[${context}] Failed to parse JSON:`, error);
                return defaultValue;
            }
        }

        return defaultValue;
    };
}
