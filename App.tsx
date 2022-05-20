/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React from 'react';
 import { Provider } from 'react-redux';
 import { LogBox } from 'react-native';
 import { store } from './redux/store';
 import Devices from './src/Devices';
 import DeviceDetails from './src/DeviceDetails';
 import { NavigationContainer } from '@react-navigation/native';
 import { createNativeStackNavigator } from '@react-navigation/native-stack';
 import { RootStackParamList } from './src/interface';
 
 LogBox.ignoreAllLogs();
 
 const Stack = createNativeStackNavigator<RootStackParamList>();
 
 const App = () => {
   return (
     <Provider store={store}>
       <NavigationContainer>
         <Stack.Navigator>
           <Stack.Screen name="Devices" component={Devices} />
           <Stack.Screen name="DeviceDetails" component={DeviceDetails} />
         </Stack.Navigator>
       </NavigationContainer>
     </Provider>
   );
 };
 
 export default App;
 