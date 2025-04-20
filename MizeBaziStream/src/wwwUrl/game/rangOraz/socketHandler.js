import io from 'socket.io-client'

function userStatusReceive(model) {
    vm.$refs.childmain.usersStatus = model;
}
function getDefensePositionReceive(model) {
    main.reset();
    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1
    };
    globalModel.room.progressTime = model.wate;
    main.getDefensePosition();
    main.topTimeProgress(-100);
}
function startStreamReceive(model) {
    main.reset(true);
    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1
    };
    globalModel.room.progressTime = model.wate;
    main.topTimeProgress(-100);
}
function showOstadReceive(model) {
    vm.changeState('main'); 
    globalModel.room.isShowOstad = true;
    const index = vm.$refs.childmain.users.findIndex(x => x.id == model);
    vm.$refs.childmain.users[index].type = 2;
}

function bazporsiReceive(model) {
    globalModel.reset();
    if (model == 1) {
        vm.$refs.childmain.msg.show = true;
        globalModel.room.progressTime = 14;
        if (globalModel.user.type == 1) {
            globalModel.bazpors = { select: true };
            vm.$refs.childmain.msg.bazpors = true;
        }
        else
            vm.$refs.childmain.msg.bazporsWait = true;
        vm.$refs.childmain.door = 'بازپرسی';
        main.topTimeProgress(-100);
        defae.removeItemIcon();
    }
}
function defaeReceive(model) {
    vm.$refs.childdefae.raigiriResponse = false;
    defae.raieGiriCount.clear();
    vm.$refs.childdefae.loseUser = null;

    if (model.userIndex == -1) {
        vm.$refs.childdefae.users = [];
        vm.changeState('defae'); 
        model.users.map(x => {
            const user = vm.$refs.childmain.users.find(u => u.id == x);
            if (user)
                vm.$refs.childdefae.users.push(user);
        });
    }

    defae.progressTime(model.wait);
}
function raigiriReceive(model) {
    if ([1, 10].indexOf(model.type) >-1) {
        vm.$refs.childdefae.raigiri = true;
    }
    else{
        vm.$refs.childdefae.raigiri = false;
    }
    defae.progressTime(model.wait);

    if (model.type == 20) {
        vm.$refs.childdefae.users?.map((u) => {
            if (!defae.raieGiriCount.has(u.id))
                defae.raieGiriCount.set(u.id, []);
            model.raieGiriCount?.map((x) => {
                if (x[1] == u.id)
                    defae.raieGiriCount.get(u.id).push(x[0]);
            });
        });

        let maxLength = -Infinity;
        let maxKey = null;
        for (const [key, list] of defae.raieGiriCount.entries()) {
            if (list.length > maxLength) {
                maxLength = list.length;
                maxKey = key;
            }
        }

        vm.$refs.childdefae.loseUser = vm.$refs.childmain.users.find(u => u.id == maxKey);
        vm.$refs.childdefae.raigiriResponse = true;
    }
}

socketHandler.initSoket = function () {
    let params = new URLSearchParams(document.location.search);
    socketHandler.roomId = params.get("roomId");
    socketHandler.userKey = params.get("userKey");
    socketHandler.userId = params.get("userId");

    globalModel.connection = io(`${publicHubBaseUrl}/hubRangOraz`, {
        auth: {
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey
        }
    });


    globalModel.connection.on('connectionReceive', ({ socketId }) => {
        socketHandler.socketId = socketId;
        socketCallBack();
    });
    globalModel.connection.on('disconnect', () => {
        console.log(`---a---disconnect :`);
    });

    globalModel.connection.on('usersReceive', globalModel.usersReceive);
    globalModel.connection.on('userStatusReceive', userStatusReceive);

    globalModel.connection.on('roomReceive', globalModel.roomReceive);

    globalModel.connection.on('getDefensePositionReceive', getDefensePositionReceive);
    globalModel.connection.on('startStreamReceive', startStreamReceive);
    
    globalModel.connection.on('showOstadReceive', showOstadReceive);

    globalModel.connection.on('bazporsiReceive', bazporsiReceive);

    globalModel.connection.on('defaeReceive', defaeReceive);
    globalModel.connection.on('raigiriReceive', raigiriReceive);
    globalModel.connection.on('setRaieGiriCountReceive', defae.setRaieGiriCountReceive);

}
function socketCallBack() {
    vm.appModel.loding = false;
    vm.changeState('main'); // help imgsForSpy 'main''paint';

    itemclick.listen();
}
