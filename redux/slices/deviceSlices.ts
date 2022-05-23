import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Characteristic, Device, Service } from "react-native-ble-plx";

export interface ServiceWithCharacteristics extends Service {
  fetchedCharacteristics?: Characteristic[]
}

export interface DeviceState {
  devices: Device[],
  selectedDevice: Device | null,
  services: ServiceWithCharacteristics[],
  servicesLoading: boolean,
  isDeviceConnected: boolean
}

const initialState: DeviceState = {
  devices: [],
  selectedDevice: null,
  services: [],
  servicesLoading: false,
  isDeviceConnected: false
}

const deviceSlices = createSlice({
  name: 'device',
  initialState: initialState,
  reducers: {
    setDevices: (state: DeviceState, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
    },
    setSelectedDevice: (state: DeviceState, action: PayloadAction<Device>) => {
      state.selectedDevice = action.payload;
    },
    setServices: (state: DeviceState, action: PayloadAction<ServiceWithCharacteristics[]>) => {
      state.services = action.payload;
    },
    setServicesLoading: (state: DeviceState, action: PayloadAction<boolean>) => {
      state.servicesLoading = action.payload;
    },
    setIsDeviceConnected: (state: DeviceState, action: PayloadAction<boolean>) => {
      state.isDeviceConnected = action.payload;
    },
    updateValueOfCharacteristic: (state: DeviceState, action: PayloadAction<{serviceId: string, characteristicId: string, value: string}>) => {
      const updatedServices = [...state.services];
      updatedServices.forEach((serviceItem) => {
        if (serviceItem.uuid === action.payload.serviceId) {
          serviceItem.fetchedCharacteristics?.forEach((characteristicItem) => {
            if (characteristicItem.uuid === action.payload.characteristicId) {
              characteristicItem.value = action.payload.value;
            }
        })
        }
      })
      state.services = [...updatedServices];
    },
  }
})

export const deviceReducer = deviceSlices.reducer;
export const { setDevices, setSelectedDevice, setServices, setServicesLoading, updateValueOfCharacteristic, setIsDeviceConnected } = deviceSlices.actions;