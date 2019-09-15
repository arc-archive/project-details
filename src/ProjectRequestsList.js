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
import { LitElement, html } from 'lit-element';
import { RequestsListMixin } from '@advanced-rest-client/requests-list-mixin/requests-list-mixin.js';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';
import { moreVert, exportVariant, deleteIcon } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@api-components/http-method-label/http-method-label.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
import { ProjectBase } from './ProjectBase.js';
import styles from './ListStyles.js';

export class ProjectRequestsWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}
/**
 * A list of requests in the project details view.
 *
 * The list doesn't offer any logic related to data models. Actions peformed
 * by the user have to be handled by event handlers and performed in
 * hosting application.
 *
 * Note: **All events fired by this element do not bubbles**.
 *
 * ### Example
 *
 * ```html
 * <project-requests-list items="[...]"></project-requests-list>
 * ```
 *
 * ```javascript
 * document.querySelector('project-requests-list')
 * .addEventListener('list-items-delete', function(e) {
 *  console.log('Items to delete:', e.detail.items);
 * });
 * ```
 *
 * ### Styling
 *
 * `<project-requests-list>` provides the following custom properties and
 * mixins for styling:
 *
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--project-requests-list-item-selected-background-color` | Background color of selected item | `#E0E0E0`
 * `--secondary-action-button-color` | Color of the secondary action button | `--primary-color`
 * `--primary-color` | Color of the secondary action buttons | ``
 * `--project-requests-list-item-dragging-background-color` | Item bg color when dragging | `#fff`
 * * `--context-menu-item-color` | Color of the dropdown menu items | ``
 * `--context-menu-item-background-color` | Background olor of the dropdown menu items | ``
 * `--context-menu-item-color-hover` | Color of the dropdown menu items when hovering | ``
 * `--context-menu-item-background-color-hover` | Background olor of the dropdown menu items when hovering | ``
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @demo demo/dnd.html Drag and drop
 * @appliesMixin RequestsListMixin
 */
