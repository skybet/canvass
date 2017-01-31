import sinon from 'sinon';
import assert from 'assert';
import {Logger} from '~/src/Helpers/Logger';

describe('Logger', () => {

    let mockLogger, testingLogger;

    beforeEach(() => {
        mockLogger = {
            error: sinon.spy(),
            warn: sinon.spy(),
            info: sinon.spy(),
            log: sinon.spy(),
            debug: sinon.spy(),
        };

        testingLogger = new Logger(mockLogger);
    });

    it('should correctly prefix a message', () => {
        let message = 'test message';
        let result = testingLogger.prefixMessage(message);

        assert.equal(result, '[canvass] ' + message);
    });

    it('should call the loggers error method when calling error', () => {
        let testMessage = 'test error message';
        let testError = new Error(testMessage);
        testingLogger.error(testMessage, testError);

        sinon.assert.calledOnce(mockLogger.error);
        sinon.assert.calledWith(mockLogger.error, '[canvass] ' + testMessage, testError);
    });

    it('should call the loggers warn method when calling warn', () => {
        let testMessage = 'test warn message';
        testingLogger.warn(testMessage);

        sinon.assert.calledOnce(mockLogger.warn);
        sinon.assert.calledWith(mockLogger.warn, '[canvass] ' + testMessage);
    });

    it('should call the loggers info method when calling info', () => {
        let testMessage = 'test info message';
        testingLogger.info(testMessage);

        sinon.assert.calledOnce(mockLogger.info);
        sinon.assert.calledWith(mockLogger.info, '[canvass] ' + testMessage);
    });

    it('should call the loggers debug method when calling debug', () => {
        let testMessage = 'test debug message';
        testingLogger.debug(testMessage);

        sinon.assert.calledOnce(mockLogger.debug);
        sinon.assert.calledWith(mockLogger.debug, '[canvass] ' + testMessage);
    });

    it('should call the log method if a debug method does not exist', () => {
        mockLogger = {
            error: sinon.spy(),
            warn: sinon.spy(),
            info: sinon.spy(),
            log: sinon.spy(),
        };
        testingLogger = new Logger(mockLogger);

        let testMessage = 'test debug message';
        testingLogger.debug(testMessage);

        sinon.assert.calledOnce(mockLogger.log);
        sinon.assert.calledWith(mockLogger.log, '[canvass] ' + testMessage);
    });

});
