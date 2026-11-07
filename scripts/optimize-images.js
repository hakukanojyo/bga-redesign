// 把 design-source/ 的原圖壓縮成 WebP，放進 src/assets/images/（npm run images）
// 原圖不進 git；補圖或換圖後重跑一次就好
// - games/：檔名「代稱_banner／box／logo」；順便算出每張橫幅的主色，存成 games/colors.json
// - avatars/：假玩家的頭像（Unsplash，來源見 design-source/avatars/CREDITS.md）
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// 最大寬度約是畫面上的 2 倍（Retina）；比原圖小的不放大
const jobs = [
  { source: 'design-source/games', output: 'src/assets/images/games', widthOf: (file) => ({ banner: 1400, box: 280, logo: 800 })[file.match(/_(banner|box|logo)\./)?.[1]] },
  { source: 'design-source/avatars', output: 'src/assets/images/avatars', widthOf: () => 72 },
]

let count = 0
let before = 0
let after = 0
const colors = {}

for (const { source, output, widthOf } of jobs) {
  await mkdir(output, { recursive: true })
  const files = (await readdir(source)).filter((file) => /\.(png|jpe?g)$/.test(file) && widthOf(file))
  for (const file of files) {
    const input = path.join(source, file)
    // 標準字的原圖是正方形，字只佔中間一條：先裁掉四周的透明空白，放進版面才不會變很小
    const image = file.includes('_logo.') ? sharp(input).trim() : sharp(input)
    const { size } = await image
      .resize({ width: widthOf(file), withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(output, file.replace(/\.(png|jpe?g)$/, '.webp')))
    count += 1
    before += (await stat(input)).size
    after += size
    if (file.includes('_banner.')) colors[file.split('_banner.')[0]] = await accentColor(input)
  }
}

await writeFile('src/assets/images/games/colors.json', JSON.stringify(colors, null, 2) + '\n')

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)
console.log(`轉了 ${count} 張：${mb(before)} MB → ${mb(after)} MB；算了 ${Object.keys(colors).length} 張橫幅的主色`)

// ---------- 主色擷取（dominant color extraction） ----------
// 主視覺按鈕跟著橫幅換色（docs/adr/0014）：
// 1. 縮小成 64 寬，只看「鮮豔」的像素（飽和度夠、不會太亮或太暗），依色相分 24 組，取最多的那組平均
//    （Android Palette 的 Vibrant 做法：面積最大的常常是灰色背景，所以不直接取最多的顏色）
// 2. 調深到白字的對比度 ≥ 4.5:1（WCAG AA），按鈕上的白字才看得清楚
async function accentColor(file) {
  const { data, info } = await sharp(file).resize({ width: 64 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const bins = Array.from({ length: 24 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }))
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const { h, s, l } = toHsl(r, g, b)
    if (s < 0.35 || l < 0.2 || l > 0.8) continue
    const bin = bins[Math.floor(h * 24) % 24]
    bin.weight += s
    bin.r += r * s
    bin.g += g * s
    bin.b += b * s
  }
  const best = bins.reduce((a, b) => (b.weight > a.weight ? b : a))
  // 整張圖都不鮮豔（例如黑白的月亮）就用品牌藍
  if (best.weight === 0) return '#0b72b5'
  let { h, s, l } = toHsl(best.r / best.weight, best.g / best.weight, best.b / best.weight)
  while (contrastWithWhite(fromHsl(h, s, l)) < 4.5 && l > 0.05) l -= 0.02
  return toHex(fromHsl(h, s, l))
}

function toHsl(r, g, b) {
  ;[r, g, b] = [r / 255, g / 255, b / 255]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: h / 6, s, l }
}

function fromHsl(h, s, l) {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t) => {
    t = (t + 1) % 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)].map((value) => Math.round(value * 255))
}

// WCAG 的相對亮度與對比度
function contrastWithWhite(rgb) {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return 1.05 / (luminance + 0.05)
}

function toHex(rgb) {
  return '#' + rgb.map((value) => value.toString(16).padStart(2, '0')).join('')
}
