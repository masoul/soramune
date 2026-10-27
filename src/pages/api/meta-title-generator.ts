
import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = import.meta.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const { content } = await request.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

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

    if (!resultText) {
      throw new Error("Gemini returned an empty response");
    }

    const jsonResult = JSON.parse(resultText);

    return new Response(JSON.stringify(jsonResult), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
