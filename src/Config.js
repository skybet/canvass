import cookie from 'cookie';

export class Config
{
    static defaults = {
        debug: false,
        disableActivation: false,
    };

    constructor(config) {
        this.logger = require('~/src/Helpers/Logger').default;

        this.config = Object.assign({}, this.defaults, config);

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
