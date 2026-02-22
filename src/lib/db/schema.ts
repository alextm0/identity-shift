import { pgTable, pgSchema, text, integer, bigint, timestamp, boolean, json, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const authSchema = pgSchema('neon_auth');

// AUTH_USER table (managed by Neon Auth)
export const authUser = authSchema.table('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// APP_USERS table (application-level user data)
export const users = pgTable('users', {
    id: text('id').primaryKey().references(() => authUser.id),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// SESSION table (managed by Better Auth)
export const session = authSchema.table('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => authUser.id),
});

// ACCOUNT table (managed by Better Auth)
export const account = authSchema.table('account', {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => authUser.id),
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
export const verification = authSchema.table('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

// INVITATION table (managed by Better Auth/Neon)
export const invitation = authSchema.table('invitation', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

// JWKS table (managed by Better Auth/Neon)
export const jwks = authSchema.table('jwks', {
    id: text('id').primaryKey(),
    publicKey: text('publicKey').notNull(),
    privateKey: text('privateKey').notNull(),
    createdAt: timestamp('createdAt'),
});

// MEMBER table (managed by Better Auth/Neon)
export const member = authSchema.table('member', {
    id: text('id').primaryKey(),
    organizationId: text('organizationId').notNull(),
    userId: text('userId').notNull(),
    role: text('role').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

// ORGANIZATION table (managed by Better Auth/Neon)
export const organization = authSchema.table('organization', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logo: text('logo'),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

// PROJECT_CONFIG table (managed by Better Auth/Neon)
export const projectConfig = authSchema.table('project_config', {
    id: text('id').primaryKey(),
    config: json('config'),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});

// PLANNING
export const planning = pgTable('planning', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => users.id),
    year: integer('year').notNull(), // Planning year (e.g., 2026)

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
    wheelOfLife: json('wheelOfLife'), // JSON: {health, mental_clarity, career, recreation, ...}

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
    userId: text('userId').notNull().references(() => users.id),
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

// SPRINT_GOAL (New)
export const sprintGoal = pgTable('sprintGoal', {
    id: text('id').primaryKey(),
    sprintId: text('sprintId').notNull().references(() => sprint.id, { onDelete: 'cascade' }),
    goalId: text('goalId'),                  // Optional: references annualGoals from planning (legacy/future)
    goalText: text('goalText').notNull(),     // Denormalized for display
    sortOrder: integer('sortOrder').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// PROMISE (New)
export const promise = pgTable('promise', {
    id: text('id').primaryKey(),
    sprintId: text('sprintId').notNull().references(() => sprint.id, { onDelete: 'cascade' }),
    sprintGoalId: text('sprintGoalId').notNull().references(() => sprintGoal.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),             // "Research thesis 30 min"
    type: text('type').notNull(),             // 'daily' | 'weekly'
    scheduleDays: integer('scheduleDays').array(), // For daily: [1,2,3,4,5] = Mon-Fri (0=Sun, 1=Mon, ..., 6=Sat)
    weeklyTarget: integer('weeklyTarget'),           // For weekly: e.g., 3 for "gym 3x/week"
    sortOrder: integer('sortOrder').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// SPRINT_PRIORITY (Deprecated, keep for migration)
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
    userId: text('userId').notNull().references(() => users.id),
    sprintId: text('sprintId').references(() => sprint.id, { onDelete: 'set null' }),
    date: timestamp('date').notNull(), // format: YYYY-MM-DD
    energy: integer('energy').notNull(), // 1-5
    sleepHours: integer('sleepHours'), // optional: hours or null

    // New columns
    mainGoalId: text('mainGoalId'),  // Required: which goal is today's focus
    blockerTag: text('blockerTag'),  // Optional: single-select blocker

    // Deprecated columns (keep for migration)
    mainFocusCompleted: boolean('mainFocusCompleted'), // made optional for now
    morningGapMin: integer('morningGapMin'), // optional
    distractionMin: integer('distractionMin'), // optional
    priorities: json('priorities'), // made optional
    proofOfWork: json('proofOfWork'), // made optional

    win: text('win'), // optional: one-liner win
    drain: text('drain'), // optional: one-liner drain/blocker
    note: text('note'), // optional: general note
    progressRating: integer('progressRating'), // optional: 1-5 self-assessed progress
    exerciseMinutes: integer('exerciseMinutes'), // optional: exercise minutes
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
    uniqueUserDate: uniqueIndex('dailyLog_userId_date_idx').on(table.userId, table.date),
    dailyLogSprintDateIdx: index('dailyLog_sprintId_date_idx').on(table.sprintId, table.date),
}));

// PROMISE_LOG (New)
export const promiseLog = pgTable('promiseLog', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => users.id),
    promiseId: text('promiseId').notNull().references(() => promise.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),             // Primary reference: the date this completion applies to
    dailyLogId: text('dailyLogId').references(() => dailyLog.id, { onDelete: 'set null' }),  // Optional link to full audit
    completed: boolean('completed').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
    promiseLogUnique: uniqueIndex('promiseLog_promiseId_date_unique').on(table.promiseId, table.date), // One log per promise per day
    promiseLogUserDateIdx: index('promiseLog_userId_date_idx').on(table.userId, table.date),
    promiseLogPromiseDateIdx: index('promiseLog_promiseId_date_idx').on(table.promiseId, table.date),
}));

// WEEKLY_REVIEW
export const weeklyReview = pgTable('weeklyReview', {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => users.id),
    sprintId: text('sprintId').references(() => sprint.id, { onDelete: 'set null' }),
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
    userId: text('userId').notNull().references(() => users.id),
    sprintId: text('sprintId').references(() => sprint.id, { onDelete: 'set null' }),
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
    userId: text('userId').notNull().references(() => users.id),
    year: integer('year').notNull(), // 2025, 2026, etc.
    status: text('status').notNull().default('draft'), // 'draft' | 'completed'
    currentStep: integer('currentStep').notNull().default(1), // 1-3 (updated from 1-6)

    // Step 2: Wheel ratings
    wheelRatings: json('wheelRatings'), // {health: 4, mental_clarity: 3, ...}

    // Step 3: What's working (wins per dimension)
    wheelWins: json('wheelWins'), // {health: "text...", mental_clarity: "text...", ...}

    // Step 4: What's missing (gaps per dimension)
    wheelGaps: json('wheelGaps'), // {health: "text...", mental_clarity: "text...", ...}

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
    userId: text('userId').notNull().references(() => users.id),
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

// RATE_LIMIT (Security)
export const rateLimit = pgTable('rateLimit', {
    key: text('key').primaryKey(),
    count: integer('count').notNull().default(0),
    resetAt: bigint('resetAt', { mode: 'number' }).notNull(),
});

// RELATIONS

export const usersRelations = relations(users, ({ one, many }) => ({
    auth: one(authUser, {
        fields: [users.id],
        references: [authUser.id],
    }),
    planning: many(planning),
    sprints: many(sprint),
}));

export const sprintRelations = relations(sprint, ({ one, many }) => ({
    user: one(users, {
        fields: [sprint.userId],
        references: [users.id],
    }),
    priorities: many(sprintPriority),
    goals: many(sprintGoal),
    promises: many(promise),
}));

export const sprintPriorityRelations = relations(sprintPriority, ({ one }) => ({
    sprint: one(sprint, {
        fields: [sprintPriority.sprintId],
        references: [sprint.id],
    }),
}));

export const sprintGoalRelations = relations(sprintGoal, ({ one, many }) => ({
    sprint: one(sprint, {
        fields: [sprintGoal.sprintId],
        references: [sprint.id],
    }),
    promises: many(promise),
}));

export const promiseRelations = relations(promise, ({ one, many }) => ({
    sprint: one(sprint, {
        fields: [promise.sprintId],
        references: [sprint.id],
    }),
    sprintGoal: one(sprintGoal, {
        fields: [promise.sprintGoalId],
        references: [sprintGoal.id],
    }),
    logs: many(promiseLog),
}));

export const promiseLogRelations = relations(promiseLog, ({ one }) => ({
    user: one(users, {
        fields: [promiseLog.userId],
        references: [users.id],
    }),
    promise: one(promise, {
        fields: [promiseLog.promiseId],
        references: [promise.id],
    }),
    dailyLog: one(dailyLog, {
        fields: [promiseLog.dailyLogId],
        references: [dailyLog.id],
    }),
}));

export const dailyLogRelations = relations(dailyLog, ({ one, many }) => ({
    user: one(users, {
        fields: [dailyLog.userId],
        references: [users.id],
    }),
    promiseLogs: many(promiseLog),
}));

export const planningRelations = relations(planning, ({ one }) => ({
    user: one(users, {
        fields: [planning.userId],
        references: [users.id],
    }),
}));
