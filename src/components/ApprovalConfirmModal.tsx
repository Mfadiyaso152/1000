import React, { useState } from 'react';
import { PropertyReport } from '../types';
import { AlertTriangle, CheckCircle2, X, ShieldAlert, Building2 } from 'lucide-react';

interface ApprovalConfirmModalProps {
  isOpen: boolean;
  report: PropertyReport | null;
  onClose: () => void;
  onConfirmApprove: (reportId: string) => Promise<void>;
}

export const ApprovalConfirmModal: React.FC<ApprovalConfirmModalProps> = ({
  isOpen,
  report,
  onClose,
  onConfirmApprove,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !report) return null;

  const handleApprove = async () => {
    setLoading(true);
    await onConfirmApprove(report.id);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm">اعتماد التقرير من المدير</h3>
              <p className="text-[11px] text-amber-100">{report.buildingName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
              <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>{report.title}</span>
            </div>
            <p className="text-slate-600">العقار: <strong>{report.buildingName}</strong> ({report.branch})</p>
            <p className="text-slate-600">الكاتب: <strong>{report.createdByName}</strong></p>
          </div>

          {/* CRITICAL RESPONSIBILITY DISCLAIMER */}
          <div className="bg-amber-50 border-2 border-amber-300/80 p-4 rounded-2xl space-y-2 text-amber-950">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
              <span>تنبيه هام: القبول على مسؤوليتك</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-bold">
              باعتمادك هذا التقرير، تتكفل بصحة طلب التعبئة والموافقة عليه لتوجيه المورد للتنفيذ. هل أنت متاكد من اعتماد الطلب؟
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>أوافق واعتمد (على مسؤوليتي)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
