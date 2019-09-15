import { css } from 'lit-element';
import styles from '@advanced-rest-client/requests-list-mixin/requests-list-styles.js';

export default [
  styles,
  css`
    :host {
      display: flex;
      flex-direction: column;
      --anypoint-item-icon-width: 56px;
      font-size: 1rem;
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
      overflow: auto;
      position: relative;
    }

    anypoint-icon-item.dragging {
      z-index: 1;
      background-color: var(--projects-menu-requests-item-dragging-background-color, #fff);
    }

    .list {
      flex: 1;
      overflow: auto;
    }

    .table-options {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-left: 16px;
    }

    .selected-counter {
      display: inline-block;
      margin-left: 8px;
      font-size: 16px;
    }

    .selected-actions {
      margin-left: 24px;
      flex: 1;
    }

    .empty-info {
      margin-left: 16px;
      font-size: 16px;
    }

    .drop-pointer {
      position: absolute;
      left: 4px;
      color: #757575;
      width: 20px;
      height: 24px;
      font-size: 20px;
    }

    .drop-pointer::before {
      content: '⇨';
    }

    .icon {
      display: block;
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    .spacer {
      flex: 1;
    }
  `
];
