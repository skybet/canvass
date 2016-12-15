import EventEmitter from '~/src/Helpers/EventEmitter';

class BaseTrigger extends EventEmitter
{
    check() {
        if (this.isTriggered()) {
            this.emit('TRIGGERED');
            return true;
        }

        return false;
    }

    setup() {
        throw new Error('This method must be overridden: BaseTrigger.setup');
    }

    isTriggered() {
        throw new Error('This method must be overridden: BaseTrigger.isTriggered');
    }
}

export default BaseTrigger;
