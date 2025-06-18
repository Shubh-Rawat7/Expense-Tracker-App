import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View>
        <TouchableOpacity onPress={()=> router.push('/(auth)/login')} style={[styles.loginButton, { zIndex: 10 }]}>
          <Typo size={10} fontWeight={"600"}>Sign In</Typo>
        </TouchableOpacity>

        <Animated.Image 
          entering={FadeIn.duration(1000)}
          source={require("../../assets/images/welcome.png")}
          style={styles.welcomeImage}
          resizeMode="contain"
        />
      </View>
    </View>

    <View style={styles.footer}>
      <Animated.View entering={FadeInDown.duration(1000).springify().damping(12)} style={{alignItems:"center"}}>
        <Typo size={13} fontWeight={"800"}>
          Always take control
        </Typo>
        <Typo size={13} fontWeight={"800"}>
          of your finances
        </Typo>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1000).delay(100).springify().damping(12)} style={{alignItems:"center", gap: 1}}>
        <Typo size={8} color={colors.textLight}>
          Finances must be arranged to set a
        </Typo>
        <Typo size={8} color={colors.textLight}>
           better lifestyle in future
        </Typo>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(1000).delay(100).springify().damping(12)} style={styles.buttonContainer}>
        <Button onPress={()=> router.push('/(auth)/register')}>
          <Typo size={10} color={colors.neutral900} fontWeight={"600"}>Get Started</Typo>
        </Button>
      </Animated.View>
    </View>

    </ScreenWrapper>
  )
}

export default Welcome;

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"space-between",
    paddingTop: spacingX._7,
  },

  welcomeImage:{
    width:"100%",
    height: verticalScale(300),
    alignSelf:"center",

    marginTop: verticalScale(-50)
  },
  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20
  },
  footer:{
    backgroundColor: colors.neutral900,
    alignItems:"center",
    paddingTop: verticalScale(15),
    paddingBottom:verticalScale(25),
    gap: spacingY._20,
    shadowColor: "white",
    elevation: 20,
    shadowOffset:{width: 0, height: -10},
    shadowRadius: 25,
    shadowOpacity: 0.15
  },
  buttonContainer:{
    width:"100%",
    paddingHorizontal: spacingX._25,
  },

});