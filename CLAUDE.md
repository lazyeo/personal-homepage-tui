# Personal Homepage TUI - 开发指南

## 项目概述

TUI 风格的个人主页，面向新西兰雇主，默认英文，支持中文切换。

## 核心设计原则

### TUI 视觉风格
- 等宽字体 (JetBrains Mono / Fira Code)
- 终端配色 (深色背景 #0d1117, 绿色文字 #00ff00 或 amber #ffb000)
- ASCII 边框和装饰
- 光标闪烁动效
- 打字机效果输出

### 交互模式
- **命令输入**: 用户可输入命令导航 (`about`, `projects` 等)
- **鼠标支持**: 滚动、点击链接、选择复制文字
- **快捷键**: 可选支持 Tab 补全、上下箭头历史

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Astro |
| 样式 | 原生 CSS + CSS Variables |
| i18n | @astrojs/i18n 或 astro-i18next |
| 部署 | Cloudflare Pages |

## 目录结构

```
src/
├── components/
│   ├── Terminal.astro      # 终端容器
│   ├── CommandLine.astro   # 命令输入
│   ├── Output.astro        # 输出区域
│   └── Prompt.astro        # 命令提示符
├── content/
│   ├── en/                 # 英文内容
│   └── zh/                 # 中文内容
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro
└── styles/
    └── tui.css             # TUI 主题样式
```

## 内容模块

| 命令 | 模块 | 内容 |
|------|------|------|
| `about` | 个人简介 | 自我介绍、职业定位 |
| `skills` | 技术栈 | 编程语言、框架、工具 |
| `projects` | 项目展示 | 项目列表、描述、链接 |
| `experience` | 工作经历 | 公司、职位、时间、职责 |
| `education` | 教育背景 | 学校、学位、时间 |
| `blog` | 文章 | 博客文章列表 |
| `contact` | 联系方式 | 社交链接、邮箱 |

## i18n 策略

- 默认语言: English
- 支持语言: 中文
- 切换命令: `lang en` / `lang zh`
- URL 结构: `/` (en), `/zh/` (zh)

## 开发规范

- 组件使用 Astro 组件 (.astro)
- 交互逻辑使用 vanilla JS 或轻量框架
- 内容使用 Markdown + frontmatter
- 样式变量统一定义在 tui.css

## 当前阶段

**Phase 1 (MVP)** - 基础 TUI 框架 + 核心内容模块
