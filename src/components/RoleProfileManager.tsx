import React from "react";
import type { UserRole } from "../types";
import { ProfileForm } from "../features/profile/ProfileForm";
interface Props {
  currentRole: UserRole;
  currentUserName: string;
  onUpdateName?: (name: string) => void;
  onNavigate?: (view: string) => void;
  isEmbedded?: boolean;
}
export function RoleProfileManager({
  currentRole,
  onUpdateName,
  isEmbedded = false,
}: Props) {
  return (
    <section
      className={
        isEmbedded
          ? ""
          : "mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"
      }
    >
      <ProfileForm role={currentRole} onUpdateName={onUpdateName} />
    </section>
  );
}
