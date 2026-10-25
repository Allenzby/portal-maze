// 理论最少步数：普通移动算1步，传送门互传算1步（BFS）
export function computeMinSteps(map) {
  var rows = map.length
  var cols = map[0].length
  var start = null
  var end = null
  var portals = []

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var ch = map[r][c]
      if (ch === 'S') start = { r: r, c: c }
      else if (ch === 'E') end = { r: r, c: c }
      else if (ch === '*') portals.push({ r: r, c: c })
    }
  }
  if (!start || !end) return 0

  var dist = {}
  dist[start.r + ',' + start.c] = 0
  var queue = [start]
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]

  while (queue.length > 0) {
    var cur = queue.shift()
    var curKey = cur.r + ',' + cur.c
    var d = dist[curKey]

    if (cur.r === end.r && cur.c === end.c) return d

    // 普通移动
    for (var i = 0; i < dirs.length; i++) {
      var nr = cur.r + dirs[i][0]
      var nc = cur.c + dirs[i][1]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (map[nr][nc] === '#') continue
      var nk = nr + ',' + nc
      if (dist[nk] !== undefined) continue
      dist[nk] = d + 1
      queue.push({ r: nr, c: nc })
    }

    // 站在传送门上：可传送到任意其他传送门
    if (map[cur.r][cur.c] === '*') {
      for (var j = 0; j < portals.length; j++) {
        var pr = portals[j].r
        var pc = portals[j].c
        if (pr === cur.r && pc === cur.c) continue
        var pk = pr + ',' + pc
        if (dist[pk] !== undefined) continue
        dist[pk] = d + 1
        queue.push({ r: pr, c: pc })
      }
    }
  }

  return 0
}
