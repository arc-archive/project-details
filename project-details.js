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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import '../../@advanced-rest-client/project-requests-list/project-requests-list.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-menu-button/paper-menu-button.js';
import '../../@polymer/paper-listbox/paper-listbox.js';
import '../../@polymer/paper-item/paper-icon-item.js';
import '../../@polymer/paper-dialog/paper-dialog.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '../../@advanced-rest-client/saved-request-detail/saved-request-detail.js';
import '../../@advanced-rest-client/saved-request-editor/saved-request-editor.js';
import '../../@polymer/paper-fab/paper-fab.js';
import '../../@polymer/marked-element/marked-element.js';
import '../../@advanced-rest-client/markdown-styles/markdown-styles.js';
import '../../@advanced-rest-client/export-options/export-options.js';
import '../../@polymer/paper-styles/shadow.js';
import '../../@advanced-rest-client/uuid-generator/uuid-generator.js';
import './project-details-editor.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
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
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @demo demo/dnd.html Drag and drop
 */
class ProjectDetails extends PolymerElement {
  static get template() {
    return html`
    <style include="markdown-styles"></style>
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
      @apply --project-details;
    }

    [hidden] {
      display: none !important;
    }

    .revert-button {
      height: 38px;
    }

    .title {
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --project-details-header;
    }

    h2 {
      @apply --arc-font-headline;
      display: inline-block;
    }

    h3 {
      @apply --arc-font-subhead;
    }

    .menu-item iron-icon {
      color: var(--context-menu-item-color);
    }

    .menu-item {
      color: var(--context-menu-item-color);
      background-color: var(--context-menu-item-background-color);
      cursor: pointer;
    }

    .menu-item:hover {
      color: var(--context-menu-item-color-hover);
      background-color: var(--context-menu-item-background-color-hover);
    }

    .menu-item:hover iron-icon {
      color: var(--context-menu-item-color-hover);
    }

    .description {
      margin-bottom: 24px;
      @apply --project-details-description-container;
    }

    .description-value {
      @apply --arc-font-body1;
      color: var(--project-details-description-color, rgba(0, 0, 0, 0.74));
      max-width: var(--project-details-description-max-width, 700px);
      @apply --project-details-description;
    }

    .description-value.empty {
      @apply --empty-info;
      @apply --project-details-description-empty;
    }

    .add-description {
      color: var(--project-details-description-button-color, var(--primary-color));
    }

    .primary-button {
      background-color: var(--primary-color);
      color: #fff;
    }

    project-details-editor,
    .export-options-form {
      margin: 0 16px 24px 0px;
    }

    .export-options-form {
      margin-bottom: 0;
    }

    bottom-sheet {
      width: var(--bottom-sheet-width, 100%);
      max-width: var(--bottom-sheet-max-width, 700px);
      right: var(--project-details-bottom-sheet-right, 40px);
      left: var(--project-details-bottom-sheet-left, auto);
      @apply --project-details-bottom-sheet;
    }

    .detail-sheet paper-fab {
      position: absolute;
      right: 16px;
      top: -28px;
      --paper-fab-background: var(--project-details-fab-background-color, var(--primary-color));
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
      @apply --error-toast;
    }

    #projectDeleteDialog {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    #projectDeleteDialog paper-button {
      color: var(--warning-dialog-button-color, #fff);
      background-color: var(--warning-dialog-button-background-color, transparent);
    }

    marked-element {
      margin-top: 20px;
    }
    </style>
    <div class="title">
      <h2>[[project.name]]</h2>
      <paper-menu-button>
        <paper-icon-button slot="dropdown-trigger" icon="arc:more-vert"></paper-icon-button>
        <paper-listbox slot="dropdown-content" id="contextMenu">
          <paper-icon-item class="menu-item" on-click="toggleEdit"><iron-icon icon="arc:edit" slot="item-icon"></iron-icon>Edit</paper-icon-item>
          <paper-icon-item class="menu-item" on-click="openExportAll"><iron-icon icon="arc:export-variant" slot="item-icon"></iron-icon>Export project</paper-icon-item>
          <paper-icon-item class="menu-item" on-click="_deleteProject"><iron-icon icon="arc:clear" slot="item-icon"></iron-icon>Delete</paper-icon-item>
        </paper-listbox>
      </paper-menu-button>
    </div>
    <div class="description">
      <template is="dom-if" if="[[project.description]]">
        <marked-element markdown="[[project.description]]">
          <div class="markdown-html markdown-body description-value"></div>
        </marked-element>
      </template>
      <template is="dom-if" if="[[!project.description]]">
        <p class="description-value empty">No description <paper-button on-click="toggleEdit" class="add-description">Add</paper-button></p>
      </template>
    </div>

    <project-requests-list hidden\$="[[!_hasRequests]]" has-requests="{{_hasRequests}}" project="[[project]]" on-list-items-delete="_onDelete" on-list-item-open="_onOpen" on-list-items-export="_onExport" on-list-item-details="_onDetails" list-type="[[listType]]" draggable-enabled="[[draggableEnabled]]"></project-requests-list>

    <template is="dom-if" if="[[!_hasRequests]]">
      <p class="no-requests">This project has no requests. <paper-button on-click="_deleteEmpty" class="primary-button" raised="">Delete project</paper-button></p>
    </template>

    <paper-toast id="noModel" class="error-toast" text="Model not found. Please, report an issue."></paper-toast>
    <paper-toast id="revertError" class="error-toast" text="Unable to revert changes. Please, report an issue."></paper-toast>
    <paper-toast id="reorderError" class="error-toast" text="Unable to reorder items. Please, report an issue."></paper-toast>
    <paper-toast id="noExport" class="error-toast" text="Export module not found. Please, report an issue."></paper-toast>
    <paper-toast id="exportError" class="error-toast"></paper-toast>
    <paper-toast id="driveSaved" text="Project saved on Google Drive."></paper-toast>
    <paper-toast id="modelError" class="error-toast"></paper-toast>

    <paper-toast id="deleteToast" duration="10000">
      <paper-button class="revert-button" on-click="revertDeleted">Revert</paper-button>
    </paper-toast>
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>

    <bottom-sheet class="detail-sheet" opened="{{detailsOpened}}" on-iron-overlay-opened="_resizeSheetContent">
      <paper-fab icon="arc:keyboard-arrow-right" data-action="load-request-detail" title="Load request" on-click="_openRequestDetails"></paper-fab>
      <saved-request-detail id="requestDetails" on-delete-request="_deleteRequestDetails" on-edit-request="_editRequestDetails"></saved-request-detail>
    </bottom-sheet>

    <bottom-sheet opened="{{editorOpened}}" on-iron-overlay-opened="_resizeSheetContent">
      <saved-request-editor id="requestEditor" no-auto-projects="[[noAutoProjects]]" on-cancel-request-edit="_cancelRequestEdit" on-save-request="_saveRequestEdit"></saved-request-editor>
    </bottom-sheet>

    <bottom-sheet opened="{{edit}}" on-iron-overlay-opened="_resizeSheetContent">
      <h3>Edit project</h3>
      <project-details-editor name="[[project.name]]" description="[[project.description]]" on-cancel-edit="_cancelEdit" on-save-edit="_saveEdit"></project-details-editor>
    </bottom-sheet>

    <bottom-sheet opened="{{_exportOptionsOpened}}" on-iron-overlay-opened="_resizeSheetContent">
      <export-options file="{{_exportOptions.file}}" provider="{{_exportOptions.provider}}" provider-options="{{_exportOptions.providerOptions}}" on-accept="_acceptExportOptions" on-cancel="_cancelExportOptions"></export-options>
    </bottom-sheet>

    <paper-dialog id="projectDeleteDialog" on-iron-overlay-closed="_deleteDialogResult">
      <h2>Danger zone</h2>
      <p>This will remove the project and all request data associated with the project.</p>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <paper-button on-click="_exportAllFile">Create backup file</paper-button>
        <paper-button dialog-dismiss="" autofocus="">Cancel</paper-button>
        <paper-button dialog-confirm="" class="action-button">Destroy</paper-button>
      </div>
    </paper-dialog>
`;
  }

