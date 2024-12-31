import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Keyboard, TouchableWithoutFeedback, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { auth } from '../firebaseConfig';
import { useAuth } from "../contexts/AuthContext";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { fetchUserData } from '../utils/fetchUserData';
import { Link } from 'expo-router';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="ticket-outline" size={60} color="#2196f3" />
                    <Text style={styles.title}>TicketMan</Text>
                    <Text style={styles.subtitle}>Etkinlik biletleri için doğru adres</Text>
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
});

export default Login;
