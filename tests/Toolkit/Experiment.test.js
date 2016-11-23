import Experiment from '../../src/Toolkit/Experiment';
import sinon from 'sinon';
import assert from 'assert';

describe('Experiment', () => {
    let testExperiment, testObserver;

    beforeEach(() => {
        testExperiment = new Experiment('1', [], []);
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

    describe('Observer', () => {
        it('should have a notify method', () => {
            assert.equal(typeof(testExperiment.notify), 'function');
        });
    });

    describe('Initialization', () => {
        it('throws an error if id is not an argument of constructor', () => {
            assert.throws(() => {new Experiment();}, /id/);
        });

        it('throws an error if variants is not an argument of constructor', () => {
            assert.throws(() => {new Experiment('1', {});}, /variants/);
        });

        it('throws an error if triggers is not an argument of constructor', () => {
            assert.throws(() => {new Experiment('1');}, /triggers/);
        });

        it('has an id', () => {
            assert.equal('1', testExperiment.getId());
        });

        it('has a status by default of WAITING', () => {
            assert.equal('WAITING', testExperiment.getStatus());
        });

        it('has a group by default of null', () => {
            assert.equal(testExperiment.getGroup(), null);
        });
    });

    describe('Trigger', () => {
        it('changes the status to TRIGGERED once called', () => {
            testExperiment.trigger();

            assert.equal(Experiment.Status.TRIGGERED, testExperiment.status);
        });

        it('should emit once triggered', () => {
            let emitSpy = sinon.spy(testExperiment, 'emit');
            testExperiment.trigger();

            sinon.assert.calledOnce(emitSpy);
            sinon.assert.calledWith(emitSpy, testExperiment.id);
        });
    });

    describe('GetVariant', () => {
        it('should return the correct variant for the group', () => {
            testExperiment.variants = {
                '0': 'MOCK_CONTROL',
                '1': 'MOCK_VARIANT_1',
                'frog': 'MOCK_VARIANT_FROG'
            };

            testExperiment.group = '0';
            assert.equal(testExperiment.getVariant(), testExperiment.variants['0']);

            testExperiment.group = '1';
            assert.equal(testExperiment.getVariant(), testExperiment.variants['1']);

            testExperiment.group = 'frog';
            assert.equal(testExperiment.getVariant(), testExperiment.variants['frog']);
        });

        it('should throw an error if there is no variant for the group', () => {
            testExperiment.variants = {
                '0': 'MOCK_CONTROL',
                '1': 'MOCK_VARIANT_1',
                'frog': 'MOCK_VARIANT_FROG'
            };
            testExperiment.group = 'NO_VARIANT';

            assert.throws(() => {testExperiment.getVariant()}, testExperiment.group);
        });
    });

    describe('Group', () => {
        it('should set group correctly', () => {
            testExperiment.setGroup('frog');

            assert.equal('frog', testExperiment.group);
        });

        it('should update the status to active', () => {
            testExperiment.setGroup('frog');

            assert.equal(Experiment.Status.ACTIVE, testExperiment.status);
        });
    });

    describe('Status', () => {
        it('should set a status', () => {
            testExperiment.setStatus(Experiment.Status.TRIGGERED);

            assert.equal(Experiment.Status.TRIGGERED, testExperiment.status);
        });

        it('should throw an error if it is not a valid status', () => {
            let status = 'frog';
            assert.throws(() => {testExperiment.setStatus(status);}, status);
        });

        it('should emit when called', () => {
            let emitSpy = sinon.spy(testExperiment, 'emit');
            testExperiment.setStatus(Experiment.Status.WAITING);

            sinon.assert.calledOnce(emitSpy);
            sinon.assert.calledWith(emitSpy, testExperiment.id);
        });
    });

    describe('Notify', () => {
        it('should not update the status to TRIGGERED if any triggers have not fired', () => {
            testExperiment.triggers = [
                {hasTriggered: sinon.stub().returns(true)},
                {hasTriggered: sinon.stub().returns(false)}
            ];
            testExperiment.notify();

            assert.notEqual(testExperiment.status, Experiment.Status.TRIGGERED);
        });

        it('should update the status to TRIGGERED when all triggers have fired', () => {
            testExperiment.triggers = [
                {hasTriggered: sinon.stub().returns(true)},
                {hasTriggered: sinon.stub().returns(true)}
            ];
            testExperiment.notify();

            assert.equal(testExperiment.status, Experiment.Status.TRIGGERED);
        });
    });
});
