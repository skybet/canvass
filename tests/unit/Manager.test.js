import Manager from '~/src/Manager';
import sinon from 'sinon';
import assert from 'assert';

describe('Manager', () => {

    let testManager, mockHelper, mockRegistry;

    beforeEach(() => {
        mockHelper = {};
        mockRegistry = {
            addExperiment: sinon.spy(),
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
        let mockExperiment, activateExperimentSpy;

        beforeEach(() => {
            mockExperiment = {
                on: sinon.spy(),
            };
            activateExperimentSpy = sinon.spy(testManager, 'activateExperiment');

            testManager.addExperiment(mockExperiment);
        });

        it('should add an experiment to the registry', () => {
            sinon.assert.calledOnce(mockRegistry.addExperiment);
            sinon.assert.calledWith(mockRegistry.addExperiment, mockExperiment);
        });

        it('should listen for experiment emitting enrolled', () => {
            sinon.assert.calledOnce(mockExperiment.on);
            sinon.assert.calledWith(mockExperiment.on, 'ENROLLED', activateExperimentSpy);
        });

        
    });

    describe('ActiveExperiment', () => {
        it('sets the group on the experiment');
    });

});
