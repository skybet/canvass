import cookies from 'js-cookie';
import logger from '~/src/Helpers/Logger';
import CookieNames from '~/src/Helpers/CookieNames';
import PreviewModeHelper, {PreviewModes} from '~/src/Config/PreviewModeHelper';
import {PREFIX_DEFAULT as LOGGER_PREFIX_DEFAULT} from '~/src/Helpers/Logger';

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

    /**
     * Gets the list of experiments and groups to display in preview mode
     *
     * @public
     * @returns {object} Experiment id and preview mode group pairs
     */
    getPreviewModeExperiments() {
        return this.previewModeExperiments;
    }

    /**
     * Sets the value of the preview mode experiments
     *
     * @private
     * @param {object} experiments Experiment id and preview mode group pairs
     */
    setPreviewModeExperiments(experiments) {
        this.previewModeExperiments = experiments;
    }

    /**
     * Configured debug mode from the debug cookie
     *
     * @private
     */
    configureDebug() {
        if (cookies.get(CookieNames.DEBUG)) {
            this.set('debug', true);
            this.logger.info('Detected "debug" cookie. Enabling debug logging.');
        }
    }

    /**
     * Configured preview mode using the Preview Mode Helper
     *
     * @private
     */
    configurePreviewMode() {
        // Load preview mode via helper
        const helper = PreviewModeHelper;
        const {mode, experiments} = helper.parse();
        this.set('previewMode', mode);
        this.setPreviewModeExperiments(experiments);

        // Save to session storage for persistence on refresh
        helper.saveToSessionStorage(mode, experiments);

        // Setup logger for preview mode if enabled
        if (mode !== PreviewModes.OFF) {
            this.logger.info(`Enabling preview in "${mode}" mode.`);
            this.logger.setPrefix(LOGGER_PREFIX_DEFAULT + '[preview-mode]');
        }
    }

}

export default new Config();
