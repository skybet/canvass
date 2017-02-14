import cookies from 'js-cookie';
import logger from '~/src/Helpers/Logger';

export const configDefaults = {
    debug: false,
    disableActivation: false,
};

export class Config
{
    /**
     * @public
     */
    constructor() {
        this.config = Object.assign({}, configDefaults);
        this.logger = logger;

        if (cookies.get('canvassDisableActivation')) {
            this.set('disableActivation', true);
            this.logger.info('Detected "disableActivation" cookie. Disabling activation of experiments.');
        }

        if (cookies.get('canvassDebug')) {
            this.set('debug', true);
            this.logger.info('Detected "debug" cookie. Enabling debug logging.');
        }
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
