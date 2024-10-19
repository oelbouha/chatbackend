/*******      profile  Component ******/

const profileTemplate = document.createElement('template');

profileTemplate.innerHTML = /*html*/ `
    <style>
         @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        
        :host {
            display: block;
        }
        
    .profile-container {
        display: flex;
        flex-direction: column;
        gap: 1em;
        height: 100%;
        width: 100%;
        overflow-y: auto;
    }

    .profile-pic {
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #022f40;
        border-radius: 14px;
    }
    .user-image {
        width:  150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
    }

    
    .profile-header {
        font-weight: bold;
    }

    #user-profile-info {
        color: white;
        background-color: #022f40;
        border-radius: 14px;
    }

    </style>
    <div class="profile-container p-4">
        <div class="profile-header">
            <h3 >Profile info</h3>
        </div>
        
        <div class="profile-pic p-3">
            <img class="user-image" src="/api/placeholder/50/50" alt="profile picture">
            <h4 class="user-name"></h4>
        </div>
        <div id="user-profile-info" class="p-3"></div>
    </div>

`;

export class profile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(profileTemplate.content.cloneNode(true));
    
    }
    
    connectedCallback() {
        this.render();
    }
    
    render() {
        const username = this.getAttribute('username');
        const userProfilePic = this.getAttribute('profile-pic');
        
        const userProfileInfo = this.shadowRoot.querySelector('#user-profile-info');
        const wp_userProfileInfo = document.createElement('wc-card');
        
        
        
        // set username
        const wp_card = document.createElement('wc-card');
        const userNameIcon = "assets/circle-user.svg";
        const userName = this.getAttribute('username');
        wp_card.setAttribute('svg-path', userNameIcon);
        wp_card.setAttribute('header', "username");
        wp_card.setAttribute('body', userName);
        userProfileInfo.appendChild(wp_card);
        
        // set phone number
        const phoneNUmberIcon = "assets/phone.svg";
        const phone = "06365489752"; //this.getAttribute('phonenumber');
        const wp_phone = document.createElement('wc-card');
        wp_phone.setAttribute('svg-path', phoneNUmberIcon);
        wp_phone.setAttribute('header', "Phone number");
        wp_phone.setAttribute('body', phone);
        userProfileInfo.appendChild(wp_phone);
        
        // set description
        const descriptionIcon = "assets/description.svg";
        const description = "this is a description ..."; //this.getAttribute('description');
        const wp_description = document.createElement('wc-card');
        wp_description.setAttribute('svg-path', descriptionIcon);
        wp_description.setAttribute('header', "Description");
        wp_description.setAttribute('body', description);
        userProfileInfo.appendChild(wp_description);

    
        const userImageElement = this.shadowRoot.querySelector('.user-image');
        const usernameElement = this.shadowRoot.querySelector('.user-name');

        userImageElement.src = userProfilePic;
        usernameElement.textContent = username;
    }
    
    static get observedAttributes() {
        return ['username', 'profile-pic', 'last-message'];
    }
    
}