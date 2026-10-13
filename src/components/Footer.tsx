export function Footer({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <footer dir="rtl" className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 md:grid-cols-3">
        <section>
          <p className="text-xl font-black text-teal-800">شمساز</p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            سامانهٔ هماهنگی مراقبت و پروندهٔ سلامت زنان. نسخهٔ توسعه برای بررسی
            گردش‌کارها با داده‌های آزمایشی.
          </p>
        </section>
        <nav
          aria-label="دسترسی‌های پایین صفحه"
          className="grid content-start gap-3 text-sm text-slate-600"
        >
          {[
            { id: "home", label: "صفحهٔ اصلی" },
            { id: "doctors", label: "پزشکان" },
            { id: "dashboard", label: "فضای کار" },
            { id: "profile", label: "اطلاعات حساب" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="w-fit rounded-md text-right hover:text-teal-700"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <section className="text-sm leading-7 text-slate-500">
          <p className="font-bold text-slate-700">وضعیت خدمات</p>
          <p className="mt-3">
            نسخه‌ها و یادداشت‌های پزشک به صورت پیش‌نویس ثبت می‌شوند. اتصال بیمه،
            پیامک و تماس تصویری هنوز فعال نشده است.
          </p>
        </section>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400">
        ©{" "}
        {new Date().toLocaleDateString("fa-IR", {
          year: "numeric",
          timeZone: "Asia/Tehran",
        })}{" "}
        شمساز · نسخهٔ توسعه
      </div>
    </footer>
  );
}
