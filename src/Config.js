import cookies from 'js-cookie';
import logger, {PREFIX_DEFAULT as LOGGER_PREFIX_DEFAULT} from '~/src/Helpers/Logger';
import CookieNames from '~/src/Helpers/CookieNames';
import URLSearchParams from 'url-search-params';

export const configDefaults = {
    debug: false,
    disableActivation: false,
    previewMode: false,
};

export class Config
{
    /**
     * @public
     */
    constructor() {
        this.config = Object.assign({}, configDefaults);
        this.logger = logger;

        if (cookies.get(CookieNames.DISABLE_ACTIVATION)) {
            this.set('disableActivation', true);
            this.logger.info('Detected "disableActivation" cookie. Disabling activation of experiments.');
        }

        if (cookies.get(CookieNames.DEBUG)) {
            this.set('debug', true);
            this.logger.info('Detected "debug" cookie. Enabling debug logging.');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const previewModeParam = urlParams.get('canvassPreviewMode');
        this.previewModeExperiments = this.parsePreviewModeExperiments(previewModeParam);
        if (this.previewModeExperiments) {
            this.set('previewMode', true);
            this.logger.info('Detected "previewMode" query string. Enabling preview mode.');
            this.logger.setPrefix(LOGGER_PREFIX_DEFAULT + '[preview-mode]');
        }

    }

    getPreviewModeExperiments() {
        return this.previewModeExperiments;
    }

    parsePreviewModeExperiments(previewModeParam) {
        if (!previewModeParam || previewModeParam === 'off') {
            return null;
        }

        if (this.isJson(previewModeParam)) {
            // TODO validate that these experiments are actually experiments?
            return JSON.parse(previewModeParam);
        }

        if (previewModeParam === 'all') {
            return {foo: 1};
        }

        if (previewModeParam === 'none') {
            return {foo: 0};
        }

        return null;
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
