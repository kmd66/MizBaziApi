function reset() {
    globalModel.bazpors = {};
    main.reset();
    imgsForSpy.reset();
    paint.reset();
    itemclick.reset();
    sticker.reset();
    removeChalesh();
    isAddChalesh = false;
}

function roomReceive(room) {
    reset();
    globalModel.room = room;
    main.topTimeProgress(-100);
    vm.$refs.childmain.door = room.door;
}

function usersReceive(users) {
    users.map((x) => x.row = x.index + 1);
    globalModel.user = users.find(x => x.id == socketHandler.userId);
    vm.$refs.childmain.user = globalModel.user;
    vm.$refs.childmain.users = users;

    const type = vm.$refs.childmain.user.type;
    vm.$refs.childmain.iconNaghsh = help.usersReceive(type);
}

function initShare() {

    globalModel = {
        gameName: 'rangOraz',
        hadseNaghsh:false
    };
    vm = {};

    globalModel.connection;
    globalModel.reset = reset;
    globalModel.roomReceive = roomReceive;
    globalModel.usersReceive = usersReceive;

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
}

initShare();