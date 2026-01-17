
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { Class, User } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../components/icons';
import { useAuth } from '../../hooks/useAuth';

const ManageClasses: React.FC = () => {
    const { user: teacher } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState<Partial<Class> | null>(null);

    const fetchClasses = async () => {
        const classData = await mockProvider.getList<Class>('classes');
        setClasses(classData);
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const filteredClasses = useMemo(() => 
        classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [classes, searchTerm]
    );

    const handleOpenModal = (cls: Partial<Class> | null = null) => {
        setCurrentClass(cls ? { ...cls } : { name: '', schoolYear: '', joinCode: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentClass(null);
    };

    const handleSave = async () => {
        if (!currentClass || !teacher) return;
        
        if (currentClass.id) {
            // Update
            await mockProvider.update<Class>('classes', currentClass as Class);
        } else {
            // Create
            await mockProvider.create<Class>('classes', { 
                name: currentClass.name || '',
                schoolYear: currentClass.schoolYear || '',
                joinCode: currentClass.joinCode || '',
                teacherId: teacher.id 
            });
        }
        fetchClasses();
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
            await mockProvider.deleteOne('classes', id);
            fetchClasses();
        }
    };

    return (
        <Card>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Quản lý Lớp học</h1>
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lớp học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm Lớp học
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên lớp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Niên khóa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã tham gia</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredClasses.map(cls => (
                            <tr key={cls.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cls.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cls.schoolYear}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{cls.joinCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <button onClick={() => handleOpenModal(cls)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentClass && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentClass.id ? 'Sửa thông tin Lớp học' : 'Thêm Lớp học mới'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên lớp</label>
                            <input type="text" value={currentClass.name} onChange={e => setCurrentClass({...currentClass, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Niên khóa</label>
                            <input type="text" value={currentClass.schoolYear} onChange={e => setCurrentClass({...currentClass, schoolYear: e.target.value})} placeholder="VD: 2023-2024" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mã tham gia</label>
                            <input type="text" value={currentClass.joinCode} onChange={e => setCurrentClass({...currentClass, joinCode: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleCloseModal} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 mr-3">Hủy</button>
                            <button onClick={handleSave} className="bg-sky-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-sky-700">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default ManageClasses;
