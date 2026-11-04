// 假資料的共用延遲：網址加 ?scenario=slow 或 error 可以看到載入中和失敗（ADR 0005）
export function fakeRequest(data) {
  const scenario = new URLSearchParams(window.location.search).get('scenario')
  const delay = scenario === 'slow' ? 3000 : 300

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario === 'error') reject(new Error('fake error'))
      else resolve(structuredClone(data))
    }, delay)
  })
}
