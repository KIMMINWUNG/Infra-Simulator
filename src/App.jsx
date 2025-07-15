// =================================================================
// FILE: src/App.jsx
// 역할: 앱의 최상위 컴포넌트. 초기 인증 화면을 담당합니다.
// =================================================================
import React, { useState } from 'react';
import SimulatorPage from './pages/SimulatorPage';
import Notification from './components/Notification';

// .env.local 파일에 VITE_MASTER_KEY="your_key" 형식으로 저장하는 것을 권장합니다.
const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "k.infra";

function LoginComponent({ onSuccess, setNotification }) {
    const [inputKey, setInputKey] = useState("");

    const handleLogin = () => {
        if (inputKey === MASTER_KEY) {
            onSuccess();
        } else {
            setNotification({
                id: Date.now(),
                type: 'error',
                message: '인증 KEY가 일치하지 않습니다.'
            });
            setInputKey("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">🔒 인증이 필요합니다</h2>
                <p className="text-center text-gray-500">시뮬레이터 접속을 위한 KEY를 입력하세요.</p>
                <input
                    type="password"
                    placeholder="KEY 입력"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    onClick={handleLogin}
                    className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                    입장하기
                </button>
            </div>
        </div>
    );
}


export default function App() {
    const [authorized, setAuthorized] = useState(false);
    const [notification, setNotification] = useState(null);

    if (!authorized) {
        return (
            <>
                <LoginComponent onSuccess={() => setAuthorized(true)} setNotification={setNotification} />
                {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            </>
        );
    }

    return <SimulatorPage />;
}

