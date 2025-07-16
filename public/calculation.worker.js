// =================================================================
// FILE: public/calculation.worker.js
// 역할: 모든 무거운 계산을 백그라운드에서 전담 (일괄 계산 상세 데이터 수집 로직 추가)
// =================================================================
self.importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');

// --- 유틸리티 함수들 (워커 내에서 사용) ---
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

const validateHeader = (actual, expected) => {
    if (!actual || actual.length < expected.length) return false;
    return expected.every((v, i) => v === (actual[i] || "").trim());
};

const readExcelToJson = (file, headerType) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const wb = self.XLSX.read(new Uint8Array(e.target.result), { type: "array" });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const data = self.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            
            if (!validateHeader(data[0], headerType)) {
                return reject(new Error(`잘못된 엑셀 헤더 형식입니다. (${sheetName})`));
            }
            
            const rows = data.slice(1).map(row =>
                Object.fromEntries(data[0].map((key, i) => [key, row[i]]))
            );
            resolve(rows);
        } catch (err) {
            reject(err);
        }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsArrayBuffer(file);
});

const readRawExcel = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            resolve(self.XLSX.read(new Uint8Array(e.target.result), { type: "array" }));
        } catch (error) {
            reject(error);
        }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsArrayBuffer(file);
});

// --- 계산 로직 (워커 내에서 실행) ---

const calculatePlan = (sheet, gov, excludePrivate, constants) => {
    const filtered = sheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    const finalData = excludePrivate ? filtered.filter(r => !constants.PRIVATE_OWNERS.includes(r["작성기관"]?.trim())) : filtered;
    
    const done = finalData.filter(r => {
        const dateValue = r["결재이력"];
        if (typeof dateValue === 'number') {
            const date = self.XLSX.SSF.parse_date_code(dateValue);
            return new Date(date.y, date.m - 1, date.d) <= new Date("2025-02-28T23:59:59");
        }
        const date = new Date(dateValue);
        return !isNaN(date) && date <= new Date("2025-02-28T23:59:59");
    });
    
    const missed = finalData.filter(r => !done.includes(r));
    const score = finalData.length > 0 ? (done.length / finalData.length) * 10 : 0;

    return {
        score,
        details: { "제출 대상(분모)": finalData.length, "제출 완료(분자)": done.length },
        downloadableData: { "실행계획_미제출": missed }
    };
};

const calculateMaintain = (noticeWB, dbSheet, gov, excludePrivate, constants) => {
    const sheet = noticeWB.Sheets[gov];
    if (!sheet) throw new Error(`고시문 파일에 "${gov}" 시트가 없습니다.`);

    let dbBody = dbSheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    if (excludePrivate) {
        dbBody = dbBody.filter(r => !constants.PRIVATE_OWNERS.includes(r["관리주체"]?.trim()));
    }

    const groupKeys = new Set(), gradeKeys = new Set();
    const groupCols = ["C", "D", "E", "F", "G"], gradeCols = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];

    for (let i = 2; i < 500; i++) {
        const infra = sheet[`A${i}`]?.v?.trim(), fac = sheet[`B${i}`]?.v?.trim();
        if (!infra || !fac) continue;
        
        const processCols = (cols, keySet) => {
            for (const col of cols) {
                if (sheet[`${col}${i}`]?.v === "O") keySet.add(`${infra}||${fac}||${sheet[`${col}1`]?.v?.trim()}`);
            }
        };
        processCols(groupCols, groupKeys);
        processCols(gradeCols, gradeKeys);
    }

    const included = dbBody.filter(r => groupKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["시설물종별"]}`));
    const excluded = dbBody.filter(r => !included.includes(r));
    const validGrades = included.filter(r => !constants.GRADE_EXCLUDE.includes(r["등급"]?.trim()));
    const passed = validGrades.filter(r => gradeKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["등급"]}`));
    const failed = validGrades.filter(r => !passed.includes(r));

    const score = validGrades.length > 0 ? (passed.length / validGrades.length) * 20 : 0;

    return {
        score,
        details: { "관리그룹 대상": included.length, "등급 확인(분모)": validGrades.length, "목표등급 만족(분자)": passed.length },
        downloadableData: { "관리그룹_포함": included, "관리그룹_제외": excluded, "목표등급_만족": passed, "목표등급_불만족": failed }
    };
};

