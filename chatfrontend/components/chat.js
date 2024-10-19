import { websocket } from "./net.js";
import { getData } from "./net.js"

let typingTimer;
const doneTypingInterval = 2000;


function getTimestamp(format = 'ms') {
    const now = Date.now(); // Gets current timestamp in milliseconds
    
    const formats = {
        ms: now,                    // Full milliseconds
        seconds: Math.floor(now / 1000),  // Convert to seconds
        formatted: {
            milliseconds: now % 1000,           // Just milliseconds part (0-999)
            seconds: Math.floor((now / 1000) % 60),    // Just seconds part (0-59)
            minutes: Math.floor((now / 1000 / 60) % 60), // Just minutes part (0-59)
            hours: Math.floor((now / 1000 / 60 / 60) % 24), // Just hours part (0-23)
        }
    };
    
    return formats[format] || formats.ms;
}




const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
    @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

    :host {
        display: block;
        height: 100%;
    }

    .chat-container {
        height: 100vh;
    }

    #convo-list {
        width: 400px;
        min-width: 300px;
        background-color: #f8f9fa;
        border-right: 1px solid #dee2e6;
        transition: width 0.3s ease;
    }


    #convo-messages-container {
        background-color: #e0e0e0;
        flex-grow: 1;
        transition: width 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    #user-profile {
        width: 350px;
        min-width: 300px;
        background-color: #f8f9fa;
        border-left: 1px solid #dee2e6;
        transition: width 0.3s ease;
    }

    .members-container {
        overflow-y: auto;
        max-height: calc(100vh - 120px);
    }

	#user-profile .min {
		display: none !important;
	}

    .search-container {
        position: relative;
    }

    .search-icon {
        position: absolute;
        left: 1em;
        top: 50%;
        transform: translateY(-50%);
        width: 1.5rem;
        height: 1.5rem;
        pointer-events: none;
    }

    #convo-search:focus {
        outline: none;
        border-color: #ccc;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }

    #convo-search, .form-control {
        padding-left: 3rem;
    }

    #user-header-container {
        width: 100%;
        background-color: #f8f9fa;
        display: flex;
        flex-direction: row;
    }

    .member {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 0.5em;
        border-bottom: 1px solid #e9ecef;
    }

    .profile-pic {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 14px;
        overflow: hidden;
        border: 1px solid #e0e0e0;
    }

    #user-image {
            width: 100%;
            height: 100%;

            object-fit: cover;
    }
    .convo-username {
        font-weight: bold;
    }
    
    .convo-user-status {
        font-size: 12px;
    }

    #user-convo-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2px;
    }
    #list-icon-container .list-icon, .profile-icon-container .profile-icon {
        display: none;
    }


        .profileOffcanvas {
            position: fixed;
            top: 0;
            right: -200%;
            height: 100%;
            background-color: #fff;
            transition: right 0.3s ease-in-out;
            z-index: 1000;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        }

        .list-offcanvas {
            position: fixed;
            top: 0;
            left: -200%;
            height: 100%;
            width: 300px;
            background-color: #fff;
            transition: right 0.3s ease-in-out;
            z-index: 1001;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        }

        .profileOffcanvas.show {
            right: 0;
        }

        .list-offcanvas.show {
            left: 0;
        }

        .profile-offcanvas-header {
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
        }

        .list-offcanvas-header {
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
        }

        .custom-offcanvas-body {

        }

        #profileOffcanvas, #list-offcanvas {
            overflow-y: auto;
        }
    
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
        }
        
        .overlay.show {
            display: block;
        }

        #list-offcanvas-body {
        
        }

        #user-profile, #user-header-container{
            display: none;
        }

        #chat-conversation {
            width: 100%;
            height: 100%;
            background-color: #e0e0e0;
            overflow-y: auto;
        }


        #input-message-container {
            display: none;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
            padding: 0.5em;
            box-sizing: border-box;
        }
        
        #message-input {
            flex-grow: 1;
            margin: 0 10px;
            border-radius: 8px;
            border: 1.5px solid #dee2e6;;
            background-color: none;
            padding: 0.5em;
        }

        #message-input:focus {
            outline: none;
            border-color: #ccc;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        }

        .last-message {
            font-size: 0.8em;
            color: #6c757d;
        }

        .add-image-icon {
            cursor: pointer;
            width: 25px;
            height: 25px;
        }

        #send-btn-icon {
            cursor: pointer;
            width:  25px;
            height: 25px;
            display: none;
        }

        #send-btn-icon.visible {
            display: block;
        }


    @media (max-width: 1200px) {
        #user-profile {
            display: none !important    
		}
        .profile-icon-container .profile-icon {
            display: initial !important;
            width: 30px;
            height: 30px;
        }
    }
    
    @media (max-width: 576px) {
        #convo-list {
            display: none !important;
        }
        #min {
            width: 100px;
            height: 100px;
            background-color: red;
        }
        #list-icon-container .list-icon, .profile-icon-container .profile-icon {
            display: initial !important;
            width:  25px;
            height: 25px;
        }
    }
