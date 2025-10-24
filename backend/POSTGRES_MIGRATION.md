# 🚀 PostgreSQL 迁移快速参考

> **目标**: 将生产环境从 SQLite 迁移到 PostgreSQL
> **状态**: ✅ 配置完成,等待部署
> **创建日期**: 2025-10-24

---

## 📦 新增文件清单

### 1. 数据迁移脚本
📄 **`backend/scripts/migrate_sqlite_to_postgres.py`**
- 功能: 自动迁移 SQLite 数据到 PostgreSQL
- 特性:
  - 自动检测表结构
  - 保持数据完整性
  - 重置序列 (auto_increment)
  - 验证迁移结果

### 2. 自动化安装脚本
📄 **`deployment/scripts/setup-postgres.sh`**
- 功能: 一键安装和配置 PostgreSQL
- 特性:
  - 安装 PostgreSQL 14
  - 创建数据库和用户
  - 配置连接池和安全设置
  - 设置自动备份

### 3. 完整配置指南
📄 **`docs/POSTGRES_SETUP_GUIDE.md`**
- 功能: 详细的部署文档
- 内容:
  - 安装步骤
  - 数据迁移
  - 性能优化
  - 故障排除
  - 备份恢复

---

## 🔧 修改文件清单

### 1. 配置模板
📝 **`backend/.env.production.template`**
```diff
- DATABASE_URL=sqlite:///./aivideo.db
+ DATABASE_URL=postgresql://aivideo_user:your-secure-password@localhost:5432/aivideo_prod

+ # Database Connection Pool Settings (PostgreSQL only)
+ # DB_POOL_SIZE=5
+ # DB_MAX_OVERFLOW=10
+ # DB_POOL_PRE_PING=true
+ # DB_POOL_RECYCLE=3600
```

### 2. 应用配置
📝 **`backend/app/core/config.py`**
```diff
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./aivideo.db"

+   # Database Connection Pool Settings (PostgreSQL only)
+   DB_POOL_SIZE: int = 5
+   DB_MAX_OVERFLOW: int = 10
+   DB_POOL_PRE_PING: bool = True
+   DB_POOL_RECYCLE: int = 3600
```

### 3. 数据库引擎
📝 **`backend/app/database.py`**
```diff
- engine = create_engine(
-     settings.DATABASE_URL,
-     connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
-     echo=settings.DEBUG,
- )

+ is_postgres = settings.DATABASE_URL.startswith("postgresql://")
+
+ if is_postgres:
+     # PostgreSQL configuration with connection pooling
+     engine = create_engine(
+         settings.DATABASE_URL,
+         pool_size=settings.DB_POOL_SIZE,
+         max_overflow=settings.DB_MAX_OVERFLOW,
+         pool_pre_ping=settings.DB_POOL_PRE_PING,
+         pool_recycle=settings.DB_POOL_RECYCLE,
+         echo=settings.DEBUG,
+     )
+ else:
+     # SQLite configuration
+     engine = create_engine(
+         settings.DATABASE_URL,
+         connect_args={"check_same_thread": False},
+         echo=settings.DEBUG,
+     )
```

---

## 🎯 部署步骤 (生产服务器)

### 方法 A: 自动化部署 (推荐) ⭐

```bash
# SSH 登录服务器
ssh root@23.95.254.67 -p3200

# 进入项目目录
cd /root/ai-video-web

# 拉取最新代码
git pull

# 运行自动化安装脚本
sudo ./deployment/scripts/setup-postgres.sh
```

**脚本会提示输入**:
1. PostgreSQL 用户密码 (设置强密码)
2. 是否创建表结构 (选择 Y)
3. 是否设置自动备份 (选择 Y)

**完成后会显示**:
- ✅ 数据库连接字符串
- ✅ 下一步操作指南

---

### 方法 B: 手动部署

#### 步骤 1: 安装 PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 步骤 2: 创建数据库

```bash
sudo -u postgres psql

CREATE DATABASE aivideo_prod;
CREATE USER aivideo_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aivideo_prod TO aivideo_user;
GRANT ALL ON SCHEMA public TO aivideo_user;

\q
```

#### 步骤 3: 更新配置文件

```bash
cd /root/ai-video-web/backend
nano .env

# 修改 DATABASE_URL
DATABASE_URL=postgresql://aivideo_user:your_password@localhost:5432/aivideo_prod
```

#### 步骤 4: 初始化表结构

```bash
cd /root/ai-video-web/backend
source venv/bin/activate
python scripts/init_db.py
```

#### 步骤 5: 迁移数据 (可选)

```bash
# 备份 SQLite
cp aivideo.db backups/aivideo_backup_$(date +%Y%m%d).db

# 设置环境变量
export POSTGRES_URL="postgresql://aivideo_user:your_password@localhost:5432/aivideo_prod"
export SQLITE_DB_PATH="./aivideo.db"

# 运行迁移
python scripts/migrate_sqlite_to_postgres.py
```

#### 步骤 6: 重启服务

```bash
pm2 restart backend
```

---

## ✅ 验证检查清单

### 1. 数据库连接测试

```bash
cd /root/ai-video-web/backend

python -c "
from app.database import engine
print('✅ Database URL:', engine.url)
"
```

### 2. 表结构验证

