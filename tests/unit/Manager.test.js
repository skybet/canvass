import Manager from '~/src/Manager';
import sinon from 'sinon';
import assert from 'assert';
import EventEmitter from 'events';

describe('Manager', () => {

    let testManager, mockHelper, mockRegistry, mockExperiment;

    beforeEach(() => {
        mockHelper = {
            triggerExperiment: sinon.stub().returns(0),
        };
        mockExperiment = {
            setGroup: sinon.spy(),
        };
        mockRegistry = {
            addExperiment: sinon.spy(),
            getExperiment: sinon.stub().returns(mockExperiment),
        };
        testManager = new Manager(mockRegistry, mockHelper);
    });

    describe('Initialisation', () => {
        it('should take a registry and store it', () => {
            assert.deepEqual(testManager.registry, mockRegistry);
        });

        it('should take a helper and store it', () => {
            assert.deepEqual(testManager.helper, mockHelper);
        });
    });

    describe('Experiment', () => {
        beforeEach(() => {
            mockExperiment = new EventEmitter();
            mockExperiment.on = sinon.spy(mockExperiment, 'on');
            mockExperiment.getId = sinon.stub().returns('FROG');

            testManager.addExperiment(mockExperiment);
        });

        it('should add an experiment to the registry', () => {
            sinon.assert.calledOnce(mockRegistry.addExperiment);
            sinon.assert.calledWith(mockRegistry.addExperiment, mockExperiment);
        });

        it('should listen for experiment emitting enrolled', () => {
            sinon.assert.calledOnce(mockExperiment.on);
            sinon.assert.calledWith(mockExperiment.on, 'ENROLLED');
        });

        it('should call activateExperiment when enrolled emitted', () => {
            let mockActivateExperiment = sinon.spy(testManager, 'activateExperiment');

            mockExperiment.emit('ENROLLED');
            sinon.assert.calledOnce(mockActivateExperiment);
            sinon.assert.calledWith(mockActivateExperiment, 'FROG');
        });
    });

    describe('ActiveExperiment', () => {
        it('sets the group on the experiment', () => {
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockRegistry.getExperiment);
            sinon.assert.calledWith(mockRegistry.getExperiment, 'FROG');

            sinon.assert.calledOnce(mockHelper.triggerExperiment);
            sinon.assert.calledWith(mockHelper.triggerExperiment, mockExperiment);

            sinon.assert.calledOnce(mockExperiment.setGroup);
            sinon.assert.calledWith(mockExperiment.setGroup, 0);
        });
    });

});
