var connection;
var state = 'main';
var mainObj = [];
var joinItem = null;
var roomInfo = null;
var usersInfo = null;

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/room")
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("SearchReceive", SearchReceive);

    connection.on("CreateReceive", CreateReceive);

    connection.on("JoinReceive", JoinReceive);

    connection.on("UpdateReceive", UpdateReceive);

    connection.on("ExitReceive", callbackSoketStart);

    connection.on("InitGameReceive", () => {
    });


    soketStart(connection, callbackSoketStart);
}

function callbackSoketStart() {
    state = 'main';
    $("#thisRoom").css("display", "none");
    $("#mainRoom").css("display", "block");
    mainSearch();
}
document.addEventListener("DOMContentLoaded", () => {
    initSoket();
});

function mainSearch() {
    var info = $(this).attr('class');
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
    roomInfo = JSON.parse(json);

}

function JoinReceive(b, roomJson, usersJson, imgs) {
    if (!b) {
        $("#insertPasswordErro").css("display", "block");
        $('#insertPasswordErro').html(roomJson);
        return;
    }

    $("#insertPassword").css("display", "none");
    roomInfo = JSON.parse(roomJson);
    let date = new Date(roomInfo.date);
    roomInfo.diffMinutes = diffMinutes(date);
    roomInfo.pDate = jalaali.toJalaali(date);

    usersInfo = JSON.parse(usersJson);
    usersInfo.forEach((item, index, arr) => {
        usersInfo[index].img = imgs[index];
        usersInfo[index].imgBbase64= uint8ArrayToBase64(imgs[index]);
    });

    let userIndex = usersInfo.findIndex(x => x.connectionId == connection.connectionId);
    updateRoom(true, usersInfo[userIndex]);
}

function UpdateReceive(b, connectionId, json, img) {

    var user = JSON.parse(json);
    user.connectionId = connectionId;
    user.img = img;
    user.imgBbase64 = uint8ArrayToBase64(img);
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
    if (info == 'createRoom') {
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
}
function createRoom() {
    $("#createRoomErro").css("display", "none");
    var inpPassword = $('#inpPassword').val();
    var inpRoomName = $('#inpRoomName').val();
    var inpType = $('#inpType').val();
    inpRoomName = inpRoomName.replaceAll(" ", "-");

    if (isNullOrEmpty(inpType)) {
        return createRoomErro("نوع انتخاب نشده");
    }

    if (isNullOrEmpty(inpPassword) || inpPassword.length < 3 || inpPassword.length > 25) {
        return createRoomErro("رمز عبور را صحیح وارد کنید");
    }

    if (!isOnlyLatin(inpPassword)) {
        return createRoomErro("رمز عبور باید از اعداد و حروف لاتین باشد");
    }

    if (isNullOrEmpty(inpRoomName) || inpRoomName.length < 3 || inpRoomName.length > 25) {
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
            $("#roomTopTrash").css("display", "none");
            $("#thisRoom").css("display", "block");
            $("#mainRoom").css("display", "none");
            state = 'room';
            if (roomInfo.creator) {
                $("#roomTopTrash").css("display", "block");
                $("#roomTopTrashName").css("display", "none");
            } else {
                
                $("#roomTopTrash").css("display", "none");
                $("#roomTopTrashName").css("display", "block");
                $("#roomTopTrashName").html(`<div>ایجاد شده توسط</div><div>${roomInfo.createName}</div>`)
            }
        }
    }
    async function setUsers() {
        var icon = await iconsaxByName("user-2");
        let elRoomTopUserList = ''
        for (let i = 0; i < roomInfo.count; i++) {
            if (usersInfo.length > i) {
                elRoomTopUserList += `<div class="roomTopUserImg"><img src="data:image/png;base64,${usersInfo[i].imgBbase64}" /></div>`;

            } else {
                elRoomTopUserList += `<div class="roomTopUserImg"><i class="iconsax" icon-name="user-2">${icon}</i></div>`;
            }

        }
        $("#roomTopUserList").html(elRoomTopUserList);

        let elRoomUserListBody = '';
        usersInfo.map((x) => {
            elRoomUserListBody += `<div class="roomListUserImg"><div class="roomTopUserImg"><img src="data:image/png;base64,${x.imgBbase64}" /></div>`
                + `<div class="roomListUserMess"><div>${x.userName}</div><div>${x.name}</div></div></div>`;
        });

        $("#roomUserListBody").html(elRoomUserListBody);

        $("#mainTopCount").html(`اعضای حاضر ${usersInfo.length} از ${roomInfo.count}`);

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
                + `<div class="roomTopUserImg"><img src="data:image/png;base64,${user.imgBbase64}" /></div>`
                + `<div class="roomListUserMess">${user.userName}</div></div><div class="roomListUserMess">`
                + `کاربر ${user.name} <span style="color: ${b == true ? "var(--SuccessColor)" : "var(--ErrorColor)"}; font-weight: bold;">${b == true ? "وارد" : "خارج" }</span> شد</div></div>`;

            $("#roomList").append(el);


            setTimeout(() => {
                scroll();
            }, "500");
            function scroll() {
                var outerHeight = $('#roomList').outerHeight(true);
                var scrollTop = $('#roomList').scrollTop();
                var scrollHeight = $('#roomList')[0].scrollHeight;
                var h2_3 = outerHeight - (outerHeight / 5);
                var outerscrollTop = outerHeight + scrollTop;

                var t = scrollHeight - outerscrollTop;
                if (t < h2_3) {
                    $('#roomList').animate({
                        scrollTop: scrollHeight
                    }, 1000);
                }
            }

        }
    }
}

function sendMessage() {
    var outerHeight = $('#roomList').outerHeight(true);
    var scrollTop = $('#roomList').scrollTop();
    var scrollHeight = $('#roomList')[0].scrollHeight;
    var h2_3 = outerHeight - (outerHeight / 3 );
    var outerscrollTop = outerHeight + scrollTop;

    var t = scrollHeight - outerscrollTop;
    console.log(`${t} - ${h2_3} - ${t < h2_3}`);
    if (t < h2_3) {
            $('#roomList').animate({
                scrollTop: scrollHeight
            }, 1000);
    }
}
function exitRoom() {
    connection.invoke("Exit", roomInfo.kay);
}
function mainTopCount() {
    $("#roomUserList").css("display", "block");
}

function roomTopTrash() {
    $("#roomTrash").css("display", "block");
}
function trashRoom() {
    debugger
}

$("#mainSearch").on("click", mainSearch);

$(".mainTopItem").on("click", mainTopItem);

$("#sendMessage").on("click", sendMessage);

$("#exitRoom").on("click", exitRoom);

$("#mainTopCount").on("click", mainTopCount);

$("#roomTopTrash").on("click", roomTopTrash);