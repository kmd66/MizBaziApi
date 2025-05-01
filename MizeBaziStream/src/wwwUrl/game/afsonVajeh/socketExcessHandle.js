
socketHandler.addTalkReceive1 = function (model) {
    const divEl = document.createElement('div');
    divEl.className = `modalBady addTalkReceive1`;
    divEl.style.textAlign = 'center';
    divEl.innerHTML = model.msg;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 5000);
}
socketHandler.addTalkReceive2 = function (model) {
    const itemModalBady = document.querySelector('.modalBady.addTalkReceive1');
    if (itemModalBady)
        itemModalBady.remove();

    //const deepCopy = structuredClone(globalModel.groupItem);
    globalModel.groupItem = model.groupItem;
    vm.$refs.childmain.naghsh = help.usersReceive(globalModel.user.type);


    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    divEl.style.textAlign = 'center';
    divEl.innerHTML = `<div>${model.msg}</div>`;

    const btn = document.createElement('div');
    btn.className = `btn btn-yellow`;
    btn.style.marginTop = '1.5rem';
    btn.innerHTML = 'متوجه شدم';
    btn.addEventListener('click', () => divEl.remove());

    divEl.appendChild(btn);
    document.body.appendChild(divEl);
}
socketHandler.addGunReceive = function (model) {
    if (globalModel.user.id == model.id)
        globalModel.groupItem.gun = false;
    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    divEl.style.textAlign = 'center';
    divEl.innerHTML = model.msg;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 5000);
    
}