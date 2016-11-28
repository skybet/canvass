import Registry from '~/src/Registry/Registry';
import Experiment from '~/src/Toolkit/Experiment';
import sinon from 'sinon';
import assert from 'assert';

describe('Registry', () => {

    let testRegistry, mockHelper;

    beforeEach(() => {
        mockHelper = {
            triggerExperiment: sinon.spy()
        };
        testRegistry = new Registry(mockHelper);
    });

    describe('Initialization', () => {
        it('should create an empty register', () => {
            assert.deepEqual(testRegistry.register, []);
        });

        it('should accept and store a helper', () => {
            assert.deepEqual(testRegistry.helper, mockHelper);
        });

        it('should error if helper was not provided', () => {
            assert.throws(() => {new Registry();}, /helper/);
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

    describe('Observer', () => {
        it('should have a notify method', () => {
            assert.equal(typeof testRegistry.notify, 'function')
        });

        it('should trigger the experiment if experiment state is triggered', () => {
            let experimentIds = ['1', 'FROG', 'SHEEP'];
            let mockExperiment = {
                getStatus: sinon.stub().returns(Experiment.Status.TRIGGERED),
                setGroup: sinon.spy(),
            };
            let triggerExperimentSpy = sinon.spy(testRegistry, 'triggerExperiment');

            experimentIds.forEach((experimentId) => {
                triggerExperimentSpy.reset();

                testRegistry.register[experimentId] = mockExperiment;
                testRegistry.notify(experimentId);

                sinon.assert.calledOnce(triggerExperimentSpy);
                sinon.assert.calledWith(triggerExperimentSpy, experimentId);
            });
        });

        it('should not trigger experiment if in any other status', () => {

            let triggerExperimentSpy = sinon.spy(testRegistry, 'triggerExperiment');

            [Experiment.Status.WAITING, Experiment.Status.ACTIVE].forEach((status) => {
                triggerExperimentSpy.reset();

                let mockExperiment = {
                    getStatus: sinon.stub().returns(status),
                    setGroup: sinon.spy(),
                };
                testRegistry.register['1'] = mockExperiment;
                testRegistry.notify('1');

                sinon.assert.notCalled(triggerExperimentSpy);
            });

        });

        it('should throw an error if the experiment is not registered', () => {
            assert.throws(() => {testRegistry.notify('frog');}, /frog/);
        });

    });
});
