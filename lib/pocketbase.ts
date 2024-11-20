import PocketBase from 'pocketbase'

let pb: PocketBase

try {
  pb = new PocketBase('http://127.0.0.1:8090')
} catch (error) {
  console.error('Error initializing PocketBase:', error)
  pb = null as any // Set to null if initialization fails
}

export default pb