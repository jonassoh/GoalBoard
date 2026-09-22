/// <reference types="vite/client" />

declare global {
  interface Window {
    goalboard?: {
      load: (accountId: string) => Promise<unknown>
      save: (accountId: string, data: unknown) => Promise<boolean>
    }
  }
}

export {}
