import React, { useEffect, useState } from "react";
import { api, SessionUser } from "../../shared/api/client";
import { Feedback } from "../../shared/ui/forms";
interface Encounter {
  id: string;
  patientName?: string;
  doctorName?: string;
  occurredAt?: string;
  chiefComplaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  status?: string;
}
interface Prescription {
  id: string;
  patientName?: string;
  doctorName?: string;
  issuedAt?: string;
  status: string;
  items: {
    medicationName: string;
    dose: string;
    frequency: string;
    durationDays: number;
  }[];
}
export function ClinicalHistory({
  user,
  refreshKey = 0,
}: {
  user: SessionUser;
  refreshKey?: number;
}) {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState("");
  async function load() {
    setError("");
    try {
      const [visits, medications] = await Promise.all([
        api<{ encounters: Encounter[] }>("/encounters"),
        api<{ prescriptions: Prescription[] }>("/prescriptions"),
      ]);
      setEncounters(visits.encounters);
      setPrescriptions(medications.prescriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت سوابق انجام نشد.");
    }
  }
  useEffect(() => {
    void load();
  }, [user.id, refreshKey]);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">سوابق و پیش‌نویس‌های بالینی</h2>
        <button
          onClick={() => void load()}
          className="text-sm font-bold text-teal-800"
        >
          به‌روزرسانی
        </button>
      </div>
      <Feedback error={error} />
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-4 font-bold">یادداشت‌های ویزیت</h3>
          {encounters.length ? (
            <ul className="space-y-3">
              {encounters.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl bg-slate-50 p-4 text-sm"
                >
                  <p className="font-bold">
                    {item.chiefComplaint || "یادداشت بالینی"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {user.role === "doctor"
                      ? `بیمار: ${item.patientName || "—"}`
                      : `پزشک: ${item.doctorName || "—"}`}{" "}
                    ·{" "}
                    {item.occurredAt
                      ? new Date(item.occurredAt).toLocaleDateString("fa-IR")
                      : "—"}
                  </p>
                  <dl className="mt-4 space-y-3">
                    {[
                      ["شرح حال و علائم", item.subjective],
                      ["معاینه و یافته‌ها", item.objective],
                      ["ارزیابی پزشک", item.assessment],
                      ["برنامه مراقبت", item.plan],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-semibold text-teal-800">{label}</dt>
                        <dd className="mt-1 whitespace-pre-wrap leading-7 text-slate-600">
                          {value || "ثبت نشده"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-xs text-amber-700">
                    {item.status === "draft"
                      ? "پیش‌نویس · تأیید نهایی نشده"
                      : item.status}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">یادداشتی ثبت نشده است.</p>
          )}
        </section>
        <section>
          <h3 className="mb-4 font-bold">نسخه‌ها</h3>
          {prescriptions.length ? (
            <ul className="space-y-3">
              {prescriptions.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl bg-slate-50 p-4 text-sm"
                >
                  <p className="mb-3 text-xs text-amber-700">
                    {item.status === "draft"
                      ? "پیش‌نویس · قابل استفاده به عنوان نسخه نهایی نیست"
                      : item.status}
                  </p>
                  <p className="mb-3 text-xs text-slate-500">
                    {user.role === "doctor"
                      ? `بیمار: ${item.patientName || "—"}`
                      : `پزشک: ${item.doctorName || "—"}`}{" "}
                    ·{" "}
                    {item.issuedAt
                      ? new Date(item.issuedAt).toLocaleDateString("fa-IR")
                      : "—"}
                  </p>
                  <ul className="space-y-2">
                    {item.items.map((medication, index) => (
                      <li key={index} className="leading-7">
                        <span className="font-bold">
                          {medication.medicationName}
                        </span>{" "}
                        · {medication.dose} · {medication.frequency} ·{" "}
                        {medication.durationDays} روز
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">نسخه‌ای در دسترس نیست.</p>
          )}
        </section>
      </div>
    </section>
  );
}
