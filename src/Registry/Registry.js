class Registry
{
    constructor() {
        this.register = [];
    }

    addExperiment(experiment) {
        experiment.subscribe(this);
        this.register[experiment.getId()] = experiment;
    }

    getExperiment(id) {
        if (!(id in this.register)) {
            throw new Error('Experiment not in register: ' + id);
        }
        return this.register[id];
    }

    notify(experimentId) {
        if (!(experimentId in this.register)) {
            throw new Error('Experiment not in register: ' + experimentId);
        }
        this.triggerExperiment(experimentId);
    }

    triggerExperiment() {

    }
}

export default Registry;
