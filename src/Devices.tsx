/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import {BleError, BleManager, Device, State} from 'react-native-ble-plx';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Provider, useDispatch, useSelector} from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {setDevices, setSelectedDevice} from '../redux/slices/deviceSlices';
import {AppDispatch, AppState, store} from '../redux/store';
import { RootStackParamList } from './interface';

type Props = NativeStackScreenProps<RootStackParamList, 'Devices'>;

let bleManager = new BleManager();

const App = ({ route, navigation }: Props) => {
  let arrOfDevices: Device[] = [];
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useColorScheme() === 'dark';
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  // const [devices, setDevices] = useState<Device[]>([]);
  const devices: Device[] = useSelector((state: AppState) => state.deviceReducer.devices);
  const selectedDevice: Device | null = useSelector((state: AppState) => state.deviceReducer.selectedDevice);
  const [isCheckingPermissions, setIsCheckingPermissions] =
    useState<boolean>(true);
  const [isPermissionGranted, setIsPermissionGranted] =
    useState<boolean>(false);

  const checkPermissions = (): void => {
    if (Platform.OS === 'android') {
      // android permission flow
      checkPermissionsAndroid();
    } else {
    }
  };

  const checkPermissionsAndroid = (): void => {
    checkMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    ]).then(statuses => {
      console.log(
        'BLUETOOTH_ADVERTISE',
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE],
      );
      console.log(
        'BLUETOOTH_CONNECT',
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT],
      );
      console.log(
        'BLUETOOTH_SCAN',
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN],
      );
      if (
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE] === RESULTS.GRANTED &&
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED &&
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED
      ) {
        // all are granted so can use bluetooth
        setIsPermissionGranted(true);
        setIsCheckingPermissions(false);
      } else {
        setIsPermissionGranted(false);
        setIsCheckingPermissions(false);
      }
    });
  };

  const requestPermission = (): void => {
    if (Platform.OS === 'android') {
      requestPermissionsAndroid();
    }
  };

  const requestPermissionsAndroid = (): void => {
    requestMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    ]).then(statuses => {
      if (
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE] === RESULTS.GRANTED &&
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED &&
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED
      ) {
        setIsPermissionGranted(true);
      }
    });
  };

  useEffect(() => {
    console.log('[BLE_STATUS bleManager]', bleManager);
    checkPermissions();
    const subscription = bleManager.onStateChange((state: State) => {
      console.log('[BLE_STATUS state]', state);
      if (state === State.PoweredOn) {
        subscription.remove();
        setIsPoweredOn(true);
      }
    }, true);
    return () => {
      bleManager.destroy();
      subscription.remove();
    };
  }, []);

  const scanAndConnect = () => {
    setIsScanning(true);
    bleManager?.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.log('[BLE_STATUS connect error]', error);
        return;
      }
      console.log('[BLE_STATUS connect device]', device);
      if (
        device && 
        // device.localName == 'WiFiBLEDevice' &&
        device.name == 'My BLE Tester' &&
        arrOfDevices &&
        arrOfDevices.findIndex(
          (deviceItem: Device) => deviceItem.id === device?.id,
        ) < 0
      ) {
        arrOfDevices.push(device);
        dispatch(setDevices([...arrOfDevices]));
        dispatch(setSelectedDevice(device));
        setIsScanning(false);
        bleManager?.stopDeviceScan();
      }
      // console.log('[BLE_STATUS connect device]', JSON.stringify(device));
    });
  };

  const stopScanning = (): void => {
    setIsScanning(false);
    bleManager?.stopDeviceScan();
  };

  useEffect(() => {
    // console.log('[BLE_STATUS connect devices]', JSON.stringify(devices));
  }, [devices])

  const goToDeviceDetails = (deviceItem: Device) => {
    dispatch(setSelectedDevice(deviceItem));
    navigation.navigate('DeviceDetails');
  }

  return (
    <SafeAreaView style={[styles.mainContainer]}>
      <View style={[styles.mainContainer]}>
        {isCheckingPermissions ? (
          <>
            <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
              Checking Permissions...
            </Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
              Please wait...
            </Text>
          </>
        ) : (
          <>
            {isPermissionGranted ? (
              <>
                <View style={[styles.topHeader]}>
                  {/* <View style={[styles.topHeaderTextCont]}>
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      style={[styles.topHeaderText]}>
                      All Devices
                    </Text>
                  </View> */}
                  {isScanning ? (
                    <TouchableOpacity
                      style={[styles.button]}
                      activeOpacity={0.8}
                      onPress={() => stopScanning()}>
                      <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                        Stop Scanning
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button]}
                      activeOpacity={0.8}
                      onPress={() => scanAndConnect()}>
                      <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                        Start Scanning
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.devicesList]}>
                  {isScanning ? (
                    <View style={[styles.scanningContainer]}>
                      <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftUuid]}>Scanning for device</Text>
                    </View>
                  ) : (
                    <ScrollView contentContainerStyle={[styles.devicesListScroll]}>
                    {devices && Array.isArray(devices) && devices.length > 0
                      ? devices.map((deviceItem: Device) => (
                          <View key={deviceItem.id} style={[styles.deviceCont]}>
                            <View style={[styles.deviceLeftCont]}>
                              <Text
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                style={[styles.deviceLeftTitle]}>
                                {deviceItem.name !== '' ? deviceItem.name : deviceItem.localName}
                              </Text>
                              <Text
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                style={[styles.deviceLeftUuid]}>
                                {deviceItem.id}
                              </Text>
                              <View style={[styles.buttonCont]}>
                                <TouchableOpacity style={[styles.button]} activeOpacity={0.8} onPress={ () => goToDeviceDetails(deviceItem) }>
                                  <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    style={[]}>
                                    Open Device Details
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={[styles.deviceRightCont]}>
                              <Text
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                style={[styles.deviceLeftUuid]}>
                                RSSI
                              </Text>
                              <Text
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                style={[styles.deviceLeftUuid]}>
                                {deviceItem.rssi}
                              </Text>
                            </View>
                          </View>
                        ))
                      : null}
                    </ScrollView>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                  One or few conditions missing
                </Text>
                <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                  Please click on Request Permission Box to accept permissions
                </Text>
                <TouchableOpacity
                  style={[styles.button]}
                  activeOpacity={0.8}
                  onPress={() => requestPermission()}>
                  <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                    Request Permissions
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scanningContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    // justifyContent: 'center',
    // alignItems: 'center',
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    backgroundColor: 'grey',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 0,
  },
  topHeader: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    // borderBottomColor: 'rgba(0, 0, 0, 0.8)',
    // borderBottomWidth: 1,
    paddingHorizontal: 10
  },
  topHeaderTextCont: {
    flex: 1,
    paddingHorizontal: 10,
  },
  topHeaderText: {
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 16,
    fontWeight: 'bold'
  },
  devicesList: {
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    // flexDirection: 'column',
  },
  devicesListScroll: {
    backgroundColor: '#fff',
    width: '100%',
    flexDirection: 'column',
  },
  deviceCont: {
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    // height: 80,
    width: '100%',
  },
  deviceLeftCont: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  deviceRightCont: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceLeftTitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 1)',
  },
  deviceLeftUuid: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  buttonCont: {
    flex: 0,
    paddingVertical: 10
  }
});

export default App;
