
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Company, Task, CompanyStatus, ActionType, ActionLogEntry } from './types';
import { CalendarIcon, PhoneIcon, PlusIcon, PrintIcon } from './components/icons';
import CompanyDetailsModal from './components/CompanyDetailsModal';
import AddEditCompanyModal from './components/AddEditCompanyModal';
import { generateCompaniesReport } from './services/pdfGenerator';

// Mock Initial Data for first-time use
const getInitialCompanies = (): Company[] => {
    return [
        {
            id: 'c1',
            name: 'شركة الوادي الأخضر للتجارة',
            uniqueNumber: 'ZAT-001',
            creationDate: '2023-05-15',
            status: CompanyStatus.UnderReview,
            notes: 'تم استلام القوائم المالية الأولية.',
            actionLog: [
                { id: 'a1', type: ActionType.StatusChanged, details: 'الحالة تغيرت إلى تحت المراجعة', timestamp: new Date(Date.now() - 86400000 * 2).toISOString()},
                { id: 'a2', type: ActionType.Created, details: 'تم إنشاء ملف الشركة.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString()},
            ]
        },
        {
            id: 'c2',
            name: 'مؤسسة الصحراء الذهبية للمقاولات',
            uniqueNumber: 'ZAT-002',
            creationDate: '2023-08-20',
            status: CompanyStatus.AwaitingData,
            notes: 'بانتظار كشف حساب البنك لآخر 6 أشهر.',
             actionLog: [
                { id: 'a3', type: ActionType.Contacted, details: 'تم الاتصال بالمكلف لطلب كشوفات البنك.', timestamp: new Date(Date.now() - 86400000 * 1).toISOString()},
                { id: 'a4', type: ActionType.Created, details: 'تم إنشاء ملف الشركة.', timestamp: new Date(Date.now() - 86400000 * 10).toISOString()},
            ]
        },
         {
            id: 'c3',
            name: 'مصنع النور للصناعات البلاستيكية',
            uniqueNumber: 'ZAT-003',
            creationDate: '2024-01-10',
            status: CompanyStatus.New,
            notes: 'شركة جديدة، لم تبدأ المراجعة بعد.',
            actionLog: [
                { id: 'a5', type: ActionType.Created, details: 'تم إنشاء ملف الشركة.', timestamp: new Date().toISOString()},
            ]
        },
    ];
};

const getInitialTasks = (companies: Company[]): Task[] => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

    return [
        { id: 't1', companyId: 'c2', companyName: companies.find(c=>c.id === 'c2')?.name || '', description: 'الاتصال بالمكلف للاستفسار عن كشوفات البنك', dueDate: today.toISOString().split('T')[0], isCompleted: false },
        { id: 't2', companyId: 'c1', companyName: companies.find(c=>c.id === 'c1')?.name || '', description: 'مراجعة بند الأصول الثابتة', dueDate: tomorrow.toISOString().split('T')[0], isCompleted: false },
    ];
};


