import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelDebugger = () => {
    const [file, setFile] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            debugExcelFile(uploadedFile);
        }
    };

    const debugExcelFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const debugData = {
                    fileName: file.name,
                    sheetNames: workbook.SheetNames,
                    sheets: {}
                };

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    debugData.sheets[sheetName] = {
                        totalRows: jsonData.length,
                        first10Rows: jsonData.slice(0, 10),
                        hasMROrder: jsonData.some(row => 
                            row && row.some(cell => {
                                const cellStr = cell ? cell.toString().trim() : '';
                                return cellStr.startsWith('M:') || cellStr.startsWith('R:');
                            })
                        ),
                        sampleCells: jsonData.slice(0, 5).map(row => 
                            row ? row.slice(0, 3).map(cell => cell ? cell.toString().trim() : '') : []
                        )
                    };
                });

                setDebugInfo(debugData);
            } catch (error) {
                setDebugInfo({ error: error.message });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Excel File Debugger</h3>
            
            <div className="mb-4">
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {debugInfo && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Debug Information:</h4>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ExcelDebugger;
