# Shamsaz API

The same-origin Express API uses PostgreSQL. Initialize migrations before calling `createApp()`. Responses containing personal data use `Cache-Control: no-store`.

## Authentication

- `GET /api/auth/me`: `{user:null}` or `{user:{id,email,displayName,role,organizationId},csrfToken}`.
- `POST /api/auth/register`: full `registrationVersion:2` form accepts patient, doctor or registry clerk requests. Patients receive an active session; staff requests require scoped administrator approval. Legacy `{email,password,displayName,phone?}` creates patient only. See [authentication](authentication.md) for required profile fields, password confirmation and consent.
- `POST /api/auth/login`: `{identifier,password,remember?}` accepts email or Iranian mobile number; legacy `email` is supported. Same response as authenticated `me`.
- `POST /api/auth/logout`: revokes the current server session.

Session cookie is HttpOnly, SameSite=Strict, eight hours or thirty days with `remember`; Secure in production. Server stores SHA-256 of the random session token. Authenticated mutations require `x-csrf-token` from `me` or login; requests with a foreign Origin are rejected. Authentication and AI requests have process-local rate limits; multi-instance deployments need a shared limiter. Roles: `patient`, `doctor`, `registry_clerk`, `clinic_admin`, `national_supervisor`. Public staff registration grants access only after administrative approval. Password recovery/reset and signup request review endpoints are described in [authentication](authentication.md).

## Profile and directory

- `GET /api/profile`: `{profile:{displayName,phone,birthDate?,nationalId?,address?,emergencyContact?,biography?,specialty?,licenseNumber?}}`.
- `PUT` or `PATCH /api/profile`: those editable fields directly or `{profile:…}`. Credential fields specialty/licenseNumber are server-owned, excluded from updates. Dates are Gregorian ISO `YYYY-MM-DD`; national ID must have ten digits. This validates shape, not governmental identity verification.
- `GET /api/doctors`: `{doctors:[{id,displayName,organizationId,specialty,licenseNumber,biography,fee}]}`.
- `GET /api/doctors/:id/slots`: `{slots:[{id,startsAt,endsAt}]}` future available slots.
- `GET /api/patients`: `{patients:[{id,displayName}]}`. Doctor, registry clerk or clinic admin; organization scope only.

## Care operations

- `GET /api/dashboard`: `{user,appointments,screenings,registryCases}`. Patients see their own appointments and screening reports; doctors their appointments; clinic roles organization records. National supervisors receive empty personal arrays plus aggregate `summary` counts.
- `POST /api/appointments`: patient only; `{doctorId,scheduledAt,type:'in_person'|'online'|'telemedicine',reason}`. Must match a future available physician slot. Stored status `pending`; online maps to telemedicine. PostgreSQL exclusion constraint prevents overlapping bookings even under concurrency. This is a request, not a paid or externally confirmed appointment.
- `PATCH /api/appointments/:id`: `{status}`. Patient can cancel their active appointment; doctor or center admin can confirm pending, complete/no-show confirmed or cancel active records. Closed records cannot transition.
- `GET /api/encounters` and `GET /api/prescriptions`: own patient/doctor records only.
- `POST /api/screenings`: patient only; `{symptoms:string[],notes?,consent:true}`. Persists reported symptoms with `triageLevel:'unassessed'`; does not perform clinical diagnosis or triage.
- `POST /api/screenings` version 2: `{screeningVersion:2,answers:ScreeningAnswers,consent:true}`; contract and transparent rules live in `shared/screening.ts`. Captures age (18–110), menopause, cervix, pregnancy, family/genetic/personal history, immune suppression, chest radiotherapy before age 30, symptoms/duration, prior mammography/cervical dates/types/results, HPV vaccination and notes. Explicit no-symptom answers are supported. Date, enum, consent and contradictory symptom validation occurs server-side. Server computes and stores `assessment:{version,evaluatedAt,triageLevel,title,action,reasons,plans}` with care consent and audit atomically; client-provided assessment/triage is ignored. Levels describe care navigation (`routine|urgent|emergency`), never cancer probability or a validated diagnosis. Symptoms and abnormal prior tests override routine screening dates; unknown/high-risk histories require individualized review. Guidelines use final USPSTF breast 2024/cervical 2018 statements (cervical update remains in progress), with NCI ovarian/endometrial guidance. International reference guidance requires local clinician adaptation; no automatic external reminders or physician report sharing is implemented.
- `GET /api/screenings`: authenticated patient only, `{screenings:[SavedScreening]}` containing up to the latest 100 own reports, persisted answer snapshots and the assessment version at creation. Other users cannot read these records. Legacy symptom-only reports remain readable without a computed assessment. Reports are not automatically attached to visit requests.
- `POST /api/registry`: organization-scoped doctor, registry clerk or clinic admin; `{patientId,cancerSite,stage,diagnosisDate,notes?,consent:true,icd10Code?,icdo3Code?,stagingSystem?,stagingVersion?,tnmT?,tnmN?,tnmM?,grade?}`. Patient must belong to the same center.
- `POST /api/encounters`: doctor only, same center or existing doctor-patient appointment; `{patientId,chiefComplaint,subjective,objective,assessment,plan}`. Stores a **draft** SOAP encounter, not a signed clinical record.
- `POST /api/prescriptions`: same doctor scope; `{patientId,items:[{medicationName,dose,route,frequency,durationDays,instructions?}],notes?}`. Transactionally persists a **draft** with medication items. No insurer/e-prescription submission, drug-interaction check or electronic signature.

