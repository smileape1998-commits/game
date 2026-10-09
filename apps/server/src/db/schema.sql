-- HAMSTER COUP: GOLDEN ACORNS - DATABASE SCHEMA
-- Compatible with PostgreSQL 14+

-- 1. Users & Guest Profiles
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(32) NOT NULL,
    avatar VARCHAR(64) NOT NULL DEFAULT 'hamster_1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Matches Record
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    room_code VARCHAR(8) NOT NULL,
    preset VARCHAR(32) NOT NULL DEFAULT 'standard',
    reformation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    turn_count INT NOT NULL DEFAULT 1,
    duration_seconds INT NOT NULL DEFAULT 0,
    winner_player_id VARCHAR(64),
    winning_faction VARCHAR(16),
    settings_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_room_code ON matches(room_code);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- 3. Match Participants
CREATE TABLE IF NOT EXISTS match_participants (
    id VARCHAR(64) PRIMARY KEY,
    match_id VARCHAR(64) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    player_name VARCHAR(32) NOT NULL,
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    ai_personality VARCHAR(32),
    ai_difficulty VARCHAR(32),
    faction VARCHAR(16) NOT NULL DEFAULT 'neutral',
    survived BOOLEAN NOT NULL DEFAULT FALSE,
    final_influence_count INT NOT NULL DEFAULT 0,
    final_acorns INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);

-- 4. Match Public History Logs
CREATE TABLE IF NOT EXISTS match_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    match_id VARCHAR(64) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sequence_num INT NOT NULL,
    actor_id VARCHAR(64),
    target_id VARCHAR(64),
    action_type VARCHAR(32) NOT NULL,
    message_th TEXT NOT NULL,
    message_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_history_logs_match_id ON match_history_logs(match_id, sequence_num ASC);

-- 5. Aggregated Player Statistics
CREATE TABLE IF NOT EXISTS player_stats (
    user_id VARCHAR(64) PRIMARY KEY,
    total_matches INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    bluffs_called INT NOT NULL DEFAULT 0,
    bluffs_caught INT NOT NULL DEFAULT 0,
    challenges_won INT NOT NULL DEFAULT 0,
    coups_performed INT NOT NULL DEFAULT 0,
    assassinations_performed INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
