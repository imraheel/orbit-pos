import { app, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'

const IMAGES_DIR = 'images/products'

function getImagesPath(): string {
  const userDataPath = app.getPath('userData')
  const imagesPath = path.join(userDataPath, IMAGES_DIR)
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true })
  }
  return imagesPath
}

function setupImageHandlers() {
  ipcMain.handle('dialog:openImage', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const filePath = result.filePaths[0]
    const base64 = fs.readFileSync(filePath).toString('base64')
    const ext = path.extname(filePath).slice(1)
    return { base64, extension: ext }
  })

  ipcMain.handle('image:save', async (_event, { base64Data, productId, extension }) => {
    const imagesPath = getImagesPath()
    const filename = `${productId}_${Date.now()}.${extension}`
    const filePath = path.join(imagesPath, filename)
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(filePath, buffer)
    return `images/products/${filename}`
  })

  ipcMain.handle('image:get', async (_event, relativePath: string) => {
    const userDataPath = app.getPath('userData')
    const filePath = path.join(userDataPath, relativePath)
    if (!fs.existsSync(filePath)) {
      return null
    }
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1)
    return `data:image/${ext};base64,${buffer.toString('base64')}`
  })

  ipcMain.handle('image:delete', async (_event, relativePath: string) => {
    const userDataPath = app.getPath('userData')
    const filePath = path.join(userDataPath, relativePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return true
  })
}

export { setupImageHandlers }
