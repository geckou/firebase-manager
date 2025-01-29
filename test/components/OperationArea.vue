<script lang="ts" setup>
import { 
  GKTextBox,
  GKBasicButton,
  GKSelectBox,
} from '@geckou/vue-ui-components'
import { FireStoreManager } from 'gk-firebase-manager'
import type { WhereFilterOp } from 'firebase/firestore'

const runtimeConfig = useRuntimeConfig()
const firebaseConfig = runtimeConfig.public.firebaseConfig
const fireStoreManager = new FireStoreManager({ firebaseConfig, collectionName: 'users' })

const docId = ref('')
const fieldPath = ref('')
const opStr: Ref<WhereFilterOp> = ref('==') 
const value = ref('')
const selectedMethod = ref('setDoc')
const selectedOpStr = ref('==')

const inputData = ref({
  name: {
    first: '',
    last: '',
  },
  age: 0,
  university: '',
  hobbies: '',
  updatedAt: fireStoreManager.createTimestamp().toDate(),
})

const updateData = computed(() => {
  return {
    name: {
      first: inputData.value.name.first,
      last: inputData.value.name.last,
    },
    age: inputData.value.age,
    university: inputData.value.university,
    hobbies: inputData.value.hobbies.replaceAll(' ', '').split(','),
    updatedAt: fireStoreManager.createTimestamp().toDate(),
  }
})

