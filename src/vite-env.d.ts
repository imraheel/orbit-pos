/// <reference types="vite/client" />

interface ElectronAPI {
  openImageDialog: () => Promise<{ base64: string; extension: string } | null>
  saveProductImage: (base64Data: string, productId: number, extension: string) => Promise<string>
  getProductImage: (relativePath: string) => Promise<string | null>
  deleteProductImage: (relativePath: string) => Promise<boolean>
  printReceipt: (data: any) => Promise<void>
  printBarcode: (data: any) => Promise<void>
  openCashDrawer: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
