import { ConvertError, convertSentence } from "@/lib/ai/convert";
import { getAiMode } from "@/lib/ai/mode";
import type { ConvertInput, Person, Session } from "@/lib/ai/types";

/**
 * POST /api/convert
 * 前端送來使用者的一段話，回傳 AI 轉換結果（ConvertResponse）。
 *
 * 沒有 ANTHROPIC_API_KEY 時自動進入模擬模式，回傳範例資料（見 src/lib/ai/mode.ts）。
 * 回應的 x-dilo-ai-mode 標頭會告訴前端現在是 live 還是 mock。
 *
 * 注意：目前沒有登入機制，任何人知道網址都能呼叫並花到你的 API 額度。
 * 部署到公開網址之前，要先加上保護（例如登入或密碼）。
 */

const SESSIONS: Session[] = ["morning", "evening", "post_call"];

export async function POST(request: Request) {
  const headers = { "x-dilo-ai-mode": getAiMode() };

  let body: Partial<ConvertInput>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "資料格式不正確" }, { status: 400 });
  }

  const userText = typeof body.user_text === "string" ? body.user_text.trim() : "";
  if (!userText) {
    return Response.json({ error: "請先寫下想說的話" }, { status: 400 });
  }
  if (userText.length > 1000) {
    return Response.json({ error: "內容太長了，請控制在 1000 字以內" }, { status: 400 });
  }

  const input: ConvertInput = {
    target_language: "es-ES",
    mode: "breakthrough",
    session: SESSIONS.includes(body.session as Session) ? (body.session as Session) : "morning",
    written_at: typeof body.written_at === "string" ? body.written_at : new Date().toISOString(),
    user_text: userText,
    morning_plan: body.morning_plan,
    people: Array.isArray(body.people) ? (body.people as Person[]) : [],
  };

  try {
    const result = await convertSentence(input);
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof ConvertError) {
      return Response.json({ error: error.message }, { status: error.status, headers });
    }
    console.error("[api/convert]", error);
    return Response.json({ error: "轉換時發生錯誤，請稍後再試。" }, { status: 502, headers });
  }
}
