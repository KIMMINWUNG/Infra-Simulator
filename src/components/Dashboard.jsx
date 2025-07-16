// =================================================================
// FILE: src/components/Dashboard.jsx
// 역할: 우측의 결과 대시보드 UI
// =================================================================
import React from 'react';

const cardHoverEffect = "transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl";

const ScoreCard = ({ title, score, maxScore, color, details, downloads = {}, onDownload }) => {
    const numericScore = Number(score) || 0;
    const numericMaxScore = Number(maxScore) || 0;
    const percentage = numericMaxScore > 0 ? (numericScore / numericMaxScore) * 100 : 0;
    
    return (
        <div className={`bg-white p-6 rounded-xl shadow-md ${cardHoverEffect} flex flex-col`}>
            <div className="flex-grow">
                <h3 className={`text-lg font-semibold text-gray-700`}>{title}</h3>
                <div className="flex justify-between items-baseline mt-2">
                    <span className={`text-3xl font-bold`} style={{color: color}}>{numericScore.toFixed(2)}</span>
                    <span className="text-gray-500">/ {numericMaxScore}점</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                    <div className="h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                </div>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                    {Object.entries(details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-semibold">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            {Object.keys(downloads).length > 0 && (
                 <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">상세 데이터</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(downloads).map(([key, data]) => (
                             <button key={key} onClick={() => onDownload(key)} className="download-button">
                                {key.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoBanner = () => (
    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg" role="alert">
        <div className="flex">
            <div className="py-1">
                <svg className="h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <p className="font-bold">안내사항</p>
                <p className="text-sm">업로드된 파일은 서버에 저장되지 않으며, 모든 데이터 처리는 사용자의 브라우저 내에서만 안전하게 이루어집니다.</p>
            </div>
        </div>
    </div>
);

export default function Dashboard({ scores, downloadableData, onDownload }) {
    const totalScore = (Number(scores.plan.score) + Number(scores.maintain.score) + Number(scores.ordinance.score)).toFixed(2);
    
    const colors = {
        plan: '#3b82f6',
        maintain: '#22c55e',
        ordinance: '#a855f7'
    };

    const planDownloads = {
        '실행계획_미제출': downloadableData['실행계획_미제출']
    };

    const maintainDownloads = {
        '관리그룹_포함': downloadableData['관리그룹_포함'],
        '관리그룹_제외': downloadableData['관리그룹_제외'],
        '목표등급_만족': downloadableData['목표등급_만족'],
        '목표등급_불만족': downloadableData['목표등급_불만족']
    };

    return (
        <div className="space-y-8">
            <InfoBanner />

            <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between ${cardHoverEffect}`}>
                <div>
                    <h2 className="text-xl font-semibold">종합 점수</h2>
                    <p className="text-blue-200">모든 항목의 점수를 합산한 결과입니다.</p>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                    <p className="text-5xl font-bold">{totalScore}</p>
                    <p className="text-blue-100">/ 50점 만점</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <ScoreCard 
                    title="① 기반시설 관리 실행계획 제출여부" 
                    score={scores.plan.score} 
                    maxScore={10} 
                    color={colors.plan} 
                    details={scores.plan.details}
                    downloads={planDownloads}
                    onDownload={onDownload}
                />
                <ScoreCard 
                    title="② 최소유지관리기준 만족여부" 
                    score={scores.maintain.score} 
                    maxScore={20} 
                    color={colors.maintain} 
                    details={scores.maintain.details}
                    downloads={maintainDownloads}
                    onDownload={onDownload}
                />
                <ScoreCard 
                    title="③ 성능개선 충당금 조례 제정 여부" 
                    score={scores.ordinance.score} 
                    maxScore={20} 
                    color={colors.ordinance} 
                    details={scores.ordinance.details}
                />
            </div>
        </div>
    );
}