const template = document.createElement('template');

template.innerHTML = /*html*/ `
    <style>
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    </style>
    
    <div class="modal fade" id="inviteModal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="inviteModalLabel">Invite to Game</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Would you like to invite this user to play a game?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="sendInviteBtn">Send Invite</button>
                </div>
            </div>
        </div>
    </div>
`;

export class inviteModal extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.modal = null;
    }

    async connectedCallback() {
        // Wait for Bootstrap to be loaded
        await this.loadBootstrap();
        
        this.modal = new window.bootstrap.Modal(this.shadowRoot.querySelector('#inviteModal'));
        this.modal.show();

        this.shadowRoot.querySelector('#sendInviteBtn').addEventListener('click', this.sendInvite.bind(this));
        this.shadowRoot.querySelector('#inviteModal').addEventListener('hidden.bs.modal', this.handleModalHidden.bind(this));
    }

    async loadBootstrap() {
        if (typeof window.bootstrap === 'undefined') {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        }
    }

    sendInvite() {
        // Implement the logic to send the game invite
        console.log('Sending game invite...');
        this.modal.hide();
    }

    handleModalHidden() {
        this.dispatchEvent(new CustomEvent('modalClosed'));
    }

    disconnectedCallback() {
        if (this.modal) {
            this.modal.dispose();
        }
    }
}