import cookies from 'js-cookie';
import logger, {PREFIX_DEFAULT as LOGGER_PREFIX_DEFAULT} from '~/src/Helpers/Logger';
import CookieNames from '~/src/Helpers/CookieNames';
import URLSearchParams from 'url-search-params';

export const PreviewModes = {
    CUSTOM: 'custom',
    ALL: 'all',
    NONE: 'none',
    OFF: 'off',
};

export const configDefaults = {
    debug: false,
    previewMode: PreviewModes.OFF,
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
        if (mode !== PreviewModes.OFF) {
            this.logger.info(`Enabling preview in "${mode}" mode.`);
            this.logger.setPrefix(LOGGER_PREFIX_DEFAULT + '[preview-mode]');
        }
    }

    savePreviewMode(mode, experiments) {
        if (sessionStorage) {
            // If turning preview mode off, just remove the key
            if (mode === PreviewModes.OFF) {
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
            previewMode = {mode: PreviewModes.OFF, experiments: {}};
        }

        return previewMode;
    }

    parsePreviewModeFromSessionStorage() {
        const sessionStorage = this.getSessionStorage();
        const mode = sessionStorage ? sessionStorage.getItem('canvassPreviewMode') : null;
        const experiments = sessionStorage ? JSON.parse(sessionStorage.getItem('canvassPreviewModeExperiments')) : {};

        return mode ? {mode, experiments} : null;
    }

    parsePreviewModeFromQueryString() {
        if (!window) {
            return null;
        }

        const urlParams = new URLSearchParams(this.getWindowLocationSearch());
        const previewModeParam = urlParams.get('canvassPreviewMode');

        if (this.isJson(previewModeParam)) {
            let parsedParam = JSON.parse(previewModeParam);

            if (typeof parsedParam === 'object') {
                return {mode: PreviewModes.CUSTOM, experiments: parsedParam};
            }

            return {mode: PreviewModes.OFF, experiments: {}};

        } else if (previewModeParam === PreviewModes.ALL ||
            previewModeParam === PreviewModes.NONE ||
            previewModeParam === PreviewModes.OFF) {

            return {mode: previewModeParam, experiments: {}};
        }

        return null;
    }

    getWindowLocationSearch() {
        return window.location.search;
    }

    getSessionStorage() {
        return sessionStorage;
    }

    getPreviewModeExperiments() {
        return this.previewModeExperiments;
    }

    setPreviewModeExperiments(experiments) {
        this.previewModeExperiments = experiments;
    }

    isJson(data) {
        let jsonData;

        try {
            jsonData = JSON.parse(data);
        } catch (e) {
            return false;
        }

        if (typeof jsonData === 'object' && jsonData !== null) {
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
