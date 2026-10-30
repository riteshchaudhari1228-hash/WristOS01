/// <reference types="vite/client" />
interface Navigator {
  bluetooth?: {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
  }
}
interface RequestDeviceOptions {
  filters?: Array<{ services?: BluetoothServiceUUID[]; namePrefix?: string }>
  optionalServices?: BluetoothServiceUUID[]
  acceptAllDevices?: boolean
}
type BluetoothServiceUUID = number | string
interface BluetoothDevice extends EventTarget {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
  addEventListener(type: string, listener: EventListener): void
}
interface BluetoothRemoteGATTServer {
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
  getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>
}
interface BluetoothRemoteGATTService {
  uuid: string
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>
}
type BluetoothCharacteristicUUID = number | string
interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value?: DataView
  readValue(): Promise<DataView>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener(type: string, listener: EventListener): void
}
