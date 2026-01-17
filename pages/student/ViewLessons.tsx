
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockProvider } from '../../core/provider';
import type { Lesson, Progress, Topic } from '../../core/types';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import { BookOpenIcon } from '../../components/icons';

const ViewLessons: React.FC = () => {
    const { user } = useAuth();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [progress, setProgress] = useState<Progress[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const [allTopics, allLessons, myProgress] = await Promise.all([
                mockProvider.getList<Topic>('topics'),
                mockProvider.getList<Lesson>('lessons'),
                mockProvider.getList<Progress>('progress')
            ]);
            
            setTopics(allTopics);
            setLessons(allLessons.filter(l => l.status === 'published'));
            setProgress(myProgress.filter(p => p.studentId === user.id && p.completed));
        };
        fetchData();
    }, [user]);

    const completedLessonIds = useMemo(() => new Set(progress.map(p => p.lessonId)), [progress]);

    const lessonsByTopic = useMemo(() => {
        return topics
            .map(topic => ({
                ...topic,
                lessons: lessons.filter(lesson => lesson.topicId === topic.id)
            }))
            .filter(topic => topic.lessons.length > 0)
            .sort((a, b) => a.order - b.order);
    }, [topics, lessons]);


    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Chương trình học</h1>
            {lessonsByTopic.length > 0 ? (
                <div className="space-y-6">
                    {lessonsByTopic.map(topic => (
                        <Card key={topic.id} title={topic.name}>
                            <ul className="space-y-3">
                                {topic.lessons.map(lesson => (
                                    <li key={lesson.id}>
                                        <Link to={`/app/lessons/${lesson.id}`} className="flex items-center justify-between p-4 rounded-md bg-slate-50 hover:bg-sky-50 border border-slate-200 transition-colors">
                                            <div className="flex items-center">
                                                <BookOpenIcon className="h-5 w-5 text-sky-600 mr-3"/>
                                                <span className="font-medium text-slate-700">{lesson.title}</span>
                                            </div>
                                            {completedLessonIds.has(lesson.id) && (
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã học</span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <p className="text-center text-slate-500 py-8">Chưa có bài giảng nào được xuất bản.</p>
                </Card>
            )}
        </div>
    );
};

export default ViewLessons;
