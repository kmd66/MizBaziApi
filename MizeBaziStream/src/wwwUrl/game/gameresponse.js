function progressTime(t) {
    const el = document.querySelector(`.awq78f7af div`);
    if (!el)
        return;

    el.style.width = `100%`;
    const animation = el.animate([
        { width: `100%` },
        { width: `0%` }
    ], {
        duration: t * 1000,
        easing: 'linear',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        el.style.width = `0px`;
    };
}
function setWinner(w) {
    if (globalModel.gameName == 'rangOraz') {
        if (w == 1)
            vm.$refs.childGameresponse.winner = 'تیم نقاش‌ها';
        else
            vm.$refs.childGameresponse.winner = 'جاسوس';
    }
    if (w == 2)
        vm.$refs.childGameresponse.winnerColor = 'var(--NaghshSiahColor)';

    if (globalModel.gameName == 'afsonVajeh') {
        if (w == 1) {
            vm.$refs.childGameresponse.winner = 'گروه آبی';
            vm.$refs.childGameresponse.winnerColor = '#30ccff';
        }
        else {
            vm.$refs.childGameresponse.winner = 'گروه قرمز';
            vm.$refs.childGameresponse.winnerColor = '#f35a9f';
        }
    }

    if (globalModel.gameName == 'mafia') {
        if (w == 1) {
            vm.$refs.childGameresponse.winner = 'شهروند‌ها';
        }
        else {
            vm.$refs.childGameresponse.winner = 'مافیا';
        }
    }

    if (globalModel.gameName == 'nabardKhande') {
        if (w == 1) {
            vm.$refs.childGameresponse.winner = 'گروه آبی';
            vm.$refs.childGameresponse.winnerColor = 'rgb(48, 204, 255)';
        }
        else if (w == 2) {
            vm.$refs.childGameresponse.winner = 'گروه سبز';
            vm.$refs.childGameresponse.winnerColor = 'rgb(130, 243, 90)';
        }
        else if (w == 3) {
            vm.$refs.childGameresponse.winner = 'گروه قرمز';
            vm.$refs.childGameresponse.winnerColor =   ' rgb(243, 90, 159)';
        }
    }
}

gameresponse.getMessage = function (model) {
    const user = vm.$refs.childmain.users.find(u => u.id == model.userId);
    const my = user.id == globalModel.user.id;
    const imgHtml = `<div class="chatImg"><div class="roomListUserImg"><div class="roomTopUserImg"><img src="${user.info?.Img}90.jpg"></div></div><div class="chatUserName">${user.info?.UserName}</div></div>`;
    const msgHtml = `<div class="chatText"><div class="chatBox"><div class="chatInfo">${user.info?.FirstName} ${user.info?.UserName}</div><div class="chatMsg">${model.msg}</div></div></div>`;
    const html = `<div class="chatMain${my ? " myText" : ""} d-flex">${my ? msgHtml + imgHtml : imgHtml + msgHtml}</div>`;
    vm.$refs.childGameresponse.messages.push(html);
    scrollEl('.sdfe89r-main', false)
}
gameresponse.endGameReceive = function (model) {

}
gameresponse.gameResponseReceive = function (model) {
    globalModel.gameResponse = model;
    vm.changeState('gameresponse');
    progressTime(model.wait)
}

gameresponse.Component = function (app) {
    app.component('gameresponse-component', {
        template: '#gameresponse-template',
        data() {
            return {
                message: '',
                winnerColor: 'var(--NaghshSefidColor)',
                isSendMessage: false,
                winner: '',
                users: [],
                messages: [],
            }
        },
        props: {
        },
        methods: {
            init() {
                setTimeout(() => {
                    setWinner(globalModel.gameResponse.winner);
                    this.addUser();
                }, 700);

            },
            addUser() {
                globalModel.gameResponse.users.forEach((x, index) => {
                    setTimeout(() => {
                        const user = vm.$refs.childmain.users.find(u => u.id == x.id);
                        const helpItem = help.find(x.type);

                        this.users.push({
                            img: user.info.Img,
                            userName: user.info.UserName,
                            icon: helpItem?.icon,
                            title: helpItem?.title,
                            color: helpItem?.color ? helpItem?.color : undefined
                        })
                        if ((index + 1) == globalModel.gameResponse.users.length)
                            this.isSendMessage = true;
                    }, 700 * (index + 1));
                });
            },
            
            addMessage() {
                if (this.message.length > 50)
                    this.message = this.message.slice(0, 50)
                globalModel.connection.emit('setMessage', {
                    message: this.message,
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
                this.message = '';
            },
        }
    });
}