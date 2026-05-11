import axios from 'axios';

const getStoredToken = () => {
    const localToken = localStorage.getItem('banking_token');
    if (localToken) return localToken;

    try {
        const persisted = JSON.parse(localStorage.getItem('auth-novabank') || '{}');
        if (persisted?.state?.token) return persisted.state.token;
        if (persisted?.token) return persisted.token;
        if (persisted?.session?.token) return persisted.session.token;
        return null;
    } catch {
        return null;
    }
};

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    },
});

const axiosRegister = axios.create({
    baseURL: import.meta.env.VITE_AUTH,
    timeout: 5000,
    headers:{
        'Content-Type': 'application/json'
    }
});

const axiosBank = axios.create({
    baseURL: import.meta.env.VITE_BANK_SERVICE,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const axiosFinancial = axios.create({
    baseURL: import.meta.env.VITE_FINANCIAL_SERVICE,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosAuth.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosBank.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosFinancial.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { axiosAuth, axiosRegister, axiosBank, axiosFinancial };
