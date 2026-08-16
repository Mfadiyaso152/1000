import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  orderBy,
  FirebaseUser 
} from './lib/firebase';
import { UserProfile, PropertyReport, Building, ReportStatus } from './types';
import { INITIAL_BUILDINGS, INITIAL_REPORTS } from './data/initialData';

// UI Components
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { ReportCard } from './components/ReportCard';
import { NewReportModal } from './components/NewReportModal';
import { EditReportModal } from './components/EditReportModal';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { BuildingManagementModal } from './components/BuildingManagementModal';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';
import { PhonePromptModal } from './components/PhonePromptModal';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { UserManagementModal } from './components/UserManagementModal';
import { SupportChatModal } from './components/SupportChatModal';
import { ApprovalConfirmModal } from './components/ApprovalConfirmModal';
import { WhatsAppMessageModal } from './components/WhatsAppMessageModal';
import { CompleteReportModal } from './components/CompleteReportModal';

import { 
  Plus, 
  FileText, 
  UserCheck,
  ChevronLeft,
  Building2,
  Users,
  Headphones,
  MapPin,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Firestore Data State
  const [reports, setReports] = useState<PropertyReport[]>(INITIAL_REPORTS);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);

  // Tab Navigation State: 'home' | 'reports' | 'add' | 'users' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'reports' | 'add' | 'users' | 'profile'>('home');
  const [reportFilterTab, setReportFilterTab] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');

  // Modals State
  const [isNewReportOpen, setIsNewReportOpen] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<PropertyReport | null>(null);
  const [selectedReportDetails, setSelectedReportDetails] = useState<PropertyReport | null>(null);
  const [selectedReportForApproval, setSelectedReportForApproval] = useState<PropertyReport | null>(null);
  const [selectedReportForWhatsApp, setSelectedReportForWhatsApp] = useState<PropertyReport | null>(null);
  const [selectedReportForCompletion, setSelectedReportForCompletion] = useState<PropertyReport | null>(null);
  const [isBuildingsModalOpen, setIsBuildingsModalOpen] = useState<boolean>(false);
  const [buildingModalInitialTab, setBuildingModalInitialTab] = useState<'list' | 'add'>('list');
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);

  const handleOpenAddBuilding = () => {
    setBuildingModalInitialTab('add');
    setIsBuildingsModalOpen(true);
  };

  const handleOpenBuildingsModal = () => {
    setBuildingModalInitialTab('list');
    setIsBuildingsModalOpen(true);
  };

  // 1. Firebase Auth Listener & User Profile Live Sync
  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const isAdminEmail = user.email?.toLowerCase() === 'mfb.15.f@gmail.com';
        const userDocRef = doc(db, 'users', user.uid);

        // Realtime listener for user document changes (like role promotion by admin)
        unsubscribeUserDoc = onSnapshot(userDocRef, async (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data();
            const calculatedRole = isAdminEmail ? 'admin' : (data.role || 'none');

            // If admin email, ensure role is saved as admin in Firestore
            if (isAdminEmail && data.role !== 'admin') {
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            }

            const profile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: data.name || user.displayName || 'مستخدم القاسم',
              phone: data.phone || '',
              role: calculatedRole,
              emailVerified: user.emailVerified,
            };

            setCurrentUser(profile);

            // Trigger Phone Prompt Modal if phone is missing
            if (!data.phone || data.phone.trim() === '') {
              setIsPhoneModalOpen(true);
            } else {
              setIsPhoneModalOpen(false);
            }

          } else {
            // First time user registration profile creation
            const defaultRole = isAdminEmail ? 'admin' : 'none';
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'مستخدم القاسم',
              phone: user.phoneNumber || '',
              role: defaultRole,
              emailVerified: user.emailVerified,
              createdAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, defaultProfile);
            setCurrentUser(defaultProfile);

            if (!defaultProfile.phone) {
              setIsPhoneModalOpen(true);
            }
          }
          setAuthLoading(false);
        }, (err) => {
          console.error('Error in user doc listener:', err);
          setAuthLoading(false);
        });

      } else {
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // 2. Real-time Firestore Listeners for Reports & Buildings
  useEffect(() => {
    try {
      const reportsRef = collection(db, 'property_reports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'));

      const unsubscribeReports = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loadedReports: PropertyReport[] = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          } as PropertyReport));
          setReports(loadedReports);
        } else {
          setReports([]);
        }
      }, (err) => {
        console.warn('Firestore snapshot notice:', err);
      });

      const bldgRef = collection(db, 'buildings');
      const unsubscribeBldgs = onSnapshot(bldgRef, (snapshot) => {
        if (!snapshot.empty) {
          const loadedBldgs: Building[] = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          } as Building));
          setBuildings(loadedBldgs);
        }
      });

      return () => {
        unsubscribeReports();
        unsubscribeBldgs();
      };
    } catch (e) {
      console.error('Snapshot listener error:', e);
    }
  }, []);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google popup notice:', err);
      // Fallback demo user if popup blocked in sandboxed iframe
      const demoUser: UserProfile = {
        uid: 'demo-google-user',
        email: 'user.google@alqasam.com',
        name: 'مستخدم Google',
        phone: '',
        role: 'none',
        emailVerified: true
      };
      setCurrentUser(demoUser);
      setIsPhoneModalOpen(true);
    }
  };

  // Submit Phone Handler
  const handleSubmitPhone = async (phone: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { phone });
      setCurrentUser(prev => prev ? { ...prev, phone } : null);
      setIsPhoneModalOpen(false);
    } catch (err) {
      console.error('Error saving phone number:', err);
      // Local fallback
      setCurrentUser(prev => prev ? { ...prev, phone } : null);
      setIsPhoneModalOpen(false);
    }
  };

  const handleUpdateProfile = async (updated: { name: string; phone?: string }) => {
    if (!currentUser) return;
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: updated.name,
        phone: updated.phone || null,
      });
    } catch (e) {
      console.warn('Profile save notice:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(null);
  };

  // Submit New Report Action
  const handleSubmitNewReport = async (reportData: {
    buildingId: string;
    buildingName: string;
    branch: string;
    district: string;
    title: string;
    description: string;
    photoUrl?: string;
  }): Promise<string | null> => {
    if (!currentUser) return null;

    const newReport: Omit<PropertyReport, 'id'> = {
      ...reportData,
      status: 'pending',
      createdByUid: currentUser.uid,
      createdByName: currentUser.name,
      createdByEmail: currentUser.email,
      createdByPhone: currentUser.phone || '',
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, 'property_reports'), newReport);
      const createdObj = { id: docRef.id, ...newReport };
      setReports(prev => [createdObj, ...prev]);
      return docRef.id;
    } catch (err) {
      console.error('Firestore save fallback:', err);
      const localId = 'rep-' + Date.now();
      const localReport = { id: localId, ...newReport };
      setReports(prev => [localReport, ...prev]);
      return localId;
    }
  };

  // Save Edited Report Action
  const handleSaveEditedReport = async (updatedData: {
    id: string;
    title: string;
    buildingId: string;
    buildingName: string;
    branch: string;
    district?: string;
    description: string;
    status: ReportStatus;
    photoUrl?: string;
  }) => {
    try {
      const reportRef = doc(db, 'property_reports', updatedData.id);
      await updateDoc(reportRef, {
        title: updatedData.title,
        buildingId: updatedData.buildingId,
        buildingName: updatedData.buildingName,
        branch: updatedData.branch,
        district: updatedData.district || 'الرياض',
        description: updatedData.description,
        status: updatedData.status,
        photoUrl: updatedData.photoUrl || null,
      });
    } catch (e) {
      console.warn('Fallback local report update:', e);
    }

    setReports(prev => prev.map(r => r.id === updatedData.id ? { 
      ...r, 
      ...updatedData, 
      photoUrl: updatedData.photoUrl || undefined 
    } : r));
  };

  // Delete Report Action
  const handleDeleteReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, 'property_reports', reportId);
      await deleteDoc(reportRef);
    } catch (e) {
      console.warn('Fallback local report delete:', e);
    }

    setReports(prev => prev.filter(r => r.id !== reportId));
    if (selectedReportDetails?.id === reportId) {
      setSelectedReportDetails(null);
    }
  };

  // Manager Approves Report Action
  const handleConfirmApproveReport = async (reportId: string) => {
    if (!currentUser) return;

    const managerName = currentUser.name && currentUser.name.trim() !== '' 
      ? currentUser.name 
      : (currentUser.email ? currentUser.email.split('@')[0] : 'المدير');

    const approvalData = {
      status: 'approved' as ReportStatus,
      approvedByUid: currentUser.uid,
      approvedByName: managerName,
      approvedAt: new Date().toISOString(),
    };

    try {
      const reportRef = doc(db, 'property_reports', reportId);
      await updateDoc(reportRef, approvalData);
    } catch (e) {
      console.warn('Fallback local report approve:', e);
    }

    let targetReport: PropertyReport | null = null;
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const updated = { ...r, ...approvalData };
        targetReport = updated;
        return updated;
      }
      return r;
    }));

    if (selectedReportDetails?.id === reportId) {
      setSelectedReportDetails(prev => prev ? { ...prev, ...approvalData } : null);
    }

    // Immediately trigger WhatsApp direction message modal after manager approval!
    if (targetReport) {
      setSelectedReportForWhatsApp(targetReport);
    }
  };

  // Manager Rejects Report Action
  const handleRejectReport = async (reportId: string) => {
    const rejectionData = {
      status: 'rejected' as ReportStatus,
    };

    try {
      const reportRef = doc(db, 'property_reports', reportId);
      await updateDoc(reportRef, rejectionData);
    } catch (e) {
      console.warn('Fallback local report reject:', e);
    }

    setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...rejectionData } : r));
    if (selectedReportDetails?.id === reportId) {
      setSelectedReportDetails(prev => prev ? { ...prev, ...rejectionData } : null);
    }
  };

  // Employee Submits Refill Completion with Photos & Date Action
  const handleCompleteRefill = async (data: {
    reportId: string;
    tankPhotoBefore: string;
    tankPhotoAfter: string;
    buildingPhotoUrl: string;
    refillDate: string;
    completionNotes?: string;
  }) => {
    const completionData = {
      status: 'completed' as ReportStatus,
      tankPhotoBefore: data.tankPhotoBefore,
      tankPhotoAfter: data.tankPhotoAfter,
      buildingPhotoUrl: data.buildingPhotoUrl,
      refillDate: data.refillDate,
      completionNotes: data.completionNotes || null,
    };

    try {
      const reportRef = doc(db, 'property_reports', data.reportId);
      await updateDoc(reportRef, completionData);
    } catch (e) {
      console.warn('Fallback local report completion:', e);
    }

    setReports(prev => prev.map(r => r.id === data.reportId ? { 
      ...r, 
      ...completionData,
      completionNotes: data.completionNotes || undefined
    } : r));

    if (selectedReportDetails?.id === data.reportId) {
      setSelectedReportDetails(prev => prev ? { 
        ...prev, 
        ...completionData,
        completionNotes: data.completionNotes || undefined
      } : null);
    }
  };

  // Add Building Action
  const handleAddBuilding = async (buildingData: Omit<Building, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'buildings'), buildingData);
      const newBldg = { id: docRef.id, ...buildingData };
      setBuildings(prev => [newBldg, ...prev]);
    } catch (e) {
      const localId = 'bldg-' + Date.now();
      setBuildings(prev => [{ id: localId, ...buildingData }, ...prev]);
    }
  };

  // Delete Building Action
  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      const bldgRef = doc(db, 'buildings', buildingId);
      await deleteDoc(bldgRef);
    } catch (e) {
      console.warn('Delete building fallback:', e);
    }
    setBuildings(prev => prev.filter(b => b.id !== buildingId));
  };

  const isAdmin = currentUser?.email.toLowerCase() === 'mfb.15.f@gmail.com' || currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isEmployee = currentUser?.role === 'employee';
  const canApprove = isAdmin || isManager;
  const isPendingApproval = currentUser && currentUser.role === 'none' && !isAdmin;

  const completedCount = reports.filter(r => r.status === 'completed').length;
  const pendingCount = reports.length - completedCount;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800" dir="rtl">
        <div className="w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-indigo-950 font-extrabold">1000 القاسم...</p>
      </div>
    );
  }

  // 1. Not Logged In -> Render Clean AuthScreen without top header bar
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col items-center justify-center" dir="rtl">
        <AuthScreen
          onLogin={async () => {}}
          onRegister={async () => {}}
          onGoogleSignIn={handleGoogleSignIn}
          onQuickDemoLogin={() => {}}
          error={authError}
          successMessage={authSuccess}
          loading={authLoading}
        />
      </div>
    );
  }

  // 2. Logged In but awaiting Admin Approval (Role === 'none')
  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col" dir="rtl">
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenSupportChat={() => setIsSupportChatOpen(true)}
        />

        <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex items-center justify-center">
          <PendingApprovalScreen
            currentUser={currentUser}
            onOpenSupportChat={() => setIsSupportChatOpen(true)}
            onLogout={handleLogout}
          />
        </div>

        {/* Support Chat Modal */}
        <SupportChatModal
          isOpen={isSupportChatOpen}
          onClose={() => setIsSupportChatOpen(false)}
          currentUser={currentUser}
        />

        {/* Phone Prompt Modal */}
        <PhonePromptModal
          isOpen={isPhoneModalOpen}
          userEmail={currentUser.email}
          userName={currentUser.name}
          onSubmitPhone={handleSubmitPhone}
        />
      </div>
    );
  }

  // 3. Approved User / Admin -> Full Main Responsive Application View
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col" dir="rtl">
      
      {/* Top Header Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenSupportChat={() => setIsSupportChatOpen(true)}
        onOpenBuildingsModal={handleOpenBuildingsModal}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
      />

      {/* Main Responsive Canvas Container (Tablet / Desktop / Mobile) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12 space-y-6">
        
        <AnimatePresence mode="wait">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              
              {/* Employee/Admin Welcome & Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-7 rounded-3xl border border-indigo-200/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-extrabold">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>أهلاً وسهلاً بك</span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white">
                      {currentUser.name}
                    </h2>
                    <p className="text-xs text-indigo-200">
                      نظام إدارة عقارات وتقارير 1000 القاسم بالرياض
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isAdmin && (
                      <button
                        onClick={() => setIsUserManagementOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Users className="w-4 h-4 text-amber-300" />
                        <span>الحسابات</span>
                      </button>
                    )}

                    {!isAdmin && (
                      <button
                        onClick={() => setIsNewReportOpen(true)}
                        className="bg-white text-indigo-900 hover:bg-slate-100 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>إضافة تقرير جديد</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* RECENT REPORTS SECTION (LATEST 3 REPORTS ONLY) */}
              {!isAdmin && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-700" />
                      <span>آخر الأعمال (أحدث 3 تقارير)</span>
                    </h3>

                    {reports.length > 0 && (
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="text-xs text-indigo-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>عرض كافة التقارير</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reports.slice(0, 3).map(rep => (
                        <ReportCard
                          key={rep.id}
                          report={rep}
                          variant="full"
                          isAdmin={canApprove}
                          onSelect={(r) => setSelectedReportDetails(r)}
                          onApprove={(r) => setSelectedReportForApproval(r)}
                          onReject={(r) => handleRejectReport(r.id)}
                          onSendWhatsApp={(r) => setSelectedReportForWhatsApp(r)}
                          onCompleteRefill={(r) => setSelectedReportForCompletion(r)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-2xs">
                      <FileText className="w-8 h-8 text-indigo-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">لا توجد تقارير حتى الآن</p>
                      <button
                        onClick={() => setIsNewReportOpen(true)}
                        className="bg-indigo-700 text-white text-xs font-black py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة أول تقرير عقاري</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* TAB CONTENT: FULL REPORTS GRID & FILTERS */}
          {!isAdmin && activeTab === 'reports' && (
            <motion.div
              key="reports-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  <span>تقارير وتعبئة الخزانات ({reports.length})</span>
                </h3>
                {!isAdmin && (
                  <button
                    onClick={() => setIsNewReportOpen(true)}
                    className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تقرير جديد</span>
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                <button
                  onClick={() => setReportFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    reportFilterTab === 'all'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  الكل ({reports.length})
                </button>
                <button
                  onClick={() => setReportFilterTab('pending')}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    reportFilterTab === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  بانتظار الموافقة ⏳ ({reports.filter(r => r.status === 'pending' || (r.status as string) === 'pending_approval').length})
                </button>
                <button
                  onClick={() => setReportFilterTab('approved')}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    reportFilterTab === 'approved'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  مقبول بالتعبئة 🚰 ({reports.filter(r => r.status === 'approved').length})
                </button>
                <button
                  onClick={() => setReportFilterTab('completed')}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    reportFilterTab === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  مكتمل وموثق 🟢 ({reports.filter(r => r.status === 'completed').length})
                </button>
                <button
                  onClick={() => setReportFilterTab('rejected')}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    reportFilterTab === 'rejected'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  مرفوض ❌ ({reports.filter(r => r.status === 'rejected').length})
                </button>
              </div>

              {/* Reports Grid */}
              {reports.filter(r => {
                if (reportFilterTab === 'pending') return r.status === 'pending' || (r.status as string) === 'pending_approval';
                if (reportFilterTab === 'approved') return r.status === 'approved';
                if (reportFilterTab === 'completed') return r.status === 'completed';
                if (reportFilterTab === 'rejected') return r.status === 'rejected';
                return true;
              }).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {reports
                    .filter(r => {
                      if (reportFilterTab === 'pending') return r.status === 'pending' || (r.status as string) === 'pending_approval';
                      if (reportFilterTab === 'approved') return r.status === 'approved';
                      if (reportFilterTab === 'completed') return r.status === 'completed';
                      if (reportFilterTab === 'rejected') return r.status === 'rejected';
                      return true;
                    })
                    .map(rep => (
                      <ReportCard
                        key={rep.id}
                        report={rep}
                        variant="full"
                        isAdmin={canApprove}
                        onSelect={(r) => setSelectedReportDetails(r)}
                        onEdit={(r) => setEditingReport(r)}
                        onDelete={(id) => handleDeleteReport(id)}
                        onApprove={(r) => setSelectedReportForApproval(r)}
                        onReject={(r) => handleRejectReport(r.id)}
                        onSendWhatsApp={(r) => setSelectedReportForWhatsApp(r)}
                        onCompleteRefill={(r) => setSelectedReportForCompletion(r)}
                      />
                    ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-2xs">
                  <FileText className="w-12 h-12 text-indigo-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">لا توجد تقارير في هذه الفئة</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: PROFILE (MY ACCOUNT) */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="max-w-2xl mx-auto w-full"
            >
              <ProfileScreen
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onLogout={handleLogout}
                onOpenSupportChat={() => setIsSupportChatOpen(true)}
                onOpenUserManagement={() => setIsUserManagementOpen(true)}
                onOpenBuildingsModal={handleOpenBuildingsModal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'add') {
            if (isAdmin) {
              handleOpenAddBuilding();
            } else {
              setIsNewReportOpen(true);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => setIsNewReportOpen(true)}
        onOpenBuildingsModal={handleOpenBuildingsModal}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenAddBuilding={handleOpenAddBuilding}
        isAdmin={isAdmin}
      />

      {/* ALL MODALS */}

      <PhonePromptModal
        isOpen={isPhoneModalOpen}
        userEmail={currentUser.email}
        userName={currentUser.name}
        onSubmitPhone={handleSubmitPhone}
      />

      <SupportChatModal
        isOpen={isSupportChatOpen}
        onClose={() => setIsSupportChatOpen(false)}
        currentUser={currentUser}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={currentUser}
      />

      <BuildingManagementModal
        buildings={buildings}
        isOpen={isBuildingsModalOpen}
        initialTab={buildingModalInitialTab}
        onClose={() => setIsBuildingsModalOpen(false)}
        onAddBuilding={handleAddBuilding}
        onDeleteBuilding={handleDeleteBuilding}
      />

      <NewReportModal
        buildings={buildings}
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onSubmitReport={handleSubmitNewReport}
      />

      <EditReportModal
        report={editingReport}
        buildings={buildings}
        isOpen={!!editingReport}
        onClose={() => setEditingReport(null)}
        onSaveReport={handleSaveEditedReport}
      />

      <ReportDetailsModal
        report={selectedReportDetails}
        isOpen={!!selectedReportDetails}
        isAdmin={canApprove}
        onClose={() => setSelectedReportDetails(null)}
        onEdit={(r) => {
          setSelectedReportDetails(null);
          setEditingReport(r);
        }}
        onDelete={(id) => handleDeleteReport(id)}
        onApprove={(r) => setSelectedReportForApproval(r)}
        onReject={(r) => handleRejectReport(r.id)}
        onSendWhatsApp={(r) => setSelectedReportForWhatsApp(r)}
        onCompleteRefill={(r) => setSelectedReportForCompletion(r)}
      />

      <ApprovalConfirmModal
        report={selectedReportForApproval}
        isOpen={!!selectedReportForApproval}
        onClose={() => setSelectedReportForApproval(null)}
        onConfirmApprove={handleConfirmApproveReport}
      />

      <WhatsAppMessageModal
        report={selectedReportForWhatsApp}
        isOpen={!!selectedReportForWhatsApp}
        onClose={() => setSelectedReportForWhatsApp(null)}
      />

      <CompleteReportModal
        report={selectedReportForCompletion}
        isOpen={!!selectedReportForCompletion}
        onClose={() => setSelectedReportForCompletion(null)}
        onCompleteReport={handleCompleteRefill}
      />

    </div>
  );
}
