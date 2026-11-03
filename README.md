# Growing up · Unit 1 在线英语课

配色：米白/燕麦色背景、深墨绿主色、琥珀色点缀（变量在 `css/styles.css` 顶部 `:root`）。

MLT908 / EDTM902 期末项目（个人部分）的互动学习网站。
教材：外语教学与研究出版社 普通高中教科书 英语 选择性必修 第二册，Unit 1 Growing up。

线上地址：https://growing-up-five.vercel.app

## 课程结构（共 90 分钟）

| 部分 | 内容 | 时长 | 状态 |
|---|---|---|---|
| Course Overview | 教材名称（中英）、Unit Overview、Introduction Video、课程结构、奖章 | — | 已完成 |
| Lesson 1 | Vocabulary：30 个单词（minimum 之前），3 组，每组含 Set Read-Along | 20 分钟 | 已完成 |
| Word Battle / AI Tutor | 位于 Vocabulary 下方：单词对战排行榜、AI 答疑 | — | 已完成（需在 Vercel 连接两项服务） |
| Lesson 2 | Starting Out：三种学习路径（只做 Activity 1 / 只做 Activity 2 / 两个都做）。Activity 1 Video Time（图片 + 班级讨论、B 站视频、填表理解题、个人观点投票讨论）；Activity 2 Poetry Reading（朗诵音频可调速 + 中英对照 + 笔记栏、主旨题、勾选题、个人观点讨论） | 15 分钟（视频 7 + 诗歌 8） | 已完成（班级讨论需连接 Upstash） |
| Lesson 3 | Understanding Ideas: The Age of Majority：导入（成年权利勾选）、课文录音与 transcript（人物卡片、逐句翻译、key expressions）、课文精讲视频 + 笔记 + 师生问答区、文本分析（标题选择、文本类型、三人信息填表、事实与观点） | 40 分钟 | 已完成（问答区需连接 Upstash） |
| Lesson 4 | Writing：Pre-writing（课本 Think & Share 两个开放问题 + 班级讨论与投票）；Guided Writing（高考应用文格式的 80 词短文 Me at Eighteen，旁边有语言库；写完后 AI 评分与润色，教师问答区和班级习作展示同时开放） | 15 分钟（思考 5 + 写作 10） | 已完成（AI 评价需 AI 密钥，问答区和展示区需连接 Upstash） |
| Teacher Resources | About this unit 介绍语；课程安排与单词表 PDF；Starting Out 背景信息；Understanding Ideas 长难句讲解；Writing 写作指导；Lesson 2–4 参考答案；学生提问、讨论服务与管理 | — | 已完成 |

## 需要你在 Vercel 上做的设置

不做这些设置网站也能正常使用：排行榜和各课班级讨论会显示“本设备记录”（只看到自己的回答），AI Tutor 会用教师预设提示回答，作文评价会显示本地估分。

### 1. 班级排行榜、讨论区和问答区（Upstash Redis，免费）

1. 打开 Vercel 项目 → **Storage** → **Create Database** → 选 **Upstash for Redis**（免费档即可）。
2. 创建后点 **Connect Project**，选择 growing-up 项目。Vercel 会自动加上 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 两个环境变量。
3. 到 **Deployments**，对最新一次部署点 **Redeploy**。

同一个数据库同时用于 Word Battle 排行榜、Lesson 2–4 的所有讨论区、问答区和习作展示区。

### 2. AI Tutor（需要一个 AI 接口密钥）

在 Vercel 项目 → **Settings** → **Environment Variables** 添加其中一组，然后 Redeploy：

- Claude：`ANTHROPIC_API_KEY` =（你的密钥）。可选 `ANTHROPIC_MODEL`，默认 `claude-haiku-5-5`。
- 或任何 OpenAI 兼容接口（如 DeepSeek、通义千问）：`OPENAI_API_KEY`、`OPENAI_MODEL`，以及 `OPENAI_BASE_URL`（例如 `https://api.deepseek.com/v1`）。

同一组密钥也用于 Lesson 4 的 AI 作文评价（`api/feedback.js`）。没有密钥时，作文页面会改为本地自动检查（要点、词数、词汇、连接词），并标注为 Estimate。

接上 Upstash 后会自动限流，防止费用失控：AI Tutor 每个网络连接每小时最多 30 个问题，作文评价每小时最多 12 次。

### 3. 讨论区管理密钥（可选，Lesson 3 / Lesson 4 问答区教师回复需要）

在 **Environment Variables** 添加 `TEACHER_KEY` =（自己设定的一串密码），Redeploy。之后在网站 Teacher Resources → Class Management → Discussion Moderation 输入这串密码，本设备上的讨论区会出现 **Remove** 按钮，可以删除不当的帖子或回复。

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

