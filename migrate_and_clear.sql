-- Add missing columns to candidates table if they don't exist
ALTER TABLE candidates ADD COLUMN user_id VARCHAR;
ALTER TABLE candidates ADD COLUMN first_name VARCHAR;
ALTER TABLE candidates ADD COLUMN middle_name VARCHAR;
ALTER TABLE candidates ADD COLUMN last_name VARCHAR;
ALTER TABLE candidates ADD COLUMN challenges_attempted INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN average_score FLOAT DEFAULT 0;
ALTER TABLE candidates ADD COLUMN highest_score FLOAT DEFAULT 0;
ALTER TABLE candidates ADD COLUMN total_bugs_missed INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN average_time_seconds FLOAT DEFAULT 0;

-- Update JPS user if exists
UPDATE candidates 
SET user_id = 'JPS-QN2NWT',
    first_name = 'John',
    middle_name = 'Paul',
    last_name = 'Smith',
    display_name = 'John Paul Smith'
WHERE anonymous_id LIKE '%' OR id IN (SELECT id FROM candidates LIMIT 1);

-- Clear all submissions and challenges
DELETE FROM submissions;
DELETE FROM user_challenges;

-- Reset all candidate statistics
UPDATE candidates 
SET total_score = 0,
    challenges_completed = 0,
    challenges_attempted = 0,
    average_score = 0,
    highest_score = 0,
    total_bugs_found = 0,
    total_bugs_missed = 0,
    average_accuracy = 0,
    average_time_seconds = 0;

-- Show the cleaned state
SELECT anonymous_id, user_id, display_name, challenges_attempted, challenges_completed, total_score 
FROM candidates;