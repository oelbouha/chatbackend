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

socket.onopen = () => {
    console.log("socket accepted")
}


function sent(msgList, data) {
    if (data.tp == 'msg')
        msgList.innerHTML += `<li class="message sender" id="${data.msg}"><span>sent</span>${messageInput.value}</li>`
    else if (data.tp == 'atta')
    {

        msgList.innerHTML += `
            <div class="attachment-message">
                    <div class="attachment-name">${fileInput.files[0].name}</div>
                    <div class="attachment-caption">${tmp_data.cap}</div>
            </div>
        `
    }
    messageInput.value = ""
}


function recieved(data) {
    msgSpan = document.getElementById(`${data.msg}`).children[0]
    msgSpan.innerHTML = 'recv'
}

function message(msgList, data) {
    messageInput.placeholder = "Type your message..."
    msgList.innerHTML += `<li class="message" id="${data.msg}">${data.cnt}</li>`
    const recv = {
        m: 'recv',
        clt: id,
        msg: data.msg
    }
    const seen = {
        m: 'sn',
        clt: id,
        msg: data.msg
    }
    setTimeout(() => socket.send(JSON.stringify(recv)), 1000)
    setTimeout(() => socket.send(JSON.stringify(seen)), 2000)

}

function seen(data) {
    msgSpan = document.getElementById(`${data.msg}`).children[0]
    msgSpan.innerHTML = 'seen'
}

function typing() {
    messageInput.placeholder = "typing..."
}

function stop_typing() {
    messageInput.placeholder = "Type your message..."
}


function send_file() {
    const file = fileInput.files[0]
    console.log(file, csrftoken)
    formData.append('file', file);
    fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('File upload failed');
            }
        })
        .then(data => {
            is_typing = !is_typing
            tmp_data = {
                m: 'atta',
                clt: id,
                f: data.id,
                cap: messageInput.value,
                atta: null
            }
            socket.send(JSON.stringify(tmp_data))
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });

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
    else if (data.m == 'sn')
        seen(data)
    else if (data.m == 'typ')
        typing()
    else if (data.m == 'styp')
        stop_typing()
}

socket.onclose = (e) => {
    console.log(e)
}

var is_typing = false
messageInput.oninput = () => {
    if (messageInput.value.length == 0) {
        console.log("stop typing")
        typ = {
            m: 'styp',
            clt: id
        }
        socket.send(JSON.stringify(typ))
        is_typing = !is_typing
    }
    else if (!is_typing) {
        typ = {
            m: 'typ',
            clt: id
        }
        socket.send(JSON.stringify(typ))
        is_typing = !is_typing
    }
}

sendButton.onclick = () => {

    if (upload_file)
        send_file(id, messageInput.value)
    else {
        is_typing = !is_typing
        var data = {
            m: 'msg',
            clt: id,
            tp: 'txt',
            cnt: messageInput.value,
            msg: null
        }
        socket.send(JSON.stringify(data))
    }
}


fileInput.addEventListener('change', function () {

    var fileName = this.files[0] ? this.files[0].name : '';
    document.getElementById('attachment-button').textContent = fileName;
    upload_file = true
});

