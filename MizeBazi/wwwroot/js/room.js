var connection;
var state = 'main';
var mainObj = [];
var joinItem = null;
var roomInfo = null;
var usersInfo = null;

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${publicHubBaseUrl}/roomhub`, {
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets,
            withCredentials: false
        })
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("SearchReceive", SearchReceive);

    connection.on("CreateReceive", CreateReceive);

    connection.on("JoinReceive", JoinReceive);

    connection.on("UpdateReceive", UpdateReceive);

    connection.on("ExitReceive", callbackSoketStart);

    connection.on("DestroyReceive", () => { $("#destroyRoom").css("display", "block"); });

    connection.on("MessageReceive", MessageReceive);

    connection.on("InitGameReceive", () => {
    });


    soketStart(connection, callbackSoketStart);
}

function callbackSoketStart() {
    state = 'main';
    $(".modal").css("display", "none");
    $("#destroyRoom").css("display", "none");
    $("#thisRoom").css("display", "none");
    $("#mainRoom").css("display", "block");
    mainSearch();
}
document.addEventListener("DOMContentLoaded", () => {
    initSoket();
});

function mainSearch() {
    $("#mainList").html('');
    val = $('#inpMain').val();
    connection.invoke("Search", val);
}
function SearchReceive(json) {
    var obj = JSON.parse(json);
    val = $('#inpMain').val();
    if (val && val != '') {
        $("#mainList").append(`<div>جستجوی : ${val}</div>`);
    }
    if (obj.length == 0) {
        $("#mainList").append('<div>اتاقی یافت نشد</div>');
        return;
    }
    obj.map((item) => {
        let date = new Date(item.date); 
        item.diffMinutes = diffMinutes(date);
        var el = `<div class="mainRoomItem" roomId="${item.id}">`
            + `<div class="mainRoomHeder">${item.typeString}</div>`
            + `<div class="mainRoomName">نام اتاق: ${item.name}</div><div class="createName">ایجاد کننده: ${item.createName}</div>`
            + `<div class="mainRoomCount d-flex"><div>${item.count} نفر</div><div>${item.diffMinutes} دقیقه</div></div>`;
        $("#mainList").append(el);

    });
    mainObj = obj;
    $(".mainRoomItem").on("click", function () {
        var roomId = $(this).attr('roomId');
        joinItem = mainObj.find(x => x.id == roomId);
        $("#inpInsertPassword").val('');
        $("#insertName").text(joinItem.name);
        $("#insertPassword").css("display", "block");
    });
}

function CreateReceive(b, json) {
    if (!b) {
        $("#creatRoomfotter").css("display", "block");
        createRoomErro(json)
        return;
    } 

    var inpInsertPassword = $("#inpPassword").val();
    var obj = JSON.parse(json);
    connection.invoke("Join", publicToken, publicDeviceId, obj.id, inpInsertPassword);

}

function JoinReceive(b, roomJson, usersJson) {
    if (!b) {
        $("#insertPasswordErro").css("display", "block");
        $('#insertPasswordErro').html(roomJson);
        return;
    }

    $("#roomList").html('');
    $("#insertPassword").css("display", "none");
    $("#createRoom").css("display", "none");
    roomInfo = JSON.parse(roomJson);
    let date = new Date(roomInfo.date);
    roomInfo.diffMinutes = diffMinutes(date);
    roomInfo.pDate = jalaali.toJalaali(date);
    roomInfo.name = roomInfo.name.replaceAll('-', ' ');
    usersInfo = JSON.parse(usersJson);

    let userIndex = usersInfo.findIndex(x => x.connectionId == connection.connectionId);
    updateRoom(true, usersInfo[userIndex]);
}

function UpdateReceive(b, connectionId, json) {

    var user = JSON.parse(json);
    user.connectionId = connectionId;
    if (b) {
        usersInfo.push(user);
    }
    else {
        //const newUsers = users.filter(user => user !== userToRemove);
        let rem = usersInfo.findIndex(x => x.connectionId == connectionId);
        if (rem !== -1) {
            usersInfo.splice(rem, 1);
        }
    }

    updateRoom(b, user);
}

function mainTopItem() {
    var info = $(this).attr('info');
    if (info == 'back') {
        f_urlBack()
    }
    else if (info == 'createRoom') {
        $("#inpRoomName").val('');
        $("#inpPassword").val('');
        $("#createRoomErro").css("display", "none");
        $("#createRoom").css("display", "block");
        $("#creatRoomfotter").css("display", "block");
    }
    else if (info == 'back') {
    }
    else if (info == 'refresh') {
        $('#inpMain').val('');
        mainSearch();
    }
    else if (info == 'roomTopTrash') {
        $("#roomTrash").css("display", "block");
    }
    else if (info == 'mainTopCount') {
        $("#roomUserList").css("display", "block");
    }
    else if (info == 'exitRoom') {
        connection.invoke("Exit", roomInfo.id, roomInfo.kay);
    }

}
function createRoom() {
    $("#createRoomErro").css("display", "none");
    var inpPassword = $('#inpPassword').val();
    var inpRoomName = $('#inpRoomName').val();
    var inpType = $('#inpType').val();
    inpRoomName = inpRoomName.replaceAll(" ", "-");
    if (inpType.isNullOrEmpty()) {
        return createRoomErro("نوع انتخاب نشده");
    }

    if (inpPassword.isNullOrEmpty() || inpPassword.length < 3 || inpPassword.length > 25) {
        return createRoomErro("رمز عبور را صحیح وارد کنید");
    }

    if (!inpPassword.isOnlyLatin()) {
        return createRoomErro("رمز عبور باید از اعداد و حروف لاتین باشد");
    }

    if (inpRoomName.isNullOrEmpty() || inpRoomName.length < 3 || inpRoomName.length > 25) {
        return createRoomErro("نام را صحیح وارد کنید");
    }
    $("#creatRoomfotter").css("display", "none");
    connection.invoke("Create", publicToken, publicDeviceId, inpRoomName, inpPassword, Number(inpType));
}
function createRoomErro(v) {
    $("#createRoomErro").css("display", "block");
    $('#createRoomErro').html(v);
}

function joinRoom() {
    $("#insertPasswordErro").css("display", "none");
    var inpInsertPassword = $("#inpInsertPassword").val();
    connection.invoke("Join", publicToken, publicDeviceId, joinItem.id, inpInsertPassword);
}

function updateRoom(b, user) {
    checkState();
    setUsers();
    userNotif();
    function checkState() {
        if (state == 'main') {
            $(".mainTopItem[info='roomTopTrash']").css("display", "none");
            $("#roomTopTrashName").css("display", "none");
            $("#mainRoom").css("display", "none");

            $("#thisRoom").css("display", "block");
            state = 'room';
            if (roomInfo.creator) {
                $(".mainTopItem[info='roomTopTrash']").css("display", "block");
            } else {
                
                $("#roomTopTrashName").css("display", "block");
                $("#roomTopTrashName").html(`<div>ایجاد شده توسط</div><div>${roomInfo.createName}</div>`)
            }
        }
    }
    async function setUsers() {
        let elRoomTopUserList = ''
        for (let i = 0; i < roomInfo.count; i++) {
            if (usersInfo.length > i) {
                elRoomTopUserList += `<div class="roomTopUserImg"><img src="${usersInfo[i].img}90.jpg"></div>`;

            } else {
                elRoomTopUserList += `<div class="roomTopUserImg"><i class="icon-user-2"></i></div>`;
            }

        }
        $("#roomTopUserList").html(elRoomTopUserList);

        let elRoomUserListBody = '';
        usersInfo.map((x) => {
            elRoomUserListBody += `<div class="roomListUserImg"><div class="roomTopUserImg"><img src="${x.img}90.jpg"></div>`
                + `<div class="roomListUserMess"><div>${x.userName}</div><div>${x.name}</div></div></div>`;
        });

        $("#roomUserListBody").html(elRoomUserListBody);

        $(".mainTopItem[info='mainTopCount']").html(`<div style="color: var(--LinkColor);">${roomInfo.name}</div><div style="color: var(--TextColor2);">اعضای حاضر ${usersInfo.length} از ${roomInfo.count}</div>`);

        setTimeout(() => {
            setIconColor();
        }, "500");
    }

    function setIconColor() {
        var svgs = $('.roomTopUserImg svg');
        svgs.each(function () {
            var c = getRandomPastelColor();
            $(this).attr("fill", `${c}`)
        });
    }

    function userNotif() {
        if (user) {
            var el = '<div class="roomListUser"><div class="roomListUserImg">'
                + `<div class="roomTopUserImg"><img src="${user.img}90.jpg"></div>`
                + `<div class="roomListUserMess">${user.userName}</div></div><div class="roomListUserMess">`
                + `کاربر ${user.name} <span style="color: ${b == true ? "var(--SuccessColor)" : "var(--ErrorColor)"}; font-weight: bold;">${b == true ? "وارد" : "خارج" }</span> شد</div></div>`;

            $("#roomList").append(el);

                scrollEl('#roomList');
        }
    }
}

function sendMessage() {
    val = $('#inpMessage').val();
    if (!val.isNullOrEmpty()) {
        $('#inpMessage').val('');
        if (val.length > 200)
            val = val.slice(0, 200)
        connection.invoke("Message", roomInfo.id, roomInfo.kay, val);
    }
}
function MessageReceive(connectionId, mes) {
    let user = usersInfo.find((x) => x.connectionId == connectionId);
    let b = user.connectionId == connection.connectionId;

    if (!user)
        return;

    var el = `<div class="chatMain ${b == true ? 'myText': ''} d-flex">`;
    var chatImg = `<div class="chatImg"><div class="roomListUserImg"><div class="roomTopUserImg"><img src="${user.img}90.jpg" /></div></div><div class="chatUserName">${user.userName}</div></div>`;
    var chatText = `<div class="chatText"><div class="chatBox"><div class="chatInfo">${user.name}</div><div class="chatMsg">${mes}</div></div></div>`;

    el += (b == true ? chatText + chatImg : chatImg + chatText) + '</div>';

    $("#roomList").append(el);

        scrollEl('#roomList');
}

function trashRoom() {
    connection.invoke("Destroy", publicToken, publicDeviceId, roomInfo.name);
}

$(".mainTopItem").on("click", mainTopItem);

$("#mainSearch").on("click", mainSearch);

$("#sendMessage").on("click", sendMessage);


