# 资产使用指南 / Assets Guide

## 🎨 已添加的资产 / Added Assets

### 1. Logo 和品牌资产 / Logo & Brand Assets

#### Logo SVG
**位置**: `/public/logo.svg`
**尺寸**: 32x32px
**用途**:
- Navbar 导航栏
- Footer 页脚
- 品牌标识

**特性**:
- 紫色渐变背景 (#8B5CF6 → #A855F7 → #C084FC)
- 白色播放按钮图标
- 装饰性闪光点
- 可缩放的 SVG 格式

#### Open Graph 图片
**位置**: `/public/og-image.svg`
**尺寸**: 1200x630px
**用途**:
- 社交媒体分享预览
- Twitter Card
- Facebook/LinkedIn 链接预览

**特性**:
- 完整的品牌呈现
- Logo + 品牌名称 + 标语
- 针对社交媒体优化的尺寸

---

### 2. 图片资产 / Image Assets

所有图片均使用 **Unsplash** 高质量免费图片服务。

#### 试用样本图片 / Trial Sample Images
**配置位置**: `/lib/assets.ts` → `trialImages`

```typescript
{
  id: 1-4,
  src: "https://images.unsplash.com/photo-XXX?w=400&h=400&fit=crop",
  alt: "AI Technology 1-4"
}
```

**主题**: AI 科技相关
**尺寸**: 400x400px (正方形)
**数量**: 4 张
**用途**: Hero Section 的免费试用图片选择器

#### Hero 轮播视频海报 / Hero Carousel Posters
**配置位置**: `/lib/assets.ts` → `heroVideos`

```typescript
{
  poster: "https://images.unsplash.com/photo-XXX?w=800&h=450&fit=crop"
}
```

**尺寸**: 800x450px (16:9 比例)
**数量**: 3 张
**主题**:
1. 产品发布 (科技设备)
2. 品牌故事 (商业场景)
3. 商业广告 (营销视觉)

#### Showcase 展示海报 / Showcase Posters
**配置位置**: `/lib/assets.ts` → `showcaseVideos`

**尺寸**: 800x450px (16:9 比例)
**数量**: 6 张
**分类**:
1. 产品 - 科技产品
2. 时尚 - 时装展示
3. 食品饮料 - 美食摄影
4. 房地产 - 豪宅内景
5. 汽车 - 豪华汽车
6. 技术 - SaaS/软件界面

---

### 3. 视频资产 / Video Assets

使用 **Google 开源视频** (BigBuckBunny, Elephant's Dream 等)。

#### Hero 轮播视频 / Hero Carousel Videos
**来源**: Google Cloud Storage (公开访问)

```
- BigBuckBunny.mp4 (产品发布)
- ElephantsDream.mp4 (品牌故事)
- Sintel.mp4 (商业广告)
```

**特性**:
- 开源免费使用
- 高质量 MP4 格式
- 支持所有现代浏览器
- 自动播放、循环、静音

#### Showcase 视频 / Showcase Videos
**来源**: Google Cloud Storage

```
- ForBiggerBlazes.mp4
- ForBiggerEscapes.mp4
- ForBiggerFun.mp4
- ForBiggerJoyrides.mp4
- ForBiggerMeltdowns.mp4
- SubaruOutbackOnStreetAndDirt.mp4
```

**特性**:
- 各种主题的演示视频
- 专业质量
- 优化的文件大小
- 快速加载

---

## 🔧 配置说明 / Configuration

### Next.js 图片配置
**文件**: `/next.config.ts`

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",  // Unsplash 图片
    },
    {
      protocol: "https",
      hostname: "commondatastorage.googleapis.com",  // Google 视频
    },
  ],
}
```

这允许 Next.js `<Image>` 组件从这些外部域名加载资源。

---

## 📝 如何更换资产 / How to Replace Assets

### 方法 1: 更新配置文件 (推荐)
编辑 `/lib/assets.ts`:

```typescript
export const trialImages = [
  {
    id: 1,
    src: "your-image-url-here",  // 替换为你的图片 URL
    alt: "Your Description",
  },
  // ... 更多图片
];
```

### 方法 2: 使用本地文件
1. 将图片/视频文件放入 `/public` 目录:
   ```
   public/
   ├── images/
   │   ├── trial1.jpg
   │   ├── trial2.jpg
   │   └── ...
   └── videos/
       ├── hero1.mp4
       ├── hero2.mp4
       └── ...
   ```

2. 更新 `/lib/assets.ts`:
   ```typescript
   export const trialImages = [
     {
       id: 1,
       src: "/images/trial1.jpg",  // 使用相对路径
       alt: "Trial 1",
     },
   ];
   ```

3. 如果使用本地文件，可以从 `next.config.ts` 中移除 `images.remotePatterns`。

---

## 🖼️ 推荐的图片规格 / Recommended Specifications

### Trial Images (试用图片)
- **尺寸**: 400x400px 或更大(正方形)
- **格式**: JPG, PNG, WebP
- **文件大小**: < 200KB
- **主题**: AI、科技、创意相关

### Video Posters (视频海报)
- **尺寸**: 1920x1080px 或 1280x720px (16:9)
- **格式**: JPG (推荐)
- **文件大小**: < 500KB
- **质量**: 高清，专业摄影

### Logo
- **格式**: SVG (可缩放) 或 PNG (透明背景)
- **尺寸**: 至少 512x512px (如果 PNG)
- **颜色**: 保持品牌一致性

### Open Graph Image
- **尺寸**: 1200x630px (Facebook/Twitter 推荐)
- **格式**: JPG, PNG
- **文件大小**: < 1MB
- **文本**: 清晰可读，避免小字

---

## 🎬 视频规格 / Video Specifications

### 推荐格式
- **容器**: MP4
- **编码**: H.264
- **分辨率**: 1920x1080 (Full HD) 或 1280x720 (HD)
- **帧率**: 30fps 或 60fps
- **码率**: 2-5 Mbps
- **音频**: AAC, 可选 (建议静音)

### 文件大小控制
- **Hero 视频**: 每个 < 10MB
- **Showcase 视频**: 每个 < 5MB
- **总页面加载**: 首次访问 < 50MB

### 优化建议
1. 使用视频压缩工具 (HandBrake, FFmpeg)
2. 移除音轨 (如果不需要)
3. 降低码率以减小文件
4. 考虑使用视频CDN (Cloudflare, AWS CloudFront)

---

## 🌐 CDN 服务推荐 / Recommended CDN Services

### 免费图片服务
1. **Unsplash** - 高质量免费图片 (当前使用)
   - URL: `https://images.unsplash.com/`
   - 免费，无需注册
   - 可调整尺寸: `?w=400&h=400&fit=crop`

