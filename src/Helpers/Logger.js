export const LEVEL = {
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
};

export class Logger
{
    static PREFIX = '[canvass]';

    /**
     * @public
     * @param {logger} [logger] Logging instance such as console.log
     * @param {Logger.LEVEL} [outputLevel] Level of logging to output
     */
    constructor(logger, outputLevel) {
        this.logger = logger || console;
        this.outputLevel = outputLevel || LEVEL.WARN;
    }

    /**
     * Sets the logging object to use
     *
     * @public
     * @param {logger} logger Logging instance such as console.log
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Outputs an error
     *
     * @public
     * @param {...*} args Objects to output
     */
    error() {
        this.logger.error(...this.formatMessages(Array.prototype.slice.call(arguments)));
    }

    /**
     * Outputs a warning
     *
     * @public
     * @param {...*} args Objects to output
     */
    warn() {
        this.logger.warn(...this.formatMessages(Array.prototype.slice.call(arguments)));
    }

    /**
     * Outputs an info message
     *
     * @public
     * @param {...*} args Objects to output
     */
    info() {
        this.logger.info(...this.formatMessages(Array.prototype.slice.call(arguments)));
    }

    /**
     * Outputs a debug message
     *
     * @public
     * @param {...*} args Objects to output
     */
    debug() {
        if (this.outputLevel === LEVEL.DEBUG) {
            let useMethod = this.logger.debug || this.logger.log;
            useMethod(...this.formatMessages(Array.prototype.slice.call(arguments)));
        }
    }

    /**
     * Outputs a table
     *
     * @public
     * @param {object} data Data object or array to output
     */
    table(data) {
        let useMethod = this.logger.table || this.logger.log;
        useMethod(data);
    }

    /**
     * Formats arguments to the logging functions to include the prefix
     *
     * @public
     * @param {...*} args Objects to output
     */
    formatMessages(messages) {
        if (messages.length < 1) {
            return messages;
        }

        messages.unshift(Logger.PREFIX);
        return messages;
    }

    /**
     * Sets the output level
     *
     * @public
     * @param {Logger.LEVEL} [outputLevel] Level of logging to output
     */
    setOutputLevel(outputLevel) {
        this.outputLevel = outputLevel;
    }

}

export default new Logger();
