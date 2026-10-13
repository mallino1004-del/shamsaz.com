/** Transparent care-navigation rules; not a cancer probability or diagnostic model. */
export const SCREENING_VERSION = "care-navigation-2026-10-v1";
export const screeningSources = [
  {
    title: "USPSTF · غربالگری پستان، ۲۰۲۴",
    url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening",
  },
  {
    title: "USPSTF · توصیه نهایی دهانه رحم، ۲۰۱۸ (در حال بازنگری)",
    url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening",
  },
  {
    title: "NCI · غربالگری تخمدان",
    url: "https://www.cancer.gov/types/ovarian/patient/ovarian-screening-pdq",
  },
  {
    title: "NCI · غربالگری آندومتر",
    url: "https://www.cancer.gov/types/uterine/endometrial/screening",
  },
  {
    title: "NCI · عوامل خطر پستان",
    url: "https://www.cancer.gov/types/breast/causes-risk-factors",
  },
];
export const symptomOptions = [
  { id: "breast_lump", organ: "breast", label: "توده جدید در پستان یا زیربغل" },
  {
    id: "breast_skin",
    organ: "breast",
    label: "تغییر تازه پوست یا فرورفتگی نوک پستان",
  },
  {
    id: "breast_discharge",
    organ: "breast",
    label: "ترشح خودبه‌خودی خونی از نوک پستان",
  },
  { id: "breast_pain", organ: "breast", label: "درد جدید یا مداوم پستان" },
  {
    id: "postmenopausal_bleeding",
    organ: "endometrium",
    label: "خون‌ریزی پس از یائسگی",
  },
  {
    id: "irregular_bleeding",
    organ: "cervix",
    label: "خون‌ریزی بین قاعدگی‌ها یا پس از رابطه",
  },
  { id: "discharge", organ: "cervix", label: "ترشح واژینال غیرمعمول یا خونی" },
  { id: "bloating", organ: "ovary", label: "نفخ جدید و مداوم" },
  { id: "early_satiety", organ: "ovary", label: "سیری زودرس یا کاهش اشتها" },
  { id: "pelvic_pain", organ: "ovary", label: "درد مداوم شکم یا لگن" },
  { id: "urinary_change", organ: "ovary", label: "تکرر یا فوریت جدید ادرار" },
  { id: "weight_loss", organ: "general", label: "کاهش وزن ناخواسته" },
  {
    id: "heavy_bleeding",
    organ: "emergency",
    label: "خون‌ریزی شدید همراه ضعف، غش یا سرگیجه شدید",
  },
  {
    id: "severe_pain",
    organ: "emergency",
    label: "درد ناگهانی و شدید شکم یا لگن",
  },
] as const;
export type SymptomId = (typeof symptomOptions)[number]["id"];
export type Answer = "yes" | "no" | "unknown";
export interface ScreeningAnswers {
  age: number;
  menopause: "pre" | "post" | "unknown";
  cervix: Answer;
  pregnant: Answer;
  familyHistory: Answer;
  genetic: "none" | "brca" | "lynch" | "other" | "unknown";
  personalHistory: Answer;
  immunosuppressed: Answer;
  chestRadiation: Answer;
  symptoms: SymptomId[];
  noSymptoms: boolean;
  duration: "none" | "new" | "persistent" | "unknown";
  mammogramDate: string;
  mammogramResult: "normal" | "abnormal" | "unknown";
  cervicalDate: string;
  cervicalType: "pap" | "hpv" | "cotest" | "unknown";
  cervicalResult: "normal" | "abnormal" | "unknown";
  hpvVaccine: "complete" | "partial" | "no" | "unknown";
  notes: string;
}
export const emptyScreeningAnswers: ScreeningAnswers = {
  age: 0,
  menopause: "unknown",
  cervix: "unknown",
  pregnant: "unknown",
  familyHistory: "unknown",
  genetic: "unknown",
  personalHistory: "unknown",
  immunosuppressed: "unknown",
  chestRadiation: "unknown",
  symptoms: [],
  noSymptoms: false,
  duration: "unknown",
  mammogramDate: "",
  mammogramResult: "unknown",
  cervicalDate: "",
  cervicalType: "unknown",
  cervicalResult: "unknown",
  hpvVaccine: "unknown",
  notes: "",
};
export interface ScreeningPlan {
  organ: string;
  title: string;
  state: "review" | "due" | "scheduled" | "individual" | "education";
  text: string;
  nextDate?: string;
}
export interface ScreeningAssessment {
  version: string;
  evaluatedAt: string;
  triageLevel: "emergency" | "urgent" | "routine";
  title: string;
  action: string;
  reasons: string[];
  plans: ScreeningPlan[];
}
export interface SavedScreening {
  patientName?: string;
  id: string;
  createdAt: string;
  symptoms: string[];
  notes: string;
  triageLevel: string;
  answers?: ScreeningAnswers;
  assessment?: ScreeningAssessment;
}
export function validateScreeningAnswers(
  value: unknown,
  today = new Date().toISOString().slice(0, 10),
): string[] {
  const b = value as ScreeningAnswers | null;
  if (!b || typeof b !== "object") return ["اطلاعات فرم معتبر نیست."];
  const errors: string[] = [];
  if (!Number.isInteger(b.age) || b.age < 18 || b.age > 110)
    errors.push("سن باید بین ۱۸ تا ۱۱۰ سال باشد.");
  const enums: Record<string, readonly string[]> = {
    menopause: ["pre", "post", "unknown"],
    cervix: ["yes", "no", "unknown"],
    pregnant: ["yes", "no", "unknown"],
    familyHistory: ["yes", "no", "unknown"],
    genetic: ["none", "brca", "lynch", "other", "unknown"],
    personalHistory: ["yes", "no", "unknown"],
    immunosuppressed: ["yes", "no", "unknown"],
    duration: ["none", "new", "persistent", "unknown"],
    mammogramResult: ["normal", "abnormal", "unknown"],
    chestRadiation: ["yes", "no", "unknown"],
    cervicalType: ["pap", "hpv", "cotest", "unknown"],
    cervicalResult: ["normal", "abnormal", "unknown"],
    hpvVaccine: ["complete", "partial", "no", "unknown"],
  };
  for (const [key, values] of Object.entries(enums))
    if (!values.includes((b as unknown as Record<string, string>)[key]))
      errors.push("پاسخ پرسش‌های سلامت کامل یا معتبر نیست.");
  if (
    !Array.isArray(b.symptoms) ||
    b.symptoms.length > symptomOptions.length ||
    b.symptoms.some((id) => !symptomOptions.some((s) => s.id === id)) ||
    new Set(b.symptoms).size !== b.symptoms.length
  )
    errors.push("فهرست علائم معتبر نیست.");
  if (
    typeof b.noSymptoms !== "boolean" ||
    (Array.isArray(b.symptoms) &&
      (b.noSymptoms ? b.symptoms.length !== 0 : b.symptoms.length === 0))
  )
    errors.push("علائم را انتخاب کنید یا نداشتن علائم را مشخص کنید.");
  if (b.noSymptoms && b.duration !== "none")
    errors.push("برای حالت بدون علامت، مدت علائم باید «بدون علامت» باشد.");
  if (
    Array.isArray(b.symptoms) &&
    b.symptoms.length > 0 &&
    b.duration === "none"
  )
    errors.push("مدت علائم را مشخص کنید.");
  for (const key of ["mammogramDate", "cervicalDate"] as const) {
    const v = b[key];
    if (
      typeof v !== "string" ||
      (v &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
          Number.isNaN(Date.parse(v)) ||
          new Date(v).toISOString().slice(0, 10) !== v ||
          v > today ||
          v < "1900-01-01"))
    )
      errors.push("تاریخ آزمایش باید تاریخ معتبر گذشته باشد.");
  }
  if (b.mammogramResult !== "unknown" && !b.mammogramDate)
    errors.push("تاریخ ماموگرافی را وارد کنید.");
  if (
    b.cervicalResult !== "unknown" &&
    (!b.cervicalDate || b.cervicalType === "unknown")
  )
    errors.push("تاریخ و نوع آزمایش دهانه رحم را وارد کنید.");
  if (typeof b.notes !== "string" || b.notes.length > 2000)
    errors.push("توضیحات حداکثر ۲۰۰۰ نویسه است.");
  return [...new Set(errors)];
}
function anniversary(date: string, years: number) {
  const [y, m, d] = date.split("-").map(Number);
  const last = new Date(Date.UTC(y + years, m, 0)).getUTCDate();
  return `${y + years}-${String(m).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}
export function assessScreening(
  b: ScreeningAnswers,
  now = new Date(),
): ScreeningAssessment {
  const today = now.toISOString().slice(0, 10);
  const reasons: string[] = [];
  const emergency = b.symptoms.some(
    (id) => id === "heavy_bleeding" || id === "severe_pain",
  );
  if (emergency)
    reasons.push(
      "علائم شدید گزارش شده‌اند؛ تکمیل غربالگری یا انتظار برای رزرو نباید مراجعه فوری را به تأخیر بیندازد.",
    );
  if (b.symptoms.length && !emergency)
    reasons.push(
      "وجود علائم نیازمند معاینه و بررسی تشخیصی است؛ زمان‌بندی غربالگری جایگزین آن نیست.",
    );
  if (b.mammogramResult === "abnormal" || b.cervicalResult === "abnormal")
    reasons.push("نتیجه غیرطبیعی قبلی باید طبق توصیه پزشک پیگیری شود.");
  const triageLevel = emergency
    ? "emergency"
    : b.symptoms.length || reasons.length
      ? "urgent"
      : "routine";
  const breastSpecial =
    b.genetic === "brca" ||
    b.genetic === "other" ||
    b.familyHistory === "yes" ||
    b.personalHistory === "yes" ||
    b.pregnant === "yes" ||
    b.chestRadiation === "yes";
  const cervixSpecial =
    b.personalHistory === "yes" || b.immunosuppressed === "yes";
  if (breastSpecial || cervixSpecial || b.genetic === "lynch")
    reasons.push(
      "سوابق فردی یا خانوادگی نیازمند برنامه اختصاصی پزشک و در صورت لزوم مشاوره ژنتیک است.",
    );
  const plans: ScreeningPlan[] = [];
  if (
    b.symptoms.some(
      (id) => symptomOptions.find((s) => s.id === id)?.organ === "breast",
    ) ||
    b.mammogramResult === "abnormal"
  )
    plans.push({
      organ: "breast",
      title: "پستان",
      state: "review",
      text: "برای معاینه پستان و تعیین بررسی مناسب، در اولین فرصت با پزشک هماهنگ کنید؛ نتیجه قبلی را همراه ببرید.",
    });
  else if (
    breastSpecial ||
    b.personalHistory === "unknown" ||
    b.familyHistory === "unknown" ||
    b.genetic === "unknown" ||
    b.pregnant === "unknown" ||
    b.chestRadiation === "unknown" ||
    (b.mammogramDate && b.mammogramResult === "unknown") ||
    b.age > 74
  )
    plans.push({
      organ: "breast",
      title: "پستان",
      state: "individual",
      text: "برای تعیین برنامه پستان، سوابق نامشخص یا شرایط اختصاصی باید با پزشک بررسی شود.",
    });
  else if (b.age < 40)
    plans.push({
      organ: "breast",
      title: "پستان",
      state: "education",
      text: "در راهنمای مرجع برای افراد بدون علامت و با خطر معمول زیر ۴۰ سال، ماموگرافی دوره‌ای روتین توصیه نشده؛ علائم تازه را پیگیری کنید.",
    });
  else {
    const nextDate =
      b.mammogramDate && b.mammogramResult === "normal"
        ? anniversary(b.mammogramDate, 2)
        : undefined;
    plans.push({
      organ: "breast",
      title: "پستان",
      state: nextDate && nextDate > today ? "scheduled" : "due",
      nextDate,
      text:
        nextDate && nextDate > today
          ? "طبق راهنمای مرجع، زمان پیشنهادی گفت‌وگو درباره ماموگرافی بعدی مشخص است."
          : "برای برنامه‌ریزی ماموگرافی با پزشک گفت‌وگو کنید؛ راهنمای مرجع برای خطر معمول ۴۰ تا ۷۴ سال، فاصله دو سال را پیشنهاد می‌کند.",
    });
  }
  if (
    b.symptoms.some((id) =>
      ["cervix", "endometrium"].includes(
        symptomOptions.find((s) => s.id === id)?.organ || "",
      ),
    ) ||
    b.cervicalResult === "abnormal"
  )
    plans.push({
      organ: "cervix",
      title: "دهانه رحم",
      state: "review",
      text: "خون‌ریزی یا ترشح غیرمعمول و آزمایش غیرطبیعی نیازمند ارزیابی متخصص زنان است؛ به موعد غربالگری اکتفا نکنید.",
    });
  else if (
    b.cervix === "no" ||
    b.cervix === "unknown" ||
    cervixSpecial ||
    b.personalHistory === "unknown" ||
    b.immunosuppressed === "unknown" ||
    (b.cervicalDate &&
      (b.cervicalResult === "unknown" || b.cervicalType === "unknown")) ||
    b.age > 65
  )
    plans.push({
      organ: "cervix",
      title: "دهانه رحم",
      state: "individual",
      text: "وجود دهانه رحم، سوابق ضایعات و کفایت آزمایش‌های قبلی باید مشخص شود؛ توقف یا ادامه غربالگری را پزشک تعیین می‌کند.",
    });
  else if (b.age < 21)
    plans.push({
      organ: "cervix",
      title: "دهانه رحم",
      state: "education",
      text: "راهنمای مرجع برای فرد بدون علامت و خطر معمول زیر ۲۱ سال غربالگری روتین توصیه نمی‌کند.",
    });
  else {
    const compatible = b.age >= 30 || b.cervicalType === "pap";
    const years = b.cervicalType === "pap" ? 3 : 5;
    const nextDate =
      b.cervicalDate &&
      b.cervicalResult === "normal" &&
      b.cervicalType !== "unknown" &&
      compatible
        ? anniversary(b.cervicalDate, years)
        : undefined;
    plans.push({
      organ: "cervix",
      title: "دهانه رحم",
      state: nextDate && nextDate > today ? "scheduled" : "due",
      nextDate,
      text:
        b.age < 30
          ? "برای خطر معمول ۲۱ تا ۲۹ سال، راهنمای مرجع پاپ‌اسمیر هر سه سال را پیشنهاد می‌کند."
          : "برای خطر معمول ۳۰ تا ۶۵ سال، پاپ‌اسمیر هر سه سال یا HPV پرخطر / آزمایش ترکیبی هر پنج سال از گزینه‌های راهنمای مرجع است.",
    });
  }
  plans.push({
    organ: "ovary",
    title: "تخمدان",
    state:
      b.genetic === "brca" || b.genetic === "lynch" || b.familyHistory === "yes"
        ? "individual"
        : b.symptoms.some(
              (id) =>
                symptomOptions.find((s) => s.id === id)?.organ === "ovary",
            )
          ? "review"
          : "education",
    text: "برای فرد بدون علامت و خطر معمول، CA-125 یا سونوگرافی برای غربالگری روتین توصیه نمی‌شود. علائم مداوم یا سابقه ارثی نیازمند بررسی پزشک است.",
  });
  plans.push({
    organ: "endometrium",
    title: "رحم و آندومتر",
    state:
      b.symptoms.includes("postmenopausal_bleeding") ||
      b.symptoms.includes("irregular_bleeding")
        ? "review"
        : b.genetic === "lynch"
          ? "individual"
          : "education",
    text: "غربالگری روتین استاندارد برای فرد بدون علامت وجود ندارد. هر خون‌ریزی پس از یائسگی باید بررسی شود؛ سابقه سندرم لینچ برنامه اختصاصی می‌خواهد.",
  });
  return {
    version: SCREENING_VERSION,
    evaluatedAt: now.toISOString(),
    triageLevel,
    title: emergency
      ? "مراجعه فوری"
      : triageLevel === "urgent"
        ? "نیاز به بررسی پزشکی"
        : "برنامه پیشگیری و پیگیری",
    action: emergency
      ? "همین حالا به اورژانس مراجعه کنید؛ در ایران می‌توانید با ۱۱۵ تماس بگیرید."
      : triageLevel === "urgent"
        ? "در اولین فرصت برای معاینه و بررسی نتیجه‌ها با پزشک هماهنگ کنید."
        : "برنامه پیشنهادی را با پزشک تطبیق دهید؛ اطلاعات نامشخص را تکمیل کنید.",
    reasons,
    plans,
  };
}
