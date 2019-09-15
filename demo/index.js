import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-data-export/arc-data-export.js';
import '@advanced-rest-client/arc-menu/history-menu.js';
import '@advanced-rest-client/arc-menu/projects-menu.js';
import '@advanced-rest-client/arc-menu/saved-menu.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../project-details.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'draggableEnabled',
      'compatibility',
      'outlined',
      'listType',
      'dropValue',
      'exportSheetOpened',
      'exportFile',
      'exportData',
      'projectId'
    ]);
    this._componentName = 'project-details';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._listTypeHandler = this._listTypeHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);
    this._selectProject = this._selectProject.bind(this);

    window.addEventListener('file-data-save', this._fileExportHandler.bind(this));
    window.addEventListener('google-drive-data-save', this._fileExportHandler.bind(this));
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  async generateData() {
    await DataGenerator.insertSavedRequestData({
      projectsSize: 10,
      requestsSize: 200
    });
    await DataGenerator.insertHistoryRequestData({
      requestsSize: 100
    });
    const e = new CustomEvent('data-imported', {
      detail: {},
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteData() {
    await DataGenerator.destroySavedRequestData();
    const e = new CustomEvent('datastore-destroyed', {
      detail: {
        datastore: 'all'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _dragoverHandler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  }

  _dragleaveHandler(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  _dragEnterHandler(e) {
    e.currentTarget.classList.add('drag-over');
  }

  _dropHandler(e) {
    e.preventDefault();
    let data;
    if (e.dataTransfer.types.indexOf('arc/request-object') !== -1) {
      data = e.dataTransfer.getData('arc/request-object');
    } else if (e.dataTransfer.types.indexOf('arc/project-object') !== -1) {
      data = e.dataTransfer.getData('arc/project-object');
    }
    // format data
    if (data) {
      data = JSON.parse(data);
      console.log(data);
      data = JSON.stringify(data, null, 2);
    } else {
      data = '';
    }
    this.dropValue = data;
    e.currentTarget.classList.remove('drag-over');
  }

  _fileExportHandler(e) {
    const { content, file } = e.detail;
    setTimeout(() => {
      this.exportData = JSON.stringify(JSON.parse(content), null, 2);
      this.exportFile = file;
      this.exportSheetOpened = true;
    });
    e.preventDefault();
    e.detail.result = Promise.resolve({
      id: 'demo-drive-insert'
    });
  }

  _exportOpenedChanged(e) {
    this.exportSheetOpened = e.detail.value;
  }

  _selectProject(e) {
    const { base, id } = e.detail;
    if (base !== 'project') {
      return;
    }
    this.projectId = id;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      draggableEnabled,
      compatibility,
      outlined,
      listType,
      dropValue,
      exportSheetOpened,
      exportData,
      exportFile,
      projectId
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the saved requests panel element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <div class="menus-wrapper" slot="content">
            <div class="menu-item">
              <projects-menu
                ?draggableEnabled="${draggableEnabled}"
                ?compatibility="${compatibility}"
                .listType="${listType}"
                @navigate="${this._selectProject}"
              ></projects-menu>
            </div>

            ${draggableEnabled ? html`<div class="menu-item">
              <h4>History menu</h4>
              <history-menu .listType="${listType}" ?compatibility="${compatibility}"  draggableenabled></history-menu>
            </div>` : ''}

            <div class="menu-item">
              ${draggableEnabled ? html`<h4>Saved screen</h4>` : ''}
              <project-details
                ?draggableEnabled="${draggableEnabled}"
                ?compatibility="${compatibility}"
                ?outlined="${outlined}"
                .listType="${listType}"
                .projectId="${projectId}"></project-details>
            </div>
          </div>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="draggableEnabled"
            @change="${this._toggleMainOption}"
            >Draggable</anypoint-checkbox
          >

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
            selectable="anypoint-radio-button"
            aria-labelledby="listTypeLabel"
          >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              checked
              name="default"
              >Default</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="comfortable"
              >Comfortable</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="compact"
              >Compact</anypoint-radio-button
            >
          </anypoint-radio-group>
        </arc-interactive-demo>

        ${draggableEnabled ? html`
        <section
          class="drop-target"
          @dragover="${this._dragoverHandler}"
          @dragleave="${this._dragleaveHandler}"
          @dragenter="${this._dragEnterHandler}"
          @drop="${this._dropHandler}">
          Drop request here
          ${dropValue ? html`<output>${dropValue}</output>` : ''}
        </section>` : ''}

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Destroy data</anypoint-button>
        </div>

      <bottom-sheet
        .opened="${exportSheetOpened}"
        @opened-changed="${this._exportOpenedChanged}">
        <h3>Export demo</h3>
        <p>This is a preview of the file. Normally export module would save this data to file / Drive.</p>
        <p>File: ${exportFile}</p>
        <pre>${exportData}</pre>
      </bottom-sheet>

      <arc-data-export appversion="demo-page"></arc-data-export>
      <paper-toast id="genToast" text="The request data has been generated"></paper-toast>
      <paper-toast id="delToast" text="The request data has been removed"></paper-toast>
      <paper-toast id="navToast" text="Navigation ocurred"></paper-toast>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC project details screen</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
