
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import { BookOpenIcon } from '../components/icons';

const Home: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.role === 'teacher' ? '/admin' : '/app');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
        setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
        return;
    }
    const success = await login(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
            <BookOpenIcon className="h-12 w-12 text-sky-600" />
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800">Hệ thống Quản lý Học tập</h1>
        <p className="text-center text-slate-600 mb-8">Môn Ngữ Văn 7 - Kết nối tri thức</p>

        <Card title="Đăng nhập tài khoản">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        placeholder="ví dụ: thuhagv"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        placeholder="••••••••"
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        Đăng nhập
                    </button>
                </div>
                <div className="text-xs text-slate-500 text-center pt-2">
                    <p>GV: thuhagv / HS: an.nv</p>
                    <p>Mật khẩu cho tất cả tài khoản là: <strong>123</strong></p>
                </div>
            </form>
        </Card>
      </div>
    </div>
  );
};

export default Home;
