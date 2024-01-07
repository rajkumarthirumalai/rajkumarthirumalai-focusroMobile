import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  Text,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image, View, KeyboardAvoidingView,
  Alert, Keyboard, Modal,StatusBar
} from 'react-native';
import authApi from '../api/authApi';
import useApi from '../api/useApi';
import { getUser, setUser as saveUser } from '../auth/storage';
import AuthContext from '../auth/contex';
import DeviceInfo from 'react-native-device-info';
import ForgotPwdScreen from './ForgotPwdScreen';
import { useNetInfo  } from "@react-native-community/netinfo";
import t from '../language/StringsOfLanguages';
export default function RegistrationScreen() {
  const { user, setUser } = useContext(AuthContext);

  const [emailId, setEmailId] = useState('');  //sankar2389@gmail.com
  const [password, setPassword] = useState('');  // E2@&@mE1
  const [companyCode, setCompanyCode] = useState('');  //  JoI 
  const [modalVisible, setModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const netInfo = useNetInfo();
  const registerApi = useApi(authApi.register);
  const pwdTextInput = useRef();
  const emailTextInput = useRef();
  const codeTextInput = useRef();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('en');
  const [items, setItems] = useState([
    { label: 'Arabic', value: 'ar' }, { label: 'Catalan', value: 'ca' }, { label: 'German', value: 'de' }, { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' }, { label: 'French', value: 'fr' }, { label: 'Hindi', value: 'hi' }, { label: 'Russian', value: 'ru' },
    { label: 'Tamil', value: 'ta' }, { label: 'Chinese', value: 'zh' }
  ]);
  const [, forceUpdate] = React.useState(0);
  const internetState = useNetInfo();

  useEffect(() => {
    if (internetState.isConnected === false) {
      Alert.alert(
        "",
        t.warning_internet_unavailable
      );
      
    }
  }, [internetState.isConnected]);

  useEffect(() => {
    
    t.setLanguage(value);
    saveLang(value)
    forceUpdate(n => !n)
    console.log("value " + value);

  }, [value]);

  async function saveLang(lang) {

    var userData = await getUser();
    if (userData == null) {
      userData = {}
    }
    userData["lang"] = lang;
    saveUser(userData);
    setUser(userData);

  }

  async function restoreUser() {
    const currentUser = await getUser();
    console.log("restoreUser " + JSON.stringify(currentUser))
    if (currentUser != null) {
      setCompanyCode(currentUser.organisationCode)
      setPassword(currentUser.password)
      setEmailId(currentUser.email)
      t.setLanguage(currentUser.lang);
      setValue(currentUser.lang)
    }
  }

  useEffect(() => {
   
    restoreUser();
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Keyboard.dismiss()
      }
    );

    return () => {
      keyboardDidHideListener.remove();

    };
  }, []);


  const onRegister = async () => {

    if (internetState.isConnected === false) {
      Alert.alert(
        "",
        t.warning_internet_unavailable
      );
      return
    }

    if (companyCode == undefined || !companyCode.trim()) {
      Alert.alert(
        "", t.warning_require_company_code
      );
      return
    }
    if (emailId == undefined || !emailId.trim()) {
      Alert.alert(
        "", t.warning_valid_email
      );
      return
    }
    if (password == undefined || !password.trim()) {
      Alert.alert(
        "", t.warning_require_password
      );
      return
    }

    onSubmitEditCode(companyCode)
    setLoading(true);

    Keyboard.dismiss()

    const body = {
      email: emailId,
      password: password,
      organisationCode: companyCode,
      version: '0.1.5',
      offset: 5.5,
      config: Platform.OS + ' ' + DeviceInfo.getSystemVersion(),
      token: ''

    };
    try {
      const { data: userObj } = await registerApi.request(body);
      const userData = { ...body, token: userObj.data.token };
      userData["logout"] = false;
      userData["lang"] = value;
      console.log('userData', userData);
      saveUser(userData);
      setUser(userData);
    } catch (error) {
      setLoading(false);
      console.log('error', " " + ' ' + JSON.stringify(error.response));

      Alert.alert(
        "",
        error.response.data.message
      );

    }
  };

  const onSubmitEditCode = (input) => {
    console.log("value  " + input)
    if (input.length > 0) {
      var lastCharOfInput = input.slice(-1);
      if (lastCharOfInput == "_")
        setCompanyCode(input.slice(0, -1));
    }
    emailTextInput.current.focus()
  };

  const onChangeCode = (value) => {
    const input = value;
    if (input != undefined && (/^[a-zA-Z0-9_]+$/.test(input) || input === "")) {

      var fristCharOfInput = input.charAt(0);
      var lastCharOfInput = input.slice(-1);
      console.log("input  " + input + " " + fristCharOfInput + " " + lastCharOfInput)
      if (fristCharOfInput != "_")  // && lastCharOfInput!="_"
        setCompanyCode(input);
    }

  };

  const forgotPwd = () => {

    setModalVisible(!modalVisible);
    console.log("modalVisible " + modalVisible)

  };

  return (
    
    <ImageBackground
      source={require('../../assets/login.png')}
      style={{
        flex: 1,
        width: '100%', // applied to Image
        height: '100%',
      }}
      imageStyle={{
        resizeMode: 'cover', // works only here!
      }}>
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" animated={true} backgroundColor="#0041ba" />
        <Modal
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <ForgotPwdScreen closeModal={() => setModalVisible(false)} />
        </Modal>
        <View style={{ flexDirection: "row", justifyContent: "flex-start", }}>
          <Image style={styles.tinyLogo} source={require('../../assets/logo.png')} />
        </View>
        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Text style={{
            fontSize: 15,
            marginTop: '2%',
            fontSize: 30,
            fontWeight:"bold",
            fontFamily:'Avenir',
            color: "white"
          }}>LOGIN</Text>
          <View style={{ flexDirection: "column", marginTop: "8%", width: "100%", justifyContent: "center", alignItems: "center" }}>
            <TextInput
              style={styles.input}
              placeholder={t.company_code}
              //defaultValue={companyCode}
              returnKeyType={'next'}
              blurOnSubmit={false}
              ref={codeTextInput}
              maxLength={5}

              value={companyCode}
              onChangeText={e => onChangeCode(e)}
              onSubmitEditing={(event) => onSubmitEditCode(event.nativeEvent.text)}
              editable={true}
            />

            <TextInput
              style={styles.input}
              defaultValue={emailId}
              placeholder={t.email}
              returnKeyType={'next'}
              blurOnSubmit={false}
              ref={emailTextInput}
              onSubmitEditing={() => pwdTextInput.current.focus()}
              onChangeText={email => setEmailId(email)}
            />

            <TextInput
              style={styles.input}
              defaultValue={password}
              placeholder={t.password}
              ref={pwdTextInput}
              blurOnSubmit={false}
              onSubmitEditing={onRegister}
              onChangeText={psw => setPassword(psw)}
            />

            <TouchableOpacity style={styles.loginput} onPress={onRegister}>
              {loading ? (
                <ActivityIndicator color={'skyblue'} size={'small'} />
              ) : (
                <Text style={{ color: 'white', textAlign: "center", fontSize: 18, fontWeight: "bold" }}>{t.login}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={forgotPwd}>

              <Text style={styles.forgetpwdtext}>{t.forgot_password}?</Text>


            </TouchableOpacity>

          </View>
        </View>

      </SafeAreaView>
    </ImageBackground>
              
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: "column",
    width: '100%',

  },
  tinyLogo: {
    width: 150,
    resizeMode: 'contain',
    marginLeft: "4%"

  },
  userLogo: {
    width: 50,
    resizeMode: 'contain',
    marginLeft: "auto"

  },
  bottomLogo: {
    flex: 1,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  forgetpwdtext: {
    fontSize: 15,
    marginTop: '2%',
    fontWeight: '700',
    fontFamily: 'Avenir',
    color: "white"
  },
  
  input: {
    width: '80%',
    borderRadius: 12,
    backgroundColor: "white",
    padding: 10,
    marginVertical: 10,
    color: 'black',
    shadowColor: "#98a2c0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5

  },
  loginput: {
    width: '80%',
    borderRadius: 12,
    backgroundColor: "#0066f5",
    padding: 10,
    marginVertical: "10%",
    height: 45,
    shadowColor: "#98a2c0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
  button: {
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    width: '35%',
    borderColor: 'transparent',
    backgroundColor: '#1d9ceb',
  },
  dropdown: {
    fontSize: 15,
    marginTop: '3%',
    fontWeight: '700',
    width: '40%',
    alignItems: 'center',
    fontFamily: 'Avenir',
  },
});
