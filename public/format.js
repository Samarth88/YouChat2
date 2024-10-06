function editProfileName()
{
    document.getElementById('profileName').disabled = false;
    document.getElementById('editName').style.display = 'none';
    document.getElementById('saveName').style.display = 'block';
    document.getElementById('profileName').focus();
}

function cancelEdit()
{
    document.getElementById('output').src = `/profilePics/${user.id}.png`;
    document.getElementById('profileName').value = user.name;

    document.getElementById('profileName').disabled = true;

    document.getElementById('savePic').style.display = 'none';
    document.getElementById('editPic').style.display = 'block'
    document.getElementById('saveName').style.display = 'none';
    document.getElementById('editName').style.display = 'block'
}

var loadFile = function(event) {
    isLoaded = 1;
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('output');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);

    document.getElementById('editPic').style.display = 'none';
    document.getElementById('savePic').style.display = 'block';

};

function editRoomProfileName()
{
    document.getElementById('roomProfileName').disabled = false;
    document.getElementById('editRoomName').style.display = 'none';
    document.getElementById('saveRoomName').style.display = 'block';
    document.getElementById('roomProfileName').focus();
}

function cancelRoomEdit()
{
    document.getElementById('outputRoom').src = `/roomProfilePics/${currentRoom}.png`;
    elem = document.getElementById('roomProfileName')
    elem.value = elem.dataset.realname;

    document.getElementById('roomProfileName').disabled = true;

    document.getElementById('saveRoomPic').style.display = 'none';
    document.getElementById('editRoomPic').style.display = 'block'
    document.getElementById('saveRoomName').style.display = 'none';
    document.getElementById('editRoomName').style.display = 'block'
}

var loadRoomFile = function(event) {
    isLoaded = 1;
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('outputRoom');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);

    document.getElementById('editRoomPic').style.display = 'none';
    document.getElementById('saveRoomPic').style.display = 'block';
};



function myFunction() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function shortenMessage(str){
    if( str.length > 40 )
        str = str.substring(0,40);

    str = str+'....'
    return str;
}

function formatDate(d,position='message'){

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();

    var ampm;
    var hours = d.getHours();

    if( hours > 12 ){
        ampm = 'PM';
        hours = hours-12;
    }else{
        ampm = 'AM';
    }

    hours = ("0" + hours).slice(-2);

    if( position == 'message')
        return String(hours) + ':' + String(("0" + d.getMinutes()).slice(-2)) + ' ' + ampm + ' | ' + String(monthNames[d.getMonth()]) + ' ' + String(d.getDate()) + ',' + String(d.getFullYear());

    if( d.getFullYear() == today.getFullYear() && d.getMonth() == today.getMonth() )
    {
        if( d.getDate() == today.getDate() )
            return String(hours) + ':' + String(("0" + d.getMinutes()).slice(-2)) + ' ' + ampm;
        else if(d.getDate() + 1  == today.getDate())
            return 'yesterday';
        else 
            return  String(d.getDate()) + '/' + String(d.getMonth()+1) + '/' + String(d.getFullYear())
    }
}