export class ProjectRequestsList extends RequestsListMixin(ProjectBase) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * A project object related to the list of requests.
       * It is required property when using drag and drop.
       * When project object changes related `projectId` property also changes
       * and this triggest querying for requests list.
       */
      project: { type: Object },
      /**
       * Project's datastore ID.
       * When setting `project` property this ptoperty is updated automatically.
       */
      projectId: { type: String },
      /**
       * List of selected items on the list.
       * @type {Array<Object>}
       */
      selectedItems: { type: Array },
      /**
       * A list of indexes of the `requests` array that are currently selected.
       * @type {Array<Number>}
       */
      selectedIndexes: { type: Array },
      /**
       * True to select all elements on the list
       */
      allSelected: { type: Boolean }
    };
  }

  get _list() {
    if (!this.__list) {
      this.__list = this.shadowRoot.querySelector('.list');
    }
    return this.__list;
  }
  /**
   * If true, the user selected some elements on list. Check the
   * `this.selectedItems` property to check for the selected elements.
   */
  get hasSelection() {
    const items = this.selectedIndexes;
    return !!(items && items.length);
  }

  get selectedItems() {
    return this._selectedItems;
  }

  set selectedItems(value) {
    const old = this._selectedItems;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selectedItems = value;
    this.dispatchEvent(new CustomEvent('selecteditems-changed', {
      detail: {
        value
      }
    }));
  }

  get dataUnavailable() {
    const { hasRequests, querying } = this;
    return !hasRequests && !querying;
  }

  get projectId() {
    return this._projectId;
  }

  set projectId(value) {
    const old = this._projectId;
    if (old === value) {
      return;
    }
    this._projectId = value;
    if (this._isAttached) {
      this.loadRequests();
    }
  }

  get project() {
    return this._project;
  }

  set project(value) {
    const old = this._project;
    if (old === value) {
      return;
    }
    this._project = value;
    this.requestUpdate('project', old);
    const id = value && value._id;
    if (this.projectId !== id) {
      this.projectId = id;
    }
  }

  constructor() {
    super();
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'project';
    this._isAttached = true;
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
    if (this.projectId) {
      this.loadRequests();
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._isAttached = false;
    this._removeDndEvents();
  }

  _addDndEvents() {
    if (this.__dndAdded) {
      return;
    }
    this.__dndAdded = true;
    this.addEventListener('dragover', this._dragoverHandler);
    this.addEventListener('dragleave', this._dragleaveHandler);
    this.addEventListener('drop', this._dropHandler);
  }

  _removeDndEvents() {
    if (!this.__dndAdded) {
      return;
    }
    this.__dndAdded = false;
    this.removeEventListener('dragover', this._dragoverHandler);
    this.removeEventListener('dragleave', this._dragleaveHandler);
    this.removeEventListener('drop', this._dropHandler);
  }

  clearSelection() {
    const node = this._list;
    if (node) {
      node.selectedValues = [];
    }
  }

  loadRequests() {
    if (this.__loadDebouncer) {
      return;
    }
    this.__loadDebouncer = true;
    setTimeout(() => {
      this.__loadDebouncer = false;
      this._queryData();
    });
  }
  /**
   * Queries for the data when state or `projectId` changes
   */
  async _queryData() {
    const { projectId } = this;
    if (!projectId) {
      this.requests = undefined;
      return;
    }
    this.querying = true;
    try {
      this.requests = await this.readProjectRequests(projectId);
    } catch (e) {
      this._handleException(e.message);
    }
    this.querying = false;
  }
  /**
   * Informs hosting application to delete currently selected items.
   */
  _deleteSelected() {
    this._deselectMenu();
    const selected = this.selectedItems;
    if (!selected || !selected.length) {
      this._handleException('Select a project request first');
      return;
    }
    this.__deleteItems(selected);
  }
  /**
   * Dispatches `list-items-delete` event to inform hosting
   * application to remove items.
   * @param {Array<Object>} items List of items to delete
   * @return {CustomEvent}
   */
  __deleteItems(items) {
    const e = new CustomEvent('delete', {
      detail: {
        items
      }
    });
    this.dispatchEvent(e);
    return e;
  }

  /**
   * When selection is set it calls `_dispatchExport()` event with list
   * of items to export.
   */
  _onExportSelected() {
    this._deselectMenu();
    const selected = this.selectedItems;
    if (!selected || !selected.length) {
      this._handleException('Select a project request first');
      return;
    }
    this._dispatchExport(selected);
  }
  /**
   * Dispatches `list-items-export` event.
   * The event do not bubble.
   *
   * @param {Array<Object>} items List of items to export.
   * @return {CustomEvent} e
   */
  _dispatchExport(items) {
    const e = new CustomEvent('export', {
      detail: {
        items
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Closes list menu and resets its selection.
   */
  _deselectMenu() {
    setTimeout(() => {
      const menuOptions = this.shadowRoot.querySelector('#listMenuOptions');
      menuOptions.selected = null;
    });
  }
  /**
   * Handler for click action on the "open" button
   * @param {ClickEvent} e
   */
  _navigateItem(e) {
    e.preventDefault();
    e.stopPropagation();

    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const id = request._id;
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        base: 'request',
        type: 'saved',
        id
      }
    }));
  }
  // Called to request details panel for the list item
  _requestDetails(e) {
    e.stopPropagation();
    const index = Number(e.currentTarget.dataset.index);
    const item = this.requests[index];
    this.dispatchEvent(new CustomEvent('details', {
      detail: {
        item
      }
    }));
  }
  /**
   * Removes drop pointer from shadow root.
   */
  _removeDropPointer() {
    if (!this.__dropPointer) {
      return;
    }
    this.shadowRoot.removeChild(this.__dropPointer);
    this.__dropPointer = undefined;
  }
  /**
   * Adds drop pointer to shadow root.
   * @param {Element} ref A list item to be used as a reference point.
   */
  _createDropPointer(ref) {
    const rect = ref.getClientRects()[0];
    const div = document.createElement('div');
    div.className = 'drop-pointer';
    const ownRect = this.getClientRects()[0];
    let topPosition = rect.y - ownRect.y;
    // if (below) {
    //   topPosition += rect.height;
    // }
    topPosition -= 10; // padding
    div.style.top = topPosition + 'px';
    this.__dropPointer = div;
    this.shadowRoot.appendChild(div);
  }
  /**
   * Handler for `dragover` event on this element. If the dagged item is compatible
   * it renders drop message.
   * @param {DragEvent} e
   */
  _dragoverHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.dataTransfer.dropEffect = this._computeProjectDropEffect(e);
    e.preventDefault();
    const path = e.path || e.composedPath();
    const item = path.find((node) => node.nodeName === 'ANYPOINT-ICON-ITEM');
    if (!item) {
      return;
    }
    const rect = item.getClientRects()[0];
    const aboveHalf = (rect.y + rect.height/2) > e.y;
    const ref = aboveHalf ? item : item.nextElementSibling;
    if (!ref || this.__dropPointerReference === ref) {
      return;
    }
    this._removeDropPointer();
    this.__dropPointerReference = ref;
    this._createDropPointer(ref);
  }
  /**
   * Handler for `dragleave` event on this element.
   * @param {DragEvent} e
   */
  _dragleaveHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    this._removeDropPointer();
    this.__dropPointerReference = undefined;
  }
  /**
   * Handler for `drag` event on this element. If the dagged item is compatible
   * it adds request to saved requests.
   * @param {DragEvent} e
   */
  _dropHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    this._removeDropPointer();
    const dropRef = this.__dropPointerReference;
    this.__dropPointerReference = undefined;
    const data = e.dataTransfer.getData('arc/request-object');
    if (!data) {
      return;
    }
    const request = JSON.parse(data);
    if (!request.projects) {
      request.projects = [];
    }
    let order;
    if (dropRef) {
      order = Number(dropRef.dataset.index);
    } else {
      order = 0;
    }
    let forceRequestUpdate;
    const effect = this._computeProjectDropEffect(e);
    if (effect === 'move') {
      forceRequestUpdate = this._handleProjectMoveDrop(e, request);
    }
    this._insertRequestAt(order, request, forceRequestUpdate);
    this.clearSelection();
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
       index,
       forceRequestUpdate
     });
   }
  /**
   * Handler for the `dragstart` event added to the list item when `draggableEnabled`
   * is set to true.
   * This function sets request data on the `dataTransfer` object with `arc/request-object`
   * mime type. The request data is a serialized JSON with request model.
   * @param {Event} e
   */
  _dragStart(e) {
    if (!this.draggableEnabled) {
      return;
    }
    e.stopPropagation();
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/saved-request', request._id);
    e.dataTransfer.setData('arc-source/project-detail', this.projectId);
    e.dataTransfer.effectAllowed = 'copyMove';
  }

  _selectedHandler(e) {
    /* istanbul ignore next */
    const value = e.detail.value || [];
    this.selectedIndexes = value;
    const requests = this.requests;
    this.selectedItems = value.map((i) => requests[i]);
  }

  /**
   * Toggles selection of of all itmes on the list.
   * @param {Event} e
   */
  _toggleSelectAll(e) {
    const allSelected = e.target.checked;
    const items = this.requests || [];
    const len = items.length;
    const list = this._list;
    const initialSelected = Array.from(this.selectedIndexes || []);
    for (let i = len - 1; i >= 0; i--) {
      if (allSelected && initialSelected.indexOf(i) === -1) {
        list.selectIndex(i);
      } else if (!allSelected && initialSelected.indexOf(i) !== -1) {
        list.selectIndex(i);
      }
    }
  }

  _searchHandler(e) {
    const query = e.target.value;
    if (!query) {
      this.requests = this.__beforeQuery;
      this.__beforeQuery = undefined;
      this.clearSelection();
      return;
    }
    const items = this.__beforeQuery || this.requests || [];
    if (!this.__beforeQuery) {
      this.__beforeQuery = items;
    }
    this.keyword = query;
    this.requests = items.filter(this._filterView.bind(this));
    this.clearSelection();
  }

  /**
   * Filter function for the table.
   * @param {Object} item Request item.
   * @return {Boolean} True when the item should be rendered given current `keyword`.
   */
  _filterView(item) {
    if (!item) {
      return false;
    }
    let keyword = this.keyword;
    if (!keyword || typeof keyword !== 'string') {
      return true;
    }
    keyword = keyword.toLowerCase();
    if (item.url && item.url.toLowerCase().indexOf(keyword) !== -1) {
      return true;
    }
    if (item.method && item.method.toLowerCase().indexOf(keyword) !== -1) {
      return true;
    }
    if (item.name && item.name.toLowerCase().indexOf(keyword) !== -1) {
      return true;
    }
    return false;
  }

  _toastsTemplate() {
    return html`
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>`;
  }

  _headerTemplate() {
    const { hasSelection, compatibility, outlined } = this;
    return html`
    <section class="table-options">
      <anypoint-checkbox
        class="select-all"
        @checked-changed="${this._toggleSelectAll}"
        title="Select / deselect all"
        aria-label="Activate to toggle selection on the list"
      ></anypoint-checkbox>
      ${hasSelection ? this._selectionTemplate() : ''}
      <div class="spacer"></div>
      <div class="search">
        <anypoint-input
          type="search"
          nolabelfloat
          @search="${this._searchHandler}"
          ?compatibility="${compatibility}"
          ?outlined="${outlined}">
          <label slot="label">Search</label>
        </anypoint-input>
      </div>
    </section>`;
  }

  _selectionTemplate() {
    const selectedItems = this.selectedItems || [];
    const { compatibility } = this;
    return html`
    <span class="selected-counter">${selectedItems.length} item(s) selected</span>
    <div class="selected-actions">
      <anypoint-menu-button
        dynamicalign
        closeOnActivate
        id="listMenu"
        ?compatibility="${compatibility}">
        <anypoint-icon-button
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?compatibility="${compatibility}">
          <span class="icon">${moreVert}</span>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          id="listMenuOptions"
          ?compatibility="${compatibility}">
          <anypoint-icon-item
            class="menu-item"
            data-action="export-selected"
            @click="${this._onExportSelected}">
            <span class="icon" slot="item-icon">${exportVariant}</span>Export selected
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="delete-selected"
            @click="${this._deleteSelected}">
            <span class="icon" slot="item-icon">${deleteIcon}</span>Delete selected
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>`;
  }

  _unavailableTemplate() {
    return html`<div class="empty-message">
      <p class="empty-info">This project has no requests.</p>
    </div>`;
  }

  _listTemplate() {
    const items = this.requests || [];
    const selected = this.selectedIndexes || [];
    const { draggableEnabled, _hasTwoLines, compatibility } = this;
    return items.map((item, index) => html`
      <anypoint-icon-item
        data-index="${index}"
        data-id="${item._id}"
        class="request-list-item"
        draggable="${draggableEnabled ? 'true' : 'false'}"
        @dragstart="${this._dragStart}"
        tabindex="-1"
        role="option"
        ?compatibility="${compatibility}">
        <anypoint-checkbox
          slot="item-icon"
          .checked="${selected.indexOf(index) !== -1}"
          aria-label="Select or unselect this request"></anypoint-checkbox>
        <http-method-label
          method="${item.method}"
          title="${item.method}"></http-method-label>
        <anypoint-item-body
          ?twoline="${_hasTwoLines}"
          ?compatibility="${compatibility}">
          ${this._listItemDetailsTemplate(item)}
        </anypoint-item-body>
        <anypoint-button
          data-index="${index}"
          class="list-action-button list-secondary-action"
          data-action="item-detail"
          ?compatibility="${compatibility}"
          @click="${this._requestDetails}"
          title="Open request details dialog">Details</anypoint-button>
        <anypoint-button
          data-index="${index}"
          class="list-action-button list-main-action"
          data-action="open-item"
          @click="${this._navigateItem}"
          ?compatibility="${compatibility}"
          emphasis="high"
          title="Open request in the workspace">Open</anypoint-button>
      </anypoint-icon-item>`);
  }

  _listItemDetailsTemplate(item) {
    return html`<div class="url-label select-text">${item.url}</div>
    <div secondary class="name select-text">${item.name}</div>`;
  }

  render() {
    const { dataUnavailable } = this;
    return html`
    ${this.modelTemplate}
    ${this._headerTemplate()}
    ${dataUnavailable ?
      this._unavailableTemplate() :
      html`<project-requests-wrapper
        class="list"
        selectable="anypoint-icon-item"
        multi
        role="listbox"
        aria-label="Select requests from the list"
        useAriaSelected
        @selectedvalues-changed="${this._selectedHandler}">
        ${this._listTemplate()}
      </project-requests-wrapper>`}
    ${this._toastsTemplate()}`;
  }
  /**
   * Fired when the user clicked on a delete button on an item.
   * This event does not bubbles.
   *
   * @event list-items-delete
   * @param {Array} items A list of items to delete.
   */
  /**
   * Fired when the user clicked on an open button on an item.
   * This event does not bubbles.
   *
   * @event list-item-open
   * @param {Object} item An object associated with this item.
   */
  /**
   * Dispatched when the user requested to export selected items.
   * This event does not bubbles.
   *
   * @event list-items-export
   * @param {Array} items List of request objects requested to be exported.
   */
  /**
   * Fired when the "request details" has been requested via this UI.
   * @event list-item-details
   * @param {Object} item An object associated with this item.
   */
}
