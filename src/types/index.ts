/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'patient'
  | 'doctor'
  | 'registry_clerk'
  | 'clinic_admin'
  | 'national_supervisor';

export type CancerType = 'breast' | 'cervix' | 'ovary' | 'endometrium';

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  specialtyCode: string;
  avatar: string;
  medicalCode: string; // شماره نظام پزشکی
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  hospital: string;
  city: string;
  address: string;
  consultationFee: number; // تومان
  insurances: string[];
  bio: string;
  education: string[];
  services: string[];
  availableSlots: string[];
  onlineAvailable: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientNationalId: string;
  patientPhone: string;
  date: string;
  timeSlot: string;
  type: 'in_person' | 'telemedicine';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  trackingCode: string;
  reason: string;
  attachmentsCount?: number;
}

export interface CancerRegistryRecord {
  id: string; // شناسه رجیستری مانند NCR-1403-8821
  // گام ۱: اطلاعات پایه
  nationalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  birthDate: string;
  age: number;
  maritalStatus: 'single' | 'married' | 'widowed' | 'divorced';
  gravida: number;
  para: number;
  abortus: number;
  province: string;
  city: string;
  address: string;
  phone: string;
  mobile: string;
  insuranceType: string;
  familyHistoryCancer: boolean;
  familyHistoryDetails: string;

  // گام ۲: اطلاعات بالینی و تشخیصی
  cancerType: CancerType;
  cancerTypeNameFa: string;
  onsetDate: string; // تاریخ اولین علامت
  diagnosisDate: string; // تاریخ تشخیص قطعی
  icd10Code: string; // e.g. C50.9
  icdO3Code: string; // e.g. 8500/3
  diagnosisMethod: string; // ماموگرافی، بیوپسی، جراحی...
  ecogPerformance: number; // 0 تا 4
  tnmT: string; // T1, T2, T3, T4
  tnmN: string; // N0, N1, N2, N3
  tnmM: string; // M0, M1
  clinicalStage: string; // Stage I, Stage IIA, Stage IIB, Stage IIIA, Stage IIIB, Stage IIIC, Stage IV

  // گام ۳: پاتولوژی و بیومارکرها و درمان
  histologicType: string; // مثلا Invasive Ductal Carcinoma
  tumorGrade: 'Grade 1' | 'Grade 2' | 'Grade 3' | 'درجه ۱' | 'درجه ۲' | 'درجه ۳';
  erStatus: 'positive' | 'negative' | 'unknown';
  erPercent?: number;
  prStatus: 'positive' | 'negative' | 'unknown';
  prPercent?: number;
  her2Status: '0' | '1+' | '2+' | '3+';
  ki67Percent?: number;
  brca1Mutation: boolean;
  brca2Mutation: boolean;
  surgeryType: string; // Mastectomy, BCS, Hysterectomy, BSO...
  chemotherapyRegimen: string;
  radiotherapyGiven: boolean;
  hormonalTherapy: string;

  // گام ۴: پیگیری و پیامدها
  lastFollowUpDate: string;
  vitalStatus: 'alive_ned' | 'alive_recurrence' | 'alive_metastasis' | 'deceased_disease' | 'deceased_other';
  recurrenceDate?: string;
  metastasisSites?: string[];
  qolScore?: number; // 0-100
  auditorName: string;
  supervisingPhysician: string;
  isVerified: boolean;
  createdAt: string;
}

export interface TumorBoardCase {
  id: string;
  patientCode: string;
  patientName: string;
  age: number;
  cancerType: CancerType;
  stage: string;
  meetingDate: string;
  status: 'scheduled' | 'in_review' | 'consensus_reached';
  imagingPreviewUrl: string;
  summary: string;
  pathologyFindings: string;
  specialtyOpinions: {
    id: string;
    specialty: string;
    doctorName: string;
    avatar?: string;
    recommendation: string;
    approvedAt?: string;
  }[];
  consensusPlan?: string;
  assignedActionDoctor?: string;
}

export interface TelemedicinePrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  patientName: string;
  patientNationalId: string;
  patientAge: number;
  doctorName: string;
  doctorSpecialty: string;
  status: 'waiting' | 'active' | 'ended';
  durationSeconds: number;
  prescriptions: TelemedicinePrescriptionItem[];
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export type NotificationType = 'appointment_reminder' | 'pathology_result' | 'tumor_board' | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'normal';
  actionTarget?: string;
  actionLabel?: string;
  metadata?: {
    patientName?: string;
    doctorName?: string;
    reportCode?: string;
    timeSlot?: string;
  };
}

export interface HealthMetricDataPoint {
  id: string;
  dateFa: string;
  timestamp: number;
  weight?: number; // kg
  bmi?: number;
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  pulse?: number; // bpm
  ca153?: number; // U/mL (breast tumor marker, normal < 30)
  cea?: number; // ng/mL (carcinoembryonic antigen, normal < 3.0)
  ca125?: number; // U/mL (ovarian marker, normal < 35)
  notes?: string;
}

export interface PatientPrescription {
  id: string;
  medicationNameFa: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribingDoctor: string;
  doctorSpecialty: string;
  prescriptionDate: string;
  expirationDate: string;
  totalQuantity: string;
  remainingDays: number;
  refillAllowed: boolean;
  refillCount: number;
  maxRefills: number;
  insuranceTrackingCode: string;
  status: 'active' | 'expiring_soon' | 'completed' | 'refill_requested';
  instructions: string;
  category: 'oncology' | 'supportive' | 'cardio_metabolic' | 'supplements';
}

