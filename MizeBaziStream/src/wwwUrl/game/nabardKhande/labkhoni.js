labkhoni.reset = function (itemMainFix) {
    if (labkhoni.topTimeProgressTimer)
        clearTimeout(main.topTimeProgressTimer);
    labkhoni.topTimeProgressTimer = null;
    labkhoni.topTimeProgressAnimation?.cancel();
    labkhoni.topTimeProgressAnimation = null;
    vm.$refs.childlabkhoni.topTime = '- ----';
    vm.$refs.childlabkhoni.progressbarWidth = "0px";
    if (itemMainFix) {
        vm.$refs.childlabkhoni.cancelBtn = false;
        vm.$refs.childlabkhoni.textBtn = false;
        vm.$refs.childlabkhoni.user = undefined;
    }
}

labkhoni.topTimeProgress = function (i) {
    if (i == -100) {
        i = globalModel.room.wait;
        const progressbar = document.querySelector('.aw296wdaf div');
        progressbar.style.width = `100%`;
        labkhoni.topTimeProgressAnimation = progressbar.animate([
            { width: `100%` },
            { width: `0%` }
        ], {
            duration: globalModel.room.wait * 1000,
            easing: 'linear',
            fill: 'forwards'
        });
    }

    if (i == 0) {
        labkhoni.reset();
        return;
    }
    const newTime = i - 1;
    vm.$refs.childlabkhoni.topTime = `${i} ثانیه`;
    labkhoni.topTimeProgressTimer = setTimeout(() => {
        labkhoni.topTimeProgress(newTime);
    }, 1000);
}
labkhoni.Component = function (app) {
    app.component('labkhoni-component', {
        template: '#labkhoni-template',
        data() {
            return {
                topTime: '- ----',
                naghsh: {},
                door: '-',
                progressbarWidth: '0px',
                soundDivI: false,
                soal: '',
                cancelBtn: false,
                textBtn: false,
                user: undefined,

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
                if (!this.message || this.message.length < 3) return;
                let message = this.message.slice(0, 60);
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
            setCancel() {
                globalModel.connection.emit('setCancel', {
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
            },
            itemStatus() {
                if (this.user) {
                    switch (this.user.userInGameStatus) {
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