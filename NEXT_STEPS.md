# 国际化实施 - 下一步工作

## ✅ 已完成（约70%）

1. ✅ 基础设施100%完成
   - next-intl依赖安装
   - 配置文件创建
   - 中间件设置
   - 路由迁移

2. ✅ 翻译文件100%完成
   - en.json (英文)
   - zh.json (简体中文)
   - zh-TW.json (繁体中文)

3. ✅ Navbar组件准备工作完成
   - 已添加import (useTranslations, useParams, useRouter等)
   - 已添加状态管理 (isLangMenuOpen, langMenuRef)
   - 已添加switchLanguage函数
   - 已添加languages数组
   - 已添加clickOutside handler

## ⏳ 下一步工作（约30%）

### 1. 完成Navbar语言切换器UI (30分钟)

需要在 `components/Navbar.tsx` 中添加：

**桌面端语言切换器** (插入到Pricing按钮之后，用户头像之前):

```tsx
{/* Language Switcher - Desktop */}
<div className="relative" ref={langMenuRef}>
  <button
    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200"
    aria-label="Switch language"
  >
    <Languages className="w-5 h-5 text-gray-600" />
    <span className="text-xl">{localeFlags[locale]}</span>
  </button>

  {/* Language Dropdown Menu */}
  <AnimatePresence>
    {isLangMenuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 ${
              locale === lang.code ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.name}</span>
            {locale === lang.code && (
              <Check className="w-4 h-4 ml-auto text-purple-600" />
            )}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

**移动端语言切换器** (在移动菜单中，Pricing按钮之后):

```tsx
{/* Language Switcher - Mobile */}
<div className="border-t border-gray-200 pt-3 mt-3">
  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
    Language / 语言
  </p>
  <div className="space-y-1">
    {languages.map((lang) => (
      <button
        key={lang.code}
        onClick={() => switchLanguage(lang.code)}
        className={`w-full px-4 py-2 text-sm hover:bg-purple-bg rounded-lg transition-colors flex items-center gap-3 ${
          locale === lang.code ? 'bg-purple-bg text-purple-600 font-semibold' : 'text-text-secondary'
        }`}
      >
        <span className="text-2xl">{lang.flag}</span>
        <span>{lang.name}</span>
        {locale === lang.code && (
          <Check className="w-4 h-4 ml-auto text-purple-600" />
        )}
      </button>
    ))}
  </div>
</div>
```

### 2. 替换Navbar硬编码文案为翻译 (15分钟)

使用t()替换以下文案：

```tsx
// 导航链接
<Link href={`/${locale}`}>{t('home')}</Link>
<Link href={`/${locale}/about`}>{t('about')}</Link>
<button onClick={handlePricingClick}>{t('pricing')}</button>

// 用户菜单
<span>Credits: {t('credits', { count: user.credits.toFixed(0) })}</span>
<span>{t('myVideos')}</span>
<span>{t('logout')}</span>

// 登录按钮
<Button onClick={handleGoogleLogin}>{t('login')}</Button>
```

### 3. 测试Navbar (10分钟)

```bash
npm run build
npm run dev
```

访问:
- http://localhost:3000 (应自动跳转到 /en 或 /zh)
- http://localhost:3000/zh
- http://localhost:3000/zh-TW

测试：
- ✓ 语言切换器显示正常
- ✓ 点击切换语言后URL变化
- ✓ 页面不刷新情况下语言切换
- ✓ 移动端语言切换器正常

### 4. 后续组件改造优先级

**P0 - 必须完成:**
- [ ] Footer.tsx (简单，15分钟)
- [ ] HeroSection.tsx (复杂，60分钟)
- [ ] PricingModal.tsx (中等，30分钟)

**P1 - 重要:**
- [ ] ShowcaseSection.tsx
- [ ] NotificationContext.tsx (Toast国际化)

**P2 - 可选:**
- [ ] CreditsModal.tsx
- [ ] VideoCard.tsx
- [ ] 其他小组件

## 🎯 关键代码定位

**Navbar.tsx需要编辑的位置:**
- 第158行: Pricing按钮之后 → 插入桌面端语言切换器
- 第276行: Pricing按钮之后 → 插入移动端语言切换器

**需要替换的文案位置:**
- 第114行: "Home"
- 第121行: "About"
- 第126行: "Pricing"
- 第168-169行: Credits显示
- 第205行: "Media Center"  
- 第212行: "Logout"
- 第225行: "Login" (桌面端)
- 第262-270行: 移动端导航文案
- 第324行: "Media Center" (移动端)
- 第331行: "Logout" (移动端)
- 第344行: "Login" (移动端)

## 💡 快速命令

```bash
# 构建测试
npm run build

# 开发服务器
npm run dev

# 访问不同语言
open http://localhost:3000
open http://localhost:3000/zh
open http://localhost:3000/zh-TW
```

---

**创建时间**: 2025-10-17 13:30  
**当前进度**: 70%
**剩余时间**: 约2-3小时
