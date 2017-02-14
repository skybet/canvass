import Manager, {Manager as ManagerClass} from '~/src/Manager';
import sinon from 'sinon';
import assert from 'assert';
import EventEmitter from 'events';
import logger from '~/src/Helpers/Logger';
import cookies from 'js-cookie';
import CookieNames from '~/src/Helpers/CookieNames';

describe('Manager', () => {

    let testManager, mockHelper, mockExperiment;

    beforeEach(() => {
        global.document = {cookie: ''};

        mockHelper = {
            triggerExperiment: sinon.stub().returns(0),
            trackAction: sinon.spy(),
            getQubitExperimentTrigger: sinon.stub().returns(()=>{}),
            getAllQubitExperiments: sinon.stub().returns([]),
        };

        mockExperiment = new EventEmitter();
        mockExperiment.on = sinon.spy(mockExperiment, 'on');
        mockExperiment.removeListener = sinon.spy(mockExperiment, 'removeListener');
        mockExperiment.setGroup = sinon.spy();
        mockExperiment.getId = sinon.stub().returns('FROG');
        mockExperiment.setupTriggers = sinon.spy();
        mockExperiment.enroll = sinon.spy();

        testManager = Manager;
        testManager.setHelper(mockHelper);
    });

    describe('Initialisation', () => {
        it('should take a helper and store it', () => {
            assert.deepEqual(testManager.helper, mockHelper);
        });
    });

    describe('Experiment', () => {
        afterEach(() => {
            testManager.register = [];
        });

        it('should add an experiment to the registry', () => {
            testManager.addExperiment(mockExperiment);
            assert.deepEqual(testManager.register, {FROG: mockExperiment});
        });

        it('should enroll an experiment if triggers fired in a previous session', () => {
            testManager.triggeredExperiments = ['FROG'];
            testManager.addExperiment(mockExperiment);
            sinon.assert.calledOnce(mockExperiment.enroll);
        });

        it('should remove an experiment from the registry', () => {
            testManager.addExperiment(mockExperiment);
            testManager.removeExperiment('FROG');

            sinon.assert.calledOnce(mockExperiment.removeListener);
            assert.deepEqual(testManager.register, {});
        });

        it('should listen for experiment emitting enrolled', () => {
            testManager.addExperiment(mockExperiment);

            sinon.assert.called(mockExperiment.on);
            sinon.assert.calledWith(mockExperiment.on, 'ENROLLED');
        });

        it('should call activateExperiment when enrolled emitted', () => {
            let mockActivateExperiment = sinon.spy(testManager, 'activateExperiment');

            testManager.addExperiment(mockExperiment);
            mockExperiment.emit('ENROLLED');

            sinon.assert.calledOnce(mockActivateExperiment);
            sinon.assert.calledWith(mockActivateExperiment, 'FROG');
        });
    });

    describe('Triggered Experiments', () => {

        let mockCookies;

        beforeEach(() => {
            mockCookies = sinon.mock(cookies);

        });

        afterEach(() => {
            mockCookies.restore();

        });

        it('should be initialized from the cookie', () => {
            let triggeredExperiments = ['FROG'];
            let cookieValue = JSON.stringify(triggeredExperiments);
            mockCookies.expects('get').once().returns(cookieValue);

            let testManagerWithCookies = new ManagerClass();

            assert.deepEqual(testManagerWithCookies.triggeredExperiments, triggeredExperiments);
            mockCookies.verify();
        });

        it('should save an enrolled experiment to the cookie', () => {
            let triggeredExperiments = ['Example'];
            let cookieValue = JSON.stringify(triggeredExperiments);
            mockCookies.expects('set').once().withArgs(CookieNames.TRIGGERED_EXPERIMENTS, cookieValue);

            let testManagerWithCookies = new ManagerClass();
            testManagerWithCookies.saveTriggeredExperimentToCookie('Example');

            mockCookies.verify();
        });

        it('should not overwrite existing triggered experiments when saving a new one', () =>{
            let expectedTriggeredExperiments = ['Foo', 'Bar'];
            let cookieValue = JSON.stringify(expectedTriggeredExperiments);
            mockCookies.expects('set').once().withArgs(CookieNames.TRIGGERED_EXPERIMENTS, cookieValue);

            // Set up the manager with a currently saved Foo experiment in the cookie
            let testManagerWithCookies = new ManagerClass();
            testManagerWithCookies.getTriggeredExperimentsFromCookie = sinon.stub().returns(['Foo']);

            testManagerWithCookies.saveTriggeredExperimentToCookie('Bar');

            mockCookies.verify();
        })
    });

    describe('ActiveExperiment', () => {
        it('sets the group on the experiment', () => {
            testManager.addExperiment(mockExperiment);
            let mockGetExperiment = sinon.spy(testManager, 'getExperiment');
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockGetExperiment);
            sinon.assert.calledWith(mockGetExperiment, 'FROG');

            sinon.assert.calledOnce(mockHelper.triggerExperiment);
            sinon.assert.calledWith(mockHelper.triggerExperiment, mockExperiment.getId(), sinon.match((value) => typeof value === 'function'));

            testManager.removeExperiment('FROG');
        });
    });

    describe('TrackAction', () => {
        it('should call trackAction on the helper', () => {
            testManager.trackAction('1', 'click');

            sinon.assert.calledOnce(mockHelper.trackAction);
            sinon.assert.calledWith(mockHelper.trackAction, '1:click');
        });
    });

    describe('PrintState', () => {

        let mockLogger;

        beforeEach(() => {
            mockLogger = sinon.mock(logger);

        });

        afterEach(() => {
            mockLogger.restore();

        });

        it('should call table on the logger with the correct data', () => {
            mockExperiment.id = 'test id';
            mockExperiment.status = 'test status';
            mockExperiment.triggers = [{displayName: 'TestTrigger'}];
            mockExperiment.variants = {0: 'foo', 1: 'bar'};
            mockExperiment.group = '0';
            testManager.addExperiment(mockExperiment);
            mockLogger.expects('table').once().withExactArgs([{
                Experiment: mockExperiment.id,
                Status: mockExperiment.status,
                Triggers: 'TestTrigger',
                Variants: '0,1',
                Group: mockExperiment.group,
                ExistsOnHelper: true,
            }]);
            mockLogger.expects('info').once().withArgs('Qubit Live Experiments', []);

            testManager.printState();

            mockLogger.verify();
        });
    });

});
