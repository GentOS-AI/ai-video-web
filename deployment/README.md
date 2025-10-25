# 📦 Video4Ads.com - 部署文档中心

**最后更新**: 2025-10-25

---

## 📚 文档索引

### ⭐⭐⭐ 运维工程师必读

**[DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** - 标准化部署流程 (Standard Operating Procedure)

完整的部署操作手册，包含：
- ✅ 详细的部署前准备清单
- ✅ 10个阶段的部署步骤（含预期输出）
- ✅ 全面的故障排除指南
- ✅ 紧急回滚流程
- ✅ 常见问题及解决方案
- ✅ 应急联系和升级流程

**适合**: 独立运维工程师、新手运维、生产部署

---

### ⭐ 推荐新手阅读

**[DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md)** - 快速开始指南

快速部署指南（如果存在），适合熟悉基础运维的工程师。

**适合**: 有基础经验的运维工程师、快速部署

---

### 📖 技术参考文档

**[DEPLOYMENT.md](DEPLOYMENT.md)** - 完整技术文档

详细的技术说明和架构文档，包含：
- 系统架构图
- 首次部署配置
- Nginx/PM2/PostgreSQL配置
- SSL证书配置
- 性能优化建议
- 安全最佳实践

**适合**: 系统管理员、架构师、技术负责人

---

### 🔧 部署脚本

**[deploy-production.sh](deploy-production.sh)** - 自动化部署脚本

在服务器上执行的自动化部署脚本，包含：
- 服务停止和清理
- 代码拉取
- 依赖安装
- 前端构建
- 服务启动
- 健康检查

**使用方法**:
```bash
ssh -p3200 root@23.95.254.67
cd /root/ai-video-web
bash deployment/deploy-production.sh
```

---

## 🚀 快速导航

### 我是运维工程师，需要部署新版本
👉 阅读 **[DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** 并按步骤执行

### 我是开发者，想了解部署流程
👉 阅读 **[DEPLOYMENT.md](DEPLOYMENT.md)** 了解整体架构

### 遇到部署问题
👉 查看 **[DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** 第4章"常见问题处理"

### 需要回滚版本
👉 查看 **[DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** 第5章"回滚流程"

---

## 📋 部署检查清单

**部署前**:
- [ ] 阅读了 DEPLOYMENT_SOP.md
- [ ] 代码已推送到 GitHub
- [ ] 本地构建测试通过
- [ ] 已通知团队

**部署中**:
- [ ] 创建了备份
- [ ] 拉取了最新代码
- [ ] 构建成功
- [ ] 服务已启动

**部署后**:
- [ ] 网站可访问
- [ ] API正常响应
- [ ] 关键功能测试通过
- [ ] 日志无严重错误

---

## 🆘 紧急联系

### 服务器信息
```
主机: 23.95.254.67
SSH端口: 3200
用户: root
项目路径: /root/ai-video-web
域名: https://video4ads.com
```

### 快速命令
```bash
# SSH登录
ssh -p3200 root@23.95.254.67

# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all
```

### 问题升级
如果遇到无法解决的问题：
1. 查看 DEPLOYMENT_SOP.md 第6章"应急联系"
2. 联系技术负责人
3. 必要时执行回滚

---

## 📊 文档版本

| 文档 | 版本 | 更新日期 | 说明 |
|------|------|----------|------|
| DEPLOYMENT_SOP.md | 1.0.0 | 2025-10-25 | 初始版本 |
| DEPLOYMENT.md | 3.0.0 | 2025-10-24 | 更新PostgreSQL配置 |
| deploy-production.sh | 1.0.0 | 2025-10-25 | 自动化部署脚本 |

---

## 🔗 相关资源

- [项目README](../README.md) - 项目总览
- [后端README](../backend/README.md) - 后端API文档
- [CLAUDE.md](../CLAUDE.md) - 开发指南

---

**维护团队**: Video4Ads DevOps
**最后审核**: 2025-10-25
