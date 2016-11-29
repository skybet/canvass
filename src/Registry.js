class Registry
{
    /**
     * @public
     */
    constructor() {
        this.register = [];
    }

    /**
     * Adds an experiment to the registry
     *
     * @public
     * @param {Experiment} experiment The experiment to add to the registry
     */
    addExperiment(experiment) {
        // experiment.on(Experiment.Status.TRIGGERED, () => this.notify(experiment.getId()));
        this.register[experiment.getId()] = experiment;
    }

    /**
     * Get an experiment from the registry
     *
     * @public
     * @param {string} id ID of the experiment to retrieve
     * @return {Experiment} The requested experiment
     * @throws When an experiment can not be found in the registry with the id supplied
     */
    getExperiment(id) {
        if (!(id in this.register)) {
            throw new Error('Experiment not in register: ' + id);
        }
        return this.register[id];
    }
}

export default Registry;
