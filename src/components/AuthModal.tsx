import React, { useEffect, useRef } from "react";
import { X, Sun } from "lucide-react";
import { AuthForm } from "../features/auth/AuthForm";
import type { SessionUser } from "../shared/api/client";
import type { UserRole } from "../types";
export type AuthSuccessPayload = SessionUser;
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (
    role: UserRole,
    userName: string,
    payload?: AuthSuccessPayload,
  ) => void;
  initialTab?: "login" | "register";
}
export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else dialog.current?.close();
  }, [isOpen]);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const rect = dialog.current.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
      dir="rtl"
      aria-label={
        initialTab === "register" ? "ثبت‌نام در شمساز" : "ورود به شمساز"
      }
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-teal-800">
          <Sun size={22} />
          شمساز
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن فرم حساب"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-5 sm:p-7">
        {isOpen && (
          <AuthForm
            initialTab={initialTab}
            onSuccess={(user) => {
              onLoginSuccess(user.role, user.displayName, user);
              onClose();
            }}
          />
        )}
      </div>
    </dialog>
  );
}
