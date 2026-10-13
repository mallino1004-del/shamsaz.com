import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, RefreshCw, Clock } from "lucide-react";
import { api } from "../../shared/api/client";
import { AuthError } from "../auth/AuthControls";
import type { VisitRequest } from "../directory/PractitionerBookingModal";
const statuses: Record<string, { label: string; style: string }> = {
  pending: { label: "در انتظار هماهنگی", style: "bg-amber-50 text-amber-800" },
  confirmed: { label: "تأییدشده", style: "bg-teal-50 text-teal-800" },
  rejected: { label: "تأیید نشده", style: "bg-rose-50 text-rose-800" },
  cancelled: { label: "لغوشده", style: "bg-slate-100 text-slate-500" },
};
export function VisitRequestHistory() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [cancelId, setCancelId] = useState("");
  const mutating = useRef(false);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await api<{ visitRequests: VisitRequest[] }>(
        "/visit-requests",
      );
      setRequests(result.visitRequests);
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
    const handle = () => {
      if (document.visibilityState === "visible" && !mutating.current)
        void load(true);
    };
    const timer = window.setInterval(handle, 30000);
    window.addEventListener("shamsaz:visit-request-created", handle);
    window.addEventListener("focus", handle);
    document.addEventListener("visibilitychange", handle);
    return () => {
      clearInterval(timer);
      window.removeEventListener("shamsaz:visit-request-created", handle);
      window.removeEventListener("focus", handle);
      document.removeEventListener("visibilitychange", handle);
    };
  }, [load]);
  async function cancel(id: string) {
    setPendingId(id);
    mutating.current = true;
    setError("");
    try {
      await api(`/visit-requests/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      setCancelId("");
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "لغو انجام نشد.");
    } finally {
      setPendingId("");
      mutating.current = false;
    }
  }
  return (
    <section
      aria-label="درخواست‌های رزرو ویزیت"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarDays className="text-teal-700" size={21} />
          درخواست‌های رزرو ویزیت
        </h2>
        <button
          type="button"
          disabled={loading || !!pendingId}
          onClick={() => void load()}
          aria-label="به‌روزرسانی درخواست‌های رزرو"
          className="flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-teal-700 disabled:opacity-50"
        >
          <RefreshCw size={15} />
          به‌روزرسانی
        </button>
      </div>
      <p className="mb-5 text-xs leading-7 text-slate-500">
        وضعیت درخواست‌ها در این بخش پیگیری می‌شود. برای پزشکان عضو سامانه، پاسخ
        پزشک اینجا نمایش داده می‌شود؛ برای فهرست عمومی، هماهنگی با مطب یا مرکز
        لازم است. هنگام فعال‌بودن صفحه، وضعیت هر ۳۰ ثانیه به‌روزرسانی می‌شود.
      </p>
      <AuthError message={error} />
      {loading ? (
        <p role="status" className="py-5 text-center text-sm text-slate-500">
          در حال دریافت درخواست‌ها…
        </p>
      ) : requests.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {requests.map((item) => (
            <article
              key={item.id}
              data-visit-request-id={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold leading-7 text-slate-800">
                  {item.practitionerName}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statuses[item.status]?.style ?? "bg-slate-100 text-slate-500"}`}
                >
                  {statuses[item.status]?.label ?? item.status}
                </span>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <Clock size={15} />
                {new Date(
                  `${item.preferredDate.slice(0, 10)}T12:00:00+03:30`,
                ).toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" })}{" "}
                · {item.preferredTime.slice(0, 5)} ·{" "}
                {item.visitType === "online" ? "درخواست آنلاین" : "حضوری"}
              </p>
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
                <p className="mt-2 break-words text-xs leading-7 text-slate-600">
                  {item.reason}
                </p>
              )}
              {["pending", "confirmed"].includes(item.status) &&
                (cancelId === item.id ? (
                  <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3">
                    <p className="mb-3 text-xs text-rose-800">
                      این درخواست لغو شود؟
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        disabled={!!pendingId}
                        onClick={() => void cancel(item.id)}
                        className="text-xs font-bold text-rose-700"
                      >
                        {pendingId === item.id
                          ? "در حال لغو…"
                          : "بله، لغو درخواست"}
                      </button>
                      <button
                        type="button"
                        disabled={!!pendingId}
                        onClick={() => setCancelId("")}
                        className="text-xs text-slate-600"
                      >
                        بازگشت
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCancelId(item.id)}
                    className="mt-4 text-xs font-semibold text-rose-700"
                  >
                    لغو درخواست
                  </button>
                ))}
            </article>
          ))}
        </div>
      ) : (
        !error && (
          <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center">
            <p className="text-sm text-slate-500">
              هنوز درخواست رزرو ویزیتی ثبت نکرده‌اید.
            </p>
            <a
              href="#doctors"
              className="mt-3 inline-block text-xs font-semibold text-teal-700"
            >
              انتخاب پزشک و ثبت درخواست
            </a>
          </div>
        )
      )}
    </section>
  );
}
