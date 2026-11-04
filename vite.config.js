import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// 頁尾的推出時間：格式照 BGA，年月日-時分-commit（例：261104-1215-a484ce2），用台灣時間（CI 的主機是 UTC）
function buildVersion() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const part = (type) => parts.find((p) => p.type === type).value
  const commit = execSync('git rev-parse --short HEAD').toString().trim()
  return `${part('year')}${part('month')}${part('day')}-${part('hour')}${part('minute')}-${commit}`
}

// https://vite.dev/config/
export default defineConfig({
  // build 時把值直接寫進程式（不是執行時才算），每次 build、部署都會更新
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion()),
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
