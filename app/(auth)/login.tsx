import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { use, useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/components/BackButton'
import Input from '@/components/input'
import * as Icons from 'phosphor-react-native'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/authContext'

const Login = () => {
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const router = useRouter();
    const { login: loginUser } = useAuth();

    const handleSubmit = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Error", "Please fill all the fields");
            return;
        }
        setIsLoading(true);
        const res = await loginUser(emailRef.current, passwordRef.current);
        setIsLoading(false);
        if (!res?.success) {
            Alert.alert("Error", res.msg);
            return;
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton />

                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={15} fontWeight={"800"}  >Hey,</Typo>
                    <Typo size={15} fontWeight={"800"}  >Welcome Back</Typo>
                </View>

                {/* form */}
                <View style={styles.form}>
                    <Typo size={7} color={colors.textLighter}>
                        Login now to track all your expenses
                    </Typo>
                    <Input
                        placeholder='Enter your email'
                        onChangeText={(value) => (emailRef.current = value)}
                        icon={
                            <Icons.At
                                size={verticalScale(10)}
                                color={colors.neutral300}
                                weight="fill"
                            />
                        }
                    />
                    <Input
                        placeholder='Enter your password'
                        secureTextEntry
                        onChangeText={(value) => (passwordRef.current = value)}
                        icon={
                            <Icons.Lock
                                size={verticalScale(10)}
                                color={colors.neutral300}
                                weight="fill"
                            />
                        }
                    />

                    <Typo size={7} color={colors.text} style={{ alignSelf: "flex-end" }}>Forgot Password?
                    </Typo>
                    <Button loading={isLoading} onPress={handleSubmit}>
                        <Typo fontWeight={'700'} color={colors.black} size={10}>
                            Login
                        </Typo>
                    </Button>

                </View>

                {/* footer */}
                <View style={styles.footer}>
                    <Typo size={7}>
                        Don't have an account?
                    </Typo>
                    <Pressable onPress={() => router.push("/(auth)/register")}>
                        <Typo size={7} fontWeight={"600"} color={colors.primary}>
                            Sign up
                        </Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacingX._30,
        paddingHorizontal: spacingX._20
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: "bold",
        color: colors.text,
    },
    form: {
        gap: spacingX._20
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: "500",
        color: colors.text
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    footerText: {
        textAlign: "center",
        color: colors.text,
        fontSize: verticalScale(15)
    }
})