import axios from 'axios';

const BASE_URL = location.protocol+'//'+window.location.hostname+'/api/v1.0'

export {doLogin, doLogoff};

function doLogin() {
    const url = `${BASE_URL}/auth/login`
}