import { app, BrowserWindow, Menu } from 'electron'
import fs from 'fs'
import path from 'path'

const APP_NAME = 'Orbit POS'

function getLogoSvg(): string | null {
  try {
    const publicPath = app.isPackaged
      ? path.join(process.resourcesPath)
      : path.join(__dirname, '../public')
    return fs.readFileSync(path.join(publicPath, 'logo.svg'), 'utf-8')
  } catch {
    return null
  }
}

export function setupMenu(mainWindow: BrowserWindow | null) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: APP_NAME,
      submenu: [
        {
          label: `About ${APP_NAME}`,
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 320,
              resizable: false,
              minimizable: false,
              maximizable: false,
              title: `About ${APP_NAME}`,
              parent: mainWindow || undefined,
              modal: true,
              show: false,
              webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
              },
            })

            aboutWindow.setMenuBarVisibility(false)

            const logoSvg = getLogoSvg()
            const logoHtml = logoSvg
              ? `<div class="icon"><img src="data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}" alt="${APP_NAME}" /></div>`
              : ''

            const html = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    color: #f1f5f9;
                    text-align: center;
                    padding: 32px;
                    -webkit-app-region: drag;
                    user-select: none;
                  }
                  .icon { margin-bottom: 16px; }
                  .icon img { width: 56px; height: 56px; border-radius: 12px; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3); }
                  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px; }
                  .version { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
                  .desc { font-size: 13px; color: #94a3b8; line-height: 1.5; max-width: 280px; }
                  .links { margin-top: 20px; -webkit-app-region: no-drag; }
                  .links a {
                    color: #60a5fa;
                    text-decoration: none;
                    font-size: 12px;
                    margin: 0 8px;
                  }
                  .links a:hover { text-decoration: underline; }
                  .close-btn {
                    -webkit-app-region: no-drag;
                    margin-top: 16px;
                    padding: 8px 24px;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                  }
                  .close-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: #f1f5f9;
                  }
                </style>
              </head>
              <body>
                ${logoHtml}
                <h1>${APP_NAME}</h1>
                <div class="version">Version ${app.getVersion()}</div>
                <div class="desc">Modern, offline-first desktop Point of Sale application built for high-performance retail environments.</div>
                <div class="links">
                  <a href="#" onclick="require('electron').shell.openExternal('https://gitlab.com/ikhanraheel/orbit-pos'); return false;">Repository</a>
                </div>
                <button class="close-btn" onclick="window.close()">Close</button>
              </body>
              </html>
            `

            aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
            aboutWindow.once('ready-to-show', () => aboutWindow.show())
          },
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
