publicDeviceId = '';
publicToken = '';
(() => {
    publicDeviceId = localStorage.getItem("publicDeviceId");
    publicToken = localStorage.getItem("publicToken");
})();

document.addEventListener("DOMContentLoaded", () => {
    init_iconsax();
});

function init_iconsax() {
    document.querySelectorAll(".iconsax").forEach(iconsax => {
        var TuT = iconsax.getAttribute("icon-name").toLowerCase().trim();
        fetch("../icons/" + TuT + ".svg")
            .then(n_n => {
                return n_n.text();
            })
            .then(n_n => {
                iconsax.innerHTML = n_n;
                if (iconsax.querySelectorAll("[http-equiv='Content-Security-Policy']").length) {
                    iconsax.innerHTML = "";
                }
            });
    });
}

function f_urlBack() {
    window.flutter_inappwebview.callHandler('f_urlBack', '');
}
$(window).on('popstate', function (e) {
    v
    alert('on popstate')
    var state = e.originalEvent.state;
    if (state !== null) {
    }
});

window.addEventListener('popstate', function (e) {
    alert('addEventListener popstate')
    var state = e.state;
    if (state !== null) {
    }
});

$(".close-modal, .modal-sandbox").click(function () {
    $(this).parent().closest('.modal').css({ "display": "none" });
});
function soketStart(connection, callback) {
    function startConnection() {
        connection.start().then(() => {
            if (callback)
                callback();
        }).catch(err => console.error(err.toString()));
    }
    connection.onclose((error) => {
        console.log("Connection closed.");
        if (error) {
            console.log("Error details: " + error);
        }
        // setTimeout(startConnection, 5000);
    });
    startConnection();
}