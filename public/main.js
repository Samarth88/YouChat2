function scrollToBottom(chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
}

if(user.rooms.length == 0 )
    document.getElementById('noRoomMessage').style.display = 'block';

user.rooms.forEach(room => {

    document.getElementById(room.id).addEventListener('mousedown', (e) => {
        e.preventDefault();

        currentRoom = room.id;
        console.log(currentRoom)
        topBarChatBox.style.display = 'flex';
        //
        typingArea.style.display = 'block';
        startMessage.style.display = 'none';
        roomDescription = document.getElementById('roomDescription');

        user.rooms.forEach(room1 => {
            document.getElementById(room1.id+'ChatBox').style.display = 'none'
            document.getElementById(room1.id).getElementsByTagName('a')[0].classList.remove('active');
            document.getElementById(room1.id).getElementsByTagName('a')[0].classList.remove('text-white');
            document.getElementById(room1.id).getElementsByTagName('a')[0].classList.add('list-group-item-light');

            document.getElementById(room1.id).getElementsByTagName('p')[0].classList.add('text-muted');
        });

        document.getElementById(room.id+'ChatBox').style.display = 'block'
        scrollToBottom(document.getElementById(room.id+'ChatBox'))
        roomName.innerText =  room.name;

        document.getElementById(room.id).getElementsByTagName('a')[0].classList.add('active');
        document.getElementById(room.id).getElementsByTagName('a')[0].classList.add('text-white');
        document.getElementById(room.id).getElementsByTagName('a')[0].classList.remove('list-group-item-light');

        document.getElementById(room.id).getElementsByTagName('p')[0].classList.remove('text-muted');

        //
        document.getElementById('roomNameForm').getElementsByTagName('input')[1].value = room.name;
        document.getElementById('roomNameForm').getElementsByTagName('input')[1].dataset.realname = room.name;
        document.getElementById('roomId').value = room.id;
        document.getElementById('roomNameForm').getElementsByTagName('input')[0].value = room.id;
        //
        myUL = document.getElementById('myUL');
        myUL.innerHTML = '';

        console.log(onlineUsers);
        count = 0;
        room.users.forEach( member => {
            if( onlineUsers[member])
            {
                count = count+1;
                myUL.innerHTML +=  `<li id="${member}" class="list-group-item">
                                        <div class="img-cropper-small">
                                            <img src="/profilePics/icon.png" alt="user">
                                        </div>
                                    <i style="position: absolute;left: 52px;top: 43px;color: #22ff22;"class="fa fa-circle" aria-hidden="true"></i>
                                    ${user.userInfo[member].name}
                                </li>`;
            }
            else
            {
                myUL.innerHTML +=  `<li id="${member}" class="list-group-item">
                                        <div class="img-cropper-small">
                                            <img src="/profilePics/icon.png" alt="user">
                                        </div>
                                    <i style="position: absolute;left: 52px;top: 43px;color: red;"class="fa fa-circle" aria-hidden="true"></i>
                                    ${user.userInfo[member].name}
                                </li>`;
            }
        })

        document.getElementById('roomNameContainer').getElementsByTagName('span')[0].innerText = room.users.length;
        document.getElementById('roomNameContainer').getElementsByTagName('span')[1].innerText = count;
    })
});