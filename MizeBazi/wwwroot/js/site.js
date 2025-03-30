publicDeviceId = '';
publicToken = '';
(() => {
    if (!publicToken) { 
        publicDeviceId = localStorage.getItem("publicDeviceId");
        publicToken = localStorage.getItem("publicToken");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    selectBtn();
    init_iconsax();
    inputs();
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
async function iconsaxByName(iconName) {
    const response = await fetch("../icons/" + iconName + ".svg");
    var data = await response.text();
    return data;
}
function inputs() {
    $("input").attr("autocomplete", `off`)
    $(".form__field").each(function () {
        $(this).after(`<label class="form__label">${$(this).attr('placeholder')}</label>`);
    });
    $(".form__label").on("click", function () {
        var p = $(this).parent();
        $(p).find('input:first')[0].focus();
    });
}
function selectBtn() {
    $(".selectBtn").each(function () {
        var id = 'itms' + Math.random().toString(36).replace(/[^A-Za-z0-9]+/g, '').substr(2, 10);

        var attr = $(this).attr(`data`);
        var attr = $(this).attr(`data`);
        var attr = $(this).attr(`data`);
        $(this).html(`<input id="${$(this).attr('inputId')}" type="hidden"/><div style="text-align: center;"><span>${$(this).attr('placeholder') }</span> <i class="iconsax" icon-name="${$(this).attr('icon')}"></i></div>`);

        $(this).attr(`fromItems`, id);
        var attr = $(this).attr(`data`);
        attr = attr.replace(/'/g, '"')
        el = `<div id="${id}" class="modelItems" style="display:none"><ul>`;
        JSON.parse(attr).map((x) => {
            if (!x.value)
                x.value = x.text;
            el += `<li class="modelItem"  fromItems="${id}" value="${x.value}">${x.text}</li>`
        });
        el += `</ul><div class="closeSelectItem" fromItems="${id}" data-modal="menuGame">✖</div></div>`;
        $('body').append(el);

        clicBtn(this)
    });
    function clicBtn(e) {
        $(e).on("click", function () {
            var id = "#"+$(this).attr(`fromItems`);
            $(id).css("display", "block");
        });
    }
    $('.closeSelectItem').on("click", function () {
        var id = "#" + $(this).attr(`fromItems`);
        $(id).css("display", "none");
    });
    $('.modelItem').on("click", function () {
        var value = $(this).attr(`value`);
        var text = $(this).text();
        var id = $(this).attr(`fromItems`);
        $("#" + id).css("display", "none");
        var t = $(`.selectBtn[fromItems='${id}'] input`)[0];
        $(t).val(value)
        $(`.selectBtn[fromItems='${id}'] span`).text(text)
    });
}

function f_urlBack() {
    window.flutter_inappwebview.callHandler('f_urlBack', '');
}
$(window).on('popstate', function (e) {
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
function ticksToDate(ticks) {
    const ticksPerSecond = 1e7;
    const epoch = new Date(1900, 0, 1);
    const date = new Date(epoch.getTime() + (ticks / ticksPerSecond));
    return date;
}
function diffMinutes(date) {
    let datenew = new Date();
    let differenceInMilliseconds = date - datenew;
    return Math.floor(Math.floor(differenceInMilliseconds / 1000) / 60);
}
function getRandomPastelColor() {
    const r = Math.floor(Math.random() * 128) + 128; // محدوده 128 تا 255
    const g = Math.floor(Math.random() * 128) + 128; // محدوده 128 تا 255
    const b = Math.floor(Math.random() * 128) + 128; // محدوده 128 تا 255
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function uint8ArrayToBase64(uint8Array) {
    let binaryString = '';
    uint8Array.forEach(byte => {
        binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
}
function scrollEl(el, b) {
    var outerHeight = $(el).outerHeight(true);
    var scrollTop = $(el).scrollTop();
    var scrollHeight = $(el)[0].scrollHeight;
    var h2_3 = outerHeight - (outerHeight / 5);
    var outerscrollTop = outerHeight + scrollTop;

    var t = scrollHeight - outerscrollTop;
    if (b || t < h2_3) {
        $(el).animate({
            scrollTop: scrollHeight
        }, 1000);
    }
}



//---------extension-------
String.prototype.isNullOrEmpty = function () {
    if (!this || this == '')
        return true;
    return false;
};
String.prototype.isOnlyLatin = function () {
    if (!this || this == '')
        return false;
    const regex = /^[A-Za-z0-9]+$/;
    return regex.test(this);
};
String.prototype.isOnlyDigits = function () {
    if (!this || this == '')
        return false;
    const regex = /^\d+$/;
    return regex.test(this);
};
String.prototype.toJalaaliString = function () {
    try {

        if (!this || this == '')
            return '1/1/1';
        let date = new Date(this);
        var d = jalaali.toJalaali(date);
        return d.jy + '/' + d.jm + '/' + d.jd
    } catch {
        return '0/0/1';
    }
};
String.prototype.getTime = function () {
    try {

        if (!this || this == '')
            return '1:1:1';
        const date = new Date(this);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // فرمت 24 ساعته
        });
    } catch {
        return '0:0:1';
    }
};
//---------extension-------
async function appHttp(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Auth': publicToken,
                'D-Id': publicDeviceId,
            },
            body: JSON.stringify(data)
        });

        if (response.status === 200) {
            const responseData = await response.json();

            if (responseData.success) {
                return responseData.data;
            } else {

                const error = new Error(responseData.message);
                error.code = responseData.code;
                throw error;
            }

        }
        else {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Request failed');
            error.code = response.status;
            throw error;

        }


    } catch (e) {
        if (!e.code) {
            e.code = -100;
        }
        if (e.code == 401)
            error401(e)
        else
            pushErrorMessage({ comment: `code:${e.code}<br> ${e.message}`})
        throw e;
    }
    
}
function pushErrorMessage({ comment, time = 2 }) {
    pushMessage({ comment: comment, type: 'error', time: time });
}
function pushSuccessMessage({ comment, time = 2 }) {
    pushMessage({ comment: comment, type: 'success', time: time });
}
function pushMessage({ comment, type = 'error', time = 2 }) {
    const errorBox = document.getElementById('errorBox');
    const element = document.createElement('div');
    element.innerHTML = comment;
    element.classList.add('pushMessage');
    if (type == 'error')
        element.classList.add('pushErrorMessage');
    if (type == 'success')
        element.classList.add('pushSuccessMessage');
    errorBox.appendChild(element);

    setTimeout(() => {
        errorBox.removeChild(element);
    }, time * 1000);
}
function error401(e) {
    console.log('کد خطا 401:', error.code);
    console.log('پیام:', error.message);
}
