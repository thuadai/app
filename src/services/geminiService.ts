import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface ExtractedData {
  sellerName?: string;
  buyerName?: string;
  buyerAddress?: string;
  gcnNumber?: string;
  gcnDate?: string;
  parcelNumber?: string;
  mapSheetNumber?: string;
  landAddress?: string;
  totalArea?: string;
  residentialArea?: string;
  agriculturalArea?: string;
  usageForm?: string;
  residentialDuration?: string;
  agriculturalDuration?: string;
  residentialOrigin?: string;
  agriculturalOrigin?: string;
  notes?: string;
  processingDate?: string;
  
  // Fields for Tách thửa (Subdivision)
  transferArea?: string;
  transferResidentialArea?: string;
  transferAgriculturalArea?: string;
  
  newParcelNumber1?: string;
  newMapSheetNumber1?: string;
  newLandAddress1?: string;
  newUsageForm1?: string;
  newResidentialDuration1?: string;
  newAgriculturalDuration1?: string;
  newResidentialOrigin1?: string;
  newAgriculturalOrigin1?: string;
  
  newParcelNumber2?: string;
  newMapSheetNumber2?: string;
  newLandAddress2?: string;
  remainingArea?: string;
  remainingResidentialArea?: string;
  remainingAgriculturalArea?: string;
  newUsageForm2?: string;
  newResidentialDuration2?: string;
  newAgriculturalDuration2?: string;
  newResidentialOrigin2?: string;
  newAgriculturalOrigin2?: string;
  areaChangeNotes?: string;
}

