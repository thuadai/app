import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopType, TabStopPosition, Table, TableRow, TableCell, BorderStyle, WidthType } from "docx";
import { saveAs } from "file-saver";
import { ExtractedData } from "./geminiService";

export async function exportToWord(
  data: ExtractedData, 
  fontName: string = "Times New Roman", 
  fontSizePt: number = 13,
  margins: { top: number, bottom: number, left: number, right: number } = { top: 20, bottom: 20, left: 30, right: 20 }
) {
  // Convert mm to twips (1 mm = 56.7 twips)
  const mmToTwips = (mm: number) => Math.round(mm * 56.7);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: {
              ascii: fontName,
              cs: fontName,
              eastAsia: fontName,
              hAnsi: fontName,
            },
            size: fontSizePt * 2,
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing (240 * 1.5)
            },
            alignment: AlignmentType.JUSTIFIED,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: mmToTwips(margins.top),
              right: mmToTwips(margins.right),
              bottom: mmToTwips(margins.bottom),
              left: mmToTwips(margins.left),
            },
          },
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "VĂN PHÒNG ĐĂNG KÝ ĐẤT ĐAI", bold: true, size: (fontSizePt - 1) * 2 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "CHI NHÁNH HUYỆN KỲ ANH", bold: true, size: (fontSizePt - 1) * 2, underline: {} })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: (fontSizePt - 1) * 2 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: fontSizePt * 2, underline: {} })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: `Kỳ Anh, ${data.processingDate || "ngày      tháng     năm 2026"}`, italics: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 120 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "BIÊN BẢN THẨM ĐỊNH HỒ SƠ", bold: true, size: (fontSizePt + 1) * 2 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Chuyển quyền sử dụng đất, QSHNO và tài sản khác gắn liền với đất", bold: true, size: fontSizePt * 2 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh tiếp nhận hồ sơ của ông (bà): ` }),
              new TextRun({ text: data.sellerName || "Dương Văn Sơn và bà: Tô Thị Thơ", bold: true }),
              new TextRun({ text: ` sử dụng đất tại ${data.landAddress || "thôn Đồng Tiến, xã Kỳ Anh, huyện Kỳ Anh, tỉnh Hà Tĩnh"} chuyển quyền sử dụng đất cho ông (bà) ` }),
              new TextRun({ text: data.buyerName || "Dương Chí Công và bà Nguyễn Thị Thúy", bold: true }),
              new TextRun({ text: `, thường trú tại ${data.buyerAddress || "xã Kỳ Anh, tỉnh Hà Tĩnh"}. Sau khi thẩm định hồ sơ, Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh báo cáo kết quả như sau:` }),
            ],
            indent: { firstLine: 720 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Thành phần hồ sơ gồm:", bold: true }),
            ],
          }),
          new Paragraph({ text: "- Đơn đăng ký biến động đất đai, tài sản gắn liền với đất;" }),
          new Paragraph({ text: "- Đơn đề nghị tách thửa đất, hợp thửa đất" }),
          new Paragraph({ text: "- Hợp đồng chuyển quyền sử dụng đất đã được UBND xã Kỳ Anh công chứng, chứng thực." }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Giấy chứng nhận QSD đất số phát hành: " }),
              new TextRun({ text: data.gcnNumber || "CK 173511" }),
              new TextRun({ text: " do " }),
              new TextRun({ text: "UBND huyện Kỳ Anh", bold: true }),
              new TextRun({ text: " cấp ngày: " }),
              new TextRun({ text: data.gcnDate || "20/10/2017", bold: true }),
              new TextRun({ text: "." }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "2. Thông tin thửa đất chuyển quyền:", bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thửa đất số: " }),
              new TextRun({ text: data.parcelNumber || "90" }),
              new TextRun({ text: "; tờ bản đồ số: " }),
              new TextRun({ text: data.mapSheetNumber || "31" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Địa chỉ thửa đất: " }),
              new TextRun({ text: data.landAddress || "Thôn Đồng Tiến, xã Kỳ Anh, huyện Kỳ Anh, tỉnh Hà Tĩnh" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Diện tích thửa đất: " }),
              new TextRun({ text: data.totalArea || "1174,6" }),
              new TextRun({ text: " m². Trong đó:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất ở tại: " }),
              new TextRun({ text: data.residentialArea || "200,0" }),
              new TextRun({ text: " m²;" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất trồng cây lâu năm: " }),
              new TextRun({ text: data.agriculturalArea || "874,6" }),
              new TextRun({ text: " m²" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Hình thức sử dụng: " }),
              new TextRun({ text: data.usageForm || "Riêng" }),
              new TextRun({ text: "." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thời hạn sử dụng đất: + Đất ở: " }),
              new TextRun({ text: data.residentialDuration || "Lâu dài" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "                                        + Đất trồng cây lâu năm: " }),
              new TextRun({ text: data.agriculturalDuration || "Đến ngày 21/02/2048" }),
              new TextRun({ text: "." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Nguồn gốc sử dụng:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất ở " }),
              new TextRun({ text: data.residentialArea || "200,0" }),
              new TextRun({ text: " m²: " }),
              new TextRun({ text: data.residentialOrigin || "Công nhận QSD đất như giao đất có thu tiền sử dụng đất" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất trồng cây lâu năm " }),
              new TextRun({ text: data.agriculturalArea || "874,6" }),
              new TextRun({ text: " m²: " }),
              new TextRun({ text: data.agriculturalOrigin || "Công nhận QSD đất như giao đất không thu tiền sử dụng đất." }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Ông/bà " }),
              new TextRun({ text: data.buyerName || "........................................" }),
              new TextRun({ text: " nhận chuyển quyền 1 phần thửa đất nói trên với diện tích " }),
              new TextRun({ text: data.transferArea || ".........." }),
              new TextRun({ text: " m² trong đó đất ở: " }),
              new TextRun({ text: data.transferResidentialArea || ".........." }),
              new TextRun({ text: " m², đất trồng cây lâu năm " }),
              new TextRun({ text: data.transferAgriculturalArea || ".........." }),
              new TextRun({ text: " m²" }),
            ],
            spacing: { before: 200, after: 200 },
          }),
          ...(data.notes ? data.notes.split('\n').map((line, index) => 
            new Paragraph({
              children: [
                ...(index === 0 ? [new TextRun({ text: "Ghi chú: ", bold: true, italics: true })] : []),
                new TextRun({ text: line, italics: true }),
              ],
              spacing: index === data.notes!.split('\n').length - 1 ? { after: 200 } : {},
            })
          ) : [
            new Paragraph({
              children: [
                new TextRun({ text: "Ghi chú: ", bold: true, italics: true }),
                new TextRun({ text: "Thửa đất có 401,0 m² nằm trong chỉ giới QHGT", italics: true }),
              ],
              spacing: { after: 200 },
            })
          ]),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thông tin tài sản: Có nhà ở", bold: true }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "3. Kết quả thẩm định:", bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Về thành phần hồ sơ: ", bold: true, italics: true }),
              new TextRun({ text: "Đầy đủ theo bộ thủ tục hành chính của UBND tỉnh." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Về hình thức chuyển quyền: ", bold: true, italics: true }),
              new TextRun({ text: `${data.transferType === 'chuyen-nhuong' ? 'Chuyển nhượng' : data.transferType === 'tang-cho' ? 'Tặng cho' : 'Chuyển quyền'} QSD đất` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Về diện tích thửa đất chuyển quyền: ", bold: true, italics: true }),
              new TextRun({ text: data.areaChangeNotes || "Giảm 21,6 m² so với GCN đã được cấp có nguyên nhân do chủ sử dụng đất hiến đất mở rộng đường giao thông theo bản vẽ tách thửa đất được Chi nhánh Văn phòng Đăng ký đất đai huyện Kỳ Anh xác nhận ngày 22/12/2025; chỉ giới QHGT có thay đổi theo Quyết định số 1387/QĐ-UBND ngày 18/6/2025 của UBND huyện Kỳ Anh." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Về tính pháp lý, điều kiện thực hiện chuyển quyền: ", bold: true, italics: true }),
            ],
          }),
          new Paragraph({ text: "+ Thửa đất đã được UBND huyện Kỳ Anh cấp giấy chứng nhận quyền sử dụng đất;", indent: { left: 720 } }),
          new Paragraph({ text: "+ Về tình trạng tranh chấp: Đến thời điểm hiện tại, Chi nhánh Văn phòng đăng ký đất đai huyện Kỳ Anh chưa nhận được Đơn, văn bản nào phản ánh tình trạng tranh chấp liên quan đến thửa đất;", indent: { left: 720 } }),
          new Paragraph({ text: "+ Quyền sử dụng đất không bị kê biên để thi hành án;", indent: { left: 720 } }),
          new Paragraph({ text: "+ Đang trong thời hạn sử dụng đất.", indent: { left: 720 } }),
          new Paragraph({ text: "+ Đủ điều kiện tách thửa theo quy định tại Điều 12, Điều 13 Quyết định số 26/2024/QĐ-UBND ban hành một số nội dung Luật Đất đai và các nghị định hướng dẫn thi hành Luật Đất đai thuộc thẩm quyền của UBND tỉnh thực hiện trên địa bàn tỉnh Hà Tĩnh ngày 18/10/2024 của UBND tỉnh Hà Tĩnh và không nằm trong kế hoạch sử dụng đất của huyện.", indent: { left: 720 } }),
          new Paragraph({ text: "+ Quyền sử dụng đất không bị kê biên, áp dụng biện pháp khác để bảo đảm thi hành án theo quy định của pháp luật thi hành án dân sự;", indent: { left: 720 } }),
          new Paragraph({ text: "+ Quyền sử dụng đất không bị áp dụng biện pháp khẩn cấp tạm thời theo quy định của pháp luật", indent: { left: 720 } }),
          new Paragraph({ text: "+ Thửa đất không không thuộc khu vực phải thu hồi đất theo kế hoạch sử dụng đất hàng năm của UBND huyện;", indent: { left: 720 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Về thực hiện nghĩa vụ tài chính: ", bold: true, italics: true }),
              new TextRun({ text: "Người sử dụng đất đã thực hiện đầy đủ nghĩa vụ tài chính theo thông báo của cơ quan thuế (có chứng từ kèm theo)." }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "4. Kiến nghị:", bold: true }),
            ],
          }),
          new Paragraph({
            text: "Hồ sơ đủ điều kiện chuyển quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất theo Điều 45 Luật Đất đai năm 2024 và các quy định khác của pháp luật. Kính đề nghị Văn phòng đăng ký đất đai tỉnh Hà Tĩnh thẩm tra hồ sơ, trình ký cấp Giấy chứng nhận QSD đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất theo các nội dung sau:",
            indent: { firstLine: 720 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Cấp giấy chứng nhận QSD đất cho ông " }),
              new TextRun({ text: data.buyerName || "........................................", bold: true }),
              new TextRun({ text: " và bà ", }),
              new TextRun({ text: "........................................", bold: true }),
              new TextRun({ text: " như sau:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thửa đất số: " }),
              new TextRun({ text: data.newParcelNumber1 || ".........." }),
              new TextRun({ text: "; tờ bản đồ số: " }),
              new TextRun({ text: data.newMapSheetNumber1 || ".........." }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Địa chỉ thửa đất: " }),
              new TextRun({ text: data.newLandAddress1 || "................................................................................" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Diện tích thửa đất: " }),
              new TextRun({ text: data.transferArea || ".........." }),
              new TextRun({ text: " m². Trong đó:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất ở tại: " }),
              new TextRun({ text: data.transferResidentialArea || ".........." }),
              new TextRun({ text: " m²;" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất trồng cây lâu năm: " }),
              new TextRun({ text: data.transferAgriculturalArea || ".........." }),
              new TextRun({ text: " m²" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Hình thức sử dụng: " }),
              new TextRun({ text: data.newUsageForm1 || "Chung" }),
              new TextRun({ text: "." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thời hạn sử dụng đất: + Đất ở: " }),
              new TextRun({ text: data.newResidentialDuration1 || "Lâu dài" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "                                        + Đất trồng cây lâu năm: " }),
              new TextRun({ text: data.newAgriculturalDuration1 || "........................" }),
              new TextRun({ text: "." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Nguồn gốc sử dụng:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất ở " }),
              new TextRun({ text: data.transferResidentialArea || ".........." }),
              new TextRun({ text: " m²: " }),
              new TextRun({ text: data.newResidentialOrigin1 || "................................................................................" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất trồng cây lâu năm " }),
              new TextRun({ text: data.transferAgriculturalArea || ".........." }),
              new TextRun({ text: " m²: " }),
              new TextRun({ text: data.newAgriculturalOrigin1 || "................................................................................" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Ghi chú: ", bold: true, italics: true }),
              new TextRun({ text: "Số thửa, số tờ bản đồ đang sử dụng theo bản đồ địa chính thị trấn Kỳ Đồng trước khi sắp xếp", italics: true }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Cấp giấy chứng nhận QSD đất cho ông " }),
              new TextRun({ text: data.sellerName || "........................................", bold: true }),
              new TextRun({ text: " và bà ", }),
              new TextRun({ text: "........................................", bold: true }),
              new TextRun({ text: " như sau:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thửa đất số: " }),
              new TextRun({ text: data.newParcelNumber2 || ".........." }),
              new TextRun({ text: "; tờ bản đồ số: " }),
              new TextRun({ text: data.newMapSheetNumber2 || ".........." }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Địa chỉ thửa đất: " }),
              new TextRun({ text: data.newLandAddress2 || "................................................................................" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Diện tích thửa đất: " }),
              new TextRun({ text: data.remainingArea || ".........." }),
              new TextRun({ text: " m². Trong đó:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất ở tại: " }),
              new TextRun({ text: data.remainingResidentialArea || ".........." }),
              new TextRun({ text: " m²;" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất trồng cây lâu năm: " }),
              new TextRun({ text: data.remainingAgriculturalArea || ".........." }),
              new TextRun({ text: " m²" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Hình thức sử dụng: " }),
              new TextRun({ text: data.newUsageForm2 || "Chung" }),
              new TextRun({ text: "." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Thời hạn sử dụng đất: + Đất ở: " }),
              new TextRun({ text: data.newResidentialDuration2 || "Lâu dài" }),
              new TextRun({ text: ";" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "                                        + Đất trồng cây lâu năm: " }),
              new TextRun({ text: data.newAgriculturalDuration2 || "........................" }),
              new TextRun({ text: "." }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Nguồn gốc sử dụng:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất ở " }),
              new TextRun({ text: data.remainingResidentialArea || ".........." }),
              new TextRun({ text: " m²: " }),
              new TextRun({ text: data.newResidentialOrigin2 || "................................................................................" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "+ Đất trồng cây lâu năm " }),
              new TextRun({ text: data.remainingAgriculturalArea || ".........." }),
              new TextRun({ text: " m²: " }),
              new TextRun({ text: data.newAgriculturalOrigin2 || "................................................................................" }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Ghi chú: ", bold: true, italics: true }),
              new TextRun({ text: "Số thửa, số tờ bản đồ đang sử dụng theo bản đồ địa chính thị trấn Kỳ Đồng trước khi sắp xếp", italics: true }),
            ],
            spacing: { after: 400 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Cán bộ thẩm định hồ sơ", bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1000 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Nguyễn Thanh Hà", bold: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "PHỤ TRÁCH CHI NHÁNH", bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1000 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Trần Xuân Huy", bold: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "KẾT QUẢ THẨM TRA CỦA PHÒNG ĐĂNG KÝ VÀ CẤP GCN", bold: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 },
          }),
          new Paragraph({ text: "- Về hồ sơ: ................................................................................................................." }),
          new Paragraph({ text: "- Về tính pháp lý:........................................................................................................." }),
          new Paragraph({ text: "- Về tình hình thực hiện nghĩa vụ tài chính:................................................................" }),
          new Paragraph({ text: "- Đề xuất, kiến nghị....................................................................................................." }),
          new Paragraph({ text: "....................................................................................................................................", spacing: { after: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: `Hà Tĩnh, ${data.processingDate || "ngày      tháng     năm 2026"}`, italics: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Người thẩm tra", bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1000 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "", bold: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: `Hà Tĩnh, ${data.processingDate || "ngày      tháng     năm 2026"}`, italics: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Người phụ trách", bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1000 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Hoàng Thị Lệ Trinh", bold: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
  const name = data.sellerName || data.buyerName || 'Ho_So';
  const safeName = name.replace(/[\\/:*?"<>|]/g, '');
  saveAs(blob, `${safeName} - Tach Thua - ${dateStr}.docx`);
}
