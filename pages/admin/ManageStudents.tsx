
import React, { useEffect, useState, useMemo } from 'react';
import { mockProvider } from '../../core/provider';
import type { User, Class } from '../../core/types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, KeyIcon } from '../../components/icons';

const ManageStudents: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);

    // State for Password Reset Modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedStudentForPassword, setSelectedStudentForPassword] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');


    const fetchAllData = async () => {
        const studentData = (await mockProvider.getList<User>('users')).filter(u => u.role === 'student');
        const classData = await mockProvider.getList<Class>('classes');
        setStudents(studentData);
        setClasses(classData);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredStudents = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return students.filter(s => 
            s.name.toLowerCase().includes(lowercasedTerm) || 
            s.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [students, searchTerm]);

    const handleOpenModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user ? { ...user } : { name: '', username: '', dateOfBirth: '', parentPhoneNumber: '', classId: '', role: 'student' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSave = async () => {
        if (!currentUser) return;
        
        if (currentUser.id) {
            await mockProvider.update<User>('users', currentUser as User);
        } else {
            await mockProvider.create<User>('users', { 
                ...currentUser,
                role: 'student',
                password: '123' // Set default password for new students
            } as Omit<User, 'id'>);
        }
        fetchAllData();
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
            await mockProvider.deleteOne('users', id);
            fetchAllData();
        }
    };

    // Password Reset Handlers
    const handleOpenPasswordModal = (student: User) => {
        setSelectedStudentForPassword(student);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setSelectedStudentForPassword(null);
    };

    const handleSavePassword = async () => {
        setPasswordError('');
        if (newPassword.length < 3) {
            setPasswordError('Mật khẩu phải có ít nhất 3 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (selectedStudentForPassword) {
            const updatedStudent = { ...selectedStudentForPassword, password: newPassword };
            await mockProvider.update<User>('users', updatedStudent);
            alert(`Đã cập nhật mật khẩu cho học sinh ${selectedStudentForPassword.name}.`);
            handleClosePasswordModal();
            fetchAllData(); // Refresh data to show new password if needed
        }
    };

    return (
        <Card>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Quản lý Học sinh</h1>
            <div className="flex justify-between items-center mb-4">
                 <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm Học sinh
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Họ tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên đăng nhập</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mật khẩu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lớp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày sinh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SĐT Phụ huynh</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{student.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{student.password}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{classes.find(c => c.id === student.classId)?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.dateOfBirth}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.parentPhoneNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <button onClick={() => handleOpenModal(student)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Sửa thông tin"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleOpenPasswordModal(student)} className="text-slate-600 hover:text-slate-900 mr-4" title="Đặt lại mật khẩu"><KeyIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900" title="Xóa học sinh"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Student Modal */}
            {isModalOpen && currentUser && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentUser.id ? 'Sửa thông tin Học sinh' : 'Thêm Học sinh mới'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Họ tên</label>
                            <input type="text" value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                            <input type="text" value={currentUser.username} onChange={e => setCurrentUser({...currentUser, username: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Lớp</label>
                            <select value={currentUser.classId} onChange={e => setCurrentUser({...currentUser, classId: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm">
                                <option value="">Chọn lớp</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Ngày sinh</label>
                            <input type="date" value={currentUser.dateOfBirth} onChange={e => setCurrentUser({...currentUser, dateOfBirth: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">SĐT Phụ huynh</label>
                            <input type="tel" value={currentUser.parentPhoneNumber} onChange={e => setCurrentUser({...currentUser, parentPhoneNumber: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleCloseModal} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 mr-3">Hủy</button>
                            <button onClick={handleSave} className="bg-sky-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-sky-700">Lưu</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reset Password Modal */}
            {isPasswordModalOpen && selectedStudentForPassword && (
                <Modal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} title={`Đặt lại mật khẩu cho ${selectedStudentForPassword.name}`}>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                            />
                        </div>
                        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                        <div className="flex justify-end pt-4">
                            <button onClick={handleClosePasswordModal} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 mr-3">Hủy</button>
                            <button onClick={handleSavePassword} className="bg-sky-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-sky-700">Lưu mật khẩu</button>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default ManageStudents;
