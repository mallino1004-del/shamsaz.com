import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock,
  Phone,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "../../shared/api/client";
import { AuthError } from "../auth/AuthControls";
import { normalizeSearch } from "../directory/practitioners";
import type { VisitRequest } from "../directory/PractitionerBookingModal";
const statuses: Record<string, { label: string; style: string }> = {
  pending: { label: "در انتظار بررسی", style: "bg-amber-50 text-amber-800" },
  confirmed: { label: "تأییدشده", style: "bg-teal-50 text-teal-800" },
  rejected: { label: "تأیید نشده", style: "bg-rose-50 text-rose-800" },
  cancelled: {
    label: "لغوشده توسط بیمار",
    style: "bg-slate-100 text-slate-500",
  },
};
export function DoctorVisitRequests() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [decision, setDecision] = useState<{
    id: string;
    status: "confirmed" | "rejected";
  } | null>(null);
  const mutating = useRef(false);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api<{ visitRequests: VisitRequest[] }>(
        "/visit-requests",
      );
      setRequests(data.visitRequests);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت درخواست‌ها انجام نشد.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const refresh = () => {
      if (document.visibilityState === "visible" && !mutating.current)
        void load(true);
    };
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);
  async function update() {
    if (!decision) return;
    mutating.current = true;
    setPendingId(decision.id);
    setError("");
    setSuccess("");
    try {
      await api(`/visit-requests/${encodeURIComponent(decision.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: decision.status }),
      });
      setSuccess(
        decision.status === "confirmed"
          ? "درخواست ویزیت تأیید شد؛ وضعیت جدید در حساب بیمار قابل مشاهده است."
          : "درخواست ویزیت تأیید نشد؛ وضعیت جدید در حساب بیمار قابل مشاهده است.",
      );
      setDecision(null);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت انجام نشد.");
    } finally {
      mutating.current = false;
      setPendingId("");
    }
  }
  const visible = requests.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      normalizeSearch(
        `${item.patientName} ${item.phone} ${item.reference}`,
      ).includes(normalizeSearch(query)),
  );
  return (
    <section
      aria-label="درخواست‌های ویزیت بیماران"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarDays size={21} className="text-teal-700" />
          درخواست‌های ویزیت بیماران
        </h2>
        <button
          type="button"
          disabled={loading || !!pendingId}
          onClick={() => void load()}
          aria-label="به‌روزرسانی درخواست‌های ویزیت بیماران"
          className="flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-teal-700 disabled:opacity-50"
        >
          <RefreshCw size={15} />
          به‌روزرسانی
        </button>
      </div>
      <p className="mt-3 text-xs leading-7 text-slate-500">
        درخواست‌های ثبت‌شده برای پروفایل متصل به حساب شما نمایش داده می‌شوند.
        تأیید یا رد شما در حساب همان بیمار ثبت می‌شود. فهرست هنگام فعال‌بودن
        صفحه هر ۳۰ ثانیه به‌روزرسانی می‌شود.
      </p>
      <div className="my-5 flex flex-wrap gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            aria-label="جست‌وجوی بیمار، همراه یا کد پیگیری"
            className="min-w-0 w-full bg-transparent py-3 text-xs outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام بیمار، شماره همراه یا کد پیگیری"
          />
        </label>
        <select
          aria-label="فیلتر وضعیت درخواست‌های بیماران"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
        >
          <option value="pending">
            در انتظار بررسی (
            {requests
              .filter((item) => item.status === "pending")
              .length.toLocaleString("fa-IR")}
            )
          </option>
          <option value="all">
            همهٔ درخواست‌ها ({requests.length.toLocaleString("fa-IR")})
          </option>
          <option value="confirmed">تأییدشده</option>
          <option value="rejected">تأیید نشده</option>
          <option value="cancelled">لغوشده</option>
        </select>
      </div>
      <AuthError message={error} />
      {success && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-teal-50 p-3 text-xs leading-7 text-teal-800"
        >
          {success}
        </p>
      )}
      {loading ? (
        <p role="status" className="py-6 text-center text-sm text-slate-500">
          در حال دریافت درخواست‌ها…
        </p>
      ) : visible.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((item) => (
            <article
              key={item.id}
              data-visit-request-id={item.id}
              className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold leading-7 text-slate-900">
                  {item.patientName}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statuses[item.status]?.style || "bg-slate-100"}`}
                >
                  {statuses[item.status]?.label || item.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                پزشک: {item.practitionerName}
              </p>
              <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-slate-600">
                <Clock size={15} className="mt-1 shrink-0" />
                {new Date(
                  `${item.preferredDate.slice(0, 10)}T12:00:00+03:30`,
                ).toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" })}{" "}
                · {item.preferredTime.slice(0, 5)} ·{" "}
                {item.visitType === "online" ? "درخواست آنلاین" : "حضوری"}
              </p>
              <a
                href={`tel:${item.phone.replace(/[^+0-9]/g, "")}`}
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-teal-700"
              >
                <Phone size={15} />
                <span dir="ltr">{item.phone}</span>
              </a>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                کد پیگیری:{" "}
                <span
                  dir="ltr"
                  className="inline-block font-mono font-semibold text-teal-800"
                >
                  {item.reference}
                </span>
              </p>
              {item.reason && (
                <p className="mt-3 break-words rounded-lg bg-white p-3 text-xs leading-7 text-slate-600">
                  {item.reason}
                </p>
              )}
              {item.status === "pending" &&
                (decision?.id === item.id ? (
                  <div className="mt-4 rounded-xl border border-teal-100 bg-white p-3">
                    <p className="text-xs leading-7 text-slate-700">
                      {decision.status === "confirmed"
                        ? "زمان پیشنهادی بیمار برای این ویزیت تأیید شود؟"
                        : "این درخواست ویزیت رد شود؟"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <button
                        type="button"
                        disabled={!!pendingId}
                        onClick={() => void update()}
                        className={`text-xs font-bold ${decision.status === "confirmed" ? "text-teal-700" : "text-rose-700"}`}
                      >
                        {pendingId === item.id
                          ? "در حال ثبت…"
                          : decision.status === "confirmed"
                            ? "ثبت تأیید ویزیت"
                            : "ثبت رد درخواست"}
                      </button>
                      <button
                        type="button"
                        disabled={!!pendingId}
                        onClick={() => setDecision(null)}
                        className="text-xs text-slate-500"
                      >
                        بازگشت
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!!pendingId}
                      onClick={() => {
                        setDecision({ id: item.id, status: "confirmed" });
                        setSuccess("");
                      }}
                      className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      تأیید ویزیت
                    </button>
                    <button
                      type="button"
                      disabled={!!pendingId}
                      onClick={() => {
                        setDecision({ id: item.id, status: "rejected" });
                        setSuccess("");
                      }}
                      className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      رد درخواست
                    </button>
                  </div>
                ))}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 py-7 text-center text-sm text-slate-500">
          درخواستی مطابق فیلتر شما وجود ندارد.
        </p>
      )}
    </section>
  );
}
