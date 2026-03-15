/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import TabChuyenQuyen from './components/TabChuyenQuyen';
import TabChuyenQuyenTachThua from './components/TabChuyenQuyenTachThua';
import TabChuyenQuyenThuaKe from './components/TabChuyenQuyenThuaKe';
import Login from './components/Login';
import { FileText, Settings, Home, FilePlus, Users, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('chuyen-quyen');

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      <Toaster position="top-right" />
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Gradient Overlay to make it subtle */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50/90 to-slate-100/95 backdrop-blur-[2px] pointer-events-none" />

      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <Home className="mr-2 text-indigo-600" size={24} />
            LandTransfer AI
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chuyen-quyen')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'chuyen-quyen'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="mr-3" size={20} />
            Chuyển Quyền Nguyên Thửa
          </button>
          <button
            onClick={() => setActiveTab('tach-thua')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'tach-thua'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FilePlus className="mr-3" size={20} />
            Chuyển Quyền Do Tách Thửa
          </button>
          <button
            onClick={() => setActiveTab('thua-ke')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'thua-ke'
                ? 'bg-orange-50 text-orange-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="mr-3" size={20} />
            Chuyển Do Nhận Thừa Kế
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-100 text-slate-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="mr-3" size={20} />
            Cài đặt
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200/50">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3" size={20} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        {activeTab === 'chuyen-quyen' && <TabChuyenQuyen />}
        {activeTab === 'tach-thua' && <TabChuyenQuyenTachThua />}
        {activeTab === 'thua-ke' && <TabChuyenQuyenThuaKe />}
        {activeTab === 'settings' && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Cài đặt</h2>
            <p className="text-slate-500">Tính năng đang phát triển...</p>
          </div>
        )}
      </div>
    </div>
  );
}
