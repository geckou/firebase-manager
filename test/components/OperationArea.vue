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

// ドキュメントを新規作成する(setDoc)
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

// 指定のドキュメントにデータを更新する(updateDoc)
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

// ドキュメントを削除する(docIdで)(deleteDoc)
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

// ドキュメントを削除する(クエリで)(deleteDocs)
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

// タイムスタンプ
const timestamp = ref()
const createTimestamp = fireStoreManager.createTimestamp()
timestamp.value = createTimestamp.toDate()


// ドキュメントの作成と参照(createDocRef)
const createRef = async () => {
  try {
    const docRef = await fireStoreManager.createDocRef({ ...updateData.value })

    if (docRef && docRef.id) {
      console.log("メッセージを送信しました。")
    } else {
      console.error("ドキュメント作成が失敗しました。")
    }
  } catch (error: any) {
    console.error("エラーが発生しました:", error.message)
  }
}

// 新しいドキュメントIDを取得する(getSettingDoc)
const getSettingDocId = async () => {
  try {
    const res = await fireStoreManager.getSettingDoc().id
    docId.value = res

  } catch (error: any) {
    console.error('エラーが発生しました：', error)
  }
}

const docContents = ref<any>(null);

// ドキュメントのスナップショットを監視する(onSnapshot)
const monitorDoc = () => {
  fireStoreManager.onSnapshot(docId.value, (docSnapshot: any) => {
    if (docSnapshot.exists()) {
      docContents.value = docSnapshot.data()
      console.log('Document data:', docSnapshot.data().name)
    } else {
      console.log('No such document!')
      docContents.value = null
    }
  })
}
</script>

<template>
  <div>
    <div :class="$style.container">
      <div :class="$style.contents">
        <h1>ドキュメントを新規作成する(setDoc)</h1>
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
        <h1>指定のドキュメントにデータを更新する(updateDoc)</h1>
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
        <h1>ドキュメントを削除する(docIdで)(deleteDoc)</h1>
          <GKTextBox 
            v-model="docId"
            name="docId"
            placeholder="ドキュメントID"
          />
          <GKBasicButton @click="deleteData">削除する</GKBasicButton>
      </div>
      <div :class="$style.contents">
        <h1>ドキュメントを削除する(クエリで)(deleteDocs)</h1>
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
      <div :class="$style.contents">
        <h1>ドキュメントの作成と参照(id自動生成)(createDocRef)</h1>
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
        <GKBasicButton @click="createRef">送信する</GKBasicButton>
      </div>
      <div :class="$style.contents">
        <h1>新しいドキュメントIDを取得する(getSettingDoc)</h1>
        <GKBasicButton @click="getSettingDocId">取得する</GKBasicButton>
        {{ 'id: ' + docId }}
      </div>
      <!-- ドキュメントのスナップショットを監視する -->
      <div :class="$style.contents">
        <h1>スナップショットでドキュメントを監視する(onSnapshot)</h1>
        <GKTextBox 
          v-model="docId"
          name="docId"
          placeholder="ドキュメントID"
        />
        <GKBasicButton @click="monitorDoc">監視する</GKBasicButton>
        <div v-if="docContents">
          <h2>ドキュメントデータ:</h2>
          <p>名前: {{ docContents.name }}</p>
          <p>年齢: {{ docContents.message }}</p>
        </div>
        <div v-else>
          <p>ドキュメントが存在しません。</p>
        </div>
      </div>
    </div>
    <div :class="$style.button">
      <NuxtLink to="/mypage">
        ◀︎ mypage操作ページ
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" module>
.container {
  display         : flex;
  justify-content : space-around;
  align-items     : center;
  gap             : var(--sp-large);
  padding         : var(--sp-large);
  background-color: var(--light-gray);
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

.button {
  display        : flex;
  justify-content: center;
  align-items    : center;
  font-size      : var(--fs-larger);
  padding-block  : calc(var(--sp-larger) * 2);
}
</style>