```bash
PGPASSWORD='your_password' psql -U aivideo_user -d aivideo_prod -h localhost

\dt  -- 列出所有表
\d users  -- 查看 users 表结构
\q
```

### 3. API 测试

```bash
# 重启后端
pm2 restart backend

# 测试健康检查
curl https://adsvideo.co/api/v1/health

# 测试数据查询
curl https://adsvideo.co/api/v1/showcase/videos

# 查看日志
pm2 logs backend --lines 50
```

### 4. 数据验证 (如果进行了迁移)

```bash
# 检查用户数量
PGPASSWORD='your_password' psql -U aivideo_user -d aivideo_prod -h localhost -c "SELECT COUNT(*) FROM users;"

# 检查视频数量
PGPASSWORD='your_password' psql -U aivideo_user -d aivideo_prod -h localhost -c "SELECT COUNT(*) FROM videos;"
```

---

## 🔄 回滚方案 (出现问题时)

```bash
# 1. 停止后端
pm2 stop backend

# 2. 恢复 SQLite 配置
cd /root/ai-video-web/backend
nano .env

# 改回:
DATABASE_URL=sqlite:///./aivideo.db

# 3. 恢复备份 (如果需要)
cp backups/aivideo_backup_YYYYMMDD.db ./aivideo.db

# 4. 重启后端
pm2 restart backend

# 5. 验证
curl https://adsvideo.co/api/v1/health
```

---

## 📊 性能对比

### SQLite vs PostgreSQL

| 指标 | SQLite | PostgreSQL | 提升 |
|------|--------|-----------|------|
| **并发连接** | 1-10 | 200+ | 20x+ |
| **写入性能** | 低 | 高 | 10x+ |
| **事务性能** | 中 | 高 | 5x+ |
| **查询性能** | 中 | 高 | 3x+ |
| **数据完整性** | 基础 | 完整 | ✅ |
| **扩展性** | 无 | 主从复制 | ✅ |

### 预期收益

- ✅ **响应速度**: 查询响应时间减少 50%
- ✅ **并发能力**: 支持 100+ 并发用户
- ✅ **稳定性**: ACID 事务保证数据一致性
- ✅ **扩展性**: 支持水平扩展和读写分离

---

## 📚 相关文档

1. **详细配置指南**: [docs/POSTGRES_SETUP_GUIDE.md](../docs/POSTGRES_SETUP_GUIDE.md)
2. **数据库 Schema**: [backend/DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. **部署指南**: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
4. **快速开始**: [docs/DEPLOY_QUICK_START.md](../docs/DEPLOY_QUICK_START.md)

---

## 🆘 常见问题

### Q1: 迁移后数据丢失怎么办?

**A**: 迁移脚本会验证数据完整性。如果不匹配,会提示:
```
⚠️  Some tables have mismatched counts - Please verify manually
```

手动验证:
```bash
# SQLite 行数
sqlite3 aivideo.db "SELECT COUNT(*) FROM users;"

# PostgreSQL 行数
PGPASSWORD='pwd' psql -U aivideo_user -d aivideo_prod -h localhost -c "SELECT COUNT(*) FROM users;"
```

### Q2: 连接数据库失败?

**A**: 检查以下几点:
1. PostgreSQL 服务是否运行: `sudo systemctl status postgresql`
2. 密码是否正确: 在 `.env` 中确认
3. 用户权限是否足够: 运行 `GRANT ALL` 命令
4. 防火墙是否阻止: `sudo ufw status`

### Q3: 性能没有提升?

**A**: 优化步骤:
1. 确认连接池已启用 (查看 `database.py`)
2. 运行 `VACUUM ANALYZE` 更新统计信息
3. 检查慢查询日志
4. 调整 PostgreSQL 配置 (见 `POSTGRES_SETUP_GUIDE.md`)

### Q4: 如何监控数据库性能?

**A**: 使用以下命令:
```bash
# 查看活跃连接
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity WHERE datname='aivideo_prod';"

# 查看表大小
psql -U postgres -d aivideo_prod -c "SELECT pg_size_pretty(pg_total_relation_size('users'));"

# 查看慢查询
tail -f /var/log/postgresql/postgresql-14-main.log | grep "duration:"
```

---

## 📝 下一步优化建议

### 短期 (1-2周)
- [ ] 监控数据库性能指标
- [ ] 优化慢查询
- [ ] 配置 pgAdmin 或 DBeaver 图形化管理

### 中期 (1-3月)
- [ ] 实施读写分离 (主从复制)
- [ ] 配置 PgBouncer 连接池
- [ ] 使用 Redis 缓存热点数据

### 长期 (3-6月)
- [ ] 数据库分片 (Sharding)
- [ ] 迁移到 PostgreSQL 集群
- [ ] 使用 TimescaleDB 处理时序数据

---

## 🎉 完成!

恭喜!您已成功为项目配置 PostgreSQL 支持。

**遇到问题?**
- 📧 技术支持: support@adsvideo.co
- 📚 文档中心: [docs/POSTGRES_SETUP_GUIDE.md](../docs/POSTGRES_SETUP_GUIDE.md)
- 🐛 提交 Issue: https://github.com/GentOS-AI/ai-video-web/issues

**祝部署顺利!** 🚀
