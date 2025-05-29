
socketHandler.init = function () {
    globalModel.connection.on('mainReceive', mainReceive);
    globalModel.connection.on('soalPichReceive', soalPichReceive);
    globalModel.connection.on('sendSoalReceive', sendSoalReceive);
    globalModel.connection.on('addSticker2Receive', addSticker2Receive);
}
function mainReceive(model) {
    main.stream = false;
    vm.$refs.childmain.soundDivI = false;
    vm.$refs.childmain.cancelBtn = false;
    vm.$refs.childmain.iconClass = main.icon5641Disabled;
    if (model.type == 'wait') {
        main.reset();
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        main.getDefensePosition();
    }

    if (model.type == 'start') {
        main.stream = true;
        if (model.activeUser == globalModel.user.index) {
            vm.$refs.childmain.cancelBtn = true;
        } else {
            vm.$refs.childmain.iconClass = main.icon5641;
        }
        vm.$refs.childmain.soundDivI = true;
    }

    if (model.type == 'wait' || model.type == 'start') {
        globalModel.room.wait = model.wait;
        main.topTimeProgress(-100);
    }

    if (model.type == 'end') {
        socketHandler.closeObj();
        main.reset();
    }
}
function soalPichReceive(model) {
    if (model.type == 'wait') {
        soalpich.reset(true);
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        globalModel.activeUser2 = {
            index: model.activeUser2,
            row: model.activeUser2 + 1
        };

    }

    if (model.type == 'start') {
        vm.$refs.childsoalpich.soundDivI = true;
        vm.$refs.childsoalpich.textBtn = true;
        if (globalModel.activeUser.index == globalModel.user.index) {
            vm.$refs.childsoalpich.cancelBtn = true;
        }
        if (globalModel.activeUser2.index == globalModel.user.index) {
            vm.$refs.childsoalpich.likeBtn = true;
            vm.$refs.childsoalpich.textBtn = false;
        }
    }

    if (model.type == 'wait' || model.type == 'start') {
        globalModel.room.wait = model.wait;
        soalpich.topTimeProgress(-100);
        globalModel.users.map((x) => {
            if (globalModel.activeUser.index == x.index)
                vm.$refs.childsoalpich.user1 = x;
            if (globalModel.activeUser2.index == x.index)
                vm.$refs.childsoalpich.user2 = x;
        });
    }

    if (model.type == 'end') {
        vm.$refs.childsoalpich.soal = '';
        socketHandler.closeObj();
        soalpich.reset(true);
    }
}
function sendSoalReceive(model) {
    vm.$refs.childsoalpich.soal = model;
}

async function addSticker2Receive(model) {
    try {
        const itemMain = document.querySelector('.showSticker');

        const video = document.createElement('video');
        video.src = `data:video/mp4;base64,${sDATA[model.t]}`;
        video.className = 'stickerVideo';

        video.muted = true;
        await video.play();
        video.addEventListener('ended', () => {
            video.remove();
        }, { once: true });
        itemMain.appendChild(video);

    } catch (error) {
    }
}