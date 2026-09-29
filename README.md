# 《王國之心：純白編年史》(Kingdom Hearts: Pure White Chronicles)

以白雪公主童話林地與純潔之心為主題的王國之心動作 RPG 網頁遊戲。揮舞鑰刃驅散黑魔法與魔鏡幻影！

## 🌟 遊戲特點
- **純原生 Web Audio API**：金屬碰撞打擊、治癒、冰封、神聖之光皆以演算法即時合成，零外部音訊依賴。
- **純潔之光與七公主機制**：戰鬥蓄積「純潔之光」，滿 100% 可發動全螢幕必殺技【純白神聖之光】。
- **小矮人戰術勳章**：萬事通暈眩衝擊、生氣鬼破甲砸擊、白雪公主祈願治癒、暴風雪魔法控場、糊塗蛋淘金奇蹟。
- **雙模式提供**：包含 Vite + React 完整版與單一 HTML5 離線遊玩版（`public/kh_game.html`）。

## 🚀 部署至 GitHub Pages
本專案已配置完整的 GitHub Actions Workflow（`.github/workflows/deploy.yml`）：
1. 推送（Push）至 `main` 或 `master` 分支。
2. 前往 GitHub 倉庫的 **Settings** -> **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 選擇 **GitHub Actions**。
4. 每次 push 代碼即可自動觸發 Node 22 與 Vite 建置並自動發布到 GitHub Pages！
