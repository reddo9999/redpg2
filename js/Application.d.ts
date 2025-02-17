/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/NonLatin.d.ts" />
/// <reference path="../typings/math.js.d.ts" />
declare function startDebugging(): void;
declare function stopDebugging(): void;
declare var onReady: Array<Listener>;
declare function addOnReady(caller: string, reason: string, listener: Listener): void;
declare function allReady(): void;
interface Listener {
    handleEvent: Function;
}
interface PageManagerPage {
    $element: JQuery;
    leftSided: boolean;
}
interface PersonaInfo {
    afk: Boolean;
    focused: Boolean;
    typing: Boolean;
    persona: String;
    avatar: String;
}
interface PersonaLocalInfo {
    name: String;
    avatar: String;
}
interface ChatController {
    start(): void;
    enterRoom(id: number): void;
    sendStatus(info: PersonaInfo): void;
    sendPersona(info: PersonaInfo): void;
    sendMessage(message: Message): void;
    saveMemory(memory: string): void;
    addCloseListener(obj: Listener): void;
    addOpenListener(obj: Listener): void;
    addMessageListener(type: string, obj: Listener): void;
    isReady(): boolean;
    onReady: Listener;
    end(): void;
}
interface ImageInt {
    getName(): string;
    getLink(): string;
    getId(): string;
}
interface StyleInfo {
    id: number;
    idCreator: number;
    name: string;
}
declare class Trigger {
    private functions;
    private objects;
    removeListener(f: Function | Listener): void;
    addListener(f: Function | Listener): void;
    addListenerIfMissing(f: Function | Listener): void;
    trigger(...args: any[]): void;
}
declare class Changelog {
    private release;
    private minor;
    private major;
    private messages;
    private static updates;
    private static updatesExternal;
    private static addToUpdates;
    static sort(): void;
    static getMostRecentLocalUpdate(): Changelog;
    static getMostRecentExternalUpdate(): Changelog;
    static getUpdates(): Array<Changelog>;
    static getMissingUpdates(): any[];
    static finished(): void;
    static getLocalVersion(): number[];
    static getExternalVersion(): number[];
    constructor(major: number, minor: number, release: number);
    getVersion(): number[];
    addMessage(msg: string, lingo: string): void;
    getMessages(): Array<string>;
    getHTML(missing: boolean): HTMLParagraphElement;
}
declare class ImageRed implements ImageInt {
    private name;
    private uploader;
    private uuid;
    getLink(): string;
    getName(): string;
    getId(): string;
}
declare class ImageLink {
    private name;
    private url;
    private folder;
    private tokenWidth;
    private tokenHeight;
    getFolder(): string;
    setFolder(name: any): void;
    getLink(): string;
    getName(): string;
    setName(name: string): void;
    constructor(name: string, url: string, folder: string);
    updateFromObject(obj: any): void;
    exportAsObject(): {
        name: string;
        url: string;
        folder: string;
    };
}
/**
 * Created by Reddo on 14/09/2015.
 */
declare class User {
    nickname: string;
    nicknamesufix: string;
    id: number;
    level: number;
    gameContexts: {
        [id: number]: UserGameContext;
    };
    roomContexts: {
        [id: number]: UserRoomContext;
    };
    private changedTrigger;
    isMe(): boolean;
    isAdmin(): boolean;
    exportAsLog(): {
        id: number;
        nickname: string;
        nicknamesufix: string;
        level: number;
        gameid: number;
        roomid: number;
    };
    getGameContext(id: number): UserGameContext;
    releaseGameContext(id: number): void;
    getRoomContext(id: number): UserRoomContext;
    releaseRoomContext(id: number): void;
    getFullNickname(): string;
    getShortNickname(): string;
    updateFromObject(user: Object): void;
}
declare class UserGameContext {
    private user;
    private gameid;
    constructor(user: User);
    createRoom: boolean;
    createSheet: boolean;
    editSheet: boolean;
    viewSheet: boolean;
    deleteSheet: boolean;
    invite: boolean;
    promote: boolean;
    getUser(): User;
    updateFromObject(obj: {
        [id: string]: any;
    }): void;
    isCreateRoom(): boolean;
    isCreateSheet(): boolean;
}
declare class UserRoomContext {
    private user;
    roomid: number;
    private logger;
    private cleaner;
    private storyteller;
    constructor(user: User);
    getRoom(): Room;
    getUser(): User;
    isStoryteller(): boolean;
    isCleaner(): boolean;
    updateFromObject(user: Object): void;
    getUniqueNickname(): string;
}
declare class Room {
    gameid: number;
    id: number;
    description: string;
    name: string;
    playByPost: boolean;
    privateRoom: boolean;
    publicRoom: boolean;
    creatorid: number;
    private users;
    private messages;
    clearMessages(): void;
    exportAsLog(messages: Array<Message>): {
        gameid: number;
        id: number;
        description: string;
        name: string;
        creatorid: number;
    };
    getMessages(): Array<Message>;
    getOrderedMessages(): Array<Message>;
    getOrderedUsers(): Array<User>;
    getOrderedUserContexts(): Array<UserRoomContext>;
    getStorytellers(): Array<UserRoomContext>;
    getMe(): UserRoomContext;
    getUser(id: number): UserRoomContext;
    getUsersByName(str: string): Array<UserRoomContext>;
    getGame(): Game;
    exportAsNewRoom(): {
        name: string;
        description: string;
        private: boolean;
        streamable: boolean;
        playbypost: boolean;
        gameid: number;
    };
    updateFromObject(room: Object, cleanup: boolean): void;
}
declare class Game {
    private users;
    private rooms;
    private sheets;
    description: string;
    name: string;
    id: number;
    freejoin: boolean;
    creatorid: number;
    creatornick: string;
    creatorsufix: string;
    exportAsLog(roomid: number, messages: Array<Message>): {
        description: string;
        name: string;
        id: number;
        freejoin: boolean;
        creatorid: number;
        creatornick: string;
        creatorsufix: string;
    };
    getId(): number;
    getName(): string;
    getCreatorFullNickname(): string;
    isMyCreation(): boolean;
    getMe(): UserGameContext;
    getUser(id: number): UserGameContext;
    getRoom(id: number): Room;
    getSheet(id: number): SheetInstance;
    getOrderedRoomList(): Array<Room>;
    getOrderedSheetList(): Array<SheetInstance>;
    exportAsObject(): {
        desc: string;
        name: string;
        freejoin: boolean;
    };
    updateFromObject(game: Object, cleanup: boolean): void;
}
declare class SheetInstance {
    private tab;
    id: number;
    gameid: number;
    folder: string;
    private name;
    values: Object;
    lastValues: string;
    creator: number;
    creatorNickname: string;
    styleId: number;
    styleName: string;
    styleCreator: number;
    styleCreatorNickname: string;
    styleSafe: boolean;
    view: boolean;
    private edit;
    delete: boolean;
    promote: boolean;
    isPublic: boolean;
    changed: boolean;
    loaded: boolean;
    private changeTrigger;
    getStyleId(): number;
    getStyle(): StyleInstance;
    getTab(): SheetTab;
    getGameid(): number;
    getGame(): Game;
    getFolder(): string;
    getId(): number;
    removeChangeListener(list: Listener | Function): void;
    addChangeListener(list: Listener | Function): void;
    triggerChanged(): void;
    getMemoryId(): string;
    setSaved(): void;
    setName(name: string): void;
    getName(): string;
    getValues(): Object;
    setValues(values: Object, local: boolean): void;
    updateFromObject(obj: Object): void;
    getValue(id: string): any;
    isEditable(): boolean;
    isEditableForRealsies(): boolean;
    isPromotable(): boolean;
    isDeletable(): boolean;
    isNPC(): boolean;
    considerEditable(): void;
}
declare class StyleInstance {
    id: number;
    gameid: number;
    name: string;
    mainCode: string;
    publicCode: string;
    html: string;
    css: string;
    publicStyle: boolean;
    getId(): number;
    getName(): string;
    isLoaded(): boolean;
    updateFromObject(obj: any): void;
}
declare class SoundLink {
    private name;
    private url;
    private folder;
    private bgm;
    getFolder(): string;
    isBgm(): boolean;
    setFolder(name: any): void;
    getLink(): string;
    getName(): string;
    setName(name: string): void;
    constructor(name: string, url: string, folder: string, bgm: boolean);
    exportAsObject(): {
        name: string;
        url: string;
        folder: string;
        bgm: boolean;
    };
}
declare class PseudoWord {
    private originalWord;
    private translatedWord;
    constructor(word: string);
    addTranslation(word: string): void;
    getOriginal(): string;
    getTranslation(): string | String;
}
declare class PseudoLanguage {
    singleLetters: Array<string>;
    shortWords: Array<string>;
    syllabi: Array<string>;
    numbers: Array<string>;
    staticWords: {
        [word: string]: string;
    };
    words: Array<PseudoWord>;
    index: number;
    randomizeNumbers: boolean;
    lowerCaseOnly: boolean;
    allowPoints: boolean;
    maxLengthDifference: number;
    rng: Function;
    protected static languages: {
        [id: string]: PseudoLanguage;
    };
    currentWord: string;
    currentTranslation: string;
    static getLanguageNames(): Array<string>;
    static getLanguage(id: string): PseudoLanguage;
    constructor(id: string);
    addStaticWord(words: Array<string>, translation: string): this;
    addLetters(as: Array<string>): this;
    addShortWords(as: Array<string>): this;
    addNumbers(as: Array<string>): this;
    setRandomizeNumbers(rn: boolean): this;
    setLowerCase(lc: boolean): this;
    setAllowPoints(ap: boolean): this;
    addSyllabi(syllabi: Array<string>): this;
    getLastWord(): PseudoWord;
    getCurrentWord(): PseudoWord;
    getNextWord(): PseudoWord;
    lastSyllable: string;
    usedSyllable: any[];
    getSyllableCustom(): string;
    getSyllable(): string;
    chance(chance: number): boolean;
    increaseCurrentTranslation(): void;
    isAcceptable(): boolean;
    getSingleLetter(): string;
    getShortWord(): string;
    translateWord(pseudo: PseudoWord): void;
    translate(phrase: string): string;
}
/**
 * Created by Reddo on 14/09/2015.
 */
