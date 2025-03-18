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

    connection.on("InitGameReceive", () => {
    });


    soketStart(connection, callbackSoketStart);
}

function callbackSoketStart() {
    $("#thisRoom").css("display", "none");
    $("#mainRoom").css("display", "block");
    mainSearch();
    updateRoom();
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
    roomInfo = JSON.parse(roomJson);
    let date = new Date(roomInfo.date);
    roomInfo.diffMinutes = diffMinutes(date);
    roomInfo.pDate = jalaali.toJalaali(date);

    usersInfo = JSON.parse(usersJson);
    usersInfo.forEach((item, index, arr) => {
        usersInfo[index].img = imgs[index];
    });
    updateRoom();
}

function UpdateReceive(b, connectionId, json, img) {

    if (b) {
        var user = JSON.parse(json);
        user.connectionId = connectionId;
        user.img = img;
        usersInfo.push(user);
    }
    else {
        //const newUsers = users.filter(user => user !== userToRemove);
        let rem = usersInfo.findIndex(x => x.connectionId == connectionId);
        if (rem !== -1) {
            usersInfo.splice(rem, 1);
        }
    }
    updateRoom();
}

$("#mainSearch").on("click", mainSearch);

$(".mainTopItem").on("click", function () {
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
});
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

function updateRoom() {
    if (state == 'main') {
        $("#thisRoom").css("display", "block");
        $("#mainRoom").css("display", "none");
        state = 'room';
    }
    setIconColor();
    function setIconColor() {
        var svgs = $('.roomTopUserImg svg');
        svgs.each(function () {
            var c = getRandomPastelColor();
            $(this).attr("fill", `${c}`)
        });
    }
}