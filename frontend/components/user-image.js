const userMessageTemplate = document.createElement('template');

userMessageTemplate.innerHTML = /*html*/ `
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

        #msg-status-container {
            align-self: flex-end;
            gap: 2px;
            position: absolute;
            bottom: 3%;
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;
            min-width: 70px;
        }

        .message-status-icon {
            width:  15px;
            height: 15px;
        }

        .msg-container {
            display: flex;
            flex-direction: column;
            align-items: end;
            background-color: red;
            background-color: #005c4b;
            border-radius: 7.5px;
            max-width: 80%;
            padding: 6px 7px 8px 9px;
            box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }

        .user-message {
            align-items: flex-end;
            display: none;
        }

        .user-message .message-content {
            background-color: #f0c808;
            color: #fff;
            border-bottom-right-radius: 12px;

        }

        .message-time {
            align-self: flex-end;
            font-size: 12px;
            color: white;
            min-width: 50px;
        }
        #image-container {
            width: 200px;
            height: 200px;
            border-radius: 16px;
            overflow: hidden;
        }

		#image-src {
            border-radius: 7.5px;
            width: 200px;
            height: 200px;
		}
		
	</style>
	<div class="message user-message position-relative">
        <div class="msg-container " >
            <div class="image-container">
				<img id="image-src" src="assets/after.png" />
			</div>
            <div id="msg-status-container" >
                <div class="message-time"></div>
                <div class="message-status">
                    <img class="message-status-icon" src="assets/not-send.svg" />
                </div>
            </div>
        </div>
    </div>
`;

export class userImage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(userMessageTemplate.content.cloneNode(true));
	}

    connectedCallback() {

    }  

    addMessage(message, time, status) {
        
        const user = this.getAttribute("user");
        
        const userMessage = this.shadowRoot.querySelector('#image-src');
        userMessage.src = message;
        
        const userMessageTime = this.shadowRoot.querySelector('.message-time');
        userMessageTime.textContent = time;

        const messageSts = this.shadowRoot.querySelector('.message-status-icon');
        if (!messageSts) return 
        if (status == "sn" || status == "seen") 
            messageSts.src = "assets/read.svg";
        else if (status == "recv" || status =="recieved") 
            messageSts.src = "assets/delivered.svg";
        else if (status == "st" || status == "ST") 
            messageSts.src = "assets/send-to-server.svg";
        
        const userElement = this.shadowRoot.querySelector('.user-message');
        userElement.style.display = 'flex';
    }
    
    updateMessageStatus(status) {
        const messageSts = this.shadowRoot.querySelector('.message-status-icon');
        if (status == "sn" || status == "seen") 
            messageSts.src = "assets/read.svg";
        else if (status == "recv" || status =="recieved") 
            messageSts.src = "assets/delivered.svg";
        else if (status == "st" || status == "ST") 
            messageSts.src = "assets/send-to-server.svg";
    }

    static getAttribute() {
        return ["user"];
    }
}