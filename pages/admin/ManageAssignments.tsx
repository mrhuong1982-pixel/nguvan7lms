
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import { Link } from 'react-router-dom';
import type { Assignment, Submission } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';

const ManageAssignments: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment> | null>(null);

    const fetchAllData = async () => {
        const assignmentData = await mockProvider.getList<Assignment>('assignments');
        const submissionData = await mockProvider.getList<Submission>('submissions');
        setAssignments(assignmentData.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
        setSubmissions(submissionData);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const getSubmissionStats = (assignmentId: string) => {
        const submitted = submissions.filter(s => s.assignmentId === assignmentId).length;
        const graded = submissions.filter(s => s.assignmentId === assignmentId && s.status === 'graded').length;
        return { submitted, graded };
    }

    const handleOpenModal = (assignment: Partial<Assignment> | null = null) => {
        setCurrentAssignment(assignment ? { ...assignment } : { title: '', description: '', dueDate: '', maxPoints: 10, type: 'text', rubric: '', lessonId: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async () => {
        if (!currentAssignment) return;
        if (currentAssignment.id) {
            await mockProvider.update<Assignment>('assignments', currentAssignment as Assignment);
        } else {
            await mockProvider.create<Assignment>('assignments', currentAssignment as Omit<Assignment, 'id'>);
        }
        fetchAllData();
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này? Mọi bài nộp liên quan cũng sẽ bị xóa.')) {
            await mockProvider.deleteOne('assignments', id);
            fetchAllData();
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Quản lý Bài tập</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm Bài tập
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tiêu đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hạn nộp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thống kê nộp bài</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {assignments.map(ass => {
                            const stats = getSubmissionStats(ass.id);
                            return (
                                <tr key={ass.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ass.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(ass.dueDate).toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{stats.submitted} đã nộp / {stats.graded} đã chấm</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                        <Link to={`/admin/assignments/${ass.id}/submissions`} className="inline-block bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Chấm bài</Link>
                                        <button onClick={() => handleOpenModal(ass)} className="text-indigo-600 hover:text-indigo-900"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(ass.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentAssignment && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentAssignment.id ? 'Sửa Bài tập' : 'Thêm Bài tập mới'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tiêu đề</label>
                            <input type="text" value={currentAssignment.title || ''} onChange={e => setCurrentAssignment({...currentAssignment, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                            <textarea value={currentAssignment.description || ''} onChange={e => setCurrentAssignment({...currentAssignment, description: e.target.value})} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Hạn nộp</label>
                                <input type="datetime-local" value={currentAssignment.dueDate ? new Date(currentAssignment.dueDate).toISOString().slice(0, 16) : ''} onChange={e => setCurrentAssignment({...currentAssignment, dueDate: new Date(e.target.value).toISOString()})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Điểm tối đa</label>
                                <input type="number" value={currentAssignment.maxPoints || ''} onChange={e => setCurrentAssignment({...currentAssignment, maxPoints: parseInt(e.target.value, 10)})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Loại bài tập</label>
                            <select value={currentAssignment.type || 'text'} onChange={e => setCurrentAssignment({...currentAssignment, type: e.target.value as 'text' | 'file'})} className="mt-1 block w-full px-3 py-2 border rounded-md">
                                <option value="text">Tự luận (nhập text)</option>
                                <option value="file">Nộp file (dán link)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tiêu chí chấm điểm (Rubric)</label>
                            <textarea value={currentAssignment.rubric || ''} onChange={e => setCurrentAssignment({...currentAssignment, rubric: e.target.value})} rows={4} placeholder="VD: 1. Đúng nội dung: 4đ..." className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleCloseModal} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSave} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default ManageAssignments;
