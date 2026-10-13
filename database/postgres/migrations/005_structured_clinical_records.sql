ALTER TABLE encounters ADD COLUMN subjective TEXT NOT NULL DEFAULT '';
ALTER TABLE encounters ADD COLUMN objective TEXT NOT NULL DEFAULT '';

ALTER TABLE registry_cases ADD COLUMN icd10_code TEXT;
ALTER TABLE registry_cases ADD COLUMN icdo3_code TEXT;
ALTER TABLE registry_cases ADD COLUMN staging_system TEXT;
ALTER TABLE registry_cases ADD COLUMN staging_version TEXT;
ALTER TABLE registry_cases ADD COLUMN tnm_t TEXT;
ALTER TABLE registry_cases ADD COLUMN tnm_n TEXT;
ALTER TABLE registry_cases ADD COLUMN tnm_m TEXT;
ALTER TABLE registry_cases ADD COLUMN grade TEXT;

ALTER TABLE registry_cases ADD CONSTRAINT registry_icd10_format CHECK(icd10_code IS NULL OR icd10_code ~ '^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$');
ALTER TABLE registry_cases ADD CONSTRAINT registry_icdo3_format CHECK(icdo3_code IS NULL OR icdo3_code ~ '^[0-9]{4}/[0-9]$');
ALTER TABLE registry_cases ADD CONSTRAINT registry_staging_system CHECK(staging_system IS NULL OR staging_system IN ('FIGO','AJCC','UICC','other','unknown'));
ALTER TABLE registry_cases ADD CONSTRAINT registry_staging_version CHECK(staging_version IS NULL OR char_length(staging_version) BETWEEN 1 AND 40);
ALTER TABLE registry_cases ADD CONSTRAINT registry_tnm_t CHECK(tnm_t IS NULL OR tnm_t ~ '^(c|p|yc|yp|r|a)?T(X|is|[0-4][a-c]?)$');
ALTER TABLE registry_cases ADD CONSTRAINT registry_tnm_n CHECK(tnm_n IS NULL OR tnm_n ~ '^(c|p|yc|yp|r|a)?N(X|[0-3][a-c]?)$');
ALTER TABLE registry_cases ADD CONSTRAINT registry_tnm_m CHECK(tnm_m IS NULL OR tnm_m ~ '^(c|p|yc|yp|r|a)?M(X|[0-1][a-c]?)$');
ALTER TABLE registry_cases ADD CONSTRAINT registry_grade CHECK(grade IS NULL OR grade IN ('GX','G1','G2','G3','G4','low','high','unknown'));

ALTER TABLE appointment_slots ADD CONSTRAINT slots_doctor_no_overlap
 EXCLUDE USING gist (doctor_id WITH =, tstzrange(starts_at,ends_at,'[)') WITH &&);
CREATE INDEX registry_diagnosis_codes ON registry_cases(icd10_code,icdo3_code);