// ドキュメントを新規作成する(setDoc)
const create = async () => {
  try {
    const res = await fireStoreManager.setDoc(docId.value, updateData.value )
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
    const res = await fireStoreManager.updateDoc(docId.value, updateData.value )
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

// ドキュメントの作成と参照(createDocRef)
const createRef = async () => {
  try {
    const docRef = await fireStoreManager.createDocRef(inputData.value)

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

  // 現在の日時を Firebase Timestamp 形式で作成
const timestamp = ref<string | null>(null)

const fetchTimestamp = () => {
  const createTimestamp = fireStoreManager.createTimestamp()
  timestamp.value = createTimestamp.toDate().toLocaleString() // 日時を取得して設定
}

  // クエリ条件に一致するドキュメントを取得(getCollectionByQuery)
const fetchDocData = async() => {
  try {
    const res = await fireStoreManager.getCollectionByQuery({
    queries: [
      {
        fieldPath: fieldPath.value,
        opStr: opStr.value,
        value: value.value,
      },
    ]})
  
      if (res && res.data) {
        console.log('Data fetched:', res.data)
        const data = res.data[0].data
        console.log('Data:', data)
        inputData.value.name.first = data.name.first
        inputData.value.name.last = data.name.last
        inputData.value.age = data.age
        inputData.value.university = data.university
        inputData.value.hobbies = data.hobbies.join(', ')

      } else {
        console.error('No data found or data is undefined.')
      } 
    } catch (error) {
      console.error('Error fetching widgets:', error)
    }
  }

// 同時送信でも安全にデータを更新する(runTransaction)
const updateDataTransaction_1 = async(updateData: any) => {
  try {
    console.log('updateDataTransaction_1')
    const res = await fireStoreManager.upsertDocTransaction(docId.value, updateData)
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

const updateDataTransaction_2 = async(updateData: any) => {
  try {
    console.log('updateDataTransaction_1')
    const res = await fireStoreManager.upsertDocTransaction(docId.value, updateData)
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

const handleUpdate = async () => {
  const {
    university,
    hobbies,
    age,
  } = inputData.value
  await updateDataTransaction_1({ university, hobbies })

  setTimeout(async () => {
    await updateDataTransaction_2({ age, hobbies: `${inputData.value.hobbies}_2` })
  }, 500)
}
</script>

<template>
  <div :class="$style.container">
    <pre>{{ inputData }}</pre>
    <div :class="$style.contents">
      <GKSelectBox 
        v-model="selectedMethod" 
        :options="[
          { label: 'ドキュメントを新規作成する(setDoc)', value: 'setDoc' },
          { label: 'ドキュメントIDで指定してデータを更新する(updateDoc)', value: 'updateDoc' },
          { label: 'ドキュメントを削除する(docIdで指定)(deleteDoc)', value: 'deleteDoc' },
          { label: '複数のドキュメントを削除する(クエリで指定)(deleteDocs)', value: 'deleteDocs' },
          { label: '(id自動生成)でドキュメントを作成(createDocRef)', value: 'createDocRef' },
          { label: '新しいドキュメントIDを取得する(getSettingDoc)', value: 'getSettingDoc' },
          { label: 'スナップショットでドキュメントを監視する(onSnapshot)', value: 'onSnapshot' },
          { label: 'タイムスタンプ', value: 'timestamp' },
          { label: 'クエリ条件に一致するドキュメントを取得(getCollectionByQuery)', value: 'getCollectionByQuery' },
          { label: '同時送信でも安全にデータを更新する(runTransaction)', value: 'runTransaction' },
        ]"
        name="login-method"
        :placeholder="'選択してください'"
      />
      <div v-if="selectedMethod === 'setDoc'" :class="$style.item">
        <GKTextBox 
          v-model="docId"
          name="docId"
          placeholder="ドキュメントID"
        />
        <GKTextBox 
          v-model="inputData.name.first"
          name="name"
          placeholder="苗字"
        />
        <GKTextBox 
          v-model="inputData.name.last"
          name="name"
          placeholder="名前"
        />
        <GKTextBox
          v-model="inputData.age"
          name="age"
          placeholder="年齢"
        />
        <GKTextBox 
          v-model="inputData.university"
          name="university"
          placeholder="出身大学"
        />
        <GKTextBox 
          v-model="inputData.hobbies"
          name="hobbies"
          placeholder="趣味(カンマ区切り)"
        />
        <GKBasicButton @click="create">送信する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'updateDoc'" :class="$style.item">
        <GKTextBox 
          v-model="docId"
          name="docId"
          placeholder="ドキュメントID"
        />
        <GKTextBox 
          v-model="inputData.name.first"
          name="name"
          placeholder="苗字"
        />
        <GKTextBox 
          v-model="inputData.name.last"
          name="name"
          placeholder="名前"
        />
        <GKTextBox
          v-model="inputData.age"
          name="age"
          placeholder="年齢"
        />
        <GKTextBox 
          v-model="inputData.university"
          name="university"
          placeholder="出身大学"
        />
        <GKTextBox 
          v-model="inputData.hobbies"
          name="hobbies"
          placeholder="趣味(カンマ区切り)"
        />
        <GKBasicButton @click="update">送信する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'deleteDoc'" :class="$style.item">
        <GKTextBox 
          v-model="docId"
          name="docId"
          placeholder="ドキュメントID"
        />
        <GKBasicButton @click="deleteData">削除する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'deleteDocs'" :class="$style.item">
        <GKTextBox 
          v-model="fieldPath"
          name="fieldPath"
          placeholder="fieldPath"
        />
        <GKSelectBox 
          v-model="selectedOpStr" 
          :options="[
            { label: '==', value: '==' },
            { label: '!=', value: '!=' },
            { label: '>', value: '>' },
            { label: '>=', value: '>=' },
            { label: '<', value: '<' },
            { label: '<=', value: '<=' },
            { label: 'in', value: 'in' },
            { label: 'not-in', value: 'not-in' },
            { label: 'array-contains', value: 'array-contains' },
            { label: 'array-contains-any', value: 'array-contains-any' },
          ]"
          name="login-method"
          :placeholder="'選択してください'"
        />
        <GKTextBox 
          v-model="value"
          name="value"
          placeholder="value"
        />
        <GKBasicButton @click="deleteDatas">削除する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'createDocRef'" :class="$style.item">
        <GKTextBox 
          v-model="inputData.name.first"
          name="name"
          placeholder="苗字"
        />
        <GKTextBox 
          v-model="inputData.name.last"
          name="name"
          placeholder="名前"
        />
        <GKTextBox
          v-model="inputData.age"
          name="age"
          placeholder="年齢"
        />
        <GKTextBox 
          v-model="inputData.university"
          name="university"
          placeholder="出身大学"
        />
        <GKTextBox 
          v-model="inputData.hobbies"
          name="hobbies"
          placeholder="趣味(カンマ区切り)"
        />
        <GKBasicButton @click="createRef">送信する</GKBasicButton>
      </div>
      <div v-if="selectedMethod === 'getSettingDoc'" :class="$style.item">
        <GKBasicButton @click="getSettingDocId">取得する</GKBasicButton>
        {{ 'id: ' + docId }}
      </div>
      <div v-if="selectedMethod === 'onSnapshot'" :class="$style.item">
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
      <div v-if="selectedMethod === 'timestamp'" :class="$style.item">
        <GKBasicButton @click="fetchTimestamp()">タイムスタンプを作成する</GKBasicButton>
        {{ '日時: ' + timestamp }}
      </div>
      <div v-if="selectedMethod === 'getCollectionByQuery'" :class="$style.item">
        <GKTextBox 
          v-model="fieldPath"
          name="fieldPath"
          placeholder="fieldPath"
        />
        <GKSelectBox 
          v-model="selectedOpStr" 
          :options="[
            { label: '==', value: '==' },
            { label: '!=', value: '!=' },
            { label: '>', value: '>' },
            { label: '>=', value: '>=' },
            { label: '<', value: '<' },
            { label: '<=', value: '<=' },
            { label: 'in', value: 'in' },
            { label: 'not-in', value: 'not-in' },
            { label: 'array-contains', value: 'array-contains' },
            { label: 'array-contains-any', value: 'array-contains-any' },
          ]"
          name="login-method"
          :placeholder="'選択してください'"
        />
        <GKTextBox 
          v-model="value"
          name="value"
          placeholder="value"
        />
        <GKBasicButton @click="fetchDocData">取得する</GKBasicButton>
      </div>


      <div v-if="selectedMethod === 'runTransaction'" :class="$style.item">
        <div :class=$style.transaction>
          <div>
            <GKTextBox 
              v-model="docId"
              name="docId"
              placeholder="ドキュメントID"
            />
            <GKTextBox 
              v-model="inputData.name.first"
              name="name"
              placeholder="苗字"
            />
            <GKTextBox 
              v-model="inputData.name.last"
              name="name"
              placeholder="名前"
            />
            <GKTextBox
              v-model="inputData.age"
              name="age"
              placeholder="年齢"
            />
            <GKTextBox 
              v-model="inputData.university"
              name="university"
              placeholder="出身大学"
            />
            <GKTextBox 
              v-model="inputData.hobbies"
              name="hobbies"
              placeholder="趣味(カンマ区切り)"
            />
          </div>
          <div>
            <GKTextBox 
              v-model="docId"
              name="docId"
              placeholder="ドキュメントID"
            />
            <GKTextBox 
              v-model="inputData.name.first"
              name="name"
              placeholder="苗字"
            />
            <GKTextBox 
              v-model="inputData.name.last"
              name="name"
              placeholder="名前"
            />
            <GKTextBox
              v-model="inputData.age"
              name="age"
              placeholder="年齢"
            />
            <GKTextBox 
              v-model="inputData.university"
              name="university"
              placeholder="出身大学"
            />
            <GKTextBox 
              v-model="inputData.hobbies"
              name="hobbies"
              placeholder="趣味(カンマ区切り)"
            />
          </div>
        </div>
        <GKBasicButton @click="handleUpdate">
          送信する
        </GKBasicButton>
      </div>
    </div>



    <NuxtLink to="/mypage">
      ◀︎ mypage
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

.transaction {
  display       : flex;
  flex-direction: row;
  gap           : var(--sp-medium);

  > div {
    display       : flex;
    flex-direction: column;
    gap           : var(--sp-small);
  }
}
</style>