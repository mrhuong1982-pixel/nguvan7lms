
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { Lesson, Topic } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';

const ManageLessons: React.FC = () => {
    // Data state
    const [topics, setTopics] = useState<Topic[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    // Topic Modal state
    const [isTopicModalOpen, setTopicModalOpen] = useState(false);
    const [currentTopic, setCurrentTopic] = useState<Partial<Topic> | null>(null);
    
    // Lesson Modal state
    const [isLessonModalOpen, setLessonModalOpen] = useState(false);
    const [currentLesson, setCurrentLesson] = useState<Partial<Lesson> | null>(null);

    const fetchAllData = async () => {
        const [topicData, lessonData] = await Promise.all([
            mockProvider.getList<Topic>('topics'),
            mockProvider.getList<Lesson>('lessons')
        ]);
        const sortedTopics = topicData.sort((a, b) => a.order - b.order);
        setTopics(sortedTopics);
        setLessons(lessonData);
        // Preserve selection or select first topic
        if (selectedTopic) {
            setSelectedTopic(topicData.find(t => t.id === selectedTopic.id) || null);
        } else if (sortedTopics.length > 0) {
            setSelectedTopic(sortedTopics[0]);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredLessons = useMemo(() => 
        selectedTopic ? lessons.filter(l => l.topicId === selectedTopic.id) : [],
        [lessons, selectedTopic]
    );

    // --- Topic Handlers ---
    const handleOpenTopicModal = (topic: Partial<Topic> | null = null) => {
        setCurrentTopic(topic ? { ...topic } : { name: '', order: topics.length + 1 });
        setTopicModalOpen(true);
    };

    const handleSaveTopic = async () => {
        if (!currentTopic) return;
        if (currentTopic.id) {
            await mockProvider.update<Topic>('topics', currentTopic as Topic);
        } else {
            await mockProvider.create<Topic>('topics', currentTopic as Omit<Topic, 'id'>);
        }
        setTopicModalOpen(false);
        fetchAllData();
    };

    const handleDeleteTopic = async (id: string) => {
        if (window.confirm('Xóa chủ đề sẽ xóa tất cả bài giảng liên quan. Bạn có chắc chắn?')) {
            const lessonsToDelete = lessons.filter(l => l.topicId === id);
            for (const lesson of lessonsToDelete) {
                await mockProvider.deleteOne('lessons', lesson.id);
            }
            await mockProvider.deleteOne('topics', id);
            
            if (selectedTopic?.id === id) setSelectedTopic(null);
            fetchAllData();
        }
    };

    // --- Lesson Handlers ---
    const handleOpenLessonModal = (lesson: Partial<Lesson> | null = null) => {
        setCurrentLesson(lesson ? { ...lesson } : { 
            title: '', 
            content: '', 
            status: 'draft', 
            documentUrl: '',
            mediaType: 'none' 
        });
        setLessonModalOpen(true);
    };

    const handleSaveLesson = async () => {
        if (!currentLesson || !selectedTopic) return;
        if (currentLesson.id) {
            await mockProvider.update<Lesson>('lessons', currentLesson as Lesson);
        } else {
            await mockProvider.create<Lesson>('lessons', { ...currentLesson, topicId: selectedTopic.id } as Omit<Lesson, 'id'>);
        }
        setLessonModalOpen(false);
        fetchAllData();
    };

     const handleDeleteLesson = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài giảng này?')) {
            await mockProvider.deleteOne('lessons', id);
            fetchAllData();
        }
    };
    
    const handleToggleLessonStatus = async (lesson: Lesson) => {
        const newStatus = lesson.status === 'published' ? 'draft' : 'published';
        await mockProvider.update('lessons', { ...lesson, status: newStatus });
        fetchAllData();
    };

    const getUrlLabel = (type?: string) => {
        switch(type) {
            case 'video': return 'Link Video (YouTube, Vimeo, mp4...)';
            case 'presentation': return 'Link Trình chiếu (Google Slides Publish Link...)';
            case 'document': return 'Link tải tài liệu (PDF, Word...)';
            default: return 'Link liên kết (Tùy chọn)';
        }
    };

    const getUrlPlaceholder = (type?: string) => {
        switch(type) {
            case 'video': return 'https://www.youtube.com/watch?v=...';
            case 'presentation': return 'https://docs.google.com/presentation/d/e/.../pub?start=false';
            default: return 'https://example.com/tai-lieu.pdf';
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Quản lý Chủ đề & Bài giảng</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Topics Column */}
                <div className="md:col-span-1">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Chủ đề bài học</h2>
                            <button onClick={() => handleOpenTopicModal()} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="Thêm chủ đề mới"><PlusIcon className="w-5 h-5"/></button>
                        </div>
                        <ul className="space-y-2">
                            {topics.map(topic => (
                                <li key={topic.id} 
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${selectedTopic?.id === topic.id ? 'bg-sky-100 text-sky-800 font-semibold' : 'hover:bg-slate-100'}`}
                                >
                                    <span>{topic.order}. {topic.name}</span>
                                    <div className="flex items-center space-x-2 opacity-50 hover:opacity-100">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenTopicModal(topic); }} className="text-indigo-600 hover:text-indigo-900"><EditIcon className="w-4 h-4"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }} className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Lessons Column */}
                <div className="md:col-span-2">
                    <Card>
                        {selectedTopic ? (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Các tiết học: {selectedTopic.name}</h2>
                                    <button onClick={() => handleOpenLessonModal()} className="flex items-center bg-sky-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-sky-700">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Thêm tiết học
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tiêu đề tiết học</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {filteredLessons.map(lesson => (
                                                <tr key={lesson.id}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{lesson.title}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                        <button onClick={() => handleToggleLessonStatus(lesson)} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${lesson.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {lesson.status === 'published' ? 'Đã Xuất bản' : 'Bản nháp'}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                                        <button onClick={() => handleOpenLessonModal(lesson)} className="text-indigo-600 hover:text-indigo-900"><EditIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500">Chọn một chủ đề để xem các tiết học.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Topic Modal */}
            {isTopicModalOpen && currentTopic && (
                <Modal isOpen={isTopicModalOpen} onClose={() => setTopicModalOpen(false)} title={currentTopic.id ? 'Sửa Chủ đề' : 'Thêm Chủ đề'}>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên Chủ đề</label>
                            <input type="text" value={currentTopic.name || ''} onChange={e => setCurrentTopic({...currentTopic, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Thứ tự</label>
                            <input type="number" value={currentTopic.order || 0} onChange={e => setCurrentTopic({...currentTopic, order: parseInt(e.target.value, 10)})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setTopicModalOpen(false)} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSaveTopic} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}
            
            {/* Lesson Modal */}
            {isLessonModalOpen && currentLesson && (
                <Modal isOpen={isLessonModalOpen} onClose={() => setLessonModalOpen(false)} title={currentLesson.id ? 'Sửa Tiết học' : 'Thêm Tiết học mới'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tiêu đề</label>
                            <input type="text" value={currentLesson.title || ''} onChange={e => setCurrentLesson({...currentLesson, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700">Loại Media</label>
                                <select 
                                    value={currentLesson.mediaType || 'none'} 
                                    onChange={e => setCurrentLesson({...currentLesson, mediaType: e.target.value as any})}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="none">Không có</option>
                                    <option value="video">Video (YouTube/MP4)</option>
                                    <option value="presentation">Slide Trình chiếu</option>
                                    <option value="document">Tài liệu tải về</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">{getUrlLabel(currentLesson.mediaType)}</label>
                                <input 
                                    type="text" 
                                    value={currentLesson.documentUrl || ''} 
                                    onChange={e => setCurrentLesson({...currentLesson, documentUrl: e.target.value})} 
                                    placeholder={getUrlPlaceholder(currentLesson.mediaType)}
                                    disabled={currentLesson.mediaType === 'none'}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-slate-100 disabled:text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nội dung bài học (Text)</label>
                            <textarea value={currentLesson.content || ''} onChange={e => setCurrentLesson({...currentLesson, content: e.target.value})} rows={10} className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setLessonModalOpen(false)} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSaveLesson} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageLessons;
