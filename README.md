# 排隊系統 (Queue Room System)

這是一個基於 Node.js 和 Redis 的排隊系統，使用 Express 框架開發，支援 Serverless 部署。

## 系統需求

- Node.js (建議版本 16.x 或更高)
- Redis 伺服器
- npm 或 yarn 套件管理器

## 安裝步驟

### 1. 安裝 Node.js

#### macOS

使用 Homebrew 安裝：

```bash
brew install node
```

#### Windows

從 [Node.js 官網](https://nodejs.org/) 下載並安裝最新的 LTS 版本。

#### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 安裝 Redis

#### macOS

```bash
brew install redis
brew services start redis
```

#### Windows

從 [Redis Windows 版本](https://github.com/microsoftarchive/redis/releases) 下載並安裝。

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 3. 安裝專案依賴

1. 複製專案到本地：
    ```bash
    git clone git@github.com/leokwsw/queue-room.git
    cd queue-room
    ```

2. 安裝依賴套件：
    ```bash
    npm install
    ```

## 環境設定

1. 在專案根目錄創建 `.env` 文件：

```bash
cp .env.example .env
```

2. 根據需求修改 `.env` 文件中的配置：

```
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

## 運行專案

### 開發環境

```bash
npm run start:dev
```

### 生產環境

```bash
npm run build
npm start
```

## 建置部署

### 建置所有資源

```bash
npm run build:all
```

### 建置 Lambda Layer

```bash
npm run build:layer
```

## 主要功能

- 使用者排隊管理
- 即時隊列狀態更新
- JWT 認證
- IP 追蹤
- 跨域資源共享 (CORS) 支援

## 開發者

Leo Wu

## 授權

ISC License
