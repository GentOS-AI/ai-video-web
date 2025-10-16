#!/bin/bash

# 🧪 Mock Sora 2 API 测试 - 服务启动脚本
# 此脚本帮助您启动所有必需的服务

echo ""
echo "============================================================"
echo "🧪 Mock Sora 2 API 测试环境启动"
echo "============================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/Users/lzx/lin/github/ai-video-web"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "📂 项目目录: $PROJECT_ROOT"
echo ""

# 1. 检查 Redis
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  检查 Redis 服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v redis-server &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis 已运行${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis 已安装但未运行${NC}"
        echo ""
        echo "请在 终端1 中运行:"
        echo -e "${BLUE}redis-server${NC}"
        echo ""
    fi
else
    echo -e "${RED}❌ Redis 未安装${NC}"
    echo ""
    echo "请安装 Redis:"
    echo -e "${BLUE}brew install redis${NC}"
    echo ""
    echo "然后在 终端1 中运行:"
    echo -e "${BLUE}redis-server${NC}"
    echo ""
fi

# 2. 检查 Celery Worker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  检查 Celery Worker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ps aux | grep -v grep | grep "celery.*worker" &> /dev/null; then
    echo -e "${GREEN}✅ Celery Worker 已运行${NC}"
else
    echo -e "${YELLOW}⚠️  Celery Worker 未运行${NC}"
    echo ""
    echo "请在 终端2 中运行:"
    echo -e "${BLUE}cd $BACKEND_DIR${NC}"
    echo -e "${BLUE}celery -A app.core.celery_app worker --loglevel=info${NC}"
    echo ""
fi

# 3. 检查 FastAPI
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  检查 FastAPI (Uvicorn)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ps aux | grep -v grep | grep "uvicorn app.main" &> /dev/null; then
    echo -e "${GREEN}✅ FastAPI 已运行 (端口 8000)${NC}"
    echo ""
    echo "需要重启以加载新配置:"
    echo -e "${BLUE}pkill -f 'uvicorn app.main'${NC}"
    echo -e "${BLUE}cd $BACKEND_DIR && uvicorn app.main:app --reload --port 8000${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  FastAPI 未运行${NC}"
    echo ""
    echo "请在 终端3 中运行:"
    echo -e "${BLUE}cd $BACKEND_DIR${NC}"
    echo -e "${BLUE}uvicorn app.main:app --reload --port 8000${NC}"
    echo ""
fi

# 4. 检查 Next.js
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  检查 Next.js 前端"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ps aux | grep -v grep | grep "next dev" &> /dev/null; then
    echo -e "${GREEN}✅ Next.js 已运行 (端口 8080)${NC}"
else
    echo -e "${YELLOW}⚠️  Next.js 未运行${NC}"
    echo ""
    echo "请在 终端4 中运行:"
    echo -e "${BLUE}cd $PROJECT_ROOT${NC}"
    echo -e "${BLUE}npm run dev -- -p 8080${NC}"
    echo ""
fi

# 5. 检查配置文件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  检查配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$BACKEND_DIR/.env" ]; then
    if grep -q "USE_MOCK_SORA=true" "$BACKEND_DIR/.env"; then
        echo -e "${GREEN}✅ Mock 模式已启用${NC}"
    else
        echo -e "${YELLOW}⚠️  Mock 模式未启用${NC}"
        echo ""
        echo "请检查 $BACKEND_DIR/.env 文件:"
        echo -e "${BLUE}USE_MOCK_SORA=true${NC}"
    fi

    if grep -q "REDIS_URL=" "$BACKEND_DIR/.env"; then
        echo -e "${GREEN}✅ Redis URL 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis URL 未配置${NC}"
    fi
else
    echo -e "${RED}❌ .env 文件不存在${NC}"
fi

# 6. 检查示例视频
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  检查示例视频文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$BACKEND_DIR/public/sample-video.mp4" ]; then
    FILE_SIZE=$(ls -lh "$BACKEND_DIR/public/sample-video.mp4" | awk '{print $5}')
    echo -e "${GREEN}✅ 示例视频已准备 (大小: $FILE_SIZE)${NC}"
else
    echo -e "${RED}❌ 示例视频不存在${NC}"
    echo ""
    echo "示例视频应该已经下载，如果缺失，请手动下载:"
    echo -e "${BLUE}cd $BACKEND_DIR${NC}"
    echo -e "${BLUE}curl -o public/sample-video.mp4 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'${NC}"
fi

# 总结
echo ""
echo "============================================================"
echo "📋 启动总结"
echo "============================================================"
echo ""
echo "需要启动的服务（按顺序）:"
echo ""
echo "终端1️⃣  - Redis Server"
echo "  ${BLUE}redis-server${NC}"
echo ""
echo "终端2️⃣  - Celery Worker"
echo "  ${BLUE}cd $BACKEND_DIR${NC}"
echo "  ${BLUE}celery -A app.core.celery_app worker --loglevel=info${NC}"
echo ""
echo "终端3️⃣  - FastAPI (需要重启)"
echo "  ${BLUE}cd $BACKEND_DIR${NC}"
echo "  ${BLUE}pkill -f 'uvicorn app.main' && uvicorn app.main:app --reload --port 8000${NC}"
echo ""
echo "终端4️⃣  - Next.js (已运行)"
echo "  ${GREEN}✅ 已在端口 8080 运行${NC}"
echo ""
echo "============================================================"
echo "🧪 开始测试"
echo "============================================================"
echo ""
echo "1. 访问: ${BLUE}http://localhost:8080${NC}"
echo "2. 登录 Google 账号"
echo "3. 选择一张图片"
echo "4. 输入提示词"
echo "5. 点击 Generate"
echo "6. 观察日志输出 (约10秒完成)"
echo ""
echo "详细测试步骤请查看: ${BLUE}MOCK_TEST_GUIDE.md${NC}"
echo ""
echo "============================================================"
