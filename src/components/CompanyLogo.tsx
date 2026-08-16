import React from 'react';
import logoImg from '../assets/images/company_logo_1786912374391.jpg';

interface CompanyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showBetaBadge?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ showBetaBadge }) => {
  return (
    <div className="flex items-center gap-2" dir="rtl">
      {/* Company Logo Image with 222x240 aspect ratio */}
      <img
        src={logoImg}
        alt="شعار الشركة"
        referrerPolicy="no-referrer"
        className="w-11 h-[48px] max-h-12 object-contain rounded-xl border border-slate-200/80 shadow-2xs shrink-0"
        style={{ aspectRatio: '222/240' }}
      />
      {showBetaBadge && (
        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wide shadow-2xs">
          Beta • تجريبي
        </span>
      )}
    </div>
  );
};