export interface Hospital {
  id: string;
  name: string;
  nameEn: string;
  type: 'دولتی دانشگاهی' | 'خصوصی' | 'تأمین اجتماعی' | 'نیروهای مسلح' | 'خیریه';
  specialtyType: string; // 'مرکز جامع انکولوژی و جراحی' | 'جنرال و اورژانس' | 'تخصصی زنان و زایمان' | 'فوق تخصصی کودکان' | 'تخصصی قلب'
  district: number; // منطقه ۱ تا ۲۲ تهران
  districtName: string; // مثلا 'منطقه ۶ (مرکز تهران)'
  address: string;
  phone: string;
  emergencyPhone: string;
  bedsCount: number;
  rating: number;
  reviewsCount: number;
  hasEmergency: boolean; // اورژانس شبانه‌روزی
  hasCancerCenter: boolean; // بخش انکولوژی، رادیوتراپی یا شیمی‌درمانی
  hasICU_CCU: boolean;
  insurancesAccepted: string[];
  description: string;
  featuredDepartments: string[];
  headPhysician?: string;
  website?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  type: 'تخصصی تک‌نسخه‌ای و شیمی‌درمانی' | 'شبانه‌روزی ۲۴ ساعته' | 'هلال احمر و مرجع دولتی' | 'داروخانه عمومی' | 'زنجیره‌ای مدرن';
  pharmacistName: string; // نام موسس / مسئول فنی
  medicalCode: string; // شماره نظام پزشکی یا مجوز سازمان غذا و دارو
  is24h: boolean;
  isSpecialtyMeds: boolean; // عرضه داروهای خاص، شیمی‌درمانی، انسولین‌های کمیاب
  district: number; // منطقه ۱ تا ۲۲
  districtName: string; // مثلا 'منطقه ۳ - جردن'
  address: string;
  phone: string;
  deliveryAvailable: boolean; // پیک دارویی
  onlinePrescriptionAccepted: boolean; // پذیرش نسخه الکترونیک تامین اجتماعی و سلامت
  rating: number;
  insurances: string[];
}

export type ScreeningTriageLevel = 'urgent_red' | 'moderate_yellow' | 'routine_green';

export interface ScreeningReport {
  id: string; // شناسه رهگیری مانند SCR-1403-9120
  patientName: string;
  patientNationalId: string;
  patientAge: number;
  patientPhone: string;
  createdAt: string;
  triageLevel: ScreeningTriageLevel;
  riskScore: number; // ۰ تا ۱۰۰
  suspectedOrgan: 'breast' | 'cervix' | 'ovary' | 'endometrium' | 'general_screening';
  suspectedOrganFa: string;
  primarySymptoms: string[];
  findingsSummary: string;
  recommendedDiagnostics: string[];
  physicianActionPlan: string;
  referralUrgency: string;
  recordedInPortal: boolean;
  assignedDoctorName?: string;
  notes?: string;
}

// ==========================================
// MEDICATION TRACKER & DAILY REMINDERS
// ==========================================
export interface DailyMedicationReminder {
  id: string;
  medicationId: string;
  medicationNameFa: string;
  genericName: string;
  dosage: string;
  timeSlot: 'morning' | 'noon' | 'evening' | 'night';
  timeSlotFa: string;
  scheduledTime: string; // e.g. "08:00"
  instructions: string;
  taken: boolean;
  takenAt?: string;
  streakDays: number;
  remainingPills: number;
}

export interface MedicationSideEffectLog {
  id: string;
  medicationName: string;
  sideEffectType: string;
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  severityFa: string;
  dateFa: string;
  time: string;
  notes: string;
  doctorReviewed: boolean;
  doctorReviewNotes?: string;
  alertRequiresAction: boolean;
  recommendedActionFa: string;
}

// ==========================================
// TREATMENT PROGRESS & PERIODIC LAB TRENDS
// ==========================================
export interface TreatmentProgressDataPoint {
  id: string;
  dateFa: string;
  cycleName: string;
  phaseType: 'pre_treatment' | 'neoadjuvant' | 'surgery' | 'adjuvant_chemo' | 'radiotherapy' | 'maintenance';
  phaseTypeFa: string;
  tumorSizeMm?: number; // mm
  tumorReductionPercent?: number; // % reduction from baseline
  recistStatus: 'CR' | 'PR' | 'SD' | 'PD';
  recistStatusFa: string;
  ca153?: number; // Breast marker (normal < 30)
  cea?: number; // General marker (normal < 3.0)
  ca125?: number; // Ovarian/Pelvic marker (normal < 35)
  hemoglobin?: number; // g/dL (normal 12 - 15.5)
  wbc?: number; // x10^3/uL (normal 4.0 - 10.0)
  platelets?: number; // x10^3/uL (normal 150 - 450)
  ast?: number; // IU/L liver (normal < 35)
  alt?: number; // IU/L liver (normal < 35)
  qualityOfLifeScore?: number; // 0-100
  ecogScore?: number; // 0-4
  milestoneEvent?: string;
  clinicalNotes?: string;
}
