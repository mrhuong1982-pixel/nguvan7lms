
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-center">
      <h1 className="text-6xl font-bold text-sky-600">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800 mt-4">Không tìm thấy trang</h2>
      <p className="text-slate-600 mt-2">Xin lỗi, trang bạn đang tìm kiếm không tồn tại.</p>
      <Link 
        to="/"
        className="mt-6 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
      >
        Quay về Trang chủ
      </Link>
    </div>
  );
};

export default NotFound;
