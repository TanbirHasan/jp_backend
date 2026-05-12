-- Passwords below are bcrypt hashes of "password123"
INSERT INTO users (name, email, password, role)
VALUES
  ('Ada Lovelace',  'ada@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'job_seeker'),
  ('Grace Hopper',  'grace@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer')
ON CONFLICT (email) DO NOTHING;
