const socket = io();

socket.emit('joinRooms',{rooms:user.rooms, userId: user.id});

socket.on('online-users', data => {
    onlineUsers = data.onlineUsers;
    // console.log('In socket ',onlineUsers)
});

socket.on('online' , data => {
    console.log('online')
    onlineUsers[data.userId] = 1;

    const elem = document.getElementById(data.userId);
    if( elem )
    {
        elem.getElementsByTagName('i')[0].style.color = '#22ff22';
    }

    if(currentRoom != null)
    {
        roomIndex = user.rooms.findIndex(x => x.id == currentRoom);
        userIndex = user.rooms[roomIndex].users.findIndex( x => x == data.userId);

        if(userIndex > -1)
        {
            spans = document.getElementById('roomNameContainer').getElementsByTagName('span');
            spans[1].innerText = String(parseInt(spans[1].innerText)+1);
        }
    }
        
})

socket.on('offline' , id => {
    console.log('offline')
    if( id != user.id )
    {
        onlineUsers[id] = 0;
        const elem = document.getElementById(id);
        if( elem )
        {
            elem.getElementsByTagName('i')[0].style.color = 'red';
        }
        if(currentRoom != null)
        {
            roomIndex = user.rooms.findIndex(x => x.id == currentRoom);
            userIndex = user.rooms[roomIndex].users.findIndex( x => x == id);

            if(userIndex > -1)
            {
                spans = document.getElementById('roomNameContainer').getElementsByTagName('span');
                spans[1].innerText = String(parseInt(spans[1].innerText)-1);
            }
        }
    }
})

socket.on('user-joined' , (data) => {
    document.getElementById(data.roomId+'ChatBox').innerHTML += `<div class="botMsgContainer"><p class="botMsg">${data.userName} joined</p></div>`;

    displayMessage = shortenMessage(`${data.userName} joined`);
    document.getElementById(data.roomId).getElementsByTagName('p')[0].innerText = displayMessage;
    displayDate = formatDate(new Date(data.Date),'roomlist');
    document.getElementById(data.roomId).getElementsByTagName('small')[0].innerText = displayDate;

    onlineUsers[data.userId] = 1;

    user.rooms[user.rooms.findIndex(x => x.id == data.roomId)].users.push(data.userId);
    
    if( currentRoom == data.roomId )
    {
        document.getElementById('myUL').innerHTML +=  `<li id="${data.userId}" class="list-group-item">
                                                        <div class="img-cropper-small">
                                                            <img src="/profilePics/${data.userId}.png" alt="user">
                                                        </div>
                                                        <i style="position: absolute;left: 52px;top: 43px;color: #22ff22;"class="fa fa-circle" aria-hidden="true"></i>
                                                        ${data.userName}
                                                        </li>`;

        spans = document.getElementById('roomNameContainer').getElementsByTagName('span');
        spans[0].innerText = String(parseInt(spans[0].innerText)+1);
    }

    console.log(`${data.userName} joined ${data.roomId}`);
})

typingArea.addEventListener('submit', (e) => {

    e.preventDefault();

    //Get message text 
    const msg = e.target.elements.msg.value;

    const message = {
        msg: msg,
        userSent :user.id,
        Date: new Date()
    }

    //emitting the sent message
    socket.emit('sent-message', { message:message,room:currentRoom });

    displayDate = formatDate(message.Date);
    displayDateRoomList = formatDate(message.Date,'roomlist')

    chatBox = document.getElementById(currentRoom+'ChatBox');
    chatBox.innerHTML += `<div class="media w-50 ml-auto mb-3"><div class="media-body"><div class="bg-primary rounded py-2 px-3 mb-2"><p class="text-small mb-0 text-white">${message.msg}</p></div><p class="small text-muted">${displayDate}</p></div></div>`;
    
    displayMessage = shortenMessage(`${user.name}: ${msg}`);
    document.getElementById(currentRoom).getElementsByTagName('p')[0].innerText = displayMessage;
    document.getElementById(currentRoom).getElementsByTagName('small')[0].innerText = displayDateRoomList;

    firstChild = document.getElementById(currentRoom).parentElement.childNodes[0];
    document.getElementById(currentRoom).parentElement.insertBefore(document.getElementById(currentRoom),firstChild);

    shouldScroll = chatBox.scrollTop + chatBox.clientHeight === chatBox.scrollHeight;
    if (!shouldScroll) {
        scrollToBottom(chatBox);
    }
    
    //making the message box blank 
    e.target.elements.msg.value = '';
});

