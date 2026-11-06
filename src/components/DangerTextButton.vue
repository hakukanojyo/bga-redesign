<!--
  沒有底色的紅字按鈕（Figma Button type=alert 的文字版）：「取消收藏」「退出這桌」。
  hover 加底線，和文字連結一樣；按下時深一階（產品規則 7.3）。卡片按鈕條裡放左邊（危險在左）
-->
<template>
  <button
    type="button"
    class="min-h-(--tap-button-min-height) shrink-0 px-4 whitespace-nowrap type-tc-label-14 text-action-danger hover:underline active:text-action-danger-pressed"
  >
    <slot />
  </button>
</template>
