import EventEmitter from '~/src/Helpers/EventEmitter';
import sinon from 'sinon';
import assert from 'assert';

describe('EventEmitter Polyfill', () => {

    it('should accept subscribers', () => {
        let eventEmitter = new EventEmitter();
        let mockCallback = sinon.spy();

        eventEmitter.on('TEST', mockCallback);
        assert.deepEqual(eventEmitter.events, {TEST: [mockCallback]});
    });

    it('should remove subscribers', () => {
        let eventEmitter = new EventEmitter();
        let mockCallback = sinon.spy();
        let otherMockCallback = sinon.spy();

        eventEmitter.events = {TEST: [mockCallback, otherMockCallback]};

        eventEmitter.removeListener('TEST', otherMockCallback);
        assert.deepEqual(eventEmitter.events, {TEST: [mockCallback]});
    });

    it('should remove the event from the events object if there are no subscribers', () => {
        let eventEmitter = new EventEmitter();
        let mockCallback = sinon.spy();

        eventEmitter.events = {TEST: [mockCallback]};

        eventEmitter.removeListener('TEST', mockCallback);
        assert.deepEqual(eventEmitter.events, {});

    });

    it('should call subscribed callback on emit', () => {
        let eventEmitter = new EventEmitter();
        let mockCallback = sinon.spy();

        eventEmitter.events = {TEST: [mockCallback]};

        eventEmitter.emit('TEST');
        sinon.assert.calledOnce(mockCallback);

        eventEmitter.emit('TEST');
        sinon.assert.calledTwice(mockCallback);
    });

    it('should only fire once when requested', () => {
        let eventEmitter = new EventEmitter();
        let mockCallback = sinon.spy();

        eventEmitter.once('TEST', mockCallback);
        eventEmitter.emit('TEST');
        eventEmitter.emit('TEST');

        sinon.assert.calledOnce(mockCallback);
    });

});