declare class AJAXConfig {
    private _target;
    private _url;
    private _timeout;
    private _responseType;
    private _data;
    static TARGET_NONE: number;
    static TARGET_GLOBAL: number;
    static TARGET_LEFT: number;
    static TARGET_RIGHT: number;
    static CONDITIONAL_LOADING_TIMEOUT: number;
    private loadingTimeout;
    private instantLoading;
    constructor(url: string);
    forceLoading(): void;
    startConditionalLoading(): void;
    finishConditionalLoading(): void;
    get target(): number;
    set target(value: number);
    get url(): string;
    set url(value: string);
    get timeout(): number;
    set timeout(value: number);
    get responseType(): string;
    set responseType(value: string);
    get data(): Object;
    set data(value: Object);
    setData(id: string, value: any): void;
    setResponseTypeJSON(): void;
    setResponseTypeText(): void;
    setTargetNone(): void;
    setTargetGlobal(): void;
    setTargetLeftWindow(): void;
    setTargetRightWindow(): void;
}
declare class WebsocketController {
    private url;
    private socket;
    private keepAlive;
    private keepAliveTime;
    private keepAliveInterval;
    private static READYSTATE_CONNECTING;
    private static READYSTATE_OPEN;
    private static READYSTATE_CLOSING;
    private static READYSTATE_CLOSED;
    private onOpen;
    private onClose;
    private onMessage;
    private onError;
    constructor(url: string);
    connect(): void;
    isReady(): boolean;
    resetInterval(): void;
    disableInterval(): void;
    doKeepAlive(): void;
    send(action: string, obj: any): void;
    close(): void;
    addCloseListener(obj: Listener): void;
    addOpenListener(obj: Listener): void;
    addMessageListener(type: string, obj: Listener): void;
    triggerOpen(): void;
    triggerClose(): void;
    triggerMessage(e: MessageEvent): void;
}
declare class ChatWsController implements ChatController {
    private socket;
    private currentRoom;
    onReady: Listener;
    constructor();
    isReady(): boolean;
    start(): void;
    end(): void;
    enterRoom(id: number): void;
    sendStatus(info: PersonaInfo): void;
    sendPersona(info: PersonaInfo): void;
    sendMessage(message: Message): void;
    saveMemory(memory: string): void;
    addCloseListener(obj: Listener): void;
    addOpenListener(obj: Listener): void;
    addMessageListener(type: string, obj: Listener): void;
}
/**
 * Created by Reddo on 16/09/2015.
 */
