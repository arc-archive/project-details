import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../project-details.js';

describe('<project-details>', function() {
  async function basicFixture(projectId) {
    return await fixture(html`<project-details
      projectId="${projectId}"
    ></project-details>`);
  }

  async function draggableFixture() {
    return await fixture(html`<project-details
      draggableenabled noautoprojects
    ></project-details>`);
  }

  describe('basic', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('project is not set', function() {
      assert.isUndefined(element.project);
    });

    it('sets _exportOptions', () => {
      assert.typeOf(element._exportOptions, 'object');
    });
  });

  describe('_onDetails()', () => {
    let element;
    let eData;
    beforeEach(async () => {
      element = await basicFixture();
      eData = {
        detail: {
          item: DataGenerator.generateSavedItem()
        }
      };
    });

    it('Sets request on request details dialog', () => {
      element._onDetails(eData);

      const node = element.shadowRoot.querySelector('#requestDetails');
      assert.deepEqual(node.request, eData.detail.item);
    });

    it('Opens request details dialog', async () => {
      element._onDetails(eData);
      await aTimeout();
      assert.isTrue(element.detailsOpened);
    });
  });

  describe('_loadRequestDetails()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.detailsOpened = true;
      const node = element.shadowRoot.querySelector('#requestDetails');
      node.request = {
        _id: 'test'
      };
    });

    it('disaptches navigate event', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      element._loadRequestDetails();
      assert.isTrue(spy.called);
    });

    it('re-sets detailsOpened', () => {
      element._loadRequestDetails();
      assert.isFalse(element.detailsOpened);
    });
  });

  describe('Project export', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('opens export options from main menu', () => {
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      assert.isTrue(element._exportOptionsOpened);
    });

    it('sets export items to all (true flag)', () => {
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      assert.isTrue(element._exportItems);
    });

    it('opening export dialog closes main menu and removes selection', async () => {
      const menu = element.shadowRoot.querySelector('#mainMenu');
      MockInteractions.tap(menu);
      // This won't full open the dropdown but it is not relevant
      await aTimeout();
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      await aTimeout();
      assert.isFalse(menu.opened);
      const opts = element.shadowRoot.querySelector('#mainMenuOptions');
      assert.equal(opts.selected, null);
    });

    it('opens export dialog', async () => {
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      await aTimeout(100);
      const dialog = element.shadowRoot.querySelector('#exportOptionsContainer');
      const display = getComputedStyle(dialog).display;
      assert.notEqual(display, 'none');
    });

    it('requests data is set when export dialog is accepted', async () => {
      element.openExportAll();
      // the export event is handled by a mixin and it is tested there.
      // This tests for calling the export function.
      const spy = sinon.spy(element, '_dispatchExportData');
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('accept', {
        detail: {
          options: {}
        }
      }));
      assert.isTrue(spy.calledOnce);
      assert.isTrue(spy.args[0][0], 'requests are set to true');
      const detailArg = spy.args[0][2];
      assert.typeOf(detailArg, 'object', 'has the detail argument');
      assert.equal(detailArg.options.kind, 'ARC#ProjectExport', 'has "kind" property on the options');
    });

    it('opens drive export toast conformation', async () => {
      element.addEventListener('arc-data-export', (e) => {
        e.detail.result = Promise.resolve({
          id: 'test'
        });
      });
      element._doExportItems(true, {
        options: {
          provider: 'drive'
        }
      });
      await aTimeout();
      const toast = element.shadowRoot.querySelector('#driveSaved');
      assert.isTrue(toast.opened);
    });

    it('clears _exportItems when export finishes', async () => {
      element._doExportItems(true, {
        options: {
          provider: 'file'
        }
      });
      await aTimeout();
      assert.isUndefined(element._exportItems);
    });

    it('opens error toast when export error', async () => {
      element.addEventListener('arc-data-export', (e) => {
        e.detail.result = Promise.reject(new Error('test'));
      });
      element._doExportItems(true, {
        options: {
          provider: 'drive'
        }
      });
      await aTimeout();
      const toast = element.shadowRoot.querySelector('#errorToast');
      assert.isTrue(toast.opened, 'the toast is opened');
    });

    it('closes export dialog when it is accepted', async () => {
      element.openExportAll();
      await aTimeout();
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('accept', {
        detail: {
          options: {}
        }
      }));
      assert.isFalse(element._exportOptionsOpened);
    });

    it('cancels export when export dialog is cancelled', async () => {
      element.openExportAll();
      await aTimeout();
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('cancel'));
      assert.isFalse(element._exportOptionsOpened, 'dialog is closed');
      assert.isUndefined(element._exportItems, 'items are cleared');
    });
  });

  describe('Project delete', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    it('opens delete confirmation dialog', () => {
      const node = element.shadowRoot.querySelector('[data-action="delete-project"]');
      MockInteractions.tap(node);
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      assert.isTrue(dialog.opened);
    });

    it('opening delete dialog closes main menu and removes selection', async () => {
      const menu = element.shadowRoot.querySelector('#mainMenu');
      MockInteractions.tap(menu);
      await aTimeout();
      const node = element.shadowRoot.querySelector('[data-action="delete-project"]');
      MockInteractions.tap(node);
      await aTimeout();
      assert.isFalse(menu.opened);
      const opts = element.shadowRoot.querySelector('#mainMenuOptions');
      assert.equal(opts.selected, null);
    });

    it('requests file export for all requests', async () => {
      const spy = sinon.spy(element, '_dispatchExportData');
      const node = element.shadowRoot.querySelector('[data-action="delete-export-all"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.calledOnce);
      const requestArg = spy.args[0][0];
      assert.isTrue(requestArg, 'requests are set to true');
      const detailArg = spy.args[0][2];
      assert.typeOf(detailArg, 'object', 'has the detail argument');
      assert.equal(detailArg.options.kind, 'ARC#ProjectExport', 'has "kind" property on the options');
      assert.equal(detailArg.options.provider, 'file', 'has "provider" property on the options');
      assert.notEmpty(detailArg.options.file, 'has "file" property on the options');
    });

    it('separates requests with more than this project with single project', () => {
      const data = DataGenerator.generateSavedRequestData({
        projectsSize: 1,
        requestsSize: 4,
        forceProject: true
      });
      const projectId = data.projects[0]._id;
      const otherId = 'test-id';
      const requests = data.requests;
      requests[0].projects.push(otherId);
      requests[2].projects.push(otherId);
      const [del, up] = element._separateProjectRequests(requests, projectId);
      assert.deepEqual(del, [requests[1]._id, requests[3]._id]);
      assert.deepEqual(up, [requests[0], requests[2]]);
    });

    it.skip('removes the project', async () => {
      const data = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 4,
        forceProject: true
      });
      element.project = data.projects[0];
      element.shadowRoot.querySelector('project-requests-list').requests = data.requests;
      await element._deleteDialogResult({
        detail: {
          confirmed: true
        }
      });
      const proejcts = await DataGenerator.getDatastoreProjectsData();
      assert.lengthOf(proejcts, 0);
    });
  });

  describe('revertDeleted()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    it('closes delete toast', async () => {
      const toast = element.shadowRoot.querySelector('#deleteToast');
      toast.opened = true;
      await element.revertDeleted();
      assert.isFalse(toast.opened);
    });

    it('does nothing when no items to revert', async () => {
      const model = element.requestModel;
      const spy = sinon.spy(model, 'revertRemove');
      await element.revertDeleted();
      assert.isFalse(spy.called);
    });

    it('renders error toast when revering error', async () => {
      const model = element.requestModel;
      model.revertRemove = () => Promise.reject(new Error('test'));
      element._latestDeleted = [{ _id: 'test' }];
      try {
        await element.revertDeleted();
      } catch (e) {
        // ..
      }
      const toast = element.shadowRoot.querySelector('#errorToast');
      assert.isTrue(toast.opened);
    });
  });

  describe('_generateFileName()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns default name when no project', () => {
      const result = element._generateFileName();
      assert.equal(result, 'arc-project-export.arc');
    });

    it('Returns project name', () => {
      element.project = {
        name: 'test name'
      };
      const result = element._generateFileName();
      assert.equal(result, 'test-name.arc');
    });
  });

  describe('_onExportSelected()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets _exportOptionsOpened', () => {
      element._onExportSelected({ detail: {} });
      assert.isTrue(element._exportOptionsOpened);
    });

    it('Sets _exportItems', () => {
      const items = [{ test: true }];
      element._onExportSelected({ detail: { items } });
      assert.deepEqual(element._exportItems, items);
    });

    it('Sets _exportItems as default value', () => {
      element._onExportSelected({ detail: {} });
      assert.deepEqual(element._exportItems, []);
    });
  });

  describe('_deleteRequestDetails()', () => {
    let request;
    function handler(e) {
      e.preventDefault();
      e.stopPropagation();
      const items = e.detail.items;
      const result = {};
      items.forEach((id, index) => {
        result[id] = 'rev-' + index;
      });
      e.detail.result = Promise.resolve(result);
    }
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      request = DataGenerator.generateRequests({ requestsSize: 1 })[0];
      element.addEventListener('request-objects-deleted', handler);
    });

    afterEach(() => {
      element.removeEventListener('request-objects-deleted', handler);
    });

    it('Closes details panel', () => {
      element._requestDetails.request = request;
      const result = element._deleteRequestDetails();
      assert.isFalse(element.detailsOpened);
      return result;
    });

    it('Calls _delete() with an argument', () => {
      element._requestDetails.request = request;
      const spy = sinon.spy(element, '_delete');
      const result = element._deleteRequestDetails();
      assert.deepEqual(spy.args[0][0], [request]);
      return result;
    });
  });

  describe('toggleEdit()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Toggles "edit" property', () => {
      element.toggleEdit();
      assert.isTrue(element.editOpened);
    });

    it('Calls _deselectMainMenu()', () => {
      const spy = sinon.spy(element, '_deselectMainMenu');
      element.toggleEdit();
      assert.isTrue(spy.called);
    });

    it('_cancelEdit() cancels the edit', () => {
      element.edit = true;
      element._cancelEdit();
      assert.isFalse(element.editOpened);
    });
  });

  describe('_projectForRequests()', () => {
    let element;
    let projectId;
    before(async () => {
      const data = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 4,
        forceProject: true
      });
      projectId = data.projects[0]._id;
    });

    after(function() {
      return DataGenerator.destroySavedRequestData();
    });

    beforeEach(async () => {
      element = await basicFixture();
      element.projectId = projectId;
      await aTimeout(50);
    });

    it('Returns undefine dwhen no project data', () => {
      element.project = undefined;
      const result = element._projectForRequests([{ _id: 'test' }]);
      assert.isUndefined(result);
    });

    it('Maps requests when project does not have one', () => {
      delete element.project.requests;
      const result = element._projectForRequests([{ _id: 'test' }]);
      assert.deepEqual(result.requests, ['test']);
    });

    it('Returns the same requests', () => {
      const requests = element.requests;
      const result = element._projectForRequests(requests);
      assert.deepEqual(result.requests, requests.map((i) => i._id));
    });

    it('Returns only requests passed in the argument', () => {
      const requests = element.requests.slice(0, 2);
      const result = element._projectForRequests(requests);
      assert.deepEqual(result.requests, requests.map((i) => i._id));
    });
  });

  class MockedDataTransfer {
    constructor() {
      this._data = {};
      this.effectAllowed = 'none';
      this.dropEffect = 'none';
    }
    setData(type, data) {
      this._data[type] = String(data);
    }
    getData(type) {
      return this._data[type] || '';
    }
    get types() {
      return Object.keys(this._data);
    }
  }

  describe('_dragoverHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await draggableFixture();
      const node = element.shadowRoot.querySelector('project-requests-list');
      node.requests = DataGenerator.generateRequests({
        requestsSize: 2
      });
    });

    function createEvent(types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = {
        preventDefault: () => {
          e.defaultPrevented = true;
        },
        defaultPrevented: false,
        type: 'dragover',
        dataTransfer: new MockedDataTransfer(),
        path: []
      };
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragoverHandler();
      // no error
    });

    it('Ignores event when it is cancelled', () => {
      const e = createEvent();
      e.preventDefault();
      element._dragoverHandler(e);
      assert.equal(e.dataTransfer.dropEffect, 'none');
    });

    it('Ignores event when arc/request-object is not set', () => {
      const e = createEvent(['other']);
      element._dragoverHandler(e);
      assert.equal(e.dataTransfer.dropEffect, 'none');
    });

    it('Cancels the event', () => {
      const e = createEvent();
      element._dragoverHandler(e);
      assert.isTrue(e.defaultPrevented);
    });

    it('Calls _computeProjectDropEffect()', () => {
      const spy = sinon.spy(element, '_computeProjectDropEffect');
      const e = createEvent();
      element._dragoverHandler(e);
      assert.isTrue(spy.called);
    });

    it('Sets dropEffect on the event', () => {
      const e = createEvent();
      element._dragoverHandler(e);
      assert.equal(e.dataTransfer.dropEffect, 'copy');
    });
  });

  describe('_dropHandler()', () => {
    function projectHandler(e) {
      e.preventDefault();
      e.detail.result = Promise.resolve({});
    }

    function requestHandler(e) {
      e.preventDefault();
      e.detail.result = Promise.resolve();
    }

    before(() => {
      document.body.addEventListener('project-object-changed', projectHandler);
      document.body.addEventListener('save-request', requestHandler);
    });

    after(() => {
      document.body.removeEventListener('project-object-changed', projectHandler);
      document.body.removeEventListener('save-request', requestHandler);
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture();
      element.project = {
        _id: 'test-project'
      };
      await nextFrame();
      const node = element.shadowRoot.querySelector('project-requests-list');
      node.requests = DataGenerator.generateRequests({
        requestsSize: 4
      });
    });

    function dispatch(element, types, content) {
      if (!types) {
        types = ['arc/request-object'];
      }
      if (content === undefined) {
        content = '{"_id":"test-id", "_rev":"test-rev"}';
      }
      const e = new Event('drop', { cancelable: true });
      e.dataTransfer = new MockedDataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, content);
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dropHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Calls _computeProjectDropEffect()', () => {
      const spy = sinon.spy(element, '_computeProjectDropEffect');
      dispatch(element);
      assert.isTrue(spy.called);
    });

    it('Calls _insertRequestAt()', () => {
      const spy = sinon.spy(element, '_insertRequestAt');
      dispatch(element);
      assert.isTrue(spy.called);
    });

    it('Sets drop order', () => {
      const spy = sinon.spy(element, '_insertRequestAt');
      dispatch(element);
      assert.equal(spy.args[0][0], element.requests.length);
    });

    it('Calls _handleProjectMoveDrop()', () => {
      const spy = sinon.spy(element, '_handleProjectMoveDrop');
      element._computeProjectDropEffect = () => 'move';
      dispatch(element);
      assert.isTrue(spy.called);
    });
  });

  describe('_insertRequestAt()', () => {
    let element;
    let request;
    beforeEach(async () => {
      const result = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 3,
        forceProject: true
      });
      request = result.requests[0];

      element = await draggableFixture();
      element.project = result.projects[0];
      const node = element.shadowRoot.querySelector('project-requests-list');
      node.requests = request;
      await nextFrame();
    });

    afterEach(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    it('moves existing request', async () => {
      const id = request._id;
      await element._insertRequestAt(2, request);
      const projects = await DataGenerator.getDatastoreProjectsData();
      assert.equal(projects[0].requests[2], id);
      assert.lengthOf(projects[0].requests, 3);
    });

    it('adds new request at position', async () => {
      const request = DataGenerator.generateSavedItem();
      const id = request._id;
      await element._insertRequestAt(1, request);
      const projects = await DataGenerator.getDatastoreProjectsData();
      assert.equal(projects[0].requests[1], id);
      assert.lengthOf(projects[0].requests, 4);
    });
  });
});
