import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Send, 
  X, 
  User, 
  MessageSquare, 
  Clock, 
  Check, 
  Crown, 
  Phone, 
  Mail,
  Search,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { db, collection, addDoc, onSnapshot, query, orderBy, where, doc, setDoc } from '../lib/firebase';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

interface ChatMessage {
  id: string;
  threadId: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
}

interface ChatThread {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  lastMessage: string;
  updatedAt: string;
}

const formatChatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  } catch {
    return '';
  }
};

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const isAdmin = currentUser.email.toLowerCase() === 'mfb.15.f@gmail.com' || currentUser.role === 'admin';
  
  // Active thread selection for Admin: null means show thread list for admin
  const [selectedThreadUser, setSelectedThreadUser] = useState<{ uid: string; name: string; email: string; phone?: string } | null>(
    isAdmin ? null : { uid: currentUser.uid, name: currentUser.name, email: currentUser.email, phone: currentUser.phone }
  );

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Reset selected thread when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      if (isAdmin) setSelectedThreadUser(null);
      setSearchQuery('');
    } else {
      if (!isAdmin) {
        setSelectedThreadUser({ uid: currentUser.uid, name: currentUser.name, email: currentUser.email, phone: currentUser.phone });
      }
    }
  }, [isOpen, isAdmin, currentUser]);

  // 1. If Admin: Listen to all Chat Threads
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    const threadsRef = collection(db, 'support_threads');
    const qThreads = query(threadsRef, orderBy('updatedAt', 'desc'));

    const unsubscribeThreads = onSnapshot(qThreads, (snapshot) => {
      const loaded: ChatThread[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        loaded.push({
          userId: d.id,
          userName: data.userName || 'مستخدم',
          userEmail: data.userEmail || '',
          userPhone: data.userPhone || '',
          lastMessage: data.lastMessage || '',
          updatedAt: data.updatedAt || '',
        });
      });
      setThreads(loaded);
    });

    return () => unsubscribeThreads();
  }, [isOpen, isAdmin]);

  // 2. Listen to Messages for Selected Thread (Realtime Live Chat)
  useEffect(() => {
    if (!isOpen) return;

    const targetUid = isAdmin ? selectedThreadUser?.uid : currentUser.uid;
    if (!targetUid) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'support_messages');
    const qMessages = query(
      messagesRef, 
      where('threadId', '==', targetUid)
    );

    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const loaded: ChatMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        loaded.push({
          id: d.id,
          threadId: data.threadId,
          senderUid: data.senderUid,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          text: data.text,
          createdAt: data.createdAt,
          isAdmin: !!data.isAdmin,
        });
      });
      // Sort client-side to avoid requiring a composite index in Firestore
      loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setMessages(loaded);
    }, (err) => {
      console.warn('Chat messages snapshot notice:', err);
    });

    return () => unsubscribeMessages();
  }, [isOpen, isAdmin, selectedThreadUser, currentUser.uid]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    const targetUser = isAdmin ? selectedThreadUser : { uid: currentUser.uid, name: currentUser.name, email: currentUser.email, phone: currentUser.phone };
    if (!targetUser?.uid) return;

    setSending(true);
    setInputMessage('');

    try {
      const nowIso = new Date().toISOString();

      // 1. Add Message to Firestore `support_messages`
      await addDoc(collection(db, 'support_messages'), {
        threadId: targetUser.uid,
        senderUid: currentUser.uid,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        text,
        createdAt: nowIso,
        isAdmin: isAdmin,
      });

      // 2. Update Thread summary in Firestore `support_threads`
      await setDoc(doc(db, 'support_threads', targetUser.uid), {
        userId: targetUser.uid,
        userName: targetUser.name,
        userEmail: targetUser.email,
        userPhone: targetUser.phone || '',
        lastMessage: text,
        updatedAt: nowIso,
      }, { merge: true });

    } catch (err) {
      console.error('Error sending support message:', err);
      alert('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.userPhone && t.userPhone.includes(searchQuery)) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-md font-bold shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>الدعم الفني المباشر</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>متصل الآن</span>
                </span>
              </h3>
              <p className="text-[11px] text-indigo-200">
                {isAdmin ? 'إدارة واستقبال محادثات واستفسارات المستخدمين' : 'محادثة فورية مباشرة مع إدارة 1000 القاسم'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8.5 h-8.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          
          {/* VIEW 1: ADMIN THREADS LIST (When Admin and no thread is selected) */}
          {isAdmin && !selectedThreadUser && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Search & Stats Bar */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-2xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="البحث باسم المستخدم أو البريد..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-600 transition"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 self-end sm:self-center">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>إجمالي المحادثات:</span>
                  <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono text-xs">
                    {filteredThreads.length}
                  </span>
                </div>
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
                {filteredThreads.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                      <Headphones className="w-7 h-7" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-800">لا توجد محادثات دعم فني حتى الآن</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      عندما يقوم أحد الموظفين أو المستخدمين بالتواصل مع الدعم الفني، ستظهر محادثته هنا لتتمكن من الرد عليه مباشرةً.
                    </p>
                  </div>
                ) : (
                  filteredThreads.map((t) => (
                    <button
                      key={t.userId}
                      onClick={() => setSelectedThreadUser({ uid: t.userId, name: t.userName, email: t.userEmail, phone: t.userPhone })}
                      className="w-full bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 text-right transition flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center shrink-0 font-black text-sm group-hover:scale-105 transition">
                          {t.userName.charAt(0)}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-900 transition">
                              {t.userName}
                            </span>
                            {t.userPhone && (
                              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{t.userPhone}</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-mono truncate">{t.userEmail}</p>

                          <p className="text-xs text-slate-700 line-clamp-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 mt-1">
                            💬 {t.lastMessage || 'بدأت المحادثة'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {t.updatedAt && (
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatChatTime(t.updatedAt)}</span>
                          </span>
                        )}

                        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 group-hover:bg-indigo-700 group-hover:text-white px-3 py-1.5 rounded-xl border border-indigo-200 transition flex items-center gap-1">
                          <span>فتح المحادثة والرد</span>
                          <ChevronLeft className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

            </div>
          )}

          {/* VIEW 2: ACTIVE CHAT ROOM (For Users OR Admin with selectedThreadUser) */}
          {(!isAdmin || selectedThreadUser) && (
            <div className="flex-1 flex flex-col bg-slate-100/70 overflow-hidden">
              
              {/* Active Chat Header with Back Arrow Button for Admin */}
              <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
                
                <div className="flex items-center gap-3">
                  {/* Back Arrow button for Admin to return to threads list (Icon only for max space) */}
                  {isAdmin && (
                    <button
                      onClick={() => setSelectedThreadUser(null)}
                      className="w-9 h-9 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl transition flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 shrink-0"
                      title="العودة لقائمة المحادثات"
                    >
                      <ArrowRight className="w-5 h-5 text-indigo-700" />
                    </button>
                  )}

                  {/* User info bar */}
                  {isAdmin && selectedThreadUser ? (
                    <div className="flex items-center gap-2.5 border-r border-slate-200 pr-3">
                      <div className="w-8.5 h-8.5 rounded-full bg-indigo-100 text-indigo-900 font-extrabold flex items-center justify-center text-xs shrink-0">
                        {selectedThreadUser.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                          <span>محادثة: {selectedThreadUser.name}</span>
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{selectedThreadUser.email}</span>
                          {selectedThreadUser.phone && (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{selectedThreadUser.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="font-extrabold text-xs text-slate-800">
                        التواصل المباشر مع إدارة 1000 القاسم
                      </span>
                    </div>
                  )}
                </div>

                {isAdmin && selectedThreadUser?.phone && (
                  <a
                    href={`tel:${selectedThreadUser.phone}`}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">اتصال هاتف</span>
                  </a>
                )}
              </div>

              {/* Chat Messages Scroll Window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800">بدء المحادثة الفورية</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      {isAdmin 
                        ? 'اكتب رسالتك أو ردك للمستخدم أدناه وسيصله التحديث مباشرةً.'
                        : 'اكتب استفسارك أو طلبك أدناه وسيجيبك مدير النظام فوراً.'}
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMyMessage = m.senderUid === currentUser.uid;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                          <span className="font-extrabold text-slate-600">{m.senderName}</span>
                          {m.isAdmin && (
                            <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-md text-[9px]">
                              إدارة النظام
                            </span>
                          )}
                          <span>•</span>
                          <span>{formatChatTime(m.createdAt)}</span>
                        </div>

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                            isMyMessage
                              ? 'bg-indigo-700 text-white rounded-tl-none font-medium'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-tr-none'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isAdmin ? 'اكتب ردك للمستخدم هنا...' : 'اكتب رسالتك أو استفسارك هنا...'}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600 transition"
                />

                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white p-2.5 rounded-xl transition shrink-0 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-extrabold px-4 shadow-sm active:scale-95"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>إرسال</span>
                      <Send className="w-3.5 h-3.5 rotate-180" />
                    </>
                  )}
                </button>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
