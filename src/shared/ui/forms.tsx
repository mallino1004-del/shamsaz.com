import React, { useId } from "react";
export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500";
export const buttonClass =
  "rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50";
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactElement;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      {React.cloneElement(
        children as React.ReactElement<{
          id?: string;
          "aria-describedby"?: string;
        }>,
        { id, "aria-describedby": hint ? `${id}-hint` : undefined },
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800"
        >
          {success}
        </p>
      )}
    </>
  );
}
