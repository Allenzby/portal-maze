import Phaser from 'phaser'
import { getSkin } from '../skins'
import { computeMinSteps } from '../mazeUtils'

const DEFAULT_MAP = [
  'S...*',
  '####.',
  '.....',
  '.####',
  '*...E',
]

const MAX_CELL = 48
const WALL_COLOR = 0x2a2a3e
const PATH_COLOR = 0x1a1a2e
const PORTAL_COLOR = 0x9b59b6
const PORTAL_GLOW = 0xc39bd3
const START_COLOR = 0x2ecc71
const END_COLOR = 0xe74c3c
const PLAYER_COLOR = 0x00d4ff
const VISITED_COLOR = 0x1c2833

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.steps = 0
    this.maze = []
    this.playerRow = 0
    this.playerCol = 0
    this.portalPositions = []
    this.playerSprite = null
    this.stepText = null
    this.hintText = null
    this.isMoving = false
    this.portalMode = false
    this.portalIndex = 0
    this.portalHighlight = null
    this.mazeGroup = null
  }

  create(data) {
    const { width, height } = this.scale
    const cx = width / 2
    const MAZE = data?.map || DEFAULT_MAP
    this.mazeMap = MAZE
    this.levelId = data?.levelId || 1
    const rows = MAZE.length
    const cols = MAZE[0].length

    // 触屏判定：真机粗指针，或调试强制（window.__forceTouch = true）
    const isTouch = window.__forceTouch === true ||
      (window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false)
    this.isTouch = isTouch
    const isLandscape = width >= height
    this.isLandscape = isLandscape

    // 自适应格子：桌面保持 48，窄屏/触屏按可用区域缩小
    const topBar = 56
    const bottomReserve = isTouch ? (isLandscape ? 76 : 185) : 60
    const availW = width - 16
    const availH = height - topBar - bottomReserve
    let cell = Math.min(MAX_CELL, availW / cols, availH / rows)
    if (cell < 12) cell = 12
    this.cell = cell
    const CELL = cell
    const mazeW = cols * cell
    const mazeH = rows * cell
    const offsetX = (width - mazeW) / 2
    const offsetY = topBar + Math.max(0, (availH - mazeH) / 2)

    this.steps = 0
    this.portalPositions = []
    this.isMoving = false
    this.portalMode = false
    this.maze = []

    // 背景
    const bg = this.add.graphics()
    bg.fillStyle(0x0d1117, 1)
    bg.fillRect(0, 0, width, height)

    // 返回按钮
    var backBg = this.add.rectangle(50, 27, 80, 34, 0x0f172a)
      .setStrokeStyle(1, 0x475569, 0.6)
      .setInteractive({ useHandCursor: true })
    var backText = this.add.text(50, 27, '\u2039 返回', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    backBg.on('pointerover', function () {
      backBg.setFillStyle(0x1e293b)
      backBg.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    backBg.on('pointerout', function () {
      backBg.setFillStyle(0x0f172a)
      backBg.setStrokeStyle(1, 0x475569, 0.6)
    })
    backBg.on('pointerdown', function () {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', function () {
        this.scene.start('LevelSelectScene')
      }, this)
    }, this)

    this.stepText = this.add.text(width - 20, 16, '步数: 0', {
      fontSize: '18px',
      fill: '#00d4ff',
      fontFamily: 'Arial',
    }).setOrigin(1, 0)

    // 理论最少步数（右上角，步数下方）
    this.minSteps = computeMinSteps(MAZE)
    this.add.text(width - 20, 46, '★ 最少 ' + this.minSteps + ' 步', {
      fontSize: '14px',
      fill: '#fbbf24',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(1, 0)

    // 解析迷宫
    for (let r = 0; r < rows; r++) {
      this.maze[r] = []
      for (let c = 0; c < cols; c++) {
        const ch = MAZE[r][c]
        this.maze[r][c] = ch
        const x = offsetX + c * CELL + CELL / 2
        const y = offsetY + r * CELL + CELL / 2

        if (ch === 'S') {
          this.playerRow = r
          this.playerCol = c
        }
        if (ch === '*') {
          this.portalPositions.push({ r, c })
        }
      }
    }

    // 绘制迷宫
    this.mazeGraphics = this.add.graphics()
    this.drawMaze(offsetX, offsetY, rows, cols)

    // 传送门高亮指示
    this.portalHighlight = this.add.graphics()

    // 玩家（使用所选皮肤）
    const px = offsetX + this.playerCol * CELL + CELL / 2
    const py = offsetY + this.playerRow * CELL + CELL / 2
    const skin = getSkin()
    if (skin.tex && this.textures.exists(skin.tex)) {
      var tw = this.textures.get(skin.tex).getSourceImage()
      var scale = (CELL * 0.86) / Math.max(tw.width, tw.height)
      this.playerSprite = this.add.image(px, py, skin.tex).setScale(scale)
    } else {
      this.playerSprite = this.add.graphics()
      const inset = Math.max(1.5, CELL * 0.08)
      this.playerSprite.fillStyle(skin.color, 1)
      this.playerSprite.fillRoundedRect(-CELL / 2 + inset, -CELL / 2 + inset,
        CELL - inset * 2, CELL - inset * 2, Math.max(2, CELL * 0.14))
      this.playerSprite.fillStyle(0xffffff, 1)
      this.playerSprite.fillCircle(-CELL / 8, -CELL / 12, Math.max(1.2, CELL / 12))
      this.playerSprite.fillCircle(CELL / 8, -CELL / 12, Math.max(1.2, CELL / 12))
      this.playerSprite.fillStyle(0x000000, 1)
      this.playerSprite.fillCircle(-CELL / 8, -CELL / 12, Math.max(0.6, CELL / 24))
      this.playerSprite.fillCircle(CELL / 8, -CELL / 12, Math.max(0.6, CELL / 24))
      this.playerSprite.setPosition(px, py)
    }

    // 提示文字（触屏与键鼠使用不同文案和位置）
    const hintY = isTouch ? (isLandscape ? height - 30 : height - 170) : height - 40
    this.hintOriginal = isTouch
      ? '点按方向按钮移动 · 站上传送门后点「传送」'
      : '方向键移动 | 站在传送门上按 空格键 传送'
    this.hintText = this.add.text(cx, hintY, this.hintOriginal, {
      fontSize: '14px',
      fill: '#777777',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    // 传送门目标选择提示（初始隐藏；触屏时由 hint 文案承载）
    this.portalSelectText = this.add.text(cx, isTouch ? hintY : height - 65, '', {
      fontSize: '14px',
      fill: '#c39bd3',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setAlpha(0)

    this.offsetX = offsetX
    this.offsetY = offsetY

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    this.spaceKey.on('down', () => this.handleSpace())
    this.escKey.on('down', () => this.cancelPortalMode())

    // 触屏控制（手机/平板）
    if (isTouch) this.buildTouchControls(width, height)
  }

  // 屏幕虚拟方向键 + 传送/取消按钮
  buildTouchControls(width, height) {
    var self = this
    var size = 46
    var gap = 3
    var step = size + gap
    var colL = 12 + size / 2
    var colC = colL + step
    var rowB = height - 12 - size / 2

    var mkBtn = function (x, y, bw, bh, label, fontSize, alpha, fn) {
      var r = self.add.rectangle(x, y, bw, bh, 0x0f172a, alpha)
        .setStrokeStyle(1.5, 0x67e8f9, 0.75)
        .setInteractive()
        .setDepth(300)
      var t = self.add.text(x, y, label, {
        fontSize: fontSize + 'px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(301)
      r.on('pointerdown', function () {
        r.setFillStyle(0x334155, Math.min(1, alpha + 0.25))
        fn()
      })
      r.on('pointerup', function () { r.setFillStyle(0x0f172a, alpha) })
      r.on('pointerout', function () { r.setFillStyle(0x0f172a, alpha) })
      return { r: r, t: t }
    }

    var tryMoveGuard = function (dr, dc) {
      if (self.portalMode || self.isMoving) return
      self.tryMove(dr, dc)
    }
    var cycleGuard = function (d) {
      if (!self.portalMode || self.isMoving) return
      self.portalIndex += d
      self.highlightPortal()
    }

    // 十字方向键（传送门选择模式下 ↑↓ 切换目标）
    mkBtn(colC, rowB - step * 2, size, size, '▲', 18, 0.72,
      function () { if (self.portalMode) cycleGuard(-1); else tryMoveGuard(-1, 0) })
    mkBtn(colL, rowB - step, size, size, '◀', 18, 0.72,
      function () { tryMoveGuard(0, -1) })
    mkBtn(colC + step, rowB - step, size, size, '▶', 18, 0.72,
      function () { tryMoveGuard(0, 1) })
    mkBtn(colC, rowB, size, size, '▼', 18, 0.72,
      function () { if (self.portalMode) cycleGuard(1); else tryMoveGuard(1, 0) })

    // 传送按钮（进入/确认传送）
    mkBtn(width - 12 - 52, height - 40, 104, 56, '传送', 17, 0.8,
      function () { self.handleSpace() })

    // 取消按钮（仅传送门模式显示）
    var cancel = mkBtn(width - 50, height - 97, 76, 34, '取消', 13, 0.8,
      function () { self.cancelPortalMode() })
    cancel.r.setVisible(false)
    cancel.t.setVisible(false)
    this.cancelBtn = cancel.r
    this.cancelBtnText = cancel.t
  }

  setCancelVisible(v) {
    if (this.cancelBtn) {
      this.cancelBtn.setVisible(v)
      this.cancelBtnText.setVisible(v)
    }
  }

  drawMaze(ox, oy, rows, cols) {
    const CELL = this.cell
    this.mazeGraphics.clear()
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = this.maze[r][c]
        const x = ox + c * CELL
        const y = oy + r * CELL
        let color = PATH_COLOR
        if (ch === '#') color = WALL_COLOR
        else if (ch === '*') color = PORTAL_COLOR
        else if (ch === 'S') color = START_COLOR
        else if (ch === 'E') color = END_COLOR

        this.mazeGraphics.fillStyle(color, 1)
        this.mazeGraphics.fillRect(x, y, CELL, CELL)

        // 网格线
        this.mazeGraphics.lineStyle(1, 0x333355, 0.3)
        this.mazeGraphics.strokeRect(x, y, CELL, CELL)

        // 墙壁纹理
        if (ch === '#') {
          this.mazeGraphics.fillStyle(0x3a3a5e, 0.3)
          this.mazeGraphics.fillRect(x + 2, y + 2, CELL - 4, CELL / 2 - 3)
          this.mazeGraphics.fillRect(x + CELL / 4, y + CELL / 2 + 1, CELL / 2, CELL / 2 - 3)
        }

        // 传送门发光
        if (ch === '*') {
          this.mazeGraphics.fillStyle(PORTAL_GLOW, 0.3)
          this.mazeGraphics.fillCircle(x + CELL / 2, y + CELL / 2, CELL / 2 - 2)
        }

        // 标签
        if (ch === 'S') {
          this.add.text(x + CELL / 2, y + CELL / 2, 'S', {
            fontSize: Math.max(9, Math.round(CELL * 0.38)) + 'px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
          }).setOrigin(0.5)
        }
        if (ch === 'E') {
          this.add.text(x + CELL / 2, y + CELL / 2, 'E', {
            fontSize: Math.max(9, Math.round(CELL * 0.38)) + 'px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
          }).setOrigin(0.5)
        }
        if (ch === '*') {
          this.add.text(x + CELL / 2, y + CELL / 2, '★', {
            fontSize: Math.max(8, Math.round(CELL * 0.34)) + 'px',
            fill: '#ffffff',
          }).setOrigin(0.5)
        }
      }
    }
  }

  update() {
    if (this.isMoving || this.portalMode) return

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.tryMove(0, -1)
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.tryMove(0, 1)
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.tryMove(-1, 0)
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) this.tryMove(1, 0)
  }

  tryMove(dr, dc) {
    const CELL = this.cell
    const nr = this.playerRow + dr
    const nc = this.playerCol + dc
    const rows = this.mazeMap.length
    const cols = this.mazeMap[0].length

    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return
    if (this.maze[nr][nc] === '#') return

    this.playerRow = nr
    this.playerCol = nc
    this.steps++
    this.stepText.setText('步数: ' + this.steps)

    const tx = this.offsetX + nc * CELL + CELL / 2
    const ty = this.offsetY + nr * CELL + CELL / 2

    this.isMoving = true
    this.tweens.add({
      targets: this.playerSprite,
      x: tx,
      y: ty,
      duration: 120,
      ease: 'Power2',
      onComplete: () => {
        this.isMoving = false
        this.checkWin()
      },
    })
  }

  handleSpace() {
    if (this.isMoving) return

    // 如果正在传送门选择模式，确认传送
    if (this.portalMode) {
      this.confirmTeleport()
      return
    }

    // 检查是否站在传送门上
    if (this.maze[this.playerRow][this.playerCol] === '*') {
      this.enterPortalMode()
    }
  }

  enterPortalMode() {
    this.portalMode = true
    this.portalIndex = 0
    if (this.isTouch) {
      this.hintText.setText('点 ↑ ↓ 选择目标 · 点「传送」确认')
      this.hintText.setFill('#fbbf24')
      this.setCancelVisible(true)
    }
    this.highlightPortal()
    if (!this.isTouch) {
      this.portalSelectText.setText('↑↓ 选择目标传送门 | 空格确认 | ESC取消')
      this.portalSelectText.setAlpha(1)
    }
  }

  cancelPortalMode() {
    this.portalMode = false
    this.portalHighlight.clear()
    if (this.isTouch) {
      this.hintText.setText(this.hintOriginal)
      this.hintText.setFill('#777777')
      this.setCancelVisible(false)
    } else {
      this.portalSelectText.setAlpha(0)
    }
  }

  highlightPortal() {
    const CELL = this.cell
    this.portalHighlight.clear()
    const targets = this.portalPositions.filter(
      p => !(p.r === this.playerRow && p.c === this.playerCol)
    )
    if (targets.length === 0) return

    this.portalIndex = ((this.portalIndex % targets.length) + targets.length) % targets.length
    const target = targets[this.portalIndex]

    const x = this.offsetX + target.c * CELL + CELL / 2
    const y = this.offsetY + target.r * CELL + CELL / 2

    this.portalHighlight.lineStyle(3, 0xf1c40f, 1)
    this.portalHighlight.strokeCircle(x, y, CELL / 2 + 2)

    // 更新提示（触屏用 hint 承载，键鼠用 portalSelectText）
    if (this.isTouch) {
      this.hintText.setText(`目标 (${target.r},${target.c}) · 点 ↑ ↓ 切换 · 传送确认`)
      this.hintText.setFill('#fbbf24')
    } else {
      this.portalSelectText.setText(
        `↑↓ 选择目标 | 空格传送到 (${target.r},${target.c}) | ESC取消`
      )
    }

    // 监听上下键切换
    this.input.keyboard.once('keydown-UP', () => {
      if (this.portalMode) {
        this.portalIndex--
        this.highlightPortal()
      }
    })
    this.input.keyboard.once('keydown-DOWN', () => {
      if (this.portalMode) {
        this.portalIndex++
        this.highlightPortal()
      }
    })
  }

  confirmTeleport() {
    const CELL = this.cell
    const targets = this.portalPositions.filter(
      p => !(p.r === this.playerRow && p.c === this.playerCol)
    )
    if (targets.length === 0) {
      this.cancelPortalMode()
      return
    }

    const target = targets[this.portalIndex]
    this.playerRow = target.r
    this.playerCol = target.c
    this.steps++
    this.stepText.setText('步数: ' + this.steps)

    const tx = this.offsetX + target.c * CELL + CELL / 2
    const ty = this.offsetY + target.r * CELL + CELL / 2

    // 传送特效
    this.cameras.main.flash(200, 155, 89, 182, false, (cam, progress) => {
      if (progress === 1) {
        this.playerSprite.setPosition(tx, ty)
      }
    })

    this.cancelPortalMode()
    this.checkWin()
  }

  checkWin() {
    if (this.maze[this.playerRow][this.playerCol] === 'E') {
      this.isMoving = true

      var bestKey = 'maze_best_' + this.levelId
      var oldBest = parseInt(localStorage.getItem(bestKey) || '0', 10)
      var isNewRecord = oldBest === 0 || this.steps < oldBest
      if (isNewRecord) {
        localStorage.setItem(bestKey, String(this.steps))
      }

      var msg = '恭喜通关！用时 ' + this.steps + ' 步'
      if (isNewRecord && oldBest > 0) {
        msg = msg + ' | 新纪录！之前: ' + oldBest + ' 步'
      } else if (oldBest > 0) {
        msg = msg + ' | 最佳: ' + oldBest + ' 步'
      }
      this.hintText.setText(msg)
      this.hintText.setFill('#2ecc71')
      this.hintText.setFontSize(16)

      this.cameras.main.flash(500, 46, 204, 113, false)

      this.time.delayedCall(2000, () => {
        this.scene.start('LevelSelectScene')
      })
    }
  }
}
