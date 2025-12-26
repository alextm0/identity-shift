import { pgTable, text, integer, timestamp, boolean, json, uniqueIndex } from 'drizzle-orm/pg-core';

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
    userId: text('userId').notNull().unique().references(() => user.id),
    currentSelf: text('currentSelf').notNull(),
    desiredSelf: text('desiredSelf').notNull(),
    goals2026: json('goals2026').notNull(), // JSON: [{area, outcome, why, deadline}]
    wheelOfLife: json('wheelOfLife').notNull(), // JSON: {healthEnergy, physical, mental, ...}
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// SPRINT
export const sprint = pgTable('sprint', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    name: text('name').notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    priorities: json('priorities').notNull(), // JSON: [{key, label, type: 'habit'|'work', weeklyTargetUnits, unitDefinition}]
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// DAILY_LOG
export const dailyLog = pgTable('dailyLog', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    sprintId: text('sprintId').notNull().references(() => sprint.id),
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
}));

// WEEKLY_REVIEW
export const weeklyReview = pgTable('weeklyReview', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    sprintId: text('sprintId').notNull().references(() => sprint.id),
    weekEndDate: timestamp('weekEndDate').notNull(),
    progressRatios: json('progressRatios').notNull(), // JSON: {priorityKey: ratio}
    evidenceRatio: integer('evidenceRatio').notNull(), // 0-100 %
    antiBullshitScore: integer('antiBullshitScore').notNull(), // 0-100
    alerts: json('alerts').notNull(), // JSON: [string alert messages]
    oneChange: text('oneChange').notNull(), // 'CUT_SCOPE'|'ADD_RECOVERY'|'FIX_MORNING'|'REMOVE_DISTRACTION'|'KEEP_SAME'
    changeReason: text('changeReason'), // optional: user's reasoning
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// MONTHLY_REVIEW
export const monthlyReview = pgTable('monthlyReview', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id),
    sprintId: text('sprintId').notNull().references(() => sprint.id),
    month: text('month').notNull(), // YYYY-MM
    whoWereYou: text('whoWereYou'), // optional: identity description
    desiredIdentity: text('desiredIdentity'), // 'yes'|'partially'|'no'
    perceivedProgress: json('perceivedProgress').notNull(), // JSON: {priorityKey: 1-10}
    actualProgress: json('actualProgress').notNull(), // JSON: {progressRatio, evidenceRatio}
    oneChange: text('oneChange'), // optional: next sprint change
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

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
});
