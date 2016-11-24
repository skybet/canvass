import Registry from '../../../src/Registry/Registry';
import sinon from 'sinon';
import assert from 'assert';

describe('Registry', () => {

    let testRegistry;

    beforeEach(() => {
        testRegistry = new Registry();
    });

    describe('Initialization', () => {
        it('should create an empty register', () => {
            assert.deepEqual(testRegistry.register, []);
        });
    });

    it('should add an experiment', () => {
        let mockExperiment = {
            getId: sinon.stub().returns('1'),
            subscribe: sinon.spy(),
        };

        testRegistry.addExperiment(mockExperiment);

        assert('1' in testRegistry.register);
        assert.equal(testRegistry.register['1'], mockExperiment);
    });

    describe('getExperiment', () => {
        it('should get an experiment', () => {
            let mockExperiment = {
                getId: sinon.stub().returns('1'),
                subscribe: sinon.spy(),
            };
            testRegistry.register['1'] = mockExperiment;

            let experiment = testRegistry.getExperiment('1');

            assert.equal(experiment, mockExperiment);
        });

        it('should throw an error if experiment is not registered', () => {
            let mockExperiment = {
                getId: sinon.stub().returns('1'),
                subscribe: sinon.spy(),
            };
            testRegistry.register['1'] = mockExperiment;

            let missingExperiment = 'FROG';
            assert.throws(() => {testRegistry.getExperiment(missingExperiment);}, missingExperiment);
        });
    });

    it('should have a notify method', () => {
        testRegistry.notify();
    });
});
