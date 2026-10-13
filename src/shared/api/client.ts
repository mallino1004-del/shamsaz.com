import type { UserRole } from "../../../shared/contracts";
export type {
  SessionUser,
  AuthResponse as SessionResponse,
} from "../../../shared/contracts";
let csrfToken = "";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (options.method && options.method !== "GET" && csrfToken)
    headers.set("x-csrf-token", csrfToken);
  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "پاسخ معتبر از سرویس دریافت نشد. اتصال و اجرای سرور را بررسی کنید.",
    );
  }
  const result = await response.json().catch(() => {
    throw new Error("پاسخ سرویس قابل خواندن نیست. دوباره تلاش کنید.");
  });
  if (response.status === 401 && result.error?.code === "UNAUTHENTICATED") {
    csrfToken = "";
    window.dispatchEvent(new Event("shamsaz:session-expired"));
  }
  if (!response.ok)
    throw new Error(
      result.error?.message || "ارتباط با سرور انجام نشد. دوباره تلاش کنید.",
    );
  if (typeof result.csrfToken === "string") csrfToken = result.csrfToken;
  if (result.user === null) csrfToken = "";
  return result as T;
}
export const roleLabels: Record<UserRole, string> = {
  patient: "بیمار",
  doctor: "پزشک",
  registry_clerk: "کارشناس رجیستری",
  clinic_admin: "مدیر مرکز درمانی",
  national_supervisor: "ناظر ملی",
};
