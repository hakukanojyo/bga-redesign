// 把 design-source/games/ 的原圖壓縮成 WebP，放進 src/assets/images/games/（npm run images）
// 原圖不進 git；補圖或換圖後重跑一次就好。檔名照「代稱_banner／box／logo」
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE = 'design-source/games'
const OUTPUT = 'src/assets/images/games'

// 最大寬度約是畫面上的 2 倍（Retina）；比原圖小的不放大
const maxWidth = { banner: 1400, box: 280, logo: 800 }

await mkdir(OUTPUT, { recursive: true })

const files = (await readdir(SOURCE)).filter((file) => /_(banner|box|logo)\.(png|jpe?g)$/.test(file))

let before = 0
let after = 0
for (const file of files) {
  const kind = file.match(/_(banner|box|logo)\./)[1]
  const name = file.replace(/\.(png|jpe?g)$/, '.webp')
  const source = path.join(SOURCE, file)
  const { size: outputSize } = await sharp(source)
    .resize({ width: maxWidth[kind], withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(OUTPUT, name))
  before += (await stat(source)).size
  after += outputSize
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)
console.log(`轉了 ${files.length} 張：${mb(before)} MB → ${mb(after)} MB`)
