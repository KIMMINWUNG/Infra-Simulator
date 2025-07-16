// =================================================================
// FILE: src/components/AdminPanel.jsx
// 역할: 관리자 모드용 패널 (모달 형태)
// =================================================================
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { exportToExcel } from '../utils/excelUtils';

export default function AdminPanel({ onClose, onRunBulkSim, bulkResults, isBulkLoading }) {
    const [adminFiles, setAdminFiles] = useState({
        planFile: null,
        noticeFile: null,
        dbFile: null,
        ordinanceFile: null,
    });

    const handleFileChange = (type, file) => {
        setAdminFiles(prev => ({ ...prev, [type]: file }));
    };

    const handleExport = () => {
        if (bulkResults.length === 0) return;
        exportToExcel(bulkResults, '전체_지자체_점수_결과.xlsx');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">🔐 관리자 모드</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </header>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold">일괄 계산용 파일 업로드</h3>
                            <FileUpload id="admin-plan" label="실행계획 파일" file={adminFiles.planFile} onFileChange={(f) => handleFileChange('planFile', f)} />
                            <FileUpload id="admin-notice" label="고시문 파일" file={adminFiles.noticeFile} onFileChange={(f) => handleFileChange('noticeFile', f)} />
                            <FileUpload id="admin-db" label="실적DB 파일" file={adminFiles.dbFile} onFileChange={(f) => handleFileChange('dbFile', f)} />
                            <FileUpload id="admin-ord" label="조례 파일" file={adminFiles.ordinanceFile} onFileChange={(f) => handleFileChange('ordinanceFile', f)} />
                        </div>
                        <div className="flex flex-col">
                             <h3 className="font-semibold mb-4">일괄 계산 결과</h3>
                             <div className="border rounded-lg flex-grow overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-2">지자체</th>
                                            <th>실행계획</th>
                                            <th>유지관리</th>
                                            <th>조례</th>
                                            <th>총점</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkResults.sort((a,b) => b.총점 - a.총점).map((res, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2 font-semibold">{res.지자체}</td>
                                                <td>{res.실행계획}</td>
                                                <td>{res.유지관리기준}</td>
                                                <td>{res.조례제정}</td>
                                                <td className="font-bold">{res.총점}</td>
                                            </tr>
                                        ))}
                                        {isBulkLoading && !bulkResults.length && <tr><td colSpan="5" className="text-center p-4">계산 중...</td></tr>}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t flex justify-end gap-4">
                    <button onClick={() => onRunBulkSim(adminFiles)} disabled={isBulkLoading} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isBulkLoading ? '계산 중...' : '일괄 계산 시작'}
                    </button>
                    <button onClick={handleExport} disabled={bulkResults.length === 0} className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        결과 엑셀 다운로드
                    </button>
                </footer>
            </div>
        </div>
    );
}