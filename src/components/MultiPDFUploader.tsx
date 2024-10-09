import React, { useState } from 'react';
import pdfToText from 'react-pdftotext';

interface ProcessingResult {
    fileName: string;
    status: 'success' | 'failure';
    message: string;
}

const MultiPDFUploader: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [results, setResults] = useState<ProcessingResult[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    };

    const extractOrderNumber = (text: string): string | null => {
        const match = text.match(/(\d{9}|\d{6}[-]\d{1})/);
        return match ? match[0] : null;
    };

    const extractTrackingNumber = (fileName: string): string | null => {
        // Remove the .pdf extension and use the remaining part as the tracking number
        const trackingNumber = fileName.replace('.pdf', '');
        return trackingNumber || null;
    };

    const processPDF = async (file: File): Promise<ProcessingResult> => {
        try {
            const trackingNumber = extractTrackingNumber(file.name);

            if (!trackingNumber) {
                return { fileName: file.name, status: 'failure', message: 'Tracking number not found in filename' };
            }

            const text = await pdfToText(file);
            const orderNumber = extractOrderNumber(text);
            if (!orderNumber) {
                return { fileName: file.name, status: 'failure', message: 'Order number not found' };
            }

            const response = await fetch('/api/process-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber, trackingNumber }),
            });

            if (!response.ok) {
                throw new Error('Failed to process order');
            }

            return { fileName: file.name, status: 'success', message: 'Order processed successfully' };
        } catch (error: any) {
            return { fileName: file.name, status: 'failure', message: error.message || 'Unknown error occurred' };
        }
    };

    const processFiles = async () => {
        setIsProcessing(true);
        setProgress(0);
        setResults([]);

        for (let i = 0; i < files.length; i++) {
            const result = await processPDF(files[i]);
            setResults(prev => [...prev, result]);
            setProgress(((i + 1) / files.length) * 100);
        }

        setIsProcessing(false);
    };

    return (
        <div className="p-4">
            <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                className="mb-4"
            />
            <button
                onClick={processFiles}
                disabled={isProcessing || files.length === 0}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                Process PDFs
            </button>

            {isProcessing && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-center mt-2">{Math.round(progress)}% Complete</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Processing Results:</h3>
                    <ul>
                        {results.map((result, index) => (
                            <li
                                key={index}
                                className={`mb-1 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {result.fileName}: {result.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiPDFUploader;