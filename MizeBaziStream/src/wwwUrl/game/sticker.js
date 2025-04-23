sticker.reset = function () {
}
sticker.isAddSticker = false;
sticker.addStickerReceive = async function (model) {
    try {
        const u = globalModel.users.find(x => x.id == model.id);
        await addStickerVideo(model.t, u.row)
    } catch (error) {
    }
}

sticker.handleUpdate = function (text) {
    if (sticker.isAddSticker || !main.stream || !globalModel.user?.id) return;
    if (main.stream.activeUser == globalModel.user.index) return;

    sticker.isAddSticker = true;
    globalModel.connection.emit('addSticker', {
        t: text,
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
    setTimeout(() => {
        sticker.isAddSticker = false;
    }, 2000);
}

sticker.toggleTab = function () {
    const el = document.querySelector('.stickerMain');
    if (el.style.display == 'block') {
        el.style.display = 'none';
        return;
    }
    if (!main.stream || !globalModel.user?.id) return;
    if (main.stream.activeUser == globalModel.user.index) return;
    el.style.display = 'block';
}

sticker.Component = function (app) {
    app.component('sticker-component', {
        template: '#sticker-template',
        data() {
            return {
                icons: [
                    "😎", "🙂", "😊", "😀", "😆", "😂", "😜", "🥹", "🤐", "😏", "🙄", "😑", "😲", "😮", "🤨", "😕", "😟", "😔", "😭", "🙁", "☹️", "😒", "😠", "😡", "😉", "😙", "😍", "🥳", "🙂‍↕️", "🤕", "🤒", "🥶", "🤮", "🫠", "🥴", "😵‍💫", "😖", "🤥", "🤯", "😮‍💨", "😈", "🫡", "🤔", "🤫", "🥱", "😱",
                    "👻", "💩", "👀", "💯", "❗️", "❓", "⁉️", "👏🏼", "👋🏼", "✌", "🤝🏻", "🏳️", "💞", "💔", "🌹", "🥀", "💐", "💡", "🎉", "💣", "💥", "🥇", "🎯",
                    "🐣", "🪳", "🐂", "🦈", "🦕", "🦖", "🐉", "🫏", "🐮", "🐢", "🦍"],
                texts: [
                    "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "e10", "e11", "e12", "e13", "e14", "e15", "e16", "e17", "e18", "e19", "e20", "e21", "e22", "e23", "e24", "e25", "e26", "e27", "e28", "e29", "e30", "e31", "e32", "e33", "e34", "e35", "e36", "e37", "e38", "e39", "e40", "e41", "e42", "e43", "e44", "e45",
                    "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23",
                    "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "h11"]
            }
        },
        methods: {
            click(i) {
                sticker.toggleTab();
                var text = this.texts[i];
                sticker.handleUpdate(text);
            },
        }
    });
}