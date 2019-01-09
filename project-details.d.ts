/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   project-details.html
 */

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../project-requests-list/project-requests-list.d.ts" />
/// <reference path="../paper-toast/paper-toast.d.ts" />
/// <reference path="../paper-button/paper-button.d.ts" />
/// <reference path="../paper-icon-button/paper-icon-button.d.ts" />
/// <reference path="../paper-menu-button/paper-menu-button.d.ts" />
/// <reference path="../paper-listbox/paper-listbox.d.ts" />
/// <reference path="../paper-item/paper-icon-item.d.ts" />
/// <reference path="../paper-dialog/paper-dialog.d.ts" />
/// <reference path="../arc-icons/arc-icons.d.ts" />
/// <reference path="../bottom-sheet/bottom-sheet.d.ts" />
/// <reference path="../saved-request-detail/saved-request-detail.d.ts" />
/// <reference path="../saved-request-editor/saved-request-editor.d.ts" />
/// <reference path="../paper-fab/paper-fab.d.ts" />
/// <reference path="../marked-element/marked-element.d.ts" />
/// <reference path="../markdown-styles/markdown-styles.d.ts" />
/// <reference path="../paper-styles/shadow.d.ts" />
/// <reference path="project-details-editor.d.ts" />

declare namespace UiElements {

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
   */
  class ProjectDetails extends Polymer.Element {

    /**
     * Project datastore ID to display.
     */
    projectId: string|null|undefined;

    /**
     * List of requests to display.
     * This list is computed when the `projectId` changes
     */
    requests: any[]|null|undefined;

    /**
     * Project data restored from the datastore.
     */
    project: object|null|undefined;

    /**
     * Set to true to enable project editor.
     */
    edit: boolean|null|undefined;

    /**
     * True when the project data are being loaded
     */
    readonly loadingProject: boolean|null|undefined;

    /**
     * True when the request data are being loaded
     */
    readonly loadingRequests: boolean|null|undefined;

    /**
     * Computed value, true when the project has requests.
     */
    readonly hasRequests: boolean|null|undefined;

    /**
     * List of requests that has been recently removed
     */
    _latestDeleted: any[]|null|undefined;

    /**
     * When set the project metadata editor is opened.
     */
    editorOpened: boolean|null|undefined;

    /**
     * When set the project metadata preview is opened.
     */
    detailsOpened: boolean|null|undefined;

    /**
     * When set the element won't request projects list when attached to the dom.
     * This is passed to the request editor.
     */
    noAutoProjects: boolean|null|undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;
    _projectChanged(projectId: any): void;
    _setupRequests(project: any): void;

    /**
     * Sorts requests list by `projectOrder` property
     */
    _legacySort(a: object|null, b: object|null): Number|null;
    _requestDeletedHandler(e: any): void;
    _isProjectRequest(request: any): any;
    _requestChangedHandler(e: any): void;
    _cancelRequestLoading(loadingRequests: any, hasRequests: any): void;

    /**
     * Handles the `list-item-open` event to open a request.
     */
    _onOpen(e: any): void;

    /**
     * Handles items delete event.
     */
    _onDelete(e: any): any;

    /**
     * Deletes a request from the details panel.
     */
    _deleteRequestDetails(): any;

    /**
     * Performs a delete action of request items.
     *
     * @param deleted List of deleted items.
     * @param opts If `skipRevert` is true it ignores "revert" logic
     */
    _delete(deleted: Array<object|null>|null, opts: object|null): Promise<any>|null;

    /**
     * Restores removed requests.
     * It does nothing if `_latestDeleted` is not set or empty.
     */
    revertDeleted(): Promise<any>|null;
    _closeMainMenu(): void;

    /**
     * Handles the export event. Fires `export-data` custom event
     */
    _onExport(e: any): void;

    /**
     * Menu item handler to export all project data
     */
    _onExportAll(): void;
    _onExportAllDrive(): void;

    /**
     * Dispatches the `export-data` event with relevant data.
     *
     * @param requests List of request to export with the project.
     */
    _exportItems(requests: any[]|null, destination: String|null): void;

    /**
     * Handler for the list reorder event. Updates items order in the datastore.
     */
    _persistReorder(): void;

    /**
     * Updates requests in bulk opeartion.
     */
    _updateBulk(items: any): any;

    /**
     * Sends the `request-object-changed` custom event for each request on the list.
     *
     * @param item Request object.
     * @returns Promise resolved when the request object is updated.
     */
    _updateRequest(item: object|null): Promise<any>|null;

    /**
     * Computes value for the `hasRequests` property.
     */
    _computeHasRequests(length: any): any;

    /**
     * Toogles project details editor
     */
    toggleEdit(): void;

    /**
     * Handler to project edit cancel event
     */
    _cancelEdit(): void;

    /**
     * Handler to project edit save event
     */
    _saveEdit(e: any): any;

    /**
     * Dispatches `project-object-changed` event to inform model to update
     * the data.
     *
     * @param project Data to store.
     */
    _dispatchProjectUpdate(project: object|null): Promise<any>|null;

    /**
     * handler for the `project-object-changed`. Updates project data if needed.
     */
    _projectDataChanged(e: CustomEvent|null): void;

    /**
     * Handler for the `project-object-deleted` event.
     */
    _projectDeleteHandler(e: CustomEvent|null): void;

    /**
     * Deletes the project when there's no requests associated with it.
     * This function doesn't ask for confirmation.
     */
    _deleteEmpty(): Promise<any>|null;

    /**
     * Opens the warning dialog to delete the project.
     */
    _deleteProject(): void;

    /**
     * Called when the delete warning dialog closes.
     *
     * The function removes requests that exclusively belongs to this project
     * and updates the requests that contains this project and some other.
     * Finally it removes the project.
     * Each of the actions is separate action based on events API.
     */
    _deleteDialogResult(e: CustomEvent|null): Promise<any>|null;

    /**
     * Dispatches `project-object-deleted` event to remove the project.
     */
    _notifyDeleteProject(): Promise<any>|null;

    /**
     * Opens the request details applet with the request.
     */
    _onDetails(e: CustomEvent|null): void;

    /**
     * Fires `navigate` event for currently loaded in the details request.
     */
    _openRequestDetails(): void;

    /**
     * Opens request details editor in place of the request details applet.
     */
    _editRequestDetails(): void;
    _resizeSheetContent(e: any): void;
    _cancelRequestEdit(): void;

    /**
     * Closes editor when saving request
     */
    _saveRequestEdit(): void;
  }
}

interface HTMLElementTagNameMap {
  "project-details": UiElements.ProjectDetails;
}
