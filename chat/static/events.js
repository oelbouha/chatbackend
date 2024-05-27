socket.onopen = () => {
    console.log("socket accepted")
}


socket.onmessage = (e) => {
    const data = JSON.parse(e.data)
    const msgList = document.getElementById("message-list")
    console.log(data)
    if (data.m == 'st')
        handle_sent(msgList, data)
    else if (data.m == 'msg')
        handle_message(msgList, data)
    else if (data.m == 'recv')
        handle_recieved(data)
    else if (data.m == 'sn')
        handle_seen(data)
    else if (data.m == 'typ')
        handle_typing()
    else if (data.m == 'styp')
        handle_stop_typing()
}


socket.onclose = (e) => {
    console.log(e)
}


messageInput.oninput = () => {
    if (messageInput.value.length == 0) {
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
        }
        socket.send(JSON.stringify(data))
    }
}


fileInput.addEventListener('change', function () {

    var fileName = this.files[0] ? this.files[0].name : '';
    document.getElementById('attachment-button').textContent = fileName;
    upload_file = true
});