import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// 判斷寫在 index.html 的 inline script（畫面出現前就要跑），測試直接讀檔、換掉 navigator 執行
const html = readFileSync('index.html', 'utf8')
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((code) => code.includes('reduce-blur'))

function reducesBlur(navigator) {
  const classes = new Set()
  const document = { documentElement: { classList: { add: (name) => classes.add(name) } } }
  new Function('navigator', 'document', script)(navigator, document)
  return classes.has('reduce-blur')
}

describe('blur fallback (SYS-10)', () => {
  it('keeps blur on capable devices', () => {
    expect(reducesBlur({ deviceMemory: 8, hardwareConcurrency: 8 })).toBe(false)
  })

  it('removes blur with 4GB of memory or less', () => {
    expect(reducesBlur({ deviceMemory: 4, hardwareConcurrency: 8 })).toBe(true)
  })

  it('removes blur with 4 cores or fewer', () => {
    expect(reducesBlur({ deviceMemory: 8, hardwareConcurrency: 4 })).toBe(true)
  })

  it('judges by cores alone when memory is unknown (Safari)', () => {
    expect(reducesBlur({ hardwareConcurrency: 8 })).toBe(false)
    expect(reducesBlur({ hardwareConcurrency: 2 })).toBe(true)
  })

  it('keeps blur when the browser reports nothing', () => {
    expect(reducesBlur({})).toBe(false)
  })
})
