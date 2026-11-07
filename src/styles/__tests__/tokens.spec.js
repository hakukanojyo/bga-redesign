import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Vitest 預設不處理 CSS，用 ?raw import 會拿到空字串，所以直接讀檔（路徑從專案根目錄算）
const css = readFileSync('src/styles/tokens.css', 'utf8')

const defined = new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]))
const semantic = [...css.matchAll(/^\s*(--color-[\w-]+):\s*(.+);/gm)].map((m) => ({
  name: m[1],
  value: m[2],
}))

describe('design tokens', () => {
  it('has semantic colors', () => {
    expect(semantic.length).toBeGreaterThan(0)
  })

  it('semantic colors only point to primitives, never hard-coded values', () => {
    const notAlias = semantic.filter((t) => !/^var\(--[\w-]+\)$/.test(t.value))
    expect(notAlias).toEqual([])
  })

  it('every semantic color resolves to a defined primitive', () => {
    const missing = semantic
      .map((t) => t.value.match(/var\((--[\w-]+)\)/)?.[1])
      .filter((ref) => ref && !defined.has(ref))
    expect(missing).toEqual([])
  })

  it('every var() used in the file is defined', () => {
    const refs = [...css.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1])
    expect(refs.filter((ref) => !defined.has(ref))).toEqual([])
  })
})
