
export enum CompanyStatus {
  New = 'جديد',
  UnderReview = 'تحت المراجعة',
  AwaitingData = 'بانتظار بيانات',
  Completed = 'مكتمل',
}

export enum ActionType {
  Created = 'إنشاء ملف الشركة',
  StatusChanged = 'تغيير الحالة',
  NoteAdded = 'إضافة ملاحظة',
  Contacted = 'تم الاتصال بالمكلف',
  TaskAdded = 'إضافة مهمة جديدة',
}

export interface ActionLogEntry {
  id: string;
  type: ActionType;
  timestamp: string;
  details: string;
}

export interface Company {
  id: string;
  name: string;
  uniqueNumber: string;
  creationDate: string;
  status: CompanyStatus;
  notes: string;
  actionLog: ActionLogEntry[];
}

export interface Task {
  id: string;
  companyId: string;
  companyName: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
}
