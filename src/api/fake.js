// 假資料的共用延遲：網址加 ?scenario=slow、error、empty 可以看到載入中、失敗、空的（ADR 0005）
export function scenario() {
  return new URLSearchParams(window.location.search).get('scenario')
}

export function fakeRequest(data) {
  const delay = scenario() === 'slow' ? 3000 : 300

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario() === 'error') reject(new Error('fake error'))
      else resolve(structuredClone(data))
    }, delay)
  })
}

// 收藏、我的牌桌存在 localStorage，模擬伺服器；私密瀏覽或被封鎖時讀寫會失敗，就退回預設值
export function loadStored(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : structuredClone(fallback)
  } catch {
    return structuredClone(fallback)
  }
}

export function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 存不了就只在這次瀏覽有效
  }
}
