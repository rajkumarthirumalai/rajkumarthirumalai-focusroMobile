import { View, Text, ImageBackground, Image, StyleSheet, SafeAreaView ,Linking, TouchableOpacity} from 'react-native'
import React from 'react'

export default function HelpScreen() {
  return (
    <ImageBackground source={require('../../assets/inner.png')}
      style={{ flex: 1, width: '100%', height: '100%' }} imageStyle={{ resizeMode: 'cover' }}>
      <SafeAreaView style={styles.container}>
        <View style={{height:"50%",width:"100%"}}>
        <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>

          <Image style={styles.tinyLogo} source={require('../../assets/logo.png')} />

        </View>
        <View style={{ paddingLeft: "4%" }}>
          <Text style={{ color: "white",fontFamily: 'Avenir',fontWeight: 'bold', fontSize: 20, lineHeight: 20 }}>Help </Text>
          <Text style={{ color: "white",fontFamily: 'Avenir',fontSize: 14, lineHeight: 20 }}>Email us with any questions and issues</Text>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
          onPress={() => Linking.openURL('mailto:support@example.com?subject=SendMail&body=Description')}
          >
          <Text style={styles.box} >SUPPORT@FOCUSRO.COM</Text>
          </TouchableOpacity>
        </View>
        </View>
        <View style={{height:"50%",width:"100%"}}>
        <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>

          <Image style={{ resizeMode: "center" }} source={require('../../assets/help-img.png')} />
        </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
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
  text: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: '20%',
    marginBottom: 20,
    fontFamily: 'Avenir',
  },
  input: {
    width: '80%',
    borderRadius: 25,
    backgroundColor: "white",
    color: 'black',
    textAlign: "center"
  },
  loginput: {
    width: '80%',
    borderRadius: 12,
    backgroundColor: "#8a2be2",
    padding: 10,
    marginVertical: "10%",
    height: 45,


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
  box: {
    marginTop: "25%",
    backgroundColor: "white",
    width: "80%", padding: 15,
    textAlign: "center",
    borderRadius: 23,
    color: "black",
    marginLeft: "auto",
    marginRight: "auto",
    shadowColor: "#98a2c0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    fontFamily: 'Avenir',
    fontWeight: 'bold'
  }
});
