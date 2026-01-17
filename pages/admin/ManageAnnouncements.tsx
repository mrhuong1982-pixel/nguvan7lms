
import React, { useEffect, useState } from 'react';
import { mockProvider } from '../../core/provider';
import type { Announcement, Class } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';
import { useAuth } from '../../hooks/useAuth';

const ManageAnnouncements: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);

    const fetchAnnouncements = async () => {
        const data = await mockProvider.getList<Announcement>('announcements');
        setAnnouncements(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleOpenModal = (ann: Partial<Announcement> | null = null) => {
        setCurrentAnnouncement(ann ? { ...ann } : { title: '', content: '', targetAudience: 'student' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async () => {
        if (!currentAnnouncement || !user) return;
        const classId = (await mockProvider.getList<Class>('classes'))[0]?.id || 'lop-7a1';

        if (currentAnnouncement.id) {
            await mockProvider.update<Announcement>('announcements', currentAnnouncement as Announcement);
        } else {
            await mockProvider.create<Announcement>('announcements', {
                title: currentAnnouncement.title || '',
                content: currentAnnouncement.content || '',
                targetAudience: currentAnnouncement.targetAudience || 'student',
                authorId: user.id,
                classId: classId,
                createdAt: new Date().toISOString(),
            });
        }
        fetchAnnouncements();
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            await mockProvider.deleteOne('announcements', id);
            fetchAnnouncements();
        }
    };
    
    const getAudienceText = (audience: 'student' | 'parent' | 'all') => {
        switch (audience) {
            case 'student': return 'Học sinh';
            case 'parent': return 'Phụ huynh';
            case 'all': return 'Tất cả';
            default: return '';
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Quản lý Thông báo</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tạo Thông báo
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tiêu đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đối tượng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày tạo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {announcements.map(ann => (
                             <tr key={ann.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ann.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getAudienceText(ann.targetAudience)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(ann.createdAt).toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                    <button onClick={() => handleOpenModal(ann)} className="text-indigo-600 hover:text-indigo-900"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(ann.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentAnnouncement && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentAnnouncement.id ? 'Sửa Thông báo' : 'Tạo Thông báo mới'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tiêu đề</label>
                            <input type="text" value={currentAnnouncement.title || ''} onChange={e => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nội dung</label>
                            <textarea value={currentAnnouncement.content || ''} onChange={e => setCurrentAnnouncement({...currentAnnouncement, content: e.target.value})} rows={5} className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Gửi đến</label>
                            <select value={currentAnnouncement.targetAudience || 'student'} onChange={e => setCurrentAnnouncement({...currentAnnouncement, targetAudience: e.target.value as any})} className="mt-1 block w-full px-3 py-2 border rounded-md">
                                <option value="student">Học sinh</option>
                                <option value="parent">Phụ huynh</option>
                                <option value="all">Tất cả</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleCloseModal} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSave} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu & Gửi</button>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default ManageAnnouncements;
