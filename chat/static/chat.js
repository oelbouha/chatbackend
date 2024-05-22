const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id')
const msgList = document.getElementById("message-list")
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')


let socket = new WebSocket(`ws://localhost:8000/ws/chat/room/`)
socket.onopen = () => {
    console.log("socket accepted")
}


function sent(msgList, data) {
    msgList.innerHTML +=  `<li class="message sender" id="${data.msg}"><span>sent</span>${messageInput.value}</li>`
    messageInput.value = ""
}

function recieved(data) {
    msgSpan = document.getElementById(`${data.msg}`).children[0]
    setTimeout(() => msgSpan.innerHTML = 'recv', 3000)
}

function message(msgList, data) {
    msgList.innerHTML +=  `<li class="message" id="${data.msg}">${data.cnt}</li>`
    const recv = {
        m: 'recv',
        clt: id,
        msg: data.msg
    }
    socket.send(JSON.stringify(recv))
}

function seen() {

}


socket.onmessage = (e) => {
    const data = JSON.parse(e.data)
    const msgList = document.getElementById("message-list")
    console.log(data.m)
    if (data.m == 'st')
        sent(msgList, data)
    else if (data.m == 'msg')
        message(msgList, data)
    else if (data.m == 'recv')
        recieved(data)
}

socket.onclose = (e) => {
    console.log(e)
}

sendButton.onclick = () => {
    var data = {
        m: 'msg',
        clt: id,
        tp: 'txt',
        cnt: messageInput.value,
        msg: null
    }
    socket.send(JSON.stringify(data))
}