</style>

<body>
    <div class="chat-container position-relative">
        <div class="d-flex h-100 position-relative">
        <div id="convo-list" class="p-3">
                <h4 class="chat-header mb-3">Chats</h5>
                <div class="search-container">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <input type="search" id="convo-search" class="form-control mb-3" placeholder="Search">
                </div>
                <div class="members-container"></div>
            </div>

            <div id="convo-messages-container">
                <div id="user-header-container">
                    <div class="member">             
                        <div id="user-convo-header">
                            <div id="list-icon-container">
                                <svg class="list-icon"   xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                    <path d="M3.166,2.914c-1.377,0-2.166,.796-2.166,2.185s.789,2.185,2.166,2.185,2.165-.796,2.165-2.185-.789-2.185-2.165-2.185Z"/>
                                    <path d="M8.745,6.099h13.255c.553,0,1-.448,1-1s-.447-1-1-1H8.745c-.553,0-1,.448-1,1s.447,1,1,1Z"/>
                                    <path d="M3.166,9.815c-1.377,0-2.166,.796-2.166,2.185s.789,2.185,2.166,2.185,2.165-.796,2.165-2.185-.789-2.185-2.165-2.185Z"/>
                                    <path d="M22,11H8.745c-.553,0-1,.448-1,1s.447,1,1,1h13.255c.553,0,1-.448,1-1s-.447-1-1-1Z"/>
                                    <path d="M3.166,16.716c-1.377,0-2.166,.796-2.166,2.185s.789,2.185,2.166,2.185,2.165-.796,2.165-2.185-.789-2.185-2.165-2.185Z"/>
                                    <path d="M22,17.901H8.745c-.553,0-1,.448-1,1s.447,1,1,1h13.255c.553,0,1-.448,1-1s-.447-1-1-1Z"/>
                                </svg>
                            </div>
                            <div class="profile-pic">
                                <img id="user-image" src="assets/after.png" alt="profile picture" class="img-fluid">
                            </div>
                            <div class="convo-user-heaader-info">
                                <div class="convo-username">username</div>
                                <div class="convo-user-status"> online</div>
                            </div>
                        </div>
                            <div class="profile-icon-container p-2">
                                <img class="profile-icon" src="assets/portrait.svg" >
                            </div>
                    </div>
                </div>

                <div id="chat-conversation"> </div>
                
                <div id="input-message-container">
                    <svg class="add-image-icon" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                        <path d="m16,7c0,1.105-.895,2-2,2s-2-.895-2-2,.895-2,2-2,2,.895,2,2Zm6.5,11h-1.5v-1.5c0-.828-.671-1.5-1.5-1.5s-1.5.672-1.5,1.5v1.5h-1.5c-.829,0-1.5.672-1.5,1.5s.671,1.5,1.5,1.5h1.5v1.5c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-1.5h1.5c.829,0,1.5-.672,1.5-1.5s-.671-1.5-1.5-1.5Zm-6.5-3l-4.923-4.923c-1.423-1.423-3.731-1.423-5.154,0l-2.923,2.923v-7.5c0-1.379,1.122-2.5,2.5-2.5h10c1.378,0,2.5,1.121,2.5,2.5v6c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-6c0-3.032-2.467-5.5-5.5-5.5H5.5C2.467,0,0,2.468,0,5.5v10c0,3.032,2.467,5.5,5.5,5.5h6c.829,0,1.5-.672,1.5-1.5v-.5c0-1.657,1.343-3,3-3v-1Z" fill="#022f40"/>
                    </svg>
                    <input id="message-input" type="text" placeholder="Type a message">
                    <svg id="send-btn-icon" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                        <path d="m4.034.282C2.981-.22,1.748-.037.893.749.054,1.521-.22,2.657.18,3.717l4.528,8.288L.264,20.288c-.396,1.061-.121,2.196.719,2.966.524.479,1.19.734,1.887.734.441,0,.895-.102,1.332-.312l19.769-11.678L4.034.282Zm-2.002,2.676c-.114-.381.108-.64.214-.736.095-.087.433-.348.895-.149l15.185,8.928H6.438L2.032,2.958Zm1.229,18.954c-.472.228-.829-.044-.928-.134-.105-.097-.329-.355-.214-.737l4.324-8.041h11.898L3.261,21.912Z" fill="#0000FF"/>
                    </svg>                  
                </div>
            </div>
            
            <div id="user-profile"></div>
        </div>
    </div>

    <div class="profileOffcanvas d-flex flex-column col-lg-4 col-md-4 col-sm-6 " id="profileOffcanvas">
        <div class="profile-offcanvas-header">
            <button type="button" class="btn-close" id="profileOffcanvasCloseBtn"></button>
        </div>
        <div class="custom-offcanvas-body"></div>
    </div>

    <div class="list-offcanvas" id="list-offcanvas">
        <div class="list-offcanvas-header">
            <button type="button" class="btn-close" id="listOffcanvasCloseBtn"></button>
        </div>
        <div id="list-offcanvas-body" class="p-3">
            <div class="search-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <input type="search" id="offcanvas-search" class="form-control mb-3" placeholder="Search">
            </div>
        </div>
    </div>

    <div class="overlay" id="overlay" ></div>
