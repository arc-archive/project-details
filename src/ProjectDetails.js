/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html } from 'lit-element';
import { moreVert, exportVariant, clear, edit } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '@advanced-rest-client/saved-request-detail/saved-request-detail.js';
import '@advanced-rest-client/saved-request-editor/saved-request-editor.js';
import '@polymer/paper-fab/paper-fab.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@advanced-rest-client/export-options/export-options.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-models/project-model.js';
import '@advanced-rest-client/arc-models/request-model.js';
import '@advanced-rest-client/arc-models/url-indexer.js';
import '../project-details-editor.js';
import '../project-requests-list.js';
import { ProjectBase } from './ProjectBase.js';
import styles from './ProjectStyles.js';
/**
 * A project details panel for the Advanced REST Client.
 *
 * Contains complete UI to display ARC's legacy projects.
 *
 * This element contains logic for handling request and project data
 * (`arc-models`).
 *
 * It doesn't support data export. It must be used with another element
 * that handles `export-data` custom event.
 *
 * The element dispatches `navigate` custom event when the navigation occures.
 * Hosting application shouls handle the event and navigate the used into
 * requested place.
 *
 * ### Example
 *
 * ```html
 * <project-details project-id="some-id"></project-details>
 * ```
 *
 * ### Styling
 *
 * `<project-details>` provides the following custom properties and mixins
 * for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--project-details` | Mixin applied to the element | `{}`
 * `--project-details-description-button-color` | Color od the add description button | `--primary-color`
 * `--project-details-description-color` | Color of the project description text | `rgba(0, 0, 0, 0.74)`
 * `--project-details-description-max-width` | Max width of the project description | `700px`
 * `--project-details-fab-background-color` | Color of the fab button in the details panel | `--primary-color`
 * `--empty-info` | Theme mixin, applied to the "empty info" message | `{}`
 * `--project-details-description-empty` | Mixin applied to the "empty info" message | `{}`
 * `--project-details-description` | Description of the project | `{}`
 * `--project-details-description-container` Container of the description of the project | `{}`
 * `--project-details-header` | Mixin applied to the header section | `{}`
 * `--project-details-editor` | Mixin applied to the project editor | `{}`
 * `--project-details-bottom-sheet` | Mixin apllied to the `<bottom-sheet>` elements | `{}`
 * `--context-menu-item-color` | Color of the dropdown menu items | ``
 * `--context-menu-item-background-color` | Background olor of the dropdown menu items | ``
 * `--context-menu-item-color-hover` | Color of the dropdown menu items when hovering | ``
 * `--context-menu-item-background-color-hover` | Background olor of the dropdown menu items when hovering | ``
 * `--bottom-sheet-width` | Width of the `<bottom-sheet>` element | `100%`
 * `--bottom-sheet-max-width` | Max width of the `<bottom-sheet>` element | `700px`
 * `--project-details-bottom-sheet-right` | Right position of the `<bottom-sheet>` element | `40px`
 * `--project-details-bottom-sheet-left` | Left position of the `<bottom-sheet>` element | `auto`
 * `--warning-dialog-button-color` | Button color of the warning dialog | `#fff`
 * `--warning-dialog-button-background-color` | Button background color of the warning dialog | `transparent`
 * `--warning-primary-color` | Main color of the warning messages | `#FF7043`
 * `--warning-contrast-color` | Contrast color for the warning color | `#fff`
 * `--error-toast` | Mixin applied to the error toast | `{}`
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @demo demo/dnd.html Drag and drop
 */
