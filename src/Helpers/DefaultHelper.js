import logger from '~/src/Helpers/Logger';

export class DefaultHelper
{
    displayName = 'DefaultHelper';

    constructor() {
        this.logger = logger;
    }

    /**
     * Returns group for the user in the experiment
     *
     * @public
     * @param {string} experimentId The name of the experiment
     * @param {function} callback The method to set the group on
     */
    triggerExperiment(experimentId, callback) {
        if (!experimentId) {
            throw new Error('Missing argument: experimentId');
        }

        if (!callback) {
            throw new Error('Missing argument: callback');
        }

        const group = Math.random(0, 1) >= 0.5 ? 1 : 0;
        callback(group);
    }

    /**
     * Sends an event to Qubit via the appropriate method according to type
     *
     * @public
     * @param {string} type The type of Qubit event to send
     * @param {string} name The name of the event in Qubit
     * @param {object} value The value object of the event
     */
    trackEvent(type, name, value) {
        if (!type) throw new Error('Missing argument: type');
        if (!name) throw new Error('Missing argument: name');

        this.logger.info(`[${type}] ${name}:${value}`);
    }

}

export default new DefaultHelper();
