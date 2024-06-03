
function handle_sent(msgList, data) {
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


function handle_recieved(data) {
    msgSpan = document.getElementById(`${data.msg}`).children[0]
    msgSpan.innerHTML = 'recv'
}


function handle_message(msgList, data) {
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


function handle_seen(data) {
    msgSpan = document.getElementById(`${data.msg}`).children[0]
    msgSpan.innerHTML = 'seen'
}


function handle_typing() {
    messageInput.placeholder = "typing..."
}


function handle_stop_typing() {
    messageInput.placeholder = "Type your message..."
}


function send_file(type) {
    const file = fileInput.files[0]
    formData.append('file', file);
    formData.append('type', 'vd');


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
                m: 'msg',
                clt: id,
                tp: 'img',
                cnt: JSON.stringify(data),
            }
            socket.send(JSON.stringify(tmp_data))
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });

}