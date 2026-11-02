# Growing up · Unit 1 在线英语课

MLT908 / EDTM902 期末项目（个人部分）的互动学习网站。
教材：外语教学与研究出版社 普通高中教科书 英语 选择性必修 第二册，Unit 1 Growing up。

线上地址：https://growing-up-five.vercel.app

## 课程结构（共 90 分钟）

| 部分 | 内容 | 时长 | 状态 |
|---|---|---|---|
| Course Overview | 教材名称（中英）、Unit Overview、Introduction Video、课程结构、奖章 | — | 已完成 |
| Lesson 1 | Vocabulary：30 个单词（minimum 之前），3 组，每组含 Set Read-Along | 20 分钟 | 已完成 |
| Learning Community | Word Battle 排行榜 + AI Tutor | — | 已完成（需在 Vercel 连接两项服务） |
| Lesson 2 | Starting Out：三种学习路径（只做 Activity 1 / 只做 Activity 2 / 两个都做）。Activity 1 Video Time（图片 + 班级讨论、B 站视频、理解题、个人观点投票讨论）；Activity 2 Poetry Reading（诗歌逐行朗读 + 中英对照 + 笔记栏、主旨题、勾选题、个人观点讨论） | 20 分钟 | 已完成（班级讨论需连接 Upstash） |
| Lesson 3 | Reading: The Age of Majority | 30 分钟 | 待制作 |
| Lesson 4 | Writing | 20 分钟 | 待制作 |
| Teacher’s Corner | 课程安排、单词表 PDF、Lesson 2 参考答案、讨论区管理 | — | 部分完成 |

## 需要你在 Vercel 上做的设置

不做这些设置网站也能正常使用：排行榜和 Lesson 2 班级讨论会显示“本设备记录”（只看到自己的回答），AI Tutor 会用教师预设提示回答。

### 1. 班级排行榜和 Lesson 2 班级讨论（Upstash Redis，免费）

1. 打开 Vercel 项目 → **Storage** → **Create Database** → 选 **Upstash for Redis**（免费档即可）。
2. 创建后点 **Connect Project**，选择 growing-up 项目。Vercel 会自动加上 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 两个环境变量。
3. 到 **Deployments**，对最新一次部署点 **Redeploy**。

同一个数据库同时用于 Word Battle 排行榜和 Lesson 2 的三个讨论区（Warm-Up、Personal Response ×2）。

### 2. AI Tutor（需要一个 AI 接口密钥）

在 Vercel 项目 → **Settings** → **Environment Variables** 添加其中一组，然后 Redeploy：

- Claude：`ANTHROPIC_API_KEY` =（你的密钥）。可选 `ANTHROPIC_MODEL`，默认 `claude-haiku-5-5`。
- 或任何 OpenAI 兼容接口（如 DeepSeek、通义千问）：`OPENAI_API_KEY`、`OPENAI_MODEL`，以及 `OPENAI_BASE_URL`（例如 `https://api.deepseek.com/v1`）。

接上 Upstash 后，AI Tutor 会自动限流：每个网络连接每小时最多 30 个问题，防止费用失控。

### 3. 讨论区管理密钥（可选）

在 **Environment Variables** 添加 `TEACHER_KEY` =（自己设定的一串密码），Redeploy。之后在网站 Teacher’s Corner → Discussion Moderation 输入这串密码，本设备上的讨论区会出现 **Remove** 按钮，可以删除不当的帖子或回复。

## 介绍视频

老师录制的介绍视频在 `assets/video/intro.mp4`（已裁掉录屏边缘、统一音量、压缩为网页格式）。页面上可以调节播放速度（0.75×–1.5×）。
要替换视频：把新文件放进 `assets/video/`，再修改 `js/data.js` 里 `GU.INTRO_VIDEO` 的 `src` 和 `poster`。

## Lesson 2 说明

- **学习路径**：学生在 Lesson 2 首页选择路径，可随时更改；进度和奖章（Branching Out）按所选路径计算。路径以外的活动在左侧导航标注 Optional，仍可完成。
- **先发后看**：三个讨论区都要求学生先发表自己的回答，才能看到同学的回答、点赞和回复；发帖后会出现 Teacher’s Example。讨论区沿用 Learning Community 的深色配色，便于识别。
- **视频**：嵌入 B 站 BV1zL7a6PEhg（外研社 Starting out 视频），旁边有“Open the Video on Bilibili”链接备用。
- **诗歌朗读**：目前为逐行英式朗读（有道），可调速、高亮当前行、点任意行重听。LibriVox 有公版完整朗诵，但服务器无法下载，所以没有做逐行同步。若要换成课本录音：把音频放进 `assets/audio/`，在 `js/data.js` 的 `GU.L2.poem` 里填 `audio`（文件路径）和 `cues`（每行开始的秒数，共 17 个，省略号那行也要填），页面会自动改用录音并同步高亮。
- **图片**：三张成人礼照片引用自 Wikimedia Commons（CC BY 2.0，署名在图片下方）。若无法加载（如中国大陆网络），会自动显示对应的 emoji 图。
- **答案反馈**：开放题按要点检查（`points` 里的关键词），并给出课本参考答案；勾选题逐项给出诗句证据，点击 Line N 可跳到并朗读该行。

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
js/discuss.js              班级讨论区（先发后看、点赞、回复、投票统计）
js/view-*.js               各个页面（view-lesson2.js 为 Starting Out）
api/leaderboard.js         排行榜服务（Vercel 函数）
api/tutor.js               AI Tutor 服务（Vercel 函数）
api/discuss.js             班级讨论服务（Vercel 函数）
assets/img/                首页小树苗（取自课本 Starting Out 页）
assets/emoji/              Twemoji 图片（CC BY 4.0）
assets/video/              介绍视频
assets/fonts/              字体（本地托管）
downloads/                 单词表 PDF
tools/make-wordlist-pdf.js 修改单词后重新生成 PDF：node tools/make-wordlist-pdf.js
```

## 单词发音

优先顺序：本地录音（在 `js/data.js` 某个单词里加 `audio: "audio/words/xxx.mp3"`）→ 有道词典英式发音 → 浏览器自带语音。每次播放单独判断，不会因为一次加载慢就整站切换成机器音。

## 本地预览

在项目文件夹运行 `python3 -m http.server 8000`，打开 http://localhost:8000 。本地没有 /api 服务，排行榜、讨论区和 AI Tutor 会自动用备用模式。

## 已知限制

- 学习进度保存在学生自己的浏览器里，换设备会从头开始。
- vercel.app 域名在中国大陆可能无法访问；如需给大陆学生使用，可绑定自定义域名。
- Wikimedia 图片和 LibriVox 在中国大陆可能无法加载；B 站视频不受影响。
