<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton
} from '@geckou/vue-ui-components'
import { FireBaseAuthManager } from 'gk-firebase-manager'

const password = ref('')
const email = ref('')
const fireBaseAuthManager = await FireBaseAuthManager.getInstance()

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
</script>

<template>
  <div :class="$style.container">
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
      <GKBasicButton @click="EmailSignUp">新規登録する</GKBasicButton>
      <NuxtLink to="/">
        TOPに戻る
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