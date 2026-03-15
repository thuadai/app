import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#8a8a8a]">
      <div className="bg-[#2a2a2a] p-8 rounded-xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại</h2>
          <p className="text-gray-400">Đăng nhập truy cập để bắt đầu đi nhé</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors placeholder-gray-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4"
          >
            Đăng nhập
          </button>

          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">Chưa có tài khoản? </span>
            <a href="#" className="text-[#f97316] text-sm font-bold hover:underline">
              Đăng ký miễn phí
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
