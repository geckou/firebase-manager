import type { Result } from '~/types'
import type { User } from 'firebase/auth'
import type { FirebaseError } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  deleteUser,
  verifyBeforeUpdateEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  signInAnonymously,
} from 'firebase/auth'

type AuthInfo = {
  email: string
  password: string
}

type CustomClaims = Record<string, any>

class FireBaseAuthManager {
  private static instance: FireBaseAuthManager
  private authUser: User | null = null
  private customClaims: CustomClaims | null = null
  private auth = getAuth()
  private authStateInitialized = false

  private constructor() {
    this.initializeAuthStateListener()
  }

  private async initializeAuthStateListener() {
    onAuthStateChanged(this.auth, async user => {
      await this.updateAuthUser()
      this.authStateInitialized = true
    })
  }

  private async updateAuthUser(): Promise<void> {
    const user = this.auth.currentUser
    if (user) {
      try {
        await user.getIdToken(true)
        const idTokenResult = await user.getIdTokenResult()
        this.customClaims = idTokenResult.claims
        this.authUser = user
      } catch (error) {
        console.error('Error getting current user plan:', error)
      }
    } else {
      this.authUser = null
      this.customClaims = null
      console.log('No user found, set authUser and customClaims to null')
    }
  }

  public static async getInstance(): Promise<FireBaseAuthManager> {
    if (!FireBaseAuthManager.instance) FireBaseAuthManager.instance = new FireBaseAuthManager()
    while (!FireBaseAuthManager.instance.authStateInitialized) await new Promise(resolve => setTimeout(resolve, 100))
    return FireBaseAuthManager.instance
  }

  public async getAuthUser(): Promise<{ user: User | null, claims: CustomClaims | null }> {
    return {
      user  : this.authUser,
      claims: this.customClaims,
    }
  }

