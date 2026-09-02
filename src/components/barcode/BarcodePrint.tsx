interface BarcodeData {
  barcode: string
  productName: string
  price?: number
  currencySymbol: string
}

export function getBarcodeData(barcode: string, productName: string, price?: number, currencySymbol = '$'): BarcodeData {
  return { barcode, productName, price, currencySymbol }
}

export function printBarcode(barcode: string, productName: string, price?: number, currencySymbol = '$') {
  const data = getBarcodeData(barcode, productName, price, currencySymbol)
  return window.electronAPI.printBarcode(data)
}
