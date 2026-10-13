export type UserRole =
  | "patient"
  | "doctor"
  | "registry_clerk"
  | "national_supervisor"
  | "clinic_admin";
export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string | null;
}
export interface AuthResponse {
  user: SessionUser | null;
  csrfToken?: string;
}
export interface UserProfile {
  displayName: string;
  phone: string;
  birthDate?: string;
  nationalId?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalHistory?: string;
  specialty?: string;
  licenseNumber?: string;
  biography?: string;
}
export interface ApiAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  scheduledAt: string;
  type: string;
  status: string;
  reason: string;
}
export interface DashboardResponse {
  user: SessionUser;
  appointments: ApiAppointment[];
  screenings: Array<{
    id: string;
    createdAt: string;
    symptoms: string[];
    notes?: string;
    triageLevel: string;
  }>;
  registryCases: Array<Record<string, unknown>>;
}
