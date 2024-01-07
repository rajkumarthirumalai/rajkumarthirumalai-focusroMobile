import React, {useState, useEffect} from 'react';
import AuthContext from './auth/contex';
import {getUser} from './auth/storage';
import CaptureScreen from './screens/CaptureScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import { LogBox } from 'react-native';

const App = () => {
  const [user, setUser] = useState();
  LogBox.ignoreLogs(['Remote debugger','Setting a timer']);
  useEffect(() => {
    async function restoreUser() {
      const currentUser = await getUser();
      setUser(currentUser);
    }
    restoreUser();
  }, []);

  return ( 
    <AuthContext.Provider value={{user, setUser}}>  
      {(user!=null && user.logout!=undefined && !user.logout) ? <CaptureScreen /> : <RegistrationScreen />}
    </AuthContext.Provider>
  );
};

export default App;
