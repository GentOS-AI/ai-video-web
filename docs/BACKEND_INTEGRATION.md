# Backend Integration Guide

本文档说明如何将 AIVideo.DIY 前端与后端服务集成。

## 项目结构

```
ai-video-web/
├── app/                    # Next.js 前端
├── components/             # React 组件
├── lib/                    # 前端工具库
├── public/                 # 静态资源
├── backend/                # Python FastAPI 后端 ⭐️ 新增
│   ├── app/               # 后端应用代码
│   ├── scripts/           # 数据库脚本
│   ├── README.md          # 后端文档
│   └── start.sh           # 快速启动脚本
└── ...
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 方式 1: 使用启动脚本（推荐）
./start.sh

# 方式 2: 手动启动
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/init_db.py
python scripts/seed_data.py
uvicorn app.main:app --reload --port 8000
```

后端服务启动后：
- **API Base**: http://localhost:8000/api/v1
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2. 配置后端环境变量

复制 `backend/.env.example` 为 `backend/.env`：

```bash
cd backend
cp .env.example .env
```

**必须配置的项**（在 [Google Cloud Console](https://console.cloud.google.com/) 获取）：

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET_KEY=your-secret-key  # 生成: openssl rand -hex 32
```

### 3. 启动前端服务

```bash
# 在项目根目录
npm run dev

# 或指定端口
npm run dev -- -p 3000
```

前端服务：http://localhost:3000

## 前端集成步骤

### 步骤 1: 创建 API 客户端

创建 `lib/api/client.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理 token 过期
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          // 重试原请求
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(error.config);
        } catch {
          // 刷新失败，跳转登录
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### 步骤 2: 创建 API 服务

创建 `lib/api/services.ts`:

```typescript
import { apiClient } from './client';

// 认证服务
export const authService = {
  async googleLogin(code: string, redirectUri: string) {
    const { data } = await apiClient.post('/auth/google', { code, redirect_uri: redirectUri });
    return data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.clear();
  },
};

// 视频服务
export const videoService = {
  async generate(prompt: string, model: string, referenceImageUrl?: string) {
    const { data } = await apiClient.post('/videos/generate', {
      prompt,
      model,
      reference_image_url: referenceImageUrl,
    });
    return data;
  },

  async getVideos(page = 1, pageSize = 20) {
    const { data } = await apiClient.get('/videos', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  async getVideo(id: number) {
    const { data } = await apiClient.get(`/videos/${id}`);
    return data;
  },

  async deleteVideo(id: number) {
    await apiClient.delete(`/videos/${id}`);
  },
};

// 首页数据服务
export const showcaseService = {
  async getShowcaseVideos(limit = 6) {
    const { data } = await apiClient.get('/showcase/videos', {
      params: { limit },
    });
    return data;
  },

  async getHeroVideos(limit = 3) {
    const { data } = await apiClient.get('/showcase/hero-videos', {
      params: { limit },
    });
    return data;
  },

  async getTrialImages(limit = 8) {
    const { data } = await apiClient.get('/showcase/trial-images', {
      params: { limit },
    });
    return data;
  },
};

// 上传服务
export const uploadService = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
```

### 步骤 3: 创建认证上下文

创建 `contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api/services';

interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (code: string, redirectUri: string) => {
    const tokens = await authService.googleLogin(code, redirectUri);
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 步骤 4: 修改 HeroSection 组件

更新 `components/HeroSection.tsx` 中的 `handleGenerate` 函数：

```typescript
import { videoService } from '@/lib/api/services';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();
  // ... 其他状态

  const handleGenerate = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    if (!prompt || prompt.length < 10) {
      alert('Please enter a prompt (at least 10 characters)');
      return;
    }

    try {
      setIsGenerating(true);

      const video = await videoService.generate(
        prompt,
        selectedModel?.id || 'sora-2',
        selectedImage ? trialImages[selectedImage - 1]?.src : undefined
      );

      console.log('Video generation started:', video);
      alert('Video generation started! Check your videos list.');

      // 可选：跳转到视频列表页面
      // router.push('/videos');

    } catch (error: any) {
      console.error('Generation failed:', error);
      alert(error.response?.data?.detail || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  // ... 组件其余部分
};
```

### 步骤 5: 修改 Navbar 组件

更新 `components/Navbar.tsx` 实现真实登录：

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}`;

    window.location.href = googleAuthUrl;
  };

  return (
    <nav>
      {/* ... 其他内容 */}

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm">Credits: {user.credits}</span>
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <Button onClick={handleGoogleLogin} variant="primary">
          Login with Google
        </Button>
      )}
    </nav>
  );
};
```

### 步骤 6: 创建 OAuth 回调页面

创建 `app/auth/callback/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const redirectUri = `${window.location.origin}/auth/callback`;

    if (code) {
      login(code, redirectUri)
        .then(() => {
          router.push('/');
        })
        .catch((error) => {
          console.error('Login failed:', error);
          router.push('/?error=login_failed');
        });
    } else {
      router.push('/?error=no_code');
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging in...</h1>
        <p className="text-text-secondary">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
```

### 步骤 7: 更新根布局

修改 `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 步骤 8: 更新环境变量

创建 `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## API 端点总览

### 认证
- `POST /api/v1/auth/google` - Google OAuth 登录
- `POST /api/v1/auth/refresh` - 刷新 token
- `GET /api/v1/auth/me` - 获取当前用户

### 用户
- `GET /api/v1/users/profile` - 获取用户资料
- `PATCH /api/v1/users/profile` - 更新用户资料
- `GET /api/v1/users/credits` - 获取用户积分

### 视频
- `POST /api/v1/videos/generate` - 生成视频
- `GET /api/v1/videos` - 获取视频列表
- `GET /api/v1/videos/{id}` - 获取视频详情
- `DELETE /api/v1/videos/{id}` - 删除视频

### 首页内容
- `GET /api/v1/showcase/videos` - 展示视频
- `GET /api/v1/showcase/hero-videos` - 轮播视频
- `GET /api/v1/showcase/trial-images` - 试用图片

### 上传
- `POST /api/v1/upload/image` - 上传图片

详细文档见：[backend/API_ENDPOINTS.md](backend/API_ENDPOINTS.md)

## 数据库表结构

详细表结构文档见：[backend/DATABASE_SCHEMA.md](backend/DATABASE_SCHEMA.md)

主要表：
- **users**: 用户信息和积分
- **videos**: 视频生成记录
- **showcase_videos**: 首页展示视频
- **trial_images**: 试用参考图片

## 开发工作流

### 1. 本地开发

```bash
# 终端 1: 启动后端
cd backend
./start.sh

# 终端 2: 启动前端
npm run dev
```

### 2. 测试 API

使用 Swagger UI: http://localhost:8000/docs

### 3. 查看数据库

```bash
cd backend
sqlite3 aivideo.db

# SQL 命令
.tables                    # 查看所有表
SELECT * FROM users;       # 查看用户
SELECT * FROM videos;      # 查看视频
```

### 4. 重置数据库

```bash
cd backend
rm aivideo.db
python scripts/init_db.py
python scripts/seed_data.py
```

## 部署

### 后端部署 (推荐 Railway/Render)

1. 添加 `Procfile`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. 设置环境变量
3. 连接 PostgreSQL 数据库
4. 部署后运行迁移

### 前端部署 (Vercel)

1. 连接 GitHub 仓库
2. 设置环境变量：
   - `NEXT_PUBLIC_API_URL`: 后端 API 地址
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google Client ID
3. 部署

## 故障排查

### CORS 错误
确保后端 `.env` 中 `ALLOWED_ORIGINS` 包含前端地址：
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Token 认证失败
检查：
1. `JWT_SECRET_KEY` 是否设置
2. Token 是否过期
3. 请求头格式: `Authorization: Bearer <token>`

### Google OAuth 错误
1. 检查 Google Console 中的回调 URL
2. 确认 Client ID 和 Secret 正确
3. 确保 redirect_uri 匹配

## 下一步

- [ ] 实现视频列表页面 (`app/videos/page.tsx`)
- [ ] 添加视频播放器组件
- [ ] 实现用户资料页面
- [ ] 添加积分购买功能
- [ ] 集成真实的 AI 视频生成 API

## 参考文档

- [后端 README](backend/README.md)
- [API 端点文档](backend/API_ENDPOINTS.md)
- [数据库表结构](backend/DATABASE_SCHEMA.md)
- [前端 README](README.md)
