-- SEED DATA FOR HAMSTER COUP

INSERT INTO users (id, username, avatar) VALUES
('usr_pip_01', 'Pip (พรานโอ๊ก)', 'hamster_1'),
('usr_bobby_02', 'บ๊อบบี้ จอมวางแผน', 'hamster_2'),
('usr_mochi_03', 'โมจิ ขนปุย', 'hamster_3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO matches (
    id, room_code, preset, reformation_enabled, turn_count, duration_seconds,
    winner_player_id, winning_faction, settings_json
) VALUES (
    'match_demo_001', 'GOLD', 'standard', FALSE, 14, 280,
    'usr_pip_01', 'neutral',
    '{"preset":"standard","startingAcorns":2,"mandatoryCoupThreshold":10,"coupCost":7,"assassinCost":3}'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO match_participants (
    id, match_id, user_id, player_name, is_ai, faction, survived, final_influence_count, final_acorns
) VALUES
('part_01', 'match_demo_001', 'usr_pip_01', 'Pip', FALSE, 'neutral', TRUE, 1, 4),
('part_02', 'match_demo_001', 'usr_bobby_02', 'บ๊อบบี้', TRUE, 'neutral', FALSE, 0, 1),
('part_03', 'match_demo_001', 'usr_mochi_03', 'โมจิ', TRUE, 'neutral', FALSE, 0, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO player_stats (
    user_id, total_matches, wins, losses, bluffs_called, bluffs_caught, challenges_won, coups_performed, assassinations_performed
) VALUES
('usr_pip_01', 12, 9, 3, 14, 2, 11, 8, 5)
ON CONFLICT (user_id) DO UPDATE SET
total_matches = EXCLUDED.total_matches,
wins = EXCLUDED.wins;
