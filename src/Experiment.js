import EventEmitter from '~/src/Helpers/EventEmitter';
import logger from '~/src/Helpers/Logger';

class Experiment extends EventEmitter
{
    static Status = {
        WAITING: 'WAITING',
        ENROLLED: 'ENROLLED',
        ACTIVE: 'ACTIVE',
    };

    /**
     * @public
     * @param {string} id Experiment ID
     * @param {Trigger[]} triggers Array of experiment triggers
     */
    constructor(id, triggers, variants) {
        super();
        this.logger = logger;

        if (!id) {
            throw new Error('Missing argument: id');
        }

        if (!triggers) {
            throw new Error('Missing argument: triggers');
        }

        if (!triggers.length) {
            throw new Error('Must be initialized with at least one trigger');
        }

        if (!variants) {
            throw new Error('Missing argument: variants');
        }

        this.id = id;
        this.setStatus(Experiment.Status.WAITING);
        this.group = null;
        this.triggers = triggers;
        this.variants = variants;
    }

    /**
     * Sets up triggers for the experiment including event listeners
     *
     * @public
     */
    setupTriggers() {
        this.triggers.forEach((trigger) => {
            trigger.on('TRIGGERED', () => this.enrollIfTriggered());
            trigger.setup();
        });
    }

    /**
     * Checks if all triggers have been fired and enroll into the experiment if necessary.
     *
     * @public
     */
    enrollIfTriggered() {
        if (this.status === Experiment.Status.ACTIVE) {
            return;
        }

        if (this.haveTriggersFired()) {
            this.enroll();
        }
    }

    /**
     * Enroll into the experiment regardless of trigger status (useful for debugging)
     *
     * @public
     */
    enroll() {
        this.setStatus(Experiment.Status.ENROLLED);
    }

    /**
     * Get the experiment id
     *
     * @public
     * @returns {string} id
     */
    getId() {
        return this.id;
    }

    /**
     * Get the variant for this instance of the experiment
     *
     * @public
     * @returns {mixed} variant
     */
    getVariant() {
        if (!(this.group in this.variants)) {
            throw new Error('There is no variant for the group: ' + this.group);
        }
        return this.variants[this.group];
    }

    /**
     * Get the status of the experiment
     *
     * @public
     * @returns {string} The status of the experiment
     */
    getStatus() {
        return this.status;
    }

    /**
     * Sets the status of the experiment
     *
     * @public
     * @param {string} status The status to set the experiment to
     */
    setStatus(status) {
        if (Experiment.Status[status] === undefined) {
            throw new Error('Tried to set invalid status: ' + status);
        }
        this.status = status;
        this.emit(this.status);

        this.logger.debug('"' + this.id + '" experiment status updated to: ' + status);
    }

    /**
     * Gets the group of the experiment
     *
     * @public
     * @returns {string} Group of experiment
     */
    getGroup() {
        return this.group;
    }

    /**
     * Set the group of the experiment
     *
     * @public
     * @param {string} group The group that the experiment instance belongs to
     */
    setGroup(group) {
        this.group = group;
        this.setStatus(Experiment.Status.ACTIVE);
    }

    /**
     * Checks if all the triggers have fired
     *
     * @private
     * @return {bool} If all the triggered have fired
     */
    haveTriggersFired() {
        return this.triggers.every((trigger) => trigger.isTriggered());
    }

}

export default Experiment;