  static get is() {
    return 'project-details';
  }
  static get properties() {
    return {
      /**
       * Project datastore ID to display.
       */
      projectId: {
        type: String,
        observer: '_projectIdChanged'
      },
      /**
       * Retreived from the data store project data.
       */
      project: Object,
      /**
       * Set to true to enable project editor.
       */
      edit: {
        type: Boolean,
        value: false
      },
      _hasRequests: Boolean,
      /**
       * True when the project data are being loaded
       */
      loadingProject: {
        type: Boolean,
        notify: true,
        readOnly: true
      },
      // List of requests that has been recently removed
      _latestDeleted: Array,
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
       * Enables the comonent to accept drop action with a request.
       */
      draggableEnabled: {type: Boolean, observer: '_draggableChanged'},
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: Boolean,
      _exportOptions: {
        type: Object,
        value: function() {
          return {
            file: this._generateFileName(),
            provider: 'file',
            providerOptions: {
              parents: ['My Drive']
            }
          };
        }
      }
    };
  }

  static get observers() {
    return [
      '_updateExportFile(project.name)'
    ];
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
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.type) {
      this.type = 'project';
    }
    window.addEventListener('project-object-deleted', this._projectDeleteHandler);
    window.addEventListener('project-object-changed', this._projectChanged);
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('project-object-deleted', this._projectDeleteHandler);
    window.removeEventListener('project-object-changed', this._projectChanged);
    this._removeDndEvents();
  }

  _draggableChanged(value) {
    if (value) {
      this._addDndEvents();
    } else {
      this._removeDndEvents();
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

  _navigate(detail) {
    return this._dispatch('navigate', detail);
  }

  _dispatchProjectRead(id) {
    return this._dispatch('project-read', {
      id
    });
  }

  _dispatchRequestRead(id) {
    return this._dispatch('request-project-list', {
      id
    });
  }
  /**
   * Updates project info when `projectId` changed.
   * @param {String} projectId Project data store id.
   * @return {Promise}
   */
  _projectIdChanged(projectId) {
    this.project = undefined;
    if (!projectId) {
      return;
    }
    let p;
    const e = this._dispatchProjectRead(projectId);
    if (!e.defaultPrevented) {
      p = Promise.reject(new Error(`project-read event not handled`));
    } else {
      p = e.detail.result;
    }
    this._setLoadingProject(true);
    return p.then((project) => {
      this.project = project;
      this._setLoadingProject(false);
    })
    .catch((cause) => {
      this._errorToast(cause.message);
      console.warn(cause);
      this._setLoadingProject(false);
    });
  }

  _errorToast(message) {
    this.$.modelError.text = message;
    this.$.modelError.opened = true;
  }
  // Handles the `list-item-open` event to open a request.
  _onOpen(e) {
    const request = e.detail.item;
    this._navigate({
      base: 'request',
      type: 'saved',
      id: request._id
    });
  }
  // Handles items delete event.
  _onDelete(e) {
    const data = e.detail.items;
    return this._delete(data);
  }

  // Deletes a request from the details panel.
  _deleteRequestDetails() {
    const data = [this.$.requestDetails.request];
    this.detailsOpened = false;
    return this._delete(data);
  }
  /**
   * Performs a delete action of request items.
   *
   * @param {Array<Object>} deleted List of deleted items.
   * @param {?Object} opts If `skipRevert` is true it ignores "revert" logic
   * @return {Promise}
   */
  _delete(deleted, opts) {
    opts = opts || {};
    const delCopy = deleted.map((item) => Object.assign({}, item));
    const e = new CustomEvent('request-objects-deleted', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        items: deleted.map((item) => item._id),
        type: 'saved'
      }
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error(`Model event not handled.`));
    }
    return e.detail.result
    .then((updated) => {
      if (opts.skipRevert) {
        return;
      }
      return this._updateDeletedRevs(delCopy, updated);
    })
    .then((deleted) => {
      if (opts.skipRevert) {
        return;
      }
      this._latestDeleted = deleted;
      let msg;
      if (deleted.length === 1) {
        msg = 'The request has been removed.';
      } else {
        msg = deleted.length + ' requests has been removed.';
      }
      this.$.deleteToast.text = msg;
      this.$.deleteToast.opened = true;
    });
  }
  /**
   * Updates `_rev` property after the item was deleted.
   * @param {Array<Object>} deleted List of deleted requests to be updated.
   * @param {Object} updateResult Request model response to delete request.
   * @return {Array<Object>} List of requests with updated `_rev`
   */
  _updateDeletedRevs(deleted, updateResult) {
    const result = [];
    const keys = Object.keys(updateResult);
    const delLen = deleted.length;
    for (let i = 0, len = keys.length; i < len; i++) {
      const id = keys[i];
      let newRev = updateResult[id];
      for (let j = 0; j < delLen; j++) {
        if (deleted[j]._id === id) {
          deleted[j]._rev = newRev;
          result[result.length] = deleted[j];
          break;
        }
      }
    }
    return result;
  }
  /**
   * Restores removed requests.
   * It does nothing if `_latestDeleted` is not set or empty.
   *
   * @return {Promise}
   */
  revertDeleted() {
    this.$.deleteToast.opened = false;
    const deleted = this._latestDeleted;
    if (!deleted || !deleted.length) {
      return Promise.resolve();
    }
    const e = this._dispatchUndelete(deleted);
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('Unable to revert. No model.'));
    }
    return e.detail.result
    .catch((cause) => {
      this.$.revertError.opened = true;
      console.warn(cause);
    });
  }
  /**
   * Dispatches `request-objects-undeleted` event.
   * @param {Array<Object>} items List of deleted requests. The list
   * contains objects with `_id` and `_rev` properties.
   * @return {CustomEvent}
   */
  _dispatchUndelete(items) {
    const e = new CustomEvent('request-objects-undeleted', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        type: 'saved',
        items
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Forces main menu to close.
   */
  _closeMainMenu() {
    this.$.contextMenu.selected = -1;
    this.$.contextMenu.parentElement.opened = false;
  }
  /**
   * Toggles export options panel and sets export items to all currently loaded requests.
   */
  openExportAll() {
    this._closeMainMenu();
    this._exportOptionsOpened = !this._exportOptionsOpened;
    this._exportItems = this.requests;
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
    this._exportItems = undefined;
  }

  _onExport(e) {
    this._exportOptionsOpened = true;
    this._exportItems = e.detail.items || [];
  }
  /**
   * Creates export file for all items.
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        kind: 'ARC#ProjectExport',
        provider: 'file'
      }
    };
    return this._doExportItems(this.requests, detail);
  }
  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const detail = e.detail;
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
  _doExportItems(requests, detail) {
    detail.options.kind = 'ARC#ProjectExport';
    const project = this._projectForRequests(requests);
    const request = this._dispatchExportData(requests, project, detail);
    return request.detail.result
    .then(() => {
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.$.driveSaved.opened = true;
      }
      this._exportItems = undefined;
    })
    .catch((cause) => {
      this.$.errorToast.text = cause.message;
      this.$.errorToast.opened = true;
      console.warn(cause);
    });
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
      name = 'arc-project-export.json';
    } else {
      name = name.toLowerCase().replace(/\s/g, '-');
      if (name[name.length - 1] !== '.') {
        name += '.';
      }
      name += 'json';
    }
    return name;
  }
  /**
   * Updates requests in bulk opeartion.
   * @param {Array<Object>} items Requests list.
   * @return {Promise}
   */
  _updateBulk(items) {
    const promises = items.map((item) => this._updateRequest(item));
    return Promise.all(promises);
  }
  /**
   * Sends the `request-object-changed` custom event for each request on the list.
   * @param {Object} item Request object.
   * @return {Promise} Promise resolved when the request object is updated.
   */
  _updateRequest(item) {
    const e = new CustomEvent('request-object-changed', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        type: 'saved',
        request: item
      }
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      return Promise.reject(new Error('Model not found'));
    }
    return e.detail.result;
  }

  // Toogles project details editor
  toggleEdit() {
    this.edit = !this.edit;
    this._closeMainMenu();
  }
  // Handler to project edit cancel event
  _cancelEdit() {
    this.edit = false;
  }
  // Handler to project edit save event
  _saveEdit(e) {
    const name = e.detail.name;
    const description = e.detail.description;
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
      this.edit = false;
      return;
    }
    this.edit = false;
    return this._dispatchProjectUpdate(project);
  }
  /**
   * Dispatches `project-object-changed` event to inform model to update
   * the data.
   *
   * @param {Object} project Data to store.
   * @return {Promise}
   */
  _dispatchProjectUpdate(project) {
    const e = this._dispatch('project-object-changed', {
      project
    });
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('Model event not handled.'));
    }
    return e.detail.result;
  }
  /**
   * Handler for the `project-object-deleted` event.
   * @param {CustomEvent} e
   */
  _projectDeleteHandler(e) {
    if (e.composedPath()[0] === this || e.cancelable) {
      return;
    }
    if (e.detail.id !== this.projectId) {
      return;
    }
    this.set('project', undefined);
  }
  /**
   * Deletes the project when there's no requests associated with it.
   * This function doesn't ask for confirmation.
   *
   * @return {Promise}
   */
  _deleteEmpty() {
    return this._notifyDeleteProject()
    .then(() => {
      this._navigate({
        base: 'default'
      });
    });
  }
  /**
   * Opens the warning dialog to delete the project.
   */
  _deleteProject() {
    this.$.projectDeleteDialog.opened = true;
    this._closeMainMenu();
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
  _deleteDialogResult(e) {
    if (e.detail.canceled || !e.detail.confirmed) {
      return Promise.resolve();
    }
    let requests = this.requests;
    if (!requests) {
      requests = [];
    }
    const projectId = this.project._id;
    const deleteRequests = [];
    const updateRequests = [];
    requests.forEach((item) => {
      if (!item.projects || item.projects.length === 1) {
        deleteRequests[deleteRequests.length] = item;
      } else if (item.projects) {
        const index = item.projects.indexOf(projectId);
        if (index !== -1) {
          item.projects.splice(index, 1);
          updateRequests[updateRequests.length] = item;
        }
      }
    });
    let p;
    if (updateRequests.length) {
      p = this._updateBulk(updateRequests);
    } else {
      p = Promise.resolve();
    }
    return p
    .then(() => this._delete(deleteRequests, {skipRevert: true}))
    .then(() => this._notifyDeleteProject());
  }
  /**
   * Dispatches `project-object-deleted` event to remove the project.
   * @return {Promise}
   */
  _notifyDeleteProject() {
    const e = new CustomEvent('project-object-deleted', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        id: this.project._id
      }
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('No model found.'));
    }
    return e.detail.result;
  }

  /**
   * Opens the request details applet with the request.
   *
   * @param {CustomEvent} e
   */
  _onDetails(e) {
    const request = e.detail.item;
    this.$.requestDetails.request = request;
    this.detailsOpened = true;
  }
  /**
   * Fires `navigate` event for currently loaded in the details request.
   */
  _openRequestDetails() {
    this._navigate({
      base: 'request',
      type: 'saved',
      id: this.$.requestDetails.request._id
    });
    this.detailsOpened = false;
  }

  /**
   * Opens request details editor in place of the request details applet.
   */
  _editRequestDetails() {
    this.$.requestEditor.request = this.$.requestDetails.request;
    this.$.requestDetails.request = undefined;
    this.detailsOpened = false;
    this.editorOpened = true;
  }

  _resizeSheetContent(e) {
    const panel = e.target.querySelector(
        'saved-request-editor,saved-request-detail,project-details-editor');
    if (panel && panel.notifyResize) {
      panel.notifyResize();
    }
  }

  _cancelRequestEdit() {
    this.editorOpened = false;
    this.$.requestEditor.request = undefined;
  }

  /**
   * Closes editor when saving request
   */
  _saveRequestEdit() {
    this.editorOpened = false;
    this.$.requestEditor.request = undefined;
  }

  _updateExportFile() {
    this.set('_exportOptions.file', this._generateFileName());
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
    if (e.cancelable || !this.project || e.composedPath()[0] === this) {
      return false;
    }
    const {project} = e.detail;
    if (this.project._id !== project._id) {
      return false;
    }
    this.project = project;
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
    e.dataTransfer.dropEffect = this._computeDropEffect(e);
    e.preventDefault();
  }
  /**
   * Computes value fro `dropEffect` property of the `DragEvent`.
   * @param {DragEvent} e
   * @return {String} Either `copy` or `move`.
   */
  _computeDropEffect(e) {
    let allowed = e.dataTransfer.effectAllowed;
    if (!allowed) {
      // this 2 operations are supported here
      allowed = 'copyMove';
    }
    allowed = allowed.toLowerCase();
    const isHistory = e.dataTransfer.types.indexOf('arc/history-request') !== -1;
    if ((e.ctrlKey || e.metaKey) && !isHistory && allowed.indexOf('move') !== -1) {
      return 'move';
    } else {
      return 'copy';
    }
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
    const effect = this._computeDropEffect(e);
    if (effect === 'move') {
      forceRequestUpdate = this._handleMoveDrop(e, request);
    }
    this._insertRequestAt(order, request, forceRequestUpdate);
  }
  /**
   * Handles logic when drop event is `move` in effect.
   * Removes reference to old project (if exists). It uses `arc-source/project-detail`
   * data from event which should hold project ID.
   * @param {DragEvent} e
   * @param {Object} request Request object
   * @return {Boolean} True if the request object changed.
   */
  _handleMoveDrop(e, request) {
    let projectId;
    if (e.dataTransfer.types.indexOf('arc-source/project-menu') !== -1) {
      projectId = e.dataTransfer.getData('arc-source/project-menu');
    } else if (e.dataTransfer.types.indexOf('arc-source/project-detail') !== -1) {
      projectId = e.dataTransfer.getData('arc-source/project-detail');
    }
    if (!projectId) {
      return false;
    }
    const index = request.projects.indexOf(projectId);
    if (index !== -1) {
      request.projects.splice(index, 1);
      return true;
    }
    return false;
  }
  /**
   * Updates project and request objects and inserts the request at a position.
   * @param {Number} index The position in requests order
   * @param {Object} request Request to update
   * @param {Boolean} forceRequestUpdate Forces update on request object even
   * when position hasn't change.
   * @return {Promise}
   */
  _insertRequestAt(index, request, forceRequestUpdate) {
    if (request.type === 'history') {
      delete request._rev;
      const gen = document.createElement('uuid-generator');
      request._id = gen.generate();
    }
    if (!request.name) {
      request.name = 'Unnamed';
    }
    const project = this.project;
    const id = request._id;
    if (!project.requests) {
      project.requests = [id];
    } else {
      const currentIndex = project.requests.indexOf(id);
      if (currentIndex !== -1) {
        project.requests.splice(currentIndex, 1);
      }
      project.requests.splice(index, 0, id);
    }
    if (!request.projects) {
      request.projects = [];
    }
    let requestChanged = false;
    if (request.projects.indexOf(project._id) === -1) {
      request.projects.push(project._id);
      requestChanged = true;
    }
    return this._dispatchProjectUpdate(project)
    .then(() => {
      if (requestChanged || forceRequestUpdate) {
        const e = this._dispatch('save-request', {
          request
        });
        return e.detail.result;
      }
    })
    .catch((cause) => {
      console.warn(cause);
    });
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
window.customElements.define(ProjectDetails.is, ProjectDetails);
