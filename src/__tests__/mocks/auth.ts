/**
 * Authentication Mocks
 * 
 * Provides mocked authentication functions for testing
 */

import { vi } from 'vitest';

export const mockSession = {
  id: 'session-1',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  token: 'test-token',
  createdAt: new Date(),
  updatedAt: new Date(),
  ipAddress: null,
  userAgent: null,
  userId: 'user-1',
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
  },
};

export const mockGetSession = vi.fn().mockResolvedValue(mockSession);
export const mockGetRequiredSession = vi.fn().mockResolvedValue(mockSession);
export const mockVerifySession = vi.fn().mockResolvedValue(mockSession);
export const mockGetUserId = vi.fn().mockResolvedValue('user-1');

// Mock the auth module
vi.mock('@/lib/auth/server', () => ({
  getSession: mockGetSession,
  getRequiredSession: mockGetRequiredSession,
  verifySession: mockVerifySession,
  getUserId: mockGetUserId,
}));

