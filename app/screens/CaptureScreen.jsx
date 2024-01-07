import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  AppState
} from 'react-native';
import { encrypt, decrypt, PrivateKey } from 'eciesjs';
import BackgroundService from 'react-native-background-actions';
import useApi from '../api/useApi.js';
import configApi from '../api/configApi.js';
import recordApi from '../api/recordApi.js';
import activeHoursApi from '../api/activeHoursApi.js';
import updateHoursApi from '../api/updateHoursApi.js';
import { decode as atob, encode as btoa } from 'base-64'
import { getUser, setUser as saveUser } from '../auth/storage.js';
// import Upload from 'react-native-background-upload';
import RNFetchBlob from 'react-native-fetch-blob';
const RNFS = require('react-native-fs');
import AuthContext from '../auth/contex.js';
import HelpScreen from './HelpScreen.jsx';
import { useNetInfo } from "@react-native-community/netinfo";
import logoutApi from '../api/logoutApi.js';
import t from '../language/StringsOfLanguages';

const sleep = time => new Promise(resolve => {

  setTimeout(() => resolve(), time)

});

var options = {
  taskName: t.productivity_monitoring_status + ' ' + t.on,
  taskTitle: t.productivity_monitoring_status + ' ' + t.on,
  taskDesc: 'capturing...',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: 'gray',
  parameters: {
    delay: 180000
  },
};

const apiOptions = {
  method: 'POST',
  type: 'multipart',
  field: 'file',
};


var path;
var synced
var interval;
var timer;
var totalSeconds;

