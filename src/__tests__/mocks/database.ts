/**
 * Database Module Mock
 * 
 * Mocks the database connection and operations
 */

import { vi } from 'vitest';
import { mockDb } from './db';

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: mockDb,
}));

