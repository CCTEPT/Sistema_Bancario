import { useState, useEffect } from "react";

const TOKEN_KEY = "banking_token";

export function getAuthToken() { return localStorage.getItem(TOKEN_KEY); }
export function setAuthToken(token) { localStorage.setItem(TOKEN_KEY, token); }
export function removeAuthToken() { localStorage.removeItem(TOKEN_KEY); }

export function useAuth() {
    const [token, setTokenState] = useState(getAuthToken());

    // Borramos el setAuthTokenGetter de @workspace
    
    const login = (newToken) => {
        setAuthToken(newToken);
        setTokenState(newToken);
    };

    const logout = () => {
        removeAuthToken();
        setTokenState(null);
    };

    return { 
        token: token || "dev-token", 
        login, 
        logout, 
        isAuthenticated: true // Para que veas tu Dashboard ya mismo
    };
}