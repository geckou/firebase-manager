<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton,
  GKSelectBox 
} from '@geckou/vue-ui-components'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const oobCode = ref('')
const password = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()
const selectedMethod = ref('password')

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
    <div :class="$style.contents">
      <GKSelectBox 
        v-model="selectedMethod" 
        :options="[
          { label: '新しいパスワードの設定', value: 'password' },
          { label: 'メールアドレス変更の認証', value: 'email' },
        ]"
        name="login-method"
        :placeholder="'選択してください'"
      />
      <div v-if="selectedMethod === 'password'" :class="$style.item">
        <GKTextBox 
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
      <div v-if="selectedMethod === 'email'" :class="$style.item">
        <GKTextBox 
          v-model="oobCode"
          name="oobCode"
          placeholder="oobCode"
          :class="$style.input"
        />
        <GKBasicButton @click="emailVerification">メールアドレスを認証する</GKBasicButton>
      </div>
    </div>
    <NuxtLink to="/">
      TOPに戻る
    </NuxtLink>
  </div>
</template>

<style lang="scss" module>
.container {
  inline-size    : 100%;
  min-block-size : 100vh;
  display        : flex;
  flex-direction : column;
  justify-content: center;
  align-items    : center;
  gap            : var(--sp-large);
  padding        : var(--sp-large);
}

.contents {
  min-block-size  : 420px;
  display         : flex;
  flex-direction  : column;
  justify-content : center;
  align-items     : center;
  gap             : var(--sp-large);
  padding         : var(--sp-larger);
  background-color: var(--light-yellow);
}

.item {
  display         : flex;
  flex-direction  : column;
  justify-content : center;
  align-items     : center;
  gap             : var(--sp-medium);
}
</style>