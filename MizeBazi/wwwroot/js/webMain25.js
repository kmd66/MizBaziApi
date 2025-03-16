var connection;
function getRandomPastelColor() {
    // تولید مقادیر تصادفی برای RGB با روشنایی بالا
    const r = Math.floor(Math.random() * 128) + 128; // محدوده 128 تا 255
    const g = Math.floor(Math.random() * 128) + 128; // محدوده 128 تا 255
    const b = Math.floor(Math.random() * 128) + 128; // محدوده 128 تا 255

    // تبدیل به فرمت HEX
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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
