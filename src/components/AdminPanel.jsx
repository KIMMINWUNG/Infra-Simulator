// =================================================================
// FILE: src/components/AdminLoginModal.jsx
// 역할: 관리자 모드 접속을 위한 비밀번호 입력 모달
// =================================================================
import React, { useState } from 'react';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_MASTER_KEY || "kalis4114@@";

export default function AdminLoginModal({ onSuccess, onCancel, setNotification }) {
    const [inputKey, setInputKey] = useState("");

    const handleLogin = () => {
        if (inputKey === ADMIN_KEY) {
            onSuccess();
        } else {
            setNotification('관리자 비밀번호가 일치하지 않습니다.', 'error');
            setInputKey("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">🔐 관리자 로그인</h2>
                    <p className="text-gray-500 mb-4">관리자 전용 비밀번호를 입력하세요.</p>
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                        취소
                    </button>
                    <button onClick={handleLogin} className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                        입장
                    </button>
                </div>
            </div>
        </div>
    );
}