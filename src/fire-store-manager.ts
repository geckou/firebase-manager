import type { Result } from '~/types'
import type { FirebaseApp } from 'firebase/app'
import type {
  Firestore,
  DocumentData,
  DocumentSnapshot,
  DocumentReference,
  WhereFilterOp,
  Query,
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  addDoc,
  runTransaction,
  onSnapshot as useSnapshot,
  Timestamp,
  orderBy as firebaseOrderBy,
  limit as firebaseLimit,
} from 'firebase/firestore'

type OnSnapshotFunction = { (snapshot: DocumentSnapshot): void }

type FirebaseConfig = Record<
  | 'apiKey'
  | 'authDomain'
  | 'projectId'
  | 'storageBucket'
  | 'messagingSenderId'
  | 'appId',
  string
>

type QueryOptions = {
  queries?: Array<{
    fieldPath: string
    opStr: WhereFilterOp
    value: any
  }>
  orderBy?: Array<{
    fieldPath: string
    directionStr?: 'asc' | 'desc'
  }>
  limit?: number
}

class FireStoreManager {
  private collectionName: string
  private firebaseConfig: FirebaseConfig
  private app: FirebaseApp
  private db: Firestore

  constructor({
    firebaseConfig,
    collectionName,
  }: {
    firebaseConfig: FirebaseConfig
    collectionName: string
  }) {
    this.collectionName = collectionName
    this.firebaseConfig = firebaseConfig
    this.app = initializeApp(this.firebaseConfig)
    this.db = getFirestore(this.app)
  }

  private getCollection(collectionName: string, pathSegments: string[] = []) {
    return collection(this.db, collectionName, ...pathSegments)
  }

  private getDoc(collectionName: string, docId: string = '') {
    return doc(this.db, collectionName, docId)
  }

    // 指定されたコレクションの設定ドキュメントを取得する
  public getSettingDoc() {
    return doc(this.getCollection(this.collectionName))
  }

    // ドキュメントを Firestore に書き込む
  public async setDoc(docId: string, docData: any): Promise<Result<string>> {
    const batch = writeBatch(this.db)
    const docRef = this.getDoc(this.collectionName, docId)
    batch.set(docRef, docData)
  
    try {
      await batch.commit()
      return {
        status: 'success',
        data  : 'Document successfully written!',
      }
    } catch (error) {
      console.error('Error writing document: ', error)
      return {
        status: 'error',
        data  : 'Error writing document: ' + error,
      }
    }
  }

     // 指定されたドキュメントを削除する
  public async deleteDoc(docId: string): Promise<Result<string>> {
    const batch = writeBatch(this.db) // ローカルバッチを作成
    const delDocRef = this.getDoc(this.collectionName, docId)
    batch.delete(delDocRef)
  
    try {
      await batch.commit() // ローカルバッチをコミット
      return {
        status: 'success',
        data  : 'Document successfully deleted!',
      }
    } catch (error) {
      console.error('Error deleting document: ', error)
  
      return {
        status: 'error',
        data  : 'Error deleting document: ' + error,
      }
    }
  }

    // クエリ条件に一致するすべてのドキュメントを削除
  public async deleteDocs(
    options: QueryOptions,
  ): Promise<Result<string>> {
    // クエリ実行して削除対象を取得
    const result = await this.getCollectionByQuery(options)
  
    if (result.status === 'error' || !result.data) {
      return { status: 'error', data: 'Failed to retrieve documents.' }
    }
  
    const batch = writeBatch(this.db)
  
    try {
      result.data.forEach(({ ref }) => {
        batch.delete(ref)
      })
  
      await batch.commit()
  
      return { status: 'success', data: 'Documents successfully deleted!' }
    } catch (error) {
      console.error('Error deleting documents: ', error)
      return { status: 'error', data: `Error deleting documents: ${error}` }
    }
  }

  // ドキュメントを更新する
  public async updateDoc(key: string, updateData: any): Promise<Result<string>> {
    const batch = writeBatch(this.db)
    const docRef = this.getDoc(this.collectionName, key)
    batch.update(docRef, updateData)
  
    try {
      await batch.commit()
      return {
        status: 'success',
        data  : 'Document successfully updated!',
      }
    } catch (error) {
      console.error('Error updating document: ', error)
  
      return {
        status: 'error',
        data  : 'Error updating document: ' + error,
      }
    }
  }

    // ドキュメントを作成し、参照を返す
  public createDocRef<T>(docData: T): Promise<DocumentData> {
    return addDoc(this.getCollection(this.collectionName), docData as any)
  }