Appointment items: `{id,patientId,doctorId,scheduledAt,type,status,reason,doctorName,patientName}`. Screening items: `{id,createdAt,symptoms,notes,triageLevel}`.

## Center administration

- `GET /api/organization` and `PUT /api/organization`: clinic admin in own center; `{name,city,address,phone}`. Response `{organization}`.
- `GET /api/organization/slots`: future center slots with physician names.
- `POST /api/organization/slots`: `{doctorId,startsAt,endsAt}`; active physician in own center, future duration 10–120 minutes. Overlapping physician slots rejected by PostgreSQL.
- `GET /api/organization/staff`: own-center staff roster.
- `POST /api/organization/staff`: `{displayName,email,role,password,specialty?,licenseNumber?}`; only doctor or registry_clerk. Doctor specialty and license are required. Provisioning, professional profile, membership and audit commit atomically. Credentials entered by a center administrator are recorded credentials, not external license verification.
- `POST /api/organization/enrollments`: `{email,consent:true}`; enrolls an existing active patient with no conflicting center. Consent is an administrator's attestation; there is no patient-side approval or signed consent document yet. This must be strengthened before using real records.

## Registry details and tumor boards

- `GET /api/registry/:id/details`: `{registryCase,pathologyReports,treatments}`; doctor, registry clerk or clinic admin in the case center.
- `POST /api/registry/:id/pathology`: `{specimenType,reportedAt,collectedAt?,morphologyCode?,grade?,findings}`. Report date cannot be in the future; collection cannot follow report. Findings are stored as `{text}`.
- `POST /api/registry/:id/treatments`: doctor only; `{type,regimen,startsAt,endsAt?,status}`. Types: surgery, chemotherapy, radiotherapy, immunotherapy, hormonal, targeted, supportive, other. Status: planned, active, completed, stopped.
- `GET /api/tumor-boards`: center-scoped `{boards:[{id,title,scheduledAt,status}]}`.
- `POST /api/tumor-boards`: doctor only; `{title,scheduledAt}`, future date within one year; creator becomes participant.
- `GET /api/tumor-boards/:id`: `{board,cases:[{id,registryCaseId,summary,decision,decidedAt,cancerSite,stage}]}`.
- `POST /api/tumor-boards/:id/cases`: doctor only; `{registryCaseId,summary}`; case must belong to the board center.
- `POST /api/tumor-boards/:id/cases/:caseId/decision`: doctor only; `{decision}`. Transactionally records an immutable decision with timestamp and audit event. Repeated writes return 409. This records clinician text; no remote meeting, media, AI recommendation or consensus-signature workflow is implied.

## Assistant

`POST /api/chat`: authenticated; `{messages:[{sender:'user'|'bot',text}],consent:true}`. Consent is required before sending messages to the externally hosted model. Maximum 20 messages, 2000 characters each, 10 requests per minute per account. `GEMINI_API_KEY` and optional `GEMINI_MODEL` remain on server. Without explicit consent/key the response is `{fallback:true,message}`. Provider failures return generic 503 without exposing provider details.

## Errors and limits

Errors: `{error:{code,message}}`; 401 unauthenticated, 403 role/scope/CSRF/origin, 409 conflicts, 422 invalid field, 429 rate limit. JSON body limit 64 KB. Logs omit raw request bodies and provider errors. Audit events are append-only. Business writes and their audit events commit atomically; screening and registry additionally store versioned care-consent rows. Registration does not verify email/phone or enroll a patient in a center; enrollment requires a separately authorized administrative workflow.

## Verification

`npm test` exercises real PostgreSQL authentication, session revocation, CSRF, role escalation rejection, profile persistence, center scope and aggregate supervisor visibility. The runner creates and removes an isolated temporary local database, preventing development-data pollution. Set `TEST_DATABASE_URL` to an explicitly dedicated test database for CI without CREATE DATABASE permission; that database is retained. Direct Node test execution bypasses this isolation.