declare class Configuration {
    private changeTrigger;
    protected value: any;
    defValue: any;
    setFunction: Function;
    getFunction: Function;
    constructor(defV: any);
    getDefault(): any;
    reset(): void;
    addChangeListener(listener: Listener | Function): void;
    storeValue(value: any): boolean;
    getValue(): any;
}
declare class NumberConfiguration extends Configuration {
    private min;
    private max;
    constructor(defValue: any, min: number, max: number);
    setFunction: (value: number) => void;
    getFunction: () => any;
}
declare class WsportConfiguration extends Configuration {
    setFunction: (value: number) => void;
}
declare class LanguageConfiguration extends Configuration {
    constructor();
    setFunction: (value: string) => void;
}
declare class BooleanConfiguration extends Configuration {
    constructor(bool: boolean);
    setFunction: (value: string) => void;
    getFunction: () => boolean;
}
declare abstract class TrackerMemory {
    private changeTrigger;
    abstract reset(): void;
    abstract storeValue(value: any): any;
    abstract getValue(): any;
    abstract exportAsObject(): any;
    addChangeListener(listener: Listener | Function): void;
    protected triggerChange(): void;
}
declare class MemoryCombat extends TrackerMemory {
    private combatants;
    private effects;
    private storedEffects;
    private round;
    private turn;
    private targets;
    private targetTrigger;
    addTargetListener(f: Function | Listener): void;
    removeTargetListener(f: Function | Listener): void;
    triggerTarget(): void;
    getCurrentTurnOwner(): CombatParticipant;
    getEffects(): {
        [id: number]: CombatEffect[];
    };
    getEffectsOn(id: number): Array<CombatEffect>;
    removeEffect(ce: CombatEffect): void;
    addCombatEffect(effect: CombatEffect): void;
    addEffect(ce: CombatEffectInfo): void;
    cleanTargets(): void;
    getTargets(): number[];
    getTargetCombatants(): any[];
    isTarget(id: number): boolean;
    setTarget(id: number): void;
    endCombat(): void;
    getRound(): number;
    getTurn(): number;
    getRoundFor(id: number): number;
    getCombatants(): CombatParticipant[];
    getMyCombatants(): any[];
    reset(): void;
    removeParticipant(c: CombatParticipant): void;
    reorderCombatants(): void;
    addParticipant(sheet: SheetInstance, owner?: User): void;
    incrementRound(): void;
    considerEndingEffects(): void;
    setTurn(combatant: CombatParticipant): void;
    incrementTurn(): void;
    exportAsObject(): any[];
    storeEffectNames(): void;
    announceEffectEnding(): void;
    storeValue(obj: any): void;
    applyInitiative(id: number, initiative: number): void;
    setInitiative(combatant: CombatParticipant, initiative: number): void;
    getValue(): any;
}
declare class MemoryFilter extends TrackerMemory {
    static names: Array<string>;
    private value;
    reset(): void;
    getValue(): string;
    storeName(name: string): void;
    storeValue(i: number): void;
    exportAsObject(): number;
}
declare class MemoryPica extends TrackerMemory {
    private picaAllowed;
    private updateUnderway;
    private changeDetected;
    private static fieldOrder;
    reset(): void;
    getValue(): this;
    isPicaAllowed(): boolean;
    picaAllowedExport(): number;
    picaAllowedStore(isIt: boolean | number): void;
    storeValue(values: Array<any>): void;
    exportAsObject(): Array<any>;
}
declare class MemoryLingo extends TrackerMemory {
    private userLingos;
    private busy;
    getUser(id: number): string[];
    clean(): void;
    getUsers(): {
        [id: number]: string[];
    };
    reset(): void;
    getValue(): this;
    addUserLingo(id: number, lingo: string): void;
    removeUserLingo(id: number, lingo: string): void;
    isSpeaker(id: number, lingo: string): boolean;
    getSpeakers(lingo: string): Array<UserRoomContext>;
    getSpeakerArray(lingo: string): Array<number>;
    storeValue(values: Array<any>): void;
    exportAsObject(): Array<any>;
}
declare class MemoryVersion extends TrackerMemory {
    private importVersion;
    reset(): void;
    storeValue(v: number): void;
    getValue(): number;
    exportAsObject(): number;
}
declare class MemoryCutscene extends TrackerMemory {
    private chatAllowed;
    private static button;
    constructor();
    click(): void;
    reset(): void;
    storeValue(v: boolean | number): void;
    getValue(): boolean;
    exportAsObject(): number;
}
interface CombatEffectInfo {
    name: string;
    target: number;
    roundEnd: number;
    turnEnd: number;
    endOnStart: boolean;
    customString: String;
}
declare class CombatEffect {
    name: string;
    target: number;
    roundEnd: number;
    turnEnd: number;
    endOnStart: boolean;
    customString: String;
    private combat;
    constructor(combat: MemoryCombat);
    getTargetName(): string;
    considerEnding(): void;
    reset(): void;
    exportAsObject(): (string | number)[];
    updateFromObject(array: Array<any>): void;
}
declare class CombatParticipant {
    id: number;
    name: string;
    initiative: number;
    owner: number;
    setSheet(sheet: SheetInstance): void;
    setSheetId(id: number): void;
    setName(name: string): void;
    setInitiative(init: number): void;
    setOwner(id: number): void;
    updateFromObject(obj: Array<any>): void;
    exportAsObject(): any[];
}
declare class ChatCombatRow {
    private visible;
    private combatant;
    private input;
    constructor(combatant: CombatParticipant, currentTurn: boolean, currentTarget: boolean, isStoryteller: boolean);
    getHTML(): HTMLDivElement;
    change(): void;
    remove(): void;
    setTurn(): void;
    setTarget(): void;
    openSheet(): void;
}
declare class ChatInfo {
    private floater;
    private textNode;
    private senderBold;
    private senderTextNode;
    private storyteller;
    constructor(floater: HTMLElement);
    showFor($element: JQuery, message?: Message): void;
    hide(): void;
    bindMessage(message: Message, element: HTMLElement): void;
}
declare class ChatAvatar {
    private element;
    private img;
    private typing;
    private afk;
    private name;
    private user;
    private persona;
    online: boolean;
    private changedOnline;
    constructor();
    getHTML(): HTMLElement;
    getUser(): User;
    setOnline(online: boolean): void;
    reset(): void;
    isChangedOnline(): boolean;
    setImg(img: String): void;
    setName(name: string): void;
    setFocus(focus: boolean): void;
    setTyping(typing: boolean): void;
    setAfk(afk: boolean): void;
    updateName(): void;
    updateFromObject(obj: Object): void;
}
declare class ChatNotificationIcon {
    private element;
    private hoverInfo;
    private language;
    constructor(icon: string, hasLanguage?: boolean);
    addText(text: string): void;
    getElement(): HTMLElement;
    show(): boolean;
    hide(): boolean;
}
declare class ChatFormState {
    private element;
    private state;
    static STATE_NORMAL: number;
    static STATE_ACTION: number;
    static STATE_STORY: number;
    static STATE_OFF: number;
    constructor(element: HTMLElement);
    getState(): number;
    isNormal(): boolean;
    isAction(): boolean;
    isStory(): boolean;
    isOff(): boolean;
    setState(state: number): void;
}
declare class ChatAvatarChoice {
    id: string;
    private avatar;
    private box;
    private useButton;
    private deleteButton;
    nameStr: String;
    avatarStr: String;
    constructor(name: String, avatar: String);
    getHTML(): HTMLElement;
}
declare class ChatSystemMessage {
    private element;
    private hasLanguage;
    constructor(hasLanguage: boolean);
    addLangVar(id: string, value: string): void;
    static createTextLink(text: string, hasLanguage: boolean, click: Listener | Function): HTMLElement;
    addTextLink(text: string, hasLanguage: boolean, click: Listener | Function): void;
    addLineBreak(): void;
    addText(text: string): void;
    addLingoVariable(id: string, value: string): void;
    addElement(ele: HTMLElement): void;
    getElement(): HTMLElement;
}
declare class ImagesRow {
    private html;
    private image;
    private folder;
    private nameNode;
    view(): void;
    share(): void;
    usePersona(): void;
    delete(): void;
    renameFolder(): void;
    rename(): void;
    constructor(image: ImageLink, folder: ImagesFolder);
    getHTML(): HTMLElement;
}
declare class ImagesFolder {
    private html;
    private name;
    private folderContainer;
    constructor(images: Array<ImageLink>);
    getName(): string;
    open(): void;
    toggle(): void;
    getHTML(): HTMLElement;
    delete(): void;
    considerSuicide(): void;
}
declare class SheetsRow {
    private sheet;
    private html;
    private nameNode;
    open(e: MouseEvent): void;
    deleteSheet(): void;
    editPerm(): void;
    editFolder(): void;
    constructor(sheet: SheetInstance);
    getHTML(): HTMLElement;
}
declare class SheetsFolder {
    private html;
    private folderContainer;
    constructor(sheets: Array<SheetInstance>, open?: boolean);
    getHTML(): HTMLElement;
}
declare class SheetPermRow {
    sheetId: number;
    userId: number;
    nickname: string;
    nicknamesufix: string;
    deleteSheet: boolean;
    editSheet: boolean;
    viewSheet: boolean;
    promoteSheet: boolean;
    viewInput: HTMLInputElement;
    editInput: HTMLInputElement;
    deleteInput: HTMLInputElement;
    promoteInput: HTMLInputElement;
    exportPrivileges(): {
        userid: number;
        deletar: boolean;
        editar: boolean;
        visualizar: boolean;
        promote: boolean;
    };
    constructor(player: any);
    getHTML(): HTMLParagraphElement;
}
declare class SoundsRow {
    private html;
    private sound;
    private folder;
    private nameNode;
    play(): void;
    share(): void;
    delete(): void;
    renameFolder(): void;
    rename(): void;
    constructor(snd: SoundLink, folder: SoundsFolder);
    getHTML(): HTMLElement;
}
declare class SoundsFolder {
    private html;
    private name;
    private folderContainer;
    constructor(sounds: Array<SoundLink>);
    getName(): string;
    open(): void;
    toggle(): void;
    delete(): void;
    getHTML(): HTMLElement;
    considerSuicide(): void;
}
declare class SheetTab {
    private sheet;
    private div;
    private text;
    constructor(sheet: SheetInstance);
    updateName(): void;
    checkNPCStatus(): void;
    getHTML(): HTMLElement;
    toggleNpc(): void;
    toggleCharacter(): void;
    toggleOn(): void;
    toggleOff(): void;
    click(): void;
}
declare class SheetStyle {
    protected css: HTMLStyleElement;
    protected visible: HTMLElement;
    protected $visible: JQuery;
    protected styleInstance: StyleInstance;
    protected sheetInstance: SheetInstance;
    protected sheet: Sheet;
    protected sheetChangeTrigger: Trigger;
    protected loading: boolean;
    protected counter: number;
    protected triggeredVariables: Array<SheetVariable | SheetList | Sheet>;
    protected nameVariable: SheetVariabletext;
    protected creatorListeners: Array<SheetCreatorListener>;
    protected sheetInstanceChangeListener: Listener;
    protected sheetInstanceChangeTrigger: Trigger;
    addSheetInstanceChangeListener(f: Listener | Function): void;
    stringToType(str: String): string;
    isEditable(): boolean;
    /**
     * This function needs to be rewritten anytime a Style has custom types.
     * @param kind = string, "Sheet" | "SheetButton" | "SheetList"
     * @param type = string, "text" | "number"
     * @param def = string, default id
     * @returns {typeof Sheet | typeof SheetButton | typeof SheetList}
     */
    getCreator(kind: string, type: string, def: string): any;
    getSheet(): Sheet;
    addCreatorListener(obj: SheetCreatorListener): void;
    triggerCreatorListeners(): void;
    addSheetInstance(sheet: SheetInstance): void;
    reloadSheetInstance(): void;
    checkNPC(): void;
    triggerAllVariables(): void;
    triggerVariableChange(variable: SheetVariable | SheetList | Sheet): void;
    getCounter(): number;
    constructor(style: StyleInstance);
    protected bindSheetInstance(): void;
    protected unbindSheetInstance(): void;
    protected bindSheet(): void;
    getSheetInstance(): SheetInstance;
    updateSheetInstance(): void;
    protected createSheet(): void;
    protected fillElements(): void;
    getStyleInstance(): StyleInstance;
    getId(): number;
    getName(): string;
    /**
     * Return true if the command was accepted, this will cause the Dice to remove the button.
     * Return false if the command was not acceptable. Please print a Chat Message in this case.
     * @param dice
     * @returns {boolean}
     */
    doDiceCustom(dice: MessageDice): boolean;
    processCommand(msg: MessageSheetcommand): boolean;
    getCSS(): HTMLStyleElement;
    getHTML(): HTMLElement;
    createNameVariable(sheet: Sheet, element: HTMLElement): void;
    /**
     * This code gets called when a Style is being destroyed. Destroy anything that you created which is not connected to the style.
     */
    die(): void;
}
declare class SheetStyleTranslatable extends SheetStyle {
    protected translateObject(obj: Object): Object;
    protected translateSheet(): void;
    protected fillElements(): void;
}
declare class Sheet {
    protected parent: SheetStyle | SheetList;
    protected style: SheetStyle;
    protected elements: Array<Node>;
    protected values: {
        [id: string]: SheetVariable | SheetList;
    };
    protected valuesSimplified: {
        [id: string]: SheetVariable | SheetList;
    };
    protected indexedLists: Array<SheetList>;
    protected buttons: {
        [id: string]: SheetButton;
    };
    protected idCounter: number;
    protected editOnly: Array<HTMLElement>;
    protected changeListener: Listener;
    getField(id: string): SheetVariable | SheetList;
    findField(id: string): SheetVariable | SheetList;
    getLists(): SheetList[];
    updateEditable(): void;
    getValueFor(id: string): any;
    static simplifyString(str: String): string;
    getElements(): Node[];
    getUniqueID(): string;
    isRoot(): boolean;
    getParent(): SheetStyle | SheetList;
    constructor(parent: SheetStyle | SheetList, style: SheetStyle, elements: NodeList | Array<Node>);
    reset(): void;
    updateFromObject(obj: Object): void;
    exportAsObject(): {};
    /**
     *
     *
     * SheetCreation below
     *
     */
    /**
     *
     * @param element
     */
    processElement(element: HTMLElement): void;
    createList(element: HTMLElement): void;
    createVariable(element: HTMLElement): void;
    createButton(element: HTMLElement): void;
    /**
     * Alerts interested parties of changes made to this.
     * @type {Trigger}
     */
    protected changeTrigger: Trigger;
    addChangeListener(f: Listener | Function): void;
    addChangeListenerIfMissing(f: Listener | Function): void;
    removeChangeListener(f: Listener | Function): void;
    protected considerTriggering(): void;
    triggerChange(counter: number): void;
}
declare class SheetButton {
    protected id: string;
    protected visible: HTMLElement;
    protected parent: Sheet;
    protected style: SheetStyle;
    protected clickFunction: any;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    click(e: Event): void;
    getId(): string;
}
declare class SheetList {
    protected id: string;
    protected visible: HTMLElement;
    protected parent: Sheet;
    protected style: SheetStyle;
    protected rows: Array<Sheet>;
    protected detachedRows: Array<Sheet>;
    protected sheetElements: Array<Node>;
    protected defaultValue: Array<Object>;
    protected sheetType: typeof Sheet;
    protected busy: boolean;
    protected aliases: Array<string>;
    protected sheetChangeListener: Listener;
    getParent(): Sheet;
    getAliases(): string[];
    getRows(): Sheet[];
    protected tableIndex: string;
    protected tableValue: string;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    breakIn(sheet: Sheet): void;
    addRow(): void;
    empty(): void;
    reattachRows(): void;
    appendRow(newRow: Sheet): void;
    detachRow(oldRow: Sheet): void;
    removeRow(row: Sheet): void;
    removeLastRow(): void;
    isIndexed(): boolean;
    getId(): string;
    reset(): void;
    updateFromObject(obj: any): void;
    getTableIndex(): string;
    sort(): void;
    getRowIndex(id: string): Sheet;
    getValueFor(id: string): number;
    getValue(): Array<number>;
    exportAsObject(): any[];
    /**
     * Alerts interested parties of changes made to this.
     * @type {Trigger}
     */
    protected changeTrigger: Trigger;
    addChangeListener(f: Listener | Function): void;
    addChangeListenerIfMissing(f: Listener | Function): void;
    removeChangeListener(f: Listener | Function): void;
    protected considerTriggering(): void;
    triggerChange(counter: number): void;
}
declare class SheetVariable {
    protected visible: HTMLElement;
    protected parent: Sheet;
    protected style: SheetStyle;
    protected id: string;
    protected editable: boolean;
    protected value: any;
    protected defaultValueString: String;
    protected aliases: Array<string>;
    getAliases(): string[];
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    /**
     * Updates this variable's element to better reflect the current state.
     */
    updateVisible(): void;
    empty(): void;
    storeValue(obj: any): void;
    reset(): void;
    getValue(): any;
    updateFromObject(obj: any): void;
    exportAsObject(): any;
    getId(): string;
    /**
     * Alerts interested parties of changes made to this.
     * @type {Trigger}
     */
    protected changeTrigger: Trigger;
    addChangeListener(f: Listener | Function): void;
    addChangeListenerIfMissing(f: Listener | Function): void;
    removeChangeListener(f: Listener | Function): void;
    protected considerTriggering(): void;
    triggerChange(counter: number): void;
}
declare module StyleFactory {
    function getCreator(style: StyleInstance): typeof SheetStyle;
    function getSheetStyle(style: StyleInstance, reload?: boolean): SheetStyle;
}
interface SheetCreatorListener {
    complete(): void;
}
declare class SheetVariabletext extends SheetVariable {
    protected textNode: Text;
    protected mouse: boolean;
    constructor(parent: Sheet, style: SheetStyle, ele: HTMLElement);
    attachTextNode(): void;
    click(e: Event): void;
    mousedown(): void;
    input(e: any): void;
    keyup(e: any): void;
    isAllowedKey(key: any): boolean;
    keydown(e: any): void;
    focus(): void;
    blur(): void;
    updateContentEditable(): void;
    storeValue(value: string): void;
    updateVisible(): void;
}
declare class SheetVariablelongtext extends SheetVariable {
    private allowEmptyLines;
    private pClass;
    protected mouse: boolean;
    constructor(parent: Sheet, style: SheetStyle, ele: HTMLElement);
    mousedown(): void;
    click(e: Event): void;
    input(e: any): void;
    keyup(e: any): void;
    keydown(e: any): void;
    focus(): void;
    blur(): void;
    updateContentEditable(): void;
    storeValue(value: string): void;
    updateVisible(): void;
}
declare class SheetVariablenumber extends SheetVariabletext {
    protected defaultValue: number;
    parseString(str: string): number;
    parseNumber(n: number): number;
    reset(): void;
    constructor(parent: Sheet, style: SheetStyle, ele: HTMLElement);
    storeValue(value: string | number): void;
    isImportantInputKey(key: any): boolean;
    isAllowedKey(key: any): boolean;
    updateVisible(): void;
}
declare class SheetVariableinteger extends SheetVariablenumber {
    isAllowedKey(key: any): boolean;
    parseString(str: string): number;
    parseNumber(n: number): number;
}
declare class SheetVariablemath extends SheetVariabletext implements SheetCreatorListener {
    protected parsed: any;
    protected compiled: any;
    protected symbols: Array<string>;
    protected scope: {
        [id: string]: number;
    };
    protected lastValue: number;
    protected changeListener: Listener;
    constructor(parent: Sheet, style: SheetStyle, ele: HTMLElement);
    checkForChange(): void;
    protected parse(): void;
    getSymbols(): Array<string>;
    getScope(symbols: Array<string>): {
        [id: string]: number;
    };
    complete(): void;
    focus(): void;
    storeValue(value: string): void;
    getValue(): number;
    updateVisible(): void;
}
declare class SheetVariableimage extends SheetVariable {
    protected defaultName: string;
    protected defaultUrl: string;
    protected img: HTMLImageElement;
    protected select: HTMLSelectElement;
    protected errorUrl: string;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    reset(): void;
    blur(): void;
    change(): void;
    click(e: Event): void;
    error(e: Event): void;
    createOptions(name: string, arr: Array<Array<string>>): HTMLOptGroupElement;
    createOption(name: string, url: string): HTMLOptionElement;
    showSelect(): void;
    storeValue(arr: Array<string>): void;
    updateVisible(): void;
}
declare class SheetVariableselect extends SheetVariable {
    protected select: HTMLSelectElement;
    protected values: Array<string>;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    reset(): void;
    blur(): void;
    focus(): void;
    selectBlur(e: Event): void;
    selectChange(e: Event): void;
    showSelect(): void;
    storeValue(value: string): void;
    updateVisible(): void;
}
declare class SheetVariableboolean extends SheetVariable {
    protected visible: HTMLInputElement;
    protected defaultState: boolean;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    change(): void;
    reset(): void;
    storeValue(state: any): void;
    updateVisible(): void;
}
declare class SheetVariableimageselect extends SheetVariable {
    protected defaultName: string;
    protected defaultUrl: string;
    protected select: HTMLSelectElement;
    protected errorUrl: string;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    createOptions(name: string, arr: Array<Array<string>>): HTMLOptGroupElement;
    createOption(name: string, url: string): HTMLOptionElement;
    updateOptions(): void;
    storeValue(arr: Array<string>): void;
    updateVisible(): void;
    change(e: any): void;
    click(e: any): void;
}
declare class SheetButtonaddrow extends SheetButton {
    protected target: string;
    protected sheetInstanceChangeListener: any;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    updateVisible(): void;
    click(e: any): void;
}
declare class SheetButtonremoverow extends SheetButton {
    protected sheetInstanceChangeListener: any;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    updateVisible(): void;
    click(e: any): void;
}
declare class SheetButtondice extends SheetButton {
    protected parsed: any;
    protected compiled: any;
    protected symbols: Array<string>;
    protected scope: {
        [id: string]: number;
    };
    protected diceAmount: number;
    protected diceFaces: number;
    protected modifier: string;
    protected reason: String;
    constructor(parent: Sheet, style: SheetStyle, element: HTMLElement);
    getReason(): String;
    click(e: Event): void;
    createMessage(): MessageDice;
    protected createReason(value: number): string;
    protected parse(): void;
    getSymbols(): Array<string>;
    getScope(symbols: Array<string>): {
        [id: string]: number;
    };
    getValue(): number;
}
declare class SheetButtonsort extends SheetButtonaddrow {
    click(e: Event): void;
}
declare class SheetButtoncommonsroll extends SheetButton {
    protected parsed: any;
    protected compiled: any;
    protected symbols: Array<string>;
    protected scope: {
        [id: string]: number;
    };
    click(e: MouseEvent): void;
    getSymbols(): Array<string>;
    getScope(symbols: Array<string>): {
        [id: string]: number;
    };
    protected parse(expr: string): void;
    getValue(): number;
}
/**
 * Created by Reddo on 14/09/2015.
 */
