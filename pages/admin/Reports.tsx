
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { User, Lesson, Progress, Assignment, Submission } from '../../core/types';
import Card from '../../components/ui/Card';

interface AtRiskStudent {
    id: string;
    name: string;
    lateSubmissions: number;
    averageGrade: number | null;
    reasons: string[];
}

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<User[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [progress, setProgress] = useState<Progress[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [studentData, lessonData, progressData, assignmentData, submissionData] = await Promise.all([
                mockProvider.getList<User>('users').then(users => users.filter(u => u.role === 'student')),
                mockProvider.getList<Lesson>('lessons'),
                mockProvider.getList<Progress>('progress'),
                mockProvider.getList<Assignment>('assignments'),
                mockProvider.getList<Submission>('submissions'),
            ]);
            setStudents(studentData);
            setLessons(lessonData);
            setProgress(progressData);
            setAssignments(assignmentData);
            setSubmissions(submissionData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const reportData = useMemo(() => {
        if (loading || students.length === 0) {
            return {
                lessonCompletionRate: 0,
                onTimeSubmissionRate: 0,
                atRiskStudents: [],
            };
        }

        // --- Lesson Completion ---
        const publishedLessons = lessons.filter(l => l.status === 'published');
        const totalPossibleCompletions = students.length * publishedLessons.length;
        const actualCompletions = progress.filter(p => p.completed).length;
        const lessonCompletionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0;

        // --- On-Time Submissions ---
        let onTimeSubmissionsCount = 0;
        submissions.forEach(sub => {
            const assignment = assignments.find(a => a.id === sub.assignmentId);
            if (assignment && new Date(sub.submittedAt) <= new Date(assignment.dueDate)) {
                onTimeSubmissionsCount++;
            }
        });
        const onTimeSubmissionRate = submissions.length > 0 ? (onTimeSubmissionsCount / submissions.length) * 100 : 0;

        // --- At-Risk Students ---
        const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
        const classTotalGrades = gradedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        const classAverageGrade = gradedSubmissions.length > 0 ? classTotalGrades / gradedSubmissions.length : 0;
        
        const atRiskStudents: AtRiskStudent[] = students.map(student => {
            const studentSubmissions = submissions.filter(s => s.studentId === student.id);
            let lateSubmissionsCount = 0;
            studentSubmissions.forEach(sub => {
                const assignment = assignments.find(a => a.id === sub.assignmentId);
                if (assignment && new Date(sub.submittedAt) > new Date(assignment.dueDate)) {
                    lateSubmissionsCount++;
                }
            });

            const studentGradedSubmissions = studentSubmissions.filter(s => s.grade !== undefined);
            const studentTotalGrades = studentGradedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
            const studentAverageGrade = studentGradedSubmissions.length > 0 ? studentTotalGrades / studentGradedSubmissions.length : null;

            const reasons: string[] = [];
            if (lateSubmissionsCount > 2) {
                reasons.push(`${lateSubmissionsCount} bài nộp muộn`);
            }
            if (studentAverageGrade !== null && classAverageGrade > 0 && studentAverageGrade < classAverageGrade) {
                reasons.push(`Điểm TB thấp (${studentAverageGrade.toFixed(1)})`);
            }

            return {
                id: student.id,
                name: student.name,
                lateSubmissions: lateSubmissionsCount,
                averageGrade: studentAverageGrade,
                reasons,
            };
        }).filter(s => s.reasons.length > 0);

        return {
            lessonCompletionRate,
            onTimeSubmissionRate,
            atRiskStudents,
        };

    }, [loading, students, lessons, progress, assignments, submissions]);

    if (loading) return <div>Đang tải báo cáo...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Báo cáo & Thống kê</h1>
            <Card title="Tổng quan Lớp học">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-slate-600 mb-2">Tỷ lệ hoàn thành bài giảng</h4>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                            <div 
                                className="bg-sky-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" 
                                style={{ width: `${reportData.lessonCompletionRate.toFixed(0)}%` }}>
                                {reportData.lessonCompletionRate.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-600 mb-2">Tỷ lệ nộp bài đúng hạn</h4>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                            <div 
                                className="bg-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" 
                                style={{ width: `${reportData.onTimeSubmissionRate.toFixed(0)}%` }}>
                                {reportData.onTimeSubmissionRate.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="mt-6">
                 <Card title="Học sinh cần chú ý">
                     {reportData.atRiskStudents.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                           {reportData.atRiskStudents.map(student => (
                               <li key={student.id} className="py-4 flex justify-between items-center">
                                   <span className="font-medium text-slate-800">{student.name}</span>
                                   <div>
                                        {student.reasons.map((reason, index) => (
                                            <span key={index} className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">
                                                {reason}
                                            </span>
                                        ))}
                                   </div>
                               </li>
                           ))}
                        </ul>
                     ) : (
                         <p className="text-center py-4 text-slate-500">Không có học sinh nào trong danh sách cần chú ý. Rất tốt!</p>
                     )}
                 </Card>
            </div>
        </div>
    );
};

export default Reports;