const App: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

    useEffect(() => {
        try {
            const storedCompanies = localStorage.getItem('companies');
            const storedTasks = localStorage.getItem('tasks');
            
            const initialCompanies = storedCompanies ? JSON.parse(storedCompanies) : getInitialCompanies();
            setCompanies(initialCompanies);

            const initialTasks = storedTasks ? JSON.parse(storedTasks) : getInitialTasks(initialCompanies);
            setTasks(initialTasks);

        } catch (error) {
            console.error("Failed to parse from localStorage", error);
            const initialCompanies = getInitialCompanies();
            setCompanies(initialCompanies);
            setTasks(getInitialTasks(initialCompanies));
        }
    }, []);

    useEffect(() => {
        if (companies.length > 0) {
          localStorage.setItem('companies', JSON.stringify(companies));
        }
      }, [companies]);
    
      useEffect(() => {
        if (tasks.length > 0) {
          localStorage.setItem('tasks', JSON.stringify(tasks));
        }
      }, [tasks]);

    const handleUpdateCompany = useCallback((updatedCompany: Company) => {
        setCompanies(prevCompanies =>
            prevCompanies.map(c => (c.id === updatedCompany.id ? updatedCompany : c))
        );
        if(selectedCompany?.id === updatedCompany.id) {
            setSelectedCompany(updatedCompany);
        }
    }, [selectedCompany]);

    const handleAddTask = useCallback((newTaskData: Omit<Task, 'id' | 'companyName'>) => {
        const companyName = companies.find(c => c.id === newTaskData.companyId)?.name || 'شركة غير محددة';
        const newTask: Task = {
            ...newTaskData,
            id: crypto.randomUUID(),
            companyName,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    }, [companies]);

    const handleOpenAddModal = () => {
        setCompanyToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = () => {
        if (selectedCompany) {
            setCompanyToEdit(selectedCompany);
            setSelectedCompany(null); // Close details modal
            setIsAddEditModalOpen(true);
        }
    };

    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setCompanyToEdit(null);
    };
    
    const handleSaveCompany = useCallback((data: { name: string; uniqueNumber: string; status: CompanyStatus; notes: string; }) => {
        if (companyToEdit) {
            // Edit existing company
            const updatedCompany: Company = {
                ...companyToEdit,
                ...data,
                actionLog: [
                    {
                        id: crypto.randomUUID(),
                        type: ActionType.StatusChanged,
                        details: 'تم تحديث بيانات الشركة.',
                        timestamp: new Date().toISOString(),
                    },
                    ...companyToEdit.actionLog,
                ],
            };
            setCompanies(prev => prev.map(c => (c.id === companyToEdit.id ? updatedCompany : c)));
        } else {
            // Add new company
            const newCompany: Company = {
                id: crypto.randomUUID(),
                creationDate: new Date().toISOString().split('T')[0],
                ...data,
                actionLog: [{
                    id: crypto.randomUUID(),
                    type: ActionType.Created,
                    details: 'تم إنشاء ملف الشركة.',
                    timestamp: new Date().toISOString(),
                }],
            };
            setCompanies(prev => [newCompany, ...prev]);
        }
        handleCloseAddEditModal();
    }, [companyToEdit]);

    const handlePrintReport = () => {
        generateCompaniesReport(filteredCompanies);
    };

    const filteredCompanies = useMemo(() =>
        companies.filter(company =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.uniqueNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ), [companies, searchTerm]);

    const todaysTasks = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return tasks.filter(task => task.dueDate === todayStr && !task.isCompleted);
    }, [tasks]);

    const getStatusColor = (status: CompanyStatus) => {
        switch (status) {
            case CompanyStatus.New: return 'bg-blue-100 text-blue-800';
            case CompanyStatus.UnderReview: return 'bg-yellow-100 text-yellow-800';
            case CompanyStatus.AwaitingData: return 'bg-orange-100 text-orange-800';
            case CompanyStatus.Completed: return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-3xl font-bold text-slate-800">سكرتيري الذكي</h1>
                        <div className="flex items-center gap-3">
                            <button onClick={handlePrintReport} className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition-colors">
                                <PrintIcon className="w-5 h-5" />
                                <span>طباعة تقرير</span>
                            </button>
                            <button onClick={handleOpenAddModal} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-transform hover:scale-105">
                                <PlusIcon className="w-5 h-5" />
                                <span>إضافة شركة</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Today's Agenda */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">المهام اليومية</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        {todaysTasks.length > 0 ? (
                            <ul className="space-y-4">
                                {todaysTasks.map(task => (
                                    <li key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                                <PhoneIcon className="w-5 h-5"/>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{task.description}</p>
                                                <p className="text-sm text-slate-500">{task.companyName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span>اليوم</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-4">لا توجد مهام مستعجلة لليوم. يومك هادئ!</p>
                        )}
                    </div>
                </section>
                
                {/* Companies List */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold">قائمة الشركات</h2>
                         <div className="w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="ابحث عن شركة بالاسم أو الرقم..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map(company => (
                            <div key={company.id} onClick={() => setSelectedCompany(company)} className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{company.name}</h3>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                                            {company.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">الرقم المميز: {company.uniqueNumber}</p>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                        <span className="font-semibold">آخر إجراء:</span> {company.actionLog[0]?.details || 'لا توجد إجراءات مسجلة.'}
                                        <span className="block text-xs text-slate-400 mt-1">{new Date(company.actionLog[0]?.timestamp).toLocaleDateString('ar-SA')}</span>
                                    </p>
                                </div>
                                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                                    تاريخ الإنشاء: {company.creationDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {selectedCompany && (
                <CompanyDetailsModal
                    company={selectedCompany}
                    onClose={() => setSelectedCompany(null)}
                    onUpdateCompany={handleUpdateCompany}
                    onAddTask={handleAddTask}
                    onEditRequest={handleOpenEditModal}
                />
            )}

            {isAddEditModalOpen && (
                <AddEditCompanyModal
                    isOpen={isAddEditModalOpen}
                    onClose={handleCloseAddEditModal}
                    onSave={handleSaveCompany}
                    companyToEdit={companyToEdit}
                />
            )}
        </div>
    );
};

export default App;