declare module MessageFactory {
    function getCommandsAndSlashes(): any[];
    /**
     * Registers a message class for later use.
     * Messages are created when users type commands or when the system requires a message by name.
     * @param msg
     * @param id
     * @param slashCommands
     */
    function registerMessage(msg: typeof Message, id: string, slashCommands: Array<string>): void;
    function getMessagetypeArray(): (typeof Message)[];
    /**
     * Registers a slashcommand class for later use.
     * SlashCommands are called when users type commands.
     * @param slash
     * @param slashCommands
     */
    function registerSlashCommand(slash: typeof SlashCommand, slashCommands: Array<string>): void;
    /**
     * Returns a new instance of Message for the given id. Can return MessageUnknown.
     * @param id
     * @returns {any}
     */
    function createMessageFromType(id: string): Message;
    /**
     * Creates examples of every Message class for testing purposes.
     * @returns {Array<Message>}
     */
    function createTestingMessages(): Array<Message>;
    function getConstructorFromText(form: string): typeof SlashCommand;
    /**
     * Runs a form through a SlashCommand. Returns a Message if the SlashCommand was valid and for a Message.
     * @param form
     * @returns {any}
     */
    function createFromText(form: string): Message;
}
declare class SlashCommand {
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    receiveCommand(slashCommand: string, message: string): boolean;
    /**
     * Informs MessageFactory whether this SlashCommand is a message or not. Probably doesn't have to be changed.
     * @returns {boolean}
     */
    isMessage(): boolean;
    /**
     * HTMLElement that should be printed when receiveCommand returns false.
     * @param slashCommand
     * @param msg
     * @returns {HTMLElement|null}
     */
    getInvalidHTML(slashCommand: string, msg: string): HTMLElement;
}
declare class SlashClear extends SlashCommand {
    receiveCommand(slashCommand: string, message: string): boolean;
}
declare class SlashReply extends SlashCommand {
}
declare class SlashImages extends SlashCommand {
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    receiveCommand(slashCommand: string, message: string): boolean;
}
declare class SlashLog extends SlashCommand {
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    receiveCommand(slashCommand: string, message: string): boolean;
}
declare class SlashLingo extends SlashCommand {
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    receiveCommand(slashCommand: string, message: string): boolean;
    /**
     * HTMLElement that should be printed when receiveCommand returns false.
     * @param slashCommand
     * @param msg
     * @returns {HTMLElement|null}
     */
    getInvalidHTML(slashCommand: string, message: string): HTMLElement;
}
declare class SlashPica extends SlashCommand {
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    receiveCommand(slashCommand: string, message: string): boolean;
}
declare class SlashCommands extends SlashCommand {
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    receiveCommand(slashCommand: string, message: string): boolean;
}
/**
 * 'destination', 'id', 'module', 'msg', 'origin', 'roomid', 'date'
 message;
 {"localid":0,
 "destination":null,
 "message":"",
 "module":"dice",
 "special":{"dice":[8],"mod":null,"persona":null},
 "clone":false}
 */
