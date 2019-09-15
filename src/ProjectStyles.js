import { css } from 'lit-element';
import mdStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';

export default [
  mdStyles,
  css`
  :host {
    display: flex;
    flex-direction: column;
  }

  .list {
    flex: 1;
    overflow: auto;
  }

  .revert-button {
    height: 38px;
  }

  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  h2 {
    font-size: var(--arc-font-headline-font-size);
    font-weight: var(--arc-font-headline-font-weight);
    letter-spacing: var(--arc-font-headline-letter-spacing);
    line-height: var(--arc-font-headline-line-height);
    display: inline-block;
  }

  h3 {
    font-size: var(--arc-font-subhead-font-size);
    font-weight: var(--arc-font-subhead-font-weight);
    line-height: var(--arc-font-subhead-line-height);
  }

  .description {
    margin-bottom: 24px;
  }

  .description-value {
    color: var(--project-details-description-color, rgba(0, 0, 0, 0.74));
    max-width: var(--project-details-description-max-width, 700px);
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
  }

  paper-fab {
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

  arc-marked {
    margin-top: 20px;
    padding: 0;
  }

  .icon {
    display: block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
  `
];
