
import { GoogleGenAI } from "@google/genai";
import { ActionLogEntry } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateActionSummary = async (companyName: string, actionLog: ActionLogEntry[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "ميزة الذكاء الاصطناعي غير مفعلة. يرجى إعداد مفتاح API.";
  }

  const logText = actionLog
    .map(log => `بتاريخ ${new Date(log.timestamp).toLocaleString('ar-SA')}: ${log.type} - ${log.details}`)
    .join('\n');

  const prompt = `
    أنت سكرتير ذكي ومساعد خبير في المحاسبة والزكاة. مهمتك هي تحليل سجل الإجراءات التالي لشركة معينة وتقديم ملخص احترافي وموجز.
    
    اسم الشركة: ${companyName}
    
    سجل الإجراءات:
    ${logText}
    
    بناءً على السجل أعلاه، قم بإنشاء ملخص من فقرتين:
    1.  الفقرة الأولى: لخص الوضع الحالي للشركة وآخر إجراء مهم تم اتخاذه.
    2.  الفقرة الثانية: اقترح الخطوة التالية الأكثر منطقية التي يجب على المراجع اتخاذها.
    
    يجب أن يكون الرد باللغة العربية.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini API:", error);
    return "عفواً، حدث خطأ أثناء إنشاء الملخص. يرجى المحاولة مرة أخرى.";
  }
};
