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
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/paper-input/paper-textarea.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/paper-toast/paper-toast.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * An element to render project details editor.
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
class ProjectDetailsEditor extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
    }

    .actions {
      @apply --layout-horizontal;
      @apply --layout-end-justified;
      margin-top: 20px;
    }

    .actions paper-button {
      color: var(--project-details-action-button-color, var(--primary-color));
      background-color: var(--project-details-action-button-background-color);
      padding-left: 12px;
      padding-right: 12px;
      @apply --project-details-action-buttons;
    }

    .actions paper-button.action-button {
      @apply --action-button;
    }
    </style>
    <paper-input label="Project name" value="{{name}}"></paper-input>
    <paper-textarea label="Project description" value="{{description}}"></paper-textarea>

    <div class="actions">
      <paper-button on-click="cancel">Cancel</paper-button>
      <paper-button class="action-button" on-click="save">Save</paper-button>
    </div>

    <paper-toast id="missingName" text="Project name cannot be empty."></paper-toast>
`;
  }

  static get is() {
    return 'project-details-editor';
  }
  static get properties() {
    return {
      /**
       * Name of the project.
       */
      name: String,
      /**
       * The description of the project
       */
      description: String
    };
  }
  /**
   * Sends the `cancel-edit` custom event to the parent element.
   */
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel-edit'));
  }
  /**
   * Sends the `save-edit` custom event to the parent element.
   */
  save() {
    const name = this.name.trim();
    if (!name) {
      this.$.missingName.opened = true;
      return;
    }
    this.dispatchEvent(new CustomEvent('save-edit', {
      detail: {
        name: this.name,
        description: this.description
      }
    }));
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
window.customElements.define(ProjectDetailsEditor.is, ProjectDetailsEditor);
