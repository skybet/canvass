import sinon from 'sinon';
import assert from 'assert';

import PreviewModeHelper, {PreviewModes} from '~/src/Config/PreviewModeHelper';

describe('PreviewModeHelper', () => {
    describe('Query string', () => {
        let sandbox, HelperWithMocks;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            HelperWithMocks = PreviewModeHelper;
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('sets preview mode to "all" from query string', () => {
            const queryString = '?canvassPreviewMode=all';
            sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns(queryString);
            const {mode} = HelperWithMocks.parse();

            assert.equal(mode, PreviewModes.ALL);
        });

        it('sets preview mode to "none" from query string', () => {
            const queryString = '?canvassPreviewMode=none';
            sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns(queryString);
            const {mode} = HelperWithMocks.parse();

            assert.equal(mode, PreviewModes.NONE);
        });

        it('sets preview mode to "off" from query string', () => {
            const queryString = '?canvassPreviewMode=off';
            sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns(queryString);
            const {mode} = HelperWithMocks.parse();

            assert.equal(mode, PreviewModes.OFF);
        });

        it('sets preview mode to "off" if query string does not match a mode', () => {
            const queryString = '?canvassPreviewMode=garbage';
            sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns(queryString);
            const {mode} = HelperWithMocks.parse();

            assert.equal(mode, PreviewModes.OFF);
        });

        it('sets preview mode to "custom" from query string', () => {
            const queryString = '?canvassPreviewMode={"foo":1}';
            sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns(queryString);
            const {mode} = HelperWithMocks.parse();

            assert.equal(mode, PreviewModes.CUSTOM);
        });

        it('sets custom preview mode experiments from query string', () => {
            const queryString = '?canvassPreviewMode={"foo":1}';
            sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns(queryString);
            const {mode, experiments} = HelperWithMocks.parse();

            assert.equal(mode, PreviewModes.CUSTOM);
            assert.deepEqual(experiments, {foo: 1});
        });

        describe('isJson', () => {

            it('returns true if json object', () => {
                const input = JSON.stringify({foo: 'bar'});
                assert.equal(PreviewModeHelper.isJson(input), true);
            });

            it('returns false if json but not object', () => {
                const input = JSON.stringify('foo');
                assert.equal(PreviewModeHelper.isJson(input), false);
            });

            it('returns false if invalid json', () => {
                const input = '{"foo"}';
                assert.equal(PreviewModeHelper.isJson(input), false);
            });

            it('returns false if type is not string', () => {
                const input = 1;
                assert.equal(PreviewModeHelper.isJson(input), false);
            });
        });

        describe('Loading Logic', () => {
            it('if no preview mode query string but session storage is set, load from there', () => {
                // mock session storage
                const sessionMode = 'all';
                const getItemMock = sandbox.stub();
                getItemMock.withArgs('canvassPreviewMode').returns(sessionMode);
                getItemMock.withArgs('canvassPreviewModeExperiments').returns(JSON.stringify({}));
                const sessionStorageMock = {
                    getItem: getItemMock,
                };
                sandbox.stub(HelperWithMocks, 'getSessionStorage').returns(sessionStorageMock);

                // mock query string
                const queryMode = '';
                sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns('?canvassPreviewMode=' + queryMode);

                const {mode} = HelperWithMocks.parse();
                assert.equal(mode, PreviewModes.ALL);
            });

            it('query string should override session storage when loading', () => {
                // mock session storage
                const sessionMode = 'none';
                const getItemMock = sandbox.stub();
                getItemMock.withArgs('canvassPreviewMode').returns(sessionMode);
                getItemMock.withArgs('canvassPreviewModeExperiments').returns(JSON.stringify({}));
                const sessionStorageMock = {
                    getItem: getItemMock,
                };
                sandbox.stub(HelperWithMocks, 'getSessionStorage').returns(sessionStorageMock);

                // mock query string
                const queryMode = 'all';
                sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns('?canvassPreviewMode=' + queryMode);

                const {mode} = HelperWithMocks.parse();
                assert.equal(mode, PreviewModes.ALL);
            });

            it('if no preview mode query string or session storage set to off', () => {
                // mock session storage
                const sessionMode = '';
                const getItemMock = sandbox.stub();
                getItemMock.withArgs('canvassPreviewMode').returns(sessionMode);
                getItemMock.withArgs('canvassPreviewModeExperiments').returns(JSON.stringify({}));
                const sessionStorageMock = {
                    getItem: getItemMock,
                };
                sandbox.stub(HelperWithMocks, 'getSessionStorage').returns(sessionStorageMock);

                // mock query string
                const queryMode = '';
                sandbox.stub(HelperWithMocks, 'getWindowLocationSearch').returns('?canvassPreviewMode=' + queryMode);

                const {mode} = HelperWithMocks.parse();
                assert.equal(mode, PreviewModes.OFF);
            });
        });
    });
});
