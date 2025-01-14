<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton
} from '@geckou/vue-ui-components'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const password = ref('')
const email = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()
const oobCode = String(useRoute().query.oobCode ?? '')

const changingPassword = async () => {
  try {
    const res = await fireBaseAuthManager.changePassword(oobCode, password.value)
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/')
      console.log('パスワードを変更しました。')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

</script>

<template>
  <div :class="$style.container">
    <!-- 新しいパスワードの設定 -->
    <div :class="$style.contents">
      <h1>新しいパスワードの設定</h1>
      <GKTextBox 
        v-model="password"
        name="password"
        placeholder="パスワード"
      />
      <GKBasicButton @click="changingPassword">パスワードを変更する</GKBasicButton>
    </div>
    <NuxtLink to="/">
      TOPに戻る
    </NuxtLink>
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
  background-color: var(--light-yellow);

  h1 {
    font-size: var(--fs-large);
    margin-block-end: var(--sp-medium)
  }
}
</style>