
import React, { useEffect, useState } from 'react';
import { mockProvider } from '../../core/provider';
import type { User, Submission, Announcement, Class, Assignment } from '../../core/types';
import Card from '../../components/ui/Card';
import { UsersIcon, FileTextIcon, BellIcon } from '../../components/icons';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ 
        studentCount: 0, 
        pendingSubmissions: 0, 
        classCount: 0, 
        upcomingAssignments: 0 
    });
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const users = await mockProvider.getList<User>('users');
            const submissions = await mockProvider.getList<Submission>('submissions');
            const announcementsData = await mockProvider.getList<Announcement>('announcements');
            const classes = await mockProvider.getList<Class>('classes');
            const assignments = await mockProvider.getList<Assignment>('assignments');
            
            setStats({
                studentCount: users.filter(u => u.role === 'student').length,
                pendingSubmissions: submissions.filter(s => !s.grade).length,
                classCount: classes.length,
                upcomingAssignments: assignments.filter(a => new Date(a.dueDate) > new Date()).length
            });
            setAnnouncements(announcementsData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3)); 
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Bảng điều khiển Giáo viên</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="bg-sky-50 border-sky-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-sky-100 rounded-full">
                           <UsersIcon className="h-6 w-6 text-sky-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-slate-500">Tổng số học sinh</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.studentCount}</p>
                        </div>
                    </div>
                </Card>
                 <Card className="bg-indigo-50 border-indigo-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-100 rounded-full">
                           <UsersIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-slate-500">Tổng số Lớp học</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.classCount}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-amber-100 rounded-full">
                           <FileTextIcon className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-slate-500">Bài nộp cần chấm</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.pendingSubmissions}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-rose-50 border-rose-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-rose-100 rounded-full">
                           <FileTextIcon className="h-6 w-6 text-rose-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-slate-500">Bài tập sắp tới hạn</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.upcomingAssignments}</p>
                        </div>
                    </div>
                </Card>
            </div>
            
            <Card title="Thông báo gần đây">
                {announcements.length > 0 ? (
                    <ul className="space-y-4">
                        {announcements.map(ann => (
                            <li key={ann.id} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                                <h4 className="font-semibold text-slate-700">{ann.title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                                <p className="text-xs text-slate-400 mt-2">Đăng lúc: {new Date(ann.createdAt).toLocaleString('vi-VN')}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500">Chưa có thông báo nào.</p>
                )}
            </Card>
        </div>
    );
};

export default AdminDashboard;
