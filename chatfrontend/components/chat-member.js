
/*    Chat Members  web component    */

const chatMemberTemplate = document.createElement('template');

chatMemberTemplate.innerHTML = /*html*/ `

    <style>
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

        :host {
            display: block;
            margin-bottom: 10px;
        }
        .member {
            display: flex;
            flex-direction: row;
            alignitems: center;
            padding: 1em;
            cursor: pointer;
            border-bottom: 1px solid #e9ecef;
            border-radius: 4px;
        }
        .member:hover, .member.active {
            background-color: #022f40;
            color: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .profile-pic {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 14px;
            overflow: hidden;
            object-fit: cover;
        }

        .user-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .user-name {
            font-weight: bold;
        }

        .msg-content {
            font-size: 0.8em;
            color: #6c757d;
        }
        .last-message {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
        }
        #msg-icon {
            display: none;
        }
        
        .message-status-icon {
            width: 15px;
            height: 15px;
        }
        #msg-counter {
            display: none;
            width:  25px;
            height: 25px;
            border-radius: 50%;
            background-color: #2aa81a;
            color: red;
            align-self: center;
            margin-left: auto;


            justify-content: center;
            align-items: center;
        }
        #counter {
            color: #022f40;
            margin: 0;
            padding: 0;
            font-size: 12px;
            font-weight: bold;
        }
    </style>

    <div class="member">
        <div class="profile-pic">
            <img class="user-image" src="/api/placeholder/50/50" alt="profile picture" >
        </div>
        <div class="user-info">
            <div class="user-name"></div>
            <div class="last-message">
                <div id="msg-icon" >
                    <img class="message-status-icon" src="assets/not-send.svg" />
                </div>
                <div class="msg-content"></div>
            </div>
        </div>
        <div id="msg-counter">
            <div id="counter">1</div>
        </div>
    </div>
`;


export class chatMember extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(chatMemberTemplate.content.cloneNode(true));
        
        this.messageCounter = 0
        this.lastMessage = null
		this.isActive = false;
        this.render();
	}
    
	activate() {
        this.isActive = true;
		this.updateStyle();
	}
    
    displayIsTyping() {
        const msgIcon = this.shadowRoot.querySelector("#msg-icon")
        msgIcon.style.display = "none"
        const lastMessageTag = this.shadowRoot.querySelector(".msg-content");
        lastMessageTag.textContent = "typing..."
        lastMessageTag.style["color"] = "green";
    }
    
    stopIsTyping() {
        const lastMessageTag = this.shadowRoot.querySelector(".msg-content");
        if (!this.lastMessage) {
            lastMessageTag.textContent = ""
            lastMessageTag.style["color"] = "white";
            return ;
        }
        lastMessageTag.textContent = this.lastMessage.cnt
        if (this.lastMessage.type == "user") {
            const msgIcon = this.shadowRoot.querySelector("#msg-icon")
            msgIcon.style.display = "block"
        }
        lastMessageTag.style["color"] = "white";
    }
    
	deactivate() {
        this.isActive = false;
		this.updateStyle();
	}
    
    displayMessageCounter(numberOfmessages) {
        const counterContainer = this.shadowRoot.querySelector("#msg-counter");
        counterContainer.style.display = "flex"

        const counter = counterContainer.querySelector("#counter")
        this.messageCounter += numberOfmessages
        counter.textContent = this.messageCounter
    }
    
    updateLastMessage(message) {
        const messageContent = message.cnt;
        const messagetype = message.type
        
        if (message == this.lastMessage) return

        this.lastMessage = message
        const msgIcon = this.shadowRoot.querySelector("#msg-icon")
        if (messagetype == "user") {
            msgIcon.style.display = "block"
            this.updateMessageStatus(message.status)
        }
        else
            msgIcon.style.display = "none"

        const lastMessageTag = this.shadowRoot.querySelector(".msg-content");
        let msg = messageContent
        if (messageContent.length > 20)
            msg  = messageContent.slice(0, 20) + "..."
        lastMessageTag.textContent = msg
        lastMessageTag.style["color"] = "#6c757d"
    }

    hideMessageCounter() {
        const counterContainer = this.shadowRoot.querySelector("#msg-counter");
        this.messageCounter = 0
        counterContainer.style.display = "none"
    }

	updateStyle() {
        const lastMessageElement = this.shadowRoot.querySelector('.member').querySelector('.last-message');
        
		const member = this.shadowRoot.querySelector('.member');
		if (this.isActive) {
            member.classList.add('active');
            lastMessageElement.style["color"] = `white`;
        }
        else {
            member.classList.remove('active');
            lastMessageElement.style["color"] = `#6c757d`;
        }
	}

	handleClick() {
		const username = this.getAttribute('username');
        const profilePic = this.getAttribute('profile-pic');
        const id = this.getAttribute('id');


		this.dispatchEvent(new CustomEvent('memberClicked', {
			bubbles: true,
			composed: true,
			detail: { username , profilePic, id}
		}));
	}

	connectedCallback() {

		this.shadowRoot.querySelector('.member').addEventListener('click', this.handleClick.bind(this));
	}
	
	render() {
		const username = this.getAttribute('username' || 'Unknown User');
		const profilePic = this.getAttribute('profile-pic');
		const userLastMessage = this.getAttribute('last-message' || 'No message yet');

		const userNameElement = this.shadowRoot.querySelector('.user-name');
		const profilePicElement = this.shadowRoot.querySelector('.user-image');
		const msg = this.shadowRoot.querySelector('.msg-content');

		userNameElement.textContent = username;
		profilePicElement.src = profilePic;

		this.updateStyle();
	}

    updateMessageStatus(status) {
        const messageSts = this.shadowRoot.querySelector('.message-status-icon');
        if (status == "sn") 
            messageSts.src = "assets/read.svg";
        else if (status == "recv") 
            messageSts.src = "assets/delivered.svg";
        else if (status == "st") 
            messageSts.src = "assets/send-to-server.svg";
    }

	static get observedAttributes() {
		return ['username', 'profile-pic', 'last-message', 'id'];
	}
}

