class Experiment
{
    constructor() {
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
}

export default Experiment;