declare class Message extends SlashCommand {
    id: number;
    localid: number;
    wasLocal: boolean;
    roomid: number;
    date: string;
    module: string;
    msg: string;
    special: {
        [id: string]: any;
    } | string;
    private sending;
    origin: number;
    destination: Number | Array<number>;
    private updatedTrigger;
    protected html: HTMLElement;
    clone: boolean;
    getDate(): string;
    onPrint(): void;
    setPersona(name: string): void;
    getPersona(): string;
    findPersona(): void;
    /**
     * Assigns this message a localId
     */
    getLocalId(): void;
    wasLocalMessage(): boolean;
    /**
     * Returns the UserRoomContext for the sender. ALWAYS returns a user, even if Origin is invalid (returns a new UserRoomContext() in this case).
     * @returns {UserRoomContext}
     */
    getUser(): UserRoomContext;
    addDestinationStorytellers(room: Room): void;
    addDestination(user: User): void;
    getDestinationArray(): Array<number>;
    getDestinations(): Array<UserRoomContext>;
    /**
     * Returns whether this message is public or has a given destinatary
     * @return boolean
     */
    hasDestination(): boolean;
    /**
     * Returns an Array of Messages meant for testing. This array should include all variations of this message type. Should include self for optimization.
     * @returns {Message[]}
     */
    makeMockUp(): Array<Message>;
    /**
     * Returns whether this is a whisper or not.
     * @returns {boolean}
     */
    isWhisper(): boolean;
    /**
     * Was this message sent by the current user?
     * @returns {boolean}
     */
    isMine(): boolean;
    /**
     * Returns an HTMLElement representing the Message. Can be null for Messages that should not be seen.
     * @returns {HTMLElement|Null}
     */
    createHTML(): HTMLElement;
    getHTML(): HTMLElement;
    prepareSending(): void;
    /**
     * Returns the request Special Value. Returns defaultValue if the requested special is not found.
     * @param id
     * @param defaultValue
     * @returns {any}
     */
    getSpecial(id: string, defaultValue?: any): any;
    /**
     * Stores a Special Value for the assigned Id.
     * @param id
     * @param value
     */
    setSpecial(id: string, value: any): void;
    /**
     * Receives values from an Object.
     * @param obj
     */
    updateFromObject(obj: Object): void;
    exportAsLog(): Object;
    /**
     * Exports Message as an object (meant for server).
     * @returns {{}}
     */
    exportAsObject(): Object;
    /**
     * Processes a received SlashCommand from the user.
     * If true is returned, the system will assume that the slashcommand was valid. If false, it'll assume it was invalid.
     * @param slashCommand
     * @param msg
     * @returns {boolean}
     */
    receiveCommand(slashCommand: string, msg: string): boolean;
    setMsg(str: string): void;
    getMsg(): string;
    unsetSpecial(id: string): void;
    addUpdatedListener(list: Listener | Function): void;
    triggerUpdated(): void;
    doNotPrint(): boolean;
}
declare class MessageBuff extends Message {
    module: string;
    private playedBefore;
    onPrint(): void;
    customAutomationPossible(): boolean;
    createHTML(): HTMLElement;
    applyBuff(): void;
    setSheetId(id: number): void;
    getSheetId(): number;
    setSheetName(name: string): void;
    getSheetName(): string;
    setEffectName(name: string): void;
    getEffectName(): any;
    setEffectRoundEnd(round: number): void;
    getEffectRoundEnd(): any;
    setEffectTurnEnd(turn: number): void;
    getEffectTurnEnd(): any;
    setEffectEndOnStart(endonstart: boolean): void;
    getEffectEndOnStart(): any;
    setEffectCustomString(customString: string): void;
    getEffectCustomString(): any;
}
declare class MessagePica extends Message {
    module: string;
    private msgOneArt;
    private msgUpdateArts;
    private msgRequestUpdate;
    private msgClearAll;
    private runOnce;
    constructor();
    considerAddingToArtManager(): void;
    setArt(art: PicaCanvasArt): void;
    setArtString(art: string): void;
    getArt(): PicaCanvasArt;
    setArts(arts: Array<any>): void;
    getArts(): any[];
    setUrl(url: string): void;
    getUrl(): any;
    getSpecificConfirmation(userid: number): any;
    getConfirmation(): any;
    setConfirmation(userList: Object): void;
    getHTML(): any;
    setCleanArts(isIt: boolean): void;
    isCleanArts(): boolean;
}
declare class MessageSystem extends Message {
    module: string;
    createHTML(): HTMLParagraphElement;
}
declare class MessageCountdown extends Message {
    private counter;
    private counterContainer;
    module: string;
    static timeout: Number;
    static lastTimeout: MessageCountdown;
    constructor();
    createHTML(): HTMLElement;
    receiveCommand(slash: string, msg: string): boolean;
    getTarget(): any;
    setTarget(id: number): void;
    setCounter(e: number): void;
    getCounter(): number;
    updateCounter(e: number): void;
    setStory(storyMessage: string): void;
    getStory(): any;
}
declare class MessageVote extends Message {
    module: string;
    private voters;
    private voteAmountText;
    private votersText;
    constructor();
    setVoteTarget(id: number): void;
    getVoteTarget(): any;
    createHTML(): HTMLParagraphElement;
    updateVoters(): void;
    addVote(user: UserRoomContext): void;
    removeVote(user: UserRoomContext): void;
}
declare class MessageWebm extends Message {
    module: string;
    createHTML(): HTMLParagraphElement;
    getName(): any;
    setName(name: string): void;
}
declare class MessageVideo extends Message {
    module: string;
    createHTML(): HTMLParagraphElement;
    getName(): any;
    setName(name: string): void;
}
declare class MessageQuote extends Message {
    module: string;
    createHTML(): HTMLElement;
    setQuoted(name: String): void;
    getQuoted(): any;
    receiveCommand(slashCommand: string, message: string): boolean;
    isIgnored(): boolean;
    setLanguage(lang: string): void;
    setTranslation(message: string): void;
    getTranslation(): String;
}
declare class MessageSE extends Message {
    module: string;
    private playedBefore;
    onPrint(): void;
    createHTML(): HTMLParagraphElement;
    getName(): any;
    setName(name: string): void;
    static shareLink(name: string, url: string): void;
}
declare class MessageImage extends Message {
    module: string;
    private openedBefore;
    private static lastImages;
    private static maxHistory;
    private static noAutomation;
    private static addLastImage;
    static getLastImages(roomid: number): MessageImage[];
    static stopAutomation(): void;
    static resumeAutomation(): void;
    onPrint(): void;
    createHTML(): HTMLParagraphElement;
    clickLink(): void;
    getName(): any;
    setName(name: string): void;
    static shareLink(name: string, url: string): void;
    /**
     * Processes a received SlashCommand from the user.
     * If true is returned, the system will assume that the slashcommand was valid. If false, it'll assume it was invalid.
     * @param slashCommand
     * @param msg
     * @returns {boolean}
     */
    receiveCommand(slashCommand: string, msg: string): boolean;
}
declare class MessageBGM extends Message {
    module: string;
    private playedBefore;
    onPrint(): void;
    createHTML(): HTMLParagraphElement;
    getName(): any;
    setName(name: string): void;
    static shareLink(name: string, url: string): void;
}
declare class MessageStream extends Message {
    module: string;
    createHTML(): any;
}
declare class MessageSheetcommand extends Message {
    module: string;
    private playedBefore;
    onPrint(): void;
    customAutomationPossible(): boolean;
    createHTML(): HTMLElement;
    applyCommand(): void;
    setSheetId(id: number): void;
    getSheetId(): number;
    setSheetName(name: string): void;
    getSheetName(): string;
    setCustomString(customString: string): void;
    getCustomString(): any;
}
declare class MessageWhisper extends Message {
    module: string;
    constructor();
    onPrint(): void;
    createHTML(): HTMLElement;
    receiveCommand(slashCommand: string, msg: string): boolean;
    getInvalidHTML(slashCommand: string, msg: string): HTMLElement;
}
declare class MessageSheetdamage extends Message {
    module: string;
    createHTML(): HTMLParagraphElement;
    getType(): string;
    setTypeHP(): void;
    setTypeMP(): void;
    setTypeExp(): void;
    setLog(log: string): void;
    getLog(): String;
    setSheetName(name: string): void;
    getSheetName(): string;
    setAmount(amount: number): void;
    getAmount(): string;
}
declare class MessageSheetturn extends Message {
    module: string;
    private playedBefore;
    createHTML(): HTMLParagraphElement;
    setSheetId(id: number): void;
    getSheetId(): number;
    setSheetName(name: string): void;
    getSheetName(): string;
    setOwnerId(id: number): void;
    getOwnerId(): any;
    setPlayer(id: number): void;
    getPlayer(): number;
    onPrint(): void;
}
declare class MessageDice extends Message {
    module: string;
    private diceHQTime;
    private initiativeClicker;
    private customClicker;
    private playedBefore;
    constructor();
    onPrint(): void;
    findPersona(): void;
    makeMockUp(): MessageDice[];
    createHTML(): HTMLElement;
    doCustom(): void;
    hasCustomAutomation(): boolean;
    customAutomationPossible(): boolean;
    setSheetName(name: string): void;
    getSheetName(): any;
    setCustomAutomationStyle(id: number): void;
    getCustomAutomationStyle(): any;
    setCustomAutomation(obj: any): void;
    getCustomAutomation(): any;
    applyInitiative(): void;
    setSheetId(id: number): void;
    getSheetId(): any;
    setAsInitiative(): void;
    getIsInitiative(): boolean;
    getInitialRoll(): string;
    getRolls(): Array<number>;
    getMod(): number;
    setMod(mod: number): void;
    getDice(): Array<number>;
    setDice(dice: Array<number>): void;
    addMod(mod: number): void;
    addDice(amount: number, faces: number): void;
    getResult(): number;
    getIsOrdered(): boolean;
    setIsOrdered(order: boolean): void;
}
declare class MessageStory extends Message {
    module: string;
    makeMockUp(): Array<Message>;
    isIgnored(): boolean;
    createHTML(): HTMLElement;
    setLanguage(lang: string): void;
    setTranslation(message: string): void;
    getTranslation(): String;
}
declare class MessageAction extends Message {
    module: string;
    findPersona(): void;
    createHTML(): HTMLElement;
}
declare class MessageOff extends Message {
    module: string;
    createHTML(): HTMLElement;
}
declare class MessageRoleplay extends Message {
    module: string;
    findPersona(): void;
    constructor();
    makeMockUp(): Array<Message>;
    createHTML(): HTMLElement;
    isIgnored(): boolean;
    getLanguage(): string;
    setLanguage(lang: string): void;
    setTranslation(message: string): void;
    getTranslation(): String;
}
declare class MessageSheetup extends Message {
    module: string;
    private playedBefore;
    private clicker;
    onPrint(): any;
    setSheetId(id: number): void;
    getSheetId(): any;
    updateSheet(): void;
    createHTML(): HTMLElement;
}
declare class MessageUnknown extends Message {
    module: string;
    createHTML(): HTMLElement;
}
declare class MessageCutscene extends Message {
    module: string;
    createHTML(): HTMLElement;
    static sendNotification(chatAllowed: boolean): void;
}
declare module DB {
}
declare module DB.UserDB {
    function hasUser(id: number): boolean;
    function getUser(id: number): User;
    function getAUser(id: number): User;
    function updateFromObject(obj: Array<Object>): void;
}
declare module DB.GameDB {
    function hasGame(id: number): boolean;
    function getGame(id: number): Game;
    function getOrderedGameList(): Array<Game>;
    function updateFromObject(obj: Array<Object>, cleanup: boolean): void;
}
declare module DB.RoomDB {
    var rooms: {
        [id: number]: Room;
    };
    function hasRoom(id: number): boolean;
    function getRoom(id: number): Room;
    function releaseRoom(id: number): boolean;
    function updateFromObject(obj: Array<Object>, cleanup: boolean): void;
}
declare module DB.MessageDB {
    var messageById: {
        [id: number]: Message;
    };
    function releaseMessage(id: number): boolean;
    function releaseLocalMessage(id: number | string): boolean;
    function releaseAllLocalMessages(): void;
    function hasMessage(id: number): boolean;
    function hasLocalMessage(id: number | string): boolean;
    function getMessage(id: number): Message;
    function getLocalMessage(id: number): Message;
    function registerLocally(msg: Message): void;
    function updateFromObject(obj: Array<Object>): void;
}
declare module DB.SheetDB {
    function addChangeListener(list: Listener | Function): void;
    function removeChangeListener(list: Listener | Function): void;
    function triggerChanged(sheet: SheetInstance): void;
    function hasSheet(id: number): boolean;
    function getSheet(id: number): SheetInstance;
    function releaseSheet(id: number): void;
    function updateFromObject(obj: Array<Object>): void;
    function getSheetsByGame(game: Game): any[];
    function getSheetsByFolder(sheets: Array<SheetInstance>): Array<Array<SheetInstance>>;
    function saveSheet(sheet: SheetInstance): void;
}
declare module DB.ImageDB {
    function removeImage(img: ImageLink): void;
    function removeFolder(folderName: string): void;
    function considerSaving(): void;
    function getImages(): ImageLink[];
    function getImageByName(name: string): ImageLink;
    function getImageByLink(url: string): ImageLink;
    function hasImageByName(name: string): boolean;
    function hasImageByLink(url: string): boolean;
    function getImagesByFolder(): Array<Array<ImageLink>>;
    function exportAsObject(): any[];
    function updateFromObject(obj: Array<Object>): void;
    function addImage(img: ImageLink): void;
    function addImages(imgs: Array<ImageLink>): void;
    function triggerChange(image: ImageLink): void;
    function addChangeListener(f: Listener | Function): void;
    function removeChangeListener(f: Listener | Function): void;
}
declare module DB.SoundDB {
    function removeSound(snd: SoundLink): void;
    function removeFolder(folderName: string): void;
    function considerSaving(): void;
    function getSounds(): SoundLink[];
    function getSoundByName(name: string): SoundLink;
    function getSoundByLink(url: string): SoundLink;
    function hasSoundByName(name: string): boolean;
    function hasSoundByLink(url: string): boolean;
    function getSoundsByFolder(): Array<Array<SoundLink>>;
    function exportAsObject(): any[];
    function updateFromObject(obj: Array<Object>): void;
    function addSound(snd: SoundLink): void;
    function addSounds(snds: Array<SoundLink>): void;
    function triggerChange(image: SoundLink): void;
    function addChangeListener(f: Listener | Function): void;
    function removeChangeListener(f: Listener | Function): void;
}
declare module DB.StyleDB {
    function addChangeListener(list: Listener | Function): void;
    function removeChangeListener(list: Listener | Function): void;
    function triggerChanged(sheet: SheetInstance): void;
    function hasStyle(id: number): boolean;
    function getStyle(id: number): StyleInstance;
    function getStyles(): Array<StyleInstance>;
    function releaseStyle(id: number): void;
    function updateStyle(obj: any): void;
}
declare module Application {
    function getMe(): User;
    function isMe(id: number): boolean;
    function getMyId(): number;
}
/**
 * Created by Reddo on 15/09/2015.
 */
