import io from 'socket.io-client'
import './socketExcessHandle'

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

    const divEl = document.createElement('div');
    divEl.className = `naghshCard`;
    divEl.innerHTML = `<div class="" style="color: var(--LinkColor);text-align: center;margin-bottom: 5px;">استاد</div><div class="itemImg"><img src="${vm.$refs.childmain.users[index].info.Img}90.jpg"></div><div class="" style="text-align: center;">${vm.$refs.childmain.users[index].info.FirstName}</div><div class="" style="text-align: center;">${vm.$refs.childmain.users[index].info.UserName}</div>`;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 5000);
}
function stateReceive(model) {
    vm.changeState(model);
}

function bazporsiReceive(model) {
    globalModel.reset();
    if (model.type == 1) {
        vm.$refs.childmain.msg.show = true;
        if (globalModel.user.type == 1) {
            globalModel.bazpors = { select: true };
            vm.$refs.childmain.msg.html = '<p style="color: red;">دو نفر را برای بازپرسی انتخاب کنید</p>';
        }
        else
            vm.$refs.childmain.msg.html = ' <p style="color: aquamarine;">بازپرس در حال انتخاب است </p>';
        vm.$refs.childmain.door = 'بازپرسی';

        globalModel.room.progressTime = model.wait;
        main.topTimeProgress(-100);
        defae.removeItemIcon();
    }
}
function defaeReceive(model) {
    vm.$refs.childdefae.door = 'دفاع';
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
    vm.$refs.childdefae.door = 'رای‌گیری';
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

function mozoeNaghashRieceive(model) {
    globalModel.mozoeNaghashi = model;
    if (globalModel.user?.type != 11)
        vm.$refs.childpaint.mozoeNaghashi = model;
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

    globalModel.connection.on('infoRoomReceive', globalModel.infoRoomReceive);
    globalModel.connection.on('userStatusReceive', userStatusReceive);

    globalModel.connection.on('infoMainReceive', globalModel.infoMainReceive);

    globalModel.connection.on('getDefensePositionReceive', getDefensePositionReceive);
    globalModel.connection.on('startStreamReceive', startStreamReceive);
    
    globalModel.connection.on('showOstadReceive', showOstadReceive);
    globalModel.connection.on('stateReceive', stateReceive);

    globalModel.connection.on('bazporsiReceive', bazporsiReceive);

    globalModel.connection.on('defaeReceive', defaeReceive);
    globalModel.connection.on('raigiriReceive', raigiriReceive);
    globalModel.connection.on('setRaieGiriCountReceive', defae.setRaieGiriCountReceive);
    globalModel.connection.on('getHadseNaghsh', socketHandler.getHadseNaghsh);
    globalModel.connection.on('hadseNaghshReceive', socketHandler.hadseNaghshReceive);

    globalModel.connection.on('gameResponseReceive', gameresponse.gameResponseReceive);
    globalModel.connection.on('endGameReceive', gameresponse.endGameReceive);
    globalModel.connection.on('getMessage', gameresponse.getMessage);
    
    globalModel.connection.on('mozoeNaghashListRieceive', (model) => vm.$refs.childmain.mozoeNaghashiList = model);
    globalModel.connection.on('setMozoeNaghashiReceive', (model) => vm.$refs.childmain.mozoeNaghashiList = null);
    globalModel.connection.on('mozoeNaghashRieceive', mozoeNaghashRieceive);

    globalModel.connection.on('getImgForSpy', imgsForSpy.getImgForSpy);

}
function socketCallBack() {
    vm.appModel.loding = false;
    vm.changeState('main'); // help imgsForSpy 'main''paint' gameresponse;

    itemclick.listen();
    main.listen();
}
