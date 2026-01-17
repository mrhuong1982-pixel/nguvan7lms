
import React, { useEffect, useState } from 'react';
import { mockProvider } from '../../core/provider';
import type { Announcement, Assignment, Submission } from '../../core/types';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const allAnnouncements = await mockProvider.getList<Announcement>('announcements');
            const allAssignments = await mockProvider.getList<Assignment>('assignments');
            const mySubmissions = await mockProvider.getList<Submission>('submissions');
            const submittedAssignmentIds = mySubmissions.filter(s => s.studentId === user.id).map(s => s.assignmentId);

            const studentAnnouncements = allAnnouncements
                .filter(a => a.targetAudience === 'student' || a.targetAudience === 'all')
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 3);
            setAnnouncements(studentAnnouncements);
            
            const upcoming = allAssignments
                .filter(a => !submittedAssignmentIds.includes(a.id))
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 3);
            setUpcomingAssignments(upcoming);
        };
        fetchData();
    }, [user]);

    if (!user) return null;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Chào mừng, {user.name}!</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Thông báo mới">
                    {announcements.length > 0 ? (
                        <ul className="space-y-3">
                            {announcements.map(ann => (
                                <li key={ann.id} className="p-3 bg-slate-50 rounded-md">
                                    <h4 className="font-semibold text-slate-700">{ann.title}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                                    <p className="text-xs text-slate-400 mt-2">{new Date(ann.createdAt).toLocaleString('vi-VN')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">Không có thông báo nào.</p>
                    )}
                </Card>
                <Card title="Bài tập sắp đến hạn">
                    {upcomingAssignments.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingAssignments.map(assign => (
                                <li key={assign.id} className="p-3 bg-slate-50 rounded-md">
                                    <h4 className="font-semibold text-slate-700">{assign.title}</h4>
                                    <p className="text-sm text-red-500 font-medium">Hạn chót: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">Tuyệt vời! Bạn đã hoàn thành tất cả bài tập.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default StudentDashboard;
