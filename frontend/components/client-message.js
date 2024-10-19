const messageTemplate = document.createElement('template');

messageTemplate.innerHTML = /*html*/ `
	<style>
		 @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
         
		:host {
            width: 100%;
            height: 100%;
        }

         .message {
            display: flex;
            flex-direction: column;
            margin-bottom: 4px;
        }
        
        .message-content {
            max-width: 100%;
            padding: 10px 15px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
        }

        .message-status-icon {
            width:  16px;
            height: 16px;
            transform: translateY(-15%);
        }

        .msg-container {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: end;
            gap: 10px;
            background-color: red;
            background-color: #dcf8c6;
            border-radius: 7.5px;
            max-width: 80%;
            padding: 6px 7px 8px 9px;
            box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }

        .client-message {
            align-items: flex-start;
            display: none;
        }

        .client-message .message-content {
            background-color: #e9e9eb;
            color: #000;
            border-bottom-left-radius: 4px;
        }

        .message-time {
            align-self: flex-end;
            font-size: 12px;
            color: #888;
            min-width: 50px;
        }
		
	</style>
    <div class="message client-message">    
        <div class="msg-container" >
		    <div class="client-msg"></div>
		    <div id="client-msg-time" class="message-time" ></div>
        </div>
	</div>
`;

export class clientMessage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(messageTemplate.content.cloneNode(true));

        let messageSend = true;
	}

    connectedCallback() {
        this.render();
    }

	render() {
        const user = this.getAttribute("user");
        
        const clientElement = this.shadowRoot.querySelector('.client-message');
        clientElement.style.display = 'flex';
	}

    setMessage(message, time) {
        const user = this.getAttribute("user");
        
        const timeElement = this.shadowRoot.querySelector('#client-msg-time');
        const clientElement = this.shadowRoot.querySelector('.client-msg');
        clientElement.style.display = 'flex';

        clientElement.textContent = message;
        timeElement.textContent = time;

    }

    static getAttribute() {
        return ["user"];
    }
}