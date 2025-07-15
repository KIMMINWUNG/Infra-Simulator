// =================================================================
// FILE: src/components/FileUpload.jsx
// 역할: 파일 업로드 UI 컴포넌트
// =================================================================
import React, { useRef } from 'react';

export default function FileUpload({ id, label, file, onFileChange }) {
    const inputRef = useRef(null);

    const handleFileClick = () => {
        inputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div
                onClick={handleFileClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-blue-500"
            >
                <input
                    type="file"
                    id={id}
                    ref={inputRef}
                    className="hidden"
                    accept=".xlsx"
                    onChange={handleFileChange}
                />
                {file ? (
                    <span className="text-sm font-semibold text-green-600">{file.name}</span>
                ) : (
                    <span className="text-sm text-gray-500">파일을 선택하거나 여기에 드래그하세요</span>
                )}
            </div>
        </div>
    );
}