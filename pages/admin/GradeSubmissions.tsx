
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProvider } from '../../core/provider';
import type { Assignment, Submission, User } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const GradeSubmissions: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<number>(0);
    const [feedback, setFeedback] = useState('');

    const fetchAllData = async () => {
        if (!assignmentId) return;
        const assignmentData = await mockProvider.getOne<Assignment>('assignments', assignmentId);
        const allSubmissions = await mockProvider.getList<Submission>('submissions');
        const studentData = await mockProvider.getList<User>('users');
        
        setAssignment(assignmentData || null);
        setSubmissions(allSubmissions.filter(s => s.assignmentId === assignmentId));
        setStudents(studentData.filter(u => u.role === 'student'));
    };
    
    useEffect(() => {
        fetchAllData();
    }, [assignmentId]);

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Không rõ';

    const handleOpenModal = (submission: Submission) => {
        setCurrentSubmission(submission);
        setGrade(submission.grade || 0);
        setFeedback(submission.feedback || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveGrade = async () => {
        if (!currentSubmission) return;
        await mockProvider.gradeSubmission(currentSubmission.id, grade, feedback);
        fetchAllData();
        handleCloseModal();
    };

    if (!assignment) return <div>Đang tải thông tin bài tập...</div>;

    return (
        <Card>
            <h1 className="text-2xl font-bold text-slate-800">Chấm bài: {assignment.title}</h1>
            <p className="text-slate-600 mb-4">Điểm tối đa: {assignment.maxPoints}</p>
            <Link to="/admin/assignments" className="text-sky-600 hover:underline text-sm mb-4 inline-block">&larr; Quay lại danh sách bài tập</Link>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Học sinh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thời gian nộp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {submissions.map(sub => (
                             <tr key={sub.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getStudentName(sub.studentId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(sub.submittedAt).toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {sub.status === 'graded' ? `Đã chấm: ${sub.grade}/${assignment.maxPoints}` : 'Chờ chấm'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <button onClick={() => handleOpenModal(sub)} className="text-indigo-600 hover:text-indigo-900">Xem & Chấm điểm</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {submissions.length === 0 && <p className="text-center p-4 text-slate-500">Chưa có học sinh nào nộp bài.</p>}
            </div>
            
            {isModalOpen && currentSubmission && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Chấm bài cho ${getStudentName(currentSubmission.studentId)}`}>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Nội dung bài nộp:</h4>
                            {assignment.type === 'file' ? (
                                <a href={currentSubmission.content} target="_blank" rel="noopener noreferrer" className="text-sky-600 break-all hover:underline">{currentSubmission.content}</a>
                            ) : (
                                <p className="p-2 bg-slate-50 border rounded-md whitespace-pre-wrap">{currentSubmission.content}</p>
                            )}
                        </div>
                         <div>
                            <h4 className="font-semibold">Tiêu chí chấm điểm:</h4>
                            <p className="p-2 bg-slate-50 border rounded-md whitespace-pre-wrap">{assignment.rubric}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Điểm số</label>
                                <input type="number" value={grade} onChange={e => setGrade(Number(e.target.value))} max={assignment.maxPoints} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Lời phê / Nhận xét</label>
                            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleCloseModal} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button>
                            <button onClick={handleSaveGrade} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu điểm</button>
                        </div>
                    </div>
                </Modal>
            )}

        </Card>
    );
};

export default GradeSubmissions;
