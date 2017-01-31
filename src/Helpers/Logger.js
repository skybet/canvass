export class Logger
{
    static PREFIX = '[canvass]';

    constructor(logger) {
        this.logger = logger || console;
    }

    error(message, e) {
        this.logger.error(this.prefixMessage(message), e);
    }

    warn(message) {
        this.logger.warn(this.prefixMessage(message));
    }

    info(message) {
        this.logger.info(this.prefixMessage(message));
    }

    debug(message) {
        let useMethod = this.logger.debug || this.logger.log;
        useMethod(this.prefixMessage(message));
    }

    prefixMessage(message) {
        return `${Logger.PREFIX} ${message}`;
    }

}

export default new Logger();
