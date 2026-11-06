<script setup>
// 列表項目離開時，固定在原本的位置和大小再淡出，下面（或後面）的項目才能用 move 動畫補上。
// 用 offset 量，一欄的列表和多欄的格線都適用（2026-11-06，原本寫 inset-x-0，放在格線裡會撐滿整排）
function pin(el) {
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = el
  Object.assign(el.style, {
    position: 'absolute',
    // 疊在最上面淡出：補位的項目從它底下滑過去，不然在多欄的格線裡會被補上來的那張整個蓋住、看不到淡出
    zIndex: '1',
    top: `${offsetTop}px`,
    left: `${offsetLeft}px`,
    width: `${offsetWidth}px`,
    height: `${offsetHeight}px`,
  })
}
</script>

<!--
  列表加入、移除的動畫（產品規則 7.3：同一種行為全站一致）：尋找開放桌、遊戲頁的開放桌、收藏面板、我的牌桌共用。
  離開的淡出、新加入的淡入、其他項目移位，都是 0.3 秒，只動 opacity 和 transform；減少動態效果時直接出現或消失。
  外層要 relative，離開的項目才會定位在列表裡
-->
<template>
  <TransitionGroup
    tag="ul"
    class="relative"
    move-class="transition-transform duration-300 motion-reduce:transition-none"
    enter-active-class="transition-opacity duration-300 motion-reduce:transition-none"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-300 motion-reduce:transition-none"
    leave-to-class="opacity-0"
    @before-leave="pin"
  >
    <slot />
  </TransitionGroup>
</template>
