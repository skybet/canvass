class QubitHelper {

    /**
     * Sends an action to Qubit and calls the callback
     *
     * @param {string} action The name of the action in Qubit
     * @param {function} [callback] A method to call after sending the action
     */
    trackAction(action, callback) {
        if (!action) {
            throw new Error("Missing argument: action");
        }

        if (callback) {
            callback();
        }
    }

    /**
     * Informs Qubit an experiment has been triggered, and returns the group
     * that the user belongs to.
     *
     * @param {string} experiment The name of the experiment in Qubit
     * @param {function} [callback] A method to call after triggering the experiment
     * @returns {number} Group
     */
    triggerExperiment(experiment, callback) {
        if (!experiment) {
            throw new Error("Missing argument: experiment");
        }

        if (callback) {
            callback(0);
        }

        return 0;
    }
}

export default new QubitHelper();
