import React, { useState } from 'react';
import { Company, ActionLogEntry, ActionType, Task } from '../types';
import { generateActionSummary } from '../services/geminiService';
import { SparklesIcon, XMarkIcon, PencilIcon } from './icons';

interface CompanyDetailsModalProps {
  company: Company;
  onClose: () => void;
  onUpdateCompany: (updatedCompany: Company) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'companyName'>) => void;
  onEditRequest: () => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ company, onClose, onUpdateCompany, onAddTask, onEditRequest }) => {
  const [newNote, setNewNote] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newAction: ActionLogEntry = {
        id: crypto.randomUUID(),
        type: ActionType.NoteAdded,
        details: newNote.trim(),
        timestamp: new Date().toISOString(),
      };
      
      const updatedCompany = {
        ...company,
        notes: company.notes ? `${company.notes}\n${newNote.trim()}` : newNote.trim(),
        actionLog: [newAction, ...company.actionLog],
      };
      
      onUpdateCompany(updatedCompany);
      setNewNote('');
    }
  };
  
  const handleContacted = () => {
    const details = `تم التواصل مع المكلف بخصوص ${company.name}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Follow up in 7 days
    const dueDateString = dueDate.toISOString().split('T')[0];

    const newTaskData: Omit<Task, 'id' | 'companyName'> = {
      companyId: company.id,
      description: `متابعة مع شركة ${company.name} بعد الاتصال الأخير.`,
      dueDate: dueDateString,
      isCompleted: false,
    };

    const contactAction: ActionLogEntry = {
      id: crypto.randomUUID(),
      type: ActionType.Contacted,
      details,
      timestamp: new Date().toISOString(),
    };
    
    const taskAction: ActionLogEntry = {
        id: crypto.randomUUID(),
        type: ActionType.TaskAdded,
        details: `تم إنشاء مهمة متابعة بتاريخ ${dueDateString}`,
        timestamp: new Date().toISOString(),
    };

    const updatedCompany = {
      ...company,
      actionLog: [taskAction, contactAction, ...company.actionLog],
    };

    onUpdateCompany(updatedCompany);
    onAddTask(newTaskData);
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setAiSummary('');
    const summary = await generateActionSummary(company.name, company.actionLog);
    setAiSummary(summary);
    setIsGeneratingSummary(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{company.name}</h2>
            <p className="text-sm text-slate-500">الرقم المميز: {company.uniqueNumber} | تاريخ الإنشاء: {company.creationDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEditRequest} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="تعديل الشركة">
                <PencilIcon className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Right side: Actions & AI Summary */}
            <div className="flex flex-col gap-4">
               <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3">إجراءات سريعة</h3>
                <div className="flex flex-col gap-3">
                   <button onClick={handleContacted} className="w-full text-right bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    اتصلت بالمكلف الآن
                   </button>
                   <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="أضف ملاحظة محاسبية جديدة..."
                    className="w-full border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-800"
                    rows={3}
                  />
                  <button onClick={handleAddNote} className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-semibold">
                    حفظ الملاحظة
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-blue-500" />
                  مساعدك الذكي
                </h3>
                <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGeneratingSummary ? 'جاري التحليل...' : 'إنشاء ملخص وتوصية'}
                </button>
                {isGeneratingSummary && <div className="text-center p-4 text-slate-500">يقوم الذكاء الاصطناعي بتحليل السجل...</div>}
                {aiSummary && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{aiSummary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Left side: Action Log */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-lg mb-3">سجل الإجراءات</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {company.actionLog.length > 0 ? (
                  company.actionLog.map(log => (
                    <div key={log.id} className="flex gap-3">
                       <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                          <div className="w-px h-full bg-slate-200"></div>
                       </div>
                       <div>
                         <p className="font-semibold text-slate-700">{log.type}</p>
                         <p className="text-sm text-slate-600">{log.details}</p>
                         <p className="text-xs text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString('ar-EG')}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">لا توجد إجراءات مسجلة بعد.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsModal;