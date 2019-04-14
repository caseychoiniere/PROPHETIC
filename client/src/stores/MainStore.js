import { observable, action } from 'mobx';
import api from '../api';
import AuthStore from './AuthStore';
import { checkStatus } from '../util/fetchUtil';
import { generateUniqueKey } from '../util/baseUtils';
import EmailValidator from 'email-validator';
import { Exc } from "../exclusions";

export class MainStore {
    @observable anchorElements;
    @observable data;
    @observable datasets;
    @observable downloadQueue;
    @observable errors;
    @observable exclusions;
    @observable expandedPanels;
    @observable counter;
    @observable drawers;
    @observable graphData;
    @observable inputValues;
    @observable loading;
    @observable onlyShowScrollButtonRight;
    @observable openNav;
    @observable modals;
    @observable showCookieConsent;
    @observable showScrollButtonLeft;
    @observable showScrollButtonRight;
    @observable showSharingIcons;
    @observable surveyAffiliations;
    @observable validationErrors;

    constructor() {
        this.anchorElements = observable.map();
        this.counter = observable.map();
        this.data = [];
        this.datasets = [];
        this.downloadQueue = observable.map();
        this.errors = observable.map();
        this.exclusions = observable.map();
        this.expandedPanels = observable.map();
        this.drawers = observable.map();
        this.graphData = [{
            action: 'All Patients',
            pv: this.data.length,
            range: false
        }];
        this.inputValues = observable.map();
        this.loading = false;
        this.openNav = false;
        this.originalData = [];
        this.modals = observable.map();
        this.showCookieConsent = true;
        this.showScrollButtonLeft = false;
        this.showScrollButtonRight = false;
        this.showSharingIcons = false;
        this.surveyAffiliations = observable.map();
        this.validationErrors = observable.map();

        this.onlyShowScrollButtonRight = false;

        this.organizationTypes = [
            "Academic Medical Center",
            "Non-academic Clinical Research Site",
            "Clinical Research Organization",
            "Institutional Review Board",
            "Industry - Pharmaceutical",
            "Industry - Device",
            "Industry - Other",
            "Government (FDA, NIH, VA)"
        ]
    }

    @action checkCookieConsent() {
        this.showCookieConsent = !localStorage.getItem('cookie_consent');
    }

    @action getRelatedExclusions(key) { // Removes exclusions that are only valid based on another exclusion e.g. Congestive_Heart_Failure & NYHA_Class_IV
        let related = [];
        if(key === Exc.HIV_Infection[1]) related = [{e: Exc["CD4 Count"][0], k: Exc["CD4 Count"][1], v: {min: 0, max: 1000}}];
        if(key === Exc.Congestive_Heart_Failure[1]) related = [{e: Exc.NYHA_Class_IV[0], k: Exc.NYHA_Class_IV[1], v: false}];
        return related;
    }

    @action deleteExclusions(exc, key, value) {
        let toDelete = [{e: exc, k: key, v: value}];
        toDelete.push(...this.getRelatedExclusions(key));
        toDelete.forEach(i => {
            this.exclusions.delete(i.e);
            this.data = this.filterData(i.k, i.v, false);
        });
    }

    @action downloadDataset() {
        const id = this.downloadQueue.keys().next().value;
        api.downloadDataset(id, AuthStore.ddsAPIToken)
            .then(checkStatus)
            .then(response => response.json())
            .then((json) => {
                const host = json.host;
                const url = json.url;
                const win = window.open(host + url, '_blank');
                if (win) {
                    win.focus();
                } else { // if browser blocks popups use location.href instead
                    window.location.href = host + url;
                }
                this.queueDownload();
            }).catch(ex => this.handleErrors(ex))
    }

