var connection;
var state = 'main';

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/room")
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("SearchReceive", SearchReceive);

    connection.on("InitGameReceive", () => {
    });


    soketStart(connection, callbackSoketStart);
}

function callbackSoketStart() {
    if (state == 'main') {
        $("#thisRoom").css("display", "none");
        $("#mainRoom").css("display", "block");
        mainSearch();
    }
    else {
        $("#mainRoom").css("display", "none");
        $("#thisRoom").css("display", "block");
        connection.invoke("Init", publicToken, publicDeviceId);
    }
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
function SearchReceive(count, json) {
    const obj = JSON.parse(json);
    val = $('#inpMain').val();
    if (val && val != '') {
        $("#mainList").append(`<div>جستجوی : ${val}</div>`);
    }
    if (obj.length == 0) {
        $("#mainList").append('<div>اتاقی یافت نشد</div>');
        return;
    }
}
$("#mainSearch").on("click", mainSearch);

$(".mainTopItem").on("click", function () {
    var info = $(this).attr('info');
    if (info == 'refresh') {
        $('#inpMain').val('');
        mainSearch();
    }
    else if (info == 'back') {
    }
    else if (info == 'createRoom') {
        $("#createRoom").css({ "display": "block" });
    }
}); 
