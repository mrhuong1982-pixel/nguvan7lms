
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProvider } from '../../core/provider';
import type { Lesson, Progress } from '../../core/types';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';

const LessonDetail: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const { user } = useAuth();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!lessonId || !user) return;
        const fetchData = async () => {
            setIsLoading(true);
            const lessonData = await mockProvider.getOne<Lesson>('lessons', lessonId);
            const myProgress = await mockProvider.getList<Progress>('progress');
            
            if(lessonData && lessonData.status === 'published') {
                setLesson(lessonData);
                const progressRecord = myProgress.find(p => p.studentId === user.id && p.lessonId === lessonId);
                setIsCompleted(!!progressRecord?.completed);
            } else {
                setLesson(null); // Or redirect to a not found page
            }
            setIsLoading(false);
        };
        fetchData();
    }, [lessonId, user]);

    const handleMarkAsComplete = async () => {
        if (!user || !lessonId || isCompleted) return;
        
        await mockProvider.create<Progress>('progress', {
            studentId: user.id,
            lessonId: lessonId,
            completed: true,
            completedAt: new Date().toISOString()
        });
        setIsCompleted(true);
    };

    // Helper to convert YouTube watch links to embed links
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        // Regex for standard YouTube links (watch?v=ID)
        const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(youtubeRegExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return url;
    };

    const renderMedia = (lesson: Lesson) => {
        if (!lesson.documentUrl || lesson.mediaType === 'none') return null;

        switch (lesson.mediaType) {
            case 'video':
                const embedUrl = getEmbedUrl(lesson.documentUrl);
                return (
                    <div className="mb-6">
                        <div className="aspect-video w-full rounded-md overflow-hidden bg-black shadow-lg">
                            <iframe 
                                src={embedUrl} 
                                title="Video bài giảng" 
                                className="w-full h-full" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                );
            case 'presentation':
                return (
                    <div className="mb-6">
                        <div className="aspect-video w-full rounded-md overflow-hidden border border-slate-200 shadow-lg">
                             <iframe 
                                src={lesson.documentUrl} 
                                title="Slide bài giảng" 
                                className="w-full h-full" 
                                frameBorder="0" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                );
            case 'document':
                 return (
                    <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-md flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sky-800">Tài liệu học tập</h3>
                            <p className="text-sm text-sky-600">Tải xuống tài liệu đính kèm cho bài học này.</p>
                        </div>
                        <a href={lesson.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Tải về
                        </a>
                    </div>
                );
            default:
                return null;
        }
    }

    if (isLoading) {
        return <div className="text-center p-10">Đang tải bài giảng...</div>;
    }

    if (!lesson) {
        return (
            <div className="text-center p-10">
                <h2 className="text-xl font-semibold">Không tìm thấy bài giảng</h2>
                <p className="text-slate-500">Bài giảng này không tồn tại hoặc chưa được xuất bản.</p>
                <Link to="/app/lessons" className="mt-4 inline-block text-sky-600 hover:underline">Quay lại danh sách</Link>
            </div>
        );
    }

    return (
        <div>
             <Link to="/app/lessons" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-sky-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại danh sách
            </Link>
            <Card>
                <h1 className="text-3xl font-bold text-slate-800 mb-4 pb-4 border-b">{lesson.title}</h1>
                
                {/* Render Media Content First (Video/Slides) */}
                {renderMedia(lesson)}

                {/* Render Text Content */}
                <div className="prose max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                
                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button 
                        onClick={handleMarkAsComplete}
                        disabled={isCompleted}
                        className={`px-6 py-2 rounded-md font-semibold transition-colors flex items-center ${isCompleted ? 'bg-green-100 text-green-800 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                    >
                        {isCompleted ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Đã hoàn thành
                            </>
                        ) : 'Đánh dấu đã học'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default LessonDetail;
