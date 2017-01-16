import BaseTrigger from '~/src/Toolkit/BaseTrigger';
import sinon from 'sinon';
import assert from 'assert';

describe('Base Trigger', () => {
    let testTrigger;
    beforeEach(() => {
        testTrigger = new BaseTrigger();
    });

    it('should emit TRIGGERED when triggered', () => {
        let mockListener = sinon.spy();
        testTrigger.isTriggered = sinon.stub().returns(true);
        testTrigger.on('TRIGGERED', mockListener);
        testTrigger.checkTrigger();

        sinon.assert.calledOnce(mockListener);
    });

    it('should have a method called isTriggered which throws an error when not overridden', () => {
        assert.throws(testTrigger.isTriggered, /overridden/);
    });
});
