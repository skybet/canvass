/* eslint no-underscore-dangle: 0 */
import logger from '~/src/Helpers/Logger';

class QubitHelper
{
    displayName = 'QubitHelper';

    /**
     * @public
     */
    constructor() {
        this.logger = logger;
    }

    /**
     * Informs Qubit an experiment has been triggered and calls a callback with an arguement of the
     * group that the user has been assigned to.
     *
     * @public
     * @param {string} experimentId The name of the experiment in Qubit
     * @param {function} callback The method that qubit calls once it has triggered the experience
     */
    triggerExperiment(experimentId, callback) {
        if (!experimentId) {
            throw new Error('Missing argument: experimentId');
        }

        if (!callback) {
            throw new Error('Missing argument: callback');
        }

        let qubit = this.getQubit();
        if (!qubit) {
            this.logger.warn('Qubit window object not available. Unable to continue.');
            return;
        }

        // Call to qubit to trigger experience
        let qubitExperimentTrigger = this.getQubitExperimentTrigger(experimentId);
        if (!qubitExperimentTrigger) {
            this.logger.warn(`"${experimentId}" experiment trigger could not be found in Qubit, so could not be triggered.`);
            return;
        }
        qubitExperimentTrigger(callback);
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

        if (type === 'qp') {
            this.trackQPEvent(name, value);
        } else if (type === 'uv') {
            this.trackUVEvent(name);
        } else {
            throw new Error(`Cannot track even with unknown type: ${type}`);
        }

        return;
    }

    /**
     * Tracks a QProtocol event
     *
     * @private
     * @param {string} name The name of the event in Qubit
     * @param {object} value The value object of the event
     */
    trackQPEvent(name, value) {
        let qubit = this.getQubit();

        if (!qubit || !qubit.uv) {
            this.logger.warn('Qubit uv window object could not be found so could not track event: ' + name +
                '. Live experiment results could be impacted.');
            return;
        }

        qubit.uv.emit(name, value);
        this.logger.debug('Tracking QP Event: ' + name, value);
    }

    /**
     * Tracks a universal variable event
     *
     * @private
     * @param {string} name The name of the event in Qubit
     */
    trackUVEvent(name) {
        let uv = this.getUniversalVariable();
        if (!uv) {
            this.logger.warn('Qubit universal_variable window object could not be found so could not track event: ' + name +
                '. Live experiment results could be impacted.');
            return;
        }

        uv.events.push({action: name});
        this.logger.debug('Tracking UV Event: ' + name);
    }

    /**
     * Returns the qubit experiences array containing experiments if it exists.
     *
     * @public
     * @returns {array} The experiences array
     */
    getAllQubitExperiments() {
        let qubit = this.getQubit();
        if (qubit && qubit.experiences) {
            return qubit.experiences;
        }

        return null;
    }

    /**
     * Checks whether the experiment and it's trigger is available on the window. If not,
     * we won't be able to communicate with qubit and successfully enter the experiment.
     *
     * @public
     * @returns {boolean} Whether or not the experiment is initialized in qubit
     */
    getQubitExperimentTrigger(experimentId) {
        let experiments = this.getAllQubitExperiments();

        if (experiments &&
            experiments[experimentId] &&
            experiments[experimentId].trigger) {

            return experiments[experimentId].trigger;
        }

        return null;
    }

    /**
     * Returns the qubit window object which we use to communicate with the smartserve
     * script.
     *
     * @private
     * @returns {object} Qubit window object
     */
    getQubit() {
        return window.__qubit;
    }

    /**
     * Returns the qubit universal variable object which is used to send legacy events.
     *
     * @private
     * @returns {object} Qubit universal variable object
     */
    getUniversalVariable() {
        return window.universal_variable;
    }

}

export default new QubitHelper();
