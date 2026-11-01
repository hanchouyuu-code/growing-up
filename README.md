# Growing up · Unit 1 在线英语课

MLT908 / EDTM902 期末项目（个人部分）的互动学习网站。
教材：外语教学与研究出版社 普通高中教科书 英语 选择性必修 第二册，Unit 1 Growing up。

线上地址：https://growing-up-five.vercel.app

## 课程结构（共 90 分钟）

| 部分 | 内容 | 时长 | 状态 |
|---|---|---|---|
| Course Overview | 教材名称（中英）、Unit Overview、Introduction Video、Learning Objectives、课程结构、奖章 | — | 已完成（视频待上传） |
| Lesson 1 | Vocabulary：30 个单词（minimum 之前），3 组，每组含 Set Read-Along | 20 分钟 | 已完成 |
| Learning Community | Word Battle 排行榜 + AI Tutor | — | 已完成（需在 Vercel 连接两项服务） |
| Lesson 2 | Starting Out | 20 分钟 | 待制作 |
| Lesson 3 | Reading: The Age of Majority | 30 分钟 | 待制作 |
| Lesson 4 | Writing | 20 分钟 | 待制作 |
| Teacher’s Corner | 教师资源 | — | 部分完成 |

## 需要你在 Vercel 上做的两步设置

不做这两步网站也能正常使用：排行榜会显示“本设备记录”，AI Tutor 会用教师预设提示回答。

### 1. 班级排行榜（Upstash Redis，免费）

1. 打开 Vercel 项目 → **Storage** → **Create Database** → 选 **Upstash for Redis**（免费档即可）。
2. 创建后点 **Connect Project**，选择 growing-up 项目。Vercel 会自动加上 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 两个环境变量。
3. 到 **Deployments**，对最新一次部署点 **Redeploy**。

### 2. AI Tutor（需要一个 AI 接口密钥）

在 Vercel 项目 → **Settings** → **Environment Variables** 添加其中一组，然后 Redeploy：

- Claude：`ANTHROPIC_API_KEY` =（你的密钥）。可选 `ANTHROPIC_MODEL`，默认 `claude-haiku-5-5`。
- 或任何 OpenAI 兼容接口（如 DeepSeek、通义千问）：`OPENAI_API_KEY`、`OPENAI_MODEL`，以及 `OPENAI_BASE_URL`（例如 `https://api.deepseek.com/v1`）。

接上 Upstash 后，AI Tutor 会自动限流：每个网络连接每小时最多 30 个问题，防止费用失控。

## 介绍视频

录好视频后，二选一：

- 把文件放到 `assets/video/intro.mp4`，在 `js/data.js` 的 `GU.INTRO_VIDEO` 里设 `src: "assets/video/intro.mp4"`；
- 或上传到 B 站 / YouTube，把嵌入链接填进 `embed`。

讲稿已经写在 `GU.INTRO_VIDEO.transcript` 里，页面上会作为 Transcript 显示。

## 文件结构

```
index.html                 网页骨架
css/styles.css             样式（手机、平板、电脑适配）
js/data.js                 课程内容：单词、例句、词典例句、图片、目标、奖章（改内容只改这里）
js/tutor-data.js           AI Tutor 的教师预设提示：词形变化、搭配、词组、用法
js/store.js                学习进度（保存在浏览器）
js/audio.js                发音、跟读录音
js/ui.js                   图标、奖章、弹窗、图片
js/shell.js                左侧导航、右上角奖章进度条、页面切换、AI Tutor 按钮
js/view-*.js               各个页面
api/leaderboard.js         排行榜服务（Vercel 函数）
api/tutor.js               AI Tutor 服务（Vercel 函数）
assets/img/                首页小树苗（取自课本 Starting Out 页）
assets/emoji/              Twemoji 图片（CC BY 4.0）
assets/fonts/              字体（本地托管）
downloads/                 单词表 PDF
tools/make-wordlist-pdf.js 修改单词后重新生成 PDF：node tools/make-wordlist-pdf.js
```

## 单词发音

优先顺序：本地录音（在 `js/data.js` 某个单词里加 `audio: "audio/words/xxx.mp3"`）→ 有道词典英式发音 → 浏览器自带语音。每次播放单独判断，不会因为一次加载慢就整站切换成机器音。

## 本地预览

在项目文件夹运行 `python3 -m http.server 8000`，打开 http://localhost:8000 。本地没有 /api 服务，排行榜和 AI Tutor 会自动用备用模式。

## 已知限制

- 学习进度保存在学生自己的浏览器里，换设备会从头开始。
- vercel.app 域名在中国大陆可能无法访问；如需给大陆学生使用，可绑定自定义域名。
