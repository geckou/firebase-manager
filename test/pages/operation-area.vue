<script lang="ts" setup>

</script>

<template>
  <div :class="$style.container">
    <OperationArea />
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
  display         : flex;
  flex-direction  : column;
  justify-content : center;
  align-items     : center;
  gap             : var(--sp-medium);
  padding         : var(--sp-medium);
  background-color: var(--light-yellow);

  h1 {
    font-size       : var(--fs-large);
    margin-block-end: var(--sp-medium)
  }
}
</style>