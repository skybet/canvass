import cookie from 'cookie';
import Logger from './Helpers/Logger';

export class Config
{
    static defaults = {
        debug: false,
        disableActivation: false,
    };

    constructor(config) {
        this.config = Object.assign({}, this.defaults, config);

        if (typeof document !== 'undefined') {
            let cookies = cookie.parse(document.cookie);
            if (cookies.canvassDisableActivation) {
                this.set('disableActivation', true);
                Logger.info('Detected "disableActivation" cookie. Disabling activation of experiments.');
            }

            if (cookies.canvassDebug) {
                this.set('debug', true);
                Logger.info('Detected "debug" cookie. Enabling debug logging.');
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