    // ドキュメントのスナップショットを監視する
  public onSnapshot(docId: string, snapshotFunction: OnSnapshotFunction): () => void {
    const docRef = this.getDoc(this.collectionName, docId)
    
    const unsubscribe = useSnapshot(
      docRef,
      snapshotFunction,
      error => {
        console.error('Error getting snapshot: ', error)
        throw new Error('Error getting snapshot: ' + error)
      },
      () => {
        console.log('Unsubscribed from snapshot')
      },
    )

    return unsubscribe
  }

  // クエリ条件に一致するドキュメントを取得
  public async getCollectionByQuery({
    queries = [],
    orderBy = [],
    limit,
  }: QueryOptions): Promise<Result<Array<{
      data: any
      ref: DocumentReference
    }>>> {
    const collectionName = this.collectionName
  
    // 初期クエリを作成
    const baseQuery: Query = this.getCollection(collectionName)
  
    // クエリ条件を順に適用
    const queryWithConditions = queries.length > 0
      ? ((): Query => {
          let currentQuery = baseQuery
          queries.forEach(({ fieldPath, opStr, value }) => {
            currentQuery = query(currentQuery, where(fieldPath, opStr, value))
          })
          return currentQuery
        })()
      : baseQuery
  
    // 並び順を順に適用
    const queryWithOrderBy = orderBy.length > 0
      ? ((): Query => {
          let currentQuery = queryWithConditions
          orderBy.forEach(({ fieldPath, directionStr }) => {
            currentQuery = query(currentQuery, firebaseOrderBy(fieldPath, directionStr))
          })
          return currentQuery
        })()
      : queryWithConditions
  
    // limit の適用
    const finalQuery = limit
      ? query(queryWithOrderBy, firebaseLimit(limit))
      : queryWithOrderBy
  
    try {
      const querySnapshot = await getDocs(finalQuery)
  
      return {
        status: 'success',
        data  : querySnapshot.docs.map(doc => ({
          data: doc.data(),
          ref : doc.ref,
        })),
      }
    } catch (error) {
      console.error('Error getting documents by query: ', error)
      throw new Error('Error getting documents by query: ' + error)
    }
  }
  
  // 現在の日時を Firebase Timestamp 形式で作成
  public createTimestamp() {
    return Timestamp.fromDate(new Date())
  }

  // トランザクションを使用してドキュメントを更新または作成する
  public async upsertDocTransaction(key: string, updateData: any): Promise<Result<string>> {
    const MAX_RETRIES = 5 // 最大リトライ回数
    const BASE_DELAY = 100 // リトライ間隔の基本値
    const calculateRetryDelay = (attempt: number): number => Math.pow(2, attempt) * BASE_DELAY + Math.random() * BASE_DELAY // リトライ間隔を計算

    // オブジェクトの深い等価性を確認
    const deepEqual = (a: any, b: any): boolean => {
      if (a === b) return true
    
      if (typeof a !== 'object' || a === null ||
          typeof b !== 'object' || b === null) {
        return false
      }
    
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
    
      if (keysA.length !== keysB.length) return false
    
      for (const key of keysA) {
        if (!keysB.includes(key)) return false
        if (!deepEqual(a[key], b[key])) return false
      }
    
      return true
    }

    // トランザクションのロジック
    const handleTransactionLogic = async(transaction: any, docRef: DocumentReference): Promise<any> => {
      const doc = await transaction.get(docRef)
      const currentData = doc.exists() ? doc.data() : null
      if (deepEqual(currentData, updateData)) return { status: 'success', data: JSON.stringify(currentData) }
      transaction.set(docRef, updateData, { merge: true })
      return { ...currentData, ...updateData }
    }

    // トランザクションを実行
    const executeTransaction = async(attempt = 1): Promise<Result<string>> => {
      try {
        const docRef = this.getDoc(this.collectionName, key)
        const result = await runTransaction(this.db, async transaction => handleTransactionLogic(transaction, docRef))
        return { status: 'success', data: JSON.stringify(result) }
      } catch (error: any) {
        const isRetryableError = error.code === 'aborted' || error.code === 'failed-precondition'

        if (isRetryableError && attempt < MAX_RETRIES) {
          const delay = calculateRetryDelay(attempt)
          return new Promise(resolve =>
            setTimeout(() => resolve(executeTransaction(attempt + 1)), delay),
          )
        }

        console.error('❌ トランザクション失敗: ', error)
        return { status: 'error', data: `Error: ${error}` }
      }
    }
  
    return executeTransaction()
  }
}

export { FireStoreManager }
export type { OnSnapshotFunction }