    @action filterData(exclusion, value, remove = true) {
        let newData = [];
        if(remove) { // If removing items just filter the existing this.data array
            if (typeof value === 'boolean') newData = this.data.filter(d => d[exclusion] === (true || null)); // Todo: How to handle null values? INCLUDE OR EXCLUDE
            // if (typeof value === 'boolean') newData = this.data.filter(d => d[exclusion] !== (true || null)); // Todo: How to handle null values? INCLUDE OR EXCLUDE
            else newData = this.data.filter((d) => d[exclusion] >= value.min && d[exclusion] <= value.max);
        } else { // If adding items back in replace this.data by filtering original data array
            let filters = this.exclusions.values();
            if(filters.length) { // Use values from exclusions to filter data
                this.data = this.originalData;
                for (let f of filters) {
                    let filtered;
                    if (typeof f.range === 'boolean') {
                        filtered = [...this.data.filter(d => d[f.key] === (true || null))];
                    } else {
                        // console.log(this.data.filter((d) => d[f.key] >= f.range.min && d[f.key] <= f.range.max).length);
                        filtered = [...this.data.filter((d) => d[f.key] >= f.range.min && d[f.key] <= f.range.max)];
                    }
                    this.data = filtered;
                    this.exclusions.set(f.action, { key: f.key, action: f.action, pv:  filtered.length, range: typeof f.range !== 'boolean' && f.range});
                    this.setGraphData();
                }
                return this.data;
            } else {
                this.setGraphData();
                newData = this.originalData; // If no filters just return original data array
            }
        }
        return newData
    }

    @action formatSurveyFormData(inputs) {
        let formData = inputs.map(i => {
            let key = i.labels[0].textContent.replace(/[^\x00-\x7F]/g, '').slice(0, -1);
            return {[key]:i.value}
        });
        let affiliations = [...this.surveyAffiliations.keys()].filter((k) => k !== 'other');
        if(this.surveyAffiliations.has('other')) {
            affiliations.push(`other: ${inputs.filter((i) => i.id === 'other')[0].value}`)
        }
        return [...formData, {affiliations: [...affiliations]}];
    }

    @action getAllDataSets(cid) {
        mainStore.toggleLoading();
        const token = AuthStore.ddsAPIToken;
        if(token && !mainStore.datasets.length) {
            api.getAllDataSets(token)
                .then(checkStatus)
                .then(response => response.json())
                .then((json) => {
                    let datasets = json.results;
                    json.results.forEach((d) => {
                        api.getDatasetMetadata(d.id, token)
                            .then(checkStatus)
                            .then(response => response.json())
                            .then((json) => {
                                // If metadata is not defined just show the dataset without it
                                if(!json.results.length ) {
                                    mainStore.datasets.push({
                                        id: d.id,
                                        file: d
                                    })
                                }
                                datasets.map(d => {
                                    json.results.map(m => {
                                        if (m.object.id === d.id) {
                                            mainStore.datasets.push({
                                                metadata: m.properties.map(p => p),
                                                id: d.id,
                                                file: d
                                            })
                                        }
                                    });
                                });
                            })
                            .catch(ex => mainStore.handleErrors(ex))
                    });
                    mainStore.toggleLoading();
                })
                .catch(ex => mainStore.handleErrors(ex))
        } else {
            const counterId = cid !== undefined ? cid : generateUniqueKey();
            mainStore.toggleLoading();
            mainStore.waitForToken(mainStore.getAllDataSets, [counterId], 1000, counterId);
        }
    }

    @action getTrialData() {
        this.loading = true;
        api.getTrialData()
            .then(checkStatus)
            .then(response => response.json())
            .then((json) => {
                this.data = json.patients;
                this.originalData = json.patients;
                this.graphData = [{
                    action: 'All Patients',
                    pv: this.data.length,
                    range: false
                }];
                this.loading = false;
            }).catch(er => this.handleErrors(er))
    }

    @action handleErrors(er) {
        this.loading = false;
        if(er.response) {
            if (er.response.status === 401) {
                localStorage.setItem('redirectUrl', window.location.href);
                AuthStore.logout(er);
            } else {
                this.errors.set(er.response.status, er);
            }
        } else {
            console.log(er);
            throw new Error(er)
        }
    }

    @action postUserResponse(inputs) {
        const { userProfile } = AuthStore;
        const file = this.datasets.find(d => d.id ===this.downloadQueue.keys().next().value).file;
        const formData = this.formatSurveyFormData(inputs);
        api.postUserResponse(userProfile, formData, file)
            .then(checkStatus)
            .then(response => response.json())
            .then(this.downloadDataset())
            .catch(er => this.handleErrors(er))
    }

    @action queueDownload(id) {
        if(id) {
            this.downloadQueue.set(id)
        } else {
            this.downloadQueue.clear();
        }
    }

    @action setAnchorElement(anchorEl, i) {
        let a = this.anchorElements;
        !a.has(i) ? a.set(i, anchorEl) : a.delete(i);
        this.anchorElements = a;
    }

