import { observable, action } from 'mobx';
import api from '../api';
import auth0 from 'auth0-js';
import { config } from '../config';
import MainStore from './MainStore';

export class AuthStore {
    @observable auth0;
    @observable ddsAPIToken;
    @observable userProfile;

    constructor() {
        this.auth0 = new auth0.WebAuth({
            clientID: config.CLIENT_ID,
            domain: config.AUTH0_URL || '',
            responseType: 'token id_token',
            audience: config.API_ID,
            redirectUri: config.REDIRECT_URI,
            scope: 'openid email profile',
            options: {
                rememberLastLogin: false
            }
        });
        this.ddsAPIToken = null;
        this.userProfile = null;
    }

    @action checkTokenExpiration() {
        if(this.isAuthenticated()) {
            setTimeout(() => this.checkTokenExpiration(), 60000);
        } else {
            this.logout();
        }
    }

    @action getAccessToken() {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('No Access Token found');
        }
        return accessToken;
    }

    @action getDDSApiToken() {
        api.getDDSApiToken()
            .then(response => response.json())
            .then(json => this.ddsAPIToken = json.api_token)
            .catch(er => MainStore.handleErrors(er))
    }

    @action getProfile() {
        const accessToken = this.getAccessToken();
        this.auth0.client.userInfo(accessToken, (err, profile) => {
            if (profile) this.userProfile = profile;
        });
    }

    @action handleAuthentication() {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult);
            } else if (err) {
                window.location.assign('/login');
                MainStore.toggleLoading();
            }
        });
    }

    @action isAuthenticated() {
        let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

    @action login() {
        this.auth0.authorize();
    }

    @action logout(er) {
        if(!er) localStorage.removeItem('redirectUrl');
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        window.location.assign(`${config.AUTH0_URL}v2/logout?returnTo=${config.REDIRECT_URI}`);
    }

    @action setSession(authResult) {
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        const redirectUrl = localStorage.getItem('redirectUrl') ? localStorage.getItem('redirectUrl') : '/';
        window.location.assign(redirectUrl);
        MainStore.toggleLoading();
    }
}

const authStore = new AuthStore();

export default authStore;