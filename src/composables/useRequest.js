import { ref } from 'vue'

// 一個區塊自己拿資料：status 只有 loading、success、error 三種
// 失敗只影響這個區塊（產品規則 5.3）；retry 再拿一次，比較晚回來的舊結果不會蓋掉新的
export function useRequest(request) {
  const data = ref(null)
  const status = ref('loading')
  let latest = 0

  async function run() {
    const id = ++latest
    status.value = 'loading'
    try {
      const result = await request()
      if (id !== latest) return
      data.value = result
      status.value = 'success'
    } catch {
      if (id === latest) status.value = 'error'
    }
  }

  run()
  return { data, status, retry: run }
}
