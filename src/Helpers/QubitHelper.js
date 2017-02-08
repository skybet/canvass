/* eslint no-underscore-dangle: 0 */
import logger from '~/src/Helpers/Logger';

class QubitHelper
{
    static displayName = 'Qubit';

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
     * Sends an action to Qubit and calls the callback
     *
     * @public
     * @param {string} action The name of the action in Qubit
     * @param {function} [callback] A method to call after sending the action
     * @returns {function} Callback function
     */
    trackAction(action, callback) {
        if (!action) {
            throw new Error('Missing argument: action');
        }

        if (!this.getQubit()) {
            return null;
        }

        this.logger.info('Tracking action: ' + action);

        if (callback) {
            return callback();
        }

        return null;
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
     * Checks whether the qubit object is available on the window to use. If not, we
     * won't be able to communicate with qubit via the helper.
     *
     * @private
     * @returns {boolean} Whether or not qubit is available
     */
    getQubit() {
        return window.__qubit;
    }

}

export default new QubitHelper();