const calculateOrdinance = (sheet, gov) => {
    const filtered = sheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    const done = filtered.filter(r => r["충당금 조례 제정 여부"]?.toString().trim() === "O");
    const score = filtered.length > 0 ? (done.length / filtered.length) * 20 : 0;
    
    return {
        score,
        details: { "대상 건수(분모)": filtered.length, "조례 제정(분자)": done.length },
        downloadableData: {}
    };
};

// --- 메인 이벤트 리스너 ---
self.onmessage = async (e) => {
    const { task, files, gov, excludePrivate, constants } = e.data;
    
    if (task === 'single') {
        try {
            self.postMessage({ type: 'progress', message: '실행계획 파일 읽는 중...' });
            const planSheet = await readExcelToJson(files.planFile, constants.HEADER_PLAN);
            const planResult = calculatePlan(planSheet, gov, excludePrivate, constants);
            self.postMessage({ type: 'progress', message: '실행계획 평가 완료.' });
            await yieldToMain();

            self.postMessage({ type: 'progress', message: '고시문 파일 읽는 중...' });
            const noticeWB = await readRawExcel(files.noticeFile);
            self.postMessage({ type: 'progress', message: '실적DB 파일 읽는 중... (시간 소요)' });
            const dbSheet = await readExcelToJson(files.dbFile, constants.HEADER_DB);
            const maintainResult = calculateMaintain(noticeWB, dbSheet, gov, excludePrivate, constants);
            self.postMessage({ type: 'progress', message: '유지관리기준 평가 완료.' });
            await yieldToMain();
            
            self.postMessage({ type: 'progress', message: '조례 파일 읽는 중...' });
            const ordinanceSheet = await readExcelToJson(files.ordinanceFile, constants.HEADER_ORDINANCE);
            const ordinanceResult = calculateOrdinance(ordinanceSheet, gov);
            self.postMessage({ type: 'progress', message: '조례 제정 평가 완료.' });

            self.postMessage({ 
                type: 'done', 
                results: { plan: planResult, maintain: maintainResult, ordinance: ordinanceResult }
            });

        } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
        }
    }
    
    if (task === 'bulk') {
        try {
            self.postMessage({ type: 'bulk_progress', message: '일괄 계산용 파일 읽는 중...' });
            const planSheet = await readExcelToJson(files.planFile, constants.HEADER_PLAN);
            const noticeWB = await readRawExcel(files.noticeFile);
            const dbSheet = await readExcelToJson(files.dbFile, constants.HEADER_DB);
            const ordinanceSheet = await readExcelToJson(files.ordinanceFile, constants.HEADER_ORDINANCE);
            
            const allDetailedData = {
                '실행계획_미제출': {}, '관리그룹_포함': {}, '관리그룹_제외': {},
                '목표등급_만족': {}, '목표등급_불만족': {}
            };

            for (let i = 0; i < constants.LOCAL_GOV_LIST.length; i++) {
                const currentGov = constants.LOCAL_GOV_LIST[i];
                self.postMessage({ type: 'bulk_progress', message: `[${i+1}/${constants.LOCAL_GOV_LIST.length}] ${currentGov} 계산 중...` });
                await yieldToMain();

                try {
                    const planResult = calculatePlan(planSheet, currentGov, true, constants);
                    const maintainResult = calculateMaintain(noticeWB, dbSheet, currentGov, true, constants);
                    const ordinanceResult = calculateOrdinance(ordinanceSheet, currentGov);
                    
                    const newResult = {
                        지자체: currentGov,
                        실행계획: planResult.score.toFixed(2),
                        유지관리기준: maintainResult.score.toFixed(2),
                        조례제정: ordinanceResult.score.toFixed(2),
                        총점: (planResult.score + maintainResult.score + ordinanceResult.score).toFixed(2)
                    };
                    self.postMessage({ type: 'bulk_result_partial', result: newResult });

                    // 상세 데이터 수집
                    allDetailedData['실행계획_미제출'][currentGov] = planResult.downloadableData['실행계획_미제출'];
                    allDetailedData['관리그룹_포함'][currentGov] = maintainResult.downloadableData['관리그룹_포함'];
                    allDetailedData['관리그룹_제외'][currentGov] = maintainResult.downloadableData['관리그룹_제외'];
                    allDetailedData['목표등급_만족'][currentGov] = maintainResult.downloadableData['목표등급_만족'];
                    allDetailedData['목표등급_불만족'][currentGov] = maintainResult.downloadableData['목표등급_불만족'];

                } catch (govError) {
                     console.warn(`[${currentGov}] 점수 계산 실패: ${govError.message}`);
                }
            }
            self.postMessage({ type: 'bulk_done', detailedData: allDetailedData });

        } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
        }
    }
};