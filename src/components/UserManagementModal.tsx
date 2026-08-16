import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserX, 
  Briefcase, 
  X, 
  Search, 
  Phone, 
  Mail, 
  Check, 
  Crown,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { db, collection, onSnapshot, doc, updateDoc } from '../lib/firebase';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Realtime snapshot of all users in Firestore
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const loaded: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loaded.push({
          uid: docSnap.id,
          email: data.email || '',
          name: data.name || 'مستخدم بدون اسم',
          phone: data.phone || '',
          role: data.role || (data.email?.toLowerCase() === 'mfb.15.f@gmail.com' ? 'admin' : 'none'),
          emailVerified: !!data.emailVerified,
          createdAt: data.createdAt,
        });
      });
      // Sort so admin mfb.15.f@gmail.com is on top
      loaded.sort((a, b) => {
        if (a.email.toLowerCase() === 'mfb.15.f@gmail.com') return -1;
        if (b.email.toLowerCase() === 'mfb.15.f@gmail.com') return 1;
        return a.name.localeCompare(b.name, 'ar');
      });
      setUsers(loaded);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = async (targetUid: string, targetEmail: string, newRole: string) => {
    // Keep mfb.15.f@gmail.com strictly as admin
    if (targetEmail.toLowerCase() === 'mfb.15.f@gmail.com' && newRole !== 'admin') {
      alert('حساب المسؤول الرئيسي mfb.15.f@gmail.com يظل دائماً مدير للنظام');
      return;
    }

    setUpdatingUid(targetUid);
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, { role: newRole });
      setSuccessNotice(`تم تحديث صلاحية الحساب بنجاح إلى: ${getRoleLabel(newRole)}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
      alert('حدث خطأ أثناء تحديث الصلاحيات');
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'مدير نظام';
      case 'manager':
        return 'مدير';
      case 'employee':
        return 'موظف';
      case 'none':
      default:
        return 'بدون صلاحيات';
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <Crown className="w-3 h-3 text-purple-600" />
            <span>مدير نظام</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>مدير</span>
          </span>
        );
      case 'employee':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Briefcase className="w-3 h-3 text-blue-600" />
            <span>موظف</span>
          </span>
        );
      case 'none':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <UserX className="w-3 h-3 text-amber-600" />
            <span>بدون صلاحيات</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">إدارة الحسابات والصلاحيات</h3>
              <p className="text-xs text-indigo-200">
                التحكم بالصلاحيات مباشرة لحسابات الشركة (إجمالي: {users.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Notice Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {successNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم أو البريد أو رقم الجوال..."
              className="w-full pr-10 pl-4 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600 text-slate-800"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">لم يتم العثور على حسابات مطابقة للبحث</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isAdminAccount = u.email.toLowerCase() === 'mfb.15.f@gmail.com';
              const isUpdating = updatingUid === u.uid;

              return (
                <div 
                  key={u.uid}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 transition shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* User Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{u.name}</span>
                        {getRoleBadge(u.role)}
                        {isAdminAccount && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300">
                            المسؤول الرئيسي
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono dir-ltr">{u.email}</span>
                        </span>

                        {u.phone && (
                          <span className="flex items-center gap-1 font-mono text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role Change Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs text-slate-500 font-bold ml-1">الصلاحية:</span>
                      
                      {isAdminAccount ? (
                        <span className="text-xs font-extrabold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                          مدير دائم
                        </span>
                      ) : (
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleRoleChange(u.uid, u.email, 'admin')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            مدير نظام
                          </button>

                          <button
                            disabled={isUpdating}
                            onClick={() => handleRoleChange(u.uid, u.email, 'manager')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                              u.role === 'manager'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            مدير
                          </button>

                          <button
                            disabled={isUpdating}
                            onClick={() => handleRoleChange(u.uid, u.email, 'employee')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                              u.role === 'employee'
                                ? 'bg-indigo-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            موظف
                          </button>

                          <button
                            disabled={isUpdating}
                            onClick={() => handleRoleChange(u.uid, u.email, 'none')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                              u.role === 'none' || !u.role
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            بدون
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
