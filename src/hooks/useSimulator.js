// =================================================================
// FILE: src/hooks/useSimulator.js
// 역할: 시뮬레이터의 모든 상태와 로직을 관리하는 커스텀 훅
// =================================================================
import { useState } from 'react';
import { calculateScores } from '../utils/calculationUtils';
import { exportToExcel } from '../utils/excelUtils';
import { LOCAL_GOV_LIST } from '../constants';

const initialScores = {
    plan: { score: 0, details: {} },
    maintain: { score: 0, details: {} },
    ordinance: { score: 0, details: {} },
};

const initialFiles = {
    planFile: null,
    noticeFile: null,
    dbFile: null,
    ordinanceFile: null,
};

export default function useSimulator() {
    const [selectedGov, setSelectedGov] = useState('');
    const [excludePrivate, setExcludePrivate] = useState(true);
    const [files, setFiles] = useState(initialFiles);
    const [scores, setScores] = useState(initialScores);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [notification, setNotification] = useState(null);
    const [downloadableData, setDownloadableData] = useState({});
    
    const [isBulkLoading, setIsBulkLoading] = useState(false);
    const [bulkResults, setBulkResults] = useState([]);

    const setFile = (type, file) => {
        setFiles(prev => ({ ...prev, [type]: file }));
    };
    
    const clearNotification = () => setNotification(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ id: Date.now(), message, type });
    };

    const runSingleSimulation = async () => {
        if (!selectedGov) {
            showNotification('지자체를 먼저 선택해주세요.', 'error');
            return;
        }
        if (!files.planFile || !files.noticeFile || !files.dbFile || !files.ordinanceFile) {
            showNotification('모든 평가 파일을 업로드해야 합니다.', 'error');
            return;
        }

        setIsLoading(true);
        setLoadingMessage('점수 계산을 시작합니다...');

        try {
            const plan = await calculateScores('plan', { planFile: files.planFile }, selectedGov, excludePrivate, setLoadingMessage);
            const maintain = await calculateScores('maintain', { noticeFile: files.noticeFile, dbFile: files.dbFile }, selectedGov, excludePrivate, setLoadingMessage);
            const ordinance = await calculateScores('ordinance', { ordinanceFile: files.ordinanceFile }, selectedGov, excludePrivate, setLoadingMessage);

            setScores({ plan, maintain, ordinance });
            setDownloadableData({ ...plan.downloadableData, ...maintain.downloadableData });
            
            showNotification('점수 계산이 완료되었습니다!', 'success');
        } catch (error) {
            console.error("Calculation Error:", error);
            showNotification(`오류 발생: ${error.message}`, 'error');
            setScores(initialScores);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const runBulkSimulation = async (adminFiles) => {
        if (!adminFiles.planFile || !adminFiles.noticeFile || !adminFiles.dbFile || !adminFiles.ordinanceFile) {
            showNotification('관리자 모드는 모든 파일을 업로드해야 합니다.', 'error');
            return;
        }
        
        setIsBulkLoading(true);
        setBulkResults([]);
        showNotification('전체 지자체 점수 일괄 계산을 시작합니다. (시간 소요)', 'info');
        
        const results = [];
        for (const gov of LOCAL_GOV_LIST) {
            try {
                const plan = await calculateScores('plan', { planFile: adminFiles.planFile }, gov, true, null);
                const maintain = await calculateScores('maintain', { noticeFile: adminFiles.noticeFile, dbFile: adminFiles.dbFile }, gov, true, null);
                const ordinance = await calculateScores('ordinance', { ordinanceFile: adminFiles.ordinanceFile }, gov, true, null);
                
                results.push({
                    지자체: gov,
                    실행계획: plan.score.toFixed(2),
                    유지관리기준: maintain.score.toFixed(2),
                    조례제정: ordinance.score.toFixed(2),
                    총점: (Number(plan.score) + Number(maintain.score) + Number(ordinance.score)).toFixed(2)
                });
                setBulkResults([...results]);
            } catch (error) {
                console.warn(`[${gov}] 점수 계산 실패: ${error.message}`);
            }
        }
        
        showNotification('일괄 계산이 완료되었습니다.', 'success');
        setIsBulkLoading(false);
    };

    const downloadDetailedData = (type) => {
        if (!downloadableData[type] || downloadableData[type].length === 0) {
            showNotification('다운로드할 데이터가 없습니다. 먼저 시뮬레이션을 실행해주세요.', 'warning');
            return;
        }
        exportToExcel(downloadableData[type], `${selectedGov}_${type}.xlsx`);
    };

    return {
        state: { selectedGov, excludePrivate, files, scores, isLoading, loadingMessage, notification, downloadableData, isBulkLoading, bulkResults },
        setters: { setSelectedGov, setExcludePrivate, setFile },
        actions: { runSingleSimulation, runBulkSimulation, downloadDetailedData, clearNotification, showNotification }
    };
}