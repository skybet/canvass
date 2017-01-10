/* eslint no-underscore-dangle: 0 */

class QubitHelper
{
    /**
     * Informs Qubit an experiment has been triggered and calls a callback with an arguement of the
     * group that the user has been assigned to.
     *
     * @param {string} experiment The name of the experiment in Qubit
     * @param {function} callback The method that qubit calls once it has triggered the experience
     */
    triggerExperiment(experimentId, callback) {
        if (!this.checkForQubit()) {
            return null;
        }

        if (!experimentId) {
            throw new Error('Missing argument: experimentId');
        }

        if (!callback) {
            throw new Error('Missing argument: callback');
        }

        // Call to qubit to trigger experience
        window.__qubit.experiences[experimentId].trigger(callback); // eslint-disable-line no-underscore-dangle

        return null;
    }

    /**
     * Sends an action to Qubit and calls the callback
     *
     * @param {string} action The name of the action in Qubit
     * @param {function} [callback] A method to call after sending the action
     */
    trackAction(action, callback) {
        if (!this.checkForQubit()) {
            return null;
        }

        if (!action) {
            throw new Error('Missing argument: action');
        }

        console.info('[Canvass] Tracking action: ' + action);

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
    checkForQubit() {
        if (!window.__qubit) {
            console.warn('[Canvass] Qubit window object not available. Unable to continue.');
            return false;
        }

        return true;
    }

}

export default new QubitHelper();
