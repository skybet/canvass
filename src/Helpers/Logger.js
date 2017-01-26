class Logger
{
    static PREFIX = '[canvass]';

    constructor(logger) {
        this.logger = logger || console;
    }

    error(message, e) {
        this.logger.error(this.prefixMessage(message), e);
    }

    warning(message) {
        this.logger.warning(message);
    }

    info(message) {
        this.logger.info(message);
    }

    debug(message) {
        this.logger.debug(message);
    }

    prefixMessage(message) {
        return `${Logger.PREFIX} ${message}`;
    }

}

export default new Logger();
