ALTER TABLE screening_reports DROP CONSTRAINT screening_reports_triage_level_check;
ALTER TABLE screening_reports ALTER COLUMN triage_level SET DEFAULT 'unassessed';
ALTER TABLE screening_reports ADD CONSTRAINT screening_reports_triage_level_check CHECK(triage_level IN ('unassessed','routine','urgent','emergency','low','medium','high'));

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT appointments_doctor_no_overlap
 EXCLUDE USING gist (doctor_id WITH =, tstzrange(starts_at,ends_at,'[)') WITH &&)
 WHERE (status IN ('pending','confirmed'));
