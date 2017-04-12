import cookies from 'js-cookie';
import logger, {PREFIX_DEFAULT as LOGGER_PREFIX_DEFAULT} from '~/src/Helpers/Logger';
import CookieNames from '~/src/Helpers/CookieNames';
import URLSearchParams from 'url-search-params';

export const configDefaults = {
    debug: false,
    previewMode: 'off',
};

export class Config
{
    /**
     * @public
     */
    constructor() {
        this.config = Object.assign({}, configDefaults);
        this.logger = logger;

        this.configureDebug();
        this.configurePreviewMode();
    }

    configureDebug() {
        if (cookies.get(CookieNames.DEBUG)) {
            this.set('debug', true);
            this.logger.info('Detected "debug" cookie. Enabling debug logging.');
        }
    }

    configurePreviewMode() {
        const {mode, experiments} = this.parsePreviewMode();

        this.set('previewMode', mode);
        this.setPreviewModeExperiments(experiments);

        this.savePreviewMode(mode, experiments);

        // Setup logger for preview mode if enabled
        if (mode !== 'off') {
            this.logger.info(`Enabling preview in "${mode}" mode.`);
            this.logger.setPrefix(LOGGER_PREFIX_DEFAULT + '[preview-mode]');
        }
    }

    savePreviewMode(mode, experiments) {
        if (sessionStorage) { // TODO test in incognito and shitty browsers
            // If turning preview mode off, just remove the key
            if (mode === 'off') {
                sessionStorage.removeItem('canvassPreviewMode');
                sessionStorage.removeItem('canvassPreviewModeExperiments');
            } else {
                sessionStorage.setItem('canvassPreviewMode', mode);
                sessionStorage.setItem('canvassPreviewModeExperiments', JSON.stringify(experiments));
            }
        }
    }

    parsePreviewMode() {
        const previewModeQueryString = this.parsePreviewModeFromQueryString();
        const previewModeSessionStorage = this.parsePreviewModeFromSessionStorage();

        let previewMode;
        if (!previewModeQueryString && previewModeSessionStorage) {
            previewMode = previewModeSessionStorage;

        } else if (previewModeQueryString) {
            previewMode = previewModeQueryString;

        } else {
            previewMode = {mode: 'off', experiments: {}};
        }

        return previewMode;
    }

    parsePreviewModeFromSessionStorage() {
        const mode = sessionStorage ? sessionStorage.getItem('canvassPreviewMode') : null;
        const experiments = sessionStorage ? JSON.parse(sessionStorage.getItem('canvassPreviewModeExperiments')) : {};

        return mode ? {mode, experiments} : null;
    }

    parsePreviewModeFromQueryString() {
        const urlParams = new URLSearchParams(window.location.search);
        const previewModeParam = urlParams.get('canvassPreviewMode');

        if (this.isJson(previewModeParam)) {
            // TODO validate that these experiments are actually experiments here?
            let parsedParam = JSON.parse(previewModeParam);

            if (typeof parsedParam === 'object') {
                return {mode: 'custom', experiments: parsedParam};
            }
            // TODO test how to get here
            return {mode: 'off', experiments: {}};

        } else if (previewModeParam === 'all' || previewModeParam === 'none' || previewModeParam === 'off') {
            return {mode: previewModeParam, experiments: {}};
        }

        return null;
    }

    getPreviewModeExperiments() {
        return this.previewModeExperiments;
    }

    setPreviewModeExperiments(experiments) {
        this.previewModeExperiments = experiments;
    }

    isJson(item) {
        let jsonItem = (typeof item !== 'string') ? JSON.stringify(item) : item; // TODO check this

        try {
            jsonItem = JSON.parse(jsonItem);
        } catch (e) {
            return false;
        }

        if (typeof jsonItem === 'object' && jsonItem !== null) {
            return true;
        }

        return false;
    }

    /**
     * Gets the config option value associated with the supplied key
     *
     * @public
     * @param {string} key The config key
     * @returns {object} Value of config option
     */
    get(key) {
        return this.config[key];
    }

    /**
     * Sets the value of a config option
     *
     * @public
     * @param {string} key The config option key
     * @param {string} value The value of the config option
     */
    set(key, value) {
        this.config[key] = value;
    }

}

export default new Config();
