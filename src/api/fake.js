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

// 可用性測試的乾淨狀態（#70）：網址參數換頁就不見了，所以打開時直接改 localStorage，換頁後還是乾淨的。
// 使用者自己改得到的三份寫成空清單（key 和 tables.js、favorites.js、history.js 的一樣，改名時一起改）；
// 遊玩紀錄是固定假資料，靠 USERTEST_KEY 當作沒有
const USERTEST_KEY = 'bga:usertest'
const USER_KEYS = ['bga:myTables:v2', 'bga:favorites', 'bga:recently-viewed']

// main.js 掛載 App 之前呼叫，第一次拿資料就是乾淨的。usertest 每次打開都重新清空（換受試者、換版本時開一次）；reset 回到預設展示資料
export function applyStoredScenario() {
  if (scenario() === 'usertest') {
    USER_KEYS.forEach((key) => saveStored(key, []))
    saveStored(USERTEST_KEY, true)
  } else if (scenario() === 'reset') {
    try {
      ;[...USER_KEYS, USERTEST_KEY].forEach((key) => localStorage.removeItem(key))
    } catch {
      // 存取不了就沒有東西要清
    }
  }
}

export function isUserTest() {
  return loadStored(USERTEST_KEY, false) === true
}
