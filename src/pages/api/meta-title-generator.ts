import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';

// เรียกใช้ API Key จาก Environment Variable
const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY });

export const POST: APIRoute = async ({ request }) => {
  try {
    const { content } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "No content provided" }), { status: 400 });
    }

    // Prompt ออกแบบให้จับใจความและเรียบเรียงใหม่โดยเฉพาะ
    const prompt = `
คุณคือผู้เชี่ยวชาญด้าน SEO และ Copywriting
จงอ่านบทความด้านล่างแล้ววิเคราะห์จับใจความสำคัญ จากนั้นเขียน Meta Title ภาษาไทยใหม่ตามเงื่อนไขต่อไปนี้:
1. ความยาวอยู่ระหว่าง 40 - 60 ตัวอักษร
2. ต้องจับใจความหลักแล้ว "เรียบเรียงใหม่" ให้ดึงดูด น่าคลิก ไม่ใช่แค่ตัดแปะประโยคเดิม
3. มี Keyword หลักที่ตรงกับเนื้อหา
4. ตอบกลับเฉพาะ JSON Format เท่านั้น ตัวอย่าง: {"title": "...", "summary": "..."}

บทความ:
${content}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    const jsonResult = JSON.parse(resultText);

    return new Response(JSON.stringify(jsonResult), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};