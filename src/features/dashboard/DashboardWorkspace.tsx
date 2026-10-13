import React, { useEffect, useState } from "react";
import { ProfileForm } from "../profile/ProfileForm";
import { ClinicalForms } from "./ClinicalForms";
import { useRef } from "react";
import { PatientForms } from "./PatientForms";
import { ClinicalHistory } from "./ClinicalHistory";
import { RegistryForm } from "./RegistryForm";
import { OrganizationForms } from "./OrganizationForms";
import { StaffForms } from "./StaffForms";
import { SignupRequests } from "./SignupRequests";
import { VisitRequestHistory } from "./VisitRequestHistory";
import { DoctorVisitRequests } from "./DoctorVisitRequests";
import { RegistryCaseDetails } from "./RegistryCaseDetails";
import { api, roleLabels, SessionUser } from "../../shared/api/client";
import { buttonClass, Feedback } from "../../shared/ui/forms";
interface Appointment {
  id: string;
  patientName?: string;
  scheduledAt?: string;
  starts_at?: string;
  doctorName?: string;
  doctor_name?: string;
  status: string;
  reason?: string;
}
interface Screening {
  id: string;
  createdAt?: string;
  created_at?: string;
  notes?: string;
  status?: string;
  assessment?: { title: string };
}
interface RegistryCase {
  id: string;
  cancerSite?: string;
  cancer_site?: string;
  stage?: string;
  status?: string;
}
interface Dashboard {
  appointments: Appointment[];
  screenings: Screening[];
  registryCases: RegistryCase[];
  summary?: {
    appointments: number;
    screenings: number;
    registry_cases: number;
  };
}
interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
}
interface Patient {
  id: string;
  organizationId?: string | null;
  displayName: string;
  birthDate?: string;
  nationalId?: string;
  phone?: string;
}
interface Doctor {
  id: string;
  displayName?: string;
  name?: string;
  specialty?: string;
}
const date = (value?: string) =>
  value
    ? new Date(value).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
    : "—";
export type DashboardSection =
  | "overview"
  | "appointments"
  | "screenings"
  | "registry"
  | "clinical"
  | "organization"
  | "profile";
