main.stream = null;
const iconClass = {
    sticker: 'icon-smileys',
    chalesh: 'icon-chalesh',
    like: 'icon-like',
    dislike: 'icon-dislike'
}
const iconClassDisabled = {
    sticker: 'icon-smileys iconDisabled',
    chalesh: 'icon-chalesh iconDisabled',
    like: 'icon-like iconDisabled',
    dislike: 'icon-dislike iconDisabled'
}

main.listen = function () {
    vm.$refs.childmain.iconClass = iconClassDisabled;
    globalModel.connection.on('startStreamReceive', startStreamReceive);
    globalModel.connection.on('endStreamReceive', endStreamReceive);
    globalModel.connection.on('addChaleshReceive', addChaleshReceive);
    globalModel.connection.on('setChaleshReceive', setChaleshReceive);
    globalModel.connection.on('addStickerReceive', sticker.addStickerReceive);
}
function startStreamReceive(model) {
    main.stream = model;
    if (model.activeUser == globalModel.user.index){
        vm.$refs.childmain.iconClass = iconClassDisabled;
        vm.$refs.childitemclick.isAddTarget = true;
        vm.$refs.childmain.cancelBtn = true;
    }
    else{
        vm.$refs.childmain.iconClass = iconClass;
        vm.$refs.childitemclick.isAddTarget = false;
    }
}
function endStreamReceive(model) {
    vm.$refs.childmain.iconClass = iconClassDisabled;
    vm.$refs.childitemclick.isAddTarget = false;
    vm.$refs.childmain.cancelBtn = false;
    removeChalesh()
    const el = document.getElementsByClassName(`chaleshForItem2`);
    Array.from(el).map(x => x.remove());
    main.stream = null;
}
function addChaleshReceive(model) {
    const u = globalModel.users.find(x => x.id == model);
    addChalesh(u.row)
}

function setChaleshReceive(model) {
    const u = globalModel.users.find(x => x.id == model);
    const el = document.querySelector(`.chaleshForItem.el${u.row}`);
    if (!el)
        return;
    el.classList.remove("chaleshForItem");
    el.classList.add("chaleshForItem2");
    removeChalesh();
}

main.addChalesh = function () {
    if (!main.stream || !globalModel.user?.id) return;
    if (main.stream.activeUser == globalModel.user.index) return;

    globalModel.connection.emit('addChalesh', {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}

main.addTarget = function () {
    if (!main.stream || !globalModel.user?.id) return;
    if (main.stream.activeUser == globalModel.user.index) return;

    globalModel.connection.emit('addChalesh', {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}
