
import type { DataProvider } from '../dataProvider';
import type { User, Class, Topic, Lesson, Assignment, Submission, Progress, Announcement, Question } from '../types';

const getCollection = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu từ localStorage với key "${key}":`, error);
    return [];
  }
};

const setCollection = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const mockDataProvider: DataProvider = {
  seedData: () => {
    if (localStorage.getItem('seeded_v7')) { // Changed seed key for username login
      return;
    }

    // --- USERS ---
    const teacher: User = { id: 'user-gv-1', name: 'Cô Thu Hà', username: 'thuhagv', role: 'teacher', password: '123' };
    const students: User[] = [
      { id: 'user-hs-1', name: 'Nguyễn Văn An', username: 'an.nv', role: 'student', classId: 'lop-7a1', dateOfBirth: '2011-05-10', parentPhoneNumber: '0901234567', password: '123' },
      { id: 'user-hs-2', name: 'Trần Thị Bích', username: 'bich.tt', role: 'student', classId: 'lop-7a1', dateOfBirth: '2011-08-15', parentPhoneNumber: '0912345678', password: '123' },
      { id: 'user-hs-3', name: 'Lê Minh Cường', username: 'cuong.lm', role: 'student', classId: 'lop-7a1', dateOfBirth: '2011-02-20', parentPhoneNumber: '0987654321', password: '123' },
      { id: 'user-hs-4', name: 'Phạm Thị Dung', username: 'dung.pt', role: 'student', classId: 'lop-7a1', dateOfBirth: '2011-11-30', parentPhoneNumber: '0978123456', password: '123' },
    ];
    const allUsers = [teacher, ...students];
    setCollection<User>('users', allUsers);

    // --- CLASS ---
    const mainClass: Class = { id: 'lop-7a1', name: 'Lớp 7A1', teacherId: teacher.id, schoolYear: '2023-2024', joinCode: 'XYZ123' };
    setCollection<Class>('classes', [mainClass]);

    // --- TOPICS ---
    const topics: Topic[] = [
        { id: 'topic-1', name: 'Chủ đề 1: Tiếng nói vạn vật', order: 1 },
        { id: 'topic-2', name: 'Chủ đề 2: Những góc nhìn cuộc sống', order: 2 },
    ];
    setCollection<Topic>('topics', topics);

    // --- LESSONS ---
    const lessons: Lesson[] = [
        { id: 'bai-giang-1', topicId: 'topic-1', title: 'Đọc hiểu: Bầy chim chìa vôi', content: '<h2>Phần 1: Giới thiệu tác giả, tác phẩm</h2><p>Nội dung chi tiết về tác phẩm Bầy chim chìa vôi...</p>', status: 'published', documentUrl: 'https://example.com/tai-lieu-1.pdf'},
        { id: 'bai-giang-2', topicId: 'topic-1', title: 'Thực hành Tiếng Việt', content: '<h2>Nội dung: Trạng ngữ</h2><p>Ôn tập và thực hành về trạng ngữ...</p>', status: 'published'},
        { id: 'bai-giang-3', topicId: 'topic-2', title: 'Đọc hiểu: Đi lấy mật', content: '<h2>Phần 1: Bối cảnh</h2><p>Nội dung chi tiết về trích đoạn Đi lấy mật...</p>', status: 'published'},
        { id: 'bai-giang-4', topicId: 'topic-2', title: 'Viết: Bài văn biểu cảm về con người', content: 'Hướng dẫn các bước viết bài văn biểu cảm...', status: 'draft'},
    ];
    setCollection<Lesson>('lessons', lessons);
    
    // --- QUESTIONS ---
    const questions: Question[] = [
        {
            id: 'q-1',
            type: 'multiple-choice',
            text: 'Nhân vật chính trong truyện "Bầy chim chìa vôi" là ai?',
            topicId: 'topic-1',
            difficulty: 'easy',
            options: [
                { id: 'q-1-opt-1', text: 'An và Cò' },
                { id: 'q-1-opt-2', text: 'Mon và Mên' },
                { id: 'q-1-opt-3', text: 'Dế Mèn' },
            ],
            answers: ['q-1-opt-2'],
        },
        {
            id: 'q-2',
            type: 'short-answer',
            text: 'Tác phẩm "Đất rừng phương Nam" của nhà văn nào?',
            topicId: 'topic-2',
            difficulty: 'medium',
            answers: ['Đoàn Giỏi'],
        },
        {
            id: 'q-3',
            type: 'fill-in-the-blank',
            text: 'Mặt trời mọc ở hướng [BLANK] và lặn ở hướng [BLANK].',
            topicId: 'topic-1',
            difficulty: 'easy',
            answers: ['đông', 'tây'],
        },
    ];
    setCollection<Question>('questions', questions);


    // --- ASSIGNMENTS ---
    const assignments: Assignment[] = [
        { id: 'bt-1', title: 'Phân tích nhân vật Mon và Mên', description: 'Viết một đoạn văn (khoảng 200 chữ) phân tích tình cảm anh em của hai nhân vật Mon và Mên trong truyện "Bầy chim chìa vôi".', lessonId: 'bai-giang-1', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), maxPoints: 10, type: 'text', rubric: '1. Đúng nội dung: 4đ\n2. Diễn đạt: 3đ\n3. Sáng tạo: 3đ' },
        { id: 'bt-2', title: 'Cảm nhận về đoạn trích "Đi lấy mật"', description: 'Nêu cảm nhận của em về vẻ đẹp thiên nhiên và con người trong đoạn trích "Đi lấy mật". Nộp bài bằng link Google Docs.', lessonId: 'bai-giang-3', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), maxPoints: 10, type: 'file', rubric: '1. Cảm nhận sâu sắc: 5đ\n2. Bố cục rõ ràng: 5đ' },
    ];
    setCollection<Assignment>('assignments', assignments);
    
    // --- PROGRESS ---
    const progress: Progress[] = [
        { id: 'progress-1', studentId: 'user-hs-1', lessonId: 'bai-giang-1', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    setCollection<Progress>('progress', progress);

    // --- SUBMISSIONS ---
    const submissions: Submission[] = [
        { id: 'nop-bai-1', assignmentId: 'bt-1', studentId: 'user-hs-1', submittedAt: new Date().toISOString(), content: 'Bài làm của em Nguyễn Văn An...', grade: 8, feedback: 'Bài viết tốt, cần chi tiết hơn về cảm xúc nhân vật.', status: 'graded' },
        { id: 'nop-bai-2', assignmentId: 'bt-1', studentId: 'user-hs-2', submittedAt: new Date().toISOString(), content: 'Bài làm của em Trần Thị Bích...', status: 'submitted' },
    ];
    setCollection<Submission>('submissions', submissions);

    // --- ANNOUNCEMENTS ---
    const announcements: Announcement[] = [
        { id: 'tb-1', title: 'Chào mừng đến với lớp học Ngữ Văn 7!', content: 'Chào các em, đây là hệ thống học tập trực tuyến của chúng ta. Các em hãy thường xuyên truy cập để cập nhật bài giảng và bài tập nhé.', authorId: teacher.id, createdAt: new Date().toISOString(), classId: mainClass.id, targetAudience: 'student' },
        { id: 'tb-2', title: 'Thông báo họp Phụ huynh', content: 'Kính mời quý Phụ huynh tham dự buổi họp cuối học kỳ I. Thời gian: 8h00, Chủ nhật tuần này.', authorId: teacher.id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), classId: mainClass.id, targetAudience: 'parent' },
        { id: 'tb-3', title: 'Lịch nghỉ lễ', content: 'Toàn bộ học sinh sẽ được nghỉ lễ từ ngày X đến hết ngày Y.', authorId: teacher.id, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), classId: mainClass.id, targetAudience: 'all' }
    ];
    setCollection<Announcement>('announcements', announcements);

    localStorage.setItem('seeded_v7', 'true');
    console.log('Dữ liệu mẫu đã được khởi tạo.');
  },

  getList: <T>(resource: string): Promise<T[]> => {
    return Promise.resolve(getCollection<T>(resource));
  },
  
  getOne: <T>(resource: string, id: string): Promise<T | undefined> => {
    const collection = getCollection<{ id: string }>(resource);
    const item = collection.find(item => item.id === id);
    return Promise.resolve(item as T | undefined);
  },

  create: <T>(resource: string, data: Omit<T, 'id'>): Promise<T> => {
    const collection = getCollection<T>(resource);
    const newItem = { ...data, id: `${resource}-${Date.now()}` } as T;
    setCollection(resource, [...collection, newItem]);
    return Promise.resolve(newItem);
  },

  update: <T extends { id: string }>(resource: string, data: T): Promise<T> => {
    let collection = getCollection<T>(resource);
    collection = collection.map(item => item.id === data.id ? data : item);
    setCollection(resource, collection);
    return Promise.resolve(data);
  },

  deleteOne: (resource: string, id: string): Promise<void> => {
    let collection = getCollection<{ id: string }>(resource);
    collection = collection.filter(item => item.id !== id);
    setCollection(resource, collection);
    return Promise.resolve();
  },
  
  submitAssignment: (submissionData: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> => {
      const submissions = getCollection<Submission>('submissions');
      const newSubmission: Submission = {
          ...submissionData,
          id: `submission-${Date.now()}`,
          submittedAt: new Date().toISOString(),
      };
      setCollection('submissions', [...submissions, newSubmission]);
      return Promise.resolve(newSubmission);
  },

  gradeSubmission: (submissionId: string, grade: number, feedback: string): Promise<Submission> => {
      let submissions = getCollection<Submission>('submissions');
      let updatedSubmission: Submission | null = null;
      submissions = submissions.map(sub => {
          if (sub.id === submissionId) {
              updatedSubmission = { ...sub, grade, feedback, status: 'graded' };
              return updatedSubmission;
          }
          return sub;
      });
      if (!updatedSubmission) {
        return Promise.reject(new Error('Không tìm thấy bài nộp'));
      }
      setCollection('submissions', submissions);
      return Promise.resolve(updatedSubmission);
  },

  getReport: (studentId: string): Promise<any> => {
      const submissions = getCollection<Submission>('submissions').filter(s => s.studentId === studentId);
      const progress = getCollection<Progress>('progress').filter(p => p.studentId === studentId);
      return Promise.resolve({ submissions, progress });
  }
};

export default mockDataProvider;