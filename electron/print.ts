import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function renderReceiptHTML(receipt: { order: any; cashier: any; customerName?: string; currencySymbol: string }): string {
  const { order, cashier, customerName, currencySymbol } = receipt
  const date = new Date(order.createdAt).toLocaleString()

  const itemsHTML = order.items.map((item: any) => `
    <tr>
      <td style="padding: 4px 0; font-size: 12px;">
        <div style="font-weight: 500;">${item.productName}</div>
        <div style="color: #666; font-size: 10px;">${currencySymbol}${item.price.toFixed(2)} x ${item.quantity}</div>
      </td>
      <td style="text-align: right; padding: 4px 0; font-size: 12px;">${currencySymbol}${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  let totalsHTML = `
    <div class="row"><span>Subtotal:</span><span>${currencySymbol}${order.subtotal.toFixed(2)}</span></div>
  `
  if (order.discount > 0) {
    totalsHTML += `<div class="row"><span>Discount:</span><span>-${currencySymbol}${order.discount.toFixed(2)}</span></div>`
  }
  if (order.tax > 0) {
    totalsHTML += `<div class="row"><span>Tax:</span><span>${currencySymbol}${order.tax.toFixed(2)}</span></div>`
  }
  totalsHTML += `<div class="row total"><span>TOTAL:</span><span>${currencySymbol}${order.total.toFixed(2)}</span></div>`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 280px; padding: 10px; color: #000; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 15px; }
    .header h1 { font-size: 18px; margin-bottom: 5px; }
    .header p { font-size: 10px; color: #666; }
    .info { margin-bottom: 15px; font-size: 11px; }
    .info p { margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .totals { border-top: 1px dashed #000; padding-top: 10px; }
    .totals .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
    .totals .total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
    .actions { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 10px; justify-content: center; }
    .actions button { padding: 8px 20px; font-size: 14px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-print { background: #2563eb; color: white; }
    .btn-print:hover { background: #1d4ed8; }
    .btn-close { background: #64748b; color: white; }
    .btn-close:hover { background: #475569; }
    @media print { body { width: 100%; max-width: 280px; } .actions { display: none !important; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Orbit POS</h1>
    <p>Thank you for shopping with us!</p>
  </div>
  <div class="info">
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Receipt #:</strong> ${order.id}</p>
    ${cashier ? `<p><strong>Cashier:</strong> ${cashier.username}</p>` : ''}
    ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
  </div>
  <table><tbody>${itemsHTML}</tbody></table>
  <div class="totals">${totalsHTML}</div>
  <div class="footer">
    <p>Please keep this receipt for returns.</p>
    <p>Powered by Orbit POS</p>
  </div>
  <div class="actions">
    <button class="btn-print" onclick="window.print()">Print</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
</body>
</html>`
}

function renderBarcodeHTML(data: { barcode: string; productName: string; price?: number; currencySymbol: string }): string {
  const { barcode, productName, price, currencySymbol } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print Barcode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; width: 200px; padding: 10px; text-align: center; margin: 0 auto; }
    .product-name { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
    .price { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 5px; }
    #barcode { width: 100%; }
    .barcode-text { font-size: 10px; margin-top: 5px; }
    .actions { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 10px; justify-content: center; }
    .actions button { padding: 8px 20px; font-size: 14px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-print { background: #2563eb; color: white; }
    .btn-print:hover { background: #1d4ed8; }
    .btn-close { background: #64748b; color: white; }
    .btn-close:hover { background: #475569; }
    @media print { body { width: 100%; } .actions { display: none !important; } }
  </style>
</head>
<body>
  <div class="product-name">${productName}</div>
  ${price !== undefined ? `<div class="price">${currencySymbol}${price.toFixed(2)}</div>` : ''}
  <svg id="barcode"></svg>
  <div class="barcode-text">${barcode}</div>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <script>
    try {
      JsBarcode("#barcode", "${barcode}", { format: "CODE128", width: 2, height: 50, displayValue: false, margin: 0 });
    } catch (e) {
      document.getElementById("barcode").textContent = "${barcode}";
    }
  </script>
  <div class="actions">
    <button class="btn-print" onclick="window.print()">Print</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
</body>
</html>`
}

function writeAndOpen(htmlContent: string, filename: string, title: string, width: number, height: number): Promise<BrowserWindow> {
  const userDataPath = app.getPath('userData')
  const printDir = path.join(userDataPath, 'print')

  if (!fs.existsSync(printDir)) {
    fs.mkdirSync(printDir, { recursive: true })
  }

  const filePath = path.join(printDir, filename)
  fs.writeFileSync(filePath, htmlContent)

  const printWindow = new BrowserWindow({
    width,
    height,
    title,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  printWindow.loadFile(filePath)
  printWindow.focus()
  return Promise.resolve(printWindow)
}

function setupPrintHandlers() {
  ipcMain.handle('print:receipt', async (_event, receiptData: any) => {
    const htmlContent = renderReceiptHTML(receiptData)
    await writeAndOpen(htmlContent, `receipt_${Date.now()}.html`, 'Print Receipt', 350, 650)
  })

  ipcMain.handle('print:barcode', async (_event, barcodeData: any) => {
    const htmlContent = renderBarcodeHTML(barcodeData)
    await writeAndOpen(htmlContent, `barcode_${Date.now()}.html`, 'Print Barcode', 260, 350)
  })
}

export { setupPrintHandlers }
