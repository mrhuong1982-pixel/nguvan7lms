
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { Assignment, Submission } from '../../core/types';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const MyAssignments: React.FC = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const allAssignments = await mockProvider.getList<Assignment>('assignments');
            const mySubmissions = (await mockProvider.getList<Submission>('submissions')).filter(s => s.studentId === user.id);
            setAssignments(allAssignments.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
            setSubmissions(mySubmissions);
        };
        fetchData();
    }, [user]);

    const assignmentsWithStatus = useMemo(() => {
        return assignments.map(assignment => {
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            const isOverdue = new Date(assignment.dueDate) < new Date();
            let status: 'todo' | 'submitted' | 'graded' | 'overdue' = 'todo';

            if (submission) {
                status = submission.status === 'graded' ? 'graded' : 'submitted';
            } else if (isOverdue) {
                status = 'overdue';
            }
            
            return { ...assignment, submission, status };
        });
    }, [assignments, submissions]);

    const getStatusBadge = (status: 'todo' | 'submitted' | 'graded' | 'overdue', grade?: number, maxPoints?: number) => {
        switch (status) {
            case 'graded':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Đã chấm: {grade}/{maxPoints}</span>;
            case 'submitted':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-sky-100 text-sky-800">Đã nộp - Chờ chấm</span>;
            case 'overdue':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Quá hạn</span>;
            case 'todo':
                 return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Chưa làm</span>;
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Bài tập của tôi</h1>

            <div className="space-y-4">
                {assignmentsWithStatus.map(assignment => (
                    <Card key={assignment.id}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{assignment.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">{assignment.description}</p>
                                <p className="text-sm text-slate-500 mt-2">Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}</p>
                                {assignment.submission?.feedback && (
                                    <div className="mt-3 p-3 bg-slate-50 border rounded-md">
                                        <p className="text-sm text-slate-600 mt-1"><strong>Nhận xét của giáo viên:</strong> {assignment.submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 flex flex-col items-end space-y-3">
                                {getStatusBadge(assignment.status, assignment.submission?.grade, assignment.maxPoints)}
                                <Link to={`/app/assignments/${assignment.id}`} className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-700">
                                    {assignment.submission ? 'Xem bài nộp' : 'Làm bài'}
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyAssignments;
