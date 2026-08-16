import React, { useState, useEffect } from 'react';
import { PropertyReport, Building, RIYADH_BRANCHES, ReportStatus } from '../types';
import { X, Edit3, Save, Upload, Trash2, Camera } from 'lucide-react';

interface EditReportModalProps {
  report: PropertyReport | null;
  buildings: Building[];
  isOpen: boolean;
  onClose: () => void;
  onSaveReport: (updatedData: {
    id: string;
    title: string;
    buildingId: string;
    buildingName: string;
    branch: string;
    district?: string;
    description: string;
    status: ReportStatus;
    photoUrl?: string;
  }) => Promise<void>;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  report,
  buildings,
  isOpen,
  onClose,
  onSaveReport,
}) => {
  const [title, setTitle] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>(RIYADH_BRANCHES[0]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ReportStatus>('pending');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (report) {
      setTitle(report.title || '');
      setSelectedBranch(report.branch || RIYADH_BRANCHES[0]);
      setSelectedBuildingId(report.buildingId || '');
      setBuildingName(report.buildingName || '');
      setDistrict(report.district || '');
      setDescription(report.description || '');
      setStatus(report.status || 'pending');
      setPhotoUrl(report.photoUrl || '');
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const currentBldg = buildings.find(b => b.id === selectedBuildingId);
    const finalBuildingName = currentBldg ? currentBldg.name : buildingName.trim();
    const finalDistrict = currentBldg ? currentBldg.district : district.trim();

    setLoading(true);
    await onSaveReport({
      id: report.id,
      title: title.trim(),
      buildingId: selectedBuildingId || report.buildingId,
      buildingName: finalBuildingName || report.buildingName,
      branch: selectedBranch,
      district: finalDistrict,
      description: description.trim(),
      status,
      photoUrl: photoUrl.trim() || undefined,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 flex items-center justify-between shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">تعديل التقرير</h3>
              <p className="text-[10px] text-slate-500">تحديث بيانات وملاحظات التقرير</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
          
          {/* Status Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">حالة التقرير</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  status === 'in_progress' || status === 'pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span>قيد المتابعة</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  status === 'completed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span>مكتمل</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان التقرير <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-slate-900 font-medium"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الفرع</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-900 outline-none"
            >
              {RIYADH_BRANCHES.map(br => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تفاصيل التقرير <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-slate-900 leading-relaxed font-medium"
            />
          </div>

          {/* Device Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>إرفاق صورة التوثيق من الجهاز (اختياري)</span>
            </label>

            {photoUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={photoUrl} alt="المعاينة" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg text-xs transition shadow-sm flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition p-3 text-center">
                <Upload className="w-6 h-6 text-indigo-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">اضغط هنا لاختيار صورة من جهازك</span>
                <span className="text-[10px] text-slate-400">من ألبوم الصور أو الكاميرا بالجوال أو الكمبيوتر</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-200 transition"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
