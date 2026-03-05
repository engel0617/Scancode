import { useState, useCallback } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import { exportToExcel } from './utils/excel';
import { Trash2, Download } from 'lucide-react';

interface ScannedItem {
  id: string;
  originalCode: string;
  processedCode: string;
  timestamp: string;
}

export default function App() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

  const handleScan = useCallback((decodedText: string) => {
    let processed = decodedText;
    if (processed.endsWith('C')) {
      processed = processed.slice(0, -1);
    }

    const newItem: ScannedItem = {
      id: crypto.randomUUID(),
      originalCode: decodedText,
      processedCode: processed,
      timestamp: new Date().toLocaleString('zh-TW'),
    };

    setScannedItems(prev => {
        // Prevent duplicate scans of the same code if it's the most recent one
        if (prev.length > 0 && prev[0].originalCode === decodedText) {
            return prev;
        }
        return [newItem, ...prev];
    });
  }, []);

  const handleDelete = (id: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClear = () => {
    if (confirm('確定要清空所有紀錄嗎？')) {
      setScannedItems([]);
    }
  };

  const handleExport = () => {
    if (scannedItems.length === 0) {
      alert('沒有資料可匯出');
      return;
    }
    const dataToExport = scannedItems.map(item => ({
      '原始條碼': item.originalCode,
      '處理後條碼': item.processedCode,
      '掃描時間': item.timestamp
    }));
    exportToExcel(dataToExport, `掃描紀錄_${new Date().toISOString().slice(0,10)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        <header className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800">條碼掃描小幫手</h1>
          <p className="text-sm text-gray-500 mt-1">自動移除尾碼 'C' 並匯出 Excel</p>
        </header>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <BarcodeScanner onScanSuccess={handleScan} />
        </div>

        <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm cursor-pointer"
            >
                <Download size={20} />
                匯出 Excel
            </button>
            <button
                onClick={handleClear}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm cursor-pointer"
            >
                <Trash2 size={20} />
                清空
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-700">掃描紀錄 ({scannedItems.length})</h2>
            </div>
            <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {scannedItems.length === 0 ? (
                    <li className="p-8 text-center text-gray-400 text-sm">
                        尚未掃描任何條碼
                    </li>
                ) : (
                    scannedItems.map((item) => (
                        <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                            <div>
                                <div className="font-mono text-lg font-bold text-gray-800 tracking-wide">
                                    {item.processedCode}
                                </div>
                                <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">原始: {item.originalCode}</span>
                                    <span className="self-center text-gray-300">|</span>
                                    <span className="self-center">{item.timestamp.split(' ')[1]}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-gray-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="刪除"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
      </div>
    </div>
  );
}
