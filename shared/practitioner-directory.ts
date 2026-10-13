export interface PublicPractitioner {
  id: string;
  displayName: string;
  specialty: string;
  categoryId: string;
  categoryLabel: string;
  city: string;
  address: string;
  phone: string;
  sourceUrl: string | null;
  profileOrigin: "imported" | "registered";
  photoUrl: string | null;
  accountId: string | null;
  sourceCheckedAt: string;
}
export interface PractitionerDirectory {
  practitioners: PublicPractitioner[];
  categories: Array<{ id: string; label: string; count: number }>;
}
export interface PublicVisitRequest {
  id: string;
  reference: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  practitionerId: string;
  practitionerName: string;
  patientId: string;
  patientName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  visitType: "in_person" | "online";
  reason: string;
  createdAt: string;
  updatedAt: string;
}
