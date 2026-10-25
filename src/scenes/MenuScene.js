import Phaser from 'phaser'
import { getSkin } from '../skins'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  preload() {
    this.load.image('favicon', 'favicon.svg')
    this.load.image('skin_deepseek', 'skins/deepseek.png')
    this.load.image('skin_qianwen', 'skins/qianwen.png')
    this.load.image('skin_kimi', 'skins/Kimi.png')
  }

  create() {
    const { width: w, height: h } = this.scale
    const cx = w / 2

    // 深色背景
    const bg = this.add.graphics()
    bg.fillStyle(0x020617, 1)
    bg.fillRect(0, 0, w, h)

    // 生成迷宫并绘制（和关卡一样的风格）
    const mazeInfo = this.generateMaze(w, h)
    const { path, ox, oy, cellSize, mazeStr, rows, cols, portals } = mazeInfo

    const mazeGfx = this.add.graphics()
    mazeGfx.setDepth(0)

    const WALL_COLOR = 0x2a2a3e
    const PATH_COLOR = 0x1a1a2e
    const PORTAL_COLOR = 0x9b59b6
    const START_COLOR = 0x2ecc71
    const END_COLOR = 0xe74c3c

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = mazeStr[r][c]
        const x = ox + c * cellSize
        const y = oy + r * cellSize
        let color = PATH_COLOR
        if (ch === '#') color = WALL_COLOR
        else if (ch === '*') color = PORTAL_COLOR
        else if (ch === 'S') color = START_COLOR
        else if (ch === 'E') color = END_COLOR

        mazeGfx.fillStyle(color, 0.7)
        mazeGfx.fillRect(x, y, cellSize, cellSize)

        // 网格线
        mazeGfx.lineStyle(1, 0x333355, 0.15)
        mazeGfx.strokeRect(x, y, cellSize, cellSize)

        // 墙壁纹理
        if (ch === '#') {
          mazeGfx.fillStyle(0x3a3a5e, 0.2)
          mazeGfx.fillRect(x + 2, y + 2, cellSize - 4, cellSize / 2 - 3)
        }

        // 传送门发光
        if (ch === '*') {
          mazeGfx.fillStyle(0xc39bd3, 0.2)
          mazeGfx.fillCircle(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 2)
        }

        // 标签
        if (ch === 'S') {
          this.add.text(x + cellSize / 2, y + cellSize / 2, 'S', {
            fontSize: Math.floor(cellSize * 0.4) + 'px',
            fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(1)
        }
        if (ch === 'E') {
          this.add.text(x + cellSize / 2, y + cellSize / 2, 'E', {
            fontSize: Math.floor(cellSize * 0.4) + 'px',
            fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(1)
        }
        if (ch === '*') {
          this.add.text(x + cellSize / 2, y + cellSize / 2, '★', {
            fontSize: Math.floor(cellSize * 0.35) + 'px',
            fill: '#ffffff',
          }).setOrigin(0.5).setDepth(1)
        }
      }
    }

    // 小人（使用所选皮肤）
    if (path.length > 1) {
      const startPx = ox + path[0].c * cellSize + cellSize / 2
      const startPy = oy + path[0].r * cellSize + cellSize / 2
      const s = cellSize
      const skin = getSkin()

      let walker
      if (skin.tex && this.textures.exists(skin.tex)) {
        var tw = this.textures.get(skin.tex).getSourceImage()
        var wscale = (s - 8) / Math.max(tw.width, tw.height)
        walker = this.add.image(startPx, startPy, skin.tex).setScale(wscale)
      } else {
        walker = this.add.graphics()
        walker.fillStyle(skin.color, 0.9)
        walker.fillRoundedRect(-s / 2 + 4, -s / 2 + 4, s - 8, s - 8, 4)
        walker.fillStyle(0xffffff, 1)
        walker.fillCircle(-s * 0.12, -s * 0.08, s * 0.08)
        walker.fillCircle(s * 0.12, -s * 0.08, s * 0.08)
        walker.fillStyle(0x000000, 1)
        walker.fillCircle(-s * 0.12, -s * 0.08, s * 0.04)
        walker.fillCircle(s * 0.12, -s * 0.08, s * 0.04)
        walker.setPosition(startPx, startPy)
      }
      walker.setDepth(4)

      const trail = this.add.circle(startPx, startPy, s * 0.4, skin.color, 0.15)
      trail.setDepth(3)

      this.loopWalker(walker, trail, path, ox, oy, cellSize, portals)
    }

    // 半透明蒙版让UI区域更清晰
    const overlay = this.add.graphics()
    overlay.fillStyle(0x020617, 0.5)
    overlay.fillRect(cx - 280, 0, 560, h)
    overlay.setDepth(2)

    // 光晕
    const glow1 = this.add.graphics()
    glow1.setDepth(2)
    glow1.fillStyle(0x67e8f9, 0.03)
    glow1.fillCircle(cx, h * 0.4, 200)

    // 竖向自适应：矮屏（手机横屏）等比压缩布局，≥600 高不变
    const ky = Math.min(1, h / 600)

    // 顶部标签
    this.add.text(cx, Math.round(80 * ky), '解谜 · 传送 · 迷宫', {
      fontSize: '14px', fill: '#67e8f9',
      fontFamily: 'system-ui, sans-serif', fontStyle: '700',
    }).setOrigin(0.5).setDepth(5)

    // 主标题
    const title = this.add.text(cx, Math.round(145 * ky), '传送门迷宫', {
      fontSize: '56px', fill: '#ffffff',
      fontFamily: 'system-ui, sans-serif', fontStyle: '800',
      stroke: '#0a1628', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5)

    this.tweens.addCounter({
      from: 0, to: 100, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const v = tween.getValue() / 100
        title.setShadow(0, 4, 'rgba(103,232,249,' + (0.2 + v * 0.6) + ')', 10 + v * 30)
      },
    })

    // 副标题
    this.add.text(cx, Math.round(210 * ky), '穿越迷宫，寻找出口', {
      fontSize: '16px', fill: '#94a3b8', fontFamily: 'system-ui, sans-serif',
    }).setOrigin(0.5).setDepth(5)

    // 元素展示
    const elements = [
      { label: '起点', color: 0x2ecc71, icon: 'S' },
      { label: '终点', color: 0xe74c3c, icon: 'E' },
      { label: '传送门', color: 0x9b59b6, icon: '★' },
    ]
    const startX = cx - 110
    elements.forEach((el, i) => {
      const x = startX + i * 110
      const y = Math.round(290 * ky)
      const r = 30

      this.add.graphics().setDepth(5).fillStyle(el.color, 0.1).fillCircle(x, y, r + 5)
      this.add.graphics().setDepth(5).lineStyle(2, 0x67e8f9, 0.5).strokeCircle(x, y, r)
      this.add.graphics().setDepth(5).fillStyle(el.color, 0.2).fillCircle(x, y, r - 2)

      this.add.text(x, y - 1, el.icon, {
        fontSize: '18px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(5)

      this.add.text(x, y + 40, el.label, {
        fontSize: '12px', fill: '#cbd5e1', fontFamily: 'system-ui, sans-serif',
      }).setOrigin(0.5).setDepth(5)
    })

    // 分隔线
    this.add.graphics().setDepth(5).lineStyle(1, 0x67e8f9, 0.12)
      .lineBetween(cx - 150, Math.round(350 * ky), cx + 150, Math.round(350 * ky))

    // 按钮
    const btnY = Math.round(385 * ky)

    const btn1Bg = this.add.rectangle(cx - 80, btnY, 140, 42, 0x67e8f9)
      .setInteractive({ useHandCursor: true }).setDepth(5)
    this.add.text(cx - 80, btnY, '开始游戏', {
      fontSize: '16px', fill: '#0f172a',
      fontFamily: 'system-ui, sans-serif', fontStyle: '700',
    }).setOrigin(0.5).setDepth(5)

    btn1Bg.on('pointerover', () => { btn1Bg.setFillStyle(0x22d3ee); btn1Bg.setScale(1.03) })
    btn1Bg.on('pointerout', () => { btn1Bg.setFillStyle(0x67e8f9); btn1Bg.setScale(1) })
    btn1Bg.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelSelectScene')
      })
    })

    const btn2Bg = this.add.rectangle(cx + 80, btnY, 140, 42, 0x0f172a)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1.5, 0x94a3b8, 0.5).setDepth(5)
    this.add.text(cx + 80, btnY, '操作说明', {
      fontSize: '16px', fill: '#e2e8f0',
      fontFamily: 'system-ui, sans-serif', fontStyle: '700',
    }).setOrigin(0.5).setDepth(5)

    btn2Bg.on('pointerover', () => { btn2Bg.setStrokeStyle(1.5, 0x67e8f9, 1); btn2Bg.setFillStyle(0x1e293b) })
    btn2Bg.on('pointerout', () => { btn2Bg.setStrokeStyle(1.5, 0x94a3b8, 0.5); btn2Bg.setFillStyle(0x0f172a) })

    // 操作说明弹窗
    const panelW = 400, panelH = 240
    const panelOverlay = this.add.graphics()
    panelOverlay.fillStyle(0x020617, 0.82)
    panelOverlay.fillRect(0, 0, w, h)
    panelOverlay.setDepth(10).setVisible(false)
    panelOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains)

    const panelBg = this.add.graphics()
    panelBg.fillStyle(0x0f172a, 1)
    panelBg.fillRoundedRect(cx - panelW / 2, h / 2 - panelH / 2, panelW, panelH, 14)
    panelBg.lineStyle(1, 0x67e8f9, 0.3)
    panelBg.strokeRoundedRect(cx - panelW / 2, h / 2 - panelH / 2, panelW, panelH, 14)
    panelBg.setDepth(11).setVisible(false)

    const panelTitle = this.add.text(cx, h / 2 - 90, '操作说明', {
      fontSize: '20px', fill: '#67e8f9',
      fontFamily: 'system-ui, sans-serif', fontStyle: '700',
    }).setOrigin(0.5).setDepth(12).setVisible(false)

    const panelContent = this.add.text(cx, h / 2 - 15, [
      '↑ ↓ ← →  方向键移动', '',
      '空格键      站在传送门上按空格传送', '',
      'ESC         取消传送选择',
    ].join('\n'), {
      fontSize: '15px', fill: '#cbd5e1',
      fontFamily: 'system-ui, sans-serif', lineSpacing: 6, align: 'center',
    }).setOrigin(0.5).setDepth(12).setVisible(false)

    const panelClose = this.add.text(cx, h / 2 + 80, '[ 关闭 ]', {
      fontSize: '15px', fill: '#67e8f9', fontFamily: 'system-ui, sans-serif',
    }).setOrigin(0.5).setDepth(12).setVisible(false).setInteractive({ useHandCursor: true })

    const showPanel = (v) => {
      panelOverlay.setVisible(v)
      panelBg.setVisible(v)
      panelTitle.setVisible(v)
      panelContent.setVisible(v)
      panelClose.setVisible(v)
    }

    btn2Bg.on('pointerdown', () => showPanel(true))
    panelClose.on('pointerdown', () => showPanel(false))
    panelOverlay.on('pointerdown', () => showPanel(false))

    // 底部
    this.add.text(cx, h - 40, '传送门迷宫 · Portal Maze', {
      fontSize: '11px', fill: '#3d4f5f', fontFamily: 'system-ui, sans-serif',
    }).setOrigin(0.5).setDepth(5)

    this.add.text(cx, h - 18, '© 2026 Allenzby 保留所有权利', {
      fontSize: '11px', fill: '#3d4f5f', fontFamily: 'system-ui, sans-serif',
    }).setOrigin(0.5).setDepth(5)

    this.cameras.main.fadeIn(600)
  }

  generateMaze(w, h) {
    const cols = 14
    const rows = 10
    const cellSize = Math.floor(Math.min(w / cols, h / rows) * 0.85)
    const mazeW = cols * cellSize
    const mazeH = rows * cellSize
    const ox = (w - mazeW) / 2
    const oy = (h - mazeH) / 2

    // DFS生成迷宫 (grid[r][c] = true 表示墙)
    const grid = []
    for (let r = 0; r < rows; r++) {
      grid[r] = []
      for (let c = 0; c < cols; c++) grid[r][c] = true
    }

    const visited = []
    for (let r = 0; r < rows; r++) {
      visited[r] = []
      for (let c = 0; c < cols; c++) visited[r][c] = false
    }

    const stack = [{ r: 0, c: 0 }]
    grid[0][0] = false
    visited[0][0] = true
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    while (stack.length > 0) {
      const cur = stack[stack.length - 1]
      const neighbors = []
      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr * 2
        const nc = cur.c + dc * 2
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
          neighbors.push({ r: nr, c: nc, wr: cur.r + dr, wc: cur.c + dc })
        }
      }
      if (neighbors.length === 0) {
        stack.pop()
      } else {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]
        grid[next.wr][next.wc] = false
        grid[next.r][next.c] = false
        visited[next.r][next.c] = true
        stack.push({ r: next.r, c: next.c })
      }
    }

    // BFS找路径
    const er = rows % 2 === 0 ? rows - 2 : rows - 1
    const ec = cols % 2 === 0 ? cols - 2 : cols - 1
    const path = this.findPath(grid, rows, cols, er, ec)

    // 把grid转成字符串迷宫（含S、E、*）
    const mazeStr = []
    for (let r = 0; r < rows; r++) {
      mazeStr[r] = ''
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]) {
          mazeStr[r] += '#'
        } else if (r === 0 && c === 0) {
          mazeStr[r] += 'S'
        } else if (r === er && c === ec) {
          mazeStr[r] += 'E'
        } else {
          mazeStr[r] += '.'
        }
      }
    }

    // 随机放几个传送门（只放在路径上的非S/E格子）
    const portals = []
    if (path.length > 4) {
      const portalCount = Math.min(3, Math.floor(path.length / 6))
      const candidates = path.filter((p, i) => i > 0 && i < path.length - 1)
      for (let i = 0; i < portalCount && candidates.length > 0; i++) {
        const idx = Math.floor(Math.random() * candidates.length)
        const p = candidates[idx]
        const row = mazeStr[p.r]
        mazeStr[p.r] = row.substring(0, p.c) + '*' + row.substring(p.c + 1)
        portals.push({ r: p.r, c: p.c })
        candidates.splice(idx, 1)
      }
    }

    return { path, ox, oy, cellSize, mazeStr, rows, cols, portals }
  }

  findPath(grid, rows, cols, er, ec) {
    const vis = []
    for (let r = 0; r < rows; r++) {
      vis[r] = []
      for (let c = 0; c < cols; c++) vis[r][c] = false
    }
    const queue = [{ r: 0, c: 0, path: [{ r: 0, c: 0 }] }]
    vis[0][0] = true
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    while (queue.length > 0) {
      const cur = queue.shift()
      if (cur.r === er && cur.c === ec) return cur.path
      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr
        const nc = cur.c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc] && !vis[nr][nc]) {
          vis[nr][nc] = true
          queue.push({ r: nr, c: nc, path: [...cur.path, { r: nr, c: nc }] })
        }
      }
    }
    return []
  }

  loopWalker(walker, trail, path, ox, oy, cellSize, portals) {
    const stepDuration = 180
    const portalKeys = new Set((portals || []).map(p => p.r + ',' + p.c))
    const posOf = (i) => ({
      x: ox + path[i].c * cellSize + cellSize / 2,
      y: oy + path[i].r * cellSize + cellSize / 2,
    })

    // 预计算动作：走到下一格，或站在传送门上时跳到下一个传送门
    const buildSchedule = () => {
      const acts = []
      let i = 0
      while (i < path.length - 1) {
        if (portalKeys.has(path[i].r + ',' + path[i].c)) {
          let j = -1
          for (let k = i + 1; k < path.length; k++) {
            if (portalKeys.has(path[k].r + ',' + path[k].c)) { j = k; break }
          }
          if (j > i) {
            acts.push({ type: 'teleport', from: i, to: j })
            i = j
            continue
          }
        }
        acts.push({ type: 'walk', to: i + 1 })
        i++
      }
      return acts
    }

    // 传送特效：源点和目标各爆一圈光
    const portalBurst = (pos) => {
      const ring = this.add.circle(pos.x, pos.y, cellSize * 0.3, 0xc39bd3, 0.6)
      ring.setDepth(5)
      this.tweens.add({
        targets: ring,
        radius: cellSize * 0.9,
        alpha: 0,
        duration: 320,
        ease: 'Power2',
        onComplete: () => ring.destroy(),
      })
    }

    const animatePath = () => {
      const acts = buildSchedule()
      let delay = 0

      const p0 = posOf(0)
      walker.setPosition(p0.x, p0.y)
      trail.setPosition(p0.x, p0.y)

      acts.forEach((act) => {
        if (act.type === 'walk') {
          const t = posOf(act.to)
          this.tweens.add({ targets: walker, x: t.x, y: t.y, duration: stepDuration, delay: delay, ease: 'Linear' })
          this.tweens.add({ targets: trail, x: t.x, y: t.y, duration: stepDuration + 60, delay: delay, ease: 'Linear' })
          delay += stepDuration
        } else {
          const from = posOf(act.from)
          const to = posOf(act.to)
          this.time.delayedCall(delay, () => {
            portalBurst(from)
            walker.setPosition(from.x, from.y)
            trail.setPosition(from.x, from.y)
          })
          this.time.delayedCall(delay + 140, () => {
            portalBurst(to)
            walker.setPosition(to.x, to.y)
            trail.setPosition(to.x, to.y)
          })
          delay += 460
        }
      })

      this.time.delayedCall(delay + 1200, animatePath)
    }

    animatePath()
  }
}
