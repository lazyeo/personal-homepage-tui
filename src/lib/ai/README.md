# AI Provider Module

多 AI Provider 抽象层，支持统一接口访问不同的 AI 服务。

## 架构

```
src/lib/ai/
├── providers/
│   ├── base.js       # BaseProvider 抽象类
│   ├── gemini.js     # Google Gemini Provider
│   ├── openai.js     # OpenAI-compatible Provider
│   └── anthropic.js  # Anthropic-compatible Provider
├── factory.js        # Provider 工厂函数
├── index.js          # 统一导出
└── README.md         # 本文件
```

## 使用方法

### 1. 基本使用

```javascript
import { createProvider } from './lib/ai/index.js';

const provider = createProvider({
  provider: 'gemini',           // 'gemini' | 'openai' | 'anthropic'
  apiKey: 'your-api-key',
  baseUrl: 'https://...',       // 可选
  model: 'gemini-2.0-flash-exp',
});

const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' },
];

const response = await provider.chat(messages);
console.log(response); // "Hello! How can I help you today?"
```

### 2. 在 Astro 项目中使用

```javascript
import { createProvider } from '../lib/ai/index.js';

const provider = createProvider({
  provider: import.meta.env.PUBLIC_AI_PROVIDER,
  apiKey: import.meta.env.PUBLIC_AI_API_KEY,
  baseUrl: import.meta.env.PUBLIC_AI_BASE_URL,
  model: import.meta.env.PUBLIC_AI_MODEL,
});
```

## Provider 详解

### BaseProvider

所有 provider 的基类，定义了统一接口:

```javascript
class BaseProvider {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  async chat(messages) {
    // 子类实现
  }

  normalizeBaseUrl(url) {
    // 标准化 URL (去除尾部斜杠和 /v1 后缀)
  }
}
```

### GeminiProvider

实现 Google Gemini API 调用:

- **端点**: `/v1beta/models/{model}:generateContent`
- **认证**: URL 参数 `?key={apiKey}`
- **消息转换**:
  - `system` → `systemInstruction`
  - `user`/`assistant` → `contents` (role: user/model)

### OpenAIProvider

实现 OpenAI-compatible API 调用:

- **端点**: `/v1/chat/completions`
- **认证**: `Authorization: Bearer {apiKey}`
- **消息格式**: 标准 OpenAI 格式 (无需转换)

### AnthropicProvider

实现 Anthropic-compatible API 调用:

- **端点**: `/v1/messages`
- **认证**: `x-api-key: {apiKey}`
- **消息转换**:
  - `system` 提取为单独的 `system` 字段
  - 其他消息保持 `messages` 数组

## 消息格式

所有 provider 接受统一的输入格式 (OpenAI 风格):

```javascript
[
  { role: 'system', content: '...' },
  { role: 'user', content: '...' },
  { role: 'assistant', content: '...' },
  // ...
]
```

内部会自动转换为对应 provider 的格式。

## 错误处理

所有 provider 抛出统一的 Error:

```javascript
try {
  const response = await provider.chat(messages);
} catch (error) {
  console.error(error.message);
  // "Gemini API error: 400 - {...}"
  // "OpenAI API error: 401 - {...}"
  // "Anthropic API error: 429 - {...}"
}
```

## 扩展新 Provider

1. 继承 `BaseProvider`
2. 实现 `chat(messages)` 方法
3. 在 `factory.js` 中注册
4. 在 `index.js` 中导出

```javascript
// providers/custom.js
import { BaseProvider } from './base.js';

export class CustomProvider extends BaseProvider {
  async chat(messages) {
    // 实现自定义 API 调用
  }
}

// factory.js
import { CustomProvider } from './providers/custom.js';

export function createProvider(config) {
  switch (config.provider) {
    // ...
    case 'custom':
      return new CustomProvider(config);
  }
}
```

## 设计原则

1. **统一接口**: 所有 provider 实现相同的 `chat()` 方法
2. **格式转换**: 内部处理不同 API 的格式差异
3. **错误封装**: 统一错误处理和消息格式
4. **可扩展**: 易于添加新 provider
5. **零依赖**: 不依赖官方 SDK，直接使用 fetch

## 参考

- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Anthropic API Docs](https://docs.anthropic.com/en/api)
