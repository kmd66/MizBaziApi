soalpich.reset = function (itemMainFix) {
    if (soalpich.topTimeProgressTimer)
        clearTimeout(main.topTimeProgressTimer);
    soalpich.topTimeProgressTimer = null;
    soalpich.topTimeProgressAnimation?.cancel();
    soalpich.topTimeProgressAnimation = null;
    vm.$refs.childsoalpich.soundDivI = false;
    vm.$refs.childsoalpich.topTime = '- ----';
    vm.$refs.childsoalpich.progressbarWidth = "0px";
    if (itemMainFix) {
        vm.$refs.childsoalpich.likeBtn = false;
        vm.$refs.childsoalpich.cancelBtn = false;
        vm.$refs.childsoalpich.textBtn = false;
        vm.$refs.childsoalpich.user1 = undefined;
        vm.$refs.childsoalpich.user2 = undefined;
    }
}
soalpich.topTimeProgress = function (i) {
    if (i == -100) {
        i = globalModel.room.wait;
        const progressbar = document.querySelector('.aw278edaf div');
        progressbar.style.width = `100%`;
        soalpich.topTimeProgressAnimation = progressbar.animate([
            { width: `100%` },
            { width: `0%` }
        ], {
            duration: globalModel.room.wait * 1000,
            easing: 'linear',
            fill: 'forwards'
        });
    }

    if (i == 0) {
        soalpich.reset();
        return;
    }
    const newTime = i - 1;
    vm.$refs.childsoalpich.topTime = `${i} ثانیه`;
    soalpich.topTimeProgressTimer = setTimeout(() => {
        soalpich.topTimeProgress(newTime);
    }, 1000);
}

soalpich.Component = function (app) {
    app.component('soalpich-component', {
        template: '#soalpich-template',
        data() {
            return {
                topTime: '- ----',
                naghsh: {},
                door: '-',
                progressbarWidth: '0px',
                soundDivI: false,
                soal: '',
                likeBtn: false,
                cancelBtn: false,
                textBtn: false,
                isAddSticker: false,
                user1: undefined,
                user2: undefined,

                message: '',
                isMessage: false,
            }
        },
        props: {
            appModel: {
                type: Object,
                required: true,
                default: () => ({})
            },
        },
        methods: {
            init() {
            },
            addMessage() {
                if (this.isMessage || globalModel.user.index == globalModel.activeUser2.index) return;
                let message = this.message.slice(0, 30);
                this.isMessage = true;
                globalModel.connection.emit('addMessage', {
                    msg: message,
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
                this.message = '';
                setTimeout(() => {
                    this.isMessage = false;
                }, 1000);
            },
            addSticker(text) {
                if (this.isAddSticker || globalModel.user.index != globalModel.activeUser2.index) return;
                this.isAddSticker = true;
                globalModel.connection.emit('addSticker2', {
                    t: text,
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
                setTimeout(() => {
                    this.isAddSticker = false;
                }, 1000);
            },
            setCancel() {
                globalModel.connection.emit('setCancel', {
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
            },
            itemStatus(item) {
                if (item) {
                    switch (item.userInGameStatus) {
                        case 1:
                            return 'a6s5d4q';
                        case 10:
                            return 'imgStatus icon-ofline';
                        case 2:
                        case 11:
                            return 'imgStatus icon-death';
                    }
                }
                return 'imgStatus icon-ofline';
            },
        }
    });
} 