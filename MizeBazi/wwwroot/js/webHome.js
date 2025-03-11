$(".divMain").css({ "height": window.innerHeight / 4, "width": "100%" });
$(document).ready(function () {
    $('.divMain').on('click', function () {
        var link = $(this).data('link');
        if (link == 25)
            $("#btnTestKhande").css({ "display": "block" });
        else
            $("#btnTestKhande").css({ "display": "none" });
        var title = $(this).children(".spanName").text();
        $("#menuGame").css({ "display": "block" });
        $("#menuGame").find(".title").text(title);
        //window.flutter_inappwebview.callHandler('onUrlLink', link);
    });
});

