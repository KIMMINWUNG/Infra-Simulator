// =================================================================
// FILE: src/components/Footer.jsx (새로운 파일!)
// 역할: 페이지 하단의 꼬리말 정보를 표시합니다.
// =================================================================
import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full mt-12 py-4 border-t border-gray-200">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                <p>
                    <strong>국토안전관리원 기반시설관리실</strong> | 담당자: 김민웅 | 연락처: 055-771-8497 | 주소: 경상남도 진주시 사들로 123번길 40, 7층 배종프라임 기반시설관리실
                </p>
                <p className="mt-1">
                    ⓒ 2025 Kim Min Wung. All rights reserved.
                </p>
            </div>
        </footer>
    );
}