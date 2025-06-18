import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useAuth } from '@/contexts/authContext'
import ScreenWrapper from '@/components/ScreenWrapper'
import { verticalScale } from '@/utils/styling'
import * as Icons from 'phosphor-react-native'
import HomeCard from '@/components/HomeCard'
import TransactionList from '@/components/TransactionList'
import { useRouter } from 'expo-router'
import { push } from 'expo-router/build/global-state/routing'
import { limit, orderBy, where } from 'firebase/firestore'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from '@/types'

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(30)
  ];
  const {
    data: recentTransactions,
    error,
    loading: transactionsLoading
  } = useFetchData<TransactionType>("transactions", constraints);
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <View style={{}}>
            <Typo size={10} color={colors.neutral400}>Hello,</Typo>
            <Typo size={15} fontWeight={"500"}>{user?.name}</Typo>
          </View>
          <TouchableOpacity onPress={()=> router.push("/(modals)/searchModal")} style={styles.searchIcon}>
            <Icons.MagnifyingGlass
              size={verticalScale(13)}
              color={colors.neutral200}
              weight='bold'
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* card */}
          <View>
            <HomeCard />
          </View>

          <TransactionList
            data={recentTransactions}
            loading={transactionsLoading}
            emptyListMessage='No Transactions added yet'
            title='Recent Transactions'
          />
        </ScrollView>

        <Button style={styles.floatingButton} onPress={() => router.push('/(modals)/transactionModal')}>
          <Icons.Plus
            color={colors.black}
            weight='bold'
            size={verticalScale(17)}
          />
        </Button>
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8)
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._3
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(25),
    width: verticalScale(25),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(10),
    right: verticalScale(10)
  },
  scrollViewStyle: {
    marginTop: spacingY._3,
    paddingBottom: verticalScale(100),
    gap: spacingY._10
  }
})