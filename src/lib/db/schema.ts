import { pgTable, text, integer, timestamp, boolean, json, uniqueIndex, index } from 'drizzle-orm/pg-core';

// USER table (managed by Better Auth - defined here for foreign keys)
export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// SESSION table (managed by Better Auth)
export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => user.id),
});

// ACCOUNT table (managed by Better Auth)
export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => user.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// VERIFICATION table (managed by Better Auth)
export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

// PLANNING
export const planning = pgTable('planning', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    year: integer('year').notNull().default(new Date().getFullYear()), // Planning year (e.g., 2026)

    // Goal Collections (GPS-structured)
    activeGoals: json('activeGoals'),      // 2-3 PlanningGoal[] with full GPS structure
    backlogGoals: json('backlogGoals'),    // Thick goals not selected as active
    archivedGoals: json('archivedGoals'),  // Thin + Considering goals

    // Progress Tracking (exact step resume)
    currentModule: integer('currentModule').default(1), // 1-3
    currentStep: integer('currentStep').default(1),     // Step within module
    currentGoalIndex: integer('currentGoalIndex').default(0), // Which active goal (0, 1, 2)
    status: text('status').default('draft'), // 'draft' | 'completed'

    // From Review
    previousIdentity: text('previousIdentity'), // Identity from 2025 review
    wheelOfLife: json('wheelOfLife'), // JSON: {healthEnergy, physical, mental, ...}

    // Step 1: Empty Your Head + Future Identity
    brainDump: text('brainDump'), // Free-form notes
    futureIdentity: text('futureIdentity'), // "In Dec 2026, I'm the kind of person who..."

    // Step 2: Wheel of Life Vision
    targetWheelOfLife: json('targetWheelOfLife'), // Target scores for each dimension
    wheelVisionStatements: json('wheelVisionStatements'), // Per-dimension "what would be true"

    // Step 3: Letter from Future You (Optional)
    futureYouLetter: text('futureYouLetter'),

    // Step 4-6: Goals
    goals: json('goals'), // Full goal backlog with categories
    annualGoalIds: json('annualGoalIds'), // Selected annual goal IDs
    annualGoals: json('annualGoals'), // Detailed annual goals with definition of done, etc.

    // Step 7: Anti-Vision + Anti-Goals
    antiVision: text('antiVision'), // Single failure narrative (story)
    antiGoals: json('antiGoals'), // Unlimited list of "I refuse to..." statements

    // Step 8: Commitment
    commitmentStatement: text('commitmentStatement'), // "The kind of year I'm choosing..."
    signatureName: text('signatureName'), // Signature name
    signatureImage: text('signatureImage'), // Base64 signature
    signedAt: timestamp('signedAt'), // When signed

    // Quarterly archive review
    lastArchiveReviewDate: timestamp('lastArchiveReviewDate'),

    completedAt: timestamp('completedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
    // Ensure one plan per user per year
    uniqueUserYear: uniqueIndex('planning_userId_year_idx').on(table.userId, table.year),
}));

// SPRINT
export const sprint = pgTable('sprint', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    name: text('name').notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
    activeSprintIdx: index('sprint_userId_active_idx').on(table.userId, table.active),
    sprintOrderIdx: index('sprint_userId_startDate_idx').on(table.userId, table.startDate),
}));

