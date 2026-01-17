
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { Subject, Topic } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';

const ManageSubjects: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const [isSubjectModalOpen, setSubjectModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Partial<Subject> | null>(null);
    
    const [isTopicModalOpen, setTopicModalOpen] = useState(false);
    const [currentTopic, setCurrentTopic] = useState<Partial<Topic> | null>(null);

    const fetchAllData = async () => {
        const subjectData = await mockProvider.getList<Subject>('subjects');
        const topicData = await mockProvider.getList<Topic>('topics');
        setSubjects(subjectData);
        setTopics(topicData);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredTopics = useMemo(() => 
        selectedSubject ? topics.filter(t => t.subjectId === selectedSubject.id).sort((a, b) => a.order - b.order) : [],
        [topics, selectedSubject]
    );

    // --- Subject Modal Handlers ---
    const handleOpenSubjectModal = (subject: Partial<Subject> | null = null) => {
        setCurrentSubject(subject ? { ...subject } : { name: '', description: '' });
        setSubjectModalOpen(true);
    };
    const handleSaveSubject = async () => {
        if (!currentSubject) return;
        if (currentSubject.id) {
            await mockProvider.update<Subject>('subjects', currentSubject as Subject);
        } else {
            await mockProvider.create<Subject>('subjects', currentSubject as Omit<Subject, 'id'>);
        }
        fetchAllData();
        setSubjectModalOpen(false);
    };
     const handleDeleteSubject = async (id: string) => {
        if (window.confirm('Xóa môn học sẽ xóa tất cả chủ đề liên quan. Bạn có chắc chắn?')) {
            await mockProvider.deleteOne('subjects', id);
            if (selectedSubject?.id === id) setSelectedSubject(null);
            fetchAllData();
        }
    };

    // --- Topic Modal Handlers ---
    const handleOpenTopicModal = (topic: Partial<Topic> | null = null) => {
        setCurrentTopic(topic ? { ...topic } : { name: '', order: filteredTopics.length + 1 });
        setTopicModalOpen(true);
    };
    const handleSaveTopic = async () => {
        if (!currentTopic || !selectedSubject) return;
        if (currentTopic.id) {
            await mockProvider.update<Topic>('topics', currentTopic as Topic);
        } else {
            await mockProvider.create<Topic>('topics', { ...currentTopic, subjectId: selectedSubject.id } as Omit<Topic, 'id'>);
        }
        fetchAllData();
        setTopicModalOpen(false);
    };
     const handleDeleteTopic = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
            await mockProvider.deleteOne('topics', id);
            fetchAllData();
        }
    };


    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Quản lý Môn học & Chủ đề</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Môn học</h2>
                            <button onClick={() => handleOpenSubjectModal()} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full"><PlusIcon/></button>
                        </div>
                        <ul className="space-y-2">
                            {subjects.map(sub => (
                                <li key={sub.id} 
                                    onClick={() => setSelectedSubject(sub)}
                                    className={`p-3 rounded-md cursor-pointer ${selectedSubject?.id === sub.id ? 'bg-sky-100 text-sky-800 font-semibold' : 'hover:bg-slate-100'}`}
                                >
                                    {sub.name}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        {selectedSubject ? (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Chủ đề của: {selectedSubject.name}</h2>
                                    <button onClick={() => handleOpenTopicModal()} className="flex items-center bg-sky-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-sky-700">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Thêm chủ đề
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    {filteredTopics.map(topic => (
                                        <li key={topic.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                                            <span>{topic.order}. {topic.name}</span>
                                            <div>
                                                <button onClick={() => handleOpenTopicModal(topic)} className="text-indigo-600 hover:text-indigo-900 mr-3"><EditIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteTopic(topic.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500">Chọn một môn học để xem các chủ đề.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Subject Modal */}
            {isSubjectModalOpen && currentSubject && (
                <Modal isOpen={isSubjectModalOpen} onClose={() => setSubjectModalOpen(false)} title={currentSubject.id ? 'Sửa Môn học' : 'Thêm Môn học'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên Môn học</label>
                            <input type="text" value={currentSubject.name} onChange={e => setCurrentSubject({...currentSubject, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                            <textarea value={currentSubject.description} onChange={e => setCurrentSubject({...currentSubject, description: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setSubjectModalOpen(false)} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSaveSubject} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Topic Modal */}
            {isTopicModalOpen && currentTopic && (
                <Modal isOpen={isTopicModalOpen} onClose={() => setTopicModalOpen(false)} title={currentTopic.id ? 'Sửa Chủ đề' : 'Thêm Chủ đề'}>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên Chủ đề</label>
                            <input type="text" value={currentTopic.name} onChange={e => setCurrentTopic({...currentTopic, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Thứ tự</label>
                            <input type="number" value={currentTopic.order} onChange={e => setCurrentTopic({...currentTopic, order: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setTopicModalOpen(false)} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSaveTopic} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageSubjects;
