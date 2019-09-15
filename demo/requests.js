import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@polymer/paper-toast/paper-toast.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../project-requests-list.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'outlined',
      'compatibility',
      'listType',
      'project',
      'draggableEnabled'
    ]);
    this._componentName = 'project-requests-list';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._listTypeHandler = this._listTypeHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.refresh = this.refresh.bind(this);
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
    const data = await DataGenerator.insertSavedRequestData({
      projectsSize: 1,
      requestsSize: 15,
      forceProject: true
    });
    this.project = data.projects[0];
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

  async refresh() {
    const data = await DataGenerator.getDatastoreProjectsData();
    this.project = data[0];
  }

  _onDetails(e) {
    const msg = 'Details requested for ' + e.detail.item.name;
    console.log(msg);
  }

  _onDelete(e) {
    const items = e.detail.items;
    const size = items.length;
    let msg = '';
    if (size === 1) {
      msg = 'List item delete requested';
      msg += ` (${items[0].name} ${items[0].domain})`;
    } else {
      msg = size + ' list items delete requested';
    }
    console.log(msg);
  }

  _onExport(e) {
    const items = e.detail.items;
    const size = items.length;
    let msg = `Export requested for ${size} `;
    if (size === 1) {
      msg += 'item.';
      msg += ` (${items[0].name} ${items[0].domain})`;
    } else {
      msg += 'items';
    }
    console.log(msg);
  }

  _onOpen(e) {
    const msg = 'Item open requested for ' + e.detail.item.name;
    console.log(msg);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      outlined,
      compatibility,
      listType,
      project,
      draggableEnabled
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <project-requests-list
            ?draggableEnabled="${draggableEnabled}"
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            .listType="${listType}"
            .project="${project}"
            slot="content"
            @delete="${this._onDelete}"
            @export="${this._onExport}"
            @open="${this._onOpen}"
            @details="${this._onDetails}"
          ></project-requests-list>

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

        <div class="data-options">
          <h3>Data options</h3>

          <anypoint-button @click="${this.generateData}">Generate 100 requests</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
          <anypoint-button @click="${this.refresh}">Init/Refresh</anypoint-button>
        </div>

        <paper-toast id="navToast" text="Navigation ocurred"></paper-toast>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Project requests list</h2>
      ${this._demoTemplate()}
    `;
  }
}

window.addEventListener('navigate', function() {
  document.getElementById('navToast').opened = true;
});

const instance = new DemoPage();
instance.render();
window._demo = instance;
