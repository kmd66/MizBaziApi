export function SafeUserModelRangoRaz(isShowOstad: boolean, model?: any[]): any {
    if (!model)
        return model;

    return model.map(({ id, index, info, userInGameStatus, type }) => ({
        id, index, info, userInGameStatus,
        ...(type === 1 && { type: 1 }) || (isShowOstad && type === 2 && { type: 2 })
    }));
}
export function userStatus(model?: any): any {
    if (!model)
        return model;

    return { id: model.id, index: model.index, userInGameStatus:model.userInGameStatus };
} 