declare module Application.Config {
    function getConfig(id: string): Configuration;
    function registerChangeListener(id: string, listener: Listener | Function): void;
    function registerConfiguration(id: string, config: Configuration): void;
    function exportAsObject(): {
        [id: string]: any;
    };
    function reset(): void;
    function updateFromObject(obj: {
        [id: string]: any;
    }): void;
    function saveConfig(cbs?: Listener | Function, cbe?: Listener | Function): void;
}
declare module Application.LocalMemory {
    function getMemory(id: string, defaultValue: any): any;
    function getMemoryLength(id: string): number;
    function setMemory(id: string, value: any): void;
    function unsetMemory(id: string): void;
}
declare module Application.Login {
    /**
     * Checks localStorage for a valid Session id.
     * If there is no valid Session id, checks localStorage for last login's e-mail.
     * If there is no last e-mail, goes back to square one.
     */
    function searchLogin(): void;
    function hasLastEmail(): boolean;
    function getLastEmail(): string;
    function isLogged(): boolean;
    function hasSession(): boolean;
    function getSession(): String;
    function logout(): void;
    function attemptLogin(email: string, password: string, cbs: Listener, cbe: Listener): void;
    function receiveLogin(userJson: Object, sessionid: string): void;
    function updateSessionLife(): void;
    function updateLocalStorage(): void;
    function keepAlive(): void;
    function setSession(a: string): void;
    function addListener(listener: Listener | Function): void;
    function getUser(): User;
}
declare module Server {
    var IMAGE_URL: string;
    var APPLICATION_URL: string;
    var CLIENT_URL: string;
    var WEBSOCKET_SERVERURL: string;
    var WEBSOCKET_CONTEXT: string;
    var WEBSOCKET_PORTS: Array<number>;
    function getWebsocketURL(): string;
}
/**
 * Created by Reddo on 14/09/2015.
 */
declare module Server.AJAX {
    function requestPage(ajax: AJAXConfig, success: Listener | Function, error: Listener | Function): void;
}
declare module Server.Config {
    function saveConfig(config: Object, cbs?: Listener | Function, cbe?: Listener | Function): void;
}
declare module Server.Login {
    /**
     * Requests session information from the server. Renews login information on success, logs out on error.
     * @param silent
     * @param cbs
     * @param cbe
     */
    function requestSession(silent: boolean, cbs?: Listener, cbe?: Listener): void;
    /**
     * Attempts to log in with information provided. Sets up login information on success. Runs cbe, if available, on failure.
     * @param email
     * @param password
     * @param cbs
     * @param cbe
     */
    function doLogin(email: string, password: string, cbs?: Listener, cbe?: Listener): void;
    /**
     * Attempts to log out from current session. Logs out on success.
     * @param cbs
     * @param cbe
     */
    function doLogout(cbs?: Listener, cbe?: Listener): void;
    function createAccount(name: string, pass: string, email: string, nick: string, cbs?: Listener | EventListenerObject | Function, cbe?: Listener | EventListenerObject | Function): void;
}
declare module Server.Images {
    function getImages(cbs?: Listener, cbe?: Listener): void;
}
declare module Server.Games {
    function updateLists(cbs?: Listener, cbe?: Listener): void;
    function createRoom(room: Room, cbs?: Listener, cbe?: Listener): void;
    function createGame(game: Game, cbs?: Listener, cbe?: Listener): void;
    function editGame(game: Game, cbs?: Listener, cbe?: Listener): void;
    function getInviteList(cbs?: Listener, cbe?: Listener): void;
    function sendInvite(gameid: number, nickname: string, nicknamesufix: string, message: string, cbs?: Listener, cbe?: Listener): void;
    function acceptInvite(gameid: number, cbs?: Listener, cbe?: Listener): void;
    function rejectInvite(gameid: number, cbs?: Listener, cbe?: Listener): void;
    function leaveGame(gameid: number, cbs?: Listener, cbe?: Listener): void;
    function deleteGame(gameid: number, cbs?: Listener, cbe?: Listener): void;
    function deleteRoom(roomid: number, cbs?: Listener, cbe?: Listener): void;
    function getPrivileges(gameid: number, cbs?: Listener, cbe?: Listener): void;
    function setPrivileges(gameid: number, cbs?: Listener, cbe?: Listener): void;
}
declare module Server.URL {
    function fixURL(url: string): string;
}
declare module Server.Chat {
    var CHAT_URL: string;
    var currentController: ChatController;
    function addRoomListener(f: Function | Listener): void;
    function removeRoomListener(f: Function | Listener): void;
    function triggerRoomListener(): void;
    function isReconnecting(): boolean;
    function setConnected(): void;
    function giveUpReconnect(): void;
    function reconnect(): void;
    function leaveRoom(): void;
    function enterRoom(roomid: number): void;
    function sendStatus(info: PersonaInfo): void;
    function sendPersona(info: PersonaInfo): void;
    function isConnected(): boolean;
    function sendMessage(message: Message): void;
    function saveMemory(memory: string): void;
    function hasRoom(): boolean;
    function getRoom(): Room;
    function getAllMessages(roomid: number, cbs?: Listener, cbe?: Listener): void;
    function clearForever(roomid: number, cbs?: Listener, cbe?: Listener): void;
    function end(): void;
    function addStatusListener(f: Function | Listener): void;
    function triggerStatus(info: Object): void;
    function addPersonaListener(f: Function | Listener): void;
    function triggerPersona(f: Object): void;
    function addMessageListener(f: Function | Listener): void;
    function triggerMessage(f: Message): void;
}
declare module Server.Chat.Memory {
    var version: number;
    function addChangeListener(f: Function | Listener): void;
    function getConfig(id: string): TrackerMemory;
    function registerChangeListener(id: string, listener: Listener | Function): void;
    function getConfiguration(name: string): TrackerMemory;
    function registerConfiguration(id: string, name: string, config: TrackerMemory): void;
    function exportAsObject(): {
        [id: string]: any;
    };
    function updateFromObject(obj: {
        [id: string]: any;
    }): void;
    function saveMemory(): void;
    function considerSaving(): void;
}
declare module Server.Storage {
    function requestPersonas(blocking: boolean, cbs?: Listener, cbe?: Listener): void;
    function requestImages(cbs?: Listener, cbe?: Listener): void;
    function requestSounds(cbs?: Listener, cbe?: Listener): void;
    function sendPersonas(payload: any, cbs?: Listener, cbe?: Listener): void;
    function sendImages(cbs?: Listener, cbe?: Listener): void;
    function sendSounds(cbs?: Listener, cbe?: Listener): void;
}
declare module Server.Sheets {
    function loadSheetAndStyle(sheetid: number, styleid: number, cbs?: EventListenerObject, cbe?: EventListenerObject): void;
    function loadSheet(sheetid: number, cbs?: Listener, cbe?: Listener): void;
    function updateStyles(cbs?: Listener, cbe?: Listener): void;
    function sendStyle(style: StyleInstance, cbs?: Listener | EventListenerObject | Function, cbe?: Listener | EventListenerObject | Function): void;
    function loadStyle(id: number, cbs?: Listener, cbe?: Listener, right?: boolean): void;
    function updateLists(cbs?: Listener, cbe?: Listener): void;
    function sendFolder(sheet: SheetInstance, cbs?: Listener, cbe?: Listener): void;
    function deleteSheet(sheet: SheetInstance, cbs?: Listener, cbe?: Listener): void;
    function getSheetPermissions(sheet: SheetInstance, cbs?: Listener | EventListenerObject | Function, cbe?: Listener | EventListenerObject | Function): void;
    function sendSheetPermissions(sheet: SheetInstance, permissions: Array<SheetPermRow>, cbs?: Listener | EventListenerObject | Function, cbe?: Listener | EventListenerObject | Function): void;
    function getStyleOptions(game: Game, cbs: Function | EventListenerObject, cbe: Function | EventListenerObject): void;
    function createSheet(game: Game, sheetName: string, styleId: number, isPublic: boolean, cbs?: Listener | EventListenerObject | Function, cbe?: Listener | EventListenerObject | Function): void;
    function sendSheet(sheet: SheetInstance, cbs?: Listener | EventListenerObject | Function, cbe?: Listener | EventListenerObject | Function): void;
}
/**
 * Created by Reddo on 01/11/2015.
 */
