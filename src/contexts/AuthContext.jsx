import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Kullanıcı bilgileri burada saklanacak

    const login = (userData) => setUser(userData); // Girişte kullanıcı bilgilerini güncelle
    const signup = (userData) => setUser(userData); // Kayıtta kullanıcı bilgilerini güncelle
    const logout = () => setUser(null); // Çıkışta bilgileri temizle

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); // Kolay erişim için hook
