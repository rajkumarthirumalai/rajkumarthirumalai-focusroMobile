import React, {useContext, useEffect,useState, useRef} from 'react';
import {
  Text,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image,View,DeviceEventEmitter,KeyboardAvoidingView,
  Alert,Keyboard,TouchableWithoutFeedback,BackHandler
} from 'react-native';
import authApi from '../api/authApi';
import useApi from '../api/useApi';
import {getUser,setUser as saveUser} from '../auth/storage';
import AuthContext from '../auth/contex';
import DeviceInfo from 'react-native-device-info';
import resetPwdApi from '../api/resetPwdApi';

import {useNetInfo} from "@react-native-community/netinfo";
import t from '../language/StringsOfLanguages';
import Icon from "react-native-vector-icons/FontAwesome5"

export default function RegistrationScreen(closeModal) {
  const {user, setUser} = useContext(AuthContext);
  const appResetPwdApi = useApi(resetPwdApi);

  const [emailId, setEmailId] = useState('');  //shanmugam@blaze.ws

  const [loading, setLoading] = useState(false);
  const [companyCode, setCompanyCode] = useState('');  //M2~@G2~1  JoI
  const codeTextInput = useRef(); 

  const emailTextInput = useRef();
  const netInfo = useNetInfo();

 useEffect(() => {
   
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

   
    if(!netInfo.isConnected){
 Alert.alert(
      "",
      t.no_internet
    );
      return
    }

    

     if(companyCode==undefined || !companyCode.trim()){
        Alert.alert(
      "",t.warning_require_company_code
    );
        return
     }
     if(emailId==undefined || !emailId.trim()){
        Alert.alert(
      "",t.warning_valid_email
    );
        return
     }

    onSubmitEditCode(companyCode)
    Keyboard.dismiss()
     setLoading(true);

    const body = {
      email: emailId,
      version: '0.1.4'
    };
    try {
       const {data: configData} = await appResetPwdApi.request(
        companyCode,body
      );
      console.log('userData', configData);
       Alert.alert(
      "",
      configData.message
    );
    setEmailId('')
 setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', " "+' '+JSON.stringify(error.response));
       Alert.alert(
      "",
      error.response.data.message
    );

    }
  };

   const onSubmitEditCode = (input) => {    
      console.log("value  "+input)
      if(input.length>0){
         var lastCharOfInput=input.slice(-1);
          if(lastCharOfInput=="_")
            setCompanyCode(input.slice(0,-1));
          }
      emailTextInput.current.focus() 
  };

   const onChangeCode = (value) => {
    const input = value;
    if (input!=undefined && (/^[a-zA-Z0-9_]+$/.test(input) || input === "")) {
      
      var fristCharOfInput=input.charAt(0);
      var lastCharOfInput=input.slice(-1);
      console.log("input  "+input+" "+fristCharOfInput+" "+lastCharOfInput)
      if(fristCharOfInput!="_")  // && lastCharOfInput!="_"
       setCompanyCode(input);
    }

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
        <View style={{ flexDirection: "row", justifyContent: "flex-start",marginTop:"8%" }}>
          <Image style={styles.tinyLogo} source={require('../../assets/logo.png')} />
        </View>
        <Text style={{
            fontSize: 15,
            marginTop: '10%',
            fontSize: 30,
            fontWeight:"bold",
            fontFamily:'Avenir',
            color: "white",
            textAlign:"center"
          }}>FORGOT PASSWORD</Text> 
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
          returnKeyType={'done'}
          blurOnSubmit={false}
          ref={emailTextInput}
          onSubmitEditing={onRegister}
          onChangeText={email => setEmailId(email)}
        />


        <TouchableOpacity style={styles.loginput} onPress={onRegister}>
          {loading ? (
            <ActivityIndicator color={'skyblue'} size={'small'} />
          ):(
            <Text style={{color: 'white', textAlign: "center", fontSize: 18, fontFamily:"Avenir",fontWeight: "bold",}}>Reset Password</Text>
          )}
        </TouchableOpacity>
        </View>
       
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection: "column",
    width:'100%'
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
  text: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: '20%',
    marginBottom: 20,
    fontFamily: 'Avenir',
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
});
