// =================================================================
// FILE: src/pages/SimulatorPage.jsx
// 역할: 시뮬레이터의 메인 페이지. 전체 레이아웃을 구성합니다.
// =================================================================
import React, { useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import Dashboard from '../components/Dashboard';
import AdminPanel from '../components/AdminPanel';
import Notification from '../components/Notification';
import useSimulator from '../hooks/useSimulator';

export default function SimulatorPage() {
    const {
        state,
        setters,
        actions
    } = useSimulator();
    
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 text-gray-800">
            <div className="max-w-screen-2xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">지자체 합동평가 시뮬레이터</h1>
                        <p className="text-lg text-gray-500 mt-1">시설 안전관리 수준 강화 지표 점수 자동화</p>
                    </div>
                    <button
                        onClick={() => setIsAdminPanelOpen(true)}
                        className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
                    >
                        🔐 관리자 모드
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 xl:col-span-1">
                        <ControlPanel
                            selectedGov={state.selectedGov}
                            excludePrivate={state.excludePrivate}
                            files={state.files}
                            isLoading={state.isLoading}
                            onGovChange={setters.setSelectedGov}
                            onExcludeChange={setters.setExcludePrivate}
                            onFileChange={setters.setFile}
                            onRunSimulation={actions.runSingleSimulation}
                        />
                    </div>
                    <div className="lg:col-span-2 xl:col-span-3">
                        <Dashboard
                            scores={state.scores}
                            downloadableData={state.downloadableData}
                            onDownload={actions.downloadDetailedData}
                        />
                    </div>
                </div>
            </div>

            {isAdminPanelOpen && (
                <AdminPanel
                    onClose={() => setIsAdminPanelOpen(false)}
                    onRunBulkSim={actions.runBulkSimulation}
                    bulkResults={state.bulkResults}
                    isBulkLoading={state.isBulkLoading}
                />
            )}
            
            {state.notification && (
                <Notification
                    {...state.notification}
                    onClose={actions.clearNotification}
                />
            )}
        </div>
    );
}
