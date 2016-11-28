class Experiment
{
    static Status = {
        WAITING: 'WAITING',
        ENROLLED: 'ENROLLED',
        ACTIVE: 'ACTIVE'
    };

    /**
     * @public
     * @param {string} id Experiment ID
     * @param {Trigger[]} triggers Array of experiment triggers
     */
    constructor(id, triggers, variants) {
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
        this.status = Experiment.Status.WAITING;
        this.group = null;
        this.triggers = triggers;
        this.variants = variants;
        this.observers = [];
    }

    /**
     * Enroll into the experiment
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
        this.emit(this.getId());
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
     * Gets the group of the experiment
     *
     * @public
     * @returns {string} Group of experiment
     */
    getGroup() {
        return this.group;
    }

    /**
     * Subscribe to listen to changes
     *
     * @public
     * @param {mixed} observer The listener of the changes
     */
    subscribe(observer) {
        if (this.observers.indexOf(observer) == -1) {
            this.observers.push(observer);
        }
    }

    /**
     * Unsubscribe to stop listening for changes
     *
     * @public
     * @param {mixed} observer The listener to remove
     */
    unsubscribe(observer) {
        let position = this.observers.indexOf(observer);

        if (position > -1) {
            this.observers.splice(position, 1);
        }
    }

    /**
     * Notify all observers of a change
     *
     * @public
     * @param {mixed} payload The payload to pass to the observers
     */
    emit(payload) {
        this.observers.forEach((observer) => {
            observer.notify(payload);
        });
    }

    /**
     * Called when observed objects change. Checks if all triggers have been fired
     * and enroll into the experiment if necessary.
     *
     * @public
     */
    notify() {
        if (this.status === Experiment.Status.ACTIVE) {
            return;
        }

        if (this.haveTriggersFired()) {
            this.enroll();
        }
    }

    /**
     * Checks if all the triggers have fired
     *
     * @private
     * @return {bool} If all the triggered have fired
     */
    haveTriggersFired() {
        return this.triggers.every((trigger) => trigger.hasTriggered());
    }

}

export default Experiment;
