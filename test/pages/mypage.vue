<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton
} from '@geckou/vue-ui-components'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const password = ref('')
const email = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()
const userStatus = ref(false)
const emailStatus = ref(false)

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
  <div>
    <div :class="$style.container">
      <!-- 登録メールアドレスの変更 -->
      <div :class="$style.contents">
        <h1>登録メールアドレスの変更</h1>
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
      <!-- パスワードの変更 -->
      <div :class="$style.contents">
        <h1>パスワードの変更</h1>
        パスワードリセットメールを送信します
          <GKTextBox 
            v-model="email"
            name="email"
            placeholder="登録メールアドレス"
          />
          <GKBasicButton @click="changePassword">変更する</GKBasicButton>
      </div>
      <!-- アカウントの削除 -->
      <div :class="$style.contents">
        <h1>アカウントの削除</h1>
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
      <!-- 匿名アカウントの削除 -->
      <div :class="$style.contents">
        <h1>匿名アカウントの削除</h1>
          <GKBasicButton @click="deleteAnonymousUser">アカウントを削除する</GKBasicButton>
      </div>
    </div>
    <div :class="$style.container">
      <GKBasicButton @click="signOut">ログアウト</GKBasicButton>
      <NuxtLink to="/">
        TOPに戻る
      </NuxtLink>
      <!-- ログイン状態の確認 -->
      <div :class="$style.contents">
        <h1>ログイン状態の確認</h1>
          <GKBasicButton @click="loginStatus">確認する</GKBasicButton>
          <div v-if="userStatus">
            ログイン中です
          </div>
          <div v-else>
            ログアウト中です
          </div>
      </div>
      <!-- メールアドレスの認証状態の確認 -->
      <div :class="$style.contents">
        <h1>メールアドレスの認証状態の確認</h1>
          <GKBasicButton @click="EmailVerification">確認する</GKBasicButton>
          <div v-if="emailStatus">
            認証済みです
          </div>
          <div v-else>
            未認証です
          </div>
      </div>
    </div>
    <OperationArea>
    </OperationArea>
  </div>
</template>

<style lang="scss" module>
.container {
  display        : flex;
  /* flex-direction : column; */
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