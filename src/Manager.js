import Experiment from './Experiment';
import EventEmitter from './Helpers/EventEmitter';
import cookie from 'cookie';

class Manager extends EventEmitter
{
    /**
     * @public
     */
    constructor() {
        super();
        this.logger = require('./Helpers/Logger').default;
        this.register = {};

        // Check if we have a cookie to disable activation
        this.disableActivation = false;
        if (typeof document != 'undefined') {
            let cookies = cookie.parse(document.cookie);
            if (cookies.disableExperiments) {
                this.disableActivation = true;
                this.logger.info('Detected cookie. Disabling activation of experiments');
            }
        }
    }

    /**
     * Adds an experiment to the registry and wires it up
     *
     * @public
     * @param {Experiment} experiment The experiment to be added
     */
    addExperiment(experiment) {
        this.register[experiment.getId()] = experiment;
        this.logger.debug('"' + experiment.getId() + '" experiment added to the Manager');

        experiment.on(Experiment.Status.ENROLLED, () => this.activateExperiment(experiment.getId()));
        experiment.on(Experiment.Status.ACTIVE, () => this.emit(experiment.getId() + '.ACTIVE'));
        experiment.setupTriggers();
    }

    /**
     * Activates an experiment. Contacts the experiment reporting system via the helper and gets
     * a group for this user
     *
     * @private
     * @param {string} experimentId The unique ID for the experiment being activated
     */
    activateExperiment(experimentId) {
        if (this.disableActivation) {
            this.logger.info('"' + experimentId + '" should have triggered, but experiments are disabled');
            return;
        }

        this.logger.info('"' + experimentId + '" experiment is being triggered');
        let experiment = this.getExperiment(experimentId);
        this.helper.triggerExperiment(experimentId, (group) => {
            this.logger.info('"' + experimentId + '" experiment group set to: ' + group);
            experiment.setGroup(group);
        });
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
        this.logger.debug('Removing experiment ' + id);
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
        this.logger.debug('Tracking action ' + actionName + ' for experiment ' + experimentId);
        this.helper.trackAction(experimentId + ':' + actionName);
    }

    /**
     * Sets the helper to use to communicate with the external experiment reporting tool
     *
     * @public
     * @param {Helper} helper The helper to use to communicate with the experiment reporting system
     * @return {Manager}
     */
    setHelper(helper) {
        this.logger.debug('Setting helper to "' + helper.constructor.name + '"');
        this.helper = helper;
        return this;
    }

    /**
     * Shows the status of each experiment in the console
     */
    printState() {
        let status = [];
        let experiments = Object.keys(this.register);
        experiments.forEach((entry) => {
            let experiment = this.getExperiment(entry);

            let triggers = experiment.triggers.map((t) => { return t.constructor.name || "trigger"; }).toString();

            status.push({Experiment: experiment.id, Status: experiment.status, Triggers: triggers, Group: experiment.group});
        });
        this.logger.table(status);
    }
}

export default new Manager();
