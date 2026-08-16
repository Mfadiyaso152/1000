import React from 'react';
import { ShieldAlert, Headphones, LogOut, Lock, Clock } from 'lucide-react';
import { UserProfile } from '../types';
import { CompanyLogo } from './CompanyLogo';

interface PendingApprovalScreenProps {
  currentUser: UserProfile;
  onOpenSupportChat: () => void;
  onLogout: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  currentUser,
  onOpenSupportChat,
  onLogout,
}) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 text-slate-800" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden text-center">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-center">
          <CompanyLogo size="lg" showSubtitle={true} showBetaBadge={true} />
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200/80 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>بانتظار موافقة المسؤول</span>
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              حسابك بانتظار الاعتماد وتحديد الصلاحيات
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed px-2">
              مرحباً بك <strong>{currentUser.name}</strong> ({currentUser.email}). لحماية خصوصية عقارات وتقارير الشركة، يرجى التواصل مع مسؤول النظام لتفعيل صلاحيات حسابك (مدير / موظف).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onOpenSupportChat}
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-amber-300" />
              <span>التواصل مع الدعم الفني لطلب الصلاحية</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>نظام حماية وسرية بيانات 1000 القاسم بالرياض</span>
          </div>

        </div>

      </div>
    </div>
  );
};
