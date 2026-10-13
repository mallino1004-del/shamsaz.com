/** Imported public profiles remain informational; linked profiles must belong to an active doctor in an active center. */
export const publishedPractitioner = (alias: string) =>
  `${alias}.status='published' AND (${alias}.account_id IS NULL OR EXISTS(SELECT 1 FROM users practitioner_user JOIN organizations practitioner_center ON practitioner_center.id=practitioner_user.organization_id WHERE practitioner_user.id=${alias}.account_id AND practitioner_user.role='doctor' AND practitioner_user.status='active' AND practitioner_center.status='active'))`;