- **课程首页**：以课文引言的诗句形式导入（逐行淡入），三位人物照片半透明印在右侧。
- **Activity 1 Pre-reading**：Legal Ages for Adult Rights（课本 Activity 1 的六项权利勾选（16 / 18 / 21 岁，答案与法律依据在 `GU.L3.rights`）），随后是 Text Structure（文章版式图 + 选择题，答案 magazine）。
- **Activity 2 课文**：全文 34 句及逐句中文翻译（本课程翻译）；录音 `assets/audio/age-of-majority.m4a`（约 3 分 22 秒，Kokoro 生成：引言旁白女声，Bethany 英式女声，Lin Ning 英式男声，Morgan 美式男声），逐句高亮、点句单独播放、可调速。人物照片半透明印在各自段落旁。33 个 key expressions 在正文高亮，点击可看中文、释义、牛津词典例句，或直接问 AI Tutor。第二步为 Key Expression Review（每轮 8 题，补全课文句子或选择中文意思），下方接 Word Battle 与 AI Tutor（Further Practice）。AI Tutor 已加入课文全文和 key expressions，可回答相关问题；本页右下角也有 AI Tutor 按钮。
- **Activity 3 精讲视频**：B 站 BV1TiyKYUEwE（爱学英语的Vivian，约 27 分钟），笔记区 + 师生问答区。
- **Activity 4 Reading Comprehension**：Title Selection、Detailed Reading（三人信息填表）、Fact and Opinion。
- **Word Battle 与 AI Tutor**：左侧导航在 Vocabulary 和 Understanding Ideas 下各有一组入口（`#/community/...` 与 `#/lesson-3/battle`、`#/lesson-3/tutor`）。同一个排行榜；AI Tutor 在 Lesson 3 中以课文和 key expressions 为重点，提示问题、开场白和教师提示模式都按课分别设置（`GU.PRACTICE`），两课的对话记录分开保存。
- **人物照片**：`assets/img/speakers/`，取自课本页面截图。重新生成录音：`python3 tools/make-passage-audio.py passage.json <模型目录> assets/audio/age-of-majority.m4a`，把输出的 cues 填回 `GU.L3.passage.cues`。
- **课程总时长**：20 + 15 + 40 + 15 = 90 分钟。

## Lesson 4 说明

- **Activity 1 Pre-writing（5 分钟）**：课本 Think & Share 的第 2、3 题（What right are you most looking forward to having as an adult? Why? / What do you think it means to be a responsible adult?）。两题都是先发后看的班级讨论，有句子开头提示，发帖后显示参考回答。第一题列出五项权利供参考（不需要选择，也可以写其他权利）；发帖后的 Class Poll 按回答里提到的第一项权利自动统计，没提到的计入 Other rights（关键词在 `GU.L4.right.rights` 中修改）。Writing 部分不设 Word Battle 和 AI Tutor。
- **Activity 2 Guided Writing（10 分钟）**：
  - **Writing Task**：高考应用文格式的中文题目（不用“假定你是李华”，请学生结合自己的期待与思考写“Me at Eighteen”征文，三个要点，词数 80 左右，标题已给出）。编辑器自动保存，显示词数（80 词标记）和三个要点的完成情况，至少 50 词才能提交，可下载。右侧语言库分三栏：Words（Vocabulary 30 词）、Expressions（Lesson 3 的 key expressions）、Patterns（开头、理由、责任、结尾句型），点击插入到光标处，已用到的会打勾。
  - **Feedback and Revision**：AI 按高考应用文 15 分五档评分，给出优点、改进建议、语言错误（在原文中标出）和润色后的版本对照。没有 AI 密钥时显示本地估分。可返回编辑器修改后重新评价，可展开范文。
  - **Questions and Answers** 与 **Writing Showcase**：完成 AI 评价后两步同时开放。问答区为可选步骤（教师回复需 `TEACHER_KEY`），随时可以提问；展示区自动填入学生的作文，先发后看，发帖后显示范文。分享作文即完成本活动。
- 题目、要点、范文（83 词）、语言库和评分档次都在 `js/data.js` 的 `GU.L4` 中修改。

## Teacher Resources 说明

内容在 `js/teacher-data.js`（`GU.TR`），页面在 `js/view-other.js`。页面顶部是 About this unit 介绍语和六个资源入口，点击跳到对应部分：

- **Course Schedule**：四课时长（共 90 分钟）和单词表 PDF。
- **Background Information**（Lesson 2）：教师用书的三则背景信息（中国拟推行的标准成人礼、古代的“字”、吉卜林），每则附一条课堂使用建议。
- **Difficult Sentences**（Lesson 3）：教师用书的五个长难句讲解（Paraphrase、句子结构、语言点与例句），可展开或收起，旁边是说话人的头像。
- **Writing Guide**（Lesson 4）：80 词三段式结构表、高考应用文评分原则（15 分五档；少于 60 词或多于 100 词扣 2 分等）、课文中可借用的好词好句（按开头、理由、责任、结尾分组，每条附课文原句和作文例句）、范文逐句标注、常见错误。
- **Answer Keys**：Lesson 2–4 参考答案、写作题目和范文。
- **Class Management**：学生提问列表、讨论服务连接状态、教师密钥。

## 文件结构

```
index.html                 网页骨架
css/styles.css             样式（手机、平板、电脑适配）
js/data.js                 课程内容：单词、例句、词典例句、图片、目标、奖章（改内容只改这里）
js/tutor-data.js           AI Tutor 的教师预设提示：词形变化、搭配、词组、用法
js/teacher-data.js         Teacher Resources 内容：背景信息、长难句讲解、写作指导
js/store.js                学习进度（保存在浏览器）
js/audio.js                发音、跟读录音
js/ui.js                   图标、奖章、弹窗、图片
js/shell.js                左侧导航、右上角奖章进度条、页面切换、AI Tutor 按钮
js/discuss.js              班级讨论区（先发后看、点赞、回复、投票统计）
js/kit.js                  活动页通用组件（分步解锁、完成提示、开放题、讨论步骤）
js/view-*.js               各个页面（view-lesson2.js 为 Starting Out，view-lesson3.js 为 Understanding Ideas，view-lesson4.js 为 Writing）
api/leaderboard.js         排行榜服务（Vercel 函数）
api/tutor.js               AI Tutor 服务（Vercel 函数）
api/discuss.js             班级讨论服务（Vercel 函数）
api/feedback.js            Lesson 4 作文 AI 评价（Vercel 函数）
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
