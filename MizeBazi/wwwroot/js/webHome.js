let _link;

$(".divMain").css({ "height": window.innerHeight / 4, "width": "100%" });

$(document).ready(function () {
    $('.divMain').on('click', function () {
        _link = $(this).data('link');
        if (_link == 25)
            $("#btnTestKhande").css({ "display": "block" });
        else
            $("#btnTestKhande").css({ "display": "none" });
        var title = $(this).children(".spanName").text();
        $("#menuGame").css({ "display": "block" });
        $("#menuGame").find(".title").text(title);
        //window.flutter_inappwebview.callHandler('onUrlLink', link);
    });
});

function f_urlHelp() {
    window.flutter_inappwebview.callHandler('f_urlHelp', _link);
}
function f_urlMain() {
    window.flutter_inappwebview.callHandler('f_urlMain', _link);
}
function f_testKhande() {
    window.flutter_inappwebview.callHandler('f_testKhande', _link);
}
function createRoom() {
    $("#menuGame").css({ "display": "none" });
    $("#createRoom").css({ "display": "block" });
}
function joinRoom() {
    $("#menuGame").css({ "display": "none" });
    $("#joinRoom").css({ "display": "block" });
}

