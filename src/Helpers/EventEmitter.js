class EventEmitter
{
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    }

    removeListener(event, listener) {
        if (this.events[event]) {
            let index = this.events[event].indexOf(listener);

            if (index > -1) {
                this.events[event].splice(index, 1);
            }

            if (this.events[event].length === 0) {
                delete this.events[event];
            }
        }
    }

    emit(event) {
        let listeners;
        let length;
        let args = [].slice.call(arguments, 1);

        if (this.events[event]) {
            listeners = this.events[event].slice();
            length = listeners.length;

            for (let i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    once(event, listener) {
        let g = () => {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        };
        this.on(event, g);
    }
}

export default EventEmitter;

