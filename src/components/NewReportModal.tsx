import React, { useState } from 'react';
import { Building, RIYADH_BRANCHES } from '../types';
import { 
  X, 
  FileText, 
  Send, 
  Check, 
  Building2, 
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

interface NewReportModalProps {
  buildings: Building[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reportData: {
    buildingId: string;
    buildingName: string;
    branch: string;
    district: string;
    title: string;
    description: string;
    photoUrl?: string;
  }) => Promise<string | null>;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  buildings,
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>(RIYADH_BRANCHES[0]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const branchBuildings = buildings.filter(b => b.branch === selectedBranch);
  const currentBuilding = buildings.find(b => b.id === selectedBuildingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBuilding) {
      alert('يرجى اختيار العقار من القائمة أولاً');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('يرجى كتابة عنوان التقرير والتفاصيل');
      return;
    }

    setLoading(true);
    const res = await onSubmitReport({
      buildingId: currentBuilding.id,
      buildingName: currentBuilding.name,
      branch: selectedBranch,
      district: currentBuilding.district || 'الرياض',
      title: title.trim(),
      description: description.trim(),
      photoUrl: photoUrl.trim() || undefined,
    });
    setLoading(false);

    if (res) {
      setSuccess(true);
      setTimeout(() => {
        resetAndClose();
      }, 1200);
    }
  };

  const resetAndClose = () => {
    setSelectedBuildingId('');
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 flex items-center justify-between shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">إضافة تقرير جديد</h3>
              <p className="text-[11px] text-slate-500">1000 القاسم العقارية</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">تم حفظ التقرير بنجاح!</h3>
            <p className="text-xs text-slate-500">تم تسجيل التقرير وتوثيقه بالنظام</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
            
            {/* Select Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الفرع التابع بالرياض
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setSelectedBuildingId('');
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-900 outline-none focus:border-indigo-600"
              >
                {RIYADH_BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            {/* Select or Enter Building */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم العقار / المبنى <span className="text-rose-500">*</span>
              </label>
              {branchBuildings.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1 mb-2">
                  {branchBuildings.map(bldg => {
                    const isSelected = selectedBuildingId === bldg.id;
                    return (
                      <div
                        key={bldg.id}
                        onClick={() => {
                          setSelectedBuildingId(bldg.id);
                        }}
                        className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-600 font-bold text-indigo-900' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                          <span>{bldg.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  لا توجد عقارات مسجلة في هذا الفرع. يرجى مراجعة إدارة النظام.
                </div>
              )}
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
                placeholder="عنوان مختصر للتقرير..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-600 bg-slate-50 text-slate-900 font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تفاصيل التقرير <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب الملاحظات والتفاصيل العقارية..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-600 bg-slate-50 text-slate-900 leading-relaxed font-medium"
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

            {/* Submit Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>حفظ التقرير</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
