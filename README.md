# Growing up · Unit 1 在线英语课

MLT908 / EDTM902 期末项目（个人部分）的互动学习网站。
教材：外语教学与研究出版社 普通高中教科书 英语 选择性必修 第二册，Unit 1 Growing up。

线上地址：https://growing-up-five.vercel.app

## 课程结构（共 90 分钟）

| 部分 | 内容 | 时长 | 状态 |
|---|---|---|---|
| Course overview | 单元概述、学习目标、课程路线、奖章 | — | 已完成 |
| Lesson 1 | Vocabulary：30 个单词（minimum 之前） | 20 分钟 | 已完成 |
| Lesson 2 | Starting out | 20 分钟 | 待制作 |
| Lesson 3 | Reading: The Age of Majority | 30 分钟 | 待制作 |
| Lesson 4 | Writing | 20 分钟 | 待制作 |
| Teacher's corner | 教师资源 | — | 部分完成 |

Lesson 1 包含：3 组单词（每组 10 个：发音、词形、词性、课文原句、例句、图片或词缀记忆、跟读录音、遮词拼写）、中英连线测验、听音拼写挑战（bonus 奖章）。

## 文件结构

```
index.html               网页骨架
css/styles.css           样式（颜色、字体、布局、手机适配）
js/data.js               课程内容：单词、例句、目标、奖章（改内容只改这里）
js/store.js              学习进度（保存在浏览器 localStorage）
js/audio.js              发音与录音
js/ui.js                 图标、奖章、弹窗等小组件
js/shell.js              左侧导航、右上角奖章进度条、页面路由
js/view-*.js             各个页面
assets/fonts/            字体文件（本地托管，国内也能加载）
downloads/               可下载的单词表 PDF
tools/make-wordlist-pdf.js  修改单词后重新生成 PDF：node tools/make-wordlist-pdf.js
```

## 单词发音

优先顺序：
1. 本地录音：在 `js/data.js` 某个单词里加 `audio: "audio/words/integrity.mp3"`，就会用这个文件。
2. 有道词典英式发音（国内可访问）。
3. 浏览器自带语音（以上都不可用时）。

## 本地预览

在项目文件夹里运行 `python3 -m http.server 8000`，然后打开 http://localhost:8000

## 上线

仓库已连接 Vercel：推送到 `main` 分支后会自动重新部署，网址不变。

## 已知限制

- 学习进度保存在学生自己的浏览器里，换设备会从头开始。
- vercel.app 域名在中国大陆可能无法访问；如需给大陆学生使用，可另外开启 GitHub Pages 或绑定自定义域名。
- 讨论区、AI 导学需要后端，将在后续课程中加入。