// SPRINT_PRIORITY
export const sprintPriority = pgTable('sprintPriority', {
    id: text('id').primaryKey(),
    sprintId: text('sprintId').notNull().references(() => sprint.id, { onDelete: 'cascade' }),
    priorityKey: text('priorityKey').notNull(),
    label: text('label').notNull(),
    type: text('type').notNull(), // 'habit' | 'work'
    weeklyTargetUnits: integer('weeklyTargetUnits').notNull().default(0),
    unitDefinition: text('unitDefinition'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// DAILY_LOG
export const dailyLog = pgTable('dailyLog', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    sprintId: text('sprintId').references(() => sprint.id),
    date: timestamp('date').notNull(), // format: YYYY-MM-DD
    energy: integer('energy').notNull(), // 1-5
    sleepHours: integer('sleepHours'), // optional: hours or null
    mainFocusCompleted: boolean('mainFocusCompleted').notNull(),
    morningGapMin: integer('morningGapMin'), // optional
    distractionMin: integer('distractionMin'), // optional
    priorities: json('priorities').notNull(), // JSON: {priorityKey: {done, units, deepWorkMin?, autonomyLevel?}}
    proofOfWork: json('proofOfWork').notNull(), // JSON: [{type, value, url}]
    win: text('win'), // optional: one-liner
    drain: text('drain'), // optional: one-liner
    note: text('note'), // optional: general note
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
    uniqueUserSprintDate: uniqueIndex('dailyLog_userId_sprintId_date_idx').on(table.userId, table.sprintId, table.date),
    dailyLogSprintDateIdx: index('dailyLog_sprintId_date_idx').on(table.sprintId, table.date),
}));

// WEEKLY_REVIEW
export const weeklyReview = pgTable('weeklyReview', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    sprintId: text('sprintId').references(() => sprint.id),
    weekEndDate: timestamp('weekEndDate').notNull(),
    progressRatios: json('progressRatios').notNull(), // JSON: {priorityKey: ratio}
    evidenceRatio: integer('evidenceRatio').notNull(), // 0-100 %
    antiBullshitScore: integer('antiBullshitScore').notNull(), // 0-100
    alerts: json('alerts').notNull(), // JSON: [string alert messages]
    oneChange: text('oneChange').notNull(), // 'CUT_SCOPE'|'ADD_RECOVERY'|'FIX_MORNING'|'REMOVE_DISTRACTION'|'KEEP_SAME'
    changeReason: text('changeReason'), // optional: user's reasoning
    createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
    weeklyReviewOrderIdx: index('weeklyReview_userId_weekEndDate_idx').on(table.userId, table.weekEndDate),
    weeklyReviewSprintIdx: index('weeklyReview_sprintId_idx').on(table.sprintId),
}));

// MONTHLY_REVIEW
export const monthlyReview = pgTable('monthlyReview', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    sprintId: text('sprintId').references(() => sprint.id),
    month: text('month').notNull(), // YYYY-MM
    whoWereYou: text('whoWereYou'), // optional: identity description
    desiredIdentity: text('desiredIdentity'), // 'yes'|'partially'|'no'
    perceivedProgress: json('perceivedProgress').notNull(), // JSON: {priorityKey: 1-10}
    actualProgress: json('actualProgress').notNull(), // JSON: {progressRatio, evidenceRatio}
    oneChange: text('oneChange'), // optional: next sprint change
    createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
    monthlyReviewOrderIdx: index('monthlyReview_userId_createdAt_idx').on(table.userId, table.createdAt),
    monthlyReviewSprintIdx: index('monthlyReview_sprintId_idx').on(table.sprintId),
}));

// YEARLY_REVIEW
export const yearlyReview = pgTable('yearlyReview', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    year: integer('year').notNull(), // 2025, 2026, etc.
    status: text('status').notNull().default('draft'), // 'draft' | 'completed'
    currentStep: integer('currentStep').notNull().default(1), // 1-3 (updated from 1-6)

    // Step 2: Wheel ratings
    wheelRatings: json('wheelRatings'), // {health: 4, training: 3, ...}

    // Step 3: What's working (wins per dimension)
    wheelWins: json('wheelWins'), // {health: "text...", training: "text...", ...}

    // Step 4: What's missing (gaps per dimension)
    wheelGaps: json('wheelGaps'), // {health: "text...", training: "text...", ...}

    // Wins and other details
    wins: json('wins'), // ["win1", "win2", ...] - flexible array
    otherDetails: text('otherDetails'), // Freeform notes

    completedAt: timestamp('completedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
    uniqueUserYear: uniqueIndex('yearlyReview_userId_year_idx').on(table.userId, table.year),
}));

// AUDIT_LOG
export const auditLog = pgTable('auditLog', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    action: text('action').notNull(), // 'CREATE' | 'UPDATE' | 'DELETE'
    entityType: text('entityType').notNull(), // 'dailyLog' | 'sprint' | 'planning' | 'weeklyReview' | 'monthlyReview'
    entityId: text('entityId').notNull(), // ID of the affected entity
    changes: json('changes'), // JSON: {field: {old, new}} - optional, for UPDATE actions
    metadata: json('metadata'), // JSON: additional context (IP, user agent, etc.)
    createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
    // Index for querying user's audit history
    auditLogUserIdx: index('auditLog_userId_createdAt_idx').on(table.userId, table.createdAt),
    // Index for querying entity history
    auditLogEntityIdx: index('auditLog_entityType_entityId_idx').on(table.entityType, table.entityId),
}));

// RELATIONS
import { relations } from 'drizzle-orm';

export const sprintRelations = relations(sprint, ({ many }) => ({
    priorities: many(sprintPriority),
}));

export const sprintPriorityRelations = relations(sprintPriority, ({ one }) => ({
    sprint: one(sprint, {
        fields: [sprintPriority.sprintId],
        references: [sprint.id],
    }),
}));

