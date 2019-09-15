import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../project-requests-list.js';

describe('<project-requests-list>', function() {
  async function basicFixture(requests) {
    return await fixture(html`<project-requests-list
      style="height: 300px;overflow: auto"
      .requests="${requests}"></project-requests-list>`);
  }

  async function draggableFixture(requests) {
    return await fixture(html`<project-requests-list
      draggableenabled
      .requests="${requests}"></project-requests-list>`);
  }

  async function dataFixture(project) {
    const element = await fixture(html`<project-requests-list
      .project="${project}"
      draggableEnabled></project-requests-list>`);
    element.loadRequests = () => {};
    element.projectId = project._id;
    await element._queryData();
    await nextFrame();
    return element;
  }

  async function projectFixture(project) {
    return await fixture(html`<project-requests-list
      .project="${project}"></project-requests-list>`);
  }

  // DataTransfer polyfill
  if (typeof DataTransfer === 'undefined') {
    class DataTransfer {
      setData(type, data) {
        this._data[type] = data;
      }
      getData(type) {
        if (!this._data) {
          return null;
        }
        return this._data[type];
      }
    }
    window.DataTransfer = DataTransfer;
  }

  describe('type property', () => {
    it('sets type property', async () => {
      const element = await basicFixture();
      assert.equal(element.type, 'project');
    });
  });

  describe('no items', () => {
    it('can be created without items', async () => {
      await basicFixture();
    });
  });

  describe('dataUnavailable property', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('is true when no requests and no querying', async () => {
      assert.isTrue(element.dataUnavailable);
    });

    it('is false when querying', async () => {
      element.querying = true;
      assert.isFalse(element.dataUnavailable);
    });

    it('is false when hasRequests', async () => {
      element._hasRequests = true;
      element.querying = true;
      assert.isFalse(element.dataUnavailable);
    });
  });

  describe('_queryData()', () => {
    let project;
    before(async () => {
      const result = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 3,
        forceProject: true
      });
      project = result.projects[0];
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await projectFixture(project);
    });

    it('sets project requests', async () => {
      element.loadRequests = () => {};
      element.projectId = project._id;
      await element._queryData();
      assert.lengthOf(element.requests, 3);
    });

    it('restores "querying"', async () => {
      element.loadRequests = () => {};
      element.projectId = project._id;
      await element._queryData();
      assert.isFalse(element.querying);
    });

    it('sets requests to undefined when no projectId', async () => {
      element.requests = [];
      element.projectId = undefined;
      await element._queryData();
      assert.isUndefined(element.requests);
    });
  });

  describe('_navigateItem()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('Dispatches "navigate" event when opend button click', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
    });

    it('Base is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.equal(spy.args[0][0].detail.base, 'request');
    });

    it('Type is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.equal(spy.args[0][0].detail.type, 'saved');
    });

    it('Id is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.typeOf(spy.args[0][0].detail.id, 'string');
    });
  });

  describe('_requestDetails()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('Dispatches details"', () => {
      const node = element.shadowRoot.querySelector('[data-action="item-detail"]');
      const spy = sinon.spy();
      element.addEventListener('details', spy);
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
    });

    it('item is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="item-detail"]');
      const spy = sinon.spy();
      element.addEventListener('details', spy);
      MockInteractions.tap(node);
      assert.typeOf(spy.args[0][0].detail.item, 'object');
    });
  });

  describe('selection handling', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('sets selectedIndexes', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      await nextFrame();
      assert.deepEqual(element.selectedIndexes, [0], 'first item is selected');
      MockInteractions.tap(items[2]);
      await nextFrame();
      assert.deepEqual(element.selectedIndexes, [0, 2], 'third item is selected');
    });

    it('sets selectedItems', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      await nextFrame();
      assert.deepEqual(element.selectedItems, [requests[0]], 'first item is selected');
      MockInteractions.tap(items[2]);
      await nextFrame();
      assert.deepEqual(element.selectedItems, [requests[0], requests[2]], 'third item is selected');
    });

    it('selects a checkbox with item selection', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[1]);
      await nextFrame();
      const node = items[1].querySelector('anypoint-checkbox');
      assert.isTrue(node.checked);
    });

    it('dispatches selecteditems-changed with selection', async () => {
      const items = element._list.items;
      const spy = sinon.spy();
      element.addEventListener('selecteditems-changed', spy);
      MockInteractions.tap(items[1]);
      assert.isTrue(spy.called, 'event is called');
      assert.deepEqual(spy.args[0][0].detail.value, [requests[1]], 'has value');
    });

    it('clears selection via clearSelection()', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      MockInteractions.tap(items[1]);
      await nextFrame();
      element.clearSelection();
      assert.deepEqual(element.selectedIndexes, []);
    });

    it('selectes all items', async () => {
      const node = element.shadowRoot.querySelector('.select-all');
      MockInteractions.tap(node);
      await nextFrame();
      assert.lengthOf(element.selectedItems, 30);
    });

    it('deselectes all items', async () => {
      const node = element.shadowRoot.querySelector('.select-all');
      MockInteractions.tap(node);
      await nextFrame();
      MockInteractions.tap(node);
      await nextFrame();
      assert.lengthOf(element.selectedItems, 0);
    });

    it('keeps selected items when selecting all', async () => {
      const item = element.shadowRoot.querySelector('.request-list-item');
      MockInteractions.tap(item);
      await nextFrame();
      const node = element.shadowRoot.querySelector('.select-all');
      MockInteractions.tap(node);
      await nextFrame();
      assert.lengthOf(element.selectedItems, 30);
    });

    it('keeps deselected items when deselecting all', async () => {
      const node = element.shadowRoot.querySelector('.select-all');
      MockInteractions.tap(node);
      await nextFrame();
      const item = element.shadowRoot.querySelector('.request-list-item');
      MockInteractions.tap(item);
      await nextFrame();
      MockInteractions.tap(node);
      await nextFrame();
      assert.lengthOf(element.selectedItems, 0);
    });
  });

  describe('_dragStart()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture(requests);
    });

    function dispatch(element) {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const e = new Event('dragstart');
      e.dataTransfer = new DataTransfer();
      node.dispatchEvent(e);
      return e;
    }

    it('sets arc/request-object transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/request-object');
      assert.typeOf(data, 'string');
    });

    it('Sets arc/saved-request data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/saved-request');
      assert.equal(data, element.requests[0]._id);
    });

    it('Sets arc-source/project-detail transfer data', () => {
      element.projectId = 'test';
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc-source/project-detail');
      assert.equal(data, 'test');
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });
  });

  describe('_removeDropPointer()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Does nothing when __dropPointer not set', () => {
      element._removeDropPointer();
      // no error
    });

    it('Removes pointer from the DOM', () => {
      const elm = document.createElement('div');
      elm.id = 'test-elm';
      element.shadowRoot.appendChild(elm);
      element.__dropPointer = elm;
      element._removeDropPointer();
      const node = element.shadowRoot.querySelector('#test-elm');
      assert.equal(node, null);
    });
  });

  describe('_createDropPointer()', () => {
    let project;
    before(async () => {
      const result = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 3,
        forceProject: true
      });
      project = result.projects[0];
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await dataFixture(project);
    });

    it('Adds pointer to the DOM', () => {
      const node = element.shadowRoot.querySelector('.request-list-item');
      element._createDropPointer(node);
      const pointer = element.shadowRoot.querySelector('.drop-pointer');
      assert.ok(pointer);
    });
  });

  describe('_dragoverHandler()', () => {
    let project;
    before(async () => {
      const result = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 3,
        forceProject: true
      });
      project = result.projects[0];
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await dataFixture(project);
    });

    function createEvent(types, node) {
      if (!types) {
        types = ['arc/request-object'];
      }
      node = node || element.shadowRoot.querySelector('.request-list-item');
      const e = {
        preventDefault: () => {},
        type: 'dragover',
        dataTransfer: new DataTransfer(),
        path: [node]
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

    it('Ignores event when arc/request-object is not set', () => {
      const e = createEvent(['other']);
      element._dragoverHandler(e);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = createEvent();
      const spy = sinon.spy(e, 'preventDefault');
      element._dragoverHandler(e);
      assert.isTrue(spy.called);
    });

    it('Calls _computeProjectDropEffect()', () => {
      const spy = sinon.spy(element, '_computeProjectDropEffect');
      const e = createEvent();
      element._dragoverHandler(e);
      assert.isTrue(spy.called);
    });

    it('Does nothing when __dropPointerReference is the same as reference', () => {
      const node = element.shadowRoot.querySelector('.request-list-item');
      element.__dropPointerReference = node;

      const spy = sinon.spy(element, '_removeDropPointer');
      const e = createEvent();
      e.y = 0;
      element._dragoverHandler(e);
      assert.isFalse(spy.called);
    });

    it('Calls _createDropPointer()', () => {
      const spy = sinon.spy(element, '_removeDropPointer');
      const e = createEvent();
      e.y = 0;
      element._dragoverHandler(e);
      assert.isTrue(spy.called);
    });

    it('Calls _removeDropPointer()', () => {
      const spy = sinon.spy(element, '_removeDropPointer');
      const e = createEvent();
      e.y = 0;
      element._dragoverHandler(e);
      assert.isTrue(spy.called);
    });

    it('Sets __dropPointerReference', () => {
      const e = createEvent();
      e.y = 0;
      element._dragoverHandler(e);
      assert.ok(element.__dropPointerReference);
    });
  });

  describe('_computeProjectDropEffect()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function createEvent(types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = {
        dataTransfer: {
          types
        }
      };
      return e;
    }

    it('Returns "copy" by default', () => {
      const e = createEvent();
      const result = element._computeProjectDropEffect(e);
      assert.equal(result, 'copy');
    });

    it('Returns "move" when configuration is set', () => {
      const e = createEvent();
      e.ctrlKey = true;
      const result = element._computeProjectDropEffect(e);
      assert.equal(result, 'move');
    });

    it('Returns "copy" when a history item', () => {
      const e = createEvent(['arc/request-object', 'arc/history-request']);
      e.ctrlKey = true;
      const result = element._computeProjectDropEffect(e);
      assert.equal(result, 'copy');
    });

    it('Returns "copy" when effectAllowed is not move', () => {
      const e = createEvent();
      e.ctrlKey = true;
      e.dataTransfer.effectAllowed = 'link';
      const result = element._computeProjectDropEffect(e);
      assert.equal(result, 'copy');
    });
  });

  describe('_dragleaveHandler()', () => {
    let project;
    before(async () => {
      const result = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 3,
        forceProject: true
      });
      project = result.projects[0];
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await dataFixture(project);
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = new Event('dragleave', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragleaveHandler();
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

    it('Calls _removeDropPointer()', () => {
      const spy = sinon.spy(element, '_removeDropPointer');
      dispatch(element);
      assert.isTrue(spy.called);
    });

    it('Clears __dropPointerReference', () => {
      element.__dropPointerReference = 'test';
      dispatch(element);
      assert.isUndefined(element.__dropPointerReference);
    });
  });

  describe('_dropHandler()', () => {
    let element;
    let request;
    beforeEach(async () => {
      const result = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 3,
        forceProject: true
      });
      request = result.requests[0];
      element = await dataFixture(result.projects[0]);
    });

    afterEach(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    function dispatch(element, types, content) {
      if (!types) {
        types = ['arc/request-object'];
      }
      if (content === undefined) {
        content = JSON.stringify(request);
      }
      const e = new Event('drop', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, content);
      });
      element.dispatchEvent(e);
      return e;
    }

    it('ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dropHandler();
      // no error
    });

    it('ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('calls _removeDropPointer()', () => {
      const spy = sinon.spy(element, '_removeDropPointer');
      dispatch(element);
      assert.isTrue(spy.called);
    });

    it('calls _computeProjectDropEffect()', () => {
      const spy = sinon.spy(element, '_computeProjectDropEffect');
      dispatch(element);
      assert.isTrue(spy.called);
    });

    it('calls _insertRequestAt()', () => {
      const spy = sinon.spy(element, '_insertRequestAt');
      dispatch(element);
      assert.isTrue(spy.called);
    });

    it('clears __dropPointerReference', () => {
      const node = element.shadowRoot.querySelector('dom-repeat');
      element.__dropPointerReference = node;
      dispatch(element);
      assert.isUndefined(element.__dropPointerReference);
    });

    it('sets default drop order', () => {
      const spy = sinon.spy(element, '_insertRequestAt');
      dispatch(element);
      assert.equal(spy.args[0][0], 0);
    });

    it('sets item at position', () => {
      const node = element.shadowRoot.querySelectorAll('.request-list-item')[2];
      element.__dropPointerReference = node;
      const spy = sinon.spy(element, '_insertRequestAt');
      dispatch(element);
      assert.equal(spy.args[0][0], 2);
    });

    it('calls _handleProjectMoveDrop()', () => {
      const spy = sinon.spy(element, '_handleProjectMoveDrop');
      element._computeProjectDropEffect = () => 'move';
      dispatch(element);
      assert.isTrue(spy.called);
    });
  });

  describe('_handleProjectMoveDrop()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function createEvent(types) {
      const _types = types;
      const e = {
        dataTransfer: {
          types: Object.keys(types),
          getData: (type) => _types[type]
        }
      };
      return e;
    }

    it('Returns false when project id not found', () => {
      const e = createEvent({
        'arc-source/project-detail': 'test'
      });
      const result = element._handleProjectMoveDrop(e, {
        projects: []
      });
      assert.isFalse(result);
    });

    it('Returns true when removing project from arc-source/project-menu', () => {
      const e = createEvent({
        'arc-source/project-menu': 'project-id'
      });
      const result = element._handleProjectMoveDrop(e, {
        projects: ['project-id']
      });
      assert.isTrue(result);
    });

    it('Returns true when removing project from arc-source/project-detail', () => {
      const e = createEvent({
        'arc-source/project-detail': 'project-id'
      });
      const result = element._handleProjectMoveDrop(e, {
        projects: ['project-id']
      });
      assert.isTrue(result);
    });

    it('Returns false when project is not set on request', () => {
      const e = createEvent({
        'arc-source/project-detail': 'project-id'
      });
      const result = element._handleProjectMoveDrop(e, {
        projects: ['']
      });
      assert.isFalse(result);
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
      element = await dataFixture(result.projects[0]);
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

  describe('Events', () => {
    let element;
    beforeEach(async () => {
      const data = await DataGenerator.insertSavedRequestData({
        requestsSize: 2
      });
      element = await basicFixture(data.requests);
    });

    it('dispatches "details" event', () => {
      const spy = sinon.spy();
      element.addEventListener('details', spy);
      const item = element.shadowRoot.querySelector('.request-list-item anypoint-button');
      MockInteractions.tap(item);
      assert.isTrue(spy.called);
    });

    it('dispatches "export" event', async () => {
      const spy = sinon.spy();
      element.addEventListener('export', spy);
      const item = element.shadowRoot.querySelector('.request-list-item');
      MockInteractions.tap(item);
      await nextFrame();
      const button = element.shadowRoot.querySelector('[data-action=export-selected]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
      assert.lengthOf(spy.args[0][0].detail.items, 1);
    });

    it('dispatches "delete" event', async () => {
      const spy = sinon.spy();
      element.addEventListener('delete', spy);
      const item = element.shadowRoot.querySelector('.request-list-item');
      MockInteractions.tap(item);
      await nextFrame();
      const button = element.shadowRoot.querySelector('[data-action=delete-selected]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
      assert.lengthOf(spy.args[0][0].detail.items, 1);
    });
  });

  describe('View filtering', () => {
    let element;
    let input;
    beforeEach(async () => {
      const data = await DataGenerator.insertSavedRequestData({
        requestsSize: 2
      });
      element = await basicFixture(data.requests);
      input = element.shadowRoot.querySelector('[type=search]');
    });

    function makeSearchInput(input, query) {
      input.value = query;
      input.dispatchEvent(new CustomEvent('search'));
    }

    it('filters the vie by name', async () => {
      const item = element.requests[0];
      makeSearchInput(input, item.name);
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.request-list-item');
      assert.lengthOf(nodes, 1, 'renders single item');
      assert.lengthOf(element.__beforeQuery, 2, 'has previous items cached');
    });

    it('filters the vie by url', async () => {
      const item = element.requests[0];
      makeSearchInput(input, item.url);
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.request-list-item');
      assert.lengthOf(nodes, 1, 'renders single item');
      assert.lengthOf(element.__beforeQuery, 2, 'has previous items cached');
    });

    it('filters the vie by method', async () => {
      element.requests[0].method = 'GET';
      element.requests[1].method = 'POST';
      makeSearchInput(input, 'GET');
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.request-list-item');
      assert.lengthOf(nodes, 1, 'renders single item');
      assert.lengthOf(element.__beforeQuery, 2, 'has previous items cached');
    });

    it('restores the view when clearing the search', async () => {
      const item = element.requests[0];
      makeSearchInput(input, item.name);
      await nextFrame();
      makeSearchInput(input, '');
      await nextFrame();
      assert.lengthOf(element.requests, 2);
    });
  });

  describe('a11y', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture(requests);
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element);
    });

    it('is accessible with selected items', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      MockInteractions.tap(items[2]);
      await nextFrame();
      await assert.isAccessible(element);
    });
  });
});
