import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Check, 
  LogOut,
  Headphones,
  Users,
  Building2,
  Crown,
  Briefcase,
  UserX,
  ShieldCheck
} from 'lucide-react';

interface ProfileScreenProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: { name: string; phone?: string }) => Promise<void>;
  onLogout: () => void;
  onOpenSupportChat: () => void;
  onOpenUserManagement?: () => void;
  onOpenBuildingsModal?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onUpdateProfile,
  onLogout,
  onOpenSupportChat,
  onOpenUserManagement,
  onOpenBuildingsModal,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAdmin = currentUser.email.toLowerCase() === 'mfb.15.f@gmail.com' || currentUser.role === 'admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await onUpdateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
          <Crown className="w-3 h-3 text-slate-900" />
          <span>مدير نظام</span>
        </span>
      );
    }
    if (currentUser.role === 'manager') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-200 text-emerald-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
          <ShieldCheck className="w-3 h-3 text-emerald-800" />
          <span>مدير</span>
        </span>
      );
    }
    if (currentUser.role === 'employee') {
      return (
        <span className="inline-flex items-center gap-1 bg-indigo-200 text-indigo-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
          <Briefcase className="w-3 h-3 text-indigo-800" />
          <span>موظف</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
        <UserX className="w-3 h-3 text-amber-800" />
        <span>بدون صلاحيات</span>
      </span>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-inner">
              {currentUser.name ? currentUser.name.charAt(0) : 'م'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{currentUser.name}</h2>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-indigo-200 font-medium flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-mono">{currentUser.email}</span>
              </p>
              {currentUser.phone && (
                <p className="text-[11px] text-indigo-300 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3" />
                  <span>{currentUser.phone}</span>
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Admin Fast Actions Card */}
      {isAdmin && (
        <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-black text-purple-900 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-purple-700" />
            <span>لوحة تحكم المدير</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onOpenBuildingsModal && (
              <button
                onClick={onOpenBuildingsModal}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>إدارة العقارات</span>
              </button>
            )}

            {onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>إدارة الحسابات</span>
              </button>
            )}

            {onOpenSupportChat && (
              <button
                onClick={onOpenSupportChat}
                className="w-full sm:col-span-2 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 font-extrabold p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Headphones className="w-4 h-4 text-purple-700" />
                <span>مركز الدعم الفني</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Form Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <User className="w-4 h-4 text-indigo-700" />
          <span>تعديل معلومات الحساب الشخصي</span>
        </h3>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم حفظ التغييرات بنجاح</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الاسم الكامل
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رقم الجوال
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-slate-900 dir-ltr text-right font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              البريد الإلكتروني (غير قابل للتعديل المباشر)
            </label>
            <div className="relative opacity-70">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Logout Action */}
      <div className="pt-1">
        <button
          onClick={onLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold py-2.5 rounded-xl border border-rose-200 transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>

    </div>
  );
};
