import React from 'react';
import { Home, FileText, Plus, User, Building2, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'reports' | 'add' | 'users' | 'profile';
  onChangeTab: (tab: 'home' | 'reports' | 'add' | 'users' | 'profile') => void;
  onOpenAddModal: () => void;
  onOpenBuildingsModal?: () => void;
  onOpenUserManagement?: () => void;
  onOpenAddBuilding?: () => void;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  onOpenBuildingsModal,
  onOpenUserManagement,
  onOpenAddBuilding,
  isAdmin,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg py-2 px-4" dir="rtl">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        
        {/* 1. Home (الرئيسية) */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTab === 'home' 
              ? 'text-indigo-700 font-extrabold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight font-extrabold">الرئيسية</span>
        </button>

        {/* 2. Reports (التقارير) - For non-admin */}
        {!isAdmin ? (
          <button
            type="button"
            onClick={() => onChangeTab('reports')}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === 'reports' 
                ? 'text-indigo-700 font-extrabold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-extrabold">التقارير</span>
          </button>
        ) : (
          <div className="w-[38px]"></div>
        )}

        {/* 3. Center Plus Button (+) */}
        <button
          type="button"
          onClick={() => {
            if (isAdmin && onOpenAddBuilding) {
              onOpenAddBuilding();
            } else {
              onOpenAddModal();
            }
          }}
          className={`w-12 h-12 -mt-5 ${isAdmin ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/30 ring-purple-100' : 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/30 ring-indigo-100'} text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition border-2 border-white ring-2 cursor-pointer`}
          title={isAdmin ? "إضافة عقار جديد" : "إضافة تقرير جديد"}
        >
          {isAdmin ? <Building2 className="w-6 h-6 stroke-[2.5]" /> : <Plus className="w-7 h-7 stroke-[2.5]" />}
        </button>

        {/* 4. Accounts (الحسابات) for Admin OR empty space for symmetry */}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => onOpenUserManagement && onOpenUserManagement()}
            className="flex flex-col items-center gap-1 transition text-purple-700 hover:text-purple-900 cursor-pointer"
            title="إدارة الحسابات"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-extrabold">الحسابات</span>
          </button>
        ) : (
          <div className="w-[38px]"></div>
        )}

        {/* 5. Profile (حسابي) */}
        <button
          type="button"
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTab === 'profile' 
              ? 'text-indigo-700 font-extrabold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight font-extrabold">حسابي</span>
        </button>

      </div>
    </div>
  );
};
