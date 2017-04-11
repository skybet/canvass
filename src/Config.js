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
        const previewMode = this.parsePreviewModeFromQueryString();
        this.set('previewMode', previewMode);

        if (previewMode !== 'off') {
            this.logger.info(`Detected "previewMode" query string. Enabling preview in "${previewMode}" mode.`);
            this.logger.setPrefix(LOGGER_PREFIX_DEFAULT + '[preview-mode]');
        }
    }

    parsePreviewModeFromQueryString() {
        const urlParams = new URLSearchParams(window.location.search);
        const previewModeParam = urlParams.get('canvassPreviewMode');

        let defaultMode = 'off';

        if (this.isJson(previewModeParam)) {
            // TODO validate that these experiments are actually experiments here?
            let parsedParam = JSON.parse(previewModeParam);

            if (typeof parsedParam === 'object') {
                this.setPreviewModeExperiments(parsedParam);
                return 'custom';
            }
            return defaultMode;

        } else if (previewModeParam === 'all' || previewModeParam === 'none') {
            return previewModeParam;
        }

        return defaultMode;
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
