-- Run once in pgAdmin Query Tool

CREATE TABLE IF NOT EXISTS pets (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  species       VARCHAR(50),
  emoji         VARCHAR(10)  DEFAULT '🐾',
  description   TEXT,
  goal_amount   NUMERIC(10,2),
  raised_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id            SERIAL PRIMARY KEY,
  pet_id        INTEGER REFERENCES pets(id) ON DELETE SET NULL,
  is_general    BOOLEAN NOT NULL DEFAULT FALSE,
  donor_name    VARCHAR(100) NOT NULL,
  donor_email   VARCHAR(150) NOT NULL,
  donor_phone   VARCHAR(20)  NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  message       TEXT,
  tran_id       VARCHAR(100) UNIQUE,
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed demo pets
INSERT INTO pets (name, species, emoji, description, goal_amount, raised_amount) VALUES
  ('Biscuit', 'Dog',    '🐕', 'Found injured near Dhanmondi. Needs surgery and ongoing care.',        5000, 3200),
  ('Mimi',    'Cat',    '🐱', 'Tiny kitten rescued from Chittagong. Needs vaccinations and food.',    2000, 800),
  ('Rocky',   'Dog',    '🦮', 'Survived a road accident. Needs physical therapy to walk again.',      8000, 5500),
  ('Lily',    'Rabbit', '🐰', 'Abandoned in a box. Needs safe shelter and daily nutrition.',          1500, 600),
  ('Tiger',   'Cat',    '🐈', 'Has a severe skin infection. Needs treatment and ongoing care.',       3000, 1100),
  ('Coco',    'Dog',    '🐩', 'Elderly dog needing special diet and regular vet checkups.',           4000, 3800)
ON CONFLICT DO NOTHING;
