# Authentication and onboarding

Patient registrations create the user, user profile, structured patient profile, consent and audit record atomically. Complete UI registrations send `registrationVersion: 2`, `firstName`, `lastName`, `email`, `phone`, `nationalId`, ISO Gregorian `birthDate`, `password`, `passwordConfirmation`, and `consent: true`. Address and emergency contact name, relationship and phone are optional. Persian/Arabic digits in phone, national ID and dates normalize to ASCII; Iranian mobile numbers normalize from +98/0098 to 09. National ID validation checks format only; no civil identity verification is claimed.

`POST /api/auth/register` returns `{user,csrfToken}` for patients. Professional applicants send `requestedRole: doctor|registry_clerk`, `organizationId`, `professionalId` and, for doctors, `specialty`. `GET /api/auth/organizations` supplies active clinical centers. Applicants receive `{user:null,application:{id,status:pending},message}` without a session. They cannot access any professional endpoint until a center administrator verifies their credentials and approves. No verification with a professional licensing authority is implemented.

`GET /api/organization/signup-requests` lists applications belonging to the administrator's center. `POST /api/organization/signup-requests/:id/review` accepts `{decision:approve|reject,reason?}`; review is transactional and single-use. Approval activates the account, sets its center, creates membership and verified doctor profile, and writes an audit event. Rejection leaves the account inaccessible.

`POST /api/auth/login` accepts `{identifier,password,rememberMe}`; email and normalized mobile identifiers are supported. Sessions are 8 hours by default, or 30 days with explicit rememberMe. Cookies are HTTP-only, same-site strict, and secure in production. Existing minimal registration clients remain compatible and always register patients regardless of their requested role.

## Password recovery

`POST /api/auth/forgot-password {email}` returns a generic message without revealing whether an active account exists. SMTP delivery requires `SMTP_HOST`, `SMTP_FROM`, optionally `SMTP_PORT` (587 default), `SMTP_SECURE`, `SMTP_USER` and `SMTP_PASSWORD`. Set canonical `APP_ORIGIN` to the trusted website URL. An unconfigured provider returns `RECOVERY_UNAVAILABLE` (503); provider errors return `RECOVERY_DELIVERY_FAILED` (503). No delivery is claimed without attempting the configured provider.

Development inbox requires explicit `ENABLE_DEV_AUTH_INBOX=true`, a non-production environment and a loopback socket. It writes ignored `.local/recovery` files and returns `deliveryMode: development` plus `developmentResetUrl` only for an existing account. This deliberately local development aid must not be enabled on shared environments. It does not send email. SMTP responses never include reset tokens.

Reset links use `/#reset-password?token=...`. `POST /api/auth/reset-password` accepts `{token,password,passwordConfirmation}`. Random 256-bit tokens are stored as SHA-256 hashes, expire after 30 minutes, and are consumed transactionally. Reset revokes all user sessions and outstanding recovery tokens. Recovery requests and reset attempts are rate limited per address. Production delivery remains dependent on operator SMTP setup and verified sending domain.
