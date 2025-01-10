import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(nuxtApp => {
  const runtimeConfig = useRuntimeConfig()
  const firebaseConfig = runtimeConfig.public.firebaseConfig as Record<
    | 'apiKey'
    | 'authDomain'
    | 'projectId'
    | 'storageBucket'
    | 'messagingSenderId'
    | 'appId'
    | 'measurementId',
    string
  >

  const app = initializeApp(firebaseConfig)
  const auth: Auth = getAuth(app)
  const db: Firestore = getFirestore(app)

  nuxtApp.provide('firebaseAuth', auth)
  nuxtApp.provide('firestore', db)
})