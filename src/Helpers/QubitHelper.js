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
        if (!experimentId) {
            throw new Error('Missing argument: experimentId');
        }

        if (!callback) {
            throw new Error('Missing argument: callback');
        }

        // Call to qubit to trigger experience
         window.__qubit.experiences[experimentId].trigger(callback);
    }

    /**
     * Sends an action to Qubit and calls the callback
     *
     * @param {string} action The name of the action in Qubit
     * @param {function} [callback] A method to call after sending the action
     */
    trackAction(action, callback) {
        if (!action) {
            throw new Error('Missing argument: action');
        }

        console.log('[Canvass] Tracking action: ' + action);

        if (callback) {
            return callback();
        }

        return null;
    }
}

export default new QubitHelper();
