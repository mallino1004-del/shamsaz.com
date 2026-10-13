import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  HeartPulse,
  Hospital,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  ClipboardList,
  ScanLine,
  Video,
  ChartNoAxesCombined,
  UserRound,
  Settings2,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "../../../shared/contracts";
import "./page-banner.css";

interface BannerDesign {
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  icon: LucideIcon;
  tone: "jade" | "rose" | "blue" | "violet" | "gold";
  motif: "care" | "orbit" | "grid";
  tags: string[];
  action?: { label: string; view: string };
}
const designs: Record<string, BannerDesign> = {
  home: {
    image: "home",
    eyebrow: "شمساز · همراه مسیر مراقبت",
    title: "مراقبت، با آگاهی",
    accent: "و همراهی آغاز می‌شود.",
    description:
      "پزشک مناسب خود را پیدا کنید، درخواست ویزیت بدهید و مسیر مراقبت را در فضای شخصی خود دنبال کنید.",
    icon: HeartHandshake,
    tone: "jade",
    motif: "care",
    tags: ["سلامت زنان", "انتخاب آگاهانه", "همراهی در مراقبت"],
    action: { label: "پیداکردن پزشک و رزرو ویزیت", view: "doctors" },
  },
  doctors: {
    image: "doctors",
    eyebrow: "راهنمای پزشکان تهران",
    title: "انتخاب آگاهانهٔ پزشک،",
    accent: "قدم بعدی شماست.",
    description:
      "متخصصان سرطان‌های زنان و پستان را بر اساس تخصص جست‌وجو کنید و درخواست ویزیت خود را ثبت کنید.",
    icon: Stethoscope,
    tone: "jade",
    motif: "orbit",
    tags: ["تخصص‌های مرتبط", "نشانی و تماس", "رزرو ویزیت"],
  },
  centers: {
    image: "centers",
    eyebrow: "راهنمای مراکز درمانی تهران",
    title: "بیمارستان‌ها و داروخانه‌ها،",
    accent: "در دو مسیر مستقل.",
    description:
      "بخش بیمارستان‌ها و بخش داروخانه‌ها را جداگانه مرور کنید؛ هر گروه جست‌وجو و فیلترهای مخصوص خود را دارد.",
    icon: Hospital,
    tone: "blue",
    motif: "grid",
    tags: ["بیمارستان‌ها", "داروخانه‌ها", "راهنمای مراجعه"],
  },
  articles: {
    image: "education",
    eyebrow: "دانش و آگاهی سلامت",
    title: "آگاهی بیشتر،",
    accent: "پرسش‌های روشن‌تر.",
    description:
      "مطالب سلامت زنان را بخوانید و با آمادگی بیشتری دربارهٔ مراقبت خود با تیم درمان گفت‌وگو کنید.",
    icon: BookOpen,
    tone: "rose",
    motif: "care",
    tags: ["مطالعه", "آگاهی", "گفت‌وگو با پزشک"],
  },
  login: {
    image: "login",
    eyebrow: "حساب شمساز",
    title: "خوش آمدید؛",
    accent: "مسیرتان را ادامه دهید.",
    description: "به نوبت‌ها، اطلاعات و فضای شخصی مراقبت خود دسترسی پیدا کنید.",
    icon: ShieldCheck,
    tone: "jade",
    motif: "orbit",
    tags: ["ورود به حساب"],
  },
  register: {
    image: "register",
    eyebrow: "عضویت در شمساز",
    title: "همراهی تازه،",
    accent: "از یک حساب شروع می‌شود.",
    description: "حساب خود را بسازید و اولین قدم مدیریت مراقبت را بردارید.",
    icon: HeartHandshake,
    tone: "rose",
    motif: "care",
    tags: ["بیمار", "تیم درمان"],
  },
  "forgot-password": {
    image: "recovery",
    eyebrow: "بازیابی دسترسی",
    title: "دوباره به",
    accent: "حساب خود برگردید.",
    description: "با ایمیل حساب، مسیر بازیابی رمز عبور را آغاز کنید.",
    icon: ShieldCheck,
    tone: "blue",
    motif: "orbit",
    tags: ["بازیابی رمز"],
  },
  "reset-password": {
    image: "recovery",
    eyebrow: "رمز عبور تازه",
    title: "یک شروع تازه،",
    accent: "برای دسترسی دوباره.",
    description: "رمز جدید خود را انتخاب کنید و به مسیر مراقبت برگردید.",
    icon: ShieldCheck,
    tone: "violet",
    motif: "grid",
    tags: ["تغییر رمز عبور"],
  },
  "patient-dashboard": {
    image: "patient-dashboard",
    eyebrow: "فضای شخصی بیمار",
    title: "مسیر مراقبت شما،",
    accent: "با نظم و آرامش.",
    description:
      "نوبت‌ها، درخواست‌های ویزیت و اطلاعات مراقبت خود را در یک فضای شخصی دنبال کنید.",
    icon: HeartPulse,
    tone: "jade",
    motif: "care",
    tags: ["پیگیری نوبت", "اطلاعات شخصی", "همراهی"],
  },
  "doctor-dashboard": {
    image: "doctor-dashboard",
    eyebrow: "فضای حرفه‌ای پزشک",
    title: "تمرکز بر بیمار،",
    accent: "نظم در مراقبت.",
    description:
      "نوبت‌ها و مستندسازی بالینی را در فضای کار تخصصی خود مدیریت کنید.",
    icon: Stethoscope,
    tone: "blue",
    motif: "orbit",
    tags: ["نوبت‌ها", "مستندسازی", "تیم درمان"],
  },
  "admin-dashboard": {
    image: "admin-dashboard",
    eyebrow: "مدیریت مرکز درمانی",
    title: "تیمی هماهنگ،",
    accent: "مراقبتی منظم‌تر.",
    description:
      "اعضای تیم، پذیرش بیماران و برنامه‌های مرکز را در فضای مدیریت دنبال کنید.",
    icon: Users,
    tone: "gold",
    motif: "grid",
    tags: ["تیم مرکز", "پذیرش", "برنامه‌ریزی"],
  },
  "national-dashboard": {
    image: "national-dashboard",
    eyebrow: "نمای تجمیعی شبکه",
    title: "دیدی گسترده‌تر،",
    accent: "برای برنامه‌ریزی آگاهانه.",
    description:
      "شاخص‌های تجمیعی فعالیت و مسیر مراقبت را در نمای نظارتی مرور کنید.",
    icon: ChartNoAxesCombined,
    tone: "violet",
    motif: "grid",
    tags: ["نمای تجمیعی", "پایش فعالیت", "برنامه‌ریزی"],
  },
  appointments: {
    image: "appointments",
    eyebrow: "نوبت‌ها و درخواست‌های ویزیت",
    title: "برای قدم بعدی،",
    accent: "زمان بگذارید.",
    description:
      "درخواست‌های ویزیت و زمان‌های مراجعه را مرور، پیگیری و مدیریت کنید.",
    icon: CalendarDays,
    tone: "jade",
    motif: "orbit",
    tags: ["روز مراجعه", "پیگیری درخواست", "هماهنگی با مرکز"],
  },
  screening: {
    image: "screening",
    eyebrow: "غربالگری هوشمند سلامت زنان",
    title: "به نشانه‌های بدن،",
    accent: "با دقت گوش کنید.",
    description:
      "سوابق سلامت، علائم و آزمایش‌های قبلی را مرور کنید؛ گزارش شخصی و برنامه پیگیری خود را برای مراجعه آماده کنید.",
    icon: ScanLine,
    tone: "rose",
    motif: "care",
    tags: ["چهار حوزه سلامت", "برنامه پیگیری", "گزارش شخصی"],
  },
  registry: {
    image: "registry",
    eyebrow: "رجیستری و ثبت پرونده",
    title: "هر پرونده،",
    accent: "بخشی از مسیر مراقبت.",
    description:
      "اطلاعات پرونده‌های سرطان را در چارچوب دسترسی مرکز، منظم ثبت و پیگیری کنید.",
    icon: ClipboardList,
    tone: "blue",
    motif: "grid",
    tags: ["ثبت اطلاعات", "پرونده مرکز", "پیگیری"],
  },
  clinical: {
    image: "clinical",
    eyebrow: "مستندسازی بالینی",
    title: "جزئیات دقیق،",
    accent: "برای ادامهٔ مراقبت.",
    description:
      "یادداشت‌های بالینی، برنامهٔ مراقبت و پیش‌نویس نسخه را در فضای تخصصی پزشک ثبت کنید.",
    icon: Stethoscope,
    tone: "jade",
    motif: "orbit",
    tags: ["یادداشت بالینی", "برنامهٔ مراقبت", "پیش‌نویس نسخه"],
  },
  organization: {
    image: "organization",
    eyebrow: "هماهنگی مرکز درمانی",
    title: "همراهی یک تیم،",
    accent: "از نظم آغاز می‌شود.",
    description:
      "عضویت تیم، درخواست‌های حرفه‌ای و برنامهٔ فعالیت مرکز را مدیریت کنید.",
    icon: Settings2,
    tone: "gold",
    motif: "grid",
    tags: ["اعضای تیم", "درخواست عضویت", "برنامهٔ مرکز"],
  },
  profile: {
    image: "profile",
    eyebrow: "اطلاعات و حساب شما",
    title: "شناخت بهتر شما،",
    accent: "آغاز همراهی بهتر.",
    description:
      "اطلاعات فردی و تماس خود را به‌روز نگه دارید تا پیگیری مراقبت ساده‌تر شود.",
    icon: UserRound,
    tone: "jade",
    motif: "care",
    tags: ["اطلاعات فردی", "راه‌های تماس", "حساب کاربری"],
  },
  "tumor-board": {
    image: "tumor-board",
    eyebrow: "هیئت چندتخصصی تومور",
    title: "نگاه‌های تخصصی،",
    accent: "در کنار یکدیگر.",
    description:
      "پرونده‌ها، جلسه‌ها و تصمیم‌های تیم چندتخصصی را در فضای همکاری مرکز دنبال کنید.",
    icon: Users,
    tone: "violet",
    motif: "orbit",
    tags: ["هم‌اندیشی", "بررسی پرونده", "تصمیم تیمی"],
  },
  telemedicine: {
    image: "telemedicine",
    eyebrow: "مسیر مشاوره از راه دور",
    title: "نزدیک‌تر به مراقبت،",
    accent: "از هرجا که هستید.",
    description:
      "درخواست ویزیت آنلاین را ثبت و شرایط ارائهٔ خدمت را با مطب یا مرکز هماهنگ کنید.",
    icon: Video,
    tone: "blue",
    motif: "orbit",
    tags: ["درخواست مشاوره", "هماهنگی با مرکز", "پیگیری"],
  },
};
const roleDesigns: Record<UserRole, string> = {
  patient: "patient-dashboard",
  doctor: "doctor-dashboard",
  registry_clerk: "registry",
  clinic_admin: "admin-dashboard",
  national_supervisor: "national-dashboard",
};
const homeSlides: { label: string; design: BannerDesign }[] = [
  { label: "پزشک و رزرو ویزیت", design: designs.home },
  {
    label: "پیگیری نوبت‌ها",
    design: {
      ...designs.appointments,
      action: { label: "مشاهدهٔ نوبت‌ها و درخواست‌ها", view: "appointments" },
    },
  },
  {
    label: "ثبت و پیگیری علائم",
    design: {
      ...designs.screening,
      action: { label: "ثبت گزارش علائم", view: "screening" },
    },
  },
  {
    label: "آموزش سلامت زنان",
    design: {
      ...designs.articles,
      action: { label: "مطالعهٔ مطالب سلامت", view: "articles" },
    },
  },
  {
    label: "حساب و فضای شخصی",
    design: {
      ...designs.register,
      title: "فضای شخصی شما،",
      accent: "همراه مسیر مراقبت.",
      description:
        "برای پیگیری درخواست‌های ویزیت و مدیریت اطلاعات خود، حساب شمساز بسازید.",
      tags: ["ثبت‌نام", "اطلاعات شخصی", "پیگیری مراقبت"],
      action: { label: "ساخت حساب شمساز", view: "register" },
    },
  },
  {
    label: "رجیستری سرطان",
    design: {
      ...designs.registry,
      tags: ["ویژهٔ تیم درمان", "ثبت پرونده", "پیگیری مرکز"],
      action: { label: "ورود به فضای رجیستری", view: "registry" },
    },
  },
  {
    label: "هیئت چندتخصصی تومور",
    design: {
      ...designs["tumor-board"],
      tags: ["ویژهٔ تیم درمان", "هم‌اندیشی", "تصمیم تیمی"],
      action: { label: "مشاهدهٔ فضای هیئت تومور", view: "tumor-board" },
    },
  },
  {
    label: "مستندسازی بالینی",
    design: {
      ...designs.clinical,
      tags: ["ویژهٔ پزشک", "یادداشت بالینی", "برنامهٔ مراقبت"],
      action: { label: "ورود به فضای بالینی", view: "clinical" },
    },
  },
];
const HOME_SLIDE_DURATION = 7000;
export function getBannerDesign(view: string, role?: UserRole) {
  const aliases: Record<string, string> = {
    "medical-centers": "centers",
    hospitals: "centers",
    pharmacies: "centers",
    auth: "login",
    "patient-portal": "patient-dashboard",
    "doctor-portal": "doctor-dashboard",
  };
  const key =
    [
      "dashboard",
      "patient-portal",
      "doctor-portal",
      "national-dashboard",
    ].includes(view) && role
      ? roleDesigns[role]
      : view === "dashboard"
        ? roleDesigns.patient
        : (aliases[view] ?? view);
  return {
    key,
    design: designs[key] ?? designs[roleDesigns[role ?? "patient"]],
  };
}
export function PageBanner({
  view,
  role,
  onNavigate,
}: {
  view: string;
  role?: UserRole;
  onNavigate: (view: string) => void;
}) {
  const { key, design: pageDesign } = getBannerDesign(view, role);
  const [slide, setSlide] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const design = key === "home" ? homeSlides[slide].design : pageDesign;
  const compact = [
    "login",
    "register",
    "forgot-password",
    "reset-password",
  ].includes(key);
  const [paused, setPaused] = useState(() => {
    try {
      return (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        localStorage.getItem("shamsaz:banner-paused") === "true"
      );
    } catch {
      return false;
    }
  });
  const Icon = design.icon;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => setReducedMotion(media.matches);
    const visibilityChanged = () => setHidden(document.hidden);
    media.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      media.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);
  useEffect(() => {
    if (
      key !== "home" ||
      paused ||
      interacting ||
      focused ||
      hidden ||
      reducedMotion
    )
      return;
    const timer = window.setTimeout(
      () => setSlide((current) => (current + 1) % homeSlides.length),
      HOME_SLIDE_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [key, slide, paused, interacting, focused, hidden, reducedMotion]);
  useEffect(() => {
    if (key !== "home") return;
    const nextImage = new Image();
    nextImage.src = `/assets/banners/${homeSlides[(slide + 1) % homeSlides.length].design.image}.jpg`;
  }, [key, slide]);
  function changeSlide(next: number) {
    setSlide((next + homeSlides.length) % homeSlides.length);
  }
  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    if (!next) {
      setFocused(false);
      setInteracting(false);
    }
    try {
      localStorage.setItem("shamsaz:banner-paused", String(next));
    } catch {
      /* The local preference is optional. */
    }
  }
  return (
    <section
      aria-label={
        key === "home"
          ? "اسلایدهای معرفی امکانات شمساز"
          : `بنر ${design.eyebrow}`
      }
      aria-roledescription={key === "home" ? "نمایش اسلاید" : undefined}
      data-home-slide={key === "home" ? slide : undefined}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (key !== "home") return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          changeSlide(slide + 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          changeSlide(slide - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          changeSlide(0);
        } else if (event.key === "End") {
          event.preventDefault();
          changeSlide(homeSlides.length - 1);
        }
      }}
      data-page-banner={key}
      data-banner-motion={paused ? "paused" : "playing"}
      className={`page-banner page-banner--${design.tone} ${compact ? "page-banner--compact" : ""} ${key === "home" ? "page-banner--home" : ""} ${paused ? "page-banner--paused" : ""}`}
    >
      <div className="page-banner__frame">
        <div className="page-banner__scene" aria-hidden="true">
          <img
            key={design.image}
            data-banner-image={design.image}
            src={`/assets/banners/${design.image}.jpg`}
            alt=""
            fetchPriority={key === "home" ? "high" : "auto"}
            decoding="async"
            width="1536"
            height="1024"
          />
          <div className="page-banner__scrim" />
        </div>
        <div
          className={`page-banner__graphics page-banner__graphics--${design.motif}`}
          aria-hidden="true"
        >
          <div className="page-banner__ring page-banner__ring--one" />
          <div className="page-banner__ring page-banner__ring--two" />
          <div className="page-banner__spark page-banner__spark--one" />
          <div className="page-banner__spark page-banner__spark--two" />
          <svg viewBox="0 0 380 100" className="page-banner__trace" fill="none">
            <path
              d={
                design.motif === "care"
                  ? "M0 52H76L94 35L115 72L136 15L155 68L174 45H250Q290 44 310 57T380 52"
                  : design.motif === "grid"
                    ? "M0 80C60 80 60 48 125 48S195 18 245 18S320 48 380 8"
                    : "M0 70C85 70 72 15 146 15S210 90 282 70S340 14 380 28"
              }
            />
          </svg>
        </div>
        <div
          key={key === "home" ? slide : key}
          className="page-banner__copy"
          aria-live={key === "home" && (paused || focused) ? "polite" : "off"}
          aria-atomic="true"
        >
          <p className="page-banner__eyebrow">
            <span>
              <Icon size={15} />
            </span>
            {design.eyebrow}
          </p>
          <h2>
            {design.title}
            <span>{design.accent}</span>
          </h2>
          <p className="page-banner__description">{design.description}</p>
          {!compact && (
            <div className="page-banner__tags">
              {design.tags.map((tag) => (
                <span key={tag}>
                  <Sparkles size={11} />
                  {tag}
                </span>
              ))}
            </div>
          )}
          {design.action && (
            <button
              type="button"
              className="page-banner__action"
              onClick={() => onNavigate(design.action!.view)}
            >
              {design.action.label}
              <ArrowLeft size={17} />
            </button>
          )}
        </div>
        {!compact && (
          <div className="page-banner__signature" aria-hidden="true">
            <Icon size={21} />
            <span>
              شمساز<span>همراه مسیر مراقبت</span>
            </span>
          </div>
        )}
        {key === "home" && (
          <div
            className="page-banner__carousel-controls"
            aria-label="کنترل اسلایدها"
          >
            <button
              type="button"
              className="page-banner__slide-arrow"
              onClick={() => changeSlide(slide - 1)}
              aria-label="اسلاید قبلی"
            >
              <ChevronRight size={17} />
            </button>
            <div className="page-banner__slide-dots">
              {homeSlides.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`اسلاید ${(index + 1).toLocaleString("fa-IR")}: ${item.label}`}
                  aria-current={slide === index ? "true" : undefined}
                  onClick={() => changeSlide(index)}
                >
                  <span />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="page-banner__slide-arrow"
              onClick={() => changeSlide(slide + 1)}
              aria-label="اسلاید بعدی"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="page-banner__slide-number" aria-hidden="true">
              {(slide + 1).toLocaleString("fa-IR")} /{" "}
              {homeSlides.length.toLocaleString("fa-IR")}
            </span>
          </div>
        )}
        <button
          type="button"
          className="page-banner__motion"
          onClick={toggleMotion}
          aria-label={paused ? "پخش حرکت بنر" : "توقف حرکت بنر"}
          aria-pressed={paused}
          title={
            key === "home"
              ? paused
                ? "پخش خودکار اسلایدها"
                : "توقف پخش خودکار اسلایدها"
              : undefined
          }
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          <span>{paused ? "پخش حرکت" : "توقف حرکت"}</span>
        </button>
      </div>
    </section>
  );
}