export async function extractDataFromDocuments(files: File[]): Promise<ExtractedData> {
  if (!files || files.length === 0) {
    return {};
  }

  // Helper to compress images before sending to AI to speed up processing
  const processFile = async (file: File): Promise<any> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIMENSION = 1600; // Max width/height to maintain readability while reducing size
            let { width, height } = img;

            if (width > height && width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.8 quality
            const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            resolve({
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            });
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else {
      // For PDFs and other files, read as base64 directly
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(",")[1];
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  // Process all files in parallel
  const parts = await Promise.all(files.map(processFile));

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...parts,
        {
          text: "Trích xuất các thông tin sau từ các tài liệu tải lên để điền vào Biên bản thẩm định hồ sơ: Tên người chuyển quyền (bên bán), Tên người nhận chuyển quyền (bên mua), Địa chỉ thường trú người nhận, Số phát hành Giấy chứng nhận QSD đất, Ngày cấp GCN, Thửa đất số, Tờ bản đồ số, Địa chỉ thửa đất, Tổng diện tích, Diện tích đất ở, Diện tích đất trồng cây lâu năm (hoặc loại đất nông nghiệp khác), Hình thức sử dụng, Thời hạn sử dụng đất ở, Thời hạn sử dụng đất nông nghiệp, Nguồn gốc sử dụng đất ở, Nguồn gốc sử dụng đất nông nghiệp, Ngày xử lý/lập biên bản (nếu có), và các Ghi chú (nếu có). \n\nNếu là hồ sơ TÁCH THỬA, trích xuất thêm: Diện tích chuyển quyền (transferArea), Diện tích đất ở chuyển quyền (transferResidentialArea), Diện tích đất NN chuyển quyền (transferAgriculturalArea), Thửa đất số mới 1 (newParcelNumber1), Tờ bản đồ số mới 1 (newMapSheetNumber1), Địa chỉ thửa đất mới 1 (newLandAddress1), Hình thức sử dụng mới 1 (newUsageForm1), Thời hạn đất ở mới 1 (newResidentialDuration1), Thời hạn đất NN mới 1 (newAgriculturalDuration1), Nguồn gốc đất ở mới 1 (newResidentialOrigin1), Nguồn gốc đất NN mới 1 (newAgriculturalOrigin1), Thửa đất số mới 2 (newParcelNumber2), Tờ bản đồ số mới 2 (newMapSheetNumber2), Địa chỉ thửa đất mới 2 (newLandAddress2), Diện tích còn lại (remainingArea), Diện tích đất ở còn lại (remainingResidentialArea), Diện tích đất NN còn lại (remainingAgriculturalArea), Hình thức sử dụng mới 2 (newUsageForm2), Thời hạn đất ở mới 2 (newResidentialDuration2), Thời hạn đất NN mới 2 (newAgriculturalDuration2), Nguồn gốc đất ở mới 2 (newResidentialOrigin2), Nguồn gốc đất NN mới 2 (newAgriculturalOrigin2), Ghi chú biến động diện tích (areaChangeNotes). Trả về dưới dạng JSON.",
        },
      ],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sellerName: { type: Type.STRING, description: "Tên người chuyển quyền (VD: bà Trần Thị Hoa)" },
            buyerName: { type: Type.STRING, description: "Tên người nhận chuyển quyền (VD: ông Trần Trung Sơn)" },
            buyerAddress: { type: Type.STRING, description: "Địa chỉ thường trú của người nhận chuyển quyền" },
            gcnNumber: { type: Type.STRING, description: "Giấy chứng nhận QSD đất số phát hành (VD: AA 03396047)" },
            gcnDate: { type: Type.STRING, description: "Ngày cấp Giấy chứng nhận" },
            parcelNumber: { type: Type.STRING, description: "Thửa đất số" },
            mapSheetNumber: { type: Type.STRING, description: "Tờ bản đồ số" },
            landAddress: { type: Type.STRING, description: "Địa chỉ thửa đất" },
            totalArea: { type: Type.STRING, description: "Tổng diện tích thửa đất (m2)" },
            residentialArea: { type: Type.STRING, description: "Diện tích đất ở (m2)" },
            agriculturalArea: { type: Type.STRING, description: "Diện tích đất nông nghiệp / trồng cây lâu năm (m2)" },
            usageForm: { type: Type.STRING, description: "Hình thức sử dụng (VD: riêng)" },
            residentialDuration: { type: Type.STRING, description: "Thời hạn sử dụng đất ở (VD: Lâu dài)" },
            agriculturalDuration: { type: Type.STRING, description: "Thời hạn sử dụng đất nông nghiệp (VD: Đến ngày 21/02/2048)" },
            residentialOrigin: { type: Type.STRING, description: "Nguồn gốc sử dụng đất ở" },
            agriculturalOrigin: { type: Type.STRING, description: "Nguồn gốc sử dụng đất nông nghiệp" },
            notes: { type: Type.STRING, description: "Ghi chú khác (nếu có)" },
            processingDate: { type: Type.STRING, description: "Ngày xử lý hoặc lập biên bản (VD: ngày 15 tháng 08 năm 2026)" },
            transferArea: { type: Type.STRING, description: "Diện tích chuyển quyền (m2)" },
            transferResidentialArea: { type: Type.STRING, description: "Diện tích đất ở chuyển quyền (m2)" },
            transferAgriculturalArea: { type: Type.STRING, description: "Diện tích đất nông nghiệp chuyển quyền (m2)" },
            newParcelNumber1: { type: Type.STRING, description: "Thửa đất số mới 1 (phần chuyển quyền)" },
            newMapSheetNumber1: { type: Type.STRING, description: "Tờ bản đồ số mới 1" },
            newLandAddress1: { type: Type.STRING, description: "Địa chỉ thửa đất mới 1" },
            newUsageForm1: { type: Type.STRING, description: "Hình thức sử dụng mới 1" },
            newResidentialDuration1: { type: Type.STRING, description: "Thời hạn sử dụng đất ở mới 1" },
            newAgriculturalDuration1: { type: Type.STRING, description: "Thời hạn sử dụng đất nông nghiệp mới 1" },
            newResidentialOrigin1: { type: Type.STRING, description: "Nguồn gốc sử dụng đất ở mới 1" },
            newAgriculturalOrigin1: { type: Type.STRING, description: "Nguồn gốc sử dụng đất nông nghiệp mới 1" },
            newParcelNumber2: { type: Type.STRING, description: "Thửa đất số mới 2 (phần còn lại)" },
            newMapSheetNumber2: { type: Type.STRING, description: "Tờ bản đồ số mới 2" },
            newLandAddress2: { type: Type.STRING, description: "Địa chỉ thửa đất mới 2" },
            remainingArea: { type: Type.STRING, description: "Diện tích còn lại (m2)" },
            remainingResidentialArea: { type: Type.STRING, description: "Diện tích đất ở còn lại (m2)" },
            remainingAgriculturalArea: { type: Type.STRING, description: "Diện tích đất nông nghiệp còn lại (m2)" },
            newUsageForm2: { type: Type.STRING, description: "Hình thức sử dụng mới 2" },
            newResidentialDuration2: { type: Type.STRING, description: "Thời hạn sử dụng đất ở mới 2" },
            newAgriculturalDuration2: { type: Type.STRING, description: "Thời hạn sử dụng đất nông nghiệp mới 2" },
            newResidentialOrigin2: { type: Type.STRING, description: "Nguồn gốc sử dụng đất ở mới 2" },
            newAgriculturalOrigin2: { type: Type.STRING, description: "Nguồn gốc sử dụng đất nông nghiệp mới 2" },
            areaChangeNotes: { type: Type.STRING, description: "Ghi chú về biến động diện tích (VD: Giảm 21,6 m2 so với GCN đã được cấp...)" },
          },
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr) as ExtractedData;
    return data;
  } catch (error) {
    console.error("Error extracting data:", error);
    throw error;
  }
}