  public async loginWithGoogle(): Promise<Result<string | FirebaseError>> {
    try {
      const provider = new GoogleAuthProvider()
      const res = await signInWithPopup(this.auth, provider)
      const { user } = res
      if (user) {
        await this.updateAuthUser()
        return { status: 'success' }
      } else return { status: 'error', data: 'auth/user-not-found' }
    } catch (error) {
      console.error('Error during login:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async loginWithEmail({ email, password }: AuthInfo): Promise<Result<User | string | FirebaseError>> {
    try {
      const { user } = await signInWithEmailAndPassword(this.auth, email, password)

      if (!user.emailVerified) {
        await signOut(this.auth)
        console.log('Email not verified')
        return { status: 'error', data: 'auth/email-not-verified' }
      }

      if (user) {
        await this.updateAuthUser()
        return { status: 'success' }
      } else return { status: 'error', data: 'auth/user-not-found' }
    } catch (error) {
      console.error('Error during login:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async resendVerifyEmail({ email, password }: AuthInfo): Promise<Result<string | FirebaseError>> {
    try {
      const { user } = await signInWithEmailAndPassword(this.auth, email, password)
      await this.sendVerifyEmail(user)
      return { status: 'success', data: 'auth/email-sent' }
    } catch (error) {
      console.error('Error during login:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async sendVerifyEmail(user: User): Promise<Result<string | FirebaseError>> {
    try {
      await sendEmailVerification(user)
      return { status: 'success', data: 'auth/email-sent' }
    } catch (error) {
      console.error('Error sending verification email:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async signUp({ email, password }: AuthInfo): Promise<Result<User | FirebaseError>> {
    try {
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password)
      await this.updateAuthUser()
      await this.sendVerifyEmail(user)
      return { status: 'success' }
    } catch (error) {
      console.error('Error during sign up:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async verifyLogin(): Promise<Result<boolean>> {
    return new Promise<Result<boolean>>(resolve => {
      const unsubscribe = onAuthStateChanged(this.auth, async user => {
        try {
          if (user) {
            resolve({ status: 'success', data: true })
          } else {
            this.authUser = null
            resolve({ status: 'success', data: false })
          }
        } catch (error) {
          console.error('Error during authentication state change:', error)
          this.authUser = null
          resolve({ status: 'error', data: false })
        } finally {
          unsubscribe()
        }
      })
    })
  }

  public async reauthenticate({ email, password }: AuthInfo): Promise<Result<string | FirebaseError>> {
    if (!this.authUser) return { status: 'error', data: 'User not logged in' }
    const credential = EmailAuthProvider.credential(email, password)
    try {
      await reauthenticateWithCredential(this.authUser as User, credential)
      return { status: 'success', data: 'User successfully re-authenticated' }
    } catch (error) {
      console.error('Error during re-authentication:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async deleteAccount({ email, password }: AuthInfo): Promise<Result<string | FirebaseError>> {
    if (!this.authUser) {
      console.error('User not logged in')
      return { status: 'error', data: 'User not logged in' }
    }

    const providerId = this.authUser.providerData[0].providerId
    if (!providerId) {
      console.error('Provider ID not found')
      return { status: 'error', data: 'Provider ID not found' }
    }

    try {
      if (providerId === 'password') {
        const { status } = await this.loginWithEmail({ email, password })
        if (status === 'error') {
          console.error('Invalid email or password')
          return { status: 'error', data: 'Invalid email or password' }
        }
      }

      await deleteUser(this.auth.currentUser as User)
      this.authUser = null
      return { status: 'success', data: 'Account deleted' }
    } catch (error) {
      console.error('Error deleting account:', error)
      const isFirebaseError = (error: unknown): error is { code: string } =>
        typeof error === 'object' && error !== null && 'code' in error

      if (isFirebaseError(error) && error.code === 'auth/requires-recent-login') {
        try {
          const reAuthenticated = await this.reauthenticateUser(providerId, { email, password })
          if (reAuthenticated) {
            await deleteUser(this.auth.currentUser as User)
            this.authUser = null
            return { status: 'success', data: 'Account deleted' }
          } else {
            return { status: 'error', data: 'Re-authentication failed' }
          }
        } catch (reAuthError) {
          console.error('Error during re-authentication:', reAuthError)
          return { status: 'error', data: reAuthError as FirebaseError }
        }
      } else {
        console.error('Error deleting account:', error)
        return { status: 'error', data: error as FirebaseError }
      }
    }
  }

  public async deleteAnonymousAccount(): Promise<Result<string | FirebaseError>> {
    if (!this.authUser) {
      console.error('User not logged in')
      return { status: 'error', data: 'User not logged in' }
    } else if (!this.authUser.isAnonymous) {
      console.error('User is not anonymous')
      return { status: 'error', data: 'User is not anonymous' }
    }

    try {
      await this.authUser.delete()
      this.authUser = null
      return { status: 'success', data: 'Account deleted' }
    } catch (error) {
      console.error('Error deleting account:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async logout(): Promise<Result<string | FirebaseError>> {
    try {
      await signOut(this.auth)
      this.authUser = null
      return { status: 'success', data: 'User logged out' }
    } catch (error) {
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async updateEmailAddress({ email, password }: AuthInfo): Promise<Result<string | FirebaseError>> {
    const currentUser = this.auth.currentUser
    const currentEmail = currentUser?.email

    if (!currentEmail) {
      console.error('No email found for the current user')
      return { status: 'error', data: 'auth/no-email' }
    }

    if (currentEmail === email) {
      console.error('New email is the same as the current email')
      return { status: 'error', data: 'auth/existing-email' }
    }

    try {
      const { status } = await this.loginWithEmail({ email: currentEmail, password })
      if (status === 'error') {
        console.error('Invalid email or password')
        return { status: 'error', data: 'auth/authentication-failed' }
      }

      await verifyBeforeUpdateEmail(currentUser, email)
      return { status: 'success', data: 'Email updated' }
    } catch (error) {
      console.error('Email update failed:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async checkEmailVerification(): Promise<Result<boolean>> {
    const currentUser = this.auth.currentUser

    if (!currentUser) {
      console.error('No user logged in')
      return { status: 'error', data: false }
    }
    
    const providerId = currentUser.providerData[0]?.providerId

    if (providerId === 'google.com') {
      return {
        status: 'success',
        data  : true,
      }
    }

    try {
      await currentUser.reload()
      if (currentUser.emailVerified) {
        console.log('Email successfully updated and verified')
        return {
          status: 'success',
          data  : true,
        }
      } else {
        console.log('Email not yet verified')
        return { status: 'error', data: false }
      }
    } catch (error) {
      console.error('Error checking email verification status:', error)
      return { status: 'error', data: false }
    }
  }

  public async sendResetPasswordEmail(email: string): Promise<Result<string | FirebaseError>> {
    try {
      await sendPasswordResetEmail(this.auth, email)
      return { status: 'success', data: 'auth/email-sent' }
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return { status: 'error', data: (error as FirebaseError).message }
    }
  }

  public async changePassword(oobCode: string, password: string): Promise<Result<string | FirebaseError>> {
    try {
      await verifyPasswordResetCode(this.auth, oobCode)
      await confirmPasswordReset(this.auth, oobCode, password)
      return { status: 'success', data: 'Password successfully reset' }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { status: 'error', data: (error as FirebaseError).message }
    }
  }

  public async reauthenticateUser(providerId: string, authInfo: AuthInfo): Promise<boolean> {
    if (providerId === 'google.com') {
      const { status } = await this.loginWithGoogle()
      return status === 'success'
    } else if (providerId === 'password') {
      const { status } = await this.reauthenticate(authInfo)
      return status === 'success'
    }
    return false
  }

  public async verifyEmail(oobCode: string): Promise<Result<string | FirebaseError>> {
    try {
      await applyActionCode(this.auth, oobCode)
      return { status: 'success', data: 'Email successfully updated' }
    } catch (error) {
      console.error('Error applying action code:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }

  public async signInAnonymously(): Promise<Result<string | FirebaseError>> {
    try {
      await signInAnonymously(this.auth)
      await this.updateAuthUser()
      return { status: 'success' }
    } catch (error) {
      console.error('Error during anonymous login:', error)
      return { status: 'error', data: error as FirebaseError }
    }
  }
}

export { FireBaseAuthManager }