export type Result<T> = {
  status: 'success' | 'error'
  data?: T
}