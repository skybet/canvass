export const LEVEL = {
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
};

export const PREFIX_DEFAULT = '[canvass]';

export class Logger
{
    /**
     * @public
     * @param {logger} [logger] Logging instance such as console.log
     * @param {Logger.LEVEL} [outputLevel] Level of logging to output
     */
    constructor(logger, outputLevel) {
        this.prefix = PREFIX_DEFAULT;
        this.logger = logger || console;
        this.outputLevel = outputLevel || LEVEL.WARN;

        this.alreadyLogged = new Set();
    }

    setPrefix(prefix) {
        this.prefix = prefix;
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
     * Sets the output level
     *
     * @public
     * @param {Logger.LEVEL} [outputLevel] Level of logging to output
     */
    setOutputLevel(outputLevel) {
        this.outputLevel = outputLevel;
    }

    /**
     * Outputs an error
     *
     * @public
     * @param {...*} args Objects to output
     */
    error() {
        let messages = this.formatMessages(Array.prototype.slice.call(arguments));
        this.logger.error(...messages);
    }

    /**
     * Outputs a warning
     *
     * @public
     * @param {...*} args Objects to output
     */
    warn() {
        let messages = this.formatMessages(Array.prototype.slice.call(arguments));
        this.logUniqueMessages(messages, this.logger.warn);
    }

    /**
     * Outputs an info message
     *
     * @public
     * @param {...*} args Objects to output
     */
    info() {
        let messages = this.formatMessages(Array.prototype.slice.call(arguments));
        this.logger.info(...messages);
    }

    /**
     * Outputs a debug message
     *
     * @public
     * @param {...*} args Objects to output
     */
    debug() {
        if (this.outputLevel === LEVEL.DEBUG) {
            let logFunction = (this.logger.debug || this.logger.log).bind(this.logger);
            let messages = this.formatMessages(Array.prototype.slice.call(arguments));
            logFunction(...messages);
        }
    }

    /**
     * Outputs a table
     *
     * @public
     * @param {object} data Data object or array to output
     */
    table(data) {
        let logFunction = (this.logger.table || this.logger.log).bind(this.logger);
        logFunction(data);
    }

    /**
     * Formats arguments to the logging functions to include the prefix
     *
     * @private
     * @param {...*} args Objects to output
     * @returns {array} The formatted array of log messages
     */
    formatMessages(messages) {
        if (messages.length < 1) {
            return messages;
        }

        messages.unshift(this.prefix);
        return messages;
    }

    /**
     * Logs the messages via the appropriate log function and if it's not been logged already
     * this session.
     *
     * @private
     * @param {array} [messages] Messages to log out
     * @param {function} [logFunction] Function to log the messages with
     */
    logUniqueMessages(messages, logFunction) {
        let messagesString = JSON.stringify(messages);

        if (!this.alreadyLogged.has(messagesString)) {
            logFunction.bind(this.logger)(...messages);
        }

        this.alreadyLogged.add(messagesString);
    }

}

export default new Logger();
