<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton,
  GKSelectBox
} from '@geckou/vue-ui-components'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const password = ref('')
const email = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()
const selectedMethod = ref('google')

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

const resendEmail = async () => {
  try {
    const res = await fireBaseAuthManager.resendVerifyEmail({email:email.value, password:password.value})
    const { status, data } = res || {}
    if ( status === 'success' ) {
      console.log('認証メールを再送信しました')
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
    <div :class="$style.contents">
      <GKSelectBox 
        v-model="selectedMethod" 
        :options="[
          { label: 'Googleアカウントでログイン', value: 'google' },
          { label: 'メールアドレスでログイン', value: 'email' },
          { label: '匿名ログイン', value: 'anonymous' },
          { label: '認証メールの再送信', value: 'resend' }
        ]"
        name="login-method"
        :placeholder="'選択してください'"
      />
      <!-- 各ログイン方法のフォーム -->
      <div v-if="selectedMethod === 'google'" :class="$style.item">
        <GKBasicButton @click="GoogleSignIn">ログインする</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'email'" :class="$style.item">
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
        <GKBasicButton @click="EmailSignIn">ログインする</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'resend'" :class="$style.item">
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
        <GKBasicButton @click="resendEmail">認証メールを再送信する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'anonymous'" :class="$style.item">
        <GKBasicButton @click="AnonymousSignIn">ログインする</GKBasicButton>
      </div>   
      or
      <NuxtLink to="/signup">
        新規登録はこちら
      </NuxtLink>
    </div>
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
  min-block-size      : 420px;
  display         : flex;
  flex-direction  : column;
  justify-content : center;
  align-items     : center;
  gap             : var(--sp-large);
  padding         : var(--sp-larger);
  background-color: var(--light-yellow);

  h1 {
    font-size       : var(--fs-large);
    margin-block-end: var(--sp-medium)
  }
}

.item {
  display         : flex;
  flex-direction  : column;
  justify-content : center;
  align-items     : center;
  gap             : var(--sp-small);
}
</style>