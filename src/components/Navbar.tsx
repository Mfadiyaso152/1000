import React from 'react';
import { UserProfile } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { LogOut, User, Headphones, Users, Building2, FileText } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: 'home' | 'reports' | 'add' | 'users' | 'profile';
  setActiveTab: (tab: 'home' | 'reports' | 'add' | 'users' | 'profile') => void;
  onLogout: () => void;
  onOpenSupportChat: () => void;
  onOpenBuildingsModal?: () => void;
  onOpenUserManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenSupportChat,
  onOpenBuildingsModal,
  onOpenUserManagement,
}) => {
  const isAdmin = currentUser?.email.toLowerCase() === 'mfb.15.f@gmail.com' || currentUser?.role === 'admin';
  const isApproved = currentUser && currentUser.role !== 'none';

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => isApproved && setActiveTab('home')}>
          <CompanyLogo size="md" showSubtitle={true} showBetaBadge={true} />
        </div>

        {/* Desktop / Tablet Navigation Links */}
        {currentUser && isApproved && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            {!isAdmin && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>التقارير</span>
              </button>
            )}

            {/* Buildings Management for System Admin */}
            {isAdmin && onOpenBuildingsModal && (
              <button
                onClick={onOpenBuildingsModal}
                className="px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-indigo-900 hover:bg-indigo-100/60 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span>العقارات</span>
              </button>
            )}

            {/* Employee/User Management for System Admin */}
            {isAdmin && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-purple-900 hover:bg-purple-100/60 cursor-pointer"
              >
                <Users className="w-4 h-4 text-purple-700" />
                <span>إدارة الموظفين</span>
              </button>
            )}
          </nav>
        )}

        {/* Action Buttons & Profile */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            
            {/* Support Chat Button with Headphones Icon (System Admin Only) */}
            {isAdmin && (
              <button
                onClick={onOpenSupportChat}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-2xs"
                title="التواصل مع الدعم الفني المباشر"
              >
                <Headphones className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="hidden sm:inline">الدعم الفني</span>
              </button>
            )}

            {/* Profile Button without name */}
            <button
              onClick={() => setActiveTab('profile')}
              title="حسابي الشخصي"
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                activeTab === 'profile'
                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
              }`}
            >
              <User className="w-4.5 h-4.5 shrink-0" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        ) : null}

      </div>
    </header>
  );
};