    @action setCookieConsent() {
        localStorage.setItem('cookie_consent', 'false');
        this.showCookieConsent = !localStorage.getItem('cookie_consent');
    }

    @action setExclusions(exclusion, value) {
        if(typeof value === 'boolean') {
            this.data = this.filterData(exclusion, value);
            this.exclusions.set(Exc[exclusion][0], { key: exclusion, action: Exc[exclusion][0], pv: this.data.length, range: typeof value !== 'boolean' && value });
        } else {
            this.exclusions.set(Exc[exclusion][0], { key: exclusion, action: Exc[exclusion][0], pv: this.data.length, range: typeof value !== 'boolean' && value }); //By default ranges are maxed so they should initially return the same # of patients as the current filter
            this.data = this.filterData(exclusion, value, false);
        }
        if(typeof value === 'boolean') this.setGraphData(); // If not a bool, set graph data in filterData function
        this.onlyShowChipScrollButtonRight(false);
    }

    @action setGraphData() {
        this.graphData = [this.graphData[0], ...this.exclusions.values().sort((a, b) => b.pv - a.pv)];
    }

    @action setSurveyAffiliations(id) {
        if(id === 'clearAll') {
            this.surveyAffiliations.clear();
        } else {
            if (!this.surveyAffiliations.has(id)) {
                this.surveyAffiliations.set(id)
            } else {
                this.surveyAffiliations.delete(id);
                if (id === 'other') {
                    this.setValidationErrors(id)
                }
            }
        }
    }

    @action setInputValue(input, value, remove = false) {
        remove ? this.inputValues.delete(input) : this.inputValues.set(input, value);
    }

    @action setChipContainerScrollButtonLeft(show) {
        this.showScrollButtonLeft = show;
    }

    @action onlyShowChipScrollButtonRight(onlyShowRight) {
        this.onlyShowScrollButtonRight = onlyShowRight;
    }

    @action setChipContainerScrollButtonRight(width ,xScrollWidth, endScroll, onlyShowRight) {
        this.showScrollButtonRight = width > xScrollWidth && true;
        if(endScroll) this.showScrollButtonRight = false;
        if(onlyShowRight) this.onlyShowScrollButtonRight = true;
    }

    @action setValidationErrors(id) {
        if(id === 'clearAll') {
            this.validationErrors.clear();
        } else {
            if (!this.validationErrors.has(id)) {
                this.validationErrors.set(id)
            } else {
                this.validationErrors.delete(id)
            }
        }
    }

    @action toggleDrawer(key) {
        !this.drawers.has(key) ? this.drawers.set(key, true) : this.drawers.delete(key);
    }

    @action toggleExclusion(exc, value) {
        if(!this.exclusions.has(Exc[exc][0])) {
            this.setExclusions(exc, value);
        } else {
            this.deleteExclusions(Exc[exc][0], exc, value);
        }
    }

    @action toggleExpandedPanel(id) {
        if(this.expandedPanels.has(id)) {
            this.expandedPanels.delete(id);
        } else {
            this.expandedPanels.clear();
            this.expandedPanels.set(id);
        }
    }

    @action toggleLoading() {
        this.loading = !this.loading;
    }

    @action toggleModal(id) {
        if(this.modals.has(id)) {
            this.modals.delete(id)
        } else {
            this.modals.set(id)
        }
    }

    @action toggleSharing() {
        this.showSharingIcons = !this.showSharingIcons;
    }

    @action validateTextInputs(inputs) {
        inputs.forEach(t => {
            let text = t.value.trim();
            if(t.id === 'email' &&
                !EmailValidator.validate(text) &&
                !this.validationErrors.has(t.id)
            ) {
                this.setValidationErrors(t.id);
            }
            if((t.id !== 'email' || t.id === 'email' &&
                EmailValidator.validate(t.value.trim())) &&
                ((text.length && (this.validationErrors.has(t.id))) ||
                    (!text.length && !this.validationErrors.has(t.id)))
            ) {
                this.setValidationErrors(t.id);
            }
        });
        if(!this.surveyAffiliations.size > 0 && !this.validationErrors.has('checkboxes')) {
            this.setValidationErrors('checkboxes');
        }
        return !this.validationErrors.size &&
            !inputs.some(i => i.value.trim().length <= 0) &&
            !!this.surveyAffiliations.size > 0
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