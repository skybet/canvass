import EventEmitter from '~/src/Helpers/EventEmitter';

class BaseTrigger extends EventEmitter
{
    checkTrigger() {
        if (this.isTriggered()) {
            this.emit('TRIGGERED');
        }
    }

    isTriggered() {
        throw new Error('This method must be overridden: BaseTrigger.isTriggered');
    }
}

export default BaseTrigger;

