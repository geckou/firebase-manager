<script lang="ts" setup>


</script>

<template>
  <div :class="$style.container">
    <div :class="$style.contents">
      ログインに成功しました。または、メールを送信しました！
      <NuxtLink to="/">
        TOPに戻る
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" module>
.container {
  display        : flex;
  justify-content: space-around;
  align-items    : center;
  gap            : var(--sp-large);
  padding        : var(--sp-large);
}

.contents {
  display        : flex;
  flex-direction : column;
  justify-content: center;
  align-items    : center;
  gap            : var(--sp-medium);
  padding        : var(--sp-medium);

  h1 {
    font-size: var(--fs-large);
    margin-block-end: var(--sp-medium)
  }
}
</style>