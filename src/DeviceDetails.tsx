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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {BleManager, Characteristic, Device, Service} from 'react-native-ble-plx';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, AppState} from '../redux/store';
import {RootStackParamList} from './interface';
import { Buffer } from "buffer";
import { ServiceWithCharacteristics, setSelectedDevice, setServices, setServicesLoading, updateValueOfCharacteristic } from '../redux/slices/deviceSlices';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

let bleManager = new BleManager();

const App = ({ route, navigation }: Props) => {
  let arrOfDevices: Device[] = [];
  const dispatch = useDispatch<AppDispatch>();
  const [valuesModalVisibility, setValuesModalVisibility] = useState<boolean>(false);
  const [selectedChar, setSelectedChar] = useState<Characteristic | null>(null)
  const [valueOfCharacteristic, setValueOfCharacteristic] = useState<string>('');
  const [valueOfSsid, setValueOfSsid] = useState<string>('');
  const [valueOfPassword, setValueOfPassword] = useState<string>('');

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedCharacteristicId, setSelectedCharacteristicId] = useState<string>('');

  const selectedDevice: Device | null = useSelector((state: AppState) => state.deviceReducer.selectedDevice);
  const services: ServiceWithCharacteristics[] | null = useSelector((state: AppState) => state.deviceReducer.services);
  const servicesLoading: boolean = useSelector((state: AppState) => state.deviceReducer.servicesLoading);

  const connectToDevice = async () => {
    // first connect to the device and save its services and characteristics in redux
    setServicesLoading(true);
    try {
      const updatedDevice: object = {...selectedDevice};
      if (selectedDevice) {
        console.log('[CONNECT selectedDevice.id]', selectedDevice.id);
        const connectedDevice: Device = await selectedDevice.connect();
        
        // now discover services and characteristics
        const deviceWithServicesAndCharacteristics: Device = await connectedDevice.discoverAllServicesAndCharacteristics();
        console.log('[CONNECT deviceWithServicesAndCharacteristics.id]', deviceWithServicesAndCharacteristics.id);
        dispatch(setSelectedDevice(deviceWithServicesAndCharacteristics));
  
        // now get all services
        const servicesReceived: ServiceWithCharacteristics[] = await bleManager.servicesForDevice(deviceWithServicesAndCharacteristics.id);
        // now get all characteristics
        
        for (let i=0; i < servicesReceived.length; i++) {
          // get characteristics for each service and then save them in object
          const charactOfServ = await bleManager.characteristicsForDevice(selectedDevice?.id, servicesReceived[i].uuid);
          if (charactOfServ) {
            servicesReceived[i].fetchedCharacteristics = charactOfServ;
          }
        }
        setServicesLoading(false);
        dispatch(setServices(servicesReceived));
      }
    } catch (error) {
      setServicesLoading(false);
    }
  };

  // const connectToDevice = () => {
  //   let deviceId = '';
  //   let serviceUuid = '';
  //   let characteristicUuid = '';
  //   if (selectedDevice) {
  //     selectedDevice.connect()
  //     .then((device: Device) => {
  //       return device.discoverAllServicesAndCharacteristics()
  //     })
  //     .then((device) => {
  //       console.log('[CONNECT device]', JSON.stringify(device));
  //       deviceId = device.id;
  //       return bleManager.servicesForDevice(device.id)
  //     })
  //     .then((services: Service[]) => {
  //       console.log('[CONNECT services]', JSON.stringify(services));
  //       const arrOfServiceUUids: string[] = [];
  //       services.forEach((serviceItem) => {
  //         arrOfServiceUUids.push(serviceItem.uuid);
  //       })
  //       serviceUuid = services[2].uuid;
  //       return bleManager.characteristicsForDevice(selectedDevice?.id, services[2].uuid)
  //       // }
  //     })
  //     .then((characteristicsForDevice: Characteristic[]) => {
  //       console.log('[CONNECT characteristicsForDevice]', JSON.stringify(characteristicsForDevice));
  //       characteristicsForDevice.forEach((characteristicItem: Characteristic) => {
  //         if (characteristicItem.isWritableWithResponse) {
  //           characteristicUuid = characteristicItem.uuid;
  //         }
  //       })
  //       const batteryLevelBuffer = Buffer.from('Hello')
  //       return bleManager.writeCharacteristicWithResponseForDevice(deviceId, serviceUuid, characteristicUuid, batteryLevelBuffer.toString('base64'))
  //     })
  //     .then((characteristicAfterWrite: Characteristic) => {
  //       console.log('[CONNECT characteristicAfterWrite]', JSON.stringify(characteristicAfterWrite));
  //       if (characteristicAfterWrite.value) {
  //         const heightInCentimeters = Buffer.from(characteristicAfterWrite.value, 'base64').toString();
  //         console.log('[CONNECT heightInCentimeters]', JSON.stringify(heightInCentimeters));
  //       }
  //       return bleManager.readCharacteristicForDevice(deviceId, serviceUuid, characteristicAfterWrite.uuid);
  //     })
  //     .then((characteristicAfterRead: Characteristic) => {
  //       if (characteristicAfterRead.value) {
  //         const heightInCentimeters = Buffer.from(characteristicAfterRead.value, 'base64').toString();
  //         console.log('[CONNECT characteristicAfterRead]', JSON.stringify(characteristicAfterRead));
  //       }
  //     })
  //     .catch((error) => {
  //       console.log('[CONNECT error]', error);
  //     });
  //   }
  // };

  const getLatestValue = async (serviceId: string, characteristicId: string) => {
    if (selectedDevice) {
      // const latestCharacteristics = await bleManager.readCharacteristicForDevice(selectedDevice.id, serviceId, characteristicId);
      const latestCharacteristics = await selectedChar?.read();
      console.log('[CONNECT latestCharacteristics]', JSON.stringify(latestCharacteristics));
      if (latestCharacteristics && latestCharacteristics.value) {
        const newValue = Buffer.from(latestCharacteristics.value, 'base64').toString();
        console.log('[CONNECT newValue]', JSON.stringify(newValue));
        // latest value got so now update the array
        dispatch(updateValueOfCharacteristic({
          serviceId,
          characteristicId,
          value: newValue
        }))
      }
    }
  }

  const setNewValue = (serviceId: string, characteristicId: string, characteristicItem: Characteristic) => {
    setSelectedChar(characteristicItem);
    setSelectedServiceId(serviceId);
    setSelectedCharacteristicId(characteristicId);
    setValuesModalVisibility(true);
  }

  const setNewValueOfChar = async () => {
    if (valueOfSsid !== '' && valueOfPassword !== '') {
      // const dataString = `${valueOfSsid}|${valueOfPassword}`;
      const dataString = "Hello";
      const dataToSend = Buffer.alloc(10);
      dataToSend.write(dataString);
      if (selectedDevice) {
        try {
          // const updatedCharacteristics = await bleManager.writeCharacteristicWithResponseForDevice(selectedDevice.id, selectedServiceId, selectedCharacteristicId, dataToSend.toString('base64'));
          const updatedCharacteristics = await selectedChar?.writeWithResponse(dataToSend.toString('base64'));
          console.log('[CONNECT updatedCharacteristics]', JSON.stringify(updatedCharacteristics));
          setValuesModalVisibility(false);
        } catch (error) {
          console.log('[CONNECT error]', (error));
        }
      }
    } else {
      Alert.alert('Error', 'Please add all details')
    }
  }

  return (
    <SafeAreaView style={[styles.mainContainer]}>
      <Modal
        animationType="slide"
        visible={valuesModalVisibility}
        onRequestClose={() => setValuesModalVisibility(false)}
        transparent
        statusBarTranslucent
      >
        <View style={[styles.modalValuesCont]}>
          <View style={[styles.modalValuesInner]}>
            <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.topHeaderText, styles.padB10]}>Add Wifi SSID and Password to Continue</Text>
            <TextInput
              placeholder="Enter Wifi SSID"
              placeholderTextColor='rgba(0, 0, 0, 0.5)'
              value={valueOfSsid}
              onChangeText={(text: string) => setValueOfSsid(text)}
              style={[styles.modalTextInut]}
            />
            <TextInput
              placeholder="Enter Wifi Password"
              placeholderTextColor='rgba(0, 0, 0, 0.5)'
              value={valueOfPassword}
              onChangeText={(text: string) => setValueOfPassword(text)}
              style={[styles.modalTextInut]}
            />
            <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.topHeaderText, styles.padB10]}>Value added will be in format {valueOfSsid}|{valueOfPassword}</Text>
            <TouchableOpacity
              style={[styles.button]}
              activeOpacity={0.8}
              onPress={() => setNewValueOfChar()}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                Set New Value
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
                      Connect to device
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

              {}
              <View style={[styles.servicesList]}>
                <View style={[styles.servicesListHeader]}>
                  <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.topHeaderText]}>Services Listed Below</Text>
                </View>
                <View style={[styles.servicesListContent]}>
                  {servicesLoading ? (
                    <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftUuid]}>Loading all services...</Text>
                  ) : (
                    <View style={[styles.servicesListItems]}>
                      {services && services.length > 0 ? (
                        services.map(serviceItem => (
                          <View style={[styles.serviceListItemCont]}>
                            <View style={[]}>
                              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftTitle]}>{`Service UUID: ${serviceItem.uuid}`}</Text>
                            </View>
                            <View style={[]}>
                              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftUuid]}>{`Service ID: ${serviceItem.id}`}</Text>
                            </View>
                            <View style={[styles.characteristicsCont]}>
                              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.topHeaderText, styles.characteristicsHeaderText]}>{`Characteristics of Service`}</Text>
                              <View style={[]}>
                                {serviceItem.fetchedCharacteristics && serviceItem.fetchedCharacteristics.length > 0 ? (
                                  serviceItem.fetchedCharacteristics.map((characteristicItem) => (
                                    <View style={[styles.charListItemCont]}>
                                      <View style={[]}>
                                        <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftTitle]}>{`Characteristics UUID: ${characteristicItem.uuid}`}</Text>
                                      </View>
                                      <View style={[]}>
                                        {characteristicItem.isWritableWithResponse ? (
                                          <View style={[]}>
                                            <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.writableTag, styles.writableTagGreen]}>Is Writable</Text>
                                            <View style={[styles.valueCont]}>
                                              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftTitle]}>Current Value: {characteristicItem.value}</Text>
                                            </View>
                                            <View style={[styles.charButtonsCont]}>
                                              <TouchableOpacity
                                                style={[styles.button]}
                                                activeOpacity={0.8}
                                                onPress={() => getLatestValue(serviceItem.uuid, characteristicItem.uuid)}>
                                                <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                                                  Get Latest Value
                                                </Text>
                                              </TouchableOpacity>
                                              <TouchableOpacity
                                                style={[styles.button]}
                                                activeOpacity={0.8}
                                                onPress={() => setNewValue(serviceItem.uuid, characteristicItem.uuid, characteristicItem)}>
                                                <Text ellipsizeMode="tail" numberOfLines={1} style={[]}>
                                                  Set New Value
                                                </Text>
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        ) : (
                                          <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.writableTag, styles.writableTagYellow]}>Is Not Writable</Text>
                                        )}
                                      </View>
                                    </View>
                                  ))
                                ) : (
                                  <View style={[]}><Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftUuid]}>Sorry! No services discovered</Text></View>
                                )}
                              </View>
                            </View>
                          </View>
                        ))
                      ) : <View style={[]}><Text ellipsizeMode='tail' numberOfLines={1} style={[styles.deviceLeftUuid]}>Sorry! No services discovered</Text></View>}
                    </View>
                  )}
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
  servicesList: {
    padding: 10,
  },
  servicesListHeader: {
    paddingBottom: 10
  },
  servicesListContent: {

  },
  servicesListItems: {
    
  },
  characteristicsCont: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)'
  },
  charButtonsCont: {
    flexDirection: 'row'
  },
  serviceListItemCont: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    marginBottom: 10
  },
  characteristicsHeaderText: {
    fontWeight: 'bold',
    paddingBottom: 10
  },
  charListItemCont: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginVertical: 10,
    padding: 10
  },
  writableTag: {
    fontSize: 12,
    padding: 5,
    // maxWidth: 100,
    marginVertical: 10,
    textAlign: 'center',
    borderRadius: 20
  },
  writableTagYellow: {
    backgroundColor: 'yellow',
    color: 'black'
  },
  writableTagGreen: {
    backgroundColor: 'green',
    color: 'white'
  },
  valueCont: {
    paddingBottom: 10
  },
  modalValuesCont: {
    // height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalValuesInner: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30
  },
  modalTextInut: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 10,
    color: '#000'
  },
  padB10: {
    paddingBottom: 10
  }
});

export default App;
