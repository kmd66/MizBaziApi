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

function f_UrlHelp() {
    window.flutter_inappwebview.callHandler('f_urlHelp', _link);
}
function f_UrlMain() {
    window.flutter_inappwebview.callHandler('f_urlMain', _link);
}
function f_testKhande() {
    window.flutter_inappwebview.callHandler('f_testKhande');
}
function f_joinRoom() {
    window.flutter_inappwebview.callHandler('f_joinRoom');
}

