import axios from 'axios';

const BASE_URL = location.protocol+'//'+window.location.hostname+':5000/api/v2.0'

export {doLogin, doLogoff};

function doLogin() {
    const url = `${BASE_URL}/auth/login`
}