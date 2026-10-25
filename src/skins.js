export const SKINS = [
  { id: 'classic', name: '经典蓝', color: 0x00d4ff, tex: 'skin_classic' },
  { id: 'emerald', name: '翡翠绿', color: 0x4ade80, tex: 'skin_emerald' },
  { id: 'violet', name: '幻影紫', color: 0xc084fc, tex: 'skin_violet' },
  { id: 'amber', name: '熔岩橙', color: 0xfbbf24, tex: 'skin_amber' },
  { id: 'rose', name: '樱花粉', color: 0xf472b6, tex: 'skin_rose' },
  { id: 'crimson', name: '烈焰红', color: 0xf87171, tex: 'skin_crimson' },
]

// 其他皮肤：避免使用品牌名，按外观取名
export const OTHER_SKINS = [
  { id: 'deepseek', name: '深蓝鲸鱼', color: 0x4d6bfe, tex: 'skin_deepseek' },
  { id: 'qianwen', name: '蔚蓝旋镖', color: 0x0013ff, tex: 'skin_qianwen' },
  { id: 'kimi', name: '墨白密钥', color: 0x111111, tex: 'skin_kimi' },
]

export function getSkinId() {
  return localStorage.getItem('maze_skin') || 'classic'
}

export function getAllSkins() {
  return SKINS.concat(OTHER_SKINS)
}

export function getSkin() {
  var all = getAllSkins()
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === getSkinId()) return all[i]
  }
  return SKINS[0]
}

export function setSkin(id) {
  localStorage.setItem('maze_skin', id)
}
