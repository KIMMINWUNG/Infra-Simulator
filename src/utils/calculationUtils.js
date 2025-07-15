// =================================================================
// FILE: src/utils/calculationUtils.js
// 역할: 모든 점수 계산 로직을 담당하는 유틸리티 파일 (버그 수정됨)
// =================================================================
import { readExcelToJson, readRawExcel } from './excelUtils';
import { HEADER_PLAN, HEADER_DB, HEADER_ORDINANCE, GRADE_EXCLUDE, PRIVATE_OWNERS } from '../constants';
import * as XLSX from 'xlsx';

// --- Calculation Logic ---

const calculatePlan = (sheet, gov, excludePrivate) => {
    const filtered = sheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    const finalData = excludePrivate ? filtered.filter(r => !PRIVATE_OWNERS.includes(r["작성기관"]?.trim())) : filtered;
    
    const done = finalData.filter(r => {
        const dateValue = r["결재이력"];
        if (typeof dateValue === 'number') {
            const date = XLSX.SSF.parse_date_code(dateValue);
            return new Date(date.y, date.m - 1, date.d) <= new Date("2025-02-28T23:59:59");
        }
        const date = new Date(dateValue);
        return !isNaN(date) && date <= new Date("2025-02-28T23:59:59");
    });
    
    const missed = finalData.filter(r => !done.includes(r));
    const score = finalData.length > 0 ? (done.length / finalData.length) * 10 : 0;

    return {
        score: score, // toFixed(2) 제거하여 숫자로 반환
        details: {
            "제출 대상(분모)": finalData.length,
            "제출 완료(분자)": done.length,
        },
        downloadableData: { "실행계획_미제출": missed }
    };
};

const calculateMaintain = (noticeWB, dbSheet, gov, excludePrivate) => {
    const sheet = noticeWB.Sheets[gov];
    if (!sheet) throw new Error(`고시문 파일에 "${gov}" 시트가 없습니다.`);

    let dbBody = dbSheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    if (excludePrivate) {
        dbBody = dbBody.filter(r => !PRIVATE_OWNERS.includes(r["관리주체"]?.trim()));
    }

    const groupKeys = new Set(), gradeKeys = new Set();
    const groupCols = ["C", "D", "E", "F", "G"], gradeCols = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];

    for (let i = 2; i < 300; i++) { // 행 범위를 넉넉하게
        const infra = sheet[`A${i}`]?.v?.trim(), fac = sheet[`B${i}`]?.v?.trim();
        if (!infra || !fac) continue;
        
        const processCols = (cols, keySet) => {
            for (const col of cols) {
                if (sheet[`${col}${i}`]?.v === "O") {
                    keySet.add(`${infra}||${fac}||${sheet[`${col}1`]?.v?.trim()}`);
                }
            }
        };
        processCols(groupCols, groupKeys);
        processCols(gradeCols, gradeKeys);
    }

    const included = dbBody.filter(r => groupKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["시설물종별"]}`));
    const excluded = dbBody.filter(r => !included.includes(r));
    const validGrades = included.filter(r => !GRADE_EXCLUDE.includes(r["등급"]?.trim()));
    const passed = validGrades.filter(r => gradeKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["등급"]}`));
    const failed = validGrades.filter(r => !passed.includes(r));

    const score = validGrades.length > 0 ? (passed.length / validGrades.length) * 20 : 0;

    return {
        score: score, // toFixed(2) 제거하여 숫자로 반환
        details: {
            "관리그룹 대상": included.length,
            "등급 확인(분모)": validGrades.length,
            "목표등급 만족(분자)": passed.length,
        },
        downloadableData: {
            "관리그룹_포함": included,
            "관리그룹_제외": excluded,
            "목표등급_만족": passed,
            "목표등급_불만족": failed,
        }
    };
};

const calculateOrdinance = (sheet, gov) => {
    const filtered = sheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    const done = filtered.filter(r => r["충당금 조례 제정 여부"]?.toString().trim() === "O");
    const score = filtered.length > 0 ? (done.length / filtered.length) * 20 : 0;
    
    return {
        score: score, // toFixed(2) 제거하여 숫자로 반환
        details: {
            "대상 건수(분모)": filtered.length,
            "조례 제정(분자)": done.length,
        },
        downloadableData: {}
    };
};

// --- Main Export Function ---

export const calculateScores = async (type, files, gov, excludePrivate) => {
    switch (type) {
        case 'plan': {
            const sheet = await readExcelToJson(files.planFile, HEADER_PLAN);
            return calculatePlan(sheet, gov, excludePrivate);
        }
        case 'maintain': {
            const noticeWB = await readRawExcel(files.noticeFile);
            const dbSheet = await readExcelToJson(files.dbFile, HEADER_DB);
            return calculateMaintain(noticeWB, dbSheet, gov, excludePrivate);
        }
        case 'ordinance': {
            const sheet = await readExcelToJson(files.ordinanceFile, HEADER_ORDINANCE);
            return calculateOrdinance(sheet, gov);
        }
        default:
            throw new Error("알 수 없는 계산 유형입니다.");
    }
};