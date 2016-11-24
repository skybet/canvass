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

    notify() {
    }
}

export default Registry;
