import React, { useEffect, useState } from "react";
import { api, SessionUser } from "../../shared/api/client";
import {
  buttonClass,
  Field,
  Feedback,
  inputClass,
} from "../../shared/ui/forms";
interface Organization {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}
interface Doctor {
  id: string;
  displayName: string;
  organizationId: string;
}
interface Slot {
  id: string;
  doctorName: string;
  startsAt: string;
  endsAt: string;
  status: string;
}
export function OrganizationForms({ user }: { user: SessionUser }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  async function refreshSlots() {
    const response = await api<{ slots: Slot[] }>("/organization/slots");
    setSlots(response.slots);
  }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    Promise.all([
      api<{ organization: Organization }>("/organization"),
      api<{ doctors: Doctor[] }>("/doctors"),
    ])
      .then(([org, staff]) => {
        setOrganization(org.organization);
        setDoctors(
          staff.doctors.filter(
            (doctor) => doctor.organizationId === user.organizationId,
          ),
        );
      })
      .catch((err) => setError(err.message));
    void refreshSlots().catch((err) => setError(err.message));
  }, [user.organizationId]);
  async function save(event: React.FormEvent<HTMLFormElement>, slots: boolean) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload: Record<string, unknown> = Object.fromEntries(
      new FormData(form),
    );
    if (slots) {
      payload.startsAt = new Date(String(payload.startsAt)).toISOString();
      payload.endsAt = new Date(String(payload.endsAt)).toISOString();
    }
    setError("");
    setSuccess("");
    setPending(true);
    try {
      await api(slots ? "/organization/slots" : "/organization", {
        method: slots ? "POST" : "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess(slots ? "زمان آزاد پزشک ثبت شد." : "مشخصات مرکز ذخیره شد.");
      if (slots) {
        form.reset();
        await refreshSlots();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="space-y-6">
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">مشخصات مرکز درمانی</h2>
          {organization ? (
            <form onSubmit={(event) => void save(event, false)}>
              <fieldset disabled={pending} className="space-y-4">
                {[
                  { name: "name", label: "نام مرکز" },
                  { name: "city", label: "شهر" },
                  { name: "phone", label: "تلفن" },
                  { name: "address", label: "نشانی" },
                ].map((field) => (
                  <Field key={field.name} label={field.label}>
                    <input
                      name={field.name}
                      defaultValue={
                        organization[field.name as keyof Organization]
                      }
                      required={field.name === "name"}
                      maxLength={500}
                      className={inputClass}
                    />
                  </Field>
                ))}
                <button className={buttonClass}>ذخیره مشخصات</button>
              </fieldset>
            </form>
          ) : (
            <p className="text-slate-500">در حال دریافت مشخصات مرکز…</p>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">افزودن زمان آزاد ویزیت</h2>
          <form onSubmit={(event) => void save(event, true)}>
            <fieldset disabled={pending} className="space-y-4">
              <Field label="پزشک مرکز">
                <select
                  required
                  name="doctorId"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="" disabled>
                    انتخاب پزشک
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.displayName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="شروع (منطقه زمانی دستگاه)"
                hint="نمایش زمان‌های ثبت‌شده به وقت ایران است."
              >
                <input
                  required
                  name="startsAt"
                  type="datetime-local"
                  className={inputClass}
                />
              </Field>
              <Field label="پایان (منطقه زمانی دستگاه)">
                <input
                  required
                  name="endsAt"
                  type="datetime-local"
                  className={inputClass}
                />
              </Field>
              <p className="text-xs leading-6 text-slate-500">
                همپوشانی و محدوده مجاز زمان توسط سرور بررسی می‌شود.
              </p>
              <button className={buttonClass}>ثبت زمان آزاد</button>
            </fieldset>
          </form>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap justify-between gap-3">
          <h2 className="text-xl font-bold">زمان‌های ویزیت مرکز</h2>
          <button
            onClick={() =>
              void refreshSlots().catch((err) => setError(err.message))
            }
            className="text-sm font-bold text-teal-800"
          >
            به‌روزرسانی
          </button>
        </div>
        {slots.length ? (
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <li key={slot.id} className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold">{slot.doctorName}</p>
                <p className="mt-2 text-slate-500">
                  {new Date(slot.startsAt).toLocaleString("fa-IR", {
                    timeZone: "Asia/Tehran",
                  })}
                </p>
                <p className="mt-1 text-teal-700">
                  {slot.status === "available"
                    ? "زمان آزاد"
                    : slot.status === "booked"
                      ? "رزروشده"
                      : slot.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-slate-500">زمانی ثبت نشده است.</p>
        )}
      </section>
    </section>
  );
}
