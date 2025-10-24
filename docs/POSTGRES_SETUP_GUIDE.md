# 🐘 PostgreSQL 生产环境配置指南

**最后更新**: 2025-10-24
**适用环境**: 生产服务器 (Ubuntu 20.04+)
**预计时间**: 30-60 分钟

---

## 📋 目录

1. [概述](#概述)
2. [前置条件](#前置条件)
3. [快速开始](#快速开始)
4. [详细步骤](#详细步骤)
5. [数据迁移](#数据迁移)
6. [验证测试](#验证测试)
7. [故障排除](#故障排除)
8. [性能优化](#性能优化)
9. [备份恢复](#备份恢复)

---

## 概述

### 为什么选择 PostgreSQL?

✅ **相比 SQLite 的优势**:
- 并发连接支持 (10 → 200+)
- 事务性能提升 (10x+)
- ACID 完整性保证
- JSONB 字段支持
- 全文搜索
- 主从复制
- 生产级稳定性

✅ **相比 MongoDB 的优势**:
- 成熟的 ORM 生态 (SQLAlchemy)
- 强事务支持
- 外键约束
- 更低的学习成本
- 更简单的运维

---

## 前置条件

### 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+
- **内存**: 最少 1GB (推荐 2GB+)
- **磁盘**: 10GB 可用空间
- **权限**: Root 或 sudo 权限

### 已安装软件

```bash
# 检查
python3 --version  # Python 3.9+
pip3 --version
git --version
```

---

## 快速开始

### 方法 1: 自动安装 (推荐)

```bash
# SSH 登录生产服务器
ssh root@23.95.254.67 -p3200

# 进入项目目录
cd /root/ai-video-web

# 运行安装脚本
sudo ./deployment/scripts/setup-postgres.sh
```

**脚本会自动完成**:
1. ✅ 安装 PostgreSQL 14
2. ✅ 创建数据库 `aivideo_prod`
3. ✅ 创建用户 `aivideo_user`
4. ✅ 配置访问控制
5. ✅ 设置连接池
6. ✅ 创建表结构
7. ✅ 配置自动备份

**完成后会显示连接字符串**:
```
postgresql://aivideo_user:your_password@localhost:5432/aivideo_prod
```

---

### 方法 2: 手动安装

#### 步骤 1: 安装 PostgreSQL

```bash
# 更新包列表
sudo apt update

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证安装
sudo systemctl status postgresql
psql --version
```

#### 步骤 2: 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL shell 中执行:
CREATE DATABASE aivideo_prod;
CREATE USER aivideo_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE aivideo_prod TO aivideo_user;

-- PostgreSQL 15+ 需要额外权限
GRANT ALL ON SCHEMA public TO aivideo_user;

-- 退出
\q
```

#### 步骤 3: 配置连接

```bash
# 编辑访问控制文件
sudo nano /etc/postgresql/14/main/pg_hba.conf

# 添加以下行 (在 # IPv4 local connections 下方):
local   aivideo_prod    aivideo_user                    md5
host    aivideo_prod    aivideo_user    127.0.0.1/32    md5

# 保存退出 (Ctrl+X, Y, Enter)

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

#### 步骤 4: 测试连接

```bash
# 测试连接
PGPASSWORD='your_password' psql -U aivideo_user -d aivideo_prod -h localhost

# 如果成功,会看到:
# aivideo_prod=>

# 退出
\q
```

---

## 详细步骤

### 1. 更新后端配置文件

**编辑**: `/root/ai-video-web/backend/.env`

```bash
cd /root/ai-video-web/backend
nano .env
```

**修改以下配置**:

```env
# ========================================
# Database Configuration - UPDATED
# ========================================
DATABASE_URL=postgresql://aivideo_user:your_password@localhost:5432/aivideo_prod

# ========================================
# Environment Settings
# ========================================
DEBUG=false
BASE_URL=https://adsvideo.co

# ========================================
# CORS Settings
# ========================================
ALLOWED_ORIGINS=["https://adsvideo.co","https://www.adsvideo.co"]
```

### 2. 初始化数据库表结构

```bash
cd /root/ai-video-web/backend

# 激活虚拟环境
source venv/bin/activate

# 运行初始化脚本
python scripts/init_db.py
```

**预期输出**:
```
✅ Database connection successful
✅ Created table: users
✅ Created table: videos
✅ Created table: showcase_videos
✅ Created table: trial_images
✅ Created table: uploaded_images
✅ Created table: enhancement_tasks
🎉 Database initialization complete!
```

### 3. 验证表结构

```bash
# 连接数据库
PGPASSWORD='your_password' psql -U aivideo_user -d aivideo_prod -h localhost

# 列出所有表
\dt

# 查看 users 表结构
\d users

# 退出
\q
```

---

## 数据迁移

### 从 SQLite 迁移到 PostgreSQL

#### 前提条件

1. ✅ PostgreSQL 已安装并运行
2. ✅ 数据库和表已创建
3. ✅ SQLite 数据库文件存在

#### 迁移步骤

```bash
cd /root/ai-video-web/backend

# 1. 备份 SQLite 数据库
cp aivideo.db backups/aivideo_backup_$(date +%Y%m%d_%H%M%S).db

# 2. 设置环境变量
export POSTGRES_URL="postgresql://aivideo_user:your_password@localhost:5432/aivideo_prod"
export SQLITE_DB_PATH="./aivideo.db"

# 3. 运行迁移脚本
python scripts/migrate_sqlite_to_postgres.py
```

#### 迁移输出示例

```
========================================
🚀 SQLite to PostgreSQL Migration Tool
========================================

✅ SQLite database found: ./aivideo.db (212.50 KB)
✅ PostgreSQL URL: postgresql://aivideo_user:****@localhost:5432/aivideo_prod

========================================
Testing Database Connections
========================================
✅ SQLite connection successful
✅ PostgreSQL connection successful

========================================
Migrating Data
========================================
ℹ️  Migrating table: users
✅ Migrated 15 rows to users
ℹ️  Migrating table: videos
✅ Migrated 42 rows to videos

========================================
Verifying Migration
========================================
✅ users: 15 rows (✓ match)
✅ videos: 42 rows (✓ match)

✅ All table row counts match - Migration successful!
```

---

## 验证测试

### 1. 测试数据库连接

```bash
cd /root/ai-video-web/backend

python -c "
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text('SELECT version()')).scalar()
    print('✅ PostgreSQL version:', result)
"
```

### 2. 测试 API

```bash
# 重启后端服务
pm2 restart backend

# 测试健康检查
curl https://adsvideo.co/api/v1/health

# 测试数据库查询
curl https://adsvideo.co/api/v1/showcase/videos
```

### 3. 测试用户注册和登录

```bash
# 访问前端
# https://adsvideo.co

# 尝试 Google 登录
# 查看后端日志
pm2 logs backend
```

---

## 故障排除

### 问题 1: 连接被拒绝

**错误信息**:
```
psql: error: connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
```

**解决方案**:
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 如果未运行,启动它
sudo systemctl start postgresql

# 检查端口是否监听
sudo netstat -plnt | grep 5432
```

### 问题 2: 认证失败

**错误信息**:
```
psql: error: password authentication failed for user "aivideo_user"
```

**解决方案**:
```bash
# 重置密码
sudo -u postgres psql

ALTER USER aivideo_user WITH PASSWORD 'new_password';
\q

# 更新 .env 文件中的密码
nano /root/ai-video-web/backend/.env
```

### 问题 3: 权限不足

**错误信息**:
```
ERROR: permission denied for schema public
```

**解决方案**:
```bash
sudo -u postgres psql -d aivideo_prod

GRANT ALL ON SCHEMA public TO aivideo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aivideo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aivideo_user;

\q
```

### 问题 4: 迁移脚本失败

**错误信息**:
```
IntegrityError: duplicate key value violates unique constraint
```

**解决方案**:
```bash
# 这是正常的,表示数据已存在
# 脚本会自动跳过重复记录

# 如果需要重新迁移,先清空表:
sudo -u postgres psql -d aivideo_prod

TRUNCATE users, videos, showcase_videos, trial_images, uploaded_images, enhancement_tasks CASCADE;

\q

# 重新运行迁移脚本
python scripts/migrate_sqlite_to_postgres.py
```

---

## 性能优化

### 1. 连接池配置

**已自动配置** (在 `app/database.py`):

```python
# PostgreSQL 连接池设置
pool_size=5           # 保持5个常驻连接
max_overflow=10       # 最多额外10个溢出连接
pool_pre_ping=True    # 连接前检查健康状态
pool_recycle=3600     # 1小时回收连接
```

### 2. 查询优化

**索引已创建** (自动生成):

```sql
-- users 表索引
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);

-- videos 表索引
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at);
```

### 3. PostgreSQL 性能调优

**编辑配置文件**:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**推荐设置** (根据服务器内存调整):

```ini
# 内存设置 (假设 4GB RAM)
shared_buffers = 1GB              # 25% of RAM
effective_cache_size = 3GB        # 75% of RAM
maintenance_work_mem = 256MB      # For VACUUM, CREATE INDEX
work_mem = 16MB                   # Per operation

# 连接设置
max_connections = 200             # 最大连接数

# 写入性能
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# 查询规划
random_page_cost = 1.1            # SSD 优化
effective_io_concurrency = 200    # SSD 优化
```

**应用配置**:

```bash
sudo systemctl restart postgresql
```

---

## 备份恢复

### 自动备份 (推荐)

**已通过安装脚本配置**:

```bash
# 查看 cron 任务
crontab -l

# 应该看到:
# 0 2 * * * /root/ai-video-web/deployment/scripts/backup-database.sh
```

**备份位置**:
- `/root/backups/postgres/aivideo_prod_YYYYMMDD_HHMMSS.sql.gz`

**保留策略**:
- 每日备份保留 7 天
- 每周备份保留 30 天

### 手动备份

```bash
# 备份数据库
PGPASSWORD='your_password' pg_dump -U aivideo_user -d aivideo_prod -h localhost | gzip > backup_$(date +%Y%m%d).sql.gz

# 验证备份
gunzip -c backup_$(date +%Y%m%d).sql.gz | head -20
```

### 恢复数据库

```bash
# 1. 停止后端服务
pm2 stop backend

# 2. 删除现有数据库
sudo -u postgres psql
DROP DATABASE IF EXISTS aivideo_prod;
CREATE DATABASE aivideo_prod OWNER aivideo_user;
\q

# 3. 恢复备份
gunzip -c backup_YYYYMMDD.sql.gz | PGPASSWORD='your_password' psql -U aivideo_user -d aivideo_prod -h localhost

# 4. 重启后端服务
pm2 restart backend
```

---

## 监控和维护

### 1. 查看数据库大小

```bash
sudo -u postgres psql -d aivideo_prod

SELECT pg_size_pretty(pg_database_size('aivideo_prod')) AS database_size;

\q
```

### 2. 查看表行数

```bash
sudo -u postgres psql -d aivideo_prod

SELECT
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

\q
```

### 3. 查看活跃连接

```bash
sudo -u postgres psql

SELECT count(*) FROM pg_stat_activity WHERE datname = 'aivideo_prod';

\q
```

### 4. 定期维护

**创建维护脚本**: `/root/maintenance/postgres_maintenance.sh`

```bash
#!/bin/bash
# PostgreSQL 维护脚本

DB_NAME="aivideo_prod"
DB_USER="aivideo_user"

echo "🧹 Starting PostgreSQL maintenance..."

# 1. VACUUM ANALYZE (清理和分析)
sudo -u postgres psql -d $DB_NAME -c "VACUUM ANALYZE;"

# 2. REINDEX (重建索引)
sudo -u postgres psql -d $DB_NAME -c "REINDEX DATABASE $DB_NAME;"

# 3. 更新统计信息
sudo -u postgres psql -d $DB_NAME -c "ANALYZE;"

echo "✅ Maintenance complete!"
```

**添加 cron 任务** (每周日凌晨3点):

```bash
crontab -e

# 添加:
0 3 * * 0 /root/maintenance/postgres_maintenance.sh >> /var/log/postgres-maintenance.log 2>&1
```

---

## 安全建议

### 1. 密码安全

```bash
# 生成强密码
openssl rand -base64 32
```

### 2. 连接限制

**编辑**: `/etc/postgresql/14/main/pg_hba.conf`

```
# 只允许本地连接
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5

# 禁止远程连接 (除非必要)
# host    all             all             0.0.0.0/0               reject
```

### 3. 防火墙配置

```bash
# PostgreSQL 端口只监听本地
sudo ufw status

# 确保 5432 端口未对外开放
sudo ufw deny 5432/tcp
```

---

## 附录

### A. 常用命令速查

```bash
# 连接数据库
PGPASSWORD='password' psql -U aivideo_user -d aivideo_prod -h localhost

# 列出所有数据库
\l

# 列出所有表
\dt

# 查看表结构
\d table_name

# 执行 SQL 文件
\i /path/to/file.sql

# 导出查询结果到 CSV
\copy (SELECT * FROM users) TO '/tmp/users.csv' WITH CSV HEADER;

# 退出
\q
```

### B. 环境变量

```bash
# 永久设置
echo 'export PGPASSWORD="your_password"' >> ~/.bashrc
source ~/.bashrc

# 临时设置
export PGPASSWORD='your_password'
```

### C. 连接字符串格式

```
postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]

示例:
postgresql://aivideo_user:password123@localhost:5432/aivideo_prod
```

---

## 技术支持

### 遇到问题?

1. **查看日志**:
   ```bash
   # PostgreSQL 日志
   sudo tail -f /var/log/postgresql/postgresql-14-main.log

   # 后端日志
   pm2 logs backend
   ```

2. **检查状态**:
   ```bash
   sudo systemctl status postgresql
   pm2 status
   ```

3. **运行健康检查**:
   ```bash
   /root/ai-video-web/deployment/scripts/health-check.sh
   ```

### 联系方式

- 📧 Email: support@adsvideo.co
- 📚 Documentation: https://docs.adsvideo.co
- 🐛 Issues: https://github.com/GentOS-AI/ai-video-web/issues

---

## 更新日志

- **2025-10-24**: 初始版本
  - PostgreSQL 14 安装指南
  - 自动化安装脚本
  - 数据迁移工具
  - 性能优化建议

---

**祝您部署顺利!** 🎉
