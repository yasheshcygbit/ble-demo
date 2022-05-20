/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {NativeStackScreenProps} from '@react-navigation/native-stack';
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
import {BleManager, Characteristic, Device, Service} from 'react-native-ble-plx';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, AppState} from '../redux/store';
import {RootStackParamList} from './interface';
import { Buffer } from "buffer";

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

let bleManager = new BleManager();

const App = ({ route, navigation }: Props) => {
  let arrOfDevices: Device[] = [];
  const dispatch = useDispatch<AppDispatch>();
  const selectedDevice: Device | null = useSelector(
    (state: AppState) => state.deviceReducer.selectedDevice,
  );

  const connectToDevice = () => {
    let deviceId = '';
    let serviceUuid = '';
    let characteristicUuid = '';
    if (selectedDevice) {
      selectedDevice.connect()
      .then((device: Device) => {
        return device.discoverAllServicesAndCharacteristics()
      })
      .then((device) => {
        console.log('[CONNECT device]', JSON.stringify(device));
        deviceId = device.id;
        return bleManager.servicesForDevice(device.id)
        // return bleManager.readCharacteristicForDevice(device.id, "", "");
      })
      .then((services: Service[]) => {
        console.log('[CONNECT services]', JSON.stringify(services));
        const arrOfServiceUUids: string[] = [];
        services.forEach((serviceItem) => {
          arrOfServiceUUids.push(serviceItem.uuid);
        })
        serviceUuid = services[2].uuid;
        // if (connectedDevice) {
        return bleManager.characteristicsForDevice(selectedDevice?.id, services[2].uuid)
        // }
      })
      .then((characteristicsForDevice: Characteristic[]) => {
        console.log('[CONNECT characteristicsForDevice]', JSON.stringify(characteristicsForDevice));
        // now move in array and check for isWritableWithResponse
        characteristicsForDevice.forEach((characteristicItem: Characteristic) => {
          if (characteristicItem.isWritableWithResponse) {
            characteristicUuid = characteristicItem.uuid;
          }
        })

        // now write some data 
        const batteryLevelBuffer = Buffer.from('Hello')
        // batteryLevelBuffer.write(JSON.stringify({ wifiSSID: 'cygbit', password: 'hello' }), 0);
        return bleManager.writeCharacteristicWithResponseForDevice(deviceId, serviceUuid, characteristicUuid, batteryLevelBuffer.toString('base64'))
      })
      .then((characteristicAfterWrite: Characteristic) => {
        console.log('[CONNECT characteristicAfterWrite]', JSON.stringify(characteristicAfterWrite));
        if (characteristicAfterWrite.value) {
          // const heightInCentimeters = Buffer.from(characteristicAfterWrite.value, 'base64').readUInt16LE(0);
          const heightInCentimeters = Buffer.from(characteristicAfterWrite.value, 'base64').toString();
          console.log('[CONNECT heightInCentimeters]', JSON.stringify(heightInCentimeters));
        }
        return bleManager.readCharacteristicForDevice(deviceId, serviceUuid, characteristicAfterWrite.uuid);
      })
      .then((characteristicAfterRead: Characteristic) => {
      })
      .catch((error) => {
        console.log('[CONNECT error]', error);
      });
    }
  };

  return (
    <SafeAreaView style={[styles.mainContainer]}>
      <View style={[styles.mainContainer]}>
        {selectedDevice ? (
          <View style={[styles.devicesList]}>
            <ScrollView contentContainerStyle={[styles.devicesListScroll]}>
              <View key={selectedDevice.id} style={[styles.deviceCont]}>
                <View style={[styles.deviceLeftCont]}>
                  <Text
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={[styles.deviceLeftTitle]}>
                    {selectedDevice.name !== ''
                      ? selectedDevice.name
                      : selectedDevice.localName}
                  </Text>
                  <Text
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={[styles.deviceLeftUuid]}>
                    {selectedDevice.id}
                  </Text>
                  <TouchableOpacity
                    style={[styles.button]}
                    activeOpacity={0.8}
                    onPress={() => connectToDevice()}>
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      style={[styles.deviceLeftUuid]}>
                      Connect
                    </Text>
                  </TouchableOpacity>
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
                    {selectedDevice.rssi}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        ) : null}
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
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },
  topHeaderTextCont: {
    flex: 1,
    paddingHorizontal: 10,
  },
  topHeaderText: {
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 80,
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
});

export default App;