declare class Lingo {
    ids: Array<string>;
    name: string;
    shortname: string;
    flagIcon: string;
    unknownLingo: string;
    langValues: {
        [id: string]: string;
    };
    myLingos: Array<string>;
    setLingo(id: string, value: string): void;
    getLingos(): {
        [id: string]: string;
    };
    merge(lingo: Lingo): void;
    getLingo(id: string, dataset?: {
        [id: string]: string;
    }): string;
}
declare class SheetLingo {
    private defaultLingo;
    private lingos;
    addLingo(lingo: Lingo, isDefault: boolean): void;
    getDefaultLingo(): Lingo;
    getLingo(ids: Array<string>): Lingo;
}
declare module LingoList {
    function getLingos(): Array<Lingo>;
    function getLingo(id: string): Lingo;
    function storeLingo(lingo: Lingo): void;
    function mergeLingo(lingo: Lingo): void;
    function addSheetLingo(lingo: SheetLingo): void;
}
declare var ptbr: Lingo;
declare module UI {
    /**
     * Window IDs for Page Calling
     */
    var idMainWindow: string;
    var idLoginWindow: string;
    var idAccountCreationWindow: string;
    var idChangelog: string;
    var idGames: string;
    var idChat: string;
    var idConfig: string;
    var idGameInvites: string;
    var idStyles: string;
    var idStyleDesigner: string;
    var idInviteDesigner: string;
    var idGameDesigner: string;
    var idRoomDesigner: string;
    var idSheetViewer: string;
    var idSheetDesigner: string;
    var idLeftIFrame: string;
    var idLeftVideo: string;
    var idHome: string;
    var idSheets: string;
    var idImages: string;
    var idSounds: string;
    var idSheetPerm: string;
    var idRightIFrame: string;
    var idRightVideo: string;
    function resetTitle(): void;
    function addTitle(str: string): void;
    function setZebra(on: boolean): void;
}
declare function RedPGAccidentPreventionSystem(e: Event): string;
declare module UI.WindowManager {
    var currentLeftSize: number;
    var currentRightSize: number;
    function callWindow(id: string): void;
    function getWindow(id: string): HTMLElement;
    function updateWindowSizes(): void;
}
declare module UI.Logger {
    function callSelf(room: Room): void;
    function filter(): Array<Message>;
    function updateSlider(): void;
    function updateMessages(): void;
    function updateCheckboxes(): void;
    function setModule(module: string, acceptable: boolean): void;
    function setSlider(left: any, right: any): void;
    function open(): void;
    function close(): void;
    function submit(): void;
    function setHTML(code: any): void;
    function setJS(code: any): void;
    function setLib(code: any): void;
    function giveMeLog(): {
        description: string;
        name: string;
        id: number;
        freejoin: boolean;
        creatorid: number;
        creatornick: string;
        creatorsufix: string;
    };
    function saveLog(): void;
    function openLog(log: any): void;
}
declare module UI.Config {
    function bindInput(configName: string, input: HTMLInputElement): void;
    function saveConfig(): void;
    function setUniqueTimeout(f: Function, t: number): void;
}
declare var change: any;
declare module UI.ChangelogManager {
    function print(): void;
}
declare module UI.PageManager {
    var $pages: {
        [id: string]: JQuery;
    };
    function getAnimationTime(): number;
    function callPage(id: string): void;
    function closeLeftPage(): void;
    function closeRightPage(): void;
    function readWindows(): void;
    function getCurrentLeft(): String;
}
declare module UI.Images {
    function callSelf(): void;
    function printImages(): void;
    function stayInFolder(name: string): void;
    function printError(data: any, onLoad: boolean): void;
    function callDropbox(): void;
    function addLink(): void;
    function addDropbox(files: any): void;
}
declare module UI.Loading {
    var $leftLoader: JQuery;
    function stopLoading(): void;
    function startLoading(): void;
    function blockLeft(): void;
    function blockRight(): void;
    function unblockLeft(): void;
    function unblockRight(): void;
}
declare module UI.Login {
    function callSelf(): void;
    function hideErrors(): void;
    function showError(code: any): void;
    function resetState(): void;
    function resetFocus(): void;
    function assumeEmail(email: string): void;
    function submitLogin(e: Event): void;
}
declare module UI.Login.NewAccount {
    function callSelf(): void;
    function hideErrors(): void;
    function showError(code: any): void;
    function submit(): void;
}
declare module UI.Handles {
    function isAlwaysUp(): boolean;
    function mouseIn(handle: HTMLElement): void;
    function mouseOut(handle: HTMLElement): void;
    function setAlwaysUp(keepUp: boolean): void;
}
/**
 * Created by Reddo on 24/09/2015.
 */
