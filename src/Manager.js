import Experiment from './Experiment';

class Manager
{
    /**
     * @public
     * @param {Registry} registry The experiment registry to use
     * @param {Helper} helper The helper to use to communicate with the experiment reporting system
     */
    constructor(registry, helper) {
        this.registry = registry;
        this.helper = helper;
    }

    /**
     * Adds an experiment to the registry and wires it up
     *
     * @public
     * @param {Experiment} experiment The experiment to be added
     */
    addExperiment(experiment) {
        this.registry.addExperiment(experiment);
        experiment.on(Experiment.Status.ENROLLED, () => this.activateExperiment(experiment.getId()));
    }

    /**
     * Activates an experiment. Contacts the experiment reporting system via the helper and gets
     * a group for this user
     *
     * @private
     * @param {string} experimentId The unique ID for the experiment being activated
     */
    activateExperiment(experimentId) {
        let experiment = this.registry.getExperiment(experimentId);
        let group = this.helper.triggerExperiment(experiment);

        experiment.setGroup(group);
    }

}

export default Manager;
