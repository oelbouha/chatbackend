import { websocket } from "./net.js";

const ConversationTemplate = document.createElement('template');

ConversationTemplate.innerHTML = /*html*/ `
<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    
    <style>
         @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }

        #conversation {

        }

    </style>
    </head>
    <body>
        <div id="conversation" class="p-3"> </div> 
    </body>
</html>
`;


export class conversation extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(ConversationTemplate.content.cloneNode(true));

        
        // user messages
        this.messages = [];
        
        // client messages 
        this.clientMessages = []
            
            
            this.render()
	    }
        

	connectedCallback() {
		
	}
    formatTime(time) {
        const date = new Date(time); // Parse the ISO string

        let hours = date.getUTCHours(); // Get hours in UTC
        const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Get minutes and ensure two digits
        const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    
        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert hour '0' to '12'
    
        return `${hours}:${minutes} ${ampm}`; // Return formatted time
    }

    loadOldMessages(messages, userId, clientId) {
        if (!messages || messages.length == 0) return 
    
        const conversation = this.shadowRoot.querySelector('#conversation');
        if (!conversation) return 
        

        if (messages[0].sender != clientId && messages[0].recipient != clientId)
        {
            console.log("user id ", userId, "client ", clientId)
            console.log(messages[0])
            return 
        }
        messages.forEach(message => {
            console.log(message)
            if (message.sender == clientId) {
                const wpClientComponent = document.createElement('wc-client-message')
                wpClientComponent.setMessage(message.content, this.formatTime(message.time))
                conversation.appendChild(wpClientComponent)
            }
            else {
                const wpUserComponent = document.createElement('wc-user-message');
                wpUserComponent.addMessage(message.content, this.formatTime(message.time), message.status);
                conversation.appendChild(wpUserComponent);
            }
    
        })
    }

    loadClientMessages(messages, activeMemberId) {
        if (!messages) return 
        
        const conversation = this.shadowRoot.querySelector('#conversation');
        if (!conversation) return 
        
        messages.forEach(message => {
            
            const userId = message.clt;
            const messageType = message.tp;
            const messageContent = message.cnt;
            const messageIdentifier = message.identifier
            const messageStatus = message.status

            if (message.type == "client") {
                const wpClientComponent = document.createElement('wc-client-message')
                wpClientComponent.setMessage(messageContent)
                conversation.appendChild(wpClientComponent)
               
                if (message.status != "sn") {
                    websocket.send(JSON.stringify({
                        "m": "sn",
                        "clt": activeMemberId,
                        "msg": message.msg
                    }));
                }
            }
            else {
                const wpUserComponent = document.createElement('wc-user-message');
                wpUserComponent.addMessage(messageContent, "1:30 AM");
                wpUserComponent.updateMessageStatus(message.status)
                conversation.appendChild(wpUserComponent);
            }

        });
    }

    loadUserMessages(messages) {
        if (!messages) return 
        messages.forEach(message => {
            this.displayUserMessage(message)
        });
    }
    
    displayUserMessage(message) {        
        const conversation = this.shadowRoot.querySelector('#conversation');
        
        const userId = message.clt;
        const messageType = message.tp;
        const messageContent = message.cnt;
        const messageIdentifier = message.identifier
        
        setTimeout(() => {
            const wpUserComponent = document.createElement('wc-user-message');
            wpUserComponent.addMessage(messageContent, "1:30 AM");
            wpUserComponent.setAttribute("message-id", messageIdentifier);
            conversation.appendChild(wpUserComponent);
        }, 0);
    }
    
    displayClientMessage(message) {

        const userId = message.clt;
        const messageType = message.tp;
        const messageContent = message.cnt;
        const messageIdentifier = message.identifier
        
        const conversation = this.shadowRoot.querySelector('#conversation');
        if (!conversation) return 
        const wpClientComponent = document.createElement('wc-client-message')
        wpClientComponent.setMessage(messageContent)
        conversation.appendChild(wpClientComponent)
    }

	render() {
        // const username = this.getAttribute('username');
        // const userProfilePic = this.getAttribute('profile-pic');
        
        // const conversation = this.shadowRoot.querySelector('#conversation');
        // conversation.textContent = ''
        
        // setTimeout(() => {
        //     this.messages.forEach((message) => {
        //         const wpUserComponent = document.createElement('wc-user-message');
        //         wpUserComponent.addMessage(message.cnt);
        //         wpUserComponent.updateMessageStatus(message.m)
        //         conversation.appendChild(wpUserComponent);
        //     });

        //     this.clientMessages.forEach((message) => {
        //         const wpClientComponent = document.createElement('wc-client-message');
        //         wpClientComponent.setMessage(message.cnt);
        //         conversation.appendChild(wpClientComponent);
        //     });
        // })
	}

    static get observedAttributes() {
		return ['username', 'profile-pic', 'last-message'];
	}
}


/*


{ "m": "msg", "clt": 3, "tp": "txt", "identifier": 31, "cnt": "helllo" }
{ "m": "recv", "clt": 3, "msg": 951, "identifier": 0 }


jawad session id == 4
csrftoken=e60We5UesWzVSdjQC5W4Hu84xeIZatDW; sessionid=01ul4w4h79xwvkmkcv2ysm3uxfids7xe
sessionid=75r0w7kvo1v7o9rcr69ez3mk9ue4fkck
*/