/// <reference types="vite/client" />

declare global {
  interface Window {
    goalboard?: {
      load: () => Promise<unknown>
      save: (data: unknown) => Promise<boolean>
    }
  }
}

export {}
