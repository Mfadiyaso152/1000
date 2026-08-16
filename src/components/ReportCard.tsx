import React from 'react';
import { PropertyReport } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  Calendar, 
  Phone,
  Check,
  XCircle,
  MessageSquare,
  Droplets,
  AlertTriangle
} from 'lucide-react';

interface ReportCardProps {
  report: PropertyReport;
  variant?: 'compact' | 'full';
  isAdmin?: boolean;
  onSelect: (report: PropertyReport) => void;
  onEdit?: (report: PropertyReport) => void;
  onDelete?: (reportId: string) => void;
  onApprove?: (report: PropertyReport) => void;
  onReject?: (report: PropertyReport) => void;
  onSendWhatsApp?: (report: PropertyReport) => void;
  onCompleteRefill?: (report: PropertyReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  variant = 'full', 
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onSendWhatsApp,
  onCompleteRefill,
}) => {
  const isPending = report.status === 'pending' || (report.status as string) === 'pending_approval';
  const isApproved = report.status === 'approved';
  const isRejected = report.status === 'rejected';
  const isCompleted = report.status === 'completed';

  const formattedDate = report.createdAt 
    ? new Date(report.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })
    : '';

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>مكتمل وموثق</span>
        </span>
      );
    }
    if (isApproved) {
      return (
        <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>مقبول - بانتظار التعبئة</span>
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>مرفوض</span>
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>بانتظار موافقة المدير</span>
      </span>
    );
  };

  // COMPACT VARIANT (For Home Page Mini Reports)
  if (variant === 'compact') {
    return (
      <div 
        onClick={() => onSelect(report)}
        className="bg-white hover:bg-slate-50/90 rounded-xl border border-slate-200/80 p-2.5 shadow-2xs transition cursor-pointer flex items-center justify-between gap-2.5 active:scale-[0.99] group"
        dir="rtl"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700 transition">{report.title}</h4>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{report.buildingName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge()}
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition" />
        </div>
      </div>
    );
  }

  // FULL VARIANT
  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm hover:border-indigo-200 transition space-y-3 relative overflow-hidden"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2">
        <div 
          onClick={() => onSelect(report)} 
          className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
        >
          <div className="w-9.5 h-9.5 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100 font-black">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-slate-900 truncate hover:text-indigo-700">{report.title}</h3>
            <p className="text-[11px] text-slate-600 font-bold truncate mt-0.5">{report.buildingName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      <p 
        onClick={() => onSelect(report)} 
        className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-slate-200 transition font-medium"
      >
        {report.description}
      </p>

      {/* WORKFLOW ACTION BUTTONS */}
      {isPending && isAdmin && onApprove && onReject && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl space-y-2">
          <p className="text-[10px] font-black text-amber-900 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>طلب جديد بانتظار قرارك كمدير:</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(report);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>قبول التقرير</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReject(report);
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>رفض</span>
            </button>
          </div>
        </div>
      )}

      {/* APPROVED STATE: WhatsApp message button & Complete Refill button */}
      {isApproved && (
        <div className="bg-blue-50/80 border border-blue-200/80 p-2.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between gap-1 text-[10px] font-black text-blue-900 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>تم القبول - جاهز لإرسال التوجيه للمورد والتعبئة</span>
            </span>
            <span className="bg-blue-100/90 text-blue-950 font-black px-2 py-0.5 rounded-md border border-blue-200">
              تمت الموافقة من قبل: {report.approvedByName || 'المدير'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {onSendWhatsApp && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendWhatsApp(report);
                }}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>إرسال للمورد (واتساب) 💬</span>
              </button>
            )}

            {onCompleteRefill && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompleteRefill(report);
                }}
                className="w-full sm:flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-2 px-3 rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Droplets className="w-4 h-4" />
                <span>توثيق التعبئة وإكمال التقرير 📸</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* COMPLETED STATE: Show before/after tank photos thumbnail preview */}
      {isCompleted && (report.tankPhotoBefore || report.tankPhotoAfter || report.buildingPhotoUrl || report.photoUrl) && (
        <div onClick={() => onSelect(report)} className="cursor-pointer space-y-1">
          <p className="text-[10px] font-extrabold text-slate-500">الصور الموثقة (قبل وبعد والعمارة):</p>
          <div className="grid grid-cols-3 gap-1.5">
            {report.tankPhotoBefore && (
              <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={report.tankPhotoBefore} alt="الخزان قبل" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] font-bold text-center py-0.5">قبل</span>
              </div>
            )}
            {report.tankPhotoAfter && (
              <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={report.tankPhotoAfter} alt="الخزان بعد" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-white text-[8px] font-bold text-center py-0.5">بعد</span>
              </div>
            )}
            {(report.buildingPhotoUrl || report.photoUrl) && (
              <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={report.buildingPhotoUrl || report.photoUrl} alt="العمارة" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-indigo-900/80 text-white text-[8px] font-bold text-center py-0.5">العمارة</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Meta & Actions (Edit / Delete) */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3 text-slate-500 text-[10px] flex-wrap">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-indigo-600" />
            <span className="text-slate-800 font-bold">{report.createdByName}</span>
          </span>
          {report.approvedByName && (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>موافقة: {report.approvedByName}</span>
            </span>
          )}
          {report.createdByPhone && (
            <span className="flex items-center gap-1 text-slate-600 font-mono dir-ltr">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{report.createdByPhone}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(report);
              }}
              className="px-2 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/80 transition flex items-center gap-1 text-[10px] font-bold"
              title="تعديل التقرير"
            >
              <Edit3 className="w-3 h-3" />
              <span>تعديل</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('هل أنت متاكد من رغبتك في حذف هذا التقرير؟')) {
                  onDelete(report.id);
                }
              }}
              className="px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/80 transition flex items-center gap-1 text-[10px] font-bold"
              title="حذف التقرير"
            >
              <Trash2 className="w-3 h-3" />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
