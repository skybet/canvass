class QubitHelper {
    trackAction(action, callback) {
        if (!action) {
            throw new Error("Missing argument: action");
        }

        if (callback) {
            callback();
        }
    }

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
