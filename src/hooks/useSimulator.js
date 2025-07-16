// =================================================================
// FILE: src/hooks/useSimulator.js
// 역할: 시뮬레이터의 모든 상태와 로직을 관리 (Web Worker와 통신하도록 수정)
// =================================================================
import { useState, useEffect, useRef } from 'react';
import { exportToExcel } from '../utils/excelUtils';
import * as constants from '../constants';

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
    
    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker('/calculation.worker.js');

        workerRef.current.onmessage = (e) => {
            const { type, message, results } = e.data;
            if (type === 'progress') {
                setLoadingMessage(message);
            } else if (type === 'done') {
                setScores(results);
                setDownloadableData({ ...results.plan.downloadableData, ...results.maintain.downloadableData });
                showNotification('점수 계산이 완료되었습니다!', 'success');
                setIsLoading(false);
                setLoadingMessage('');
            } else if (type === 'error') {
                showNotification(`계산 중 오류 발생: ${message}`, 'error');
                setIsLoading(false);
                setLoadingMessage('');
            }
        };

        return () => {
            workerRef.current.terminate();
        };
    }, []);

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
        setScores(initialScores);
        setLoadingMessage('계산을 준비 중입니다...');
        
        workerRef.current.postMessage({
            files,
            gov: selectedGov,
            excludePrivate,
            constants
        });
    };
    
    const runBulkSimulation = async (adminFiles) => {
       showNotification('일괄 계산 기능은 현재 개발 중입니다.', 'warning');
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