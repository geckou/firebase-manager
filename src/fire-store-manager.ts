import type { Result } from '~/types'
import type { FirebaseApp } from 'firebase/app'
import type {
  WhereFilterOp,
  Firestore,
  DocumentData,
  DocumentSnapshot,
  CollectionReference,
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
  onSnapshot as useSnapshot,
  Timestamp,
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
  fieldPath: string
  opStr: WhereFilterOp
  value: any
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

  public getDoc(collectionName: string, docName: string = '') {
    return doc(this.db, collectionName, docName)
  }

  public getSettingDoc() {
    return doc(this.getCollection(this.collectionName))
  }

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

  public async deleteDocs(
    key: string,
    { fieldPath, opStr, value }: QueryOptions,
  ): Promise<Result<any[] | string>> {
    const result = await this.getCollectionByQuery({
      fieldPath,
      opStr,
      value,
    })
  
    if (result.status === 'error') return { status: result.status, data: result.data }
  
    const batch = writeBatch(this.db)
    const deleteDocRefs = (result.data as any[]).map((docData: any) =>
      this.getDoc(this.collectionName, docData[key]),
    )
  
    deleteDocRefs.forEach((el: any) => batch.delete(el))
  
    try {
      await batch.commit()
      return {
        status: 'success',
        data  : 'Documents successfully deleted!',
      }
    } catch (error) {
      console.error('Error deleting documents: ', error)
      return {
        status: 'error',
        data  : 'Error deleting documents: ' + error,
      }
    }
  }

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

  public createDocRef<T>(
    collection: CollectionReference,
    docData: T,
  ): Promise<DocumentData> {
    return addDoc(collection, docData as any)
  }

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

  public createCustomCollection(
    db: Firestore,
    pathName: string,
    pathSegments: string[] = [],
  ) {
    return collection(db, pathName, ...pathSegments)
  }

  public async getCollectionByQuery({
    fieldPath,
    opStr,
    value,
  }: QueryOptions): Promise<Result<any[]>> {
    const collectionName = this.collectionName
    
    const q = query(
      this.getCollection(collectionName),
      where(fieldPath, opStr, value),
    )

    try {
      const querySnapshot = await getDocs(q)

      return {
        status: 'success',
        data  : querySnapshot.docs.map(doc => doc.data()),
      }
    } catch (error) {
      console.error('Error getting documents by query: ', error)
      throw new Error('Error getting documents by query: ' + error)
    }
  }

  public createTimestamp() {
    return Timestamp.fromDate(new Date())
  }
}

export { FireStoreManager }
export type { OnSnapshotFunction }