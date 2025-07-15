// =================================================================
// FILE: src/components/Dashboard.jsx
// 역할: 우측의 결과 대시보드 UI (애니메이션 추가)
// =================================================================
import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const ScoreCard = ({ title, score, maxScore, color, details }) => {
    const numericScore = Number(score) || 0;
    const numericMaxScore = Number(maxScore) || 0;
    const percentage = numericMaxScore > 0 ? (numericScore / numericMaxScore) * 100 : 0;
    
    const progressBarStyle = {
        width: '100%',
        backgroundColor: '#e5e7eb', // bg-gray-200
        borderRadius: '9999px',
        height: '10px',
        marginTop: '12px'
    };

    const innerBarStyle = {
        width: `${percentage}%`,
        backgroundColor: color, 
        borderRadius: '9999px',
        height: '10px',
        transition: 'width 0.5s ease-in-out'
    };

    return (
        <motion.div variants={cardVariants} className="bg-white p-6 rounded-xl shadow-md">
            <h3 className={`text-lg font-semibold text-gray-700`}>{title}</h3>
            <div className="flex justify-between items-baseline mt-2">
                <span className={`text-3xl font-bold`} style={{ color: color }}>{numericScore.toFixed(2)}</span>
                <span className="text-gray-500">/ {numericMaxScore}점</span>
            </div>
            <div style={progressBarStyle}>
                <div style={innerBarStyle}></div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
                {Object.entries(details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span className="font-semibold">{value}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const DownloadCard = ({ onDownload }) => (
    <motion.div variants={cardVariants} className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">상세 데이터 다운로드</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => onDownload('실행계획_미제출')} className="download-button">실행계획 미제출</button>
            <button onClick={() => onDownload('관리그룹_포함')} className="download-button">관리그룹 포함</button>
            <button onClick={() => onDownload('관리그룹_제외')} className="download-button">관리그룹 제외</button>
            <button onClick={() => onDownload('목표등급_만족')} className="download-button">목표등급 만족</button>
            <button onClick={() => onDownload('목표등급_불만족')} className="download-button">목표등급 불만족</button>
        </div>
    </motion.div>
);

export default function Dashboard({ scores, downloadableData, onDownload }) {
    const totalScore = (Number(scores.plan.score) + Number(scores.maintain.score) + Number(scores.ordinance.score)).toFixed(2);
    
    const colors = {
        plan: '#3b82f6', // text-blue-500
        maintain: '#22c55e', // text-green-500
        ordinance: '#a855f7' // text-purple-500
    };

    return (
        <motion.div 
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
            <motion.div variants={cardVariants} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">종합 점수</h2>
                    <p className="text-blue-200">모든 항목의 점수를 합산한 결과입니다.</p>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                    <p className="text-5xl font-bold">{totalScore}</p>
                    <p className="text-blue-100">/ 50점 만점</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <ScoreCard title="① 실행계획 제출" score={scores.plan.score} maxScore={10} color={colors.plan} details={scores.plan.details} />
                <ScoreCard title="② 유지관리 기준" score={scores.maintain.score} maxScore={20} color={colors.maintain} details={scores.maintain.details} />
                <ScoreCard title="③ 조례 제정" score={scores.ordinance.score} maxScore={20} color={colors.ordinance} details={scores.ordinance.details} />
                <div className="md:col-span-2 xl:col-span-3">
                     <DownloadCard onDownload={onDownload} />
                </div>
            </div>
        </motion.div>
    );
}