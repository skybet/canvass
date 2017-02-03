import cookie from 'cookie';
import logger from '~/src/Helpers/Logger';

export const defaults = {
    debug: false,
    disableActivation: false,
};

export class Config
{
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

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
    }

}

export default new Config();
