import Experiment from './Toolkit/Experiment';

class Manager
{
    constructor(registry, helper) {
        this.registry = registry;
        this.helper = helper;
    }

    addExperiment(experiment) {
        this.registry.addExperiment(experiment);
        experiment.on(Experiment.Status.ENROLLED, this.activateExperiment);
    }

    activateExperiment() {
        
    }

}

export default Manager;
