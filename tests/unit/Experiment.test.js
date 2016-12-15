/* eslint no-new: 0 */

import Experiment from '~/src/Experiment';
import sinon from 'sinon';
import assert from 'assert';
import EventEmitter from 'events';

describe('Experiment', () => {
    let testExperiment, mockTrigger;

    beforeEach(() => {
        mockTrigger = {on: sinon.spy()};
        testExperiment = new Experiment('1', [mockTrigger], []);
    });

    describe('Attempt Enrollment', () => {
        it('should an attempt enrollment method', () => {
            assert.equal(typeof testExperiment.enrollIfTriggered, 'function');
        });

        it('should check triggers have fired when not ACTIVE', () => {
            let enrollSpy = sinon.spy(testExperiment, 'enroll');
            testExperiment.triggers = [
                {isTriggered: sinon.stub().returns(true)},
            ];

            testExperiment.enrollIfTriggered();
            sinon.assert.calledOnce(enrollSpy);
        });
    });

    describe('Initialization', () => {
        it('throws an error if id is not an argument of constructor', () => {
            assert.throws(() => { new Experiment(); }, /id/);
        });

        it('has an id', () => {
            assert.equal('1', testExperiment.getId());
        });

        it('throws an error if triggers is not an argument of constructor', () => {
            assert.throws(() => { new Experiment('1'); }, /triggers/);
        });

        it('throws an error if there is not at least one trigger', () => {
            assert.throws(() => { new Experiment('1', []); }, /trigger/);
        });

        it('populates the triggers', () => {
            let experiment = new Experiment('1', [mockTrigger], []);

            assert.deepEqual([mockTrigger], experiment.triggers);
        });

        it('throws an error if variants is not an argument of constructor', () => {
            assert.throws(() => { new Experiment('1', [mockTrigger]); }, /variants/);
        });

        it('populates the variants', () => {
            let experiment = new Experiment('1', [mockTrigger], ['variants']);

            assert.deepEqual(['variants'], experiment.variants);
        });

        it('has a status by default of WAITING', () => {
            assert.equal('WAITING', testExperiment.getStatus());
        });

        it('has a group by default of null', () => {
            assert.equal(testExperiment.getGroup(), null);
        });

    });

    describe('Enroll', () => {
        it('changes the status to ENROLLED once called', () => {
            testExperiment.enroll();

            assert.equal(Experiment.Status.ENROLLED, testExperiment.status);
        });

        it('should emit once enrolled', () => {
            let emitSpy = sinon.spy(testExperiment, 'emit');
            testExperiment.enroll();

            sinon.assert.calledOnce(emitSpy);
            sinon.assert.calledWith(emitSpy, Experiment.Status.ENROLLED);
        });
    });

    describe('GetVariant', () => {
        it('should return the correct variant for the group', () => {
            testExperiment.variants = {
                0: 'MOCK_CONTROL',
                1: 'MOCK_VARIANT_1',
                frog: 'MOCK_VARIANT_FROG',
            };

            testExperiment.group = '0';
            assert.equal(testExperiment.getVariant(), testExperiment.variants['0']);

            testExperiment.group = '1';
            assert.equal(testExperiment.getVariant(), testExperiment.variants['1']);

            testExperiment.group = 'frog';
            assert.equal(testExperiment.getVariant(), testExperiment.variants.frog);
        });

        it('should throw an error if there is no variant for the group', () => {
            testExperiment.variants = {
                0: 'MOCK_CONTROL',
                1: 'MOCK_VARIANT_1',
                frog: 'MOCK_VARIANT_FROG',
            };
            testExperiment.group = 'NO_VARIANT';

            assert.throws(() => { testExperiment.getVariant(); }, testExperiment.group);
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
            testExperiment.setStatus(Experiment.Status.ENROLLED);

            assert.equal(Experiment.Status.ENROLLED, testExperiment.status);
        });

        it('should throw an error if it is not a valid status', () => {
            let status = 'frog';
            assert.throws(() => { testExperiment.setStatus(status); }, status);
        });

        it('should emit when called', () => {
            let emitSpy = sinon.spy(testExperiment, 'emit');
            testExperiment.setStatus(Experiment.Status.WAITING);

            sinon.assert.calledOnce(emitSpy);
            sinon.assert.calledWith(emitSpy, Experiment.Status.WAITING);
        });
    });

    describe('Listen to triggers', () => {
        let mockTriggers;

        beforeEach(() => {
            mockTrigger = new EventEmitter();
            mockTrigger.on = sinon.spy(mockTrigger, 'on');
            mockTrigger.setup = sinon.spy();
            mockTrigger.isTriggered = sinon.stub().returns(true);
            mockTriggers = [mockTrigger];

            testExperiment = new Experiment('FROG', mockTriggers, []);
            testExperiment.setupTriggers();
        });

        it('should listen for triggers firing', () => {
            sinon.assert.calledOnce(mockTriggers[0].on);
            sinon.assert.calledWith(mockTriggers[0].on, 'TRIGGERED');
        });

        it('should attempt enrollment if a trigger fires', () => {
            let spyEnrollIfTriggered = sinon.spy(testExperiment, 'enrollIfTriggered');
            mockTriggers[0].emit('TRIGGERED');

            sinon.assert.calledOnce(spyEnrollIfTriggered);
        });
    });

    describe('Check Fired', () => {
        it('should return false when ANY of the triggers have not fired', () => {
            testExperiment.triggers = [
                {isTriggered: sinon.stub().returns(true)},
                {isTriggered: sinon.stub().returns(false)},
            ];

            assert.equal(testExperiment.haveTriggersFired(), false);
        });

        it('should return false when ANY of the triggers have not fires', () => {
            testExperiment.triggers = [
                {isTriggered: sinon.stub().returns(true)},
                {isTriggered: sinon.stub().returns(true)},
            ];

            assert.equal(testExperiment.haveTriggersFired(), true);
        });
    });
});
