import React, { useState } from 'react';
import { PropertyReport } from '../types';
import { MessageSquare, X, Copy, Check, ExternalLink, Building2, MapPin, Share2 } from 'lucide-react';

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  report: PropertyReport | null;
  onClose: () => void;
}

export const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({
  isOpen,
  report,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const approvalDate = report.approvedAt 
    ? new Date(report.approvedAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('ar-SA');

  // Pre-formatted WhatsApp message for Supplier
  const approverInfo = report.approvedByName ? `\n👑 تمت الموافقة بواسطة المدير: ${report.approvedByName}` : '';

  const messageText = `السلام عليكم ورحمة الله وبركاته،
طلب توريد وتعبئة خزان 🚰 - شركة 1000 القاسم العقارية

📍 العقار والعنوان: ${report.buildingName}
🏛️ الفرع والحي: ${report.branch} - ${report.district || 'الرياض'}
📝 المتطلبات والطلب: ${report.description}
${report.photoUrl ? `📷 رابط المعاينة: ${report.photoUrl}\n` : ''}🗓️ تاريخ اعتماد الطلب: ${approvalDate}${approverInfo}

الرجاء التوجه للعقار والبدء بالتعبئة والتوريد، وتوثيق الخزان (قبل وبعد التعبئة) مع صورة العمارة.
شكراً لكم.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(messageText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">رسالة التوجيه للمورد (واتساب)</h3>
              <p className="text-[11px] text-emerald-100">{report.buildingName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>تم تجهيز الرسالة تلقائياً شاملة العنوان ومتطلبات المورد</span>
          </div>

          {/* Message Text Preview Box */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">نص الرسالة الجاهزة للمورد:</label>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line max-h-56 overflow-y-auto">
              {messageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>إرسال عبر واتساب للمورد 💬</span>
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-3.5 rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>نسخ النص</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
