/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'نوبت‌دهی آنلاین در پلتفرم شمساز چگونه انجام می‌شود؟',
      a: 'شما می‌توانید با جستجوی نام پزشک یا تخصص مورد نظر، تقویم کاری پزشک را بررسی نمایید. پس از انتخاب روز و ساعت دلخواه، با وارد کردن کد ملی و شماره همراه، نوبت شما رزرو شده و کد رهگیری به همراه پیامک تاییدیه ارسال خواهد شد.'
    },
    {
      q: 'آیا نسخه الکترونیکی ویزیت آنلاین (تله‌مدیسین) در داروخانه‌ها معتبر است؟',
      a: 'بله، پزشک پس از پایان مشاوره تصویری، اقلام دارویی را با کد رهگیری اختصاصی در سامانه الکترونیک بیمه سلامت یا تأمین اجتماعی ثبت می‌کند. شما می‌توانید تنها با ارائه کد ملی در تمام داروخانه‌ها و مراکز تصویربرداری سراسر کشور، خدمات خود را دریافت نمایید.'
    },
    {
      q: 'شبکه ملی سرطان‌های زنان شامل چه بیماری‌هایی است و چه حمایتی می‌کند؟',
      a: 'فاز اول شبکه ملی شامل ۴ سرطان اصلی زنان: پستان، دهانه رحم، تخمدان و اندومتر است. این سامانه با ثبت یکپارچه داده‌های پاتولوژی، استیج‌بندی دقیق TNM و نظارت بر رژیم‌های درمانی، امکان پیگیری مستمر، مشاوره فوق‌تخصصی و تشکیل جلسات هیات تومور را برای بیماران فراهم می‌کند.'
    },
    {
      q: 'جلسه هیات مجازی تومور (MDT) چیست و چه زمانی تشکیل می‌شود؟',
      a: 'هیات تومور جلسه‌ای چندتخصصی متشکل از فوق تخصص آنکولوژی، جراح سرطان، رادیولوژیست مداخله‌ای و پاتولوژیست است. در مواردی که شرایط بیماری پیچیده باشد، این تیم پرونده و تصاویر ماموگرافی را به صورت مشترک بررسی کرده و یک پروتکل درمانی مورد اجماع تدوین می‌کنند.'
    },
    {
      q: 'امنیت اطلاعات و محرمانگی پرونده پزشکی من چگونه محافظت می‌شود؟',
      a: 'کلیه اطلاعات هویتی و بالینی در پایگاه داده با استاندارد AES-256 رمزنگاری شده و دسترسی به سوابق پزشکی صرفاً بر اساس سطوح دسترسی مبتنی بر نقش (RBAC) و رضایت بیمار کنترل می‌گردد. سامانه شمساز کاملاً منطبق بر اصول HIPAA و GDPR سلامت طراحی شده است.'
    },
    {
      q: 'قوانین لغو نوبت و بازگشت وجه به چه صورت است؟',
      a: 'لغو نوبت تا ۳۶ ساعت قبل از موعد ویزیت بدون هیچ‌گونه جریمه یا کسر هزینه امکان‌پذیر بوده و وجه پرداختی ظرف ۲۴ ساعت کاری به حساب بیمار بازگردانده می‌شود.'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>پاسخ به سوالات مراجعین</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            پرسش‌های متداول درباره خدمات شمساز
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            راهنمای جامع نوبت‌دهی، ویزیت آنلاین، پرونده الکترونیک و شبکه سرطان‌های زنان
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="leading-snug">{faq.q}</span>
                  <div className={`p-1.5 rounded-lg shrink-0 transition-transform ${isOpen ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
