socketHandler.getHadseNaghsh = function (model) {
    const user = vm.$refs.childmain.users.find(x => x.id == model);
    removeItemIcon();
    const el = document.querySelector(`.itemMain${user.row} .itemImg`);
    if (!el)
        return;
    const divEl = document.createElement('div');
    divEl.className = `hadseNaghshForItem imgStatus icon-user-1-tick`;
    el.appendChild(divEl);
}
function removeItemIcon() {
    const elements = document.querySelectorAll('.hadseNaghshForItem');
    elements.forEach(element => {
        element.remove();
    });
}

socketHandler.hadseNaghshReceive = function (model) {
    if (model.type == 10)
        vm.changeState('main');
    globalModel.reset();
    removeItemIcon();
    globalModel.hadseNaghsh = false;

    if (model.type == 1) {
        hadseNaghshReceive1(model);
    } else if (model.type == 2) {
        hadseNaghshReceive2(model);
    } else if (model.type == 10) {
        globalModel.reset();
        hadseNaghshReceive10(model);
    }

    vm.$refs.childmain.door = 'حدس نقش';
    globalModel.room.progressTime = model.wait;
    main.topTimeProgress(-100);
}

function hadseNaghshReceive1(model) {
    const user = vm.$refs.childmain.users.find(x => x.id == model.loserUser?.id);

    vm.$refs.childmain.msg.show = true;
    if (globalModel.user.id == user?.id) {
        const m = user.type == 11 ? 'استاد' : 'جاسوس';
        globalModel.hadseNaghsh = true;
        if (user)
            vm.$refs.childmain.msg.html = `<p style="color: aquamarine;"><span style="color: red;"> ${m} </span> را برای خارج کردن از بازی انتخاب کنید </p>`;
    }
    else
        vm.$refs.childmain.msg.html = `<p style="color: aquamarine;">${user.info?.UserName} درحال انتخاب یک نفر برای خارج کردن از بازی است</p>`;
}
function hadseNaghshReceive2(model) {
    const user = vm.$refs.childmain.users.find(x => x.id == model.hadseNaghsh?.id);
    const helpItem = help.find(model.hadseNaghsh?.type);

    vm.$refs.childmain.usersStatus[user.index].userInGameStatus = 11;

    const html = `<div style="margin: 10px 0;">${user.info?.UserName} با نقش " ${helpItem.title} <i class="${helpItem.icon}"></i>", بوسیله حدس نقش از بازی خارج شد</div>`;
    hadseNaghshReceiveDiv(html);
}
function hadseNaghshReceive10(model) {
    const user = vm.$refs.childmain.users.find(x => x.id == model.loserUser?.id);
    const helpItem = help.find(model.loserUser?.type);

    vm.$refs.childmain.usersStatus[user.index].userInGameStatus = 11;

    const html = `<div style="margin: 10px 0;">${user?.info?.UserName} با نقش " ${helpItem.title} <i class="${helpItem.icon}"></i>" بوسیله رای‌گیری از بازی خارج شد</div>`;
    hadseNaghshReceiveDiv(html);
}

function hadseNaghshReceiveDiv(model) {
    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    divEl.innerHTML = model;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 7000);
}