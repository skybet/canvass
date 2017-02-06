import cookie from 'cookie';
import logger from '~/src/Helpers/Logger';

export const defaults = {
    debug: false,
    disableActivation: false,
};

export class Config
{
    /**
     * @public
     */
    constructor() {
        this.config = Object.assign({}, defaults);
        this.logger = logger;

        if (typeof document !== 'undefined') {
            let cookies = cookie.parse(document.cookie);

            if (cookies.canvassDisableActivation) {
                this.set('disableActivation', true);
                this.logger.info('Detected "disableActivation" cookie. Disabling activation of experiments.');
            }

            if (cookies.canvassDebug) {
                this.set('debug', true);
                this.logger.info('Detected "debug" cookie. Enabling debug logging.');
            }
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
