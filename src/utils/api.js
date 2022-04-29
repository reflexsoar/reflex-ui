import axios from 'axios';

const BASE_URL = location.protocol+'//'+window.location.host+'/api/v2.0'

export {doLogin, doLogoff};

function doLogin() {
    const url = `${BASE_URL}/auth/login`
}