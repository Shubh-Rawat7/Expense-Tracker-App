import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Typo from './Typo'
import { WalletType } from '@/types'
import { Router } from 'expo-router'
import { verticalScale } from '@/utils/styling'
import { colors, radius, spacingX } from '@/constants/theme'
import { Image } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

const WalletListItem = ({
  item,
  index,
  router
}: {
  item: WalletType,
  index: number,
  router: Router
}) => {


  const openWallet = () => {
    router.push({
      pathname: "/(modals)/walletModal",
      params: {
        id: item?.id,
        name: item?.name,
        image: item?.image
      }
    })
  }
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(13)}>
      <TouchableOpacity style={styles.container} onPress={openWallet}>
        <View style={styles.imageContainer}>
          <Image
            style={{ flex: 1 }}
            source={item?.image}
            contentFit='cover'
            transition={100}
          />
        </View>
        <View style={styles.nameContainer}>
          <Typo size={8}>{item?.name}</Typo>
          <Typo size={6} color={colors.neutral400}>${item?.amount}</Typo>
        </View>
        <Icons.CaretRight
          size={verticalScale(10)}
          weight='bold'
          color={colors.white}
        />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default WalletListItem

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
    // padding: spacingX._15
  },
  imageContainer: {
    height: verticalScale(25),
    width: verticalScale(25),
    borderWidth: 1,
    borderColor: colors.neutral600,
    borderRadius: radius._6,
    borderCurve: "continuous",
    overflow: "hidden"
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginLeft: spacingX._10
  }
})