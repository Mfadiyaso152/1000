import React from 'react';
import { PropertyReport } from '../types';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Droplets,
  Check,
  AlertTriangle,
  Camera
} from 'lucide-react';

interface ReportDetailsModalProps {
  report: PropertyReport | null;
  isOpen: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onEdit?: (report: PropertyReport) => void;
  onDelete?: (reportId: string) => void;
  onApprove?: (report: PropertyReport) => void;
  onReject?: (report: PropertyReport) => void;
  onSendWhatsApp?: (report: PropertyReport) => void;
  onCompleteRefill?: (report: PropertyReport) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  isOpen,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onSendWhatsApp,
  onCompleteRefill,
}) => {
  if (!isOpen || !report) return null;

  const isPending = report.status === 'pending' || (report.status as string) === 'pending_approval';
  const isApproved = report.status === 'approved';
  const isRejected = report.status === 'rejected';
  const isCompleted = report.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 flex items-center justify-between shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">تفاصيل التقرير والتوثيق</h3>
              <p className="text-[11px] text-slate-500">{report.buildingName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Status Header Bar */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900">{report.title}</span>
            {isCompleted && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>مكتمل وموثق</span>
              </span>
            )}
            {isApproved && (
              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>مقبول - بانتظار التعبئة</span>
              </span>
            )}
            {isRejected && (
              <span className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>مرفوض</span>
              </span>
            )}
            {isPending && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>بانتظار موافقة المدير</span>
              </span>
            )}
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-900">
              <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
              <span className="font-extrabold">{report.buildingName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{report.branch} - {report.district || 'الرياض'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>كاتب التقرير: <strong className="text-slate-900">{report.createdByName}</strong></span>
            </div>
            {(report.approvedByName || isApproved || isCompleted) && (
              <div className="flex items-center gap-2 text-emerald-900 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تمت الموافقة من قبل: <strong className="text-emerald-950 font-black">{report.approvedByName || 'المدير'}</strong></span>
                {report.approvedAt && (
                  <span className="text-[10px] text-emerald-700 font-normal mr-auto">
                    ({new Date(report.approvedAt).toLocaleDateString('ar-SA')})
                  </span>
                )}
              </div>
            )}
            {report.createdByPhone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>رقم التواصل: <strong className="text-slate-900 font-mono dir-ltr">{report.createdByPhone}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>تاريخ الإضافة: {new Date(report.createdAt).toLocaleString('ar-SA')}</span>
            </div>
          </div>

          {/* Description & Requirements */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-1">المتطلبات من المورد / تفاصيل الطلب:</h4>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {report.description}
            </div>
          </div>

          {/* PENDING ACTIONS FOR MANAGER */}
          {isPending && isAdmin && onApprove && onReject && (
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>اتخاذ قرار الاعتماد كمدير (القبول على مسؤوليتك):</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onApprove(report);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl shadow-xs transition text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>قبول التقرير</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReject(report);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رفض</span>
                </button>
              </div>
            </div>
          )}

          {/* APPROVED STATE ACTIONS */}
          {isApproved && (
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl space-y-2">
              <p className="text-xs font-extrabold text-blue-900">إجراءات المتابعة والتوريد:</p>
              <div className="flex flex-col gap-2">
                {onSendWhatsApp && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSendWhatsApp(report);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow-xs transition text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>إرسال التوجيه للمورد (واتساب) 💬</span>
                  </button>
                )}

                {onCompleteRefill && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onCompleteRefill(report);
                    }}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-2.5 rounded-xl shadow-xs transition text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Droplets className="w-4 h-4" />
                    <span>توثيق التعبئة وإكمال التقرير 📸</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* COMPLETED REPORT GALLERY */}
          {isCompleted && (
            <div className="space-y-3 bg-emerald-50/50 border border-emerald-200/80 p-3.5 rounded-2xl">
              <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>الصور والتوثيق المعتمد للتعبئة والتوريد</span>
              </h4>

              {report.refillDate && (
                <p className="text-[11px] text-slate-600 font-bold">
                  🗓️ تاريخ التعبئة: <span className="font-mono">{new Date(report.refillDate).toLocaleString('ar-SA')}</span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.tankPhotoBefore && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-700">صورة الخزان (قبل التعبئة):</span>
                    <img src={report.tankPhotoBefore} alt="الخزان قبل" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                  </div>
                )}

                {report.tankPhotoAfter && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800">صورة الخزان (بعد التعبئة):</span>
                    <img src={report.tankPhotoAfter} alt="الخزان بعد" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                  </div>
                )}

                {(report.buildingPhotoUrl || report.photoUrl) && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[10px] font-bold text-indigo-900">صورة واجهة العمارة:</span>
                    <img src={report.buildingPhotoUrl || report.photoUrl} alt="صورة العمارة" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                  </div>
                )}
              </div>

              {report.completionNotes && (
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-xs text-slate-800">
                  <strong>ملاحظات التعبئة:</strong> {report.completionNotes}
                </div>
              )}
            </div>
          )}

          {/* Action buttons inside details modal */}
          <div className="pt-2 flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(report);
                }}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل التقرير</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل أنت متاكد من رغبتك في حذف هذا التقرير؟')) {
                    onClose();
                    onDelete(report.id);
                  }
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs"
            >
              إغلاق
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
