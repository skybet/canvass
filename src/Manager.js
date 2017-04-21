import Experiment from './Experiment';
import EventEmitter from './Helpers/EventEmitter';
import config from '~/src/Config/Config';
import {PreviewModes} from './Config/PreviewModeHelper';
import logger, {LEVEL as LoggerOutputLevels} from '~/src/Helpers/Logger';
import cookies from 'js-cookie';
import CookieNames from '~/src/Helpers/CookieNames';

export class Manager extends EventEmitter
{
    /**
     * @public
     */
    constructor() {
        super();
        this.register = {};
        this.config = config;

        this.logger = logger;
        if (this.config.get('debug')) {
            this.logger.setOutputLevel(LoggerOutputLevels.DEBUG);
        }

        this.triggeredExperiments = this.getTriggeredExperimentsFromCookie();
    }

    /**
     * Adds an experiment to the registry and wires it up
     *
     * @public
     * @param {Experiment} experiment The experiment to be added
     */
    addExperiment(experiment) {
        let experimentId = experiment.getId();

        this.register[experimentId] = experiment;
        this.logger.debug(`"${experimentId}" experiment added to the Manager`);

        this.setupExperimentListeners(experiment);

        if (this.experimentAlreadyTriggered(experimentId)) {
            this.logger.debug(`"${experimentId}" experiment has been triggered already for this user, enrolling again`);
            experiment.enroll();
        }
    }

    /**
     * Set up listeners to status changes on an experiment object
     *
     * @private
     * @param {Experiment} experiment The experiment to be listened to
     */
    setupExperimentListeners(experiment) {
        let experimentId = experiment.getId();

        experiment.on(Experiment.Status.ENROLLED, () => {
            this.saveTriggeredExperimentToCookie(experimentId);
            this.activateExperiment(experimentId);
        });
        experiment.on(Experiment.Status.ACTIVE, () => this.emit(experimentId + '.ACTIVE'));

        experiment.setupTriggers();
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
        this.logger.debug(`Removing experiment "${id}"`);
        let experiment = this.getExperiment(id);
        experiment.removeListener(Experiment.Status.ENROLLED, () => this.activateExperiment(experiment.getId()));
        delete this.register[experiment.getId()];
    }

    /**
     * Track an event via the helper
     *
     * @public
     * @param {string} type The type of event
     * @param {string} name The name of the event
     * @param {object} value The value object of the event
     */
    trackEvent(type, name, value) {
        this.helper.trackEvent(type, name, value);
    }

    /**
     * Sets the helper to use to communicate with the external experiment reporting tool
     *
     * @public
     * @param {Helper} helper The helper to use to communicate with the experiment reporting system
     * @return {Manager}
     */
    setHelper(helper) {
        this.logger.debug(`Setting helper to "${helper.displayName}"`);
        this.helper = helper;
        return this;
    }

    /**
     * Prints the state of experiments to the console in a human readable way
     *
     * @public
     */
    printState() {
        let status = [];
        let experiments = Object.keys(this.register);
        experiments.forEach((entry) => {
            let experiment = this.getExperiment(entry);
            let triggers = experiment.triggers.map((t, i) => { return t.displayName || i; }).toString();
            let variants = Object.keys(experiment.variants).toString();

            status.push({
                Experiment: experiment.id,
                Status: experiment.status,
                Triggers: triggers,
                Variants: variants,
                Group: experiment.group,
            });
        });
        this.logger.table(status);
        this.logger.info(`Preview Mode: "${this.config.get('previewMode')}"`);
        if (this.helper.print) this.helper.print();
    }

    /**
     * Activates an experiment. Contacts the experiment reporting system via the helper and gets
     * a group for this user.
     *
     * If preview mode is on, deal with modes appropriately. If "all", set experiment group to
     * 1 (default challenger). If "none", set to 0 (default control). If "custom", then set to
     * the preview group defined in config.
     *
     * @private
     * @param {string} experimentId The unique ID for the experiment being activated
     */
    activateExperiment(experimentId) {
        this.logger.debug(`"${experimentId}" experiment is being triggered`);
        const experiment = this.getExperiment(experimentId);

        const previewMode = this.config.get('previewMode');

        if (previewMode === PreviewModes.OFF) {
            // Get group from helper
            this.helper.triggerExperiment(experimentId, (group) => {
                experiment.setGroup(group);
                this.logger.debug(`"${experimentId}" experiment group set to: ${group}`);
            });
            return;
        }

        let group;
        if (previewMode === PreviewModes.CUSTOM) {
            const previewModeExperiments = this.config.getPreviewModeExperiments();
            group = (experimentId in previewModeExperiments) ? this.config.getPreviewModeExperiments()[experimentId] : 0;
        }
        if (previewMode === PreviewModes.ALL) {
            group = 1;
        }
        if (previewMode === PreviewModes.NONE) {
            group = 0;
        }

        // In preview mode, we want to catch errors due to missing variants as this could be a user error.
        try {
            experiment.setGroup(group);
        } catch (e) {
            this.logger.error(e.message);
        }

        this.logger.debug(`"${experimentId}" experiment group set to: ${group}`);

    }

    /**
     * Loads triggered experiments from the cookie
     *
     * @private
     * @return {Array} Array of triggered experiments
     */
    getTriggeredExperimentsFromCookie() {
        let triggeredExperimentsCookie = cookies.get(CookieNames.TRIGGERED_EXPERIMENTS);
        if (!triggeredExperimentsCookie) {
            return [];
        }

        return JSON.parse(triggeredExperimentsCookie);
    }

    /**
     * Save an experiment to the triggered experiments cookie so we can keep trackAction
     * of which experiments have already been enrolled for a specific user.
     *
     * @private
     * @param {string} experimentId The unique ID for the experiment being activated
     */
    saveTriggeredExperimentToCookie(experimentId) {
        if (this.experimentAlreadyTriggered(experimentId)) {
            return;
        }

        this.triggeredExperiments.push(experimentId);
        cookies.set(CookieNames.TRIGGERED_EXPERIMENTS, JSON.stringify(this.triggeredExperiments));
    }

    /**
     * Check if an experiment has previously been triggered
     *
     * @private
     * @param {string} experimentId The unique ID for the experiment being activated
     * @returns {boolean}
     */
    experimentAlreadyTriggered(experimentId) {
        return Boolean(this.triggeredExperiments.indexOf(experimentId) !== -1);
    }

}

export default new Manager();
