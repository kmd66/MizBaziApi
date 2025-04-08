

function initShare() {

    globalModel = {};
    vm = {};

    globalModel.connection;
    globalModel.key;
    globalModel.userId;
    globalModel.userIntId;
    globalModel.roomId;

    main = {};
    main.startStrimInt = -1;
    main.startStrimTimer = null;

    main.topTimeProgressTimer = null;
    main.topTimeProgressAnimation = null;

    paint = {};

    imgsForSpy = {};
    help = {};

    socketHandler = {};
}

initShare();