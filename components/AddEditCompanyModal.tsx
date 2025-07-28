
import React, { useState, useEffect } from 'react';
import { Company, CompanyStatus } from '../types';
import { XMarkIcon } from './icons';

interface FormData {
    name: string;
    uniqueNumber: string;
    status: CompanyStatus;
    notes: string;
}

interface AddEditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  companyToEdit: Company | null;
}

const AddEditCompanyModal: React.FC<AddEditCompanyModalProps> = ({ isOpen, onClose, onSave, companyToEdit }) => {
  const initialState: FormData = {
    name: '',
    uniqueNumber: '',
    status: CompanyStatus.New,
    notes: ''
  };

  const [formData, setFormData] = useState<FormData>(initialState);

  useEffect(() => {
    if (companyToEdit && isOpen) {
      setFormData({
        name: companyToEdit.name,
        uniqueNumber: companyToEdit.uniqueNumber,
        status: companyToEdit.status,
        notes: companyToEdit.notes,
      });
    } else {
      setFormData(initialState);
    }
  }, [companyToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as CompanyStatus }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.uniqueNumber) {
        alert("الرجاء إدخال اسم الشركة والرقم المميز.");
        return;
    }
    onSave(formData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              {companyToEdit ? 'تعديل شركة' : 'إضافة شركة جديدة'}
            </h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">اسم الشركة</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" />
            </div>
            <div>
              <label htmlFor="uniqueNumber" className="block text-sm font-medium text-slate-700 mb-1">الرقم المميز</label>
              <input type="text" name="uniqueNumber" id="uniqueNumber" value={formData.uniqueNumber} onChange={handleChange} required className="w-full border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">حالة الشركة</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900">
                {Object.values(CompanyStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900"></textarea>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors font-semibold">
              إلغاء
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              {companyToEdit ? 'حفظ التغييرات' : 'إضافة الشركة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCompanyModal;