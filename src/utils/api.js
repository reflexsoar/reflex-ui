import axios from 'axios';

const BASE_URL = 'http://localhost:5000'

export {doLogin, doLogoff};

function doLogin() {
    const url = `${BASE_URL}/auth/login`
}