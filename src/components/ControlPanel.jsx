// =================================================================
// FILE: src/components/ControlPanel.jsx
// 역할: 좌측의 설정 및 파일 업로드 UI
// =================================================================
import React from 'react';
import { LOCAL_GOV_LIST } from '../constants';
import FileUpload from './FileUpload';

export default function ControlPanel({
    selectedGov,
    excludePrivate,
    files,
    isLoading,
    onGovChange,
    onExcludeChange,
    onFileChange,
    onRunSimulation
}) {
    return (
        <div className="space-y-8">
            {/* Settings Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-800">⚙️ 기본 설정</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="gov-select" className="block text-sm font-medium text-gray-700 mb-1">지자체 선택</label>
                        <select
                            id="gov-select"
                            value={selectedGov}
                            onChange={(e) => onGovChange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- 선택 --</option>
                            {LOCAL_GOV_LIST.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">민자사업자 제외</label>
                        <div className="flex items-center justify-between bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => onExcludeChange(true)}
                                className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${excludePrivate ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                            >
                                네
                            </button>
                            <button
                                onClick={() => onExcludeChange(false)}
                                className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${!excludePrivate ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                            >
                                아니오
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Upload Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-800">📁 파일 업로드</h2>
                <div className="space-y-4">
                    <FileUpload
                        id="planFile"
                        label="실행계획 파일"
                        file={files.planFile}
                        onFileChange={(file) => onFileChange('planFile', file)}
                    />
                    <FileUpload
                        id="noticeFile"
                        label="고시문 파일"
                        file={files.noticeFile}
                        onFileChange={(file) => onFileChange('noticeFile', file)}
                    />
                    <FileUpload
                        id="dbFile"
                        label="실적DB 파일"
                        file={files.dbFile}
                        onFileChange={(file) => onFileChange('dbFile', file)}
                    />
                    <FileUpload
                        id="ordinanceFile"
                        label="조례 파일"
                        file={files.ordinanceFile}
                        onFileChange={(file) => onFileChange('ordinanceFile', file)}
                    />
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={onRunSimulation}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                <span>{isLoading ? '분석 중...' : '시뮬레이션 시작'}</span>
            </button>
        </div>
    );
}
