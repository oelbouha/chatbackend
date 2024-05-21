const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id')
const msgList = document.getElementById("message-list")
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')


let socket = new WebSocket(`ws://localhost:8000/ws/chat/room/`)
socket.onopen = () => {
    console.log("socket accepted")
}


socket.onmessage = (e) => {
    const data = JSON.parse(e.data)
    console.log(data)
}

socket.onclose = (e) => {
    console.log(e)
}

sendButton.onclick = () => {
    var data = {
        m: 'msg',
        clt: id,
        tp: 'txt',
        cnt: messageInput.value
    }
    socket.send(JSON.stringify(data))
    messageInput.value = ""
}