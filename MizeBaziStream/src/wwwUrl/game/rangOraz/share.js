
globalModel = {};
function reset() {
    globalModel.bazpors = {};
    main.reset();
    imgsForSpy.reset();
    paint.reset();
    itemclick.reset();
    sticker.reset();
    removeChalesh();
    waitState.reset();
    //isAddChalesh = false;
}

function infoMainReceive(room) {
    reset();
    globalModel.room = room;
    main.topTimeProgress(-100);
    vm.$refs.childmain.door = room.door;
    taeinDoor(room);

}
function taeinDoor(room) {
    if (!room.door || room.door == 'بارگزاری' || !globalModel.user?.type) return;

    if (room.door == 'نقاشی' || room.door == 'نقاشی جاسوس') {
        if (vm.$refs.childmain.mozoeNaghashiList != null)
            vm.$refs.childmain.mozoeNaghashiList = null;

        if (globalModel.user.type == 1) {
            waitState.init();
        } else if (room.door == 'نقاشی') {
            if (globalModel.user.type == 11)
                imgsForSpy.init();
            else
                paint.init();
        } else if (room.door == 'نقاشی جاسوس') {
            if (globalModel.user.type == 11)
                paint.init();
            else
                vm.changeState('wait');
        }

        vm.$refs.childWait.door = room.door;
    }

    else if (room.door == 'دور 1') {
        vm.changeState('main');
        vm.$refs.childmain.mozoeNaghashi = globalModel.mozoeNaghashi;
    }

    if (room.door == 'تعیین موضوع') {
        vm.$refs.childmain.msg = {
            show: true,
            html: `<p style="color: aquamarine;">استاد در حال تعیین موضوع برای طراحی است.</p>`
        };
    } 

}
function infoRoomReceive(model) {
    globalModel.infoMainReceive(model.room)
    //loserUser: handler.loserUser,
    //hadseNaghsh: handler.hadseNaghsh,
    if (model.room.state) {
        if (model.room.state == 'paint') { }
        else
            vm.changeState(model.room.state);
    }

    model.users.map((x) => x.row = x.index + 1);
    globalModel.users = model.users;
    globalModel.user = model.users.find(x => x.id == socketHandler.userId);
    vm.$refs.childmain.user = globalModel.user;
    vm.$refs.childmain.users = model.users;

    vm.$refs.childmain.usersStatus = model.status;

    const type = vm.$refs.childmain.user.type;
    vm.$refs.childmain.iconNaghsh = help.usersReceive(type);

    taeinDoor(model.room);

    if (model.room.bazporsiUsers?.length > 0) {
        model.room.bazporsiUsers.map(x => {
            const user = vm.$refs.childmain.users.find(u => u.id == x);
            if (user)
                vm.$refs.childdefae.users.push(user);
        });
    }
    main.imgsRieceive(model.room.naghashi);
    if (model.room.mozoeNaghashi && model.room.mozoeNaghashi != '') {
        globalModel.mozoeNaghashi = model.room.mozoeNaghashi;
        vm.$refs.childmain.mozoeNaghashi = globalModel.mozoeNaghashi;
    }

}

function initShare() {

    globalModel = {
        gameName: 'rangOraz',
        hadseNaghsh:false
    };
    vm = {};

    globalModel.naghashi = new Map();
    globalModel.connection;
    globalModel.reset = reset;
    globalModel.infoMainReceive = infoMainReceive;
    globalModel.infoRoomReceive = infoRoomReceive;

    globalModel.bazpors = {};

    globalModel.room = {};

    main = {};
    main.startStrimInt = -1;
    main.startStrimTimer = null;

    main.topTimeProgressTimer = null;
    main.topTimeProgressAnimation = null;

    paint = {};

    imgsForSpy = {};
    help = {};
    defae = {};
    gameresponse = {};

    socketHandler = {
        socketId: '',
        roomId: '',
        userKey: '',
        userId: 0,
    };

    sticker = {};

    itemclick = {};

    waitState = {};
}

initShare();