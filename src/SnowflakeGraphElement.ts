export default class SnowflakeGraphElement extends HTMLElement {
    #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.#shadow.appendChild(document.createElement('svg'))
        console.log('connectedCallback');
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');

    }

    adoptedCallback() {
        console.log('adoptedCallback');
    }
}