export class ProjectDetails extends ProjectBase {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Project datastore ID to display.
       */
      projectId: { type: String },
      /**
       * Retreived from the data store project data.
       */
      project: { type: Object },
      /**
       * Set to true to enable project editor.
       */
      editOpened: { type: Boolean },
      /**
       * True when the project data are being loaded
       */
      _loadingProject: { type: Boolean },
      /**
       * When set the project metadata editor is opened.
       */
      editorOpened: Boolean,
      /**
       * When set the project metadata preview is opened.
       */
      detailsOpened: Boolean,
      /**
       * When set the element won't request projects list when attached to the dom.
       * This is passed to the request editor.
       */
      noAutoProjects: Boolean,
      /**
       * When set is enables encryption options.
       * Currently only in the export panel.
       */
      withEncrypt: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: Boolean,
      _exportOptions: { type: Object }
    };
  }

  get projectId() {
    return this._projectId;
  }

  set projectId(value) {
    const old = this._projectId;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._projectId = value;
    this._projectIdChanged(value);
  }

  get modelTemplate() {
    return html`
      <project-model .eventsTarget="${this}"></project-model>
      <request-model .eventsTarget="${this}"></request-model>
      <url-indexer .eventsTarget="${this}"></url-indexer>
    `;
  }

  get requestModel() {
    if (!this.__rmodel) {
      this.__rmodel = this.shadowRoot.querySelector('request-model');
    }
    return this.__rmodel;
  }

  get projectModel() {
    if (!this.__pmodel) {
      this.__pmodel = this.shadowRoot.querySelector('project-model');
    }
    return this.__pmodel;
  }

  get _requestDetails() {
    return this.shadowRoot.querySelector('#requestDetails');
  }

  get _requestEditor() {
    return this.shadowRoot.querySelector('#requestEditor');
  }

  get _list() {
    return this.shadowRoot.querySelector('project-requests-list');
  }

  get requests() {
    return this.shadowRoot.querySelector('project-requests-list').requests;
  }

  constructor() {
    super();
    this._projectDeleteHandler = this._projectDeleteHandler.bind(this);
    this._projectChanged = this._projectChanged.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);

    this._exportOptions = {
      file: this._generateFileName(),
      provider: 'file',
      providerOptions: {
        parents: ['My Drive']
      }
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'project';
    window.addEventListener('project-object-deleted', this._projectDeleteHandler);
    window.addEventListener('project-object-changed', this._projectChanged);
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('project-object-deleted', this._projectDeleteHandler);
    window.removeEventListener('project-object-changed', this._projectChanged);
    this._removeDndEvents();
  }

  firstUpdated() {
    if (this.projectId) {
      this._projectIdChanged(this.projectId);
    }
  }

  _addDndEvents() {
    if (this.__dndAdded) {
      return;
    }
    this.__dndAdded = true;
    this.addEventListener('dragover', this._dragoverHandler);
    this.addEventListener('drop', this._dropHandler);
  }

  _removeDndEvents() {
    if (!this.__dndAdded) {
      return;
    }
    this.__dndAdded = false;
    this.removeEventListener('dragover', this._dragoverHandler);
    this.removeEventListener('drop', this._dropHandler);
  }
  /**
   * Updates project info when `projectId` changed.
   * @param {String} projectId Project data store id.
   * @return {Promise}
   */
  async _projectIdChanged(projectId) {
    this.project = undefined;
    if (!projectId) {
      return;
    }
    const model = this.projectModel;
    if (!model) {
      return;
    }
    this._loadingProject = true;
    try {
      this.project = await model.readProject(projectId);
      this._updateExportFile();
    } catch (e) {
      this._handleException(e.message);
    }
    this._loadingProject = false;
  }

  /**
   * Handles items delete event the list
   * @param {CustomEvent} e
   * @return {Promise}
   */
  async _deleteSelected(e) {
    const data = e.detail.items;
    if (!data.length) {
      return;
    }
    return await this._delete(data);
  }

  /**
   * Deletes a request from the details panel.
   * @return {Promise}
   */
  async _deleteRequestDetails() {
    const data = [this._requestDetails.request];
    this.detailsOpened = false;
    return await this._delete(data);
  }
  /**
   * Performs a delete action of request items.
   *
   * @param {Array<Object>} items List of deleted items.
   * @param {?Object} opts If `skipRevert` is true it ignores "revert" logic
   * @return {Promise}
   */
  async _delete(items, opts) {
    opts = opts || {};
    const model = this.requestModel;
    const updated = await model.bulkDelete('saved', items.map((item) => item._id));
    const deleted = Object.keys(updated).map((id) => {
      return {
        _id: id,
        _rev: updated[id]
      };
    });
    this._latestDeleted = deleted;
    this._list.clearSelection();
    if (opts.skipRevert) {
      return;
    }
    let msg;
    if (deleted.length === 1) {
      msg = 'The request has been removed.';
    } else {
      msg = deleted.length + ' requests has been removed.';
    }
    const toast = this.shadowRoot.querySelector('#deleteToast');
    toast.text = msg;
    toast.opened = true;
  }
  /**
   * Restores removed requests.
   * It does nothing if `_latestDeleted` is not set or empty.
   *
   * @return {Promise} A promise resolved when objects were restored
   */
  async revertDeleted() {
    const toast = this.shadowRoot.querySelector('#deleteToast');
    toast.opened = false;
    const deleted = this._latestDeleted;
    if (!deleted || !deleted.length) {
      return;
    }
    const model = this.requestModel;
    try {
      await model.revertRemove('saved', deleted);
    } catch (e) {
      this._handleException(e.message);
    }
  }
  /**
   * Removes selection from screen's main menu dropdown
   */
  _deselectMainMenu() {
    setTimeout(() => {
      const menuOptions = this.shadowRoot.querySelector('#mainMenuOptions');
      menuOptions.selected = null;
    });
  }
  /**
   * Toggles export options panel and sets export items to all currently loaded requests.
   */
  openExportAll() {
    this._exportOptionsOpened = true;
    this._exportItems = true;
    this._deselectMainMenu();
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
    this._exportItems = undefined;
  }
  /**
   * Creates export file for all items.
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        provider: 'file'
      }
    };
    return this._doExportItems(true, detail);
  }
  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const { detail } = e;
    return this._doExportItems(this._exportItems, detail);
  }
  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {Array<Object>} requests List of request to export with the project.
   * @param {String} detail Export configuration
   * @return {Promise}
   */
  async _doExportItems(requests, detail) {
    detail.options.kind = 'ARC#ProjectExport';
    const project = this._projectForRequests(requests);
    const request = this._dispatchExportData(requests, project, detail);
    try {
      await request.detail.result;
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.shadowRoot.querySelector('#driveSaved').opened = true;
      }
    } catch(e) {
      this._handleException(e.message);
    }
    this._exportItems = undefined;
  }

  _onExportSelected(e) {
    this._exportOptionsOpened = true;
    this._exportItems = e.detail.items || [];
  }

  /**
   * Updates project object to include only selected requests.
   * The requests list can be all of them. In this case it uses the same list.
   * If requests size is different than the projects requests then it iterates
   * over the array and removes IDs that are not available on the `requests`
   * list.
   * @param {Array<Object>} requests List of requests being exported.
   * @return {Object} Project definition to export.
   * This is a copy of current project.
   */
  _projectForRequests(requests) {
    const tmp = this.project;
    if (!tmp) {
      return;
    }
    const project = Object.assign({}, tmp);
    let pRequests = project.requests;
    if (!pRequests) {
      pRequests = requests.map((item) => item._id);
    } else if (requests.length !== pRequests.length) {
      pRequests = Array.from(pRequests);
      const rLength = requests.length;
      for (let i = pRequests.length - 1; i >= 0; i--) {
        const id = pRequests[i];
        let hasRequest = false;
        for (let j = 0; j < rLength; j++) {
          if (requests[j]._id === id) {
            hasRequest = true;
            break;
          }
        }
        if (!hasRequest) {
          pRequests.splice(i, 1);
        }
      }
    }
    project.requests = pRequests;
    return project;
  }
  /**
   * Dispatches `export-data` event and returns it.
   * @param {Array<Object>} requests List of request to export.
   * @param {Object} project Project object to export
   * @param {Object} opts
   * @return {CustomEvent}
   */
  _dispatchExportData(requests, project, opts) {
    const data = {
      saved: requests,
      projects: [project]
    };
    return this._dispatch('arc-data-export', {
      options: opts.options,
      providerOptions: opts.providerOptions,
      data
    });
  }
  /**
   * Generates export file name based on current project name.
   * @return {String} File name for export.
   */
  _generateFileName() {
    const project = this.project;
    let name = project && project.name;
    if (!name) {
      name = 'arc-project-export.arc';
    } else {
      name = name.toLowerCase().replace(/\s/g, '-');
      if (name[name.length - 1] !== '.') {
        name += '.';
      }
      name += 'arc';
    }
    return name;
  }

  // Toogles project details editor
  toggleEdit() {
    this.editOpened = !this.editOpened;
    this._deselectMainMenu();
  }
  // Handler to project edit cancel event
  _cancelEdit() {
    this.editOpened = false;
  }
  // Handler to project edit save event
  async _saveEdit(e) {
    this.editOpened = false;
    const { name, description } = e.detail;
    const project = this.project;
    let changed = false;
    if (name !== project.name) {
      changed = true;
      project.name = name;
    }
    if (description !== project.description) {
      changed = true;
      project.description = description;
    }
    if (!changed) {
      return;
    }
    const model = this.projectModel;
    try {
      await model.saveProject(project);
    } catch (e) {
      this._handleException(e.message);
    }
  }
  /**
   * Handler for the `project-object-deleted` event.
   * @param {CustomEvent} e
   */
  _projectDeleteHandler(e) {
    if (e.cancelable) {
      return;
    }
    if (e.detail.id !== this.projectId) {
      return;
    }
    this.project = undefined;
  }
  /**
   * Opens the warning dialog to delete the project.
   */
  _deleteProject() {
    const dialog = this.shadowRoot.querySelector('#dataClearDialog');
    dialog.opened = true;
    this._deselectMainMenu();
  }
  /**
   * Called when the delete warning dialog closes.
   *
   * The function removes requests that exclusively belongs to this project
   * and updates the requests that contains this project and some other.
   * Finally it removes the project.
   * Each of the actions is separate action based on events API.
   *
   * @param {CustomEvent} e
   * @return {Promise}
   */
  async _deleteDialogResult(e) {
    if (e.detail.canceled || !e.detail.confirmed) {
      return;
    }
    let requests = this.requests;
    if (!requests) {
      requests = [];
    }
    const projectId = this.project._id;
    const [deleteRequests, updateRequests] = this._separateProjectRequests(requests, this.projectId);
    const requestModel = this.requestModel;
    if (updateRequests.length) {
      await requestModel.updateBulk('saved', updateRequests);
    }
    if (deleteRequests.length) {
      await requestModel.bulkDelete('saved', deleteRequests);
    }
    const projectModel = this.projectModel;
    await projectModel.removeProject(projectId);
  }

  _separateProjectRequests(requests, projectId) {
    const deleteRequests = [];
    const updateRequests = [];
    requests.forEach((item) => {
      if (!item.projects || item.projects.length === 1) {
        deleteRequests[deleteRequests.length] = item._id;
      } else if (item.projects) {
        const index = item.projects.indexOf(projectId);
        item.projects.splice(index, 1);
        updateRequests[updateRequests.length] = item;
      }
    });
    return [deleteRequests, updateRequests];
  }

  /**
   * Opens the request details applet with the request.
   * @param {CustomEvent} e
   */
  _onDetails(e) {
    this.detailsOpened = false;
    this._requestDetails.request = e.detail.item;
    setTimeout(() => {
      this.detailsOpened = true;
    });
  }
  /**
   * Fires `navigate` event for currently loaded in the details request.
   */
  _loadRequestDetails() {
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: {
        base: 'request',
        type: 'saved',
        id: this._requestDetails.request._id
      }
    }));
    this.detailsOpened = false;
  }
  /**
   * Opens request details editor in place of the request details applet.
   */
  _editRequestDetails() {
    const request = Object.assign({}, this._requestDetails.request);
    this._requestEditor.request = request;
    this._requestDetails.request = undefined;
    this.detailsOpened = false;
    this.editorOpened = true;
  }

  _cancelRequestEdit() {
    this.editorOpened = false;
  }

  /**
   * Closes editor when saving request
   */
  _saveRequestEdit() {
    this.editorOpened = false;
    this._requestEditor.request = undefined;
  }

  _resizeSheetContent(e) {
    const panel = e.target.querySelector(
        'saved-request-editor,saved-request-detail,project-details-editor');
    if (panel && panel.notifyResize) {
      panel.notifyResize();
    }
  }

  _updateExportFile() {
    this._exportOptions.file = this._generateFileName();
  }
  /**
   * Dispatches bubbling and composed custom event.
   * By default the event is cancelable until `cancelable` property is set to false.
   * @param {String} type Event type
   * @param {?any} detail A detail to set
   * @return {CustomEvent}
   */
  _dispatch(type, detail) {
    const e = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Handler for the `project-object-changed` event.
   * @param {CustomEvent} e
   * @return {Boolean} False if the event was not handled.
   */
  _projectChanged(e) {
    if (e.cancelable || !this.project) {
      return false;
    }
    const { project } = e.detail;
    if (this.project._id !== project._id) {
      return false;
    }
    this.project = project;
    this._updateExportFile();
    return true;
  }
  /**
   * Handler for `dragover` event on this element. If the dagged item is compatible
   * it renders drop message.
   * @param {DragEvent} e
   */
  _dragoverHandler(e) {
    if (!this.draggableEnabled || e.defaultPrevented) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.dataTransfer.dropEffect = this._computeProjectDropEffect(e);
    e.preventDefault();
  }
  /**
   * Handler for `drag` event on this element. If the dagged item is compatible
   * it adds request to saved requests.
   * @param {DragEvent} e
   */
  _dropHandler(e) {
    if (!this.draggableEnabled || e.defaultPrevented) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    const data = e.dataTransfer.getData('arc/request-object');
    if (!data) {
      return;
    }
    const request = JSON.parse(data);
    if (!request.projects) {
      request.projects = [];
    }
    const existing = this.requests;
    const order = existing && existing.length || 0;
    let forceRequestUpdate;
    const effect = this._computeProjectDropEffect(e);
    if (effect === 'move') {
      forceRequestUpdate = this._handleProjectMoveDrop(e, request);
    }
    this._insertRequestAt(order, request, forceRequestUpdate);
  }
  /**
   * Updates project and request objects and inserts the request at a position.
   * @param {Number} index The position in requests order
   * @param {Object} request Request to update
   * @param {Boolean} forceRequestUpdate Forces update on request object even
   * when position hasn't change.
   * @return {Promise}
   */
  async _insertRequestAt(index, request, forceRequestUpdate) {
    return await this._appendProjectRequest(this.project, request, {
      forceRequestUpdate,
      index
    });
  }

  _headerTemplate(project) {
    const { compatibility } = this;
    return html`<div class="title">
      <h2>${project.name || ''}</h2>
      <div class="header-actions">
        <anypoint-menu-button
          dynamicalign
          closeOnActivate
          id="mainMenu"
          ?compatibility="${compatibility}">
          <anypoint-icon-button
            aria-label="Activate to open context menu"
            slot="dropdown-trigger"
            ?compatibility="${compatibility}">
            <span class="icon">${moreVert}</span>
          </anypoint-icon-button>
          <anypoint-listbox
            slot="dropdown-content"
            id="mainMenuOptions"
            ?compatibility="${compatibility}">
            <anypoint-icon-item
              class="menu-item"
              data-action="toggle-edit"
              @click="${this.toggleEdit}">
              <span class="icon" slot="item-icon">${edit}</span>Edit details
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="export-all"
              @click="${this.openExportAll}">
              <span class="icon" slot="item-icon">${exportVariant}</span>Export project
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="delete-project"
              @click="${this._deleteProject}">
              <span class="icon" slot="item-icon">${clear}</span>Delete project
            </anypoint-icon-item>
          </anypoint-listbox>
        </anypoint-menu-button>
      </div>
    </div>`;
  }

  _descriptionTemplate(project) {
    const { compatibility } = this;
    if (project.description) {
      return html`<arc-marked .markdown="${project.description}">
        <div class="markdown-html markdown-body description-value"></div>
      </arc-marked>`
    }
    return html`<p class="description-value empty">
      No description <anypoint-button
        @click="${this.toggleEdit}"
        class="add-description"
        ?compatibility="${compatibility}">Add</anypoint-button>
    </p>`;
  }

  _listTemplate(project) {
    const {
      listType,
      draggableEnabled,
      compatibility,
      outlined
    } = this;
    return html`<project-requests-list
      .project="${project}"
      @delete="${this._deleteSelected}"
      @export="${this._onExportSelected}"
      @details="${this._onDetails}"
      .listType="${listType}"
      ?draggableEnabled="${draggableEnabled}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"></project-requests-list>`;
  }

  _requestDetailsTemplate() {
    const { detailsOpened, compatibility } = this;
    return html`<bottom-sheet
      id="requestDetailsContainer"
      data-open-property="detailsOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}"
      .opened="${detailsOpened}">
      <paper-fab
        icon="arc:keyboard-arrow-right"
        data-action="load-request-detail"
        title="Load request"
        @click="${this._loadRequestDetails}"></paper-fab>
      <saved-request-detail
        id="requestDetails"
        ?compatibility="${compatibility}"
        @delete-request="${this._deleteRequestDetails}"
        @edit-request="${this._editRequestDetails}"></saved-request-detail>
    </bottom-sheet>`;
  }

  _requestEditorTemplate() {
    const { editorOpened, compatibility, noAutoProjects } = this;
    return html`<bottom-sheet
      id="requestEditorContainer"
      data-open-property="editorOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}"
      .opened="${editorOpened}">
      <h3>Save history request</h3>
      <saved-request-editor
        id="requestEditor"
        ?compatibility="${compatibility}"
        ?noautoprojects="${noAutoProjects}"
        @cancel="${this._cancelRequestEdit}"
        @save-request="${this._saveRequestEdit}"></saved-request-editor>
    </bottom-sheet>`;
  }

  _exportOptionsTemplate() {
    const {
      _exportOptionsOpened,
      _exportOptions,
      compatibility,
      withEncrypt
    } = this;
    return html`<bottom-sheet
      id="exportOptionsContainer"
      .opened="${_exportOptionsOpened}"
      data-open-property="_exportOptionsOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}">
      <export-options
        ?compatibility="${compatibility}"
        ?withEncrypt="${withEncrypt}"
        .file="${_exportOptions.file}"
        .provider="${_exportOptions.provider}"
        .providerOptions="${_exportOptions.providerOptions}"
        @accept="${this._acceptExportOptions}"
        @cancel="${this._cancelExportOptions}"></export-options>
    </bottom-sheet>`;
  }

  _editProjectTemplate(project) {
    const {
      editOpened,
      compatibility,
      outlined
    } = this;
    return html`<bottom-sheet
      id="exportOptionsContainer"
      .opened="${editOpened}"
      data-open-property="editOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}">
      <h3>Edit project</h3>
      <project-details-editor
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        .name="${project.name}"
        .description="${project.description}"
        @cancel="${this._cancelEdit}"
        @save="${this._saveEdit}"></project-details-editor>
    </bottom-sheet>`;
  }

  _toastsTemplate() {
    return html`<paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="driveSaved" text="Requests saved on Google Drive."></paper-toast>
    <paper-toast id="deleteToast" duration="7000">
      <anypoint-button class="revert-button" @click="${this.revertDeleted}">Revert</anypoint-button>
    </paper-toast>`;
  }

  _clearDialogTemplate() {
    const {
      compatibility
    } = this;
    return html`<anypoint-dialog
      id="dataClearDialog"
      ?compatibility="${compatibility}"
      @overlay-closed="${this._deleteDialogResult}">
      <h2>Remove project and request data?</h2>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?compatibility="${compatibility}"
          data-action="delete-export-all"
          @click="${this._exportAllFile}">Create backup file</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-dismiss>Cancel</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-confirm
          class="action-button" autofocus>Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  render() {
    const project = this.project || {};
    return html`
    ${this.modelTemplate}
    ${this._headerTemplate(project)}
    ${this._descriptionTemplate(project)}
    ${this._listTemplate(project)}
    ${this._requestDetailsTemplate()}
    ${this._requestEditorTemplate()}
    ${this._exportOptionsTemplate()}
    ${this._editProjectTemplate(project)}
    ${this._toastsTemplate()}
    ${this._clearDialogTemplate()}`;
  }
  /**
   * Fired when navigation was requested
   *
   * @event navigate
   * @param {String} base The base route. It's always `request`
   * @param {String} type Type of the request to open. It's always `saved`
   * @param {String} id ID of the request to open.
   */
  /**
   * Fired when requests are to be deleted. Informs the model to delete items.
   *
   * @event request-objects-deleted
   * @param {Array} items List of ids to delete
   * @param {String} type Always `saved`
   */
  /**
   * Fired when the "revert" delete button has been used.
   * Informs the requests model to restore the data.
   *
   * @event request-objects-undeleted
   * @param {Array} items List of requests to delete
   * @param {String} type Always `saved`
   */
  /**
   * Fired when the project is to be exported.
   * See
   * https://github.com/advanced-rest-client/api-components-api/blob/master/docs/export-event.md
   * for more information.
   *
   * @event export-data
   */

}
