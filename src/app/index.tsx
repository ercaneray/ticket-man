import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Keyboard, TouchableWithoutFeedback, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { useAuth } from "../contexts/AuthContext";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fetchUserData } from '../utils/fetchUserData';
import { Link } from 'expo-router';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "839369740385-li16ni4vd50j0920g020ivotfbrlpq7f.apps.googleusercontent.com",
        androidClientId: "839369740385-li16ni4vd50j0920g020ivotfbrlpq7f.apps.googleusercontent.com",
        iosClientId: "839369740385-li16ni4vd50j0920g020ivotfbrlpq7f.apps.googleusercontent.com",
        redirectUri: "https://auth.expo.io/@eryrcn/ticket-man",
        responseType: "id_token",
        scopes: ['openid', 'profile', 'email']
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            console.log("Auth response:", id_token);
            
            const credential = GoogleAuthProvider.credential(
                id_token
            );
            
            signInWithCredential(auth, credential)
                .then(async (result) => {
                    console.log("Firebase auth successful");
                    const user = result.user;
                    try {
                        const userDoc = await getDoc(doc(db, "users", user.uid));

                        if (!userDoc.exists()) {
                            await setDoc(doc(db, "users", user.uid), {
                                email: user.email,
                                firstName: user.displayName?.split(' ')[0] || '',
                                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                                createdAt: new Date().toISOString(),
                            });
                        }

                        const userData = userDoc.exists() ? userDoc.data() : {
                            firstName: user.displayName?.split(' ')[0] || '',
                            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                        };

                        login({
                            id: user.uid,
                            email: user.email || '',
                            ...userData
                        });

                        router.push('/tabs/home');
                    } catch (error) {
                        console.error("Firestore error:", error);
                        Alert.alert('Hata', 'Kullanıcı bilgileri kaydedilirken bir hata oluştu.');
                    }
                })
                .catch((error) => {
                    console.error("Auth error:", error);
                    Alert.alert('Hata', 'Giriş yapılamadı');
                });
        }
    }, [response]);

    const handleLogin = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userData = await fetchUserData(user.uid);
            login({ id: user.uid, ...userData });
            router.push('/tabs/home')
        } catch (error) {
            Alert.alert('Hata', 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await promptAsync();
            console.log("Auth result:", result);
        } catch (error) {
            console.error("Google login error:", error);
            Alert.alert('Hata', 'Google ile giriş yapılırken bir hata oluştu.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="ticket-outline" size={60} color="#2196f3" />
                    <Text style={styles.title}>TicketMan</Text>
                    <Text style={styles.subtitle}>Etkinlik biletleri için doğru adres</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.googleButton]}
                    onPress={handleGoogleLogin}
                >
                    <Ionicons name="logo-google" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Google ile Giriş Yap (Test)</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>veya</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleLogin(email, password)}
                    >
                        <Text style={styles.buttonText}>Giriş Yap</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Hesabın yok mu? </Text>
                        <Link href="/signup" style={styles.linkText}>Kayıt ol</Link>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2196f3',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    inputContainer: {
        flex: 2,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2196f3',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2196f3',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 16,
    },
    linkText: {
        color: '#2196f3',
        fontSize: 16,
        fontWeight: 'bold',
    },
    googleButton: {
        backgroundColor: '#4285F4',
        marginHorizontal: 20,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 10,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        marginHorizontal: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#666',
    },
});

export default Login;
