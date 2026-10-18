# 传送门迷宫 Portal Maze

> 基于 Phaser 3 的网页迷宫解谜小游戏 —— 利用传送门穿越迷宫，挑战最少步数。
>
> A browser maze puzzle game built with Phaser 3 + Vite. Teleport through portals, beat the minimum step count.

当前版本 **v1.7.0** · 支持电脑键盘与手机触屏游玩

## 特性 Features

- 🌀 **传送门机制**：站在传送门上按空格（手机点「传送」）在两门之间瞬移
- 🏆 **最少步数比拼**：每关显示 BFS 计算的理论最少步数，通关记录最佳成绩
- 🎲 **随机关卡**：一键生成迷宫，附带「设计地图 → 添加关卡数据 → 检查自动适配 → 构建验证」四步进度
- 🎨 **皮肤系统**：可切换多款迷宫皮肤
- 📱 **手机适配**：触屏方向键 + 传送/取消按钮，迷宫按屏幕自适应格子大小
- 🗺️ **五个章节**：手工设计的渐进难度关卡

## 快速开始 Quick Start

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://127.0.0.1:5174）
npm run build    # 生产构建，产物在 dist/
npm run preview  # 预览生产构建
```

Windows 下也可直接双击 `启动游戏.bat`。

## 操作说明 Controls

| 操作 | 电脑 | 手机 |
|---|---|---|
| 移动 | 方向键 | 触屏方向键 |
| 进入/确认传送 | 空格键 | 「传送」按钮 |
| 取消传送 | Esc | 「取消」按钮 |

## 项目结构 Structure

```
├── index.html          # 入口页面
├── public/             # 静态资源（favicon、皮肤图）
├── src/
│   ├── main.js         # Phaser 游戏配置
│   ├── scenes/         # 三个场景：主页 / 选关 / 游戏
│   ├── skins.js        # 皮肤配置
│   ├── changelog.js    # 关于页更新日志
│   └── mazeUtils.js    # 迷宫算法（最少步数计算等）
├── vite.config.js      # 构建配置（相对路径，可部署到任意子目录）
└── netlify.toml        # Netlify 部署配置
```

## 部署 Deploy

纯静态站点：`npm run build` 后将 `dist/` 部署到任意静态托管（Netlify、GitHub Pages 等）；连接仓库自动部署时 Netlify 会读取 `netlify.toml`。

## 更多文档

详细版本历史与技术说明见 [网站说明.md](./网站说明.md)。
