main.stream = null;
const iconClass = {
    sticker: 'icon-smileys',
    chalesh: 'icon-chalesh',
    like: 'icon-like',
    dislike: 'icon-dislike'
}
const iconClassDisabled = {
    sticker: 'icon-smileys iconDisabled',
    chalesh: 'icon-chalesh iconDisabled',
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
    vm.$refs.childmain.iconClass = iconClassDisabled;
}
main.setUsers = function () {
    globalModel.user = globalModel.users.find(x => x.id == socketHandler.userId);
    vm.$refs.childmain.user = globalModel.user;
    vm.$refs.childmain.users = globalModel.users;
    vm.$refs.childmain.naghsh = help.usersReceive(globalModel.user.type);
}
