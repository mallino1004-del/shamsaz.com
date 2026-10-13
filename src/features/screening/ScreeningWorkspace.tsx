import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ShieldCheck,
  ClipboardList,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  FileDown,
  Printer,
  HeartPulse,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { api, type SessionUser } from "../../shared/api/client";
import {
  Field,
  inputClass,
  buttonClass,
  Feedback,
} from "../../shared/ui/forms";
import {
  assessScreening,
  emptyScreeningAnswers,
  screeningSources,
  symptomOptions,
  validateScreeningAnswers,
  type ScreeningAnswers,
  type SavedScreening,
  type ScreeningAssessment,
} from "../../../shared/screening";
import "./screening.css";

const steps = [
  "اطلاعات سلامت",
  "علائم و هشدارها",
  "سوابق غربالگری",
  "بازبینی و رضایت",
  "گزارش و اقدام بعدی",
];
const yesNo = [
  ["unknown", "نمی‌دانم"],
  ["no", "خیر"],
  ["yes", "بله"],
];
const dateFa = (v: string) =>
  new Date(v.length === 10 ? `${v}T12:00:00+03:30` : v).toLocaleDateString(
    "fa-IR",
    { timeZone: "Asia/Tehran" },
  );
const stateLabels = {
  review: "نیازمند بررسی پزشکی",
  due: "نیازمند برنامه‌ریزی",
  scheduled: "زمان پیشنهادی بعدی",
  individual: "برنامه اختصاصی",
  education: "آگاهی و پیشگیری",
};
const organLabels: Record<string, string> = {
  breast: "پستان",
  cervix: "دهانه رحم",
  ovary: "تخمدان",
  endometrium: "رحم و آندومتر",
  general: "علائم عمومی",
  emergency: "علائم نیازمند اقدام فوری",
};
function AnswerSummary({ answers: b }: { answers: ScreeningAnswers }) {
  const labels: Record<string, string> = {
    yes: "بله",
    no: "خیر",
    unknown: "نامشخص",
    pre: "پیش از یائسگی",
    post: "پس از یائسگی",
    none: "ندارد",
    brca: "BRCA1 / BRCA2",
    lynch: "سندرم لینچ",
    other: "جهش مرتبط دیگر",
    normal: "طبیعی طبق گزارش",
    abnormal: "غیرطبیعی / نیازمند پیگیری",
    pap: "پاپ‌اسمیر",
    hpv: "HPV پرخطر",
    cotest: "آزمایش ترکیبی",
    complete: "دوره کامل",
    partial: "دوره ناقص",
    new: "کمتر از دو هفته",
    persistent: "دو هفته یا بیشتر / تکرارشونده",
  };
  const entries = [
    ["وضعیت یائسگی", b.menopause],
    ["وجود دهانه رحم", b.cervix],
    ["احتمال بارداری", b.pregnant],
    ["سابقه خانوادگی درجه‌اول", b.familyHistory],
    ["آزمایش ژنتیک", b.genetic],
    ["سابقه سرطان / ضایعات", b.personalHistory],
    ["سرکوب ایمنی", b.immunosuppressed],
    ["پرتودرمانی قفسه سینه پیش از ۳۰ سال", b.chestRadiation],
    ["مدت علائم", b.duration],
    ["نتیجه ماموگرافی", b.mammogramResult],
    ["نوع آزمایش دهانه رحم", b.cervicalType],
    ["نتیجه آزمایش دهانه رحم", b.cervicalResult],
    ["واکسن HPV", b.hpvVaccine],
  ];
  return (
    <details className="rounded-xl border border-slate-200 p-4" open>
      <summary className="cursor-pointer font-bold">
        پاسخ‌های ثبت‌شده سلامت
      </summary>
      <p className="mt-3 text-sm leading-8">
        سن: {new Intl.NumberFormat("fa").format(b.age)} ·{" "}
        {b.noSymptoms
          ? "بدون علائم انتخاب‌شده"
          : b.symptoms
              .map((id) => symptomOptions.find((s) => s.id === id)?.label)
              .join("؛ ")}
      </p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        {entries.map(([label, value]) => (
          <div key={label}>
            <dt className="text-slate-500">{label}</dt>
            <dd className="mt-1 font-medium">{labels[value] || "نامشخص"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-8">
        ماموگرافی: {b.mammogramDate ? dateFa(b.mammogramDate) : "تاریخ نامشخص"}{" "}
        · آزمایش دهانه رحم:{" "}
        {b.cervicalDate ? dateFa(b.cervicalDate) : "تاریخ نامشخص"}
      </p>
      {b.notes && (
        <p className="mt-2 break-words text-sm leading-8">توضیحات: {b.notes}</p>
      )}
    </details>
  );
}

function Report({
  assessment,
  record,
  onNavigate,
}: {
  assessment: ScreeningAssessment;
  record?: SavedScreening;
  onNavigate: (view: string) => void;
}) {
  function download() {
    const content = JSON.stringify(record || { assessment }, null, 2);
    const link = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob([content], { type: "application/json;charset=utf-8" }),
      );
    link.href = url;
    link.download = `shamsaz-screening-${record?.id || "preview"}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <article className="screening-report space-y-6" aria-label="گزارش غربالگری">
      {record?.patientName && (
        <p className="font-bold">گزارش شخصی: {record.patientName}</p>
      )}
      <div className={`screening-outcome ${assessment.triageLevel}`}>
        <HeartPulse size={30} aria-hidden="true" />
        <div>
          <p className="text-sm">راهنمای اقدام بر اساس پاسخ‌های شما</p>
          <h2 className="mt-2 text-2xl font-bold">{assessment.title}</h2>
          <p className="mt-3 leading-8">{assessment.action}</p>
        </div>
      </div>
      {record && (
        <p className="break-words text-sm text-slate-500">
          گزارش ذخیره‌شده · {dateFa(record.createdAt)} · شناسه:{" "}
          <bdi>{record.id}</bdi>
        </p>
      )}
      <p className="rounded-xl bg-slate-50 p-4 text-sm leading-7">
        این گزارش احتمال سرطان را محاسبه نمی‌کند و تشخیص پزشکی نیست. وجود علائم
        به بررسی تشخیصی نیاز دارد؛ نبود علائم یا نتیجه طبیعی قبلی نیز سرطان را
        رد نمی‌کند.
      </p>
      {!!assessment.reasons.length && (
        <section>
          <h3 className="font-bold">دلیل پیشنهاد این مسیر</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7">
            {assessment.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3 className="mb-4 text-lg font-bold">
          برنامه بررسی و پیشگیری برای هر حوزه
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {assessment.plans.map((plan) => (
            <div className="screening-plan" key={plan.organ}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold">{plan.title}</h4>
                <span className={`screening-state ${plan.state}`}>
                  {stateLabels[plan.state]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                {plan.text}
              </p>
              {plan.nextDate && (
                <p className="mt-3 text-sm font-semibold text-teal-800">
                  موعد پیشنهادی: {dateFa(plan.nextDate)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <h3 className="font-bold">برای مراجعه آماده شوید</h3>
        <p className="mt-2 text-sm leading-8">
          گزارش آزمایش‌های قبلی، زمان شروع علائم، فهرست داروها و اطلاعات سرطان
          در بستگان درجه‌اول را همراه داشته باشید. واکسن HPV جایگزین غربالگری
          دهانه رحم نیست. انتخاب آزمایش و فاصله پیگیری با توجه به شرایط شما و
          راهنمای محل درمان انجام می‌شود.
        </p>
      </section>
      <div className="screening-no-print flex flex-wrap gap-3">
        {assessment.triageLevel === "emergency" ? (
          <a className={buttonClass} href="tel:115">
            تماس با اورژانس ۱۱۵
          </a>
        ) : (
          <button
            type="button"
            className={buttonClass}
            onClick={() => onNavigate("doctors")}
          >
            انتخاب پزشک و درخواست ویزیت
          </button>
        )}
        <button
          type="button"
          className="screening-secondary"
          onClick={() => window.print()}
        >
          <Printer size={17} />
          چاپ گزارش
        </button>
        <button
          type="button"
          className="screening-secondary"
          onClick={download}
        >
          <FileDown size={17} />
          دریافت فایل گزارش
        </button>
      </div>
      {record?.answers && <AnswerSummary answers={record.answers} />}
      <p className="text-xs leading-6 text-slate-500">
        قواعد شفاف راهنمای مراقبت · نسخه <bdi>{assessment.version}</bdi> ·
        ارزیابی {dateFa(assessment.evaluatedAt)}. برنامه‌های مرجع بین‌المللی
        هستند و باید با شرایط فردی و پروتکل محل درمان تطبیق داده شوند.
      </p>
    </article>
  );
}

function Education() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">راهنمای غربالگری و آمادگی</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          [
            "غربالگری با بررسی علائم چه تفاوتی دارد؟",
            "غربالگری برای فرد بدون علامت است. توده تازه، خون‌ریزی غیرمعمول یا علائم مداوم مسیر معاینه و بررسی تشخیصی دارند؛ تا موعد آزمایش دوره‌ای صبر نکنید.",
          ],
          [
            "پستان",
            "ماموگرافی ابزار اصلی غربالگری پستان در گروه واجد شرایط است. سونوگرافی یا MRI بر اساس تصمیم پزشک اضافه می‌شوند؛ جایگزینی خودکار برای همه افراد نیستند.",
          ],
          [
            "دهانه رحم و HPV",
            "پاپ‌اسمیر، HPV پرخطر و آزمایش ترکیبی فاصله‌های متفاوت دارند. نوع آزمایش، نتیجه قبلی، وجود دهانه رحم و سابقه ضایعات باید مشخص باشد.",
          ],
          [
            "تخمدان و آندومتر",
            "برای افراد بدون علامت با خطر معمول، آزمایش روتین استاندارد برای این دو حوزه وجود ندارد. خون‌ریزی پس از یائسگی و علائم جدید مداوم را پیگیری کنید.",
          ],
          [
            "سابقه خانوادگی و ژنتیک",
            "مادر، خواهر و دختر بستگان درجه‌اول هستند. نوع سرطان و سن ابتلا را ثبت کنید؛ جهش شناخته‌شده یا الگوی خانوادگی ممکن است نیازمند مشاوره ژنتیک باشد.",
          ],
          [
            "آمادگی برای مراجعه",
            "دستور آمادگی آزمایش را از مرکز انجام‌دهنده بگیرید. نتیجه‌های قبلی و فهرست داروها را همراه ببرید و احتمال بارداری را به تیم درمان اطلاع دهید.",
          ],
        ].map(([title, text]) => (
          <section className="screening-plan" key={title}>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-8 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
      <h3 className="font-bold">پرسش‌های متداول</h3>
      {[
        [
          "آیا گزارش به معنی تشخیص سرطان است؟",
          "خیر. این ابزار پاسخ‌ها را برای تعیین مسیر مراجعه و یادآوری غربالگری سازمان‌دهی می‌کند و مدل تشخیص یا درصد احتمال سرطان نیست.",
        ],
        [
          "اگر پاسخ بعضی پرسش‌ها را ندانم چه می‌شود؟",
          "گزینه «نمی‌دانم» را انتخاب کنید. برای این شرایط موعد قطعی صادر نمی‌شود؛ تکمیل سوابق و گفت‌وگو با پزشک پیشنهاد می‌شود.",
        ],
        [
          "آیا گزارش خودکار برای پزشک ارسال می‌شود؟",
          "گزارش در حساب شخصی شما ذخیره می‌شود. برای مراجعه، آن را چاپ یا دریافت کنید و از فهرست پزشکان درخواست ویزیت بدهید؛ اشتراک خودکار گزارش با پزشک فعال نشده است.",
        ],
        [
          "آیا نتیجه طبیعی قبلی کافی است؟",
          "خیر. علامت جدید یا نتیجه غیرطبیعی قبلی به پیگیری مستقل نیاز دارد؛ نتیجه قدیمی جای بررسی علائم امروز را نمی‌گیرد.",
        ],
      ].map(([q, a]) => (
        <details className="rounded-xl border border-slate-200 p-4" key={q}>
          <summary className="cursor-pointer font-semibold">{q}</summary>
          <p className="mt-3 text-sm leading-8 text-slate-600">{a}</p>
        </details>
      ))}
    </div>
  );
}

export function ScreeningWorkspace({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate: (view: string) => void;
}) {
  const [tab, setTab] = useState<"assessment" | "history" | "education">(
    "assessment",
  );
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<ScreeningAnswers>({
      ...emptyScreeningAnswers,
    });
  const [consent, setConsent] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [records, setRecords] = useState<SavedScreening[]>([]),
    [historyLoading, setHistoryLoading] = useState(false),
    [historyError, setHistoryError] = useState("");
  const [saved, setSaved] = useState<SavedScreening>(),
    [selected, setSelected] = useState<SavedScreening>();
  const heading = useRef<HTMLHeadingElement>(null),
    posting = useRef(false);
  const today = new Date().toISOString().slice(0, 10);
  const emergency = answers.symptoms.some(
    (s) => s === "heavy_bleeding" || s === "severe_pain",
  );
  function update<K extends keyof ScreeningAnswers>(
    key: K,
    value: ScreeningAnswers[K],
  ) {
    setAnswers((old) => ({ ...old, [key]: value }));
    setError("");
  }
  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const result = await api<{ screenings: SavedScreening[] }>("/screenings");
      setRecords(result.screenings);
    } catch (e) {
      setHistoryError((e as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  }
  useEffect(() => {
    if (tab === "history" && user.role === "patient") void loadHistory();
  }, [tab, user.id]);
  function move(next: number) {
    setStep(next);
    setError("");
    setTimeout(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }, 0);
  }
  function advance() {
    if (
      step === 0 &&
      (!Number.isInteger(answers.age) || answers.age < 18 || answers.age > 110)
    ) {
      setError("سن باید بین ۱۸ تا ۱۱۰ سال باشد.");
      return;
    }
    if (step === 1 && !answers.noSymptoms && !answers.symptoms.length) {
      setError("علائم را انتخاب کنید یا نداشتن علائم را مشخص کنید.");
      return;
    }
    if (step === 2) {
      const errors = validateScreeningAnswers(answers);
      if (errors.length) {
        setError(errors.join(" "));
        return;
      }
    }
    move(step + 1);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (posting.current) return;
    const errors = validateScreeningAnswers(answers);
    if (errors.length || !consent) {
      setError(errors.join(" ") || "رضایت ذخیره اطلاعات سلامت الزامی است.");
      return;
    }
    posting.current = true;
    setPending(true);
    setError("");
    try {
      const result = await api<{ screening: SavedScreening }>("/screenings", {
        method: "POST",
        body: JSON.stringify({ screeningVersion: 2, answers, consent }),
      });
      setSaved(result.screening);
      move(4);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
      posting.current = false;
    }
  }
  function selectField<K extends keyof ScreeningAnswers>(
    key: K,
    label: string,
    options: string[][] = yesNo,
    hint?: string,
  ) {
    return (
      <Field label={label} hint={hint}>
        <select
          className={inputClass}
          value={String(answers[key])}
          onChange={(e) => update(key, e.target.value as ScreeningAnswers[K])}
        >
          {options.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  function toggleSymptom(id: ScreeningAnswers["symptoms"][number]) {
    setAnswers((old) => {
      const symptoms = old.symptoms.includes(id)
        ? old.symptoms.filter((s) => s !== id)
        : [...old.symptoms, id];
      return {
        ...old,
        symptoms,
        noSymptoms: false,
        duration: old.duration === "none" ? "unknown" : old.duration,
      };
    });
    setError("");
  }
  return (
    <main
      className="screening-workspace mx-auto max-w-7xl space-y-6 px-4 py-8"
      dir="rtl"
    >
      <header className="screening-no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold text-teal-700">
            پیشگیری آگاهانه · پیگیری به‌موقع
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            غربالگری هوشمند سلامت زنان
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
            سوابق و علائم خود را ثبت کنید، مسیر مناسب بررسی را ببینید و گزارش را
            برای مراجعه همراه داشته باشید.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm text-teal-800">
          <ShieldCheck size={18} />
          گزارش شخصی در حساب شما
        </span>
      </header>
      <nav
        className="screening-no-print flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2"
        aria-label="بخش‌های غربالگری"
      >
        {(
          [
            ["assessment", "ارزیابی جدید", Activity],
            ["history", "گزارش‌ها و پیگیری", ClipboardList],
            ["education", "راهنما و پرسش‌ها", BookOpen],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={`screening-tab ${tab === id ? "active" : ""}`}
            onClick={() => {
              setTab(id);
              setSelected(undefined);
              setError("");
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      {user.role !== "patient" ? (
        <section className="screening-panel">
          <h2 className="text-xl font-bold">راهنمای غربالگری برای تیم درمان</h2>
          <p className="my-4 text-sm leading-8">
            ثبت ارزیابی شخصی و گزارش‌های خصوصی در حساب بیمار انجام می‌شود. این
            حساب به گزارش خصوصی بیماران دسترسی ندارد.
          </p>
          <Education />
        </section>
      ) : (
        <>
          {tab === "assessment" && (
            <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="screening-no-print screening-panel">
                <h2 className="mb-4 font-bold">مسیر ارزیابی شما</h2>
                <ol className="space-y-3">
                  {steps.map((name, i) => (
                    <li
                      key={name}
                      className={`flex items-center gap-3 rounded-xl p-3 text-sm ${step === i ? "bg-teal-50 font-bold text-teal-800" : "text-slate-500"}`}
                      aria-current={step === i ? "step" : undefined}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${i < step ? "bg-teal-700 text-white" : "bg-slate-100"}`}
                      >
                        {i < step ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          new Intl.NumberFormat("fa").format(i + 1)
                        )}
                      </span>
                      {name}
                    </li>
                  ))}
                </ol>
                <p className="mt-6 border-t pt-4 text-xs leading-7 text-slate-500">
                  برای بزرگسالان ۱۸ سال به بالا. پاسخ‌ها تا پیش از ثبت نهایی فقط
                  در همین صفحه نگهداری می‌شوند.
                </p>
              </aside>
              <section className="screening-panel min-w-0">
                <h2
                  ref={heading}
                  tabIndex={-1}
                  className="mb-2 text-xl font-bold outline-none"
                >
                  {steps[step]}
                </h2>
                <p className="mb-6 text-sm text-slate-500">
                  {user.displayName} · مرحله{" "}
                  {new Intl.NumberFormat("fa").format(step + 1)} از ۵
                </p>
                {emergency && step < 4 && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"
                  >
                    <strong className="flex items-center gap-2">
                      <AlertTriangle size={20} />
                      برای مراجعه فوری منتظر تکمیل فرم نمانید
                    </strong>
                    <p className="mt-2 text-sm leading-7">
                      خون‌ریزی شدید همراه ضعف یا درد ناگهانی شدید نیازمند
                      ارزیابی فوری است. به اورژانس مراجعه کنید؛ در ایران با ۱۱۵
                      تماس بگیرید.
                    </p>
                  </div>
                )}
                <Feedback error={error} />
                {step < 4 ? (
                  <form
                    onSubmit={(e) => {
                      if (step === 3) void submit(e);
                      else {
                        e.preventDefault();
                        advance();
                      }
                    }}
                    className="mt-4"
                  >
                    <fieldset disabled={pending} className="space-y-6">
                      {step === 0 && (
                        <>
                          <p className="text-sm leading-7 text-slate-600">
                            پاسخ‌ها باید مربوط به خودتان باشد. اگر از سابقه‌ای
                            مطمئن نیستید، «نمی‌دانم» را انتخاب کنید.
                          </p>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                              label="سن (سال)"
                              hint="۱۸ تا ۱۱۰ سال؛ اطلاعات نمونه وارد نشده است."
                            >
                              <input
                                className={inputClass}
                                name="age"
                                type="number"
                                required
                                min={18}
                                max={110}
                                value={answers.age || ""}
                                onChange={(e) =>
                                  update("age", Number(e.target.value))
                                }
                              />
                            </Field>
                            {selectField(
                              "menopause",
                              "وضعیت قاعدگی / یائسگی",
                              [
                                ["unknown", "نمی‌دانم"],
                                ["pre", "هنوز یائسه نشده‌ام"],
                                ["post", "یائسه شده‌ام"],
                              ],
                              "یائسگی معمولاً پس از ۱۲ ماه بدون قاعدگی و بدون علت دیگر مطرح می‌شود.",
                            )}
                            {selectField(
                              "cervix",
                              "آیا دهانه رحم دارید؟",
                              yesNo,
                              "پس از بعضی انواع عمل برداشتن رحم، دهانه رحم باقی می‌ماند؛ در صورت تردید نمی‌دانم را انتخاب کنید.",
                            )}
                            {selectField(
                              "pregnant",
                              "بارداری یا احتمال بارداری",
                            )}
                            {selectField(
                              "familyHistory",
                              "سرطان پستان یا تخمدان در بستگان درجه‌اول",
                              yesNo,
                              "مادر، خواهر یا دختر؛ جزئیات نوع سرطان و سن ابتلا را در توضیحات بنویسید.",
                            )}
                            {selectField(
                              "genetic",
                              "نتیجه شناخته‌شده آزمایش ژنتیک",
                              [
                                ["unknown", "نمی‌دانم / آزمایش نکرده‌ام"],
                                ["none", "جهش شناخته‌شده ندارم"],
                                ["brca", "BRCA1 / BRCA2"],
                                ["lynch", "سندرم لینچ"],
                                ["other", "جهش مرتبط دیگر"],
                              ],
                            )}
                            {selectField(
                              "personalHistory",
                              "سابقه سرطان پستان / زنان یا ضایعه پیش‌سرطانی دهانه رحم",
                            )}
                            {selectField(
                              "immunosuppressed",
                              "ضعف سیستم ایمنی، HIV یا درمان سرکوب‌کننده ایمنی",
                            )}
                            {selectField(
                              "chestRadiation",
                              "سابقه پرتودرمانی قفسه سینه پیش از ۳۰ سال",
                              yesNo,
                              "پرتودرمانی برای درمان بیماری؛ عکس ساده قفسه سینه محسوب نمی‌شود.",
                            )}
                          </div>
                        </>
                      )}
                      {step === 1 && (
                        <>
                          <p className="text-sm leading-8 text-slate-600">
                            علائم فعلی را انتخاب کنید. اگر علامتی ندارید، گزینه
                            جداگانه زیر را فعال کنید.
                          </p>
                          <label
                            className={`screening-choice ${answers.noSymptoms ? "checked" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={answers.noSymptoms}
                              onChange={(e) => {
                                setAnswers((old) => ({
                                  ...old,
                                  noSymptoms: e.target.checked,
                                  symptoms: [],
                                  duration: e.target.checked
                                    ? "none"
                                    : "unknown",
                                }));
                                setError("");
                              }}
                            />
                            هیچ‌یک از علائم زیر را ندارم
                          </label>
                          {Object.entries(organLabels).map(([organ, label]) => (
                            <fieldset key={organ} className="space-y-3">
                              <legend
                                className={`mb-3 font-bold ${organ === "emergency" ? "text-red-800" : "text-slate-700"}`}
                              >
                                {label}
                              </legend>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {symptomOptions
                                  .filter((s) => s.organ === organ)
                                  .map((s) => (
                                    <label
                                      key={s.id}
                                      className={`screening-choice ${answers.symptoms.includes(s.id) ? "checked" : ""}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={answers.symptoms.includes(
                                          s.id,
                                        )}
                                        onChange={() => toggleSymptom(s.id)}
                                      />
                                      <span>{s.label}</span>
                                    </label>
                                  ))}
                              </div>
                            </fieldset>
                          ))}
                          {!answers.noSymptoms &&
                            selectField("duration", "مدت علائم", [
                              ["unknown", "دقیق نمی‌دانم"],
                              ["new", "شروع تازه؛ کمتر از دو هفته"],
                              ["persistent", "دو هفته یا بیشتر / تکرارشونده"],
                            ])}
                          <Field label="جزئیات علائم، سوابق و داروهای مرتبط (اختیاری)">
                            <textarea
                              className={inputClass}
                              rows={3}
                              maxLength={2000}
                              value={answers.notes}
                              onChange={(e) => update("notes", e.target.value)}
                            />
                          </Field>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <p className="text-sm leading-8 text-slate-600">
                            اگر آزمایش انجام نداده‌اید یا تاریخ را نمی‌دانید،
                            تاریخ را خالی بگذارید. تاریخ ورودی میلادی است؛
                            موعدها در گزارش شمسی نمایش داده می‌شوند.
                          </p>
                          <section className="space-y-4 rounded-2xl bg-slate-50 p-4">
                            <h3 className="flex items-center gap-2 font-bold">
                              <CalendarDays size={19} />
                              آخرین ماموگرافی
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field label="تاریخ آخرین ماموگرافی (میلادی)">
                                <input
                                  className={inputClass}
                                  type="date"
                                  max={today}
                                  min="1900-01-01"
                                  value={answers.mammogramDate}
                                  onChange={(e) =>
                                    update("mammogramDate", e.target.value)
                                  }
                                />
                              </Field>
                              {selectField(
                                "mammogramResult",
                                "نتیجه ماموگرافی",
                                [
                                  [
                                    "unknown",
                                    "انجام نداده‌ام / نتیجه را نمی‌دانم",
                                  ],
                                  ["normal", "طبیعی، طبق گزارش"],
                                  ["abnormal", "غیرطبیعی / نیازمند پیگیری"],
                                ],
                              )}
                            </div>
                          </section>
                          <section className="space-y-4 rounded-2xl bg-slate-50 p-4">
                            <h3 className="font-bold">
                              آخرین آزمایش دهانه رحم
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field label="تاریخ آخرین آزمایش دهانه رحم (میلادی)">
                                <input
                                  className={inputClass}
                                  type="date"
                                  max={today}
                                  min="1900-01-01"
                                  value={answers.cervicalDate}
                                  onChange={(e) =>
                                    update("cervicalDate", e.target.value)
                                  }
                                />
                              </Field>
                              {selectField(
                                "cervicalType",
                                "نوع آزمایش دهانه رحم",
                                [
                                  ["unknown", "انجام نداده‌ام / نمی‌دانم"],
                                  ["pap", "پاپ‌اسمیر"],
                                  ["hpv", "HPV پرخطر"],
                                  ["cotest", "پاپ‌اسمیر و HPV ترکیبی"],
                                ],
                              )}
                              {selectField(
                                "cervicalResult",
                                "نتیجه آزمایش دهانه رحم",
                                [
                                  [
                                    "unknown",
                                    "انجام نداده‌ام / نتیجه را نمی‌دانم",
                                  ],
                                  ["normal", "طبیعی / HPV منفی، طبق گزارش"],
                                  [
                                    "abnormal",
                                    "غیرطبیعی / HPV مثبت / نیازمند پیگیری",
                                  ],
                                ],
                              )}
                              {selectField("hpvVaccine", "وضعیت واکسن HPV", [
                                ["unknown", "نمی‌دانم"],
                                ["complete", "دوره کامل"],
                                ["partial", "دوره ناقص"],
                                ["no", "تزریق نکرده‌ام"],
                              ])}
                            </div>
                          </section>
                          <p className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-8 text-sky-900">
                            برای خطر معمول و بدون علامت، CA-125 و سونوگرافی لگن
                            برنامه غربالگری روتین تخمدان نیستند. برنامه اختصاصی
                            را پزشک تعیین می‌کند.
                          </p>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-8">
                            <h3 className="font-bold">خلاصه پاسخ‌های شما</h3>
                            <p>
                              سن:{" "}
                              {new Intl.NumberFormat("fa").format(answers.age)}{" "}
                              سال ·{" "}
                              {answers.noSymptoms
                                ? "بدون علائم انتخاب‌شده"
                                : `${answers.symptoms.length} علامت انتخاب شده`}
                            </p>
                            <p>
                              {answers.symptoms
                                .map(
                                  (id) =>
                                    symptomOptions.find((s) => s.id === id)
                                      ?.label,
                                )
                                .join("؛ ")}
                            </p>
                            <p>
                              ماموگرافی:{" "}
                              {answers.mammogramDate
                                ? dateFa(answers.mammogramDate)
                                : "تاریخ مشخص نشده"}{" "}
                              · آزمایش دهانه رحم:{" "}
                              {answers.cervicalDate
                                ? dateFa(answers.cervicalDate)
                                : "تاریخ مشخص نشده"}
                            </p>
                            {answers.notes && (
                              <p className="break-words">
                                توضیحات: {answers.notes}
                              </p>
                            )}
                          </div>
                          <Report
                            assessment={assessScreening(answers)}
                            onNavigate={onNavigate}
                          />
                          <AnswerSummary answers={answers} />
                          <label className="screening-choice">
                            <input
                              type="checkbox"
                              required
                              checked={consent}
                              onChange={(e) => setConsent(e.target.checked)}
                            />
                            <span>
                              با ذخیره پاسخ‌های سلامت و گزارش در حساب شخصی برای
                              پیگیری مراقبت موافقم. می‌دانم این ابزار تشخیص
                              پزشکی ارائه نمی‌کند و گزارش خودکار برای پزشک ارسال
                              نمی‌شود.
                            </span>
                          </label>
                        </>
                      )}
                      <div className="screening-no-print flex flex-wrap justify-between gap-3 border-t pt-5">
                        {step > 0 ? (
                          <button
                            type="button"
                            className="screening-secondary"
                            onClick={() => move(step - 1)}
                          >
                            <ArrowRight size={17} />
                            مرحله قبل
                          </button>
                        ) : (
                          <span />
                        )}
                        <button className={buttonClass} type="submit">
                          {pending
                            ? "در حال ثبت…"
                            : step === 3
                              ? "ثبت نهایی گزارش"
                              : "ادامه"}
                          {step !== 3 && (
                            <ArrowLeft className="mr-2 inline" size={17} />
                          )}
                        </button>
                      </div>
                    </fieldset>
                  </form>
                ) : (
                  saved?.assessment && (
                    <>
                      <p
                        role="status"
                        className="mb-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-900"
                      >
                        گزارش با موفقیت در حساب شما ذخیره شد.
                      </p>
                      <Report
                        record={saved}
                        assessment={saved.assessment}
                        onNavigate={onNavigate}
                      />
                      <div className="screening-no-print mt-6 flex flex-wrap gap-3">
                        <button
                          className="screening-secondary"
                          onClick={() => setTab("history")}
                        >
                          مشاهده گزارش‌های من
                        </button>
                        <button
                          className="screening-secondary"
                          onClick={() => {
                            setAnswers({ ...emptyScreeningAnswers });
                            setConsent(false);
                            setSaved(undefined);
                            move(0);
                          }}
                        >
                          ارزیابی جدید
                        </button>
                      </div>
                    </>
                  )
                )}
              </section>
            </div>
          )}
          {tab === "history" && (
            <section className="screening-panel">
              <div className="mb-5 flex flex-wrap justify-between gap-3">
                <h2 className="text-xl font-bold">گزارش‌ها و پیگیری شخصی</h2>
                <button
                  className="screening-secondary"
                  disabled={historyLoading}
                  onClick={() => void loadHistory()}
                >
                  به‌روزرسانی
                </button>
              </div>
              <Feedback error={historyError} />
              {historyLoading ? (
                <p role="status">در حال دریافت گزارش‌ها…</p>
              ) : !historyError && !records.length ? (
                <p className="rounded-xl bg-slate-50 p-6 leading-8 text-slate-600">
                  هنوز گزارشی ثبت نکرده‌اید. از «ارزیابی جدید» شروع کنید.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {records.map((r) => (
                    <button
                      key={r.id}
                      className="screening-plan text-right"
                      onClick={() => setSelected(r)}
                    >
                      <span className="font-bold">
                        {r.assessment?.title || "گزارش علائم ثبت‌شده"}
                      </span>
                      <span className="mt-2 block text-sm text-slate-500">
                        {dateFa(r.createdAt)}
                      </span>
                      <span className="mt-3 block text-sm text-teal-700">
                        مشاهده جزئیات گزارش ←
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selected && (
                <div className="mt-8 border-t pt-6">
                  {selected.assessment ? (
                    <Report
                      record={selected}
                      assessment={selected.assessment}
                      onNavigate={onNavigate}
                    />
                  ) : (
                    <>
                      <h3 className="font-bold">
                        گزارش قبلی · بدون ارزیابی ساختاریافته
                      </h3>
                      <p className="mt-3 leading-8">
                        {selected.symptoms.join("؛ ")}
                      </p>
                      <p className="break-words leading-8">{selected.notes}</p>
                    </>
                  )}
                </div>
              )}
            </section>
          )}
          {tab === "education" && (
            <section className="screening-panel">
              <Education />
            </section>
          )}
        </>
      )}
      <footer className="screening-panel">
        <h2 className="mb-3 font-bold">منابع و حدود این راهنما</h2>
        <p className="mb-4 text-xs leading-7 text-slate-500">
          بازبینی منابع: ۱۳ اکتبر ۲۰۲۶. این ابزار از قواعد قابل توضیح استفاده
          می‌کند؛ الگوریتم تشخیص هوش مصنوعی یا مدل اعتبارسنجی‌شده محاسبه خطر
          سرطان ندارد. توصیه‌های نهایی مرجع مبنا هستند؛ پیش‌نویس‌ها به‌عنوان
          توصیه قطعی استفاده نشده‌اند.
        </p>
        <div className="flex flex-wrap gap-3">
          {screeningSources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs leading-7 text-teal-800 underline underline-offset-4"
            >
              {s.title}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
