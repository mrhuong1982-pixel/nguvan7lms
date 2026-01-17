import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockProvider } from '../../core/provider';
import type { Assignment, Submission } from '../../core/types';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';

const SubmitAssignment: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const isOverdue = assignment ? new Date(assignment.dueDate) < new Date() : false;
    const canSubmit = !submission && !isOverdue;

    useEffect(() => {
        if (!assignmentId || !user) return;
        const fetchData = async () => {
            setIsLoading(true);
            const assignmentData = await mockProvider.getOne<Assignment>('assignments', assignmentId);
            const mySubmissions = await mockProvider.getList<Submission>('submissions');
            
            setAssignment(assignmentData || null);
            const existingSubmission = mySubmissions.find(s => s.studentId === user.id && s.assignmentId === assignmentId);
            setSubmission(existingSubmission || null);
            if (existingSubmission) {
                setContent(existingSubmission.content);
            }

            setIsLoading(false);
        };
        fetchData();
    }, [assignmentId, user]);
    
    const handleSubmit = async () => {
        if (!user || !assignmentId || !content.trim()) {
            alert('Vui lòng nhập nội dung bài làm.');
            return;
        };
        
        // FIX: The `create` method requires a `submittedAt` property which was missing.
        // Replaced with `mockProvider.submitAssignment`, a specialized function
        // for this purpose that correctly handles setting the submission timestamp.
        await mockProvider.submitAssignment({
            assignmentId,
            studentId: user.id,
            content,
            status: 'submitted',
        });
        alert('Nộp bài thành công!');
        navigate('/app/assignments');
    };

    if (isLoading) return <div>Đang tải...</div>;
    if (!assignment) return <div>Không tìm thấy bài tập.</div>;

    return (
        <div>
            <Link to="/app/assignments" className="text-sky-600 hover:underline text-sm mb-4 inline-block">&larr; Quay lại danh sách bài tập</Link>
            <Card>
                <h1 className="text-3xl font-bold text-slate-800">{assignment.title}</h1>
                <p className="text-slate-500 mt-1">Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}</p>
                <p className="font-semibold mt-1">Điểm tối đa: {assignment.maxPoints}</p>
                <div className="my-4 p-4 bg-slate-50 border rounded-md">
                    <h3 className="font-semibold text-slate-700">Đề bài:</h3>
                    <p className="text-slate-600 mt-1">{assignment.description}</p>
                </div>
                <div className="my-4 p-4 bg-amber-50 border-amber-200 rounded-md">
                    <h3 className="font-semibold text-amber-800">Tiêu chí chấm điểm:</h3>
                    <p className="text-amber-700 mt-1 whitespace-pre-wrap">{assignment.rubric}</p>
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Bài làm của bạn</h2>
                    {submission ? (
                        <div>
                            {submission.status === 'graded' && (
                                <div className="mb-4 p-4 bg-green-50 border-green-200 rounded-md">
                                    <h3 className="font-semibold text-green-800">Đã chấm điểm</h3>
                                    <p className="text-2xl font-bold text-green-700 my-2">{submission.grade} / {assignment.maxPoints}</p>
                                    <p className="text-slate-600"><strong>Nhận xét:</strong> {submission.feedback}</p>
                                </div>
                            )}
                            <label className="block text-sm font-medium text-slate-700">Nội dung đã nộp:</label>
                            {assignment.type === 'file' ? (
                                <a href={submission.content} target="_blank" rel="noopener noreferrer" className="text-sky-600 break-all hover:underline">{submission.content}</a>
                            ) : (
                                <p className="mt-1 p-3 w-full bg-slate-100 border rounded-md whitespace-pre-wrap">{submission.content}</p>
                            )}
                        </div>
                    ) : isOverdue ? (
                         <div className="p-4 text-center bg-red-50 border-red-200 rounded-md">
                            <p className="font-semibold text-red-700">Đã quá hạn nộp bài.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignment.type === 'text' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nhập nội dung bài làm</label>
                                    <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Dán link bài làm (VD: Google Docs, OneDrive)</label>
                                    <input type="url" value={content} onChange={e => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                                </div>
                            )}
                            <button onClick={handleSubmit} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">
                                Nộp bài
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default SubmitAssignment;