class Logger
{
    static PREFIX = '[canvass]';

    constructor(logger) {
        this.logger = logger || console;
    }

    error(message, e) {
        this.logger.error(this.prefixMessage(message), e);
    }

    warn(message) {
        this.logger.warn(message);
    }

    info(message) {
        this.logger.info(message);
    }

    debug(message) {
        if (!this.logger.debug) {
            this.logger.log(message);
            return;
        }
        this.logger.debug(message);
    }

    prefixMessage(message) {
        return `${Logger.PREFIX} ${message}`;
    }

}

export default new Logger();
