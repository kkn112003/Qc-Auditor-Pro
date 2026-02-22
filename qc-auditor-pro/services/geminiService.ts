import { GoogleGenAI } from "@google/genai";
import { ProcessedDevice } from "../types";

const apiKey = process.env.API_KEY || "";

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const analyzeDeviceCondition = async (device: ProcessedDevice): Promise<string> => {
  // Simulate AI Analysis if API Key is not present or API call fails
  const mockAnalysis = async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const isPass = device.status === 'PASS';
    const failureCount = device.failureReasons.length;
    const brand = device.identity.brand || "Laptop";
    const model = device.identity.model || "Unit";

    if (isPass) {
      return `[AI ANALYSIS] SANGAT BAIK\n\nUnit ${brand} ${model} ini dalam kondisi prima. Semua komponen hardware berfungsi optimal:\n• CPU: ${device.specs.cpu?.name}\n• RAM: ${device.specs.ram?.total_gb}GB\n\nKesehatan baterai mencapai ${100 - device.battery.wear_level_percent}% (excellent), menjamin daya tahan lama. Tidak ada kerusakan fisik pada body atau layar. Unit ini sangat layak jual dengan grade A+.\n\nRekomendasi: Siap pajang di etalase premium.`;
    } else {
      return `[AI ANALYSIS] PERLU PERBAIKAN\n\nUnit ${brand} ${model} ini memerlukan perhatian khusus. Ditemukan ${failureCount} kendala kritis:\n${device.failureReasons.map(r => `• ${r}`).join("\n")}\n\nCatatan Tambahan:\n${device.battery.wear_level_percent > 40 ? "• Baterai sudah drop secara signifikan.\n" : ""}${device.manual_inspection.phys_lcd_ok === false ? "• Layar LCD bermasalah (cek fleksibel/panel).\n" : ""}${device.manual_inspection.phys_cover_screws_ok === false ? "• Baut cover tidak lengkap.\n" : ""}Disarankan untuk melakukan servis menyeluruh sebelum unit ini masuk stok penjualan.`;
    }
  };

  if (!ai) {
    return await mockAnalysis();
  }

  try {
    // AI Model Preparation

    const driverIssues = device.system_check?.driver_issues || [];
    const storageInfo = device.specs.storage && device.specs.storage[0]
      ? `${device.specs.storage[0].health_percent}% Health (${device.specs.storage[0].type})`
      : "Storage Info Unavailable";

    const prompt = `
          You are a Senior QC Technician for Refurbished Laptops.
          Analyze this laptop's condition and provide a summary (Bahasa Indonesia).
          
          UNIT: ${device.identity.brand} ${device.identity.model} (SN: ${device.identity.serial_number})
          
          HARDWARE HEALTH:
          - CPU: ${device.specs.cpu.name}
          - RAM: ${device.specs.ram.total_gb}GB
          - Storage: ${storageInfo}
          - Battery Wear: ${device.battery.wear_level_percent}% (Design: ${device.battery.design_capacity_mwh}mWh, Full: ${device.battery.full_charge_capacity_mwh}mWh)
          - Driver Issues: ${driverIssues.length > 0 ? driverIssues.join(", ") : "None"}
          
          PHYSICAL INSPECTION (True=OK, False=Bad):
          - Body: ${device.manual_inspection.phys_body_ok}
          - Screen: ${device.manual_inspection.phys_lcd_ok}
          - Hinge: ${device.manual_inspection.phys_engsel_ok}
          - Keyboard: ${device.manual_inspection.phys_keyboard_ok}
          - Cover Screws: ${device.manual_inspection.phys_cover_screws_ok}
          
          CURRENT STATUS: ${device.status}
          FAIL REASONS: ${device.failureReasons.join(", ") || "None"}

          Task:
          1. Summarize the condition in 1 paragraph (max 50 words).
          2. If FAILED, explain why and recommend specific repairs.
          3. If PASSED, highlight its selling point.
          Keep tone professional.
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis complete.";
  } catch (error) {
    console.error("Gemini analysis failed, falling back to mock:", error);
    return await mockAnalysis();
  }
};