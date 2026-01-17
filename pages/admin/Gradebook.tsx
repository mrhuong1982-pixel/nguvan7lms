
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { User, Assignment, Submission } from '../../core/types';
import Card from '../../components/ui/Card';

const Gradebook: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            const studentData = (await mockProvider.getList<User>('users')).filter(u => u.role === 'student');
            const assignmentData = await mockProvider.getList<Assignment>('assignments');
            const submissionData = await mockProvider.getList<Submission>('submissions');
            setStudents(studentData);
            setAssignments(assignmentData);
            setSubmissions(submissionData);
        };
        fetchData();
    }, []);

    const gradebookData = useMemo(() => {
        return students.map(student => {
            const grades: { [assignmentId: string]: number | string } = {};
            let totalPoints = 0;
            let totalMaxPoints = 0;

            assignments.forEach(assignment => {
                const submission = submissions.find(s => s.studentId === student.id && s.assignmentId === assignment.id);
                if (submission && submission.grade !== undefined) {
                    grades[assignment.id] = submission.grade;
                    totalPoints += submission.grade;
                    totalMaxPoints += assignment.maxPoints;
                } else {
                    grades[assignment.id] = '–';
                }
            });

            const average = totalMaxPoints > 0 ? ((totalPoints / totalMaxPoints) * 10).toFixed(1) : 'N/A';
            return {
                studentName: student.name,
                grades,
                average
            };
        });
    }, [students, assignments, submissions]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Sổ điểm</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border">Học sinh</th>
                            {assignments.map(ass => (
                                <th key={ass.id} className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase border" title={ass.title}>
                                    {ass.title.length > 20 ? ass.title.substring(0, 20) + '...' : ass.title}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase border">TB (Hệ 10)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {gradebookData.map(row => (
                            <tr key={row.studentName}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 border">{row.studentName}</td>
                                {assignments.map(ass => (
                                    <td key={ass.id} className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 text-center border">
                                        {row.grades[ass.id]}
                                    </td>
                                ))}
                                 <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-700 text-center border">{row.average}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Gradebook;