const CaptureScreen = () => {
  const { Screenshot } = NativeModules;
  const appLogoutApi = useApi(logoutApi);
  const appConfigApi = useApi(configApi);
  const appRecordApi = useApi(recordApi);
  const appActiveHoursApi = useApi(activeHoursApi)
  const appupdateHoursApi = useApi(updateHoursApi)
  const [appConfigData, setAppConfigData] = useState();
  const [uploadurl, setuploadurl] = useState("https://devupload.focusro.com/uploader");
  const [imagesecret, setimagesecret] = useState("0xbb0e83e2ee51a4073bc2cd50d6772a49b9607b41ccf769d3d8e3ede9b4264b415e83928c96689b3806642a37b0c2e4fb7a0e9bec922e261f9cb57ca2e8dc2460")
  const [loading, setLoading] = useState(true);
  const [hour, sethour] = useState();
  const [minute, setminute] = useState();
  const [sec, setsec] = useState()
  const [hours, sethours] = useState()
  const [bgService, setBGService] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [appState, setappState] = useState(AppState.currentState)
  const { user, setUser } = useContext(AuthContext);
  const [counter, setCounter] = useState(0);
  const [startCountdown, setStartCountdown] = useState(false)
  const internetState  = useNetInfo();

  useEffect(() => {
    async function getAppConfiguration() {
      try {
        const user = await getUser();
        console.log('user....', user);
        apiOptions.parameters = {
          email: user.email,
          organisationid: user.organisationCode,
          device: Platform.OS
        };
        apiOptions.headers = {
          Authorization: `${user.token}`,
          'content-type': 'multipart/form-data',
        };
        const  { data: configData } = await appConfigApi.request(
          user.organisationCode,
          user.token,
        );

        // options.parameters.delay = configData.data.screenshotfreuqnecy * 1000
     console.log("Freq",configData.data.screenshotfreuqnecy * 1000)
        console.log('Request configData: ', JSON.stringify(configData.data));
        setAppConfigData(configData.data);
        setLoading(false);
        
      } catch (error) {
        setLoading(false);
        console.log('error', " " + ' ' + JSON.stringify(error.response));
        Alert.alert("", error.response.data.message);
        const userData = await getUser();
        userData["logout"] = true;
        setUser(userData);
        saveUser(userData)
        setLoading(false);
      }
    }
    if (BackgroundService.isRunning() === true) {
      console.log("isrunning " + BackgroundService.isRunning() + " ")
      setBGService(true);     
    }
    viewHours()
  //  storeData()

    setTimeout(() => {
      getAppConfiguration();
    }, 1000)
      console.log('Request home: ', " useeffect ");
    }, []);

    useEffect(() => {
      if (internetState.isConnected === false) {
        Alert.alert("",t.warning_internet_unavailable);
      }
    }, [internetState.isConnected]);

    useEffect(() => {
      if(startCountdown){
        console.log("startcounter",startCountdown)
      synced = setInterval(() =>{
        setCounter((oldCount) => oldCount + 1)
      },60*1000)
    }}, [startCountdown]);

    useEffect(() => {
      updateHours()
      setCounter(0)
    }, [counter === 5])

    useEffect(() => {
      AppState.addEventListener('change', _handleAppStateChange);
      console.log("isrunning appstate " + BackgroundService.isRunning() + " ")

    }, []);

  useEffect(async () => {
    if (appState === "background" && BackgroundService.isRunning() === true) {
      setBGService(true) 
      console.log("bgservice", bgService)
        }
    console.log("appstate useeffect", appState)
  }, [appState])

    useEffect(async () => {
      console.log("bgservice for timer", bgService)

      if (appState === "active" && BackgroundService.isRunning() === true) {
        clearInterval(timer)
        setBGService(true) 
        console.log("bgservice fun", bgService)
        timer = setInterval(countTimer,1000)
        

      }
      console.log("appstate for timer", appState)
    }, [appState])
    const _handleAppStateChange = async (nextAppState) => {
      setappState(nextAppState)

    };
    const uploadImage = async (filePath) => {
      const { config, fs } = RNFetchBlob;
    
      const uploadUrl = appConfigData.imageUploadUrl;
    
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: [
          {
            name: 'file',
            filename: 'image.jpg', // specify the filename you want on the server
            data: fs.readFile(filePath, 'base64'),
          },
        ],
      };
    
      try {
        const response = await RNFetchBlob.fetch('POST', uploadUrl, options);
        const responseData = response.json();
    
        if (responseInfo.status === 200) {
          console.log('Upload successful!', responseData);
          // Handle success
        } else {
          console.log('Upload failed!', responseData);
          // Handle failure
        }
      } catch (error) {
        console.log('Upload error!', error);
        // Handle error
      }
    };
    // const uploadImage = async filePath => {
    //   const options = {
    //     url: appConfigData.imageUploadUrl,
    //     ...apiOptions,
    //     path: filePath,
    //     notification: {
    //       enabled: false,
    //     },     
    //   };
    //   console.log("uploadImage " + JSON.stringify(options))
      // const upload = await Upload.startUpload(options)
      //   .then(uploadId => {
      //     //setUploadId(uploadId)
      //     console.log('Upload started ');
      //     Upload.addListener('progress', uploadId, data => {
      //       console.log(`Progress: ${data.progress}%`);
      //     });
      //     Upload.addListener('error', uploadId, data => {
      //       console.log(`Error: ${JSON.stringify(data)}%`);
      //     });
      //     Upload.addListener('cancelled', uploadId, data => {
      //       console.log('Cancelled!');
      //     });
      //     Upload.addListener('completed', uploadId, data => {
      //       RNFS.unlink(filePath)
      //         .then(() => {
      //           console.log('file deleted',data);
      //         })
      //         .catch(err => {
      //           console.log(err.message, 'file deleted failed');
      //         });
      //       console.log('Completed!', data);
      //     });
      //   })
      //   .catch(err => {
      //     console.log('Upload error!', err);
      //   });
    // };
    const generateScreenshotName = (email) => {
      let currentTSinSec = Math.floor(new Date().getTime() / 1000);
      let milliSec = String(new Date().getMilliseconds() + String(Math.floor(1000 + Math.random() * 9000))).padStart(7, '0');
      var userstring = email;
      userstring += String(currentTSinSec);
      var filename = "";
      filename += btoa(encodeURI(userstring));
      filename = decodeURIComponent(escape(filename));
      filename += ".screenshot."
      filename += String(currentTSinSec);
      filename += "." + milliSec;
      filename += ".jpg.enc";
      console.log('filename.,.................' + filename);
      return filename;
    }
    const veryIntensiveTask = async (taskDataArguments) => {
      // Example of an interval task
      const { delay } = taskDataArguments;
      await new Promise(async () => { // Never resolve
        setBGService(true)
            console.log("bgservicetask",bgService)
            firstScreenshot()
            interval = setInterval(async () => {
              console.log("setInterval")
              const base64String = await Screenshot.captureScreenshot(user.email);
              await Screenshot.stopCapturing()
              console.log("base64string", base64String)
              console.log("base64string", base64String[0]?.substring(73, 177))
              var today = new Date();
              var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
              console.log("Time", time)
              if (base64String[2] == "false") {
                Screenshot.stopCapturing()
                setBGService(true)
                let delpath = RNFS.ExternalDirectoryPath + '/screenshots/' + base64String[0]?.substring(73, 177)
                RNFS.unlink(delpath).then(() => {
                  console.log('file deleted', delpath);
                })
                  .catch(err => {
                    console.log(err.message, 'file deleted failed');
                  });
              }
              else {
                path = RNFS.ExternalDirectoryPath + '/screenshots/' + generateScreenshotName(user.email)
                const encrypted = encrypt(appConfigData.imageSecret, base64String[1])
                RNFS.writeFile(path, encrypted.toString("base64"), "base64")
                  .then((success) => {
                    console.log('FILE WRITTEN!', success);
                    uploadImage(path);

                  })
                  .catch((err) => {
                    console.log(err);
                  });
              
              }
              let delpath = RNFS.ExternalDirectoryPath + '/screenshots/' + base64String[0]?.substring(73, 177)
              RNFS.unlink(delpath).then(() => {
                console.log('file deleted', delpath);
              })
                .catch(err => {
                  console.log(err.message, 'file deleted failed');
                });
              Screenshot.deleteFile()
            }, delay);
            
          });
        };

        const firstScreenshot = async () => {
          console.log("first screenshot")
          const base64String = await Screenshot.captureScreenshot(user.email);
          await Screenshot.stopCapturing()
          console.log("base64string", base64String)
          console.log("base64string", base64String[0]?.substring(73, 177))
          var today = new Date();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          console.log("Time", time)
          if (base64String[2] == "false") {
            Screenshot.stopCapturing()
            let delpath = RNFS.ExternalDirectoryPath + '/screenshots/' + base64String[0]?.substring(73, 177)
            RNFS.unlink(delpath).then(() => {
              console.log('file deleted', delpath);
            })
              .catch(err => {
                console.log(err.message, 'file deleted failed');
              });
          }
          else {
            path = RNFS.ExternalDirectoryPath + '/screenshots/' + generateScreenshotName(user.email)
            const encrypted = encrypt(imagesecret, base64String[1])
            RNFS.writeFile(path, encrypted.toString("base64"), "base64")
              .then((success) => {
                console.log('FILE WRITTEN!', success);
                uploadImage(path);

              })
              .catch((err) => {
                console.log(err);
              });
            let delpath = RNFS.ExternalDirectoryPath + '/screenshots/' + base64String[0]?.substring(73, 177)
            RNFS.unlink(delpath).then(() => {
              console.log('file deleted', delpath);
            })
              .catch(err => {
                console.log(err.message, 'file deleted failed');
              });
            Screenshot.deleteFile()

          }

    };

    async function isRecord(action) {
      const user = await getUser();
      const body = {
        action: action,
        version: '0.1.5',
        "timestamp": new Date().getTime()
      };
      const { data: configData } = await appRecordApi.request(
        user.organisationCode,
        user.token, body
      );
      console.log('Request startRecord: ', JSON.stringify(configData));
    }

  const countTimer = () =>{
    ++totalSeconds;
           var hour = Math.floor(totalSeconds /3600);
           var minute = Math.floor((totalSeconds - hour*3600)/60);
           var seconds = totalSeconds - (hour*3600 + minute*60);
           if(hour < 10)
             hour = "0"+hour;
           if(minute < 10)
             minute = "0"+minute;
           if(seconds < 10)
             seconds = "0"+seconds;
          //  console.log("timer",hour + ":" + minute + ":" + seconds)
    
    sethour(hour)
    setminute(minute)
    setsec(seconds)
   
 }
 
