$(".divMain").css({ "height": window.innerHeight / 4, "width": "100%" });
$(document).ready(function () {
    $('.divMain').on('click', function () {
        var link = $(this).data('link');
        window.flutter_inappwebview.callHandler('onUrlLink', link);
    });
});