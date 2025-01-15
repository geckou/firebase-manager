<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton
} from '@geckou/vue-ui-components'
import { FireStoreManager } from 'gk-firebase-manager'
import type { WhereFilterOp } from 'firebase/firestore'


const runtimeConfig = useRuntimeConfig()
const firebaseConfig = runtimeConfig.public.firebaseConfig
const fireStoreManager = new FireStoreManager({ firebaseConfig, collectionName: 'users' })
const collectionName = 'users'

const name = ref('')
const message = ref('')
const docId = ref('')
const fieldPath = ref('')
const opStr: Ref<WhereFilterOp> = ref('==') 
const value = ref('')

const updateData = computed(() => ({
  name: name.value,
  message: message.value,
}))

const create = async () => {
  try {
    const res = await fireStoreManager.setDoc(docId.value, { ...updateData.value })
    const { status, data } = res || {}
    if ( status === 'success' ) {
      console.log('メッセージを送信しました。')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

// const createRef = async () => {
//   try {
//     const res = await fireStoreManager.createDocRef(collectionName, { ...updateData.value })
//     const { status, data } = res || {}
//     if ( status === 'success' ) {
//       console.log('メッセージを送信しました。')
//     } else {
//       console.error(data)
//     }
//   } catch (error: any) {
//     console.error(error)
//   }
// }

const update = async () => {
  try {
    const res = await fireStoreManager.updateDoc(docId.value, { ...updateData.value })
    const { status, data } = res || {}
    if ( status === 'success' ) {
      console.log('メッセージを送信しました。')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const deleteData = async () => {
  try {
    const res = await fireStoreManager.deleteDoc(docId.value)
    const { status, data } = res || {}
    if ( status === 'success' ) {
      console.log('ドキュメントを削除しました。')
    } else {
      console.error(data)
    }
  } catch (error: any) {
    console.error(error)
  }
}

const deleteDatas = async () => {
  try {
    const res = await fireStoreManager.deleteDocs({
      queries: [
        {
          fieldPath: fieldPath.value,
          opStr: opStr.value,
          value: value.value,
        },
      ]})

    const { status, data } = res || {}
    if (status === 'success') {
      console.log('ドキュメントを削除しました。')
      console.log(data)
    } else {
      console.error('削除に失敗しました：', data)
    }
  } catch (error: any) {
    console.error('エラーが発生しました：', error)
  }
}

const timestamp = ref()
const createTimestamp = fireStoreManager.createTimestamp()
timestamp.value = createTimestamp.toDate()
</script>

<template>
  <div>
    <div :class="$style.container">
      <div :class="$style.contents">
        <h1>ドキュメントを新規作成する</h1>
          <GKTextBox 
            v-model="docId"
            name="docId"
            placeholder="ドキュメントID"
          />
          <GKTextBox 
            v-model="name"
            name="name"
            placeholder="お名前"
          />
          <GKTextBox 
            v-model="message"
            name="message"
            placeholder="メッセージ"
          />
          <GKBasicButton @click="create">送信する</GKBasicButton>
      </div>
      <div :class="$style.contents">
        <h1>ドキュメントを更新する</h1>
          <GKTextBox 
            v-model="docId"
            name="docId"
            placeholder="ドキュメントID"
          />
          <GKTextBox 
            v-model="name"
            name="name"
            placeholder="お名前"
          />
          <GKTextBox 
            v-model="message"
            name="message"
            placeholder="メッセージ"
          />
          <GKBasicButton @click="update">送信する</GKBasicButton>
      </div>
      <div :class="$style.contents">
        <h1>ドキュメントを削除する(docIdで)</h1>
          <GKTextBox 
            v-model="docId"
            name="docId"
            placeholder="ドキュメントID"
          />
          <GKBasicButton @click="deleteData">削除する</GKBasicButton>
      </div>
      <div :class="$style.contents">
        <h1>ドキュメントを削除する(クエリで)</h1>
          <GKTextBox 
            v-model="fieldPath"
            name="fieldPath"
            placeholder="fieldPath"
          />
          <GKTextBox 
            v-model="opStr"
            name="opStr"
            placeholder="opStr"
          />
          <GKTextBox 
            v-model="value"
            name="value"
            placeholder="value"
          />
          <GKBasicButton @click="deleteDatas">削除する</GKBasicButton>
      </div>
      <div :class="$style.contents">
        <h1>タイムスタンプ</h1>
          {{ timestamp }}
      </div>
    </div>
    <div :class="$style.container">
      <!-- ドキュメントを作成し、参照を返す ここやってます！！！！！-->
      <div :class="$style.contents">
        <h1>ドキュメントの作成と参照</h1>
        <GKTextBox 
        v-model="docId"
        name="docId"
        placeholder="ドキュメントID"
        />
        <GKTextBox 
        v-model="name"
        name="name"
        placeholder="お名前"
        />
        <GKTextBox 
        v-model="message"
        name="message"
        placeholder="メッセージ"
        />
        <!-- <GKBasicButton @click="createRef">送信する</GKBasicButton> -->
        {{}}
      </div>
      <!-- カスタムコレクションを作成 -->
      <!-- ドキュメントのスナップショットを監視する -->
      <!-- collectionName で指定されたコレクションの設定ドキュメントを取得する -->

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
  background-color: var(--light-gray);
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