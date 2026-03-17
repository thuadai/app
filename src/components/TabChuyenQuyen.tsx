import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, Download, Edit3, CheckCircle2, X, Printer } from 'lucide-react';
import { extractDataFromDocuments, ExtractedData } from '../services/geminiService';
import { exportToWord } from '../services/exportService';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

export default function TabChuyenQuyen() {
  const [files, setFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFont, setPreviewFont] = useState('"Times New Roman", Times, serif');
  const [previewFontSize, setPreviewFontSize] = useState(13);
  const [marginTop, setMarginTop] = useState(20);
  const [marginBottom, setMarginBottom] = useState(20);
  const [marginLeft, setMarginLeft] = useState(30);
  const [marginRight, setMarginRight] = useState(20);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Bien_Ban_Tham_Dinh',
    pageStyle: `
      @page {
        size: A4;
        margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm !important;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        .print-content-container {
          padding: 0 !important;
          width: 100% !important;
          min-height: auto !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
    `,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  } as any);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processDocuments = async () => {
    if (files.length === 0) return;
    setIsExtracting(true);
    const toastId = toast.loading('Đang trích xuất dữ liệu bằng AI...');
    try {
      const data = await extractDataFromDocuments(files);
      setExtractedData(data);
      setIsEditing(true);
      toast.success('Trích xuất dữ liệu thành công!', { id: toastId });
    } catch (error) {
      console.error("Extraction failed", error);
      toast.error('Có lỗi xảy ra khi trích xuất dữ liệu. Vui lòng thử lại.', { id: toastId });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExtractedData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleExport = async () => {
    if (extractedData) {
      const getDocxFontName = (cssFont: string) => {
        if (cssFont.includes('Times New Roman')) return 'Times New Roman';
        if (cssFont.includes('Arial')) return 'Arial';
        if (cssFont.includes('Tahoma')) return 'Tahoma';
        return 'Times New Roman';
      };
      await exportToWord(extractedData, getDocxFontName(previewFont), previewFontSize, {
        top: marginTop,
        bottom: marginBottom,
        left: marginLeft,
        right: marginRight
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h1 className="text-2xl font-semibold text-slate-800">Chuyển Quyền Nguyên Thửa</h1>
          <p className="text-slate-500 mt-1">Tải lên hợp đồng, giấy chứng nhận để tự động trích xuất thông tin và điền vào mẫu.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload & Form */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upload Area */}
            {files.length === 0 ? (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors backdrop-blur-md
                  ${isDragActive ? 'border-indigo-500 bg-indigo-50/90' : 'border-slate-300 hover:border-indigo-400 bg-white/90'}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Kéo thả các file vào đây, hoặc click để chọn file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ PDF, JPG, PNG (Tối đa 10MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-slate-700">Tài liệu đã tải lên ({files.length})</h3>
                    <div className="flex gap-2">
                      <label className="cursor-pointer px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                        + Thêm file
                        <input type="file" multiple accept=".pdf,image/jpeg,image/png" className="hidden" onChange={(e) => {
                          if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
                        }} />
                      </label>
                      <button onClick={() => setFiles([])} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        Xóa tất cả
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[150px] text-slate-600">{f.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 ml-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={processDocuments}
                      disabled={isExtracting}
                      className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Đang đọc AI...
                        </>
                      ) : (
                        "Xử lý bằng AI"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Data Form */}
            {extractedData && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-800 flex items-center">
                    <Edit3 size={18} className="mr-2 text-indigo-500" />
                    Thông tin trích xuất
                  </h3>
                </div>
                <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin chung</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Tên người chuyển quyền (Bên bán)</label>
                        <input type="text" name="sellerName" value={extractedData.sellerName || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Tên người nhận chuyển quyền (Bên mua)</label>
                        <input type="text" name="buyerName" value={extractedData.buyerName || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Địa chỉ thường trú người nhận</label>
                        <input type="text" name="buyerAddress" value={extractedData.buyerAddress || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Ngày xử lý / lập biên bản</label>
                        <input type="text" name="processingDate" value={extractedData.processingDate || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="VD: ngày 15 tháng 08 năm 2026" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin GCN & Thửa đất</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Số phát hành GCN</label>
                        <input type="text" name="gcnNumber" value={extractedData.gcnNumber || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Ngày cấp GCN</label>
                        <input type="text" name="gcnDate" value={extractedData.gcnDate || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Thửa đất số</label>
                        <input type="text" name="parcelNumber" value={extractedData.parcelNumber || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Tờ bản đồ số</label>
                        <input type="text" name="mapSheetNumber" value={extractedData.mapSheetNumber || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Địa chỉ thửa đất</label>
                        <input type="text" name="landAddress" value={extractedData.landAddress || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-2 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Tổng diện tích (m<sup>2</sup>)</label>
                          <input type="text" name="totalArea" value={extractedData.totalArea || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Đất ở (m<sup>2</sup>)</label>
                          <input type="text" name="residentialArea" value={extractedData.residentialArea || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Đất NN (m<sup>2</sup>)</label>
                          <input type="text" name="agriculturalArea" value={extractedData.agriculturalArea || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Hình thức sử dụng</label>
                        <input type="text" name="usageForm" value={extractedData.usageForm || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời hạn & Nguồn gốc</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Thời hạn sử dụng đất ở</label>
                        <input type="text" name="residentialDuration" value={extractedData.residentialDuration || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Thời hạn sử dụng đất nông nghiệp</label>
                        <input type="text" name="agriculturalDuration" value={extractedData.agriculturalDuration || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Nguồn gốc sử dụng chung</label>
                        <input type="text" name="origin" value={extractedData.origin || ''} onChange={handleInputChange} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Nguồn gốc sử dụng đất ở</label>
                        <textarea name="residentialOrigin" value={extractedData.residentialOrigin || ''} onChange={handleInputChange as any} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={2} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Nguồn gốc sử dụng đất nông nghiệp</label>
                        <textarea name="agriculturalOrigin" value={extractedData.agriculturalOrigin || ''} onChange={handleInputChange as any} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={2} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Ghi chú</label>
                        <textarea name="notes" value={extractedData.notes || ''} onChange={handleInputChange as any} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 flex items-center shrink-0">
                  <FileText size={18} className="mr-2 text-indigo-500" />
                  Bản xem trước Word (Biên bản thẩm định)
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="hidden xl:flex items-center space-x-2 border-r border-slate-200 pr-4">
                    <span className="text-sm text-slate-500">Font:</span>
                    <select 
                      value={previewFont}
                      onChange={(e) => setPreviewFont(e.target.value)}
                      className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                      <option value='Arial, sans-serif'>Arial</option>
                      <option value='Tahoma, sans-serif'>Tahoma</option>
                    </select>
                    <span className="text-sm text-slate-500 ml-2">Cỡ:</span>
                    <select
                      value={previewFontSize}
                      onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                      className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value={8}>8pt</option>
                      <option value={9}>9pt</option>
                      <option value={10}>10pt</option>
                      <option value={11}>11pt</option>
                      <option value={12}>12pt</option>
                      <option value={13}>13pt</option>
                      <option value={14}>14pt</option>
                      <option value={15}>15pt</option>
                      <option value={16}>16pt</option>
                    </select>
                  </div>
                  <div className="hidden xl:flex items-center space-x-2 border-r border-slate-200 pr-4">
                    <span className="text-sm text-slate-500" title="Lề (Trên, Dưới, Trái, Phải)">Lề (mm):</span>
                    <input type="number" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề trên (mm)" />
                    <input type="number" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề dưới (mm)" />
                    <input type="number" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề trái (mm)" />
                    <input type="number" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề phải (mm)" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setIsPreviewModalOpen(true)}
                      disabled={!extractedData}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${extractedData 
                          ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'}`}
                    >
                      <FileText size={16} className="mr-2" />
                      Xem trước Word
                    </button>
                    <button 
                      onClick={handleExport}
                      disabled={!extractedData}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${extractedData 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Download size={16} className="mr-2" />
                      Xuất Word
                    </button>
                    <button 
                      onClick={() => handlePrint()}
                      disabled={!extractedData}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${extractedData 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Printer size={16} className="mr-2" />
                      In A4
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 sm:p-8 bg-slate-100/50 overflow-y-auto flex justify-center items-start">
                {/* A4 Paper Preview */}
                <div 
                  ref={printRef}
                  className="bg-white shadow-none border border-slate-200 print:border-none text-black shrink-0 print-content-container"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    height: 'max-content',
                    padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
                    fontFamily: previewFont,
                    fontSize: `${previewFontSize}pt`,
                    lineHeight: '1.5'
                  }}
                >
                  <div className="flex justify-between mb-6 items-start">
                    <div className="text-center flex flex-col items-center">
                      <p className="font-bold whitespace-nowrap" style={{ fontSize: `${previewFontSize - 1}pt` }}>VĂN PHÒNG ĐĂNG KÝ ĐẤT ĐAI</p>
                      <p className="font-bold border-b-[1.5px] border-black pb-0.5 inline-block whitespace-nowrap" style={{ fontSize: `${previewFontSize - 1}pt` }}>CHI NHÁNH HUYỆN KỲ ANH</p>
                    </div>
                    <div className="text-center flex flex-col items-center">
                      <p className="font-bold whitespace-nowrap" style={{ fontSize: `${previewFontSize - 1}pt` }}>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="font-bold border-b-[1.5px] border-black pb-0.5 inline-block whitespace-nowrap" style={{ fontSize: `${previewFontSize}pt` }}>Độc lập - Tự do - Hạnh phúc</p>
                      <p className="italic mt-2 whitespace-nowrap" style={{ fontSize: `${previewFontSize}pt` }}>
                        Kỳ Anh, {extractedData?.processingDate || "ngày ...... tháng ...... năm 2026"}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <p className="font-bold" style={{ fontSize: `${previewFontSize + 1}pt` }}>BIÊN BẢN THẨM ĐỊNH HỒ SƠ</p>
                    <p className="font-bold" style={{ fontSize: `${previewFontSize}pt` }}>Chuyển quyền sử dụng đất, QSHNO và tài sản khác gắn liền với đất</p>
                  </div>

                  <p className="mb-2 text-justify indent-8">
                    Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh tiếp nhận hồ sơ của ông/bà <span className="font-semibold">{extractedData?.sellerName || "........................................"}</span> sử dụng đất tại <span className="font-semibold">{extractedData?.landAddress || "thôn ................, xã ................, tỉnh Hà Tĩnh"}</span> chuyển quyền sử dụng đất cho ông/bà <span className="font-semibold">{extractedData?.buyerName || "........................................"}</span>, thường trú tại <span className="font-semibold">{extractedData?.buyerAddress || "........................................, tỉnh Hà Tĩnh"}</span>. Sau khi thẩm định hồ sơ, Chi nhánh Văn phòng ĐKĐĐ huyện Kỳ Anh báo cáo kết quả như sau:
                  </p>

                  <p className="font-bold mb-1">1. Thành phần hồ sơ gồm:</p>
                  <p className="mb-1">- Đơn đăng ký biến động đất đai, tài sản gắn liền với đất;</p>
                  <p className="mb-1">- Hợp đồng chuyển quyền SD đất đã được ........................ công chứng, chứng thực.</p>
                  <p className="mb-2">- Giấy chứng nhận QSD đất số phát hành: <span className="font-semibold">{extractedData?.gcnNumber || "........................"}</span> do ........................ cấp ngày: <span className="font-bold">{extractedData?.gcnDate || "........................"}</span>.</p>

                  <p className="font-bold mb-1">2. Thông tin thửa đất chuyển quyền:</p>
                  <p className="mb-1">- Thửa đất số: <span className="font-semibold">{extractedData?.parcelNumber || ".........."}</span>; tờ bản đồ số: <span className="font-semibold">{extractedData?.mapSheetNumber || ".........."}</span>;</p>
                  <p className="mb-1">- Địa chỉ thửa đất: <span className="font-semibold">{extractedData?.landAddress || "Thôn ................, xã ................, tỉnh Hà Tĩnh"}</span>;</p>
                  <p className="mb-1">- Diện tích thửa đất: <span className="font-semibold">{extractedData?.totalArea || ".........."}</span> m<sup>2</sup>. Trong đó:</p>
                  <p className="mb-1 ml-8">+ Đất ở tại : <span className="font-semibold">{extractedData?.residentialArea || ".........."}</span> m<sup>2</sup>;</p>
                  <p className="mb-1 ml-8">+ Đất trồng cây lâu năm: <span className="font-semibold">{extractedData?.agriculturalArea || ".........."}</span> m<sup>2</sup></p>
                  <p className="mb-1">- Hình thức sử dụng: <span className="font-semibold">{extractedData?.usageForm || "Chung (riêng)"}</span>.</p>
                  <p className="mb-1">- Thời hạn sử dụng đất: + Đất ở: <span className="font-semibold">{extractedData?.residentialDuration || "Lâu dài"}</span>;</p>
                  <p className="mb-1 ml-8">+ Đất trồng cây lâu năm: <span className="font-semibold">{extractedData?.agriculturalDuration || "Đến ngày ........................"}</span></p>
                  <p className="mb-1">- Nguồn gốc sử dụng: <span className="font-semibold">{extractedData?.origin || "Được tặng cho đất được, Nhận chuyển nhượng đất được, Nhận thừa kế đất được"}</span></p>
                  <p className="mb-1 ml-8">+ Đất ở: <span className="font-semibold">{extractedData?.residentialArea || ".........."}</span> m<sup>2</sup>: <span className="font-semibold">{extractedData?.residentialOrigin || ""}</span></p>
                  <p className="mb-1 ml-8">+ Đất trồng cây lâu năm: <span className="font-semibold">{extractedData?.agriculturalArea || ".........."}</span> m<sup>2</sup>: <span className="font-semibold">{extractedData?.agriculturalOrigin || ""}</span></p>
                  <div className="mb-4 text-red-600">
                    <span className="font-bold">Ghi chú:</span> <span className="italic">{extractedData?.notes || "Thửa đất có 132,2 m2 nằm trong chỉ giới QHGT\nTheo Giấy xác nhận tình trạng hôn nhân số 99/UBND-XNTTHN ngày 13/7/2023 của UBND xã Kỳ Khang, thửa đất là tài sản riêng của bà Nguyễn Thị Nga.\nTheo Văn bản thỏa thuận về tài sản riêng của vợ chồng trong thời kỳ hôn nhân số 2160/2025, quyển số 01/TP/CC-SCC/HĐGD/VBTT của Văn phòng Công chứng Kỳ Anh chứng thực ngày 08/5/2025, thửa đất là tài sản riêng của ông (bà) Phạm Thái Hà.\nThửa đất chưa được xác định là tài sản riêng\nSố thửa, số tờ bản đồ đang sử dụng theo bản đồ địa chính thị trấn Kỳ Đồng trước khi sắp xếp"}</span>
                  </div>

                  <p className="font-bold mb-2">- Thông tin tài sản: ................................................................................................</p>

                  <p className="font-bold mb-1">3. Kết quả thẩm định:</p>
                  <p className="mb-1"><span className="font-bold italic">- Về thành phần hồ sơ:</span> Đầy đủ theo bộ thủ tục hành chính của UBND tỉnh.</p>
                  <p className="mb-1"><span className="font-bold italic">- Về hình thức chuyển quyền:</span> <span className="font-bold">{extractedData?.transferType || ""}</span></p>
                  <p className="mb-1"><span className="font-bold italic">- Về diện tích thửa đất chuyển quyền:</span> Không thay đổi so với GCN đã cấp</p>
                  <p className="mb-1"><span className="font-bold italic">- Về tính pháp lý, điều kiện thực hiện chuyển quyền:</span></p>
                  <p className="mb-1 ml-8">+ Thửa đất đã được cấp giấy chứng nhận quyền sử dụng đất;</p>
                  <p className="mb-1 ml-8 text-justify">+ Về tình trạng tranh chấp: Đến thời điểm hiện tại, Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh chưa nhận được Đơn, văn bản nào phản ánh tình trạng tranh chấp liên quan đến thửa đất;</p>
                  <p className="mb-1 ml-8 text-justify">+ Quyền sử dụng đất không bị kê biên, áp dụng biện pháp khác để bảo đảm thi hành án theo quy định của pháp luật thi hành án dân sự;</p>
                  <p className="mb-1 ml-8">+ Đang trong thời hạn sử dụng đất.</p>
                  <p className="mb-1 ml-8">+ Quyền sử dụng đất không bị áp dụng biện pháp khẩn cấp tạm thời theo quy định của pháp luật</p>
                  <p className="mb-4 text-justify"><span className="font-bold italic">- Về thực hiện nghĩa vụ tài chính:</span> Người sử dụng đất đã thực hiện đầy đủ nghĩa vụ tài chính theo thông báo của cơ quan thuế (có chứng từ kèm theo).</p>

                  <p className="font-bold mb-1">4. Kiến nghị:</p>
                  <p className="mb-8 text-justify indent-8">
                    Hồ sơ đủ điều kiện chuyển quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất theo Điều 45 Luật Đất đai năm 2024 và các quy định khác của pháp luật. Kính đề nghị Văn phòng đăng ký đất đai tỉnh Hà Tĩnh thẩm tra hồ sơ, trình ký cấp Giấy chứng nhận QSD đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất cho ông/bà <span className="font-semibold">{extractedData?.buyerName || "........................................"}</span> theo quy định pháp luật./.
                  </p>

                  <div className="flex justify-between text-center mb-16 mt-8 break-inside-avoid">
                    <div className="w-1/2 flex flex-col items-center">
                      <p className="font-bold">Cán bộ thẩm định hồ sơ</p>
                      <div className="h-24"></div>
                      <p className="font-bold">Nguyễn Thanh Hà</p>
                    </div>
                    <div className="w-1/2 flex flex-col items-center">
                      <p className="font-bold">PHỤ TRÁCH CHI NHÁNH</p>
                      <div className="h-24"></div>
                      <p className="font-bold">Trần Xuân Huy</p>
                    </div>
                  </div>

                  <div className="text-center mb-4 break-inside-avoid">
                    <p className="font-bold">KẾT QUẢ THẨM TRA CỦA PHÒNG ĐĂNG KÝ VÀ CẤP GCN</p>
                  </div>
                  
                  <div className="space-y-2 mb-8 break-inside-avoid">
                    <p>- Về hồ sơ: .................................................................................................................</p>
                    <p>- Về tính pháp lý:.........................................................................................................</p>
                    <p>- Về tình hình thực hiện nghĩa vụ tài chính:................................................................</p>
                    <p>- Đề xuất, kiến nghị.....................................................................................................</p>
                    <p>....................................................................................................................................</p>
                  </div>

                  <div className="flex justify-between text-center mt-8 break-inside-avoid">
                    <div className="w-1/2 flex flex-col items-center">
                      <p className="italic">Hà Tĩnh, {extractedData?.processingDate || "ngày ...... tháng ...... năm 2026"}</p>
                      <p className="font-bold">Người thẩm tra</p>
                      <div className="h-24"></div>
                      <p className="font-bold"> </p>
                    </div>
                    <div className="w-1/2 flex flex-col items-center">
                      <p className="italic">Hà Tĩnh, {extractedData?.processingDate || "ngày ...... tháng ...... năm 2026"}</p>
                      <p className="font-bold">Người phụ trách</p>
                      <div className="h-24"></div>
                      <p className="font-bold">Hoàng Thị Lệ Trinh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4 shrink-0">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center shrink-0">
                <FileText size={20} className="mr-2 text-indigo-500" />
                Bản xem trước Word
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-2 border-r border-slate-200 pr-4">
                  <span className="text-sm text-slate-500">Font:</span>
                  <select 
                    value={previewFont}
                    onChange={(e) => setPreviewFont(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                    <option value='Arial, sans-serif'>Arial</option>
                    <option value='Tahoma, sans-serif'>Tahoma</option>
                  </select>
                  <span className="text-sm text-slate-500 ml-2">Cỡ:</span>
                  <select
                    value={previewFontSize}
                    onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value={8}>8pt</option>
                    <option value={9}>9pt</option>
                    <option value={10}>10pt</option>
                    <option value={11}>11pt</option>
                    <option value={12}>12pt</option>
                    <option value={13}>13pt</option>
                    <option value={14}>14pt</option>
                    <option value={15}>15pt</option>
                    <option value={16}>16pt</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-r border-slate-200 pr-4">
                  <span className="text-sm text-slate-500" title="Lề (Trên, Dưới, Trái, Phải)">Lề (mm):</span>
                  <input type="number" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề trên (mm)" />
                  <input type="number" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề dưới (mm)" />
                  <input type="number" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề trái (mm)" />
                  <input type="number" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value))} className="w-12 text-sm border border-slate-300 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center" title="Lề phải (mm)" />
                </div>
                <button 
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Xuất Word
                </button>
                <button 
                  onClick={() => handlePrint()}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Printer size={16} className="mr-2" />
                  In A4
                </button>
                <button 
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-white">
              {/* A4 Paper Preview (Duplicate for Modal) */}
              <div 
                className="bg-white shadow-none border border-slate-200 print:border-none text-black shrink-0"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  height: 'max-content',
                  padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
                  fontFamily: previewFont,
                  fontSize: `${previewFontSize}pt`,
                  lineHeight: '1.5'
                }}
              >
                <div className="flex justify-between mb-6 items-start">
                  <div className="text-center flex flex-col items-center">
                    <p className="font-bold whitespace-nowrap" style={{ fontSize: `${previewFontSize - 1}pt` }}>VĂN PHÒNG ĐĂNG KÝ ĐẤT ĐAI</p>
                    <p className="font-bold border-b-[1.5px] border-black pb-0.5 inline-block whitespace-nowrap" style={{ fontSize: `${previewFontSize - 1}pt` }}>CHI NHÁNH HUYỆN KỲ ANH</p>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <p className="font-bold whitespace-nowrap" style={{ fontSize: `${previewFontSize - 1}pt` }}>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold border-b-[1.5px] border-black pb-0.5 inline-block whitespace-nowrap" style={{ fontSize: `${previewFontSize}pt` }}>Độc lập - Tự do - Hạnh phúc</p>
                    <p className="italic mt-2 whitespace-nowrap" style={{ fontSize: `${previewFontSize}pt` }}>
                      Kỳ Anh, {extractedData?.processingDate || "ngày ...... tháng ...... năm 2026"}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="font-bold" style={{ fontSize: `${previewFontSize + 1}pt` }}>BIÊN BẢN THẨM ĐỊNH HỒ SƠ</p>
                  <p className="font-bold" style={{ fontSize: `${previewFontSize}pt` }}>Chuyển quyền sử dụng đất, QSHNO và tài sản khác gắn liền với đất</p>
                </div>

                <p className="mb-2 text-justify indent-8">
                  Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh tiếp nhận hồ sơ của ông/bà <span className="font-semibold">{extractedData?.sellerName || "........................................"}</span> sử dụng đất tại <span className="font-semibold">{extractedData?.landAddress || "thôn ................, xã ................, tỉnh Hà Tĩnh"}</span> chuyển quyền sử dụng đất cho ông/bà <span className="font-semibold">{extractedData?.buyerName || "........................................"}</span>, thường trú tại <span className="font-semibold">{extractedData?.buyerAddress || "........................................, tỉnh Hà Tĩnh"}</span>. Sau khi thẩm định hồ sơ, Chi nhánh Văn phòng ĐKĐĐ huyện Kỳ Anh báo cáo kết quả như sau:
                </p>

                <p className="font-bold mb-1">1. Thành phần hồ sơ gồm:</p>
                <p className="mb-1">- Đơn đăng ký biến động đất đai, tài sản gắn liền với đất;</p>
                <p className="mb-1">- Hợp đồng chuyển quyền SD đất đã được ........................ công chứng, chứng thực.</p>
                <p className="mb-2">- Giấy chứng nhận QSD đất số phát hành: <span className="font-semibold">{extractedData?.gcnNumber || "........................"}</span> do ........................ cấp ngày: <span className="font-bold">{extractedData?.gcnDate || "........................"}</span>.</p>

                <p className="font-bold mb-1">2. Thông tin thửa đất chuyển quyền:</p>
                <p className="mb-1">- Thửa đất số: <span className="font-semibold">{extractedData?.parcelNumber || ".........."}</span>; tờ bản đồ số: <span className="font-semibold">{extractedData?.mapSheetNumber || ".........."}</span>;</p>
                <p className="mb-1">- Địa chỉ thửa đất: <span className="font-semibold">{extractedData?.landAddress || "Thôn ................, xã ................, tỉnh Hà Tĩnh"}</span>;</p>
                <p className="mb-1">- Diện tích thửa đất: <span className="font-semibold">{extractedData?.totalArea || ".........."}</span> m<sup>2</sup>. Trong đó:</p>
                <p className="mb-1 ml-8">+ Đất ở tại : <span className="font-semibold">{extractedData?.residentialArea || ".........."}</span> m<sup>2</sup>;</p>
                <p className="mb-1 ml-8">+ Đất trồng cây lâu năm: <span className="font-semibold">{extractedData?.agriculturalArea || ".........."}</span> m<sup>2</sup></p>
                <p className="mb-1">- Hình thức sử dụng: <span className="font-semibold">{extractedData?.usageForm || "Chung (riêng)"}</span>.</p>
                <p className="mb-1">- Thời hạn sử dụng đất: + Đất ở: <span className="font-semibold">{extractedData?.residentialDuration || "Lâu dài"}</span>;</p>
                <p className="mb-1 ml-8">+ Đất trồng cây lâu năm: <span className="font-semibold">{extractedData?.agriculturalDuration || "Đến ngày ........................"}</span></p>
                <p className="mb-1">- Nguồn gốc sử dụng: <span className="font-semibold">{extractedData?.origin || "Được tặng cho đất được, Nhận chuyển nhượng đất được, Nhận thừa kế đất được"}</span></p>
                <p className="mb-1 ml-8">+ Đất ở: <span className="font-semibold">{extractedData?.residentialArea || ".........."}</span> m<sup>2</sup>: <span className="font-semibold">{extractedData?.residentialOrigin || ""}</span></p>
                <p className="mb-1 ml-8">+ Đất trồng cây lâu năm: <span className="font-semibold">{extractedData?.agriculturalArea || ".........."}</span> m<sup>2</sup>: <span className="font-semibold">{extractedData?.agriculturalOrigin || ""}</span></p>
                <div className="mb-4 text-red-600">
                  <span className="font-bold">Ghi chú:</span> <span className="italic whitespace-pre-line">{extractedData?.notes || "Thửa đất có 132,2 m2 nằm trong chỉ giới QHGT\nTheo Giấy xác nhận tình trạng hôn nhân số 99/UBND-XNTTHN ngày 13/7/2023 của UBND xã Kỳ Khang, thửa đất là tài sản riêng của bà Nguyễn Thị Nga.\nTheo Văn bản thỏa thuận về tài sản riêng của vợ chồng trong thời kỳ hôn nhân số 2160/2025, quyển số 01/TP/CC-SCC/HĐGD/VBTT của Văn phòng Công chứng Kỳ Anh chứng thực ngày 08/5/2025, thửa đất là tài sản riêng của ông (bà) Phạm Thái Hà.\nThửa đất chưa được xác định là tài sản riêng\nSố thửa, số tờ bản đồ đang sử dụng theo bản đồ địa chính thị trấn Kỳ Đồng trước khi sắp xếp"}</span>
                </div>

                <p className="font-bold mb-2">- Thông tin tài sản: ................................................................................................</p>

                <p className="font-bold mb-1">3. Kết quả thẩm định:</p>
                <p className="mb-1"><span className="font-bold italic">- Về thành phần hồ sơ:</span> Đầy đủ theo bộ thủ tục hành chính của UBND tỉnh.</p>
                <p className="mb-1"><span className="font-bold italic">- Về hình thức chuyển quyền:</span> <span className="font-bold">{extractedData?.transferType || ""}</span></p>
                <p className="mb-1"><span className="font-bold italic">- Về diện tích thửa đất chuyển quyền:</span> Không thay đổi so với GCN đã cấp</p>
                <p className="mb-1"><span className="font-bold italic">- Về tính pháp lý, điều kiện thực hiện chuyển quyền:</span></p>
                <p className="mb-1 ml-8">+ Thửa đất đã được cấp giấy chứng nhận quyền sử dụng đất;</p>
                <p className="mb-1 ml-8 text-justify">+ Về tình trạng tranh chấp: Đến thời điểm hiện tại, Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh chưa nhận được Đơn, văn bản nào phản ánh tình trạng tranh chấp liên quan đến thửa đất;</p>
                <p className="mb-1 ml-8 text-justify">+ Quyền sử dụng đất không bị kê biên, áp dụng biện pháp khác để bảo đảm thi hành án theo quy định của pháp luật thi hành án dân sự;</p>
                <p className="mb-1 ml-8">+ Đang trong thời hạn sử dụng đất.</p>
                <p className="mb-1 ml-8">+ Quyền sử dụng đất không bị áp dụng biện pháp khẩn cấp tạm thời theo quy định của pháp luật</p>
                <p className="mb-4 text-justify"><span className="font-bold italic">- Về thực hiện nghĩa vụ tài chính:</span> Người sử dụng đất đã thực hiện đầy đủ nghĩa vụ tài chính theo thông báo của cơ quan thuế (có chứng từ kèm theo).</p>

                <p className="font-bold mb-1">4. Kiến nghị:</p>
                <p className="mb-8 text-justify indent-8">
                  Hồ sơ đủ điều kiện chuyển quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất theo Điều 45 Luật Đất đai năm 2024 và các quy định khác của pháp luật. Kính đề nghị Văn phòng đăng ký đất đai tỉnh Hà Tĩnh thẩm tra hồ sơ, trình ký cấp Giấy chứng nhận QSD đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất cho ông/bà <span className="font-semibold">{extractedData?.buyerName || "........................................"}</span> theo quy định pháp luật./.
                </p>

                <div className="flex justify-between text-center mb-16 mt-8 break-inside-avoid">
                  <div className="w-1/2 flex flex-col items-center">
                    <p className="font-bold">Cán bộ thẩm định hồ sơ</p>
                    <div className="h-24"></div>
                    <p className="font-bold">Nguyễn Thanh Hà</p>
                  </div>
                  <div className="w-1/2 flex flex-col items-center">
                    <p className="font-bold">PHỤ TRÁCH CHI NHÁNH</p>
                    <div className="h-24"></div>
                    <p className="font-bold">Trần Xuân Huy</p>
                  </div>
                </div>

                <div className="text-center mb-4 break-inside-avoid">
                  <p className="font-bold">KẾT QUẢ THẨM TRA CỦA PHÒNG ĐĂNG KÝ VÀ CẤP GCN</p>
                </div>
                
                <div className="space-y-2 mb-8 break-inside-avoid">
                  <p>- Về hồ sơ: .................................................................................................................</p>
                  <p>- Về tính pháp lý:.........................................................................................................</p>
                  <p>- Về tình hình thực hiện nghĩa vụ tài chính:................................................................</p>
                  <p>- Đề xuất, kiến nghị.....................................................................................................</p>
                  <p>....................................................................................................................................</p>
                </div>

                <div className="flex justify-between text-center mt-8 break-inside-avoid">
                  <div className="w-1/2 flex flex-col items-center">
                    <p className="italic">Hà Tĩnh, {extractedData?.processingDate || "ngày ...... tháng ...... năm 2026"}</p>
                    <p className="font-bold">Người thẩm tra</p>
                    <div className="h-24"></div>
                    <p className="font-bold"> </p>
                  </div>
                  <div className="w-1/2 flex flex-col items-center">
                    <p className="italic">Hà Tĩnh, {extractedData?.processingDate || "ngày ...... tháng ...... năm 2026"}</p>
                    <p className="font-bold">Người phụ trách</p>
                    <div className="h-24"></div>
                    <p className="font-bold">Hoàng Thị Lệ Trinh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
