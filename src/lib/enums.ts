/**
 * TypeScript Enums
 * 
 * Provides type-safe enums for status values and options throughout the application.
 * These enums replace magic strings and provide better type safety.
 */

/**
 * One Change Option
 * Represents the single change option selected in weekly reviews
 */
export enum OneChangeOption {
    CUT_SCOPE = 'CUT_SCOPE',
    ADD_RECOVERY = 'ADD_RECOVERY',
    FIX_MORNING = 'FIX_MORNING',
    REMOVE_DISTRACTION = 'REMOVE_DISTRACTION',
    KEEP_SAME = 'KEEP_SAME',
}

/**
 * Sprint Priority Type
 * Represents the type of priority in a sprint
 */
export enum SprintPriorityType {
    HABIT = 'habit',
    WORK = 'work',
}

/**
 * Desired Identity Status
 * Represents the alignment status in monthly reviews
 */
export enum DesiredIdentityStatus {
    YES = 'yes',
    PARTIALLY = 'partially',
    NO = 'no',
}

