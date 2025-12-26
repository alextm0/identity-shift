/**
 * Audit Logging Utility
 * 
 * Provides utilities for logging all data mutations for audit trails.
 * Tracks CREATE, UPDATE, and DELETE operations on all entities.
 */

import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { randomUUID } from "crypto";

/**
 * Audit action types
 */
export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

/**
 * Entity types that can be audited
 */
export enum AuditEntityType {
    DAILY_LOG = 'dailyLog',
    SPRINT = 'sprint',
    PLANNING = 'planning',
    WEEKLY_REVIEW = 'weeklyReview',
    MONTHLY_REVIEW = 'monthlyReview',
}

/**
 * Changes object for UPDATE actions
 */
export interface AuditChanges {
    [field: string]: {
        old: unknown;
        new: unknown;
    };
}

/**
 * Metadata for audit log entry
 */
export interface AuditMetadata {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
}

/**
 * Options for creating an audit log entry
 */
export interface AuditLogOptions {
    userId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    changes?: AuditChanges;
    metadata?: AuditMetadata;
}

/**
 * Creates an audit log entry
 * 
 * @param options - Audit log options
 * @returns Promise<void>
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
    try {
        await db.insert(auditLog).values({
            id: randomUUID(),
            userId: options.userId,
            action: options.action,
            entityType: options.entityType,
            entityId: options.entityId,
            changes: options.changes || null,
            metadata: options.metadata || null,
            createdAt: new Date(),
        });
    } catch (error) {
        // Don't throw - audit logging should not break the main operation
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Helper to compute changes between old and new objects
 * 
 * @param oldData - Previous state
 * @param newData - New state
 * @returns AuditChanges object
 */
export function computeChanges(oldData: Record<string, unknown>, newData: Record<string, unknown>): AuditChanges {
    const changes: AuditChanges = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    for (const key of allKeys) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        
        // Skip if values are equal (deep comparison would be better, but this is a simple version)
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes[key] = {
                old: oldValue,
                new: newValue,
            };
        }
    }
    
    return changes;
}

/**
 * Creates audit log for CREATE action
 */
export async function auditCreate(
    userId: string,
    entityType: AuditEntityType,
    entityId: string,
    metadata?: AuditMetadata
): Promise<void> {
    return createAuditLog({
        userId,
        action: AuditAction.CREATE,
        entityType,
        entityId,
        metadata,
    });
}

/**
 * Creates audit log for UPDATE action
 */
export async function auditUpdate(
    userId: string,
    entityType: AuditEntityType,
    entityId: string,
    changes: AuditChanges,
    metadata?: AuditMetadata
): Promise<void> {
    return createAuditLog({
        userId,
        action: AuditAction.UPDATE,
        entityType,
        entityId,
        changes,
        metadata,
    });
}

/**
 * Creates audit log for DELETE action
 */
export async function auditDelete(
    userId: string,
    entityType: AuditEntityType,
    entityId: string,
    metadata?: AuditMetadata
): Promise<void> {
    return createAuditLog({
        userId,
        action: AuditAction.DELETE,
        entityType,
        entityId,
        metadata,
    });
}