2. **Pexels** - 免费图片和视频
   - URL: `https://images.pexels.com/`
   - 高质量素材

3. **Pixabay** - 免费图片
   - URL: `https://pixabay.com/`

### 视频托管
1. **Google Cloud Storage** (当前使用)
   - 开源演示视频
   - 快速、稳定

2. **Cloudflare Stream**
   - 专业视频托管
   - 付费服务

3. **Bunny CDN**
   - 成本效益高
   - 全球CDN

---

## ✅ 当前资产状态 / Current Asset Status

| 资产类型 | 状态 | 来源 | 数量 |
|---------|------|------|------|
| Logo SVG | ✅ 已创建 | 本地 `/public/logo.svg` | 1 |
| OG Image | ✅ 已创建 | 本地 `/public/og-image.svg` | 1 |
| Trial Images | ✅ 已配置 | Unsplash CDN | 4 |
| Hero Posters | ✅ 已配置 | Unsplash CDN | 3 |
| Showcase Posters | ✅ 已配置 | Unsplash CDN | 6 |
| Hero Videos | ✅ 已配置 | Google Cloud Storage | 3 |
| Showcase Videos | ✅ 已配置 | Google Cloud Storage | 6 |

**总计**: 24 个资产已配置 ✅

---

## 🚀 性能优化 / Performance Optimization

### 已实现的优化
1. ✅ Next.js `<Image>` 组件自动优化
2. ✅ 响应式图片尺寸 (`sizes` 属性)
3. ✅ Lazy loading (懒加载)
4. ✅ 视频 poster 预览图
5. ✅ CDN 加速

### 进一步优化建议
- [ ] 添加图片占位符 (Blur placeholder)
- [ ] 实现渐进式图片加载
- [ ] 使用 WebP 格式 (浏览器支持)
- [ ] 添加视频缓存策略
- [ ] 实现图片懒加载阈值调优

---

## 📖 相关文档 / Related Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Google Sample Videos](https://goo.gle/demo-videos)
- [Web Video Best Practices](https://web.dev/fast/)

---

**最后更新**: 2025-10-15
**维护人员**: Development Team
**状态**: ✅ 生产就绪 (Production Ready)
