import { filterCategories } from '@/api/data/options'

// 篩選條件放在網址（PRD 7.3 第 3 條）：?players=2&types=family,classic。
// 不認得的代號丟掉，單選的只留第一個，手改網址也不會壞
export function filtersFromQuery(query) {
  return Object.fromEntries(
    filterCategories.map(({ key, labels, multiple }) => {
      const values = String(query[key] ?? '')
        .split(',')
        .filter((value) => value in labels)
      return [key, multiple ? [...new Set(values)] : values.slice(0, 1)]
    }),
  )
}

// 反過來：沒選的類別是 undefined，網址上就不會出現
export function filtersToQuery(filters) {
  return Object.fromEntries(
    filterCategories.map(({ key }) => [
      key,
      filters[key]?.length ? filters[key].join(',') : undefined,
    ]),
  )
}

export const hasFilters = (filters) => Object.values(filters).some((values) => values.length)

// 「複雜度：適合深度玩家」「特定類型：家庭、經典」
export function filterLabel(key, values) {
  const category = filterCategories.find((item) => item.key === key)
  return `${category.title}：${values.map((value) => category.labels[value]).join('、')}`
}
