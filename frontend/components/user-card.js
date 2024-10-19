const cardTemplate = document.createElement('template');

cardTemplate.innerHTML = /*html*/ `
    <style>
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

        :host {
            display: block;
            width: 100%;
            height: 100%;
        }
        
        #card-container {
            display: flex;
            flex-direction: column;
        }
        
        .card-icon {
            margin-top: 5px;
            width: 15px;
            height: 15px;
        }
        
        .body-container {
            display: flex;
            flex-direction: row;
            gap: 8px;
            width: 100%;
        }

        .card-header {
            font-weight: bold;
        }

    </style>
    <div id="card-container">
        <div class="card-header">
            <p> Header </p>
        </div>
        <div class="body-container">
            <img class="card-icon" src="assets/list.svg" alt="svg">
            <p id="card-body">this is the body </p>
        </div>
    </div>
`;

export class card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(cardTemplate.content.cloneNode(true));
    
    }
    
    connectedCallback() {
        this.render();
    }
    
    render() {
        const svgPath = this.getAttribute('svg-path');
        const icon = this.shadowRoot.querySelector('.card-icon');
        icon.src = svgPath;

        
        const header = this.shadowRoot.querySelector('.card-header');
        header.textContent = this.getAttribute('header');

        const body = this.shadowRoot.querySelector('#card-body');
        body.textContent = this.getAttribute('body');
       
    }
    
    static get observedAttributes() {
        return ['username', 'profile-pic', 'svg-path'];
    }
    
}