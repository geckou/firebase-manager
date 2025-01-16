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
const userStatus = ref(false)
const emailStatus = ref(false)
const selectedMethod = ref('email')

const changeEmail = async () => {
  try {
    const res = await fireBaseAuthManager.updateEmailAddress({email:email.value, password:password.value})
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/change-action')
      console.log('メールアドレス変更の認証メールを送信しました')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const changePassword = async () => {
  try {
    const res = await fireBaseAuthManager.sendResetPasswordEmail(email.value)
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/change-action')
      console.log('パスワードリセットメールを送信しました')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const deleteUser = async () => {
  try {
    const res = await fireBaseAuthManager.deleteAccount({email:email.value, password:password.value})
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/')
      console.log('アカウントを削除しました')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const deleteAnonymousUser = async () => {
  try {
    const res = await fireBaseAuthManager.deleteAnonymousAccount()
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/')
      console.log('アカウントを削除しました')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const signOut = async () => {
  try {
    const res = await fireBaseAuthManager.logout()
    const { status, data } = res || {}
    if ( status === 'success' ) {
      navigateTo('/')
      console.log('ログアウトしました')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}


const loginStatus = async () => {
  try {
    const res = await fireBaseAuthManager.verifyLogin()
    const { status, data } = res || {}
    console.log(res, status, data)
    if ( status === 'success' && data ) {
      userStatus.value = true
      console.log('ログイン中です')
    } else {
      userStatus.value = false
      console.log('ログアウト中です')
    }
  } catch (error: any) {
    console.error(error)
  }
}

const EmailVerification = async () => {
  try {
    const res = await fireBaseAuthManager.checkEmailVerification()
    const { status, data } = res || {}
    if ( status === 'success' ) {
      emailStatus.value = true
      console.log('メールアドレスは認証済みです')
    } else {
      emailStatus.value = false
      console.log('メールアドレスは未認証です')
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
          { label: '登録メールアドレスの変更', value: 'email' },
          { label: 'パスワードの変更', value: 'password' },
          { label: 'アカウントの削除', value: 'delete' },
          { label: '匿名アカウントの削除', value: 'deleteAnonymous' },
          { label: 'ログイン状態の確認', value: 'login' },
          { label: 'メールアドレスの認証状態の確認', value: 'status' }
        ]"
        name="login-method"
        :placeholder="'選択してください'"
      />
      <div v-if="selectedMethod === 'email'" :class="$style.item">
        <GKTextBox 
            v-model="email"
            name="email"
            placeholder="新しいメールアドレス"
          />
          <GKTextBox 
            v-model="password"
            name="password"
            placeholder="パスワード"
          />
          <GKBasicButton @click="changeEmail">変更する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'password'" :class="$style.item">
        <GKTextBox 
            v-model="email"
            name="email"
            placeholder="登録メールアドレス"
          />
          <GKBasicButton @click="changePassword">変更する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'delete'" :class="$style.item">
        <GKTextBox 
            v-model="email"
            name="email"
            placeholder="登録メールアドレス"
          />
          <GKTextBox 
            v-model="password"
            name="password"
            placeholder="パスワード"
          />
          <GKBasicButton @click="deleteUser">アカウントを削除する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'deleteAnonymous'" :class="$style.item">
        <GKBasicButton @click="deleteAnonymousUser">アカウントを削除する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'login'" :class="$style.item">
        <GKBasicButton @click="loginStatus">確認する</GKBasicButton>
          <div v-if="userStatus">
            ログイン中です
          </div>
          <div v-else>
            ログアウト中です
          </div>
      </div>
      <div v-if="selectedMethod === 'status'" :class="$style.item">
        <GKBasicButton @click="EmailVerification">確認する</GKBasicButton>
          <div v-if="emailStatus">
            認証済みです
          </div>
          <div v-else>
            未認証です
          </div>
      </div>
    </div>
    <NuxtLink to="/operation-area">
      fire-store-manager操作ページ ▶︎
    </NuxtLink>
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
  gap             : var(--sp-large);
}
</style>