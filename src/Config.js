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
        this.setPreviewModeExperiments({});

        // Load preview mode
        const previewModeQueryString = this.parsePreviewModeFromQueryString();
        const previewModeSessionStorage = sessionStorage ? sessionStorage.getItem('previewMode') : null;
        let previewMode;
        if (!previewModeQueryString && previewModeSessionStorage) {
            previewMode = previewModeSessionStorage;
        } else if (previewModeQueryString) {
            previewMode = previewModeQueryString;
        } else {
            previewMode = 'off';
        }

        // Save preview mode state
        this.set('previewMode', previewMode);
        if (sessionStorage) { // TODO test in incognito and shitty browsers
            // If turning preview mode off, just remove the key
            if (previewMode === 'off' && previewModeSessionStorage) {
                sessionStorage.removeItem('previewMode');
            } else {
                sessionStorage.setItem('previewMode', previewMode);
            }
        }

        // Setup logger for preview mode if enabled
        if (previewMode !== 'off') {
            this.logger.info(`Detected "previewMode" query string. Enabling preview in "${previewMode}" mode.`);
            this.logger.setPrefix(LOGGER_PREFIX_DEFAULT + '[preview-mode]');
        }
    }

    parsePreviewModeFromQueryString() {
        const urlParams = new URLSearchParams(window.location.search);
        const previewModeParam = urlParams.get('canvassPreviewMode');

        if (this.isJson(previewModeParam)) {
            // TODO validate that these experiments are actually experiments here?
            let parsedParam = JSON.parse(previewModeParam);

            if (typeof parsedParam === 'object') {
                this.setPreviewModeExperiments(parsedParam);
                return 'custom';
            }
            // TODO test how to get here
            return 'off';

        } else if (previewModeParam === 'all' || previewModeParam === 'none' || previewModeParam === 'off') {
            return previewModeParam;
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
        let jsonItem = (typeof item !== 'string') ? JSON.stringify(item) : item;

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
