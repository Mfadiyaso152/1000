import React, { useState } from 'react';
import { PropertyReport } from '../types';
import { X, Camera, Upload, Trash2, CheckCircle2, Calendar, Building2, Droplets } from 'lucide-react';

interface CompleteReportModalProps {
  isOpen: boolean;
  report: PropertyReport | null;
  onClose: () => void;
  onCompleteReport: (data: {
    reportId: string;
    tankPhotoBefore: string;
    tankPhotoAfter: string;
    buildingPhotoUrl: string;
    refillDate: string;
    completionNotes?: string;
  }) => Promise<void>;
}

export const CompleteReportModal: React.FC<CompleteReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onCompleteReport,
}) => {
  const [tankPhotoBefore, setTankPhotoBefore] = useState<string>('');
  const [tankPhotoAfter, setTankPhotoAfter] = useState<string>('');
  const [buildingPhotoUrl, setBuildingPhotoUrl] = useState<string>('');
  const [refillDate, setRefillDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !report) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tankPhotoBefore) {
      alert('يرجى إرفاق صورة الخزان قبل التعبئة');
      return;
    }
    if (!tankPhotoAfter) {
      alert('يرجى إرفاق صورة الخزان بعد التعبئة');
      return;
    }
    if (!buildingPhotoUrl) {
      alert('يرجى إرفاق صورة العمارة');
      return;
    }

    setLoading(true);
    await onCompleteReport({
      reportId: report.id,
      tankPhotoBefore,
      tankPhotoAfter,
      buildingPhotoUrl,
      refillDate: refillDate || new Date().toISOString(),
      completionNotes: completionNotes.trim() || undefined,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">توثيق إكمال التعبئة والتوريد</h3>
              <p className="text-[11px] text-indigo-200">{report.buildingName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8.5 h-8.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <Building2 className="w-4 h-4 text-indigo-700" />
              <span>{report.buildingName} - {report.branch}</span>
            </div>
            <p className="text-slate-600">عنوان الطلب: {report.title}</p>
          </div>

          {/* 1. Date and Time of Refill */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>تاريخ ووقت التوريد والتعبئة <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="datetime-local"
              required
              value={refillDate}
              onChange={(e) => setRefillDate(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-600"
            />
          </div>

          {/* 2. Photo: Tank Before */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>1. صورة الخزان (قبل التعبئة) <span className="text-rose-500">*</span></span>
            </label>
            {tankPhotoBefore ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={tankPhotoBefore} alt="الخزان قبل" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setTankPhotoBefore('')}
                  className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تغيير</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl cursor-pointer bg-amber-50/40 hover:bg-amber-50/80 transition p-2 text-center">
                <Upload className="w-5 h-5 text-amber-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">ارفاق صورة الخزان قبل التعبئة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setTankPhotoBefore)}
                />
              </label>
            )}
          </div>

          {/* 3. Photo: Tank After */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. صورة الخزان (بعد التعبئة) <span className="text-rose-500">*</span></span>
            </label>
            {tankPhotoAfter ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={tankPhotoAfter} alt="الخزان بعد" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setTankPhotoAfter('')}
                  className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تغيير</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-emerald-50/40 hover:bg-emerald-50/80 transition p-2 text-center">
                <Upload className="w-5 h-5 text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">ارفاق صورة الخزان بعد التعبئة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setTankPhotoAfter)}
                />
              </label>
            )}
          </div>

          {/* 4. Photo: Building / Elevation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. صورة العمارة / الواجهة <span className="text-rose-500">*</span></span>
            </label>
            {buildingPhotoUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={buildingPhotoUrl} alt="صورة العمارة" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setBuildingPhotoUrl('')}
                  className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تغيير</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl cursor-pointer bg-indigo-50/40 hover:bg-indigo-50/80 transition p-2 text-center">
                <Upload className="w-5 h-5 text-indigo-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">ارفاق صورة واجهة العمارة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setBuildingPhotoUrl)}
                />
              </label>
            )}
          </div>

          {/* 5. Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات إضافية على التوريد (اختياري)
            </label>
            <input
              type="text"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="مثال: تم إكمال تعبئة 50,000 لتر وفحص التسريبات بنجاح"
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-600 bg-slate-50 text-slate-900 font-medium"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>حفظ وإكمال التقرير</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
