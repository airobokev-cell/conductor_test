-- ParkInBoulder initial schema

-- Spaces (12 fixed parking spaces)
CREATE TABLE spaces (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'occupied'))
);

-- Seed the 12 spaces
INSERT INTO spaces (id, label) VALUES
  (1, 'Space 1'), (2, 'Space 2'), (3, 'Space 3'), (4, 'Space 4'),
  (5, 'Space 5'), (6, 'Space 6'), (7, 'Space 7'), (8, 'Space 8'),
  (9, 'Space 9'), (10, 'Space 10'), (11, 'Space 11'), (12, 'Space 12');

-- Parking sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id INTEGER NOT NULL REFERENCES spaces(id),
  plate TEXT NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  payment_id UUID,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paid', 'violation', 'completed', 'exited')),
  plate_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_plate ON sessions(plate);
CREATE INDEX idx_sessions_space_id ON sessions(space_id);
CREATE INDEX idx_sessions_entered_at ON sessions(entered_at);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  stripe_session_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_session_id ON payments(session_id);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);

-- Add foreign key from sessions to payments (after payments table exists)
ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id);

-- Violations
CREATE TABLE violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  type TEXT NOT NULL CHECK (type IN ('unpaid', 'expired')),
  alerted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_violations_session_id ON violations(session_id);

-- Pricing rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_type TEXT NOT NULL CHECK (day_type IN ('weekday', 'weekend')),
  rate_cents INTEGER NOT NULL,
  enforce_start TIME NOT NULL,
  enforce_end TIME NOT NULL
);

-- Seed pricing rules
INSERT INTO pricing_rules (day_type, rate_cents, enforce_start, enforce_end) VALUES
  ('weekday', 1500, '08:00', '20:00'),
  ('weekend', 2500, '08:00', '22:00');

-- Enable realtime for dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE violations;

-- Row Level Security
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Public read access for spaces (parker needs to see availability)
CREATE POLICY "Anyone can read spaces" ON spaces FOR SELECT USING (true);

-- Public read for pricing rules
CREATE POLICY "Anyone can read pricing" ON pricing_rules FOR SELECT USING (true);

-- Sessions: public can insert (via payment flow) and read their own by plate
CREATE POLICY "Anyone can read sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Service role can manage sessions" ON sessions FOR ALL
  USING (auth.role() = 'service_role');

-- Payments: service role manages, public can read by session
CREATE POLICY "Anyone can read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Service role can manage payments" ON payments FOR ALL
  USING (auth.role() = 'service_role');

-- Violations: service role only
CREATE POLICY "Service role can manage violations" ON violations FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated can read violations" ON violations FOR SELECT
  USING (auth.role() = 'authenticated');
