import EventEmitter from '~/src/Helpers/EventEmitter';

class BaseTrigger extends EventEmitter
{
    /**
     * Check the trigger to see if it should be fired, and emit the TRIGGERED event if so.
     *
     * @public
     * @return {boolean} Whether or not the trigger was satisfied
     */
    checkTrigger() {
        if (this.isTriggered()) {
            this.emit('TRIGGERED');
        }
    }

    /**
     * Check the trigger logic to see if it is satisfied
     *
     * @abstract
     * @public
     * @return {boolean} Whether or not the trigger is satisfied
     */
    isTriggered() {
        throw new Error('This method must be overridden: BaseTrigger.isTriggered');
    }

    /**
     * Sets up the trigger
     *
     * @abstract
     * @public
     */
    setup() {
        throw new Error('This method must be overridden: BaseTrigger.setup');
    }
}

export default BaseTrigger;
