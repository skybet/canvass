class Registry
{
    constructor(helper) {
        if (!helper) {
            throw new Error('Missing argument: helper');
        }
        this.register = [];
        this.helper = helper;
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

    triggerExperiment(experimentId) {
        let group = this.helper.triggerExperiment(experimentId);
        this.register[experimentId].setGroup(group);
    }
}

export default Registry;
