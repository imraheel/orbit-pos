import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openImageDialog: () => ipcRenderer.invoke('dialog:openImage'),
  saveProductImage: (base64Data: string, productId: number, extension: string) =>
    ipcRenderer.invoke('image:save', { base64Data, productId, extension }),
  getProductImage: (relativePath: string) =>
    ipcRenderer.invoke('image:get', relativePath),
  deleteProductImage: (relativePath: string) =>
    ipcRenderer.invoke('image:delete', relativePath),
  printReceipt: (data: any) => ipcRenderer.invoke('print:receipt', data),
  printBarcode: (data: any) => ipcRenderer.invoke('print:barcode', data),
  openCashDrawer: () => ipcRenderer.invoke('cashDrawer:open'),
})

