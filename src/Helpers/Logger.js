export const LEVEL = {
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
};

export class Logger
{
    static PREFIX = '[canvass]';

    constructor(logger, outputLevel) {
        this.logger = logger || console;
        this.outputLevel = outputLevel || LEVEL.WARN;
    }

    setLogger(logger) {
        this.logger = logger;
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
        if (this.outputLevel === LEVEL.DEBUG) {
            let useMethod = this.logger.debug || this.logger.log;
            useMethod(this.prefixMessage(message));
        }
    }

    table(data) {
        let useMethod = this.logger.table || this.logger.log;
        useMethod(data);
    }

    prefixMessage(message) {
        return `${Logger.PREFIX} ${message}`;
    }

    setOutputLevel(outputLevel) {
        this.outputLevel = outputLevel;
    }

}

export default new Logger();
