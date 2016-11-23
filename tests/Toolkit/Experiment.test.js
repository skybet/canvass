import Experiment from '../../src/Toolkit/Experiment';
import sinon from 'sinon';
import assert from 'assert';

describe('Experiment', () => {
    let testExperiment, testObserver;

    beforeEach(() => {
        testExperiment = new Experiment('1');
    });

    describe('Observable', () => {

        beforeEach(() => {
            testObserver = {
                notify: sinon.spy(),
            };
        });

        it('should be observable', () => {
            testExperiment.subscribe(testObserver);

            assert.deepEqual(testExperiment.observers, [testObserver]);
        });

        it('should not add a subscriber that is already in the subscriber list', () => {
            testExperiment.observers.push(testObserver);
            testExperiment.subscribe(testObserver);

            assert.deepEqual(testExperiment.observers, [testObserver]);
        });

        it('should remove subscribers when asked to unsubscribe', () => {
            testExperiment.observers.push(testObserver);
            testExperiment.unsubscribe(testObserver);

            assert.deepEqual(testExperiment.observers, []);
        });

        it('should not attempt to remove subscribers if they are not registered', () => {
            testExperiment.observers.push(testObserver);
            testExperiment.unsubscribe('asdf');

            assert.deepEqual(testExperiment.observers, [testObserver]);
        });

        it('should notify subscribers when property changes', () => {
            testExperiment.observers.push(testObserver);

            let testPayload = 'TEST PAYLOAD';
            testExperiment.emit(testPayload);

            sinon.assert.calledOnce(testObserver.notify);
            sinon.assert.calledWithExactly(testObserver.notify, testPayload);
        });

        it('should not notify unsubscribed subscribers', () => {
            testExperiment.observers.push(testObserver);
            testExperiment.unsubscribe(testObserver);

            let testPayload = 'TEST PAYLOAD';
            testExperiment.emit(testPayload);

            sinon.assert.notCalled(testObserver.notify);

        });
    });

    describe('Initialization', () => {
        it('throws an error if id is not an argument of constructor', () => {
            assert.throws(() => {new Experiment();}, /id/);
        });

        it('has an id', () => {
            assert.equal('1', testExperiment.getId());
        });

        it('has a status by default of INITIALIZING', () => {
            assert.equal('INITIALIZING', testExperiment.getStatus());
        });

        it('has a group by default of 0', () => {
            assert.equal(testExperiment.getGroup(), 0);
        });
    });
});
