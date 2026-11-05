import { toast as sonner } from 'vue-sonner'

// 規則見 Figma Toast 元件說明：一個提示最多一個動作；附「復原」停 5 秒，其餘 3 秒
export const UNDO_DURATION = 5000
export const DEFAULT_DURATION = 3000

export const toast = {
  // 使用者自己做的動作的結果；可以撤銷的才傳 undo
  neutral(message, { undo } = {}) {
    return sonner(message, {
      duration: undo ? UNDO_DURATION : DEFAULT_DURATION,
      action: undo ? { label: '復原', onClick: undo } : undefined,
    })
  },
  // 系統完成一件有份量的事；onView 前往結果所在的地方，不會撤銷
  success(message, { onView } = {}) {
    return sonner.success(message, {
      duration: DEFAULT_DURATION,
      action: onView ? { label: '查看', onClick: onView } : undefined,
    })
  },
  // 操作失敗，不附動作
  error(message) {
    return sonner.error(message, { duration: DEFAULT_DURATION })
  },
}
