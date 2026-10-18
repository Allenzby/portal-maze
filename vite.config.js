import { defineConfig } from 'vite'
import net from 'node:net'

// 首选端口：第一个游戏用 5173，本游戏用 5174
// Windows 的端口排除段（Hyper-V 等）会不定期漂移罩住首选端口，
// 启动时逐个探测，被排除就顺延到下一个可用端口
const PREFERRED_PORT = 5174

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer()
    srv.once('error', () => resolve(false))
    srv.listen(port, '127.0.0.1', () => srv.close(() => resolve(true)))
  })
}

async function pickPort(preferred) {
  for (let p = preferred; p <= preferred + 200; p++) {
    if (await isPortFree(p)) return p
  }
  return preferred
}

export default defineConfig(async ({ command }) => {
  // 只有开发服务器才需要选端口；生产构建（vite build）直接跳过，
  // 避免在 CI/Netlify 构建容器里创建监听套接字
  let port = PREFERRED_PORT
  if (command === 'serve') {
    port = await pickPort(PREFERRED_PORT)
    if (port !== PREFERRED_PORT) {
      console.log(`  端口 ${PREFERRED_PORT} 不可用，已顺延至 ${port}`)
    }
  }
  return {
    base: './',
    server: {
      host: '127.0.0.1',
      port,
      open: true,
    },
    build: {
      outDir: 'dist',
    },
  }
})
