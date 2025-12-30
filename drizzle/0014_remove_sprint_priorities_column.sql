-- Remove deprecated 'priorities' column from sprint table
-- Priorities are now stored in the normalized sprintPriority table
-- This column was kept for backward compatibility but is no longer needed

ALTER TABLE "sprint" DROP COLUMN IF EXISTS "priorities";

