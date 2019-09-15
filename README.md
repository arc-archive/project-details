[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/project-details.svg)](https://www.npmjs.com/package/@advanced-rest-client/project-details)

[![Build Status](https://travis-ci.org/advanced-rest-client/project-details.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/project-details)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/project-details)


# project-details

A project details screen for the Advanced REST Client.

## Usage

### Installation
```
npm install --save @advanced-rest-client/project-details
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/project-details/project-details.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <project-details .projectId="${pId}" draggableenabled></project-details>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/project-details
cd project-details
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