export function DashboardWorkspace({
  user,
  onNavigate,
  initialSection = "overview",
}: {
  user: SessionUser;
  initialSection?: DashboardSection;
  onNavigate?: (view: string) => void;
}) {
  const [section, setSection] = useState<DashboardSection>(initialSection);
  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);
  const [data, setData] = useState<Dashboard | null>(null);
  const [clinicalRefreshKey, setClinicalRefreshKey] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const slotRequest = useRef(0);
  const [slotLoading, setSlotLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"appointments" | "screenings" | "registry">(
    "appointments",
  );
  async function load() {
    setError("");
    try {
      const result = await api<Dashboard>("/dashboard");
      setData(result);
      if (user.role === "patient") {
        const result = await api<{ doctors: Doctor[] }>("/doctors");
        setDoctors(result.doctors);
      } else if (
        ["doctor", "registry_clerk", "clinic_admin"].includes(user.role)
      ) {
        const result = await api<{ patients: Patient[] }>("/patients");
        setPatients(result.patients);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت اطلاعات انجام نشد.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, [user.id]);
  async function loadSlots(doctorId: string) {
    const request = ++slotRequest.current;
    setSlots([]);
    setSlotLoading(true);
    setError("");
    try {
      const result = await api<{ slots: Slot[] }>(
        "/doctors/" + doctorId + "/slots",
      );
      if (request === slotRequest.current) setSlots(result.slots);
    } catch (err) {
      if (request === slotRequest.current)
        setError(
          err instanceof Error
            ? err.message
            : "دریافت زمان‌های آزاد انجام نشد.",
        );
    } finally {
      if (request === slotRequest.current) setSlotLoading(false);
    }
  }
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
    endpoint: string,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload: Record<string, unknown> = Object.fromEntries(
      new FormData(form),
    );
    if (endpoint === "/appointments") {
      if (
        !payload.scheduledAt ||
        !Number.isFinite(Date.parse(String(payload.scheduledAt)))
      ) {
        setError("یک زمان آزاد معتبر انتخاب کنید.");
        return;
      }
      payload.scheduledAt = new Date(String(payload.scheduledAt)).toISOString();
    } else {
      payload.consent = true;
      if (endpoint === "/screenings") {
        payload.symptoms = String(payload.symptoms)
          .split(/[,،\n]/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      setSuccess("درخواست در سامانه ثبت شد.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  async function updateAppointment(id: string, status: string) {
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await api(`/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSuccess("وضعیت نوبت به‌روزرسانی شد.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  const sections: { id: DashboardSection; label: string }[] = [
    { id: "overview", label: "نمای کلی" },
    ...(user.role !== "national_supervisor"
      ? [{ id: "appointments" as const, label: "نوبت‌ها" }]
      : []),
    ...(user.role === "patient"
      ? [{ id: "screenings" as const, label: "علائم و غربالگری" }]
      : []),
    ...(["doctor", "registry_clerk", "clinic_admin"].includes(user.role)
      ? [{ id: "registry" as const, label: "رجیستری و پاتولوژی" }]
      : []),
    ...(["doctor", "patient"].includes(user.role)
      ? [{ id: "clinical" as const, label: "پرونده و نسخه‌ها" }]
      : []),
    ...(user.role === "clinic_admin"
      ? [{ id: "organization" as const, label: "مرکز و کارکنان" }]
      : []),
    { id: "profile", label: "اطلاعات حساب" },
  ];
  const activeSection = sections.some((item) => item.id === section)
    ? section
    : "overview";
  const counts = [
    {
      label: "نوبت‌های قابل دسترسی",
      value: data?.summary?.appointments ?? data?.appointments.length,
    },
    {
      label: "گزارش‌های علائم",
      value: data?.summary?.screenings ?? data?.screenings.length,
    },
    {
      label: "پرونده‌های رجیستری",
      value: data?.summary?.registry_cases ?? data?.registryCases.length,
    },
  ];
  return (
    <main dir="rtl" className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-teal-700">
            فضای کار {roleLabels[user.role]}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {user.displayName}، خوش آمدید
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            اطلاعات این بخش از حساب و سطح دسترسی شما دریافت می‌شود.
          </p>
        </div>
        <button
          onClick={() => onNavigate?.("profile")}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
        >
          تکمیل پروفایل
        </button>
      </header>
      <nav
        aria-label="بخش‌های داشبورد"
        className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3"
      >
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              onNavigate?.(item.id);
              if (item.id === "appointments" || item.id === "screenings")
                setTab(item.id);
            }}
            aria-current={activeSection === item.id ? "page" : undefined}
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${activeSection === item.id ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <Feedback error={error} success={success} />
      {!data && (
        <button onClick={() => void load()} className={buttonClass}>
          {error ? "تلاش دوباره" : "در حال دریافت اطلاعات…"}
        </button>
      )}
      {activeSection === "overview" && (
        <section
          aria-label="خلاصه فعالیت"
          className="grid gap-4 sm:grid-cols-3"
        >
          {counts.map((count) => (
            <div
              key={count.label}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <p className="text-sm text-slate-500">{count.label}</p>
              <p className="mt-3 text-3xl font-bold text-teal-800">
                {count.value === undefined
                  ? "—"
                  : count.value.toLocaleString("fa-IR")}
              </p>
            </div>
          ))}
        </section>
      )}
      {user.role === "patient" &&
        ["overview", "appointments"].includes(activeSection) && (
          <VisitRequestHistory />
        )}
      {user.role === "doctor" &&
        ["overview", "appointments"].includes(activeSection) && (
          <DoctorVisitRequests />
        )}
      {["overview", "appointments", "screenings", "registry"].includes(
        activeSection,
      ) && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            {user.role === "patient" &&
            ["appointments", "screenings"].includes(activeSection) ? (
              <PatientForms
                tab={
                  activeSection === "screenings" ? "screenings" : "appointments"
                }
                setTab={(next) => {
                  setTab(next);
                  setSection(next === "registry" ? "registry" : next);
                }}
                pending={pending}
                doctors={doctors}
                slots={slots}
                slotLoading={slotLoading}
                loadSlots={loadSlots}
                submit={submit}
                onNavigate={onNavigate}
              />
            ) : activeSection === "registry" &&
              ["registry_clerk", "doctor", "clinic_admin"].includes(
                user.role,
              ) ? (
              <RegistryForm
                patients={patients.filter(
                  (patient) => patient.organizationId === user.organizationId,
                )}
                pending={pending}
                onSubmit={(event) => void submit(event, "/registry")}
              />
            ) : (
              <>
                <h2 className="text-xl font-bold">پایش عملیات</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  شاخص‌ها و فهرست‌ها از داده‌های ثبت‌شده در محدوده مجاز حساب شما
                  محاسبه می‌شوند. مدیریت هویت و مجوز کارکنان از مسیر کنترل‌شده
                  سرور انجام می‌شود.
                </p>
                <button
                  onClick={() => void load()}
                  className={`${buttonClass} mt-5`}
                >
                  به‌روزرسانی گزارش
                </button>
              </>
            )}
          </section>
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">آخرین فعالیت‌ها</h2>
            <div className="mt-5 space-y-6">
              {["overview", "appointments"].includes(activeSection) && (
                <section>
                  <h3 className="mb-3 font-semibold text-slate-700">نوبت‌ها</h3>
                  {data?.appointments.length ? (
                    <ul className="divide-y divide-slate-100">
                      {data.appointments.slice(0, 10).map((item) => (
                        <li key={item.id} className="py-3 text-sm">
                          <p className="font-semibold">
                            {user.role === "patient"
                              ? item.doctorName || item.doctor_name || "ویزیت"
                              : item.patientName || "بیمار"}
                          </p>
                          {item.reason && (
                            <p className="mt-1 break-words text-slate-600">
                              {item.reason}
                            </p>
                          )}
                          <p className="mt-1 text-slate-500">
                            {date(item.scheduledAt || item.starts_at)}
                          </p>
                          <p className="mt-1 text-teal-700">
                            {(
                              {
                                pending: "در انتظار بررسی",
                                requested: "درخواست‌شده",
                                confirmed: "تأییدشده",
                                cancelled: "لغوشده",
                                completed: "انجام‌شده",
                                no_show: "عدم مراجعه",
                              } as Record<string, string>
                            )[item.status] || item.status}
                          </p>
                          {["pending", "confirmed"].includes(item.status) &&
                            ["patient", "doctor", "clinic_admin"].includes(
                              user.role,
                            ) && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {user.role !== "patient" &&
                                  item.status === "pending" && (
                                    <button
                                      disabled={pending}
                                      onClick={() =>
                                        void updateAppointment(
                                          item.id,
                                          "confirmed",
                                        )
                                      }
                                      className="rounded-lg bg-teal-50 px-3 py-2 text-teal-800"
                                    >
                                      تأیید نوبت
                                    </button>
                                  )}
                                {user.role !== "patient" &&
                                  item.status === "confirmed" && (
                                    <>
                                      <button
                                        disabled={pending}
                                        onClick={() =>
                                          void updateAppointment(
                                            item.id,
                                            "completed",
                                          )
                                        }
                                        className="rounded-lg bg-teal-50 px-3 py-2 text-teal-800"
                                      >
                                        ویزیت انجام شد
                                      </button>
                                      <button
                                        disabled={pending}
                                        onClick={() =>
                                          void updateAppointment(
                                            item.id,
                                            "no_show",
                                          )
                                        }
                                        className="rounded-lg bg-slate-100 px-3 py-2"
                                      >
                                        عدم مراجعه
                                      </button>
                                    </>
                                  )}
                                <button
                                  disabled={pending}
                                  onClick={() =>
                                    void updateAppointment(item.id, "cancelled")
                                  }
                                  className="rounded-lg bg-red-50 px-3 py-2 text-red-800"
                                >
                                  لغو نوبت
                                </button>
                              </div>
                            )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">
                      نوبتی ثبت نشده است.
                    </p>
                  )}
                </section>
              )}
              {["overview", "screenings"].includes(activeSection) && (
                <section>
                  <h3 className="mb-3 font-semibold text-slate-700">
                    گزارش‌های علائم
                  </h3>
                  {data?.screenings.length ? (
                    <ul className="space-y-3">
                      {data.screenings.slice(0, 5).map((item) => (
                        <li
                          key={item.id}
                          className="rounded-xl bg-slate-50 p-3 text-sm"
                        >
                          <p>{date(item.createdAt || item.created_at)}</p>
                          {item.assessment && (
                            <p className="mt-1 font-semibold text-teal-800">
                              {item.assessment.title}
                            </p>
                          )}
                          <p className="mt-1 break-words text-slate-500">
                            {item.notes || "گزارش ثبت شده"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">
                      گزارشی در دسترس نیست.
                    </p>
                  )}
                </section>
              )}
              {user.role !== "patient" &&
                ["overview", "registry"].includes(activeSection) && (
                  <section>
                    <h3 className="mb-3 font-semibold text-slate-700">
                      رجیستری
                    </h3>
                    {data?.registryCases.length ? (
                      <ul className="space-y-3">
                        {data.registryCases.slice(0, 5).map((item) => (
                          <li
                            key={item.id}
                            className="rounded-xl bg-slate-50 p-3 text-sm"
                          >
                            {item.cancerSite || item.cancer_site} ·{" "}
                            {item.stage || "مرحله نامشخص"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">
                        پرونده‌ای در محدوده دسترسی شما نیست.
                      </p>
                    )}
                  </section>
                )}
            </div>
          </section>
        </div>
      )}
      {activeSection === "profile" && <ProfileForm role={user.role} />}
      {activeSection === "organization" && user.role === "clinic_admin" && (
        <>
          <OrganizationForms user={user} />
          <StaffForms />
          <SignupRequests onReviewed={() => void load()} />
        </>
      )}{" "}
      {activeSection === "registry" &&
        data &&
        ["doctor", "registry_clerk", "clinic_admin"].includes(user.role) && (
          <RegistryCaseDetails user={user} cases={data.registryCases} />
        )}
      {activeSection === "clinical" && user.role === "doctor" && (
        <ClinicalForms
          patients={patients}
          onSaved={() => {
            setClinicalRefreshKey((value) => value + 1);
            void load();
          }}
        />
      )}
      {activeSection === "clinical" &&
        ["doctor", "patient"].includes(user.role) && (
          <ClinicalHistory user={user} refreshKey={clinicalRefreshKey} />
        )}
    </main>
  );
}
