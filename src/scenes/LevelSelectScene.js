import Phaser from 'phaser'
import { SKINS, OTHER_SKINS, getSkinId, setSkin } from '../skins'
import { computeMinSteps } from '../mazeUtils'
import pkg from '../../package.json'
import { CHANGELOG } from '../changelog'

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene')
  }

  create() {
    var w = this.scale.width
    var h = this.scale.height
    var cx = w / 2
    this._genRunning = false

    // 纯色背景
    var bg = this.add.graphics()
    bg.fillStyle(0x020617, 1)
    bg.fillRect(0, 0, w, h)

    // 返回按钮
    var backBg = this.add.rectangle(50, 27, 80, 34, 0x0f172a)
      .setStrokeStyle(1, 0x475569, 0.6)
      .setInteractive({ useHandCursor: true })
    this.add.text(50, 27, '‹ 返回', {
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
        this.scene.start('MenuScene')
      }, this)
    }, this)

    // 关于按钮（右上角）
    var aboutBg = this.add.rectangle(w - 50, 27, 80, 34, 0x0f172a)
      .setStrokeStyle(1, 0x475569, 0.6)
      .setInteractive({ useHandCursor: true })
    this.add.text(w - 50, 27, '关于', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    aboutBg.on('pointerover', function () {
      aboutBg.setFillStyle(0x1e293b)
      aboutBg.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    aboutBg.on('pointerout', function () {
      aboutBg.setFillStyle(0x0f172a)
      aboutBg.setStrokeStyle(1, 0x475569, 0.6)
    })

    // 关于弹窗
    var aboutContainer = this.add.container(0, 0).setDepth(1000).setVisible(false)

    // 遮罩
    var overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
      .setInteractive()
    aboutContainer.add(overlay)

    // 弹窗背景
    var dw = Math.min(320, w - 24), dh = Math.min(340, h - 24)
    var dx = w / 2 - dw / 2
    var dy = h / 2 - dh / 2

    var panel = this.add.graphics()
    panel.fillStyle(0x0f172a, 1)
    panel.fillRoundedRect(dx, dy, dw, dh, 12)
    panel.lineStyle(1.5, 0x67e8f9, 0.3)
    panel.strokeRoundedRect(dx, dy, dw, dh, 12)
    aboutContainer.add(panel)

    // 图标背景框
    var iconSize = 56
    var iconX = w / 2
    var iconY = dy + 50

    var iconBg = this.add.graphics()
    iconBg.fillStyle(0x1a1a2e, 1)
    iconBg.fillRoundedRect(iconX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize, 10)
    iconBg.lineStyle(1, 0x67e8f9, 0.4)
    iconBg.strokeRoundedRect(iconX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize, 10)
    aboutContainer.add(iconBg)

    // 传送门图标（外圈 + 内圈 + 核心）
    var icon = this.add.graphics()
    icon.lineStyle(2, 0x67e8f9, 0.8)
    icon.strokeCircle(iconX, iconY, 16)
    icon.fillStyle(0x67e8f9, 0.3)
    icon.fillCircle(iconX, iconY, 10)
    icon.fillStyle(0x67e8f9, 1)
    icon.fillCircle(iconX, iconY, 5)
    aboutContainer.add(icon)

    // 游戏名
    aboutContainer.add(this.add.text(iconX, iconY + 42, '传送门迷宫', {
      fontSize: '20px', fill: '#67e8f9', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))

    // 版本号
    aboutContainer.add(this.add.text(iconX, iconY + 68, '版本 ' + pkg.version, {
      fontSize: '13px', fill: '#94a3b8', fontFamily: 'Arial',
    }).setOrigin(0.5))

    // 作者个人网站链接
    aboutContainer.add(this.add.text(iconX, dy + 165, '作者个人网站', {
      fontSize: '12px', fill: '#94a3b8', fontFamily: 'Arial',
    }).setOrigin(0.5))

    var siteText = this.add.text(iconX, dy + 192, 'allenzby.netlify.app', {
      fontSize: '15px', fill: '#67e8f9', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    aboutContainer.add(siteText)

    // 手绘下划线（Phaser 文本不支持 textDecoration）
    var linkGfx = this.add.graphics()
    linkGfx.lineStyle(1, 0x67e8f9, 0.65)
    linkGfx.lineBetween(iconX - siteText.width / 2, dy + 201,
      iconX + siteText.width / 2, dy + 201)
    aboutContainer.add(linkGfx)

    siteText.on('pointerover', function () {
      siteText.setColor('#a5f3fc')
      linkGfx.clear()
      linkGfx.lineStyle(1, 0xa5f3fc, 1)
      linkGfx.lineBetween(iconX - siteText.width / 2, dy + 201,
        iconX + siteText.width / 2, dy + 201)
    })
    siteText.on('pointerout', function () {
      siteText.setColor('#67e8f9')
      linkGfx.clear()
      linkGfx.lineStyle(1, 0x67e8f9, 0.65)
      linkGfx.lineBetween(iconX - siteText.width / 2, dy + 201,
        iconX + siteText.width / 2, dy + 201)
    })
    siteText.on('pointerdown', function () {
      window.open('https://allenzby.netlify.app/', '_blank')
    })

    // ===== 更新日志（关于弹窗内入口 → 二级弹窗） =====
    // 入口按钮（关闭按钮上方；矮屏时上移避免与分隔线重叠）
    var logBtnY = dy + Math.min(232, dh - 115)
    var logBtn = this.add.rectangle(iconX, logBtnY, 130, 30, 0x1e293b)
      .setStrokeStyle(1, 0x67e8f9, 0.4)
      .setInteractive({ useHandCursor: true })
    aboutContainer.add(logBtn)
    aboutContainer.add(this.add.text(iconX, logBtnY, '更新日志', {
      fontSize: '13px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))
    logBtn.on('pointerover', function () {
      logBtn.setFillStyle(0x334155)
      logBtn.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    logBtn.on('pointerout', function () {
      logBtn.setFillStyle(0x1e293b)
      logBtn.setStrokeStyle(1, 0x67e8f9, 0.4)
    })

    // 二级弹窗容器（关于弹窗之上）
    var logContainer = this.add.container(0, 0).setDepth(1100).setVisible(false)
    var logOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
      .setInteractive()
    logContainer.add(logOverlay)

    // 内容按本地坐标排版，容器整体平移实现滚动
    var logScene = this
    var lw = Math.min(460, w - 30)
    var logContent = this.add.container(0, 0)
    // 中文按字符换行（Phaser 自带换行按空格断句，会把「· 」和长中文句拆成两行）
    var probeText = logScene.add.text(0, 0, '', { fontSize: '13px', fontFamily: 'Arial' }).setVisible(false)
    var LOG_CLOSE_PUNCT = '）】」』》〉，。、！？：；%”’…'
    var LOG_OPEN_PUNCT = '（【「『《〈“‘'
    var wrapCJK = function (str, maxW) {
      var out = []
      var line = ''
      for (var ci = 0; ci < str.length; ci++) {
        var ch = str.charAt(ci)
        if (ch === '\n') { out.push(line); line = ''; continue }
        probeText.setText(line + ch)
        if (probeText.width <= maxW || !line) { line += ch; continue }
        // 行首禁则：收尾标点挤在本行末尾，避免「）」单独成行
        if (LOG_CLOSE_PUNCT.indexOf(ch) >= 0) { line += ch; continue }
        // 行尾禁则：开引号移到下一行
        var carry = ''
        var lastCh = line.charAt(line.length - 1)
        if (LOG_OPEN_PUNCT.indexOf(lastCh) >= 0) { carry = lastCh; line = line.slice(0, -1) }
        out.push(line)
        line = carry + ch
      }
      if (line) out.push(line)

      // 末行只剩一两个字时（如「片）」），从上一行挪几个字过来，读起来更整齐
      if (out.length > 1) {
        var lastLine = out[out.length - 1]
        var prevLine = out[out.length - 2]
        while (prevLine.length > 6 && lastLine.length < 6) {
          var moveCh = prevLine.charAt(prevLine.length - 1)
          if (LOG_CLOSE_PUNCT.indexOf(moveCh) >= 0) break
          prevLine = prevLine.slice(0, -1)
          lastLine = moveCh + lastLine
        }
        // 上一行末尾不能是开引号/开括号
        while (prevLine.length > 2 && LOG_OPEN_PUNCT.indexOf(prevLine.charAt(prevLine.length - 1)) >= 0) {
          lastLine = prevLine.charAt(prevLine.length - 1) + lastLine
          prevLine = prevLine.slice(0, -1)
        }
        out[out.length - 2] = prevLine
        out[out.length - 1] = lastLine
      }
      return out.join('\n')
    }

    var cy = 0
    CHANGELOG.forEach(function (entry) {
      var verT = logScene.add.text(0, cy, 'v' + entry.v, {
        fontSize: '15px', fill: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
      })
      logContent.add(verT)
      var cx2 = verT.width + 12
      if (entry.date) {
        var dateT = logScene.add.text(cx2, cy + 3, entry.date, {
          fontSize: '12px', fill: '#94a3b8', fontFamily: 'Arial',
        })
        logContent.add(dateT)
        cx2 += dateT.width + 12
      }
      if (entry.v === pkg.version) {
        logContent.add(logScene.add.text(cx2, cy + 3, '（当前）', {
          fontSize: '11px', fill: '#67e8f9', fontFamily: 'Arial', fontStyle: 'bold',
        }))
      }
      cy += 24
      entry.items.forEach(function (it) {
        // 圆点与正文分开：避免中文长句在「· 」的空格处断行，导致圆点单独占一行
        logContent.add(logScene.add.text(10, cy + 1, '·', {
          fontSize: '13px', fill: '#cbd5e1', fontFamily: 'Arial',
        }))
        var itemT = logScene.add.text(24, cy, wrapCJK(it, lw - 80), {
          fontSize: '13px', fill: '#cbd5e1', fontFamily: 'Arial',
        })
        logContent.add(itemT)
        cy += itemT.height + 6
      })
      cy += 10
    })
    probeText.destroy()
    var contentH = cy - 6

    // 面板尺寸随内容自适应（受屏幕高度限制，超出则滚动）
    var lh = Math.min(Math.max(contentH + 110, 240), h - 30)
    var lx = w / 2 - lw / 2
    var ly = h / 2 - lh / 2

    var logPanel = this.add.graphics()
    logPanel.fillStyle(0x0f172a, 1)
    logPanel.fillRoundedRect(lx, ly, lw, lh, 12)
    logPanel.lineStyle(1.5, 0x67e8f9, 0.4)
    logPanel.strokeRoundedRect(lx, ly, lw, lh, 12)
    logContainer.add(logPanel)

    logContainer.add(this.add.text(w / 2, ly + 26, '更新日志', {
      fontSize: '17px', fill: '#67e8f9', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))

    var logSep = this.add.graphics()
    logSep.lineStyle(1, 0x94a3b8, 0.15)
    logSep.lineBetween(lx + 20, ly + 46, lx + lw - 20, ly + 46)
    logContainer.add(logSep)

    var contentBaseY = ly + 56
    logContent.x = lx + 24
    logContent.y = contentBaseY
    logContainer.add(logContent)

    // 视口比内容矮时启用滚动（滚轮/触屏拖动）+ 几何遮罩裁剪
    var logViewH = lh - 98
    var maxLogScroll = Math.max(0, contentH - logViewH)
    var logScrollY = 0

    var maskGfx = this.make.graphics({})
    maskGfx.fillStyle(0xffffff)
    maskGfx.fillRect(lx + 8, ly + 50, lw - 16, logViewH)
    logContent.setMask(maskGfx.createGeometryMask())

    if (maxLogScroll > 0) {
      logContainer.add(this.add.text(lx + lw - 18, ly + 26, '滚动查看', {
        fontSize: '11px', fill: '#64748b', fontFamily: 'Arial',
      }).setOrigin(1, 0.5))
    }

    // 关闭按钮
    var logClose = this.add.rectangle(w / 2, ly + lh - 28, lw - 60, 32, 0x1e293b)
      .setStrokeStyle(1, 0x67e8f9, 0.4)
      .setInteractive({ useHandCursor: true })
    logContainer.add(logClose)
    logContainer.add(this.add.text(w / 2, ly + lh - 28, '关闭', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))
    logClose.on('pointerover', function () {
      logClose.setFillStyle(0x334155)
      logClose.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    logClose.on('pointerout', function () {
      logClose.setFillStyle(0x1e293b)
      logClose.setStrokeStyle(1, 0x67e8f9, 0.4)
    })
    logClose.on('pointerdown', function () {
      logContainer.setVisible(false)
    })

    // 打开（回到顶部）
    logBtn.on('pointerdown', function () {
      logScrollY = 0
      logContent.y = contentBaseY
      logContainer.setVisible(true)
    })

    // 更新日志自己的滚轮滚动
    this.input.on('wheel', function (pointer, objects, dx, dy) {
      if (!logContainer.visible || maxLogScroll <= 0) return
      logScrollY = Math.max(0, Math.min(maxLogScroll, logScrollY + dy * 0.5))
      logContent.y = contentBaseY - logScrollY
    })

    // 触屏拖动滚动（在日志视口内按下拖动）
    var logDrag = false
    var logDragY = 0
    this.input.on('pointerdown', function (pointer) {
      if (!logContainer.visible || maxLogScroll <= 0) return
      if (pointer.x < lx + 8 || pointer.x > lx + lw - 8) return
      if (pointer.y < ly + 50 || pointer.y > ly + 50 + logViewH) return
      logDrag = true
      logDragY = pointer.y
    })
    this.input.on('pointermove', function (pointer) {
      if (!logDrag) return
      logScrollY = Math.max(0, Math.min(maxLogScroll, logScrollY + (logDragY - pointer.y)))
      logDragY = pointer.y
      logContent.y = contentBaseY - logScrollY
    })
    this.input.on('pointerup', function () {
      logDrag = false
    })

    // 分隔线
    var sepGfx = this.add.graphics()
    sepGfx.lineStyle(1, 0x94a3b8, 0.15)
    sepGfx.lineBetween(dx + 30, dy + dh - 70, dx + dw - 30, dy + dh - 70)
    aboutContainer.add(sepGfx)

    // 关闭按钮
    var closeBtnW = dw - 60
    var closeBtnH = 36
    var closeBtnX = w / 2
    var closeBtnY = dy + dh - 45

    var closeBtn = this.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x1e293b)
      .setStrokeStyle(1, 0x67e8f9, 0.4)
      .setInteractive({ useHandCursor: true })
    aboutContainer.add(closeBtn)

    aboutContainer.add(this.add.text(closeBtnX, closeBtnY, '关闭', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))

    closeBtn.on('pointerover', function () {
      closeBtn.setFillStyle(0x334155)
      closeBtn.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    closeBtn.on('pointerout', function () {
      closeBtn.setFillStyle(0x1e293b)
      closeBtn.setStrokeStyle(1, 0x67e8f9, 0.4)
    })
    closeBtn.on('pointerdown', function () {
      aboutContainer.setVisible(false)
    })

    aboutBg.on('pointerdown', function () {
      aboutContainer.setVisible(true)
    }, this)

    // 更换皮肤按钮（关于左边）
    var skinBg = this.add.rectangle(w - 140, 27, 90, 34, 0x0f172a)
      .setStrokeStyle(1, 0x475569, 0.6)
      .setInteractive({ useHandCursor: true })
    this.add.text(w - 140, 27, '更换皮肤', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    skinBg.on('pointerover', function () {
      skinBg.setFillStyle(0x1e293b)
      skinBg.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    skinBg.on('pointerout', function () {
      skinBg.setFillStyle(0x0f172a)
      skinBg.setStrokeStyle(1, 0x475569, 0.6)
    })

    // 皮肤弹窗
    var skinContainer = this.add.container(0, 0).setDepth(1000).setVisible(false)
    var skinOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
      .setInteractive()
    skinContainer.add(skinOverlay)

    var sw = Math.min(380, w - 16), sh = Math.min(400, h - 16)
    var sx = w / 2 - sw / 2
    var sy = h / 2 - sh / 2

    var skinPanel = this.add.graphics()
    skinPanel.fillStyle(0x0f172a, 1)
    skinPanel.fillRoundedRect(sx, sy, sw, sh, 12)
    skinPanel.lineStyle(1.5, 0x67e8f9, 0.3)
    skinPanel.strokeRoundedRect(sx, sy, sw, sh, 12)
    skinContainer.add(skinPanel)

    var skinTitle = this.add.text(w / 2, sy + 28, '选择小人皮肤', {
      fontSize: '18px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)
    skinContainer.add(skinTitle)

    // 皮肤格子布局
    // 窄屏时整体等比缩放槽位（k=1 表示正常屏）
    var skinK = Math.min(1, (sw - 28) / (90 * 3 + 20 * 2))
    var slotW = Math.round(90 * skinK)
    var slotH = Math.round(96 * skinK)
    var slotGap = Math.round(20 * skinK)
    var perRowSkin = 3
    var gridX = w / 2 - (slotW * 3 + slotGap * 2) / 2
    var gridY = sy + 56

    // 两页：默认皮肤 / 其他皮肤
    var page1 = this.add.container(0, 0)
    var page2 = this.add.container(0, 0)
    skinContainer.add(page1)
    skinContainer.add(page2)

    var makeGridPage = function (container, list) {
      var hl = this.add.graphics()
      container.add(hl)

      var positions = []
      for (var i = 0; i < list.length; i++) {
        var col = i % perRowSkin
        var row = Math.floor(i / perRowSkin)
        var gx = gridX + col * (slotW + slotGap)
        var gy = gridY + row * (slotH + slotGap)
        var skin = list[i]
        positions.push({ id: skin.id, x: gx, y: gy })

        var slot = this.add.graphics()
        slot.fillStyle(0x1a1a2e, 1)
        slot.fillRoundedRect(gx, gy, slotW, slotH, 8)
        container.add(slot)

        // 皮肤预览（有图片用图片，否则画方块小人）
        if (skin.tex && this.textures.exists(skin.tex)) {
          var tw = this.textures.get(skin.tex).getSourceImage()
          var pscale = (40 * skinK) / Math.max(tw.width, tw.height)
          var img = this.add.image(gx + slotW / 2, gy + 34 * skinK, skin.tex).setScale(pscale)
          container.add(img)
        } else {
          var pv = this.add.graphics()
          pv.fillStyle(skin.color, 1)
          pv.fillRoundedRect(gx + slotW / 2 - 18 * skinK, gy + 14 * skinK,
            36 * skinK, 36 * skinK, 6)
          pv.fillStyle(0xffffff, 1)
          pv.fillCircle(gx + slotW / 2 - 6 * skinK, gy + 28 * skinK, 4 * skinK)
          pv.fillCircle(gx + slotW / 2 + 6 * skinK, gy + 28 * skinK, 4 * skinK)
          pv.fillStyle(0x000000, 1)
          pv.fillCircle(gx + slotW / 2 - 6 * skinK, gy + 28 * skinK, 2 * skinK)
          pv.fillCircle(gx + slotW / 2 + 6 * skinK, gy + 28 * skinK, 2 * skinK)
          container.add(pv)
        }

        container.add(this.add.text(gx + slotW / 2, gy + slotH - 14, skin.name, {
          fontSize: '11px', fill: '#94a3b8', fontFamily: 'Arial',
        }).setOrigin(0.5))

        var hit = this.add.rectangle(gx + slotW / 2, gy + slotH / 2, slotW, slotH, 0x000000, 0)
          .setInteractive({ useHandCursor: true })
        container.add(hit)
        hit.on('pointerdown', function (id) {
          return function () {
            setSkin(id)
            drawSkinHl(id)
          }
        }(skin.id))
      }

      // 空页提示
      if (list.length === 0) {
        container.add(this.add.text(w / 2, gridY + 60, '皮肤即将上线，敬请期待', {
          fontSize: '13px', fill: '#64748b', fontFamily: 'Arial',
        }).setOrigin(0.5))
      }

      return { hl: hl, positions: positions }
    }

    var grid1 = makeGridPage.call(this, page1, SKINS)
    var grid2 = makeGridPage.call(this, page2, OTHER_SKINS)

    var drawSkinHl = function (selectedId) {
      grid1.hl.clear()
      grid2.hl.clear()
      var grids = [grid1, grid2]
      for (var g = 0; g < grids.length; g++) {
        var pos = grids[g].positions
        for (var i = 0; i < pos.length; i++) {
          if (pos[i].id !== selectedId) continue
          grids[g].hl.lineStyle(2, 0x67e8f9, 1)
          grids[g].hl.strokeRoundedRect(pos[i].x, pos[i].y, slotW, slotH, 8)
        }
      }
    }

    // 页面切换按钮（两页共用位置）
    var switchBtn = this.add.rectangle(w / 2, sy + sh - 68, sw - 60, 34, 0x1e293b)
      .setStrokeStyle(1, 0x67e8f9, 0.4)
      .setInteractive({ useHandCursor: true })
    skinContainer.add(switchBtn)
    var switchTxt = this.add.text(w / 2, sy + sh - 68, '其他皮肤', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)
    skinContainer.add(switchTxt)

    var onOtherPage = false
    var refreshPage = function () {
      page1.setVisible(!onOtherPage)
      page2.setVisible(onOtherPage)
      skinTitle.setText(onOtherPage ? '其他皮肤' : '选择小人皮肤')
      switchTxt.setText(onOtherPage ? '返回默认皮肤' : '其他皮肤')
    }

    switchBtn.on('pointerover', function () {
      switchBtn.setFillStyle(0x334155)
      switchBtn.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    switchBtn.on('pointerout', function () {
      switchBtn.setFillStyle(0x1e293b)
      switchBtn.setStrokeStyle(1, 0x67e8f9, 0.4)
    })
    switchBtn.on('pointerdown', function () {
      onOtherPage = !onOtherPage
      refreshPage()
    })

    // 关闭按钮
    var skinClose = this.add.rectangle(w / 2, sy + sh - 26, sw - 60, 34, 0x1e293b)
      .setStrokeStyle(1, 0x67e8f9, 0.4)
      .setInteractive({ useHandCursor: true })
    skinContainer.add(skinClose)
    skinContainer.add(this.add.text(w / 2, sy + sh - 26, '关闭', {
      fontSize: '14px', fill: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))

    skinClose.on('pointerover', function () {
      skinClose.setFillStyle(0x334155)
      skinClose.setStrokeStyle(1, 0x67e8f9, 0.8)
    })
    skinClose.on('pointerout', function () {
      skinClose.setFillStyle(0x1e293b)
      skinClose.setStrokeStyle(1, 0x67e8f9, 0.4)
    })
    skinClose.on('pointerdown', function () {
      skinContainer.setVisible(false)
    })

    skinBg.on('pointerdown', function () {
      onOtherPage = false
      refreshPage()
      drawSkinHl(getSkinId())
      skinContainer.setVisible(true)
    }, this)

    // 标题
    this.add.text(cx, 70, '选择关卡', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(cx, 108, '挑战你的最短路径记录', {
      fontSize: '14px',
      fill: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    // 关卡数据
    var levels = [
      {
        id: 1,
        map: ['S...*', '####.', '.....', '.####', '*...E'],
        level: 'LEVEL 1',
        name: '第一章：迷雾森林',
        desc: '一座被迷雾笼罩的古老森林，\n传送门散布其中。',
        diff: '简单',
        diffColor: 0x4ade80,
        diffText: '#4ade80',
      },
      {
        id: 2,
        map: [
          'S..*...#',
          '###.##.#',
          '#...*..#',
          '#.###.##',
          '*...#..#',
          '###.#.##',
          '#...*..E',
        ],
        level: 'LEVEL 2',
        name: '第二章：幽暗地牢',
        desc: '阴暗潮湿的古老地牢，\n墙壁间隐藏着更多传送门。',
        diff: '普通',
        diffColor: 0xfbbf24,
        diffText: '#fbbf24',
      },
      {
        id: 3,
        map: [
          '#########',
          '#S#.....#',
          '#.#.###.#',
          '#*#...#.#',
          '#.#####.#',
          '#*.*..#.#',
          '#####.#.#',
          '#......E#',
          '#########',
        ],
        level: 'LEVEL 3',
        name: '第三章：回声洞穴',
        desc: '幽深的洞穴中回声不断，\n岔路比想象中更多。',
        diff: '困难',
        diffColor: 0xf87171,
        diffText: '#f87171',
      },
      {
        id: 4,
        map: [
          '###########',
          '#S#.......#',
          '#.#.###.#.#',
          '#*#.#.#.#.#',
          '#.#.#.#.###',
          '#*#...#...#',
          '#.#######.#',
          '#*.*.....E#',
          '###########',
        ],
        level: 'LEVEL 4',
        name: '第四章：迷宫回廊',
        desc: '错综复杂的回廊，\n没有传送门几乎无法通过。',
        diff: '困难',
        diffColor: 0xf87171,
        diffText: '#f87171',
      },
      {
        id: 5,
        map: [
          '###########',
          '#S#.......#',
          '#.#######.#',
          '#..*#.....#',
          '###.#*###.#',
          '#...#...#.#',
          '#.#####.#.#',
          '#.#..*..#.#',
          '#*#.#####.#',
          '#...#....E#',
          '###########',
        ],
        level: 'LEVEL 5',
        name: '第五章：传送门迷宫',
        desc: '传说中的核心迷宫，\n传送门网络交错如蛛网。',
        diff: '噩梦',
        diffColor: 0xc084fc,
        diffText: '#c084fc',
      },
    ]

    // 已通关的关卡数
    var cleared = 0
    for (var li = 0; li < levels.length; li++) {
      var b = parseInt(localStorage.getItem('maze_best_' + levels[li].id) || '0', 10)
      levels[li].bestSteps = b
      levels[li].minSteps = computeMinSteps(levels[li].map)
      if (b > 0) cleared++
    }

    // 卡片布局：按屏宽自适应列数（手机1列 / 中屏2列 / 宽屏3列）
    var perRow = w >= 880 ? 3 : (w >= 560 ? 2 : 1)
    var gapX = 24
    var gapY = 20
    var cardMargin = 40
    var cardW = Math.min(270, (w - cardMargin * 2 - (perRow - 1) * gapX) / perRow)
    var cardH = 224
    var totalW = Math.min(perRow, levels.length) * cardW + (Math.min(perRow, levels.length) - 1) * gapX
    var startX = cx - totalW / 2
    var startY = 128

    var startIndex = this.children.list.length
    for (var i = 0; i < levels.length; i++) {
      var col = i % perRow
      var row = Math.floor(i / perRow)
      this.createLevelCard(
        levels[i],
        startX + col * (cardW + gapX),
        startY + row * (cardH + gapY),
        cardW, cardH, cleared
      )
    }

    // 随机关卡卡片（排在所有关卡之后）
    var rIdx = levels.length
    this.createRandomCard(
      startX + (rIdx % perRow) * (cardW + gapX),
      startY + Math.floor(rIdx / perRow) * (cardH + gapY),
      cardW, cardH
    )

    // 把卡片收进滚动容器
    var cardObjs = this.children.list.slice(startIndex)
    var container = this.add.container(0, 0)
    cardObjs.forEach(function (obj) { container.add(obj) })

    // 滚动参数（行列数要把随机关卡也算进去，否则手机上滚不到它）
    var totalCards = levels.length + 1
    var cardRows = Math.ceil(totalCards / perRow)
    var contentH = cardRows * cardH + (cardRows - 1) * gapY
    var viewTop = startY
    var viewBottom = h - 16
    var viewH = viewBottom - viewTop
    var maxScroll = Math.max(0, contentH - viewH)
    var scrollY = 0

    // 裁剪卡片区域：避免滚动时压到顶部标题和底部版权行
    var cardMask = this.make.graphics({})
    cardMask.fillStyle(0xffffff)
    cardMask.fillRect(0, viewTop, w, viewH)
    container.setMask(cardMask.createGeometryMask())

    // 滚动条（右侧）
    var sbX = w - 14
    var sbTrack = this.add.graphics().setDepth(500)
    var sbThumb = this.add.graphics().setDepth(501)
    var thumbH = 0
    var thumbY = 0

    var drawScrollBar = function () {
      sbTrack.clear()
      sbThumb.clear()
      if (maxScroll <= 0) return

      sbTrack.fillStyle(0x1e293b, 0.6)
      sbTrack.fillRoundedRect(sbX - 4, viewTop, 8, viewH, 4)

      thumbH = Math.max(30, viewH * (viewH / contentH))
      thumbY = viewTop + (viewH - thumbH) * (scrollY / maxScroll)

      sbThumb.fillStyle(0x67e8f9, 0.5)
      sbThumb.fillRoundedRect(sbX - 4, thumbY, 8, thumbH, 4)
    }

    var applyScroll = function () {
      scrollY = Math.max(0, Math.min(maxScroll, scrollY))
      container.y = -scrollY
      drawScrollBar()
    }

    // 滚轮滚动（弹窗打开时不滚动卡片）
    this.input.on('wheel', function (pointer, objects, dx, dy) {
      if (aboutContainer.visible || skinContainer.visible || logContainer.visible) return
      scrollY += dy * 0.6
      applyScroll()
    })

    // 拖拽滚动：卡片区域任意位置滑动，或拖右缘条带（触屏没有滚轮）
    var dragging = false
    var dragOffset = 0
    var edgeDrag = false
    var edgeLastY = 0
    var contentDrag = false
    var contentMoved = false
    var contentStartY = 0
    var contentStartScroll = 0
    var dragThreshold = 8
    this._dragMoved = false
    sbThumb.setInteractive(new Phaser.Geom.Rectangle(sbX - 8, viewTop, 16, viewH), Phaser.Geom.Rectangle.Contains)

    this.input.on('pointerdown', function (pointer) {
      // 每次按下先重置，卡片在 pointerup 时据此区分「点击」和「滑动」
      this._dragMoved = false
      if (maxScroll <= 0) return
      if (aboutContainer.visible || skinContainer.visible || logContainer.visible) return
      // 右缘条带：手指拖动滚动（卡片右缘在 x ≤ w-40，不会误触）
      if (pointer.x >= w - 28 && pointer.y >= viewTop && pointer.y <= viewBottom) {
        edgeDrag = true
        edgeLastY = pointer.y
        return
      }
      // 卡片区域：先记起点，超过阈值才算拖动（否则视为点击卡片）
      if (pointer.x < w - 28 && pointer.y >= viewTop && pointer.y <= viewBottom) {
        contentDrag = true
        contentMoved = false
        contentStartY = pointer.y
        contentStartScroll = scrollY
      }
      var lx = pointer.x
      var ly = pointer.y
      if (lx < sbX - 12 || lx > sbX + 12) return
      if (ly < thumbY || ly > thumbY + thumbH) {
        // 点击轨道：跳转
        scrollY = ((ly - viewTop - thumbH / 2) / (viewH - thumbH)) * maxScroll
        applyScroll()
        dragOffset = thumbH / 2
      } else {
        dragOffset = ly - thumbY
      }
      dragging = true
    }, this)

    this.input.on('pointermove', function (pointer) {
      if (aboutContainer.visible || skinContainer.visible || logContainer.visible) {
        edgeDrag = false
        dragging = false
        contentDrag = false
        return
      }
      if (edgeDrag) {
        scrollY += edgeLastY - pointer.y
        edgeLastY = pointer.y
        applyScroll()
        return
      }
      // 卡片区域拖动：内容跟手，滑动距离超过阈值才生效
      if (contentDrag) {
        var d = pointer.y - contentStartY
        if (!contentMoved && Math.abs(d) > dragThreshold) contentMoved = true
        if (contentMoved) {
          this._dragMoved = true
          scrollY = contentStartScroll - d
          applyScroll()
          return
        }
      }
      if (!dragging || maxScroll <= 0) return
      scrollY = ((pointer.y - viewTop - dragOffset) / (viewH - thumbH)) * maxScroll
      applyScroll()
    }, this)

    this.input.on('pointerup', function () {
      dragging = false
      edgeDrag = false
      contentDrag = false
      contentMoved = false
      // _dragMoved 保留到下次 pointerdown，供卡片 pointerup 判断是否滑动过
    })

    // 底部版权（卡片滚动层之上、弹窗之下）
    this.add.text(w / 2, h - 14, '© 2026 Allenzby 保留所有权利', {
      fontSize: '11px', fill: '#475569', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(600)

    applyScroll()
  }

  createLevelCard(lv, cardX, cardY, cardW, cardH, cleared) {
    var unlocked = lv.id === 1 || cleared >= lv.id - 1
    var map = lv.map

    var card = this.add.graphics()
    card.fillStyle(0x0f172a, 1)
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 12)
    card.lineStyle(1.5, 0x67e8f9, unlocked ? 0.3 : 0.1)
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 12)

    // 迷宫预览（顶部）
    var innerW = cardW - 32
    var innerH = 78
    var cellSize = Math.min(Math.floor(innerW / map[0].length), Math.floor(innerH / map.length))
    var previewW = map[0].length * cellSize
    var previewH = map.length * cellSize
    var previewX = cardX + (cardW - previewW) / 2
    var previewY = cardY + 14 + (innerH - previewH) / 2

    var previewBg = this.add.graphics()
    previewBg.fillStyle(0x1a1a2e, 1)
    previewBg.fillRoundedRect(previewX - 4, previewY - 4, previewW + 8, previewH + 8, 6)

    for (var r = 0; r < map.length; r++) {
      for (var c = 0; c < map[r].length; c++) {
        var ch = map[r][c]
        var px = previewX + c * cellSize
        var py = previewY + r * cellSize
        var color = 0x1e293b
        if (ch === '#') color = 0x334155
        else if (ch === '*') color = 0xc084fc
        else if (ch === 'S') color = 0x4ade80
        else if (ch === 'E') color = 0xf87171
        previewBg.fillStyle(color, 0.8)
        previewBg.fillRect(px, py, cellSize, cellSize)
      }
    }

    // 文字区域（预览下方，左对齐）
    var tx = cardX + 16
    var ty = cardY + 12 + innerH + 8

    this.add.text(tx, ty, lv.level, {
      fontSize: '11px',
      fill: unlocked ? '#67e8f9' : '#475569',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    })

    this.add.text(tx, ty + 16, lv.name, {
      fontSize: '16px',
      fill: unlocked ? '#ffffff' : '#64748b',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    })

    this.add.text(tx, ty + 40, lv.desc, {
      fontSize: '11px',
      fill: '#94a3b8',
      fontFamily: 'Arial',
      lineSpacing: 3,
    })

    // 难度标签
    var tagY = ty + 72

    var diffTag = this.add.graphics()
    diffTag.fillStyle(lv.diffColor, unlocked ? 0.2 : 0.08)
    diffTag.fillRoundedRect(tx, tagY, 44, 20, 4)

    this.add.text(tx + 22, tagY + 10, lv.diff, {
      fontSize: '11px',
      fill: unlocked ? lv.diffText : '#475569',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    // 状态（右侧）
    if (unlocked) {
      this.add.text(cardX + cardW - 16, tagY + 10, '可挑战', {
        fontSize: '11px',
        fill: '#fbbf24',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(1, 0.5)
    } else {
      this.add.text(cardX + cardW - 16, tagY + 10, '未解锁', {
        fontSize: '11px',
        fill: '#64748b',
        fontFamily: 'Arial',
      }).setOrigin(1, 0.5)
    }

    // 最佳步数 / 通关状态
    if (lv.bestSteps > 0) {
      this.add.text(tx, tagY + 26, '★ 最佳 ' + lv.bestSteps + ' 步', {
        fontSize: '12px',
        fill: '#4ade80',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      this.add.text(cardX + cardW - 16, tagY + 26, '最少 ' + lv.minSteps + ' 步', {
        fontSize: '11px',
        fill: '#67e8f9',
        fontFamily: 'Arial',
      }).setOrigin(1, 0)
    } else if (unlocked) {
      this.add.text(tx, tagY + 26, '尚未通关', {
        fontSize: '12px',
        fill: '#64748b',
        fontFamily: 'Arial',
      })
      this.add.text(cardX + cardW - 16, tagY + 26, '最少 ' + lv.minSteps + ' 步', {
        fontSize: '11px',
        fill: '#475569',
        fontFamily: 'Arial',
      }).setOrigin(1, 0)
    }

    if (!unlocked) return

    var hitArea = this.add.rectangle(cardX + cardW / 2, cardY + cardH / 2, cardW, cardH, 0x000000, 0)
    hitArea.setInteractive({ useHandCursor: true })
    hitArea.setDepth(100)

    hitArea.on('pointerover', function () {
      card.clear()
      card.fillStyle(0x1e293b, 1)
      card.fillRoundedRect(cardX, cardY, cardW, cardH, 12)
      card.lineStyle(2, 0x67e8f9, 0.8)
      card.strokeRoundedRect(cardX, cardY, cardW, cardH, 12)
    })

    hitArea.on('pointerout', function () {
      card.clear()
      card.fillStyle(0x0f172a, 1)
      card.fillRoundedRect(cardX, cardY, cardW, cardH, 12)
      card.lineStyle(1.5, 0x67e8f9, 0.3)
      card.strokeRoundedRect(cardX, cardY, cardW, cardH, 12)
    })

    hitArea.on('pointerup', function () {
      if (this._dragMoved) return
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', function () {
        this.scene.start('GameScene', { map: lv.map, levelId: lv.id })
      }, this)
    }, this)
  }

  // ========== 随机关卡 ==========

  createRandomCard(cardX, cardY, cardW, cardH) {
    var self = this

    var card = this.add.graphics()
    var drawCard = function (hover) {
      card.clear()
      card.fillStyle(hover ? 0x1e293b : 0x0f172a, 1)
      card.fillRoundedRect(cardX, cardY, cardW, cardH, 12)
      card.lineStyle(hover ? 2 : 1.5, 0xc084fc, hover ? 0.9 : 0.35)
      card.strokeRoundedRect(cardX, cardY, cardW, cardH, 12)
    }
    drawCard(false)

    // 预览区：大问号 + 彩色装饰
    var innerW = cardW - 32
    var innerH = 78
    var pvX = cardX + 16
    var pvY = cardY + 14
    var pv = this.add.graphics()
    pv.fillStyle(0x1a1a2e, 1)
    pv.fillRoundedRect(pvX, pvY, innerW, innerH, 6)
    var deco = [0x4ade80, 0x67e8f9, 0xf87171, 0xc084fc]
    for (var d = 0; d < 4; d++) {
      pv.fillStyle(deco[d], 0.28)
      pv.fillRoundedRect(pvX + 12 + d * 16, pvY + innerH - 16, 10, 10, 2)
    }
    this.add.text(cardX + cardW / 2, pvY + innerH / 2 - 3, '?', {
      fontSize: '42px', fill: '#c084fc', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    var tx = cardX + 16
    var ty = cardY + 12 + innerH + 8

    this.add.text(tx, ty, 'RANDOM', {
      fontSize: '11px', fill: '#c084fc', fontFamily: 'Arial', fontStyle: 'bold',
    })
    this.add.text(tx, ty + 16, '随机关卡', {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    })
    this.add.text(tx, ty + 40, '点击后自动生成，\n每次都是全新的迷宫。', {
      fontSize: '11px', fill: '#94a3b8', fontFamily: 'Arial', lineSpacing: 3,
    })

    var tagY = ty + 72
    var diffTag = this.add.graphics()
    diffTag.fillStyle(0xc084fc, 0.2)
    diffTag.fillRoundedRect(tx, tagY, 44, 20, 4)
    this.add.text(tx + 22, tagY + 10, '随机', {
      fontSize: '11px', fill: '#c084fc', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(cardX + cardW - 16, tagY + 10, '即点即玩', {
      fontSize: '11px', fill: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(1, 0.5)

    this.add.text(tx, tagY + 26, '每次都不一样', {
      fontSize: '12px', fill: '#64748b', fontFamily: 'Arial', fontStyle: 'bold',
    })
    this.add.text(cardX + cardW - 16, tagY + 26, '4 步生成', {
      fontSize: '11px', fill: '#67e8f9', fontFamily: 'Arial',
    }).setOrigin(1, 0)

    var hitArea = this.add.rectangle(cardX + cardW / 2, cardY + cardH / 2, cardW, cardH, 0x000000, 0)
    hitArea.setInteractive({ useHandCursor: true })
    hitArea.setDepth(100)

    hitArea.on('pointerover', function () { drawCard(true) })
    hitArea.on('pointerout', function () { drawCard(false) })
    hitArea.on('pointerup', function () {
      if (self._dragMoved) return
      self.startRandomLevel()
    })
  }

  // DFS 生成一张随机迷宫（奇数尺寸、含 2~4 个传送门、S→E 保证可达）
  generateRandomMap() {
    var rows = 9 + 2 * Math.floor(Math.random() * 3) // 9 / 11 / 13
    var cols = 9 + 2 * Math.floor(Math.random() * 3)
    var g = []
    for (var r = 0; r < rows; r++) {
      g[r] = []
      for (var c = 0; c < cols; c++) g[r][c] = '#'
    }

    // DFS 挖通所有单元格
    var stack = [[1, 1]]
    g[1][1] = '.'
    var dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]]
    while (stack.length) {
      var top = stack[stack.length - 1]
      var r0 = top[0], c0 = top[1]
      var order = dirs.slice()
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp
      }
      var carved = false
      for (var k = 0; k < 4; k++) {
        var nr = r0 + order[k][0], nc = c0 + order[k][1]
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && g[nr][nc] === '#') {
          g[r0 + order[k][0] / 2][c0 + order[k][1] / 2] = '.'
          g[nr][nc] = '.'
          stack.push([nr, nc])
          carved = true
          break
        }
      }
      if (!carved) stack.pop()
    }

    // 随机拆掉几堵墙，制造环路（更耐玩）
    var extra = Math.floor(rows * cols * 0.04)
    var tries = 0
    while (extra > 0 && tries < 300) {
      tries++
      var rr = 1 + Math.floor(Math.random() * (rows - 2))
      var cc = 1 + Math.floor(Math.random() * (cols - 2))
      if (g[rr][cc] !== '#') continue
      var horiz = g[rr][cc - 1] === '.' && g[rr][cc + 1] === '.'
      var vert = g[rr - 1][cc] === '.' && g[rr + 1][cc] === '.'
      if (horiz || vert) { g[rr][cc] = '.'; extra-- }
    }

    // 起点 / 终点
    g[1][1] = 'S'
    g[rows - 2][cols - 2] = 'E'

    // 随机放 2~4 个传送门
    var floors = []
    for (var r2 = 1; r2 < rows - 1; r2++) {
      for (var c2 = 1; c2 < cols - 1; c2++) {
        if (g[r2][c2] === '.') floors.push([r2, c2])
      }
    }
    for (var f = floors.length - 1; f > 0; f--) {
      var j2 = Math.floor(Math.random() * (f + 1))
      var t2 = floors[f]; floors[f] = floors[j2]; floors[j2] = t2
    }
    var pn = Math.min(floors.length, 2 + Math.floor(Math.random() * 3))
    for (var p = 0; p < pn; p++) g[floors[p][0]][floors[p][1]] = '*'

    var map = []
    for (var r3 = 0; r3 < rows; r3++) map.push(g[r3].join(''))
    return map
  }

  // 点击随机关卡：4 步进度条逐项完成，最后进入关卡
  startRandomLevel() {
    if (this._genRunning) return
    this._genRunning = true
    var self = this
    var w = this.scale.width
    var h = this.scale.height

    // 遮罩 + 面板
    var layer = this.add.container(0, 0).setDepth(2000)
    var dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.78).setInteractive()
    layer.add(dim)

    var pw = Math.min(430, w - 40)
    var ph = Math.min(288, h - 20)
    var px = w / 2 - pw / 2
    var py = h / 2 - ph / 2

    var panel = this.add.graphics()
    panel.fillStyle(0x0f172a, 1)
    panel.fillRoundedRect(px, py, pw, ph, 14)
    panel.lineStyle(2, 0xc084fc, 0.6)
    panel.strokeRoundedRect(px, py, pw, ph, 14)
    layer.add(panel)

    layer.add(this.add.text(w / 2, py + 30, '正在生成随机关卡', {
      fontSize: '18px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5))

    // 4 个步骤（与说明文档一致）
    var steps = ['设计地图', '添加关卡数据', '检查自动适配', '构建验证']
    var subs = [
      'DFS 随机挖出一张新迷宫',
      function () { return '本次 ' + data.size + '，' + data.portals + ' 个传送门' },
      'BFS 校验 S→E 可达并计算最少步数',
      function () { return '校验通过，可以挑战了' },
    ]
    var stepTexts = []
    for (var i = 0; i < 4; i++) {
      var st = this.add.text(px + 42, py + 60 + i * 24, (i + 1) + '. ' + steps[i], {
        fontSize: '13px', fill: '#475569', fontFamily: 'Arial',
      })
      stepTexts.push(st)
      layer.add(st)
    }

    var subText = this.add.text(w / 2, py + 200, subs[0], {
      fontSize: '12px', fill: '#94a3b8', fontFamily: 'Arial',
    }).setOrigin(0.5)
    layer.add(subText)

    // 进度条
    var barW = pw - 90
    var bx = w / 2 - barW / 2
    var by = py + ph - 46
    var track = this.add.graphics()
    track.fillStyle(0x1e293b, 1)
    track.fillRoundedRect(bx, by, barW, 14, 7)
    layer.add(track)
    var fillBar = this.add.rectangle(bx, by + 7, barW, 12, 0xc084fc).setOrigin(0, 0.5)
    fillBar.setScale(0.001, 1)
    layer.add(fillBar)
    var pctText = this.add.text(bx + barW + 14, by + 7, '0%', {
      fontSize: '12px', fill: '#c084fc', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    layer.add(pctText)

    // ★ 最少步数重点提示：第 3 步算出后金色弹出（步骤列表下方独立居中一行）
    var hlY = py + 172
    var hlBg = this.add.graphics().setVisible(false)
    var hlText = this.add.text(w / 2, hlY, '', {
      fontSize: '20px', fill: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setVisible(false)
    layer.add(hlBg)
    layer.add(hlText)
    var showMin = function () {
      hlText.setText('★ 最少 ' + data.min + ' 步')
      var bw = hlText.width + 44
      var bx2 = w / 2 - bw / 2
      var by2 = hlY - 21
      hlBg.clear()
      hlBg.fillStyle(0xfbbf24, 0.16)
      hlBg.fillRoundedRect(bx2, by2, bw, 42, 10)
      hlBg.lineStyle(1.5, 0xfbbf24, 0.75)
      hlBg.strokeRoundedRect(bx2, by2, bw, 42, 10)
      hlBg.setVisible(true)
      hlText.setVisible(true)
      hlText.setScale(0.3)
      hlBg.setAlpha(0)
      self.tweens.add({ targets: hlBg, alpha: 1, duration: 260 })
      self.tweens.add({
        targets: hlText, scale: 1, duration: 420, ease: 'Cubic.easeOut',
      })
    }

    // 每一步的真实工作
    var data = { map: null, min: 0, size: '', portals: 0 }
    var work = [
      function () { data.map = self.generateRandomMap() },
      function () {
        data.size = data.map.length + '×' + data.map[0].length
        data.portals = data.map.join('').split('*').length - 1
      },
      function () { data.min = computeMinSteps(data.map) },
      function () {
        // 最终校验，不通过就地重新生成
        var m = data.map
        var ok = m.every(function (row) { return row.length === m[0].length })
        var s = m.join('')
        if (ok && s.indexOf('S') >= 0 && s.indexOf('E') >= 0 && m.join('').split('*').length - 1 >= 2) return
        data.map = self.generateRandomMap()
        data.min = computeMinSteps(data.map)
        data.size = data.map.length + '×' + data.map[0].length
        data.portals = data.map.join('').split('*').length - 1
      },
    ]

    var cur = -1
    var setStep = function (idx) {
      if (cur >= 0) {
        stepTexts[cur].setColor('#4ade80')
        stepTexts[cur].setText('✓ ' + (cur + 1) + '. ' + steps[cur])
      }
      cur = idx
      work[idx]()
      if (idx === 2) showMin()
      stepTexts[idx].setColor('#67e8f9')
      stepTexts[idx].setText('▶ ' + (idx + 1) + '. ' + steps[idx])
      var sv = subs[idx]
      subText.setText(typeof sv === 'function' ? sv() : sv)
    }

    setStep(0)
    for (var s = 1; s < 4; s++) {
      this.time.addEvent({
        delay: s * 750,
        callback: function (idx) {
          return function () { setStep(idx) }
        }(s),
      })
    }

    // 进度条 3 秒走满
    var prog = { v: 0 }
    this.tweens.add({
      targets: prog, v: 1, duration: 3000, ease: 'Linear',
      onUpdate: function () { pctText.setText(Math.round(prog.v * 100) + '%') },
    })
    this.tweens.add({ targets: fillBar, scaleX: 1, duration: 3000, ease: 'Linear' })

    // 完成后进入关卡
    this.time.addEvent({
      delay: 3300,
      callback: function () {
        stepTexts[3].setColor('#4ade80')
        stepTexts[3].setText('✓ 4. ' + steps[3])
        pctText.setText('100%')
        self.cameras.main.fadeOut(400, 0, 0, 0)
        self.cameras.main.once('camerafadeoutcomplete', function () {
          self.scene.start('GameScene', { map: data.map, levelId: 'random' })
        })
      },
    })
  }
}
