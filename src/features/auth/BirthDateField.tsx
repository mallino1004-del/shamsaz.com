import { useState } from "react";
import { persianDateParts, persianDateToISO } from "../../../shared/calendar";
import { controlClass } from "./AuthControls";
const months = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
export function BirthDateField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const initial = persianDateParts(value);
  const [parts, setParts] = useState({
    year: initial ? String(initial.year) : "",
    month: initial ? String(initial.month) : "",
    day: initial ? String(initial.day) : "",
  });
  const [invalid, setInvalid] = useState(false);
  const currentYear = Number(
    new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
      timeZone: "Asia/Tehran",
      }).formatToParts(new Date()).find(part => part.type === 'year')!.value,
  );
  function choose(key: keyof typeof parts, value: string) {
    const next = { ...parts, [key]: value };
    setParts(next);
    const iso =
      next.year && next.month && next.day
        ? persianDateToISO(
            Number(next.year),
            Number(next.month),
            Number(next.day),
          )
        : null;
    setInvalid(!!next.year && !!next.month && !!next.day && !iso);
    onChange(iso || "");
  }
  return (
    <div>
      <div
        className="grid grid-cols-[1fr_1.25fr_.8fr] gap-2"
        role="group"
        aria-label="تاریخ تولد شمسی"
      >
        <select
          className={controlClass}
          aria-label="سال تولد"
          value={parts.year}
          disabled={disabled}
          onChange={(e) => choose("year", e.target.value)}
        >
          <option value="">سال</option>
          {Array.from({ length: 121 }, (_, index) => currentYear - index).map(
            (year) => (
              <option key={year} value={year}>
                {year.toLocaleString("fa-IR", { useGrouping: false })}
              </option>
            ),
          )}
        </select>
        <select
          className={controlClass}
          aria-label="ماه تولد"
          value={parts.month}
          disabled={disabled}
          onChange={(e) => choose("month", e.target.value)}
        >
          <option value="">ماه</option>
          {months.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
        <select
          className={controlClass}
          aria-label="روز تولد"
          value={parts.day}
          disabled={disabled}
          onChange={(e) => choose("day", e.target.value)}
        >
          <option value="">روز</option>
          {Array.from(
            { length: parts.month && Number(parts.month) > 6 ? 30 : 31 },
            (_, index) => index + 1,
          ).map((day) => (
            <option key={day} value={day}>
              {day.toLocaleString("fa-IR")}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-slate-500">تاریخ شمسی مطابق شناسنامه</p>
      {invalid && (
        <p role="alert" className="mt-2 text-xs text-rose-700">
          روز انتخاب‌شده در این ماه و سال وجود ندارد.
        </p>
      )}
    </div>
  );
}
