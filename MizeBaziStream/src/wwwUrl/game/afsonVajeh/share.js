
globalModel = {};
function reset() {
}
function initShare() {

    globalModel = {
        gameName: 'afsonVajeh'
    };
    vm = {};
    globalModel.connection;
    globalModel.reset = reset;
    globalModel.room = {};
    globalModel.users = [];
    globalModel.user = {};

    sticker = {};
    itemclick = {};
    socketHandler = {};
    main = {};
    help = {};


}

initShare();