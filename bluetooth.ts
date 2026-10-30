export type WatchReading = {
  battery: number | null
  heartRate: number | null
  deviceName: string
  connected: boolean
  services: string[]
}

const BATTERY_SERVICE = 'battery_service'
const BATTERY_LEVEL = 'battery_level'
const HEART_RATE_SERVICE = 'heart_rate'
const HEART_RATE_MEASUREMENT = 'heart_rate_measurement'

export function isBluetoothAvailable() {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth
}

export async function connectWatch(
  onUpdate: (reading: Partial<WatchReading>) => void,
  onStatus: (message: string) => void
): Promise<BluetoothDevice> {
  if (!isBluetoothAvailable()) {
    throw new Error('Web Bluetooth is unavailable. Use a supported Chromium browser on HTTPS or localhost.')
  }

  onStatus('Choose a nearby Bluetooth device…')
  const device = await navigator.bluetooth!.requestDevice({
    acceptAllDevices: true,
    optionalServices: [BATTERY_SERVICE, HEART_RATE_SERVICE, 'device_information']
  })

  device.addEventListener('gattserverdisconnected', () => {
    onUpdate({ connected: false })
    onStatus('Watch disconnected')
  })

  if (!device.gatt) throw new Error('This device does not expose a GATT server.')
  onStatus('Connecting to device…')
  const server = await device.gatt.connect()
  onUpdate({ connected: true, deviceName: device.name || 'Unnamed device' })

  const services: string[] = []
  try {
    const batteryService = await server.getPrimaryService(BATTERY_SERVICE)
    services.push('Battery Service')
    const batteryCharacteristic = await batteryService.getCharacteristic(BATTERY_LEVEL)
    const batteryValue = await batteryCharacteristic.readValue()
    onUpdate({ battery: batteryValue.getUint8(0) })
  } catch {
    onStatus('Connected. Battery service is not exposed by this device.')
  }

  try {
    const heartService = await server.getPrimaryService(HEART_RATE_SERVICE)
    services.push('Heart Rate Service')
    const heartCharacteristic = await heartService.getCharacteristic(HEART_RATE_MEASUREMENT)
    await heartCharacteristic.startNotifications()
    heartCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic
      if (!target.value) return
      const flags = target.value.getUint8(0)
      const bpm = flags & 0x01 ? target.value.getUint16(1, true) : target.value.getUint8(1)
      onUpdate({ heartRate: bpm })
    })
  } catch {
    // Heart-rate service is optional and is not supported by every watch.
  }

  try {
    const info = await server.getPrimaryService('device_information')
    services.push('Device Information')
    void info
  } catch {
    // Optional standard service.
  }

  onUpdate({ services })
  onStatus(services.length
    ? 'Connected. Reading available standard Bluetooth services.'
    : 'Connected, but no supported standard services were found.')
  return device
}