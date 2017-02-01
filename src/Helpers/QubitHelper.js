/* eslint no-underscore-dangle: 0 */

import Logger from '~/src/Helpers/Logger';

class QubitHelper
{
    /**
     * Informs Qubit an experiment has been triggered and calls a callback with an arguement of the
     * group that the user has been assigned to.
     *
     * @param {string} experimentId The name of the experiment in Qubit
     * @param {function} callback The method that qubit calls once it has triggered the experience
     */
    triggerExperiment(experimentId, callback) {
        if (!this.qubitExists()) {
            return null;
        }

        if (!experimentId) {
            throw new Error('Missing argument: experimentId');
        }

        if (!callback) {
            throw new Error('Missing argument: callback');
        }

        // Call to qubit to trigger experience
        if (this.experimentExists(experimentId)) {
            window.__qubit.experiences[experimentId].trigger(callback);
        } else {
            Logger.warn('"' + experimentId + '" experiment could not be triggered on the qubit window object.');
        }

        return null;
    }

    /**
     * Sends an action to Qubit and calls the callback
     *
     * @param {string} action The name of the action in Qubit
     * @param {function} [callback] A method to call after sending the action
     */
    trackAction(action, callback) {
        if (!this.qubitExists()) {
            return null;
        }

        if (!action) {
            throw new Error('Missing argument: action');
        }

        Logger.info('[Canvass] Tracking action: ' + action);

        if (callback) {
            return callback();
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
    qubitExists() {
        if (!window.__qubit) {
            Logger.warn('[Canvass] Qubit window object not available. Unable to continue.');
            return false;
        }

        return true;
    }

    /**
     * Checks whether the experiment and it's trigger is available on the window. If not,
     * we won't be able to communicate with qubit and successfully enter the experiment.
     *
     * @private
     * @returns {boolean} Whether or not the experiment is initialized in qubit
     */
    experimentExists(experimentId) {
        if (this.qubitExists() &&
            window.__qubit.experiences &&
            window.__qubit.experiences[experimentId] &&
            window.__qubit.experiences[experimentId].trigger) {

            return true;
        }
        return false;
    }

}

export default new QubitHelper();