//  const storeData = async () => {
// let data = true

//   try {
//     await AsyncStorage.setItem('key',JSON.stringify(data))
//   } catch (e) {
//     alert("No data Found ")
//   }
// }

  const startCapture = async () => {
    if (internetState.isConnected === false) {
      Alert.alert(
        "Alert",
        t.warning_internet_unavailable
      );
      return
    }
    // const value = await AsyncStorage.getItem('key')
    // if(value !== null) {
    //   console.log("value",JSON.parse(value))

    // }

    if (appConfigData) {
      setBGService(true)
      isRecord(1);
      await BackgroundService.start(veryIntensiveTask, options);
      totalSeconds=0
      timer = setInterval(countTimer, 1000);
      setStartCountdown(true)
      Alert.alert("", t.success_monitor_started);
      console.log("", t.success_monitor_started);
      
    }
    else {
      Alert.alert(
        "", t.unable_to_process);
    }
    
  };
  const logOut = async () => {
    if (BackgroundService.isRunning()) {
      if (internetState.isConnected === false) {
        Alert.alert(
          "Alert",
          t.warning_internet_unavailable
        );
        return
      }
      stopCapture()
    }
    const body = {
      version: '0.1.5'
    };
    try {
      setLoading(true);
      const user = await getUser();
      const { data: configData } = await appLogoutApi.request(
        user.token, body
      );
      console.log('userData', configData);
      const userData = await getUser();
      userData["logout"] = true;
      setUser(userData);
      saveUser(userData)
      setLoading(false);
      setstable(false)
    }
      catch (error) {
        console.log('error', " " + ' ' + JSON.stringify(error.response));
        Alert.alert(
        "",
        error.response.data.message
      );
        const userData = await getUser();
        userData["logout"] = true;
        setUser(userData);
        saveUser(userData)
        setLoading(false);
      }
    };

    const help = () => {
      setModalVisible(!modalVisible);
      console.log("modalVisible " + modalVisible)
    };

    const stopCapture = async () => {
      try {
        if (internetState.isConnected === false) {
          Alert.alert(
            "Alert",
            t.warning_internet_unavailable
          );
          return
        }
        
        if (BackgroundService.isRunning()) {
          await BackgroundService.stop();
          isRecord(0);
          setBGService(false);
        }
        
          clearInterval(interval)
          clearInterval(timer)
          clearInterval(synced)   
          setStartCountdown(false)
          setCounter(0)
        await Screenshot.stopCapturing();
        updateHours()
        // await Screenshot.deleteFile();
        Alert.alert("", t.success_monitor_stopped);
        console.log("", t.success_monitor_stopped);
        console.log("isrunning stop ")

      } catch (error) {
        isRecord(0);
        setBGService(false);
        console.log('error', error);
      }
    };

    const updateHours = async () => {
      const user = await getUser();
      try {
        const body = {
          "version": '0.1.4',
          "timestamp": new Date().getTime()
        };
        const version = "0.1.4"
        const configData  = await appupdateHoursApi.request(
          user.organisationCode,
          user.token, version
        );
        // console.log("updateHours", JSON.stringify(configData))
        
      } catch (err) {
        console.log("activehrs", err)
      }
    }
    const viewHours = async () => {
      const user = await getUser();
      try {
        const body = {
        "version": '0.1.5',
        "timestamp": new Date().getTime()
      };
      const version = "0.1.5"
      const { data: configData } = await appActiveHoursApi.request(
        user.organisationCode,
        user.token, version
      );
      console.log("ViewActiveHours", JSON.stringify(configData.data.activeMilliseconds))
      var ms = configData.data.activeMilliseconds
        var seconds = Math.floor((ms / 1000) % 60),
          minutes = Math.floor((ms / (1000 * 60)) % 60),
          hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        console.log("hours", hours + ":" + minutes + ":" + seconds + ".")
        sethours(hours+"h"+ " " + minutes+"m")
      } catch (err) {
        console.log("activehrs", err)
      }
    }
    return (
      <ImageBackground source={require('../../assets/inner.png')}
        style={{ flex: 1, width: '100%', height: '100%' }} imageStyle={{ resizeMode: 'cover' }}>
        <SafeAreaView style={styles.container}>
          <View>    
            <Modal 
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <HelpScreen closeModal={() => setModalVisible(false)} />
            </Modal>
            <View style={{ flexDirection: "row", justifyContent: "flex-start", }}>
              <Image style={styles.tinyLogo} source={require('../../assets/logo.png')} />
            </View>

            <View style={{ flex:2, alignItems: 'center', justifyContent: 'flex-start', position: 'relative',paddingTop: 50}}>
            { 
            !bgService? 
                <TouchableOpacity onPress={()=> startCapture()} 
                >
                <Image style={styles.mainButton} source={require('../../assets/start-btn.png') }/>
                <Text style={{position: 'absolute',  color: '#fff', alignSelf:'center', top:50, fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20,}}>Start</Text>
                <ActivityIndicator color={'blue'} size={'large'} animating={loading} style={{position: 'absolute', top: '35%', left: '12%'}} />
              </TouchableOpacity> 
              : 
              <View style={{flexDirection:"row",marginLeft:'auto',marginRight:'auto'}}>
          <View style={{flexDirection:"column",padding:10,alignItems:"center"}}>
          <Text style={{ color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>Hrs</Text>
            <Image style={styles.countdown} source={require('../../assets/start-btn.png') }/>
                <Text style={{position: 'absolute', top: '65%',left: '50%', color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>{hour}</Text>
          </View>
          <View style={{flexDirection:"column",padding:10,alignItems:"center"}}>
          <Text style={{ color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>Min</Text>
            <Image style={styles.countdown} source={require('../../assets/start-btn.png') }/>
                <Text style={{position: 'absolute', top: '65%', left: '50%', color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>{minute}</Text>
          </View>
          <View style={{flexDirection:"column",padding:10,alignItems:"center"}}>
          <Text style={{ color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>Sec</Text>
            <Image style={styles.countdown} source={require('../../assets/start-btn.png') }/>
                <Text style={{position: 'absolute', top: '65%', left: '50%', color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>{sec}</Text>
          </View>
          </View>
          }
              
            </View>
            <View style={{ width: '100%',flexWrap: 'wrap',flex: 3, alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: 50, flexDirection: 'row'}}>
              <View style={styles.box}>
                <Text style={{color: "#7f8ea3", fontSize: 14,lineHeight: 20, marginBottom: 10}}>Today</Text>
                <Text style={{color: "#010239",fontSize: 15,lineHeight: 20,fontWeight: "bold"}}>{hours}</Text>
              </View>
              <View style={styles.box}>
                <Text style={{color: "#7f8ea3", fontSize: 14,lineHeight: 20, marginBottom: 10}}>Mode</Text>
                <Text style={{color: "#010239",fontSize: 15,lineHeight: 20,fontWeight: "bold"}}>Blurred</Text>
              </View>
              <View style={styles.box}>
                <Text style={{color: "#7f8ea3", fontSize: 14,lineHeight: 20, marginBottom: 10}}>Synced</Text>
                <Text style={{color: "#010239",fontSize: 15,lineHeight: 20,fontWeight: "bold"}}>{counter} minutes ago</Text>
              </View>
              <View style={styles.box}>
                <Text style={{color: "#7f8ea3", fontSize: 14,lineHeight: 20, marginBottom: 10}}>Logging</Text>
                <Text style={{color: "#010239",fontSize: 15,lineHeight: 20,fontWeight: "bold"}}>Yes</Text>
              </View>
            </View>
            <View style={styles.logout}>
              <View style={styles.logging}>
              {bgService ? 
                <TouchableOpacity onPress={()=> stopCapture()}>
                  <Image style={styles.stopButton} source= {require('../../assets/start-btn.png')} />
                  <Text style={{position: 'absolute', top: '43%',left:'27%',color: '#fff', fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>Stop</Text>
                </TouchableOpacity> :null}
              
            </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={help}>
                <Image
                  style={styles.iconImg}
                  source={require('../../assets/images/help.png')}
                />
                <Text style={{ color: 'white', fontFamily: 'Avenir',}}>{t.help}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={logOut}>
                <Image
                  style={styles.iconImg}
                  source={require('../../assets/images/logout.png')}
                />
                <Text style={{ color: 'white', fontFamily: 'Avenir', alignItems: 'center', }}>{t.logout}</Text>
              </TouchableOpacity>
            </View>       
          </View>
        </SafeAreaView>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: "column",
    width: '100%'
  },
  tinyLogo: {
    width: 150,
    resizeMode: 'contain',
    marginLeft: "4%"
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    width: '50%',

  },
  iconImg: {
    width: 40,
    height: 40,
    alignItems: 'center',
  },
  logout: {
    
   display: 'flex',
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#010239",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 25,
    height: 125,
    position: 'relative'
  },
  mainButton: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stopButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
    
  },
  button: {
    borderRadius: 5,
    borderWidth: 1,
    padding: 8,
    backgroundColor: 'green',
  },
  buttonStyle: {
    marginTop: 16,
    backgroundColor: 'tomato',
  },
  text: {
    fontFamily: 'Avenir',
    fontSize: 15,
  },
  error: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'red',
    height: '5%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
  },
  fadingContainer: {
    // padding: 20,
    backgroundColor: "white"
  },
  fadingText: {
    fontSize: 24,
    color: '#1e90ff',
    textAlign: "center",
    marginTop: 17

  },
  box: {
    backgroundColor: '#fff', 
    width: '48%', 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 15, 
    shadowColor: "#98a2c0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
  logging: {
    position:"absolute",
    top: -35,
    left: "46.5%"
  }
});

export default CaptureScreen;