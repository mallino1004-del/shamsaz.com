CREATE TABLE organizations (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('hospital','clinic','pharmacy','laboratory','research','regulator')),
 city TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', phone TEXT, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
 id TEXT PRIMARY KEY, email TEXT UNIQUE, phone TEXT UNIQUE, password_hash TEXT NOT NULL, display_name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('patient','doctor','registry','admin','supervisor')), organization_id TEXT REFERENCES organizations(id),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, CHECK(email IS NOT NULL OR phone IS NOT NULL)
);
CREATE TABLE organization_memberships (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), organization_id TEXT NOT NULL REFERENCES organizations(id), role TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,organization_id)
);
CREATE TABLE sessions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, csrf_token TEXT NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE user_profiles (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data_json JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE patient_profiles (
 user_id TEXT PRIMARY KEY REFERENCES users(id), national_id TEXT UNIQUE, birth_date DATE, sex TEXT CHECK(sex IN ('female','male','other','unknown')),
 blood_type TEXT, allergies_json JSONB NOT NULL DEFAULT '[]', medical_history_json JSONB NOT NULL DEFAULT '[]',
 emergency_contact_json JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE doctor_profiles (user_id TEXT PRIMARY KEY REFERENCES users(id), license_number TEXT UNIQUE, specialty TEXT NOT NULL, biography TEXT NOT NULL DEFAULT '', fee INTEGER NOT NULL DEFAULT 0 CHECK(fee>=0));
CREATE TABLE appointment_slots (
 id TEXT PRIMARY KEY, doctor_id TEXT NOT NULL REFERENCES users(id), organization_id TEXT NOT NULL REFERENCES organizations(id), starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
 status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','blocked')), CHECK(ends_at>starts_at), UNIQUE(doctor_id,starts_at)
);
CREATE TABLE appointments (
 id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), doctor_id TEXT NOT NULL REFERENCES users(id), organization_id TEXT REFERENCES organizations(id), slot_id TEXT REFERENCES appointment_slots(id),
 starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ, type TEXT NOT NULL DEFAULT 'in_person' CHECK(type IN ('in_person','telemedicine')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled','no_show')), reason TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, CHECK(ends_at IS NULL OR ends_at>starts_at)
);
CREATE UNIQUE INDEX appointments_active_slot ON appointments(slot_id) WHERE slot_id IS NOT NULL AND status IN ('pending','confirmed');
CREATE UNIQUE INDEX appointments_doctor_time ON appointments(doctor_id,starts_at) WHERE status IN ('pending','confirmed');
CREATE INDEX appointments_patient ON appointments(patient_id,starts_at);
CREATE TABLE screening_reports (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), payload_json JSONB NOT NULL, triage_level TEXT NOT NULL DEFAULT 'routine' CHECK(triage_level IN ('routine','urgent','emergency','low','medium','high')), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE registry_cases (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), patient_id TEXT REFERENCES users(id), payload_json JSONB NOT NULL DEFAULT '{}',
 created_by TEXT NOT NULL REFERENCES users(id), diagnosis_code TEXT, cancer_site TEXT, stage TEXT, diagnosed_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','follow_up','closed','deceased')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX registry_organization ON registry_cases(organization_id,created_at);
CREATE TABLE encounters (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), doctor_id TEXT NOT NULL REFERENCES users(id), appointment_id TEXT REFERENCES appointments(id), organization_id TEXT REFERENCES organizations(id), status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','signed','amended')), chief_complaint TEXT NOT NULL DEFAULT '', assessment TEXT NOT NULL DEFAULT '', plan TEXT NOT NULL DEFAULT '', occurred_at TIMESTAMPTZ NOT NULL, signed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE observations (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), encounter_id TEXT REFERENCES encounters(id), code TEXT NOT NULL, code_system TEXT NOT NULL DEFAULT 'local', value_text TEXT, value_numeric DOUBLE PRECISION, unit TEXT, observed_at TIMESTAMPTZ NOT NULL, recorded_by TEXT NOT NULL REFERENCES users(id), CHECK(value_text IS NOT NULL OR value_numeric IS NOT NULL));
CREATE TABLE pathology_reports (id TEXT PRIMARY KEY, registry_case_id TEXT NOT NULL REFERENCES registry_cases(id), encounter_id TEXT REFERENCES encounters(id), specimen_type TEXT NOT NULL, collected_at TIMESTAMPTZ, reported_at TIMESTAMPTZ NOT NULL, morphology_code TEXT, grade TEXT, findings_json JSONB NOT NULL DEFAULT '{}', recorded_by TEXT NOT NULL REFERENCES users(id));
CREATE TABLE treatments (id TEXT PRIMARY KEY, registry_case_id TEXT NOT NULL REFERENCES registry_cases(id), type TEXT NOT NULL CHECK(type IN ('surgery','chemotherapy','radiotherapy','immunotherapy','hormonal','targeted','supportive','other')), regimen TEXT NOT NULL, starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','completed','stopped')), recorded_by TEXT NOT NULL REFERENCES users(id), CHECK(ends_at IS NULL OR ends_at>=starts_at));
CREATE TABLE prescriptions (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), doctor_id TEXT NOT NULL REFERENCES users(id), encounter_id TEXT REFERENCES encounters(id), status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','signed','cancelled')), issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, notes TEXT NOT NULL DEFAULT '');
CREATE TABLE prescription_items (id TEXT PRIMARY KEY, prescription_id TEXT NOT NULL REFERENCES prescriptions(id), medication_code TEXT, medication_name TEXT NOT NULL, dose TEXT NOT NULL, route TEXT NOT NULL, frequency TEXT NOT NULL, duration_days INTEGER CHECK(duration_days>0), quantity INTEGER CHECK(quantity>0), instructions TEXT NOT NULL DEFAULT '');
CREATE TABLE tumor_boards (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), title TEXT NOT NULL, scheduled_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')), created_by TEXT NOT NULL REFERENCES users(id));
CREATE TABLE tumor_board_cases (id TEXT PRIMARY KEY, board_id TEXT NOT NULL REFERENCES tumor_boards(id), registry_case_id TEXT NOT NULL REFERENCES registry_cases(id), summary TEXT NOT NULL DEFAULT '', decision TEXT, decided_at TIMESTAMPTZ, UNIQUE(board_id,registry_case_id));
CREATE TABLE tumor_board_participants (board_id TEXT NOT NULL REFERENCES tumor_boards(id), user_id TEXT NOT NULL REFERENCES users(id), specialty TEXT, PRIMARY KEY(board_id,user_id));
CREATE TABLE notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE consents (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), purpose TEXT NOT NULL CHECK(purpose IN ('care','research','ai_processing','telemedicine','data_sharing')), policy_version TEXT NOT NULL, granted_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, captured_by TEXT NOT NULL REFERENCES users(id));
CREATE TABLE documents (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES users(id), encounter_id TEXT REFERENCES encounters(id), registry_case_id TEXT REFERENCES registry_cases(id), type TEXT NOT NULL, storage_key TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL CHECK(size_bytes>=0), sha256 TEXT NOT NULL, uploaded_by TEXT NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE audit_events (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, metadata_json JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX audit_entity ON audit_events(entity_type,entity_id,created_at);
CREATE INDEX audit_actor ON audit_events(user_id,created_at);
CREATE INDEX observations_patient ON observations(patient_id,observed_at);
CREATE INDEX screening_patient ON screening_reports(patient_id,created_at);
CREATE INDEX notifications_user ON notifications(user_id,read_at,created_at);
CREATE INDEX encounters_patient ON encounters(patient_id,occurred_at);

CREATE UNIQUE INDEX users_email_casefold ON users(lower(email)) WHERE email IS NOT NULL;
CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS '
BEGIN
 RAISE EXCEPTION ''Audit records are immutable'';
END;';
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();

