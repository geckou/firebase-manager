<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton
} from '@geckou/vue-ui-components'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const password = ref('')
const email = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()

const AnonymousSignIn = async () => {
  try {
    const res = await fireBaseAuthManager.signInAnonymously()
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/mypage')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const GoogleSignIn = async () => {
  try {
    const res = await fireBaseAuthManager.loginWithGoogle()
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/mypage')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const EmailSignUp = async () => {
  try {
    const res = await fireBaseAuthManager.signUp({email:email.value, password:password.value})
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/mypage')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const EmailSignIn = async () => {
  try {
    const res = await fireBaseAuthManager.loginWithEmail({email:email.value, password:password.value})
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/mypage')
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
    <!-- 匿名ログイン -->
    <div :class="$style.contents">
      <h1>匿名ログイン</h1>
      <GKBasicButton @click="AnonymousSignIn">ログイン</GKBasicButton>
    </div>
    <!-- Googleログイン -->
    <div :class="$style.contents">
      <h1>Googleアカウントでログイン</h1>
      <GKBasicButton @click="GoogleSignIn">ログイン</GKBasicButton>
    </div>
    <!-- メールとパスワード新規登録 -->
    <div :class="$style.contents">
      <h1>メールアドレス新規登録</h1>
      <GKTextBox 
        v-model="email"
        name="email"
        placeholder="メールアドレス"
      />
      <GKTextBox 
        v-model="password"
        name="password"
        placeholder="パスワード"
      />
      <GKBasicButton @click="EmailSignUp">新規登録</GKBasicButton>
    </div>
    <!-- メールとパスワードログイン -->
    <div :class="$style.contents">
      <h1>メールアドレスログイン</h1>
      <GKTextBox 
        v-model="email"
        name="email"
        placeholder="メールアドレス"
      />
      <GKTextBox 
        v-model="password"
        name="password"
        placeholder="パスワード"
      />
      <GKBasicButton @click="EmailSignIn">ログイン</GKBasicButton>
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
  background-color: var(--light-yellow);

  h1 {
    font-size: var(--fs-large);
    margin-block-end: var(--sp-medium)
  }
}
</style>