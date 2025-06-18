import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { use, useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/imageService'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import Input from '@/components/input'
import { UserDataType, WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { updateUser } from '@/services/userService'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '@/components/imageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'

const WalletModal = () => {

    const { user, updateUserData } = useAuth();
    const [wallet, setWallet] = useState<WalletType>({
        name: "",
        image: null,
    })

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const oldWallet: { name: string; image: string; id: string } = useLocalSearchParams();

    useEffect(() => {
        if (oldWallet?.id) {
            setWallet({
                name: oldWallet?.name,
                image: oldWallet?.image
            });
        }
    }, []);

    const onSubmit = async () => {
        let { name, image } = wallet;
        if (!name.trim() || !image) {
            Alert.alert("Wallet", "Please fill all the fields");
            return;
        }

        const data: WalletType = {
            name,
            image,
            uid: user?.uid
        };
        if (oldWallet?.id) data.id = oldWallet?.id;
        setLoading(true);
        const res = await createOrUpdateWallet(data);
        setLoading(false);
        // console.log('result: ', res);
        if (res.success) {
            router.back();
        } else {
            Alert.alert("Wallet", res.msg)
        }
    };
    const onDelete = async () => {
        // console.log("deleting wallet: ", oldWallet?.id);
        if (!oldWallet?.id) return;
        setLoading(true);
        const res = await deleteWallet(oldWallet?.id);
        setLoading(false);
        if (res.success) {
            router.back();
        } else {
            Alert.alert("Wallet", res.msg);
        }
    }

    const showDeleteAlert = () => {
        Alert.alert("Confirm", "Are you sure you want to delete this? \n This action will remove all the transactions related to this wallet", [{
            text: "Cancel",
            onPress: () => console.log("Cancel delete"),
            style: 'cancel'
        },
        {
            text: "Delete",
            onPress: () => onDelete(),
            style: 'destructive'
        },
        ])
    }

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <Header
                    title={oldWallet?.id ? "Update Wallet" : "New Wallet"}
                    leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />

                {/* form */}
                <ScrollView contentContainerStyle={styles.form}>

                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Name</Typo>
                        <Input
                            placeholder='Salary'
                            value={wallet.name}
                            onChangeText={(value) => setWallet({ ...wallet, name: value })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Icon</Typo>
                        {/* image input */}
                        <ImageUpload
                            file={wallet.image}
                            onClear={() => setWallet({ ...wallet, image: null })}
                            onSelect={file => setWallet({ ...wallet, image: file })}
                            placeholder='Uplaod Image'
                        />
                    </View>
                </ScrollView>
            </View>
            <View style={styles.footer}>
                {oldWallet?.id && !loading && (
                    <Button onPress={showDeleteAlert} style={{ backgroundColor: colors.rose, paddingHorizontal: spacingX._15 }}>
                        <Icons.Trash
                            color={colors.white}
                            size={verticalScale(12)}
                            weight='bold'
                        />
                    </Button>
                )}
                <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
                    <Typo color={colors.black} fontWeight="700">{oldWallet?.id ? "Update Wallet" : "Add Wallet"}</Typo>
                </Button>
            </View>
        </ModalWrapper>
    )
}

export default WalletModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._10,
        // paddingVertical: spacingY._30,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        padding: spacingX._10,
        gap: scale(10),
        paddingTop: spacingX._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._2,
        borderTopWidth: 1,
    },
    form: {
        gap: spacingY._10,
        marginTop: spacingY._3
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center"
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: colors.neutral300,
        height: verticalScale(60),
        width: verticalScale(60),
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.neutral500,
        // overflow: "hidden",
        // position:"relative"
    },
    editIcon: {
        position: "absolute",
        bottom: spacingY._2,
        right: spacingY._2,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._5,
    },
    inputContainer: {
        gap: spacingY._5
    }
})