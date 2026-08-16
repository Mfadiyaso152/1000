import React, { useState } from 'react';
import { Phone, ShieldCheck, AlertCircle } from 'lucide-react';

interface PhonePromptModalProps {
  isOpen: boolean;
  userEmail: string;
  userName: string;
  onSubmitPhone: (phone: string) => Promise<void>;
}

export const PhonePromptModal: React.FC<PhonePromptModalProps> = ({
  isOpen,
  userEmail,
  userName,
  onSubmitPhone,
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('يرجى إدخال رقم جوال صحيح (مثال: 0501234567)');
      return;
    }

    setLoading(true);
    try {
      await onSubmitPhone(cleanPhone);
    } catch (err: any) {
      console.error('Error saving phone:', err);
      setError('حدث خطأ أثناء حفظ رقم الجوال، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 text-center relative">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20">
            <Phone className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-base font-extrabold">استكمال بيانات الحساب لأول مرة</h2>
          <p className="text-xs text-indigo-100 mt-1">
            مرحباً بك {userName}! يرجى إدخال رقم الجوال لإكمال التسجيل.
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-xs text-indigo-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0" />
            <span>الحساب المكتشف: <strong>{userEmail}</strong></span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              رقم الجوال <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full pr-10 pl-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 text-slate-900 font-mono text-right"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              يُستخدم رقم الجوال للتحقق والتواصل مع الدعم الفني وإدارة الموظفين.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>حفظ ومتابعة إلى التطبيق</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
