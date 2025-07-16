// =================================================================
// FILE: src/components/Footer.jsx
// 역할: 페이지 하단의 꼬리말 정보를 표시합니다. (회사 로고 추가됨)
// =================================================================
import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full mt-12 py-4 border-t border-gray-200">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                
                {/* 좌측: 로고와 기관 정보 */}
                <div className="flex items-center gap-4">
                    {/* public 폴더에 넣은 로고 이미지를 불러옵니다. */}
                    {/* 파일 이름을 실제 로고 파일 이름으로 변경해주세요. (예: /my-logo.png) */}
                    <img src="/ci_logo.png" alt="회사 로고" className="h-8" /> 
                    
                    <div>
                        <p>
                            <strong>국토안전관리원 기반시설관리실</strong> | 담당자: 김민웅 | 연락처: 055-771-8497
                        </p>
                        <p className="mt-1">
                            주소: 경상남도 진주시 사들로 123번길 40, 7층 배종프라임 기반시설관리실
                        </p>
                    </div>
                </div>
                
                {/* 우측: 저작권 정보 */}
                <p className="mt-2 sm:mt-0">
                    ⓒ 2025 Kim Min Wung. All rights reserved.
                </p>
            </div>
        </footer>
    );
}