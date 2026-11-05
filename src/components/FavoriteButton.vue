<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps({
  slug: { type: String, required: true },
})

const favorites = useFavoritesStore()
const added = computed(() => favorites.isFavorite(props.slug))
</script>

<!--
  Figma：Button/Favorite（351:4112）default、hover、action、added、added-hover（已加入時 hover 再深一階，不然滑上去沒變化）。按一下加入，已加入時再按一下取消（GAME-02、PRD 7.9）。
  底下 2px 是立體感的邊；按下時 Figma 拿掉這條邊（32 → 30 高），這裡改成和底色同色，尺寸不變（同 AppButton）。
  aria-pressed 讓螢幕閱讀器知道是開還是關
-->
<template>
  <button
    type="button"
    :aria-pressed="added"
    class="relative inline-flex min-h-(--tap-button-min-height) items-center gap-4 rounded-8 border-b-2 border-favorite-border px-8 py-4 type-tc-label-14 whitespace-nowrap text-text-inverse active:border-favorite-bg-active active:bg-favorite-bg-active"
    :class="
      added
        ? 'bg-favorite-bg-active hover:bg-favorite-bg-active-hover'
        : 'bg-favorite-bg hover:bg-favorite-bg-active'
    "
    @click="favorites.toggle(slug)"
  >
    <FontAwesomeIcon
      :icon="faHeart"
      class="text-[16px]"
      :class="added && 'text-favorite-icon-active'"
      aria-hidden="true"
    />
    {{ added ? '已加入收藏' : '加入收藏' }}
  </button>
</template>
