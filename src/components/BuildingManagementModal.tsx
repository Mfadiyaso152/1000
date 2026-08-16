import React, { useState } from 'react';
import { Building, RIYADH_BRANCHES } from '../types';
import { 
  X, 
  Building2, 
  Plus, 
  MapPin, 
  Search,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  Upload
} from 'lucide-react';

interface BuildingManagementModalProps {
  buildings: Building[];
  isOpen: boolean;
  initialTab?: 'list' | 'add';
  onClose: () => void;
  onAddBuilding: (building: Omit<Building, 'id'>) => Promise<void>;
  onDeleteBuilding?: (buildingId: string) => Promise<void>;
}

export const BuildingManagementModal: React.FC<BuildingManagementModalProps> = ({
  buildings,
  isOpen,
  initialTab = 'list',
  onClose,
  onAddBuilding,
  onDeleteBuilding,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Add Form State
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<string>(RIYADH_BRANCHES[0]);
  const [district, setDistrict] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const filteredBuildings = buildings.filter(b => {
    const matchesSearch = b.name.includes(searchTerm) || (b.district && b.district.includes(searchTerm));
    const matchesBranch = selectedBranchFilter === 'all' || b.branch === selectedBranchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await onAddBuilding({
      name: name.trim(),
      branch,
      district: district.trim() || 'الرياض',
      locationUrl: locationUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
    setLoading(false);

    // Reset & switch to list
    setName('');
    setDistrict('');
    setLocationUrl('');
    setImageUrl('');
    setActiveTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">إضافة وإدارة العقارات</h3>
              <p className="text-xs text-indigo-200">دليل عمارات ومباني 1000 القاسم بالرياض</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'list'
                ? 'border-indigo-700 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            العقارات المضافة ({buildings.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'add'
                ? 'border-indigo-700 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عقار جديد</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              
              {/* Filter controls */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث باسم العقار أو الحي..."
                  className="w-full pr-10 pl-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-slate-50 text-slate-900 focus:border-indigo-600"
                />
              </div>

              {/* Buildings List */}
              <div className="space-y-2.5">
                {filteredBuildings.length > 0 ? (
                  filteredBuildings.map(bldg => (
                    <div 
                      key={bldg.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3 hover:border-indigo-200 transition"
                    >
                      {bldg.imageUrl ? (
                        <img 
                          src={bldg.imageUrl} 
                          alt={bldg.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100 font-bold">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{bldg.name}</h4>
                        <p className="text-[11px] text-indigo-700 font-bold truncate mt-0.5">{bldg.branch}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{bldg.district || 'الرياض'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {bldg.locationUrl && (
                          <a
                            href={bldg.locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
                            title="رابط الخريطة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">الموقع</span>
                          </a>
                        )}

                        {onDeleteBuilding && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت تأكد من حذف عقار (${bldg.name})؟`)) {
                                onDeleteBuilding(bldg.id);
                              }
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="حذف العقار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                    <p>لا توجد عقارات مضافة مطابقة للبحث</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Add Building Form */
            <form onSubmit={handleCreate} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم العقار / المبنى <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عمارة القاسم - النرجس 08"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-600 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الفرع التابع بالرياض <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 font-bold text-indigo-900 outline-none focus:border-indigo-600"
                  >
                    {RIYADH_BRANCHES.map(br => (
                      <option key={br} value={br}>{br}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الحي بالرياض
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: حي النرجس"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-600 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رابط موقع العقار (قوقل ماب)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="url"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full pr-9 pl-3 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-indigo-600 bg-slate-50 text-slate-900 font-mono text-left dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  إرفاق صورة العقار من الجهاز (اختياري)
                </label>
                {imageUrl ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={imageUrl} alt="معاينة العقار" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg text-xs transition shadow-sm flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الصورة</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition p-3 text-center">
                    <Upload className="w-6 h-6 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">اضغط هنا لاختيار صورة العقار من جهازك</span>
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
                            setImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-3 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>حفظ العقار ونشره فوراً</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
