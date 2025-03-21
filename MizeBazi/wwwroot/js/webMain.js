var connection;

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl(connectionLink)
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();

    connection.on("InitReceive", (json) => {
        const obj = JSON.parse(json);
        setList(obj);
    });

    connection.on("InitGameReceive", (link) => {
        alert('InitGameReceive')
    });

    function callbackSoketStart() {
        setList(null);
        setIconColor();
        connection.invoke("Init", publicToken, publicDeviceId);
    }

    soketStart(connection, callbackSoketStart);
}

async function setList(obj) {
    if (obj != null) {
        var icon = await iconsaxByName("user-2");
        $('#userCount').text(`${obj.length} نفر`);
        var itemImg = $('.itemMain .itemImg');
        itemImg.each(function () {
            $(this).html(`<i class="iconsax" icon-name="user-2">${icon}</i>`);
        });

        setIconColor();

        var itemName = $('.itemMain .itemName');
        var userName = $('.itemMain .userName');
        itemName.text('*');
        userName.text('*');
        obj.forEach((num, index, arr) => {
            $(itemImg[index]).html(`<img src="${num.img}90.jpg">`);
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

let dFlexCount = Math.floor((10 - gameCount) / 2);
if (dFlexCount > 0) {
    var dFlex = $("#mainList .d-flex").slice(dFlexCount * -1);
    $(dFlex).addClass('d-none');
}
$('#mainList .itemMain').each(function () {
    if (gameCount > 0) {
        $(this).css("display", "block");
    }
    gameCount = gameCount - 1;
});

document.addEventListener("DOMContentLoaded", () => {
    initSoket();    
});
