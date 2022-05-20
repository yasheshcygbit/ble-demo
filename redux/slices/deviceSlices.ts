import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Device } from "react-native-ble-plx";

export interface DeviceState {
  devices: Device[],
  selectedDevice: Device | null
}

const initialState: DeviceState = {
  devices: [],
  selectedDevice: null
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
  }
})

export const deviceReducer = deviceSlices.reducer;
export const { setDevices, setSelectedDevice } = deviceSlices.actions;