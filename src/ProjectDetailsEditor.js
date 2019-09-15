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
import { LitElement, html, css } from 'lit-element';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-textarea.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@polymer/paper-toast/paper-toast.js';
/**
 * An element to render project details editor.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class ProjectDetailsEditor extends LitElement {
  static get styles() {
    return css`
    :host {
      display: block;
    }

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .actions paper-button {
      padding-left: 12px;
      padding-right: 12px;
    }
    `;
  }

  render() {
    const { compatibility, outlined, name, description } = this;
    return html`
    <anypoint-input
      required
      autovalidate
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      .value="${name}"
      name="name"
      @value-changed="${this._inputHandler}">
      <label slot="label">Project name</label>
    </anypoint-input>

    <anypoint-textarea
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      .value="${description}"
      name="description"
      @value-changed="${this._inputHandler}">
      <label slot="label">Project description</label>
    </anypoint-textarea>

    <div class="actions">
      <anypoint-button
        ?compatibility="${compatibility}"
        @click="${this.cancel}"
      >
        Cancel
      </anypoint-button>
      <anypoint-button
        emphasis="high"
        ?compatibility="${compatibility}"
        @click="${this.save}"
      >
        Save
      </anypoint-button>
    </div>`;
  }

  static get properties() {
    return {
      /**
       * Name of the project.
       */
      name: { type: String },
      /**
       * The description of the project
       */
      description: { type: String },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables Material Design outlined style for inputs.
       */
      outlined: { type: Boolean }
    };
  }
  /**
   * Sends the `cancel-edit` custom event to the parent element.
   */
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }
  /**
   * Sends the `save-edit` custom event to the parent element.
   */
  save() {
    const name = (this.name || '').trim();
    if (!name) {
      return;
    }
    this.dispatchEvent(new CustomEvent('save', {
      detail: {
        name: this.name,
        description: this.description
      }
    }));
  }

  _inputHandler(e) {
    const { name, value } = e.target;
    this[name] = value;
  }
  /**
   * Fired when the user cancelled the action-button.
   *
   * This event does not bubbles.
   *
   * @event cancel-edit
   */
  /**
   * Fired when the user requested to save the data.
   * This element does not recognize if any change actually has been made
   * to the data so parent element may want to check if any data actually
   * changed.
   *
   * This event does not bubbles.
   *
   * @event save-edit
   * @param {String} name Updated name
   * @param {String} description Updated description
   */
}
