import Experiment from './Experiment';
import EventEmitter from './Helpers/EventEmitter';

class Manager extends EventEmitter
{
    /**
     * @public
     */
    constructor() {
        super();
        this.register = {};
    }

    /**
     * Sets the helper to use to communicate with the external experiment reporting tool
     *
     * @public
     * @param {Helper} helper The helper to use to communicate with the experiment reporting system
     * @return {Manager}
     */
    setHelper(helper) {
        this.helper = helper;
        return this;
    }

    /**
     * Adds an experiment to the registry and wires it up
     *
     * @public
     * @param {Experiment} experiment The experiment to be added
     */
    addExperiment(experiment) {
        this.register[experiment.getId()] = experiment;
        experiment.on(Experiment.Status.ENROLLED, () => this.activateExperiment(experiment.getId()));
        experiment.on(Experiment.Status.ACTIVE, () => this.emit(experiment.getId() + '.ACTIVE'));
        experiment.start();
    }

    /**
     * Activates an experiment. Contacts the experiment reporting system via the helper and gets
     * a group for this user
     *
     * @private
     * @param {string} experimentId The unique ID for the experiment being activated
     */
    activateExperiment(experimentId) {
        let experiment = this.getExperiment(experimentId);
        let group = this.helper.triggerExperiment(experiment);

        experiment.setGroup(group);
    }

    /**
     * Get an experiment from the register
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

    /**
     * Removes an experiment from the register
     *
     * @public
     * @param {string} id ID of the experiment to remove
     */
    removeExperiment(id) {
        let experiment = this.getExperiment(id);
        experiment.removeListener(Experiment.Status.ENROLLED, () => this.activateExperiment(experiment.getId()));
        delete this.register[experiment.getId()];
    }

    /**
     * Track an action for an experiment
     *
     * @public
     * @param {string} experimentId ID of the experiment to track an action for
     * @param {string} actionName Name of the action to track
     */
    trackAction(experimentId, actionName) {
        this.helper.trackAction(experimentId + ':' + actionName);
    }

}

export default new Manager();
