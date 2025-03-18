var connection;

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/nabardkhandehub")
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("InitReceive", (json) => {
        const obj = JSON.parse(json);
        setList(obj);
    });

    connection.on("InitGameReceive", () => {
        alert('InitGameReceive')
    });

    function callbackSoketStart() {
        setList(null);
        setIconColor();
        connection.invoke("Init", publicToken, publicDeviceId);
    }

    soketStart(connection, callbackSoketStart);
}

function setList(obj) {
    if (obj != null) {
        $('#userCount').text(`${obj.length} نفر`);
        var itemName = $('.itemMain .itemName');
        var userName = $('.itemMain .userName');
        itemName.text('*');
        userName.text('*');
        obj.forEach((num, index, arr) => {
             $(itemName[index]).text(num.name);
            $(userName[index]).text(num.userName);
        });
    }
}

function setIconColor() {
    var svgs = $('.itemImg svg');
    svgs.each(function () {
        var c = getRandomPastelColor();
        $(this).attr("fill", `${c}`)
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initSoket();    
});
