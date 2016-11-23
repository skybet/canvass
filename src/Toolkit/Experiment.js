class Experiment
{
    static Status = {
        INITIALIZING: 'INITIALIZING',
        TRIGGERED: 'TRIGGERED'
    };

    constructor(id, triggers, variants) {
        if (!id) {
            throw new Error('Missing argument: id');
        }

        if (!triggers) {
            throw new Error('Missing argument: triggers');
        }

        if (!variants) {
            throw new Error('Missing argument: variants');
        }

        this.id = id;
        this.status = Experiment.Status.INITIALIZING;
        this.group = 0;

        this.observers = [];
    }

    subscribe(observer) {
        if (this.observers.indexOf(observer) == -1) {
            this.observers.push(observer);
        }
    }

    unsubscribe(observer) {
        let position = this.observers.indexOf(observer);

        if (position > -1) {
            this.observers.splice(position, 1);
        }
    }

    emit(payload) {
        this.observers.forEach((observer) => {
            observer.notify(payload);
        });
    }

    notify() {
    }

    trigger() {
        this.status = Experiment.Status.TRIGGERED;
        this.emit(this.getId());
    }

    getId() {
        return this.id;
    }

    getStatus() {
        return this.status;
    }

    getGroup() {
        return this.group;
    }
}

export default Experiment;
