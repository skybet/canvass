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

    error() {
        this.logger.error(...this.formatMessages(Array.prototype.slice.call(arguments)));
    }

    warn() {
        this.logger.warn(...this.formatMessages(Array.prototype.slice.call(arguments)));
    }

    info() {
        this.logger.info(...this.formatMessages(Array.prototype.slice.call(arguments)));
    }

    debug() {
        if (this.outputLevel === LEVEL.DEBUG) {
            let useMethod = this.logger.debug || this.logger.log;
            useMethod(...this.formatMessages(Array.prototype.slice.call(arguments)));
        }
    }

    table(data) {
        let useMethod = this.logger.table || this.logger.log;
        useMethod(data);
    }

    formatMessages(messages) {
        if (messages.length < 1) {
            return messages;
        }

        messages.unshift(Logger.PREFIX);
        return messages;
    }

    setOutputLevel(outputLevel) {
        this.outputLevel = outputLevel;
    }

}

export default new Logger();
