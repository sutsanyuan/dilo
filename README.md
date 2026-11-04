# 西文學習 App（暫名）

每天丟進一句生活裡的話，AI 幫你轉成西班牙西文，練到能在視訊時說出口。

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
- 格式：`src/lib/ai/types.ts`
- 下一步：新增 `src/app/api/convert/route.ts`，把指令接上 Claude API。
