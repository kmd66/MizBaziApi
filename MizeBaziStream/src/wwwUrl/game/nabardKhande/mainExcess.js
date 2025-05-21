main.stream = null;
main.icon5641 = {
    sticker: 'icon-smileys',
    like: 'icon-like',
    dislike: 'icon-dislike'
}
main.icon5641Disabled = {
    sticker: 'icon-smileys iconDisabled',
    like: 'icon-like iconDisabled',
    dislike: 'icon-dislike iconDisabled'
}

const naghsh = {
    title: 'راهنما',
    icon: 'icon-information4',
    color: '#7499ac'
}

main.init = function () {
    vm.$refs.childmain.naghsh = naghsh;
    vm.$refs.childmain.iconClass = main.icon5641Disabled;
}
main.setUsers = function () {
    globalModel.user = globalModel.users.find(x => x.id == socketHandler.userId);
    vm.$refs.childmain.user = globalModel.user;
    vm.$refs.childmain.users = globalModel.users;
    vm.$refs.childmain.naghsh = help.usersReceive(globalModel.user.type);
}