socket.on('message' , (data) => {
    chatBox = document.getElementById(data.room+'ChatBox');

    displayDate = formatDate(new Date(data.message.Date));
    displayDateRoomList = formatDate(new Date(data.message.Date),'roomlist')
    displayMessage = shortenMessage(`${user.userInfo[data.message.userSent].name}: ${data.message.msg}`);

    chatBox.innerHTML +=`<div class="media w-50 mb-3">
                            <div class="img-cropper-small">
                                <img src="/profilePics/${data.message.userSent}.png" alt="user">
                            </div>
                            <div class="media-body ml-3">
                                <p style="margin-bottom: 0;color: #3a6d99;">${user.userInfo[data.message.userSent].name}</p>
                                <div class="bg-light rounded py-2 px-3 mb-2">
                                    <p class="text-small mb-0 text-muted">${data.message.msg}</p>
                                </div>
                                <p class="small text-muted">${displayDate}</p>
                            </div>
                        </div>`;

    document.getElementById(data.room).getElementsByTagName('p')[0].innerText = displayMessage;
    document.getElementById(data.room).getElementsByTagName('small')[0].innerText = displayDateRoomList;

    firstChild = document.getElementById(data.room).parentElement.childNodes[0];
    document.getElementById(data.room).parentElement.insertBefore(document.getElementById(data.room),firstChild);

    shouldScroll = chatBox.scrollTop + chatBox.clientHeight === chatBox.scrollHeight;
    if (!shouldScroll) {
        scrollToBottom(chatBox);
    }

});

document.getElementById('leaveroom').addEventListener('click' , (e) => {
    e.preventDefault();

    user.rooms.splice(user.rooms.findIndex( x => x.id == currentRoom ),1);
    if(user.rooms.length == 0 )
        document.getElementById('noRoomMessage').style.display = 'block';

    topBarChatBox.style.display = 'none';
    typingArea.style.display = 'none';
    startMessage.style.display = 'flex';

    document.getElementById(currentRoom).remove();
    document.getElementById(currentRoom+'ChatBox').remove();

    socket.emit('leave-room' , {id:user.id, name: user.name, room:currentRoom});

    currentRoom = null;
});

socket.on('user-left', data => {
    console.log('user left ', data);
    document.getElementById(data.room+'ChatBox').innerHTML += `<div class="botMsgContainer"><p class="botMsg">${data.name} left</p></div>`;

    displayMessage = shortenMessage(`${data.name} left`);
    document.getElementById(currentRoom).getElementsByTagName('p')[0].innerText = displayMessage;
    displayDate = formatDate(new Date(data.Date),'roomlist');
    document.getElementById(currentRoom).getElementsByTagName('small')[0].innerText = `${displayDate}`;

    roomIndex = user.rooms.findIndex(x => x.id == data.room);
    userIndex = user.rooms[roomIndex].users.findIndex( x => x == data.id);
    user.rooms[roomIndex].users.splice(userIndex,1);


    if( currentRoom == data.room )
    {
        elem = document.getElementById(data.id);
        if(elem)
        {
            elem.remove();
        }

        spans = document.getElementById('roomNameContainer').getElementsByTagName('span');
        spans[0].innerText = String(parseInt(spans[0].innerText)-1);
        spans[1].innerText = String(parseInt(spans[1].innerText)-1);
    }
})