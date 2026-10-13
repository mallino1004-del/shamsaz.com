import React, { useEffect, useState } from "react";
import { api, SessionUser } from "../../shared/api/client";
import {
  buttonClass,
  Field,
  Feedback,
  inputClass,
} from "../../shared/ui/forms";
interface Board {
  id: string;
  title: string;
  scheduledAt?: string;
  scheduled_at?: string;
  status?: string;
}
interface Case {
  id: string;
  summary: string;
  decision?: string;
}
interface RegistryCase {
  id: string;
  patientName?: string;
  cancerSite?: string;
  stage?: string;
}
export function TumorBoardWorkspace({ user }: { user: SessionUser }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selected, setSelected] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [registryCases, setRegistryCases] = useState<RegistryCase[]>([]);
  const canRead = ["doctor", "registry_clerk", "clinic_admin"].includes(
    user.role,
  );
  async function load() {
    if (!canRead) return;
    try {
      const result = await api<{ boards?: Board[]; tumorBoards?: Board[] }>(
        "/tumor-boards",
      );
      setBoards(result.boards || result.tumorBoards || []);
      if (user.role === "doctor") {
        const dashboard = await api<{ registryCases: RegistryCase[] }>(
          "/dashboard",
        );
        setRegistryCases(dashboard.registryCases);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت جلسات انجام نشد.");
    }
  }
  useEffect(() => {
    void load();
  }, [user.id, user.role]);
  async function choose(id: string) {
    setSelected(id);
    setError("");
    try {
      const result = await api<{ cases: Case[] }>(`/tumor-boards/${id}`);
      setCases(result.cases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت موارد انجام نشد.");
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
    if (payload.scheduledAt)
      payload.scheduledAt = new Date(String(payload.scheduledAt)).toISOString();
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      setSuccess("اطلاعات جلسه ذخیره شد.");
      await load();
      if (selected) await choose(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  if (!canRead)
    return (
      <main dir="rtl" className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">توموربورد مرکز</h1>
        <p className="mt-4 leading-8 text-slate-600">
          جلسات و پرونده‌های توموربورد در اختیار تیم درمان و کارکنان مجاز مرکز
          قرار دارد. برای پیگیری تصمیم‌های مراقبتی با پزشک معالج خود هماهنگ
          کنید.
        </p>
      </main>
    );
  return (
    <main dir="rtl" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <p className="text-sm font-bold text-teal-700">
          هماهنگی مراقبت چندتخصصی
        </p>
        <h1 className="mt-2 text-2xl font-bold">توموربورد مرکز</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          برنامه جلسات، معرفی موارد و تصمیم‌های ثبت‌شده؛ این بخش شامل تماس
          تصویری نیست.
        </p>
      </header>
      <Feedback error={error} success={success} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">جلسات مرکز</h2>
          {boards.length ? (
            <ul className="space-y-3">
              {boards.map((board) => (
                <li key={board.id}>
                  <button
                    onClick={() => void choose(board.id)}
                    aria-pressed={selected === board.id}
                    className="w-full rounded-xl bg-slate-50 p-4 text-right"
                  >
                    <span className="block font-bold">{board.title}</span>
                    <span className="mt-2 block text-sm text-slate-500">
                      {board.scheduledAt || board.scheduled_at
                        ? new Date(
                            board.scheduledAt || board.scheduled_at || "",
                          ).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
                        : "زمان ثبت نشده"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">جلسه‌ای در دسترس نیست.</p>
          )}
          {user.role === "doctor" && (
            <form
              onSubmit={(event) => void submit(event, "/tumor-boards")}
              className="mt-8 space-y-4"
            >
              <h3 className="font-bold">برنامه‌ریزی جلسه جدید</h3>
              <fieldset disabled={pending} className="space-y-4">
                <Field label="عنوان جلسه">
                  <input
                    required
                    minLength={3}
                    maxLength={200}
                    name="title"
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="زمان جلسه (منطقه زمانی دستگاه)"
                  hint="زمان ثبت‌شده در فهرست جلسات به وقت ایران نمایش داده می‌شود."
                >
                  <input
                    required
                    type="datetime-local"
                    name="scheduledAt"
                    className={inputClass}
                  />
                </Field>
                <button className={buttonClass}>ثبت جلسه</button>
              </fieldset>
            </form>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">موارد و تصمیم‌ها</h2>
          {!selected ? (
            <p className="text-sm text-slate-400">یک جلسه را انتخاب کنید.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {cases.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-7">
                      {item.summary}
                    </p>
                    {item.decision && (
                      <p className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
                        {item.decision}
                      </p>
                    )}
                    {user.role === "doctor" && !item.decision && (
                      <form
                        onSubmit={(event) =>
                          void submit(
                            event,
                            `/tumor-boards/${selected}/cases/${item.id}/decision`,
                          )
                        }
                        className="mt-4 space-y-3"
                      >
                        <Field label="تصمیم تیم">
                          <textarea
                            name="decision"
                            required
                            minLength={3}
                            maxLength={5000}
                            rows={3}
                            className={inputClass}
                          />
                        </Field>
                        <button disabled={pending} className={buttonClass}>
                          ثبت تصمیم
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
              {user.role === "doctor" && (
                <form
                  onSubmit={(event) =>
                    void submit(event, `/tumor-boards/${selected}/cases`)
                  }
                  className="mt-8 space-y-4"
                >
                  <h3 className="font-bold">معرفی مورد جدید</h3>
                  <fieldset disabled={pending} className="space-y-4">
                    <Field label="پرونده رجیستری مرکز">
                      <select
                        required
                        name="registryCaseId"
                        defaultValue=""
                        disabled={!registryCases.length}
                        className={inputClass}
                      >
                        <option value="" disabled>
                          {registryCases.length
                            ? "انتخاب پرونده"
                            : "پرونده‌ای در محدوده دسترسی شما نیست"}
                        </option>
                        {registryCases.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.patientName || item.cancerSite || "پرونده"} ·{" "}
                            {item.stage || "مرحله نامشخص"} ·{" "}
                            {item.id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="خلاصه پرونده و سؤال بالینی">
                      <textarea
                        required
                        minLength={3}
                        maxLength={5000}
                        name="summary"
                        rows={4}
                        className={inputClass}
                      />
                    </Field>
                    <button
                      disabled={!registryCases.length}
                      className={buttonClass}
                    >
                      افزودن مورد
                    </button>
                  </fieldset>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
