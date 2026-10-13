ALTER TABLE users DROP CONSTRAINT users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK(status IN ('active','disabled','pending','rejected'));
CREATE TABLE staff_signup_requests (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 requested_role TEXT NOT NULL CHECK(requested_role IN ('doctor','registry_clerk')),
 professional_id TEXT NOT NULL, specialty TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 reviewed_by TEXT REFERENCES users(id), reviewed_at TIMESTAMPTZ, review_reason TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX staff_signup_center_status ON staff_signup_requests(organization_id,status);
CREATE TABLE password_reset_tokens (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
 used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX password_reset_user_expiry ON password_reset_tokens(user_id,expires_at);
