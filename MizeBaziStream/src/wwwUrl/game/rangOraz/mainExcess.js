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
    globalModel.connection.on('imgsRieceive', main.imgsRieceive);
}
function startStreamReceive(model) {
    vm.$refs.childmain.soundDivI = true;
    main.stream = model;
    if (model.activeUser == globalModel.user.index){
        vm.$refs.childmain.iconClass = iconClassDisabled;
        vm.$refs.childitemclick.isAddTarget = true;
        vm.$refs.childmain.cancelBtn = true;
    }
    else{
        vm.$refs.childmain.iconClass = iconClass;
        if (globalModel.room.door == 'معارفه') 
            vm.$refs.childmain.iconClass.chalesh = 'icon-chalesh iconDisabled';
        else
            vm.$refs.childmain.iconClass.chalesh = 'icon-chalesh';
        vm.$refs.childitemclick.isAddTarget = false;
    }

    const user = vm.$refs.childmain.users.find(u => u.index == model.activeUser);
    if (user) {
        if (globalModel.naghashi.has(user.info.UserName)){
            vm.$refs.childmain.mainImg = globalModel.naghashi.get(user.info.UserName);
        }
    }
}
function endStreamReceive(model) {
    vm.$refs.childmain.soundDivI = false;
    socketHandler.closelObj();
    vm.$refs.childmain.iconClass = iconClassDisabled;
    vm.$refs.childitemclick.isAddTarget = false;
    vm.$refs.childmain.cancelBtn = false;
    removeChalesh()
    const el = document.getElementsByClassName(`chaleshForItem2`);
    Array.from(el).map(x => x.remove());
    main.stream = null;
    if (vm.$refs.childmain.mainImg)
        vm.$refs.childmain.mainImg = null;
}
function addChaleshReceive(model) {
    const u = globalModel.users.find(x => x.id == model);
    chaleshReceive(u.row)
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

main.imgsRieceive = function (model) {
    globalModel.naghashi.clear();
    if (!model || !model.length || model.length == 0) return;
    model.map((x) => {
        const user = vm.$refs.childmain.users.find(u => u.id == x[0]);
        if (user) {
            const decompressed = new TextDecoder().decode(pako.inflate(x[1]));
            globalModel.naghashi.set(user.info.UserName, decompressed)
        }
    })
}
