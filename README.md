# Dilo

*¡Dilo!*（說出來！）每天丟進一句生活裡的話，AI 幫你轉成西班牙西文，練到能在視訊時說出口。

- 專案規劃文件：Claude Docs「語言學習 App：專案規劃（MVP：西班牙文）」
- 設計稿：Figma「西文學習 App – Wireframes v1」（Wireframes、Type Specimen、Color & Shape 三頁）

## 開始開發

需要 Node.js 20 以上。

```bash
npm install
cp .env.example .env.local   # 再填入 ANTHROPIC_API_KEY
npm run dev
```

打開 http://localhost:3000 。

## 專案結構

```
src/
├─ app/
│  ├─ layout.tsx         根版面：載入字體、設定語言
│  ├─ globals.css        全站基礎樣式
│  ├─ page.tsx           首頁（目前是靜態骨架）
│  └─ page.module.css
├─ styles/
│  └─ tokens.css         設計變數：顏色、間距、圓角、字體（對應 Figma 的 Tokens）
└─ lib/
   └─ ai/
      ├─ convert-prompt.ts  AI 句子轉換指令（system prompt）
      ├─ types.ts           輸入與回傳的 TypeScript 型別
      ├─ schemas/           同樣的格式，JSON Schema 版本
      └─ examples/          兩組範例：早上計畫、晚上回顧
```

## 設計變數

`src/styles/tokens.css` 的命名和 Figma 變數一致，Figma 的 `color/accent-strong` 對應 CSS 的 `--color-accent-strong`。在 CSS 裡這樣用：

```css
.button {
  background: var(--color-accent-strong);
  border-radius: var(--radius-pill);
  padding: var(--space-12) var(--space-20);
}
```

## 字體

| 角色 | 字體 | 載入方式 |
| --- | --- | --- |
| 介面、英數 | Plus Jakarta Sans | `next/font/google`（已設定） |
| 西文主角 | Newsreader | `next/font/google`（已設定），加上 `className="spanish"` 使用 |
| 中文 | LINE Seed TW | **待加入** |

LINE Seed TW 加入步驟：

1. 到 [LINE Seed 官網](https://seed.line.me/index_tw.html) 確認網頁嵌入的授權條款。
2. 中文字體檔很大，先做子集化（只保留常用字），轉成 `.woff2`。
3. 放進 `src/fonts/`，在 `layout.tsx` 用 `next/font/local` 載入，變數名稱設為 `--font-line-seed`。
4. 把 `tokens.css` 裡 `--font-ui` 的 `"LINE Seed TW"` 換成 `var(--font-line-seed)`。

在那之前，中文會使用 iPhone 的蘋方或 Noto Sans TC。

## AI 句子轉換

- 指令：`src/lib/ai/convert-prompt.ts`
- 格式：`src/lib/ai/types.ts`（TypeScript）、`src/lib/ai/schemas/response.schema.json`（送給 API 強制回傳格式）
- 呼叫 Claude：`src/lib/ai/convert.ts`，預設模型 `claude-sonnet-5-5`，可用環境變數 `CLAUDE_MODEL` 更換
- API：`POST /api/convert`（`src/app/api/convert/route.ts`）
- 測試頁：http://localhost:3000/try ，輸入句子看 AI 的轉換結果；遇到新人物會詢問性別，答案存在瀏覽器裡

### 模擬模式（還沒儲值也能開發）

沒有設定 `ANTHROPIC_API_KEY` 時，`/api/convert` 會自動進入**模擬模式**：不呼叫 Claude，改回傳 `src/lib/ai/examples/` 的範例資料（早上一組、晚上一組），並延遲約一秒模擬思考。人物問答也會模擬：回答過的人不會再被問。

- 判斷邏輯：`src/lib/ai/mode.ts`；範例回傳：`src/lib/ai/mock.ts`
- 想在有金鑰時也用模擬模式（例如作品集的展示模式），在 `.env.local` 設 `AI_MODE=mock`
- API 回應的 `x-dilo-ai-mode` 標頭會是 `live` 或 `mock`

額度用完、超過花費上限、金鑰錯誤時，API 會回傳清楚的中文訊息（見 `convert.ts` 的 `toConvertError`）。

> 目前 `/api/convert` 沒有登入保護，部署到公開網址前要先加上，否則任何人都能用掉你的 API 額度。
