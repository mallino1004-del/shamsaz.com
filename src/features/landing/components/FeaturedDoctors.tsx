/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, MapPin, CheckCircle2, ArrowLeft, Heart, Shield } from 'lucide-react';
import { Doctor } from '../../../types';

interface FeaturedDoctorsProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onViewAllDoctors: () => void;
}

export const FeaturedDoctors: React.FC<FeaturedDoctorsProps> = ({
  doctors,
  onSelectDoctor,
  onViewAllDoctors,
}) => {
  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              پزشکان منتخب
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              برترین پزشکان متخصص و دارای بالاترین رضایت بیماران
            </p>
          </div>

          <button 
            onClick={onViewAllDoctors}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <span>مشاهده همه پزشکان</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Doctor Cards Grid + Feature Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 4 Doctor Cards */}
          {doctors.slice(0, 4).map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all p-4 flex flex-col justify-between text-right relative group"
            >
              {/* Card Top: Badges */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>تأیید شده</span>
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  بیمه
                </span>
              </div>

              {/* Avatar & Information */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-sm mb-3 relative">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {doctor.name}
                </h3>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">
                  {doctor.title}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{doctor.hospital}</span>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mb-3">
                <span className="text-[11px] text-slate-400">
                  ({doctor.reviewsCount} نظر)
                </span>
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-mono tabular-nums">{doctor.rating}</span>
                </div>
              </div>

              {/* Action Button: Book Appointment */}
              <button
                onClick={() => onSelectDoctor(doctor)}
                className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>دریافت نوبت</span>
              </button>
            </div>
          ))}

          {/* Right Promotional Card */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 rounded-2xl text-white p-6 flex flex-col justify-between text-right relative overflow-hidden shadow-lg">
            {/* Ambient pattern */}
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h3 className="text-base font-black leading-snug">
                با شمساز، سلامت شما در اولویت است
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                مشاوره مستقیم با بهترین متخصصین و اساتید دانشگاهی به همراه دسترسی اختصاصی به خدمات پرونده الکترونیک سلامت.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <button
                onClick={onViewAllDoctors}
                className="w-full py-2.5 px-4 bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 rounded-xl text-xs font-black transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>بیشتر بدانید</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
