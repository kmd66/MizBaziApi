
export enum receiveType {
    undefined = 0,
    start = 1,
    end = 2,
    wait = 10,
    response = 20,
}
export enum winnerType {
    undefined = 0,
    sefid = 1,
    siah = 2,
}
export enum GameType {
    nabardKhande = 25,
    rangOraz = 45,
    afsonVajeh = 68,
    mafia = 89
}
export enum nabardKhandeRole {
    groh1_1 = 1, // 'گروه 1',
    groh1_2 = 2, //'گروه 1',

    groh2_1 = 11, //'گروه 2',
    groh2_2 = 12, //'گروه 2',

    groh3_1 = 21, //'گروه 3',
    groh3_2 = 22, //'گروه 3'
}
export enum rangOrazRole {
    bazpors = 1, //'بازپرس',

    ostad = 2, //'استاد',

    jasos = 11, //'جاسوس',

    naghash1 = 21, // 'نقاش 1',
    naghash2 = 22, // 'نقاش 2',
}
export enum afsonVajehRole {
    groh1_1 = 1, // 'گروه1 سرگروه',
    groh1_2 = 2, // 'گروه1',
    groh1_3 = 3, // 'گروه1',

    groh2_1 = 11, // 'گروه2 سرگروه',
    groh2_2 = 12, // 'گروه1',
    groh2_3 = 13, // 'گروه1',

    shahr1 = 21, // 'شهروند 1',
    shahr2 = 22, // 'شهروند 2',
}
export enum mafiaRole {
    ahangar = 4, //'اهنگر',
    karagah = 5, //'کاراگاه',
    shekarchi = 6, //'شکارچی',
    kalantar = 7, //'کلانتر',

    rointan = 8, //'روینتن',
    mobarez = 9, //'مبارز',
    zendanban = 10, //'زندانبان'

    raees = 21, //'رییس مافیا',
    kharabkar = 22, //'خرابکار',
    taghier = 23, //'تغییردهنده',
}

export enum userInGameStatusType {
    faal = 1, //فعال
    koshte = 2,

    ofline = 10,
    ekhraj = 11,
}
export enum SteamType {
    undefined = 0,
    audio = 1,
    video = 2
}

export class GameTypeExtension{
    static count(type: GameType): number {
        switch (type) {
            case GameType.nabardKhande:
                return 6;
            case GameType.rangOraz:
                return 5;
            case GameType.afsonVajeh:
                return 8;
            case GameType.mafia:
                return 10;
            default: return 0;
        }
    }

    static roles(type: GameType): any[] {
        if (type == GameType.nabardKhande) {
            return Object.values(nabardKhandeRole).filter(value => typeof value !== 'number');
        }
        else if (type == GameType.afsonVajeh) {
            return Object.values(afsonVajehRole).filter(value => typeof value !== 'number');
        }
        else if (type == GameType.rangOraz) {
            return Object.values(rangOrazRole).filter(value => typeof value !== 'number');
        }
        else if (type == GameType.mafia){
            return Object.values(mafiaRole).filter(value => typeof value !== 'number');
        }
        return [];
    }

    static getType(type: GameType, value: any): any {
        if (type == GameType.nabardKhande) {
            return nabardKhandeRole[value];
        }
        else if (type == GameType.afsonVajeh) {
            return afsonVajehRole[value];
        }
        else if (type == GameType.rangOraz) {
            return rangOrazRole[value];
        }
        else if (type == GameType.mafia){
            return mafiaRole[value];
        }
        return undefined;
    }
}