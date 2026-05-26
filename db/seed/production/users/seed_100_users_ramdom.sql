INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role
)
SELECT
  gen_random_uuid(),
  'user' || gs || '@example.com',
  '$2a$12$NjR/wFp1gZ5z4mwamDsI5eQFggcNsNelNZjRfjiT2aouTQq.RvunO',
  'User ' || gs,
  CASE
    WHEN gs = 1
    THEN 'ADMIN'
    ELSE 'USER'
  END
FROM generate_series(1, 100) gs;
