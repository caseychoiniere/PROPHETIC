import { observable, action } from 'mobx';
import api from '../api';
import AuthStore from './AuthStore';
import { checkStatus } from '../util/fetchUtil';
import { generateUniqueKey } from '../util/baseUtils';

export class MainStore {
    @observable anchorElements;
    @observable datasets;
    @observable counter;
    @observable drawers;
    @observable loading;
    @observable openNav;

    constructor() {
        this.anchorElements = observable.map();
        this.counter = observable.map();
        this.datasets = [];
        this.drawers = observable.map();
        this.loading = true;
        this.openNav = false;
    }


    @action getAllDataSets(cid) {
        mainStore.toggleLoading();
        const token = AuthStore.ddsAPIToken;
        if(token) {
            api.getAllDataSets(token)
                .then(response => response.json())
                .then((json) => {
                    let datasets = json.results;
                    json.results.forEach((d) => {
                        api.getDatasetMetadata(d.id, token)
                            .then(response => response.json())
                            .then((json) => {
                                datasets.map(d => {
                                    json.results.map(m => {
                                        if(m.object.id === d.id){
                                            mainStore.datasets.push({
                                                description: m.properties[0].value,
                                                id: d.id,
                                                file: d
                                            })
                                        }
                                    })
                                });

                                // mainStore.toggleLoading();
                            })
                            .catch(ex => mainStore.handleErrors(ex))
                    })
                })
                .catch(ex => this.handleErrors(ex))
        } else {
            const counterId = cid !== undefined ? cid : generateUniqueKey();
            mainStore.waitForToken(mainStore.getAllDataSets, [counterId], 1000, counterId)
        }
    }

    @action test() {
        api.test()
            .then(checkStatus)
            .then(response => response.json())
            .then((json) => {
                console.log(json)
            }).catch(er => this.handleErrors(er))
    }

    @action setAnchorElement(anchorEl, i) {
        let a = this.anchorElements;
        !a.has(i) ? a.set(i, anchorEl) : a.delete(i);
        this.anchorElements = a;
    }

    @action toggleLoading() {
        // this.loading = !this.loading;
    }

    @action toggleDrawer(key) {
        !this.drawers.has(key) ? this.drawers.set(key, true) : this.drawers.delete(key);
    }

    @action handleErrors(er) {
        console.log(er)
        // this.loading = false;
        if (er.response.status === 401) {
            localStorage.setItem('redirectUrl', window.location.href);
            AuthStore.logout(er);
        }
    }

    @action waitForToken(func, args, delay, counterId) {
        const sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        };
        if(!this.counter.has(counterId)) {
            this.counter.set(counterId, 0);
        } else {
            let c = this.counter.get(counterId);
            c++;
            this.counter.set(counterId, c);
        }
        if(this.counter.get(counterId) < 10) {
            const tryAgain = async () => {
                await sleep(delay);
                func(...args);
            };
            tryAgain();
        } else {
            this.counter.delete(counterId);
            alert('failed to fetch')
        }
    }
}

const mainStore = new MainStore();

export default mainStore;