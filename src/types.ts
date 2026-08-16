export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  emailVerified: boolean;
  createdAt?: string;
}

export interface Building {
  id: string;
  name: string;
  branch: string;
  district: string;
  locationUrl?: string;
  imageUrl?: string;
  address?: string;
  unitsCount?: number;
}

export type ReportStatus = 'pending' | 'rejected' | 'approved' | 'completed';

export interface PropertyReport {
  id: string;
  title: string;
  buildingId: string;
  buildingName: string;
  branch: string;
  district?: string;
  description: string; // المتطلبات من المورد
  status: ReportStatus;
  
  createdByUid: string;
  createdByName: string;
  createdByEmail?: string;
  createdByPhone?: string;
  createdAt: string; // ISO string

  // Manager Approval details
  approvedByUid?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Completion / Refill Details (توثيق التعبئة)
  tankPhotoBefore?: string; // صورة الخزان قبل التعبئة
  tankPhotoAfter?: string;  // صورة الخزان بعد التعبئة
  buildingPhotoUrl?: string; // صورة العمارة
  refillDate?: string;      // تاريخ ووقت التعبئة والتوريد
  completionNotes?: string; // ملاحظات الإكمال

  photoUrl?: string;        // صورة العمارة أو المعاينة العامة
  actionTaken?: string;
}

export const RIYADH_BRANCHES = [
  'فرع شمال الرياض',
  'فرع شرق الرياض',
  'فرع وسط الرياض',
  'فرع جنوب الرياض',
  'فرع غرب الرياض'
] as const;
