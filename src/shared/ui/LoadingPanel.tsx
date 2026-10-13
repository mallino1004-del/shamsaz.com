export function LoadingPanel() {
  return (
    <div
      role="status"
      className="mx-auto flex min-h-64 max-w-7xl items-center justify-center gap-3 px-4 text-sm text-slate-600"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      در حال دریافت اطلاعات…
    </div>
  );
}
