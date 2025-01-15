<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton
} from '@geckou/vue-ui-components'
import { sendEmailVerification } from 'firebase/auth'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const oobCode = ref('')
const mode = ref('')
const password = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()

const changingPassword = async () => {
  try {
    const res = await fireBaseAuthManager.changePassword(oobCode.value, password.value)
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

const emailVerification = async () => {
  try {
    const res = await fireBaseAuthManager.verifyEmail(oobCode.value)
    const { status, data } = res || {}

    if (status === 'success') {
      navigateTo('/')
      console.log('メールアドレスの認証が完了しました。')
    } else {
      console.error('エラー: ', data)
    }
  } catch (error: any) {
    console.error('認証中にエラーが発生しました:', error)
  }
}

</script>

<template>
  <div :class="$style.container">
    <!-- 新しいパスワードの設定 -->
    <div :class="$style.contents">
      <h1>新しいパスワードの設定</h1>
      <input 
        v-model="oobCode"
        name="oobCode"
        placeholder="oobCode"
        :class="$style.input"
      />
      <GKTextBox 
        v-model="password"
        name="password"
        placeholder="パスワード"
      />
      <GKBasicButton @click="changingPassword">パスワードを変更する</GKBasicButton>
    </div>
    <!-- メールアドレス変更の認証 -->
    <div :class="$style.contents">
      <h1>メールアドレス変更の認証</h1>
      <input 
        v-model="oobCode"
        name="oobCode"
        placeholder="oobCode"
        :class="$style.input"
      />
      <GKBasicButton @click="emailVerification">メールアドレスを認証する</GKBasicButton>
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

.input {
  width        : 100%;
  padding      : var(--sp-small);
  border       : 1px solid var(--light-gray);
  border-radius: var(--radius-small);
}
</style>