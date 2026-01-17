
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { Question, Topic, QuestionType, QuestionOption } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, SearchIcon } from '../../components/icons';

// Khai báo biến toàn cục XLSX từ thư viện được import trong index.html
declare var XLSX: any;

const QUESTION_TYPE_MAP: { [key in QuestionType]: string } = {
    'multiple-choice': 'Lựa chọn',
    'short-answer': 'Trả lời ngắn',
    'ordering': 'Sắp xếp',
    'fill-in-the-blank': 'Điền khuyết'
};

const DIFFICULTY_MAP: { [key in Question['difficulty']]: string } = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó'
};

const ManageQuestionBank: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [filters, setFilters] = useState({ type: '', difficulty: '', topicId: '', text: '' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Partial<Question> | null>(null);

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [parsedData, setParsedData] = useState<{ valid: Omit<Question, 'id'>[], errors: { row: number, message: string }[] } | null>(null);


    const fetchAllData = async () => {
        const [qData, tData] = await Promise.all([
            mockProvider.getList<Question>('questions'),
            mockProvider.getList<Topic>('topics')
        ]);
        setQuestions(qData);
        setTopics(tData);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => 
            (filters.type ? q.type === filters.type : true) &&
            (filters.difficulty ? q.difficulty === filters.difficulty : true) &&
            (filters.topicId ? q.topicId === filters.topicId : true) &&
            (filters.text ? q.text.toLowerCase().includes(filters.text.toLowerCase()) : true)
        );
    }, [questions, filters]);

    const handleOpenModal = (question: Partial<Question> | null = null) => {
        if (question) {
            setCurrentQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
        } else {
             setCurrentQuestion({
                text: '',
                type: 'multiple-choice',
                difficulty: 'medium',
                topicId: topics[0]?.id || '',
                options: [{id: 'opt1', text: ''}, {id: 'opt2', text: ''}],
                answers: [],
            });
        }
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
            await mockProvider.deleteOne('questions', id);
            fetchAllData();
        }
    };
    
    const handleSave = async () => {
        if (!currentQuestion) return;
        
        if (!currentQuestion.text || !currentQuestion.topicId) {
            alert('Vui lòng điền đầy đủ thông tin câu hỏi và chọn chủ đề.');
            return;
        }

        if (currentQuestion.id) {
            await mockProvider.update<Question>('questions', currentQuestion as Question);
        } else {
            await mockProvider.create<Question>('questions', currentQuestion as Omit<Question, 'id'>);
        }
        fetchAllData();
        setIsModalOpen(false);
    };
    
    // --- Import Functions ---
    const handleOpenImportModal = () => {
        setParsedData(null);
        setIsImportModalOpen(true);
    }
    
    const handleDownloadTemplate = () => {
        const sampleData = [{
            loai_cau_hoi: 'multiple-choice',
            do_kho: 'easy',
            ten_chu_de: 'Chủ đề 1: Tiếng nói vạn vật',
            de_bai: 'Truyện "Bầy chim chìa vôi" của tác giả nào?',
            lua_chon_1: 'Tô Hoài',
            lua_chon_2: 'Nguyễn Quang Sáng',
            lua_chon_3: 'Đoàn Giỏi',
            lua_chon_4: '',
            dap_an: 'opt2'
        },{
            loai_cau_hoi: 'short-answer',
            do_kho: 'medium',
            ten_chu_de: 'Chủ đề 2: Những góc nhìn cuộc sống',
            de_bai: 'Nhân vật "tôi" trong truyện "Đi lấy mật" tên là gì?',
            lua_chon_1: '', lua_chon_2: '', lua_chon_3: '', lua_chon_4: '',
            dap_an: 'An'
        },{
            loai_cau_hoi: 'fill-in-the-blank',
            do_kho: 'easy',
            ten_chu_de: 'Chủ đề 1: Tiếng nói vạn vật',
            de_bai: 'Mặt trời mọc ở hướng [BLANK] và lặn ở hướng [BLANK].',
            lua_chon_1: '', lua_chon_2: '', lua_chon_3: '', lua_chon_4: '',
            dap_an: 'đông,tây'
        }];
        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MauCauHoi");
        XLSX.writeFile(wb, "mau_nhap_cau_hoi.xlsx");
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessingFile(true);
        setParsedData(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const validRows: Omit<Question, 'id'>[] = [];
                const errorRows: { row: number, message: string }[] = [];

                const TYPE_MAP_REVERSE = Object.fromEntries(Object.entries(QUESTION_TYPE_MAP).map(([key, value]) => [value.toLowerCase(), key]));
                const DIFFICULTY_MAP_REVERSE = Object.fromEntries(Object.entries(DIFFICULTY_MAP).map(([key, value]) => [value.toLowerCase(), key]));
                const VALID_TYPES = Object.keys(QUESTION_TYPE_MAP);
                const VALID_DIFFICULTIES = Object.keys(DIFFICULTY_MAP);

                const parseType = (value: string): string | undefined => {
                    const lowerValue = String(value || '').toLowerCase();
                    if (VALID_TYPES.includes(lowerValue)) return lowerValue;
                    return TYPE_MAP_REVERSE[lowerValue];
                };
                
                const parseDifficulty = (value: string): string | undefined => {
                    const lowerValue = String(value || '').toLowerCase();
                    if (VALID_DIFFICULTIES.includes(lowerValue)) return lowerValue;
                    return DIFFICULTY_MAP_REVERSE[lowerValue];
                };

                const cleanTopicName = (name: string = '') => name.replace(/^Chủ đề\s*\d*:\s*/, '').trim();

                json.forEach((row: any, index: number) => {
                    const rowNum = index + 2; // Excel row number
                    const cleanRowTopic = cleanTopicName(row.ten_chu_de);
                    const topic = topics.find(t => cleanTopicName(t.name) === cleanRowTopic);
                    const type = parseType(row.loai_cau_hoi);
                    const difficulty = parseDifficulty(row.do_kho);

                    if (!row.de_bai) { errorRows.push({ row: rowNum, message: 'Thiếu "đề bài"' }); return; }
                    if (!topic) { errorRows.push({ row: rowNum, message: `Không tìm thấy chủ đề "${row.ten_chu_de}"` }); return; }
                    if (!type) { errorRows.push({ row: rowNum, message: 'Loại câu hỏi không hợp lệ' }); return; }
                    if (!difficulty) { errorRows.push({ row: rowNum, message: 'Độ khó không hợp lệ' }); return; }
                    if (row.dap_an === undefined || row.dap_an === null) { errorRows.push({ row: rowNum, message: 'Thiếu "đáp án"' }); return; }

                    const question: Omit<Question, 'id'> = {
                        text: String(row.de_bai),
                        type: type as QuestionType,
                        difficulty: difficulty as Question['difficulty'],
                        topicId: topic.id,
                        answers: String(row.dap_an).split(',').map(s => s.trim()),
                        options: []
                    };
                    
                    if (question.type === 'multiple-choice' || question.type === 'ordering') {
                        question.options = [
                            row.lua_chon_1 && { id: 'opt1', text: String(row.lua_chon_1) },
                            row.lua_chon_2 && { id: 'opt2', text: String(row.lua_chon_2) },
                            row.lua_chon_3 && { id: 'opt3', text: String(row.lua_chon_3) },
                            row.lua_chon_4 && { id: 'opt4', text: String(row.lua_chon_4) },
                        ].filter(Boolean) as QuestionOption[];

                        if (question.options.length < 2) {
                             errorRows.push({ row: rowNum, message: 'Câu hỏi lựa chọn/sắp xếp phải có ít nhất 2 lựa chọn.' }); return;
                        }
                    }
                    validRows.push(question);
                });
                setParsedData({ valid: validRows, errors: errorRows });
            } catch (err) {
                console.error("Lỗi xử lý file:", err);
                alert("Đã xảy ra lỗi khi đọc file. Vui lòng kiểm tra định dạng file.");
                setParsedData({ valid: [], errors: [{ row: 0, message: 'File không thể đọc được.'}] });
            } finally {
                setIsProcessingFile(false);
            }
        };
        reader.readAsBinaryString(file);
        event.target.value = ''; // Reset file input
    };

    const handleConfirmImport = async () => {
        if (!parsedData || parsedData.valid.length === 0) return;
        
        for (const q of parsedData.valid) {
            await mockProvider.create('questions', q);
        }
        alert(`Đã nhập thành công ${parsedData.valid.length} câu hỏi!`);
        fetchAllData();
        setIsImportModalOpen(false);
    };

    // --- Form Handlers ---
    const handleFormChange = (field: keyof Question, value: any) => {
        setCurrentQuestion(prev => {
            if (!prev) return null;
            const newState = { ...prev, [field]: value };
            if (field === 'type') {
                newState.options = [{id: 'opt1', text: ''}, {id: 'opt2', text: ''}];
                newState.answers = [];
            }
            return newState;
        });
    };

    const handleOptionChange = (index: number, text: string) => {
        setCurrentQuestion(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = [...prev.options];
            newOptions[index].text = text;
            return { ...prev, options: newOptions };
        });
    };

    const handleAddOption = () => {
        setCurrentQuestion(prev => {
            if (!prev) return prev;
            const newOptions = [...(prev.options || [])];
            newOptions.push({ id: `opt${newOptions.length + 1}`, text: '' });
            return { ...prev, options: newOptions };
        });
    };

    const handleRemoveOption = (index: number) => {
        setCurrentQuestion(prev => {
            if (!prev || !prev.options || prev.options.length <= 1) return prev;
            const optionIdToRemove = prev.options[index].id;
            const newOptions = prev.options.filter((_, i) => i !== index);
            const newAnswers = prev.answers?.filter(ans => ans !== optionIdToRemove);
            return { ...prev, options: newOptions, answers: newAnswers };
        });
    };

    const handleAnswerToggle = (optionId: string) => {
         setCurrentQuestion(prev => {
            if (!prev) return prev;
            const answers = prev.answers || [];
            const newAnswers = answers.includes(optionId)
                ? answers.filter(ans => ans !== optionId)
                : [...answers, optionId];
            return { ...prev, answers: newAnswers };
        });
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Ngân hàng Câu hỏi</h1>
                <div className="flex space-x-2">
                    <button onClick={handleOpenImportModal} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        <UploadIcon className="h-5 w-5 mr-2" />
                        Nhập từ Excel
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Thêm Câu hỏi
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-md">
                <input type="text" placeholder="Tìm theo đề bài..." value={filters.text} onChange={e => setFilters({...filters, text: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                <select value={filters.topicId} onChange={e => setFilters({...filters, topicId: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Tất cả chủ đề</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Tất cả loại</option>
                    {Object.entries(QUESTION_TYPE_MAP).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Tất cả độ khó</option>
                     {Object.entries(DIFFICULTY_MAP).map(([key, value]) => <option key={key} value={key as Question['difficulty']}>{value}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đề bài</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Chủ đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Loại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Độ khó</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                       {filteredQuestions.map(q => (
                           <tr key={q.id}>
                               <td className="px-6 py-4 text-sm text-slate-800 max-w-md truncate" title={q.text}>{q.text}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{topics.find(t=>t.id === q.topicId)?.name}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{QUESTION_TYPE_MAP[q.type]}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{DIFFICULTY_MAP[q.difficulty]}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                   <button onClick={() => handleOpenModal(q)} className="text-indigo-600 hover:text-indigo-900"><EditIcon className="w-5 h-5"/></button>
                                   <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                               </td>
                           </tr>
                       ))}
                    </tbody>
                </table>
            </div>
            
            {/* Add/Edit Modal */}
            {isModalOpen && currentQuestion && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentQuestion.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Common Fields */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Đề bài</label>
                            <textarea value={currentQuestion.text || ''} onChange={e => handleFormChange('text', e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                            {currentQuestion.type === 'fill-in-the-blank' && <p className="text-xs text-slate-500 mt-1">Sử dụng [BLANK] để đánh dấu chỗ trống.</p>}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Chủ đề</label>
                                <select value={currentQuestion.topicId || ''} onChange={e => handleFormChange('topicId', e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Loại câu hỏi</label>
                                <select value={currentQuestion.type || 'multiple-choice'} onChange={e => handleFormChange('type', e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                                    {Object.entries(QUESTION_TYPE_MAP).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Độ khó</label>
                                <select value={currentQuestion.difficulty || 'medium'} onChange={e => handleFormChange('difficulty', e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                                    {Object.entries(DIFFICULTY_MAP).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Options */}
                        {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'ordering') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Các lựa chọn</label>
                                <div className="space-y-2 mt-1">
                                    {currentQuestion.options?.map((opt, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input type="text" value={opt.text} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`Lựa chọn ${index + 1} (ID: ${opt.id})`} className="flex-grow px-3 py-2 border rounded-md"/>
                                            <button onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleAddOption} className="mt-2 text-sm text-sky-600 hover:underline">+ Thêm lựa chọn</button>
                            </div>
                        )}

                        {/* Answers */}
                        {currentQuestion.type === 'multiple-choice' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Đáp án đúng</label>
                                <div className="space-y-2 mt-1">
                                    {currentQuestion.options?.map(opt => (
                                        <label key={opt.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-50">
                                            <input type="checkbox" checked={currentQuestion.answers?.includes(opt.id)} onChange={() => handleAnswerToggle(opt.id)} className="h-4 w-4 text-sky-600 border-slate-300 rounded"/>
                                            <span>{opt.text || '(chưa có nội dung)'}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                         {currentQuestion.type === 'ordering' && (<div><label className="block text-sm font-medium text-slate-700">Thứ tự đúng</label><input type="text" value={(currentQuestion.answers || []).join(',')} onChange={e => handleFormChange('answers', e.target.value.split(',').map(s => s.trim()))} placeholder="VD: opt2,opt1,opt3" className="mt-1 block w-full px-3 py-2 border rounded-md"/><p className="text-xs text-slate-500 mt-1">Nhập ID của các lựa chọn theo đúng thứ tự, ngăn cách bởi dấu phẩy.</p></div>)}
                        {currentQuestion.type === 'short-answer' && (<div><label className="block text-sm font-medium text-slate-700">Các đáp án đúng được chấp nhận</label><textarea value={(currentQuestion.answers || []).join('\n')} onChange={e => handleFormChange('answers', e.target.value.split('\n'))} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md"/><p className="text-xs text-slate-500 mt-1">Mỗi đáp án đúng trên một dòng. Hệ thống sẽ không phân biệt hoa thường.</p></div>)}
                        {currentQuestion.type === 'fill-in-the-blank' && (<div><label className="block text-sm font-medium text-slate-700">Đáp án cho chỗ trống</label><textarea value={(currentQuestion.answers || []).join('\n')} onChange={e => handleFormChange('answers', e.target.value.split('\n'))} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md"/><p className="text-xs text-slate-500 mt-1">Nhập các đáp án theo đúng thứ tự của [BLANK], mỗi đáp án trên một dòng.</p></div>)}
                    </div>
                    <div className="flex justify-end pt-4 mt-4 border-t"><button onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border rounded-md mr-3">Hủy</button><button onClick={handleSave} className="bg-sky-600 text-white py-2 px-4 rounded-md">Lưu</button></div>
                </Modal>
            )}

            {/* Import Modal */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Nhập câu hỏi từ Excel">
                {isProcessingFile ? (<div className="text-center p-8">Đang xử lý file...</div>)
                : parsedData ? (
                    <div>
                        <h3 className="font-semibold">Kết quả quét file:</h3>
                        <p className="text-green-600">{parsedData.valid.length} câu hỏi hợp lệ.</p>
                        {parsedData.errors.length > 0 && <p className="text-red-600">{parsedData.errors.length} dòng bị lỗi.</p>}
                        
                        {parsedData.errors.length > 0 && (
                            <div className="mt-4 max-h-40 overflow-y-auto border p-2 rounded-md bg-slate-50">
                                <h4 className="font-semibold text-sm">Chi tiết lỗi:</h4>
                                <ul className="text-sm list-disc list-inside">
                                    {parsedData.errors.map((err, i) => <li key={i}><strong>Dòng {err.row}:</strong> {err.message}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end pt-4 mt-4 border-t">
                            <button onClick={() => setParsedData(null)} className="bg-white py-2 px-4 border rounded-md mr-3">Tải file khác</button>
                            <button onClick={handleConfirmImport} disabled={parsedData.valid.length === 0} className="bg-sky-600 text-white py-2 px-4 rounded-md disabled:bg-slate-400 disabled:cursor-not-allowed">Xác nhận Nhập liệu</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Tải lên file .xlsx theo đúng định dạng để nhập hàng loạt câu hỏi.</p>
                        <div><button onClick={handleDownloadTemplate} className="text-sky-600 font-medium hover:underline">Tải xuống file mẫu</button></div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn file để tải lên</label>
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                        </div>
                        <div className="flex justify-end pt-4"><button onClick={() => setIsImportModalOpen(false)} className="bg-white py-2 px-4 border rounded-md">Đóng</button></div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default ManageQuestionBank;
