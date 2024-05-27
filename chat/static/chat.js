const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id')
const msgList = document.getElementById("message-list")
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')
const fileInput = document.getElementById('file-input')
const formData = new FormData();
formData.append('csrfmiddlewaretoken', csrftoken)

let tmp_data
let upload_file = false
let socket = new WebSocket(`ws://localhost:8000/ws/chat/room/`)
let is_typing = false


