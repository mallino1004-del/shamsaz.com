import React, { useEffect, useState } from "react";
import { api, roleLabels } from "../../shared/api/client";
import {
  Field,
  Feedback,
  inputClass,
  buttonClass,
} from "../../shared/ui/forms";
interface Request {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  requestedRole: "doctor" | "registry_clerk";
  professionalId: string;
  specialty: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
export function SignupRequests({ onReviewed }: { onReviewed?: () => void }) {
  const [requests, setRequests] = useState<Request[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [selected, setSelected] = useState<Request | null>(null),
    [decision, setDecision] = useState<"approve" | "reject">("approve"),
    [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false);
  async function refresh() {
    setLoading(true);
    try {
      const result = await api<{ requests: Request[] }>(
        "/organization/signup-requests",
      );
      setRequests(result.requests);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در دریافت درخواست‌ها");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function review(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !confirmed) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/organization/signup-requests/${selected.id}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, reason }),
      });
      setSuccess(
        decision === "approve"
          ? "عضویت تأیید و دسترسی مرکز فعال شد."
          : "درخواست رد شد؛ دسترسی حساب فعال نمی‌شود.",
      );
      setSelected(null);
      await refresh();
      onReviewed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "بررسی درخواست انجام نشد");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            درخواست‌های عضویت حرفه‌ای
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            اطلاعات زیر توسط متقاضی ثبت شده است. اصالت مدارک و وابستگی به مرکز
            را پیش از تأیید بررسی کنید.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          onClick={() => void refresh()}
          disabled={loading || busy}
        >
          تازه‌سازی
        </button>
      </div>
      <Feedback error={error} success={success} />
      {loading ? (
        <p role="status">در حال دریافت درخواست‌ها…</p>
      ) : requests.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
          درخواستی برای این مرکز ثبت نشده است.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <article
              key={r.id}
              className="min-w-0 rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold">{r.displayName}</h4>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${r.status === "pending" ? "bg-amber-50 text-amber-800" : r.status === "approved" ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-800"}`}
                >
                  {r.status === "pending"
                    ? "در انتظار بررسی"
                    : r.status === "approved"
                      ? "تأیید شده"
                      : "رد شده"}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div>نقش: {roleLabels[r.requestedRole]}</div>
                <div>
                  شناسه حرفه‌ای: <span dir="ltr">{r.professionalId}</span>
                </div>
                {r.specialty && <div>تخصص: {r.specialty}</div>}
                <div className="break-all">
                  ایمیل: <span dir="ltr">{r.email}</span>
                </div>
                <div>
                  همراه: <span dir="ltr">{r.phone}</span>
                </div>
                <div>
                  تاریخ درخواست:{" "}
                  {new Date(r.createdAt).toLocaleDateString("fa-IR")}
                </div>
              </dl>
              {r.status === "pending" && (
                <button
                  type="button"
                  className={`${buttonClass} mt-4 w-full`}
                  onClick={() => {
                    setSelected(r);
                    setReason("");
                    setConfirmed(false);
                    setDecision("approve");
                    setError("");
                  }}
                >
                  بررسی درخواست
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {selected && (
        <form
          onSubmit={review}
          className="space-y-4 rounded-xl border border-teal-200 bg-teal-50/30 p-5"
        >
          <h4 className="font-bold">بررسی درخواست {selected.displayName}</h4>
          <Field label="نتیجه بررسی">
            <select
              className={inputClass}
              value={decision}
              onChange={(e) => {
                setDecision(e.target.value as "approve" | "reject");
                setConfirmed(false);
              }}
              disabled={busy}
            >
              <option value="approve">تأیید عضویت و فعال‌سازی دسترسی</option>
              <option value="reject">رد درخواست</option>
            </select>
          </Field>
          <Field label="توضیح بررسی">
            <textarea
              className={inputClass}
              maxLength={1000}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />
          </Field>
          <label className="flex items-start gap-3 text-sm leading-7">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={busy}
              className="mt-2 accent-teal-700"
            />
            <span>
              {decision === "approve"
                ? "مدارک و وابستگی متقاضی به این مرکز را بررسی کرده‌ام و فعال‌سازی دسترسی را تأیید می‌کنم."
                : "رد این درخواست و غیرفعال ماندن دسترسی را تأیید می‌کنم."}
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button className={buttonClass} disabled={busy || !confirmed}>
              {busy ? "در حال ثبت…" : "ثبت نتیجه بررسی"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              انصراف
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
