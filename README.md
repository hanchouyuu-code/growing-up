# The Age of Majority · 在线英语课

MLT908 / EDTM902 小组期末项目的互动学习网站（高二英语，主题 Growing up）。

一节 90 分钟的课，分 5 个部分：

| 部分 | 内容 | 时长 | 状态 |
|---|---|---|---|
| 1 | Vocabulary：成年相关词汇 | 20 分钟 | 已完成 |
| 2 | Starting out：成长中的日常两难 | 20 分钟 | 计划中 |
| 3 | Reading：The Age of Majority | 30 分钟 | 计划中 |
| 4 | Writing：18 岁的责任 | 20 分钟 | 计划中 |
| 5 | Teacher's corner：教师专区 | — | 计划中 |

## 文件结构

```
index.html        网页骨架：导航、5 个部分的页面结构
css/styles.css    样式：颜色、字体、布局、手机适配
js/content.js     课程内容：词汇、题目、故事、分类题（改内容只改这里）
js/app.js         交互逻辑：发音、配对、填空、进度、计时器
favicon.svg       浏览器标签页上的小图标
```

## 在自己电脑上预览

不需要安装任何东西：直接双击 `index.html` 用浏览器打开即可。

如果想用本地服务器（更接近线上效果），在项目文件夹里运行：

```
python3 -m http.server 8000
```

然后在浏览器打开 http://localhost:8000

## 上线（GitHub + Vercel）

1. 把这个文件夹的代码放进一个 GitHub 仓库。
2. 用 GitHub 账号登录 https://vercel.com ，选 **Add New… → Project**，导入这个仓库。
3. Framework Preset 选 **Other**，其他设置都不用改，点 **Deploy**。
4. 一两分钟后会得到一个 `xxx.vercel.app` 的网址，这就是上线的网站。

之后每次把新代码推送到 GitHub，Vercel 会自动重新部署，网址不变。

## 已知限制

- 学习进度保存在学生自己浏览器的 localStorage 里，换设备会从头开始。
- 发音用的是浏览器自带的语音合成，不同设备音色不同。
- 网站放在海外平台上，中国大陆访问可能不稳定；本版本用于课程演示。
- 讨论区、AI 导学、教师后台需要后端，将在后续版本加入。