declare module UI.Language {
    function getLanguage(): Lingo;
    function searchLanguage(): void;
    function updateScreen(target?: HTMLElement | Document): void;
    function updateElement(element: HTMLElement): void;
    function updateText(element: HTMLElement): void;
    function addLanguageVariable(element: HTMLElement, id: string, value: string): void;
    function addLanguageValue(element: HTMLElement, value: string): void;
    function addLanguagePlaceholder(element: HTMLElement, value: string): void;
    function addLanguageTitle(element: HTMLElement, value: string): void;
    function markLanguage(...elements: HTMLElement[]): void;
}
declare module UI.IFrame {
    function openLeftIFrame(url: string): void;
    function openRightFrame(url: string): void;
    function openLeftVideo(url: string): void;
    function openRightVideo(url: string): void;
}
declare module UI.Sheets {
    function keepOpen(folder: string, gameid: number): void;
    function keepClosed(): void;
    function callSelf(): void;
    function printSheets(): void;
}
declare module UI.Sheets.SheetPermissionDesigner {
    function callSelf(sheet: SheetInstance): void;
    function empty(): void;
    function printPlayers(players: any): void;
    function submit(): void;
    function success(): void;
}
declare module UI.Sheets.SheetManager {
    var currentSheet: SheetInstance;
    var currentStyle: SheetStyle;
    function hasSheet(): boolean;
    function editAllowed(): boolean;
    function close(): void;
    function detachStyle(): void;
    function attachStyle(): void;
    function switchToSheet(sheet: SheetInstance, reloadStyle?: boolean, callPage?: boolean): void;
    function openSheetId(sheetid: number): void;
    function openSheet(sheet: SheetInstance, reloadSheet?: boolean, reloadStyle?: boolean, callPage?: boolean): void;
    function saveSheet(): void;
    function reload(reloadStyle?: boolean): void;
    function recycleSheet(): void;
    function isAutoUpdate(): boolean;
    function updateButtons(): void;
    function importFromJSON(ready?: boolean, json?: string): void;
    function exportAsJSON(): void;
}
declare module UI.Sheets.SheetDesigner {
    function callSelf(game: Game): void;
    function success(): void;
    function fillStyles(data: any): void;
    function submit(): void;
}
declare module UI.Rooms {
    function deleteRoom(room: Room): void;
}
declare module UI.Rooms.Designer {
    function fromRoom(room?: Room): void;
    function toRoom(): Room;
}
declare module UI.Games {
    function callSelf(ready?: boolean): void;
    function deleteGame(game: Game): void;
    function leaveGame(game: Game): void;
    function updateNick(isLogged: boolean): void;
}
declare module UI.Games.Invites {
    function callSelf(): void;
    function printInfo(data: any): void;
    function accept(id: any): void;
    function reject(id: any): void;
    function printError(): void;
}
declare module UI.Games.InviteDesigner {
    var $msgs: JQuery;
    function callSelf(game: Game): void;
    function emptyName(): void;
    function submit(): void;
    function showMessage(id: number): void;
}
declare module UI.Games.RoomDesigner {
    function callSelf(game: Game, room?: Room): void;
    function toRoom(): Room;
    function submit(): void;
    function showError(): void;
}
declare module UI.Games.Designer {
    function callSelf(game?: Game): void;
    function toGame(): Game;
    function submit(): void;
    function showError(): void;
}
declare module UI.SoundController {
    function updateSEVolume(newVolume: number): void;
    function updateBGMVolume(newVolume: number): void;
    function getBGM(): HTMLAudioElement;
    function playDice(): void;
    function playAlert(): void;
    function isAutoPlay(): boolean;
    function playBGM(url: string): void;
    function playSE(url: string): void;
}
declare module UI.SoundController.MusicPlayer {
    function showContainer(): void;
    function hideContainer(): void;
    function showButton(): void;
    function hideButton(): void;
    function updateSeeker(perc: number): void;
    function stopPlaying(): void;
}
declare module UI.Chat {
    var unseenMessages: number;
    var messageCounter: number;
    function isSendPersonas(): boolean;
    function doAutomation(): boolean;
    function callSelf(roomid: number, log?: boolean): void;
    function addRoomChangedListener(listener: Listener | Function): void;
    function getRoom(): Room;
    function inRoom(): boolean;
    function clearRoom(): void;
    function printElement(element: HTMLElement, doScroll?: boolean): void;
    function printMessage(message: Message, doScroll?: boolean): void;
    function printMessages(messages: Array<Message>, ignoreLowIds: boolean): void;
    function updateScrollPosition(instant?: boolean): void;
    function scrollToTop(): void;
    function setZebra(zebra: boolean): void;
    function setScrolledDown(state: boolean): void;
    function sendMessage(message: Message): void;
    function getGetAllButton(): HTMLElement;
    function leave(): void;
    function printGetAllButtonAtStart(): void;
    function printNotallAtStart(): void;
    function printGetAllButton(): void;
}
declare module UI.Chat.Avatar {
    function getMe(): ChatAvatar;
    function resetForConnect(): void;
    function moveScroll(direction: number): void;
    function updatePosition(): void;
    function updateFromObject(obj: Array<Object>, cleanup: boolean): void;
}
declare module UI.Chat.PersonaManager {
    function setRoom(room: Room): void;
    function clearPersona(name: String, avatar: String): void;
    function getRoom(): Room;
    function createAndUsePersona(name: string, avatar: String): void;
    function addListener(listener: Listener): void;
    function sendPersonas(): void;
    function setPersona(name: String, avatar: String, element: HTMLElement): void;
    function getPersonaName(): String;
    function getPersonaAvatar(): String;
    function unsetPersona(): void;
}
declare module UI.Chat.Forms {
    function addOlderText(): void;
    function moveOlderText(direction: number): void;
    function updateFormState(hasPersona: any): void;
    function handleInputKeyboard(e: KeyboardEvent): void;
    function handleInputKeypress(e: KeyboardEvent): void;
    function prependChatInput(what: string): void;
    function sendMessage(): void;
    function isTyping(): boolean;
    function isFocused(): boolean;
    function isAfk(): boolean;
    function setTyping(newTyping: boolean): void;
    function setFocused(newFocused: boolean): void;
    function setAfk(newAfk: boolean): void;
    function considerRedirecting(event: KeyboardEvent): void;
    function isDiceTower(): boolean;
    function rollDice(faces?: number): void;
    function setInput(str: string): void;
    function setLastWhisperFrom(user: UserRoomContext): void;
}
declare module UI.Chat.Notification {
    function showReconnecting(): void;
    function hideReconnecting(): void;
    function hideDisconnected(): void;
    function showDisconnected(): void;
}
declare module UI.Chat.Lingo {
    function hide(): void;
    function open(): void;
    function update(): void;
    function speakInTongues(language: string): void;
}
declare module UI.Chat.Combat {
    function hide(): void;
    function open(): void;
    function updateSelects(): void;
    function update(): void;
    function addSheet(): void;
    function announceTurn(): void;
    function newRound(): void;
    function nextTurn(): void;
    function endCombat(): void;
}
declare module UI.Chat.PersonaDesigner {
    function callSelf(): void;
    function close(): void;
    function setRoom(room: Room): void;
    function fillOut(done?: boolean): void;
    function emptyOut(): void;
    function createPersona(name?: string, avatar?: String, savePersona?: boolean): void;
    function removeChoice(choice: ChatAvatarChoice): void;
    function usePersona(name: string, avatar: String): void;
    function loadMemory(done: () => void): void;
    function printError(load?: boolean): void;
}
declare module UI.Chat.Filters {
    function toggle(): void;
    function close(): void;
    function updateButton(): void;
    function applyFilter(name: string): void;
    function updateEffects(): void;
}
declare module UI.Pica {
    function getPictureWindow(): HTMLElement;
    function loadImage(url: string): void;
    function callSelf(): void;
    function close(): void;
    function startLoading(): void;
    function stopLoading(): void;
}
declare class PicaCanvasPoint {
    private x;
    private y;
    private static minCurve;
    private static encoding;
    private static precision;
    private static maxEncodedChars;
    setCoordinates(offsetX: any, offsetY: any): void;
    setRelativeCoordinates(x: any, y: any): void;
    getX(): number;
    getY(): number;
    distanceTo(p2: PicaCanvasPoint): number;
    getRealDistanceTo(p2: PicaCanvasPoint): number;
    static isTriangle(p1: PicaCanvasPoint, p2: PicaCanvasPoint, p3: PicaCanvasPoint): boolean;
    static isEqual(p1: PicaCanvasPoint, p2: PicaCanvasPoint): boolean;
    exportAsString(): string;
    updateFromString(str: string): void;
    /**
     * Encodes number "num" as a 2-character string.
     * Encodes from 0 to PicaCanvasPoint.encoding.length^PicaCanvasPoint.maxEncodedChars, so about 0 to 6000.
     * @param num
     * @returns {string}
     */
    static encode(num: number): string;
    /**
     * Decodes a 2-character encoded string "str" to a number
     * @param str
     */
    static decode(str: String): number;
}
declare class PicaCanvasArt {
    private userId;
    private pen;
    private specialValues;
    points: Array<PicaCanvasPoint>;
    draw(): void;
    setUserId(id: number): void;
    getUserId(): number;
    setSpecial(index: string, value: any): void;
    getSpecial(index: string, defValue: any): any;
    exportAsObject(): (string | number | Object)[];
    /**
     * Can throw errors
     * @param str
     * @returns {boolean}
     */
    importFromString(str: string): void;
    importPointStrings(a: Array<string>): void;
    setPen(pen: PicaToolPen): void;
    setValues(values: Object): void;
    setPoints(points: Array<PicaCanvasPoint>): void;
    addPoint(point: PicaCanvasPoint): void;
    cleanUpPoints(): void;
    redraw(): void;
}
declare module UI.Pica.Board {
    var _IMAGE_SCALING_FIT_NO_STRETCH: number;
    var _IMAGE_SCALING_FIT_STRETCH: number;
    var _IMAGE_SCALING_USE_RATIO: number;
    function isFit(): boolean;
    function isStretch(): boolean;
    function getBoard(): HTMLDivElement;
    function getImageRatio(): number;
    function loadImage(url: string): void;
    function getUrl(): string;
    function resize(): void;
    function getAvailHeight(): number;
    function getAvailWidth(): number;
    function addResizeListener(f: Function | Listener): void;
    function addUrlListener(f: Function | Listener): void;
    function setImageScaling(num: number): void;
    function setRatio(ratio: number): void;
    function changeRatio(up: boolean): void;
    function updateMinRatio(): void;
    function getScaling(): number;
    function resetRatio(): void;
}
declare module UI.Pica.Toolbar {
    function updateVisibility(): void;
    function registerTool(tool: PicaTool): void;
}
declare class PicaTool {
    protected a: HTMLAnchorElement;
    protected selected: boolean;
    protected icon: string;
    constructor();
    protected setIcon(icon: string): void;
    setSelected(selected: boolean): void;
    protected updateIcon(): void;
    updateVisibility(): void;
    protected setLeftSide(): void;
    protected setRightSide(): void;
    protected setTitleLingo(str: string): void;
    onClick(): void;
    getHTML(): HTMLAnchorElement;
}
declare class PicaToolPen extends PicaTool {
    private static Pens;
    id: string;
    mouseDown(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseOut(): void;
    mouseWheel(up: boolean, point: PicaCanvasPoint): void;
    redraw(): void;
    drawFromArt(art: PicaCanvasArt): void;
    static registerPen(id: string, pen: PicaToolPen): void;
    static getPen(id: string): any;
    setSelected(selected: boolean): void;
    updateCanvasClasses(): void;
    onClick(): void;
}
declare module UI.Pica.ArtManager {
    function getLength(roomid: number, url: string): number;
    function getLengthByUser(roomid: number, url: string): {};
    function addArt(art: PicaCanvasArt): void;
    function getMyArtsAsString(roomid: number, url: string): any[];
    function getArt(roomid: number, url: string): Array<PicaCanvasArt>;
    function removeAllArts(roomid: number, url: string): void;
    function removeArtFromUser(userid: number, roomid: number, url: string): void;
    function includeManyArts(roomid: number, url: string, arts: Array<PicaCanvasArt>): void;
    function includeArt(roomid: number, url: string, art: PicaCanvasArt): void;
}
declare module UI.Pica.Board.Background {
    function load(url: any): void;
    function addLoadListener(f: Function | Listener): void;
    function addSizeListener(f: Function | Listener): void;
    function onLoad(): void;
    function getMinRatio(): number;
    function resize(): void;
    function exportSizes(): {
        height: number;
        width: number;
        left: string;
        top: string;
    };
}
declare module UI.Pica.Board.Canvas {
    function clearCanvas(): void;
    function redraw(): void;
    function getCanvas(): HTMLCanvasElement;
    function getCanvasContext(): CanvasRenderingContext2D;
    function getHeight(): number;
    function getWidth(): number;
    function setLocked(): void;
    function addLockListener(f: Listener | Function): void;
    function resize(): void;
    function mouseDown(point: PicaCanvasPoint): void;
    function mouseUp(point: PicaCanvasPoint): void;
    function mouseMove(point: PicaCanvasPoint): void;
    function mouseOut(): void;
    function mouseWheel(up: boolean, point: PicaCanvasPoint): void;
    function setPen(newPen: PicaToolPen): void;
    function addPenListener(f: Function | Listener): void;
    function getPenWidth(): number;
    function getPenColor(): string;
    function setPenWidth(newWidth: number): void;
    function setPenColor(newColor: string): void;
}
declare class PicaToolMove extends PicaToolPen {
    private lastPoint;
    constructor();
    mouseDown(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseOut(): void;
    mouseWheel(up: boolean, point: PicaCanvasPoint): void;
    updateCanvasClasses(): void;
}
declare class PicaToolPensil extends PicaToolPen {
    private art;
    private lastPoint;
    id: string;
    constructor();
    mouseDown(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseOut(): void;
    beginDrawing(art: PicaCanvasArt): void;
    drawTo(point: PicaCanvasPoint): void;
    stroke(): void;
    redraw(): void;
    drawFromArt(art: PicaCanvasArt): void;
    updateCanvasClasses(): void;
}
declare class PicaToolRINE extends PicaToolPen {
    private art;
    private lastPoint;
    id: string;
    constructor();
    mouseDown(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseOut(): void;
    draw(art: PicaCanvasArt): void;
    redraw(): void;
    drawFromArt(art: PicaCanvasArt): void;
    updateCanvasClasses(): void;
}
declare class PicaToolSircu extends PicaToolPen {
    private art;
    private lastPoint;
    id: string;
    constructor();
    mouseDown(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseOut(): void;
    draw(art: PicaCanvasArt): void;
    redraw(): void;
    drawFromArt(art: PicaCanvasArt): void;
    updateCanvasClasses(): void;
}
declare class PicaToolSqua extends PicaToolPen {
    private art;
    private lastPoint;
    id: string;
    constructor();
    mouseDown(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseOut(): void;
    draw(art: PicaCanvasArt): void;
    redraw(): void;
    drawFromArt(art: PicaCanvasArt): void;
    updateCanvasClasses(): void;
}
declare class PicaToolConu extends PicaToolPen {
    private art;
    private lastPoint;
    id: string;
    constructor();
    mouseDown(point: PicaCanvasPoint): void;
    mouseMove(point: PicaCanvasPoint): void;
    mouseUp(point: PicaCanvasPoint): void;
    mouseOut(): void;
    draw(art: PicaCanvasArt): void;
    redraw(): void;
    drawFromArt(art: PicaCanvasArt): void;
    updateCanvasClasses(): void;
}
declare class PicaToolColor extends PicaTool {
    constructor();
}
declare class PicaToolShare extends PicaTool {
    constructor();
    onClick(): void;
}
declare class PicaToolLock extends PicaTool {
    private lockedIcon;
    private unlockedIcon;
    constructor();
    updateVisibility(): void;
    onClick(): void;
}
declare class PicaToolClean extends PicaTool {
    constructor();
    onClick(): void;
}
declare class PicaToolScaling extends PicaTool {
    protected scaling: number;
    protected ratio: number;
    constructor();
    onClick(): void;
    updateEquality(): void;
}
declare class PicaToolScaling0 extends PicaToolScaling {
    protected scaling: number;
    constructor();
}
declare class PicaToolScaling1 extends PicaToolScaling {
    protected scaling: number;
    constructor();
}
declare class PicaToolScaling2 extends PicaToolScaling {
    protected scaling: number;
    protected ratio: number;
    constructor();
}
declare module UI.Sounds {
    function callSelf(): void;
    function printSounds(): void;
    function stayInFolder(name: string): void;
    function printError(data: any, onLoad: boolean): void;
    function callDropbox(): void;
    function addDropbox(files: any): void;
}
declare module UI.Styles {
    function callSelf(): void;
    function emptyTarget(): void;
    function printStyles(styles: Array<StyleInfo>): void;
}
declare module UI.Styles.StyleDesigner {
    function callSelf(id?: number): void;
    function copy(): void;
    function loadStyle(id: number): void;
    function fillWithStyle(style: StyleInstance, copy?: boolean): void;
    function submit(): void;
    function finish(): void;
}
declare module Dropbox {
    function choose(options: any): any;
}
