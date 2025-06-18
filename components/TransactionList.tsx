import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { TransactionItemProps, TransactionListType, TransactionType } from '@/types'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Typo from './Typo'
import { FlashList } from "@shopify/flash-list";
import Loading from './Loading'
import { expenseCategories, incomeCategory } from '@/constants/data'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Timestamp } from 'firebase/firestore'
import { useRouter } from 'expo-router'

const TransactionList = ({
    data,
    title,
    loading,
    emptyListMessage
}: TransactionListType) => {
    const router = useRouter();
    const handleClick = (item: TransactionType) => {
        router.push({
            pathname: "/(modals)/transactionModal",
            params: {
                id: item?.id,
                type: item?.type,
                amount: item?.amount?.toString(),
                category: item?.category,
                date: (item?.date as Timestamp)?.toDate()?.toISOString(),
                description: item?.description,
                image: item?.image,
                uid: item?.uid,
                walletId: item?.walletId
            },
        });
    };
    return (
        <View style={styles.container}>
            {title && (
                <Typo size={10} fontWeight={"500"}>
                    {title}
                </Typo>
            )}
            <View style={styles.list}>
                <FlashList
                    data={data}
                    renderItem={({ item, index }) => <TransactionItem item={item} index={index} handleClick={handleClick} />}
                    estimatedItemSize={60}
                />
            </View>

            {!loading && data.length == 0 && (
                <Typo
                    size={8}
                    color={colors.neutral400}
                    style={{ textAlign: "center", marginTop: spacingY._15 }}
                >
                    {emptyListMessage}
                </Typo>
            )}
            {loading && (
                <View style={{ top: verticalScale(40) }}>
                    <Loading />
                </View>
            )}
        </View>
    )
}

const TransactionItem = ({
    item, index, handleClick,
}: TransactionItemProps) => {
    let category = item?.type == 'income' ? incomeCategory : expenseCategories[item.category!];
    const IconComponent = category.icon;

    const date = (item?.date as Timestamp)?.toDate()?.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    return (
        <Animated.View entering={FadeInDown.delay(index * 70).springify().damping(14)}>
            <TouchableOpacity style={styles.row} onPress={() => handleClick(item)}>
                <View style={[styles.icons, { backgroundColor: category.bgColor }]}>
                    {IconComponent && (
                        <IconComponent
                            size={verticalScale(10)}
                            weight='fill'
                            color={colors.white}
                        />
                    )}
                </View>
                <View style={styles.categoryDes}>
                    <Typo size={8}>{category.label}</Typo>
                    <Typo size={6} color={colors.neutral400} textProps={{ numberOfLines: 1 }}>
                        {item?.description}
                    </Typo>
                </View>

                <View style={styles.amountDate}>
                    <Typo fontWeight={"500"} color={item?.type == "income" ? colors.primary : colors.rose}>
                        {`${item?.type == 'income' ? "+ $" : "- $"}${item?.amount}`}
                    </Typo>
                    <Typo size={5} color={colors.neutral400}>
                        {date}
                    </Typo>
                </View>

            </TouchableOpacity>
        </Animated.View>

    )
}
export default TransactionList

const styles = StyleSheet.create({
    container: {
        gap: spacingY._3,
    },
    list: {
        minHeight: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingX._5,
        marginBottom: spacingY._5,

        // list with background
        backgroundColor: colors.neutral800,
        padding: spacingY._5,
        paddingHorizontal: spacingY._5,
        borderRadius: radius._10
    },
    icons: {
        height: verticalScale(20),
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: radius._6,
        borderCurve: "continuous"
    },
    categoryDes: {
        flex: 1,
        gap: 1
    },
    amountDate: {
        alignItems: "flex-end",
        gap: 3
    }
})