</body>
`;

export class chat extends HTMLElement {
    constructor() {
        super();
        
        const shadowRoot = this.attachShadow({mode:'open'});
        let templateClone = template.content.cloneNode(true);
        shadowRoot.append(templateClone);        

        this.convo_list_users = [
        {
            "userName": "mohamed",
            "id": "5"
        },
        {
            "userName": "ahmed",
            "id": "6"
        }, 
        {
            "userName": "jawad",
            "id": "4"
        }, 
        ];

        this.activeMember = null;
        this.isActive = false;
        
        this.activeMemberId = null;
        this.activeMemberUsername = null;
        this.activeMemberstatus = null
        this.isSend = false

        this.username = "outman"
        this.userId = 3

        websocket.onmessage = (e) => {
            const message = JSON.parse(e.data);
                // console.log("received :: ", message)
                    
            switch (message.m) {
                case "msg":
                    this.handleIncomingMessage(message)
                    break 
                case "st":
                    this.handleMessageStatus(message)
                    break 
                case "recv":
                    this.handleMessageStatus(message)
                    break 
                case "sn":
                    this.handleMessageStatus(message)
                    break 
                case "typ":
                    this.handleTyping(message)
                    break 
                case "styp":
                    this.handleTyping(message)
                    break 
                case "err":
                        console.log("ther is an error in the message", message)
                        break
                    }  
                }


        this.identifier = 0
        this.clientsMessages = new Map()
        this.userMessages = new Map()

    }

    updateScroll() {
        const element = this.shadowRoot.querySelector("#chat-conversation");
        element.scrollTop = element.scrollHeight;
    }

    displayConvoHeader(event) {
        const profilePic = event.detail.profilePic;

        const userHeaderStatus = this.shadowRoot.querySelector(".convo-user-status")
        if (!userHeaderStatus) return 
        
        this.activeMemberstatus = "online"
        userHeaderStatus.textContent = this.activeMemberstatus
        userHeaderStatus.style["color"] = "green"
        
        const chatConversation = this.shadowRoot.querySelector('#convo-messages-container');
        // display header and message input 
        const convoHeader = chatConversation.querySelector('#user-header-container');
        convoHeader.style.display = 'block';
        const inputMessage = chatConversation.querySelector('#input-message-container');
        inputMessage.style.display = `flex`;
        
        // display user image and name
        const userProfileImg = convoHeader.querySelector('#user-image');
        userProfileImg.src = profilePic;
        const userName = convoHeader.querySelector('.convo-username');
        userName.textContent = this.activeMemberUsername;
    }
    
    displayClientProfile(event) {
        const profilePic = event.detail.profilePic;
        const userProfile = this.shadowRoot.querySelector('#user-profile');
        if (userProfile.style.display != 'block')
            userProfile.style.display = 'block';
        userProfile.innerHTML = ``;

        const wpProfile = document.createElement('wc-chat-profile');
        wpProfile.setAttribute('username', this.activeMemberUsername);
        wpProfile.setAttribute('profile-pic', profilePic);
        userProfile.appendChild(wpProfile);
    }

    async fetchData() {
        let data = await getData();
        for (const item of data)
            console.log(item)
        return data
    }

    async handleMemberClick(event) {
        const profilePic = event.detail.profilePic;

        if (this.activeMember) {
            this.activeMember.deactivate();
        }

        const clickedMember = event.target;
        clickedMember.activate();
        if (clickedMember === this.activeMember) return 
        this.activeMember = clickedMember;

        this.activeMemberId = event.detail.id
        this.activeMemberUsername = event.detail.username;

        // console.log("member active :: ", this.activeMember)
        // console.log ("userName", this.activeMemberUsername, this.activeMemberId)

        // display user heeader
        this.displayConvoHeader(event)


        // get messages from database
        const data = await this.fetchData()
        this.renderOldMessages(data)
        
        // load member conversation
        // this.renderClientMessages(this.activeMemberId)
        
        // /// load the profile info
        this.displayClientProfile(event)
      

        // close overlay
        this.handleOverlayClick();
    }

    renderOldMessages(messages) {

        const chatConversation = this.shadowRoot.querySelector("#convo-messages-container")
        const messagesBody = chatConversation.querySelector('#chat-conversation');
        messagesBody.innerHTML = ``
        
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        // const targetMember = membersContainer.querySelector(`wc-chat-member[id="${id}"]`)

        const chatConvoComponent = document.createElement('wc-chat-conversation');
        chatConvoComponent.loadOldMessages(messages, this.userId, this.activeMemberId)
        messagesBody.appendChild(chatConvoComponent)
        this.updateScroll()
    }

    handleSearch(event)  {
        const searchQuery = event.target.value.toLowerCase();
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        const members = membersContainer.querySelectorAll('wc-chat-member');
    
        members.forEach(member => {
            const username = member.getAttribute('username').toLowerCase();
            if (username.includes(searchQuery)) {
                member.style.display = '';
            } else {
                member.style.display = 'none';
            }
        });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('memberClicked', this.handleMemberClick.bind(this));
        
        const mainSearch = this.shadowRoot.querySelector('#convo-search');
        mainSearch.addEventListener('input', this.handleSearch.bind(this));

        const profileIcon = this.shadowRoot.querySelector('.profile-icon');
        profileIcon.addEventListener('click', this.handleProfileOffCanvas.bind(this));

        this.addMessageEventListener()
        this.addOffcanvasEventListener()
        
    }
    addOffcanvasEventListener() {
        const profileOffcanvasCloseBtn = this.shadowRoot.querySelector('#profileOffcanvasCloseBtn');
        profileOffcanvasCloseBtn.addEventListener('click', this.handleProfileCloseOffcanvas.bind(this));
        
        const listOffcanvas = this.shadowRoot.querySelector('#list-icon-container');
        listOffcanvas.addEventListener('click', this.handleListOffcanvas.bind(this));
    
        const listOffCloseBtn = this.shadowRoot.querySelector('#listOffcanvasCloseBtn');
        listOffCloseBtn.addEventListener('click', this.handlelistCloseOffcanvas.bind(this));
    
        const overlay = this.shadowRoot.querySelector('#overlay');
        overlay.addEventListener('click', this.handleOverlayClick.bind(this));
    
        const offcanvasSearch = this.shadowRoot.querySelector('#offcanvas-search');
        offcanvasSearch.addEventListener('input', this.handleOffcanvasSearch.bind(this));

    }

    addMessageEventListener() {
        const sendBtn = this.shadowRoot.querySelector('#send-btn-icon');
        sendBtn.addEventListener('click', this.sendMessage.bind(this));
        
        const inputMessage = this.shadowRoot.querySelector('#message-input');
        inputMessage.addEventListener('input', this.displaySendBtn.bind(this));
        inputMessage.addEventListener('keypress', this.handleKeyPress.bind(this));
    }

    displayUserIsTyping(clientId) {
        if (!this.activeMember || this.activeMemberId != clientId) return 
        
        const userHeaderStatus = this.shadowRoot.querySelector(".convo-user-status")
        if (!userHeaderStatus) return 
        
        userHeaderStatus.textContent = "typing..."
        userHeaderStatus.style["color"] = "green"


    }
    
    hideIsTyping(clientId) {

        const userHeaderStatus = this.shadowRoot.querySelector(".convo-user-status")
        
        // console.log("user :: ", userHeaderStatus)

        if (!userHeaderStatus) return

        console.log("sts", userHeaderStatus.textContent )

        if (userHeaderStatus.textContent == "typing...")
            userHeaderStatus.textContent = "online"
        
        // update the status of the user
        userHeaderStatus.textContent = "online"
        userHeaderStatus.style["color"] = "green"

        console.log("sts content::", userHeaderStatus.textContent)
    }

    handleTyping(message) {
        console.log(message)

        const membersContainer = this.shadowRoot.querySelector('.members-container');
        const memberElement = membersContainer.querySelector(`wc-chat-member[id="${message.clt}"]`);

        console.log("chat member :: ", memberElement)
        if (message.m == "typ"){
            memberElement.displayIsTyping()
            this.displayUserIsTyping(message.clt)
        }
        else {
            memberElement.stopIsTyping()
            this.hideIsTyping(message.clt)
        }
    }

    handleIncomingMessage(message) {
        // console.log ("new message:: ", message);
        
        let response = {
            "m": "recv",
            "clt": message.clt,
            "msg": message.msg
        }
        websocket.send(JSON.stringify(response));
        
        if (message.clt == this.activeMemberId)
            this.activeMember.updateLastMessage(message)

        const targrtClient = this.convo_list_users.find(user => user.id == message.clt)
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        const memberElement = membersContainer.querySelector(`wc-chat-member[username="${targrtClient.userName}"]`);
        
        const conversation = this.shadowRoot.querySelector('wc-chat-conversation');
        if (!conversation) {
            return this.updateUnreadMessages(targrtClient, message)
        }
        
        const client = this.convo_list_users.find(user => user.id == message.clt)
        if (!client) return 
        
        if (client.id != this.activeMember.id) {
            return this.updateUnreadMessages(targrtClient, message)
        }
        
        conversation.displayClientMessage(message);
        
        this.storeMessage(this.activeMemberId, message, "client")

        memberElement.hideMessageCounter()

        response = {
            "m": "sn",
            "clt": this.activeMemberId,
            "msg": message.msg
        }
        websocket.send(JSON.stringify(response));    
    }

    storeMessage(key, value, type) {
        if (!this.clientsMessages.has(key)) {
            this.clientsMessages.set(key, []);
        }
        value["type"] = type
        this.clientsMessages.get(key).push(value);
    }
    
    updateUnreadMessages(targrtClient, message) {
        this.storeMessage(targrtClient.id , message, "client")

        
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        const memberElement = membersContainer.querySelector(`wc-chat-member[username="${targrtClient.userName}"]`);
        
        // console.log("messages ", memberElement)
        
        memberElement.displayMessageCounter(1)
        memberElement.updateLastMessage(message)

        this.moveMemberElementToTop(targrtClient)
    }

    moveMemberElementToTop(targrtClient) {
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        const memberElement = membersContainer.querySelector(`wc-chat-member[username="${targrtClient.userName}"]`);

        membersContainer.removeChild(memberElement)
        membersContainer.insertBefore(memberElement, membersContainer.firstChild)

        const userIndex = this.convo_list_users.findIndex(user => user.userName === targrtClient.userName);
        if (userIndex !== -1) {
            const user = this.convo_list_users.splice(userIndex, 1)[0];
            this.convo_list_users.unshift(user);
        }
    }

    getMessagesById(id) {
        for (const [key, val] of this.clientsMessages.entries()) {
            if (key == id) {
                return val
            }
        }
        return undefined;
    }

    handleMessageStatus(message) {
        console.log ("updating message status :: ", message);
        
        const conversation = this.shadowRoot.querySelector('wc-chat-conversation');
        
        const userId = message.clt
        
        console.log("looking ", this.activeMemberId)
        
        const activeMember = this.getMessagesById(userId)
        if (!activeMember) return 
        console.log("member to update", activeMember)

        let messageToUpdate = activeMember.find(msg => msg.identifier == message.identifier)
        if (!messageToUpdate)
            messageToUpdate = activeMember.find(msg => msg.msg == message.msg)
        
        if (messageToUpdate) {
            messageToUpdate["status"] = message.m
            messageToUpdate["msg"] = message.msg
        }

        // render the conversation
        
        this.renderClientMessages(userId)
        // console.log("msg to update :: ", messageToUpdate)
        
        // conversation.updateMessageStatus(message)
    }

    renderClientMessages(id) {

        const chatConversation = this.shadowRoot.querySelector("#convo-messages-container")
        const messagesBody = chatConversation.querySelector('#chat-conversation');
        messagesBody.innerHTML = ``
        
        let targetMemberMessages = this.getMessagesById(id)
        
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        const targetMember = membersContainer.querySelector(`wc-chat-member[id="${id}"]`)

        const chatConvoComponent = document.createElement('wc-chat-conversation');
        chatConvoComponent.setAttribute('username', this.activeMemberUsername);
        chatConvoComponent.loadClientMessages(targetMemberMessages, id)
        if (targetMember)
            targetMember.hideMessageCounter()
        messagesBody.appendChild(chatConvoComponent);
        
        if (targetMemberMessages) {
            const lastMessage = targetMemberMessages[targetMemberMessages.length - 1]
            console.log("last message :: ", lastMessage)
            if (targetMember)
                targetMember.updateLastMessage(lastMessage)
        }
    }

    sendMessage(event) {
        const input = this.shadowRoot.querySelector('#message-input');

        const msg = input.value;
        input.value = "";
        input.focus();

        if (msg) {
            const conversation = this.shadowRoot.querySelector('wc-chat-conversation');
            if (conversation) {
                
                this.identifier = getTimestamp()
                const message = {
                    "m": "msg",
                    "clt": this.activeMemberId, // client id
                    "tp": "txt",
                    "identifier": this.username + this.identifier,
                    "cnt": msg,
                    "status": "pending"
                }

                this.storeMessage(this.activeMemberId, message, "user")

                conversation.displayUserMessage(message);
                websocket.send(JSON.stringify(message));
                
                this.updateScroll();
            }
        }
    }

    displaySendBtn(event) {
        const sendBtnIcon = this.shadowRoot.querySelector('#send-btn-icon');
        
        clearTimeout(typingTimer);

        const message = event.target.value;
        if (message) {
            sendBtnIcon.classList.add('visible');
            
                const response = {
                    "m": "typ",
                    "clt": this.activeMemberId
                }
                websocket.send(JSON.stringify(response));
            
            if (typingTimer) {
                clearTimeout(typingTimer);
            }
            const id = this.activeMemberId
            typingTimer = setTimeout(
                this.doneTyping.bind(this)
            , doneTypingInterval);

        }
        else {
            sendBtnIcon.classList.remove('visible')
        }
    }

    doneTyping() {
        const response = {
            "m": "styp",
            "clt": this.activeMemberId
        }
        websocket.send(JSON.stringify(response));
    }

    handleKeyPress(event) {
        if (event.key == "Enter")
            this.sendMessage(event);
    }

    handleListOffcanvas(event) {
        const listOffcanvasBody = this.shadowRoot.querySelector('#list-offcanvas-body');
        
        if (this.isActive == false)  {
            this.convo_list_users.forEach(username => {
                
                const memberElement = document.createElement('wc-chat-member');
                memberElement.setAttribute('username', username.userName);
                memberElement.setAttribute('profile-pic', `assets/after.png`);
                memberElement.setAttribute('last-message', 'hello there!');
                listOffcanvasBody.appendChild(memberElement);
                this.isActive = true;
            });
        }

            
        const listOffcanvas = this.shadowRoot.querySelector('#list-offcanvas');
        listOffcanvas.classList.add('show');
        this.showOverlay();
    }
    
    handleOffcanvasSearch(event) {
        // need to be fixed ;
        const searchQuery = event.target.value.toLowerCase();
        console.log("search ::", searchQuery);

        const membersContainer = this.shadowRoot.querySelector('#list-offcanvas-body');
        const members = membersContainer.querySelectorAll('wc-chat-member');
    
        members.forEach(member => {
            const username = member.getAttribute('username').toLowerCase();
            if (username.includes(searchQuery)) {
                member.style.display = '';
            } else {
                member.style.display = 'none';
            }
        });
    }

    handleProfileCloseOffcanvas(event) {
        const offcanvas = this.shadowRoot.querySelector('#profileOffcanvas');
        offcanvas.classList.remove('show');
        this.hideOverlay();
    }

    handlelistCloseOffcanvas(event) {
        const listOffcanvas = this.shadowRoot.querySelector('#list-offcanvas');
        listOffcanvas.classList.remove('show');
        this.hideOverlay();
    }

    handleProfileOffCanvas(event) {
        const username = this.convo_list_users[1];
		const profilePic = "assets/after.png";

        console.log(username);
        const cprofileOffcanvasBody = this.shadowRoot.querySelector('.custom-offcanvas-body');
        cprofileOffcanvasBody.innerHTML = ``;

        const wpProfile = document.createElement('wc-chat-profile');
        wpProfile.setAttribute('username', username);
        wpProfile.setAttribute('profile-pic', profilePic);
        
        cprofileOffcanvasBody.appendChild(wpProfile);

        const profileOffcanvas = this.shadowRoot.querySelector('#profileOffcanvas');
        profileOffcanvas.classList.add('show');
        this.showOverlay();
    }

    showOverlay() {
        const overlay = this.shadowRoot.querySelector('.overlay');
        overlay.classList.add('show');
    }
    hideOverlay() {
        const overlay = this.shadowRoot.querySelector('.overlay');
        overlay.classList.remove('show');
    }
    handleOverlayClick() {
        this.handleProfileCloseOffcanvas();
        this.handlelistCloseOffcanvas();
    }


    render() {
        const membersContainer = this.shadowRoot.querySelector('.members-container');
        
        //// for test
        const username = "mohamed";
        const profilePic = "assets/after.png";

        this.convo_list_users.forEach(username => {

            const memberElement = document.createElement('wc-chat-member');
            memberElement.setAttribute('username', username.userName);
            memberElement.setAttribute('profile-pic', `assets/after.png`);
            memberElement.setAttribute('id', username.id);
            membersContainer.appendChild(memberElement);

        });
    }
}