var connection;

function initSoket() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl(publicHubBaseUrl + connectionLink)
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
        $('#userCount').text(`${obj.length} نفر`);
        var itemImg = $('.itemMain .itemImg');
        itemImg.each(function () {
            $(this).html(`<i class="icon-user-2"></i>`);
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
    var svgs = $('.itemImg i');
    svgs.each(function () {
        var c = getRandomPastelColor();
        $(this).css("color", `${c}`);
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
    addHelp(0);
});

function addHelp(i) {
    const helpEl = document.getElementById(`help`);
    const commentEl = document.querySelectorAll(`#comment span`);
    if (i >= commentEl.length)
        i = 0;
    helpEl.innerHTML = commentEl[i].innerHTML;

    setTimeout(() => {
        i++;
        addHelp(i);
    }, "5000");
}