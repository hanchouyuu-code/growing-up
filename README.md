# Growing up · Unit 1 在线英语课

配色：米白/燕麦色背景、深墨绿主色、琥珀色点缀（变量在 `css/styles.css` 顶部 `:root`）。

MLT908 / EDTM902 期末项目（个人部分）的互动学习网站。
教材：外语教学与研究出版社 普通高中教科书 英语 选择性必修 第二册，Unit 1 Growing up。

线上地址：https://growing-up-five.vercel.app

## 课程结构（共 95 分钟）

| 部分 | 内容 | 时长 | 状态 |
|---|---|---|---|
| Course Overview | 教材名称（中英）、Unit Overview、Introduction Video、课程结构、奖章 | — | 已完成 |
| Lesson 1 | Vocabulary：30 个单词（minimum 之前），3 组，每组含 Set Read-Along | 20 分钟 | 已完成 |
| Word Battle / AI Tutor | 位于 Vocabulary 下方：单词对战排行榜、AI 答疑 | — | 已完成（需在 Vercel 连接两项服务） |
| Lesson 2 | Starting Out：三种学习路径（只做 Activity 1 / 只做 Activity 2 / 两个都做）。Activity 1 Video Time（图片 + 班级讨论、B 站视频、填表理解题、个人观点投票讨论）；Activity 2 Poetry Reading（朗诵音频可调速 + 中英对照 + 笔记栏、主旨题、勾选题、个人观点讨论） | 15 分钟（视频 7 + 诗歌 8） | 已完成（班级讨论需连接 Upstash） |
| Lesson 3 | Understanding Ideas: The Age of Majority：导入（成年权利勾选）、课文录音与 transcript（人物卡片、逐句翻译、key expressions）、课文精讲视频 + 笔记 + 师生问答区、文本分析（标题选择、文本类型、三人信息填表、事实与观点） | 40 分钟 | 已完成（问答区需连接 Upstash） |
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
- **先发后看**：三个讨论区都要求学生先发表自己的回答，才能看到同学的回答、点赞和回复；发帖后会出现 Teacher’s Example。讨论区沿用 Word Battle 和 AI Tutor 的深绿配色，便于识别。
- **视频**：嵌入 B 站 BV1zL7a6PEhg（外研社 Starting out 视频），旁边有“Open the Video on Bilibili”链接备用。
- **诗歌朗诵**：纯音频 `assets/audio/if-poem.m4a`（约 1 分 46 秒），按诗节男女声交替：第 1、3 节女声，第 2、4 节男声（课本节选第 1、4 节同样是一女一男）。播放条可拖动，可调速（0.75× / 1× / 1.25×），逐行高亮；点行号只播放这一行；选 Textbook Excerpt 时自动跳过第 2、3 节。
  - 录音用开源语音模型 Kokoro（Apache 2.0）在本地生成，英式女声 bf_emma、男声 bm_george。重新生成：`python3 tools/make-poem-audio.py poem.json <模型目录> assets/audio/if-poem.m4a`，把输出的 cues 填进 `js/data.js` 的 `GU.L2.poem.recording.cues`。
  - 想换成真人录音：替换音频文件并更新 `cues`（32 行各自开始的秒数）。若音频文件缺失，页面会自动改为有道逐行朗读。
  - 下方是全诗中英对照（课本只印第 1、4 节；第 2、3 节有浅色底纹并标注“not printed in the textbook”，可切换为 Textbook Excerpt）。行号按全诗 1–32 编排。
- **图片**：三张成人礼照片引用自 Wikimedia Commons（CC BY 2.0，按许可要求在页脚署名摄影者）。若无法加载（如中国大陆网络），会自动显示对应的 emoji 图。
- **答案反馈**：Activity 1 理解题为 Place / Age / How 填表，逐格判断（允许小的拼写错误），可显示答案和完整句子范例；Activity 2 主旨题按要点检查并给出参考答案；勾选题逐项给出诗句证据，点击 Line N 可跳到并朗读该行。
- **完成提示**：完成一个活动后会弹出提示，直接进入路径中的下一个活动；回到已完成的活动时，页面顶部也会显示下一步按钮。

## Lesson 3 说明

- **导入勾选题**：课本 Activity 1 的六项（credit card、driver's licence、full-time job、right to vote、bank loan、rent an apartment），可选 16 / 18 / 21 岁，答案与法律依据在 `GU.L3.rights`。
- **课文与录音**：全文 34 句及逐句中文翻译在 `GU.L3.passage.sections`（中文为本课程翻译）。录音 `assets/audio/age-of-majority.m4a`（约 3 分 22 秒）用 Kokoro 生成，引言为旁白女声，Bethany 英式女声，Lin Ning 英式男声，Morgan 美式男声；逐句高亮、点句子单独播放、可调速。重新生成：`python3 tools/make-passage-audio.py passage.json <模型目录> assets/audio/age-of-majority.m4a`，把输出的 cues 填回。
- **Key expressions**：33 个，首次出现处高亮，点击弹出中文、英文释义、牛津词典例句和链接；单元词表中的词直接引用 Lesson 1 的词典例句。
- **精讲视频**：B 站 BV1TiyKYUEwE（爱学英语的Vivian，约 27 分钟），下方有笔记区（可下载）和师生问答区。学生提问对全班可见，同学可回答；教师在 Teacher's Corner 保存 `TEACHER_KEY` 后，在活动页的回答标为 Teacher。Teacher's Corner 列出未回答的问题，超过三天的标红。
- **课程总时长**：20 + 15 + 40 + 20 = 95 分钟，首页和 Teacher's Corner 自动按各课时长计算。

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
js/kit.js                  活动页通用组件（分步解锁、完成提示、开放题、讨论步骤）
js/view-*.js               各个页面（view-lesson2.js 为 Starting Out，view-lesson3.js 为 Understanding Ideas）
api/leaderboard.js         排行榜服务（Vercel 函数）
api/tutor.js               AI Tutor 服务（Vercel 函数）
api/discuss.js             班级讨论服务（Vercel 函数）
assets/img/                首页小树苗（取自课本 Starting Out 页）、左侧导航的课本封面 cover.jpg
assets/emoji/              Twemoji 图片（CC BY 4.0）
assets/video/              介绍视频
assets/audio/              诗歌和课文朗读音频
assets/fonts/              字体（本地托管）
downloads/                 单词表 PDF
tools/make-wordlist-pdf.js 修改单词后重新生成 PDF：node tools/make-wordlist-pdf.js
tools/make-poem-audio.py   生成诗歌双声朗读音频和逐行时间点
tools/make-passage-audio.py 生成课文四种音色朗读音频和逐句时间点
```

## 单词发音

优先顺序：本地录音（在 `js/data.js` 某个单词里加 `audio: "audio/words/xxx.mp3"`）→ 有道词典英式发音 → 浏览器自带语音。每次播放单独判断，不会因为一次加载慢就整站切换成机器音。

## 本地预览

在项目文件夹运行 `python3 -m http.server 8000`，打开 http://localhost:8000 。本地没有 /api 服务，排行榜、讨论区和 AI Tutor 会自动用备用模式。

## 已知限制

- 学习进度保存在学生自己的浏览器里，换设备会从头开始。
- vercel.app 域名在中国大陆可能无法访问；如需给大陆学生使用，可绑定自定义域名。
- Wikimedia 图片在中国大陆可能无法加载；B 站视频不受影响。
