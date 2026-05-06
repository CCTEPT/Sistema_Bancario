import axios from 'axios';

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

/*
const axiosBank = axios.create({
    baseURL: import.meta.env.VITE_BANK_SERVICE,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});
*/

export { axiosAuth };