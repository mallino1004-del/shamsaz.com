CREATE TABLE public_visit_requests (
 id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
 practitioner_id TEXT NOT NULL REFERENCES public_practitioners(id), patient_id TEXT NOT NULL REFERENCES users(id),
 patient_name TEXT NOT NULL, phone TEXT NOT NULL, preferred_date DATE NOT NULL, preferred_time TIME NOT NULL,
 preferred_at TIMESTAMPTZ NOT NULL, visit_type TEXT NOT NULL CHECK(visit_type IN ('in_person','online')),
 reason TEXT NOT NULL DEFAULT '' CHECK(char_length(reason)<=1000), consent_version TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected','cancelled')),
 reviewed_by TEXT REFERENCES users(id), reviewed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX public_visit_pending_date ON public_visit_requests(patient_id,practitioner_id,preferred_date) WHERE status='pending';
CREATE INDEX public_visit_patient ON public_visit_requests(patient_id,created_at);
CREATE INDEX public_visit_practitioner ON public_visit_requests(practitioner_id,status);
