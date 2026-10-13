import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main dir="rtl" className="mx-auto max-w-xl space-y-5 p-8">
          <h1 className="text-xl font-bold">بارگذاری این بخش انجام نشد</h1>
          <p className="text-slate-600">
            صفحه را تازه کنید. اگر مشکل ادامه داشت، دوباره به صفحهٔ اصلی
            برگردید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-teal-700 px-5 py-3 text-white"
          >
            بارگذاری دوباره
          </button>
          <a
            href="/#home"
            onClick={() => window.location.assign("/#home")}
            className="mr-4 text-teal-700"
          >
            صفحهٔ اصلی
          </a>
        </main>
      );
    return this.props.children;
  }
}
