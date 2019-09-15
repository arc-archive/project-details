import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../project-details-editor.js';
import '../project-details.js';

describe('<project-details-editor>', function() {
  async function basicFixture(projectId) {
    return await fixture(html`<project-details
      projectId="${projectId}"></project-details>`);
  }

  async function editorFixture() {
    return await fixture(html`<project-details-editor></project-details-editor>`);
  }

  describe('basics', () => {
    let projectId;
    let counter = 0;
    before(async () => {
      const data = await DataGenerator.insertSavedRequestData({
        projectsSize: 1,
        requestsSize: 20,
        forceProject: true
      });
      projectId = data.projects[0]._id;
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(projectId);
      await aTimeout(50);
    });

    it('Turning on the editor', async () => {
      element.editOpened = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('project-details-editor');
      assert.ok(node);
    });

    const updateName = 'test-name';
    const updateDescription = 'test-description';
    const projectUpdateDetail = {
      detail: {
        name: updateName,
        description: updateDescription
      }
    };

    async function updateProject(element) {
      element.editOpened = true;
      await nextFrame();
      projectUpdateDetail.detail.name = updateName + '-' + String(counter);
      projectUpdateDetail.detail.description = updateDescription + '-' + String(counter);
      counter++;
      await element._saveEdit(projectUpdateDetail);
    }

    it('Updates name and description in the model', async () => {
      await updateProject(element);
      assert.equal(element.project.name, projectUpdateDetail.detail.name,
        'Name is updated');
      assert.equal(element.project.description, projectUpdateDetail.detail.description,
        'Description is updated');
    });

    it('Closes the editor', async () => {
      await updateProject(element);
      assert.isFalse(element.editOpened);
    });
  });

  describe('cancel()', () => {
    let element;
    beforeEach(async () => {
      element = await editorFixture();
    });

    it('Dispatech cancel event', () => {
      const spy = sinon.spy();
      element.addEventListener('cancel', spy);
      element.cancel();
      assert.isTrue(spy.called);
    });
  });

  describe('save()', () => {
    let element;
    beforeEach(async () => {
      element = await editorFixture();
    });

    it('Dispatches save event with detail', () => {
      element.name = 'test-name';
      element.description = 'test-description';
      const spy = sinon.spy();
      element.addEventListener('save', spy);
      element.save();
      assert.equal(spy.args[0][0].detail.name, element.name);
      assert.equal(spy.args[0][0].detail.description, element.description);
    });

    it('ignores event when no name', () => {
      const spy = sinon.spy();
      element.addEventListener('save', spy);
      element.save();
      assert.isFalse(spy.called);
    });
  });
});
