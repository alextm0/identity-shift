
export const AREAS_OF_LIFE = [
    "Health & Energy",
    "Physical Environment",
    "Mental & Emotional",
    "Career & Mission",
    "Wealth & Finance",
    "Relationships",
    "Spirituality",
    "Leisure & Play"
] as const;

export const ONE_CHANGE_OPTIONS = [
    { value: 'CUT_SCOPE', label: 'Cut Scope (Less is More)' },
    { value: 'ADD_RECOVERY', label: 'Add Recovery (Avoiding Burnout)' },
    { value: 'FIX_MORNING', label: 'Fix Morning (Environmental Gap)' },
    { value: 'REMOVE_DISTRACTION', label: 'Remove Distraction (Deep Work)' },
    { value: 'KEEP_SAME', label: 'Maintain Stability (Trust the Process)' }
] as const;
