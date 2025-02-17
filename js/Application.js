var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function startDebugging() {
    console.debug = console.log;
}
function stopDebugging() {
    console.debug = function () {
    };
}
if (window.location.hash.substr(1).toUpperCase().indexOf("DEBUG") !== -1) {
    startDebugging();
}
else {
    stopDebugging();
}
var onReady = [];
function addOnReady(caller, reason, listener) {
    console.debug("[ONREADY] Registered for " + caller + " because: " + reason + ". Listener:", listener);
    onReady.push(listener);
}
function allReady() {
    for (var i = 0; i < onReady.length; i++) {
        onReady[i].handleEvent();
    }
}
var Trigger = /** @class */ (function () {
    function Trigger() {
        this.functions = [];
        this.objects = [];
    }
    Trigger.prototype.removeListener = function (f) {
        if (typeof f === "function") {
            var i = this.functions.indexOf(f);
            if (i !== -1) {
                this.functions.splice(i, 1);
            }
        }
        else {
            var i = this.objects.indexOf(f);
            if (i !== -1) {
                this.objects.splice(i, 1);
            }
        }
    };
    Trigger.prototype.addListener = function (f) {
        if (typeof f === "function") {
            this.functions.push(f);
        }
        else {
            this.objects.push(f);
        }
    };
    Trigger.prototype.addListenerIfMissing = function (f) {
        if (typeof f === "function") {
            if (this.functions.indexOf(f) === -1) {
                this.functions.push(f);
            }
        }
        else {
            if (this.objects.indexOf(f) === -1) {
                this.objects.push(f);
            }
        }
    };
    Trigger.prototype.trigger = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < this.functions.length; i++) {
            this.functions[i].apply(null, args);
        }
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].handleEvent.apply(this.objects[i], args);
        }
    };
    return Trigger;
}());
var Changelog = /** @class */ (function () {
    function Changelog(major, minor, release) {
        this.messages = {};
        this.release = release;
        this.minor = minor;
        this.major = major;
        Changelog.addToUpdates(this);
    }
    Changelog.addToUpdates = function (change) {
        if (Changelog.updatesExternal === null) {
            Changelog.updates.push(change);
        }
        else {
            Changelog.updatesExternal.push(change);
        }
    };
    Changelog.sort = function () {
        Changelog.updates.sort(function (a, b) {
            if (a.major !== b.major)
                return a.major - b.major;
            if (a.minor !== b.minor)
                return a.minor - b.minor;
            if (a.release !== b.release)
                return a.release - b.release;
            return 0;
        });
        if (Changelog.updatesExternal !== null) {
            Changelog.updatesExternal.sort(function (a, b) {
                if (a.major !== b.major)
                    return a.major - b.major;
                if (a.minor !== b.minor)
                    return a.minor - b.minor;
                if (a.release !== b.release)
                    return a.release - b.release;
                return 0;
            });
        }
    };
    Changelog.getMostRecentLocalUpdate = function () {
        return Changelog.updates[0];
    };
    Changelog.getMostRecentExternalUpdate = function () {
        if (Changelog.updatesExternal !== null) {
            return Changelog.updatesExternal[0];
        }
        return null;
    };
    Changelog.getUpdates = function () {
        return Changelog.updates;
    };
    Changelog.getMissingUpdates = function () {
        if (Changelog.updatesExternal === null)
            return [];
        var updates = [];
        for (var i = Changelog.updates.length; i < Changelog.updatesExternal.length; i++) {
            updates.push(Changelog.updatesExternal[i]);
        }
        return updates;
    };
    Changelog.finished = function () {
        if (Changelog.updatesExternal === null) {
            Changelog.sort();
            Changelog.updatesExternal = [];
        }
        else {
            Changelog.sort();
            UI.ChangelogManager.print();
        }
    };
    Changelog.getLocalVersion = function () {
        return Changelog.updates[Changelog.updates.length - 1].getVersion();
    };
    Changelog.getExternalVersion = function () {
        if (Changelog.updatesExternal === null || Changelog.updatesExternal.length === 0) {
            return null;
        }
        return Changelog.updatesExternal[Changelog.updatesExternal.length - 1].getVersion();
    };
    Changelog.prototype.getVersion = function () {
        return [this.major, this.minor, this.release];
    };
    Changelog.prototype.addMessage = function (msg, lingo) {
        if (this.messages[lingo] === undefined) {
            this.messages[lingo] = [msg];
        }
        else {
            this.messages[lingo].push(msg);
        }
    };
    Changelog.prototype.getMessages = function () {
        var lingo = UI.Language.getLanguage();
        for (var i = 0; i < lingo.ids.length; i++) {
            if (this.messages[lingo.ids[i]] !== undefined) {
                return this.messages[lingo.ids[i]];
            }
        }
        if (this.messages['en'] !== undefined)
            return this.messages['en'];
        for (var key in this.messages) {
            return this.messages[key];
        }
        return ["Changelog contains no messages."];
    };
    Changelog.prototype.getHTML = function (missing) {
        // %p.mainWindowParagraph.changelogMissing
        //     %span.changelogChangeVersion="0.9.0"
        //     %span.changelogChange="Adicionadas coisas legais que você não tem."
        var p = document.createElement("p");
        p.classList.add("mainWindowParagraph");
        if (missing) {
            p.classList.add("changelogMissing");
        }
        else {
            p.classList.add("changelogCurrent");
        }
        var versSpan = document.createElement("span");
        versSpan.classList.add("changelogChangeVersion");
        versSpan.appendChild(document.createTextNode(this.major + "." + this.minor + "." + this.release));
        p.appendChild(versSpan);
        var messages = this.getMessages();
        for (var i = 0; i < messages.length; i++) {
            var span = document.createElement("span");
            span.classList.add("changelogChange");
            span.appendChild(document.createTextNode(messages[i]));
            p.appendChild(span);
        }
        return p;
    };
    Changelog.updates = [];
    Changelog.updatesExternal = null;
    return Changelog;
}());
var ImageRed = /** @class */ (function () {
    function ImageRed() {
    }
    ImageRed.prototype.getLink = function () {
        var url = Server.IMAGE_URL + this.uploader + "_" + this.uuid;
        return url;
    };
    ImageRed.prototype.getName = function () {
        return this.name;
    };
    ImageRed.prototype.getId = function () {
        return this.uuid;
    };
    return ImageRed;
}());
var ImageLink = /** @class */ (function () {
    function ImageLink(name, url, folder) {
        this.tokenWidth = null;
        this.tokenHeight = null;
        this.name = name;
        this.url = url;
        this.folder = folder;
    }
    ImageLink.prototype.getFolder = function () {
        return this.folder;
    };
    ImageLink.prototype.setFolder = function (name) {
        UI.Images.stayInFolder(this.folder);
        this.folder = name;
        UI.Images.printImages();
        DB.ImageDB.considerSaving();
    };
    ImageLink.prototype.getLink = function () {
        return Server.URL.fixURL(this.url);
    };
    ImageLink.prototype.getName = function () {
        return this.name;
    };
    ImageLink.prototype.setName = function (name) {
        if (this.name !== name) {
            this.name = name;
            DB.ImageDB.triggerChange(this);
            DB.ImageDB.considerSaving();
        }
    };
    ImageLink.prototype.updateFromObject = function (obj) {
        if (obj['tokenWidth'] != undefined && obj['tokenHeight'] != undefined) {
            this.tokenWidth = obj['tokenWidth'];
            this.tokenHeight = obj['tokenHeight'];
        }
    };
    ImageLink.prototype.exportAsObject = function () {
        var obj = {
            name: this.name,
            url: this.url,
            folder: this.folder
        };
        if (this.tokenWidth != null && this.tokenHeight != null) {
            obj['tokenWidth'] = this.tokenWidth;
            obj['tokenHeight'] = this.tokenHeight;
        }
        return obj;
    };
    return ImageLink;
}());
/**
 * Created by Reddo on 14/09/2015.
 */
var User = /** @class */ (function () {
    function User() {
        this.nickname = "Undefined";
        this.nicknamesufix = "????";
        this.id = null;
        this.level = null;
        this.gameContexts = {};
        this.roomContexts = {};
        this.changedTrigger = new Trigger();
    }
    User.prototype.isMe = function () {
        return this.id === Application.getMyId();
    };
    User.prototype.isAdmin = function () {
        return this.level >= 9;
    };
    User.prototype.exportAsLog = function () {
        var obj = {
            id: this.id,
            nickname: this.nickname,
            nicknamesufix: this.nicknamesufix,
            level: this.level,
            gameid: 0,
            roomid: 0
        };
        return obj;
    };
    User.prototype.getGameContext = function (id) {
        if (this.gameContexts[id] === undefined) {
            return null;
        }
        return this.gameContexts[id];
    };
    User.prototype.releaseGameContext = function (id) {
        delete (this.gameContexts[id]);
    };
    User.prototype.getRoomContext = function (id) {
        if (this.roomContexts[id] === undefined) {
            return null;
        }
        return this.roomContexts[id];
    };
    User.prototype.releaseRoomContext = function (id) {
        delete (this.roomContexts[id]);
    };
    User.prototype.getFullNickname = function () {
        return this.nickname + "#" + this.nicknamesufix;
    };
    User.prototype.getShortNickname = function () {
        return this.nickname;
    };
    User.prototype.updateFromObject = function (user) {
        if (typeof user['id'] === "string") {
            user['id'] = parseInt(user['id']);
        }
        for (var key in this) {
            if (user[key] === undefined)
                continue;
            this[key] = user[key];
        }
        var context;
        if (user['roomid'] !== undefined) {
            context = this.getRoomContext(user['roomid']);
            if (context === null) {
                context = new UserRoomContext(this);
                this.roomContexts[user['roomid']] = context;
            }
            context.updateFromObject(user);
        }
        if (user['gameid'] !== undefined) {
            context = this.getGameContext(user['roomid']);
            if (context === null) {
                context = new UserGameContext(this);
                this.gameContexts[user['gameid']] = context;
            }
            context.updateFromObject(user);
        }
        this.changedTrigger.trigger(this);
    };
    return User;
}());
var UserGameContext = /** @class */ (function () {
    function UserGameContext(user) {
        this.gameid = 0;
        this.createRoom = false;
        this.createSheet = false;
        this.editSheet = false;
        this.viewSheet = false;
        this.deleteSheet = false;
        this.invite = false;
        this.promote = false;
        this.user = user;
    }
    UserGameContext.prototype.getUser = function () {
        return this.user;
    };
    UserGameContext.prototype.updateFromObject = function (obj) {
        for (var id in this) {
            if (obj[id] !== undefined) {
                this[id] = obj[id];
            }
        }
    };
    UserGameContext.prototype.isCreateRoom = function () {
        return this.createRoom;
    };
    UserGameContext.prototype.isCreateSheet = function () {
        return this.createSheet;
    };
    return UserGameContext;
}());
var UserRoomContext = /** @class */ (function () {
    function UserRoomContext(user) {
        this.logger = false;
        this.cleaner = false;
        this.storyteller = false;
        this.user = user;
    }
    UserRoomContext.prototype.getRoom = function () {
        if (DB.RoomDB.hasRoom(this.roomid))
            return DB.RoomDB.getRoom(this.roomid);
        return new Room();
    };
    UserRoomContext.prototype.getUser = function () {
        return this.user;
    };
    UserRoomContext.prototype.isStoryteller = function () {
        return this.storyteller;
    };
    UserRoomContext.prototype.isCleaner = function () {
        return this.cleaner;
    };
    UserRoomContext.prototype.updateFromObject = function (user) {
        for (var id in this) {
            if (user[id] === undefined)
                continue;
            this[id] = user[id];
        }
    };
    UserRoomContext.prototype.getUniqueNickname = function () {
        var users = this.getRoom().getOrderedUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === this.getUser().id)
                continue;
            if (users[i].getShortNickname().toLowerCase() === this.user.getShortNickname().toLowerCase()) {
                return this.user.getFullNickname();
            }
        }
        return this.user.getShortNickname();
    };
    return UserRoomContext;
}());
var Room = /** @class */ (function () {
    function Room() {
        this.gameid = null;
        this.id = null;
        this.description = null;
        this.name = null;
        this.playByPost = false;
        this.privateRoom = false;
        this.publicRoom = false;
        this.creatorid = null;
        this.users = {};
        this.messages = {};
    }
    Room.prototype.clearMessages = function () {
        this.messages = [];
    };
    Room.prototype.exportAsLog = function (messages) {
        var obj = {
            gameid: this.gameid,
            id: 0,
            description: this.description,
            name: this.name,
            creatorid: this.creatorid
        };
        var users = [];
        for (var id in this.users) {
            users.push(this.users[id].exportAsLog());
        }
        obj['users'] = users;
        var msgObj = [];
        for (var i = 0; i < messages.length; i++) {
            msgObj.push(messages[i].exportAsLog());
        }
        obj['messages'] = msgObj;
        return obj;
    };
    Room.prototype.getMessages = function () {
        var list = [];
        for (var id in this.messages) {
            list.push(this.messages[id]);
        }
        return list;
    };
    Room.prototype.getOrderedMessages = function () {
        var list = [];
        for (var id in this.messages) {
            list.push(this.messages[id]);
        }
        list.sort(function (a, b) {
            return a.id - b.id;
        });
        return list;
    };
    Room.prototype.getOrderedUsers = function () {
        var list = [];
        for (var id in this.users) {
            list.push(this.users[id]);
        }
        list.sort(function (a, b) {
            var na = a.getShortNickname().toLowerCase();
            var nb = b.getShortNickname().toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            na = a.getFullNickname().toLowerCase();
            nb = b.getFullNickname().toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            return 0;
        });
        return list;
    };
    Room.prototype.getOrderedUserContexts = function () {
        var list = [];
        for (var id in this.users) {
            list.push(this.users[id].getRoomContext(this.id));
        }
        list.sort(function (a, b) {
            var na = a.getUser().getShortNickname().toLowerCase();
            var nb = b.getUser().getShortNickname().toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            na = a.getUser().getFullNickname().toLowerCase();
            nb = b.getUser().getFullNickname().toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            return 0;
        });
        return list;
    };
    Room.prototype.getStorytellers = function () {
        var storytellers = [];
        for (var id in this.users) {
            var rc = this.users[id].getRoomContext(this.id);
            if (rc !== null && rc.isStoryteller()) {
                storytellers.push(rc);
            }
        }
        return storytellers;
    };
    Room.prototype.getMe = function () {
        return this.getUser(Application.getMyId());
    };
    Room.prototype.getUser = function (id) {
        if (this.users[id] === undefined) {
            return null;
        }
        return this.users[id].getRoomContext(this.id);
    };
    Room.prototype.getUsersByName = function (str) {
        var list = [];
        str = str.toLowerCase();
        for (var id in this.users) {
            if (this.users[id].getFullNickname().toLowerCase().indexOf(str) !== -1) {
                list.push(this.users[id].getRoomContext(this.id));
            }
        }
        return list;
    };
    Room.prototype.getGame = function () {
        return DB.GameDB.getGame(this.gameid);
    };
    Room.prototype.exportAsNewRoom = function () {
        var obj = {
            name: this.name,
            description: this.description,
            private: this.privateRoom,
            streamable: false,
            playbypost: this.playByPost,
            gameid: this.gameid
        };
        return obj;
    };
    Room.prototype.updateFromObject = function (room, cleanup) {
        for (var id in this) {
            if (room[id] === undefined || id === "users" || id === 'messages')
                continue;
            this[id] = room[id];
        }
        if (room["cleaner"] !== undefined) {
            this.users[Application.getMyId()] = DB.UserDB.getUser(Application.getMyId());
            var updateObj = {
                roomid: this.id,
                cleaner: room['cleaner'],
                logger: room['logger'],
                storyteller: room['storyteller']
            };
            this.users[Application.getMyId()].updateFromObject(updateObj);
        }
        if (room['users'] !== undefined) {
            var cleanedup = [];
            for (var i = 0; i < room['users'].length; i++) {
                room['users'][i]['roomid'] = this.id;
            }
            DB.UserDB.updateFromObject(room['users']);
            for (var i = 0; i < room['users'].length; i++) {
                this.users[room['users'][i]['id']] = DB.UserDB.getUser(room['users'][i]['id']);
                cleanedup.push(room['users'][i]['id']);
            }
            if (cleanup) {
                for (var id_1 in this.users) {
                    if (cleanedup.indexOf(this.users[id_1].id) === -1) {
                        this.users[id_1].releaseGameContext(this.id);
                        delete (this.users[id_1]);
                    }
                }
            }
        }
        if (room['messages'] !== undefined) {
            var cleanedup = [];
            for (var i = 0; i < room['messages'].length; i++) {
                room['messages'][i]['roomid'] = this.id;
                cleanedup.push(room['messages'][i].id);
            }
            DB.MessageDB.updateFromObject(room['messages']);
            for (var i = 0; i < cleanedup.length; i++) {
                if (this.messages[cleanedup[i]] === undefined) {
                    this.messages[cleanedup[i]] = DB.MessageDB.getMessage(cleanedup[i]);
                }
            }
            if (cleanup) {
                for (var id_2 in this.messages) {
                    if (cleanedup.indexOf(this.messages[id_2].id) === -1) {
                        if (this.messages[id_2].localid !== null) {
                            DB.MessageDB.releaseLocalMessage(this.messages[id_2].localid);
                        }
                        DB.MessageDB.releaseMessage(this.messages[id_2].id);
                    }
                }
            }
        }
    };
    return Room;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.users = {};
        this.rooms = {};
        this.sheets = {};
        this.description = null;
        this.name = null;
        this.id = null;
        this.freejoin = false;
        this.creatorid = null;
        this.creatornick = null;
        this.creatorsufix = null;
    }
    Game.prototype.exportAsLog = function (roomid, messages) {
        var obj = {
            description: this.description,
            name: this.name,
            id: 0,
            freejoin: this.freejoin,
            creatorid: this.creatorid,
            creatornick: this.creatornick,
            creatorsufix: this.creatorsufix
        };
        obj['rooms'] = [DB.RoomDB.getRoom(roomid).exportAsLog(messages)];
        return obj;
    };
    Game.prototype.getId = function () {
        return this.id;
    };
    Game.prototype.getName = function () {
        return this.name;
    };
    Game.prototype.getCreatorFullNickname = function () {
        return this.creatornick + "#" + this.creatorsufix;
    };
    Game.prototype.isMyCreation = function () {
        return Application.isMe(this.creatorid);
    };
    Game.prototype.getMe = function () {
        return this.getUser(Application.getMyId());
    };
    Game.prototype.getUser = function (id) {
        if (this.users[id] === undefined) {
            return null;
        }
        return this.users[id].getGameContext(this.id);
    };
    Game.prototype.getRoom = function (id) {
        if (this.rooms[id] === undefined) {
            return null;
        }
        return this.rooms[id];
    };
    Game.prototype.getSheet = function (id) {
        if (this.sheets[id] === undefined) {
            return null;
        }
        return this.sheets[id];
    };
    Game.prototype.getOrderedRoomList = function () {
        var list = [];
        for (var id in this.rooms) {
            list.push(this.rooms[id]);
        }
        list.sort(function (a, b) {
            var na = a.name.toLowerCase();
            var nb = b.name.toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            return 0;
        });
        return list;
    };
    Game.prototype.getOrderedSheetList = function () {
        var list = [];
        for (var id in this.sheets) {
            list.push(this.sheets[id]);
        }
        list.sort(function (a, b) {
            var fa = a.folder.toLowerCase();
            var fb = b.folder.toLowerCase();
            if (fa < fb)
                return -1;
            if (fb < fa)
                return 1;
            var na = a.getName().toLowerCase();
            var nb = b.getName().toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            return 0;
        });
        return list;
    };
    Game.prototype.exportAsObject = function () {
        //public description : string = null;
        //public name : string = null;
        //public id : number = null;
        //public freejoin : boolean = null;
        var obj = {
            desc: this.description,
            name: this.name,
            freejoin: this.freejoin
        };
        if (this.id !== null) {
            obj['id'] = this.id;
        }
        return obj;
    };
    Game.prototype.updateFromObject = function (game, cleanup) {
        for (var id in this) {
            if (game[id] === undefined || id === "users" || id === "rooms" || id === "sheets")
                continue;
            this[id] = game[id];
        }
        if (game['users'] !== undefined) {
            var cleanedup = [];
            for (var i = game['users'].length - 1; i >= 0; i--) {
                game['users'][i]['gameid'] = this.id;
            }
            DB.UserDB.updateFromObject(game['users']);
            for (var i = 0; i < game['users'].length; i++) {
                this.users[game['users'][i]['id']] = DB.UserDB.getUser(game['users'][i]['id']);
                cleanedup.push(game['users'][i]['id']);
            }
            if (cleanup) {
                for (var id_3 in this.users) {
                    if (cleanedup.indexOf(this.users[id_3].id) === -1) {
                        this.users[id_3].releaseGameContext(this.id);
                        delete (this.users[id_3]);
                    }
                }
            }
        }
        // This game has the permissions for ME
        if (game["createRoom"] !== undefined) {
            this.users[Application.getMyId()] = DB.UserDB.getUser(Application.getMyId());
            var updateObj = {
                gameid: this.id,
                createRoom: game["createRoom"],
                createSheet: game["createSheet"],
                deleteSheet: game["deleteSheet"],
                editSheet: game["editSheet"],
                invite: game["invite"],
                promote: game["promote"],
                viewSheet: game["viewSheet"]
            };
            this.users[Application.getMyId()].updateFromObject(updateObj);
        }
        if (game['rooms'] !== undefined) {
            var cleanedup = [];
            for (var i = 0; i < game['rooms'].length; i++) {
                game['rooms'][i]['gameid'] = this.id;
            }
            DB.RoomDB.updateFromObject(game['rooms'], false);
            for (var i = 0; i < game['rooms'].length; i++) {
                this.rooms[game['rooms'][i]['id']] = DB.RoomDB.getRoom(game['rooms'][i]['id']);
                cleanedup.push((game['rooms'][i]['id']));
            }
            if (cleanup) {
                for (var id_4 in this.rooms) {
                    if (cleanedup.indexOf(this.rooms[id_4].id) === -1) {
                        DB.RoomDB.releaseRoom(this.rooms[id_4].id);
                        delete (this.rooms[id_4]);
                    }
                }
            }
        }
        if (game['sheets'] !== undefined) {
            var cleanedup = [];
            for (var i = game['sheets'].length - 1; i >= 0; --i) {
                game['sheets'][i]['gameid'] = this.id;
                if (game['sheets'][i]['styleName'] !== undefined && game['sheets'][i]['styleName'].indexOf("RedPG1") !== -1) {
                    game['sheets'].splice(i, 1);
                }
            }
            DB.SheetDB.updateFromObject(game['sheets']);
            for (var i = game['sheets'].length - 1; i >= 0; --i) {
                this.sheets[game['sheets'][i]['id']] = DB.SheetDB.getSheet(game['sheets'][i]['id']);
                cleanedup.push(game['sheets'][i]['id']);
            }
            if (cleanup) {
                for (var id_5 in this.sheets) {
                    if (cleanedup.indexOf(this.sheets[id_5].id) === -1) {
                        DB.SheetDB.releaseSheet(this.sheets[id_5].id);
                        delete (this.sheets[id_5]);
                    }
                }
            }
        }
    };
    return Game;
}());
var SheetInstance = /** @class */ (function () {
    function SheetInstance() {
        this.tab = null;
        this.id = 0;
        this.gameid = 0;
        this.folder = "";
        this.name = "";
        this.values = {};
        this.lastValues = "{}";
        this.creator = null;
        this.creatorNickname = "???#???";
        this.styleId = 0;
        this.styleName = "?";
        this.styleCreator = 0;
        this.styleCreatorNickname = "???#???";
        this.styleSafe = false;
        this.view = true;
        this.edit = false;
        this.delete = false;
        this.promote = false;
        this.isPublic = false;
        this.changed = false;
        this.loaded = false;
        this.changeTrigger = new Trigger();
    }
    SheetInstance.prototype.getStyleId = function () {
        return this.styleId;
    };
    SheetInstance.prototype.getStyle = function () {
        return DB.StyleDB.getStyle(this.styleId);
    };
    SheetInstance.prototype.getTab = function () {
        if (this.tab === null) {
            this.tab = new SheetTab(this);
        }
        return this.tab;
    };
    SheetInstance.prototype.getGameid = function () {
        return this.gameid;
    };
    SheetInstance.prototype.getGame = function () {
        return DB.GameDB.getGame(this.gameid);
    };
    SheetInstance.prototype.getFolder = function () {
        return this.folder;
    };
    SheetInstance.prototype.getId = function () {
        return this.id;
    };
    SheetInstance.prototype.removeChangeListener = function (list) {
        this.changeTrigger.removeListener(list);
    };
    SheetInstance.prototype.addChangeListener = function (list) {
        this.changeTrigger.addListenerIfMissing(list);
    };
    SheetInstance.prototype.triggerChanged = function () {
        this.changeTrigger.trigger(this);
        DB.SheetDB.triggerChanged(this);
    };
    SheetInstance.prototype.getMemoryId = function () {
        return "sheetBackup_" + this.id;
    };
    SheetInstance.prototype.setSaved = function () {
        this.changed = false;
        Application.LocalMemory.unsetMemory(this.getMemoryId());
        this.triggerChanged();
    };
    SheetInstance.prototype.setName = function (name) {
        if (name !== this.name) {
            this.changed = true;
            this.name = name;
            this.triggerChanged();
        }
    };
    SheetInstance.prototype.getName = function () {
        return this.name;
    };
    SheetInstance.prototype.getValues = function () {
        return this.values;
    };
    SheetInstance.prototype.setValues = function (values, local) {
        // Local values = user changed them NOW.
        // Not local = saved on server.
        var newJson = JSON.stringify(values);
        if (newJson !== this.lastValues) {
            this.values = values;
            this.lastValues = newJson;
            this.changed = true;
        }
        if (this.changed) {
            if (local) {
                // Store in localStorage
                Application.LocalMemory.setMemory(this.getMemoryId(), newJson);
            }
            else {
                // Since these are the server values, even though the current instance changed, it's not changed in the way users see it.
                this.changed = false;
            }
            this.triggerChanged();
        }
    };
    SheetInstance.prototype.updateFromObject = function (obj) {
        if (typeof obj['id'] !== 'undefined')
            this.id = obj['id'];
        if (typeof obj['gameid'] !== 'undefined')
            this.gameid = obj['gameid'];
        if (typeof obj['nome'] !== 'undefined')
            this.name = obj['nome'];
        if (typeof obj['criadorNick'] !== 'undefined' && typeof obj['criadorNickSufix'] !== 'undefined')
            this.creatorNickname = obj['criadorNick'] + "#" + obj['criadorNickSufix'];
        if (typeof obj['criador'] !== 'undefined')
            this.creator = obj['criador'];
        if (typeof obj['folder'] !== 'undefined')
            this.folder = obj['folder'];
        if (typeof obj['publica'] !== 'undefined')
            this.isPublic = obj['publica'];
        if (typeof obj['visualizar'] !== 'undefined')
            this.view = obj['visualizar'];
        if (typeof obj['deletar'] !== 'undefined')
            this.delete = obj['deletar'];
        if (typeof obj['editar'] !== 'undefined')
            this.edit = obj['editar'];
        if (typeof obj['promote'] !== 'undefined')
            this.promote = obj['promote'];
        if (typeof obj['nickStyleCreator'] !== 'undefined' && typeof obj['nicksufixStyleCreator'] !== 'undefined')
            this.styleCreatorNickname = obj['nickStyleCreator'] + "#" + obj['nicksufixStyleCreator'];
        if (typeof obj['idStyleCreator'] !== 'undefined')
            this.styleCreator = obj['idStyleCreator'];
        if (typeof obj['idstyle'] !== 'undefined')
            this.styleId = obj['idstyle'];
        if (typeof obj['styleName'] !== 'undefined')
            this.styleName = obj['styleName'];
        if (typeof obj['segura'] !== 'undefined')
            this.styleSafe = obj['segura'];
        if (typeof obj['values'] !== 'undefined') {
            this.loaded = true;
            this.setValues(obj['values'], false);
        }
    };
    SheetInstance.prototype.getValue = function (id) {
        if (typeof this.values === 'object') {
            return this.values[id];
        }
    };
    SheetInstance.prototype.isEditable = function () {
        return this.edit && UI.Sheets.SheetManager.editAllowed();
    };
    SheetInstance.prototype.isEditableForRealsies = function () {
        return this.edit;
    };
    SheetInstance.prototype.isPromotable = function () {
        return this.promote;
    };
    SheetInstance.prototype.isDeletable = function () {
        return this.delete;
    };
    SheetInstance.prototype.isNPC = function () {
        var player = this.getValue("Player") !== undefined ? this.getValue("Player") :
            this.getValue("Jogador") !== undefined ? this.getValue("Jogador") :
                this.getValue("Owner") !== undefined ? this.getValue("Owner") :
                    this.getValue("Dono") !== undefined ? this.getValue("Dono") :
                        undefined;
        if (player !== undefined && player.toUpperCase() === "NPC") {
            return true;
        }
        return false;
    };
    SheetInstance.prototype.considerEditable = function () {
        this.triggerChanged();
    };
    return SheetInstance;
}());
var StyleInstance = /** @class */ (function () {
    function StyleInstance() {
        this.id = 0;
        this.gameid = 0;
        this.name = "";
        this.mainCode = null;
        this.publicCode = null;
        this.html = null;
        this.css = null;
        this.publicStyle = false;
    }
    StyleInstance.prototype.getId = function () {
        return this.id;
    };
    StyleInstance.prototype.getName = function () {
        return this.name;
    };
    StyleInstance.prototype.isLoaded = function () {
        return this.html !== null;
    };
    StyleInstance.prototype.updateFromObject = function (obj) {
        for (var id in this) {
            if (obj[id] !== undefined) {
                this[id] = obj[id];
            }
        }
    };
    return StyleInstance;
}());
var SoundLink = /** @class */ (function () {
    function SoundLink(name, url, folder, bgm) {
        this.name = name;
        this.url = url;
        this.folder = folder;
        this.bgm = bgm;
    }
    SoundLink.prototype.getFolder = function () {
        return this.folder;
    };
    SoundLink.prototype.isBgm = function () {
        return this.bgm;
    };
    SoundLink.prototype.setFolder = function (name) {
        //UI.Images.stayInFolder(this.folder);
        this.folder = name;
        //UI.Images.printImages();
        DB.SoundDB.considerSaving();
    };
    SoundLink.prototype.getLink = function () {
        return Server.URL.fixURL(this.url);
    };
    SoundLink.prototype.getName = function () {
        return this.name;
    };
    SoundLink.prototype.setName = function (name) {
        if (this.name !== name) {
            this.name = name;
            DB.SoundDB.triggerChange(this);
            DB.SoundDB.considerSaving();
        }
    };
    SoundLink.prototype.exportAsObject = function () {
        return {
            name: this.name,
            url: this.url,
            folder: this.folder,
            bgm: this.bgm
        };
    };
    return SoundLink;
}());
var PseudoWord = /** @class */ (function () {
    function PseudoWord(word) {
        this.translatedWord = null;
        this.originalWord = word;
    }
    PseudoWord.prototype.addTranslation = function (word) {
        this.translatedWord = word;
    };
    PseudoWord.prototype.getOriginal = function () {
        return this.originalWord;
    };
    PseudoWord.prototype.getTranslation = function () {
        return this.translatedWord === null ? this.originalWord : this.translatedWord;
    };
    return PseudoWord;
}());
var PseudoLanguage = /** @class */ (function () {
    function PseudoLanguage(id) {
        this.singleLetters = [];
        this.shortWords = [];
        this.syllabi = [];
        this.numbers = [];
        this.staticWords = {};
        this.words = [];
        this.randomizeNumbers = false;
        this.lowerCaseOnly = false;
        this.allowPoints = true;
        this.maxLengthDifference = 1;
        this.lastSyllable = "";
        this.usedSyllable = [];
        PseudoLanguage.languages[id] = this;
    }
    PseudoLanguage.getLanguageNames = function () {
        var names = [];
        for (var id in PseudoLanguage.languages) {
            names.push(id);
        }
        names.sort();
        return names;
    };
    PseudoLanguage.getLanguage = function (id) {
        if (PseudoLanguage.languages[id] !== undefined) {
            return PseudoLanguage.languages[id];
        }
        return null;
    };
    PseudoLanguage.prototype.addStaticWord = function (words, translation) {
        for (var i = 0; i < words.length; i++) {
            this.staticWords[words[i]] = translation;
        }
        return this;
    };
    PseudoLanguage.prototype.addLetters = function (as) {
        this.singleLetters = as;
        return this;
    };
    PseudoLanguage.prototype.addShortWords = function (as) {
        this.shortWords = as;
        return this;
    };
    PseudoLanguage.prototype.addNumbers = function (as) {
        this.numbers = as;
        return this;
    };
    PseudoLanguage.prototype.setRandomizeNumbers = function (rn) {
        this.randomizeNumbers = rn;
        return this;
    };
    PseudoLanguage.prototype.setLowerCase = function (lc) {
        this.lowerCaseOnly = lc;
        return this;
    };
    PseudoLanguage.prototype.setAllowPoints = function (ap) {
        this.allowPoints = ap;
        return this;
    };
    PseudoLanguage.prototype.addSyllabi = function (syllabi) {
        this.syllabi = syllabi;
        return this;
    };
    PseudoLanguage.prototype.getLastWord = function () {
        return this.words[this.index - 1];
    };
    PseudoLanguage.prototype.getCurrentWord = function () {
        return this.words[this.index];
    };
    PseudoLanguage.prototype.getNextWord = function () {
        return this.words[this.index + 1];
    };
    PseudoLanguage.prototype.getSyllableCustom = function () {
        return null;
    };
    PseudoLanguage.prototype.getSyllable = function () {
        var syllable = this.getSyllableCustom();
        if (syllable !== null) {
            this.lastSyllable = syllable;
            this.usedSyllable.push(syllable);
            return syllable;
        }
        syllable = this.syllabi[Math.floor(this.rng() * this.syllabi.length)];
        while (((this.lastSyllable === syllable && this.syllabi.length > 1 && (this.rng() * 100) > 10))
            ||
                ((this.usedSyllable.indexOf(syllable) !== -1 && (this.rng() * 100) > 50))) {
            syllable = this.syllabi[Math.floor(this.rng() * this.syllabi.length)];
        }
        this.lastSyllable = syllable;
        if (this.usedSyllable.indexOf(syllable) === -1) {
            this.usedSyllable.push(syllable);
        }
        return syllable;
    };
    PseudoLanguage.prototype.chance = function (chance) {
        return (this.rng() * 100) > (100 - chance);
    };
    PseudoLanguage.prototype.increaseCurrentTranslation = function () {
        this.currentTranslation += this.getSyllable();
    };
    PseudoLanguage.prototype.isAcceptable = function () {
        if (this.currentTranslation.length === this.currentWord.length && (this.rng() * 100) > 10) {
            return true;
        }
        if (Math.abs(this.currentTranslation.length - this.currentWord.length) > this.maxLengthDifference) {
            return false;
        }
        if (this.currentTranslation.length < this.currentWord.length && (this.rng() * 100) > 10) {
            return false;
        }
        return true;
    };
    PseudoLanguage.prototype.getSingleLetter = function () {
        return this.singleLetters[Math.floor(this.rng() * this.singleLetters.length)];
    };
    PseudoLanguage.prototype.getShortWord = function () {
        return this.shortWords[Math.floor(this.rng() * this.shortWords.length)];
    };
    PseudoLanguage.prototype.translateWord = function (pseudo) {
        this.currentTranslation = "";
        var word = pseudo.getOriginal();
        if (word === "") {
            pseudo.addTranslation(this.currentTranslation);
            return;
        }
        var exclamation = word.indexOf('!') !== -1;
        var interrobang = word.indexOf('?') !== -1;
        var finish = word.indexOf('.') !== -1;
        var trespontos = word.indexOf('...') !== -1;
        var doispontos = word.indexOf(':') !== -1;
        var virgula = word.indexOf(',') !== -1;
        word = word.replace(/\!/g, '');
        word = word.replace(/\?/g, '');
        word = word.replace(/\./g, '');
        word = word.replace(/\:/g, '');
        word = word.replace(/\,/g, '');
        this.currentWord = word;
        this.lastSyllable = "";
        this.usedSyllable = [];
        if (!isNaN(parseInt(this.currentWord)) && this.numbers.length > 0) {
            for (var i = 0; i < this.currentWord.length; i++) {
                if (!this.randomizeNumbers) {
                    this.currentTranslation += this.numbers[parseInt(this.currentWord.charAt(i))];
                }
                else {
                    this.currentTranslation += this.numbers[Math.floor(this.rng() * this.numbers.length)];
                }
            }
        }
        else {
            var lowerWord = this.currentWord.latinise().toLowerCase();
            this.rng = new Math['seedrandom'](lowerWord);
            if (this.staticWords[lowerWord] !== undefined) {
                this.currentTranslation = this.staticWords[lowerWord];
            }
            else if (this.currentWord.length === 1 && this.singleLetters.length > 0) {
                this.currentTranslation = this.getSingleLetter();
            }
            else if (this.currentWord.length <= 3 && this.shortWords.length > 0) {
                this.currentTranslation = this.getShortWord();
            }
            else {
                while (!this.isAcceptable()) {
                    if (this.currentTranslation.length > this.currentWord.length) {
                        this.currentTranslation = "";
                    }
                    this.increaseCurrentTranslation();
                }
            }
        }
        if (this.allowPoints) {
            this.currentTranslation +=
                (virgula ? ',' : '') +
                    (doispontos ? ':' : '') +
                    (exclamation ? '!' : '') +
                    (interrobang ? '?' : '') +
                    (finish ? '.' : '') +
                    (trespontos ? '..' : '');
        }
        if (!this.lowerCaseOnly) {
            var corrected = "";
            for (var i = 0; i < this.currentTranslation.length; i++) {
                var character;
                if (i > this.currentWord.length - 1) {
                    character = this.currentWord[this.currentWord.length - 1];
                }
                else {
                    character = this.currentWord[i];
                }
                if (character !== character.toLowerCase()) {
                    corrected += this.currentTranslation[i].toUpperCase();
                }
                else {
                    corrected += this.currentTranslation[i];
                }
            }
            this.currentTranslation = corrected;
        }
        pseudo.addTranslation(this.currentTranslation);
    };
    PseudoLanguage.prototype.translate = function (phrase) {
        var words = phrase.split(" ");
        this.words = [];
        for (var i = 0; i < words.length; i++) {
            this.words.push(new PseudoWord(words[i]));
        }
        for (var i = 0; i < this.words.length; i++) {
            this.index = i;
            this.translateWord(this.words[i]);
        }
        var translatedWords = [];
        for (var i = 0; i < this.words.length; i++) {
            translatedWords.push(this.words[i].getTranslation());
        }
        return translatedWords.join(" ");
    };
    PseudoLanguage.languages = {};
    return PseudoLanguage;
}());
/**
 * Created by Reddo on 14/09/2015.
 */
var AJAXConfig = /** @class */ (function () {
    function AJAXConfig(url) {
        this._target = 0;
        this._url = "";
        this._timeout = 15000;
        this._responseType = "json";
        this._data = null;
        this.loadingTimeout = null;
        this.instantLoading = false;
        this._url = url;
    }
    AJAXConfig.prototype.forceLoading = function () {
        this.instantLoading = true;
    };
    AJAXConfig.prototype.startConditionalLoading = function () {
        if (this.target != AJAXConfig.TARGET_NONE) {
            if (this.target === AJAXConfig.TARGET_GLOBAL) {
                UI.Loading.startLoading();
            }
            else if (this.target === AJAXConfig.TARGET_LEFT) {
                UI.Loading.blockLeft();
            }
            else if (this.target === AJAXConfig.TARGET_RIGHT) {
                UI.Loading.blockRight();
            }
            // Fun, but has issues.
            //var func = function () {
            //    this.loadingTimeout = null;
            //    if (this.target === AJAXConfig.TARGET_GLOBAL) {
            //        UI.Loading.startLoading();
            //    } else if (this.target === AJAXConfig.TARGET_LEFT) {
            //        UI.Loading.blockLeft();
            //    } else if (this.target === AJAXConfig.TARGET_RIGHT) {
            //        UI.Loading.blockRight();
            //    }
            //}
            //
            //func = func.bind(this);
            //
            //if (this.instantLoading || Application.Config.getConfig("animTime").getValue() < 50) {
            //    func();
            //} else {
            //    this.loadingTimeout = window.setTimeout(func, Application.Config.getConfig("animTime").getValue());
            //}
        }
    };
    AJAXConfig.prototype.finishConditionalLoading = function () {
        if (this.loadingTimeout !== null) {
            window.clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        else if (this.target != AJAXConfig.TARGET_NONE) {
            if (this.target === AJAXConfig.TARGET_GLOBAL) {
                UI.Loading.stopLoading();
            }
            else if (this.target === AJAXConfig.TARGET_LEFT) {
                UI.Loading.unblockLeft();
            }
            else if (this.target === AJAXConfig.TARGET_RIGHT) {
                UI.Loading.unblockRight();
            }
        }
    };
    Object.defineProperty(AJAXConfig.prototype, "target", {
        get: function () {
            return this._target;
        },
        set: function (value) {
            this._target = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AJAXConfig.prototype, "url", {
        get: function () {
            return this._url;
        },
        set: function (value) {
            this._url = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AJAXConfig.prototype, "timeout", {
        get: function () {
            return this._timeout;
        },
        set: function (value) {
            this._timeout = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AJAXConfig.prototype, "responseType", {
        get: function () {
            return this._responseType;
        },
        set: function (value) {
            this._responseType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AJAXConfig.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this._data = value;
        },
        enumerable: false,
        configurable: true
    });
    AJAXConfig.prototype.setData = function (id, value) {
        if (this.data === null) {
            this.data = {};
        }
        this.data[id] = value;
    };
    AJAXConfig.prototype.setResponseTypeJSON = function () {
        this._responseType = "json";
    };
    AJAXConfig.prototype.setResponseTypeText = function () {
        this._responseType = "text";
    };
    AJAXConfig.prototype.setTargetNone = function () {
        this._target = AJAXConfig.TARGET_NONE;
    };
    AJAXConfig.prototype.setTargetGlobal = function () {
        this._target = AJAXConfig.TARGET_GLOBAL;
    };
    AJAXConfig.prototype.setTargetLeftWindow = function () {
        this._target = AJAXConfig.TARGET_LEFT;
    };
    AJAXConfig.prototype.setTargetRightWindow = function () {
        this._target = AJAXConfig.TARGET_RIGHT;
    };
    AJAXConfig.TARGET_NONE = 0;
    AJAXConfig.TARGET_GLOBAL = 1;
    AJAXConfig.TARGET_LEFT = 2;
    AJAXConfig.TARGET_RIGHT = 3;
    AJAXConfig.CONDITIONAL_LOADING_TIMEOUT = 150;
    return AJAXConfig;
}());
var WebsocketController = /** @class */ (function () {
    function WebsocketController(url) {
        this.socket = null;
        this.keepAlive = true;
        this.keepAliveTime = 15 * 1000;
        this.keepAliveInterval = null;
        this.onOpen = [];
        this.onClose = [];
        this.onMessage = [];
        this.onError = [];
        this.url = url;
    }
    WebsocketController.prototype.connect = function () {
        if (this.isReady()) {
            console.warn("[WEBSOCKET] Attempt to connect a WebSocket that was already connected. Disconnecting first.");
            this.close();
        }
        var url = Server.getWebsocketURL() + this.url;
        if (Application.Login.hasSession()) {
            url += ';jsessionid=' + Application.Login.getSession();
        }
        this.socket = new WebSocket(url);
        this.socket.addEventListener("open", {
            controller: this,
            handleEvent: function (e) {
                this.controller.resetInterval();
                this.controller.triggerOpen();
                console.debug("[WEBSOCKET] " + this.controller.url + ": Open.", e);
            }
        });
        this.socket.addEventListener("error", {
            controller: this,
            handleEvent: function (e) {
                console.error("[WEBSOCKET] " + this.controller.url + ": Error.", e);
            }
        });
        this.socket.addEventListener("message", {
            controller: this,
            handleEvent: function (e) {
                this.controller.resetInterval();
                if (e.data !== "1" && e.data.indexOf("[\"status") !== 0)
                    console.debug("[WEBSOCKET] " + this.controller.url + ": Message: ", e);
                this.controller.triggerMessage(e);
            }
        });
        this.socket.addEventListener("close", {
            controller: this,
            handleEvent: function (e) {
                this.controller.disableInterval();
                this.controller.triggerClose();
                console.warn("[WEBSOCKET] " + this.controller.url + ": Closed.", e);
            }
        });
    };
    WebsocketController.prototype.isReady = function () {
        return this.socket !== null && this.socket.readyState === WebsocketController.READYSTATE_OPEN;
    };
    WebsocketController.prototype.resetInterval = function () {
        if (this.keepAlive) {
            if (this.keepAliveInterval !== null) {
                clearInterval(this.keepAliveInterval);
            }
            var interval = function (controller) {
                controller.doKeepAlive();
            };
            this.keepAliveInterval = setInterval(interval.bind(null, this), this.keepAliveTime);
        }
    };
    WebsocketController.prototype.disableInterval = function () {
        if (this.keepAliveInterval !== null) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }
    };
    WebsocketController.prototype.doKeepAlive = function () {
        this.socket.send("0");
    };
    WebsocketController.prototype.send = function (action, obj) {
        if (this.isReady()) {
            if (typeof obj !== "string") {
                obj = JSON.stringify(obj);
            }
            this.socket.send(action + ";" + obj);
            if (action !== "status")
                console.debug("[WEBSOCKET] Message sent:", action + ";" + obj);
        }
        else {
            console.warn("[WEBSOCKET] Attempt to send messages through a WebSocket that isn't ready. Ignoring. Offending message: ", action, obj);
        }
    };
    WebsocketController.prototype.close = function () {
        if (this.socket !== null && (this.socket.readyState === WebsocketController.READYSTATE_CONNECTING || this.socket.readyState === WebsocketController.READYSTATE_OPEN)) {
            this.socket.close();
        }
    };
    WebsocketController.prototype.addCloseListener = function (obj) {
        this.onClose.push(obj);
    };
    WebsocketController.prototype.addOpenListener = function (obj) {
        this.onOpen.push(obj);
    };
    WebsocketController.prototype.addMessageListener = function (type, obj) {
        this.onMessage.push({
            type: type,
            obj: obj,
            handleEvent: function (e) {
                var response = JSON.parse(e.data);
                if (Array.isArray(response) && response[0] === this.type) {
                    obj.handleEvent(response);
                }
            }
        });
    };
    WebsocketController.prototype.triggerOpen = function () {
        for (var i = 0; i < this.onOpen.length; i++) {
            this.onOpen[i].handleEvent();
        }
    };
    WebsocketController.prototype.triggerClose = function () {
        for (var i = 0; i < this.onClose.length; i++) {
            this.onClose[i].handleEvent();
        }
    };
    WebsocketController.prototype.triggerMessage = function (e) {
        for (var i = 0; i < this.onMessage.length; i++) {
            this.onMessage[i].handleEvent(e);
        }
    };
    WebsocketController.READYSTATE_CONNECTING = 0;
    WebsocketController.READYSTATE_OPEN = 1;
    WebsocketController.READYSTATE_CLOSING = 2;
    WebsocketController.READYSTATE_CLOSED = 3;
    return WebsocketController;
}());
var ChatWsController = /** @class */ (function () {
    function ChatWsController() {
        this.socket = new WebsocketController(Server.Chat.CHAT_URL);
        this.currentRoom = null;
        this.onReady = null;
        this.socket.addOpenListener({
            controller: this,
            handleEvent: function () {
                if (this.controller.onReady !== null) {
                    this.controller.onReady.handleEvent();
                    this.controller.onReady = null;
                }
            }
        });
    }
    ChatWsController.prototype.isReady = function () {
        return this.socket.isReady();
    };
    ChatWsController.prototype.start = function () {
        this.socket.connect();
    };
    ChatWsController.prototype.end = function () {
        this.currentRoom = null;
        this.socket.close();
    };
    ChatWsController.prototype.enterRoom = function (id) {
        this.socket.send("room", id);
        this.currentRoom = id;
    };
    ChatWsController.prototype.sendStatus = function (info) {
        var status = [];
        status.push(info.typing ? "1" : "0");
        status.push(info.afk ? "1" : "0");
        status.push(info.focused ? "1" : "0");
        this.socket.send("status", status.join(","));
    };
    ChatWsController.prototype.sendPersona = function (info) {
        var persona = {
            persona: info.persona,
            avatar: info.avatar
        };
        this.socket.send("persona", JSON.stringify(persona));
    };
    ChatWsController.prototype.sendMessage = function (message) {
        this.socket.send("message", message.exportAsObject());
    };
    ChatWsController.prototype.saveMemory = function (memory) {
        this.socket.send("memory", memory);
    };
    ChatWsController.prototype.addCloseListener = function (obj) {
        this.socket.addCloseListener(obj);
    };
    ChatWsController.prototype.addOpenListener = function (obj) {
        this.socket.addOpenListener(obj);
    };
    ChatWsController.prototype.addMessageListener = function (type, obj) {
        this.socket.addMessageListener(type, obj);
    };
    return ChatWsController;
}());
/**
 * Created by Reddo on 16/09/2015.
 */
var Configuration = /** @class */ (function () {
    function Configuration(defV) {
        this.changeTrigger = new Trigger();
        this.value = null;
        this.defValue = null;
        this.setFunction = null;
        this.getFunction = null;
        this.defValue = defV;
        this.value = defV;
    }
    Configuration.prototype.getDefault = function () {
        return this.defValue;
    };
    Configuration.prototype.reset = function () {
        this.storeValue(this.defValue);
    };
    Configuration.prototype.addChangeListener = function (listener) {
        this.changeTrigger.addListener(listener);
    };
    Configuration.prototype.storeValue = function (value) {
        var oldValue = JSON.stringify(this.value);
        if (this.setFunction !== null) {
            this.setFunction(value);
        }
        else {
            this.value = value;
        }
        var newValue = JSON.stringify(this.value);
        if (newValue !== oldValue) {
            this.changeTrigger.trigger(this);
            return true;
        }
        return false;
    };
    Configuration.prototype.getValue = function () {
        if (this.getFunction !== null) {
            return this.getFunction();
        }
        return this.value;
    };
    return Configuration;
}());
var NumberConfiguration = /** @class */ (function (_super) {
    __extends(NumberConfiguration, _super);
    function NumberConfiguration(defValue, min, max) {
        var _this = _super.call(this, defValue) || this;
        _this.min = 0;
        _this.max = 100;
        _this.setFunction = function (value) {
            if (!isNaN(value)) {
                value = Number(value);
                if (value < this.min) {
                    value = this.min;
                }
                if (value > this.max && this.max != 0) {
                    value = this.max;
                }
                this.value = value;
            }
        };
        _this.getFunction = function () {
            // if ($.browser.mobile) {
            //     return 0;
            // }
            //WTF!?!?!?
            return this.value;
        };
        _this.min = min;
        _this.max = max;
        return _this;
    }
    return NumberConfiguration;
}(Configuration));
var WsportConfiguration = /** @class */ (function (_super) {
    __extends(WsportConfiguration, _super);
    function WsportConfiguration() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setFunction = function (value) {
            if (Server.WEBSOCKET_PORTS.indexOf(value) === -1) {
                this.value = Server.WEBSOCKET_PORTS[0];
            }
            else {
                this.value = value;
            }
        };
        return _this;
    }
    return WsportConfiguration;
}(Configuration));
var LanguageConfiguration = /** @class */ (function (_super) {
    __extends(LanguageConfiguration, _super);
    function LanguageConfiguration() {
        var _this = _super.call(this, navigator.language) || this;
        _this.setFunction = function (value) {
            if (value.indexOf("_") !== -1) {
                value = value.replace("_", "-");
            }
            this.value = value;
        };
        return _this;
    }
    return LanguageConfiguration;
}(Configuration));
var BooleanConfiguration = /** @class */ (function (_super) {
    __extends(BooleanConfiguration, _super);
    function BooleanConfiguration(bool) {
        var _this = _super.call(this, bool ? 1 : 0) || this;
        _this.setFunction = function (value) {
            if (typeof value !== "string")
                value = value.toString().toLowerCase();
            var bool = value === "1" || value === "true";
            if (bool)
                this.value = 1;
            else
                this.value = 0;
        };
        _this.getFunction = function () {
            return this.value === 1;
        };
        return _this;
    }
    return BooleanConfiguration;
}(Configuration));
var TrackerMemory = /** @class */ (function () {
    function TrackerMemory() {
        this.changeTrigger = new Trigger();
    }
    TrackerMemory.prototype.addChangeListener = function (listener) {
        this.changeTrigger.addListener(listener);
    };
    TrackerMemory.prototype.triggerChange = function () {
        this.changeTrigger.trigger(this);
    };
    return TrackerMemory;
}());
var MemoryCombat = /** @class */ (function (_super) {
    __extends(MemoryCombat, _super);
    function MemoryCombat() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.combatants = [];
        _this.effects = {};
        _this.storedEffects = {};
        _this.round = 0;
        _this.turn = 0;
        _this.targets = [];
        _this.targetTrigger = new Trigger();
        return _this;
    }
    MemoryCombat.prototype.addTargetListener = function (f) {
        this.targetTrigger.addListener(f);
    };
    MemoryCombat.prototype.removeTargetListener = function (f) {
        this.targetTrigger.removeListener(f);
    };
    MemoryCombat.prototype.triggerTarget = function () {
        this.targetTrigger.trigger(this.targets);
    };
    MemoryCombat.prototype.getCurrentTurnOwner = function () {
        if (this.combatants[this.turn] !== undefined) {
            return this.combatants[this.turn];
        }
        return null;
    };
    MemoryCombat.prototype.getEffects = function () {
        return this.effects;
    };
    MemoryCombat.prototype.getEffectsOn = function (id) {
        if (this.effects[id] !== undefined) {
            return this.effects[id];
        }
        return [];
    };
    MemoryCombat.prototype.removeEffect = function (ce) {
        if (this.effects[ce.target] !== undefined) {
            this.effects[ce.target].splice(this.effects[ce.target].indexOf(ce), 1);
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATCOMBATEFFECTENDED_");
            msg.addLangVar("a", ce.name);
            msg.addLangVar("b", ce.getTargetName());
            UI.Chat.printElement(msg.getElement());
            this.triggerChange();
        }
    };
    MemoryCombat.prototype.addCombatEffect = function (effect) {
        if (this.effects[effect.target] === undefined) {
            this.effects[effect.target] = [effect];
        }
        else {
            this.effects[effect.target].push(effect);
        }
        this.triggerChange();
    };
    MemoryCombat.prototype.addEffect = function (ce) {
        var effect = new CombatEffect(this);
        effect.name = ce.name;
        effect.target = ce.target;
        effect.roundEnd = ce.roundEnd;
        effect.turnEnd = ce.turnEnd;
        effect.endOnStart = ce.endOnStart;
        effect.customString = ce.customString === undefined ? null : ce.customString;
        this.addCombatEffect(effect);
    };
    MemoryCombat.prototype.cleanTargets = function () {
        var goodTargets = [];
        for (var i = 0; i < this.targets.length; i++) {
            var target = this.targets[i];
            for (var k = 0; k < this.combatants.length; k++) {
                if (this.combatants[i].id === target) {
                    goodTargets.push(target);
                    break;
                }
            }
        }
        this.targets = goodTargets;
    };
    MemoryCombat.prototype.getTargets = function () {
        return this.targets;
    };
    MemoryCombat.prototype.getTargetCombatants = function () {
        var targets = [];
        for (var i = 0; i < this.targets.length; i++) {
            for (var k = 0; k < this.combatants.length; k++) {
                if (this.combatants[k].id === this.targets[i]) {
                    targets.push(this.combatants[k]);
                }
            }
        }
        return targets;
    };
    MemoryCombat.prototype.isTarget = function (id) {
        return this.targets.indexOf(id) !== -1;
    };
    MemoryCombat.prototype.setTarget = function (id) {
        var idx = this.targets.indexOf(id);
        if (idx === -1) {
            this.targets.push(id);
        }
        else {
            this.targets.splice(idx, 1);
        }
        this.triggerTarget();
    };
    MemoryCombat.prototype.endCombat = function () {
        this.round = 0;
        this.turn = 0;
        var remove = [];
        for (var i = 0; i < this.combatants.length; i++) {
            if (this.combatants[i].owner === 0) {
                remove.push(this.combatants[i]);
            }
        }
        for (var i = 0; i < remove.length; i++) {
            this.removeParticipant(remove[i]);
        }
        this.effects = {};
        this.triggerChange();
    };
    MemoryCombat.prototype.getRound = function () {
        return this.round;
    };
    MemoryCombat.prototype.getTurn = function () {
        return this.turn;
    };
    MemoryCombat.prototype.getRoundFor = function (id) {
        for (var i = 0; i < this.combatants.length; i++) {
            if (this.combatants[i].id === id) {
                return i;
            }
        }
        return null;
    };
    MemoryCombat.prototype.getCombatants = function () {
        return this.combatants;
    };
    MemoryCombat.prototype.getMyCombatants = function () {
        var combatants = [];
        for (var i = 0; i < this.combatants.length; i++) {
            if (Application.isMe(this.combatants[i].owner) && combatants.indexOf(this.combatants[i]) === -1) {
                combatants.push(this.combatants[i]);
            }
        }
        return combatants;
    };
    MemoryCombat.prototype.reset = function () {
        this.combatants = [];
        this.round = 0;
        this.turn = 0;
        this.triggerChange();
    };
    MemoryCombat.prototype.removeParticipant = function (c) {
        var idx = this.combatants.indexOf(c);
        if (idx !== -1) {
            this.combatants.splice(idx, 1);
            this.triggerChange();
        }
    };
    MemoryCombat.prototype.reorderCombatants = function () {
        this.combatants.sort(function (a, b) {
            return b.initiative - a.initiative;
        });
    };
    MemoryCombat.prototype.addParticipant = function (sheet, owner) {
        var combatant = new CombatParticipant();
        combatant.setSheet(sheet);
        if (owner !== undefined) {
            combatant.setOwner(owner.id);
        }
        this.combatants.push(combatant);
        this.reorderCombatants();
        this.triggerChange();
    };
    MemoryCombat.prototype.incrementRound = function () {
        this.round++;
        this.turn = 0;
        this.triggerChange();
    };
    MemoryCombat.prototype.considerEndingEffects = function () {
        for (var id in this.effects) {
            for (var i = this.effects[id].length - 1; i >= 0; i--) {
                this.effects[id][i].considerEnding();
            }
        }
    };
    MemoryCombat.prototype.setTurn = function (combatant) {
        var idx = this.combatants.indexOf(combatant);
        if (idx !== -1 && idx !== this.turn) {
            this.turn = idx;
            this.considerEndingEffects();
            this.triggerChange();
        }
    };
    MemoryCombat.prototype.incrementTurn = function () {
        this.turn++;
        if ((this.turn + 1) > this.combatants.length) {
            this.turn = 0;
            this.round++;
        }
        this.considerEndingEffects();
        this.triggerChange();
    };
    MemoryCombat.prototype.exportAsObject = function () {
        var arr = [this.round, this.turn];
        var combatants = [];
        for (var i = 0; i < this.combatants.length; i++) {
            combatants.push(this.combatants[i].exportAsObject());
        }
        arr.push(combatants);
        var effects = [];
        for (var id in this.effects) {
            var effect = [Number(id)];
            for (var i = 0; i < this.effects[id].length; i++) {
                effect.push(this.effects[id][i].exportAsObject());
            }
            effects.push(effect);
        }
        arr.push(effects);
        return arr;
    };
    MemoryCombat.prototype.storeEffectNames = function () {
        this.storedEffects = {};
        for (var id in this.effects) {
            this.storedEffects[id] = [];
            for (var k = 0; k < this.effects[id].length; k++) {
                this.storedEffects[id].push(this.effects[id][k].name);
            }
        }
    };
    MemoryCombat.prototype.announceEffectEnding = function () {
        var room = Server.Chat.getRoom();
        if (room !== null && !room.getMe().isStoryteller()) {
            var mySheets = this.getMyCombatants();
            for (var i = 0; i < mySheets.length; i++) {
                var effectNames = [];
                var effects = this.getEffectsOn(mySheets[i].id);
                for (var k = 0; k < effects.length; k++) {
                    effectNames.push(effects[k].name);
                }
                var oldEffectNames = this.storedEffects[mySheets[i].id];
                if (oldEffectNames !== undefined) {
                    for (var k = 0; k < oldEffectNames.length; k++) {
                        if (effectNames.indexOf(oldEffectNames[k]) === -1) {
                            var msg = new ChatSystemMessage(true);
                            msg.addText("_CHATCOMBATEFFECTENDED_");
                            msg.addLangVar("a", oldEffectNames[k]);
                            msg.addLangVar("b", mySheets[i].name);
                            UI.Chat.printElement(msg.getElement());
                        }
                    }
                }
            }
        }
    };
    MemoryCombat.prototype.storeValue = function (obj) {
        if (!Array.isArray(obj)) {
            this.reset();
        }
        else {
            var oldJson = JSON.stringify(this.exportAsObject());
            this.round = obj[0];
            this.turn = obj[1];
            this.combatants = [];
            if (Array.isArray(obj[2]) && obj[2].length > 0) {
                for (var i = 0; i < obj[2].length; i++) {
                    var combatant = new CombatParticipant();
                    combatant.updateFromObject(obj[2][i]);
                    if (combatant.id !== 0) {
                        this.combatants.push(combatant);
                    }
                }
            }
            this.reorderCombatants();
            this.storeEffectNames();
            this.effects = {};
            if (Array.isArray(obj[3]) && obj[3].length > 0) {
                for (var i = 0; i < obj[3].length; i++) {
                    var target = obj[3][i][0];
                    for (var k = 1; k < obj[3][i].length; k++) {
                        var effect = new CombatEffect(this);
                        effect.target = target;
                        effect.updateFromObject(obj[3][i][k]);
                        this.addCombatEffect(effect);
                    }
                }
            }
            this.announceEffectEnding();
            var newJson = JSON.stringify(this.exportAsObject());
            if (newJson !== oldJson) {
                this.triggerChange();
            }
        }
    };
    MemoryCombat.prototype.applyInitiative = function (id, initiative) {
        var foundOne = false;
        for (var i = 0; i < this.combatants.length; i++) {
            if (this.combatants[i].id === id) {
                foundOne = true;
                this.combatants[i].setInitiative(initiative);
            }
        }
        if (foundOne) {
            this.reorderCombatants();
            this.triggerChange();
        }
        else {
            var sheet = DB.SheetDB.getSheet(id);
            if (sheet != null && sheet != undefined) {
                this.addParticipant(sheet);
                this.applyInitiative(id, initiative);
            }
            else {
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATCANTADDINITIATIVE_");
                UI.Chat.printElement(msg.getElement());
            }
        }
    };
    MemoryCombat.prototype.setInitiative = function (combatant, initiative) {
        var idx = this.combatants.indexOf(combatant);
        if (idx !== -1) {
            combatant.setInitiative(initiative);
            this.reorderCombatants();
            this.triggerChange();
        }
    };
    MemoryCombat.prototype.getValue = function () {
        return null;
    };
    return MemoryCombat;
}(TrackerMemory));
var MemoryFilter = /** @class */ (function (_super) {
    __extends(MemoryFilter, _super);
    function MemoryFilter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.value = 0;
        return _this;
    }
    MemoryFilter.prototype.reset = function () {
        this.storeValue(0);
    };
    MemoryFilter.prototype.getValue = function () {
        return MemoryFilter.names[this.value];
    };
    MemoryFilter.prototype.storeName = function (name) {
        this.storeValue(MemoryFilter.names.indexOf(name));
    };
    MemoryFilter.prototype.storeValue = function (i) {
        if (i < 0 || i >= MemoryFilter.names.length) {
            i = 0;
        }
        if (this.value !== i) {
            this.value = i;
            this.triggerChange();
        }
    };
    MemoryFilter.prototype.exportAsObject = function () {
        return this.value;
    };
    MemoryFilter.names = ["none", "night", "noir", "trauma", "gray", "sepia", "evening", "fire"];
    return MemoryFilter;
}(TrackerMemory));
var MemoryPica = /** @class */ (function (_super) {
    __extends(MemoryPica, _super);
    function MemoryPica() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.picaAllowed = true;
        _this.updateUnderway = false;
        _this.changeDetected = false;
        return _this;
    }
    MemoryPica.prototype.reset = function () {
        this.picaAllowed = true;
    };
    MemoryPica.prototype.getValue = function () {
        return this;
    };
    MemoryPica.prototype.isPicaAllowed = function () {
        return this.picaAllowed;
    };
    MemoryPica.prototype.picaAllowedExport = function () {
        return this.picaAllowed ? 1 : 0;
    };
    MemoryPica.prototype.picaAllowedStore = function (isIt) {
        isIt = isIt === true || isIt === 1;
        if (isIt !== this.picaAllowed) {
            this.picaAllowed = isIt;
            if (this.updateUnderway) {
                this.changeDetected = true;
            }
            else {
                this.triggerChange();
            }
        }
    };
    MemoryPica.prototype.storeValue = function (values) {
        if (!Array.isArray(values) || values.length < MemoryPica.fieldOrder.length) {
            console.warn("[ROOMMEMMORY] [MemoryPica] Invalid store operation requested. Ignoring.");
            return;
        }
        this.changeDetected = false;
        this.updateUnderway = true;
        for (var i = 0; i < MemoryPica.fieldOrder.length; i++) {
            this[MemoryPica.fieldOrder[i] + "Store"](values[i]);
        }
        if (this.changeDetected) {
            this.triggerChange();
        }
        this.updateUnderway = false;
    };
    MemoryPica.prototype.exportAsObject = function () {
        var result = [];
        for (var i = 0; i < MemoryPica.fieldOrder.length; i++) {
            result.push(this[MemoryPica.fieldOrder[i] + "Export"]());
        }
        return result;
    };
    MemoryPica.fieldOrder = ["picaAllowed"];
    return MemoryPica;
}(TrackerMemory));
var MemoryLingo = /** @class */ (function (_super) {
    __extends(MemoryLingo, _super);
    function MemoryLingo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.userLingos = {};
        _this.busy = false;
        return _this;
    }
    MemoryLingo.prototype.getUser = function (id) {
        if (this.userLingos[id] !== undefined) {
            return this.userLingos[id];
        }
        return [];
    };
    MemoryLingo.prototype.clean = function () {
        for (var id in this.userLingos) {
            var user = Server.Chat.getRoom().getUser(parseInt(id));
            if (user === null || user.isStoryteller() || this.userLingos[id].length < 1) {
                delete (this.userLingos[id]);
            }
        }
    };
    MemoryLingo.prototype.getUsers = function () {
        return this.userLingos;
    };
    MemoryLingo.prototype.reset = function () {
        this.userLingos = {};
    };
    MemoryLingo.prototype.getValue = function () {
        return this;
    };
    MemoryLingo.prototype.addUserLingo = function (id, lingo) {
        if (this.userLingos[id] === undefined) {
            this.userLingos[id] = [lingo];
            if (!this.busy) {
                this.triggerChange();
            }
        }
        else {
            if (this.userLingos[id].indexOf(lingo) === -1) {
                this.userLingos[id].push(lingo);
                this.userLingos[id].sort();
                if (!this.busy) {
                    this.triggerChange();
                }
            }
        }
    };
    MemoryLingo.prototype.removeUserLingo = function (id, lingo) {
        if (this.userLingos[id] !== undefined) {
            var idx = this.userLingos[id].indexOf(lingo);
            if (idx !== -1) {
                this.userLingos[id].splice(idx, 1);
                this.clean();
                if (!this.busy) {
                    this.triggerChange();
                }
            }
        }
    };
    MemoryLingo.prototype.isSpeaker = function (id, lingo) {
        var user = this.getUser(id);
        if (user === null) {
            return false;
        }
        return user.indexOf(lingo) !== -1;
    };
    MemoryLingo.prototype.getSpeakers = function (lingo) {
        var speakers = [];
        if (Server.Chat.getRoom() === null) {
            return speakers;
        }
        for (var id in this.userLingos) {
            if (this.userLingos[id].indexOf(lingo) !== -1) {
                speakers.push(Server.Chat.getRoom().getUser(parseInt(id)));
            }
        }
        return speakers;
    };
    MemoryLingo.prototype.getSpeakerArray = function (lingo) {
        var speakers = [];
        if (Server.Chat.getRoom() === null) {
            return speakers;
        }
        for (var id in this.userLingos) {
            if (this.userLingos[id].indexOf(lingo) !== -1) {
                speakers.push(parseInt(id));
            }
        }
        return speakers;
    };
    MemoryLingo.prototype.storeValue = function (values) {
        if (!Array.isArray(values)) {
            console.warn("[ROOMMEMMORY] [MemoryLingo] Invalid store operation requested. Ignoring.");
            return;
        }
        var oldJson = JSON.stringify(this.userLingos);
        this.busy = true;
        this.userLingos = {};
        for (var i = 0; i < values.length - 1; i += 2) {
            var userid = values[i];
            var userlingos = values[i + 1].split(";");
            for (var k = 0; k < userlingos.length; k++) {
                this.addUserLingo(userid, userlingos[k]);
            }
            this.userLingos[values[i]] = values[i + 1].split(";");
        }
        this.clean();
        this.busy = false;
        var newJson = JSON.stringify(this.userLingos);
        if (oldJson !== newJson) {
            this.triggerChange();
        }
    };
    MemoryLingo.prototype.exportAsObject = function () {
        var values = [];
        for (var id in this.userLingos) {
            values.push(parseInt(id));
            values.push(this.userLingos[id].join(";"));
        }
        return values;
    };
    return MemoryLingo;
}(TrackerMemory));
var MemoryVersion = /** @class */ (function (_super) {
    __extends(MemoryVersion, _super);
    function MemoryVersion() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.importVersion = Server.Chat.Memory.version;
        return _this;
    }
    MemoryVersion.prototype.reset = function () {
        this.importVersion = Server.Chat.Memory.version;
    };
    MemoryVersion.prototype.storeValue = function (v) {
        this.importVersion = v;
    };
    MemoryVersion.prototype.getValue = function () {
        return this.importVersion;
    };
    MemoryVersion.prototype.exportAsObject = function () {
        return Server.Chat.Memory.version;
    };
    return MemoryVersion;
}(TrackerMemory));
var MemoryCutscene = /** @class */ (function (_super) {
    __extends(MemoryCutscene, _super);
    function MemoryCutscene() {
        var _this = _super.call(this) || this;
        _this.chatAllowed = true;
        MemoryCutscene.button.addEventListener("click", {
            cutscene: _this,
            handleEvent: function (e) {
                e.preventDefault();
                this.cutscene.click();
            }
        });
        return _this;
    }
    MemoryCutscene.prototype.click = function () {
        if (Server.Chat.getRoom().getMe().isStoryteller()) {
            this.storeValue(!this.getValue());
            if (!this.getValue()) {
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATSHHHHHWEHOLLYWOODACTIVE_");
                UI.Chat.printElement(msg.getElement());
            }
            else {
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATSHHHHHWEHOLLYWOODINACTIVE_");
                UI.Chat.printElement(msg.getElement());
            }
            //The button already shows the change, let's not ruin the cutscene by printing a warning
            //MessageCutscene.sendNotification(this.getValue());
        }
    };
    MemoryCutscene.prototype.reset = function () {
        this.chatAllowed = true;
    };
    MemoryCutscene.prototype.storeValue = function (v) {
        var allowed = v === true || v === 1;
        if (allowed !== this.chatAllowed) {
            this.chatAllowed = allowed;
            this.triggerChange();
            if (this.getValue()) {
                MemoryCutscene.button.classList.add("icons-chatHollywood");
                MemoryCutscene.button.classList.remove("icons-chatHollywoodOff");
            }
            else {
                MemoryCutscene.button.classList.remove("icons-chatHollywood");
                MemoryCutscene.button.classList.add("icons-chatHollywoodOff");
            }
        }
    };
    MemoryCutscene.prototype.getValue = function () {
        return this.chatAllowed;
    };
    MemoryCutscene.prototype.exportAsObject = function () {
        return this.chatAllowed ? 1 : 0;
    };
    MemoryCutscene.button = document.getElementById("chatHollywood");
    return MemoryCutscene;
}(TrackerMemory));
/// <reference path='../MemoryCombat.ts' />
var CombatEffect = /** @class */ (function () {
    function CombatEffect(combat) {
        this.name = "";
        this.target = 0;
        this.roundEnd = 0;
        this.turnEnd = 0;
        this.endOnStart = false;
        this.customString = null;
        this.combat = combat;
    }
    CombatEffect.prototype.getTargetName = function () {
        var sheet = DB.SheetDB.getSheet(this.target);
        if (sheet !== null) {
            return sheet.getName();
        }
        var combatants = this.combat.getCombatants();
        for (var i = 0; i < combatants.length; i++) {
            if (combatants[i].id === this.target) {
                return combatants[i].name;
            }
        }
        return "???";
    };
    CombatEffect.prototype.considerEnding = function () {
        if (this.combat.getRound() > this.roundEnd) {
            this.combat.removeEffect(this);
        }
        else if (this.combat.getRound() === this.roundEnd) {
            if (this.endOnStart) {
                if (this.turnEnd === this.combat.getTurn()) {
                    this.combat.removeEffect(this);
                }
            }
            else if (this.turnEnd < this.combat.getTurn()) {
                this.combat.removeEffect(this);
            }
        }
    };
    CombatEffect.prototype.reset = function () {
        this.name = UI.Language.getLanguage().getLingo("_TRACKERUNKNOWNEFFECT_");
    };
    CombatEffect.prototype.exportAsObject = function () {
        var arr = [this.name, this.roundEnd, this.turnEnd, this.endOnStart ? 1 : 0];
        if (this.customString !== null) {
            arr.push(this.customString);
        }
        return arr;
    };
    CombatEffect.prototype.updateFromObject = function (array) {
        if (!Array.isArray(array)) {
            this.reset();
        }
        else {
            this.name = array[0];
            this.roundEnd = array[1];
            this.turnEnd = array[2];
            this.endOnStart = array[3] === 1;
            if (typeof array[4] === "string") {
                this.customString = array[4];
            }
        }
    };
    return CombatEffect;
}());
var CombatParticipant = /** @class */ (function () {
    function CombatParticipant() {
        this.id = 0;
        this.name = "";
        this.initiative = 0;
        this.owner = 0;
    }
    CombatParticipant.prototype.setSheet = function (sheet) {
        this.id = sheet.getId();
        this.name = sheet.getName();
    };
    CombatParticipant.prototype.setSheetId = function (id) {
        this.id = id;
    };
    CombatParticipant.prototype.setName = function (name) {
        this.name = name;
    };
    CombatParticipant.prototype.setInitiative = function (init) {
        this.initiative = init;
    };
    CombatParticipant.prototype.setOwner = function (id) {
        this.owner = id;
    };
    CombatParticipant.prototype.updateFromObject = function (obj) {
        if (Array.isArray(obj) && obj.length === 4) {
            this.id = obj[0];
            this.name = obj[1];
            this.initiative = obj[2];
            this.owner = obj[3];
        }
    };
    CombatParticipant.prototype.exportAsObject = function () {
        var participant = [this.id, this.name, this.initiative, this.owner];
        return participant;
    };
    return CombatParticipant;
}());
var ChatCombatRow = /** @class */ (function () {
    function ChatCombatRow(combatant, currentTurn, currentTarget, isStoryteller) {
        this.visible = document.createElement("div");
        this.combatant = combatant;
        this.visible.classList.add("combatRow");
        if (currentTurn)
            this.visible.classList.add("currentTurn");
        if (currentTarget)
            this.visible.classList.add("currentTarget");
        if (isStoryteller) {
            var remove = document.createElement("a");
            remove.classList.add("combatRemove", "language");
            UI.Language.addLanguageTitle(remove, "_COMBATTRACKERREMOVE_");
            remove.addEventListener("click", (function (e) {
                e.preventDefault();
                this.remove();
            }).bind(this));
            this.visible.appendChild(remove);
        }
        var span = document.createElement("span");
        span.classList.add("combatName");
        span.appendChild(document.createTextNode(combatant.name));
        this.visible.appendChild(span);
        var input = document.createElement("input");
        input.classList.add("combatRowInitiative");
        input.value = combatant.initiative.toString();
        this.input = input;
        this.visible.appendChild(input);
        this.input.disabled = !isStoryteller;
        if (isStoryteller) {
            input.addEventListener("change", (function () {
                this.change();
            }).bind(this));
            // TURN!!!!!!!!!!!!!!
            var turn = document.createElement("a");
            turn.classList.add("combatSetTurn", "language");
            UI.Language.addLanguageTitle(turn, "_COMBATTRACKERSETTURN_");
            turn.addEventListener("click", (function (e) {
                e.preventDefault();
                this.setTurn();
            }).bind(this));
            this.visible.appendChild(turn);
        }
        // TARGET!!!!
        var target = document.createElement("a");
        target.classList.add("combatTarget", "language");
        UI.Language.addLanguageTitle(target, "_COMBATTRACKERSETTARGET_");
        target.addEventListener("click", (function (e) {
            e.preventDefault();
            this.setTarget();
        }).bind(this));
        this.visible.appendChild(target);
        // SHEET!!!!!!!
        if (isStoryteller || Application.isMe(this.combatant.owner)) {
            var sheet = document.createElement("a");
            sheet.classList.add("combatSheet", "language");
            UI.Language.addLanguageTitle(sheet, "_COMBATTRACKERSHEET_");
            sheet.addEventListener("click", (function (e) {
                e.preventDefault();
                this.openSheet();
            }).bind(this));
            this.visible.appendChild(sheet);
        }
        UI.Language.updateScreen(this.visible);
    }
    ChatCombatRow.prototype.getHTML = function () {
        return this.visible;
    };
    ChatCombatRow.prototype.change = function () {
        var value = Number(this.input.value);
        if (!isNaN(value)) {
            var memory = Server.Chat.Memory.getConfiguration("Combat");
            memory.setInitiative(this.combatant, value);
        }
        else {
            UI.Chat.Combat.update();
        }
    };
    ChatCombatRow.prototype.remove = function () {
        var memory = Server.Chat.Memory.getConfiguration("Combat");
        memory.removeParticipant(this.combatant);
    };
    ChatCombatRow.prototype.setTurn = function () {
        var memory = Server.Chat.Memory.getConfiguration("Combat");
        memory.setTurn(this.combatant);
        UI.Chat.Combat.announceTurn();
    };
    ChatCombatRow.prototype.setTarget = function () {
        var memory = Server.Chat.Memory.getConfiguration("Combat");
        memory.setTarget(this.combatant.id);
    };
    ChatCombatRow.prototype.openSheet = function () {
        UI.Sheets.SheetManager.openSheetId(this.combatant.id);
    };
    return ChatCombatRow;
}());
var ChatInfo = /** @class */ (function () {
    function ChatInfo(floater) {
        this.textNode = document.createTextNode("null");
        this.senderBold = document.createElement("b");
        this.senderTextNode = document.createTextNode("_CHATSENDER_");
        this.storyteller = false;
        this.floater = floater;
        this.floater.style.display = "none";
        while (this.floater.firstChild !== null)
            this.floater.removeChild(this.floater.firstChild);
        this.senderBold.appendChild(this.senderTextNode);
        this.senderBold.appendChild(document.createTextNode(": "));
        this.floater.appendChild(this.senderBold);
        this.floater.appendChild(this.textNode);
        UI.Language.markLanguage(this.senderBold);
    }
    ChatInfo.prototype.showFor = function ($element, message) {
        this.floater.style.display = "";
        var offset = $element.offset().top;
        var height = window.innerHeight;
        if (message !== undefined) {
            this.floater.style.bottom = (height - offset) + "px";
            this.textNode.nodeValue = message.getUser().getUser().getFullNickname();
            if (message.getUser().isStoryteller() !== this.storyteller) {
                this.senderTextNode.nodeValue = message.getUser().isStoryteller() ? "_CHATSENDERSTORYTELLER_" : "_CHATSENDER_";
                this.storyteller = message.getUser().isStoryteller();
                UI.Language.markLanguage(this.senderBold);
            }
        }
    };
    ChatInfo.prototype.hide = function () {
        this.floater.style.display = "none";
    };
    ChatInfo.prototype.bindMessage = function (message, element) {
        if (message instanceof MessageSystem) {
            return; // we don't bind system messages
        }
        var $element = $(element);
        element.addEventListener("mouseenter", {
            chatInfo: this,
            message: message,
            $element: $element,
            handleEvent: function () {
                this.chatInfo.showFor(this.$element, this.message);
            }
        });
        element.addEventListener("mousemove", {
            chatInfo: this,
            $element: $element,
            handleEvent: function () {
                this.chatInfo.showFor(this.$element);
            }
        });
        element.addEventListener("mouseleave", {
            chatInfo: this,
            handleEvent: function () {
                this.chatInfo.hide();
            }
        });
    };
    return ChatInfo;
}());
var ChatAvatar = /** @class */ (function () {
    function ChatAvatar() {
        this.element = document.createElement("div");
        this.img = document.createElement("img");
        this.typing = document.createElement("a");
        this.afk = document.createElement("a");
        this.name = document.createTextNode("????#????");
        this.user = null;
        this.persona = null;
        this.online = false;
        this.changedOnline = false;
        var name = document.createElement("div");
        name.classList.add("avatarName");
        name.appendChild(this.name);
        this.typing.style.display = "none";
        this.typing.classList.add("avatarTyping");
        this.afk.style.display = "none";
        this.afk.classList.add("avatarAFK");
        this.img.classList.add("avatarImg");
        this.element.classList.add("avatarContainer");
        this.element.appendChild(this.img);
        this.element.appendChild(this.typing);
        this.element.appendChild(this.afk);
        this.element.appendChild(name);
        this.img.style.display = "none";
        this.element.classList.add("icons-chatAnon");
        this.img.addEventListener("error", {
            avatar: this,
            handleEvent: function () {
                this.avatar.img.style.display = "none";
                this.avatar.element.classList.add("icons-chatAnonError");
            }
        });
    }
    ChatAvatar.prototype.getHTML = function () {
        return this.element;
    };
    ChatAvatar.prototype.getUser = function () {
        return this.user;
    };
    ChatAvatar.prototype.setOnline = function (online) {
        if (online) {
            this.element.style.display = "";
        }
        else {
            this.element.style.display = "none";
        }
        if (online !== this.online) {
            this.changedOnline = true;
            this.online = online;
        }
    };
    // Fake "changed" if we are online for reconnect
    ChatAvatar.prototype.reset = function () {
        this.setOnline(false);
        this.changedOnline = false;
    };
    ChatAvatar.prototype.isChangedOnline = function () {
        var is = this.changedOnline;
        this.changedOnline = false;
        return is;
    };
    ChatAvatar.prototype.setImg = function (img) {
        if (img === null) {
            this.img.style.display = "none";
            this.element.classList.add("icons-chatAnon");
            this.element.classList.remove("icons-chatAnonError");
        }
        else {
            this.img.style.display = "";
            this.element.classList.remove("icons-chatAnon");
            this.element.classList.remove("icons-chatAnonError");
            this.img.src = img;
        }
    };
    ChatAvatar.prototype.setName = function (name) {
        this.name.nodeValue = name;
    };
    ChatAvatar.prototype.setFocus = function (focus) {
        if (!focus) {
            this.element.style.opacity = "0.7";
        }
        else {
            this.element.style.opacity = "1";
        }
    };
    ChatAvatar.prototype.setTyping = function (typing) {
        if (typing) {
            this.typing.style.display = "";
        }
        else {
            this.typing.style.display = "none";
        }
    };
    ChatAvatar.prototype.setAfk = function (afk) {
        if (afk) {
            this.afk.style.display = "";
        }
        else {
            this.afk.style.display = "none";
        }
    };
    ChatAvatar.prototype.updateName = function () {
        if (this.persona === null) {
            if (this.user !== null)
                this.setName(this.user.getFullNickname());
        }
        else {
            this.setName(this.persona);
        }
        if (this.user !== null) {
            this.element.setAttribute("title", this.user.getFullNickname());
        }
        else if (this.persona !== null) {
            this.element.setAttribute("title", this.persona);
        }
        else {
            this.element.removeAttribute("title");
        }
    };
    ChatAvatar.prototype.updateFromObject = function (obj) {
        if (obj['id'] !== undefined) {
            this.user = DB.UserDB.getUser(obj['id']);
        }
        if (obj['idle'] !== undefined)
            this.setAfk(obj['idle']);
        if (obj['focused'] !== undefined)
            this.setFocus(obj['focused']);
        if (obj['online'] !== undefined)
            this.setOnline(obj['online']);
        if (obj['typing'] !== undefined)
            this.setTyping(obj['typing']);
        if (obj['persona'] !== undefined)
            this.persona = obj['persona'];
        if (obj['avatar'] !== undefined)
            this.setImg(obj['avatar']);
        this.updateName();
    };
    return ChatAvatar;
}());
var ChatNotificationIcon = /** @class */ (function () {
    function ChatNotificationIcon(icon, hasLanguage) {
        this.element = document.createElement("div");
        this.hoverInfo = document.createElement("div");
        this.language = hasLanguage === undefined ? true : hasLanguage;
        this.element.classList.add("chatNotificationIcon");
        this.element.classList.add(icon);
        this.hoverInfo.classList.add("chatNotificationHover");
        if (this.language) {
            this.element.appendChild(this.hoverInfo);
        }
        this.element.style.display = "none";
    }
    ChatNotificationIcon.prototype.addText = function (text) {
        this.hoverInfo.appendChild(document.createTextNode(text));
    };
    ChatNotificationIcon.prototype.getElement = function () {
        if (this.language) {
            UI.Language.markLanguage(this.hoverInfo);
        }
        return this.element;
    };
    ChatNotificationIcon.prototype.show = function () {
        if (this.element.style.display === "") {
            return false;
        }
        this.element.style.display = "";
        return true;
    };
    ChatNotificationIcon.prototype.hide = function () {
        if (this.element.style.display === "none") {
            return false;
        }
        this.element.style.display = "none";
        return true;
    };
    return ChatNotificationIcon;
}());
var ChatFormState = /** @class */ (function () {
    function ChatFormState(element) {
        this.state = -1;
        this.element = element;
        this.setState(ChatFormState.STATE_NORMAL);
    }
    ChatFormState.prototype.getState = function () {
        return this.state;
    };
    ChatFormState.prototype.isNormal = function () {
        return this.state === ChatFormState.STATE_NORMAL;
    };
    ChatFormState.prototype.isAction = function () {
        return this.state === ChatFormState.STATE_ACTION;
    };
    ChatFormState.prototype.isStory = function () {
        return this.state === ChatFormState.STATE_STORY;
    };
    ChatFormState.prototype.isOff = function () {
        return this.state === ChatFormState.STATE_OFF;
    };
    ChatFormState.prototype.setState = function (state) {
        if (this.state === state) {
            return;
        }
        var stateClass = ["icons-chatFormStateNormal", "icons-chatFormStateAction", "icons-chatFormStateStory", "icons-chatFormStateOff"];
        this.element.classList.remove(stateClass[this.state]);
        this.element.classList.add(stateClass[state]);
        this.state = state;
    };
    ChatFormState.STATE_NORMAL = 0;
    ChatFormState.STATE_ACTION = 1;
    ChatFormState.STATE_STORY = 2;
    ChatFormState.STATE_OFF = 3;
    return ChatFormState;
}());
var ChatAvatarChoice = /** @class */ (function () {
    function ChatAvatarChoice(name, avatar) {
        this.avatar = new ChatAvatar();
        this.box = document.createElement("div");
        this.useButton = document.createElement("a");
        this.deleteButton = document.createElement("a");
        var obj = {
            id: Application.Login.isLogged() ? Application.Login.getUser().id : undefined,
            persona: name,
            avatar: avatar
        };
        this.avatar.updateFromObject(obj);
        this.box.appendChild(this.avatar.getHTML());
        this.box.appendChild(this.useButton);
        this.box.appendChild(this.deleteButton);
        this.id = avatar + ";" + name;
        this.box.classList.add("chatAvatarChoiceBox");
        this.useButton.classList.add("chatAvatarChoiceBoxUse");
        this.deleteButton.classList.add("chatAvatarChoiceBoxDelete");
        this.useButton.addEventListener("click", {
            name: name,
            avatar: avatar,
            handleEvent: function () {
                UI.Chat.PersonaDesigner.usePersona(this.name, this.avatar);
            }
        });
        this.deleteButton.addEventListener("click", {
            choice: this,
            handleEvent: function () {
                UI.Chat.PersonaDesigner.removeChoice(this.choice);
            }
        });
        UI.Language.addLanguageTitle(this.useButton, "_CHATPERSONADESIGNERUSE_");
        UI.Language.addLanguageTitle(this.deleteButton, "_CHATPERSONADESIGNERDELETE_");
        this.nameStr = name;
        this.avatarStr = avatar;
    }
    ChatAvatarChoice.prototype.getHTML = function () {
        return this.box;
    };
    return ChatAvatarChoice;
}());
var ChatSystemMessage = /** @class */ (function () {
    function ChatSystemMessage(hasLanguage) {
        this.element = document.createElement("p");
        this.element.classList.add("chatMessageNotification");
        this.hasLanguage = hasLanguage;
    }
    ChatSystemMessage.prototype.addLangVar = function (id, value) {
        UI.Language.addLanguageVariable(this.element, id, value);
    };
    ChatSystemMessage.createTextLink = function (text, hasLanguage, click) {
        var a = document.createElement("a");
        a.classList.add("textLink");
        a.appendChild(document.createTextNode(text));
        if (hasLanguage) {
            UI.Language.markLanguage(a);
        }
        a.addEventListener("click", click);
        return a;
    };
    ChatSystemMessage.prototype.addTextLink = function (text, hasLanguage, click) {
        this.element.appendChild(ChatSystemMessage.createTextLink(text, hasLanguage, click));
    };
    ChatSystemMessage.prototype.addLineBreak = function () {
        this.element.appendChild(document.createElement("br"));
    };
    ChatSystemMessage.prototype.addText = function (text) {
        this.element.appendChild(document.createTextNode(text));
    };
    ChatSystemMessage.prototype.addLingoVariable = function (id, value) {
        UI.Language.addLanguageVariable(this.element, id, value);
    };
    ChatSystemMessage.prototype.addElement = function (ele) {
        this.element.appendChild(ele);
    };
    ChatSystemMessage.prototype.getElement = function () {
        if (this.hasLanguage) {
            UI.Language.markLanguage(this.element);
        }
        return this.element;
    };
    return ChatSystemMessage;
}());
var ImagesRow = /** @class */ (function () {
    function ImagesRow(image, folder) {
        this.folder = folder;
        this.image = image;
        var imageContainer = document.createElement("div");
        imageContainer.classList.add("imagesRow");
        // SHARE
        var shareButton = document.createElement("a");
        shareButton.classList.add("imagesLeftButton");
        shareButton.classList.add("icons-imagesShare");
        UI.Language.addLanguageTitle(shareButton, "_IMAGESSHARE_");
        shareButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.share();
            }
        });
        // VIEW
        var viewButton = document.createElement("a");
        viewButton.classList.add("imagesLeftButton");
        viewButton.classList.add("icons-imagesView");
        UI.Language.addLanguageTitle(viewButton, "_IMAGESVIEW_");
        viewButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.view();
            }
        });
        // PERSONA
        var personaButton = document.createElement("a");
        personaButton.classList.add("imagesLeftButton");
        personaButton.classList.add("icons-imagesPersona");
        UI.Language.addLanguageTitle(personaButton, "_IMAGESPERSONA_");
        personaButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.usePersona();
            }
        });
        // DELETE
        var deleteButton = document.createElement("a");
        deleteButton.classList.add("imagesRightButton");
        deleteButton.classList.add("icons-imagesDelete");
        UI.Language.addLanguageTitle(deleteButton, "_IMAGESDELETE_");
        deleteButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.delete();
            }
        });
        // RENAME
        var renameButton = document.createElement("a");
        renameButton.classList.add("imagesRightButton");
        renameButton.classList.add("icons-imagesRename");
        UI.Language.addLanguageTitle(renameButton, "_IMAGESRENAME_");
        renameButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.rename();
            }
        });
        // FOLDER
        var folderButton = document.createElement("a");
        folderButton.classList.add("imagesRightButton");
        folderButton.classList.add("icons-imagesFolder");
        UI.Language.addLanguageTitle(folderButton, "_IMAGESFOLDER_");
        folderButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.renameFolder();
            }
        });
        var imageTitle = document.createElement("a");
        imageTitle.classList.add("imagesRowTitle");
        var nameNode = document.createTextNode(image.getName());
        imageTitle.appendChild(nameNode);
        this.nameNode = nameNode;
        UI.Language.markLanguage(shareButton, viewButton, personaButton, deleteButton, renameButton, folderButton);
        imageContainer.appendChild(shareButton);
        imageContainer.appendChild(viewButton);
        imageContainer.appendChild(personaButton);
        imageContainer.appendChild(deleteButton);
        imageContainer.appendChild(renameButton);
        imageContainer.appendChild(folderButton);
        imageContainer.appendChild(imageTitle);
        this.html = imageContainer;
    }
    //     .imagesRow
    //         %a.imagesLeftButton.icons-imagesShare
    //         %a.imagesLeftButton.icons-imagesView
    //         %a.imagesLeftButton.icons-imagesPersona
    //         %a.imagesRightButton.icons-imagesDelete
    //         %a.imagesRightButton.icons-imagesRename
    //         %a.imagesRightButton.icons-imagesFolder
    //         %a.imagesRowTitle="Nome da Imagem"
    ImagesRow.prototype.view = function () {
        UI.Pica.loadImage(this.image.getLink());
    };
    ImagesRow.prototype.share = function () {
        MessageImage.shareLink(this.image.getName(), this.image.getLink());
    };
    ImagesRow.prototype.usePersona = function () {
        UI.Chat.PersonaDesigner.createPersona(this.image.getName().replace(/ *\([^)]*\) */, '').trim(), this.image.getLink());
        UI.Chat.PersonaManager.createAndUsePersona(this.image.getName().replace(/ *\([^)]*\) */, '').trim(), this.image.getLink());
    };
    ImagesRow.prototype.delete = function () {
        this.html.parentElement.removeChild(this.html);
        this.folder.considerSuicide();
        DB.ImageDB.removeImage(this.image);
    };
    ImagesRow.prototype.renameFolder = function () {
        var newName = prompt(UI.Language.getLanguage().getLingo("_IMAGESRENAMEFOLDERPROMPT_", { languagea: this.image.getName(), languageb: this.image.getFolder() }));
        if (newName === null) {
            return;
        }
        this.image.setFolder(newName.trim());
    };
    ImagesRow.prototype.rename = function () {
        var newName = prompt(UI.Language.getLanguage().getLingo("_IMAGESRENAMEPROMPT_", { languagea: this.image.getName() }));
        if (newName === null || newName === "") {
            return;
        }
        this.image.setName(newName);
        this.nameNode.nodeValue = this.image.getName();
    };
    ImagesRow.prototype.getHTML = function () {
        return this.html;
    };
    return ImagesRow;
}());
var ImagesFolder = /** @class */ (function () {
    // .imagesFolder
    //     %a.imagesFolderIcon
    //     %span.imagesFolderTitle{:onclick => "this.parentNode.classList.toggle('folderOpen');"}="Nome da Pasta"
    function ImagesFolder(images) {
        var _this = this;
        var folderName = images[0].getFolder();
        this.name = folderName;
        if (folderName === "") {
            folderName = UI.Language.getLanguage().getLingo("_IMAGESNOFOLDERNAME_");
        }
        var folderContainer = document.createElement("div");
        folderContainer.classList.add("imagesFolder");
        this.folderContainer = folderContainer;
        var folderIcon = document.createElement("a");
        folderIcon.classList.add("imagesFolderIcon");
        var folderTitle = document.createElement("span");
        folderTitle.classList.add("imagesFolderTitle");
        folderTitle.addEventListener("click", {
            folder: this,
            handleEvent: function () {
                this.folder.toggle();
            }
        });
        folderTitle.appendChild(document.createTextNode(folderName));
        var deleteIcon = document.createElement("a");
        deleteIcon.classList.add("icons-imagesDelete");
        deleteIcon.classList.add("folderRightButton");
        deleteIcon.addEventListener("click", function () { _this.delete(); });
        UI.Language.addLanguageTitle(deleteIcon, "_IMAGESDELETE_");
        UI.Language.markLanguage(deleteIcon);
        folderContainer.appendChild(folderIcon);
        folderContainer.appendChild(deleteIcon);
        folderContainer.appendChild(folderTitle);
        for (var k = 0; k < images.length; k++) {
            var imageRow = new ImagesRow(images[k], this);
            folderContainer.appendChild(imageRow.getHTML());
        }
        this.html = folderContainer;
    }
    ImagesFolder.prototype.getName = function () {
        return this.name;
    };
    ImagesFolder.prototype.open = function () {
        this.folderContainer.classList.add("folderOpen");
    };
    ImagesFolder.prototype.toggle = function () {
        this.folderContainer.classList.toggle("folderOpen");
        if (this.folderContainer.classList.contains("folderOpen")) {
            UI.Images.stayInFolder(this.name);
        }
    };
    ImagesFolder.prototype.getHTML = function () {
        return this.html;
    };
    ImagesFolder.prototype.delete = function () {
        var text = UI.Language.getLanguage().getLingo("_DELETEFOLDER_", { languagea: this.getName() });
        if (confirm(text)) {
            DB.ImageDB.removeFolder(this.getName());
            this.html.parentElement.removeChild(this.html);
        }
    };
    ImagesFolder.prototype.considerSuicide = function () {
        if (this.html.children.length <= 2) {
            this.html.parentElement.removeChild(this.html);
        }
    };
    return ImagesFolder;
}());
var SheetsRow = /** @class */ (function () {
    function SheetsRow(sheet) {
        this.sheet = sheet;
        this.html = document.createElement("p");
        this.html.classList.add("sheetListSheet");
        // NAME
        var nameLink = document.createElement("a");
        nameLink.classList.add("sheetNameLink");
        this.nameNode = document.createTextNode(sheet.getName());
        nameLink.appendChild(this.nameNode);
        this.html.appendChild(nameLink);
        nameLink.addEventListener("click", {
            row: this,
            handleEvent: function (e) {
                e.preventDefault();
                this.row.open(e);
            }
        });
        // FOLDER
        if (sheet.isEditable()) {
            var folder = document.createElement("a");
            folder.classList.add("sheetExtraButton");
            folder.classList.add("textLink");
            folder.appendChild(document.createTextNode("_SHEETSRENAMEFOLDER_"));
            UI.Language.markLanguage(folder);
            this.html.appendChild(folder);
            folder.addEventListener("click", {
                row: this,
                handleEvent: function (e) {
                    e.preventDefault();
                    this.row.editFolder();
                }
            });
        }
        // PERMISSIONS
        if (sheet.isPromotable()) {
            var perm = document.createElement("a");
            perm.classList.add("sheetExtraButton");
            perm.classList.add("textLink");
            perm.appendChild(document.createTextNode("_SHEETSCHANGEPERMISSIONS_"));
            UI.Language.markLanguage(perm);
            this.html.appendChild(perm);
            perm.addEventListener("click", {
                row: this,
                handleEvent: function (e) {
                    e.preventDefault();
                    this.row.editPerm();
                }
            });
        }
        // DELETE
        if (sheet.isDeletable()) {
            var del = document.createElement("a");
            del.classList.add("sheetExtraButton");
            del.classList.add("textLink");
            del.appendChild(document.createTextNode("_SHEETSDELETE_"));
            UI.Language.markLanguage(del);
            this.html.appendChild(del);
            del.addEventListener("click", {
                row: this,
                handleEvent: function (e) {
                    e.preventDefault();
                    if (confirm(UI.Language.getLanguage().getLingo("_RAPSDELETE_", { languagea: this.row.sheet.name }))) {
                        this.row.deleteSheet();
                    }
                }
            });
        }
    }
    SheetsRow.prototype.open = function (e) {
        UI.Sheets.SheetManager.openSheet(this.sheet, false, false, !e.ctrlKey);
    };
    SheetsRow.prototype.deleteSheet = function () {
        if (confirm(UI.Language.getLanguage().getLingo("_SHEETCONFIRMDELETE_", { languagea: this.sheet.getName() }))) {
            var cbs = {
                sheet: this.sheet,
                oldFolder: this.sheet.getFolder(),
                handleEvent: function () {
                    UI.Sheets.keepOpen(this.oldFolder, this.sheet.getGameid());
                    UI.Sheets.callSelf();
                }
            };
            Server.Sheets.deleteSheet(this.sheet, cbs);
        }
    };
    SheetsRow.prototype.editPerm = function () {
        UI.Sheets.SheetPermissionDesigner.callSelf(this.sheet);
    };
    SheetsRow.prototype.editFolder = function () {
        var oldFolder = this.sheet.getFolder();
        var newName = prompt(UI.Language.getLanguage().getLingo("_SHEETSRENAMEFOLDERPROMPT_", { languagea: this.sheet.getName(), languageb: this.sheet.folder }));
        if (newName === null) {
            return;
        }
        this.sheet.folder = newName.trim();
        if (this.sheet.getFolder() !== oldFolder) {
            var cbs = {
                sheet: this.sheet,
                oldFolder: oldFolder,
                handleEvent: function () {
                    UI.Sheets.keepOpen(this.oldFolder, this.sheet.getGameid());
                    UI.Sheets.callSelf();
                }
            };
            Server.Sheets.sendFolder(this.sheet, cbs);
        }
    };
    SheetsRow.prototype.getHTML = function () {
        return this.html;
    };
    return SheetsRow;
}());
var SheetsFolder = /** @class */ (function () {
    function SheetsFolder(sheets, open) {
        var folderName = sheets[0].folder;
        if (folderName === "") {
            folderName = UI.Language.getLanguage().getLingo("_SHEETSNOFOLDERNAME_");
        }
        // .sheetListFolderContainer.lightHoverable.openSheetFolder
        this.html = document.createElement("div");
        this.html.classList.add("sheetListFolderContainer");
        this.html.classList.add("lightHoverable");
        if (open === true) {
            this.html.classList.add("openSheetFolder");
        }
        // %p.sheetListFolderName{:onclick=>"this.parentNode.classList.toggle('openSheetFolder');"}="Nome da pasta"
        var p = document.createElement("p");
        p.classList.add("sheetListFolderName");
        p.appendChild(document.createTextNode(folderName));
        p.addEventListener("click", function (e) {
            e.preventDefault();
            this.parentElement.classList.toggle("openSheetFolder");
        });
        this.html.appendChild(p);
        for (var i = 0; i < sheets.length; i++) {
            var sheet = new SheetsRow(sheets[i]);
            this.html.appendChild(sheet.getHTML());
        }
    }
    SheetsFolder.prototype.getHTML = function () {
        return this.html;
    };
    return SheetsFolder;
}());
var SheetPermRow = /** @class */ (function () {
    function SheetPermRow(player) {
        this.deleteSheet = false;
        this.editSheet = false;
        this.viewSheet = false;
        this.promoteSheet = false;
        this.deleteSheet = player['deletar'];
        this.editSheet = player['editar'];
        this.viewSheet = player['visualizar'];
        this.promoteSheet = player['promote'];
        this.sheetId = player['id'];
        this.userId = player['userid'];
        this.nickname = player['nickname'];
        this.nicknamesufix = player['nicknamesufix'];
        this.deleteInput = document.createElement("input");
        this.deleteInput.type = "checkbox";
        this.deleteInput.checked = this.deleteSheet;
        this.promoteInput = document.createElement("input");
        this.promoteInput.type = "checkbox";
        this.promoteInput.checked = this.promoteSheet;
        this.editInput = document.createElement("input");
        this.editInput.type = "checkbox";
        this.editInput.checked = this.editSheet;
        this.viewInput = document.createElement("input");
        this.viewInput.type = "checkbox";
        this.viewInput.checked = this.viewSheet;
    }
    SheetPermRow.prototype.exportPrivileges = function () {
        var obj = {
            userid: this.userId,
            deletar: this.deleteInput.checked,
            editar: this.editInput.checked,
            visualizar: this.viewInput.checked,
            promote: this.promoteInput.checked
        };
        return obj;
    };
    SheetPermRow.prototype.getHTML = function () {
        // %p.sheetPermRow
        //     momo#0000
        //     %label.sheetPermLabel.language
        //     %input.sheetPermCheckbox{:type=>"checkbox"}
        //     _SHEETPERMISSIONVIEW_
        //     %label.sheetPermLabel.language
        //     %input.sheetPermCheckbox{:type=>"checkbox"}
        //     _SHEETPERMISSIONEDIT_
        //     %label.sheetPermLabel.language
        //     %input.sheetPermCheckbox{:type=>"checkbox"}
        //     _SHEETPERMISSIONDELETE_
        var p = document.createElement("p");
        p.classList.add("sheetPermRow");
        p.appendChild(document.createTextNode(this.nickname + "#" + this.nicknamesufix));
        var viewLabel = document.createElement("label");
        viewLabel.classList.add("language");
        viewLabel.classList.add("sheetPermLabel");
        viewLabel.appendChild(document.createTextNode("_SHEETPERMISSIONVIEW_"));
        viewLabel.appendChild(this.viewInput);
        p.appendChild(viewLabel);
        var editLabel = document.createElement("label");
        editLabel.classList.add("language");
        editLabel.classList.add("sheetPermLabel");
        editLabel.appendChild(document.createTextNode("_SHEETPERMISSIONEDIT_"));
        editLabel.appendChild(this.editInput);
        p.appendChild(editLabel);
        // var deleteLabel = document.createElement("label");
        // deleteLabel.classList.add("language");
        // deleteLabel.classList.add("sheetPermLabel");
        // deleteLabel.appendChild(document.createTextNode("_SHEETPERMISSIONDELETE_"));
        // deleteLabel.appendChild(this.deleteInput);
        // p.appendChild(deleteLabel);
        // var promoteLabel = document.createElement("label");
        // promoteLabel.classList.add("language");
        // promoteLabel.classList.add("sheetPermLabel");
        // promoteLabel.appendChild(document.createTextNode("_SHEETPERMISSIONPROMOTE_"));
        // promoteLabel.appendChild(this.promoteInput);
        // p.appendChild(promoteLabel);
        UI.Language.updateScreen(p);
        return p;
    };
    return SheetPermRow;
}());
var SoundsRow = /** @class */ (function () {
    function SoundsRow(snd, folder) {
        this.folder = folder;
        this.sound = snd;
        var soundContainer = document.createElement("div");
        soundContainer.classList.add("imagesRow");
        // SHARE
        var shareButton = document.createElement("a");
        shareButton.classList.add("imagesLeftButton");
        shareButton.classList.add("icons-imagesShare");
        UI.Language.addLanguageTitle(shareButton, "_IMAGESSHARE_");
        shareButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.share();
            }
        });
        // VIEW
        var viewButton = document.createElement("a");
        viewButton.classList.add("imagesLeftButton");
        viewButton.classList.add("icons-soundsPlay");
        UI.Language.addLanguageTitle(viewButton, "_SOUNDSPLAY_");
        viewButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.play();
            }
        });
        // PERSONA
        var personaButton = document.createElement("a");
        personaButton.classList.add("imagesLeftButton");
        personaButton.classList.add("icons-imagesPersona");
        UI.Language.addLanguageTitle(personaButton, "_IMAGESPERSONA_");
        personaButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.usePersona();
            }
        });
        // DELETE
        var deleteButton = document.createElement("a");
        deleteButton.classList.add("imagesRightButton");
        deleteButton.classList.add("icons-imagesDelete");
        UI.Language.addLanguageTitle(deleteButton, "_IMAGESDELETE_");
        deleteButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.delete();
            }
        });
        // RENAME
        var renameButton = document.createElement("a");
        renameButton.classList.add("imagesRightButton");
        renameButton.classList.add("icons-imagesRename");
        UI.Language.addLanguageTitle(renameButton, "_SOUNDSRENAME_");
        renameButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.rename();
            }
        });
        // FOLDER
        var folderButton = document.createElement("a");
        folderButton.classList.add("imagesRightButton");
        folderButton.classList.add("icons-imagesFolder");
        UI.Language.addLanguageTitle(folderButton, "_SOUNDSFOLDER_");
        folderButton.addEventListener("click", {
            row: this,
            handleEvent: function () {
                this.row.renameFolder();
            }
        });
        var imageTitle = document.createElement("a");
        imageTitle.classList.add("imagesRowTitle");
        var nameNode = document.createTextNode(this.sound.getName());
        imageTitle.appendChild(nameNode);
        this.nameNode = nameNode;
        UI.Language.markLanguage(shareButton, viewButton, personaButton, deleteButton, renameButton, folderButton);
        soundContainer.appendChild(shareButton);
        soundContainer.appendChild(viewButton);
        soundContainer.appendChild(deleteButton);
        soundContainer.appendChild(renameButton);
        soundContainer.appendChild(folderButton);
        soundContainer.appendChild(imageTitle);
        this.html = soundContainer;
    }
    //     .imagesRow
    //         %a.imagesLeftButton.icons-imagesShare
    //         %a.imagesLeftButton.icons-imagesView
    //         %a.imagesLeftButton.icons-imagesPersona
    //         %a.imagesRightButton.icons-imagesDelete
    //         %a.imagesRightButton.icons-imagesRename
    //         %a.imagesRightButton.icons-imagesFolder
    //         %a.imagesRowTitle="Nome da Imagem"
    SoundsRow.prototype.play = function () {
        if (this.sound.isBgm()) {
            UI.SoundController.playBGM(this.sound.getLink());
        }
        else {
            UI.SoundController.playSE(this.sound.getLink());
        }
    };
    SoundsRow.prototype.share = function () {
        if (this.sound.isBgm()) {
            MessageBGM.shareLink(this.sound.getName(), this.sound.getLink());
        }
        else {
            MessageSE.shareLink(this.sound.getName(), this.sound.getLink());
        }
    };
    SoundsRow.prototype.delete = function () {
        this.html.parentElement.removeChild(this.html);
        this.folder.considerSuicide();
        DB.SoundDB.removeSound(this.sound);
    };
    SoundsRow.prototype.renameFolder = function () {
        UI.Sounds.stayInFolder(this.sound.getFolder());
        var newName = prompt(UI.Language.getLanguage().getLingo("_SOUNDSRENAMEFOLDERPROMPT_", { languagea: this.sound.getName(), languageb: this.sound.getFolder() }));
        if (newName === null) {
            return;
        }
        this.sound.setFolder(newName.trim());
        UI.Sounds.printSounds();
    };
    SoundsRow.prototype.rename = function () {
        var newName = prompt(UI.Language.getLanguage().getLingo("_SOUNDSRENAMEPROMPT_", { languagea: this.sound.getName() }));
        if (newName === null || newName === "") {
            return;
        }
        this.sound.setName(newName);
        this.nameNode.nodeValue = this.sound.getName();
    };
    SoundsRow.prototype.getHTML = function () {
        return this.html;
    };
    return SoundsRow;
}());
var SoundsFolder = /** @class */ (function () {
    // .imagesFolder
    //     %a.imagesFolderIcon
    //     %span.imagesFolderTitle{:onclick => "this.parentNode.classList.toggle('folderOpen');"}="Nome da Pasta"
    function SoundsFolder(sounds) {
        var _this = this;
        var folderName = sounds[0].getFolder();
        this.name = folderName;
        if (folderName === "") {
            folderName = UI.Language.getLanguage().getLingo("_SOUNDSNOFOLDERNAME_");
        }
        var folderContainer = document.createElement("div");
        folderContainer.classList.add("imagesFolder");
        this.folderContainer = folderContainer;
        var folderIcon = document.createElement("a");
        folderIcon.classList.add("imagesFolderIcon");
        var deleteIcon = document.createElement("a");
        deleteIcon.classList.add("icons-imagesDelete");
        deleteIcon.classList.add("folderRightButton");
        deleteIcon.addEventListener("click", function () { _this.delete(); });
        UI.Language.addLanguageTitle(deleteIcon, "_IMAGESDELETE_");
        UI.Language.markLanguage(deleteIcon);
        var folderTitle = document.createElement("span");
        folderTitle.classList.add("imagesFolderTitle");
        folderTitle.addEventListener("click", {
            folder: this,
            handleEvent: function () {
                this.folder.toggle();
            }
        });
        folderTitle.appendChild(document.createTextNode(folderName));
        folderContainer.appendChild(folderIcon);
        folderContainer.appendChild(deleteIcon);
        folderContainer.appendChild(folderTitle);
        for (var k = 0; k < sounds.length; k++) {
            var soundRow = new SoundsRow(sounds[k], this);
            folderContainer.appendChild(soundRow.getHTML());
        }
        this.html = folderContainer;
    }
    SoundsFolder.prototype.getName = function () {
        return this.name;
    };
    SoundsFolder.prototype.open = function () {
        this.folderContainer.classList.add("folderOpen");
    };
    SoundsFolder.prototype.toggle = function () {
        this.folderContainer.classList.toggle("folderOpen");
        if (this.folderContainer.classList.contains("folderOpen")) {
            UI.Images.stayInFolder(this.name);
        }
    };
    SoundsFolder.prototype.delete = function () {
        var text = UI.Language.getLanguage().getLingo("_DELETEFOLDER_", { languagea: this.getName() });
        if (confirm(text)) {
            DB.SoundDB.removeFolder(this.getName());
            this.html.parentElement.removeChild(this.html);
        }
    };
    SoundsFolder.prototype.getHTML = function () {
        return this.html;
    };
    SoundsFolder.prototype.considerSuicide = function () {
        if (this.html.children.length <= 2) {
            this.html.parentElement.removeChild(this.html);
        }
    };
    return SoundsFolder;
}());
var SheetTab = /** @class */ (function () {
    function SheetTab(sheet) {
        this.div = document.createElement("div");
        this.text = document.createTextNode("");
        this.sheet = sheet;
        this.div.classList.add("sheetTab");
        this.div.appendChild(this.text);
        this.div.addEventListener("click", {
            tab: this,
            handleEvent: function (e) {
                e.preventDefault();
                this.tab.click();
            }
        });
        sheet.addChangeListener({
            tab: this,
            handleEvent: function () {
                this.tab.checkNPCStatus();
                this.tab.updateName();
            }
        });
        this.checkNPCStatus();
        this.updateName();
    }
    SheetTab.prototype.updateName = function () {
        this.text.nodeValue = this.sheet.getName();
    };
    SheetTab.prototype.checkNPCStatus = function () {
        // var player = this.sheet.getValue("Player") !== undefined ? this.sheet.getValue("Player") :
        //                 this.sheet.getValue("Jogador") !== undefined ? this.sheet.getValue("Jogador") :
        //                     this.sheet.getValue("Owner") !== undefined ? this.sheet.getValue("Owner") :
        //                         this.sheet.getValue("Dono") !== undefined ? this.sheet.getValue("Dono") :
        //                             undefined;
        // if (player !== undefined && player.toUpperCase() === "NPC") {
        if (this.sheet.isNPC()) {
            this.toggleNpc();
        }
        else {
            this.toggleCharacter();
        }
    };
    SheetTab.prototype.getHTML = function () {
        return this.div;
    };
    SheetTab.prototype.toggleNpc = function () {
        this.div.classList.remove("character");
    };
    SheetTab.prototype.toggleCharacter = function () {
        this.div.classList.add("character");
    };
    SheetTab.prototype.toggleOn = function () {
        this.div.classList.add("toggled");
    };
    SheetTab.prototype.toggleOff = function () {
        this.div.classList.remove("toggled");
    };
    SheetTab.prototype.click = function () {
        UI.Sheets.SheetManager.openSheet(this.sheet);
    };
    return SheetTab;
}());
// Ancient
(new PseudoLanguage("Ancient"))
    .addSyllabi(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"])
    .addNumbers(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    .setAllowPoints(false)
    .setLowerCase(true);
(new PseudoLanguage("Animal"))
    .addLetters(['u', 'r', 'a', 'n', 'm', 'g'])
    .addSyllabi(['u', 'r', 'a', 'n', 'w', ' grr! ', ' rarr! ', 'rawr ', 'mmf', 'pamf', 'pant', 'rrrr', 'rrrrrrr', 'eeep', 'uk', 'karr!', 'uff', 'off', 'aff', 'snif', 'puff', 'roar!', 'raar', 'mmmm', 'ghhh', 'kak', 'kok', 'grr ', 'year', 'yor', 'caaaar', 'urr', 'uru! ', 'muu', 'up', 'uup', 'oap', ' rrrraawr ', 'mip', 'iap', 'ap'])
    .setRandomizeNumbers(false)
    .setAllowPoints(false)
    .setLowerCase(true);
(new PseudoLanguage("Abyssal"))
    .addLetters(['x', 'y', 'e', 'a', 'g', 'o'])
    .addSyllabi(['x', 'y', 'e', 'a', 'g', 'o', 'za', 'xy', 'go', 'ua', 'ka', 're', 'te', 'la', 'az', 'rruk', 'kar', 'mra', 'gak', 'zar', 'tra', 'maz', 'okra', 'zzar', 'kada', 'zaxy', 'drab', 'rikk', 'belam', 'rraka', 'ashaj', 'zannk', 'xalah', 'rruk', 'kar', 'mra', 'gak', 'zar', 'tra', 'maz', 'za', 'xy', 'go', 'ua', 'ka', 're', 'te', 'la', 'az', 'x', 'y', 'e', 'a', 'g', 'o'])
    .addNumbers(['ia', 'ori', 'eri', 'dara', 'iru', 'taro', 'cace', 'zori', 'xash', 'rura'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false)
    .addStaticWord(["anjo", "yuqun", "angel"], "soran")
    .addStaticWord(["sacrificio", "sacrifice"], "gakzakada")
    .addStaticWord(['calor', 'quente', 'fogo', 'chama', 'flamejante', 'chamas', 'fogos'], "burah")
    .addStaticWord(["humano", "humano", "human"], "aman")
    .addStaticWord(["inferno", "infernal", "hell", 'hellish'], "zennshinagas")
    .addStaticWord(["demonio", "capeta", "diabo", 'devil', 'demon'], "zennshi");
(new PseudoLanguage("Aquon"))
    .addLetters(['a', 'e', 'i'])
    .addSyllabi(['laren', 'sare', 'elane', 'alena', 'leair', 'le', 'li', 'la', 'a', 'e', 'i', 'lessa', 'saril ', 'quissa', 'sarte', 'tassi', 'selasse', 'atoloran', 'tiran', 'quilara', 'assiassi', 'lessa', 'saril ', 'quissa', 'sarte', 'tassi', 'selasse', 'laren', 'sare', 'elane', 'alena', 'leair', 'le', 'li', 'la', 'a', 'e', 'i'])
    .addNumbers(['on', 'liss', 'diss', 'tiss', 'quass', 'ciss', 'siss', 'sess', 'oiss', 'niss'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false)
    .addStaticWord(["terra", "piso", "chao", "superficie", "ground", "floor"], "tassela")
    .addStaticWord(["terrestre", "inimigo", "adversario", "inimigos", "adversarios", "oponente", "oponentes", "enemy", "enemies", "opponent", "opponents"], "tasselarane")
    .addStaticWord(["mar", "oceano", "rio", "ocean", "river"], "quill")
    .addStaticWord(["aquatico", "aquatic", "amigo", "friend", "amigos", "friend"], "quillarine")
    .addStaticWord(["agua", "sagrado", "sacred", "water"], "quell")
    .addStaticWord(["amante", "adorador", "lover", "admirer"], "sir")
    .addStaticWord(["gloria", "honra", "virtude", "glory", "honor", "virtue"], "salara")
    .addStaticWord(["rei", "soberano", "monarca", "king", "sovereign", "monarch"], "quellsalara")
    .addStaticWord(["el'zel", "elzel", "el'zels", 'elzels'], "selarane")
    .addStaticWord(["elfo", "elfos", 'elf', 'elves', 'elfes'], "setarane")
    .addStaticWord(["humano", "human"], "talarane");
(new PseudoLanguage("Arcana"))
    .addLetters(['a', 'o', 'z', 'c'])
    .addSyllabi(['a', 'o', 'z', 'c', 'xa', 'nu', 'da', 'xi', 'li', 'xie', 'uru', 'ara', ' naa', 'ean', ' zha', 'zhi', 'xin', 'xan', 'chu', 'ran', 'nan', 'zan', 'ron', 'wanv', 'haov', 'chan', 'chun', 'chen', 'zhen', 'zhan', 'shie', 'yong', 'xing', 'kafe', 'zazado', 'kafel', 'xinzhao', 'mengtah', 'mengzha', 'len shi', 'qibong', 'qubhan', 'quzhan', 'qizhao', 'wanv', 'haov', 'chan', 'chun', 'chen', 'zhen', 'zhan', 'shie', 'yong', 'xing', 'kafe', 'xa', 'nu', 'da', 'xi', 'li', 'xie', 'uru', 'ara', 'naa', 'ean', 'zha', 'zhi', 'xin', 'xan', 'chu', 'ran', 'nan', 'zan', 'ron', 'a', 'o', 'z', 'c'])
    .addNumbers(['lin', 'i', 'e', 'sa', 'si', 'wu', 'liu', 'qi', 'ba', 'ju'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false)
    .addStaticWord(["coisa", "coisas", "treco", "trecos", "bad", "terrible"], "yu mo")
    .addStaticWord(["thing", "things", "ruim", "ruins", "maligno", "malignos"], "gui gwai")
    .addStaticWord(["vai", "cai", "va", "go", "get"], "fai")
    .addStaticWord(["away", "far", "embora", "fora"], "di zao")
    .addStaticWord(["agua", "water", "traga", "bring"], "lai")
    .addStaticWord(["aconteca", "occur", "venha", "come", "happen", "flood"], "shui zai");
(new PseudoLanguage("Arkadium"))
    .addLetters(['h', 'a', 'n', 'i', 'e'])
    .addSyllabi(['h', 'a', 'n', 'i', 'e', 'no', 'ko', 'ta', 'ain', 'nah', 'roi', 'shu', 'kon', 'ishi', 'temi', 'poto', 'taan', 'kain', 'treja', 'nizui', 'boron', 'hazoi', 'lamaf', 'ishi', 'temi', 'poto', 'taan', 'kain', 'no', 'ko', 'ta', 'ain', 'nah', 'roi', 'shu', 'kon', 'h', 'a', 'n', 'i', 'e'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
(new PseudoLanguage("Auran"))
    .addLetters(['o', 'k', 's', 'i', 'a', 'm'])
    .addSyllabi(['o', 'k', 's', 'i', 'a', 'm', 'me', 'ra', 'lo', 'fu', 'je', 'kin', 'zoh', 'jao', 'nen', 'has', 'mewa', 'waon', 'kerl', 'nomu', 'qolt', 'kin', 'zoh', 'jao', 'nen', 'has', 'me', 'ra', 'lo', 'fu', 'je', 'o', 'k', 's', 'i', 'a', 'm'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
// Ancient
(new PseudoLanguage("Binary"))
    .addSyllabi(['.', '-', '!', "+", "#", "|", "\\", "/", "<", ">", "$", "%", ".", "-", ".", "-", ".", "-", ".", "-", "¢", "%", "@", "?", ":", ";"])
    .addNumbers(["0", "1", "00", "01", "10", "11", "000", "001", "010", "011", "100", "101", "110", "111"])
    .setAllowPoints(false)
    .setRandomizeNumbers(true)
    .setLowerCase(true);
(new PseudoLanguage("Celestan"))
    .addLetters(['z', 'i', 'h', 'k', 'u'])
    .addSyllabi(['z', 'i', 'h', 'k', 'u', 'ul', 'ha', 'ko', 'ia', 'ez', 'oh', 'moh', 'lea', 'sha', 'lok', 'tae', 'zaha', 'ohta', 'baos', 'naia', 'ezoh', 'zaha', 'ohta', 'baos', 'naia', 'ezoh', 'moh', 'lea', 'sha', 'lok', 'tae', 'ul', 'ha', 'ko', 'ia', 'ez', 'oh', 'z', 'i', 'h', 'k', 'u'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
(new PseudoLanguage("Davek"))
    .addLetters(['d', 'k', 'e', 'a', 'u'])
    .addSyllabi(['d', 'k', 'e', 'a', 'u', 'bu', 'ka', 'ce', 'ke', 'ko', 'za', 'ik', 'ep', 'pa', 'na', 'ma', 'pe', 'kok', 'kek', 'iek', 'cea', 'sok', 'ask', 'pok', 'pak', 'rak', 'rok', 'ruh', 'ruk', 'ram', 'ran', 'rae', 'era', 'ero', 'erp', 'doko', 'pika', 'paek', 'caeo', 'peao', 'pako', 'poka', 'mako', 'zako', 'zado', 'edo', 'akad', 'miko', 'adek', 'edao', 'emaop', 'edaki', 'pedak', 'pokad', 'emako', 'pokad', 'rakza', 'edoru', 'akara', 'iekpa', 'dokok', 'ceape', 'mikora', 'erada', 'erpad', 'jukoa', 'kodoko', 'pikace', 'peaika', 'pakpoka', 'rokzado', 'maedoru', 'akarape', 'epask', 'dokoran', 'doko', 'pika', 'paek', 'caeo', 'peao', 'pako', 'poka', 'mako', 'zako', 'zado', 'edo', 'akad', 'miko', 'adek', 'edao', 'kok', 'kek', 'iek', 'cea', 'sok', 'ask', 'pok', 'pak', 'rak', 'rok', 'ruh', 'ruk', 'ram', 'ran', 'rae', 'era', 'ero', 'erp', 'bu', 'ka', 'ce', 'ke', 'ko', 'za', 'ik', 'ep', 'pa', 'na', 'ma', 'pe'])
    .addNumbers(['o', 'u', 'uti', 'tia', 'sa', 'mi', 'ota', 'su', 'kaata', 'lhus'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
(new PseudoLanguage("Draconic"))
    .addLetters(['i', 'e', 'u', 'a'])
    .addSyllabi(['vi', 'si', 'fe', 'sh', 'ix', 'ur', 'wux ', 'vah', 'veh', 'vee', 'ios', 'irsa', 'rerk', 'xsio ', 'axun', 'yrev', 'ithil', 'creic', "ecer", 'direx', 'dout', 'yrev', 'ibleuailt', 'virax', 'mrrandiina', 'whedab', 'bekisnhlekil', 'rerk', 'xsio ', 'axun', 'yrev', 'ithil', 'creic', 'wux ', 'vah', 'veh', 'vee', 'ios', 'irsa', 'vi', 'si', 'fe', 'sh', 'ix', 'ur'])
    .addNumbers(['zerr ', 'ir ', 'jiil ', 'fogah ', 'vrrar ', 'jlatak ', 'jiko ', 'vakil ', 'supri ', 'wlekjr '])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false)
    .addStaticWord(["dragao", 'dragon', 'dragoes', 'dragons'], "darastrix")
    .addStaticWord(["companheiro", 'companheiros', 'amigo', 'amigos', 'aliado', 'aliados', 'friend', 'friends', 'partner'], "thurirl")
    .addStaticWord(['escamas', 'escama', 'scale', 'scales'], "ternocki")
    .addStaticWord(["pele", 'skin'], "molicki")
    .addStaticWord(["medo", "pavor", "temor", "horror", "fear"], "l'gra")
    .addStaticWord(["humano", "humanos", "human", "humans"], "munthrek")
    .addStaticWord(["humanidade", "humanity"], "munthrak");
(new PseudoLanguage("Elvish"))
    .addStaticWord(["elfos", "elfas", "elves"], "el'ar")
    .addStaticWord(["passaro", "ave", "passarinho", "bird"], "simuh")
    .addStaticWord(["ha", "hah", "he", "heh", "hehe", "haha", "heheh", "hahah", "hehehe", "hahaha"], "hehe")
    .addStaticWord(["alegria", "felicidade", "joy", "happiness"], "luria")
    .addStaticWord(["rapido", "veloz", "velocidade", "fast", "speedy", "speed"], "lerast")
    .addStaticWord(["lama", "barro", "mud", "clay"], "vehal")
    .addStaticWord(["curar", "sarar", "heal"], "fahin")
    .addStaticWord(["bruxa", "feiticeira", "maga", "witch", "wizard", "mage"], "amuhn")
    .addStaticWord(["esperanca", "hope"], "elain")
    .addStaticWord(["falso", "fake", "falsos", "fakes"], "el'zel")
    .addStaticWord(["elf", "elfo", "elfa"], "el'um")
    .addStaticWord(["azul", "azulado"], "luin")
    .addStaticWord(["inimigo", "inimigos", "adversário", "adversários", "adversario", "adversarios"], "zallon")
    .addStaticWord(["amigo", "compadre", "camarada", "amigos", "camaradas", "compadres", "aliado", "aliados"], "mellon")
    .addStaticWord(['alto', 'grande'], 'tar')
    .addStaticWord(["verao", "summer"], "laer")
    .addStaticWord(["coragem", "confianca", "bravery"], "thalias")
    .addStaticWord(["letra", "letras", "letter", "letters"], "tenwar")
    .addStaticWord(["calor", "quente", "fogo", "chama", "flamejante", "chamas", "fogos"], "uloloki")
    .addNumbers(['o', 'u', 'uli', 'lia', 'sa', 'mi', 'ola', 'su', 'kaala', 'thus'])
    .addLetters(['a', 'i', 'e'])
    .addShortWords(['ae', 'ea', 'lae', 'lea', 'mia', 'thal', 'maae', 'leah', 'tea', 'ma', 'da', 'le', 'li', 'ta', 'te', 'ia', 'io'])
    .addSyllabi(['el', 'shal', 'shel', 'ae', 'ea', 'lae', 'lea', 'mia', 'thal', 'maae', 'leah', 'tea', 'ma', 'da', 'le', 'li', 'ta', 'te', 'ia', 'io', 'a', 'i', 'e', 'ri', 'v', 'ss', 's', 'rh', 't', 'q', 'r', 'h', 'hw', 'w', 'ng', 'li', 'lo', 'sha', 'bel', 'annah'])
    .addStaticWord(['calor', 'quente', 'fogo', 'chama', 'flamejante', 'chamas', 'fogos'], "uloloki")
    .getSyllableCustom = function () {
    if (this.currentTranslation.length < 1 || this.currentWord.length < 4 || (this.currentWord.length - this.currentTranslation.length) < 3) {
        return null;
    }
    if ((this.currentTranslation.charAt(this.currentTranslation.length - 1) === "l"
        || this.currentTranslation.charAt(this.currentTranslation.length - 1) === "h")
        && ((this.usedSyllable.indexOf("'") === -1 && this.chance(95)) || this.chance(5))) {
        return "'";
    }
    if ((this.currentTranslation.charAt(this.currentTranslation.length - 1) === "e"
        || this.currentTranslation.charAt(this.currentTranslation.length - 1) === "a")
        && ((this.usedSyllable.indexOf("'") === -1 && this.chance(40)) || this.chance(20))) {
        return "'";
    }
    if (this.usedSyllable.indexOf("'") === -1 && this.chance(15)) {
        return "'";
    }
    return null;
};
(new PseudoLanguage("Ellum"))
    .addLetters(['a', 'i', 'e'])
    .addSyllabi(['a', 'i', 'e', 'ae', 'ea', 'tae', 'cea', 'mia', 'lhat', 'maae', 'teah', 'lea', 'ma', 'da', 'te', 'ti', 'la', 'le', 'ia', 'io', "a'ta", 'eu', 'maari', 'eaal', 'lentar', 'umit', 'matas', 'nitas', 'vaata', 'miu', 'lhea', 'lhao', 'bae', 'dia', "e'tud", "mi'laet", 'tussia', 'lamita', 'tavia', 'mera', 'tiaah', 'paatvas', 'mata', 'lhata', 'looa', 'lheia', "tu'lhanis", "lo'meera", "lha'vatsar", 'lotetslraz', 'awynn', 'tissanas', 'otaamiss', 'lovatsar', 'mataasa', 'lhotad', "lhatiassu", "teeramas", "su'diet", "mi'dhanas", "lhashama", "tiriana", "tuinassa", "tae'missa", "lhot'vana", "sahmita", "milrusata", "toriema", "lotisava", "e'tud", "mi'laet", 'tussia', 'lamita', 'tavia', 'mera', 'tiaah', 'paatvas', 'mata', 'lhata', 'looa', 'lheia', "a'ta", 'eu', 'maari', 'eaal', 'lentar', 'umit', 'matas', 'nitas', 'vaata', 'miu', 'lhea', 'lhao', 'bae', 'dia', 'ae', 'ea', 'tae', 'cea', 'mia', 'lhat', 'maae', 'teah', 'lea', 'ma', 'da', 'te', 'ti', 'la', 'le', 'ia', 'io', 'a', 'i', 'e'])
    .addNumbers(['o', 'u', 'uti', 'tia', 'sa', 'mi', 'ota', 'su', 'kaata', 'lhus'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
// Language of the Banana Kingdom
(new PseudoLanguage("Mankiki"))
    .addNumbers(["ba", "na", "na", "ba", "na", "na", "ba", "na", "na", "ba"])
    .addLetters(["a"])
    .addShortWords(["ba", "na"])
    .addSyllabi(["ba", "na"])
    .addStaticWord(["banana"], "pneumoultramicroscopicossilicovulcanoconiotico")
    .getSyllableCustom = function () {
    if (this.currentTranslation === "" && this.chance(80)) {
        return "ba";
    }
    else if (this.currentTranslation === "ba" && this.chance(80)) {
        return "na";
    }
    else if (this.currentTranslation === "bana" && this.chance(80)) {
        return "na";
    }
    else if (this.currentTranslation === "banana" && this.chance(80)) {
        return " ";
    }
    return null;
};
// Magraki
(new PseudoLanguage("Magraki"))
    .addLetters(['a', 'u', 'k', 'c', 'e'])
    .addSyllabi(['a', 'u', 'k', 'c', 'e', 'ek', 'uk', 'tu', 'ob', 'zug', 'va', 'ruk', 'gra', 'mog', 'zuk', 'xar', 'zaga', 'garo', 'xhok', 'teba', 'nogu', 'uruk', 'ruk', 'gra', 'mog', 'zuk', 'xar', 'ek', 'uk', 'tu', 'ob', 'zug', 'va', 'a', 'u', 'k', 'c', 'e'])
    .addNumbers(['a', 'u', 'k', 'c', 'e'])
    .setRandomizeNumbers(true)
    .setAllowPoints(true)
    .setLowerCase(false)
    .addStaticWord(["matar", "mate", "massacre", "death"], "khazzog")
    .addStaticWord(["amigo", "compadre", "camarada"], "mogtuban")
    .addStaticWord(["oi", "olá", "ola", "hello"], "loktorok")
    .addStaticWord(["atacar", "ataque", "destruir", "destrua", "attack"], "maguna")
    .addStaticWord(["heroi", "herói", "salvador", "hero"], "grom")
    .addStaticWord(["hehe", "he", "heh", "ha", "haha", "hah", "lol", "lmao", "rofl", "roflmao"], "kek")
    .addStaticWord(["hehehe", "hahaha", "hahah", "heheh", "hahahah", "heheheh"], "kekek")
    .addStaticWord(["orc", "ork"], "bubu")
    .addStaticWord(["orcs", "orks"], "bubus")
    .addStaticWord(["orcish", "orkish", "orqish", "orques", "orques", "orkes", "orkes"], "bubugo");
(new PseudoLanguage("Natrum"))
    .addLetters(['i', 'j', 'a', 'o', 'u', 'y'])
    .addSyllabi(['i', 'j', 'a', 'o', 'u', 'y', '-', 'en', 'er', 'i', 'ir', 'j', 'na', 'ma', 'ur', 'yl', 'aiga', 'draum', 'gaf', 'gorak', 'hennar', 'ormar', 'saman', 'warin', 'barmjor', 'eltzi', 'gunronir', 'thalandor', 'yirindir', 'iemnarar', 'normnundor', 'melgandark', 'sunnarsta', 'villnorer', 'znorud', 'barmjor', 'eltzi', 'gunronir', 'thalandor', 'yirindir', 'aiga', 'draum', 'gaf', 'gorak', 'hennar', 'ormar', 'saman', 'warin', 'en', 'er', 'i', 'ir', 'j', 'na', 'ma', 'ur', 'yl'])
    .addNumbers(['ein', 'tvein', 'trir', 'fjor', 'fimm', 'seks', 'syv', 'otte', 'niu', 'tiu'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
(new PseudoLanguage("Technum"))
    .addLetters(['n', 'e', 'i', 'k', 'a'])
    .addSyllabi(['n', 'e', 'i', 'k', 'a', 'ok', 'un', 'ac', 'hal', 'sub', 'fyi', 'hym', 'cmp', 'vaal', 'hyss', 'lrok', 'gfun', 'jyin', 'netak', 'urmin', 'kvyan', 'trekt', 'pvnum', 'tkmkrok', 'ncallat', 'khstrat', 'meknym', 'snwyhok'])
    .setRandomizeNumbers(false)
    .setAllowPoints(true)
    .setLowerCase(false);
/// <reference path='Ancient.ts' />
/// <reference path='Animal.ts' />
/// <reference path='Abyssal.ts' />
/// <reference path='Aquon.ts' />
/// <reference path='Arcana.ts' />
/// <reference path='Arkadium.ts' />
/// <reference path='Auran.ts' />
/// <reference path='Binary.ts' />
/// <reference path='Celestan.ts' />
/// <reference path='Davek.ts' />
/// <reference path='Draconic.ts' />
/// <reference path='Elvish.ts' />
/// <reference path='Ellum.ts' />
/// <reference path='Mankiki.ts' />
/// <reference path='Magraki.ts' />
/// <reference path='Natrum.ts' />
/// <reference path='Technum.ts' />
var SheetStyle = /** @class */ (function () {
    function SheetStyle(style) {
        this.css = document.createElement("style");
        this.visible = document.createElement("div");
        this.$visible = $(this.visible);
        this.styleInstance = null;
        this.sheetInstance = null;
        this.sheet = null;
        this.sheetChangeTrigger = new Trigger();
        this.loading = false;
        this.counter = 0;
        this.triggeredVariables = [];
        this.nameVariable = null;
        this.creatorListeners = [];
        this.sheetInstanceChangeListener = {
            style: this,
            handleEvent: function (sheetInstance) {
                if (this.style.sheetInstance === sheetInstance) {
                    this.style.reloadSheetInstance();
                }
            }
        };
        this.sheetInstanceChangeTrigger = new Trigger();
        var _startTime = (new Date()).getTime();
        this.styleInstance = style;
        this.fillElements();
        this.createSheet();
        this.bindSheet();
        this.checkNPC();
        var _endTime = (new Date()).getTime();
        console.debug("[SheetStyle] " + this.getName() + "'s processing took " + (_endTime - _startTime) + "ms to process.");
    }
    SheetStyle.prototype.addSheetInstanceChangeListener = function (f) {
        this.sheetInstanceChangeTrigger.addListenerIfMissing(f);
    };
    SheetStyle.prototype.stringToType = function (str) {
        return str.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
    };
    SheetStyle.prototype.isEditable = function () {
        return this.sheetInstance !== null && this.sheetInstance.isEditable();
    };
    /**
     * This function needs to be rewritten anytime a Style has custom types.
     * @param kind = string, "Sheet" | "SheetButton" | "SheetList"
     * @param type = string, "text" | "number"
     * @param def = string, default id
     * @returns {typeof Sheet | typeof SheetButton | typeof SheetList}
     */
    SheetStyle.prototype.getCreator = function (kind, type, def) {
        var name = kind + this.stringToType(type);
        if (eval("typeof " + name) === "function") {
            return eval(name);
        }
        return eval(kind + def);
    };
    SheetStyle.prototype.getSheet = function () {
        return this.sheet;
    };
    SheetStyle.prototype.addCreatorListener = function (obj) {
        this.creatorListeners.push(obj);
    };
    SheetStyle.prototype.triggerCreatorListeners = function () {
        this.creatorListeners.forEach(function (creator) {
            creator.complete();
        });
    };
    SheetStyle.prototype.addSheetInstance = function (sheet) {
        if (this.sheetInstance !== null) {
            this.unbindSheetInstance();
        }
        this.sheetInstance = sheet;
        this.bindSheetInstance();
        this.reloadSheetInstance();
    };
    SheetStyle.prototype.reloadSheetInstance = function () {
        this.loading = true;
        if (this.nameVariable !== null) {
            this.nameVariable.storeValue(this.sheetInstance.getName());
        }
        this.sheet.updateFromObject(this.sheetInstance.getValues());
        this.triggerAllVariables();
        this.checkNPC();
        this.loading = false;
        this.sheetInstanceChangeTrigger.trigger();
    };
    SheetStyle.prototype.checkNPC = function () {
        if (this.sheetInstance !== null && this.sheetInstance.isNPC()) {
            this.visible.classList.add("npctype");
            this.visible.classList.remove("charactertype");
        }
        else {
            this.visible.classList.remove("npctype");
            this.visible.classList.add("charactertype");
        }
    };
    SheetStyle.prototype.triggerAllVariables = function () {
        var counter = this.getCounter();
        for (var i = 0; i < this.triggeredVariables.length; i++) {
            this.triggeredVariables[i].triggerChange(counter);
        }
        this.triggeredVariables = [];
    };
    SheetStyle.prototype.triggerVariableChange = function (variable) {
        if (this.loading) {
            if (this.triggeredVariables.indexOf(variable) === -1) {
                this.triggeredVariables.push(variable);
            }
        }
        else {
            variable.triggerChange(this.getCounter());
        }
    };
    SheetStyle.prototype.getCounter = function () {
        return this.counter++;
    };
    SheetStyle.prototype.bindSheetInstance = function () {
        this.sheetInstance.addChangeListener(this.sheetInstanceChangeListener);
    };
    SheetStyle.prototype.unbindSheetInstance = function () {
        this.sheetInstance.removeChangeListener(this.sheetInstanceChangeListener);
    };
    SheetStyle.prototype.bindSheet = function () {
        var changeListener = {
            counter: -1,
            handleEvent: function (sheet, style, counter) {
                if (this.counter !== counter) {
                    this.counter = counter;
                    style.updateSheetInstance();
                }
            }
        };
        this.sheet.addChangeListener(changeListener);
    };
    SheetStyle.prototype.getSheetInstance = function () {
        return this.sheetInstance;
    };
    SheetStyle.prototype.updateSheetInstance = function () {
        if (!this.loading) {
            if (this.nameVariable !== null) {
                this.sheetInstance.setName(this.nameVariable.getValue());
            }
            this.sheetInstance.setValues(this.sheet.exportAsObject(), true);
            this.checkNPC();
        }
    };
    SheetStyle.prototype.createSheet = function () {
        this.sheet = new Sheet(this, this, this.visible.childNodes);
        this.triggerCreatorListeners();
    };
    SheetStyle.prototype.fillElements = function () {
        this.visible.innerHTML = this.styleInstance.html;
        this.css.innerHTML = this.styleInstance.css;
    };
    SheetStyle.prototype.getStyleInstance = function () {
        return this.styleInstance;
    };
    SheetStyle.prototype.getId = function () {
        return this.styleInstance.getId();
    };
    SheetStyle.prototype.getName = function () {
        return this.styleInstance.getName();
    };
    /**
     * Return true if the command was accepted, this will cause the Dice to remove the button.
     * Return false if the command was not acceptable. Please print a Chat Message in this case.
     * @param dice
     * @returns {boolean}
     */
    SheetStyle.prototype.doDiceCustom = function (dice) {
        var msg = new ChatSystemMessage(true);
        // Use this message if not implemented
        msg.addText("_CHATMESSAGEDICECUSTOMSTYLENOCUSTOM_");
        // Use this message if invalid dice
        //msg.addText("_CHATMESSAGEDICECUSTOMSTYLEINVALIDCUSTOM_");
        UI.Chat.printElement(msg.getElement());
        return false;
    };
    SheetStyle.prototype.processCommand = function (msg) {
        return false;
    };
    SheetStyle.prototype.getCSS = function () {
        return this.css;
    };
    SheetStyle.prototype.getHTML = function () {
        return this.visible;
    };
    SheetStyle.prototype.createNameVariable = function (sheet, element) {
        this.nameVariable = new SheetVariabletext(sheet, this, element);
        this.nameVariable.addChangeListener({
            counter: -1,
            handleEvent: function (variable, style, counter) {
                if (this.counter !== counter) {
                    style.updateSheetInstance();
                }
            }
        });
    };
    /**
     * This code gets called when a Style is being destroyed. Destroy anything that you created which is not connected to the style.
     */
    SheetStyle.prototype.die = function () {
        this.unbindSheetInstance();
    };
    return SheetStyle;
}());
var SheetStyleTranslatable = /** @class */ (function (_super) {
    __extends(SheetStyleTranslatable, _super);
    function SheetStyleTranslatable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SheetStyleTranslatable.prototype.translateObject = function (obj) {
        for (var key in obj) {
            if (typeof obj[key] === "string" && obj[key].charAt(0) === "_") {
                obj[key] = UI.Language.getLanguage().getLingo(obj[key]);
            }
            else if (typeof obj[key] === "object") {
                obj[key] = this.translateObject(obj[key]);
            }
        }
        return obj;
    };
    SheetStyleTranslatable.prototype.translateSheet = function () {
        var variables = this.visible.getElementsByClassName("sheetVariable");
        for (var i = 0; i < variables.length; i++) {
            // Placeholder Lingo
            if (variables[i].dataset["placeholder"] !== undefined && variables[i].dataset['placeholder'].charAt(0) === "_") {
                variables[i].dataset['placeholder'] = UI.Language.getLanguage().getLingo(variables[i].dataset['placeholder']);
            }
            // Default Lingo
            if (variables[i].dataset['default'] !== undefined && variables[i].dataset['default'].charAt(0) === "_") {
                variables[i].dataset['default'] = UI.Language.getLanguage().getLingo(variables[i].dataset['default']);
            }
        }
        var lists = this.visible.getElementsByClassName("sheetList");
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            var listDefault = list.dataset['default'];
            if (listDefault !== undefined) {
                try {
                    var defaultObj = JSON.parse(listDefault);
                    if (Array.isArray(defaultObj)) {
                        for (var k = 0; k < defaultObj.length; k++) {
                            if (defaultObj[k] instanceof Object) {
                                defaultObj[k] = this.translateObject(defaultObj[k]);
                            }
                        }
                        list.dataset['default'] = JSON.stringify(defaultObj);
                    }
                }
                catch (e) {
                    continue;
                }
            }
        }
        UI.Language.updateScreen(this.visible);
    };
    SheetStyleTranslatable.prototype.fillElements = function () {
        this.visible.innerHTML = this.styleInstance.html;
        this.css.innerHTML = this.styleInstance.css;
        this.translateSheet();
    };
    return SheetStyleTranslatable;
}(SheetStyle));
var Sheet = /** @class */ (function () {
    function Sheet(parent, style, elements) {
        this.parent = null;
        this.style = null;
        this.elements = [];
        this.values = {};
        this.valuesSimplified = {};
        this.indexedLists = [];
        this.buttons = {};
        this.idCounter = 0;
        this.editOnly = [];
        this.changeListener = {
            sheet: this,
            counter: -1,
            handleEvent: function (variable, style, counter) {
                if (counter !== this.counter) {
                    this.counter = counter;
                    this.sheet.considerTriggering();
                }
            }
        };
        /**
         * Alerts interested parties of changes made to this.
         * @type {Trigger}
         */
        this.changeTrigger = new Trigger();
        this.parent = parent;
        this.style = style;
        for (var i = 0; i < elements.length; i++) {
            this.elements.push(elements[i]);
            if (elements[i].nodeType === Node.ELEMENT_NODE) {
                this.processElement(elements[i]);
                var editOnly = elements[i].getElementsByClassName("editOnly");
                for (var i_1 = 0; i_1 < editOnly.length; i_1++) {
                    this.editOnly.push(editOnly[i_1]);
                }
            }
        }
    }
    Sheet.prototype.getField = function (id) {
        if (this.values[id] === undefined) {
            return null;
        }
        return this.values[id];
    };
    Sheet.prototype.findField = function (id) {
        var simplified = Sheet.simplifyString(id);
        if (this.valuesSimplified[simplified] === undefined) {
            return null;
        }
        return this.valuesSimplified[simplified];
    };
    Sheet.prototype.getLists = function () {
        return this.indexedLists;
    };
    Sheet.prototype.updateEditable = function () {
        if (this.style.isEditable()) {
            this.editOnly.forEach(function (element) {
                element.style.display = "";
            });
        }
        else {
            this.editOnly.forEach(function (element) {
                element.style.display = "none";
            });
        }
    };
    Sheet.prototype.getValueFor = function (id) {
        var simplified = Sheet.simplifyString(id);
        if (this.valuesSimplified[simplified] === undefined) {
            for (var i = 0; i < this.indexedLists.length; i++) {
                var list = this.indexedLists[i];
                var value = list.getValueFor(simplified);
                if (!isNaN(value)) {
                    return value;
                }
            }
            return NaN;
        }
        else {
            return this.valuesSimplified[simplified].getValue();
        }
    };
    Sheet.simplifyString = function (str) {
        return str.latinise().toLowerCase().replace(/ /g, '');
    };
    Sheet.prototype.getElements = function () {
        return this.elements;
    };
    Sheet.prototype.getUniqueID = function () {
        return "Var" + (++this.idCounter).toString();
    };
    Sheet.prototype.isRoot = function () {
        return this.parent === this.style;
    };
    Sheet.prototype.getParent = function () {
        return this.parent;
    };
    Sheet.prototype.reset = function () {
        this.updateFromObject({});
    };
    Sheet.prototype.updateFromObject = function (obj) {
        for (var id in this.values) {
            if (obj[id] === undefined) {
                var aliases = this.values[id].getAliases();
                var foundAlias = false;
                for (var i = 0; i < aliases.length; i++) {
                    if (obj[aliases[i]] !== undefined) {
                        this.values[id].updateFromObject(obj[aliases[i]]);
                        foundAlias = true;
                        break;
                    }
                }
                if (foundAlias) {
                    continue;
                }
                this.values[id].reset();
            }
            else {
                this.values[id].updateFromObject(obj[id]);
            }
        }
    };
    Sheet.prototype.exportAsObject = function () {
        var obj = {};
        var value;
        for (var id in this.values) {
            value = this.values[id].exportAsObject();
            if (value !== null) {
                obj[id] = value;
            }
        }
        return obj;
    };
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
    Sheet.prototype.processElement = function (element) {
        if (element.classList.contains("sheetList")) {
            this.createList(element);
        }
        else if (element.classList.contains("sheetVariable")) {
            this.createVariable(element);
        }
        else if (element.classList.contains("sheetButton")) {
            this.createButton(element);
        }
        else {
            var lists = element.getElementsByClassName("sheetList");
            var validLists = [];
            var parent;
            for (var i = 0; i < lists.length; i++) {
                parent = lists[i].parentElement;
                while (parent !== element) {
                    if (parent.classList.contains("sheetList")) {
                        break; // This sheetList is inside another sheetList and can't be processed right now
                    }
                    parent = parent.parentElement;
                }
                // If parent to be element, that means we went all the way up and found no SheetLists.
                if (parent === element) {
                    validLists.push(lists[i]);
                }
            }
            for (var i = 0; i < validLists.length; i++) {
                this.createList(validLists[i]);
            }
            var variables = element.getElementsByClassName("sheetVariable");
            for (var i = 0; i < variables.length; i++) {
                this.createVariable(variables[i]);
            }
            var buttons = element.getElementsByClassName("sheetButton");
            for (var i = 0; i < buttons.length; i++) {
                this.createButton(buttons[i]);
            }
        }
    };
    Sheet.prototype.createList = function (element) {
        var constructor;
        var list;
        var type = element.dataset['type'] === undefined ? "" : element.dataset['type'];
        // if (eval("typeof SheetList" + type + " !== \"function\"")) {
        //     type = "";
        // }
        // constructor = eval("SheetList" + type);
        constructor = this.style.getCreator("SheetList", type, "");
        list = new constructor(this, this.style, element);
        this.values[list.getId()] = list;
        this.valuesSimplified[Sheet.simplifyString(list.getId())] = list;
        var aliases = list.getAliases();
        for (var i = 0; i < aliases.length; i++) {
            this.valuesSimplified[Sheet.simplifyString(aliases[i])] = list;
        }
        if (list.isIndexed()) {
            this.indexedLists.push(list);
        }
        list.addChangeListener(this.changeListener);
    };
    Sheet.prototype.createVariable = function (element) {
        var constructor;
        var variable;
        var type = element.dataset['type'] === undefined ? "text" : element.dataset['type'];
        if (type === "name") {
            if (this.isRoot()) {
                this.style.createNameVariable(this, element);
            }
            return;
        }
        // if (eval("typeof SheetVariable" + type + " !== \"function\"")) {
        //     type = "text";
        // }
        // constructor = eval("SheetVariable" + type);
        constructor = this.style.getCreator("SheetVariable", type, "text");
        variable = new constructor(this, this.style, element);
        this.values[variable.getId()] = variable;
        this.valuesSimplified[Sheet.simplifyString(variable.getId())] = variable;
        var aliases = variable.getAliases();
        for (var i = 0; i < aliases.length; i++) {
            this.valuesSimplified[Sheet.simplifyString(aliases[i])] = variable;
        }
        variable.addChangeListener(this.changeListener);
    };
    Sheet.prototype.createButton = function (element) {
        var constructor;
        var button;
        var type = element.dataset['type'] === undefined ? "" : element.dataset['type'];
        // if (eval("typeof SheetButton" + type + " !== \"function\"")) {
        //     type = "";
        // }
        // constructor = eval("SheetButton" + type);
        constructor = this.style.getCreator("SheetButton", type, "");
        button = new constructor(this, this.style, element);
        this.buttons[button.getId()] = button;
    };
    Sheet.prototype.addChangeListener = function (f) {
        this.changeTrigger.addListener(f);
    };
    Sheet.prototype.addChangeListenerIfMissing = function (f) {
        this.changeTrigger.addListenerIfMissing(f);
    };
    Sheet.prototype.removeChangeListener = function (f) {
        this.changeTrigger.removeListener(f);
    };
    Sheet.prototype.considerTriggering = function () {
        this.style.triggerVariableChange(this);
    };
    Sheet.prototype.triggerChange = function (counter) {
        this.changeTrigger.trigger(this, this.style, counter);
    };
    return Sheet;
}());
var SheetButton = /** @class */ (function () {
    function SheetButton(parent, style, element) {
        this.clickFunction = (function (e) {
            this.click(e);
        }).bind(this);
        this.parent = parent;
        this.visible = element;
        this.style = style;
        this.id = this.visible.dataset['id'] === undefined ? this.parent.getUniqueID() : this.visible.dataset['id'];
        this.visible.addEventListener("click", this.clickFunction);
    }
    SheetButton.prototype.click = function (e) { };
    ;
    SheetButton.prototype.getId = function () {
        return this.id;
    };
    return SheetButton;
}());
var SheetList = /** @class */ (function () {
    // Example: tableIndex of "Name" and tableValue of "Level" in a table with multiple rows of Name, Level would mean NAME identifies a row while LEVEL gets it's value
    // Additionally, asking for a List's value will return an array of every other value
    function SheetList(parent, style, element) {
        this.rows = [];
        this.detachedRows = [];
        this.sheetElements = [];
        this.busy = false;
        this.aliases = [];
        this.sheetChangeListener = {
            list: this,
            counter: -1,
            handleEvent: function (sheet, style, counter) {
                if (counter !== this.counter) {
                    this.counter = counter;
                    this.list.considerTriggering();
                }
            }
        };
        /**
         * Alerts interested parties of changes made to this.
         * @type {Trigger}
         */
        this.changeTrigger = new Trigger();
        this.parent = parent;
        this.visible = element;
        this.style = style;
        while (element.firstChild !== null) {
            this.sheetElements.push(element.removeChild(element.firstChild));
        }
        var type = element.dataset['sheettype'] === undefined ? "" : element.dataset['sheettype'];
        // if (eval("typeof Sheet" + type + " !== \"function\"")) {
        //     type = "";
        // }
        // this.sheetType = eval("Sheet" + type);
        this.sheetType = this.style.getCreator("Sheet", type, "");
        this.id = this.visible.dataset['id'] === undefined ? this.parent.getUniqueID() : this.visible.dataset['id'];
        this.tableIndex = this.visible.dataset['tableindex'] === undefined ? null : this.visible.dataset['tableindex'];
        this.tableValue = this.visible.dataset['tablevalue'] === undefined ? null : this.visible.dataset['tablevalue'];
        try {
            this.defaultValue = this.visible.dataset['default'] === undefined ? [] : JSON.parse(this.visible.dataset['default']);
            if (typeof this.defaultValue !== "object" || !Array.isArray(this.defaultValue)) {
                console.warn("[SheetList] Received non-array JSON as default value for " + this.getId() + " in " + this.style.getName() + ", reverting to empty object.");
                this.defaultValue = [];
            }
        }
        catch (e) {
            console.warn("[SheetList] Received invalid JSON as default value for " + this.getId() + " in " + this.style.getName() + ", reverting to empty object.");
            this.defaultValue = [];
        }
        if (this.visible.dataset['alias'] !== undefined) {
            var aliases = this.visible.dataset['alias'].trim().split(";");
            for (var i = 0; i < aliases.length; i++) {
                var alias = aliases[i].trim();
                if (alias !== "") {
                    this.aliases.push(alias);
                }
            }
        }
    }
    SheetList.prototype.getParent = function () {
        return this.parent;
    };
    SheetList.prototype.getAliases = function () {
        return this.aliases;
    };
    SheetList.prototype.getRows = function () {
        return this.rows;
    };
    SheetList.prototype.breakIn = function (sheet) { };
    SheetList.prototype.addRow = function () {
        var newRow;
        if (this.detachedRows.length > 0) {
            newRow = this.detachedRows.pop();
            newRow.reset();
        }
        else {
            var newRowEles = [];
            for (var i = 0; i < this.sheetElements.length; i++) {
                newRowEles.push(this.sheetElements[i].cloneNode(true));
            }
            newRow = new this.sheetType(this, this.style, newRowEles);
            newRow.reset();
            this.breakIn(newRow);
            newRow.addChangeListener(this.sheetChangeListener);
        }
        this.appendRow(newRow);
        this.rows.push(newRow);
        if (!this.busy) {
            this.considerTriggering();
        }
    };
    SheetList.prototype.empty = function () {
        while (this.visible.firstChild !== null) {
            this.visible.removeChild(this.visible.firstChild);
        }
    };
    SheetList.prototype.reattachRows = function () {
        this.empty();
        for (var i = 0; i < this.rows.length; i++) {
            this.appendRow(this.rows[i]);
        }
    };
    SheetList.prototype.appendRow = function (newRow) {
        for (var i = 0; i < newRow.getElements().length; i++) {
            this.visible.appendChild(newRow.getElements()[i]);
        }
    };
    SheetList.prototype.detachRow = function (oldRow) {
        for (var i = 0; i < oldRow.getElements().length; i++) {
            var element = oldRow.getElements()[i];
            if (element.parentNode !== null) {
                element.parentNode.removeChild(element);
            }
        }
    };
    SheetList.prototype.removeRow = function (row) {
        var idx = this.rows.indexOf(row);
        if (idx !== -1) {
            var oldRow = this.rows.splice(idx, 1)[0];
            this.detachRow(oldRow);
            this.detachedRows.push(oldRow);
        }
        if (!this.busy) {
            this.considerTriggering();
        }
    };
    SheetList.prototype.removeLastRow = function () {
        if (this.rows.length > 0) {
            this.removeRow(this.rows[this.rows.length - 1]);
        }
    };
    SheetList.prototype.isIndexed = function () {
        return (this.tableIndex !== null && this.tableValue !== null);
    };
    SheetList.prototype.getId = function () {
        return this.id;
    };
    SheetList.prototype.reset = function () {
        this.updateFromObject(this.defaultValue);
    };
    SheetList.prototype.updateFromObject = function (obj) {
        this.busy = true;
        if (this.rows.length !== obj.length) {
            while (this.rows.length < obj.length) {
                this.addRow();
            }
            while (this.rows.length > obj.length) {
                this.removeLastRow();
            }
        }
        for (var i = 0; i < this.rows.length; i++) {
            this.rows[i].updateFromObject(obj[i]);
        }
        this.busy = false;
    };
    SheetList.prototype.getTableIndex = function () {
        return this.tableIndex;
    };
    SheetList.prototype.sort = function () {
        if (this.tableIndex !== null) {
            this.rows.sort(function (a, b) {
                var na = a.findField(a.getParent().getTableIndex()).getValue();
                var nb = b.findField(b.getParent().getTableIndex()).getValue();
                if (typeof na === "string") {
                    na = na.toLowerCase();
                    nb = nb.toLowerCase();
                    if (na < nb)
                        return -1;
                    if (na > nb)
                        return 1;
                    return 0;
                }
                else if (typeof na === "number") {
                    return na - nb;
                }
                return 0;
            });
            this.reattachRows();
            this.considerTriggering();
        }
    };
    SheetList.prototype.getRowIndex = function (id) {
        id = Sheet.simplifyString(id);
        if (this.tableIndex !== null && this.tableValue !== null) {
            for (var i = 0; i < this.rows.length; i++) {
                var name = this.rows[i].getValueFor(this.tableIndex);
                if (typeof name === "string") {
                    var simpleName = Sheet.simplifyString(name);
                    if (simpleName === id) {
                        return this.rows[i];
                    }
                }
                else {
                    return null; // Variable types are constant, if one is not a string, neither is any of the others
                }
            }
        }
        return null;
    };
    SheetList.prototype.getValueFor = function (id) {
        if (this.tableIndex !== null && this.tableValue !== null) {
            for (var i = 0; i < this.rows.length; i++) {
                var name = this.rows[i].getValueFor(this.tableIndex);
                if (typeof name === "string") {
                    var simpleName = Sheet.simplifyString(name);
                    if (simpleName === id) {
                        return this.rows[i].getValueFor(this.tableValue);
                    }
                }
                else {
                    return NaN; // Variable types are constant, if one is not a string, neither is any of the others
                }
            }
        }
        return NaN;
    };
    SheetList.prototype.getValue = function () {
        if (this.tableValue !== null) {
            var values = [];
            for (var i = 0; i < this.rows.length; i++) {
                values.push(this.rows[i].getValueFor(this.tableValue));
            }
            return values;
        }
        else {
            return [NaN];
        }
    };
    SheetList.prototype.exportAsObject = function () {
        var arr = [];
        for (var i = 0; i < this.rows.length; i++) {
            arr.push(this.rows[i].exportAsObject());
        }
        return arr;
    };
    SheetList.prototype.addChangeListener = function (f) {
        this.changeTrigger.addListener(f);
    };
    SheetList.prototype.addChangeListenerIfMissing = function (f) {
        this.changeTrigger.addListenerIfMissing(f);
    };
    SheetList.prototype.removeChangeListener = function (f) {
        this.changeTrigger.removeListener(f);
    };
    SheetList.prototype.considerTriggering = function () {
        this.style.triggerVariableChange(this);
    };
    SheetList.prototype.triggerChange = function (counter) {
        this.changeTrigger.trigger(this, this.style, counter);
    };
    return SheetList;
}());
var SheetVariable = /** @class */ (function () {
    function SheetVariable(parent, style, element) {
        this.value = null;
        this.defaultValueString = null;
        this.aliases = [];
        /**
         * Alerts interested parties of changes made to this.
         * @type {Trigger}
         */
        this.changeTrigger = new Trigger();
        this.parent = parent;
        this.visible = element;
        this.style = style;
        this.id = this.visible.dataset['id'] === undefined ? this.parent.getUniqueID() : this.visible.dataset['id'];
        this.defaultValueString = this.visible.dataset['default'] === undefined ? null : this.visible.dataset['default'];
        this.editable = this.visible.dataset['editable'] === undefined ? true :
            (this.visible.dataset['editable'] === "1" ||
                this.visible.dataset['editable'].toLowerCase() === "true");
        if (this.visible.dataset['alias'] !== undefined) {
            var aliases = this.visible.dataset['alias'].trim().split(";");
            for (var i = 0; i < aliases.length; i++) {
                var alias = aliases[i].trim();
                if (alias !== "") {
                    this.aliases.push(alias);
                }
            }
        }
    }
    SheetVariable.prototype.getAliases = function () {
        return this.aliases;
    };
    /**
     * Updates this variable's element to better reflect the current state.
     */
    SheetVariable.prototype.updateVisible = function () { };
    SheetVariable.prototype.empty = function () {
        while (this.visible.firstChild !== null)
            this.visible.removeChild(this.visible.firstChild);
    };
    SheetVariable.prototype.storeValue = function (obj) {
        if (this.editable && obj !== this.value) {
            this.value = obj;
            this.updateVisible();
            this.considerTriggering();
        }
    };
    SheetVariable.prototype.reset = function () {
        this.storeValue(this.defaultValueString);
    };
    SheetVariable.prototype.getValue = function () {
        return this.value;
    };
    SheetVariable.prototype.updateFromObject = function (obj) {
        this.storeValue(obj);
    };
    SheetVariable.prototype.exportAsObject = function () {
        if (this.editable) {
            return this.value;
        }
        else {
            return null;
        }
    };
    SheetVariable.prototype.getId = function () {
        return this.id;
    };
    SheetVariable.prototype.addChangeListener = function (f) {
        this.changeTrigger.addListener(f);
    };
    SheetVariable.prototype.addChangeListenerIfMissing = function (f) {
        this.changeTrigger.addListenerIfMissing(f);
    };
    SheetVariable.prototype.removeChangeListener = function (f) {
        this.changeTrigger.removeListener(f);
    };
    SheetVariable.prototype.considerTriggering = function () {
        this.style.triggerVariableChange(this);
    };
    SheetVariable.prototype.triggerChange = function (counter) {
        this.changeTrigger.trigger(this, this.style, counter);
    };
    return SheetVariable;
}());
var StyleFactory;
(function (StyleFactory) {
    var styles = {};
    function getCreator(style) {
        var _startTime = (new Date()).getTime();
        var creator = SheetStyle;
        try {
            eval(style.mainCode);
        }
        catch (e) {
            console.error("[SheetStyle] Error in style code.");
            console.warn(e);
            creator = SheetStyle;
        }
        var SheetStyleAdapted = /** @class */ (function (_super) {
            __extends(SheetStyleAdapted, _super);
            function SheetStyleAdapted() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SheetStyleAdapted.prototype.getCreator = function (kind, type, def) {
                var name = kind + this.stringToType(type);
                if (eval("typeof " + name) === "function") {
                    return eval(name);
                }
                return eval(kind + def);
            };
            return SheetStyleAdapted;
        }(creator));
        var _endTime = (new Date()).getTime();
        console.debug("[StyleFactory] " + style.name + "'s Creator took " + (_endTime - _startTime) + "ms to process.");
        return SheetStyleAdapted;
    }
    StyleFactory.getCreator = getCreator;
    function getSheetStyle(style, reload) {
        if (styles[style.id] !== undefined) {
            if (reload !== true) {
                return styles[style.id];
            }
            else {
                styles[style.id].die();
            }
        }
        styles[style.id] = new (getCreator(style))(style);
        return styles[style.id];
    }
    StyleFactory.getSheetStyle = getSheetStyle;
})(StyleFactory || (StyleFactory = {}));
var SheetVariabletext = /** @class */ (function (_super) {
    __extends(SheetVariabletext, _super);
    function SheetVariabletext(parent, style, ele) {
        var _this = _super.call(this, parent, style, ele) || this;
        _this.mouse = false;
        _this.textNode = document.createTextNode(_this.defaultValueString === null ? "" : _this.defaultValueString);
        _this.defaultValueString = _this.defaultValueString === null ? "" : _this.defaultValueString;
        _this.empty();
        _this.attachTextNode();
        if (_this.editable) {
            ele.addEventListener("click", (function (e) {
                this.click();
            }).bind(_this));
            ele.addEventListener("mousedown", (function (e) {
                this.mousedown();
            }).bind(_this));
            ele.addEventListener("focus", (function (e) {
                this.focus();
            }).bind(_this));
            ele.addEventListener("input", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.input(e);
                }
            });
            ele.addEventListener("keyup", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.keyup(e);
                }
            });
            ele.addEventListener("keydown", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.keydown(e);
                }
            });
            ele.addEventListener("blur", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.blur();
                }
            });
            _this.updateContentEditable();
        }
        return _this;
    }
    SheetVariabletext.prototype.attachTextNode = function () {
        this.visible.appendChild(this.textNode);
    };
    SheetVariabletext.prototype.click = function (e) {
    };
    SheetVariabletext.prototype.mousedown = function () {
        this.mouse = true;
    };
    SheetVariabletext.prototype.input = function (e) {
    };
    SheetVariabletext.prototype.keyup = function (e) {
        // if (e.key === "Tab" && document.activeElement === this.visible) {
        //     var selection = window.getSelection();
        //     var range = document.createRange();
        //     range.selectNodeContents(this.visible);
        //     selection.removeAllRanges();
        //     selection.addRange(range);
        // }
    };
    SheetVariabletext.prototype.isAllowedKey = function (key) {
        return true;
    };
    SheetVariabletext.prototype.keydown = function (e) {
        if (e.key === "Enter" || !this.isAllowedKey(e.key)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    SheetVariabletext.prototype.focus = function () {
        if (!this.mouse) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(this.visible);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        this.mouse = false;
    };
    SheetVariabletext.prototype.blur = function () {
        var value = this.visible.innerText.trim();
        if (this.visible.childNodes.length !== 1 || this.textNode.parentElement !== this.visible) {
            this.empty();
            this.attachTextNode();
        }
        this.storeValue(value);
    };
    SheetVariabletext.prototype.updateContentEditable = function () {
        this.visible.contentEditable = (this.editable && (this.style.getSheetInstance() === null || this.style.getSheetInstance().isEditable())) ? "true" : "false";
        if (this.visible.contentEditable === "true") {
            this.visible.classList.add("contenteditable");
        }
        else {
            this.visible.classList.remove("contenteditable");
        }
    };
    SheetVariabletext.prototype.storeValue = function (value) {
        if (this.editable) {
            if (value === null || typeof value === "undefined") {
                value = this.value;
            }
            else if (typeof value !== "string") {
                value = value.toString();
            }
            if (value !== this.value) {
                this.value = value;
                this.considerTriggering();
            }
            this.updateVisible();
            this.updateContentEditable();
        }
    };
    SheetVariabletext.prototype.updateVisible = function () {
        if (this.value !== null) {
            this.textNode.nodeValue = this.value;
        }
        else {
            this.textNode.nodeValue = this.defaultValueString === null ? "" : this.defaultValueString;
        }
    };
    return SheetVariabletext;
}(SheetVariable));
var SheetVariablelongtext = /** @class */ (function (_super) {
    __extends(SheetVariablelongtext, _super);
    function SheetVariablelongtext(parent, style, ele) {
        var _this = _super.call(this, parent, style, ele) || this;
        _this.allowEmptyLines = false;
        _this.pClass = null;
        _this.mouse = false;
        _this.empty();
        _this.defaultValueString = _this.defaultValueString === null ? "" : _this.defaultValueString;
        _this.allowEmptyLines = _this.visible.dataset['allowempty'] === undefined ? false :
            (_this.visible.dataset['allowempty'] === "1" ||
                _this.visible.dataset['allowempty'].toLowerCase() === "true");
        _this.pClass = _this.visible.dataset['pclass'] === undefined ? null : _this.visible.dataset['pclass'];
        if (_this.editable) {
            ele.addEventListener("click", (function (e) {
                this.click();
            }).bind(_this));
            ele.addEventListener("mousedown", (function (e) {
                this.mousedown();
            }).bind(_this));
            ele.addEventListener("focus", (function (e) {
                this.focus();
            }).bind(_this));
            ele.addEventListener("input", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.input(e);
                }
            });
            ele.addEventListener("keyup", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.keyup(e);
                }
            });
            ele.addEventListener("keydown", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.keydown(e);
                }
            });
            ele.addEventListener("blur", {
                variable: _this,
                handleEvent: function (e) {
                    this.variable.blur();
                }
            });
            _this.updateContentEditable();
        }
        _this.updateVisible();
        return _this;
    }
    SheetVariablelongtext.prototype.mousedown = function () {
        this.mouse = true;
    };
    SheetVariablelongtext.prototype.click = function (e) {
    };
    SheetVariablelongtext.prototype.input = function (e) {
    };
    SheetVariablelongtext.prototype.keyup = function (e) {
        // if (e.key === "Tab" && document.activeElement === this.visible) {
        //     var selection = window.getSelection();
        //     var range = document.createRange();
        //     range.selectNodeContents(this.visible);
        //     selection.removeAllRanges();
        //     selection.addRange(range);
        // }
    };
    SheetVariablelongtext.prototype.keydown = function (e) {
    };
    SheetVariablelongtext.prototype.focus = function () {
        if (!this.mouse) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(this.visible);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        this.mouse = false;
    };
    SheetVariablelongtext.prototype.blur = function () {
        var lines = [];
        for (var i = 0; i < this.visible.children.length; i++) {
            var line = this.visible.children[i].innerText;
            if (line !== null && line !== undefined) {
                line = line.trim();
            }
            else {
                line = "";
            }
            if (line !== "" || this.allowEmptyLines) {
                lines.push(line);
            }
        }
        this.storeValue(lines.join("\n"));
    };
    SheetVariablelongtext.prototype.updateContentEditable = function () {
        this.visible.contentEditable = (this.editable && (this.style.getSheetInstance() === null || this.style.getSheetInstance().isEditable())) ? "true" : "false";
        if (this.visible.contentEditable === "true") {
            this.visible.classList.add("contenteditable");
        }
        else {
            this.visible.classList.remove("contenteditable");
        }
    };
    SheetVariablelongtext.prototype.storeValue = function (value) {
        if (this.editable) {
            if (typeof value === "string" && value !== this.value) {
                this.value = value;
                this.considerTriggering();
            }
            this.updateVisible();
            this.updateContentEditable();
        }
    };
    SheetVariablelongtext.prototype.updateVisible = function () {
        this.empty();
        var curValue = this.value !== null ? this.value : this.defaultValueString !== null ? this.defaultValueString : "";
        var lines = curValue.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var p = document.createElement("p");
            if (this.pClass !== null)
                p.classList.add(this.pClass);
            p.appendChild(document.createTextNode(lines[i]));
            this.visible.appendChild(p);
        }
    };
    return SheetVariablelongtext;
}(SheetVariable));
var SheetVariablenumber = /** @class */ (function (_super) {
    __extends(SheetVariablenumber, _super);
    function SheetVariablenumber(parent, style, ele) {
        var _this = _super.call(this, parent, style, ele) || this;
        if (_this.defaultValueString !== null) {
            _this.defaultValue = _this.parseString(_this.defaultValueString);
            if (isNaN(_this.defaultValue)) {
                _this.defaultValue = 0;
            }
        }
        else {
            _this.defaultValue = 0;
        }
        _this.value = _this.defaultValue;
        _this.updateVisible();
        return _this;
    }
    SheetVariablenumber.prototype.parseString = function (str) {
        return parseFloat(str);
    };
    SheetVariablenumber.prototype.parseNumber = function (n) {
        return +(n.toFixed(2));
    };
    SheetVariablenumber.prototype.reset = function () {
        this.storeValue(this.defaultValue);
    };
    SheetVariablenumber.prototype.storeValue = function (value) {
        if (this.editable) {
            if (typeof value !== "number") {
                if (typeof value === "string") {
                    value = value.replace(/,/g, ".");
                }
                value = this.parseString(value);
                if (isNaN(value)) {
                    value = this.value;
                }
            }
            value = this.parseNumber(value);
            if (value !== this.value) {
                this.value = value;
                this.considerTriggering();
            }
            this.updateVisible();
            this.updateContentEditable();
        }
    };
    SheetVariablenumber.prototype.isImportantInputKey = function (key) {
        return key === "Tab" || key === "Backspace" || key === "Delete" || key === "ArrowLeft" || key === "ArrowRight" || key === "-" || key === "+";
    };
    SheetVariablenumber.prototype.isAllowedKey = function (key) {
        return this.isImportantInputKey(key) || key === "." || key === "," || !isNaN(key);
    };
    SheetVariablenumber.prototype.updateVisible = function () {
        if (this.value !== null) {
            this.textNode.nodeValue = this.value.toString();
        }
        else {
            this.textNode.nodeValue = this.defaultValue.toString();
        }
        this.visible.classList.remove("negative", "positive");
        if (this.value < 0) {
            this.visible.classList.add("negative");
        }
        else if (this.value > 0) {
            this.visible.classList.add("positive");
        }
    };
    return SheetVariablenumber;
}(SheetVariabletext));
var SheetVariableinteger = /** @class */ (function (_super) {
    __extends(SheetVariableinteger, _super);
    function SheetVariableinteger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SheetVariableinteger.prototype.isAllowedKey = function (key) {
        return this.isImportantInputKey(key) || !isNaN(key);
    };
    SheetVariableinteger.prototype.parseString = function (str) {
        return parseInt(str);
    };
    SheetVariableinteger.prototype.parseNumber = function (n) {
        return Math.floor(n);
    };
    return SheetVariableinteger;
}(SheetVariablenumber));
var SheetVariablemath = /** @class */ (function (_super) {
    __extends(SheetVariablemath, _super);
    function SheetVariablemath(parent, style, ele) {
        var _this = _super.call(this, parent, style, ele) || this;
        _this.changeListener = {
            math: _this,
            counter: -1,
            handleEvent: function (variable, style, counter) {
                if (this.counter !== counter) {
                    this.math.checkForChange();
                    this.counter = counter;
                }
            }
        };
        _this.parse();
        _this.style.addCreatorListener(_this);
        return _this;
    }
    SheetVariablemath.prototype.checkForChange = function () {
        var newValue = this.getValue();
        if (this.lastValue !== newValue && !(isNaN(newValue) && isNaN(this.lastValue))) {
            this.lastValue = newValue;
            this.updateVisible();
            this.considerTriggering();
        }
    };
    SheetVariablemath.prototype.parse = function () {
        var expr = this.value === null ? this.defaultValueString === null ? "0" : this.defaultValueString : this.value;
        expr = Sheet.simplifyString(expr);
        try {
            this.parsed = math.parse(expr);
            this.compiled = math.compile(expr);
        }
        catch (e) {
            console.warn("[SheetVariableMath] Invalid Math variable at " + this.id + ". Error:", e);
            this.parsed = math.parse("0");
            this.compiled = math.compile("0");
        }
        this.symbols = this.getSymbols();
        this.scope = this.getScope(this.symbols);
    };
    SheetVariablemath.prototype.getSymbols = function () {
        var symbols = [];
        var nodes = this.parsed.filter(function (node) {
            return node.type == 'SymbolNode';
        });
        for (var i = 0; i < nodes.length; i++) {
            symbols.push(nodes[i].name);
        }
        return symbols;
    };
    SheetVariablemath.prototype.getScope = function (symbols) {
        var scope = {};
        for (var i = 0; i < symbols.length; i++) {
            scope[symbols[i]] = 0;
        }
        return scope;
    };
    SheetVariablemath.prototype.complete = function () {
        if (this.editable) {
            this.style.getSheet().addChangeListener(this.changeListener);
        }
        else {
            var variables = [];
            var takeLists = false;
            for (var i = 0; i < this.symbols.length; i++) {
                var variable = this.style.getSheet().findField(this.symbols[i]);
                if (variable === null) {
                    takeLists = true;
                }
                else {
                    variables.push(variable);
                }
            }
            variables = variables.concat(this.style.getSheet().getLists());
            for (var i = 0; i < variables.length; i++) {
                variables[i].addChangeListener(this.changeListener);
            }
        }
        this.updateVisible();
    };
    SheetVariablemath.prototype.focus = function () {
        this.updateVisible();
        this.visible.focus();
        if (!this.mouse) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(this.visible);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        this.mouse = false;
    };
    SheetVariablemath.prototype.storeValue = function (value) {
        if (this.editable) {
            if (typeof value === "string" && value !== this.value) {
                this.value = value;
                this.parse();
                this.checkForChange();
            }
            this.updateVisible();
            this.updateContentEditable();
        }
    };
    SheetVariablemath.prototype.getValue = function () {
        for (var i = 0; i < this.symbols.length; i++) {
            this.scope[this.symbols[i]] = this.style.getSheet().getValueFor(this.symbols[i]);
        }
        try {
            var result = this.compiled.eval(this.scope);
            return result;
        }
        catch (e) {
            console.warn("[SheetVariableMath] Evaluation error", e);
            return NaN;
        }
    };
    SheetVariablemath.prototype.updateVisible = function () {
        this.visible.classList.remove("negative", "positive");
        if (document.activeElement === this.visible) {
            this.textNode.nodeValue = this.value === null ? this.defaultValueString === null ? "0" : this.defaultValueString : this.value;
        }
        else {
            var value = this.getValue();
            value = value === null ? NaN : value;
            if (isNaN(value)) {
                this.textNode.nodeValue = UI.Language.getLanguage().getLingo("_SHEETVARIABLEMATHNAN_");
            }
            else {
                this.textNode.nodeValue = (+value.toFixed(1)).toString();
            }
            if (value < 0) {
                this.visible.classList.add("negative");
            }
            else if (value > 0) {
                this.visible.classList.add("positive");
            }
        }
    };
    return SheetVariablemath;
}(SheetVariabletext));
var SheetVariableimage = /** @class */ (function (_super) {
    __extends(SheetVariableimage, _super);
    function SheetVariableimage(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        _this.img = document.createElement("img");
        _this.select = document.createElement("select");
        _this.errorUrl = "images/sheetImgError.png";
        if (_this.defaultValueString === null) {
            _this.defaultName = "";
            _this.defaultUrl = "";
        }
        else {
            var obj;
            try {
                obj = JSON.parse(_this.defaultValueString);
                if (Array.isArray(obj) && obj.length === 2) {
                    _this.defaultName = obj[0];
                    _this.defaultUrl = obj[1];
                }
                else {
                    _this.defaultName = "";
                    _this.defaultUrl = "";
                }
            }
            catch (e) {
                console.log("[SheetVariableImage] Produced invalid Default Value at " + _this.id + ":", _this.defaultValueString);
                _this.defaultName = "";
                _this.defaultUrl = "";
            }
        }
        if (_this.visible.dataset['imgclass'] !== undefined) {
            _this.img.classList.add(_this.visible.dataset['imgclass']);
        }
        if (_this.visible.dataset['selectclass'] !== undefined) {
            _this.select.classList.add(_this.visible.dataset['selectclass']);
        }
        _this.select.addEventListener("blur", (function (e) { this.blur(e); }).bind(_this));
        _this.select.addEventListener("change", (function (e) { this.change(e); }).bind(_this));
        _this.img.addEventListener("error", (function (e) { this.error(e); }).bind(_this));
        if (_this.editable) {
            _this.img.addEventListener("click", (function (e) {
                this.click(e);
            }).bind(_this));
        }
        _this.value = [_this.defaultName, _this.defaultUrl];
        _this.updateVisible();
        return _this;
    }
    SheetVariableimage.prototype.reset = function () {
        this.storeValue([this.defaultName, this.defaultUrl]);
    };
    SheetVariableimage.prototype.blur = function () {
        this.empty();
        this.visible.appendChild(this.img);
        var obj;
        try {
            obj = JSON.parse(this.select.value);
            if (Array.isArray(obj) && obj.length === 2) {
                this.storeValue(obj);
            }
        }
        catch (e) {
            console.log("[SheetVariableImage] Produced invalid Array at " + this.id + ":", this.select.value, e);
            this.storeValue([this.defaultName, this.defaultUrl]);
        }
        this.updateVisible();
    };
    SheetVariableimage.prototype.change = function () {
    };
    SheetVariableimage.prototype.click = function (e) {
        e.preventDefault();
        if (this.style.getSheetInstance().isEditable()) {
            this.showSelect();
        }
    };
    SheetVariableimage.prototype.error = function (e) {
        e.preventDefault();
        this.img.src = this.errorUrl;
    };
    SheetVariableimage.prototype.createOptions = function (name, arr) {
        var optgroup = document.createElement("optgroup");
        optgroup.label = name;
        for (var i = 0; i < arr.length; i++) {
            optgroup.appendChild(this.createOption(arr[i][0], arr[i][1]));
        }
        return optgroup;
    };
    SheetVariableimage.prototype.createOption = function (name, url) {
        var option = document.createElement("option");
        option.value = JSON.stringify([name, url]);
        option.appendChild(document.createTextNode(name));
        return option;
    };
    SheetVariableimage.prototype.showSelect = function () {
        this.empty();
        this.visible.appendChild(this.select);
        while (this.select.firstChild !== null)
            this.select.removeChild(this.select.firstChild);
        if (this.value !== null && this.value[0] !== "" && this.value[1] !== "") {
            var lastValueName = UI.Language.getLanguage().getLingo("_SHEETVARIABLEIMAGELASTVALUE_");
            this.select.appendChild(this.createOptions(lastValueName, [this.value]));
        }
        if (this.defaultName !== "" && this.defaultUrl !== "") {
            this.select.appendChild(this.createOption(this.defaultName, this.defaultUrl));
        }
        else {
            var opt = this.createOption(UI.Language.getLanguage().getLingo("_SHEETVARIABLEIMAGENONE_"), this.errorUrl);
            this.select.appendChild(opt);
        }
        var images = DB.ImageDB.getImagesByFolder();
        if (images.length === 0) {
            var opt = this.createOption(UI.Language.getLanguage().getLingo("_SHEETVARIABLEIMAGESNOTLOADED_"), "");
            opt.disabled = true;
            this.select.appendChild(opt);
        }
        else {
            for (var i = 0; i < images.length; i++) {
                if (images[i].length > 0) {
                    var group = {
                        name: images[i][0].getFolder(),
                        images: []
                    };
                    if (group.name === "") {
                        group.name = UI.Language.getLanguage().getLingo("_IMAGESNOFOLDERNAME_");
                    }
                    for (var k = 0; k < images[i].length; k++) {
                        group.images.push([images[i][k].getName(), images[i][k].getLink()]);
                    }
                    this.select.appendChild(this.createOptions(group.name, group.images));
                }
            }
        }
        this.select.value = JSON.stringify(this.value);
        this.select.focus();
        this.select.click();
    };
    SheetVariableimage.prototype.storeValue = function (arr) {
        if (!Array.isArray(arr) || arr.length !== 2) {
            arr = [this.defaultName, this.defaultUrl];
        }
        if (this.value[0] !== arr[0] || this.value[1] !== arr[1]) {
            this.value = arr;
            this.considerTriggering();
        }
        this.updateVisible();
    };
    SheetVariableimage.prototype.updateVisible = function () {
        if (this.editable) {
            if (this.style.getSheetInstance() !== null && this.style.getSheetInstance().isEditable()) {
                this.img.classList.add("editable");
            }
            else {
                this.img.classList.remove("editable");
            }
        }
        if (this.img.parentElement !== this.visible) {
            this.empty();
            this.visible.appendChild(this.img);
        }
        this.img.src = this.value[1];
    };
    return SheetVariableimage;
}(SheetVariable));
var SheetVariableselect = /** @class */ (function (_super) {
    __extends(SheetVariableselect, _super);
    function SheetVariableselect(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        _this.select = document.createElement("select");
        _this.values = [""];
        if (_this.visible.dataset['values'] !== undefined) {
            _this.values = _this.visible.dataset['values'].split(";");
            for (var i = 0; i < _this.values.length; i++) {
                var opt = document.createElement("option");
                opt.value = _this.values[i];
                opt.appendChild(document.createTextNode(_this.values[i]));
                _this.select.appendChild(opt);
            }
        }
        else {
            _this.values = [""];
        }
        if (_this.visible.dataset['selectclass'] !== undefined) {
            _this.select.classList.add(_this.visible.dataset['selectclass']);
        }
        if (_this.editable) {
            _this.select.addEventListener("blur", (function (e) { this.selectBlur(e); }).bind(_this));
            _this.select.addEventListener("change", (function (e) { this.selectChange(e); }).bind(_this));
        }
        _this.select.disabled = !_this.editable;
        if (_this.defaultValueString !== null && _this.values.indexOf(_this.defaultValueString) !== -1) {
            _this.value = _this.defaultValueString;
        }
        else {
            _this.value = _this.values[0];
        }
        _this.showSelect();
        return _this;
    }
    SheetVariableselect.prototype.reset = function () {
        if (this.defaultValueString !== null && this.values.indexOf(this.defaultValueString) !== -1) {
            this.storeValue(this.defaultValueString);
        }
        else {
            this.storeValue(this.values[0]);
        }
    };
    SheetVariableselect.prototype.blur = function () { };
    SheetVariableselect.prototype.focus = function () {
        // this.showSelect();
        // this.select.focus();
    };
    SheetVariableselect.prototype.selectBlur = function (e) {
        this.storeValue(this.select.value);
        // this.empty();
        // this.visible.appendChild(this.textNode);
    };
    SheetVariableselect.prototype.selectChange = function (e) {
        this.storeValue(this.select.value);
    };
    SheetVariableselect.prototype.showSelect = function () {
        this.empty();
        this.visible.appendChild(this.select);
        this.select.value = this.value === null ? this.values[0] : this.value;
    };
    SheetVariableselect.prototype.storeValue = function (value) {
        if (this.editable) {
            if (typeof value === "string" && value !== this.value) {
                if (this.values.indexOf(value) === -1) {
                    value = this.values[0];
                }
                this.value = value;
                this.considerTriggering();
            }
            this.updateVisible();
        }
    };
    SheetVariableselect.prototype.updateVisible = function () {
        this.select.value = this.value === null ? this.values[0] : this.value;
        this.select.disabled = (!this.editable || (this.style.getSheetInstance() !== null && !this.style.getSheetInstance().isEditable()));
    };
    return SheetVariableselect;
}(SheetVariable));
var SheetVariableboolean = /** @class */ (function (_super) {
    __extends(SheetVariableboolean, _super);
    function SheetVariableboolean(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        if (_this.visible.tagName.toLowerCase() !== "input" || _this.visible.type !== "checkbox") {
            console.warn("[SheetVariableBoolean] Must be a checkbox input. Offending id:", _this.getId());
            return _this;
        }
        _this.defaultState = _this.defaultValueString === null ? false :
            (_this.defaultValueString === "1" || _this.defaultValueString.toLowerCase() === "true") ?
                true : false;
        _this.value = _this.defaultState;
        if (_this.editable) {
            _this.visible.addEventListener("change", (function () { this.change(); }).bind(_this));
        }
        _this.updateVisible();
        return _this;
    }
    SheetVariableboolean.prototype.change = function () {
        this.storeValue(this.visible.checked);
    };
    SheetVariableboolean.prototype.reset = function () {
        this.storeValue(this.defaultState);
    };
    SheetVariableboolean.prototype.storeValue = function (state) {
        if (this.editable) {
            state = state === true;
            if (state !== this.value) {
                this.value = state;
                this.considerTriggering();
            }
        }
        this.updateVisible();
    };
    SheetVariableboolean.prototype.updateVisible = function () {
        this.visible.checked = this.value;
        this.visible.disabled = !(this.editable && (this.style.getSheetInstance() === null || this.style.getSheetInstance().isEditable()));
    };
    return SheetVariableboolean;
}(SheetVariable));
var SheetVariableimageselect = /** @class */ (function (_super) {
    __extends(SheetVariableimageselect, _super);
    function SheetVariableimageselect(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        _this.select = document.createElement("select");
        _this.errorUrl = "images/sheetImgError.png";
        while (_this.visible.firstChild !== null)
            _this.visible.removeChild(_this.visible.firstChild);
        _this.visible.appendChild(_this.select);
        if (_this.defaultValueString === null) {
            _this.defaultName = "";
            _this.defaultUrl = "";
        }
        else {
            var obj;
            try {
                obj = JSON.parse(_this.defaultValueString);
                if (Array.isArray(obj) && obj.length === 2) {
                    _this.defaultName = obj[0];
                    _this.defaultUrl = obj[1];
                }
                else {
                    _this.defaultName = "";
                    _this.defaultUrl = "";
                }
            }
            catch (e) {
                console.log("[SheetVariableImageSelect] Produced invalid Default Value at " + _this.id + ":", _this.defaultValueString);
                _this.defaultName = "";
                _this.defaultUrl = "";
            }
        }
        if (_this.visible.dataset['selectclass'] !== undefined) {
            _this.select.classList.add(_this.visible.dataset['selectclass']);
        }
        if (_this.editable) {
            _this.select.addEventListener("change", (function (e) {
                this.change(e);
            }).bind(_this));
            _this.select.addEventListener("click", (function (e) {
                this.click(e);
            }).bind(_this));
        }
        _this.value = [_this.defaultName, _this.defaultUrl];
        _this.updateOptions();
        _this.updateVisible();
        return _this;
    }
    SheetVariableimageselect.prototype.createOptions = function (name, arr) {
        var optgroup = document.createElement("optgroup");
        optgroup.label = name;
        for (var i = 0; i < arr.length; i++) {
            optgroup.appendChild(this.createOption(arr[i][0], arr[i][1]));
        }
        return optgroup;
    };
    SheetVariableimageselect.prototype.createOption = function (name, url) {
        var option = document.createElement("option");
        option.value = JSON.stringify([name, url]);
        option.appendChild(document.createTextNode(name));
        return option;
    };
    SheetVariableimageselect.prototype.updateOptions = function () {
        while (this.select.firstChild !== null)
            this.select.removeChild(this.select.firstChild);
        if (this.value !== null && this.value[0] !== "" && this.value[1] !== "") {
            var lastValueName = UI.Language.getLanguage().getLingo("_SHEETVARIABLEIMAGELASTVALUE_");
            this.select.appendChild(this.createOptions(lastValueName, [this.value]));
        }
        if (this.defaultName !== "" && this.defaultUrl !== "") {
            this.select.appendChild(this.createOption(this.defaultName, this.defaultUrl));
        }
        else {
            var opt = this.createOption(UI.Language.getLanguage().getLingo("_SHEETVARIABLEIMAGENONE_"), this.errorUrl);
            this.select.appendChild(opt);
        }
        var images = DB.ImageDB.getImagesByFolder();
        if (images.length === 0) {
            var opt = this.createOption(UI.Language.getLanguage().getLingo("_SHEETVARIABLEIMAGESNOTLOADED_"), "");
            opt.disabled = true;
            this.select.appendChild(opt);
        }
        else {
            for (var i = 0; i < images.length; i++) {
                if (images[i].length > 0) {
                    var group = {
                        name: images[i][0].getFolder(),
                        images: []
                    };
                    if (group.name === "") {
                        group.name = UI.Language.getLanguage().getLingo("_IMAGESNOFOLDERNAME_");
                    }
                    for (var k = 0; k < images[i].length; k++) {
                        group.images.push([images[i][k].getName(), images[i][k].getLink()]);
                    }
                    this.select.appendChild(this.createOptions(group.name, group.images));
                }
            }
        }
        this.select.value = JSON.stringify(this.value);
    };
    SheetVariableimageselect.prototype.storeValue = function (arr) {
        if (!Array.isArray(arr) || arr.length !== 2) {
            arr = [this.defaultName, this.defaultUrl];
        }
        if (this.value[0] !== arr[0] || this.value[1] !== arr[1]) {
            this.value = arr;
            this.considerTriggering();
        }
        this.updateVisible();
    };
    SheetVariableimageselect.prototype.updateVisible = function () {
        this.updateOptions();
        this.select.disabled = (!this.editable || (this.style.getSheetInstance() !== null && !this.style.getSheetInstance().isEditable()));
    };
    SheetVariableimageselect.prototype.change = function (e) {
        var obj;
        try {
            obj = JSON.parse(this.select.value);
            if (Array.isArray(obj) && obj.length === 2) {
                this.storeValue(obj);
            }
        }
        catch (e) {
            console.log("[SheetVariableImageSelect] Produced invalid Array at " + this.id + ":", this.select.value, e);
            this.storeValue([this.defaultName, this.defaultUrl]);
        }
    };
    SheetVariableimageselect.prototype.click = function (e) {
        this.updateOptions();
    };
    return SheetVariableimageselect;
}(SheetVariable));
var SheetButtonaddrow = /** @class */ (function (_super) {
    __extends(SheetButtonaddrow, _super);
    function SheetButtonaddrow(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        _this.sheetInstanceChangeListener = (function () { this.updateVisible(); }).bind(_this);
        _this.target = _this.visible.dataset["target"] === undefined ? "" : _this.visible.dataset['target'];
        style.addSheetInstanceChangeListener(_this.sheetInstanceChangeListener);
        return _this;
    }
    SheetButtonaddrow.prototype.updateVisible = function () {
        if (this.style.getSheetInstance().isEditable()) {
            this.visible.style.display = "";
        }
        else {
            this.visible.style.display = "none";
        }
    };
    SheetButtonaddrow.prototype.click = function (e) {
        e.preventDefault();
        var list = this.parent.getField(this.target);
        if (list !== null) {
            list.addRow();
        }
    };
    return SheetButtonaddrow;
}(SheetButton));
var SheetButtonremoverow = /** @class */ (function (_super) {
    __extends(SheetButtonremoverow, _super);
    function SheetButtonremoverow(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        _this.sheetInstanceChangeListener = (function () { this.updateVisible(); }).bind(_this);
        style.addSheetInstanceChangeListener(_this.sheetInstanceChangeListener);
        return _this;
    }
    SheetButtonremoverow.prototype.updateVisible = function () {
        if (this.style.getSheetInstance().isEditable()) {
            this.visible.style.display = "";
        }
        else {
            this.visible.style.display = "none";
        }
    };
    SheetButtonremoverow.prototype.click = function (e) {
        e.preventDefault();
        this.parent.getParent().removeRow(this.parent);
    };
    return SheetButtonremoverow;
}(SheetButton));
var SheetButtondice = /** @class */ (function (_super) {
    __extends(SheetButtondice, _super);
    function SheetButtondice(parent, style, element) {
        var _this = _super.call(this, parent, style, element) || this;
        _this.diceAmount = _this.visible.dataset['dices'] === undefined ? 0 : parseInt(_this.visible.dataset['dices']);
        _this.diceFaces = _this.visible.dataset['faces'] === undefined ? 0 : parseInt(_this.visible.dataset['faces']);
        _this.modifier = _this.visible.dataset['modifier'] === undefined ? "0" : _this.visible.dataset['modifier'];
        _this.reason = _this.visible.dataset['reason'] === undefined ? null : _this.visible.dataset['reason'];
        _this.parse();
        return _this;
    }
    SheetButtondice.prototype.getReason = function () {
        return this.reason;
    };
    SheetButtondice.prototype.click = function (e) {
        e.preventDefault();
        if (UI.Chat.getRoom() !== null) {
            var dice = this.createMessage();
            UI.Chat.sendMessage(dice);
        }
    };
    SheetButtondice.prototype.createMessage = function () {
        var dice = new MessageDice();
        dice.setPersona(this.style.getSheetInstance().getName());
        var value = this.getValue();
        var reason = this.createReason(value);
        dice.setMsg(reason);
        dice.setMod(value);
        dice.addDice(this.diceAmount, this.diceFaces);
        if (UI.Chat.Forms.isDiceTower()) {
            dice.addDestinationStorytellers(UI.Chat.getRoom());
        }
        return dice;
    };
    SheetButtondice.prototype.createReason = function (value) {
        var reason = this.diceAmount !== 0 && this.diceFaces !== 0 ? this.diceAmount.toString() + "d" + this.diceFaces.toString() : "";
        if (value.toString() === this.modifier) {
            if (value === 0 && reason === "") {
                reason = value.toString();
            }
            else if (value !== 0) {
                if (value < 0) {
                    reason += " - " + Math.abs(value).toString();
                }
                else {
                    reason += " + " + value;
                }
            }
        }
        else {
            if (reason === "") {
                reason = this.modifier + " = " + value;
            }
            else {
                reason += " + " + this.modifier + " = " + reason + " + " + value;
            }
        }
        if (this.reason !== null) {
            reason += ". " + this.reason;
        }
        return reason;
    };
    SheetButtondice.prototype.parse = function () {
        var expr = this.modifier;
        expr = Sheet.simplifyString(expr);
        try {
            this.parsed = math.parse(expr);
            this.compiled = math.compile(expr);
        }
        catch (e) {
            console.warn("[SheetButtonDice] Invalid Math expression. Error:", e);
            this.parsed = math.parse("0");
            this.compiled = math.compile("0");
        }
        this.symbols = this.getSymbols();
        this.scope = this.getScope(this.symbols);
    };
    SheetButtondice.prototype.getSymbols = function () {
        var symbols = [];
        var nodes = this.parsed.filter(function (node) {
            return node.type == 'SymbolNode';
        });
        for (var i = 0; i < nodes.length; i++) {
            symbols.push(nodes[i].name);
        }
        return symbols;
    };
    SheetButtondice.prototype.getScope = function (symbols) {
        var scope = {};
        for (var i = 0; i < symbols.length; i++) {
            scope[symbols[i]] = 0;
        }
        return scope;
    };
    SheetButtondice.prototype.getValue = function () {
        for (var i = 0; i < this.symbols.length; i++) {
            this.scope[this.symbols[i]] = this.style.getSheet().getValueFor(this.symbols[i]);
        }
        try {
            var result = this.compiled.eval(this.scope);
            return result;
        }
        catch (e) {
            console.warn("[SheetButtonDice] Evaluation error", e);
            return NaN;
        }
    };
    return SheetButtondice;
}(SheetButton));
var SheetButtonsort = /** @class */ (function (_super) {
    __extends(SheetButtonsort, _super);
    function SheetButtonsort() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SheetButtonsort.prototype.click = function (e) {
        e.preventDefault();
        var list = this.parent.getField(this.target);
        if (list !== null) {
            list.sort();
        }
    };
    return SheetButtonsort;
}(SheetButtonaddrow));
var SheetButtoncommonsroll = /** @class */ (function (_super) {
    __extends(SheetButtoncommonsroll, _super);
    function SheetButtoncommonsroll() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SheetButtoncommonsroll.prototype.click = function (e) {
        e.preventDefault();
        var diceAmount = Number(this.parent.getValueFor("Dice Amount"));
        var diceFaces = Number(this.parent.getValueFor("Dice Faces"));
        var modifierVariable = this.parent.findField("Dice Modifier");
        var modText;
        if (modifierVariable !== null) {
            modText = modifierVariable.getValue();
        }
        else {
            modText = "0";
        }
        if (isNaN(diceAmount) || isNaN(diceFaces)) {
            diceAmount = 0;
            diceFaces = 0;
        }
        else {
            diceAmount = Math.floor(diceAmount);
            diceFaces = Math.floor(diceFaces);
            if (diceAmount <= 0 || diceFaces <= 0) {
                diceAmount = 0;
                diceFaces = 0;
            }
        }
        if (typeof modText !== "string") {
            modText = "0";
        }
        this.parse(modText);
        var modValue = this.getValue();
        var reason = "";
        if (diceAmount !== 0) {
            reason += diceAmount + "d" + diceFaces;
            if (modText !== "0") {
                reason += " + (" + modText + ")";
            }
        }
        else {
            reason += modText;
        }
        if (modText !== modValue.toString()) {
            reason += " = ";
            if (diceAmount !== 0) {
                reason += diceAmount + "d" + diceFaces;
                if (modValue !== 0) {
                    if (modValue > 0) {
                        reason += " + " + modValue;
                    }
                    else {
                        reason += " - " + Math.abs(modValue);
                    }
                }
            }
            else {
                if (modValue > 0) {
                    reason += " +" + modValue;
                }
                else {
                    reason += " -" + Math.abs(modValue);
                }
            }
        }
        if (UI.Chat.getRoom() !== null) {
            var dice = new MessageDice();
            dice.setPersona(this.style.getSheetInstance().getName());
            dice.setMsg(reason);
            dice.setMod(modValue);
            dice.addDice(diceAmount, diceFaces);
            if (UI.Chat.Forms.isDiceTower()) {
                dice.addDestinationStorytellers(UI.Chat.getRoom());
            }
            UI.Chat.sendMessage(dice);
        }
    };
    SheetButtoncommonsroll.prototype.getSymbols = function () {
        var symbols = [];
        var nodes = this.parsed.filter(function (node) {
            return node.type == 'SymbolNode';
        });
        for (var i = 0; i < nodes.length; i++) {
            symbols.push(nodes[i].name);
        }
        return symbols;
    };
    SheetButtoncommonsroll.prototype.getScope = function (symbols) {
        var scope = {};
        for (var i = 0; i < symbols.length; i++) {
            scope[symbols[i]] = 0;
        }
        return scope;
    };
    SheetButtoncommonsroll.prototype.parse = function (expr) {
        expr = Sheet.simplifyString(expr);
        try {
            this.parsed = math.parse(expr);
            this.compiled = math.compile(expr);
        }
        catch (e) {
            console.warn("[SheetButtonCommonsRoll] Invalid Math expression. Error:", e);
            this.parsed = math.parse("0");
            this.compiled = math.compile("0");
        }
        this.symbols = this.getSymbols();
        this.scope = this.getScope(this.symbols);
    };
    SheetButtoncommonsroll.prototype.getValue = function () {
        for (var i = 0; i < this.symbols.length; i++) {
            this.scope[this.symbols[i]] = this.style.getSheet().getValueFor(this.symbols[i]);
        }
        try {
            var result = this.compiled.eval(this.scope);
            return result;
        }
        catch (e) {
            console.warn("[SheetButtonCommonsRoll] Evaluation error", e);
            return NaN;
        }
    };
    return SheetButtoncommonsroll;
}(SheetButton));
/// <reference path='SheetStyle.ts' />
/// <reference path='SheetStyleTranslatable.ts' />
/// <reference path='Sheet.ts' />
/// <reference path='SheetButton.ts' />
/// <reference path='SheetList.ts' />
/// <reference path='SheetVariable.ts' />
/// <reference path='StyleFactory.ts' />
/// <reference path='SheetCreatorListener.ts' />
/// <reference path='SheetVariable/SheetVariabletext.ts' />
/// <reference path='SheetVariable/SheetVariableLongtext.ts' />
/// <reference path='SheetVariable/SheetVariablenumber.ts' />
/// <reference path='SheetVariable/SheetVariableinteger.ts' />
/// <reference path='SheetVariable/SheetVariablemath.ts' />
/// <reference path='SheetVariable/SheetVariableimage.ts' />
/// <reference path='SheetVariable/SheetVariableselect.ts' />
/// <reference path='SheetVariable/SheetVariableboolean.ts' />
/// <reference path='SheetVariable/SheetVariableimageselect.ts' />
/// <reference path='SheetButton/SheetButtonaddrow.ts' />
/// <reference path='SheetButton/SheetButtonremoverow.ts' />
/// <reference path='SheetButton/SheetButtonDice.ts' />
/// <reference path='SheetButton/SheetButtonsort.ts' />
/// <reference path='SheetButton/SheetButtoncommonsroll.ts' />
/**
 * Created by Reddo on 14/09/2015.
 */
/// <reference path='Interfaces/Listener.ts' />
/// <reference path='Interfaces/PageManagerPage.ts' />
/// <reference path='Interfaces/PersonaInfo.ts' />
/// <reference path='Interfaces/PersonaLocalInfo.ts' />
/// <reference path='Interfaces/ChatController.ts' />
/// <reference path='Interfaces/ImageInt.ts' />
/// <reference path='Interfaces/StyleInfo.ts' />
/// <reference path='Classes/Trigger.ts' />
/// <reference path='Classes/Changelog.ts' />
/// <reference path='Classes/ImageRed.ts' />
/// <reference path='Classes/ImageLink.ts' />
/// <reference path='Classes/User.ts' />
/// <reference path='Classes/UserGameContext.ts' />
/// <reference path='Classes/UserRoomContext.ts' />
/// <reference path='Classes/Room.ts' />
/// <reference path='Classes/Game.ts' />
/// <reference path='Classes/SheetInstance.ts' />
/// <reference path='Classes/StyleInstance.ts' />
/// <reference path='Classes/SoundLink.ts' />
/// <reference path='Classes/PseudoLanguage.ts' />
/// <reference path='Classes/AJAXConfig.ts' />
/// <reference path='Classes/WebsocketController.ts' />
/// <reference path='Classes/ChatWsController.ts' />
/// <reference path='Classes/Configuration.ts' />
/// <reference path='Classes/Configuration/NumberConfiguration.ts' />
/// <reference path='Classes/Configuration/WsportConfiguration.ts' />
/// <reference path='Classes/Configuration/LanguageConfiguration.ts' />
/// <reference path='Classes/Configuration/BooleanConfiguration.ts' />
/// <reference path='Classes/TrackerMemory.ts' />
/// <reference path='Classes/Memory/MemoryCombat.ts' />
/// <reference path='Classes/Memory/MemoryFilter.ts' />
/// <reference path='Classes/Memory/MemoryPica.ts' />
/// <reference path='Classes/Memory/MemoryLingo.ts' />
/// <reference path='Classes/Memory/MemoryVersion.ts' />
/// <reference path='Classes/Memory/MemoryCutscene.ts' />
/// <reference path='Classes/Memory/Combat/CombatEffect.ts' />
/// <reference path='Classes/Memory/Combat/CombatParticipant.ts' />
/// <reference path='Elements/ChatCombatRow.ts' />
/// <reference path='Elements/ChatInfo.ts' />
/// <reference path='Elements/ChatAvatar.ts' />
/// <reference path='Elements/ChatNotificationIcon.ts' />
/// <reference path='Elements/ChatFormState.ts' />
/// <reference path='Elements/ChatAvatarChoice.ts' />
/// <reference path='Elements/ChatSystemMessage.ts' />
/// <reference path='Elements/ImagesRow.ts' />
/// <reference path='Elements/ImagesFolder.ts' />
/// <reference path='Elements/SheetsRow.ts' />
/// <reference path='Elements/SheetsFolder.ts' />
/// <reference path='Elements/SheetPermRow.ts' />
/// <reference path='Elements/SoundsRow.ts' />
/// <reference path='Elements/SoundsFolder.ts' />
/// <reference path='Elements/Sheet/SheetTab.ts' />
/// <reference path='Classes/PseudoLanguage/References.ts' />
/// <reference path='Classes/Sheets/References.ts' />
var MessageFactory;
(function (MessageFactory) {
    var messageClasses = {};
    var messageClassesArray = [];
    var messageSlash = {};
    var allArray = [];
    var allSlashes = [];
    function getCommandsAndSlashes() {
        var result = [];
        for (var i = 0; i < allArray.length; i++) {
            result.push([allArray[i], allSlashes[i]]);
        }
        return result.sort(function (a, b) {
            var na = (a[0].name).toLowerCase();
            var nb = (b[0].name).toLowerCase();
            if (na < nb)
                return -1;
            if (nb < na)
                return 1;
            return 0;
        });
    }
    MessageFactory.getCommandsAndSlashes = getCommandsAndSlashes;
    /**
     * Registers a message class for later use.
     * Messages are created when users type commands or when the system requires a message by name.
     * @param msg
     * @param id
     * @param slashCommands
     */
    function registerMessage(msg, id, slashCommands) {
        if (messageClasses[id] !== undefined) {
            console.warn("Attempt to overwrite message type at " + id + ". Ignoring. Offending class:", msg);
            return;
        }
        if (messageClassesArray.indexOf(msg) === -1) {
            messageClassesArray.push(msg);
        }
        messageClasses[id] = msg;
        var idx = allArray.indexOf(msg);
        if (slashCommands.length > 0) {
            if (idx == -1) {
                idx = allArray.push(msg) - 1;
                allSlashes.push([]);
            }
        }
        for (var i = 0; i < slashCommands.length; i++) {
            if (messageSlash[slashCommands[i]] !== undefined) {
                console.warn("Attempt to overwrite message slash command at " + slashCommands[i] + ". Ignoring. Offending class:", msg);
                continue;
            }
            messageSlash[slashCommands[i]] = msg;
            allSlashes[idx].push(slashCommands[i]);
        }
    }
    MessageFactory.registerMessage = registerMessage;
    function getMessagetypeArray() {
        return messageClassesArray;
    }
    MessageFactory.getMessagetypeArray = getMessagetypeArray;
    /**
     * Registers a slashcommand class for later use.
     * SlashCommands are called when users type commands.
     * @param slash
     * @param slashCommands
     */
    function registerSlashCommand(slash, slashCommands) {
        var idx = allArray.indexOf(slash);
        if (slashCommands.length > 0) {
            if (idx == -1) {
                idx = allArray.push(slash) - 1;
                allSlashes.push([]);
            }
        }
        for (var i = 0; i < slashCommands.length; i++) {
            if (messageSlash[slashCommands[i]] !== undefined) {
                console.warn("Attempt to overwrite message slash command at " + slashCommands[i] + ". Ignoring. Offending class:", slash);
                continue;
            }
            messageSlash[slashCommands[i]] = slash;
            allSlashes[idx].push(slashCommands[i]);
        }
    }
    MessageFactory.registerSlashCommand = registerSlashCommand;
    /**
     * Returns a new instance of Message for the given id. Can return MessageUnknown.
     * @param id
     * @returns {any}
     */
    function createMessageFromType(id) {
        id = id.toLowerCase();
        if (messageClasses[id] !== undefined) {
            return new messageClasses[id]();
        }
        return new MessageUnknown();
    }
    MessageFactory.createMessageFromType = createMessageFromType;
    /**
     * Creates examples of every Message class for testing purposes.
     * @returns {Array<Message>}
     */
    function createTestingMessages() {
        var list = [];
        for (var id in messageClasses) {
            var message = new messageClasses[id]();
            list = list.concat(message.makeMockUp());
        }
        return list;
    }
    MessageFactory.createTestingMessages = createTestingMessages;
    function getConstructorFromText(form) {
        var index = form.indexOf(' ');
        if (index !== -1) {
            var slash = form.substr(0, index).toLowerCase();
            var msg = form.substr(index + 1);
        }
        else {
            var slash = form;
            var msg = "";
        }
        if (messageSlash[slash] !== undefined) {
            return messageSlash[slash];
        }
        return null;
    }
    MessageFactory.getConstructorFromText = getConstructorFromText;
    /**
     * Runs a form through a SlashCommand. Returns a Message if the SlashCommand was valid and for a Message.
     * @param form
     * @returns {any}
     */
    function createFromText(form) {
        var index = form.indexOf(' ');
        if (index !== -1) {
            var slash = form.substr(0, index).toLowerCase();
            var msg = form.substr(index + 1);
        }
        else {
            var slash = form;
            var msg = "";
        }
        if (messageSlash[slash] !== undefined) {
            var command = new messageSlash[slash]();
            var valid = command.receiveCommand(slash, msg);
            if (valid && command.isMessage()) {
                return command;
            }
            else if (!valid) {
                var errorHTML = command.getInvalidHTML(slash, msg);
                if (errorHTML !== null)
                    UI.Chat.printElement(errorHTML);
                return null;
            }
            else {
                return null;
            }
        }
        var error = new ChatSystemMessage(true);
        error.addText("_CHATINVALIDCOMMAND_");
        UI.Chat.printElement(error.getElement());
        return null;
    }
    MessageFactory.createFromText = createFromText;
})(MessageFactory || (MessageFactory = {}));
var SlashCommand = /** @class */ (function () {
    function SlashCommand() {
    }
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    SlashCommand.prototype.receiveCommand = function (slashCommand, message) {
        console.error("SlashCommand.receiveCommand is abstract. Offending class:", this.constructor['name'], this);
        return false;
    };
    /**
     * Informs MessageFactory whether this SlashCommand is a message or not. Probably doesn't have to be changed.
     * @returns {boolean}
     */
    SlashCommand.prototype.isMessage = function () {
        return this instanceof Message;
    };
    /**
     * HTMLElement that should be printed when receiveCommand returns false.
     * @param slashCommand
     * @param msg
     * @returns {HTMLElement|null}
     */
    SlashCommand.prototype.getInvalidHTML = function (slashCommand, msg) {
        return null;
    };
    return SlashCommand;
}());
var SlashClear = /** @class */ (function (_super) {
    __extends(SlashClear, _super);
    function SlashClear() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SlashClear.prototype.receiveCommand = function (slashCommand, message) {
        if (message.trim() == "1") {
            if (confirm(UI.Language.getLanguage().getLingo("_REALLYDELETEMESSAGESFOREVER_"))) {
                Server.Chat.clearForever(Server.Chat.getRoom().id, { handleEvent: function () { UI.Chat.clearRoom(); } });
            }
        }
        else {
            UI.Chat.clearRoom();
        }
        return true;
    };
    return SlashClear;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashClear, ["/clear", "/clr", "/cls"]);
var SlashReply = /** @class */ (function (_super) {
    __extends(SlashReply, _super);
    function SlashReply() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SlashReply;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashReply, ["/r", "/reply", "/responder", "/resposta"]);
var SlashImages = /** @class */ (function (_super) {
    __extends(SlashImages, _super);
    function SlashImages() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    SlashImages.prototype.receiveCommand = function (slashCommand, message) {
        var room = Server.Chat.getRoom();
        if (room === null)
            return false;
        var messages = MessageImage.getLastImages(room.id);
        if (messages.length > 0) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATIMAGESPRINTINGIMAGES_");
            UI.Chat.printElement(msg.getElement());
            MessageImage.stopAutomation();
            for (var i = messages.length - 1; i >= 0; i--) {
                UI.Chat.printMessage(messages[i]);
            }
            MessageImage.resumeAutomation();
        }
        else {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATIMAGESNOIMAGES_");
            UI.Chat.printElement(msg.getElement());
        }
        return true;
    };
    return SlashImages;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashImages, ["/images", "/imgs", "/imagens", "/fotos", "/picas"]);
var SlashLog = /** @class */ (function (_super) {
    __extends(SlashLog, _super);
    function SlashLog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    SlashLog.prototype.receiveCommand = function (slashCommand, message) {
        var cbs = {
            room: Server.Chat.getRoom(),
            handleEvent: function () {
                UI.Logger.callSelf(this.room);
            }
        };
        Server.Chat.getAllMessages(Server.Chat.getRoom().id, cbs);
        return true;
    };
    return SlashLog;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashLog, ["/log", "/logger"]);
var SlashLingo = /** @class */ (function (_super) {
    __extends(SlashLingo, _super);
    function SlashLingo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    SlashLingo.prototype.receiveCommand = function (slashCommand, message) {
        var translatedMsg;
        var pseudoMsg;
        var storyMode = slashCommand.toLowerCase().indexOf("sto") !== -1 || slashCommand.toLowerCase().indexOf("hist") !== -1;
        var quoteMode = slashCommand.toLowerCase().indexOf("quo") !== -1 || slashCommand.toLowerCase().indexOf("cit") !== -1;
        var sentence = message.substring(message.indexOf(',') + 1, message.length).trim();
        if (storyMode && !Server.Chat.getRoom().getMe().isStoryteller()) {
            return false;
        }
        if (quoteMode && !Server.Chat.getRoom().getMe().isStoryteller()) {
            return false;
        }
        else {
            translatedMsg = new MessageQuote();
            translatedMsg.receiveCommand("", sentence);
            pseudoMsg = new MessageQuote();
            pseudoMsg.receiveCommand("", sentence);
            sentence = translatedMsg.getMsg();
        }
        var wantedLingo = message.substring(0, message.indexOf(','));
        var lingo = PseudoLanguage.getLanguage(wantedLingo);
        if (lingo === null) {
            return false;
        }
        var mem = Server.Chat.Memory.getConfiguration("Lingo");
        if (!Server.Chat.getRoom().getMe().isStoryteller() && !mem.isSpeaker(Server.Chat.getRoom().getMe().getUser().id, wantedLingo)) {
            return false;
        }
        var beginners = ['*', '[', '{', '('];
        var enders = ['*', ']', '}', ')'];
        var endResult = "";
        var currentSentence = "";
        var waitingFor = null;
        for (var i = 0; i < sentence.length; i++) {
            var character = sentence.charAt(i);
            if (waitingFor !== null) {
                currentSentence += character;
                if (character === waitingFor) {
                    endResult += currentSentence;
                    currentSentence = "";
                    waitingFor = null;
                }
            }
            else {
                var idx = beginners.indexOf(character);
                if (idx === -1) {
                    currentSentence += character;
                }
                else {
                    waitingFor = enders[idx];
                    if (currentSentence.length > 0) {
                        endResult += lingo.translate(currentSentence);
                    }
                    currentSentence = character;
                }
            }
        }
        if (currentSentence.length > 0) {
            endResult += lingo.translate(currentSentence);
        }
        //alert(endResult);
        if (storyMode) {
            translatedMsg = new MessageStory();
            pseudoMsg = new MessageStory();
        }
        else if (!quoteMode) {
            translatedMsg = new MessageRoleplay();
            pseudoMsg = new MessageRoleplay();
        }
        translatedMsg.setMsg(endResult);
        translatedMsg.findPersona();
        translatedMsg.setSpecial("translation", sentence);
        translatedMsg.setSpecial("language", wantedLingo);
        pseudoMsg.setMsg(endResult);
        pseudoMsg.setSpecial("language", wantedLingo);
        pseudoMsg.findPersona();
        var speakers = mem.getSpeakers(wantedLingo);
        translatedMsg.addDestinationStorytellers(Server.Chat.getRoom());
        for (var i = 0; i < speakers.length; i++) {
            translatedMsg.addDestination(speakers[i].getUser());
        }
        pseudoMsg.setSpecial("ignoreFor", translatedMsg.getDestinationArray());
        UI.Chat.sendMessage(translatedMsg);
        UI.Chat.sendMessage(pseudoMsg);
        return true;
    };
    /**
     * HTMLElement that should be printed when receiveCommand returns false.
     * @param slashCommand
     * @param msg
     * @returns {HTMLElement|null}
     */
    SlashLingo.prototype.getInvalidHTML = function (slashCommand, message) {
        var smsg = new ChatSystemMessage(true);
        if (slashCommand.toLowerCase().indexOf("sto") !== -1 && !Server.Chat.getRoom().getMe().isStoryteller()) {
            smsg.addText("_SLASHLINGOINVALIDONLYGM_");
        }
        else {
            var wantedLingo = message.substring(0, message.indexOf(','));
            var lingo = PseudoLanguage.getLanguage(wantedLingo);
            var mem = Server.Chat.Memory.getConfiguration("Lingo");
            if (lingo === null) {
                smsg.addText("_SLASHLINGOINVALIDNOSUCHLINGO_");
            }
            else if (!Server.Chat.getRoom().getMe().isStoryteller() && !mem.isSpeaker(Server.Chat.getRoom().getMe().getUser().id, wantedLingo)) {
                smsg.addText("_SLASHLINGOINVALIDYOUKNOWNOTHINGINNOCENT_");
            }
            else {
                smsg.addText("_SLASHLINGOINVALID_");
            }
        }
        return smsg.getElement();
    };
    return SlashLingo;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashLingo, (function () {
    var arr = ["/lang", "/ling", "/lingo", "/language", "/lingua"];
    var defaultArr = arr.slice();
    defaultArr.forEach(function (slashC) {
        arr.push(slashC + "hist");
        arr.push(slashC + "sto");
        arr.push(slashC + "quo");
        arr.push(slashC + "cit");
    });
    return arr;
})());
var SlashPica = /** @class */ (function (_super) {
    __extends(SlashPica, _super);
    function SlashPica() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    SlashPica.prototype.receiveCommand = function (slashCommand, message) {
        var room = Server.Chat.getRoom();
        if (room === null)
            return false;
        var link = "images/GreatBigPica.png?code=";
        message = message.trim();
        var code = message;
        if (code == "") {
            code = 'xxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        link += encodeURIComponent(code);
        if (message == "") {
            message = UI.Language.getLanguage().getLingo("_SLASHPICANONAME_");
        }
        MessageImage.shareLink(message, link);
        return true;
    };
    return SlashPica;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashPica, ["/pica", "/quadro", "/board", "/desenho", "/drawing"]);
var SlashCommands = /** @class */ (function (_super) {
    __extends(SlashCommands, _super);
    function SlashCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns false for invalid commands. Returns true for valid commands.
     * @param slashCommand
     * @param message
     */
    SlashCommands.prototype.receiveCommand = function (slashCommand, message) {
        var room = Server.Chat.getRoom();
        if (room === null)
            return false;
        var commands = MessageFactory.getCommandsAndSlashes();
        var msg = new ChatSystemMessage(true);
        msg.addText("_CHATHELPCOMMANDSINTRO_");
        for (var i = 0; i < commands.length; i++) {
            var name_1 = commands[i][0].name.toUpperCase();
            var slashes = commands[i][1];
            msg.addLineBreak();
            msg.addLineBreak();
            msg.addText(slashes[0] + ": ");
            msg.addText("_CHATHELP" + name_1 + "_");
            msg.addText(" [" + slashes.join("; ") + "]");
            UI.Chat.printElement(msg.getElement());
        }
        return true;
    };
    return SlashCommands;
}(SlashCommand));
MessageFactory.registerSlashCommand(SlashCommands, ["/help", "/ajuda", "/comandos", "/commands", "/howdo", "/comofas"]);
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
var Message = /** @class */ (function (_super) {
    __extends(Message, _super);
    function Message() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 0;
        _this.localid = null;
        _this.wasLocal = false;
        _this.roomid = null;
        _this.date = null;
        _this.module = "";
        _this.msg = "";
        _this.special = {};
        _this.sending = null;
        _this.origin = 0;
        _this.destination = null;
        _this.updatedTrigger = new Trigger();
        _this.html = null;
        _this.clone = false;
        return _this;
    }
    Message.prototype.getDate = function () {
        if (this.date === "" || this.date === null) {
            return null;
        }
        return this.date;
    };
    Message.prototype.onPrint = function () { };
    ;
    Message.prototype.setPersona = function (name) {
        this.setSpecial("persona", name);
    };
    Message.prototype.getPersona = function () {
        return this.getSpecial("persona", "???");
    };
    Message.prototype.findPersona = function () { };
    /**
     * Assigns this message a localId
     */
    Message.prototype.getLocalId = function () {
        if (this.localid === null)
            DB.MessageDB.registerLocally(this);
        this.wasLocal = true;
    };
    Message.prototype.wasLocalMessage = function () {
        return this.wasLocal;
    };
    /**
     * Returns the UserRoomContext for the sender. ALWAYS returns a user, even if Origin is invalid (returns a new UserRoomContext() in this case).
     * @returns {UserRoomContext}
     */
    Message.prototype.getUser = function () {
        var user = DB.UserDB.getAUser(this.origin);
        var context = user.getRoomContext(this.roomid);
        if (context === null) {
            context = new UserRoomContext(user);
            context.roomid = this.roomid;
            if (this.origin !== 0) { // Origin 0 means this is a mockup, warnings are not necessary
                console.warn("[MESSAGE] Could not find user Room Context for " + this.origin + ", creating a new one.");
            }
        }
        return context;
    };
    Message.prototype.addDestinationStorytellers = function (room) {
        if (room === null) {
            return;
        }
        var storytellers = room.getStorytellers();
        for (var i = 0; i < storytellers.length; i++) {
            this.addDestination(storytellers[i].getUser());
        }
    };
    Message.prototype.addDestination = function (user) {
        if (this.destination === null) {
            this.destination = [user.id];
        }
        else if (typeof this.destination === "number") {
            this.destination = [this.destination, user.id];
        }
        else if (Array.isArray(this.destination)) {
            this.destination.push(user.id);
        }
        else {
            console.warn("[MESSAGE] Attempt to add user to unknown destination type? What gives? Offending user and message:", user, this);
        }
    };
    Message.prototype.getDestinationArray = function () {
        if (!Array.isArray(this.destination)) {
            if (this.destination !== undefined && this.destination !== null) {
                return [this.destination];
            }
            else {
                return [];
            }
        }
        else {
            return this.destination;
        }
    };
    Message.prototype.getDestinations = function () {
        if (Array.isArray(this.destination)) {
            var users = [];
            for (var i = 0; i < this.destination.length; i++) {
                var user = DB.UserDB.getAUser(this.destination[i]);
                var context = user.getRoomContext(this.roomid);
                if (context === null) {
                    context = new UserRoomContext(user);
                    context.roomid = this.roomid;
                    console.warn("[MESSAGE] Could not find user Room Context for " + this.destination[i] + ", creating a new one.");
                }
                users.push(context);
            }
            return users;
        }
        else {
            var user = DB.UserDB.getAUser(this.destination);
            var context = user.getRoomContext(this.roomid);
            if (context === null) {
                context = new UserRoomContext(user);
                context.roomid = this.roomid;
                console.warn("[MESSAGE] Could not find user Room Context for " + this.destination + ", creating a new one.");
            }
            return [context];
        }
    };
    /**
     * Returns whether this message is public or has a given destinatary
     * @return boolean
     */
    Message.prototype.hasDestination = function () {
        return this.destination !== null && this.destination !== 0;
    };
    /**
     * Returns an Array of Messages meant for testing. This array should include all variations of this message type. Should include self for optimization.
     * @returns {Message[]}
     */
    Message.prototype.makeMockUp = function () {
        this.msg = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent volutpat orci nulla, et dictum turpis commodo a. Duis iaculis neque lectus, ac sodales diam varius id.";
        return [this];
    };
    /**
     * Returns whether this is a whisper or not.
     * @returns {boolean}
     */
    Message.prototype.isWhisper = function () {
        if (Array.isArray(this.destination)) {
            return this.destination.length > 0;
        }
        return this.destination !== null && this.destination !== 0;
    };
    /**
     * Was this message sent by the current user?
     * @returns {boolean}
     */
    Message.prototype.isMine = function () {
        return this.origin === Application.getMyId();
    };
    /**
     * Returns an HTMLElement representing the Message. Can be null for Messages that should not be seen.
     * @returns {HTMLElement|Null}
     */
    Message.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.appendChild(document.createTextNode("_CHATMESSAGEUNKNOWNTYPE_"));
        p.dataset['a'] = this.msg;
        return p;
    };
    Message.prototype.getHTML = function () {
        if (this.html === null) {
            this.html = this.createHTML();
        }
        return this.html;
    };
    Message.prototype.prepareSending = function () {
        this.origin = Application.getMyId();
        this.getLocalId();
        var html = this.getHTML();
        if (html !== null && this.html === html) {
            this.html.classList.add("chatMessageSending");
            var timeoutFunction = (function (message) {
                var html = message.getHTML();
                if (html !== null) {
                    html.classList.remove("chatMessageSending");
                    html.classList.add("chatMessageError");
                }
                var errorMessage = new ChatSystemMessage(true);
                errorMessage.addText("_CHATMESSAGENOTSENT_");
                errorMessage.addText(" ");
                var click = {
                    message: message,
                    error: errorMessage,
                    handleEvent: function () {
                        var error = this.error.getElement();
                        if (error.parentNode !== null) {
                            error.parentNode.removeChild(error);
                        }
                        var html = this.message.getHTML();
                        if (html !== null) {
                            html.classList.remove("chatMessageError");
                        }
                        UI.Chat.sendMessage(this.message);
                    }
                };
                errorMessage.addTextLink("_CHATMESSAGENOTSENTRESEND_", true, click);
                if (html !== null) {
                    if (html.parentNode !== null) {
                        html.parentNode.insertBefore(errorMessage.getElement(), html.nextSibling);
                        UI.Chat.updateScrollPosition(true);
                    }
                }
            }).bind(null, this);
            this.sending = setTimeout(timeoutFunction, 8000);
        }
    };
    /**
     * Returns the request Special Value. Returns defaultValue if the requested special is not found.
     * @param id
     * @param defaultValue
     * @returns {any}
     */
    Message.prototype.getSpecial = function (id, defaultValue) {
        if (this.special[id] !== undefined) {
            return this.special[id];
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return null;
    };
    /**
     * Stores a Special Value for the assigned Id.
     * @param id
     * @param value
     */
    Message.prototype.setSpecial = function (id, value) {
        this.special[id] = value;
    };
    /**
     * Receives values from an Object.
     * @param obj
     */
    Message.prototype.updateFromObject = function (obj) {
        for (var id in this) {
            if (obj[id] === undefined)
                continue;
            if (id === "localid")
                continue;
            this[id] = obj[id];
        }
        if (typeof this.special === "string") {
            this.special = JSON.parse(this.special);
        }
        this.triggerUpdated();
    };
    Message.prototype.exportAsLog = function () {
        var obj = this.exportAsObject();
        obj['roomid'] = 0;
        obj['id'] = this.id;
        obj['msg'] = obj['message'];
        delete (obj['message']);
        return obj;
    };
    /**
     * Exports Message as an object (meant for server).
     * @returns {{}}
     */
    Message.prototype.exportAsObject = function () {
        var result = {};
        var attributes = [
            'destination', 'module', 'origin', 'roomid', 'date', "clone", 'localid', 'special'
        ];
        for (var i = 0; i < attributes.length; i++) {
            if (this[attributes[i]] !== undefined) {
                result[attributes[i]] = this[attributes[i]];
            }
        }
        if (Array.isArray(this.destination)) {
            delete result['destination'];
            if (this.destination.length === 1) {
                result['destination'] = this.destination[0];
            }
            else {
                result['destination'] = this.destination;
            }
        }
        result["message"] = this.msg;
        //result['special'] = JSON.stringify(this.special);
        return result;
    };
    /**
     * Processes a received SlashCommand from the user.
     * If true is returned, the system will assume that the slashcommand was valid. If false, it'll assume it was invalid.
     * @param slashCommand
     * @param msg
     * @returns {boolean}
     */
    Message.prototype.receiveCommand = function (slashCommand, msg) {
        this.msg = msg;
        return true;
    };
    Message.prototype.setMsg = function (str) {
        this.msg = str;
    };
    Message.prototype.getMsg = function () {
        if (this.msg === null) {
            return "";
        }
        return this.msg;
    };
    Message.prototype.unsetSpecial = function (id) {
        delete (this.special[id]);
    };
    Message.prototype.addUpdatedListener = function (list) {
        this.updatedTrigger.addListener(list);
    };
    Message.prototype.triggerUpdated = function () {
        this.updatedTrigger.trigger(this);
        if (this.sending !== null) {
            clearTimeout(this.sending);
            if (this.html !== null) {
                this.html.classList.remove("chatMessageSending");
            }
            this.sending = null;
        }
        if (this.localid !== null) {
            DB.MessageDB.releaseLocalMessage(this.localid);
        }
    };
    Message.prototype.doNotPrint = function () {
        if (this.clone && this.destination !== null) {
            return true;
        }
        return false;
    };
    return Message;
}(SlashCommand));
var MessageBuff = /** @class */ (function (_super) {
    __extends(MessageBuff, _super);
    function MessageBuff() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "buff";
        _this.playedBefore = false;
        return _this;
    }
    MessageBuff.prototype.onPrint = function () {
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (this.customAutomationPossible()) {
            if (Application.Config.getConfig('chatAutoRolls').getValue() === 1 || (Application.isMe(this.getUser().getUser().id) && this.wasLocalMessage())) {
                this.applyBuff();
                this.playedBefore = true;
            }
        }
    };
    MessageBuff.prototype.customAutomationPossible = function () {
        if (Server.Chat.getRoom() === null || !Server.Chat.getRoom().getMe().isStoryteller() || !UI.Chat.doAutomation()) {
            return false;
        }
        return true;
    };
    MessageBuff.prototype.createHTML = function () {
        var msg = new ChatSystemMessage(true);
        if (Application.isMe(this.origin) && (Server.Chat.getRoom() === null || !Server.Chat.getRoom().getMe().isStoryteller())) {
            msg.addText("_CHATCOMBATBUFFREQUESTED_");
        }
        else {
            var auto = Application.Config.getConfig("chatAutoRolls").getValue() === 1 || (Application.isMe(this.origin) && this.wasLocalMessage());
            if (auto) {
                msg.addText("_CONFIGAUTOROLLAPPLYEFFECT_");
            }
            else {
                msg.addText("_CHATCOMBATBUFFREQUEST_");
            }
            msg.addLangVar("a", this.getUser().getUniqueNickname());
            msg.addLangVar("b", this.getEffectName());
            msg.addLangVar("c", this.getSheetName());
            msg.addText(" ");
            if (!auto) {
                msg.addTextLink("_CHATCOMBATBUFFREQUESTCLICK_", true, {
                    buff: this,
                    handleEvent: function () {
                        this.buff.applyBuff();
                    }
                });
            }
        }
        return msg.getElement();
    };
    MessageBuff.prototype.applyBuff = function () {
        var ce = {
            name: this.getEffectName(),
            target: this.getSheetId(),
            roundEnd: this.getEffectRoundEnd(),
            turnEnd: this.getEffectTurnEnd(),
            endOnStart: this.getEffectEndOnStart(),
            customString: this.getEffectCustomString()
        };
        var memory = Server.Chat.Memory.getConfiguration("Combat");
        memory.addEffect(ce);
        var auto = Application.Config.getConfig("chatAutoRolls").getValue() === 1 || (Application.isMe(this.origin) && this.wasLocalMessage());
        if (!auto) {
            if (this.html !== null && this.html.parentElement !== null) {
                this.html.parentElement.removeChild(this.html);
            }
            this.html = null;
        }
    };
    MessageBuff.prototype.setSheetId = function (id) {
        this.setSpecial("sheetid", id);
    };
    MessageBuff.prototype.getSheetId = function () {
        return this.getSpecial("sheetid", 0);
    };
    MessageBuff.prototype.setSheetName = function (name) {
        this.msg = name;
    };
    MessageBuff.prototype.getSheetName = function () {
        return this.msg;
    };
    MessageBuff.prototype.setEffectName = function (name) {
        this.setSpecial("effectName", name);
    };
    MessageBuff.prototype.getEffectName = function () {
        return this.getSpecial("effectName", "Unknown");
    };
    MessageBuff.prototype.setEffectRoundEnd = function (round) {
        this.setSpecial("effectRoundEnd", round);
    };
    MessageBuff.prototype.getEffectRoundEnd = function () {
        return this.getSpecial("effectRoundEnd", 0);
    };
    MessageBuff.prototype.setEffectTurnEnd = function (turn) {
        this.setSpecial("effectTurnEnd", 0);
    };
    MessageBuff.prototype.getEffectTurnEnd = function () {
        return this.getSpecial("effectTurnEnd", 0);
    };
    MessageBuff.prototype.setEffectEndOnStart = function (endonstart) {
        this.setSpecial("effectEndOnStart", endonstart);
    };
    MessageBuff.prototype.getEffectEndOnStart = function () {
        return this.getSpecial("effectEndOnStart", false);
    };
    MessageBuff.prototype.setEffectCustomString = function (customString) {
        this.setSpecial("effectCustomString", customString);
    };
    MessageBuff.prototype.getEffectCustomString = function () {
        return this.getSpecial("effectCustomString", null);
    };
    return MessageBuff;
}(Message));
MessageFactory.registerMessage(MessageBuff, "buff", []);
var MessagePica = /** @class */ (function (_super) {
    __extends(MessagePica, _super);
    function MessagePica() {
        var _this = _super.call(this) || this;
        _this.module = "pica";
        _this.msgOneArt = "0";
        _this.msgUpdateArts = "1";
        _this.msgRequestUpdate = "2";
        _this.msgClearAll = "3";
        _this.runOnce = false;
        _this.addUpdatedListener((function () {
            this.considerAddingToArtManager();
        }).bind(_this));
        return _this;
    }
    MessagePica.prototype.considerAddingToArtManager = function () {
        var roomid = this.roomid;
        var url = this.getUrl();
        var userLengths = UI.Pica.ArtManager.getLengthByUser(roomid, url);
        var ownLength = userLengths[Application.getMyId()] != undefined ? userLengths[Application.getMyId()] : 0;
        if (this.isCleanArts()) {
            if (this.getUser().isStoryteller()) {
                UI.Pica.ArtManager.removeAllArts(roomid, url);
            }
            else {
                UI.Pica.ArtManager.removeArtFromUser(this.origin, roomid, url);
            }
            return;
        }
        if (this.wasLocalMessage()) {
            return;
        }
        if (!this.isMine() || this.getSpecificConfirmation(Application.getMyId()) != ownLength) {
            if (this.getMsg() == this.msgOneArt) {
                var art = this.getArt();
                UI.Pica.ArtManager.includeArt(roomid, url, art);
                userLengths = UI.Pica.ArtManager.getLengthByUser(roomid, url);
                var senderLengthLocal = userLengths[this.origin] == undefined ? 0 : userLengths[this.origin];
                var senderLengthExt = this.getSpecificConfirmation(this.origin);
                if (senderLengthLocal != senderLengthExt) {
                    console.log("I don't have all art for " + this.origin);
                    var msg = new MessagePica();
                    msg.addDestination(this.getUser().getUser());
                    msg.setUrl(url);
                    msg.setMsg(this.msgRequestUpdate);
                    UI.Chat.sendMessage(msg);
                }
            }
            else if (this.getMsg() == this.msgUpdateArts) {
                var arts = this.getArts();
                UI.Pica.ArtManager.removeArtFromUser(this.origin, roomid, url);
                UI.Pica.ArtManager.includeManyArts(roomid, url, arts);
            }
            else if (this.getMsg() == this.msgRequestUpdate) {
                var msg = new MessagePica();
                msg.addDestination(this.getUser().getUser());
                msg.setUrl(url);
                msg.setMsg(this.msgRequestUpdate);
                msg.setArts(UI.Pica.ArtManager.getMyArtsAsString(roomid, url));
                UI.Chat.sendMessage(msg);
            }
        }
    };
    MessagePica.prototype.setArt = function (art) {
        this.setSpecial("art", art.exportAsObject());
        this.setMsg(this.msgOneArt);
    };
    MessagePica.prototype.setArtString = function (art) {
        this.setSpecial("art", art);
        this.setMsg(this.msgOneArt);
    };
    MessagePica.prototype.getArt = function () {
        var art = this.getSpecial("art", null);
        try {
            if (art != null) {
                var canvasArt = new PicaCanvasArt();
                canvasArt.importFromString(art);
                canvasArt.setUserId(this.origin);
                return canvasArt;
            }
        }
        catch (e) { }
        return null;
    };
    MessagePica.prototype.setArts = function (arts) {
        this.setSpecial("arts", arts);
        this.setMsg(this.msgUpdateArts);
    };
    MessagePica.prototype.getArts = function () {
        var arts = this.getSpecial("arts", null);
        var instanced = [];
        if (Array.isArray(arts)) {
            for (var i = 0; i < arts.length; i++) {
                try {
                    var art = arts[i];
                    var canvasArt = new PicaCanvasArt();
                    canvasArt.importFromString(art);
                    canvasArt.setUserId(this.origin);
                    instanced.push(canvasArt);
                }
                catch (e) { }
                ;
            }
        }
        return instanced;
    };
    MessagePica.prototype.setUrl = function (url) {
        this.setSpecial("url", url);
    };
    MessagePica.prototype.getUrl = function () {
        return this.getSpecial("url", "");
    };
    MessagePica.prototype.getSpecificConfirmation = function (userid) {
        var conf = this.getConfirmation();
        if (conf[userid] == undefined)
            return 0;
        return conf[userid];
    };
    MessagePica.prototype.getConfirmation = function () {
        return this.getSpecial("check", {});
    };
    MessagePica.prototype.setConfirmation = function (userList) {
        this.setSpecial("check", userList);
    };
    MessagePica.prototype.getHTML = function () {
        if (!this.runOnce) {
            this.runOnce = true;
            //this.considerAddingToArtManager();
        }
        return null;
    };
    MessagePica.prototype.setCleanArts = function (isIt) {
        if (isIt) {
            this.setMsg(this.msgClearAll);
        }
    };
    MessagePica.prototype.isCleanArts = function () {
        return this.getMsg() == this.msgClearAll;
    };
    return MessagePica;
}(Message));
MessageFactory.registerMessage(MessagePica, "pica", []);
var MessageSystem = /** @class */ (function (_super) {
    __extends(MessageSystem, _super);
    function MessageSystem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "system";
        return _this;
    }
    MessageSystem.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatMessageSystem");
        var b = document.createElement("b");
        b.appendChild(document.createTextNode("_CHATMESSAGEANNOUNCEMENT_"));
        UI.Language.markLanguage(b);
        p.appendChild(b);
        p.appendChild(document.createTextNode(": " + this.getMsg()));
        return p;
    };
    return MessageSystem;
}(Message));
MessageFactory.registerMessage(MessageSystem, "system", []);
var MessageCountdown = /** @class */ (function (_super) {
    __extends(MessageCountdown, _super);
    function MessageCountdown() {
        var _this = _super.call(this) || this;
        _this.counter = document.createTextNode("99999");
        _this.module = "countdown";
        _this.addUpdatedListener(function (e) {
            var target = e.getTarget();
            if (target !== null) {
                var msg = DB.MessageDB.getMessage(target);
                if (msg !== null) {
                    msg.updateCounter(e.getCounter());
                }
            }
            else {
                e.updateCounter(parseInt(e.getMsg()));
            }
        });
        return _this;
    }
    MessageCountdown.prototype.createHTML = function () {
        if (this.getMsg() === "") {
            return null;
        }
        var counter = parseInt(this.getMsg());
        this.updateCounter(counter);
        if (this.getStory() != undefined) {
            var story = new MessageStory();
            story.origin = this.origin;
            story.setMsg(this.getStory());
            var html = story.getHTML();
            this.counterContainer = document.createElement("span");
            this.counterContainer.appendChild(document.createTextNode(" ("));
            this.counterContainer.appendChild(this.counter);
            this.counterContainer.appendChild(document.createTextNode(")"));
            html.appendChild(this.counterContainer);
            return html;
        }
        else {
            var p = document.createElement("p");
            var span = document.createElement("span");
            if (counter > 0) {
                span.classList.add("chatMessageCounterSpan");
                span.appendChild(this.counter);
                p.classList.add("chatMessageCounter");
            }
            else {
                span.classList.add("chatMessageCounterEndSpan");
                p.classList.add("chatMessageCounterEnd");
            }
            p.appendChild(span);
            return p;
        }
    };
    MessageCountdown.prototype.receiveCommand = function (slash, msg) {
        if (MessageCountdown.timeout !== null) {
            clearTimeout(MessageCountdown.timeout);
            MessageCountdown.timeout = null;
            var message = new MessageCountdown();
            message.setTarget(MessageCountdown.lastTimeout.id);
            message.setMsg("0");
            message.setCounter(0);
            UI.Chat.sendMessage(message);
            MessageCountdown.lastTimeout = null;
        }
        var div = msg.indexOf(",");
        if (div != -1) {
            var story = msg.substr(div + 1, msg.length - div - 1).trim();
            this.setStory(story);
            msg = msg.substr(0, div).trim();
        }
        var counter = parseInt(msg);
        if (isNaN(counter)) {
            return false;
        }
        this.setMsg(counter.toString());
        var func = function () {
            if (this.target.id === 0) {
                MessageCountdown.timeout = setTimeout(this['func'], 1000);
                return;
            }
            var msg;
            if (this.current > 0) {
                msg = new MessageCountdown();
                msg.setTarget(this.target.id);
                msg.setCounter(this.current--);
                MessageCountdown.timeout = setTimeout(this['func'], 1000);
            }
            else if (this.current <= 0) {
                msg = new MessageCountdown();
                msg.setTarget(this.target.id);
                msg.setCounter(this.current);
                msg.setMsg(this.current.toString());
                MessageCountdown.timeout = null;
                MessageCountdown.lastTimeout = null;
            }
            UI.Chat.sendMessage(msg);
        };
        var counterObj = {
            current: counter - 1,
            target: this
        };
        counterObj['func'] = func.bind(counterObj);
        MessageCountdown.lastTimeout = this;
        MessageCountdown.timeout = setTimeout(counterObj['func'], 1000);
        return true;
    };
    MessageCountdown.prototype.getTarget = function () {
        return this.getSpecial("target", null);
    };
    MessageCountdown.prototype.setTarget = function (id) {
        this.setSpecial("target", id);
    };
    MessageCountdown.prototype.setCounter = function (e) {
        this.setSpecial("counter", e);
    };
    MessageCountdown.prototype.getCounter = function () {
        return this.getSpecial("counter", 0);
    };
    MessageCountdown.prototype.updateCounter = function (e) {
        var curr = parseInt(this.counter.nodeValue);
        // Protection against lag and desync. Counters are only supposed to go down.
        if (e < curr) {
            this.counter.nodeValue = e.toString();
        }
        if (this.counterContainer != undefined && e <= 0) {
            this.counterContainer.parentElement.removeChild(this.counterContainer);
            this.counterContainer = undefined;
        }
    };
    MessageCountdown.prototype.setStory = function (storyMessage) {
        this.setSpecial("story", storyMessage);
    };
    MessageCountdown.prototype.getStory = function () {
        return this.getSpecial("story", undefined);
    };
    MessageCountdown.timeout = null;
    return MessageCountdown;
}(Message));
MessageFactory.registerMessage(MessageCountdown, "countdown", ["/countdown", "/count"]);
var MessageVote = /** @class */ (function (_super) {
    __extends(MessageVote, _super);
    function MessageVote() {
        var _this = _super.call(this) || this;
        _this.module = "vote";
        _this.voters = [];
        _this.voteAmountText = document.createTextNode("0");
        _this.votersText = document.createTextNode("");
        _this.addUpdatedListener({
            handleEvent: function (e) {
                if (e.getVoteTarget() !== null) {
                    var target = DB.MessageDB.getMessage(e.getVoteTarget());
                    if (target !== null && target instanceof MessageVote) {
                        target.addVote(e.getUser());
                    }
                }
            }
        });
        return _this;
    }
    MessageVote.prototype.setVoteTarget = function (id) {
        this.setSpecial("castvote", id);
    };
    MessageVote.prototype.getVoteTarget = function () {
        return this.getSpecial("castvote", null);
    };
    MessageVote.prototype.createHTML = function () {
        if (this.getVoteTarget() !== null) {
            return null;
        }
        var p = document.createElement("p");
        p.classList.add("chatMessageVote");
        var a = document.createElement("a");
        a.classList.add("chatMessageVoteAmount");
        a.appendChild(this.voteAmountText);
        p.appendChild(a);
        var reason = document.createElement("span");
        reason.classList.add("chatMessageVoteReason");
        reason.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + " "));
        reason.appendChild(document.createTextNode("_CHATMESSAGEVOTECREATEDVOTE_"));
        reason.appendChild(document.createTextNode(": " + this.getMsg()));
        UI.Language.markLanguage(reason);
        p.appendChild(reason);
        var span = document.createElement("span");
        span.classList.add("chatMessageVoteVoters");
        span.appendChild(this.votersText);
        p.appendChild(span);
        var clickObj = {
            message: this,
            handleEvent: function () {
                var vote = new MessageVote();
                vote.setVoteTarget(this.message.id);
                UI.Chat.sendMessage(vote);
            }
        };
        a.addEventListener("click", clickObj);
        return p;
    };
    MessageVote.prototype.updateVoters = function () {
        this.voteAmountText.nodeValue = this.voters.length.toString();
        var voterNames = [];
        for (var i = 0; i < this.voters.length; i++) {
            voterNames.push(this.voters[i].getUniqueNickname());
        }
        if (this.voters.length > 0) {
            this.votersText.nodeValue = voterNames.join(", ") + ".";
        }
        else {
            this.votersText.nodeValue = "";
        }
    };
    MessageVote.prototype.addVote = function (user) {
        if (this.voters.indexOf(user) === -1) {
            this.voters.push(user);
            this.updateVoters();
        }
        else {
            this.removeVote(user);
        }
    };
    MessageVote.prototype.removeVote = function (user) {
        var index = this.voters.indexOf(user);
        if (index !== -1) {
            this.voters.splice(index, 1);
            this.updateVoters();
        }
    };
    return MessageVote;
}(Message));
MessageFactory.registerMessage(MessageVote, "vote", ["/vote", "/voto", "/votar", "/vota"]);
var MessageWebm = /** @class */ (function (_super) {
    __extends(MessageWebm, _super);
    function MessageWebm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "webm";
        return _this;
    }
    MessageWebm.prototype.createHTML = function () {
        var _this = this;
        var p = document.createElement("p");
        p.classList.add("chatMessageShare");
        p.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + " "));
        p.appendChild(document.createTextNode("_CHATMESSAGESHAREDVIDEO_"));
        var name = this.getName();
        if (name !== null) {
            p.appendChild(document.createTextNode(": " + name + ". "));
        }
        else {
            p.appendChild(document.createTextNode(". "));
        }
        UI.Language.markLanguage(p);
        var a = document.createElement("a");
        a.classList.add("textLink");
        a.appendChild(document.createTextNode("_CHATMESSAGEPLAYVIDEO_"));
        a.appendChild(document.createTextNode("."));
        UI.Language.markLanguage(a);
        a.addEventListener("click", function () {
            UI.IFrame.openRightVideo(_this.getMsg().trim());
        });
        p.appendChild(a);
        return p;
    };
    MessageWebm.prototype.getName = function () {
        return this.getSpecial("name", null);
    };
    MessageWebm.prototype.setName = function (name) {
        this.setSpecial("name", name);
    };
    return MessageWebm;
}(Message));
MessageFactory.registerMessage(MessageWebm, "webm", ["/webm"]);
var MessageVideo = /** @class */ (function (_super) {
    __extends(MessageVideo, _super);
    function MessageVideo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "youtube";
        return _this;
    }
    MessageVideo.prototype.createHTML = function () {
        var _this = this;
        var p = document.createElement("p");
        p.classList.add("chatMessageShare");
        p.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + " "));
        p.appendChild(document.createTextNode("_CHATMESSAGESHAREDVIDEO_"));
        var name = this.getName();
        if (name !== null) {
            p.appendChild(document.createTextNode(": " + name + ". "));
        }
        else {
            p.appendChild(document.createTextNode(". "));
        }
        UI.Language.markLanguage(p);
        var a = document.createElement("a");
        a.classList.add("textLink");
        a.appendChild(document.createTextNode("_CHATMESSAGEPLAYVIDEO_"));
        a.appendChild(document.createTextNode("."));
        UI.Language.markLanguage(a);
        a.addEventListener("click", function () {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            var match = _this.getMsg().trim().match(regExp);
            if (match && match[2].length === 11) {
                UI.IFrame.openRightFrame("https://www.youtube.com/embed/" + match[2]);
            }
            else {
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATYOUTUBEINVALID_");
            }
        });
        p.appendChild(a);
        return p;
    };
    MessageVideo.prototype.getName = function () {
        return this.getSpecial("name", null);
    };
    MessageVideo.prototype.setName = function (name) {
        this.setSpecial("name", name);
    };
    return MessageVideo;
}(Message));
MessageFactory.registerMessage(MessageVideo, "youtube", ["/video", "/youtube"]);
var MessageQuote = /** @class */ (function (_super) {
    __extends(MessageQuote, _super);
    function MessageQuote() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "quote";
        return _this;
    }
    MessageQuote.prototype.createHTML = function () {
        if (this.isIgnored())
            return null;
        var lang = this.getSpecial("language", "none");
        var p = document.createElement("p");
        p.classList.add("chatMessageQuoteParagraph");
        var span = document.createElement("span");
        span.appendChild(document.createTextNode('"' + this.getMsg() + '"'));
        span.classList.add("chatRoleplayLang" + lang);
        p.appendChild(span);
        var name = this.getQuoted();
        if (name !== null) {
            var b = document.createElement("b");
            b.classList.add("chatMessageQuoteQuoted");
            b.appendChild(document.createTextNode("- " + name));
            p.appendChild(b);
        }
        var translation = this.getTranslation();
        if (translation !== null) {
            var span_1 = document.createElement("span");
            span_1.classList.add("chatRoleplayTranslation");
            var b = document.createElement("b");
            b.appendChild(document.createTextNode("_CHATMESSAGEROLEPLAYTRANSLATION_"));
            b.appendChild(document.createTextNode(": "));
            UI.Language.markLanguage(b);
            span_1.appendChild(b);
            span_1.appendChild(document.createTextNode(translation));
            p.appendChild(span_1);
        }
        return p;
    };
    MessageQuote.prototype.setQuoted = function (name) {
        this.setSpecial("name", name);
    };
    MessageQuote.prototype.getQuoted = function () {
        return this.getSpecial("name", null);
    };
    MessageQuote.prototype.receiveCommand = function (slashCommand, message) {
        var name;
        var idx = message.indexOf(",");
        if (idx === -1) {
            name = null;
            message = message.trim();
        }
        else {
            name = message.substr(0, idx).trim();
            message = message.substr(idx + 1, message.length - (idx + 1)).trim();
        }
        this.setQuoted(name);
        this.setMsg(message);
        return true;
    };
    MessageQuote.prototype.isIgnored = function () {
        if (!Application.Login.isLogged())
            return false;
        var ignored = this.getSpecial("ignoreFor", []);
        return ignored.indexOf(Application.Login.getUser().id) !== -1;
    };
    MessageQuote.prototype.setLanguage = function (lang) {
        this.setSpecial("language", lang);
    };
    MessageQuote.prototype.setTranslation = function (message) {
        this.setSpecial("translation", message);
    };
    MessageQuote.prototype.getTranslation = function () {
        return this.getSpecial('translation', null);
    };
    return MessageQuote;
}(Message));
MessageFactory.registerMessage(MessageQuote, "quote", ["/quote", "/citar", "/citação", "/citaçao", "/citacao"]);
var MessageSE = /** @class */ (function (_super) {
    __extends(MessageSE, _super);
    function MessageSE() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "seplay";
        _this.playedBefore = false;
        return _this;
    }
    MessageSE.prototype.onPrint = function () {
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (UI.Chat.doAutomation()) {
            var cfg = Application.Config.getConfig("autoSE").getValue();
            if (cfg === 0)
                return;
            if (this.getUser().isStoryteller() || cfg === 2) {
                UI.SoundController.playSE(this.getMsg());
                this.playedBefore = true;
            }
        }
    };
    MessageSE.prototype.createHTML = function () {
        if (Application.Config.getConfig("hideMessages").getValue()) {
            return null;
        }
        var p = document.createElement("p");
        p.classList.add("chatMessageShare");
        p.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + " "));
        p.appendChild(document.createTextNode("_CHATMESSAGESHAREDSE_"));
        var name = this.getName();
        if (name !== null) {
            p.appendChild(document.createTextNode(": " + name + ". "));
        }
        else {
            p.appendChild(document.createTextNode(". "));
        }
        UI.Language.markLanguage(p);
        var a = document.createElement("a");
        a.classList.add("textLink");
        a.appendChild(document.createTextNode("_CHATMESSAGEPLAYSE_"));
        a.appendChild(document.createTextNode("."));
        a.addEventListener("click", {
            message: this,
            handleEvent: function (e) {
                UI.SoundController.playSE(this.message.getMsg());
            }
        });
        UI.Language.markLanguage(a);
        p.appendChild(a);
        return p;
    };
    MessageSE.prototype.getName = function () {
        return this.getSpecial("name", null);
    };
    MessageSE.prototype.setName = function (name) {
        this.setSpecial("name", name);
    };
    MessageSE.shareLink = function (name, url) {
        var msg = new MessageSE();
        msg.findPersona();
        msg.setName(name);
        msg.setMsg(url);
        UI.Chat.sendMessage(msg);
    };
    return MessageSE;
}(Message));
MessageFactory.registerMessage(MessageSE, "seplay", ["/se", "/seplay", "/soundeffect", "/sound"]);
var MessageImage = /** @class */ (function (_super) {
    __extends(MessageImage, _super);
    function MessageImage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "image";
        _this.openedBefore = false;
        return _this;
    }
    MessageImage.addLastImage = function (msg) {
        if (MessageImage.lastImages[msg.roomid] === undefined) {
            MessageImage.lastImages[msg.roomid] = [msg];
        }
        else {
            var idx = MessageImage.lastImages[msg.roomid].indexOf(msg);
            if (idx === -1) {
                MessageImage.lastImages[msg.roomid].push(msg);
            }
            else {
                MessageImage.lastImages[msg.roomid].splice(idx, 1);
                MessageImage.lastImages[msg.roomid].push(msg);
            }
            if (MessageImage.lastImages[msg.roomid].length > MessageImage.maxHistory) {
                MessageImage.lastImages[msg.roomid].splice(0, 1);
            }
        }
    };
    MessageImage.getLastImages = function (roomid) {
        if (typeof MessageImage.lastImages[roomid] !== "undefined") {
            return MessageImage.lastImages[roomid];
        }
        else {
            return [];
        }
    };
    MessageImage.stopAutomation = function () {
        MessageImage.noAutomation = true;
    };
    MessageImage.resumeAutomation = function () {
        MessageImage.noAutomation = false;
    };
    MessageImage.prototype.onPrint = function () {
        if (this.openedBefore || MessageImage.noAutomation)
            return;
        if (UI.Chat.doAutomation()) {
            var cfg = Application.Config.getConfig("autoImage").getValue();
            if (cfg === 0)
                return;
            if (this.getUser().isStoryteller() || cfg === 2) {
                this.clickLink();
                this.openedBefore = true;
            }
        }
        MessageImage.addLastImage(this);
    };
    MessageImage.prototype.createHTML = function () {
        if (Application.Config.getConfig("hideMessages").getValue() && !MessageImage.noAutomation) {
            return null;
        }
        var p = document.createElement("p");
        p.classList.add("chatMessageShare");
        p.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + " "));
        p.appendChild(document.createTextNode("_CHATMESSAGESHAREDIMAGE_"));
        var name = this.getName();
        if (name !== null) {
            p.appendChild(document.createTextNode(": " + name + ". "));
        }
        else {
            p.appendChild(document.createTextNode(". "));
        }
        UI.Language.markLanguage(p);
        var a = document.createElement("a");
        a.classList.add("textLink");
        a.appendChild(document.createTextNode("_CHATMESSAGESEEIMAGE_"));
        a.appendChild(document.createTextNode("."));
        a.href = this.getMsg();
        a.addEventListener("click", {
            msg: this,
            handleEvent: function (e) {
                e.preventDefault();
                this.msg.clickLink();
            }
        });
        UI.Language.markLanguage(a);
        p.appendChild(a);
        return p;
    };
    MessageImage.prototype.clickLink = function () {
        UI.Pica.loadImage(this.getMsg());
    };
    MessageImage.prototype.getName = function () {
        return this.getSpecial("name", null);
    };
    MessageImage.prototype.setName = function (name) {
        this.setSpecial("name", name);
    };
    MessageImage.shareLink = function (name, url) {
        var newImage = new MessageImage();
        newImage.findPersona();
        newImage.setName(name);
        newImage.setMsg(url);
        UI.Chat.sendMessage(newImage);
    };
    /**
     * Processes a received SlashCommand from the user.
     * If true is returned, the system will assume that the slashcommand was valid. If false, it'll assume it was invalid.
     * @param slashCommand
     * @param msg
     * @returns {boolean}
     */
    MessageImage.prototype.receiveCommand = function (slashCommand, msg) {
        if (msg === "") {
            return false;
        }
        this.msg = msg;
        return true;
    };
    MessageImage.lastImages = {};
    MessageImage.maxHistory = 10;
    MessageImage.noAutomation = false;
    return MessageImage;
}(Message));
MessageFactory.registerMessage(MessageImage, "image", ["/image", "/imagem", "/picture", "/figura", "/pic"]);
var MessageBGM = /** @class */ (function (_super) {
    __extends(MessageBGM, _super);
    function MessageBGM() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "bgmplay";
        _this.playedBefore = false;
        return _this;
    }
    MessageBGM.prototype.onPrint = function () {
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (UI.Chat.doAutomation()) {
            var cfg = Application.Config.getConfig("autoBGM").getValue();
            if (cfg === 0)
                return;
            if (this.getUser().isStoryteller() || cfg === 2) {
                UI.SoundController.playBGM(this.getMsg());
                this.playedBefore = true;
            }
        }
    };
    MessageBGM.prototype.createHTML = function () {
        if (Application.Config.getConfig("hideMessages").getValue()) {
            return null;
        }
        var p = document.createElement("p");
        p.classList.add("chatMessageShare");
        p.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + " "));
        p.appendChild(document.createTextNode("_CHATMESSAGESHAREDBGM_"));
        var name = this.getName();
        if (name !== null) {
            p.appendChild(document.createTextNode(": " + name + ". "));
        }
        else {
            p.appendChild(document.createTextNode(". "));
        }
        UI.Language.markLanguage(p);
        var a = document.createElement("a");
        a.classList.add("textLink");
        a.appendChild(document.createTextNode("_CHATMESSAGEPLAYBGM_"));
        a.appendChild(document.createTextNode("."));
        a.addEventListener("click", {
            message: this,
            handleEvent: function (e) {
                UI.SoundController.playBGM(this.message.getMsg());
            }
        });
        UI.Language.markLanguage(a);
        p.appendChild(a);
        return p;
    };
    MessageBGM.prototype.getName = function () {
        return this.getSpecial("name", null);
    };
    MessageBGM.prototype.setName = function (name) {
        this.setSpecial("name", name);
    };
    MessageBGM.shareLink = function (name, url) {
        var msg = new MessageBGM();
        msg.findPersona();
        msg.setName(name);
        msg.setMsg(url);
        UI.Chat.sendMessage(msg);
    };
    return MessageBGM;
}(Message));
MessageFactory.registerMessage(MessageBGM, "bgmplay", ["/bgm", "/splay", "/bgmplay", "/musica"]);
var MessageStream = /** @class */ (function (_super) {
    __extends(MessageStream, _super);
    function MessageStream() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "stream";
        return _this;
    }
    MessageStream.prototype.createHTML = function () {
        return null;
    };
    return MessageStream;
}(Message));
MessageFactory.registerMessage(MessageStream, "stream", []);
var MessageSheetcommand = /** @class */ (function (_super) {
    __extends(MessageSheetcommand, _super);
    function MessageSheetcommand() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "sheetcmd";
        _this.playedBefore = false;
        return _this;
    }
    MessageSheetcommand.prototype.onPrint = function () {
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (this.customAutomationPossible()) {
            if (Application.Config.getConfig('chatAutoRolls').getValue() === 1 || (Application.isMe(this.getUser().getUser().id) && this.wasLocalMessage())) {
                this.applyCommand();
                this.playedBefore = true;
            }
        }
    };
    MessageSheetcommand.prototype.customAutomationPossible = function () {
        if (Server.Chat.getRoom() === null || !Server.Chat.getRoom().getMe().isStoryteller() || !UI.Chat.doAutomation()) {
            return false;
        }
        return true;
    };
    MessageSheetcommand.prototype.createHTML = function () {
        var msg = new ChatSystemMessage(true);
        if (Application.isMe(this.origin) && (Server.Chat.getRoom() === null || !Server.Chat.getRoom().getMe().isStoryteller())) {
            msg.addText("_CHATCOMMANDREQUESTED_");
        }
        else {
            var auto = Application.Config.getConfig("chatAutoRolls").getValue() === 1 || (Application.isMe(this.origin) && this.wasLocalMessage());
            if (auto) {
                msg.addText("_CHATCOMMANDAUTODID_");
            }
            else {
                msg.addText("_CHATCOMMANDREQUEST_");
            }
            msg.addLangVar("a", this.getUser().getUniqueNickname());
            msg.addLangVar("b", this.getSheetName());
            if (!auto) {
                msg.addText(" ");
                msg.addTextLink("_CHATCOMMANDCLICK_", true, {
                    buff: this,
                    handleEvent: function () {
                        this.buff.applyCommand();
                    }
                });
            }
        }
        return msg.getElement();
    };
    MessageSheetcommand.prototype.applyCommand = function () {
        var sheet = DB.SheetDB.getSheet(this.getSheetId());
        if (sheet === null || !sheet.loaded) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATCOMMANDNOTLOADED_");
            return;
        }
        var style = sheet.getStyle();
        if (style === null || !style.isLoaded()) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATCOMMANDNOTLOADED_");
            return;
        }
        var sheetstyle = StyleFactory.getSheetStyle(style);
        if (sheetstyle === null) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATCOMMANDNOTLOADED_");
            return;
        }
        if (!sheetstyle.processCommand(this)) {
            return;
        }
        var auto = Application.Config.getConfig("chatAutoRolls").getValue() === 1 || (Application.isMe(this.origin) && this.wasLocalMessage());
        if (!auto) {
            if (this.html !== null && this.html.parentElement !== null) {
                this.html.parentElement.removeChild(this.html);
            }
            this.html = null;
        }
    };
    MessageSheetcommand.prototype.setSheetId = function (id) {
        this.setSpecial("sheetid", id);
    };
    MessageSheetcommand.prototype.getSheetId = function () {
        return this.getSpecial("sheetid", 0);
    };
    MessageSheetcommand.prototype.setSheetName = function (name) {
        this.msg = name;
    };
    MessageSheetcommand.prototype.getSheetName = function () {
        return this.msg;
    };
    MessageSheetcommand.prototype.setCustomString = function (customString) {
        this.setSpecial("effectCustomString", customString);
    };
    MessageSheetcommand.prototype.getCustomString = function () {
        return this.getSpecial("effectCustomString", null);
    };
    return MessageSheetcommand;
}(Message));
MessageFactory.registerMessage(MessageSheetcommand, "sheetcmd", []);
var MessageWhisper = /** @class */ (function (_super) {
    __extends(MessageWhisper, _super);
    function MessageWhisper() {
        var _this = _super.call(this) || this;
        _this.module = "whisper";
        var list = function (message) {
            if (!message.isMine()) {
                UI.Chat.Forms.setLastWhisperFrom(message.getUser());
            }
        };
        _this.addUpdatedListener(list);
        return _this;
    }
    MessageWhisper.prototype.onPrint = function () {
        if (!this.isMine() && UI.Chat.doAutomation() && !document.hasFocus()) {
            UI.SoundController.playAlert();
        }
    };
    MessageWhisper.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatWhisper");
        var b = document.createElement("b");
        b.classList.add("chatWhisperLink");
        b.appendChild(document.createTextNode("( "));
        b.addEventListener("click", {
            destination: this.destination,
            msg: this,
            handleEvent: function () {
                if (!this.msg.isMine()) {
                    UI.Chat.Forms.setInput("/whisper " + this.msg.getUser().getUniqueNickname() + ", ");
                }
                else {
                    var destination = Array.isArray(this.destination) ? this.destination[0] : this.destination;
                    UI.Chat.Forms.setInput("/whisper " + DB.UserDB.getAUser(destination).getRoomContext(UI.Chat.getRoom().id).getUniqueNickname() + ", ");
                }
            }
        });
        if (Application.isMe(this.origin)) {
            b.appendChild(document.createTextNode("_CHATMESSAGEWHISPERTO_"));
            var destination = Array.isArray(this.destination) ? this.destination[0] : this.destination;
            b.appendChild(document.createTextNode(" " + DB.UserDB.getAUser(destination).getFullNickname() + " )"));
        }
        else {
            b.appendChild(document.createTextNode("_CHATMESSAGEWHISPERFROM_"));
            b.appendChild(document.createTextNode(" " + this.getUser().getUser().getFullNickname() + " )"));
        }
        p.appendChild(b);
        p.appendChild(document.createTextNode(": " + this.getMsg()));
        UI.Language.markLanguage(b);
        return p;
    };
    MessageWhisper.prototype.receiveCommand = function (slashCommand, msg) {
        var room = UI.Chat.getRoom();
        var index = msg.indexOf(',');
        var target = msg.substr(0, index).trim();
        var message = msg.substr(index + 1).trim();
        var users = room.getUsersByName(target);
        if (users.length === 1) {
            this.setMsg(message);
            this.addDestination(users[0].getUser());
            return true;
        }
        else {
            return false;
        }
    };
    MessageWhisper.prototype.getInvalidHTML = function (slashCommand, msg) {
        var room = UI.Chat.getRoom();
        var index = msg.indexOf(',');
        var target = msg.substr(0, index).trim();
        var message = msg.substr(index + 1).trim();
        var users = room.getUsersByName(target);
        var error = new ChatSystemMessage(true);
        if (users.length === 0) {
            error.addText("_CHATWHISPERNOTARGETSFOUND_");
            error.addLangVar("a", target);
        }
        else {
            var clickF = function () {
                UI.Chat.Forms.setInput("/whisper " + this.target + ", " + this.message);
            };
            error.addText("_CHATMULTIPLETARGETSFOUND_");
            error.addText(": ");
            for (var i = 0; i < users.length; i++) {
                var listener = {
                    target: users[i].getUniqueNickname(),
                    message: message,
                    handleEvent: clickF
                };
                error.addTextLink(users[i].getUniqueNickname(), false, listener);
                if ((i + 1) < users.length) {
                    error.addText(", ");
                }
                else {
                    error.addText(".");
                }
            }
        }
        return error.getElement();
    };
    return MessageWhisper;
}(Message));
MessageFactory.registerMessage(MessageWhisper, "whisper", ["/whisper", "/whisp", "/private", "/pm", "/privado", "/pessoal", "/w"]);
var MessageSheetdamage = /** @class */ (function (_super) {
    __extends(MessageSheetdamage, _super);
    function MessageSheetdamage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "sheetdm";
        return _this;
    }
    MessageSheetdamage.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatMessageSheetdamage");
        p.classList.add(this.getType());
        var a = document.createElement("a");
        a.classList.add("icons-chatDamage" + this.getType());
        a.classList.add("chatMessageDamageIcon");
        p.appendChild(a);
        p.appendChild(document.createTextNode(this.getSheetName() + ":"));
        var span = document.createElement("span");
        span.classList.add("chatMessageDamageBubble");
        span.classList.add(this.getType());
        span.appendChild(document.createTextNode(this.getAmount() + " " + this.getType()));
        p.appendChild(span);
        return p;
    };
    MessageSheetdamage.prototype.getType = function () {
        var type = this.getSpecial("type", "HP");
        if (type === "HP" || type === "MP" || type === "Exp") {
            return type;
        }
        return "HP";
    };
    MessageSheetdamage.prototype.setTypeHP = function () {
        this.setSpecial("type", "HP");
    };
    MessageSheetdamage.prototype.setTypeMP = function () {
        this.setSpecial("type", "MP");
    };
    MessageSheetdamage.prototype.setTypeExp = function () {
        this.setSpecial("type", "Exp");
    };
    MessageSheetdamage.prototype.setLog = function (log) {
        this.setSpecial("log", log);
    };
    MessageSheetdamage.prototype.getLog = function () {
        return this.getSpecial("log", null);
    };
    MessageSheetdamage.prototype.setSheetName = function (name) {
        this.msg = name;
    };
    MessageSheetdamage.prototype.getSheetName = function () {
        var old = this.getSpecial("sheetname", null);
        if (old === null) {
            old = this.msg;
        }
        return old;
    };
    MessageSheetdamage.prototype.setAmount = function (amount) {
        this.setSpecial("amount", amount);
    };
    MessageSheetdamage.prototype.getAmount = function () {
        var amount = this.getSpecial("amount", null);
        if (amount === null) {
            return "0?";
        }
        if (typeof amount === "string") {
            amount = parseInt(amount);
        }
        if (amount > 0) {
            return "+ " + amount.toString();
        }
        return "- " + (amount * -1).toString();
    };
    return MessageSheetdamage;
}(Message));
MessageFactory.registerMessage(MessageSheetdamage, "sheetdm", []);
var MessageSheetturn = /** @class */ (function (_super) {
    __extends(MessageSheetturn, _super);
    function MessageSheetturn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "sheettr";
        _this.playedBefore = false;
        return _this;
    }
    MessageSheetturn.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatMessageTurn");
        var a = document.createElement("a");
        a.classList.add("icons-chatMessageTurn");
        a.classList.add("chatMessageTurnIcon");
        p.appendChild(a);
        p.appendChild(document.createTextNode(this.getSheetName() + ":"));
        return p;
    };
    MessageSheetturn.prototype.setSheetId = function (id) {
        this.setSpecial("sheetid", id);
    };
    MessageSheetturn.prototype.getSheetId = function () {
        return this.getSpecial("sheetid", 0);
    };
    MessageSheetturn.prototype.setSheetName = function (name) {
        this.msg = name;
    };
    MessageSheetturn.prototype.getSheetName = function () {
        var old = this.getSpecial("sheetname", null);
        if (old === null) {
            return this.msg;
        }
        return old;
    };
    MessageSheetturn.prototype.setOwnerId = function (id) {
        this.setSpecial("owner", id);
    };
    MessageSheetturn.prototype.getOwnerId = function () {
        return this.getSpecial("owner", 0);
    };
    MessageSheetturn.prototype.setPlayer = function (id) {
        this.setSpecial("player", id);
    };
    MessageSheetturn.prototype.getPlayer = function () {
        return this.getSpecial('player', 0);
    };
    MessageSheetturn.prototype.onPrint = function () {
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (UI.Chat.doAutomation()) {
            var memory = Server.Chat.Memory.getConfiguration("Combat");
            var effects = memory.getEffectsOn(this.getSheetId());
            if (effects.length > 0) {
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATCOMBATEFFECTINPROGRESS_");
                msg.addLangVar("a", this.getSheetName());
                var names = [];
                for (var i = 0; i < effects.length; i++) {
                    names.push(effects[i].name);
                }
                msg.addLangVar("b", names.join(", "));
                UI.Chat.printElement(msg.getElement());
            }
        }
        if (Application.isMe(this.getOwnerId()) && UI.Chat.doAutomation()) {
            UI.SoundController.playAlert();
        }
        this.playedBefore = true;
    };
    return MessageSheetturn;
}(Message));
MessageFactory.registerMessage(MessageSheetturn, "sheettr", []);
var MessageDice = /** @class */ (function (_super) {
    __extends(MessageDice, _super);
    function MessageDice() {
        var _this = _super.call(this) || this;
        _this.module = "dice";
        _this.diceHQTime = 30000;
        _this.initiativeClicker = null;
        _this.customClicker = null;
        _this.playedBefore = false;
        _this.setDice([]);
        // Replace incomplete roll with server-provided rolls.
        _this.addUpdatedListener({
            handleEvent: function (e) {
                if (e.html !== null) {
                    var newHTML = e.createHTML();
                    if (e.html.parentNode !== null) {
                        e.html.parentNode.replaceChild(newHTML, e.html);
                    }
                    e.html = newHTML;
                }
            }
        });
        return _this;
    }
    MessageDice.prototype.onPrint = function () {
        if (this.getRolls().length === 0 && this.getDice().length !== 0) {
            return;
        }
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (this.hasCustomAutomation() && this.customAutomationPossible()) {
            if (Application.Config.getConfig('chatAutoRolls').getValue() === 1 || (Application.isMe(this.getUser().getUser().id) && this.wasLocalMessage())) {
                this.doCustom();
                this.playedBefore = true;
            }
        }
    };
    MessageDice.prototype.findPersona = function () {
        var personaName = UI.Chat.PersonaManager.getPersonaName();
        this.setPersona(personaName === null ? "???" : personaName);
    };
    MessageDice.prototype.makeMockUp = function () {
        var messages = [this];
        this.addDice(2, 10);
        this.setSpecial("rolls", [5, 5]);
        this.msg = "Example Reason";
        messages.push(new MessageDice());
        messages.push(new MessageDice());
        messages[1].addDice(2, 10);
        messages[1].setSpecial("rolls", [1, 1]);
        messages[2].addDice(2, 10);
        messages[2].setSpecial("rolls", [10, 10]);
        return messages;
    };
    MessageDice.prototype.createHTML = function () {
        var div = document.createElement("div");
        div.classList.add("chatMessageDice");
        var p = document.createElement("p");
        div.appendChild(p);
        if (this.getRolls().length === 0 && this.getDice().length !== 0) {
            p.appendChild(document.createTextNode("_CHATDICEROLLEDWAITING_"));
            UI.Language.markLanguage(p);
            return p;
        }
        var b = document.createElement("b");
        b.appendChild(document.createTextNode("* " + this.getSpecial("persona", "????") + " "));
        p.appendChild(b);
        if (this.isWhisper()) {
            if (this.getRolls().length > 0) {
                p.appendChild(document.createTextNode("_CHATDICESECRETROLLED_"));
            }
            else {
                p.appendChild(document.createTextNode("_CHATDICESECRETSHOWN_"));
            }
        }
        else {
            if (this.getRolls().length > 0) {
                p.appendChild(document.createTextNode("_CHATDICEROLLED_"));
            }
            else {
                p.appendChild(document.createTextNode("_CHATDICESHOWN_"));
            }
        }
        p.appendChild(document.createTextNode(" "));
        if (this.getRolls().length > 0) {
            var initialRoll = document.createElement("span");
            initialRoll.classList.add("chatMessageDiceBoxSquare");
            initialRoll.appendChild(document.createTextNode(this.getInitialRoll()));
            p.appendChild(initialRoll);
            p.appendChild(document.createTextNode(" = "));
            var rolls = this.getRolls();
            var faces = this.getDice();
            var allCrits = true;
            var allFailures = true;
            if (this.getIsOrdered()) {
                rolls.sort(function (a, b) { return b - a; });
            }
            for (var i = 0; i < rolls.length; i++) {
                var span = document.createElement("span");
                span.classList.add("chatMessageDiceBoxRoll");
                if (rolls[i] === faces[i] && faces[i] > 1) {
                    span.classList.add("rainbow");
                    allFailures = false;
                }
                else if (rolls[i] === 1 && faces[i] > 1) {
                    span.classList.add("shame");
                    allCrits = false;
                }
                else {
                    allCrits = false;
                    allFailures = false;
                }
                span.appendChild(document.createTextNode(rolls[i].toString()));
                p.appendChild(span);
                if ((i + 1) < rolls.length) {
                    p.appendChild(document.createTextNode(" + "));
                }
            }
            if (allCrits) {
                initialRoll.classList.add("rainbow");
            }
            else if (allFailures) {
                initialRoll.classList.add("shame");
            }
            if (this.getMod() !== 0) {
                p.appendChild(document.createTextNode(" + "));
                var span = document.createElement("span");
                span.classList.add("chatMessageDiceBoxCircle");
                span.appendChild(document.createTextNode(this.getMod().toString()));
                p.appendChild(span);
                if (allCrits) {
                    span.classList.add("rainbow");
                }
                else if (allFailures) {
                    span.classList.add("shame");
                }
            }
            p.appendChild(document.createTextNode(" = "));
            var span = document.createElement("span");
            span.classList.add("chatMessageDiceBoxResult");
            span.appendChild(document.createTextNode(this.getResult().toString()));
            if (allCrits) {
                span.classList.add("rainbow");
                //p.classList.add("rainbow");
            }
            else if (allFailures) {
                span.classList.add("shame");
                p.classList.add("shame");
            }
            p.appendChild(span);
            if (UI.Chat.doAutomation()) {
                if (Application.Config.getConfig("hqRainbow").getValue() !== 0) {
                    var rainbows = p.getElementsByClassName("rainbow");
                    for (var i = 0; i < rainbows.length; i++) {
                        rainbows[i].classList.add("hq");
                    }
                    if (Application.Config.getConfig("hqRainbow").getValue() === 1) {
                        var f = (function () {
                            for (var i = 0; i < this.length; i++) {
                                this[i].classList.remove("hq");
                            }
                        }).bind(rainbows);
                        setTimeout(f, this.diceHQTime);
                    }
                }
            }
        }
        else {
            var initialRoll = document.createElement("span");
            initialRoll.classList.add("chatMessageDiceBoxCircle");
            initialRoll.appendChild(document.createTextNode(this.getMod().toString()));
            p.appendChild(initialRoll);
        }
        //var msg = this.getInitialRoll() + " = " + this.getRolls().join(" ") + " + " + this.getMod() + " = ";
        //
        //p.appendChild(document.createTextNode(msg));
        if (this.getIsInitiative() && (Server.Chat.getRoom() !== null && Server.Chat.getRoom().getMe().isStoryteller()) && UI.Chat.doAutomation()) {
            if (Application.isMe(this.origin) || Application.Config.getConfig("chatAutoRolls").getValue() === 1) {
                this.applyInitiative();
            }
            else {
                var clickInitiative = (function () {
                    this.applyInitiative();
                }).bind(this);
                this.initiativeClicker = ChatSystemMessage.createTextLink("_CHATMESSAGEDICEAPPLYINITIATIVE_", true, clickInitiative);
            }
        }
        if (this.getMsg() !== "" || (this.initiativeClicker !== null && UI.Chat.doAutomation())) {
            var span = document.createElement("span");
            span.classList.add("chatMessageDiceReason");
            var b = document.createElement("b");
            b.appendChild(document.createTextNode("_CHATMESSAGEDICEREASON_"));
            b.appendChild(document.createTextNode(": "));
            UI.Language.markLanguage(b);
            span.appendChild(b);
            span.appendChild(document.createTextNode(this.getMsg()));
            if (this.initiativeClicker !== null && UI.Chat.doAutomation()) {
                if (this.getMsg() !== "") {
                    span.appendChild(document.createTextNode(" "));
                }
                span.appendChild(this.initiativeClicker);
            }
            p.appendChild(span);
        }
        UI.Language.markLanguage(p);
        if (this.hasCustomAutomation() && this.customAutomationPossible()) {
            var f = (function (e) {
                e.preventDefault();
                this.doCustom();
            }).bind(this);
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATMESSAGEDICECUSTOMWARNING_");
            msg.addText(" ");
            msg.addLangVar("a", this.getSheetName());
            msg.addTextLink("_CHATMESSAGEDICECUSTOMGO_", true, f);
            this.customClicker = msg.getElement();
            div.appendChild(this.customClicker);
        }
        return div;
    };
    MessageDice.prototype.doCustom = function () {
        var style = DB.StyleDB.getStyle(this.getCustomAutomationStyle());
        var sheet = DB.SheetDB.getSheet(this.getSheetId());
        if (style === null || !style.isLoaded()) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATMESSAGEDICECUSTOMSTYLENOTLOADED_");
            UI.Chat.printElement(msg.getElement());
            return;
        }
        if (sheet === null || !sheet.loaded) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATMESSAGEDICECUSTOMSHEETNOTLOADED_");
            UI.Chat.printElement(msg.getElement());
            return;
        }
        var sheetStyle = StyleFactory.getSheetStyle(style, false);
        if (!sheetStyle.doDiceCustom(this)) {
            return;
        }
        if (this.customClicker !== null && this.customClicker.parentElement !== null) {
            this.customClicker.parentElement.removeChild(this.customClicker);
            this.customClicker = null;
        }
    };
    MessageDice.prototype.hasCustomAutomation = function () {
        return this.getSheetId() !== null && this.getSheetName() !== null && this.getCustomAutomation() !== null && this.getCustomAutomationStyle() !== null;
    };
    MessageDice.prototype.customAutomationPossible = function () {
        if (Server.Chat.getRoom() === null || !Server.Chat.getRoom().getMe().isStoryteller() || !UI.Chat.doAutomation()) {
            return false;
        }
        var sheet = DB.SheetDB.getSheet(this.getSheetId());
        if (sheet !== null && sheet.loaded && sheet.isEditable()) {
            return true;
        }
        return false;
    };
    MessageDice.prototype.setSheetName = function (name) {
        this.setSpecial("sheetName", name);
    };
    MessageDice.prototype.getSheetName = function () {
        return this.getSpecial("sheetName", null);
    };
    MessageDice.prototype.setCustomAutomationStyle = function (id) {
        this.setSpecial("customStyle", id);
    };
    MessageDice.prototype.getCustomAutomationStyle = function () {
        return this.getSpecial("customStyle", null);
    };
    MessageDice.prototype.setCustomAutomation = function (obj) {
        this.setSpecial("custom", obj);
    };
    MessageDice.prototype.getCustomAutomation = function () {
        return this.getSpecial("custom", null);
    };
    MessageDice.prototype.applyInitiative = function () {
        if (this.initiativeClicker !== null && this.initiativeClicker.parentElement !== null) {
            this.initiativeClicker.parentElement.removeChild(this.initiativeClicker);
            this.initiativeClicker = null;
        }
        var total = this.getResult();
        var memory = Server.Chat.Memory.getConfiguration("Combat");
        memory.applyInitiative(this.getSheetId(), total);
    };
    MessageDice.prototype.setSheetId = function (id) {
        this.setSpecial("sheetid", id);
    };
    MessageDice.prototype.getSheetId = function () {
        return this.getSpecial("sheetid", null);
    };
    MessageDice.prototype.setAsInitiative = function () {
        this.setSpecial("initiative", true);
    };
    MessageDice.prototype.getIsInitiative = function () {
        return this.getSpecial("initiative", false) && this.getSheetId() !== null;
    };
    MessageDice.prototype.getInitialRoll = function () {
        var dices = this.getDice();
        var cleanedDices = {};
        var mod = this.getMod();
        for (var i = 0; i < dices.length; i++) {
            if (cleanedDices[dices[i]] === undefined) {
                cleanedDices[dices[i]] = 1;
            }
            else {
                cleanedDices[dices[i]]++;
            }
        }
        var finalString = [];
        for (var faces in cleanedDices) {
            finalString.push(cleanedDices[faces] + "d" + faces);
        }
        var str = finalString.join(" + ");
        if (mod < 0) {
            str += " - " + (mod * -1);
        }
        else {
            str += " + " + mod;
        }
        return str;
    };
    MessageDice.prototype.getRolls = function () {
        return this.getSpecial("rolls", []);
    };
    MessageDice.prototype.getMod = function () {
        return this.getSpecial("mod", 0);
    };
    MessageDice.prototype.setMod = function (mod) {
        this.setSpecial("mod", mod);
    };
    MessageDice.prototype.getDice = function () {
        return this.getSpecial("dice", []);
    };
    MessageDice.prototype.setDice = function (dice) {
        this.setSpecial("dice", dice);
    };
    MessageDice.prototype.addMod = function (mod) {
        this.setSpecial("mod", mod);
    };
    MessageDice.prototype.addDice = function (amount, faces) {
        if (faces === 0 || amount === 0) {
            return; // face = 0 is an invalid roll, as is amount = 0
        }
        var dices = this.getDice();
        for (var i = 0; i < amount; i++) {
            dices.push(faces);
        }
        this.setDice(dices);
    };
    MessageDice.prototype.getResult = function () {
        var result = 0;
        result += this.getMod();
        if (this.getRolls().length !== 0) {
            result += this.getRolls().reduce(function (previousValue, currentValue) {
                return previousValue + currentValue;
            });
        }
        return result;
    };
    MessageDice.prototype.getIsOrdered = function () {
        return this.getSpecial("order", false);
    };
    MessageDice.prototype.setIsOrdered = function (order) {
        this.setSpecial("order", order === true);
    };
    return MessageDice;
}(Message));
MessageFactory.registerMessage(MessageDice, "dice", []);
var MessageStory = /** @class */ (function (_super) {
    __extends(MessageStory, _super);
    function MessageStory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "story";
        return _this;
    }
    MessageStory.prototype.makeMockUp = function () {
        var list = [];
        list.push(this);
        this.msg = "Lorem [ipsum] dolor {sit amet}, *consectetur adipiscing elit*. (Maecenas pellentesque) lectus neque, ac suscipit metus facilisis vitae. Sed ut nisi non massa sagittis molestie non sed libero.";
        this.setSpecial("persona", "Undefined");
        var newMsg;
        var languages = ['Elvish', 'Binary', 'Magraki', 'Abyssal', 'Draconic', 'Aquon', 'Celestan', 'Technum', 'Arcana', 'Ancient', 'Natrum', 'Ellum', 'Animal', 'Auran', 'Davek', 'Arkadium'].sort();
        for (var i = 0; i < languages.length; i++) {
            newMsg = new MessageStory();
            newMsg.msg = "[" + languages[i] + "]: Nulla luctus quam sit [amet] ullamcorper {luctus}. *Integer* a nulla vitae (blandit tincidunt).";
            newMsg.setSpecial("language", languages[i]);
            list.push(newMsg);
        }
        return list;
    };
    MessageStory.prototype.isIgnored = function () {
        if (!Application.Login.isLogged())
            return false;
        var ignored = this.getSpecial("ignoreFor", []);
        return ignored.indexOf(Application.Login.getUser().id) !== -1;
    };
    MessageStory.prototype.createHTML = function () {
        if (this.isIgnored())
            return null;
        var p = document.createElement("p");
        p.classList.add("chatMessageStory");
        var container = p;
        //var b = document.createElement("b");
        //b.appendChild(document.createTextNode("- "));
        //p.appendChild(b);
        var lang = this.getSpecial("language", "none");
        var thisMsg = "";
        var messageNodes = [];
        messageNodes.push(document.createTextNode("- "));
        var currentSpecial = null;
        var specialStarters = ["[", "{", "(", "*"];
        var specialEnders = ["]", "}", ")", "*"];
        var specialClasses = ["chatRoleplayImportant", "chatRoleplayItalic", "chatRoleplayThought", "chatRoleplayAction"];
        var specialInclusive = [true, false, true, true];
        var special;
        for (var i = 0; i < this.msg.length; i++) {
            special = -1;
            if (currentSpecial === null)
                special = specialStarters.indexOf(this.msg.charAt(i));
            else if (specialEnders.indexOf(this.msg.charAt(i)) === currentSpecial) {
                if (specialInclusive[currentSpecial]) {
                    thisMsg += this.msg.charAt(i);
                }
                var span = document.createElement("span");
                span.classList.add(specialClasses[currentSpecial]);
                span.appendChild(document.createTextNode(thisMsg));
                messageNodes.push(span);
                thisMsg = "";
                currentSpecial = null;
                continue;
            }
            if (special !== -1) {
                currentSpecial = special;
                var ele = document.createElement("span");
                ele.classList.add("chatRoleplayLang" + lang);
                ele.appendChild(document.createTextNode(thisMsg));
                messageNodes.push(ele);
                thisMsg = "";
                if (specialInclusive[special])
                    thisMsg += this.msg.charAt(i);
                continue;
            }
            thisMsg += this.msg.charAt(i);
        }
        if (thisMsg !== "") {
            var ele = document.createElement("span");
            ele.classList.add("chatRoleplayLang" + lang);
            ele.appendChild(document.createTextNode(thisMsg));
            messageNodes.push(ele);
        }
        for (var i = 0; i < messageNodes.length; i++) {
            container.appendChild(messageNodes[i]);
        }
        var translation = this.getTranslation();
        if (translation !== null) {
            var span = document.createElement("span");
            span.classList.add("chatRoleplayTranslation");
            var b = document.createElement("b");
            b.appendChild(document.createTextNode("_CHATMESSAGEROLEPLAYTRANSLATION_"));
            b.appendChild(document.createTextNode(": "));
            UI.Language.markLanguage(b);
            span.appendChild(b);
            span.appendChild(document.createTextNode(translation));
            p.appendChild(span);
        }
        return p;
    };
    MessageStory.prototype.setLanguage = function (lang) {
        this.setSpecial("language", lang);
    };
    MessageStory.prototype.setTranslation = function (message) {
        this.setSpecial("translation", message);
    };
    MessageStory.prototype.getTranslation = function () {
        return this.getSpecial('translation', null);
    };
    return MessageStory;
}(Message));
MessageFactory.registerMessage(MessageStory, "story", ["/story", "/history", "/historia", "/história", "/histo", "/sto"]);
var MessageAction = /** @class */ (function (_super) {
    __extends(MessageAction, _super);
    function MessageAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "action";
        return _this;
    }
    MessageAction.prototype.findPersona = function () {
        var personaName = UI.Chat.PersonaManager.getPersonaName();
        this.setPersona(personaName === null ? "???" : personaName);
    };
    MessageAction.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatAction");
        var b = document.createElement("b");
        b.appendChild(document.createTextNode("* " + this.getSpecial("persona", "???") + " "));
        p.appendChild(b);
        p.appendChild(document.createTextNode(this.msg));
        return p;
    };
    return MessageAction;
}(Message));
MessageFactory.registerMessage(MessageAction, "action", ["/act", "/me", "/eu", "/açao", "/ação", "/agir"]);
var MessageOff = /** @class */ (function (_super) {
    __extends(MessageOff, _super);
    function MessageOff() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "offgame";
        return _this;
    }
    MessageOff.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatOff");
        var b = document.createElement("b");
        b.appendChild(document.createTextNode(this.getUser().getUniqueNickname() + ": "));
        p.appendChild(b);
        p.appendChild(document.createTextNode(this.msg));
        return p;
    };
    return MessageOff;
}(Message));
MessageFactory.registerMessage(MessageOff, "offgame", ["/off", "/ooc"]);
var MessageRoleplay = /** @class */ (function (_super) {
    __extends(MessageRoleplay, _super);
    function MessageRoleplay() {
        var _this = _super.call(this) || this;
        _this.module = "roleplay";
        _this.addUpdatedListener({
            handleEvent: function (e) {
                var lingua = e.getSpecial("lingua", null);
                if (lingua !== null) {
                    e.setSpecial("language", lingua);
                    e.unsetSpecial("lingua");
                }
            }
        });
        return _this;
    }
    MessageRoleplay.prototype.findPersona = function () {
        var personaName = UI.Chat.PersonaManager.getPersonaName();
        this.setPersona(personaName === null ? "???" : personaName);
    };
    MessageRoleplay.prototype.makeMockUp = function () {
        var list = [];
        list.push(this);
        this.msg = "Lorem [ipsum] dolor {sit amet}, *consectetur adipiscing elit*. (Maecenas pellentesque) lectus neque, ac suscipit metus facilisis vitae. Sed ut nisi non massa sagittis molestie non sed libero.";
        this.setSpecial("persona", "Undefined");
        var newMsg = new MessageRoleplay();
        newMsg.msg = "Nulla luctus quam sit amet ullamcorper luctus. Integer a nulla vitae nibh blandit tincidunt id nec tortor. Interdum et malesuada fames ac ante ipsum primis in faucibus.";
        newMsg.setSpecial("persona", "Cabamamimo");
        list.push(newMsg);
        var languages = ['Elvish', 'Binary', 'Magraki', 'Abyssal', 'Draconic', 'Aquon', 'Celestan', 'Technum', 'Arcana', 'Ancient', 'Natrum', 'Ellum', 'Animal', 'Auran', 'Davek', 'Arkadium'].sort();
        for (var i = 0; i < languages.length; i++) {
            newMsg = new MessageRoleplay();
            newMsg.msg = "[" + languages[i] + "]: Nulla luctus quam sit [amet] ullamcorper {luctus}. *Integer* a nulla vitae (blandit tincidunt).";
            newMsg.setSpecial("persona", "Línguoso");
            newMsg.setSpecial("language", languages[i]);
            list.push(newMsg);
        }
        return list;
    };
    MessageRoleplay.prototype.createHTML = function () {
        if (this.isIgnored())
            return null;
        var p = document.createElement("p");
        p.classList.add("chatMessageParagraph");
        var container = p;
        var b = document.createElement("b");
        b.appendChild(document.createTextNode(this.getSpecial("persona", "????") + ": "));
        p.appendChild(b);
        var lang = this.getLanguage();
        var thisMsg = "";
        var messageNodes = [];
        var currentSpecial = null;
        var specialStarters = ["[", "{", "(", "*"];
        var specialEnders = ["]", "}", ")", "*"];
        var specialClasses = ["chatRoleplayImportant", "chatRoleplayItalic", "chatRoleplayThought", "chatRoleplayAction"];
        var specialInclusive = [true, false, true, true];
        var special;
        for (var i = 0; i < this.msg.length; i++) {
            special = -1;
            if (currentSpecial === null)
                special = specialStarters.indexOf(this.msg.charAt(i));
            else if (specialEnders.indexOf(this.msg.charAt(i)) === currentSpecial) {
                if (specialInclusive[currentSpecial]) {
                    thisMsg += this.msg.charAt(i);
                }
                var span = document.createElement("span");
                span.classList.add(specialClasses[currentSpecial]);
                span.appendChild(document.createTextNode(thisMsg));
                messageNodes.push(span);
                thisMsg = "";
                currentSpecial = null;
                continue;
            }
            if (special !== -1) {
                currentSpecial = special;
                if (lang !== "none" && !$.browser.mobile) {
                    var ele = document.createElement("span");
                    ele.classList.add("chatRoleplayLang" + lang);
                    ele.appendChild(document.createTextNode(thisMsg));
                    messageNodes.push(ele);
                }
                else {
                    messageNodes.push(document.createTextNode(thisMsg));
                }
                thisMsg = "";
                if (specialInclusive[special])
                    thisMsg += this.msg.charAt(i);
                continue;
            }
            thisMsg += this.msg.charAt(i);
        }
        if (thisMsg !== "") {
            if (lang === "none" || $.browser.mobile) {
                messageNodes.push(document.createTextNode(thisMsg));
            }
            else {
                var ele = document.createElement("span");
                ele.classList.add("chatRoleplayLang" + lang);
                ele.appendChild(document.createTextNode(thisMsg));
                messageNodes.push(ele);
            }
        }
        for (var i = 0; i < messageNodes.length; i++) {
            container.appendChild(messageNodes[i]);
        }
        var translation = this.getTranslation();
        if (translation !== null) {
            var span = document.createElement("span");
            span.classList.add("chatRoleplayTranslation");
            var b = document.createElement("b");
            b.appendChild(document.createTextNode("_CHATMESSAGEROLEPLAYTRANSLATION_"));
            b.appendChild(document.createTextNode(": "));
            UI.Language.markLanguage(b);
            span.appendChild(b);
            span.appendChild(document.createTextNode(translation));
            p.appendChild(span);
        }
        return p;
    };
    MessageRoleplay.prototype.isIgnored = function () {
        if (!Application.Login.isLogged())
            return false;
        var ignored = this.getSpecial("ignoreFor", []);
        return ignored.indexOf(Application.Login.getUser().id) !== -1;
    };
    MessageRoleplay.prototype.getLanguage = function () {
        var oldLingua = this.getSpecial("lingua", null);
        if (oldLingua !== null)
            return oldLingua;
        var language = this.getSpecial("language", "none");
        return language;
    };
    MessageRoleplay.prototype.setLanguage = function (lang) {
        this.setSpecial("language", lang);
    };
    MessageRoleplay.prototype.setTranslation = function (message) {
        this.setSpecial("translation", message);
    };
    MessageRoleplay.prototype.getTranslation = function () {
        return this.getSpecial('translation', null);
    };
    return MessageRoleplay;
}(Message));
MessageFactory.registerMessage(MessageRoleplay, "roleplay", []);
var MessageSheetup = /** @class */ (function (_super) {
    __extends(MessageSheetup, _super);
    function MessageSheetup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "sheetup";
        _this.playedBefore = false;
        _this.clicker = null;
        return _this;
    }
    MessageSheetup.prototype.onPrint = function () {
        if (this.playedBefore) {
            return; // don't play yourself twice!
        }
        if (UI.Chat.doAutomation() && UI.Sheets.SheetManager.isAutoUpdate() && !this.wasLocalMessage()) {
            this.playedBefore = true;
            this.updateSheet();
        }
        else if (UI.Chat.doAutomation()) {
            if (!UI.Chat.doAutomation() || UI.Sheets.SheetManager.isAutoUpdate() || this.wasLocalMessage()) {
                return;
            }
            var sheet = DB.SheetDB.getSheet(this.getSheetId());
            if (sheet === null || !sheet.loaded) {
                return null;
            }
            this.playedBefore = true;
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATMESSAGESHEETUPDATED_");
            msg.addLangVar("a", sheet.getName());
            msg.addText(" ");
            msg.addTextLink("_CHATMESSAGESHEETUPDATEDCLICKER_", true, (function () {
                this.updateSheet();
            }).bind(this));
            this.clicker = msg.getElement();
            UI.Chat.printElement(this.clicker);
        }
    };
    MessageSheetup.prototype.setSheetId = function (id) {
        this.setSpecial("sheetid", id);
    };
    MessageSheetup.prototype.getSheetId = function () {
        return this.getSpecial("sheetid", 0);
    };
    MessageSheetup.prototype.updateSheet = function () {
        var sheet = DB.SheetDB.getSheet(this.getSheetId());
        if (sheet === null || !sheet.loaded) {
            return;
        }
        Server.Sheets.loadSheet(sheet.id);
        if (this.clicker !== null) {
            if (this.clicker.parentElement !== null) {
                this.clicker.parentElement.removeChild(this.clicker);
            }
            this.clicker = null;
        }
    };
    MessageSheetup.prototype.createHTML = function () {
        if (!UI.Chat.doAutomation() || UI.Sheets.SheetManager.isAutoUpdate() || this.wasLocalMessage()) {
            return null;
        }
        return null;
    };
    return MessageSheetup;
}(Message));
MessageFactory.registerMessage(MessageSheetup, "sheetup", []);
var MessageUnknown = /** @class */ (function (_super) {
    __extends(MessageUnknown, _super);
    function MessageUnknown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "unkn";
        return _this;
    }
    MessageUnknown.prototype.createHTML = function () {
        var p = document.createElement("p");
        p.classList.add("chatMessageNotification");
        p.appendChild(document.createTextNode("_CHATMESSAGEUNKNOWNTYPE_"));
        UI.Language.addLanguageVariable(p, "a", this.module);
        UI.Language.addLanguageVariable(p, "b", this.getUser().getUser().getFullNickname());
        UI.Language.markLanguage(p);
        return p;
    };
    return MessageUnknown;
}(Message));
MessageFactory.registerMessage(MessageUnknown, "unkn", []);
var MessageCutscene = /** @class */ (function (_super) {
    __extends(MessageCutscene, _super);
    function MessageCutscene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.module = "csc";
        return _this;
    }
    MessageCutscene.prototype.createHTML = function () {
        if (!this.getUser().isStoryteller() || this.getUser().getUser().isMe()) {
            return null;
        }
        var msg = new ChatSystemMessage(true);
        if (this.getMsg() === "1") {
            msg.addText("_CHATSHHHHHWEHOLLYWOODTURNDOWN_");
        }
        else {
            msg.addText("_CHATSHHHHHWEHOLLYWOODTURNUP_");
        }
        return msg.getElement();
    };
    MessageCutscene.sendNotification = function (chatAllowed) {
        var newMessage = new MessageCutscene();
        newMessage.setMsg(chatAllowed ? "1" : "0");
        UI.Chat.sendMessage(newMessage);
    };
    return MessageCutscene;
}(Message));
MessageFactory.registerMessage(MessageCutscene, "csc", []);
/// <reference path='MessageFactory.ts' />
/// <reference path='Types/SlashCommand.ts' />
/// <reference path='Types/SlashClear.ts' />
/// <reference path='Types/SlashReply.ts' />
/// <reference path='Types/SlashImages.ts' />
/// <reference path='Types/SlashLog.ts' />
/// <reference path='Types/SlashLingo.ts' />
/// <reference path='Types/SlashPica.ts' />
/// <reference path='Types/SlashCommands.ts' />
/// <reference path='Types/Message.ts' />
/// <reference path='Types/MessageBuff.ts' />
/// <reference path='Types/MessagePica.ts' />
/// <reference path='Types/MessageSystem.ts' />
/// <reference path='Types/MessageCountdown.ts' />
/// <reference path='Types/MessageVote.ts' />
/// <reference path='Types/MessageWebm.ts' />
/// <reference path='Types/MessageVideo.ts' />
/// <reference path='Types/MessageQuote.ts' />
/// <reference path='Types/MessageSE.ts' />
/// <reference path='Types/MessageImage.ts' />
/// <reference path='Types/MessageBGM.ts' />
/// <reference path='Types/MessageStream.ts' />
/// <reference path='Types/MessageSheetcommand.ts' />
/// <reference path='Types/MessageWhisper.ts' />
/// <reference path='Types/MessageSheetdamage.ts' />
/// <reference path='Types/MessageSheetturn.ts' />
/// <reference path='Types/MessageDice.ts' />
/// <reference path='Types/MessageStory.ts' />
/// <reference path='Types/MessageAction.ts' />
/// <reference path='Types/MessageOff.ts' />
/// <reference path='Types/MessageRoleplay.ts' />
/// <reference path='Types/MessageSheetup.ts' />
/// <reference path='Types/MessageUnknown.ts' />
/// <reference path='Types/MessageCutscene.ts' />
var DB;
(function (DB) {
    var UserDB;
    (function (UserDB) {
        var users = {};
        function hasUser(id) {
            return users[id] !== undefined;
        }
        UserDB.hasUser = hasUser;
        function getUser(id) {
            if (hasUser(id)) {
                return users[id];
            }
            return null;
        }
        UserDB.getUser = getUser;
        function getAUser(id) {
            if (hasUser(id))
                return users[id];
            return new User();
        }
        UserDB.getAUser = getAUser;
        function updateFromObject(obj) {
            for (var i = 0; i < obj.length; i++) {
                if (users[obj[i]['id']] === undefined) {
                    users[obj[i]['id']] = new User();
                }
                users[obj[i]['id']].updateFromObject(obj[i]);
            }
        }
        UserDB.updateFromObject = updateFromObject;
    })(UserDB = DB.UserDB || (DB.UserDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var GameDB;
    (function (GameDB) {
        var games = {};
        function hasGame(id) {
            return games[id] !== undefined;
        }
        GameDB.hasGame = hasGame;
        function getGame(id) {
            if (hasGame(id)) {
                return games[id];
            }
            return null;
        }
        GameDB.getGame = getGame;
        function getOrderedGameList() {
            var list = [];
            for (var id in games) {
                list.push(games[id]);
            }
            list.sort(function (a, b) {
                var na = a.name.toLowerCase();
                var nb = b.name.toLowerCase();
                if (na < nb)
                    return -1;
                if (nb < na)
                    return 1;
                return 0;
            });
            return list;
        }
        GameDB.getOrderedGameList = getOrderedGameList;
        function updateFromObject(obj, cleanup) {
            var cleanedup = {};
            for (var i = 0; i < obj.length; i++) {
                if (games[obj[i]['id']] === undefined) {
                    games[obj[i]['id']] = new Game();
                }
                games[obj[i]['id']].updateFromObject(obj[i], cleanup);
                cleanedup[obj[i]['id']] = games[obj[i]['id']];
            }
            if (cleanup) {
                games = cleanedup;
            }
        }
        GameDB.updateFromObject = updateFromObject;
    })(GameDB = DB.GameDB || (DB.GameDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var RoomDB;
    (function (RoomDB) {
        RoomDB.rooms = {};
        function hasRoom(id) {
            return RoomDB.rooms[id] !== undefined;
        }
        RoomDB.hasRoom = hasRoom;
        function getRoom(id) {
            if (hasRoom(id)) {
                return RoomDB.rooms[id];
            }
            return null;
        }
        RoomDB.getRoom = getRoom;
        function releaseRoom(id) {
            if (hasRoom(id)) {
                delete (this.rooms[id]);
                return true;
            }
            return false;
        }
        RoomDB.releaseRoom = releaseRoom;
        function updateFromObject(obj, cleanup) {
            for (var i = 0; i < obj.length; i++) {
                var room = obj[i];
                if (RoomDB.rooms[room['id']] === undefined) {
                    RoomDB.rooms[room['id']] = new Room();
                }
                RoomDB.rooms[room['id']].updateFromObject(room, cleanup);
            }
        }
        RoomDB.updateFromObject = updateFromObject;
    })(RoomDB = DB.RoomDB || (DB.RoomDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var MessageDB;
    (function (MessageDB) {
        MessageDB.messageById = {};
        var messageByLocalId = {};
        var lastLocal = 0;
        function releaseMessage(id) {
            if (hasMessage(id)) {
                delete (MessageDB.messageById[id]);
                return true;
            }
            return false;
        }
        MessageDB.releaseMessage = releaseMessage;
        function releaseLocalMessage(id) {
            if (hasLocalMessage(id)) {
                messageByLocalId[id].localid = null;
                delete (messageByLocalId[id]);
                return true;
            }
            return false;
        }
        MessageDB.releaseLocalMessage = releaseLocalMessage;
        function releaseAllLocalMessages() {
            for (var id in messageByLocalId) {
                releaseLocalMessage(id);
            }
        }
        MessageDB.releaseAllLocalMessages = releaseAllLocalMessages;
        function hasMessage(id) {
            return MessageDB.messageById[id] !== undefined;
        }
        MessageDB.hasMessage = hasMessage;
        function hasLocalMessage(id) {
            return messageByLocalId[id] !== undefined;
        }
        MessageDB.hasLocalMessage = hasLocalMessage;
        function getMessage(id) {
            if (hasMessage(id))
                return MessageDB.messageById[id];
            return null;
        }
        MessageDB.getMessage = getMessage;
        function getLocalMessage(id) {
            if (hasLocalMessage(id))
                return messageByLocalId[id];
            return null;
        }
        MessageDB.getLocalMessage = getLocalMessage;
        function registerLocally(msg) {
            msg.localid = lastLocal++;
            messageByLocalId[msg.localid] = msg;
        }
        MessageDB.registerLocally = registerLocally;
        function updateFromObject(obj) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i]['localid'] !== undefined && hasLocalMessage(obj[i]['localid'])) {
                    MessageDB.messageById[obj[i]['id']] = getLocalMessage(obj[i]['localid']);
                }
                else if (!hasMessage(obj[i]['id'])) {
                    MessageDB.messageById[obj[i]['id']] = MessageFactory.createMessageFromType(obj[i]['module']);
                }
                MessageDB.messageById[obj[i]['id']].updateFromObject(obj[i]);
            }
        }
        MessageDB.updateFromObject = updateFromObject;
    })(MessageDB = DB.MessageDB || (DB.MessageDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var SheetDB;
    (function (SheetDB) {
        var sheets = {};
        var changeTrigger = new Trigger();
        function addChangeListener(list) {
            changeTrigger.addListener(list);
        }
        SheetDB.addChangeListener = addChangeListener;
        function removeChangeListener(list) {
            changeTrigger.removeListener(list);
        }
        SheetDB.removeChangeListener = removeChangeListener;
        function triggerChanged(sheet) {
            changeTrigger.trigger(sheet);
        }
        SheetDB.triggerChanged = triggerChanged;
        function hasSheet(id) {
            return sheets[id] !== undefined;
        }
        SheetDB.hasSheet = hasSheet;
        function getSheet(id) {
            if (hasSheet(id)) {
                return sheets[id];
            }
            return null;
        }
        SheetDB.getSheet = getSheet;
        function releaseSheet(id) {
            if (hasSheet(id)) {
                delete (sheets[id]);
            }
        }
        SheetDB.releaseSheet = releaseSheet;
        function updateFromObject(obj) {
            for (var i = 0; i < obj.length; i++) {
                if (sheets[obj[i]['id']] === undefined) {
                    sheets[obj[i]['id']] = new SheetInstance();
                }
                sheets[obj[i]['id']].updateFromObject(obj[i]);
            }
            triggerChanged(null);
        }
        SheetDB.updateFromObject = updateFromObject;
        function getSheetsByGame(game) {
            var wanted = [];
            for (var id in sheets) {
                if (sheets[id].getGameid() === game.getId()) {
                    wanted.push(sheets[id]);
                }
            }
            wanted.sort(function (a, b) {
                if (a.getName().toLowerCase() < b.getName().toLowerCase())
                    return -1;
                if (a.getName().toLowerCase() > b.getName().toLowerCase())
                    return 1;
                return 0;
            });
            return wanted;
        }
        SheetDB.getSheetsByGame = getSheetsByGame;
        function getSheetsByFolder(sheets) {
            var folders = {};
            var result = [];
            for (var i = 0; i < sheets.length; i++) {
                if (folders[sheets[i].getFolder()] === undefined) {
                    folders[sheets[i].getFolder()] = [sheets[i]];
                    result.push(folders[sheets[i].getFolder()]);
                }
                else {
                    folders[sheets[i].getFolder()].push(sheets[i]);
                }
            }
            result.sort(function (a, b) {
                if (a[0].getFolder().toLowerCase() < b[0].getFolder().toLowerCase())
                    return -1;
                if (a[0].getFolder().toLowerCase() > b[0].getFolder().toLowerCase())
                    return 1;
                return 0;
            });
            for (var i = 0; i < result.length; i++) {
                result[i].sort(function (a, b) {
                    if (a.getName().toLowerCase() < b.getName().toLowerCase())
                        return -1;
                    if (a.getName().toLowerCase() > b.getName().toLowerCase())
                        return 1;
                    return 0;
                });
            }
            return result;
        }
        SheetDB.getSheetsByFolder = getSheetsByFolder;
        function saveSheet(sheet) {
            var cbs = {
                sheet: sheet,
                handleEvent: function () {
                    this.sheet.setSaved();
                    var msg = new MessageSheetup();
                    msg.setSheetId(this.sheet.id);
                    UI.Chat.sendMessage(msg);
                }
            };
            var cbe = {
                sheet: sheet,
                handleEvent: function () {
                    alert("Sheet not saved! " + this.sheet.getName());
                }
            };
            Server.Sheets.sendSheet(sheet, cbs, cbe);
        }
        SheetDB.saveSheet = saveSheet;
    })(SheetDB = DB.SheetDB || (DB.SheetDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var ImageDB;
    (function (ImageDB) {
        var images = [];
        var changeTrigger = new Trigger();
        var delayedStore = null;
        var delayedStoreTimeout = 3000;
        function removeImage(img) {
            var idx = images.indexOf(img);
            if (idx === -1) {
                console.warn("[ImageDB] Attempt to remove unregistered image. Ignoring. Offender: ", img);
                return;
            }
            images.splice(idx, 1);
            considerSaving();
        }
        ImageDB.removeImage = removeImage;
        function removeFolder(folderName) {
            var correctedName = folderName.trim().toLowerCase();
            for (var i = images.length - 1; i >= 0; i--) {
                var image = images[i];
                if (image.getFolder().trim().toLowerCase() == correctedName) {
                    images.splice(i, 1);
                }
            }
            considerSaving();
        }
        ImageDB.removeFolder = removeFolder;
        function considerSaving() {
            if (delayedStore !== null) {
                clearTimeout(delayedStore);
            }
            delayedStore = setTimeout(function () { Server.Storage.sendImages(); }, delayedStoreTimeout);
        }
        ImageDB.considerSaving = considerSaving;
        function getImages() {
            return images;
        }
        ImageDB.getImages = getImages;
        function getImageByName(name) {
            name = name.toLowerCase();
            for (var i = 0; i < images.length; i++) {
                if (images[i].getName().toLowerCase() === name) {
                    return images[i];
                }
            }
            return null;
        }
        ImageDB.getImageByName = getImageByName;
        function getImageByLink(url) {
            for (var i = 0; i < images.length; i++) {
                if (images[i].getLink() === url) {
                    return images[i];
                }
            }
            return null;
        }
        ImageDB.getImageByLink = getImageByLink;
        function hasImageByName(name) {
            return (getImageByName(name) !== null);
        }
        ImageDB.hasImageByName = hasImageByName;
        function hasImageByLink(url) {
            return (getImageByLink(url) !== null);
        }
        ImageDB.hasImageByLink = hasImageByLink;
        function getImagesByFolder() {
            var folders = {};
            var result = [];
            for (var i = 0; i < images.length; i++) {
                if (folders[images[i].getFolder()] === undefined) {
                    folders[images[i].getFolder()] = [images[i]];
                    result.push(folders[images[i].getFolder()]);
                }
                else {
                    folders[images[i].getFolder()].push(images[i]);
                }
            }
            result.sort(function (a, b) {
                if (a[0].getFolder() < b[0].getFolder())
                    return -1;
                if (a[0].getFolder() > b[0].getFolder())
                    return 1;
                return 0;
            });
            for (var i = 0; i < result.length; i++) {
                result[i].sort(function (a, b) {
                    if (a.getName() < b.getName())
                        return -1;
                    if (a.getName() > b.getName())
                        return 1;
                    return 0;
                });
            }
            return result;
        }
        ImageDB.getImagesByFolder = getImagesByFolder;
        function exportAsObject() {
            var arr = [];
            for (var i = 0; i < images.length; i++) {
                arr.push(images[i].exportAsObject());
            }
            return arr;
        }
        ImageDB.exportAsObject = exportAsObject;
        function updateFromObject(obj) {
            images = [];
            var line;
            for (var i = 0; i < obj.length; i++) {
                line = obj[i];
                var newImage = new ImageLink(line['name'], line['url'], line['folder']);
                newImage.updateFromObject(line);
                images.push(newImage);
            }
            images.sort(function (a, b) {
                if (a.getFolder() < b.getFolder())
                    return -1;
                if (a.getFolder() > b.getFolder())
                    return 1;
                var na = a.getName().toLowerCase();
                var nb = b.getName().toLowerCase();
                if (na < nb)
                    return -1;
                if (na > nb)
                    return 1;
                if (a.getLink() < b.getLink())
                    return -1;
                if (a.getLink() > b.getLink())
                    return 1;
                return 0;
            });
            changeTrigger.trigger(images);
        }
        ImageDB.updateFromObject = updateFromObject;
        function addImage(img) {
            images.push(img);
            considerSaving();
        }
        ImageDB.addImage = addImage;
        function addImages(imgs) {
            for (var i = 0; i < imgs.length; i++) {
                images.push(imgs[i]);
            }
            changeTrigger.trigger(images);
            Server.Storage.sendImages();
        }
        ImageDB.addImages = addImages;
        function triggerChange(image) {
            if (image === null) {
                changeTrigger.trigger(images);
            }
            else {
                changeTrigger.trigger(image);
            }
        }
        ImageDB.triggerChange = triggerChange;
        function addChangeListener(f) {
            changeTrigger.addListener(f);
        }
        ImageDB.addChangeListener = addChangeListener;
        function removeChangeListener(f) {
            changeTrigger.removeListener(f);
        }
        ImageDB.removeChangeListener = removeChangeListener;
    })(ImageDB = DB.ImageDB || (DB.ImageDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var SoundDB;
    (function (SoundDB) {
        var sounds = [];
        var changeTrigger = new Trigger();
        var delayedStore = null;
        var delayedStoreTimeout = 3000;
        function removeSound(snd) {
            var idx = sounds.indexOf(snd);
            if (idx === -1) {
                console.warn("[SoundDB] Attempt to remove unregistered sound. Ignoring. Offender: ", snd);
                return;
            }
            sounds.splice(idx, 1);
            considerSaving();
        }
        SoundDB.removeSound = removeSound;
        function removeFolder(folderName) {
            var correctedName = folderName.trim().toLowerCase();
            for (var i = sounds.length - 1; i >= 0; i--) {
                var sound = sounds[i];
                if (sound.getFolder().trim().toLowerCase() == correctedName) {
                    sounds.splice(i, 1);
                }
            }
            considerSaving();
        }
        SoundDB.removeFolder = removeFolder;
        function considerSaving() {
            if (delayedStore !== null) {
                clearTimeout(delayedStore);
            }
            delayedStore = setTimeout(function () { Server.Storage.sendSounds(); }, delayedStoreTimeout);
        }
        SoundDB.considerSaving = considerSaving;
        function getSounds() {
            return sounds;
        }
        SoundDB.getSounds = getSounds;
        function getSoundByName(name) {
            name = name.toLowerCase();
            for (var i = 0; i < sounds.length; i++) {
                if (sounds[i].getName().toLowerCase() === name) {
                    return sounds[i];
                }
            }
            return null;
        }
        SoundDB.getSoundByName = getSoundByName;
        function getSoundByLink(url) {
            for (var i = 0; i < sounds.length; i++) {
                if (sounds[i].getLink() === url) {
                    return sounds[i];
                }
            }
            return null;
        }
        SoundDB.getSoundByLink = getSoundByLink;
        function hasSoundByName(name) {
            return (getSoundByName(name) !== null);
        }
        SoundDB.hasSoundByName = hasSoundByName;
        function hasSoundByLink(url) {
            return (getSoundByLink(url) !== null);
        }
        SoundDB.hasSoundByLink = hasSoundByLink;
        function getSoundsByFolder() {
            var folders = {};
            var result = [];
            for (var i = 0; i < sounds.length; i++) {
                if (folders[sounds[i].getFolder()] === undefined) {
                    folders[sounds[i].getFolder()] = [sounds[i]];
                    result.push(folders[sounds[i].getFolder()]);
                }
                else {
                    folders[sounds[i].getFolder()].push(sounds[i]);
                }
            }
            result.sort(function (a, b) {
                if (a[0].getFolder() < b[0].getFolder())
                    return -1;
                if (a[0].getFolder() > b[0].getFolder())
                    return 1;
                return 0;
            });
            for (var i = 0; i < result.length; i++) {
                result[i].sort(function (a, b) {
                    if (a.getName() < b.getName())
                        return -1;
                    if (a.getName() > b.getName())
                        return 1;
                    return 0;
                });
            }
            return result;
        }
        SoundDB.getSoundsByFolder = getSoundsByFolder;
        function exportAsObject() {
            var arr = [];
            for (var i = 0; i < sounds.length; i++) {
                arr.push(sounds[i].exportAsObject());
            }
            return arr;
        }
        SoundDB.exportAsObject = exportAsObject;
        function updateFromObject(obj) {
            sounds = [];
            var line;
            if (obj.length > 0 && typeof obj[0]["url"] === "undefined") {
                console.log("Old version");
                var rest = [];
                for (var i = 0; i < obj.length; i++) {
                    var folder = obj[i];
                    var folderName = folder['name'];
                    for (var k = 0; k < folder['sounds'].length; k++) {
                        var row = folder['sounds'][k];
                        rest.push({
                            bgm: row['bgm'],
                            name: row['name'],
                            url: row['link'],
                            folder: folderName
                        });
                    }
                }
                obj = rest;
            }
            for (var i = 0; i < obj.length; i++) {
                line = obj[i];
                sounds.push(new SoundLink(line['name'], line['url'], line['folder'], line['bgm']));
            }
            sounds.sort(function (a, b) {
                if (a.getFolder() < b.getFolder())
                    return -1;
                if (a.getFolder() > b.getFolder())
                    return 1;
                var na = a.getName().toLowerCase();
                var nb = b.getName().toLowerCase();
                if (na < nb)
                    return -1;
                if (na > nb)
                    return 1;
                if (a.getLink() < b.getLink())
                    return -1;
                if (a.getLink() > b.getLink())
                    return 1;
                return 0;
            });
            changeTrigger.trigger(sounds);
        }
        SoundDB.updateFromObject = updateFromObject;
        function addSound(snd) {
            sounds.push(snd);
            considerSaving();
        }
        SoundDB.addSound = addSound;
        function addSounds(snds) {
            for (var i = 0; i < snds.length; i++) {
                sounds.push(snds[i]);
            }
            changeTrigger.trigger(sounds);
            Server.Storage.sendSounds();
        }
        SoundDB.addSounds = addSounds;
        function triggerChange(image) {
            if (image === null) {
                changeTrigger.trigger(sounds);
            }
            else {
                changeTrigger.trigger(image);
            }
        }
        SoundDB.triggerChange = triggerChange;
        function addChangeListener(f) {
            changeTrigger.addListener(f);
        }
        SoundDB.addChangeListener = addChangeListener;
        function removeChangeListener(f) {
            changeTrigger.removeListener(f);
        }
        SoundDB.removeChangeListener = removeChangeListener;
    })(SoundDB = DB.SoundDB || (DB.SoundDB = {}));
})(DB || (DB = {}));
var DB;
(function (DB) {
    var StyleDB;
    (function (StyleDB) {
        var styles = {};
        var changeTrigger = new Trigger();
        function addChangeListener(list) {
            changeTrigger.addListener(list);
        }
        StyleDB.addChangeListener = addChangeListener;
        function removeChangeListener(list) {
            changeTrigger.removeListener(list);
        }
        StyleDB.removeChangeListener = removeChangeListener;
        function triggerChanged(sheet) {
            changeTrigger.trigger(sheet);
        }
        StyleDB.triggerChanged = triggerChanged;
        function hasStyle(id) {
            return styles[id] !== undefined;
        }
        StyleDB.hasStyle = hasStyle;
        function getStyle(id) {
            if (hasStyle(id)) {
                return styles[id];
            }
            return null;
        }
        StyleDB.getStyle = getStyle;
        function getStyles() {
            var orderedStyles = [];
            for (var id in styles) {
                orderedStyles.push(styles[id]);
            }
            orderedStyles.sort(function (a, b) {
                var na = a.name.toLowerCase();
                var nb = b.name.toLowerCase();
                if (na < nb)
                    return -1;
                if (na > nb)
                    return 1;
            });
            return orderedStyles;
        }
        StyleDB.getStyles = getStyles;
        function releaseStyle(id) {
            if (hasStyle(id)) {
                delete (styles[id]);
            }
        }
        StyleDB.releaseStyle = releaseStyle;
        function updateStyle(obj) {
            if (!hasStyle(obj['id'])) {
                styles[obj['id']] = new StyleInstance();
            }
            getStyle(obj['id']).updateFromObject(obj);
        }
        StyleDB.updateStyle = updateStyle;
    })(StyleDB = DB.StyleDB || (DB.StyleDB = {}));
})(DB || (DB = {}));
/// <reference path='DB.ts' />
/// <reference path='Modules/UserDB.ts' />
/// <reference path='Modules/GameDB.ts' />
/// <reference path='Modules/RoomDB.ts' />
/// <reference path='Modules/MessageDB.ts' />
/// <reference path='Modules/UserDB.ts' />
/// <reference path='Modules/SheetDB.ts' />
/// <reference path='Modules/ImageDB.ts' />
/// <reference path='Modules/SoundDB.ts' />
/// <reference path='Modules/StyleDB.ts' />
var Application;
(function (Application) {
    function getMe() {
        return Application.Login.getUser();
    }
    Application.getMe = getMe;
    function isMe(id) {
        if (!Application.Login.isLogged())
            return false;
        return Application.Login.getUser().id === id;
    }
    Application.isMe = isMe;
    function getMyId() {
        if (getMe() !== null) {
            return getMe().id;
        }
        return 0;
    }
    Application.getMyId = getMyId;
})(Application || (Application = {}));
/**
 * Created by Reddo on 15/09/2015.
 */
var Application;
/**
 * Created by Reddo on 15/09/2015.
 */
(function (Application) {
    var Config;
    (function (Config) {
        var configList = {};
        function getConfig(id) {
            return configList[id];
        }
        Config.getConfig = getConfig;
        function registerChangeListener(id, listener) {
            if (configList[id] === undefined) {
                console.warn("[CONFIG] Attempt to register a listener to unregistered configuration at " + id + ". Offending listener:", listener);
                return;
            }
            configList[id].addChangeListener(listener);
        }
        Config.registerChangeListener = registerChangeListener;
        function registerConfiguration(id, config) {
            if (configList[id] !== undefined) {
                console.warn("[CONFIG] Attempt to overwrite registered Configuration at " + id + ". Offending configuration:", config);
                return;
            }
            configList[id] = config;
        }
        Config.registerConfiguration = registerConfiguration;
        function exportAsObject() {
            var result = {};
            for (var key in configList) {
                result[key] = configList[key].getValue();
            }
            return result;
        }
        Config.exportAsObject = exportAsObject;
        function reset() {
            for (var key in configList) {
                configList[key].reset();
            }
        }
        Config.reset = reset;
        function updateFromObject(obj) {
            for (var key in obj) {
                if (configList[key] === undefined) {
                    console.warn("[CONFIG] Unregistered configuration at " + key + ". It will be discarded. Value: ", obj[key]);
                    continue;
                }
                configList[key].storeValue(obj[key]);
            }
            console.debug("[CONFIG] Updated configuration values from:", obj);
        }
        Config.updateFromObject = updateFromObject;
        function saveConfig(cbs, cbe) {
            Server.Config.saveConfig(exportAsObject(), cbs, cbe);
        }
        Config.saveConfig = saveConfig;
    })(Config = Application.Config || (Application.Config = {}));
})(Application || (Application = {}));
var Application;
(function (Application) {
    var LocalMemory;
    (function (LocalMemory) {
        function getMemoryName(id) {
            return "redpg_" + Application.Login.getUser().id + "_" + id;
        }
        function getMemory(id, defaultValue) {
            if (Application.Login.isLogged()) {
                var value = localStorage.getItem(getMemoryName(id));
                if (value !== null) {
                    return JSON.parse(value);
                }
            }
            return defaultValue;
        }
        LocalMemory.getMemory = getMemory;
        function getMemoryLength(id) {
            if (Application.Login.isLogged()) {
                var value = localStorage.getItem(getMemoryName(id));
                if (value !== null && value !== undefined) {
                    return value.length;
                }
            }
            return 0;
        }
        LocalMemory.getMemoryLength = getMemoryLength;
        function setMemory(id, value) {
            if (Application.Login.isLogged()) {
                localStorage.setItem(getMemoryName(id), JSON.stringify(value));
            }
        }
        LocalMemory.setMemory = setMemory;
        function unsetMemory(id) {
            if (Application.Login.isLogged()) {
                localStorage.removeItem(getMemoryName(id));
            }
        }
        LocalMemory.unsetMemory = unsetMemory;
    })(LocalMemory = Application.LocalMemory || (Application.LocalMemory = {}));
})(Application || (Application = {}));
/// <reference path='../Application.ts' />
var Application;
/// <reference path='../Application.ts' />
(function (Application) {
    var Login;
    (function (Login) {
        var currentUser = null;
        var currentSession = null;
        var lastEmail = null;
        var lastUpdate = null;
        var sessionLife = 30 * 60 * 1000; // 30 * 60 seconds
        var keepAliveTime = 2 * 60 * 1000; // 2 * 60 seconds
        var interval = null;
        var trigger = new Trigger();
        // Constants for localStorage
        var LAST_LOGIN_STORAGE = "redpg_lastLogin";
        var LAST_SESSION_STORAGE = "redpg_lastSession";
        var LAST_SESSION_TIME_STORAGE = "redpg_lastSessionTime";
        /**
         * Checks localStorage for a valid Session id.
         * If there is no valid Session id, checks localStorage for last login's e-mail.
         * If there is no last e-mail, goes back to square one.
         */
        function searchLogin() {
            if (localStorage.getItem(LAST_LOGIN_STORAGE) !== null) {
                lastEmail = localStorage.getItem(LAST_LOGIN_STORAGE);
            }
            else {
                lastEmail = null;
            }
            if (localStorage.getItem(LAST_SESSION_STORAGE) !== null) {
                var currentTime = new Date().getTime();
                var lastTime = parseInt(localStorage.getItem(LAST_SESSION_TIME_STORAGE));
                if ((currentTime - lastTime) <= sessionLife) {
                    currentSession = localStorage.getItem(LAST_SESSION_STORAGE);
                    lastUpdate = lastTime.toString();
                }
            }
        }
        Login.searchLogin = searchLogin;
        function hasLastEmail() {
            return lastEmail !== null;
        }
        Login.hasLastEmail = hasLastEmail;
        function getLastEmail() {
            return lastEmail;
        }
        Login.getLastEmail = getLastEmail;
        function isLogged() {
            return currentUser !== null;
        }
        Login.isLogged = isLogged;
        function hasSession() {
            return currentSession !== null;
        }
        Login.hasSession = hasSession;
        function getSession() {
            return currentSession;
        }
        Login.getSession = getSession;
        function logout() {
            var oldLogged = isLogged();
            currentSession = null;
            currentUser = null;
            //lastEmail = null;
            //lastEmail must remain in memory
            if (interval !== null)
                window.clearInterval(interval);
            interval = null;
            localStorage.removeItem(LAST_SESSION_STORAGE);
            localStorage.removeItem(LAST_SESSION_TIME_STORAGE);
            if (oldLogged !== isLogged()) {
                triggerListeners();
            }
        }
        Login.logout = logout;
        function attemptLogin(email, password, cbs, cbe) {
            lastEmail = email;
            updateLocalStorage();
            Server.Login.doLogin(email, password, cbs, cbe);
        }
        Login.attemptLogin = attemptLogin;
        function receiveLogin(userJson, sessionid) {
            var oldLogged = isLogged();
            var oldUser = currentUser;
            currentSession = sessionid;
            DB.UserDB.updateFromObject([userJson]);
            currentUser = DB.UserDB.getUser(userJson['id']);
            updateSessionLife();
            if (interval !== null)
                window.clearInterval(interval);
            interval = window.setInterval(function () {
                Application.Login.keepAlive();
            }, keepAliveTime);
            if (!oldLogged || oldUser.id !== currentUser.id) {
                triggerListeners();
            }
        }
        Login.receiveLogin = receiveLogin;
        function updateSessionLife() {
            lastUpdate = new Date().getTime().toString();
            updateLocalStorage();
        }
        Login.updateSessionLife = updateSessionLife;
        function updateLocalStorage() {
            if (lastEmail !== null) {
                localStorage.setItem(LAST_LOGIN_STORAGE, lastEmail);
            }
            if (hasSession()) {
                if (lastUpdate !== null) {
                    localStorage.setItem(LAST_SESSION_STORAGE, currentSession);
                    localStorage.setItem(LAST_SESSION_TIME_STORAGE, lastUpdate);
                }
                else {
                    localStorage.removeItem(LAST_SESSION_STORAGE);
                    localStorage.removeItem(LAST_SESSION_TIME_STORAGE);
                }
            }
        }
        Login.updateLocalStorage = updateLocalStorage;
        function keepAlive() {
            var cbs = {
                handleEvent: function () {
                    Application.Login.updateSessionLife();
                }
            };
            Server.Login.requestSession(true, cbs);
        }
        Login.keepAlive = keepAlive;
        function setSession(a) {
            currentSession = a;
        }
        Login.setSession = setSession;
        function addListener(listener) {
            trigger.addListener(listener);
        }
        Login.addListener = addListener;
        function getUser() {
            return currentUser;
        }
        Login.getUser = getUser;
        function triggerListeners() {
            trigger.trigger(isLogged());
        }
    })(Login = Application.Login || (Application.Login = {}));
})(Application || (Application = {}));
/// <reference path='Application.ts' />
/// <reference path='Modules/Config.ts' />
/// <reference path='Modules/LocalMemory.ts' />
/// <reference path='Modules/Login.ts' />
var Server;
(function (Server) {
    Server.IMAGE_URL = "https://img.redpg.com.br/";
    Server.APPLICATION_URL = "https://app.redpg.com.br/service/";
    Server.CLIENT_URL = "https://app.redpg.com.br/";
    Server.WEBSOCKET_SERVERURL = "wss://app.redpg.com.br";
    if (window.location.hostname.indexOf("beta") === 0) {
        Server.APPLICATION_URL = "https://beta.redpg.com.br/service/";
        Server.CLIENT_URL = "https://beta.redpg.com.br/";
        Server.WEBSOCKET_SERVERURL = "wss://beta.redpg.com.br";
    }
    Server.WEBSOCKET_CONTEXT = "/service/";
    Server.WEBSOCKET_PORTS = [443];
    // export var APPLICATION_URL : string = "http://localhost:8080/RedPG/";
    // export var WEBSOCKET_SERVERURL : string = "ws://localhost";
    // export var WEBSOCKET_CONTEXT : string = "/RedPG/";
    //export var WEBSOCKET_PORTS : Array<number> = [8080];
    //export var APPLICATION_URL : string = "http://93.188.167.121/service/";
    //export var WEBSOCKET_SERVERURL : string = "ws://93.188.167.121";
    //export var WEBSOCKET_CONTEXT : string = "/service/";
    //export var WEBSOCKET_PORTS : Array<number> = [80, 8080, 8081];
    Application.Config.registerConfiguration("wsPort", new WsportConfiguration(Server.WEBSOCKET_PORTS[0]));
    function getWebsocketURL() {
        return Server.WEBSOCKET_SERVERURL + ":" + Application.Config.getConfig("wsPort").getValue() + Server.WEBSOCKET_CONTEXT;
    }
    Server.getWebsocketURL = getWebsocketURL;
})(Server || (Server = {}));
/**
 * Created by Reddo on 14/09/2015.
 */
var Server;
/**
 * Created by Reddo on 14/09/2015.
 */
(function (Server) {
    var AJAX;
    (function (AJAX) {
        function requestPage(ajax, success, error) {
            var url = ajax.url;
            // Relative URL?
            if (url.indexOf("://") === -1) {
                url = Server.APPLICATION_URL + url;
                // Include session in link?
                if (Application.Login.hasSession()) {
                    url += ';jsessionid=' + Application.Login.getSession();
                }
            }
            var xhr = new XMLHttpRequest();
            var method = ajax.data !== null ? "POST" : "GET";
            xhr.open(method, url, true);
            xhr.responseType = ajax.responseType;
            xhr.addEventListener("loadend", {
                ajax: ajax,
                handleEvent: function (e) {
                    console.debug("AJAX request for " + this.ajax.url + " is complete.");
                    this.ajax.finishConditionalLoading();
                }
            });
            xhr.addEventListener("load", {
                xhr: xhr,
                ajax: ajax,
                success: success,
                error: error,
                handleEvent: function (e) {
                    if (this.xhr.status >= 200 && this.xhr.status < 300) {
                        console.debug("[SUCCESS " + this.xhr.status + "]: AJAX (" + this.ajax.url + ")...", this.xhr);
                        if (typeof this.success === 'function') {
                            this.success(this.xhr.response, this.xhr);
                        }
                        else {
                            this.success.handleEvent(this.xhr.response, this.xhr);
                        }
                    }
                    else {
                        console.error("[ERROR " + this.xhr.status + "]: AJAX (" + this.ajax.url + ")...", this.xhr);
                        if (this.xhr.status === 401) {
                            Server.Login.requestSession(false);
                        }
                        if (typeof this.error === 'function') {
                            this.error(this.xhr.response, this.xhr);
                        }
                        else {
                            this.error.handleEvent(this.xhr.response, this.xhr);
                        }
                    }
                }
            });
            xhr.addEventListener("error", {
                xhr: xhr,
                ajax: ajax,
                error: error,
                handleEvent: function (e) {
                    console.error("[ERROR] AJAX call for " + this.ajax.url + " resulted in network error. Event, XHR:", e, this.xhr);
                    if (typeof this.error === 'function') {
                        this.error(this.xhr.response, this.xhr);
                    }
                    else {
                        this.error.handleEvent(this.xhr.response, this.xhr);
                    }
                }
            });
            ajax.startConditionalLoading();
            if (ajax.data !== null) {
                var data = {};
                for (var key in ajax.data) {
                    if (typeof ajax.data[key] === "number" || typeof ajax.data[key] === "string") {
                        data[key] = ajax.data[key];
                    }
                    else {
                        data[key] = JSON.stringify(ajax.data[key]);
                    }
                }
                console.debug("Ajax request for " + url + " includes Data. Data:", data);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send($.param(data));
            }
            else {
                xhr.send();
            }
        }
        AJAX.requestPage = requestPage;
    })(AJAX = Server.AJAX || (Server.AJAX = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Config;
    (function (Config) {
        var CONFIG_URL = "Account";
        function saveConfig(config, cbs, cbe) {
            var ajax = new AJAXConfig(CONFIG_URL);
            ajax.setData("action", "StoreConfig");
            ajax.setData("config", config);
            ajax.setTargetLeftWindow();
            ajax.setResponseTypeJSON();
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    if (this.cbs !== null) {
                        if (typeof this.cbs === "function") {
                            this.cbs(response, xhr);
                        }
                        else {
                            this.cbs.handleEvent(response, xhr);
                        }
                    }
                }
            };
            var error = {
                cbe: cbe,
                handleEvent: function (response, xhr) {
                    if (this.cbe !== null) {
                        if (typeof this.cbe === "function") {
                            this.cbe(response, xhr);
                        }
                        else {
                            this.cbe.handleEvent(response, xhr);
                        }
                    }
                }
            };
            Server.AJAX.requestPage(ajax, success, error);
        }
        Config.saveConfig = saveConfig;
    })(Config = Server.Config || (Server.Config = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Login;
    (function (Login) {
        var ACCOUNT_URL = "Account";
        var emptyCallback = { handleEvent: function () { } };
        var emptyCallbackFunction = function () { };
        /**
         * Requests session information from the server. Renews login information on success, logs out on error.
         * @param silent
         * @param cbs
         * @param cbe
         */
        function requestSession(silent, cbs, cbe) {
            var success = {
                cbs: cbs,
                cbe: cbe,
                handleEvent: function (response, xhr) {
                    if (response.user !== undefined || response.logged === true) {
                        if (response.user !== undefined) {
                            Application.Login.receiveLogin(response.user, response.session);
                            if (response.user.config !== undefined) {
                                Application.Config.updateFromObject(response.user.config);
                            }
                        }
                        else {
                            Application.Login.updateSessionLife();
                        }
                        if (this.cbs !== undefined) {
                            this.cbs.handleEvent(response, xhr);
                        }
                    }
                    else {
                        Application.Login.logout();
                        if (this.cbe !== undefined)
                            this.cbe.handleEvent(response, xhr);
                    }
                }
            };
            var error = {
                cbe: cbe,
                handleEvent: function (response, xhr) {
                    Application.Login.logout();
                    if (this.cbe !== undefined) {
                        this.cbe.handleEvent(response, xhr);
                    }
                }
            };
            var ajax = new AJAXConfig(ACCOUNT_URL);
            ajax.setResponseTypeJSON();
            if (silent) {
                ajax.data = { action: "requestSession" };
                ajax.setTargetNone();
            }
            else {
                ajax.data = { action: "login" };
                ajax.setTargetGlobal();
            }
            Server.AJAX.requestPage(ajax, success, error);
        }
        Login.requestSession = requestSession;
        /**
         * Attempts to log in with information provided. Sets up login information on success. Runs cbe, if available, on failure.
         * @param email
         * @param password
         * @param cbs
         * @param cbe
         */
        function doLogin(email, password, cbs, cbe) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    Application.Login.receiveLogin(response.user, response.session);
                    if (response.user !== undefined && response.user.config !== undefined) {
                        Application.Config.updateFromObject(response.user.config);
                    }
                    if (this.cbs !== undefined) {
                        this.cbs.handleEvent(response, xhr);
                    }
                }
            };
            var ajax = new AJAXConfig(ACCOUNT_URL);
            ajax.data = {
                login: email,
                password: password,
                action: "login"
            };
            ajax.setResponseTypeJSON();
            ajax.setTargetGlobal();
            Server.AJAX.requestPage(ajax, success, cbe);
        }
        Login.doLogin = doLogin;
        /**
         * Attempts to log out from current session. Logs out on success.
         * @param cbs
         * @param cbe
         */
        function doLogout(cbs, cbe) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    Application.Login.logout();
                    if (this.cbs !== undefined) {
                        this.cbs.handleEvent(response, xhr);
                    }
                }
            };
            var error = {
                cbe: cbe,
                handleEvent: function (response, xhr) {
                    console.error("[ERROR] Failure while attempting to logout.");
                    if (this.cbe !== undefined) {
                        this.cbe.handleEvent(response, xhr);
                    }
                }
            };
            var ajax = new AJAXConfig(ACCOUNT_URL);
            ajax.data = { action: "logout" };
            ajax.setResponseTypeJSON();
            ajax.setTargetGlobal();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Login.doLogout = doLogout;
        function createAccount(name, pass, email, nick, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(ACCOUNT_URL);
            ajax.setResponseTypeText();
            ajax.setTargetGlobal();
            ajax.setData("action", "newAccount");
            ajax.setData("name", name);
            ajax.setData("nickname", nick);
            ajax.setData("email", email);
            ajax.setData("password", pass);
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Login.createAccount = createAccount;
    })(Login = Server.Login || (Server.Login = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Images;
    (function (Images) {
        var IMAGES_URL = "Image";
        var emptyCallback = function () { };
        function getImages(cbs, cbe) {
            // var success : Listener = <Listener> {
            //     cbs : cbs,
            //     handleEvent : function (response, xhr) {
            //         // response.images = ARRAY <objeto>    folder: "" id: NEGATIVO name: "" url: ""
            //         // response.imagess3 = ARRAY <objeto> folder   name   size   uploader   uuid
            //         // response.space = FreeSpace, TotalSpace, UsedSpace
            //         if (this.cbs !== undefined) this.cbs.handleEvent(response, xhr);
            //     }
            // };
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(IMAGES_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "list" };
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Images.getImages = getImages;
    })(Images = Server.Images || (Server.Images = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Games;
    (function (Games) {
        var GAMES_URL = "Game";
        var INVITE_URL = "Invite";
        var ROOMS_URL = "Room";
        var emptyCallback = { handleEvent: function () { } };
        function updateLists(cbs, cbe) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    DB.GameDB.updateFromObject(response, true);
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(response, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "list" };
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.updateLists = updateLists;
        function createRoom(room, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(ROOMS_URL);
            ajax.setResponseTypeJSON();
            ajax.data = room.exportAsNewRoom();
            ajax.setData("action", "create");
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.createRoom = createRoom;
        function createGame(game, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.data = game.exportAsObject();
            ajax.setData("action", "create");
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.createGame = createGame;
        function editGame(game, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.data = game.exportAsObject();
            ajax.setData("action", "edit");
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.editGame = editGame;
        function getInviteList(cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(INVITE_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "list" };
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.getInviteList = getInviteList;
        function sendInvite(gameid, nickname, nicknamesufix, message, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(INVITE_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "send");
            ajax.setData("gameid", gameid.toString());
            ajax.setData("nickname", nickname);
            ajax.setData("nicksufix", nicknamesufix);
            if (message !== "") {
                ajax.setData("message", message);
            }
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.sendInvite = sendInvite;
        function acceptInvite(gameid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(INVITE_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "accept");
            ajax.setData("gameid", gameid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.acceptInvite = acceptInvite;
        function rejectInvite(gameid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(INVITE_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "reject");
            ajax.setData("gameid", gameid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.rejectInvite = rejectInvite;
        function leaveGame(gameid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "leave");
            ajax.setData("id", gameid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.leaveGame = leaveGame;
        function deleteGame(gameid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "delete");
            ajax.setData("id", gameid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.deleteGame = deleteGame;
        function deleteRoom(roomid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(ROOMS_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "delete");
            ajax.setData("id", roomid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.deleteRoom = deleteRoom;
        function getPrivileges(gameid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "privileges");
            ajax.setData("id", gameid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.getPrivileges = getPrivileges;
        function setPrivileges(gameid, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(GAMES_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "setPrivileges");
            ajax.setData("privileges", "permissions"); // TODO: Find out wtf "permissions" is
            ajax.setData("id", gameid.toString());
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Games.setPrivileges = setPrivileges;
    })(Games = Server.Games || (Server.Games = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var URL;
    (function (URL) {
        function fixURL(url) {
            url = url.trim();
            // Don't ruin relative links
            if (url.indexOf("images/") == 0) {
                return url;
            }
            if (url.indexOf("://") === -1) {
                url = "http://" + url;
            }
            // Fix Dropbox links to be direct
            if (url.indexOf("www.dropbox.com") !== -1) {
                url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com");
                var interr = url.lastIndexOf("?dl");
                if (interr !== -1) {
                    url = url.substr(0, interr);
                }
            }
            return url;
        }
        URL.fixURL = fixURL;
    })(URL = Server.URL || (Server.URL = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Chat;
    (function (Chat) {
        var ROOM_URL = "Room";
        Chat.CHAT_URL = "Chat";
        var emptyCallback = { handleEvent: function () { } };
        var socketController = new ChatWsController();
        var pollingController;
        Chat.currentController = socketController;
        var currentRoom = null;
        var roomTrigger = new Trigger();
        var openListener = undefined;
        var errorListener = undefined;
        var messageTrigger = new Trigger();
        var personaTrigger = new Trigger();
        var statusTrigger = new Trigger();
        var disconnectTrigger = new Trigger();
        var personaInfo = {
            afk: false,
            focused: true,
            typing: false,
            persona: null,
            avatar: null
        }; // "persona":null,"avatar":null}]
        var reconnecting = false;
        var reconnectAttempts = 0;
        var maxReconnectAttempts = 5;
        Application.Login.addListener(function (isLogged) {
            if (!isLogged) {
                Server.Chat.end();
            }
        });
        function addRoomListener(f) {
            roomTrigger.addListener(f);
        }
        Chat.addRoomListener = addRoomListener;
        function removeRoomListener(f) {
            roomTrigger.removeListener(f);
        }
        Chat.removeRoomListener = removeRoomListener;
        function triggerRoomListener() {
            roomTrigger.trigger(currentRoom);
        }
        Chat.triggerRoomListener = triggerRoomListener;
        function isReconnecting() {
            return reconnecting;
        }
        Chat.isReconnecting = isReconnecting;
        function setConnected() {
            reconnectAttempts = 0;
            reconnecting = false;
            UI.Chat.Notification.hideDisconnected();
            UI.Chat.Notification.hideReconnecting();
        }
        Chat.setConnected = setConnected;
        function giveUpReconnect() {
            var reconnectPls = {
                room: currentRoom,
                handleEvent: function () {
                    Server.Chat.enterRoom(this.room.id);
                }
            };
            var reconnectForMe = new ChatSystemMessage(true);
            reconnectForMe.addText("_CHATYOUAREDISCONNECTED_");
            reconnectForMe.addText(" ");
            reconnectForMe.addTextLink("_CHATDISCONNECTEDRECONNECT_", true, reconnectPls);
            UI.Chat.printElement(reconnectForMe.getElement(), true);
            UI.Chat.Notification.hideReconnecting();
            UI.Chat.Notification.showDisconnected();
        }
        Chat.giveUpReconnect = giveUpReconnect;
        function reconnect() {
            if (currentRoom === null) {
                return; // intentional disconnect
            }
            UI.Chat.Notification.showReconnecting();
            if (reconnectAttempts++ <= maxReconnectAttempts && Application.Login.isLogged()) {
                reconnecting = true;
                enterRoom(currentRoom.id);
            }
            else {
                giveUpReconnect();
            }
        }
        Chat.reconnect = reconnect;
        function leaveRoom() {
            currentRoom = null;
            reconnecting = false;
            triggerRoomListener();
            Chat.currentController.end();
        }
        Chat.leaveRoom = leaveRoom;
        function enterRoom(roomid) {
            currentRoom = DB.RoomDB.getRoom(roomid);
            if (currentRoom === null) {
                console.error("[CHAT] Entering an unknown room at id " + roomid + ". Risky business.");
            }
            UI.Chat.Notification.showReconnecting();
            if (Chat.currentController.isReady()) {
                Chat.currentController.enterRoom(roomid);
            }
            else {
                Chat.currentController.onReady = {
                    controller: Chat.currentController,
                    roomid: roomid,
                    handleEvent: function () {
                        this.controller.enterRoom(this.roomid);
                    }
                };
                Chat.currentController.start();
            }
        }
        Chat.enterRoom = enterRoom;
        function sendStatus(info) {
            if (Chat.currentController.isReady()) {
                Chat.currentController.sendStatus(info);
            }
        }
        Chat.sendStatus = sendStatus;
        function sendPersona(info) {
            if (Chat.currentController.isReady()) {
                if (!UI.Chat.isSendPersonas()) {
                    info.avatar = undefined;
                    info.persona = undefined;
                }
                Chat.currentController.sendPersona(info);
            }
            else {
                console.debug("[CHAT] Attempt to send Persona while disconnected. Ignoring.", info);
            }
        }
        Chat.sendPersona = sendPersona;
        function isConnected() {
            return Chat.currentController.isReady();
        }
        Chat.isConnected = isConnected;
        function sendMessage(message) {
            if (Chat.currentController.isReady()) {
                Chat.currentController.sendMessage(message);
                message.roomid = currentRoom.id;
            }
            else {
                console.warn("[CHAT] Attempt to send messages while disconnected. Ignoring. Offending Message:", message);
            }
        }
        Chat.sendMessage = sendMessage;
        function saveMemory(memory) {
            if (Chat.currentController.isReady()) {
                Chat.currentController.saveMemory(memory);
            }
            else {
                console.warn("[CHAT] Attempt to save memory while disconnected. Ignoring. Offending Memory:", memory);
            }
        }
        Chat.saveMemory = saveMemory;
        function hasRoom() {
            return currentRoom !== null;
        }
        Chat.hasRoom = hasRoom;
        function getRoom() {
            return currentRoom;
        }
        Chat.getRoom = getRoom;
        function getAllMessages(roomid, cbs, cbe) {
            if (!DB.RoomDB.hasRoom(roomid)) {
                console.warn("[CHAT] Attempted to load messages for undefined room.");
                if (cbe !== undefined)
                    cbe.handleEvent();
                return;
            }
            var success = {
                roomid: roomid,
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    DB.RoomDB.getRoom(this.roomid).updateFromObject({ messages: response }, true);
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(response, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(ROOM_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "messages", roomid: roomid };
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Chat.getAllMessages = getAllMessages;
        function clearForever(roomid, cbs, cbe) {
            var success = {
                roomid: roomid,
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    var roomDB = DB.RoomDB.getRoom(this.roomid);
                    if (roomDB != undefined) {
                        roomDB.clearMessages();
                    }
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(response, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(ROOM_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "clear", roomid: roomid };
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Chat.clearForever = clearForever;
        function end() {
            currentRoom = null;
            Chat.currentController.end();
        }
        Chat.end = end;
        function addStatusListener(f) {
            statusTrigger.addListener(f);
        }
        Chat.addStatusListener = addStatusListener;
        function triggerStatus(info) {
            statusTrigger.trigger(info);
        }
        Chat.triggerStatus = triggerStatus;
        function addPersonaListener(f) {
            personaTrigger.addListener(f);
        }
        Chat.addPersonaListener = addPersonaListener;
        function triggerPersona(f) {
            personaTrigger.trigger(f);
        }
        Chat.triggerPersona = triggerPersona;
        function addMessageListener(f) {
            messageTrigger.addListener(f);
        }
        Chat.addMessageListener = addMessageListener;
        function triggerMessage(f) {
            messageTrigger.trigger(f);
        }
        Chat.triggerMessage = triggerMessage;
        // Set up controllers
        (function () {
            var getRoom = {
                handleEvent: function (e) {
                    var room = Server.Chat.getRoom();
                    var users = [];
                    for (var id in e[1]) {
                        e[1][id]['id'] = id;
                        users.push(e[1][id]);
                    }
                    UI.Chat.Avatar.resetForConnect();
                    room.updateFromObject({ users: users }, true);
                    Server.Chat.Memory.updateFromObject(e[2]);
                    room.updateFromObject({ messages: e[3] }, false);
                    if (!Server.Chat.isReconnecting()) {
                        UI.Chat.clearRoom();
                        UI.Chat.printGetAllButton();
                    }
                    Server.Chat.setConnected();
                    UI.Chat.Avatar.updateFromObject(users, true);
                    UI.Chat.printMessages(room.getOrderedMessages(), false);
                    Server.Chat.triggerRoomListener();
                }
            };
            socketController.addMessageListener("getroom", getRoom);
            var status = {
                handleEvent: function (array) {
                    var info = {
                        id: array[1],
                        typing: array[2] === 1,
                        idle: array[3] === 1,
                        focused: array[4] === 1
                    };
                    UI.Chat.Avatar.updateFromObject([info], false);
                    Server.Chat.triggerStatus(info);
                }
            };
            socketController.addMessageListener("status", status);
            var persona = {
                handleEvent: function (array) {
                    var info = {
                        id: array[1],
                        persona: array[2]['persona'] === undefined ? null : array[2]['persona'],
                        avatar: array[2]['avatar'] === undefined ? null : array[2]['avatar'],
                    };
                    UI.Chat.Avatar.updateFromObject([info], false);
                    Server.Chat.triggerPersona(info);
                }
            };
            socketController.addMessageListener("persona", persona);
            var left = {
                handleEvent: function (array) {
                    var info = {
                        id: array[1],
                        online: false
                    };
                    UI.Chat.Avatar.updateFromObject([info], false);
                }
            };
            socketController.addMessageListener("left", left);
            var joined = {
                handleEvent: function (array) {
                    array[1].roomid = currentRoom.id;
                    DB.UserDB.updateFromObject([array[1]]);
                    UI.Chat.Avatar.updateFromObject([array[1]], false);
                }
            };
            socketController.addMessageListener("joined", joined);
            var message = {
                handleEvent: function (array) {
                    Server.Chat.getRoom().updateFromObject({ messages: [array[1]] }, false);
                    var message = DB.MessageDB.getMessage(array[1]['id']);
                    if (message.localid === null) {
                        UI.Chat.printMessage(message);
                    }
                    Server.Chat.triggerMessage(message);
                }
            };
            socketController.addMessageListener("message", message);
            var memory = {
                handleEvent: function (array) {
                    Server.Chat.Memory.updateFromObject(array[2]);
                }
            };
            socketController.addMessageListener("memory", memory);
            var reconnectF = {
                handleEvent: function () {
                    Server.Chat.reconnect();
                }
            };
            socketController.addCloseListener(reconnectF);
        })();
        Application.Login.addListener(function (logged) {
            if (!logged) {
                UI.Chat.leave();
            }
        });
    })(Chat = Server.Chat || (Server.Chat = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Chat;
    (function (Chat) {
        var Memory;
        (function (Memory) {
            var configList = {};
            var readableConfigList = {};
            var changeTrigger = new Trigger();
            var updating = false;
            Memory.version = 2;
            function addChangeListener(f) {
                changeTrigger.addListener(f);
            }
            Memory.addChangeListener = addChangeListener;
            function getConfig(id) {
                return configList[id];
            }
            Memory.getConfig = getConfig;
            function registerChangeListener(id, listener) {
                if (configList[id] === undefined && readableConfigList[id] === undefined) {
                    console.warn("[RoomMemory] Attempt to register a listener to unregistered configuration at " + id + ". Offending listener:", listener);
                    return;
                }
                if (configList[id] !== undefined) {
                    configList[id].addChangeListener(listener);
                }
                else {
                    readableConfigList[id].addChangeListener(listener);
                }
            }
            Memory.registerChangeListener = registerChangeListener;
            function getConfiguration(name) {
                if (typeof readableConfigList[name] !== "undefined") {
                    return readableConfigList[name];
                }
                console.warn("[RoomMemory] Attempt to retrieve invalid memory " + name + ", returning", null);
                return null;
            }
            Memory.getConfiguration = getConfiguration;
            function registerConfiguration(id, name, config) {
                if (configList[id] !== undefined) {
                    console.warn("[RoomMemory] Attempt to overwrite registered Configuration at " + id + ". Offending configuration:", config);
                    return;
                }
                configList[id] = config;
                config.addChangeListener({
                    trigger: changeTrigger,
                    id: id,
                    handleEvent: function (memo) {
                        this.trigger.trigger(memo, id);
                        console.debug("[RoomMemory] Global change triggered by " + id + ".");
                    }
                });
                readableConfigList[name] = config;
            }
            Memory.registerConfiguration = registerConfiguration;
            function exportAsObject() {
                var result = {};
                for (var key in configList) {
                    var val = configList[key].exportAsObject();
                    if (val !== null) {
                        result[key] = val;
                    }
                }
                return result;
            }
            Memory.exportAsObject = exportAsObject;
            // TODO: Trigger all changes at once
            function updateFromObject(obj) {
                updating = true;
                for (var key in configList) {
                    if (obj[key] === undefined) {
                        configList[key].reset();
                    }
                    else {
                        configList[key].storeValue(obj[key]);
                    }
                }
                updating = false;
                console.debug("[RoomMemory] Updated values from:", obj);
            }
            Memory.updateFromObject = updateFromObject;
            var updateTimeout = null;
            var updateTimeoutTime = 1500;
            // TODO: Don't save the same thing multiple times
            function saveMemory() {
                updateTimeout = null;
                var room = Server.Chat.getRoom();
                if (room !== null) {
                    var user = room.getMe();
                    if (user.isStoryteller()) {
                        var memoryString = JSON.stringify(exportAsObject());
                        console.debug("[RoomMemory] Memory string: " + memoryString);
                        //this.sendAction("memory", JSON.stringify(this.room.memory.memory));
                        Server.Chat.saveMemory(memoryString);
                    }
                }
            }
            Memory.saveMemory = saveMemory;
            function considerSaving() {
                if (!updating) {
                    if (updateTimeout !== null) {
                        clearTimeout(updateTimeout);
                    }
                    updateTimeout = setTimeout(function () { Server.Chat.Memory.saveMemory(); }, updateTimeoutTime);
                }
            }
            Memory.considerSaving = considerSaving;
            changeTrigger.addListener(function () {
                Server.Chat.Memory.considerSaving();
            });
        })(Memory = Chat.Memory || (Chat.Memory = {}));
    })(Chat = Server.Chat || (Server.Chat = {}));
})(Server || (Server = {}));
Server.Chat.Memory.registerConfiguration("c", "Combat", new MemoryCombat());
Server.Chat.Memory.registerConfiguration("v", "Version", new MemoryVersion());
Server.Chat.Memory.registerConfiguration("p", "Pica", new MemoryPica());
Server.Chat.Memory.registerConfiguration("m", "Cutscene", new MemoryCutscene());
Server.Chat.Memory.registerConfiguration("l", "Lingo", new MemoryLingo());
Server.Chat.Memory.registerConfiguration("f", "Mood", new MemoryFilter());
var Server;
(function (Server) {
    var Storage;
    (function (Storage) {
        var STORAGE_URL = "Storage";
        var validStorage = ["sounds", "images", "custom1", "custom2"];
        var IMAGES_ID = "images";
        var SOUNDS_ID = "sounds";
        var CUSTOM1_ID = "custom1";
        var ACTION_RESTORE = "restore";
        var ACTION_STORE = "store";
        var emptyCallback = { handleEvent: function () { } };
        function requestPersonas(blocking, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STORAGE_URL);
            if (blocking) {
                ajax.setTargetLeftWindow();
            }
            else {
                ajax.setTargetNone();
            }
            ajax.setResponseTypeJSON();
            ajax.data = { action: ACTION_RESTORE, id: CUSTOM1_ID };
            Server.AJAX.requestPage(ajax, success, error);
        }
        Storage.requestPersonas = requestPersonas;
        function requestImages(cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            success = {
                success: success,
                handleEvent: function (data) {
                    DB.ImageDB.updateFromObject(data);
                    this.success.handleEvent(data);
                }
            };
            var ajax = new AJAXConfig(STORAGE_URL);
            ajax.setTargetRightWindow();
            ajax.setResponseTypeJSON();
            ajax.data = { action: ACTION_RESTORE, id: IMAGES_ID }; // "store"
            Server.AJAX.requestPage(ajax, success, error);
        }
        Storage.requestImages = requestImages;
        function requestSounds(cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            success = {
                success: success,
                handleEvent: function (data) {
                    DB.SoundDB.updateFromObject(data);
                    this.success.handleEvent(data);
                }
            };
            var ajax = new AJAXConfig(STORAGE_URL);
            ajax.setTargetRightWindow();
            ajax.setResponseTypeJSON();
            ajax.data = { action: ACTION_RESTORE, id: SOUNDS_ID }; // "store"
            Server.AJAX.requestPage(ajax, success, error);
        }
        Storage.requestSounds = requestSounds;
        function sendPersonas(payload, cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STORAGE_URL);
            ajax.setTargetNone();
            ajax.setResponseTypeJSON();
            ajax.data = { action: ACTION_STORE, id: CUSTOM1_ID, storage: JSON.stringify(payload) }; // "store"
            Server.AJAX.requestPage(ajax, success, error);
        }
        Storage.sendPersonas = sendPersonas;
        function sendImages(cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STORAGE_URL);
            ajax.setTargetRightWindow();
            ajax.setResponseTypeJSON();
            ajax.data = { action: ACTION_STORE, id: IMAGES_ID, storage: DB.ImageDB.exportAsObject() }; // "store"
            Server.AJAX.requestPage(ajax, success, error);
        }
        Storage.sendImages = sendImages;
        function sendSounds(cbs, cbe) {
            var success = cbs === undefined ? emptyCallback : cbs;
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STORAGE_URL);
            ajax.setTargetRightWindow();
            ajax.setResponseTypeJSON();
            ajax.data = { action: ACTION_STORE, id: SOUNDS_ID, storage: DB.SoundDB.exportAsObject() }; // "store"
            Server.AJAX.requestPage(ajax, success, error);
        }
        Storage.sendSounds = sendSounds;
    })(Storage = Server.Storage || (Server.Storage = {}));
})(Server || (Server = {}));
var Server;
(function (Server) {
    var Sheets;
    (function (Sheets) {
        var SHEET_URL = "Sheet";
        var STYLE_URL = "Style";
        var emptyCallback = { handleEvent: function () { } };
        var emptyCallbackFunction = function () { };
        function loadSheetAndStyle(sheetid, styleid, cbs, cbe) {
            var loaded = {
                style: false,
                sheet: false,
                success: cbs === undefined ? emptyCallback : cbs
            };
            var styleCBS = {
                loaded: loaded,
                handleEvent: function (data) {
                    this.loaded.style = true;
                    if (this.loaded.sheet) {
                        this.loaded.success.handleEvent();
                    }
                }
            };
            var sheetCBS = {
                loaded: loaded,
                handleEvent: function (data) {
                    this.loaded.sheet = true;
                    if (this.loaded.style) {
                        this.loaded.success.handleEvent();
                    }
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            loadSheet(sheetid, sheetCBS, error);
            loadStyle(styleid, styleCBS, error, true);
        }
        Sheets.loadSheetAndStyle = loadSheetAndStyle;
        function loadSheet(sheetid, cbs, cbe) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    DB.SheetDB.updateFromObject(response);
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(response, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var sheetAjax = new AJAXConfig(SHEET_URL);
            sheetAjax.setData("id", sheetid);
            sheetAjax.setData("action", "request");
            sheetAjax.setTargetRightWindow();
            sheetAjax.setResponseTypeJSON();
            Server.AJAX.requestPage(sheetAjax, success, error);
        }
        Sheets.loadSheet = loadSheet;
        function updateStyles(cbs, cbe) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    var ids = [];
                    var styles = [];
                    for (var i = 0; i < response.length; i++) {
                        if (ids.indexOf(response[i]['id']) === -1) {
                            ids.push(response[i]['id']);
                            styles.push(response[i]);
                        }
                    }
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(styles, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STYLE_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "listMine" };
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Sheets.updateStyles = updateStyles;
        function sendStyle(style, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STYLE_URL);
            ajax.setResponseTypeJSON();
            if (style.id === 0) {
                ajax.setData("action", "createAdvanced");
            }
            else {
                ajax.setData("action", "editAdvanced");
                ajax.setData("id", style.id);
            }
            ajax.setData("name", style.name);
            ajax.setData("public", style.publicStyle ? '1' : '0');
            ajax.setData("html", style.html);
            ajax.setData("css", style.css);
            ajax.setData("afterProcess", style.publicCode);
            ajax.setData("beforeProcess", style.mainCode);
            ajax.setData("gameid", style.gameid);
            ajax.setTargetLeftWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.sendStyle = sendStyle;
        function loadStyle(id, cbs, cbe, right) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    var newObj = {
                        id: response['id'],
                        name: response['name'],
                        html: response['html'],
                        css: response['css'],
                        mainCode: response['beforeProcess'],
                        publicCode: response['afterProcess']
                    };
                    if (response['gameid'] !== undefined) {
                        newObj['gameid'] = response['gameid'];
                    }
                    else {
                        newObj['publicStyle'] = Application.getMe().isAdmin();
                    }
                    DB.StyleDB.updateStyle(newObj);
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(response, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(STYLE_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "request");
            ajax.setData("id", id);
            if (right === true) {
                ajax.setTargetRightWindow();
            }
            else {
                ajax.setTargetLeftWindow();
            }
            Server.AJAX.requestPage(ajax, success, error);
        }
        Sheets.loadStyle = loadStyle;
        function updateLists(cbs, cbe) {
            var success = {
                cbs: cbs,
                handleEvent: function (response, xhr) {
                    DB.GameDB.updateFromObject(response, true);
                    if (this.cbs !== undefined)
                        this.cbs.handleEvent(response, xhr);
                }
            };
            var error = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.data = { action: "list" };
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, success, error);
        }
        Sheets.updateLists = updateLists;
        function sendFolder(sheet, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "folder");
            ajax.setData("id", sheet.getId());
            ajax.setData("folder", sheet.getFolder());
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.sendFolder = sendFolder;
        function deleteSheet(sheet, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "delete");
            ajax.setData("id", sheet.getId());
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.deleteSheet = deleteSheet;
        function getSheetPermissions(sheet, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "listPerm");
            ajax.setData("id", sheet.getId());
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.getSheetPermissions = getSheetPermissions;
        function sendSheetPermissions(sheet, permissions, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "updatePerm");
            ajax.setData("id", sheet.getId());
            var privileges = [];
            for (var i = 0; i < permissions.length; i++) {
                privileges.push(permissions[i].exportPrivileges());
            }
            ajax.setData("privileges", privileges);
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.sendSheetPermissions = sendSheetPermissions;
        function getStyleOptions(game, cbs, cbe) {
            cbs = {
                cbs: cbs,
                handleEvent: function (data) {
                    if (typeof this.cbs === "function") {
                        this.cbs(data);
                    }
                    else if (typeof this.cbs === "object") {
                        this.cbs.handleEvent(data);
                    }
                }
            };
            cbe = cbe === undefined ? emptyCallbackFunction : cbe;
            var ajax = new AJAXConfig(STYLE_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "list");
            ajax.setData("id", game.getId());
            ajax.setTargetRightWindow();
            // url : 'Style',
            //     data: {id : gameid, action : 'list'},
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.getStyleOptions = getStyleOptions;
        function createSheet(game, sheetName, styleId, isPublic, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "create");
            ajax.setData("gameid", game.getId());
            ajax.setData("name", sheetName);
            ajax.setData("idstyle", styleId);
            ajax.setData("publica", isPublic);
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.createSheet = createSheet;
        function sendSheet(sheet, cbs, cbe) {
            cbs = cbs === undefined ? emptyCallback : cbs;
            cbe = cbe === undefined ? emptyCallback : cbe;
            var ajax = new AJAXConfig(SHEET_URL);
            ajax.setResponseTypeJSON();
            ajax.setData("action", "update");
            ajax.setData("id", sheet.getId());
            ajax.setData("values", sheet.getValues());
            ajax.setData("name", sheet.getName());
            ajax.setTargetRightWindow();
            Server.AJAX.requestPage(ajax, cbs, cbe);
        }
        Sheets.sendSheet = sendSheet;
    })(Sheets = Server.Sheets || (Server.Sheets = {}));
})(Server || (Server = {}));
/// <reference path='Server.ts' />
/// <reference path='Modules/AJAX.ts' />
/// <reference path='Modules/Config.ts' />
/// <reference path='Modules/Login.ts' />
/// <reference path='Modules/Images.ts' />
/// <reference path='Modules/Games.ts' />
/// <reference path='Modules/URL.ts' />
/// <reference path='Modules/Chat.ts' />
/// <reference path='Modules/Chat/Memory.ts' />
/// <reference path='Modules/Storage.ts' />
/// <reference path='Modules/Sheets.ts' />
/**
 * Created by Reddo on 01/11/2015.
 */
var Lingo = /** @class */ (function () {
    function Lingo() {
        this.ids = [];
        this.unknownLingo = " :( ";
        this.langValues = {};
        this.myLingos = [];
    }
    Lingo.prototype.setLingo = function (id, value) {
        this.langValues[id] = value;
        this.myLingos.push(id);
    };
    Lingo.prototype.getLingos = function () {
        return this.langValues;
    };
    Lingo.prototype.merge = function (lingo) {
        var newLingos = lingo.getLingos();
        for (var id in newLingos) {
            if (this.myLingos.indexOf(id) === -1) {
                this.langValues[id] = newLingos[id];
            }
        }
    };
    Lingo.prototype.getLingo = function (id, dataset) {
        if (this.langValues[id] === undefined) {
            console.warn("[LANGUAGE] No string for \"" + id + "\" in " + this.name + ".");
            return this.unknownLingo;
        }
        var result = this.langValues[id];
        if (dataset === undefined) {
            return result;
        }
        var number = "a".charCodeAt(0);
        while (dataset["language" + String.fromCharCode(number)] !== undefined) {
            result = result.replace(new RegExp("%" + String.fromCharCode(number), 'g'), dataset["language" + String.fromCharCode(number)]);
            number++;
        }
        return result;
    };
    return Lingo;
}());
var SheetLingo = /** @class */ (function () {
    function SheetLingo() {
        this.defaultLingo = null;
        this.lingos = [];
    }
    SheetLingo.prototype.addLingo = function (lingo, isDefault) {
        this.lingos.push(lingo);
        if (isDefault || this.defaultLingo === null) {
            this.defaultLingo = lingo;
        }
    };
    SheetLingo.prototype.getDefaultLingo = function () {
        return this.defaultLingo;
    };
    SheetLingo.prototype.getLingo = function (ids) {
        for (var k = 0; k < ids.length; k++) {
            var id = ids[k];
            for (var i = 0; i < this.lingos.length; i++) {
                if (this.lingos[i].ids.indexOf(id) !== -1) {
                    return this.lingos[i];
                }
            }
        }
        return this.defaultLingo;
    };
    return SheetLingo;
}());
var LingoList;
(function (LingoList) {
    var lingos = {};
    function getLingos() {
        var list = [];
        for (var id in lingos) {
            if (list.indexOf(lingos[id]) === -1)
                list.push(lingos[id]);
        }
        list.sort(function (a, b) {
            var na = a.name.toLowerCase();
            var nb = b.name.toLowerCase();
            if (na < nb)
                return -1;
            if (na > nb)
                return 1;
            return 0;
        });
        return list;
    }
    LingoList.getLingos = getLingos;
    function getLingo(id) {
        id = id.toLowerCase().trim();
        if (lingos[id] !== undefined) {
            return lingos[id];
        }
        id = id.split("-")[0];
        if (lingos[id] !== undefined) {
            return lingos[id];
        }
        return lingos["pt"];
    }
    LingoList.getLingo = getLingo;
    function storeLingo(lingo) {
        for (var i = 0; i < lingo.ids.length; i++) {
            lingos[lingo.ids[i]] = lingo;
        }
    }
    LingoList.storeLingo = storeLingo;
    function mergeLingo(lingo) {
        var found = false;
        for (var i = 0; i < lingo.ids.length; i++) {
            if (lingos[lingo.ids[i]] !== undefined) {
                lingos[lingo.ids[i]].merge(lingo);
                found = true;
                break;
            }
        }
        if (!found) {
            console.warn("[Lingo] Language not found for:", lingo);
        }
    }
    LingoList.mergeLingo = mergeLingo;
    function addSheetLingo(lingo) {
        var listOLingos = getLingos();
        for (var i = 0; i < listOLingos.length; i++) {
            listOLingos[i].merge(lingo.getLingo(listOLingos[i].ids));
        }
    }
    LingoList.addSheetLingo = addSheetLingo;
})(LingoList || (LingoList = {}));
// Create new Lingo
var ptbr = new Lingo();
ptbr.ids = ["pt", "pt-br", "ptbr"];
ptbr.name = "Português - Brasil";
ptbr.shortname = "Português";
ptbr.flagIcon = "PT_BR";
// Login Screen
ptbr.setLingo("_LOGINEMAIL_", "E-mail");
ptbr.setLingo("_LOGINPASSWORD_", "Senha");
ptbr.setLingo("_LOGINSUBMIT_", "Entrar");
ptbr.setLingo("_LOGINERROR404_", "Credenciais inválidas.");
ptbr.setLingo("_LOGINERROR_", "Houve um erro na tentativa de login, tente novamente.");
ptbr.setLingo("_LOGINFORGOTPASSWORD_", "Esqueceu sua senha?");
ptbr.setLingo("_LOGINCREATEACCOUNT_", "Criar nova conta");
ptbr.setLingo("_CREATEACCOUNTNAME_", "Nome");
ptbr.setLingo("_CREATEACCOUNTNAMEERROR_", "O nome deve ter entre 3 a 200 caracteres e apenas caracteres Latinos.");
ptbr.setLingo("_CREATEACCOUNTNICKNAME_", "Apelido");
ptbr.setLingo("_LOGINPASSWORDREPEAT_", "Senha (Repetir)");
ptbr.setLingo("_CREATEACCOUNTNICKNAMEERROR_", "O apelido deve conter entre 3 e 12 caracteres e apenas letras e números são aceitos, sem espaços.");
ptbr.setLingo("_CREATEACCOUNTEMAILERROR_", "O e-mail deve ser válido.");
ptbr.setLingo("_CREATEACCOUNTPASSWORDMATCHING_", "As senhas devem ser a mesma.");
ptbr.setLingo("_ACCCREATIONSUBMIT_", "Criar Conta");
ptbr.setLingo("_ACCCREATIONRETURN_", "Cancelar");
ptbr.setLingo("_CREATEACCOUNTGENERALERROR_", "Houve um erro no processamento. Tente novamente.");
ptbr.setLingo("_CREATEACCOUNTSTUPIDERROR_", "Alguma informação enviada foi inválida. Corrija e tente novamente.");
ptbr.setLingo("_CREATEACCOUNTPASSWORDINVALID_", "3 a 12 caracteres, apenas letras e números.");
ptbr.setLingo("_CREATEACCOUNTALREADYEXISTS_", "E-mail já está registrado.");
// Changelog
ptbr.setLingo("_CHANGELOGTITLE_", "Histórico de mudanças");
ptbr.setLingo("_CHANGELOGP1_", "Para receber os updates marcados em vermelho você precisa atualizar sua aplicação para a última versão.");
ptbr.setLingo("_CHANGELOGP2_", "Compatibilidade com versões anteriores não é intencional. Não existem garantias de que versões desatualizadas funcionem e é recomendável sempre utilizar a versão mais recente do aplicativo.");
ptbr.setLingo("_CHANGELOGCURRENTVERSION_", "A sua versão é");
ptbr.setLingo("_CHANGELOGMOSTRECENTVERSION_", "A versão mais recente é");
ptbr.setLingo("_CHANGELOGVERSIONWARNING_", "Seu aplicativo está desatualizado. Recomenda-se atualizar o seu aplicativo. Caso esteja acessando a versão Online através de RedPG.com.br, é só recarregar a página (F5). Atualizações marcadas em vermelho não estão disponíveis.");
// Home  Page
ptbr.setLingo("_REDPGTITLE_", "RedPG");
ptbr.setLingo("_IFRAME_", "Página Externa");
ptbr.setLingo("_REDPGEXP1_", "RedPG é um sistema para facilitar RPGs de Mesa através da internet. Funções do sistema incluem o compartilhamento de Imagens, Sons, Fichas de Personagens, uma sala para troca de mensagens com suporte a dados e muito mais, com novas funções sempre sendo adicionadas.");
ptbr.setLingo("_REDPGEXP2_", "Todos os aspectos do sistema existem e estão presos aos Grupos, um grupo de RPG. Então para criar qualquer coisa ou utilizar o sistema de qualquer maneira, você precisa criar ou ser convidado a um Grupo. Isso é feito na seção \"Grupos\", no menu à esquerda.");
ptbr.setLingo("_REDPGFORUMTITLE_", "Últimos posts no Fórum");
// TODO: Implementar mensagens do fórum.
ptbr.setLingo("_REDPGFORUM1_", "Não Implementado");
ptbr.setLingo("_REDPGDONATIONTITLE_", "Doações");
ptbr.setLingo("_REDPGDONATIONEXP1_", "RedPG é um sistema gratuito e permanecerá gratuito enquanto isso for possível. Mas o servidor possui um custo e alguém precisa pagar.");
ptbr.setLingo("_REDPGDONATIONEXP2_", "Através de doações, você funda o desenvolvimento do sistema e ajuda a pagar as mensalidades do servidor. Com a ajuda de todos, RedPG poderá ser grátis para sempre!");
ptbr.setLingo("_REDPGDONATIONEXP3_", "Sempre que fizer uma doação, tente realizar ela a partir de uma conta registrada no mesmo nome registrado no RedPG. Assim, no futuro suas doações poderão ser contabilizadas pelo sistema do RedPG!");
ptbr.setLingo("_REDPGDONATIONEXP4_", "Doações podem ser enviadas (através de PIX) para:");
ptbr.setLingo("_REDPGDONATIONEXP5_", "Doações também são bem-vindas através do Paypal:");
ptbr.setLingo("_REDPGDONATIONEXP6_", "Clique aqui para realizar uma doação a partir de qualquer banco.");
ptbr.setLingo("_REDPGDONATIONEXP7_", "Abaixo listamos todas as maneiras de doações. A melhor forma é através do PIX, visto a ausência de taxas, mas também é possível doar através do PayPal ou por transferência bancária.");
ptbr.setLingo("_REDPGLINKSTITLE_", "Links úteis");
ptbr.setLingo("_REDPGLINKFRONTBUTTON_", "RedPG Front on GitHub");
ptbr.setLingo("_REDPGLINKFRONTEXP_", "Versão offline do cliente RedPG. Usuários que queiram abrir o RedPG a partir da própria máquina devem baixar versões atualizadas aqui. A versão offline permite que jogadores e mestres compartilhem sons que estejam dentro da pasta Sons, sem a necessidade de um servidor para compartilhar sons.");
// Menu
ptbr.setLingo("_MENULOGOUT_", "Logout");
ptbr.setLingo("_MENUGAMES_", "Grupos");
ptbr.setLingo("_MENUCONFIG_", "Opções");
ptbr.setLingo("_MENUCHAT_", "Chat");
ptbr.setLingo("_MENUSHEETS_", "Fichas");
ptbr.setLingo("_MENUIMAGES_", "Fotos");
ptbr.setLingo("_MENUSOUNDS_", "Sons");
ptbr.setLingo("_MENUIMAGE_", "Foto");
ptbr.setLingo("_MENUHITBOX_", "Hitbox");
ptbr.setLingo("_MENUYOUTUBE_", "Video");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
// Estilos
ptbr.setLingo("_STYLESTITLE_", "Estilos de Fichas");
ptbr.setLingo("_STYLESEXP1_", "Um estilo de ficha é como um formulário em branco que pode ser preenchido para criar uma ficha. O sistema é bem aberto e não existem limites para o que um estilo de ficha pode realizar. O uso mais comum para o estilo de ficha é definir quais campos a ficha terá e como eles são apresentados para servirem como fichas de personagens durante o jogo, mas muitos outros tipos de \"ficha\" já foram criados no passado (como História de Personagem, Mapas, Notas Pessoais, etc).");
ptbr.setLingo("_STYLESEXP2_", "A confecção de um estilo é algo um tanto complicado, então essa parte do sistema deve ser utilizada por usuários avançados.");
ptbr.setLingo("_STYLESNEWSTYLE_", "--- Criar novo estilo");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
// Estilo Designer
ptbr.setLingo("_STYLEEDITOR_", "Editor de Estilo");
ptbr.setLingo("_STYLEEDITOREXP_", "");
ptbr.setLingo("_STYLEEDITORNAME_", "Nome do Estilo");
ptbr.setLingo("_STYLEEDITORPUBLIC_", "Estilo é Público");
ptbr.setLingo("_STYLEEDITORPUBLICEXP_", "Estilos públicos podem ser utilizados em qualquer mesa.");
ptbr.setLingo("_STYLEEDITORGAME_", "Mesa:");
ptbr.setLingo("_STYLEEDITORGAMEEXP_", "Estilos só podem ser utilizados para fichas criadas na mesa definida.");
ptbr.setLingo("_STYLEEDITORHTML_", "HTML:");
ptbr.setLingo("_STYLEEDITORCSS_", "CSS:");
ptbr.setLingo("_STYLEEDITORJS_", "JavaScript:");
ptbr.setLingo("_STYLEEDITORPUBLICCODE_", "Código Público:");
ptbr.setLingo("_STYLEEDITORCOPY_", "Copiar Estilo:");
ptbr.setLingo("_STYLEEDITORCOPYEXP_", "Copia todos os valores do estilo selecionado para o atual.");
ptbr.setLingo("_STYLEEDITORCOPYBUTTON_", "Copiar");
ptbr.setLingo("_STYLEEDITORREMAIN_", "Permanecer nessa tela");
ptbr.setLingo("_STYLEEDITORSAVE_", "Salvar");
// Sons
ptbr.setLingo("_SOUNDSTITLE_", "Sons");
ptbr.setLingo("_SOUNDSLINKTITLE_", "Link Direto");
ptbr.setLingo("_IMAGELINK_", "URL (link)");
ptbr.setLingo("_IMAGENAME_", "Nome da Imagem");
ptbr.setLingo("_IMAGESLINKGO_", "Adicionar Link");
ptbr.setLingo("_SOUNDSDROPBOXCHOOSER_", "Escolher do Dropbox");
ptbr.setLingo("_SOUNDSDROPBOXFOLDER_", "Forçar Pasta (Opcional)");
ptbr.setLingo("_SOUNDSEXP01_", "Aqui você pode adicionar músicas e efeitos sonoros para compartilhar em Salas ou utilizar em Fichas.");
ptbr.setLingo("_SOUNDSEXP02_", "Quando adicionando arquivos, veja a opção \"Adicionar como BGM\". Sons adicionados como BGM irão tocar no primeiro canal, que por padrão se repete automaticamente. Sons que forem adicionados sem serem BGM serão considerados SE, tocarão no segundo canal e não se repetirão. Existem opções separadas de volume para os dois tipos de sons, essas opções podem ser encontradas na seção \"Opções\", do lado esquerdo.");
ptbr.setLingo("_SOUNDSISBGM_", "Adicionar como BGM");
ptbr.setLingo("_SOUNDSNOFOLDERNAME_", "Sem Pasta");
ptbr.setLingo("_SOUNDSRENAME_", "Renomear");
ptbr.setLingo("_SOUNDSFOLDER_", "Renomear Pasta");
ptbr.setLingo("_SOUNDSPLAY_", "Tocar");
ptbr.setLingo("_SOUNDSRENAMEPROMPT_", "Digite o novo nome para \"%a\":");
ptbr.setLingo("_SOUNDSRENAMEFOLDERPROMPT_", "Digite a nova pasta para \"%a\", atualmente em \"%b\":");
ptbr.setLingo("_DELETEFOLDER_", "Deletar a pasta \"%a\"? Isso não tem volta.");
// Imagens
ptbr.setLingo("_IMAGESTITLE_", "Fotos");
ptbr.setLingo("_IMAGESEXP01_", "Imagens ficam anexadas à sua conta e podem ser utilizadas em qualquer seção do RedPG.");
ptbr.setLingo("_IMAGESEXP02_", "Você deve adicionar imagens como um Link direto ou através de uma conta Dropbox. É possível utilizar o botão Dropbox abaixo para começar a guardar as imagens na sua conta RedPG.");
ptbr.setLingo("_IMAGESEXP03_", "O sistema tentará organizar as imagens adicionadas através do Dropbox em pastas automaticamente, porém você pode alterar essas pastas mais tarde. Imagens com um \"-\" no nome do arquivo terão tudo que estiver antes do traço como sendo o nome da pasta, e o que vier depois sendo considerado o nome da imagem. O sistema não vai permitir imagens repetidas (tanto como Link, quanto como Pasta/Nome).");
ptbr.setLingo("_IMAGESDROPBOXCHOOSER_", "Escolher do Dropbox");
ptbr.setLingo("_IMAGESLINKTITLE_", "Link Direto");
ptbr.setLingo("_IMAGESERROR_", "Erro carregando a lista de imagens. Tente novamente.");
ptbr.setLingo("_IMAGESSAVEERROR_", "Houve um erro salvando a lista de imagens.");
ptbr.setLingo("_IMAGESNOFOLDERNAME_", "Sem Pasta");
ptbr.setLingo("_IMAGESSHARE_", "Compartilhar na sala atual (se conectado)");
ptbr.setLingo("_IMAGESVIEW_", "Visualizar");
ptbr.setLingo("_IMAGESPERSONA_", "Utilizar como Persona");
ptbr.setLingo("_IMAGESDELETE_", "Deletar");
ptbr.setLingo("_IMAGESRENAME_", "Renomear");
ptbr.setLingo("_IMAGESFOLDER_", "Alterar Pasta");
ptbr.setLingo("_IMAGESRENAMEPROMPT_", "Digite o novo nome para \"%a\":");
ptbr.setLingo("_IMAGESRENAMEFOLDERPROMPT_", "Digite a nova pasta para \"%a\", atualmente em \"%b\":");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
// PICAS
ptbr.setLingo("_PICASHARE_", "Compartilhar no Chat");
ptbr.setLingo("_PICASCALEFITNOSTRETCH_", "Encaixar na tela (sem aumentar a imagem)");
ptbr.setLingo("_PICASCALEFITSTRETCH_", "Encaixar na tela");
ptbr.setLingo("_PICASCALERATIO1_", "Mostrar no tamanho original");
ptbr.setLingo("_PICAPENSIL_", "Desenho livre");
ptbr.setLingo("_PICACOLOR_", "Escolher cor de desenhos");
ptbr.setLingo("_PICAMOVE_", "Mover imagem (use scroll para zoom)");
ptbr.setLingo("_PICALOCK_", "Trancar/Destrancar desenhos (apenas mestre)");
ptbr.setLingo("_PICASIRCU_", "Desenho de círculos (clicar e arrastar)");
ptbr.setLingo("_PICACLEAN_", "Limpar desenhos");
ptbr.setLingo("_PICACONU_", "Desenho de triângulos (clicar e arrastar)");
ptbr.setLingo("_PICASQUA_", "Desenho de quadrados (clicar e arrastar)");
ptbr.setLingo("", "");
ptbr.setLingo("_SLASHPICANONAME_", "Quadro sem nome");
// LOGGER
ptbr.setLingo("_LOGGERTITLE_", "Logger");
ptbr.setLingo("_LOGGEREXP1_", "O excerto a seguir representa as primeiras e as últimas mensagens que irão fazer parte deste log. Você pode alterar o slider abaixo para definir onde começar o log e onde terminar o log. Apenas mensagens públicas (não enviadas a uma pessoa específica) serão guardadas no JSON. Você pode mover com as setas do teclado após clicar nos sliders.");
ptbr.setLingo("_LOGGEREXP2_", "Aqui você pode definir quais tipos de mensagens não serão salvas. Lembrando que apenas mensagens públicas (visível a todos) serão salvas no log.");
ptbr.setLingo("_LOGGERSUBMIT_", "Criar Log");
ptbr.setLingo("", "");
// Fichas
ptbr.setLingo("_MENUSHEETREOPEN_", "Ficha");
ptbr.setLingo("_SHEETSTITLE_", "Fichas");
ptbr.setLingo("_SHEETSEXP01_", "Fichas são algo que mestres e seus jogadores podem guardar no sistema, garantindo que todos estejam vendo a mesma versão desse recurso. Um jogador só pode ver fichas para as quais ele tem permissões adequadas, então lembre-se de alterar essas opções para cada ficha que fizer.");
ptbr.setLingo("_SHEETSEXP02_", "Normalmente são usadas para guardar as informações de personagens, mas têm o potencial para guardar qualquer tipo de informação.");
ptbr.setLingo("_SHEETSEXP03_", "Cada ficha utiliza um \"Estilo\", que define a aparência dela e os valores que ela precisa guardar. Como alguns estilos não são criados por um administrador, tome cuidado ao abrir fichas que utilizem estilos criados por alguém em quem você não confia. Apenas os estilos criados por um administrador são considerados seguros.");
ptbr.setLingo("_SHEETSOPENSTYLEEDITOR_", "Abrir gerenciador de estilos de ficha");
ptbr.setLingo("_SHEETSDELETE_", "Deletar");
ptbr.setLingo("_SHEETSRENAMEFOLDER_", "Pasta");
ptbr.setLingo("_SHEETSCHANGEPERMISSIONS_", "Permissões");
ptbr.setLingo("_SHEETSDELETE_", "Deletar");
ptbr.setLingo("_SHEETSNOFOLDERNAME_", "Fichas sem pasta");
ptbr.setLingo("_SHEETSRENAMEFOLDERPROMPT_", "Escolha a nova pasta para \"%a\", atualmente em \"%b\":");
ptbr.setLingo("_SHEETSNEWSHEET_", "Criar nova ficha");
ptbr.setLingo("_SHEETSNOSHEETS_", "Sem fichas para exibir.");
ptbr.setLingo("_SHEETCONFIRMDELETE_", "Deletar \"%a\"? Fichas deletadas não podem ser recuperadas.");
ptbr.setLingo("_SHEETDESIGNERTITLE_", "Criador de Fichas");
ptbr.setLingo("_SHEETDESIGNEREXP_", "Aqui você definirá duas partes importantes da ficha: o seu nome e qual seu estilo. O estilo da ficha é como o formulário dela, definindo quais campos ela terá, enquanto a ficha, em si, é apenas os valores que vão nesse formulário. Escolha o estilo apropriado para o tipo de informação que vá guardar.");
ptbr.setLingo("_SHEETDESIGNERERROR_", "Houve um erro na criação da ficha. Tente novamente.");
ptbr.setLingo("_SHEETDESIGNERNAMEPLACEHOLDER_", "Nome da Ficha");
ptbr.setLingo("_SHEETDESIGNERSUBMIT_", "Enviar");
ptbr.setLingo("_SHEETDESIGNERSTYLE_", "Estilo da Ficha:");
ptbr.setLingo("_SHEETDESIGNERREMAIN_", "Continuar criando fichas");
ptbr.setLingo("_SHEETDESIGNERPUBLIC_", "Ficha Pública:");
ptbr.setLingo("_SHEETVIEWERSAVE_", "Salvar");
ptbr.setLingo("_SHEETVIEWERFULLRELOAD_", "Recarregar ficha completamente");
ptbr.setLingo("_SHEETVIEWERIMPORT_", "Carregar valores de .json");
ptbr.setLingo("_SHEETVIEWEREXPORT_", "Salvar valores como .json");
ptbr.setLingo("_SHEETVIEWERAUTOMATIC_", "Recarregar a ficha automaticamente");
ptbr.setLingo("_SHEETVIEWEREDIT_", "Permitir alterações na ficha");
ptbr.setLingo("_SHEETVIEWERCLOSE_", "Fechar ficha");
ptbr.setLingo("_SHEETIMPORTFAILED_", "O arquivo escolhido não continha uma ficha válida e não pôde ser importado.");
// SHEET TYPES
ptbr.setLingo("_SHEETSTORY_", "História");
ptbr.setLingo("_SHEETMAP_", "Mapa");
// SHEET VARIABLES
ptbr.setLingo("_SHEETVARIABLEIMAGENONE_", "Sem imagem");
ptbr.setLingo("_SHEETVARIABLEIMAGESNOTLOADED_", "Imagens não carregadas");
ptbr.setLingo("_SHEETVARIABLEIMAGELASTVALUE_", "Imagem atual");
ptbr.setLingo("_SHEETVARIABLEMATHNAN_", "Não é um Número");
// Fichas Permissoes
ptbr.setLingo("_SHEETPERMISSIONSHEADER_", "Permissões de Ficha");
ptbr.setLingo("_SHEETPERMISSIONEXP_", "As permissões definem o que cada jogador de um grupo pode fazer com uma certa ficha. \"Ver\" indica que o jogador poderá abrir a ficha, \"Editar\" indica que o jogador poderá alterar os valores dessa ficha, \"Deletar\" permite que o jogador apague a ficha (permanentemente) e \"Promover\" permite que um jogador acesse essa tela, podendo fornecer permissões para outros jogadores.");
ptbr.setLingo("_SHEETPERMISSIONSHEETNAME_", "Você está editando permissões para \"%a\".");
ptbr.setLingo("_SHEETPERMISSIONVIEW_", "Ver");
ptbr.setLingo("_SHEETPERMISSIONEDIT_", "Editar");
ptbr.setLingo("_SHEETPERMISSIONDELETE_", "Deletar");
ptbr.setLingo("_SHEETPERMISSIONPROMOTE_", "Promover");
ptbr.setLingo("_SHEETPERMISSIONSUBMIT_", "Confirmar");
// Jogos
ptbr.setLingo("_GAMESTITLE_", "Grupos");
ptbr.setLingo("_GAMESEXP1_", "Caso precise informar seu identificador para alguém, ele é \"%a\", sem as aspas.");
ptbr.setLingo("_GAMESEXP2_", "Aqui você pode administrar os grupos dos quais você participa. Para convidar jogadores ao seu grupo, você irá precisar do identificador deles.");
ptbr.setLingo("_GAMESEXP3_", "Um grupo nesse sistema é o lugar no qual todas as outras partes do sistema se conectam. As salas, o ambiente no qual as partidas são jogadas, ficam anexadas a um grupo. As fichas de personagens ficam anexadas a um grupo.");
ptbr.setLingo("_GAMESEXP4_", "No momento não é possível pedir uma lista de grupos de livre entrada (não implementados).");
ptbr.setLingo("_GAMESINVITES_", "Meus convites");
ptbr.setLingo("_GAMESNEWGAME_", "Criar novo grupo");
ptbr.setLingo("_GAMEINVITESERROR_", "Houve um erro no pedido.");
ptbr.setLingo("_GAMEINVITESEMPTY_", "Você não recebeu nenhum convite.");
ptbr.setLingo("_GAMEINVITESREFRESH_", "Clique aqui para atualizar essa página.");
ptbr.setLingo("_GAMEINVITESERRORTRYAGAIN_", "Tente novamente.");
ptbr.setLingo("_GAMEINVITESGAMETITLE_", "Grupo");
ptbr.setLingo("_GAMEINVITESSTORYTELLER_", "Mestre");
ptbr.setLingo("_GAMEINVITESNOMESSAGE_", "Nenhuma mensagem foi adicionada ao convite.");
ptbr.setLingo("_GAMEINVITESMESSAGE_", "Convite");
ptbr.setLingo("_GAMEINVITESACCEPT_", "Aceitar");
ptbr.setLingo("_GAMEINVITESREJECT_", "Recusar");
ptbr.setLingo("_GAMESEDIT_", "Editar");
ptbr.setLingo("_GAMESDELETE_", "Deletar");
ptbr.setLingo("_GAMESLEAVE_", "Sair");
ptbr.setLingo("_GAMESNOROOMS_", "Nenhuma sala visível.");
ptbr.setLingo("_GAMESNOGAMES_", "Você não faz parte de nenhum grupo. Você pode criar seu próprio grupo ou ser convidado a algum.");
ptbr.setLingo("_GAMECREATORTITLE_", "Criador");
ptbr.setLingo("_GAMESPERMISSIONS_", "Permissões");
ptbr.setLingo("_GAMESSENDINVITES_", "Enviar convites");
ptbr.setLingo("_GAMESCREATEROOM_", "Criar sala");
ptbr.setLingo("_GAMESROOMPERMISSIONS_", "Permissões");
ptbr.setLingo("_GAMESROOMDELETE_", "Deletar");
ptbr.setLingo("", "");
// Salas
ptbr.setLingo("_ROOMDESIGNERTITLE_", "Editor de Salas");
ptbr.setLingo("_ROOMDESIGNERERROR_", "Houve um erro no processamento. Tente novamente.");
ptbr.setLingo("_ROOMDESIGNERNAMEPLACEHOLDER_", "Nome da Sala");
ptbr.setLingo("_ROOMDESIGNERMESSAGEPLACEHOLDER_", "Descrição da sala. Será impressa no topo sempre que alguém visitá-la.");
ptbr.setLingo("_ROOMDESIGNERSUBMIT_", "Enviar");
ptbr.setLingo("_ROOMDESIGNEREXP_", "Uma sala é um lugar onde todos podem se reunir para participar de um jogo. Recomenda-se criar salas separadas por sua função, como \"Criação de Fichas\" ou \"História Principal\".");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
// Jogo Formulário
ptbr.setLingo("_GAMEDESIGNERTITLE_", "Editor de Mesas");
ptbr.setLingo("_GAMEDESIGNERERROR_", "Houve um erro no processamento. Tente novamente.");
ptbr.setLingo("_GAMEDESIGNERNAMEPLACEHOLDER_", "Nome da mesa. Máximo de 30 caracteres.");
ptbr.setLingo("_GAMEDESIGNERMESSAGEPLACEHOLDER_", "Descrição para a mesa. Utilize esse espaço para definir quais os objetivos da mesa, assim como horários e qualquer informação que seus jogadores devam ter.");
ptbr.setLingo("_GAMEDESIGNERSUBMIT_", "Enviar");
ptbr.setLingo("", "");
// Jogos Invites
ptbr.setLingo("_GAMEINVITESTITLE_", "Meus Convites");
ptbr.setLingo("_GAMEINVITESEXP01_", "Enquanto você não aceitar um dos convites, você não faz parte do grupo.");
ptbr.setLingo("_GAMEINVITESEXP02_", "Caso precise informar seu identificador a alguém, ele é \"%a\".");
ptbr.setLingo("_GAMEINVITEDESIGNERTITLE_", "Enviando Convites");
ptbr.setLingo("_GAMEINVITEDESIGNEREXP01_", "Aqui você adiciona jogadores a mesa. Um jogador só pode visualizar qualquer coisa de uma mesa quando ele foi convidado e aceitou o convite. Depois de enviar o convite, você não poderá repetir o envio até o jogador aceitar ou recusar o convite. Para convidar um jogador, você precisa digitar o identificador dele no formulário abaixo. Identificadores de todos são parecidos com o seu, como \"Nome#1234\", então um nome curto, sem espaços, seguido de \"#\" e então um número com quatro dígitos.");
ptbr.setLingo("_GAMEINVITEDESIGNEREXP02_", "Você está adicionando jogadores para a mesa \"%a\".");
ptbr.setLingo("_GAMEINVITEDESIGNERERROR404_", "Nenhum jogador com esse nome foi encontrado.");
ptbr.setLingo("_GAMEINVITEDESIGNERERROR401_", "Você já enviou um convite para esse jogador.");
ptbr.setLingo("_GAMEINVITEDESIGNERSUCCESS_", "Convite enviado com sucesso!");
ptbr.setLingo("_GAMEINVITEDESIGNERSUBMIT_", "Enviar");
ptbr.setLingo("_GAMEINVITEDESIGNERNAMEPLACEHOLDER_", "Identificador#");
ptbr.setLingo("_GAMEINVITEDESIGNERMESSAGEPLACEHOLDER_", "Carta de apresentação");
ptbr.setLingo("", "");
// Chat
ptbr.setLingo("_CHATHELP01_", "Use \"/comandos\" para imprimir uma lista completa de comandos. Comandos básicos:");
ptbr.setLingo("_CHATHELP02_", "\"/me [mensagem]\": Envia a mensagem como uma ação da persona escolhida.");
ptbr.setLingo("_CHATHELP03_", "\"/off [mensagem]\": Envia a mensagem como uma mensagem fora de jogo, falando como o jogador.");
ptbr.setLingo("_CHATHELP04_", "\"/story [mensagem]\": Envia a mensagem como uma mensagem de história, disponível apenas para narradores.");
ptbr.setLingo("_CHATHELP05_", "Alternativamente, segure Alt, Control ou Shift quando for enviar a mensagem.");
ptbr.setLingo("_CHATHELP06_", "É recomendável executar \"/clear 1\" para limpar as mensagens no servidor de vez em quando, ou a sala ficará cada vez mais lenta.");
ptbr.setLingo("_CHATHELP07_", "Caso deseje usar as músicas em modo offline, mas o RedPG em modo online, clique no formulário abaixo e escolha suas músicas: você estará dando permissão temporária para o RedPG acessá-las.");
ptbr.setLingo("_CHATEMPTYNOTALLOWED_", "Mensagens vazias não são permitidas. Para limpar a tela de mensagens, digite \"/clear\".");
ptbr.setLingo("_CHATYOUTUBEINVALID_", "Link youtube inválido.");
ptbr.setLingo("_REALLYDELETEMESSAGESFOREVER_", "Deletar mensagens apagará elas para sempre. É impossível recuperá-las. Proceder?");
ptbr.setLingo("_CHATMESSAGENOTSENT_", "Houve um erro no envio da mensagem acima.");
ptbr.setLingo("_CHATMESSAGENOTSENTRESEND_", "Clique aqui para tentar novamente.");
ptbr.setLingo("_CHATHASCONNECTED_", "entrou na sala.");
ptbr.setLingo("_CHATHASDISCONNECTED_", "saiu da sala.");
ptbr.setLingo("_CHATOLDMESSAGESNOTLOADED_", "Mensagens antigas não foram impressas.");
ptbr.setLingo("_CHATOLDMESSAGESLOAD_", "Clique aqui para carregar todas as mensagens dessa sala.");
ptbr.setLingo("_CHATYOUAREDISCONNECTED_", "Você foi desconectado.");
ptbr.setLingo("_CHATDISCONNECTEDRECONNECT_", "Clique aqui para reconectar.");
ptbr.setLingo("_CHATNOTALLMESSAGES_", "Algumas mensagens não foram impressas por estarem acima do limite atual de mensagens. Você pode aumentar o limite de mensagens em Opções.");
ptbr.setLingo("_CHATRECONNECTINGEXP_", "Você foi desconectado. Tentando reconectar...");
ptbr.setLingo("_CHATDISCONNECTEDEXP_", "Você está desconectado.");
ptbr.setLingo("_CHATMESSAGEROLEPLAYTRANSLATION_", "Tradução");
ptbr.setLingo("_CHATMESSAGEUNKNOWNTYPE_", "Mensagem de tipo desconhecido \"%a\", enviada por %b.");
ptbr.setLingo("_CHATSENDER_", "Jogador");
ptbr.setLingo("_CHATSENDERSTORYTELLER_", "Mestre");
ptbr.setLingo("_CHATDICEROLLED_", "rolou");
ptbr.setLingo("_CHATDICESECRETROLLED_", "secretamente rolou");
ptbr.setLingo("_CHATDICESHOWN_", "mostrou");
ptbr.setLingo("_CHATDICESECRETSHOWN_", "secretamente mostrou");
ptbr.setLingo("_CHATMESSAGEDICEREASON_", "Motivo");
ptbr.setLingo("_CHATMESSAGEDICEAPPLYINITIATIVE_", "Aplicar como iniciativa.");
ptbr.setLingo("_CHATMESSAGEDICECUSTOMWARNING_", "Essa rolagem possui automação para %a.");
ptbr.setLingo("_CHATMESSAGEDICECUSTOMGO_", "Clique aqui para aplicar.");
ptbr.setLingo("_CHATMESSAGEDICECUSTOMSTYLENOTLOADED_", "O estilo necessário para aplicar essa automação não está carregado. Favor abrir a ficha em questão.");
ptbr.setLingo("_CHATMESSAGEDICECUSTOMSHEETNOTLOADED_", "A ficha em questão não está carregada e não pode ser alterada. Favor carregar a ficha.");
ptbr.setLingo("_CHATMESSAGEDICECUSTOMSTYLENOCUSTOM_", "O estilo da ficha não possui implementação para rolagens automatizadas e não pode ser o alvo dessa automação.");
ptbr.setLingo("_CHATMESSAGEDICECUSTOMSTYLEINVALIDCUSTOM_", "Esse estilo de ficha não suporta a automação requisitada.");
ptbr.setLingo("_CHATMESSAGEWHISPERTO_", "Mensagem enviada para");
ptbr.setLingo("_CHATMESSAGEWHISPERFROM_", "Mensagem recebida de");
ptbr.setLingo("_CHATMESSAGESHAREDBGM_", "compartilhou um som");
ptbr.setLingo("_CHATMESSAGEPLAYBGM_", "Tocar");
ptbr.setLingo("_CHATMESSAGESHAREDIMAGE_", "compartilhou uma imagem");
ptbr.setLingo("_CHATMESSAGESEEIMAGE_", "Ver");
ptbr.setLingo("_CHATMESSAGESHAREDSE_", "compartilhou um efeito sonoro");
ptbr.setLingo("_CHATMESSAGEPLAYSE_", "Ouvir");
ptbr.setLingo("_CHATMESSAGESHAREDVIDEO_", "compartilhou um video");
ptbr.setLingo("_CHATMESSAGEPLAYVIDEO_", "Assistir");
ptbr.setLingo("_CHATMESSAGEVOTECREATEDVOTE_", "criou uma votação");
ptbr.setLingo("_CHATDICEROLLEDWAITING_", "Esperando resposta do servidor...");
ptbr.setLingo("_CHATDICEAMOUNT_", "#");
ptbr.setLingo("_CHATDICEFACES_", "d#");
ptbr.setLingo("_CHATDICEMOD_", "+#");
ptbr.setLingo("_CHATDICEREASON_", "Razão");
ptbr.setLingo("_CHATWHISPERNOTARGETSFOUND_", "Nenhum jogador encontrado para \"%a\".");
ptbr.setLingo("_CHATMULTIPLETARGETSFOUND_", "Múltiplos jogadores encontrados");
ptbr.setLingo("_CHATINVALIDCOMMAND_", "Comando inválido. Digite \"/comandos\" para imprimir uma lista completa de comandos.");
ptbr.setLingo("_CHATBGMERROR_", "Erro ao tocar música.");
ptbr.setLingo("_CHATSEERROR_", "Erro ao tocar efeito sonoro.");
ptbr.setLingo("_CHATSOUNDADDMORE_", "Clique aqui para alterar músicas em uso.");
ptbr.setLingo("_CHATMESSAGEANNOUNCEMENT_", "AVISO DO SISTEMA");
ptbr.setLingo("_CHATMESSAGESFROM_", "Mensagens de %a.");
ptbr.setLingo("_CHATIMAGESNOIMAGES_", "Sem imagens recentes.");
ptbr.setLingo("_CHATIMAGESPRINTINGIMAGES_", "Imagens recentes:");
ptbr.setLingo("_CHATSHHHHHWEHOLLYWOODNOW_", "Essa sala está com o modo Cutscene ativo, apenas narradores podem enviar mensagens.");
ptbr.setLingo("_CHATBUTTONFONTPLUS_", "Aumentar tamanho da fonte");
ptbr.setLingo("_CHATBUTTONFONTMINUS_", "Diminuir tamanho da fonte");
ptbr.setLingo("_CHATBUTTONLEAVE_", "Sair da sala");
ptbr.setLingo("_CHATBUTTONHOLLYWOOD_", "Ativar/Desativar modo Cutscene");
ptbr.setLingo("_CHATBUTTONMOOD_", "Escolher efeito de tela");
ptbr.setLingo("_CHATBUTTONLINGO_", "Abrir gerenciador de línguas");
ptbr.setLingo("_CHATBUTTONCOMBAT_", "Abrir gerenciador de combate");
ptbr.setLingo("_CHATBUTTONSENDPERSONAS_", "Ativa/Desativa o envio de Personas");
ptbr.setLingo("_CHATBUTTONSEND_", "Enviar");
ptbr.setLingo("_CHATPERSONAMANAGERBUTTON_", "Abrir administrador de personas");
ptbr.setLingo("_CHATDICETOWER_", "Ativar/Desativar rolagem secreta");
ptbr.setLingo("_CHATSHHHHHWEHOLLYWOODACTIVE_", "Modo Cutscene ativado. Apenas narradores podem enviar mensagens.");
ptbr.setLingo("_CHATSHHHHHWEHOLLYWOODINACTIVE_", "Modo Cutscene desativado. Todos os jogadores podem enviar mensagens.");
ptbr.setLingo("_LINGOMANAGER_", "Gerenciador de Línguas");
ptbr.setLingo("_LINGOADD_", "+ Adicionar");
ptbr.setLingo("_CHATLINGONOLINGO_", "Não fala linguas especiais");
ptbr.setLingo("_SLASHLINGOINVALIDONLYGM_", "Apenas narradores podem enviar mensagens de história.");
ptbr.setLingo("_SLASHLINGOINVALIDNOSUCHLINGO_", "Essa lingua não existe.");
ptbr.setLingo("_COMBATTRACKER_", "Gerenciador de Combate");
ptbr.setLingo("_COMBATTRACKERREMOVE_", "Remover do combate");
ptbr.setLingo("_COMBATTRACKERSETTARGET_", "Marcar/desmarcar como alvo");
ptbr.setLingo("_COMBATTRACKERSETTURN_", "Definir como turno atual");
ptbr.setLingo("_COMBATTRACKERSHEET_", "Abrir ficha");
ptbr.setLingo("_COMBATTRACKERNOSHEETS_", "Nenhuma ficha carregada...");
ptbr.setLingo("_COMBATTRACKERADD_", "Adicionar ao combate");
ptbr.setLingo("_COMBATTRACKERNEWROUND_", "Começar nova rodada");
ptbr.setLingo("_COMBATTRACKERNEXTTURN_", "Passar turno");
ptbr.setLingo("_COMBATTRACKEENDCOMBAT_", "Finalizar combate");
ptbr.setLingo("_COMBATTRACKERNOCOMBATANTS_", "Sem participantes em combate.");
ptbr.setLingo("_CHATCOMBATENDEDCOMBAT_", "Combate finalizado. Todos os NPCs foram removidos do combate e efeitos foram limpos.");
ptbr.setLingo("_CHATCOMBATEFFECTENDED_", "Efeito \"%a\" terminou em \"%b\".");
ptbr.setLingo("_CHATCOMBATEFFECTINPROGRESS_", "Efeitos em %a: %b.");
ptbr.setLingo("_CHATCOMBATBUFFREQUESTED_", "Um pedido foi enviado ao mestre para aplicar o efeito.");
ptbr.setLingo("_CHATCOMBATBUFFREQUEST_", "%a deseja aplicar o efeito %b em %c.");
ptbr.setLingo("_CHATCOMBATBUFFREQUESTCLICK_", "Clique aqui para permitir.");
ptbr.setLingo("_CHATMESSAGESHEETUPDATED_", "A ficha \"%a\" foi atualizada.");
ptbr.setLingo("_CHATCOMMANDREQUESTED_", "Um pedido foi enviado ao mestre para aplicar o comando.");
ptbr.setLingo("_CHATCOMMANDREQUEST_", "%a deseja aplicar um comando em %b.");
ptbr.setLingo("_CHATCOMMANDCLICK_", "Clique aqui para permitir.");
ptbr.setLingo("_CHATMESSAGESHEETUPDATED_", "A ficha \"%a\" foi atualizada.");
ptbr.setLingo("_CHATMESSAGESHEETUPDATEDCLICKER_", "Clique aqui para atualizar ela.");
ptbr.setLingo("_CHATCANTADDINITIATIVE_", "Não é possível adicionar a ficha ao Combat Tracker sem carregar a lista de fichas.");
// Chat Mood
ptbr.setLingo("_MOODNONE_", "Nenhum");
ptbr.setLingo("_MOODNIGHT_", "Noite");
ptbr.setLingo("_MOODEVENING_", "Entardecer");
ptbr.setLingo("_MOODFIRE_", "Fogo");
ptbr.setLingo("_MOODTRAUMA_", "Trauma");
ptbr.setLingo("_MOODSEPIA_", "Antigo");
// Chat Hide Some Mssages
ptbr.setLingo("_CONFIGCHATUNNECESSARYMESSAGES_", "(Chat) Esconder algumas mensagens:");
ptbr.setLingo("_CONFIGCHATUNNECESSARYMESSAGESNO_", "Não esconder");
ptbr.setLingo("_CONFIGCHATUNNECESSARYMESSAGESYES_", "Sim");
ptbr.setLingo("_CONFIGCHATUNNECESSARYMESSAGESEXP_", "Para tentar manter um certo clima durante a sessão, é possível desabilitar a impressão de mensagens desnecessárias. As mensagens que não serão impressas (mas ainda serão processadas) por essa configuração são mensagens de Som, Música e Imagens.");
// Chat Persona Designer
ptbr.setLingo("_PERSONADESIGNERTITLE_", "Administrador de Personas");
ptbr.setLingo("_PERSONADESIGNERNAME_", "Nome do Personagem");
ptbr.setLingo("_PERSONADESIGNERAVATAR_", "Link para Imagem (Opcional)");
ptbr.setLingo("_PERSONADESIGNERCREATE_", "Criar");
ptbr.setLingo("_CHATPERSONADESIGNERUSE_", "Usar essa persona");
ptbr.setLingo("_CHATPERSONADESIGNERDELETE_", "Deletar essa persona");
ptbr.setLingo("", "");
ptbr.setLingo("", "");
// Config
ptbr.setLingo("_CONFIGSEVOLUME_", "Volume de Efeitos Sonoros");
ptbr.setLingo("_CONFIGSEVOLUMEEXP_", "Define o volume para efeitos sonoros reproduzidos no RedPG.");
ptbr.setLingo("_CONFIGBGMVOLUME_", "Volume de Músicas");
ptbr.setLingo("_CONFIGBGMVOLUMEEXP_", "Define o volume para músicas reproduzidas no RedPG.");
ptbr.setLingo("_CONFIGSAVE_", "Salvar Configuração");
ptbr.setLingo("_CONFIGERROR_", "Erro salvando configuração.");
ptbr.setLingo("_CONFIGSUCCESS_", "Configurações salvas com sucesso.");
ptbr.setLingo("_CONFIGRESET_", "Resetar Configurações");
ptbr.setLingo("_CONFIGTITLE_", "Configurações");
ptbr.setLingo("_CONFIGCHATFONTSIZE_", "(Chat) Tamanho da fonte:");
ptbr.setLingo("_CONFIGCHATFONTFAMILY_", "(Chat) Fonte:");
ptbr.setLingo("_CHATFONTSIZEEXP01_", "Define o tamanho da fonte utilizada no chat.");
ptbr.setLingo("_CHATFONTSIZEEXP02_", "A fonte se torna menor para a esquerda e maior para a direita.");
ptbr.setLingo("_CHATFONTFAMILEXP01_", "Define qual é a fonte utilizada no Chat. Você pode utilizar qualquer fonte disponível no seu computador.");
ptbr.setLingo("_CHATFONTFAMILEXP02_", "A fonte usada no RedPG é \"Alegreya\". A fonte utilizada no antigo chat do RedPG é \"Caudex\" e ainda está disponível.");
ptbr.setLingo("_CONFIGCHATHELP_", "(Chat) Mostrar texto de ajuda:");
ptbr.setLingo("_CONFIGCHATHELPEXP_", "O texto de ajuda é o guia rápido de utilização do Chat que é normalmente impresso no topo da sala. Essa opção pode esconder esse texto.");
ptbr.setLingo("_CONFIGCHATHELPOP01_", "Imprimir mensagens de ajuda");
ptbr.setLingo("_CONFIGCHATHELPOP02_", "Não imprimir mensagens de ajuda");
ptbr.setLingo("_CONFIGANIMATIONTIME_", "Duração de animações:");
ptbr.setLingo("_ANIMATIONTIMEEXP01_", "Todas as animações do RedPG serão proporcionais a essa configuração.");
ptbr.setLingo("_ANIMATIONTIMEEXP02_", "Abaixar essa configuração pode ajudar em dispositivos mais lentos que estejam tendo dificuldades em processar as animações do RedPG.");
ptbr.setLingo("_CONFIGDARK_", "Dark Mode:");
ptbr.setLingo("_CONFIGDARKNO_", "Não");
ptbr.setLingo("_CONFIGDARKYES_", "~I am the night~");
ptbr.setLingo("_CONFIGDARKEXP_", "Define se o site deve utilizar o modo Dark em questão de cores.");
ptbr.setLingo("_CONFIGCHATZEBRAEXP_", "Define se imagens devem ser destacadas linha a linha.");
ptbr.setLingo("_CONFIGCHATZEBRA_", "Zebra:");
ptbr.setLingo("_CONFIGCHATZEBRANO_", "Imprimir mensagens normalmente");
ptbr.setLingo("_CONFIGCHATZEBRAYES_", "Imprimir mensagens destacando pares");
ptbr.setLingo("_CONFIGCHATAUTOEXP_", "Quando recebendo compartilhamentos no Chat, essa opção define quando o compartilhamento é aceito automaticamente. Você sempre pode aceitar manualmente.");
ptbr.setLingo("_CONFIGCHATAUTONEVER_", "Nunca");
ptbr.setLingo("_CONFIGCHATAUTOSOMETIMES_", "Apenas quando enviado pelo narrador");
ptbr.setLingo("_CONFIGCHATAUTOALWAYS_", "Sempre");
ptbr.setLingo("_CONFIGCHATAUTOBGM_", "(Chat) Aceitar músicas:");
ptbr.setLingo("_CONFIGCHATAUTOSE_", "(Chat) Aceitar efeitos sonoros:");
ptbr.setLingo("_CONFIGCHATAUTOIMAGE_", "(Chat) Aceitar imagens:");
ptbr.setLingo("_CONFIGCHATAUTOVIDEO_", "(Chat) Aceitar vídeos:");
ptbr.setLingo("_CONFIGCHATAUTOROLLS_", "(Chat) Aceitar rolagens:");
ptbr.setLingo("_CONFIGAUTOROLL0_", "Apenas minhas rolagens");
ptbr.setLingo("_CONFIGAUTOROLL1_", "Sempre aplicar automaticamente");
ptbr.setLingo("_CONFIGAUTOROLLEXP_", "Algumas rolagens podem ter alguma automatização implementada para elas, como Iniciativas. Em geral, você, como mestre, receberá uma mensagem para aplicar ela. Aqui você pode aceitar todas as rolagens automaticamente.");
ptbr.setLingo("_CONFIGAUTOROLLAPPLYEFFECT_", "O efeito %b, enviado por %a, foi aplicado automaticamente em %c.");
ptbr.setLingo("_CHATCOMMANDAUTODID_", "Um comando, enviado por %a, foi aplicado automaticamente em %b.");
ptbr.setLingo("_CHATCOMMANDNOTLOADED_", "Ficha para o comando não carregada.");
ptbr.setLingo("_CONFIGCHATMAXMESSAGESEXP01_", "Define quantas mensagens podem estar impressas no chat ao mesmo tempo. Mínimo de 60 mensagens e máximo de 10000 mensagens. Escolha de acordo com seu CPU.");
ptbr.setLingo("_CONFIGCHATMAXMESSAGESEXP02_", "Essa opção é ignorada e se torna 60 quando utilizando dispositivos móveis.");
ptbr.setLingo("_CONFIGCHATMAXMESSAGES_", "(Chat) Número de mensagens:");
ptbr.setLingo("_CONFIGCLEANPERSONAS_", "(Chat) Personas Vazias");
ptbr.setLingo("_CONFIGCLEANPERSONAS01_", "Mostrar personas padrão");
ptbr.setLingo("_CONFIGCLEANPERSONAS02_", "Mostrar personas vazias");
ptbr.setLingo("_CONFIGCLEANPERSONAS03_", "Mostrar personas vazias, sem nome");
ptbr.setLingo("_CONFIGCLEANPERSONASEXP_", "Essa opção retira o estilo padrão das personas e os deixa transparentes.");
ptbr.setLingo("_CONFIGHQRAINBOW_", "(Chat) Arco-íris HQ");
ptbr.setLingo("_CONFIGHQRAINBOW0_", "Nunca");
ptbr.setLingo("_CONFIGHQRAINBOW1_", "Apenas por um tempo");
ptbr.setLingo("_CONFIGHQRAINBOW2_", "Sempre");
ptbr.setLingo("_CONFIGHQRAINBOWEXP_", "Dados críticos exigem muitos recursos para serem processados. Aqui você pode definir quando um dado crítico deve utilizar qualidade alta ou quando ele deve utilizar a qualidade baixa.");
ptbr.setLingo("_CONFIGCHATSCREENEFFECTS_", "(Chat) Efeitos de Tela");
ptbr.setLingo("_CONFIGCHATEFFECTSNO_", "Não aceitar efeitos");
ptbr.setLingo("_CONFIGCHATEFFECTSYES_", "Aceitar efeitos");
ptbr.setLingo("_CONFIGCHATEFFECTSEXP_", "Um mestre pode definir efeitos de tela para tentar atingir um \"clima\" em sua sessão. Aqui você pode definir se esses efeitos de tela são aceitáveis ou não.");
ptbr.setLingo("_CONFIGGAMESHIDEGAMES_", "Mesas Reduzidas");
ptbr.setLingo("_CONFIGGAMESHIDEGAMESON_", "Recolher por padrão");
ptbr.setLingo("_CONFIGGAMESHIDEGAMESOFF_", "Revelar por padrão");
ptbr.setLingo("_CONFIGGAMESHIDEGAMESEXP_", "Define se a tela de mesas deve, por padrão, recolher o conteúdo das mesas para que ocupe menos espaço.");
//Slash Commands
ptbr.setLingo("_CHATHELPCOMMANDSINTRO_", "Comandos disponíveis:");
ptbr.setLingo("_CHATHELPMESSAGEACTION_", "Envia o comando como uma ação com a Persona atual, e.g. /me pula da ponte");
ptbr.setLingo("_CHATHELPMESSAGEBGM_", "Envia o comando como uma música, e.g. /splay link/para/musica.mp3");
ptbr.setLingo("_CHATHELPMESSAGESE_", "Envia o comando como um efeito sonoro, e.g. /seplay link/para/efeito.wav");
ptbr.setLingo("_CHATHELPMESSAGECOUNTDOWN_", "Inicia uma contagem regressiva, em segundos. Também é possível adicionar uma mensagem para imprimir em história. e.g. /count 10    ou    /count 5, Faça algo!");
ptbr.setLingo("_CHATHELPMESSAGEIMAGE_", "Envia o comando como uma imagem, e.g. /imagem link/para/imagem.jpg");
ptbr.setLingo("_CHATHELPMESSAGEOFF_", "Envia o comando como uma mensagem fora de personagem, e.g. /off vou no banheiro");
ptbr.setLingo("_CHATHELPMESSAGEQUOTE_", "Envia o comando como uma mensagem de citação, e.g. /citar Heráclito, Nada é permanente, exceto a mudança.");
ptbr.setLingo("_CHATHELPMESSAGEVIDEO_", "Compartilha um vídeo do YouTube, e.g. /video https://www.youtube.com/watch?v=xuCn8ux2gbs");
ptbr.setLingo("_CHATHELPMESSAGEWEBM_", "Compartilha um vídeo com link direto, e.g. /webm link/para/video.webm");
ptbr.setLingo("_CHATHELPMESSAGEVOTE_", "Cria um botão de votação, e.g. /vote Li tudo");
ptbr.setLingo("_CHATHELPMESSAGEWHISPER_", "Envia uma mensagem privada. É possível deixar o sistema completar o nome sozinho por apertar Tab enquanto digita o nome do destinatário., e.g. /w Reddo, Oi :]");
ptbr.setLingo("_CHATHELPSLASHCLEAR_", "Limpa a tela de mensagens. É possível adicionar a opção 1 para apagar as mensagens no servidor também (Mensagens não podem ser restauradas), e.g. /clear 1");
ptbr.setLingo("_CHATHELPSLASHCOMMANDS_", "Imprime essa lista de comandos, e.g. /help");
ptbr.setLingo("_CHATHELPSLASHIMAGES_", "Imprime uma lista das imagens compartilhadas no chat, em ordem da mais recente para mais antiga, e.g. /imagens");
ptbr.setLingo("_CHATHELPSLASHLINGO_", "Envia uma mensagem codificada como língua, e.g. /lingo Davek, Apenas entendedores entenderão");
ptbr.setLingo("_CHATHELPSLASHLOG_", "Abre a tela que cria logs, e.g. /log");
ptbr.setLingo("_CHATHELPSLASHPICA_", "Cria um quadro em branco para desenhar, pode adicionar uma opção para criar um quadro com artes persistente, e.g. /quadro Como chegar na caverna");
ptbr.setLingo("_CHATHELPSLASHREPLY_", "Atalho para enviar mensagem privada para a última pessoa que te enviou mensagens privadas, e.g. /r Certo, vamos atacar ele juntos");
ptbr.setLingo("_CHATHELPMESSAGESTORY_", "Envia o comando como uma mensagem de história (apenas para narradores), e.g. /story ...And so it came to pass that the Countess, who once bathed in the rejuvenating blood of a hundred virgins, was buried alive...");
// Window Events
ptbr.setLingo("_RAPSCHATOPEN_", "Você está em uma sala. Tem certeza que deseja fechar?");
ptbr.setLingo("_RAPSSHEETOPEN_", "Você possui fichas abertas. Tem certeza que deseja fechar?");
ptbr.setLingo("_RAPSDELETE_", "Deseja mesmo deletar \"%a\"? Essa ação não pode ser desfeita.");
ptbr.setLingo("_LOGOUTCONSENT_", "Deseja mesmo sair do sistema?");
// -------------------------------------------------------------------------
ptbr.setLingo("_PICARINE_", "Desenhar linha  (clicar e arrastar)"); // RINE ENDS HERE
// Lingolist
LingoList.storeLingo(ptbr);
var UI;
(function (UI) {
    /**
     * Window IDs for Page Calling
     */
    UI.idMainWindow = "mainWindow";
    UI.idLoginWindow = "loginWindow";
    UI.idAccountCreationWindow = "createAccountWindow";
    // Left side windows
    UI.idChangelog = "changelogSideWindow";
    UI.idGames = "gamesSideWindow";
    UI.idChat = "chatSideWindow";
    UI.idConfig = "configSideWindow";
    UI.idGameInvites = "gameInvitesSideWindow";
    UI.idStyles = "stylesSideWindow";
    UI.idStyleDesigner = "styleEditorSideWindow";
    UI.idInviteDesigner = "gameInviteFormSideWindow";
    UI.idGameDesigner = "gameDesignerFormSideWindow";
    UI.idRoomDesigner = "roomDesignerFormSideWindow";
    UI.idSheetViewer = "sheetViewerSideWindow";
    UI.idSheetDesigner = "sheetDesignerFormSideWindow";
    UI.idLeftIFrame = "leftIFrame";
    UI.idLeftVideo = "leftVideo";
    // Right side windows
    UI.idHome = "homeSideWindow";
    UI.idSheets = "sheetsSideWindow";
    UI.idImages = "imagesSideWindow";
    UI.idSounds = "soundsSideWindow";
    UI.idSheetPerm = "sheetPermSideWindow";
    UI.idRightIFrame = "rightIFrame";
    UI.idRightVideo = "rightVideo";
    /**
     * Registered UI Configurations
     */
    Application.Config.registerConfiguration("chatMaxMessages", new NumberConfiguration(120, 60, 0)); // Chat Font Size
    Application.Config.registerConfiguration("chatshowhelp", new BooleanConfiguration(true)); // Show help messages on top of chat
    Application.Config.registerConfiguration("chatzebra", new BooleanConfiguration(false)); // Show striped messages
    Application.Config.registerConfiguration("chatfontsize", new NumberConfiguration(16, 12, 32)); // Chat Font Size
    Application.Config.registerConfiguration("chatfontfamily", new Configuration("caudex")); // Chat Font Family
    Application.Config.registerConfiguration("uiDark", new BooleanConfiguration(false)); // Dark mode
    Application.Config.registerConfiguration("animTime", new NumberConfiguration(150, 0, 300)); // Animation Time
    Application.Config.registerConfiguration("language", new LanguageConfiguration()); // Current Language
    Application.Config.registerConfiguration("fsmode", new BooleanConfiguration(false)); // Full Screen Mode (forced)
    Application.Config.registerConfiguration("chatuseprompt", new BooleanConfiguration(true)); // Open up message prompt on mobile
    Application.Config.registerConfiguration("chatAutoRolls", new NumberConfiguration(0, 0, 1)); // Open up message prompt on mobile
    Application.Config.registerConfiguration("autoImage", new NumberConfiguration(1, 0, 2)); // Automatically open shared Images
    Application.Config.registerConfiguration("autoBGM", new NumberConfiguration(1, 0, 2)); // Automatically open shared BGMs
    Application.Config.registerConfiguration("autoSE", new NumberConfiguration(1, 0, 2)); // Automatically open shared Sound Effects
    Application.Config.registerConfiguration("autoVIDEO", new NumberConfiguration(1, 0, 2)); // Automatically open shared Videos
    Application.Config.registerConfiguration("bgmVolume", new NumberConfiguration(50, 0, 100)); // Volume for BGM
    Application.Config.registerConfiguration("seVolume", new NumberConfiguration(50, 0, 100)); // Volume for Sound Effect
    Application.Config.registerConfiguration("bgmLoop", new BooleanConfiguration(true)); // Whether BGMs loop or not
    Application.Config.registerConfiguration("hqRainbow", new NumberConfiguration(1, 0, 2)); // Automatically open shared Videos
    Application.Config.registerConfiguration("screeneffects", new BooleanConfiguration(true));
    Application.Config.registerConfiguration("hideMessages", new BooleanConfiguration(false));
    Application.Config.registerConfiguration("hideGames", new BooleanConfiguration(false));
    function resetTitle() {
        document.title = "RedPG";
    }
    UI.resetTitle = resetTitle;
    function addTitle(str) {
        document.title = str + " RedPG";
    }
    UI.addTitle = addTitle;
    Application.Config.getConfig("uiDark").addChangeListener({
        handleEvent: function (e) {
            UI.setZebra(e.getValue());
        }
    });
    function setZebra(on) {
        var mainWindow = document.getElementById("mainWindow");
        if (on) {
            mainWindow.classList.add("dark");
        }
        else {
            mainWindow.classList.remove("dark");
        }
    }
    UI.setZebra = setZebra;
})(UI || (UI = {}));
function RedPGAccidentPreventionSystem(e) {
    if (UI.Chat.inRoom()) {
        return UI.Language.getLanguage().getLingo("_RAPSCHATOPEN_");
    }
    else if (UI.Sheets.SheetManager.hasSheet()) {
        return UI.Language.getLanguage().getLingo("_RAPSSHEETOPEN_");
    }
}
window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    var confirmationMessage = RedPGAccidentPreventionSystem(e);
    if (confirmationMessage != undefined) {
        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Webkit, Safari, Chrome etc.
    }
});
var UI;
(function (UI) {
    var WindowManager;
    (function (WindowManager) {
        var currentWindow = "";
        var windowList = {};
        var $windowList = {};
        var style = document.createElement('style');
        style.type = 'text/css';
        document.head.appendChild(style);
        var lastStyleInnerHTML = "";
        (function () {
            var children = document.body.children;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.classList.contains("window")) {
                    windowList[child.getAttribute("id")] = child;
                    $windowList[child.getAttribute("id")] = $(child);
                }
            }
        })();
        function callWindow(id) {
            var animationTime = Application.Config.getConfig("animTime").getValue() * 2;
            if (windowList[id] === undefined) {
                console.log("--- Error: Attempt to call inexistent window: " + id + ", ignoring.");
                return;
            }
            if (id === currentWindow)
                return; // Same window, no point
            if (currentWindow === "") {
                detachAllWindows();
            }
            else {
                console.debug("Detaching current window: " + currentWindow);
                windowList[currentWindow].style.zIndex = "1";
                windowList[currentWindow].style.opacity = "1";
            }
            var oldid = currentWindow;
            currentWindow = id;
            console.debug("Appending window: " + id);
            $windowList[currentWindow].finish().css("opacity", "0").animate({ opacity: 1 }, animationTime, (function () {
                var ele = document.getElementById(this.oldid);
                if (ele === null) {
                    return;
                }
                if (ele.parentNode !== null) {
                    ele.parentNode.removeChild(ele);
                }
            }).bind({ oldid: oldid }));
            windowList[currentWindow].style.zIndex = "2";
            document.body.appendChild(windowList[currentWindow]);
            UI.Language.updateScreen(windowList[currentWindow]);
        }
        WindowManager.callWindow = callWindow;
        function detachAllWindows() {
            for (var key in windowList) {
                document.body.removeChild(windowList[key]);
            }
        }
        function detachWindow(id) {
            document.body.removeChild(windowList[id]);
        }
        function getWindow(id) {
            if (windowList[id] !== undefined) {
                return windowList[id];
            }
            return null;
        }
        WindowManager.getWindow = getWindow;
        function updateWindowSizes() {
            var stylehtml = "";
            // Find left and right sizes
            var totalWidth = window.innerWidth;
            var rightSize = 698;
            var leftSize = 35 + 340 + 100; // Buttons + 4 Avatars + 2 extra dice buttons
            var remainingSize = totalWidth - rightSize - leftSize - 20;
            if (remainingSize > 255) {
                remainingSize = 255 + ((remainingSize - 255) * 1 / 2); // Right side grows too when too big
            }
            if (remainingSize < 0 || Application.Config.getConfig("fsmode").getValue()) {
                UI.Handles.setAlwaysUp(true);
                leftSize = totalWidth - 120;
                rightSize = leftSize;
                stylehtml += ".rightSideWindow { background-color: rgba(0,0,0,.5);} ";
            }
            else {
                UI.Handles.setAlwaysUp(false);
                leftSize += Math.floor(remainingSize / 85) * 85; // Fit as many avatars as possible
                rightSize = totalWidth - leftSize - 20; // Remove handle sizes
            }
            stylehtml += ".leftSideWindow { width: " + leftSize + "px; }\n.rightSideWindow { width: " + rightSize + "px; }";
            WindowManager.currentLeftSize = leftSize;
            WindowManager.currentRightSize = rightSize;
            // Set up handles
            if (UI.Handles.isAlwaysUp()) {
                stylehtml += "\n.leftSideWindow { left: 60px; }\n.rightSideWindow { right: 60px; }";
            }
            // Only do costly update if necessary
            if (stylehtml !== lastStyleInnerHTML) {
                style.innerHTML = stylehtml;
                lastStyleInnerHTML = stylehtml;
            }
        }
        WindowManager.updateWindowSizes = updateWindowSizes;
        window.addEventListener("resize", function () {
            UI.WindowManager.updateWindowSizes();
        });
    })(WindowManager = UI.WindowManager || (UI.WindowManager = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Logger;
    (function (Logger) {
        var $slider = $(document.getElementById("loggerSlider"));
        var window = document.getElementById("loggerWindow");
        var $window = $(window);
        var currentRoom;
        var acceptedModules;
        var messages;
        var currentLeft;
        var currentRight;
        var messagesToPrint = 3;
        var printTarget = document.getElementById("loggerTarget");
        var checkboxesTarget = document.getElementById("loggerCheckboxes");
        document.getElementById("loggerSubmit").addEventListener("click", function (e) {
            e.preventDefault();
            UI.Logger.submit();
        });
        function callSelf(room) {
            open();
            currentRoom = room;
            messages = currentRoom.getOrderedMessages();
            currentLeft = 0;
            currentRight = messages.length - 1;
            updateSlider();
            updateCheckboxes();
            updateMessages();
        }
        Logger.callSelf = callSelf;
        function filter() {
            var newMessages = [];
            for (var i = currentLeft; i <= currentRight; i++) {
                if (acceptedModules.indexOf(messages[i].module) !== -1 && !messages[i].hasDestination()) {
                    newMessages.push(messages[i]);
                }
            }
            return newMessages;
        }
        Logger.filter = filter;
        function updateSlider() {
            var min = 0;
            var max = messages.length - 1;
            $slider.slider({
                range: true,
                min: min,
                max: max,
                values: [currentLeft, currentRight],
                slide: function (event, ui) {
                    UI.Logger.setSlider(ui.values[0], ui.values[1]);
                }
            });
        }
        Logger.updateSlider = updateSlider;
        function updateMessages() {
            while (printTarget.firstChild)
                printTarget.removeChild(printTarget.firstChild);
            var filtered = filter();
            if (filtered.length < messagesToPrint * 2) {
                for (var i = 0; i < filtered.length; i++) {
                    var ele = filtered[i].getHTML();
                    if (ele !== null)
                        printTarget.appendChild(ele);
                }
            }
            else {
                for (var i = 0; i <= messagesToPrint; i++) {
                    var ele = filtered[i].getHTML();
                    if (ele !== null)
                        printTarget.appendChild(ele);
                }
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("........"));
                printTarget.appendChild(p);
                for (var i = (filtered.length - 1 - messagesToPrint); i < filtered.length; i++) {
                    var ele = filtered[i].getHTML();
                    if (ele !== null)
                        printTarget.appendChild(ele);
                }
            }
        }
        Logger.updateMessages = updateMessages;
        function updateCheckboxes() {
            while (checkboxesTarget.firstChild)
                checkboxesTarget.removeChild(checkboxesTarget.firstChild);
            var msgTypes = MessageFactory.getMessagetypeArray();
            for (var i = 0; i < msgTypes.length; i++) {
                // TODO: Implement module strings as static
            }
            var msgModules = [];
            for (var i = 0; i < messages.length; i++) {
                if (msgModules.indexOf(messages[i].module) === -1) {
                    msgModules.push(messages[i].module);
                }
            }
            msgModules.sort();
            acceptedModules = [];
            for (var i = 0; i < msgModules.length; i++) {
                acceptedModules.push(msgModules[i]);
                var label = document.createElement("label");
                label.classList.add("loggerLabel");
                var input = document.createElement("input");
                input.type = "checkbox";
                input.checked = true;
                label.appendChild(input);
                label.appendChild(document.createTextNode(msgModules[i]));
                input.addEventListener("change", {
                    input: input,
                    module: msgModules[i],
                    handleEvent: function () {
                        UI.Logger.setModule(this.module, this.input.checked);
                    }
                });
                checkboxesTarget.appendChild(label);
            }
        }
        Logger.updateCheckboxes = updateCheckboxes;
        function setModule(module, acceptable) {
            if (acceptable) {
                if (acceptedModules.indexOf(module) === -1) {
                    acceptedModules.push(module);
                }
            }
            else {
                var pos = acceptedModules.indexOf(module);
                if (pos !== -1) {
                    acceptedModules.splice(pos, 1);
                }
            }
            updateMessages();
        }
        Logger.setModule = setModule;
        function setSlider(left, right) {
            currentLeft = left < 0 ? 0 : left;
            currentRight = right >= messages.length ? messages.length - 1 : right;
            updateMessages();
        }
        Logger.setSlider = setSlider;
        function open() {
            $window.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
        }
        Logger.open = open;
        function close() {
            $window.stop().fadeOut(Application.Config.getConfig("animTime").getValue());
        }
        Logger.close = close;
        var html;
        var js;
        var lib;
        function submit() {
            html = null;
            js = null;
            lib = null;
            var cbe = function () { };
            var cbsHTML = function (html) {
                UI.Logger.setHTML(html);
            };
            var cbsJS = function (js) {
                UI.Logger.setJS(js);
            };
            var cbsLib = function (lib) {
                UI.Logger.setLib(lib);
            };
            var ajaxHTML = new AJAXConfig(Server.CLIENT_URL + "index.html?" + (new Date).getTime());
            ajaxHTML.setResponseTypeText();
            ajaxHTML.setTargetLeftWindow();
            Server.AJAX.requestPage(ajaxHTML, cbsHTML, cbe);
            var ajaxJS = new AJAXConfig(Server.CLIENT_URL + "js/Application.js?" + (new Date).getTime());
            ajaxJS.setResponseTypeText();
            ajaxJS.setTargetLeftWindow();
            Server.AJAX.requestPage(ajaxJS, cbsJS, cbe);
            var ajaxLib = new AJAXConfig(Server.CLIENT_URL + document.getElementById("redpgLibraries").getAttribute("src") + "?" + (new Date).getTime());
            ajaxLib.setResponseTypeText();
            ajaxLib.setTargetLeftWindow();
            Server.AJAX.requestPage(ajaxLib, cbsLib, cbe);
        }
        Logger.submit = submit;
        function setHTML(code) {
            html = code;
            if (js !== null && lib !== null) {
                saveLog();
            }
        }
        Logger.setHTML = setHTML;
        function setJS(code) {
            js = code;
            if (html !== null && lib !== null) {
                saveLog();
            }
        }
        Logger.setJS = setJS;
        function setLib(code) {
            lib = code;
            if (html !== null && js !== null) {
                saveLog();
            }
        }
        Logger.setLib = setLib;
        function giveMeLog() {
            return currentRoom.getGame().exportAsLog(currentRoom.id, filter());
        }
        Logger.giveMeLog = giveMeLog;
        function hardReplace(str, target, replaceWith) {
            var idx = str.indexOf(target);
            var tarLength = target.length;
            var strLength = str.length;
            return str.substr(0, idx) + replaceWith + str.substr(idx + tarLength, strLength - idx - tarLength);
        }
        function saveLog() {
            var log = currentRoom.getGame().exportAsLog(currentRoom.id, filter());
            js = "<script type='text/javascript' charset='UTF-8'>" + lib + "\n" + js + "\nUI.Logger.openLog(" + JSON.stringify(log) + ");" + "<\/script>";
            html = html.replace(new RegExp("href='stylesheets", 'g'), "href='" + Server.CLIENT_URL + "stylesheets");
            html = html.replace(new RegExp("href='images", 'g'), "href='" + Server.CLIENT_URL + "images");
            html = html.replace(new RegExp("src='images", 'g'), "src='" + Server.CLIENT_URL + "images");
            html = hardReplace(html, "<script src='js/Application.js' type='text/javascript'><\/script>", js);
            var blob = new Blob([html], { type: "text/plain;charset=utf-8;" });
            var d = new Date();
            var curr_date = d.getDate() < 10 ? "0" + d.getDate().toString() : d.getDate().toString();
            var curr_month = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1).toString() : (d.getMonth() + 1).toString();
            var curr_year = d.getFullYear();
            var roomName = currentRoom.name;
            var gameName = currentRoom.getGame().getName();
            saveAs(blob, gameName + " - " + roomName + " (" + curr_year + curr_month + curr_date + ").html");
        }
        Logger.saveLog = saveLog;
        function openLog(log) {
            Application.Login.logout();
            Application.Config.getConfig("chatMaxMessages").storeValue(log['rooms'][0]['messages'].length + 10);
            DB.GameDB.updateFromObject([log], true);
            UI.WindowManager.callWindow(('mainWindow'));
            UI.PageManager.callPage(UI.idHome);
            UI.Chat.callSelf(0, true);
            document.getElementById("chatMessageStateIcon").style.display = "none";
            document.getElementById("leftHandleBar").style.display = "none";
            document.getElementById("rightHandleBar").style.display = "none";
            document.getElementById("chatMessageBox").style.display = "none";
            document.getElementById("chatMessageSendButton").style.display = "none";
            document.getElementById("personaBox").style.display = "none";
            document.getElementById("diceFormBox").style.display = "none";
            document.getElementById("bottomBox").style.display = "none";
            document.getElementById("avatarBox").style.display = "none";
            document.getElementById("avatarUpButton").style.display = "none";
            document.getElementById("avatarDownButton").style.display = "none";
            document.getElementById("chatButtonsBox").style.top = "5px";
            document.getElementById("chatBox").style.top = "5px";
            document.getElementById("chatBox").style.bottom = "5px";
            document.getElementById("chatScrollDown").style.bottom = "15px";
            UI.Chat.scrollToTop();
        }
        Logger.openLog = openLog;
    })(Logger = UI.Logger || (UI.Logger = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Config;
    (function (Config) {
        var error = document.getElementById("configError");
        var success = document.getElementById("configSuccess");
        var timeout = null;
        error.style.display = "none";
        success.style.display = "none";
        document.getElementById("configButton").addEventListener("click", function () { UI.PageManager.callPage(UI.idConfig); });
        document.getElementById("configSave").addEventListener("click", function () {
            UI.Config.saveConfig();
        });
        document.getElementById("configReset").addEventListener("click", function () {
            Application.Config.reset();
        });
        function bindInput(configName, input) {
            Application.Config.getConfig(configName).addChangeListener({
                input: input,
                handleEvent: function (config) {
                    this.input.value = config.getValue().toString();
                }
            });
            input.addEventListener("change", {
                configName: configName,
                input: input,
                handleEvent: function () {
                    var cfg = Application.Config.getConfig(this.configName);
                    cfg.storeValue(this.input.value);
                    var str = cfg.getValue().toString();
                    this.input.value = str;
                }
            });
            input.value = Application.Config.getConfig(configName).getValue().toString();
        }
        Config.bindInput = bindInput;
        bindInput("chatfontfamily", document.getElementById("configChatFontFamily"));
        bindInput("chatMaxMessages", document.getElementById("configChatMaxMessages"));
        bindInput("chatfontsize", document.getElementById("configChatFontSize"));
        bindInput("chatshowhelp", document.getElementById("configChatShowHelp"));
        bindInput("chatAutoRolls", document.getElementById("configAutoRollApplication"));
        bindInput("chatzebra", document.getElementById("configChatZebra"));
        bindInput("uiDark", document.getElementById("configChatDark"));
        bindInput("animTime", document.getElementById("configAnimTime"));
        bindInput("autoBGM", document.getElementById("configChatAutoBGM"));
        bindInput("autoSE", document.getElementById("configChatAutoSE"));
        bindInput("autoImage", document.getElementById("configChatAutoImage"));
        bindInput("autoVIDEO", document.getElementById("configChatAutoVideo"));
        bindInput("bgmVolume", document.getElementById("configBGMVolume"));
        bindInput("seVolume", document.getElementById("configSEVolume"));
        bindInput("screeneffects", document.getElementById("configChatScreenEffects"));
        bindInput("hideGames", document.getElementById("configGamesHideGames"));
        bindInput("hideMessages", document.getElementById("configChatHideSomeMessages"));
        function saveConfig() {
            var hide = function () {
                this.finish().fadeOut(Application.Config.getConfig("animTime").getValue());
            };
            var cbs = {
                hide: hide,
                success: success,
                handleEvent: function () {
                    var $success = $(this.success);
                    $success.finish().fadeIn(Application.Config.getConfig("animTime").getValue());
                    UI.Config.setUniqueTimeout(this.hide.bind($success), 5000);
                }
            };
            var cbe = {
                hide: hide,
                error: error,
                handleEvent: function () {
                    var $error = $(this.error);
                    $error.finish().fadeIn(Application.Config.getConfig("animTime").getValue());
                    UI.Config.setUniqueTimeout(this.hide.bind($error), 5000);
                }
            };
            success.style.display = "none";
            error.style.display = "none";
            Application.Config.saveConfig(cbs, cbe);
        }
        Config.saveConfig = saveConfig;
        function setUniqueTimeout(f, t) {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(f, t);
        }
        Config.setUniqueTimeout = setUniqueTimeout;
    })(Config = UI.Config || (UI.Config = {}));
})(UI || (UI = {}));
///<reference path="Kinds/Classes/Changelog.ts"/>
// This is a typescript file, but it's not to be written as typescript
// Only Changelog class usage is allowed in this file.
var change;
change = new Changelog(0, 8, 0);
change.addMessage("Implemented most of the application before Changelog implemented.", "en");
change.addMessage("Maior parte do aplicativo implementado antes da inclusão de Log de Mudanças.", "pt");
change = new Changelog(0, 9, 0);
change.addMessage("Implemented changelog.", "en");
change.addMessage("Log de Mudanças implementado.", "pt");
change = new Changelog(0, 10, 0);
change.addMessage("/log slash command added to chat.", "en");
change.addMessage("Comando /log adicionado ao chat.", "pt");
change = new Changelog(0, 11, 0);
change.addMessage("Sheet permissions implemented.", "en");
change.addMessage("Implementadas permissões para fichas.", "pt");
change = new Changelog(0, 12, 0);
change.addMessage("Style editor implemented.", "en");
change.addMessage("Editor de estilos implementado.", "pt");
change = new Changelog(0, 13, 0);
change.addMessage("Sheet creation implemented.", "en");
change.addMessage("Opening sheets implemented.", "en");
change.addMessage("Cutscene mode implemented in chats.", "en");
change.addMessage("Criação de fichas implementada.", "pt");
change.addMessage("Abrir fichas implementado.", "pt");
change.addMessage("Modo Cutscene implementado em chats.", "pt");
change = new Changelog(0, 14, 0);
change.addMessage("Improvements to custom types in custom styles.", "en");
change.addMessage("Fix: sharing Sound Effects correctly shares as a Sound Effect, rather than a BGM.", "en");
change.addMessage("Fix: Scouring SheetLists for values.", "en");
change.addMessage("Exporting sheets as JSON always exports current state.", "en");
change.addMessage("Reduce unnecessary Math field change trigger.", "en");
change.addMessage("Adds more SheetVariables and SheetButtons.", "en");
change.addMessage("Melhoras para tipos personalizados em estilos personalizados.", "pt");
change.addMessage("Fix: compartilhar Efeitos Sonoros corretamente compartilha como Efeito Sonoro e não BGM.", "pt");
change.addMessage("Fix: Buscar valores dentro de SheetLists.", "pt");
change.addMessage("Exportar fichas como JSON sempre exporta o estado atual da ficha.", "pt");
change.addMessage("Reduz atualizações desnecessárias causadas por campos Math.", "pt");
change.addMessage("Adiciona mais SheetVariables e SheetButtons.", "pt");
change = new Changelog(0, 15, 0);
change.addMessage("Create Account.", "en");
change.addMessage("Login error messages.", "en");
change.addMessage("Criação de contas.", "pt");
change.addMessage("Mensagens de erro para login.", "pt");
change = new Changelog(0, 16, 0);
change.addMessage("Language Tracker implemented.", "en");
change.addMessage("Multiple Languages added.", "en");
change.addMessage("Gerenciador de Línguas implementado.", "pt");
change.addMessage("Múltiplas línguas adicionadas.", "pt");
change = new Changelog(0, 16, 1);
change.addMessage("Default chat font changed to Alegreya. Caudex still available in options.", "en");
change.addMessage("Fonte padrão do chat alterada para Alegreya. Caudex ainda disponível em opções.", "pt");
change = new Changelog(0, 17, 0);
change.addMessage("It is now possible to force sounds into a folder.", "en");
change.addMessage("Opção para forçar sons a uma determinada pasta criada.", "pt");
change = new Changelog(0, 18, 0);
change.addMessage("Chat font defaults to Caudex again, it was chosen for a reason.", "en");
change.addMessage("Fonte do chat padrão retornada para Caudex. Alegreya ainda pode ser utilizada em opções.", "pt");
change.addMessage("It is now possible to force images into a folder.", "en");
change.addMessage("Opção para forçar imagens a uma determinada pasta criada.", "pt");
change = new Changelog(0, 19, 0);
change.addMessage("Initial combat tracker release. More planned for later.", "en");
change.addMessage("Lançamento inicial do Combat Tracker. Atualizações planejadas para o futuro.", "pt");
change = new Changelog(0, 20, 0);
change.addMessage("Effect tracking added to Combat Tracker. Admin screen not implemented for it.", "en");
change.addMessage("Efeitos adicionados ao Combat Tracker. Uma tela de administração para eles não foi implementada.", "pt");
change = new Changelog(0, 21, 0);
change.addMessage("Multiple changes to Sheet classes.", "en");
change.addMessage("Várias mudanças em classes Sheet.", "pt");
change = new Changelog(0, 22, 0);
change.addMessage("Multiple changes to Sheets. It's now possible to save sheets.", "en");
change.addMessage("Várias mudanças em Sheets. Agora é possível salvar sheets.", "pt");
change = new Changelog(0, 23, 0);
change.addMessage("Fixes for sheets.", "en");
change.addMessage("Sheet Auto-Update is now the Default state.", "en");
change.addMessage("Move from Beta to Current.", "en");
change.addMessage("Correções em Sheets.", "pt");
change.addMessage("Atualizar Fichas Automaticamente agora é o estado padrão.", "pt");
change.addMessage("Mudança de Beta para Atual. We 2 now.", "pt");
change = new Changelog(0, 24, 0);
change.addMessage("New button to toggle out of Sheet editing.", "en");
change.addMessage("Holding Control while opening a sheet will not move the page.", "en");
change.addMessage("Novo botão para sair de edição de fichas.", "pt");
change.addMessage("Segurar Control ao abrir fichas não troca a página.", "pt");
change = new Changelog(0, 24, 1);
change.addMessage("Fix: Cutscene mode", "en");
change.addMessage("Fix: Modo Cutscene.", "pt");
change = new Changelog(0, 24, 2);
change.addMessage("Fix: Logger should correctly log.", "en");
change.addMessage("Fix: Logger deve loggar corretamente.", "pt");
change = new Changelog(0, 24, 3);
change.addMessage("Improvements to logger.", "en");
change.addMessage("Melhoras ao logger.", "pt");
change = new Changelog(0, 24, 4);
change.addMessage("Fix: Sheet Variables randomly forgetting who they are.", "en");
change.addMessage("Fix: Variáveis de Ficha esquecendo quem são.", "pt");
change = new Changelog(0, 25, 0);
change.addMessage("Filters are now available in Rooms.", "en");
change.addMessage("É possível aplicar Filtros em Salas.", "pt");
change = new Changelog(0, 26, 0);
change.addMessage("New message type: quotes. Usage: /quote Name, Quote.", "en");
change.addMessage("New option to not print certain message types for immersion purposes.", "en");
change.addMessage("Novo tipo de mensagem: citação. Como usar: /citar Nome, Citação.", "pt");
change.addMessage("Nova opção para não imprimir certos tipos de mensagem e aumentar imersão.", "pt");
change = new Changelog(0, 27, 0);
change.addMessage("Updates to sheet code.", "en");
change.addMessage("Fix: /images works when unnecessary messages are disabled.", "en");
change.addMessage("Updates no código de sheets.", "pt");
change.addMessage("Fix: /imagens funciona quando mensagens desnecessárias está desabilitado.", "pt");
change = new Changelog(0, 27, 1);
change.addMessage("Updates to sheet code.", "en");
change.addMessage("Added syllabi to Elvish.", "en");
change.addMessage("Updates no código de sheets.", "pt");
change.addMessage("Adicionadas sílabas a Elfico.", "pt");
change = new Changelog(0, 27, 1);
change.addMessage("Fix: /w auto-complete will use the FULL nickname rather than the UNIQUE nickname.", "en");
change.addMessage("Fix: Auto-completar do /w ira usar o nick COMPLETO ao invés de nick ÚNICO.", "pt");
change = new Changelog(0, 27, 2);
change.addMessage("Fix: Logs should work now. Old logs need to be recreated or fixed manually.", "en");
change.addMessage("Fix: Logs devem funcionar agora. Logs antigos deverão ser recriados ou consertados manualmente.", "pt");
change = new Changelog(0, 27, 2);
change.addMessage("Fix: Logs will no longer include personal messages.", "en");
change.addMessage("Fix: Logs não irão mais incluir mensagens pessoais.", "pt");
change = new Changelog(0, 27, 3);
change.addMessage("Personas with the same name will now correctly maintain their order in th Persona Manager.", "en");
change.addMessage("Fix: Personas with no avatar will no longer bug out.", "en");
change.addMessage("Personas com o mesmo nome irão manter uma ordem consistente no gerenciador de personas.", "pt");
change.addMessage("Fix: Personas sem um link de imagem não vão mais causar erros.", "pt");
change = new Changelog(0, 27, 4);
change.addMessage("Common URL fixing will be applied to any images opened.", "en");
change.addMessage("Links de qualquer imagem aberta serão corrigidos.", "pt");
change = new Changelog(0, 28, 0);
change.addMessage("Art and other tools added to images.", "en");
change.addMessage("Arte e outras ferramentas adicionadas a imagens.", "pt");
change = new Changelog(0, 28, 1);
change.addMessage("Circles and Squares added.", "en");
change.addMessage("/board added. It's used to create boards for art.", "en");
change.addMessage("Círculos e quadrados adicionados.", "pt");
change.addMessage("/quadro adicionado. Pode ser utilizado para criar quadros para desenhos.", "pt");
change = new Changelog(0, 28, 2);
change.addMessage("Fix: loading a LOT of personas will no longer slow down RedPG.", "en");
change.addMessage("Fix: carregar MUITAS personas não vai mais acontecer devagar.", "pt");
change = new Changelog(0, 29, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Janelas criadas pelo Chat terão seus botões de fechar do lado direito.", "pt");
change.addMessage("Mensagens tentarão prevenir que RedPG seja fechado por acidente sempre que pelo menos uma ficha esteja aberta ou um Chat esteja conectado.", "pt");
change.addMessage("Para deletar Fichas, Jogos e Salas, será necessário confirmar.", "pt");
change = new Changelog(0, 29, 1);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Nova opção: esconder conteúdo de Mesas na tela de Mesas. Por padrão, mesas tem seu conteúdo revelado, podendo ser escondida manualmente com cliques, mas existe uma opção na tela de Opções que faz todas as mesas ficarem recolhidas por padrão.", "pt");
change.addMessage("Confirmação é exigida para realizar Logout.", "pt");
change.addMessage("Fichas são separadas por suas pastas no Combat Tracker.", "pt");
change.addMessage("Ordem das fichas não deve mais ser afetada por caracteres minúsculos.", "pt");
change.addMessage("Novo botão em fichas permite ativar e desativar a alteração de fichas. Por padrão a alteração é permitida.", "pt");
change.addMessage("Chat altera o título da janela para avisar quando existem mensagens novas.", "pt");
change = new Changelog(0, 29, 2);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Durante a criação de fichas, fichas de história ou mapas ou outras fichas com nomes variáveis por língua irão mostrar seu nome corretamente. _SHEETSTORY_ agora é apenas \"História\".", "pt");
change = new Changelog(0, 30, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Reformular RedPG2 para poder ser trabalhado na versão mais recente do TypeScript.", "pt");
change.addMessage("Tentativa de corrigir problemas encontrados no Sistema de Prevenção de Acidentes do RedPG (RAPS).", "pt");
change.addMessage("Botões de controle de imagem refeitos.", "pt");
change = new Changelog(0, 31, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Possibilidade de Zebra adicionado às configurações.", "pt");
change.addMessage("/comandos implementado.", "pt");
change.addMessage("/clear implementado.", "pt");
change = new Changelog(0, 32, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Suporte a iFrames e Vídeos.", "pt");
change.addMessage("/youtube implementado.", "pt");
change.addMessage("/webm implementado.", "pt");
change = new Changelog(0, 33, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Personas agora são salvas no servidor, ao invés de no LocalStorage do browser.", "pt");
change = new Changelog(0, 33, 1);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Gerenciador de Personas salva a lista de personas antes de abrir, caso ainda não tenha salvo.", "pt");
change = new Changelog(0, 33, 2);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Corrige personas não salvarem quando criadas sem o Administrador de Personas aberto.", "pt");
change = new Changelog(0, 33, 3);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Previne erro ao fechar salas.", "pt");
change = new Changelog(0, 34, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Botão adicionado para esconder personas.", "pt");
change.addMessage("É possível deletar pastas inteiras de Imagens e Sons.", "pt");
change.addMessage("Lingo recebeu suporte a história e quotes. Usage: /linghist Davek, História!   ,   /lingquo Davek, João, Mensagem", "pt");
change = new Changelog(0, 35, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("/count pode incluir mensagens para imprimir em modo história. Isso é uma maneira mais limpa e discreta de fazer timers. Exemplo: /count 10, Algum evento com tempo..", "pt");
change.addMessage("Opção Dark Mode adicionada às opções. 100% BETA", "pt");
change = new Changelog(0, 35, 1);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Correção da cor do texto de ações no modo dark.", "pt");
change.addMessage("Adicionada opção para adicionar links diretos à lista de imagens.", "pt");
change = new Changelog(0, 36, 0);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("TypeScript atualizado para TypeScript 4. Favor reportar qualquer comportamento estranho.", "pt");
change.addMessage("RedPG Accident Prevention System (RAPS) permite sair do RedPG sem ter chat/fichas abertas.", "pt");
change.addMessage("Criação de novas contas não salva mais nomes de indivíduos. Nomes guardados anteriormente serão removidos do servidor. Isso não afeta o funcionamento das contas nem do sistema - o Nome já não era utilizado, apenas não será mais requisitado nem guardado.", "pt");
change.addMessage("Atualização das libraries utilizadas pelo RedPG.", "pt");
change = new Changelog(0, 36, 1);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Novas mensagens de doação.", "pt");
change = new Changelog(0, 36, 2);
change.addMessage("TODO: ADD ENGLISH MESSAGES", "en");
change.addMessage("Se uma ficha rolar iniciativa e não estiver no tracker, ela será adicionada ao tracker como NPC.", "pt");
//delete (change);
Changelog.finished();
/// <reference path='../../Changelog.ts' />
var UI;
/// <reference path='../../Changelog.ts' />
(function (UI) {
    var ChangelogManager;
    (function (ChangelogManager) {
        var currentVersionNode = document.getElementById("changelogCurrentVersion").childNodes[0];
        var externalVersionNode = document.getElementById("changelogActualVersion").childNodes[0];
        var warning = document.getElementById("changelogWarning");
        var target = document.getElementById("changelogTarget");
        function print() {
            empty();
            var localVersion = Changelog.getLocalVersion();
            var externalVersion = Changelog.getExternalVersion();
            if (externalVersion !== null) {
                if (localVersion.toString() === externalVersion.toString()) {
                    warning.style.display = "none";
                }
                else {
                    warning.style.display = "";
                }
                currentVersionNode.nodeValue = localVersion[0] + "." + localVersion[1] + "." + localVersion[2];
                externalVersionNode.nodeValue = externalVersion[0] + "." + externalVersion[1] + "." + externalVersion[2];
            }
            else {
                warning.style.display = "";
                currentVersionNode.nodeValue = localVersion[0] + "." + localVersion[1] + "." + localVersion[2];
                externalVersionNode.nodeValue = "?.?.?";
            }
            var updates = Changelog.getUpdates();
            for (var i = 0; i < updates.length; i++) {
                addOnTop(updates[i].getHTML(false));
            }
            updates = Changelog.getMissingUpdates();
            for (var i = 0; i < updates.length; i++) {
                addOnTop(updates[i].getHTML(true));
            }
        }
        ChangelogManager.print = print;
        function empty() {
            while (target.firstChild !== null) {
                target.removeChild(target.firstChild);
            }
        }
        function addOnTop(ele) {
            if (target.firstChild !== null) {
                target.insertBefore(ele, target.firstChild);
            }
            else {
                target.appendChild(ele);
            }
        }
        addOnReady("UI.ChangelogManager", "Printing initial Changelog", {
            handleEvent: function () {
                UI.ChangelogManager.print();
            }
        });
    })(ChangelogManager = UI.ChangelogManager || (UI.ChangelogManager = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var PageManager;
    (function (PageManager) {
        var $currentLeft = null;
        var $currentRight = null;
        var mainWindow = document.getElementById("mainWindow");
        PageManager.$pages = {};
        function getAnimationTime() {
            return Application.Config.getConfig("animTime").getValue() * 2;
        }
        PageManager.getAnimationTime = getAnimationTime;
        function callPage(id) {
            var animationTime = getAnimationTime();
            var $page = PageManager.$pages[id];
            if ($page === undefined) {
                return console.log("Attempt to call inexistent page at " + id + ". Ignoring.");
            }
            if ($page[0].classList.contains("leftSideWindow")) {
                if (UI.Handles.isAlwaysUp() && $currentRight !== null)
                    closeRightPage();
                if ($currentLeft !== null && $page[0] === $currentLeft[0])
                    return;
                var offLeft = (UI.Handles.isAlwaysUp() ? 60 : 10) - UI.WindowManager.currentLeftSize;
                closeLeftPage();
                $page.finish();
                mainWindow.appendChild($page[0]);
                $page[0].style.left = offLeft + "px";
                $page.animate({
                    left: (UI.Handles.isAlwaysUp() ? 60 : 10)
                }, animationTime, function () {
                    this.style.left = "";
                });
                $currentLeft = $page;
            }
            else {
                if ($currentRight !== null && $page[0] === $currentRight[0])
                    return;
                closeRightPage();
                var offRight = (UI.Handles.isAlwaysUp() ? 60 : 10) - UI.WindowManager.currentRightSize;
                $page.finish();
                mainWindow.appendChild($page[0]);
                $page[0].style.right = offRight + "px";
                $page.animate({
                    right: (UI.Handles.isAlwaysUp() ? 60 : 10)
                }, animationTime, function () {
                    this.style.right = "";
                });
                $currentRight = $page;
            }
            UI.Language.updateScreen($page[0]);
        }
        PageManager.callPage = callPage;
        function closeLeftPage() {
            var offLeft = (UI.Handles.isAlwaysUp() ? 60 : 10) - UI.WindowManager.currentLeftSize;
            var animationTime = getAnimationTime();
            if ($currentLeft !== null) {
                $currentLeft.finish().animate({
                    left: offLeft
                }, animationTime, function () {
                    this.style.left = "";
                    this.parentElement.removeChild(this);
                });
                $currentLeft = null;
            }
        }
        PageManager.closeLeftPage = closeLeftPage;
        function closeRightPage() {
            if ($currentRight === null)
                return;
            var animationTime = getAnimationTime();
            var offRight = (UI.Handles.isAlwaysUp() ? 60 : 10) - UI.WindowManager.currentRightSize;
            $currentRight.finish().animate({
                right: offRight
            }, animationTime, function () {
                this.style.right = "";
                this.parentElement.removeChild(this);
            });
            $currentRight = null;
        }
        PageManager.closeRightPage = closeRightPage;
        ;
        function readWindows() {
            var children = mainWindow.children;
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                if (child.getAttribute("id") !== null && (child.classList.contains("leftSideWindow") || child.classList.contains("rightSideWindow"))) {
                    if (child.classList.contains("dontDetach")) {
                        continue;
                    }
                    PageManager.$pages[child.getAttribute("id")] = $(child);
                    mainWindow.removeChild(child);
                }
            }
        }
        PageManager.readWindows = readWindows;
        function getCurrentLeft() {
            if ($currentLeft === null) {
                return null;
            }
            return $currentLeft[0].getAttribute("id");
        }
        PageManager.getCurrentLeft = getCurrentLeft;
    })(PageManager = UI.PageManager || (UI.PageManager = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Images;
    (function (Images) {
        document.getElementById("imagesButton").addEventListener("click", function () { UI.Images.callSelf(); });
        document.getElementById("dropboxImagesButton").addEventListener("click", function () { UI.Images.callDropbox(); });
        document.getElementById("linkImagesButton").addEventListener("click", function () { UI.Images.addLink(); });
        var folderInput = document.getElementById("dropboxImagesFolderName");
        var linkFolderInput = document.getElementById("linkImagesFolderName");
        var linkURLInput = document.getElementById("linkImagesLink");
        var linkNameInput = document.getElementById("linkImagesName");
        var target = document.getElementById("imagesTarget");
        var loadError = document.getElementById("imagesLoadError");
        var saveError = document.getElementById("imagesSaveError");
        target.removeChild(saveError);
        target.removeChild(loadError);
        var autoFolder = null;
        function emptyTarget() {
            while (target.firstChild !== null) {
                target.removeChild(target.lastChild);
            }
        }
        function callSelf() {
            UI.PageManager.callPage(UI.idImages);
            var cbs = { handleEvent: function () {
                    UI.Images.printImages();
                } };
            var cbe = { handleEvent: function (data) {
                    UI.Images.printError(data, true);
                } };
            Server.Storage.requestImages(cbs, cbe);
        }
        Images.callSelf = callSelf;
        function printImages() {
            emptyTarget();
            var images = DB.ImageDB.getImagesByFolder();
            for (var i = 0; i < images.length; i++) {
                var folder = new ImagesFolder(images[i]);
                if (folder.getName() === autoFolder) {
                    folder.open();
                }
                target.appendChild(folder.getHTML());
            }
            autoFolder = null;
        }
        Images.printImages = printImages;
        function stayInFolder(name) {
            autoFolder = name;
        }
        Images.stayInFolder = stayInFolder;
        function printError(data, onLoad) {
            emptyTarget();
            if (onLoad) {
                target.appendChild(loadError);
            }
            else {
                target.appendChild(saveError);
            }
        }
        Images.printError = printError;
        function callDropbox() {
            var options = {
                success: function (files) {
                    UI.Images.addDropbox(files);
                },
                linkType: "preview",
                multiselect: true,
                extensions: ['images'],
            };
            Dropbox.choose(options);
        }
        Images.callDropbox = callDropbox;
        function addLink() {
            var folder = linkFolderInput.value.trim();
            var name = linkNameInput.value.trim();
            var url = linkURLInput.value.trim();
            linkFolderInput.value = "";
            linkNameInput.value = "";
            linkURLInput.value = "";
            var link = new ImageLink(name, url, folder);
            DB.ImageDB.addImage(link);
            printImages();
        }
        Images.addLink = addLink;
        function addDropbox(files) {
            var intendedFolder = folderInput.value.trim();
            folderInput.value = "";
            var folders = [];
            var links = [];
            for (var i = 0; i < files.length; i++) {
                var originalName = files[i]['name'].substring(0, files[i]['name'].lastIndexOf('.'));
                ;
                var originalUrl = Server.URL.fixURL(files[i]['link']);
                var name;
                var folderName;
                var hiphenPos = originalName.indexOf("-");
                if (intendedFolder !== "") {
                    folderName = intendedFolder;
                    name = originalName.trim();
                }
                else if (hiphenPos === -1) {
                    folderName = "";
                    name = originalName.trim();
                }
                else {
                    folderName = originalName.substr(0, hiphenPos).trim();
                    name = originalName.substr(hiphenPos + 1, originalName.length - (hiphenPos + 1)).trim();
                }
                var link = new ImageLink(name, originalUrl, folderName);
                links.push(link);
                if (folders.indexOf(folderName) === -1) {
                    folders.push(folderName);
                }
            }
            DB.ImageDB.addImages(links);
            if (folders.length === 1) {
                autoFolder = folders[0];
            }
            else {
                autoFolder = null;
            }
            printImages();
        }
        Images.addDropbox = addDropbox;
    })(Images = UI.Images || (UI.Images = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Loading;
    (function (Loading) {
        var $loadingWindow = $("#loadingWindow").fadeOut(250);
        var loadingCounter = 0;
        Loading.$leftLoader = $("#leftLoading").hide();
        var $rightLoader = $("#rightLoading").hide();
        var leftCounter = 0;
        var rightCounter = 0;
        function stopLoading() {
            if (--loadingCounter <= 0) {
                loadingCounter = 0;
                $loadingWindow.stop().fadeOut(Application.Config.getConfig("animTime").getValue());
            }
        }
        Loading.stopLoading = stopLoading;
        function startLoading() {
            if (++loadingCounter > 0) {
                $loadingWindow.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
            }
        }
        Loading.startLoading = startLoading;
        function blockLeft() {
            if (++leftCounter > 0) {
                Loading.$leftLoader.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
            }
        }
        Loading.blockLeft = blockLeft;
        function blockRight() {
            if (++rightCounter > 0) {
                $rightLoader.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
            }
        }
        Loading.blockRight = blockRight;
        function unblockLeft() {
            if (--leftCounter <= 0) {
                leftCounter = 0;
                Loading.$leftLoader.stop().fadeOut(Application.Config.getConfig("animTime").getValue());
            }
        }
        Loading.unblockLeft = unblockLeft;
        function unblockRight() {
            if (--rightCounter <= 0) {
                rightCounter = 0;
                $rightLoader.stop().fadeOut(Application.Config.getConfig("animTime").getValue());
            }
        }
        Loading.unblockRight = unblockRight;
    })(Loading = UI.Loading || (UI.Loading = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Login;
    (function (Login) {
        document.getElementById("loginForm").addEventListener("submit", function (e) { UI.Login.submitLogin(e); });
        var inputEmail = document.getElementById("loginEmailInput");
        var inputPassword = document.getElementById("loginPasswordInput");
        var $error404 = $("#loginError404").hide();
        var $error = $("#loginError").hide();
        var forgotPasswordButton = document.getElementById("loginForgotPassword");
        forgotPasswordButton.style.display = "none";
        function callSelf() {
            UI.WindowManager.callWindow(UI.idLoginWindow);
            hideErrors();
        }
        Login.callSelf = callSelf;
        function hideErrors() {
            $error404.stop(true, true).hide();
            $error.stop(true, true).hide();
        }
        Login.hideErrors = hideErrors;
        function showError(code) {
            hideErrors();
            if (code === 404) {
                $error404.fadeIn(Application.Config.getConfig("animTime").getValue() / 2);
            }
            else {
                $error.fadeIn(Application.Config.getConfig("animTime").getValue() / 2);
            }
        }
        Login.showError = showError;
        function resetState() {
            if (Application.Login.hasLastEmail()) {
                inputEmail.value = Application.Login.getLastEmail();
            }
            else {
                inputEmail.value = "";
            }
            inputPassword.value = "";
        }
        Login.resetState = resetState;
        function resetFocus() {
            if (inputEmail.value !== "") {
                inputPassword.focus();
            }
            else {
                inputEmail.focus();
            }
        }
        Login.resetFocus = resetFocus;
        function assumeEmail(email) {
            inputEmail.value = email;
        }
        Login.assumeEmail = assumeEmail;
        function submitLogin(e) {
            e.preventDefault();
            hideErrors();
            var cbs = {
                handleEvent: function () {
                    if (Application.Login.isLogged()) {
                        UI.WindowManager.callWindow("mainWindow");
                        UI.Login.resetState();
                    }
                    else {
                        alert("Failed login attempt");
                    }
                }
            };
            var cbe = {
                handleEvent: function (response, xhr) {
                    UI.Login.showError(xhr.status);
                }
            };
            Application.Login.attemptLogin(inputEmail.value, inputPassword.value, cbs, cbe);
        }
        Login.submitLogin = submitLogin;
    })(Login = UI.Login || (UI.Login = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Login;
    (function (Login) {
        var NewAccount;
        (function (NewAccount) {
            document.getElementById("loginNewAccount").addEventListener("click", function () {
                UI.Login.NewAccount.callSelf();
            });
            document.getElementById("accountCreationForm").addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Login.NewAccount.submit();
            });
            document.getElementById("accCreationReturnButton").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Login.callSelf();
            });
            var $error401 = $("#accCreationError401").hide();
            var $error409 = $("#accCreationError409").hide();
            var $error = $("#accCreationError").hide();
            var nameInput = document.getElementById("accName");
            var nickInput = document.getElementById("accNickname");
            var emailInput = document.getElementById("accEmail");
            var passInput = document.getElementById("accPassword");
            var pass2Input = document.getElementById("accPassword2");
            function callSelf() {
                UI.WindowManager.callWindow(UI.idAccountCreationWindow);
                hideErrors();
            }
            NewAccount.callSelf = callSelf;
            function getAnimTime() {
                return (Application.Config.getConfig("animTime").getValue() / 2);
            }
            function hideErrors() {
                $error401.stop(true, true).fadeOut(getAnimTime());
                $error409.stop(true, true).fadeOut(getAnimTime());
                $error.stop(true, true).fadeOut(getAnimTime());
            }
            NewAccount.hideErrors = hideErrors;
            function showError(code) {
                hideErrors();
                if (code === 401) {
                    $error401.fadeIn(getAnimTime());
                }
                else if (code === 409) {
                    $error409.fadeIn(getAnimTime());
                }
                else {
                    $error.fadeIn(getAnimTime());
                }
            }
            NewAccount.showError = showError;
            function submit() {
                nameInput.classList.remove("error");
                nickInput.classList.remove("error");
                emailInput.classList.remove("error");
                passInput.classList.remove("error");
                pass2Input.classList.remove("error");
                var name = nameInput.value.trim();
                var nick = nickInput.value.trim();
                var email = emailInput.value.trim();
                var pass = passInput.value.trim();
                var pass2 = pass2Input.value.trim();
                var fail = false;
                if (!name.match('^[a-zA-Z0-9 çÇéÉíÍóÓáÁàÀâÂÊêãÃõÕôÔ]{3,200}$')) {
                    nameInput.classList.add("error");
                    fail = true;
                }
                if (!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
                    emailInput.classList.add("error");
                    fail = true;
                }
                if (!nick.match('^[a-zA-Z0-9çÇéÉíÍóÓáÁàÀâÂÊêãÃõÕôÔ]{3,12}$')) {
                    nickInput.classList.add("error");
                    fail = true;
                }
                if (!pass.match('^[a-zA-Z0-9]{3,12}$')) {
                    passInput.classList.add("error");
                    fail = true;
                }
                else if (pass2 !== pass) {
                    pass2Input.classList.add("error");
                    fail = true;
                }
                if (!fail) {
                    var cbs = function () {
                        UI.Login.callSelf();
                    };
                    var cbe = function (response, xhr) {
                        console.log(xhr);
                        UI.Login.NewAccount.showError(xhr.status);
                    };
                    Server.Login.createAccount(name, pass, email, nick, cbs, cbe);
                }
            }
            NewAccount.submit = submit;
        })(NewAccount = Login.NewAccount || (Login.NewAccount = {}));
    })(Login = UI.Login || (UI.Login = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Handles;
    (function (Handles) {
        var $leftHandle = $("#leftHandleBar");
        var $leftHandleIcon = $("#leftHandleIcon");
        var $rightHandle = $("#rightHandleBar");
        var $rightHandleIcon = $("#rightHandleIcon");
        var alwaysUp = false;
        $leftHandle[0].addEventListener("mouseenter", function (e) { UI.Handles.mouseIn(this); });
        $rightHandle[0].addEventListener("mouseenter", function (e) { UI.Handles.mouseIn(this); });
        $leftHandle[0].addEventListener("mouseleave", function (e) { UI.Handles.mouseOut(this); });
        $rightHandle[0].addEventListener("mouseleave", function (e) { UI.Handles.mouseOut(this); });
        $leftHandle[0].style.left = "-60px";
        $rightHandle[0].style.right = "-60px";
        function isAlwaysUp() {
            return alwaysUp;
        }
        Handles.isAlwaysUp = isAlwaysUp;
        function mouseIn(handle) {
            if (alwaysUp)
                return;
            var left = $leftHandle[0] === handle;
            var css = {};
            css[left ? "left" : "right"] = "0px";
            if (left) {
                $leftHandle.stop().animate(css, Application.Config.getConfig("animTime").getValue() / 2);
            }
            else {
                $rightHandle.stop().animate(css, Application.Config.getConfig("animTime").getValue() / 2);
            }
        }
        Handles.mouseIn = mouseIn;
        function mouseOut(handle) {
            if (alwaysUp)
                return;
            var left = $leftHandle[0] === handle;
            var css = {};
            css[left ? "left" : "right"] = "-60px";
            if (left) {
                $leftHandle.stop().animate(css, Application.Config.getConfig("animTime").getValue() / 2);
            }
            else {
                $rightHandle.stop().animate(css, Application.Config.getConfig("animTime").getValue() / 2);
            }
        }
        Handles.mouseOut = mouseOut;
        function prepareAlwaysUp() {
            $leftHandleIcon[0].style.display = "none";
            $rightHandleIcon[0].style.display = "none";
            $leftHandle[0].style.left = "0px";
            $rightHandle[0].style.right = "0px";
            $leftHandle[0].style.width = "60px";
            $rightHandle[0].style.width = "60px";
        }
        function prepareNotAlwaysUp() {
            $leftHandleIcon[0].style.display = "";
            $rightHandleIcon[0].style.display = "";
            $leftHandle[0].style.left = "-60px";
            $rightHandle[0].style.right = "-60px";
            $leftHandle[0].style.width = "";
            $rightHandle[0].style.width = "";
        }
        function setAlwaysUp(keepUp) {
            if (keepUp === alwaysUp)
                return;
            if (keepUp) {
                alwaysUp = true;
                prepareAlwaysUp();
            }
            else {
                alwaysUp = false;
                prepareNotAlwaysUp();
            }
        }
        Handles.setAlwaysUp = setAlwaysUp;
        // Setting up button functions
        $("#logoutButton").on("click", function () {
            if (confirm(UI.Language.getLanguage().getLingo("_LOGOUTCONSENT_"))) {
                Server.Login.doLogout();
            }
        });
    })(Handles = UI.Handles || (UI.Handles = {}));
})(UI || (UI = {}));
/**
 * Created by Reddo on 24/09/2015.
 */
var UI;
/**
 * Created by Reddo on 24/09/2015.
 */
(function (UI) {
    var Language;
    (function (Language) {
        var currentLanguage = null;
        var flagContainer = document.getElementById("loginFlagContainer");
        var list = LingoList.getLingos();
        var a;
        var clickF = function () {
            localStorage.setItem("lastLanguage", this.ids[0]);
            Application.Config.getConfig("language").storeValue(this.ids[0]);
        };
        for (var i = 0; i < list.length; i++) {
            a = document.createElement("a");
            a.classList.add("flagIcon");
            a.classList.add("icons-flag" + list[i].flagIcon);
            a.classList.add("buttonBehavior");
            a.addEventListener("click", clickF.bind(list[i]));
            a.setAttribute("title", list[i].name);
            flagContainer.appendChild(a);
        }
        Application.Config.registerChangeListener("language", {
            handleEvent: function () {
                var oldLanguage = UI.Language.getLanguage();
                UI.Language.searchLanguage();
                var newLanguage = UI.Language.getLanguage();
                if (oldLanguage !== newLanguage) {
                    UI.Language.updateScreen();
                }
            }
        });
        function getLanguage() {
            return currentLanguage;
        }
        Language.getLanguage = getLanguage;
        function searchLanguage() {
            if (Application.Login.isLogged()) {
                var lingid = Application.Config.getConfig("language").getValue();
                currentLanguage = LingoList.getLingo(lingid);
            }
            else {
                if (localStorage.getItem("lastLanguage") !== null) {
                    currentLanguage = LingoList.getLingo(localStorage.getItem("lastLanguage"));
                }
                else {
                    currentLanguage = LingoList.getLingo(navigator.language);
                }
            }
            localStorage.setItem("lastLanguage", currentLanguage.ids[0]);
        }
        Language.searchLanguage = searchLanguage;
        function updateScreen(target) {
            target = target === undefined ? document : target;
            var elements = target.getElementsByClassName("language");
            for (var i = 0; i < elements.length; i++) {
                updateElement(elements[i]);
            }
        }
        Language.updateScreen = updateScreen;
        function updateElement(element) {
            if (element.dataset['languagenodes'] === undefined) {
                processElement(element);
            }
            if (currentLanguage === null)
                return;
            updateText(element);
        }
        Language.updateElement = updateElement;
        function updateText(element) {
            if (currentLanguage === null)
                return;
            if (element.dataset['languagenodes'] !== "" && element.dataset['languagenodes'] !== undefined) {
                var nodes = element.dataset['languagenodes'].split(";");
                var ids = element.dataset['languagevalues'].split(";");
                for (var i = 0; i < nodes.length; i++) {
                    element.childNodes[parseInt(nodes[i])].nodeValue = currentLanguage.getLingo(ids[i], element.dataset);
                }
            }
            if (element.dataset['valuelingo'] !== undefined) {
                updateInput(element);
            }
            if (element.dataset['placeholderlingo'] !== undefined) {
                updatePlaceholder(element);
            }
            if (element.dataset['titlelingo'] !== undefined) {
                updateTitle(element);
            }
        }
        Language.updateText = updateText;
        function updatePlaceholder(element) {
            element.placeholder = currentLanguage.getLingo(element.dataset['placeholderlingo'], element.dataset);
        }
        function updateInput(element) {
            element.value = currentLanguage.getLingo(element.dataset['valuelingo'], element.dataset);
        }
        function updateTitle(element) {
            element.setAttribute("title", currentLanguage.getLingo(element.dataset['titlelingo'], element.dataset));
        }
        function processElement(element) {
            var ele;
            var languageNodes = [];
            var languageValues = [];
            for (var i = 0; i < element.childNodes.length; i++) {
                ele = element.childNodes[i];
                if (ele.nodeType === Node.TEXT_NODE) {
                    var text = ele.nodeValue.trim();
                    if (text.charAt(0) === "_") {
                        languageNodes.push(i.toString());
                        languageValues.push(text);
                    }
                }
            }
            element.dataset['languagenodes'] = languageNodes.join(";");
            element.dataset['languagevalues'] = languageValues.join(";");
            //updateText(element);
        }
        function addLanguageVariable(element, id, value) {
            element.dataset['language' + id] = value;
        }
        Language.addLanguageVariable = addLanguageVariable;
        function addLanguageValue(element, value) {
            element.dataset['valuelingo'] = value;
        }
        Language.addLanguageValue = addLanguageValue;
        function addLanguagePlaceholder(element, value) {
            element.dataset['placeholderlingo'] = value;
        }
        Language.addLanguagePlaceholder = addLanguagePlaceholder;
        function addLanguageTitle(element, value) {
            element.dataset['titlelingo'] = value;
        }
        Language.addLanguageTitle = addLanguageTitle;
        function markLanguage() {
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i] = arguments[_i];
            }
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                element.classList.add("language");
                processElement(element);
                updateText(element);
            }
        }
        Language.markLanguage = markLanguage;
    })(Language = UI.Language || (UI.Language = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var IFrame;
    (function (IFrame) {
        var leftIFrame = document.getElementById("leftIFrameElement");
        var rightIFrame = document.getElementById("rightIFrameElement");
        var leftVideo = document.getElementById("leftVideoElement");
        var rightVideo = document.getElementById("rightVideoElement");
        function openLeftIFrame(url) {
            UI.PageManager.callPage(UI.idLeftIFrame);
            leftIFrame.src = url;
        }
        IFrame.openLeftIFrame = openLeftIFrame;
        function openRightFrame(url) {
            UI.PageManager.callPage(UI.idRightIFrame);
            rightIFrame.src = url;
        }
        IFrame.openRightFrame = openRightFrame;
        function openLeftVideo(url) {
            UI.PageManager.callPage(UI.idLeftVideo);
            leftVideo.src = url;
        }
        IFrame.openLeftVideo = openLeftVideo;
        function openRightVideo(url) {
            UI.PageManager.callPage(UI.idRightVideo);
            rightVideo.src = url;
        }
        IFrame.openRightVideo = openRightVideo;
    })(IFrame = UI.IFrame || (UI.IFrame = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Sheets;
    (function (Sheets) {
        document.getElementById("sheetsButton").addEventListener("click", function () { UI.Sheets.callSelf(); });
        var sheetList = document.getElementById("sheetWindowSheetList");
        var lastFolder = null;
        var lastGame = null;
        function keepOpen(folder, gameid) {
            lastFolder = folder;
            lastGame = gameid;
        }
        Sheets.keepOpen = keepOpen;
        function keepClosed() {
            lastFolder = null;
            lastGame = null;
        }
        Sheets.keepClosed = keepClosed;
        function callSelf() {
            UI.PageManager.callPage(UI.idSheets);
            Server.Sheets.updateLists({
                handleEvent: function () {
                    UI.Sheets.printSheets();
                }
            });
        }
        Sheets.callSelf = callSelf;
        function empty() {
            while (sheetList.firstChild)
                sheetList.removeChild(sheetList.firstChild);
        }
        function printSheets() {
            empty();
            // .sheetListGameContainer.lightHoverable.openSheetGame
            //     %p.sheetListGameName{:onclick=>"this.parentNode.classList.toggle('openSheetGame');"}="Nome da Mesa"
            var games = DB.GameDB.getOrderedGameList();
            for (var k = 0; k < games.length; k++) {
                var game = games[k];
                var wanted = DB.SheetDB.getSheetsByGame(game);
                var sheets = DB.SheetDB.getSheetsByFolder(wanted);
                var gameFolder = document.createElement("div");
                gameFolder.classList.add("sheetListGameContainer");
                gameFolder.classList.add("lightHoverable");
                gameFolder.classList.add("openSheetGame");
                var gameName = document.createElement("p");
                gameName.classList.add("sheetListGameName");
                gameFolder.appendChild(gameName);
                gameName.addEventListener("click", function (e) {
                    e.preventDefault();
                    this.parentElement.classList.toggle("openSheetGame");
                });
                gameName.appendChild(document.createTextNode(game.getName()));
                if (sheets.length > 0) {
                    for (var i = 0; i < sheets.length; i++) {
                        var open = game.getId() === lastGame && sheets[i][0].getFolder() === lastFolder;
                        var sheetFolder = new SheetsFolder(sheets[i], open);
                        gameFolder.appendChild(sheetFolder.getHTML());
                    }
                }
                else {
                    var p = document.createElement("p");
                    p.classList.add("sheetListNoSheet");
                    p.appendChild(document.createTextNode("_SHEETSNOSHEETS_"));
                    UI.Language.markLanguage(p);
                    gameFolder.appendChild(p);
                }
                if (game.getMe().isCreateSheet()) {
                    var p = document.createElement("p");
                    p.classList.add("sheetListNewSheetButton");
                    p.classList.add("textLink");
                    p.classList.add("lightHoverable");
                    p.appendChild(document.createTextNode("> "));
                    p.appendChild(document.createTextNode("_SHEETSNEWSHEET_"));
                    UI.Language.markLanguage(p);
                    gameFolder.appendChild(p);
                    p.addEventListener("click", {
                        game: game,
                        handleEvent: function (e) {
                            e.preventDefault();
                            UI.Sheets.SheetDesigner.callSelf(this.game);
                        }
                    });
                }
                sheetList.appendChild(gameFolder);
            }
        }
        Sheets.printSheets = printSheets;
    })(Sheets = UI.Sheets || (UI.Sheets = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Sheets;
    (function (Sheets) {
        var SheetPermissionDesigner;
        (function (SheetPermissionDesigner) {
            var nameTarget = document.getElementById("sheetPermNameTarget");
            var list = document.getElementById("sheetPermList");
            var currentSheet = null;
            var playerRows = null;
            document.getElementById("sheetPermForm").addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Sheets.SheetPermissionDesigner.submit();
            });
            function callSelf(sheet) {
                currentSheet = sheet;
                UI.PageManager.callPage(UI.idSheetPerm);
                var cbs = function (arr) {
                    UI.Sheets.SheetPermissionDesigner.printPlayers(arr);
                };
                var cbe = function () {
                    UI.Sheets.SheetPermissionDesigner.empty();
                };
                Server.Sheets.getSheetPermissions(sheet, cbs, cbe);
                UI.Language.addLanguageVariable(nameTarget, "a", sheet.getName());
                UI.Language.updateElement(nameTarget);
            }
            SheetPermissionDesigner.callSelf = callSelf;
            function empty() {
                while (list.firstChild !== null)
                    list.removeChild(list.firstChild);
            }
            SheetPermissionDesigner.empty = empty;
            function printPlayers(players) {
                empty();
                players.sort(function (a, b) {
                    var na = a['nickname'].toLowerCase();
                    var nb = b['nickname'].toLowerCase();
                    if (na < nb)
                        return -1;
                    if (na > nb)
                        return 1;
                    var na = b['nicknamesufix'].toLowerCase();
                    var nb = b['nicknamesufix'].toLowerCase();
                    if (na < nb)
                        return -1;
                    if (na > nb)
                        return 1;
                    return 0;
                });
                playerRows = [];
                for (var i = 0; i < players.length; i++) {
                    var row = new SheetPermRow(players[i]);
                    playerRows.push(row);
                    list.appendChild(row.getHTML());
                }
            }
            SheetPermissionDesigner.printPlayers = printPlayers;
            function submit() {
                var cbs = function () {
                    UI.Sheets.SheetPermissionDesigner.success();
                };
                var cbe = function () { };
                Server.Sheets.sendSheetPermissions(currentSheet, playerRows, cbs, cbe);
            }
            SheetPermissionDesigner.submit = submit;
            function success() {
                UI.Sheets.keepOpen(currentSheet.getFolder(), currentSheet.getGameid());
                UI.Sheets.callSelf();
            }
            SheetPermissionDesigner.success = success;
        })(SheetPermissionDesigner = Sheets.SheetPermissionDesigner || (Sheets.SheetPermissionDesigner = {}));
    })(Sheets = UI.Sheets || (UI.Sheets = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Sheets;
    (function (Sheets) {
        var SheetManager;
        (function (SheetManager) {
            var myButton = document.getElementById("sheetOpenButton");
            myButton.style.display = "none";
            myButton.addEventListener("click", function () {
                UI.PageManager.callPage(UI.idSheetViewer);
            });
            var viewport = document.getElementById("sheetViewport");
            while (viewport.firstChild)
                viewport.removeChild(viewport.firstChild);
            var buttons = [];
            var buttonHolder = document.getElementById("sheetViewerSheetsTab");
            while (buttonHolder.firstChild)
                buttonHolder.removeChild(buttonHolder.firstChild);
            SheetManager.currentSheet = null;
            SheetManager.currentStyle = null;
            function hasSheet() {
                return SheetManager.currentSheet != null && SheetManager.currentSheet != undefined;
            }
            SheetManager.hasSheet = hasSheet;
            function editAllowed() {
                return sheetEditable.classList.contains("icons-sheetEditOn");
            }
            SheetManager.editAllowed = editAllowed;
            var sheetChangeListener = function () {
                UI.Sheets.SheetManager.updateButtons();
            };
            function addButton(sheet) {
                var idx = buttons.indexOf(sheet);
                if (idx !== -1) {
                    buttons.splice(idx, 1);
                }
                buttons.push(sheet);
                // Changing positions is weird, stop that
                if (idx === -1) {
                    buttonHolder.appendChild(sheet.getTab().getHTML());
                }
                sheet.getTab().toggleOn();
                // Overflowing? Remove oldest sheet
                while (buttonHolder.clientHeight > sheet.getTab().getHTML().scrollHeight) {
                    var oldTab = buttons.splice(0, 1)[0];
                    buttonHolder.removeChild(oldTab.getTab().getHTML());
                }
                // Toggle off last sheet's tab, unless we're going for the same one, then it's all fine
                if (SheetManager.currentSheet !== null && SheetManager.currentSheet !== sheet) {
                    SheetManager.currentSheet.getTab().toggleOff();
                }
                myButton.style.display = "";
            }
            function close() {
                if (SheetManager.currentStyle !== null && SheetManager.currentSheet !== null) {
                    buttons.splice(buttons.indexOf(SheetManager.currentSheet), 1);
                    buttonHolder.removeChild(SheetManager.currentSheet.getTab().getHTML());
                    detachStyle();
                    SheetManager.currentSheet = null;
                    SheetManager.currentStyle = null;
                    if (buttons.length === 0) {
                        myButton.style.display = "none";
                    }
                }
            }
            SheetManager.close = close;
            function detachStyle() {
                if (SheetManager.currentStyle !== null) {
                    document.head.removeChild(SheetManager.currentStyle.getCSS());
                    viewport.removeChild(SheetManager.currentStyle.getHTML());
                }
            }
            SheetManager.detachStyle = detachStyle;
            function attachStyle() {
                if (SheetManager.currentStyle !== null) {
                    document.head.appendChild(SheetManager.currentStyle.getCSS());
                    viewport.appendChild(SheetManager.currentStyle.getHTML());
                }
            }
            SheetManager.attachStyle = attachStyle;
            function switchToSheet(sheet, reloadStyle, callPage) {
                if (callPage) {
                    UI.PageManager.callPage(UI.idSheetViewer);
                }
                addButton(sheet);
                if (SheetManager.currentSheet !== sheet && SheetManager.currentSheet !== null) {
                    SheetManager.currentSheet.removeChangeListener(sheetChangeListener);
                }
                SheetManager.currentSheet = sheet;
                var newStyle = StyleFactory.getSheetStyle(SheetManager.currentSheet.getStyle(), reloadStyle === true);
                if (SheetManager.currentStyle !== newStyle) {
                    detachStyle();
                }
                if (SheetManager.currentStyle !== newStyle) {
                    SheetManager.currentStyle = newStyle;
                    attachStyle();
                }
                SheetManager.currentSheet.addChangeListener(sheetChangeListener);
                SheetManager.currentStyle.addSheetInstance(SheetManager.currentSheet);
                updateButtons();
            }
            SheetManager.switchToSheet = switchToSheet;
            function openSheetId(sheetid) {
                var sheet = DB.SheetDB.getSheet(sheetid);
                if (sheet !== null) {
                    openSheet(sheet);
                }
                else {
                    var cbs = {
                        sheetid: sheetid,
                        handleEvent: function () {
                            UI.Sheets.SheetManager.openSheet(DB.SheetDB.getSheet(this.sheetid));
                        }
                    };
                    var cbe = {
                        handleEvent: function () {
                            alert("Unable to open sheet. Sorri");
                        }
                    };
                    Server.Sheets.loadSheet(sheetid, cbs, cbe);
                }
            }
            SheetManager.openSheetId = openSheetId;
            function openSheet(sheet, reloadSheet, reloadStyle, callPage) {
                var loadSheet = !sheet.loaded || reloadSheet === true;
                var loadStyle = reloadStyle === true || !DB.StyleDB.hasStyle(sheet.getStyleId()) || !DB.StyleDB.getStyle(sheet.getStyleId()).isLoaded();
                callPage = callPage === undefined ? true : callPage;
                if (reloadStyle === true && SheetManager.currentStyle !== null && SheetManager.currentStyle.getStyleInstance() === sheet.getStyle()) {
                    detachStyle();
                    SheetManager.currentStyle = null;
                }
                var cbs = {
                    sheet: sheet,
                    reloadStyle: reloadStyle === true,
                    callPage: callPage,
                    handleEvent: function () {
                        UI.Sheets.SheetManager.switchToSheet(this.sheet, this.reloadStyle, this.callPage);
                    }
                };
                var cbe = {
                    handleEvent: function () {
                        UI.Sheets.callSelf();
                    }
                };
                if (loadSheet && loadStyle) {
                    Server.Sheets.loadSheetAndStyle(sheet.getId(), sheet.getStyleId(), cbs, cbe);
                }
                else if (loadSheet) {
                    Server.Sheets.loadSheet(sheet.getId(), cbs, cbe);
                }
                else if (loadStyle) {
                    Server.Sheets.loadStyle(sheet.getStyleId(), cbs, cbe);
                }
                else {
                    switchToSheet(sheet, false, callPage);
                }
            }
            SheetManager.openSheet = openSheet;
            var sheetSave = document.getElementById("sheetSave");
            var importInput = document.getElementById("sheetViewerJSONImporter");
            var sheetAutomatic = document.getElementById("sheetAutomatic");
            var sheetEditable = document.getElementById("sheetEditable");
            sheetSave.addEventListener("click", function (e) {
                e.preventDefault();
                UI.Sheets.SheetManager.saveSheet();
            });
            function saveSheet() {
                DB.SheetDB.saveSheet(SheetManager.currentSheet);
            }
            SheetManager.saveSheet = saveSheet;
            sheetAutomatic.addEventListener("click", function (e) {
                e.preventDefault();
                this.classList.toggle("icons-sheetAutomaticOn");
                this.classList.toggle("icons-sheetAutomatic");
            });
            sheetEditable.addEventListener("click", function (e) {
                e.preventDefault();
                this.classList.toggle("icons-sheetEditOn");
                this.classList.toggle("icons-sheetEdit");
                recycleSheet();
            });
            document.getElementById("sheetClose").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Sheets.SheetManager.close();
            });
            var sheetImport = document.getElementById("sheetImport");
            sheetImport.addEventListener("click", function (e) {
                e.preventDefault();
                UI.Sheets.SheetManager.importFromJSON();
            });
            document.getElementById("sheetExport").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Sheets.SheetManager.exportAsJSON();
            });
            document.getElementById("sheetFullReload").addEventListener("click", function (e) {
                UI.Sheets.SheetManager.reload(e.shiftKey);
            });
            // Hiding reload to reduce button bloat
            // document.getElementById("sheetReload").addEventListener("click", function () {
            //     UI.Sheets.SheetManager.reload();
            // });
            function reload(reloadStyle) {
                openSheet(SheetManager.currentSheet, true, reloadStyle === true);
            }
            SheetManager.reload = reload;
            function recycleSheet() {
                openSheet(SheetManager.currentSheet, false, false, false);
            }
            SheetManager.recycleSheet = recycleSheet;
            function isAutoUpdate() {
                return sheetAutomatic.classList.contains("icons-sheetAutomaticOn");
            }
            SheetManager.isAutoUpdate = isAutoUpdate;
            function updateButtons() {
                if (SheetManager.currentSheet.isEditableForRealsies()) {
                    sheetSave.style.display = "";
                    sheetImport.style.display = "";
                    sheetEditable.style.display = "";
                }
                else {
                    sheetSave.style.display = "none";
                    sheetImport.style.display = "none";
                    sheetEditable.style.display = "none";
                }
                if (SheetManager.currentSheet.changed) {
                    sheetSave.classList.remove("icons-sheetSave");
                    sheetSave.classList.add("icons-sheetSaveChanged");
                }
                else {
                    sheetSave.classList.add("icons-sheetSave");
                    sheetSave.classList.remove("icons-sheetSaveChanged");
                }
            }
            SheetManager.updateButtons = updateButtons;
            importInput.addEventListener("change", function () {
                UI.Sheets.SheetManager.importFromJSON(true);
            });
            function importFromJSON(ready, json) {
                if (ready !== true) {
                    importInput.value = "";
                    importInput.click();
                    return;
                }
                if (json !== undefined) {
                    try {
                        json = JSON.parse(json);
                        SheetManager.currentSheet.setValues(json, true);
                    }
                    catch (e) {
                        alert(UI.Language.getLanguage().getLingo("_SHEETIMPORTFAILED_"));
                    }
                    return;
                }
                if (importInput.files.length === 1) {
                    var file = importInput.files[0];
                    var reader = new FileReader();
                    reader.addEventListener("load", function (e) {
                        UI.Sheets.SheetManager.importFromJSON(true, e.target['result']);
                    });
                    reader.readAsText(file);
                }
            }
            SheetManager.importFromJSON = importFromJSON;
            function exportAsJSON() {
                var blob = new Blob([JSON.stringify(SheetManager.currentStyle.getSheet().exportAsObject(), null, 4)], { type: "text/plain;charset=utf-8;" });
                var d = new Date();
                var curr_date = d.getDate() < 10 ? "0" + d.getDate().toString() : d.getDate().toString();
                var curr_month = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1).toString() : (d.getMonth() + 1).toString();
                var curr_year = d.getFullYear();
                saveAs(blob, SheetManager.currentSheet.getGame().getName() + " - " + SheetManager.currentSheet.getName() + " (" + curr_year + curr_month + curr_date + ").json");
            }
            SheetManager.exportAsJSON = exportAsJSON;
        })(SheetManager = Sheets.SheetManager || (Sheets.SheetManager = {}));
    })(Sheets = UI.Sheets || (UI.Sheets = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Sheets;
    (function (Sheets) {
        var SheetDesigner;
        (function (SheetDesigner) {
            var currentGame;
            var inputName = document.getElementById("sheetDesignerName");
            var selectStyle = document.getElementById("sheetDesignerStyleSelect");
            var checkboxRemain = document.getElementById("sheetDesignerRemain");
            var checkboxPublic = document.getElementById("sheetDesignerPublicSheet");
            var $error = $(document.getElementById("sheetDesignerError")).css("opacity", "0");
            document.getElementById("sheetDesignerForm").addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Sheets.SheetDesigner.submit();
            });
            function callSelf(game) {
                $error.stop().css("opacity", 0);
                currentGame = game;
                UI.PageManager.callPage(UI.idSheetDesigner);
                inputName.value = "";
                checkboxRemain.checked = false;
                checkboxPublic.checked = false;
                var cbs = function (data) {
                    UI.Sheets.SheetDesigner.fillStyles(data);
                };
                var cbe = function () {
                    UI.Sheets.callSelf();
                };
                Server.Sheets.getStyleOptions(currentGame, cbs, cbe);
            }
            SheetDesigner.callSelf = callSelf;
            function success() {
                $error.stop().css("opacity", 0);
                if (!checkboxRemain.checked) {
                    UI.Sheets.callSelf();
                }
                else {
                    inputName.value = "";
                    checkboxPublic.checked = false;
                    inputName.focus();
                }
            }
            SheetDesigner.success = success;
            function fillStyles(data) {
                while (selectStyle.firstChild !== null)
                    selectStyle.removeChild(selectStyle.firstChild);
                for (var i_2 = 0; i_2 < data.length; i_2++) {
                    var name_2 = data[i_2]['name'];
                    if (name_2.charAt(0) == "_" && name_2.charAt(name_2.length - 1) == "_") {
                        data[i_2]['name'] = UI.Language.getLanguage().getLingo(name_2);
                    }
                }
                data.sort(function (a, b) {
                    var na = a['name'].toLowerCase();
                    var nb = b['name'].toLowerCase();
                    if (na < nb)
                        return -1;
                    if (na > nb)
                        return 1;
                    return 0;
                });
                for (var i = 0; i < data.length; i++) {
                    if (data[i]['name'].indexOf("RedPG1") !== -1) {
                        continue;
                    }
                    var option = document.createElement("option");
                    option.value = data[i]['id'];
                    option.appendChild(document.createTextNode(data[i]['name']));
                    selectStyle.appendChild(option);
                }
                selectStyle.value = "49";
            }
            SheetDesigner.fillStyles = fillStyles;
            function submit() {
                $error.stop().css("opacity", 0);
                var cbe = {
                    $error: $error,
                    handleEvent: function () {
                        this.$error.stop().animate({ "opacity": 1 }, Application.Config.getConfig("animTime").getValue());
                    }
                };
                var cbs = function () {
                    UI.Sheets.SheetDesigner.success();
                };
                var sheetName = inputName.value.trim();
                var styleId = parseInt(selectStyle.value);
                Server.Sheets.createSheet(currentGame, sheetName, styleId, checkboxPublic.checked, cbs, cbe);
            }
            SheetDesigner.submit = submit;
        })(SheetDesigner = Sheets.SheetDesigner || (Sheets.SheetDesigner = {}));
    })(Sheets = UI.Sheets || (UI.Sheets = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Rooms;
    (function (Rooms) {
        function deleteRoom(room) {
            var cbs = {
                handleEvent: function () {
                    UI.Games.callSelf(false);
                }
            };
            Server.Games.deleteRoom(room.id, cbs, cbs);
        }
        Rooms.deleteRoom = deleteRoom;
    })(Rooms = UI.Rooms || (UI.Rooms = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Rooms;
    (function (Rooms) {
        var Designer;
        (function (Designer) {
            function clear() {
            }
            function fromRoom(room) {
                clear();
                room = room === undefined ? null : room;
                if (room !== null) {
                }
            }
            Designer.fromRoom = fromRoom;
            function toRoom() {
                var room = new Room();
                return room;
            }
            Designer.toRoom = toRoom;
        })(Designer = Rooms.Designer || (Rooms.Designer = {}));
    })(Rooms = UI.Rooms || (UI.Rooms = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Games;
    (function (Games) {
        var gameListTarget = document.getElementById("gameListTarget");
        var nickTarget = document.getElementById("gamesNickTarget");
        Application.Login.addListener({
            handleEvent: function (isLogged) {
                UI.Games.updateNick(isLogged);
            }
        });
        document.getElementById("gamesButton").addEventListener("click", function () {
            UI.Games.callSelf();
        });
        function callSelf(ready) {
            UI.PageManager.callPage(UI.idGames);
            if (ready !== true) {
                Server.Games.updateLists({
                    handleEvent: function () {
                        UI.Games.callSelf(true);
                    }
                });
                return;
            }
            var games = DB.GameDB.getOrderedGameList();
            while (gameListTarget.lastChild !== null)
                gameListTarget.removeChild(gameListTarget.lastChild);
            if (games.length === 0) {
                var p = document.createElement("p");
                p.classList.add("mainWindowParagraph");
                p.appendChild(document.createTextNode("_GAMESNOGAMES_"));
                gameListTarget.appendChild(p);
                UI.Language.markLanguage(p);
                return;
            }
            for (var i = 0; i < games.length; i++) {
                var game = games[i];
                var div = document.createElement("div");
                div.classList.add("mainWindowParagraph");
                div.classList.add("gamesMainDiv");
                if (Application.Config.getConfig("hideGames").getValue()) {
                    div.classList.add("off");
                }
                var b = document.createElement("b");
                b.appendChild(document.createTextNode(games[i].name));
                b.classList.add("gamesName");
                b.addEventListener("click", (function (div) {
                    return function () {
                        div.classList.toggle("off");
                    };
                })(div));
                div.appendChild(b);
                if (games[i].isMyCreation()) {
                    var perm = document.createElement("a");
                    perm.classList.add("gamesOwnerButton");
                    perm.classList.add("textLink");
                    perm.appendChild(document.createTextNode("_GAMESPERMISSIONS_"));
                    perm.style.display = "none"; // TODO: Display once implemented
                    perm.addEventListener("click", {
                        game: games[i],
                        handleEvent: function () {
                            // TODO: UI.Games.editGamePermissions(this.game);
                        }
                    });
                    var edit = document.createElement("a");
                    edit.classList.add("gamesOwnerButton");
                    edit.classList.add("textLink");
                    edit.appendChild(document.createTextNode("_GAMESEDIT_"));
                    edit.addEventListener("click", {
                        game: games[i],
                        handleEvent: function () {
                            // TODO: UI.Games.editGame(this.game);
                        }
                    });
                    edit.style.display = "none"; // TODO: Display once server-side issue resolved
                    var deleteGame = document.createElement("a");
                    deleteGame.classList.add("gamesOwnerButton");
                    deleteGame.classList.add("textLink");
                    deleteGame.appendChild(document.createTextNode("_GAMESDELETE_"));
                    deleteGame.addEventListener("click", {
                        game: games[i],
                        handleEvent: function () {
                            if (confirm(UI.Language.getLanguage().getLingo("_RAPSDELETE_", { languagea: this.game.name }))) {
                                UI.Games.deleteGame(this.game);
                            }
                        }
                    });
                    UI.Language.markLanguage(edit, deleteGame, perm);
                    div.appendChild(deleteGame);
                    div.appendChild(edit);
                    div.appendChild(perm);
                }
                else {
                    var leave = document.createElement("a");
                    leave.classList.add("gamesOwnerButton");
                    leave.classList.add("textLink");
                    leave.appendChild(document.createTextNode("_GAMESLEAVE_"));
                    leave.addEventListener("click", {
                        game: games[i],
                        handleEvent: function () {
                            UI.Games.leaveGame(this.game);
                        }
                    });
                    UI.Language.markLanguage(leave);
                    div.appendChild(leave);
                }
                var creatorDiv = document.createElement("div");
                creatorDiv.classList.add("gameCreatorDiv");
                creatorDiv.addEventListener("click", (function (div) {
                    return function () {
                        div.classList.toggle("off");
                    };
                })(div));
                var creatorTitle = document.createElement("b");
                creatorTitle.appendChild(document.createTextNode("_GAMECREATORTITLE_"));
                creatorTitle.appendChild(document.createTextNode(": "));
                UI.Language.markLanguage(creatorTitle);
                creatorDiv.appendChild(creatorTitle);
                creatorDiv.appendChild(document.createTextNode(games[i].getCreatorFullNickname()));
                div.appendChild(creatorDiv);
                var roomList = games[i].getOrderedRoomList();
                if (roomList.length === 0) {
                    var p = document.createElement("p");
                    p.classList.add("gamesNoRooms");
                    p.appendChild(document.createTextNode("_GAMESNOROOMS_"));
                    UI.Language.markLanguage(p);
                    div.appendChild(p);
                }
                else {
                    for (var k = 0; k < roomList.length; k++) {
                        var user = roomList[k].getMe();
                        var room = roomList[k];
                        var p = document.createElement("p");
                        p.classList.add("gamesRoomP");
                        var a = document.createElement("a");
                        a.classList.add("textLink");
                        a.classList.add("gameRoomLink");
                        a.addEventListener('click', {
                            roomid: roomList[k].id,
                            handleEvent: function () {
                                UI.Chat.callSelf(this.roomid);
                            }
                        });
                        a.appendChild(document.createTextNode(roomList[k].name));
                        p.appendChild(a);
                        if (game.isMyCreation()) {
                            var rDelete = document.createElement("a");
                            rDelete.classList.add("textLink");
                            rDelete.classList.add("roomExtraButton");
                            rDelete.appendChild(document.createTextNode("_GAMESROOMDELETE_"));
                            rDelete.addEventListener("click", {
                                room: room,
                                handleEvent: function () {
                                    if (confirm(UI.Language.getLanguage().getLingo("_RAPSDELETE_", { languagea: this.room.name }))) {
                                        UI.Rooms.deleteRoom(this.room);
                                    }
                                }
                            });
                            p.appendChild(rDelete);
                            var rPerm = document.createElement("a");
                            rPerm.classList.add("textLink");
                            rPerm.classList.add("roomExtraButton");
                            rPerm.appendChild(document.createTextNode("_GAMESROOMPERMISSIONS_"));
                            rPerm.addEventListener("click", {
                                room: room,
                                handleEvent: function () {
                                    // TODO: UI.Rooms.setPermissions(this.room);
                                }
                            });
                            rPerm.style.display = "none"; // TODO: Display once implemented
                            p.appendChild(rPerm);
                            UI.Language.markLanguage(rPerm, rDelete);
                        }
                        div.appendChild(p);
                    }
                }
                if (game.isMyCreation() || game.getMe().invite) {
                    var hr = document.createElement("hr");
                    hr.classList.add("gamesHR");
                    div.appendChild(hr);
                }
                if (game.isMyCreation() || game.getMe().isCreateRoom()) {
                    var p = document.createElement("p");
                    p.className = "textLink gamesAdminButton";
                    p.appendChild(document.createTextNode("_GAMESCREATEROOM_"));
                    UI.Language.markLanguage(p);
                    div.appendChild(p);
                    p.addEventListener("click", {
                        game: game,
                        handleEvent: function () {
                            UI.Games.RoomDesigner.callSelf(this.game);
                        }
                    });
                }
                var gameContext = game.getMe();
                if (game.isMyCreation() || gameContext.invite) {
                    var p = document.createElement("p");
                    p.className = "textLink gamesAdminButton";
                    p.appendChild(document.createTextNode("_GAMESSENDINVITES_"));
                    UI.Language.markLanguage(p);
                    div.appendChild(p);
                    p.addEventListener("click", {
                        game: game,
                        handleEvent: function () {
                            UI.Games.InviteDesigner.callSelf(this.game);
                        }
                    });
                }
                gameListTarget.appendChild(div);
            }
        }
        Games.callSelf = callSelf;
        ;
        function deleteGame(game) {
            var cbs = {
                handleEvent: function () {
                    UI.Games.callSelf(false);
                }
            };
            Server.Games.deleteGame(game.id, cbs, cbs);
        }
        Games.deleteGame = deleteGame;
        function leaveGame(game) {
            var cbs = {
                handleEvent: function () {
                    UI.Games.callSelf(false);
                }
            };
            Server.Games.leaveGame(game.id, cbs, cbs);
        }
        Games.leaveGame = leaveGame;
        function updateNick(isLogged) {
            if (!isLogged) {
                UI.Language.addLanguageVariable(nickTarget, "a", "Logged out");
            }
            else {
                UI.Language.addLanguageVariable(nickTarget, "a", Application.Login.getUser().getFullNickname());
            }
            UI.Language.updateText(nickTarget);
        }
        Games.updateNick = updateNick;
        ;
    })(Games = UI.Games || (UI.Games = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Games;
    (function (Games) {
        var Invites;
        (function (Invites) {
            var target = document.getElementById("inviteTarget");
            var $error = $(document.getElementById("gameInvitesError")).css("opacity", 0);
            $error[0].appendChild(document.createTextNode("_GAMEINVITESERROR_"));
            $error[0].appendChild(document.createTextNode(" "));
            var a = document.createElement("a");
            a.classList.add("textLink");
            a.addEventListener("click", function () { UI.Games.Invites.callSelf(); });
            a.appendChild(document.createTextNode("_GAMEINVITESERRORTRYAGAIN_"));
            $error[0].appendChild(a);
            UI.Language.markLanguage(a);
            document.getElementById("gameInvitesButton").addEventListener("click", function () { UI.Games.Invites.callSelf(); });
            Application.Login.addListener({
                element: document.getElementById("gameInvitesNickTarget"),
                handleEvent: function (isLogged) {
                    if (isLogged) {
                        UI.Language.addLanguageVariable(this.element, "a", Application.Login.getUser().getFullNickname());
                        UI.Language.updateElement(this.element);
                    }
                }
            });
            function callSelf() {
                UI.PageManager.callPage(UI.idGameInvites);
                var cbs = {
                    handleEvent: function (data) {
                        UI.Games.Invites.printInfo(data);
                    }
                };
                var cbe = {
                    handleEvent: function () {
                        UI.Games.Invites.printError();
                    }
                };
                $error.finish().css("opacity", "0");
                Server.Games.getInviteList(cbs, cbe);
            }
            Invites.callSelf = callSelf;
            function empty() {
                while (target.firstChild !== null) {
                    target.removeChild(target.firstChild);
                }
            }
            function printInfo(data) {
                data = data;
                empty();
                if (data.length === 0) {
                    var p = document.createElement("p");
                    p.classList.add("gameInvitesEmptyP");
                    p.appendChild(document.createTextNode("_GAMEINVITESEMPTY_"));
                    var a = document.createElement("a");
                    a.classList.add("textLink");
                    a.appendChild(document.createTextNode("_GAMEINVITESREFRESH_"));
                    UI.Language.markLanguage(a);
                    a.addEventListener("click", function () { UI.Games.Invites.callSelf(); });
                    p.appendChild(document.createTextNode(" "));
                    p.appendChild(a);
                    UI.Language.markLanguage(p);
                    target.appendChild(p);
                }
                else {
                    for (var i = 0; i < data.length; i++) {
                        //MensagemConvite: "Invite com mensagem"
                        //id: 435
                        var row = data[i];
                        var div = document.createElement("div");
                        div.classList.add("gameInvitesContainer");
                        var firstP = document.createElement("p");
                        div.appendChild(firstP);
                        var gameTitle = document.createElement("b");
                        gameTitle.appendChild(document.createTextNode("_GAMEINVITESGAMETITLE_"));
                        gameTitle.appendChild(document.createTextNode(": "));
                        UI.Language.markLanguage(gameTitle);
                        firstP.appendChild(gameTitle);
                        firstP.appendChild(document.createTextNode(row["name"]));
                        var sender = document.createElement("b");
                        sender.appendChild(document.createTextNode("_GAMEINVITESSTORYTELLER_"));
                        sender.appendChild(document.createTextNode(": "));
                        sender.classList.add("gameInvitesStoryteller");
                        UI.Language.markLanguage(sender);
                        firstP.appendChild(sender);
                        firstP.appendChild(document.createTextNode(row['creatornick'] + "#" + row['creatorsufix']));
                        var secondP = document.createElement("p");
                        div.appendChild(secondP);
                        if (row['MensagemConvite'] === undefined) {
                            secondP.appendChild(document.createTextNode("_GAMEINVITESNOMESSAGE_"));
                            UI.Language.markLanguage(secondP);
                        }
                        else {
                            var message = document.createElement("b");
                            message.appendChild(document.createTextNode("_GAMEINVITESMESSAGE_"));
                            message.appendChild(document.createTextNode(": "));
                            message.classList.add("gameInvitesMessage");
                            UI.Language.markLanguage(message);
                            secondP.appendChild(message);
                            secondP.appendChild(document.createTextNode(row['MensagemConvite']));
                        }
                        var thirdP = document.createElement("p");
                        div.appendChild(thirdP);
                        var accept = document.createElement("a");
                        accept.classList.add("textLink");
                        accept.appendChild(document.createTextNode("_GAMEINVITESACCEPT_"));
                        UI.Language.markLanguage(accept);
                        accept.addEventListener("click", {
                            id: row['id'],
                            handleEvent: function () {
                                UI.Games.Invites.accept(this.id);
                            }
                        });
                        var reject = document.createElement("a");
                        reject.classList.add("textLink");
                        reject.classList.add("gameInvitesReject");
                        reject.appendChild(document.createTextNode("_GAMEINVITESREJECT_"));
                        UI.Language.markLanguage(reject);
                        reject.addEventListener("click", {
                            id: row['id'],
                            handleEvent: function () {
                                UI.Games.Invites.reject(this.id);
                            }
                        });
                        thirdP.appendChild(accept);
                        thirdP.appendChild(reject);
                        target.appendChild(div);
                    }
                }
            }
            Invites.printInfo = printInfo;
            function accept(id) {
                var onLoaded = {
                    handleEvent: function () {
                        UI.Games.Invites.callSelf();
                    }
                };
                Server.Games.acceptInvite(id, onLoaded, onLoaded);
            }
            Invites.accept = accept;
            function reject(id) {
                var onLoaded = {
                    handleEvent: function () {
                        UI.Games.Invites.callSelf();
                    }
                };
                Server.Games.rejectInvite(id, onLoaded, onLoaded);
            }
            Invites.reject = reject;
            function printError() {
                $error.finish().animate({ opacity: 1 }, Application.Config.getConfig("animTime").getValue() * 2);
            }
            Invites.printError = printError;
        })(Invites = Games.Invites || (Games.Invites = {}));
    })(Games = UI.Games || (UI.Games = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Games;
    (function (Games) {
        var InviteDesigner;
        (function (InviteDesigner) {
            var currentGame = null;
            var gameName = document.getElementById("gameInviteDesignerGameName");
            var form = document.getElementById("gameInviteDesignerForm");
            var nameInput = document.getElementById("gameInviteDesignerName");
            var msgInput = document.getElementById("gameInviteDesignerMessage");
            var err404 = document.getElementById("gameInviteDesigner404");
            var err401 = document.getElementById("gameInviteDesigner401");
            var success = document.getElementById("gameInviteDesigner200");
            InviteDesigner.$msgs = $([err404, err401, success]);
            var $404 = $(err404);
            var $401 = $(err401);
            var $success = $(success);
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Games.InviteDesigner.submit();
            });
            function callSelf(game) {
                UI.PageManager.callPage(UI.idInviteDesigner);
                UI.Language.addLanguageVariable(gameName, "a", game.name);
                UI.Language.updateElement(gameName);
                currentGame = game;
                InviteDesigner.$msgs.stop().hide();
                nameInput.value = "";
                msgInput.value = "";
            }
            InviteDesigner.callSelf = callSelf;
            function emptyName() {
                nameInput.value = "";
            }
            InviteDesigner.emptyName = emptyName;
            function submit() {
                InviteDesigner.$msgs.stop().hide();
                var cbs = {
                    handleEvent: function () {
                        UI.Games.InviteDesigner.emptyName();
                        UI.Games.InviteDesigner.showMessage(200);
                    }
                };
                var cbe = {
                    handleEvent: function (data, xhr) {
                        if (xhr.status === 409) {
                            UI.Games.InviteDesigner.showMessage(401);
                        }
                        else {
                            UI.Games.InviteDesigner.showMessage(404);
                        }
                    }
                };
                var nick = nameInput.value.split("#");
                if (nick.length !== 2) {
                    showMessage(404);
                    return;
                }
                var message = msgInput.value;
                Server.Games.sendInvite(currentGame.id, nick[0], nick[1], message, cbs, cbe);
            }
            InviteDesigner.submit = submit;
            function showMessage(id) {
                InviteDesigner.$msgs.stop().hide();
                if (id === 200) {
                    $success.fadeIn(Application.Config.getConfig("animTime").getValue());
                }
                else if (id === 401) {
                    $401.fadeIn(Application.Config.getConfig("animTime").getValue());
                }
                else {
                    $404.fadeIn(Application.Config.getConfig("animTime").getValue());
                }
            }
            InviteDesigner.showMessage = showMessage;
        })(InviteDesigner = Games.InviteDesigner || (Games.InviteDesigner = {}));
    })(Games = UI.Games || (UI.Games = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Games;
    (function (Games) {
        var RoomDesigner;
        (function (RoomDesigner) {
            var currentGame = null;
            var currentRoom = null;
            var nameInput = document.getElementById("roomDesignerName");
            var descInput = document.getElementById("roomDesignerMessage");
            var $error = $(document.getElementById("roomDesignerError"));
            document.getElementById("roomDesignerForm").addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Games.RoomDesigner.submit();
            });
            function clear() {
                nameInput.value = "";
                descInput.value = "";
                $error.stop().hide();
            }
            function callSelf(game, room) {
                currentGame = game;
                currentRoom = room === undefined ? null : room;
                clear();
                if (currentRoom !== null) {
                    nameInput.value = currentRoom.name;
                    descInput.value = currentRoom.description;
                }
                UI.PageManager.callPage(UI.idRoomDesigner);
            }
            RoomDesigner.callSelf = callSelf;
            function toRoom() {
                var room;
                if (currentRoom !== null) {
                    room = currentRoom;
                }
                else {
                    room = new Room();
                    room.gameid = currentGame.id;
                }
                room.name = nameInput.value.trim();
                room.description = descInput.value.trim();
                return room;
            }
            RoomDesigner.toRoom = toRoom;
            function submit() {
                var cbs = {
                    handleEvent: function () {
                        UI.Games.callSelf();
                    }
                };
                var cbe = {
                    handleEvent: function () {
                        UI.Games.RoomDesigner.showError();
                    }
                };
                if (currentRoom === null) {
                    Server.Games.createRoom(toRoom(), cbs, cbe);
                }
                else {
                    // TODO: Call Server.Games.editRoom(toRoom(), cbs, cbe);
                }
            }
            RoomDesigner.submit = submit;
            function showError() {
                $error.fadeIn(Application.Config.getConfig("animTime").getValue());
            }
            RoomDesigner.showError = showError;
        })(RoomDesigner = Games.RoomDesigner || (Games.RoomDesigner = {}));
    })(Games = UI.Games || (UI.Games = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Games;
    (function (Games) {
        var Designer;
        (function (Designer) {
            document.getElementById("gameNewGameButton").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Games.Designer.callSelf();
            });
            var currentGame = null;
            var nameInput = document.getElementById("gameDesignerName");
            var descInput = document.getElementById("gameDesignerMessage");
            var $error = $(document.getElementById("gameDesignerError"));
            document.getElementById("gameDesignerForm").addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Games.Designer.submit();
            });
            function clear() {
                nameInput.value = "";
                descInput.value = "";
                $error.stop().hide();
            }
            function callSelf(game) {
                currentGame = game === undefined ? null : game;
                clear();
                if (currentGame !== null) {
                    nameInput.value = currentGame.name;
                    descInput.value = currentGame.description;
                }
                UI.PageManager.callPage(UI.idGameDesigner);
            }
            Designer.callSelf = callSelf;
            function toGame() {
                var game;
                if (currentGame !== null) {
                    game = currentGame;
                }
                else {
                    game = new Game();
                }
                game.name = nameInput.value.trim();
                game.description = descInput.value.trim();
                return game;
            }
            Designer.toGame = toGame;
            function submit() {
                var cbs = {
                    handleEvent: function () {
                        UI.Games.callSelf();
                    }
                };
                var cbe = {
                    handleEvent: function () {
                        UI.Games.Designer.showError();
                    }
                };
                if (currentGame === null) {
                    Server.Games.createGame(toGame(), cbs, cbe);
                }
                else {
                    Server.Games.editGame(toGame(), cbs, cbe);
                }
            }
            Designer.submit = submit;
            function showError() {
                $error.fadeIn(Application.Config.getConfig("animTime").getValue());
            }
            Designer.showError = showError;
        })(Designer = Games.Designer || (Games.Designer = {}));
    })(Games = UI.Games || (UI.Games = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var SoundController;
    (function (SoundController) {
        var trackNameContainer = document.getElementById("musicPlayerTrackName");
        while (trackNameContainer.firstChild)
            trackNameContainer.removeChild(trackNameContainer.firstChild);
        var trackNameMarquee = document.createElement("p");
        trackNameMarquee.classList.add("marquee");
        var trackName = document.createTextNode("");
        trackNameMarquee.appendChild(trackName);
        trackNameContainer.appendChild(trackNameMarquee);
        var diceSound = document.getElementById("soundDiceRoll");
        var alertSound = document.getElementById("soundAlert");
        var bgmSound = document.getElementById("soundPlayerBGM");
        var seSound = document.getElementById("soundPlayerSE");
        var lastURL = null;
        var lastSEURL = null;
        var startedPlaying = false;
        diceSound.parentNode.removeChild(diceSound);
        alertSound.parentNode.removeChild(alertSound);
        bgmSound.parentNode.removeChild(bgmSound);
        seSound.parentNode.removeChild(seSound);
        Application.Config.getConfig("seVolume").addChangeListener(function (e) { UI.SoundController.updateSEVolume(e.getValue()); });
        Application.Config.getConfig("bgmVolume").addChangeListener(function (e) { UI.SoundController.updateBGMVolume(e.getValue()); });
        function updateSEVolume(newVolume) {
            var volume;
            if (newVolume > 100) {
                volume = 1;
            }
            else if (newVolume < 0) {
                volume = 0;
            }
            else {
                volume = (newVolume / 100);
            }
            diceSound.volume = volume;
            alertSound.volume = volume;
            seSound.volume = volume;
        }
        SoundController.updateSEVolume = updateSEVolume;
        function updateBGMVolume(newVolume) {
            var volume;
            if (newVolume > 100) {
                volume = 1;
            }
            else if (newVolume < 0) {
                volume = 0;
            }
            else {
                volume = (newVolume / 100);
            }
            bgmSound.volume = volume;
        }
        SoundController.updateBGMVolume = updateBGMVolume;
        bgmSound.addEventListener("error", function (e) {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATBGMERROR_");
            UI.Chat.printElement(msg.getElement());
        });
        seSound.addEventListener("error", function () {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATSEERROR_");
            UI.Chat.printElement(msg.getElement());
        });
        function getBGM() {
            return bgmSound;
        }
        SoundController.getBGM = getBGM;
        function playDice() {
            diceSound.currentTime = 0;
            diceSound.play();
        }
        SoundController.playDice = playDice;
        function playAlert() {
            alertSound.currentTime = 0;
            alertSound.play();
        }
        SoundController.playAlert = playAlert;
        bgmSound.addEventListener("canplay", function () {
            if (UI.SoundController.isAutoPlay()) {
                this.play();
            }
        });
        seSound.addEventListener("canplay", function () {
            this.play();
        });
        function isAutoPlay() {
            var r = startedPlaying;
            startedPlaying = false;
            return r;
        }
        SoundController.isAutoPlay = isAutoPlay;
        function playBGM(url) {
            if (lastURL !== null) {
                URL.revokeObjectURL(lastURL);
                lastURL = null;
            }
            startedPlaying = true;
            var found = false;
            var isLink = url.indexOf("://") !== -1;
            url = Server.URL.fixURL(url);
            var filename = decodeURI(url.substring(url.lastIndexOf('/') + 1));
            trackName.nodeValue = filename;
            bgmSound.src = url;
        }
        SoundController.playBGM = playBGM;
        function playSE(url) {
            if (lastSEURL !== null) {
                URL.revokeObjectURL(lastSEURL);
                lastSEURL = null;
            }
            var found = false;
            var isLink = url.indexOf("://") !== -1;
            url = Server.URL.fixURL(url);
            seSound.src = url;
        }
        SoundController.playSE = playSE;
    })(SoundController = UI.SoundController || (UI.SoundController = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var SoundController;
    (function (SoundController) {
        var MusicPlayer;
        (function (MusicPlayer) {
            var bgm = UI.SoundController.getBGM();
            var button = document.getElementById("musicPlayerButton");
            var parent = button.parentNode;
            var container = document.getElementById("musicPlayerContainer");
            var bar = document.getElementById("musicPlayerProgress");
            var playpause = document.getElementById("musicPlayerPlayPause");
            var stop = document.getElementById("musicPlayerStop");
            var repeat = document.getElementById("musicPlayerRepeat");
            parent.removeChild(button);
            button.removeChild(container);
            playpause.addEventListener("click", function () {
                var bgm = UI.SoundController.getBGM();
                if (bgm.paused) {
                    bgm.play();
                    this.classList.add("icons-soundPlayerPause");
                    this.classList.remove("icons-soundPlayerPlay");
                }
                else {
                    bgm.pause();
                    this.classList.remove("icons-soundPlayerPause");
                    this.classList.add("icons-soundPlayerPlay");
                }
            });
            stop.addEventListener("click", function () { UI.SoundController.MusicPlayer.stopPlaying(); });
            repeat.addEventListener("click", function () {
                var cfg = Application.Config.getConfig("bgmLoop");
                cfg.storeValue(!cfg.getValue());
            });
            Application.Config.getConfig("bgmLoop").addChangeListener({
                repeat: repeat,
                handleEvent: function (e) {
                    if (e.getValue()) {
                        this.repeat.classList.add("icons-soundPlayerRepeatActive");
                        this.repeat.classList.remove("icons-soundPlayerRepeat");
                    }
                    else {
                        this.repeat.classList.add("icons-soundPlayerRepeat");
                        this.repeat.classList.remove("icons-soundPlayerRepeatActive");
                    }
                }
            });
            bgm.addEventListener("error", function () {
                UI.SoundController.MusicPlayer.stopPlaying();
            });
            bgm.addEventListener("play", {
                playpause: playpause,
                handleEvent: function () {
                    this.playpause.classList.add("icons-soundPlayerPause");
                    this.playpause.classList.remove("icons-soundPlayerPlay");
                }
            });
            bgm.addEventListener("play", function () { UI.SoundController.MusicPlayer.showButton(); });
            var updateSeekerF = function () {
                var time = this.currentTime;
                var duration = this.duration;
                UI.SoundController.MusicPlayer.updateSeeker((time / duration) * 100);
            };
            bgm.addEventListener("timeupdate", updateSeekerF);
            bgm.addEventListener("durationchange", updateSeekerF);
            bgm.addEventListener("ended", function () {
                var loop = Application.Config.getConfig("bgmLoop").getValue();
                if (loop) {
                    this.currentTime = 0;
                    this.play();
                }
                else {
                    UI.SoundController.MusicPlayer.stopPlaying();
                }
            });
            bar.addEventListener("click", function (e) {
                var offset = $(this).offset();
                var x = e.pageX - offset.left;
                var width = this.clientWidth;
                var bgm = UI.SoundController.getBGM();
                bgm.currentTime = bgm.duration * (x / width);
            });
            button.addEventListener("mouseover", function () { UI.SoundController.MusicPlayer.showContainer(); });
            button.addEventListener("mouseout", function (event) {
                var e = (event.toElement || event.relatedTarget);
                var parent = e;
                while (parent !== null) {
                    if (parent === this) {
                        break;
                    }
                    parent = parent.parentNode;
                }
                if (parent !== null) {
                    return;
                }
                UI.SoundController.MusicPlayer.hideContainer();
            });
            function showContainer() {
                button.appendChild(container);
            }
            MusicPlayer.showContainer = showContainer;
            function hideContainer() {
                if (container.parentNode !== null)
                    button.removeChild(container);
            }
            MusicPlayer.hideContainer = hideContainer;
            function showButton() {
                parent.appendChild(button);
            }
            MusicPlayer.showButton = showButton;
            function hideButton() {
                if (button.parentNode === parent)
                    parent.removeChild(button);
            }
            MusicPlayer.hideButton = hideButton;
            function updateSeeker(perc) {
                bar.value = perc;
            }
            MusicPlayer.updateSeeker = updateSeeker;
            function stopPlaying() {
                hideContainer();
                hideButton();
                bgm.pause();
                bgm.currentTime = 0;
            }
            MusicPlayer.stopPlaying = stopPlaying;
        })(MusicPlayer = SoundController.MusicPlayer || (SoundController.MusicPlayer = {}));
    })(SoundController = UI.SoundController || (UI.SoundController = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var lastDate = "";
        Chat.unseenMessages = 0;
        // Main Box
        var chatBox = document.getElementById("chatBox");
        var $chatBox = $(chatBox);
        var $chatBoxScrollDown = $("#chatScrollDown");
        $chatBoxScrollDown[0].style.display = "none";
        // Help messages
        var chatHelperss = document.getElementsByClassName("chatInitHelp");
        // NodeList loses values if they are unattached to the DOM
        var chatHelpers = [];
        for (var i = 0; i < chatHelperss.length; i++) {
            chatHelpers.push(chatHelperss[i]);
        }
        // Buttons
        var personaButton = document.getElementById("chatPersonaButton");
        personaButton.addEventListener("click", function () {
            personaButton.classList.toggle("on");
            UI.Chat.PersonaManager.sendPersonas();
        });
        // Config Listeners
        Application.Config.getConfig("chatfontsize").addChangeListener({
            chatBox: chatBox,
            handleEvent: function () {
                this.chatBox.style.fontSize = Application.Config.getConfig("chatfontsize").getValue() + "px";
                UI.Chat.updateScrollPosition(true);
            }
        });
        chatBox.style.fontSize = Application.Config.getConfig("chatfontsize").getValue() + "px";
        Application.Config.getConfig("chatfontfamily").addChangeListener({
            chatBox: chatBox,
            handleEvent: function () {
                this.chatBox.style.fontFamily = '"' + Application.Config.getConfig("chatfontfamily").getValue() + '", "Arial"';
            }
        });
        chatBox.style.fontFamily = Application.Config.getConfig("chatfontfamily").getValue();
        Application.Config.getConfig("chatshowhelp").addChangeListener({
            chatHelpers: chatHelpers,
            handleEvent: function (e) {
                for (var i = 0; i < this.chatHelpers.length; i++) {
                    this.chatHelpers[i].style.display = e.getValue() ? "" : "none";
                }
            }
        });
        Application.Config.getConfig("chatzebra").addChangeListener({
            chatHelpers: chatHelpers,
            handleEvent: function (e) {
                UI.Chat.setZebra(e.getValue());
            }
        });
        // Title and description
        var chatTitleNode = document.createTextNode("Title");
        var chatDescriptionNode = document.createTextNode("Description");
        document.getElementById("chatTitle").appendChild(chatTitleNode);
        document.getElementById("chatDescription").appendChild(chatDescriptionNode);
        // Floater
        var chatInfoFloater = new ChatInfo(document.getElementById("chatFloater"));
        // Message target
        var chatTarget = document.getElementById("chatMessages");
        // Variables
        var printingMany = false;
        var lastPrintedId = 0;
        var scrolledDown = true;
        var currentRoom = null;
        //var roomListeners : Array<Listener> = [];
        var roomTrigger = new Trigger();
        Chat.messageCounter = 0;
        function isSendPersonas() {
            return !personaButton.classList.contains("on");
        }
        Chat.isSendPersonas = isSendPersonas;
        function doAutomation() {
            return !printingMany;
        }
        Chat.doAutomation = doAutomation;
        function callSelf(roomid, log) {
            UI.PageManager.callPage(UI.idChat);
            clearRoom();
            if (log !== true)
                Server.Chat.enterRoom(roomid);
            var room = DB.RoomDB.getRoom(roomid);
            chatTitleNode.nodeValue = room.name;
            chatDescriptionNode.nodeValue = room.description;
            currentRoom = room;
            triggerRoomChanged();
            if (log === true)
                UI.Chat.printMessages(UI.Chat.getRoom().getOrderedMessages(), false);
        }
        Chat.callSelf = callSelf;
        function addRoomChangedListener(listener) {
            roomTrigger.addListener(listener);
        }
        Chat.addRoomChangedListener = addRoomChangedListener;
        function triggerRoomChanged() {
            roomTrigger.trigger(currentRoom);
        }
        function getRoom() {
            return currentRoom;
        }
        Chat.getRoom = getRoom;
        function inRoom() {
            return currentRoom != null && currentRoom != undefined;
        }
        Chat.inRoom = inRoom;
        function clearRoom() {
            var dateObj = new Date();
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var day = dateObj.getUTCDate();
            var year = dateObj.getUTCFullYear();
            lastDate = year + "-" + month + "-" + day;
            var parent = chatTarget.parentNode;
            parent.removeChild(chatTarget);
            while (chatTarget.lastChild !== null) {
                chatTarget.removeChild(chatTarget.lastChild);
            }
            parent.appendChild(chatTarget);
            lastPrintedId = 0;
            Chat.messageCounter = 0;
        }
        Chat.clearRoom = clearRoom;
        function printElement(element, doScroll) {
            element.classList.add("printedMessage");
            chatTarget.appendChild(element);
            Chat.messageCounter++;
            if (doScroll === undefined || doScroll) {
                updateScrollPosition();
            }
            var maxMessages = $.browser.mobile && false ? Application.Config.getConfig("chatMaxMessages").getDefault() : Application.Config.getConfig("chatMaxMessages").getValue();
            if (Chat.messageCounter > maxMessages) {
                Chat.messageCounter = chatTarget.children.length;
                while (Chat.messageCounter > (maxMessages / 2)) {
                    Chat.messageCounter--;
                    chatTarget.removeChild(chatTarget.firstChild);
                }
                //printGetAllButtonAtStart();
                // this is about too many messages, not some missing
                printNotallAtStart();
            }
        }
        Chat.printElement = printElement;
        function printMessage(message, doScroll) {
            var chatAllowed = Server.Chat.Memory.getConfiguration("Cutscene").getValue();
            if (!chatAllowed && !(message.getUser().isStoryteller() || message.hasDestination())) {
                return;
            }
            var element = message.getHTML();
            if (element !== null) {
                if (message.getDate() !== null && message.getDate() !== lastDate) {
                    lastDate = message.getDate();
                    var msg = new ChatSystemMessage(true);
                    msg.addText("_CHATMESSAGESFROM_");
                    msg.addLangVar("a", lastDate);
                    printElement(msg.getElement());
                }
                chatInfoFloater.bindMessage(message, element);
                printElement(element);
            }
            if (message.id > lastPrintedId) {
                lastPrintedId = message.id;
            }
            message.onPrint();
            if (doScroll === undefined || doScroll) {
                updateScrollPosition();
            }
            considerFocus();
        }
        Chat.printMessage = printMessage;
        function printMessages(messages, ignoreLowIds) {
            // Initiate printing mode
            printingMany = true;
            // Maximum amount of messages allowed Config
            var maxMessages = $.browser.mobile && false ?
                Application.Config.getConfig("chatMaxMessages").getDefault()
                :
                    Application.Config.getConfig("chatMaxMessages").getValue();
            // Do we have more messages than allowed?
            var i;
            var counting = 0;
            for (i = messages.length - 1; i >= 0; i--) {
                if (messages[i].getHTML() !== null) {
                    // I don't why 4 works but it does and I'm not feeling like finding out
                    if (++counting > (maxMessages - 4)) {
                        break;
                    }
                }
            }
            // Are we going to print only part of the messages?
            if (i >= 0) {
                // i > 0 means that we reached the maxMessages Limit
                // i === 0 means that we have the exact amount of messages we are allowed to print.
                clearRoom();
                // If we're not printing all of them, we need to say so
                if (i > 0) {
                    var msg = new ChatSystemMessage(true);
                    msg.addText("_CHATNOTALLMESSAGES_");
                    printElement(msg.getElement());
                }
            }
            else {
                // i < 0 means we can print them all.
                i = 0;
            }
            // Detach parent to speed up process
            var parent = chatTarget.parentNode;
            parent.removeChild(chatTarget);
            // Actually print the messages
            while (i < messages.length) {
                if (!messages[i].doNotPrint() && (ignoreLowIds || messages[i].id > lastPrintedId)) {
                    printMessage(messages[i], false);
                }
                i++;
            }
            // Reatach parent
            parent.appendChild(chatTarget);
            // Stop printing mode
            printingMany = false;
            // Scroll down to bottom, if necessary
            // Don't scroll down if opening a log
            if ((currentRoom === null || currentRoom.id !== 0)) {
                updateScrollPosition();
            }
        }
        Chat.printMessages = printMessages;
        function updateScrollPosition(instant) {
            instant = instant === undefined ? true : instant;
            if (scrolledDown) {
                if (instant)
                    chatBox.scrollTop = chatBox.scrollHeight - chatBox.offsetHeight + 10;
                else
                    $chatBox.stop().animate({
                        scrollTop: chatBox.scrollHeight - chatBox.offsetHeight + 10
                    }, Application.Config.getConfig("animTime").getValue());
            }
        }
        Chat.updateScrollPosition = updateScrollPosition;
        function scrollToTop() {
            $chatBox.stop();
            chatBox.scrollTop = 0;
        }
        Chat.scrollToTop = scrollToTop;
        function setZebra(zebra) {
            if (zebra) {
                chatBox.classList.add("zebra");
            }
            else {
                chatBox.classList.remove("zebra");
            }
        }
        Chat.setZebra = setZebra;
        function setScrolledDown(state) {
            if (scrolledDown === state)
                return;
            scrolledDown = state;
            if (scrolledDown) {
                $chatBoxScrollDown.stop().fadeOut(Application.Config.getConfig("animTime").getValue());
            }
            else {
                $chatBoxScrollDown.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
            }
        }
        Chat.setScrolledDown = setScrolledDown;
        function sendMessage(message) {
            if (currentRoom === null) {
                console.warn("[CHAT] Attempt to send messages while not in a room. Ignoring. Offending message:", message);
                return;
            }
            var chatAllowed = Server.Chat.Memory.getConfiguration("Cutscene").getValue();
            if (!chatAllowed && !(Server.Chat.getRoom().getMe().isStoryteller() || message.hasDestination())) {
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATSHHHHHWEHOLLYWOODNOW_");
                UI.Chat.printElement(msg.getElement());
                return;
            }
            message.roomid = currentRoom.id;
            message.prepareSending();
            printMessage(message);
            Server.Chat.sendMessage(message);
        }
        Chat.sendMessage = sendMessage;
        function getGetAllButton() {
            var getAllForMe = {
                room: currentRoom,
                handleEvent: function () {
                    var cbs = {
                        handleEvent: function () {
                            UI.Chat.clearRoom();
                            UI.Chat.printMessages(UI.Chat.getRoom().getOrderedMessages(), false);
                        }
                    };
                    Server.Chat.getAllMessages(this.room.id, cbs);
                }
            };
            var getAllForMeText = new ChatSystemMessage(true);
            getAllForMeText.addText("_CHATOLDMESSAGESNOTLOADED_");
            getAllForMeText.addText(" ");
            getAllForMeText.addTextLink("_CHATOLDMESSAGESLOAD_", true, getAllForMe);
            return getAllForMeText.getElement();
        }
        Chat.getGetAllButton = getGetAllButton;
        function leave() {
            Server.Chat.end();
            currentRoom = null;
            triggerRoomChanged();
            UI.Games.callSelf();
        }
        Chat.leave = leave;
        function printGetAllButtonAtStart() {
            if (chatTarget.firstChild !== null) {
                var html = getGetAllButton();
                chatTarget.insertBefore(html, chatTarget.firstChild);
            }
            else {
                printGetAllButton();
            }
        }
        Chat.printGetAllButtonAtStart = printGetAllButtonAtStart;
        function printNotallAtStart() {
            var msg = new ChatSystemMessage(true);
            msg.addText("_CHATNOTALLMESSAGES_");
            if (chatTarget.firstChild !== null) {
                chatTarget.insertBefore(msg.getElement(), chatTarget.firstChild);
            }
            else {
                printElement(msg.getElement());
            }
        }
        Chat.printNotallAtStart = printNotallAtStart;
        function printGetAllButton() {
            printElement(getGetAllButton());
        }
        Chat.printGetAllButton = printGetAllButton;
        chatBox.addEventListener("scroll", function (a) {
            var minScroll = this.scrollHeight - this.offsetHeight - 10;
            var currentScroll = this.scrollTop;
            UI.Chat.setScrolledDown(currentScroll >= minScroll);
        });
        $chatBoxScrollDown[0].addEventListener("click", function () {
            UI.Chat.setScrolledDown(true);
            UI.Chat.updateScrollPosition(false);
        });
        /**
         * Initialize with mock up chat messages to force preloading of fonts
         */
        clearRoom();
        for (var i = 0; i < 1; i++) {
            var messages = MessageFactory.createTestingMessages();
            printMessages(messages, true);
            DB.MessageDB.releaseAllLocalMessages(); // On clear, all temporary messages will be lost anyway. This ties up loose ends.
        }
        var chatButton = document.getElementById("openChatButton");
        chatButton.style.display = "none";
        chatButton.addEventListener("click", function () {
            UI.PageManager.callPage(UI.idChat);
            UI.Chat.updateScrollPosition(true);
        });
        addRoomChangedListener({
            button: chatButton,
            handleEvent: function (room) {
                if (room === null) {
                    this.button.style.display = "none";
                }
                else {
                    this.button.style.display = "";
                }
            }
        });
        function considerFocus() {
            if (document.hasFocus()) {
                UI.resetTitle();
                Chat.unseenMessages = 0;
            }
            else {
                UI.addTitle("(" + ++Chat.unseenMessages + ")");
            }
        }
        window.addEventListener("focus", function () {
            UI.resetTitle();
            UI.Chat.unseenMessages = 0;
        });
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var Avatar;
        (function (Avatar) {
            var avatarBox = document.getElementById("avatarBox");
            var $avatarBox = $(avatarBox);
            while (avatarBox.firstChild !== null)
                avatarBox.removeChild(avatarBox.firstChild);
            var height = 80;
            var upButton = document.getElementById("avatarUpButton");
            upButton.addEventListener("click", function () { UI.Chat.Avatar.moveScroll(-1); });
            var downButton = document.getElementById("avatarDownButton");
            downButton.addEventListener("click", function () { UI.Chat.Avatar.moveScroll(1); });
            var avatars = {};
            function getMe() {
                return avatars[Application.Login.getUser().id];
            }
            Avatar.getMe = getMe;
            function resetForConnect() {
                for (var id in avatars) {
                    avatars[id].reset();
                }
            }
            Avatar.resetForConnect = resetForConnect;
            function moveScroll(direction) {
                $avatarBox.finish();
                var currentHeight = avatarBox.scrollHeight;
                var currentScroll = avatarBox.scrollTop;
                var change = direction * height;
                if ((currentScroll + change) <= 0) {
                    upButton.classList.add("inactive");
                }
                else {
                    upButton.classList.remove("inactive");
                }
                if ((currentScroll + height + change) >= currentHeight) {
                    downButton.classList.add("inactive");
                }
                else {
                    downButton.classList.remove("inactive");
                }
                $avatarBox.animate({
                    scrollTop: (currentScroll + change) + "px"
                });
            }
            Avatar.moveScroll = moveScroll;
            function updatePosition() {
                var currentHeight = avatarBox.scrollHeight;
                var currentScroll = avatarBox.scrollTop;
                if (currentHeight <= height) {
                    avatarBox.scrollTop = 0;
                }
                else if (currentHeight <= (currentScroll + height)) {
                    avatarBox.scrollTop = currentHeight - height;
                }
                if (avatarBox.scrollTop === 0) {
                    upButton.classList.add("inactive");
                }
                else {
                    upButton.classList.remove("inactive");
                }
                if ((avatarBox.scrollTop + height) === currentHeight) {
                    downButton.classList.add("inactive");
                }
                else {
                    downButton.classList.remove("inactive");
                }
            }
            Avatar.updatePosition = updatePosition;
            function updateFromObject(obj, cleanup) {
                var cleanedup = [];
                for (var i = 0; i < obj.length; i++) {
                    if (avatars[obj[i]['id']] === undefined) {
                        avatars[obj[i]['id']] = new ChatAvatar();
                        avatarBox.appendChild(avatars[obj[i]['id']].getHTML());
                    }
                    avatars[obj[i]['id']].updateFromObject(obj[i]);
                    if (avatars[obj[i]['id']].isChangedOnline()) {
                        var msg = new ChatSystemMessage(true);
                        msg.addText(avatars[obj[i]['id']].getUser().getFullNickname() + " ");
                        if (avatars[obj[i]['id']].online) {
                            msg.addText("_CHATHASCONNECTED_");
                        }
                        else {
                            msg.addText("_CHATHASDISCONNECTED_");
                        }
                        UI.Chat.printElement(msg.getElement(), false);
                    }
                    cleanedup.push(obj[i]['id'].toString());
                }
                UI.Chat.updateScrollPosition(true);
                if (cleanup) {
                    for (var id in avatars) {
                        if (cleanedup.indexOf(id.toString()) === -1) {
                            avatarBox.removeChild(avatars[id].getHTML());
                            delete (avatars[id]);
                        }
                    }
                }
                updatePosition();
            }
            Avatar.updateFromObject = updateFromObject;
        })(Avatar = Chat.Avatar || (Chat.Avatar = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var PersonaManager;
        (function (PersonaManager) {
            var personaBox = document.getElementById("personaContainer");
            while (personaBox.firstChild !== null)
                personaBox.removeChild(personaBox.lastChild);
            var currentElement = null;
            var currentPersonaName = null;
            var currentPersonaAvatar = null;
            var changeTrigger = new Trigger();
            var personaShortcuts = {};
            var personaShortcutLastUsage = [];
            var currentRoom = null;
            UI.Chat.addRoomChangedListener({
                handleEvent: function (e) {
                    UI.Chat.PersonaManager.setRoom(e);
                }
            });
            function setRoom(room) {
                currentRoom = room;
                clearPersonas();
            }
            PersonaManager.setRoom = setRoom;
            function clearPersonas() {
                while (personaBox.firstChild !== null)
                    personaBox.removeChild(personaBox.firstChild);
                currentPersonaAvatar = null;
                currentPersonaName = null;
                currentElement = null;
                personaShortcutLastUsage = [];
                personaShortcuts = {};
            }
            function clearPersona(name, avatar) {
                if (personaShortcuts[name + ";" + avatar] !== undefined) {
                    personaShortcutLastUsage.splice(personaShortcutLastUsage.indexOf(personaShortcuts[name + ";" + avatar]), 1);
                    personaBox.removeChild(personaShortcuts[name + ";" + avatar]);
                    if (currentElement === personaShortcuts[name + ";" + avatar]) {
                        unsetPersona();
                    }
                    delete (personaShortcuts[name + ";" + avatar]);
                }
                else {
                    console.debug("[PERSONAMANAGER] Attempt to remove unknown persona: " + name + ";" + avatar);
                }
            }
            PersonaManager.clearPersona = clearPersona;
            function getRoom() {
                return currentRoom;
            }
            PersonaManager.getRoom = getRoom;
            function createPersonaButton(name, avatar) {
                var ele = document.createElement("div");
                ele.classList.add("personaButton");
                name = name.trim();
                avatar = avatar === null ? null : avatar.trim();
                var handler = {
                    name: name,
                    avatar: avatar,
                    element: ele,
                    handleEvent: function (e) {
                        UI.Chat.PersonaManager.setPersona(this.name, this.avatar, this.element);
                    }
                };
                ele.addEventListener("click", handler);
                var shortName = name.split(" ");
                var finalName = "";
                var i = 0;
                while (finalName.length <= 6 && i < shortName.length) {
                    finalName += " " + shortName[i];
                    i++;
                }
                ele.appendChild(document.createTextNode(finalName.trim()));
                return ele;
            }
            function createAndUsePersona(name, avatar) {
                if (personaShortcuts[name + ";" + avatar] === undefined) {
                    personaShortcuts[name + ";" + avatar] = createPersonaButton(name, avatar);
                }
                if (personaShortcuts[name + ";" + avatar].parentElement === null) {
                    personaBox.appendChild(personaShortcuts[name + ";" + avatar]);
                }
                setPersona(name, avatar, personaShortcuts[name + ";" + avatar]);
                while (personaBox.scrollHeight > personaBox.clientHeight) {
                    personaBox.removeChild(personaShortcutLastUsage.shift());
                }
            }
            PersonaManager.createAndUsePersona = createAndUsePersona;
            function addListener(listener) {
                changeTrigger.addListener(listener);
            }
            PersonaManager.addListener = addListener;
            function triggerListeners() {
                changeTrigger.trigger(currentPersonaName, currentPersonaAvatar);
                if (Server.Chat.isConnected()) {
                    sendPersonas();
                }
            }
            function sendPersonas() {
                Server.Chat.sendPersona({
                    persona: currentPersonaName,
                    avatar: currentPersonaAvatar
                });
            }
            PersonaManager.sendPersonas = sendPersonas;
            function setPersona(name, avatar, element) {
                if (currentElement !== null)
                    currentElement.classList.remove("active");
                var oldName = currentPersonaName;
                var oldAvatar = currentPersonaAvatar;
                if (currentElement === element) {
                    currentElement = null;
                    currentPersonaAvatar = null;
                    currentPersonaName = null;
                }
                else {
                    currentElement = element;
                    currentPersonaAvatar = avatar;
                    currentPersonaName = name;
                    currentElement.classList.add("active");
                    var index = personaShortcutLastUsage.indexOf(currentElement);
                    if (index !== -1) {
                        personaShortcutLastUsage.splice(index, 1);
                    }
                    personaShortcutLastUsage.push(currentElement);
                }
                if (oldName !== currentPersonaName || oldAvatar !== currentPersonaAvatar) {
                    triggerListeners();
                }
            }
            PersonaManager.setPersona = setPersona;
            function getPersonaName() {
                return currentPersonaName;
            }
            PersonaManager.getPersonaName = getPersonaName;
            function getPersonaAvatar() {
                return currentPersonaAvatar;
            }
            PersonaManager.getPersonaAvatar = getPersonaAvatar;
            function unsetPersona() {
                setPersona(null, null, currentElement);
            }
            PersonaManager.unsetPersona = unsetPersona;
        })(PersonaManager = Chat.PersonaManager || (Chat.PersonaManager = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
/// <reference path='PersonaManager.ts' />
var UI;
/// <reference path='PersonaManager.ts' />
(function (UI) {
    var Chat;
    (function (Chat) {
        var Forms;
        (function (Forms) {
            var formState = new ChatFormState(document.getElementById("chatMessageStateIcon"));
            var formInput = document.getElementById("chatMessageInput");
            var diceTower = document.getElementById("chatDiceTower");
            diceTower.addEventListener("click", function () {
                if (this.classList.contains("icons-chatDiceTowerOn")) {
                    this.classList.remove("icons-chatDiceTowerOn");
                    this.classList.add("icons-chatDiceTower");
                }
                else {
                    this.classList.add("icons-chatDiceTowerOn");
                    this.classList.remove("icons-chatDiceTower");
                }
            });
            var diceForm = document.getElementById("diceFormBox");
            diceForm.addEventListener("submit", function (e) {
                UI.Chat.Forms.rollDice();
                e.preventDefault();
            });
            var diceAmount = document.getElementById("chatDiceAmount");
            var diceFaces = document.getElementById("chatDiceFaces");
            var diceMod = document.getElementById("chatDiceMod");
            var diceReason = document.getElementById("chatDiceReason");
            document.getElementById("chatMessageSendButton").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Chat.Forms.sendMessage();
            });
            var typing = false;
            var afk = false;
            var focused = true;
            var inputKeyHandler = function (e) { UI.Chat.Forms.handleInputKeyboard(e); };
            formInput.addEventListener("keyup", inputKeyHandler);
            formInput.addEventListener("keydown", inputKeyHandler);
            formInput.addEventListener("keydown", function (e) { UI.Chat.Forms.handleInputKeypress(e); });
            var lastWhisperFrom = null;
            UI.Chat.PersonaManager.addListener({
                handleEvent: function (name, avatar) {
                    UI.Chat.Forms.updateFormState(name !== null);
                }
            });
            var olderTexts = [];
            var oldTextPosition = -1;
            function addOlderText() {
                var trimmed = formInput.value.trim();
                if (trimmed !== "") {
                    oldTextPosition = olderTexts.push(trimmed);
                }
            }
            Forms.addOlderText = addOlderText;
            function moveOlderText(direction) {
                if (oldTextPosition === olderTexts.length) {
                    var oldPos = oldTextPosition;
                    addOlderText();
                    oldTextPosition = oldPos;
                }
                oldTextPosition += direction;
                if (oldTextPosition < 0) {
                    oldTextPosition = 0;
                    if (olderTexts.length > 0)
                        formInput.value = olderTexts[oldTextPosition];
                }
                else if (oldTextPosition >= olderTexts.length) {
                    oldTextPosition = olderTexts.length;
                    formInput.value = "";
                }
                else {
                    formInput.value = olderTexts[oldTextPosition];
                }
            }
            Forms.moveOlderText = moveOlderText;
            function updateFormState(hasPersona) {
                if (hasPersona) {
                    formState.setState(ChatFormState.STATE_NORMAL);
                }
                else {
                    var room = UI.Chat.getRoom();
                    if (room !== null && room.getMe().isStoryteller()) {
                        formState.setState(ChatFormState.STATE_STORY);
                    }
                    else {
                        formState.setState(ChatFormState.STATE_OFF);
                    }
                }
            }
            Forms.updateFormState = updateFormState;
            function handleInputKeyboard(e) {
                setTyping(formInput.value !== "");
                if (e.shiftKey) {
                    formState.setState(ChatFormState.STATE_STORY);
                }
                else if (e.ctrlKey) {
                    if (UI.Chat.PersonaManager.getPersonaName() !== null) {
                        formState.setState(ChatFormState.STATE_ACTION);
                    }
                    else {
                        var room = UI.Chat.getRoom();
                        if (room !== null && room.getMe().isStoryteller()) {
                            formState.setState(ChatFormState.STATE_STORY);
                        }
                        else {
                            formState.setState(ChatFormState.STATE_OFF);
                        }
                    }
                }
                else if (e.altKey) {
                    formState.setState(ChatFormState.STATE_OFF);
                }
                else {
                    if (UI.Chat.PersonaManager.getPersonaName() !== null) {
                        formState.setState(ChatFormState.STATE_NORMAL);
                    }
                    else {
                        var room = UI.Chat.getRoom();
                        if (room !== null && room.getMe().isStoryteller()) {
                            formState.setState(ChatFormState.STATE_STORY);
                        }
                        else {
                            formState.setState(ChatFormState.STATE_OFF);
                        }
                    }
                }
                // Prevent alt from going to the browser
                if (e.keyCode === 18) {
                    e.preventDefault();
                }
            }
            Forms.handleInputKeyboard = handleInputKeyboard;
            function handleInputKeypress(e) {
                if (e.keyCode === 9) {
                    if (formInput.value === "") {
                        if (e.shiftKey) {
                            diceReason.focus();
                        }
                        else {
                            diceAmount.focus();
                        }
                    }
                    e.preventDefault();
                }
                // ENTER
                if (e.keyCode === 10 || e.keyCode === 13) {
                    UI.Chat.Forms.sendMessage();
                    e.preventDefault();
                    return;
                }
                // UP
                if (e.keyCode === 38) {
                    UI.Chat.Forms.moveOlderText(-1);
                    e.preventDefault();
                    return;
                }
                // DOWN
                if (e.keyCode === 40) {
                    UI.Chat.Forms.moveOlderText(1);
                    e.preventDefault();
                    return;
                }
                // ESC
                if (e.keyCode === 27) {
                    e.preventDefault();
                    return;
                }
                var trimmed = formInput.value.trim();
                // TAB to complete Whisper
                if (e.keyCode === 9) {
                    if (MessageFactory.getConstructorFromText(trimmed) === MessageWhisper) {
                        var room = UI.Chat.getRoom();
                        if (room !== null) {
                            var index = trimmed.indexOf(',');
                            var index2 = trimmed.indexOf(" ");
                            if (index2 === -1) {
                                var target = "";
                                var message = "";
                            }
                            else {
                                if (index !== -1) {
                                    var target = trimmed.substr(index2 + 1, (index - index2 - 1)).trim();
                                    var message = trimmed.substr(index + 1).trim();
                                }
                                else {
                                    var target = trimmed.substr(index2 + 1).trim();
                                    var message = "";
                                }
                            }
                            var users = room.getUsersByName(target);
                            if (users.length === 1) {
                                setInput("/whisper " + users[0].getUser().getFullNickname() + ", " + message);
                            }
                            else {
                                var error = new ChatSystemMessage(true);
                                if (users.length === 0) {
                                    error.addText("_CHATWHISPERNOTARGETSFOUND_");
                                    error.addLangVar("a", target);
                                }
                                else {
                                    var clickF = function () {
                                        UI.Chat.Forms.setInput("/whisper " + this.target + ", " + this.message);
                                    };
                                    error.addText("_CHATMULTIPLETARGETSFOUND_");
                                    error.addText(": ");
                                    for (var i = 0; i < users.length; i++) {
                                        var listener = {
                                            target: users[i].getUser().getFullNickname(),
                                            message: message,
                                            handleEvent: clickF
                                        };
                                        error.addTextLink(users[i].getUniqueNickname(), false, listener);
                                        if ((i + 1) < users.length) {
                                            error.addText(", ");
                                        }
                                        else {
                                            error.addText(".");
                                        }
                                    }
                                }
                                UI.Chat.printElement(error.getElement());
                            }
                        }
                    }
                }
                // Space and tab, for Reply
                if (e.keyCode === 9 || e.keyCode === 32) {
                    if (lastWhisperFrom !== null && MessageFactory.getConstructorFromText(trimmed) === SlashReply) {
                        setInput("/whisper " + lastWhisperFrom.getUniqueNickname() + ", ");
                    }
                }
            }
            Forms.handleInputKeypress = handleInputKeypress;
            function prependChatInput(what) {
                formInput.value = what + formInput.value;
            }
            Forms.prependChatInput = prependChatInput;
            function sendMessage() {
                var trimmed = formInput.value.trim();
                if (trimmed === "") {
                    var emptyMessage = new ChatSystemMessage(true);
                    emptyMessage.addText("_CHATEMPTYNOTALLOWED_");
                    UI.Chat.printElement(emptyMessage.getElement(), true);
                }
                else {
                    addOlderText();
                    var message = null;
                    if (trimmed.charAt(0) === "/") {
                        message = MessageFactory.createFromText(trimmed);
                    }
                    else {
                        if (formState.isNormal()) {
                            message = new MessageRoleplay();
                            message.receiveCommand("", trimmed);
                        }
                        else if (formState.isStory()) {
                            message = new MessageStory();
                            message.receiveCommand("/story", trimmed);
                        }
                        else if (formState.isAction()) {
                            message = new MessageAction();
                            message.receiveCommand("/me", trimmed);
                        }
                        else if (formState.isOff()) {
                            message = new MessageOff();
                            message.receiveCommand("/off", trimmed);
                        }
                    }
                    if (message !== null) {
                        message.findPersona();
                        UI.Chat.sendMessage(message);
                    }
                    formInput.value = "";
                }
            }
            Forms.sendMessage = sendMessage;
            function isTyping() {
                return typing;
            }
            Forms.isTyping = isTyping;
            function isFocused() {
                return focused;
            }
            Forms.isFocused = isFocused;
            function isAfk() {
                return afk;
            }
            Forms.isAfk = isAfk;
            function setTyping(newTyping) {
                if (typing !== newTyping) {
                    typing = newTyping;
                    sendStatus();
                }
            }
            Forms.setTyping = setTyping;
            function setFocused(newFocused) {
                if (focused !== newFocused) {
                    focused = newFocused;
                    sendStatus();
                }
            }
            Forms.setFocused = setFocused;
            function setAfk(newAfk) {
                if (afk !== newAfk) {
                    afk = newAfk;
                    sendStatus();
                }
            }
            Forms.setAfk = setAfk;
            function sendStatus() {
                Server.Chat.sendStatus({
                    afk: afk,
                    focused: focused,
                    typing: typing,
                    avatar: null,
                    persona: null
                });
            }
            function considerRedirecting(event) {
                if ((!event.ctrlKey && !event.altKey) || (event.ctrlKey && event.keyCode === 86)) {
                    if (UI.PageManager.getCurrentLeft() === UI.idChat) {
                        var focus = document.activeElement;
                        var focusTag = focus.tagName.toLowerCase();
                        if (focusTag !== "input" && focusTag !== "textarea" && focusTag !== "select" && focus.contentEditable !== "true") {
                            formInput.focus();
                        }
                    }
                }
            }
            Forms.considerRedirecting = considerRedirecting;
            function isDiceTower() {
                return diceTower.classList.contains("icons-chatDiceTowerOn");
            }
            Forms.isDiceTower = isDiceTower;
            function rollDice(faces) {
                var amount = parseInt(diceAmount.value);
                faces = faces === undefined ? parseInt(diceFaces.value) : faces;
                var mod = parseInt(diceMod.value);
                var reason = diceReason.value.trim();
                if (isNaN(amount))
                    amount = 1;
                if (isNaN(faces))
                    faces = 6;
                if (isNaN(mod))
                    mod = 0;
                var dice = new MessageDice();
                dice.findPersona();
                dice.setMsg(reason);
                dice.setMod(mod);
                dice.addDice(amount, faces);
                if (diceTower.classList.contains("icons-chatDiceTowerOn")) {
                    dice.addDestinationStorytellers(UI.Chat.getRoom());
                }
                UI.Chat.sendMessage(dice);
                diceReason.value = "";
            }
            Forms.rollDice = rollDice;
            function setInput(str) {
                formInput.value = str;
                formInput.focus();
            }
            Forms.setInput = setInput;
            function setLastWhisperFrom(user) {
                lastWhisperFrom = user;
            }
            Forms.setLastWhisperFrom = setLastWhisperFrom;
            // Redirect on keypress
            document.addEventListener("keypress", function (e) {
                UI.Chat.Forms.considerRedirecting(e);
            });
            // Redirect on Control + V
            document.addEventListener("keydown", function (e) {
                if (e.ctrlKey && e.keyCode === 86) {
                    UI.Chat.Forms.considerRedirecting(e);
                }
            });
            // Please don't go BACK on backspace, this is an application so this only happens on accident.
            document.addEventListener("keydown", function (e) {
                if (e.which === 8 && !$(e.target).is("input, textarea") && e.target.contentEditable !== "true") {
                    e.preventDefault();
                }
            });
            // Focused?
            window.addEventListener("focus", function () { UI.Chat.Forms.setFocused(true); });
            window.addEventListener("blur", function () { UI.Chat.Forms.setFocused(false); });
            // AFK?
            $(window).idle({
                onIdle: function () {
                    UI.Chat.Forms.setAfk(true);
                },
                onActive: function () {
                    UI.Chat.Forms.setAfk(false);
                },
                events: "mouseover mouseout click keypress mousedown mousemove blur focus",
                idle: 30000
            });
            // Bind dices
            var dices = [4, 6, 8, 10, 12, 20, 100];
            for (var i = 0; i < dices.length; i++) {
                document.getElementById("chatDiceD" + dices[i]).addEventListener("click", {
                    dice: dices[i],
                    handleEvent: function () {
                        UI.Chat.Forms.rollDice(this.dice);
                    }
                });
            }
        })(Forms = Chat.Forms || (Chat.Forms = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var Notification;
        (function (Notification) {
            var bar = document.getElementById("chatNotificationBar");
            while (bar.firstChild !== null)
                bar.removeChild(bar.firstChild);
            var reconnecting = new ChatNotificationIcon("icons-chatNotReconnecting", false);
            bar.appendChild(reconnecting.getElement());
            var disconnected = new ChatNotificationIcon("icons-chatNotDisconnected", true);
            disconnected.addText("_CHATDISCONNECTEDEXP_");
            bar.appendChild(disconnected.getElement());
            var icons = 0;
            function showReconnecting() {
                if (reconnecting.show()) {
                    icons++;
                    updateIcons();
                }
                hideDisconnected();
            }
            Notification.showReconnecting = showReconnecting;
            function hideReconnecting() {
                if (reconnecting.hide()) {
                    icons--;
                    updateIcons();
                }
            }
            Notification.hideReconnecting = hideReconnecting;
            function hideDisconnected() {
                if (disconnected.hide()) {
                    icons--;
                    updateIcons();
                }
            }
            Notification.hideDisconnected = hideDisconnected;
            function showDisconnected() {
                if (disconnected.show()) {
                    icons++;
                    updateIcons();
                }
                hideReconnecting();
            }
            Notification.showDisconnected = showDisconnected;
            function updateIcons() {
                if (icons === 0) {
                    bar.classList.remove("activeIcon");
                }
                else {
                    bar.classList.add("activeIcon");
                }
            }
        })(Notification = Chat.Notification || (Chat.Notification = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var Lingo;
        (function (Lingo) {
            var floater = document.getElementById("lingoFloater");
            var $floater = $(floater).draggable({
                containment: '#mainWindow',
                handle: '#lingoHandle'
            }).hide();
            document.getElementById("lingoMinus").addEventListener("click", function () { UI.Chat.Lingo.hide(); });
            document.getElementById("chatLingoButton").addEventListener("click", function () { UI.Chat.Lingo.open(); });
            var content = document.getElementById("lingoContent");
            function hide() {
                $floater.stop(true).fadeOut(Application.Config.getConfig("animTime").getValue());
            }
            Lingo.hide = hide;
            Server.Chat.Memory.registerChangeListener("Lingo", function () {
                UI.Chat.Lingo.update();
            });
            function open() {
                if (floater.style.display !== "none") {
                    hide();
                    return;
                }
                floater.style.left = "10px";
                floater.style.top = "10px";
                $floater.stop(true).fadeIn(Application.Config.getConfig("animTime").getValue());
                update();
            }
            Lingo.open = open;
            function empty() {
                while (content.firstChild !== null)
                    content.removeChild(content.firstChild);
            }
            function update() {
                if (floater.style.display === "none") {
                    return;
                }
                empty();
                if (Server.Chat.getRoom() === null) {
                    return;
                }
                var mem = Server.Chat.Memory.getConfiguration("Lingo");
                var users = mem.getUsers();
                var usersOrdered = Server.Chat.getRoom().getOrderedUserContexts();
                var languageNames = PseudoLanguage.getLanguageNames();
                for (var i = 0; i < usersOrdered.length; i++) {
                    if (usersOrdered[i].isStoryteller()) {
                        continue; // Storytellers have all languages
                    }
                    var row = document.createElement("div");
                    row.classList.add("lingoRow");
                    var b = document.createElement("b");
                    b.classList.add("lingoName");
                    row.appendChild(b);
                    b.appendChild(document.createTextNode(usersOrdered[i].getUniqueNickname() + ":"));
                    var lingos = users[usersOrdered[i].getUser().id];
                    if (lingos !== undefined) {
                        // Print current languages
                        for (var k = 0; k < lingos.length; k++) {
                            var a = document.createElement("a");
                            a.classList.add("lingoButton");
                            if (Server.Chat.getRoom().getMe().isStoryteller()) {
                                var span = document.createElement("span");
                                span.classList.add("textLink");
                                span.appendChild(document.createTextNode("(X)"));
                                span.addEventListener("click", {
                                    user: usersOrdered[i].getUser().id,
                                    lingo: lingos[k],
                                    handleEvent: function (e) {
                                        var mem = Server.Chat.Memory.getConfiguration("Lingo");
                                        mem.removeUserLingo(this.user, this.lingo);
                                    }
                                });
                                a.appendChild(span);
                            }
                            else if (Server.Chat.getRoom().getMe() === usersOrdered[i]) {
                                a.classList.add("clickable");
                                a.addEventListener("click", {
                                    lingo: lingos[k],
                                    handleEvent: function (e) {
                                        e.preventDefault();
                                        UI.Chat.Lingo.speakInTongues(this.lingo);
                                    }
                                });
                            }
                            a.appendChild(document.createTextNode(lingos[k]));
                            row.appendChild(a);
                        }
                        usersOrdered[i].getUser().isMe();
                    }
                    else {
                        row.appendChild(document.createTextNode("_CHATLINGONOLINGO_"));
                        row.classList.add("language");
                        UI.Language.updateElement(row);
                    }
                    if (Server.Chat.getRoom().getMe().isStoryteller()) {
                        // Print adder
                        var adder = document.createElement("div");
                        adder.classList.add("lingoAdder");
                        var select = document.createElement("select");
                        var lingoNames = PseudoLanguage.getLanguageNames();
                        for (var k = 0; k < lingoNames.length; k++) {
                            var option = document.createElement("option");
                            option.value = lingoNames[k];
                            option.appendChild(document.createTextNode(lingoNames[k]));
                            select.appendChild(option);
                        }
                        var a = document.createElement("a");
                        a.classList.add("textLink", "language");
                        a.appendChild(document.createTextNode("_LINGOADD_"));
                        UI.Language.updateElement(a);
                        adder.appendChild(select);
                        adder.appendChild(a);
                        row.appendChild(adder);
                        a.addEventListener("click", {
                            select: select,
                            user: usersOrdered[i].getUser().id,
                            handleEvent: function () {
                                var mem = Server.Chat.Memory.getConfiguration("Lingo");
                                mem.addUserLingo(this.user, this.select.value);
                            }
                        });
                    }
                    content.appendChild(row);
                }
                if (Server.Chat.getRoom().getMe().isStoryteller()) {
                    var lingos = PseudoLanguage.getLanguageNames();
                    var row = document.createElement("div");
                    row.classList.add("lingoRow");
                    var b = document.createElement("b");
                    b.classList.add("lingoName");
                    row.appendChild(b);
                    b.appendChild(document.createTextNode(Server.Chat.getRoom().getMe().getUniqueNickname() + ":"));
                    for (var k = 0; k < lingos.length; k++) {
                        var a = document.createElement("a");
                        a.classList.add("lingoButton");
                        a.classList.add("clickable");
                        a.appendChild(document.createTextNode(lingos[k]));
                        a.addEventListener("click", {
                            lingo: lingos[k],
                            handleEvent: function (e) {
                                e.preventDefault();
                                UI.Chat.Lingo.speakInTongues(this.lingo);
                            }
                        });
                        row.appendChild(a);
                    }
                    content.appendChild(row);
                }
            }
            Lingo.update = update;
            function speakInTongues(language) {
                UI.Chat.Forms.prependChatInput("/lingo " + language + ", ");
            }
            Lingo.speakInTongues = speakInTongues;
        })(Lingo = Chat.Lingo || (Chat.Lingo = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var Combat;
        (function (Combat) {
            var floater = document.getElementById("combatFloater");
            var $floater = $(floater).draggable({
                containment: '#mainWindow',
                handle: '#combatHandle'
            }).hide();
            document.getElementById("combatMinus").addEventListener("click", function () { UI.Chat.Combat.hide(); });
            document.getElementById("chatCombatButton").addEventListener("click", function () { UI.Chat.Combat.open(); });
            document.getElementById("combatAddSheet").addEventListener("click", function () { UI.Chat.Combat.addSheet(); });
            document.getElementById("combatNewRound").addEventListener("click", function () { UI.Chat.Combat.newRound(); });
            document.getElementById("combatNextTurn").addEventListener("click", function () { UI.Chat.Combat.nextTurn(); });
            document.getElementById("combatEndCombat").addEventListener("click", function () { UI.Chat.Combat.endCombat(); });
            var memory = Server.Chat.Memory.getConfiguration("Combat");
            var updFunction = function () { UI.Chat.Combat.update(); };
            memory.addTargetListener(updFunction);
            Server.Chat.Memory.registerChangeListener("Combat", updFunction);
            Server.Chat.addRoomListener(updFunction);
            DB.SheetDB.addChangeListener(function () {
                UI.Chat.Combat.updateSelects();
            });
            var content = document.getElementById("combatContent");
            var storyButtons = document.getElementById("combatStoryButtons");
            var userSelect = document.getElementById("combatSelectUser");
            var sheetSelect = document.getElementById("combatSelectSheet");
            function hide() {
                $floater.stop(true).fadeOut(Application.Config.getConfig("animTime").getValue());
            }
            Combat.hide = hide;
            function open() {
                if (floater.style.display !== "none") {
                    hide();
                    return;
                }
                floater.style.left = "10px";
                floater.style.top = "10px";
                $floater.stop(true).fadeIn(Application.Config.getConfig("animTime").getValue());
                update();
            }
            Combat.open = open;
            function empty() {
                while (content.firstChild !== null)
                    content.removeChild(content.firstChild);
            }
            function updateSelects() {
                if (storyButtons.style.display !== "none") {
                    var room = Server.Chat.getRoom();
                    while (userSelect.firstChild !== null)
                        userSelect.removeChild(userSelect.firstChild);
                    while (sheetSelect.firstChild !== null)
                        sheetSelect.removeChild(sheetSelect.firstChild);
                    var option = document.createElement("option");
                    option.value = "0";
                    option.appendChild(document.createTextNode("NPC"));
                    userSelect.appendChild(option);
                    var optGroups = {};
                    if (room !== null) {
                        var users = room.getOrderedUserContexts();
                        for (var i = 0; i < users.length; i++) {
                            if (!users[i].isStoryteller()) {
                                option = document.createElement("option");
                                option.value = users[i].getUser().id.toString();
                                option.appendChild(document.createTextNode(users[i].getUniqueNickname()));
                                userSelect.appendChild(option);
                            }
                        }
                        var sheets = DB.SheetDB.getSheetsByGame(room.getGame());
                        if (sheets.length === 0) {
                            option = document.createElement("option");
                            option.value = "0";
                            option.appendChild(document.createTextNode("_COMBATTRACKERNOSHEETS_"));
                            UI.Language.markLanguage(option);
                            sheetSelect.appendChild(option);
                        }
                        else {
                            for (var i = 0; i < sheets.length; i++) {
                                option = document.createElement("option");
                                option.value = sheets[i].getId();
                                option.appendChild(document.createTextNode(sheets[i].getName()));
                                var folderName = sheets[i].getFolder();
                                if (optGroups[folderName] == undefined) {
                                    optGroups[folderName] = document.createElement("optgroup");
                                    optGroups[folderName].label = (folderName == "" ?
                                        UI.Language.getLanguage().getLingo("_SHEETSNOFOLDERNAME_")
                                        :
                                            folderName);
                                    sheetSelect.appendChild(optGroups[folderName]);
                                }
                                optGroups[folderName].appendChild(option);
                            }
                        }
                    }
                }
            }
            Combat.updateSelects = updateSelects;
            function update() {
                if (floater.style.display !== "none") {
                    if (Server.Chat.getRoom() === null) {
                        hide();
                    }
                    else {
                        var me = Server.Chat.getRoom().getMe();
                        storyButtons.style.display = me.isStoryteller() ? "" : "none";
                        if (me.isStoryteller()) {
                            updateSelects();
                        }
                        empty();
                        var combatants = memory.getCombatants();
                        var turn = memory.getTurn();
                        if (combatants.length === 0) {
                            var div = document.createElement("div");
                            div.classList.add("combatRow");
                            var span = document.createElement("span");
                            span.classList.add("combatName", "language");
                            span.appendChild(document.createTextNode("_COMBATTRACKERNOCOMBATANTS_"));
                            div.appendChild(span);
                            UI.Language.updateElement(span);
                            content.appendChild(div);
                        }
                        else {
                            for (var i = 0; i < combatants.length; i++) {
                                var combatant = new ChatCombatRow(combatants[i], turn === i, memory.isTarget(combatants[i].id), me.isStoryteller());
                                content.appendChild(combatant.getHTML());
                            }
                        }
                    }
                }
            }
            Combat.update = update;
            function addSheet() {
                var user = Number(userSelect.value);
                var sheet = Number(sheetSelect.value);
                if (sheet !== 0) {
                    memory.addParticipant(DB.SheetDB.getSheet(sheet), user === 0 ? undefined : Server.Chat.getRoom().getUser(user).getUser());
                }
            }
            Combat.addSheet = addSheet;
            function announceTurn() {
                var turner = memory.getCurrentTurnOwner();
                var msg = new MessageSheetturn();
                msg.setSheetName(turner.name);
                msg.setOwnerId(turner.owner);
                msg.setSheetId(turner.id);
                UI.Chat.sendMessage(msg);
            }
            Combat.announceTurn = announceTurn;
            function newRound() {
                memory.incrementRound();
                announceTurn();
            }
            Combat.newRound = newRound;
            function nextTurn() {
                memory.incrementTurn();
                announceTurn();
            }
            Combat.nextTurn = nextTurn;
            function endCombat() {
                memory.endCombat();
                var msg = new ChatSystemMessage(true);
                msg.addText("_CHATCOMBATENDEDCOMBAT_");
                UI.Chat.printElement(msg.getElement());
            }
            Combat.endCombat = endCombat;
        })(Combat = Chat.Combat || (Chat.Combat = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var PersonaDesigner;
        (function (PersonaDesigner) {
            var $designerBox = $(document.getElementById("personaDesignerBox")).hide();
            var target = document.getElementById("personaDesignerHolder");
            document.getElementById("personaAddButton").addEventListener("click", function () { UI.Chat.PersonaDesigner.callSelf(); });
            document.getElementById("personaDesignerCloseButton").addEventListener("click", function () { UI.Chat.PersonaDesigner.close(); });
            var open = false;
            var currentRoom = null;
            var personaName = document.getElementById("personaDesignerNameInput");
            var personaAvatar = document.getElementById("personaDesignerAvatarInput");
            var personaChoices = {};
            var lastMemory = [];
            var savingTimeout;
            UI.Chat.addRoomChangedListener({
                handleEvent: function (e) {
                    UI.Chat.PersonaDesigner.setRoom(e);
                    UI.Chat.PersonaDesigner.loadMemory(function () { });
                }
            });
            document.getElementById("personaDesignerForm").addEventListener("submit", function (e) {
                UI.Chat.PersonaDesigner.createPersona();
                e.preventDefault();
            });
            function callSelf() {
                $designerBox.fadeIn(Application.Config.getConfig("animTime").getValue());
                open = true;
                setRoom(UI.Chat.getRoom());
            }
            PersonaDesigner.callSelf = callSelf;
            function close() {
                $designerBox.fadeOut(Application.Config.getConfig("animTime").getValue(), function () {
                    UI.Chat.PersonaDesigner.emptyOut();
                });
                open = false;
            }
            PersonaDesigner.close = close;
            function setRoom(room) {
                currentRoom = room;
                if (open) {
                    fillOut();
                }
            }
            PersonaDesigner.setRoom = setRoom;
            function fillOut(done) {
                if (done === void 0) { done = false; }
                if (savingTimeout != undefined) {
                    saveMemory(function () {
                        fillOut(done);
                    });
                    savingTimeout = undefined;
                }
                if (done == false) {
                    emptyOut();
                    loadMemory(function () {
                        fillOut(true);
                    });
                }
                if (done) {
                    for (var i = 0; i < lastMemory.length; i++) {
                        createPersona(lastMemory[i].name, lastMemory[i].avatar, false);
                    }
                }
            }
            PersonaDesigner.fillOut = fillOut;
            function emptyOut() {
                while (target.firstChild !== null)
                    target.removeChild(target.firstChild);
                personaChoices = {};
            }
            PersonaDesigner.emptyOut = emptyOut;
            function createPersona(name, avatar, savePersona) {
                name = name === undefined ? personaName.value.trim() : name;
                avatar = avatar === undefined ? personaAvatar.value.trim() : avatar;
                savePersona = savePersona === undefined ? true : savePersona == true;
                personaName.value = "";
                personaAvatar.value = "";
                personaName.focus();
                if (name === "") {
                    return;
                }
                if (avatar === "") {
                    avatar = null;
                }
                var choice = new ChatAvatarChoice(name, avatar);
                if (personaChoices[choice.id] === undefined) {
                    target.appendChild(choice.getHTML());
                    personaChoices[choice.id] = choice;
                    lastMemory.push({
                        name: choice.nameStr,
                        avatar: choice.avatarStr
                    });
                    if (savePersona) {
                        //saveMemory();
                        considerSaving();
                    }
                }
            }
            PersonaDesigner.createPersona = createPersona;
            function removeChoice(choice) {
                if (personaChoices[choice.id] !== undefined) {
                    target.removeChild(personaChoices[choice.id].getHTML());
                    delete (personaChoices[choice.id]);
                    lastMemory = [];
                    for (var id in personaChoices) {
                        lastMemory.push({
                            name: personaChoices[id].nameStr,
                            avatar: personaChoices[id].avatarStr
                        });
                    }
                    //saveMemory();
                    considerSaving();
                    UI.Chat.PersonaManager.clearPersona(choice.nameStr, choice.avatarStr);
                }
            }
            PersonaDesigner.removeChoice = removeChoice;
            function usePersona(name, avatar) {
                close();
                UI.Chat.PersonaManager.createAndUsePersona(name, avatar);
            }
            PersonaDesigner.usePersona = usePersona;
            function getMemoryString() {
                if (currentRoom === null) {
                    console.warn("[PERSONADESIGNER] Attempt to get memory string for null room.");
                    return "personaDesigner_0";
                }
                else {
                    return "personaDesigner_" + currentRoom.id;
                }
            }
            function loadMemory(done) {
                if (currentRoom == undefined) {
                    // empty room
                    lastMemory = [];
                    return;
                }
                //lastMemory = Application.LocalMemory.getMemory(getMemoryString(), []);
                var roomid = currentRoom.id;
                Server.Storage.requestPersonas(true, {
                    handleEvent: function (data) {
                        if (data != undefined && data[roomid] != undefined) {
                            lastMemory = data[roomid]; // array of {name : string, avatar : string}
                        }
                        else {
                            lastMemory = [];
                        }
                        done();
                    }
                }, {
                    handleEvent: function () {
                        printError(true);
                    }
                });
            }
            PersonaDesigner.loadMemory = loadMemory;
            function printError(load) {
                if (load === void 0) { load = true; }
                close();
                var msg = new ChatSystemMessage(true);
                if (load !== false) {
                    msg.addText("_CHATPERSONAFAILEDLOAD_");
                }
                else {
                    msg.addText("_CHATPERSONAFAILEDSAVE_");
                }
                UI.Chat.printElement(msg.getElement());
            }
            PersonaDesigner.printError = printError;
            function saveMemory(done) {
                lastMemory.sort(function (a, b) {
                    var na = a.name.toLowerCase().latinise();
                    var nb = b.name.toLowerCase().latinise();
                    if (na < nb)
                        return -1;
                    if (nb < na)
                        return 1;
                    na = (String(a.avatar).toLowerCase()).latinise();
                    nb = (String(b.avatar).toLowerCase()).latinise();
                    if (na < nb)
                        return -1;
                    if (nb < na)
                        return 1;
                    return 0;
                });
                //Application.LocalMemory.setMemory(getMemoryString(), lastMemory);
                var roomid = currentRoom.id;
                Server.Storage.requestPersonas(false, {
                    handleEvent: function (data) {
                        var oldStr = JSON.stringify(data);
                        if (data == undefined) {
                            data = {};
                        }
                        data[roomid] = lastMemory;
                        var newStr = JSON.stringify(data);
                        if (oldStr != newStr) {
                            Server.Storage.sendPersonas(data, {
                                handleEvent: function () {
                                    done();
                                }
                            }, {
                                handleEvent: function () {
                                    printError(false);
                                }
                            });
                        }
                        else {
                            done();
                        }
                    }
                }, {
                    handleEvent: function () {
                        printError(true);
                    }
                });
            }
            function considerSaving() {
                if (savingTimeout != undefined) {
                    clearTimeout(savingTimeout);
                }
                savingTimeout = setTimeout(function () {
                    saveMemory(function () { });
                    savingTimeout = undefined;
                }, 10 * 1000 // 10 seconds
                );
            }
        })(PersonaDesigner = Chat.PersonaDesigner || (Chat.PersonaDesigner = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Chat;
    (function (Chat) {
        var Filters;
        (function (Filters) {
            var filterWindow = document.getElementById("moodWindow");
            var moodButton = document.getElementById("chatMoodButton");
            moodButton.addEventListener("click", function () {
                UI.Chat.Filters.toggle();
            });
            Server.Chat.addRoomListener(function () {
                UI.Chat.Filters.updateButton();
            });
            var mem = Server.Chat.Memory.getConfiguration("Mood");
            mem.addChangeListener(function () {
                UI.Chat.Filters.updateEffects();
            });
            var cfg = Application.Config.getConfig("screeneffects");
            cfg.addChangeListener(function () {
                UI.Chat.Filters.updateEffects();
            });
            function toggle() {
                filterWindow.style.display = filterWindow.style.display === "" ? "none" : "";
            }
            Filters.toggle = toggle;
            function close() {
                filterWindow.style.display = "none";
            }
            Filters.close = close;
            function updateButton() {
                var room = Server.Chat.getRoom();
                if (room !== null) {
                    var me = room.getMe();
                    if (me.isStoryteller()) {
                        moodButton.style.display = "";
                        return;
                    }
                }
                moodButton.style.display = "none";
                UI.Chat.Filters.close();
            }
            Filters.updateButton = updateButton;
            function applyFilter(name) {
                var mem = Server.Chat.Memory.getConfiguration("Mood");
                mem.storeName(name);
                UI.Chat.Filters.close();
            }
            Filters.applyFilter = applyFilter;
            function removeEffects() {
                var w = UI.WindowManager.getWindow(UI.idMainWindow);
                for (var i = 0; i < MemoryFilter.names.length; i++) {
                    w.classList.remove(MemoryFilter.names[i]);
                }
            }
            function updateEffects() {
                removeEffects();
                if (cfg.getValue() && mem.getValue() !== "none") {
                    var w = UI.WindowManager.getWindow(UI.idMainWindow);
                    w.classList.add(mem.getValue());
                }
            }
            Filters.updateEffects = updateEffects;
            close();
            updateButton();
        })(Filters = Chat.Filters || (Chat.Filters = {}));
    })(Chat = UI.Chat || (UI.Chat = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Pica;
    (function (Pica) {
        var pictureWindow = document.getElementById("pictureWindow");
        var $pictureWindow = $(pictureWindow);
        var $loadingWindow = $(document.getElementById("pictureLoading"));
        function getPictureWindow() {
            return pictureWindow;
        }
        Pica.getPictureWindow = getPictureWindow;
        function loadImage(url) {
            url = Server.URL.fixURL(url);
            UI.Pica.Board.loadImage(url);
            callSelf();
        }
        Pica.loadImage = loadImage;
        function callSelf() {
            //$pictureWindow.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
            $pictureWindow.stop().animate({
                opacity: 1
            }, Application.Config.getConfig("animTime").getValue());
            $pictureWindow[0].style.pointerEvents = "auto";
        }
        Pica.callSelf = callSelf;
        function close() {
            $pictureWindow.stop().animate({
                opacity: 0
            }, Application.Config.getConfig("animTime").getValue());
            $pictureWindow[0].style.pointerEvents = "none";
        }
        Pica.close = close;
        function startLoading() {
            $loadingWindow.stop().fadeIn(Application.Config.getConfig("animTime").getValue());
        }
        Pica.startLoading = startLoading;
        function stopLoading() {
            $loadingWindow.stop().fadeOut(Application.Config.getConfig("animTime").getValue());
        }
        Pica.stopLoading = stopLoading;
    })(Pica = UI.Pica || (UI.Pica = {}));
})(UI || (UI = {}));
var PicaCanvasPoint = /** @class */ (function () {
    function PicaCanvasPoint() {
        this.x = 0;
        this.y = 0;
    }
    PicaCanvasPoint.prototype.setCoordinates = function (offsetX, offsetY) {
        var width = UI.Pica.Board.Canvas.getWidth();
        var height = UI.Pica.Board.Canvas.getHeight();
        this.x = Math.floor((offsetX * PicaCanvasPoint.precision) / width);
        this.y = Math.floor((offsetY * PicaCanvasPoint.precision) / height);
    };
    PicaCanvasPoint.prototype.setRelativeCoordinates = function (x, y) {
        this.x = x;
        this.y = y;
    };
    PicaCanvasPoint.prototype.getX = function () {
        var x = this.x * UI.Pica.Board.Canvas.getWidth() / PicaCanvasPoint.precision;
        return x;
    };
    PicaCanvasPoint.prototype.getY = function () {
        var y = this.y * UI.Pica.Board.Canvas.getHeight() / PicaCanvasPoint.precision;
        return y;
    };
    PicaCanvasPoint.prototype.distanceTo = function (p2) {
        var x1 = this.x;
        var x2 = p2.x;
        var y1 = this.y;
        var y2 = p2.y;
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    };
    PicaCanvasPoint.prototype.getRealDistanceTo = function (p2) {
        var x1 = this.getX();
        var x2 = p2.getX();
        var y1 = this.getY();
        var y2 = p2.getY();
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    };
    PicaCanvasPoint.isTriangle = function (p1, p2, p3) {
        var dab = p1.distanceTo(p2);
        var dbc = p2.distanceTo(p3);
        var dac = p1.distanceTo(p3);
        var triangle = !((dab + dbc) <= dac);
        if (!triangle)
            return false;
        var angle = Math.acos(((dab * dab) + (dac * dac) - (dbc * dbc)) / (2 * dac * dab));
        angle = angle * 180 / Math.PI;
        if (angle > (180 - PicaCanvasPoint.minCurve)) {
            return false; // "Not a triangle" by our own definition
        }
        return true;
    };
    PicaCanvasPoint.isEqual = function (p1, p2) {
        return p1.x == p2.x && p1.y == p2.y;
    };
    PicaCanvasPoint.prototype.exportAsString = function () {
        var str = PicaCanvasPoint.encode(this.x) + PicaCanvasPoint.encode(this.y);
        return str;
    };
    PicaCanvasPoint.prototype.updateFromString = function (str) {
        this.x = PicaCanvasPoint.decode(str.substr(0, 2));
        this.y = PicaCanvasPoint.decode(str.substr(2, 2));
    };
    /**
     * Encodes number "num" as a 2-character string.
     * Encodes from 0 to PicaCanvasPoint.encoding.length^PicaCanvasPoint.maxEncodedChars, so about 0 to 6000.
     * @param num
     * @returns {string}
     */
    PicaCanvasPoint.encode = function (num) {
        var maxChars = PicaCanvasPoint.maxEncodedChars;
        if (num > Math.pow(PicaCanvasPoint.encoding.length, maxChars)) {
            return "NaN";
        }
        if (num < 0)
            return "NaN";
        if (num < PicaCanvasPoint.length) {
            return PicaCanvasPoint.encoding[0] + PicaCanvasPoint.encoding.charAt(num);
        }
        else {
            var a = Math.floor(num / PicaCanvasPoint.encoding.length);
            var b = num - (a * PicaCanvasPoint.encoding.length);
            return PicaCanvasPoint.encoding.charAt(a) + PicaCanvasPoint.encoding.charAt(b);
        }
    };
    /**
     * Decodes a 2-character encoded string "str" to a number
     * @param str
     */
    PicaCanvasPoint.decode = function (str) {
        var a = PicaCanvasPoint.encoding.indexOf(str.charAt(0)) * PicaCanvasPoint.encoding.length;
        var b = PicaCanvasPoint.encoding.indexOf(str.charAt(1));
        return a + b;
        //return (encoding.indexOf(str.charAt(0)) * encoding.length) + encoding.indexOf(str.charAt(1));
    };
    PicaCanvasPoint.minCurve = 10; // The minimum angle between points before they're kept in the final encoded art
    PicaCanvasPoint.encoding = "0123456789abcdefghijklmnopqrstuvxwyzABCDEFGHIJKLMNOPQRSTUVXWYZ-+_=![]{}()*@/\\:;";
    PicaCanvasPoint.precision = Math.pow(PicaCanvasPoint.encoding.length, 2);
    PicaCanvasPoint.maxEncodedChars = 2;
    return PicaCanvasPoint;
}());
var PicaCanvasArt = /** @class */ (function () {
    function PicaCanvasArt() {
        this.userId = 0;
        this.specialValues = {}; // specialValues is a JSON string generated and read by the Pen
        this.points = [];
    }
    PicaCanvasArt.prototype.draw = function () {
        this.pen.drawFromArt(this);
    };
    PicaCanvasArt.prototype.setUserId = function (id) {
        this.userId = id;
    };
    PicaCanvasArt.prototype.getUserId = function () {
        return this.userId;
    };
    PicaCanvasArt.prototype.setSpecial = function (index, value) {
        this.specialValues[index] = value;
    };
    PicaCanvasArt.prototype.getSpecial = function (index, defValue) {
        if (this.specialValues[index] != undefined) {
            return this.specialValues[index];
        }
        return defValue;
    };
    PicaCanvasArt.prototype.exportAsObject = function () {
        var points = "";
        for (var i = 0; i < this.points.length; i++) {
            points += this.points[i].exportAsString();
        }
        return [
            this.userId,
            this.pen.id,
            this.specialValues,
            points
        ];
    };
    /**
     * Can throw errors
     * @param str
     * @returns {boolean}
     */
    PicaCanvasArt.prototype.importFromString = function (str) {
        var obj = JSON.parse(str);
        this.setUserId(obj[0]);
        this.setPen(PicaToolPen.getPen(obj[1]));
        this.specialValues = obj[2];
        //this.setPoints(obj[3]);
        this.importPointStrings(obj[3].match(/.{4}/g));
    };
    PicaCanvasArt.prototype.importPointStrings = function (a) {
        for (var i = 0; i < a.length; i++) {
            var point = new PicaCanvasPoint();
            point.updateFromString(a[i]);
            this.addPoint(point);
        }
    };
    PicaCanvasArt.prototype.setPen = function (pen) {
        this.pen = pen;
    };
    PicaCanvasArt.prototype.setValues = function (values) {
        this.specialValues = values;
    };
    PicaCanvasArt.prototype.setPoints = function (points) {
        this.points = points;
    };
    PicaCanvasArt.prototype.addPoint = function (point) {
        this.points.push(point);
    };
    PicaCanvasArt.prototype.cleanUpPoints = function () {
        var oldLength = this.points.length;
        var cleanedPoints = [];
        if (this.points.length > 0) {
            cleanedPoints.push(this.points[0]);
            var lastAdded = this.points[0];
            for (var i = 0; i < this.points.length; i++) {
                var p1 = this.points[i];
                if ((i + 1) == this.points.length) {
                    cleanedPoints.push(p1);
                }
                else {
                    var found = false;
                    // Remove repeated points
                    for (var k = this.points.length - 1; k >= 0; k--) {
                        if (k == i)
                            continue;
                        var p2 = this.points[k];
                        if (PicaCanvasPoint.isEqual(p1, p2)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found && PicaCanvasPoint.isTriangle(p1, lastAdded, this.points[i + 1])) {
                        lastAdded = p1;
                        cleanedPoints.push(p1);
                    }
                }
            }
        }
        this.points = cleanedPoints;
        console.debug(oldLength + " -> " + this.points.length + " = " + Math.round(this.points.length * 100 / oldLength) + "%");
    };
    PicaCanvasArt.prototype.redraw = function () {
        this.pen.drawFromArt(this);
    };
    return PicaCanvasArt;
}());
/// <reference path='PicaCanvasPoint.ts' />
/// <reference path='PicaCanvasArt.ts' />
var UI;
(function (UI) {
    var Pica;
    (function (Pica) {
        var Board;
        (function (Board) {
            var board = document.createElement("div");
            board.classList.add("pictureBoard");
            UI.Pica.getPictureWindow().appendChild(board);
            var currentUrl = "";
            var urlTrigger = new Trigger();
            Board._IMAGE_SCALING_FIT_NO_STRETCH = 0;
            Board._IMAGE_SCALING_FIT_STRETCH = 1;
            Board._IMAGE_SCALING_USE_RATIO = 2;
            var availHeight = 0;
            var availWidth = 0;
            var imageScaling = Board._IMAGE_SCALING_FIT_NO_STRETCH;
            var imageRatio = 2;
            var imageRatioRate = 0.12;
            var sizeTrigger = new Trigger();
            // Bind on resize to update height and width
            console.debug("[PicaBoard] Binding on window resize.");
            window.addEventListener("resize", function () {
                UI.Pica.Board.resize();
            });
            function isFit() { return imageScaling == Board._IMAGE_SCALING_FIT_NO_STRETCH || imageScaling == Board._IMAGE_SCALING_FIT_STRETCH; }
            Board.isFit = isFit;
            function isStretch() { return imageScaling == Board._IMAGE_SCALING_FIT_STRETCH; }
            Board.isStretch = isStretch;
            function getBoard() {
                return board;
            }
            Board.getBoard = getBoard;
            function getImageRatio() {
                return imageRatio;
            }
            Board.getImageRatio = getImageRatio;
            function loadImage(url) {
                resize();
                UI.Pica.Board.Canvas.clearCanvas();
                currentUrl = url;
                urlTrigger.trigger(url);
            }
            Board.loadImage = loadImage;
            function getUrl() {
                return currentUrl;
            }
            Board.getUrl = getUrl;
            function resize() {
                var oldString = availWidth + "x" + availHeight;
                availWidth = board.offsetWidth;
                availHeight = board.offsetHeight;
                var newString = availWidth + "x" + availHeight;
                if (newString != oldString) {
                    triggerSizeChange();
                }
            }
            Board.resize = resize;
            function getAvailHeight() {
                return availHeight;
            }
            Board.getAvailHeight = getAvailHeight;
            function getAvailWidth() {
                return availWidth;
            }
            Board.getAvailWidth = getAvailWidth;
            function addResizeListener(f) {
                sizeTrigger.addListenerIfMissing(f);
            }
            Board.addResizeListener = addResizeListener;
            function addUrlListener(f) {
                urlTrigger.addListenerIfMissing(f);
            }
            Board.addUrlListener = addUrlListener;
            function setImageScaling(num) {
                imageScaling = num;
                triggerSizeChange();
            }
            Board.setImageScaling = setImageScaling;
            function setRatio(ratio) {
                imageRatio = ratio;
                updateMinRatio();
                triggerSizeChange();
            }
            Board.setRatio = setRatio;
            function changeRatio(up) {
                if (imageScaling != Board._IMAGE_SCALING_USE_RATIO) {
                    if (imageScaling == Board._IMAGE_SCALING_FIT_STRETCH) {
                        imageRatio = UI.Pica.Board.Background.getMinRatio();
                    }
                    else {
                        var minRatio = UI.Pica.Board.Background.getMinRatio();
                        imageRatio = minRatio < 1 ? minRatio : 1;
                    }
                    imageScaling = Board._IMAGE_SCALING_USE_RATIO;
                }
                imageRatioRate = UI.Pica.Board.Background.getMinRatio() * 0.1; // Use rate relative to image size so that it isn't terribly slow for small images
                if (up) {
                    imageRatio += imageRatioRate;
                }
                else {
                    imageRatio -= imageRatioRate;
                }
                updateMinRatio();
                triggerSizeChange();
            }
            Board.changeRatio = changeRatio;
            function updateMinRatio() {
                var minRatio = UI.Pica.Board.Background.getMinRatio();
                minRatio = 1 < minRatio ? 1 : minRatio;
                if (imageRatio < minRatio) {
                    imageRatio = minRatio;
                }
            }
            Board.updateMinRatio = updateMinRatio;
            function getScaling() {
                return imageScaling;
            }
            Board.getScaling = getScaling;
            function resetRatio() {
                if (imageRatio != 1) {
                    imageRatio = 1;
                    triggerSizeChange();
                }
            }
            Board.resetRatio = resetRatio;
            function triggerSizeChange() {
                sizeTrigger.trigger();
            }
        })(Board = Pica.Board || (Pica.Board = {}));
    })(Pica = UI.Pica || (UI.Pica = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Pica;
    (function (Pica) {
        var Toolbar;
        (function (Toolbar) {
            var container = document.createElement("div");
            container.classList.add("pictureToolsContainer");
            UI.Pica.getPictureWindow().appendChild(container);
            var tools = [];
            function updateVisibility() {
                for (var i = 0; i < tools.length; i++) {
                    tools[i].updateVisibility();
                }
            }
            Toolbar.updateVisibility = updateVisibility;
            function registerTool(tool) {
                container.appendChild(tool.getHTML());
                tools.push(tool);
            }
            Toolbar.registerTool = registerTool;
        })(Toolbar = Pica.Toolbar || (Pica.Toolbar = {}));
    })(Pica = UI.Pica || (UI.Pica = {}));
})(UI || (UI = {}));
/// <reference path='Toolbar.ts' />
var PicaTool = /** @class */ (function () {
    function PicaTool() {
        this.a = document.createElement("a");
        this.selected = false;
        this.icon = "picaToolNone";
        this.a.classList.add("picaToolButton");
        this.a.addEventListener("click", {
            tool: this,
            handleEvent: function () {
                this.tool.onClick();
            }
        });
    }
    PicaTool.prototype.setIcon = function (icon) {
        this.icon = icon;
        this.updateIcon();
    };
    PicaTool.prototype.setSelected = function (selected) {
        this.selected = selected;
        this.updateIcon();
    };
    PicaTool.prototype.updateIcon = function () {
        if (this.selected) {
            this.a.classList.remove(this.icon);
            this.a.classList.add(this.icon + "Active");
        }
        else {
            this.a.classList.add(this.icon);
            this.a.classList.remove(this.icon + "Active");
        }
    };
    PicaTool.prototype.updateVisibility = function () {
        // If the icon needs to disappear when something happens (like not being a storyteller) it has to be added here
    };
    PicaTool.prototype.setLeftSide = function () {
        this.a.classList.remove("picaToolButton");
        this.a.classList.remove("rightPicaToolButton");
        this.a.classList.add("leftPicaToolButton");
    };
    PicaTool.prototype.setRightSide = function () {
        this.a.classList.remove("picaToolButton");
        this.a.classList.remove("leftPicaToolButton");
        this.a.classList.add("rightPicaToolButton");
    };
    PicaTool.prototype.setTitleLingo = function (str) {
        UI.Language.addLanguageTitle(this.a, str);
        UI.Language.markLanguage(this.a);
    };
    PicaTool.prototype.onClick = function () {
    };
    PicaTool.prototype.getHTML = function () {
        return this.a;
    };
    return PicaTool;
}());
var PicaToolPen = /** @class */ (function (_super) {
    __extends(PicaToolPen, _super);
    function PicaToolPen() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = "undefined";
        return _this;
    }
    PicaToolPen.prototype.mouseDown = function (point) {
        console.log(point.getX() + " - " + point.getY());
    };
    PicaToolPen.prototype.mouseUp = function (point) {
    };
    PicaToolPen.prototype.mouseMove = function (point) {
    };
    PicaToolPen.prototype.mouseOut = function () {
    };
    PicaToolPen.prototype.mouseWheel = function (up, point) {
    };
    PicaToolPen.prototype.redraw = function () { };
    PicaToolPen.prototype.drawFromArt = function (art) { };
    PicaToolPen.registerPen = function (id, pen) {
        PicaToolPen.Pens[id] = pen;
    };
    PicaToolPen.getPen = function (id) {
        if (PicaToolPen.Pens[id] != undefined) {
            return PicaToolPen.Pens[id];
        }
        console.error("[PicaToolPen] No pen for " + id + ".");
    };
    PicaToolPen.prototype.setSelected = function (selected) {
        this.selected = selected;
        this.updateIcon();
        this.updateCanvasClasses();
    };
    PicaToolPen.prototype.updateCanvasClasses = function () {
    };
    PicaToolPen.prototype.onClick = function () {
        UI.Pica.Board.Canvas.setPen(this);
    };
    PicaToolPen.Pens = {};
    return PicaToolPen;
}(PicaTool));
var UI;
(function (UI) {
    var Pica;
    (function (Pica) {
        var ArtManager;
        (function (ArtManager) {
            Server.Chat.addRoomListener(function () {
                UI.Pica.Board.Canvas.redraw();
            });
            function getLength(roomid, url) {
                return Application.LocalMemory.getMemoryLength(createIdString(roomid, url));
            }
            ArtManager.getLength = getLength;
            function getLengthByUser(roomid, url) {
                var art = getArt(roomid, url);
                var userArts = {};
                for (var i = 0; i < art.length; i++) {
                    if (userArts[art[i].getUserId()] == undefined) {
                        userArts[art[i].getUserId()] = 0;
                    }
                    userArts[art[i].getUserId()] += 1;
                }
                return userArts;
            }
            ArtManager.getLengthByUser = getLengthByUser;
            function addArt(art) {
                var room = Server.Chat.getRoom();
                var picaMemory = Server.Chat.Memory.getConfiguration("Pica");
                if (room != null && picaMemory.isPicaAllowed()) {
                    var roomid = room.id;
                    var url = UI.Pica.Board.getUrl();
                    includeArt(roomid, url, art);
                    var stringified = JSON.stringify(art.exportAsObject());
                    var msg = new MessagePica();
                    msg.setArtString(stringified);
                    msg.setUrl(url);
                    msg.setConfirmation(getLengthByUser(roomid, url));
                    UI.Chat.sendMessage(msg);
                }
                else {
                    UI.Pica.Board.Canvas.redraw();
                }
            }
            ArtManager.addArt = addArt;
            function getMyArtsAsString(roomid, url) {
                var art = getArt(roomid, url);
                var artStrings = [];
                for (var i = 0; i < art.length; i++) {
                    if (art[i].getUserId() == Application.getMyId()) {
                        artStrings.push(JSON.stringify(art[i].exportAsObject()));
                    }
                }
                return artStrings;
            }
            ArtManager.getMyArtsAsString = getMyArtsAsString;
            function getArt(roomid, url) {
                var oldArt = Application.LocalMemory.getMemory(createIdString(roomid, url), []);
                var instanced = [];
                for (var i = 0; i < oldArt.length; i++) {
                    try {
                        var newArt = new PicaCanvasArt();
                        newArt.importFromString(oldArt[i]);
                        instanced.push(newArt);
                    }
                    catch (e) {
                        console.warn("[UI.Pica.ArtManager] Unparsable Art at " + createIdString(roomid, url) + ". Skipping.");
                    }
                }
                return instanced;
            }
            ArtManager.getArt = getArt;
            function removeAllArts(roomid, url) {
                Application.LocalMemory.unsetMemory(createIdString(roomid, url));
                if (UI.Pica.Board.getUrl() == url) {
                    UI.Pica.Board.Canvas.redraw();
                }
            }
            ArtManager.removeAllArts = removeAllArts;
            function removeArtFromUser(userid, roomid, url) {
                var oldArt = getArt(roomid, url);
                var newArt = [];
                for (var i = 0; i < oldArt.length; i++) {
                    if (oldArt[i].getUserId() != userid) {
                        newArt.push(JSON.stringify(oldArt[i].exportAsObject()));
                    }
                }
                Application.LocalMemory.setMemory(createIdString(roomid, url), newArt);
                if (UI.Pica.Board.getUrl() == url) {
                    UI.Pica.Board.Canvas.redraw();
                }
            }
            ArtManager.removeArtFromUser = removeArtFromUser;
            function includeManyArts(roomid, url, arts) {
                var oldArt = Application.LocalMemory.getMemory(createIdString(roomid, url), []);
                for (var i = 0; i < arts.length; i++) {
                    var art = arts[i];
                    var stringified = JSON.stringify(art.exportAsObject());
                    if (oldArt.indexOf(stringified) == -1) {
                        oldArt.push(stringified);
                    }
                }
                Application.LocalMemory.setMemory(createIdString(roomid, url), oldArt);
                var currentUrl = UI.Pica.Board.getUrl();
                if (currentUrl == url) {
                    UI.Pica.Board.Canvas.redraw();
                }
            }
            ArtManager.includeManyArts = includeManyArts;
            function includeArt(roomid, url, art) {
                var oldArt = Application.LocalMemory.getMemory(createIdString(roomid, url), []);
                var stringified = JSON.stringify(art.exportAsObject());
                if (oldArt.indexOf(stringified) == -1) {
                    oldArt.push(stringified);
                    Application.LocalMemory.setMemory(createIdString(roomid, url), oldArt);
                    var currentUrl = UI.Pica.Board.getUrl();
                    if (currentUrl == url) {
                        UI.Pica.Board.Canvas.redraw();
                    }
                }
            }
            ArtManager.includeArt = includeArt;
            function createIdString(roomid, url) {
                return "art_" + roomid + "_" + url;
            }
        })(ArtManager = Pica.ArtManager || (Pica.ArtManager = {}));
    })(Pica = UI.Pica || (UI.Pica = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Pica;
    (function (Pica) {
        var Board;
        (function (Board) {
            var Background;
            (function (Background) {
                var img = document.createElement("img");
                img.style.zIndex = "1";
                img.style.position = "absolute";
                UI.Pica.Board.getBoard().appendChild(img);
                img.addEventListener("load", function () { UI.Pica.Board.Background.onLoad(); });
                UI.Pica.Board.addResizeListener(function () { UI.Pica.Board.Background.resize(); });
                UI.Pica.Board.addUrlListener(function (url) { UI.Pica.Board.Background.load(url); });
                var naturalWidth = 0;
                var naturalHeight = 0;
                var finalWidth = 0;
                var finalHeight = 0;
                var factor = 1;
                var loadTrigger = new Trigger();
                var sizeTrigger = new Trigger();
                function load(url) {
                    if (img.src === url) {
                        return;
                    }
                    img.style.opacity = "0";
                    UI.Pica.startLoading();
                    img.src = url;
                }
                Background.load = load;
                function addLoadListener(f) {
                    loadTrigger.addListenerIfMissing(f);
                }
                Background.addLoadListener = addLoadListener;
                function addSizeListener(f) {
                    sizeTrigger.addListenerIfMissing(f);
                }
                Background.addSizeListener = addSizeListener;
                function onLoad() {
                    if (!img.complete || (typeof img.naturalHeight === "undefined" || img.naturalHeight === 0)) {
                        return;
                    }
                    img.style.opacity = "1";
                    resize();
                    UI.Pica.stopLoading();
                    UI.Pica.Board.updateMinRatio();
                    loadTrigger.trigger();
                }
                Background.onLoad = onLoad;
                function getMinRatio() {
                    var maxWidth = UI.Pica.Board.getAvailWidth();
                    var maxHeight = UI.Pica.Board.getAvailHeight();
                    var fWidth = maxWidth / naturalWidth;
                    var fHeight = maxHeight / naturalHeight;
                    return (fWidth < fHeight ? fWidth : fHeight);
                }
                Background.getMinRatio = getMinRatio;
                function resize() {
                    var maxWidth = UI.Pica.Board.getAvailWidth();
                    var maxHeight = UI.Pica.Board.getAvailHeight();
                    if (typeof img.naturalHeight === "undefined" || img.naturalHeight === 0) {
                        return;
                    }
                    naturalWidth = img.naturalWidth;
                    naturalHeight = img.naturalHeight;
                    factor = 1;
                    if (UI.Pica.Board.isFit()) {
                        // If is supposed to stretch to fit, find max Factor
                        // If doesn't fit, find factor to fit
                        if (UI.Pica.Board.isStretch() || (naturalHeight > maxHeight || naturalWidth > maxWidth)) {
                            var fWidth = maxWidth / naturalWidth;
                            var fHeight = maxHeight / naturalHeight;
                            factor = fWidth < fHeight ? fWidth : fHeight;
                        }
                    }
                    else {
                        factor = UI.Pica.Board.getImageRatio();
                    }
                    finalWidth = naturalWidth * factor;
                    finalHeight = naturalHeight * factor;
                    img.width = finalWidth;
                    img.height = finalHeight;
                    if (finalWidth < maxWidth) {
                        img.style.left = ((maxWidth - finalWidth) / 2).toString() + "px";
                    }
                    else {
                        img.style.left = "";
                    }
                    if (finalHeight < maxHeight) {
                        img.style.top = ((maxHeight - finalHeight) / 2).toString() + "px";
                    }
                    else {
                        img.style.top = "";
                    }
                    sizeTrigger.trigger();
                }
                Background.resize = resize;
                function exportSizes() {
                    return {
                        height: img.height,
                        width: img.width,
                        left: img.style.left,
                        top: img.style.top
                    };
                }
                Background.exportSizes = exportSizes;
            })(Background = Board.Background || (Board.Background = {}));
        })(Board = Pica.Board || (Pica.Board = {}));
    })(Pica = UI.Pica || (UI.Pica = {}));
})(UI || (UI = {}));
/// <reference path='Background.ts' />
var UI;
/// <reference path='Background.ts' />
(function (UI) {
    var Pica;
    (function (Pica) {
        var Board;
        (function (Board) {
            var Canvas;
            (function (Canvas) {
                UI.Pica.Board.Background.addSizeListener(function () { UI.Pica.Board.Canvas.resize(); });
                var canvas = document.createElement("canvas");
                canvas.classList.add("picaCanvas");
                UI.Pica.Board.getBoard().appendChild(canvas);
                var context = canvas.getContext("2d");
                var picaMemory = Server.Chat.Memory.getConfiguration("Pica");
                picaMemory.addChangeListener(function () {
                    UI.Pica.Board.Canvas.setLocked();
                });
                var locked = picaMemory.isPicaAllowed();
                var lockedTrigger = new Trigger();
                var height = 0;
                var width = 0;
                var pen = new PicaToolPen();
                var penWidth = 1;
                var penColor = "000000";
                var penTrigger = new Trigger();
                var updatePenFunction = function () { UI.Pica.Toolbar.updateVisibility(); };
                lockedTrigger.addListenerIfMissing(updatePenFunction);
                Server.Chat.addRoomListener(updatePenFunction);
                function clearCanvas() {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }
                Canvas.clearCanvas = clearCanvas;
                function redraw() {
                    clearCanvas();
                    var room = Server.Chat.getRoom();
                    if (room != null) {
                        var roomid = room.id;
                        var url = UI.Pica.Board.getUrl();
                        var art = UI.Pica.ArtManager.getArt(roomid, url);
                        for (var i = 0; i < art.length; i++) {
                            art[i].redraw();
                        }
                    }
                    pen.redraw();
                }
                Canvas.redraw = redraw;
                function getCanvas() {
                    return canvas;
                }
                Canvas.getCanvas = getCanvas;
                function getCanvasContext() {
                    return context;
                }
                Canvas.getCanvasContext = getCanvasContext;
                function getHeight() {
                    return height;
                }
                Canvas.getHeight = getHeight;
                function getWidth() {
                    return width;
                }
                Canvas.getWidth = getWidth;
                function setLocked() {
                    locked = !picaMemory.isPicaAllowed();
                    if (locked) {
                        canvas.classList.add("locked");
                    }
                    else {
                        canvas.classList.remove("locked");
                    }
                    lockedTrigger.trigger();
                }
                Canvas.setLocked = setLocked;
                function addLockListener(f) {
                    lockedTrigger.addListenerIfMissing(f);
                }
                Canvas.addLockListener = addLockListener;
                function resize() {
                    var sizeObj = UI.Pica.Board.Background.exportSizes();
                    height = sizeObj.height;
                    width = sizeObj.width;
                    canvas.width = sizeObj.width;
                    canvas.height = sizeObj.height;
                    canvas.style.left = sizeObj.left;
                    canvas.style.top = sizeObj.top;
                    redraw();
                }
                Canvas.resize = resize;
                function mouseDown(point) {
                    pen.mouseDown(point);
                }
                Canvas.mouseDown = mouseDown;
                function mouseUp(point) {
                    pen.mouseUp(point);
                }
                Canvas.mouseUp = mouseUp;
                function mouseMove(point) {
                    pen.mouseMove(point);
                }
                Canvas.mouseMove = mouseMove;
                function mouseOut() {
                    pen.mouseOut();
                }
                Canvas.mouseOut = mouseOut;
                function mouseWheel(up, point) {
                    pen.mouseWheel(up, point);
                }
                Canvas.mouseWheel = mouseWheel;
                function setPen(newPen) {
                    pen.setSelected(false);
                    pen = newPen;
                    pen.setSelected(true);
                }
                Canvas.setPen = setPen;
                function addPenListener(f) {
                    penTrigger.addListenerIfMissing(f);
                }
                Canvas.addPenListener = addPenListener;
                function getPenWidth() {
                    return penWidth;
                }
                Canvas.getPenWidth = getPenWidth;
                function getPenColor() {
                    return penColor;
                }
                Canvas.getPenColor = getPenColor;
                function setPenWidth(newWidth) {
                    if (newWidth != penWidth) {
                        penWidth = newWidth;
                        penTrigger.trigger();
                    }
                }
                Canvas.setPenWidth = setPenWidth;
                function setPenColor(newColor) {
                    if (newColor != penColor) {
                        penColor = newColor;
                        penTrigger.trigger();
                    }
                }
                Canvas.setPenColor = setPenColor;
                // Binding Mouse on Canvas
                {
                    canvas.addEventListener("mousedown", {
                        handleEvent: function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var point = new PicaCanvasPoint();
                            point.setCoordinates(e.offsetX, e.offsetY);
                            UI.Pica.Board.Canvas.mouseDown(point);
                        }
                    });
                    canvas.addEventListener("mouseup", {
                        handleEvent: function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var point = new PicaCanvasPoint();
                            point.setCoordinates(e.offsetX, e.offsetY);
                            UI.Pica.Board.Canvas.mouseUp(point);
                        }
                    });
                    canvas.addEventListener("mousemove", {
                        handleEvent: function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var point = new PicaCanvasPoint();
                            point.setCoordinates(e.offsetX, e.offsetY);
                            UI.Pica.Board.Canvas.mouseMove(point);
                        }
                    });
                    canvas.addEventListener("mousewheel", {
                        handleEvent: function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var point = new PicaCanvasPoint();
                            point.setCoordinates(e.offsetX, e.offsetY);
                            var up = e.deltaY <= 0;
                            UI.Pica.Board.Canvas.mouseWheel(up, point);
                        }
                    });
                    canvas.addEventListener("mouseout", {
                        handleEvent: function (e) {
                            UI.Pica.Board.Canvas.mouseOut();
                        }
                    });
                }
            })(Canvas = Board.Canvas || (Board.Canvas = {}));
        })(Board = Pica.Board || (Pica.Board = {}));
    })(Pica = UI.Pica || (UI.Pica = {}));
})(UI || (UI = {}));
/// <reference path='Background.ts' />
/// <reference path='Canvas.ts' />
var PicaToolMove = /** @class */ (function (_super) {
    __extends(PicaToolMove, _super);
    function PicaToolMove() {
        var _this = _super.call(this) || this;
        _this.setIcon("icons-picaToolMove");
        _this.setTitleLingo("_PICAMOVE_");
        return _this;
    }
    PicaToolMove.prototype.mouseDown = function (point) {
        UI.Pica.Board.Canvas.getCanvas().classList.add("moving");
        this.lastPoint = point;
    };
    PicaToolMove.prototype.mouseUp = function (point) {
        this.mouseOut();
    };
    PicaToolMove.prototype.mouseMove = function (point) {
        if (this.lastPoint != null) {
            var xMovement = this.lastPoint.getX() - point.getX();
            var yMovement = this.lastPoint.getY() - point.getY();
            var board = UI.Pica.Board.getBoard();
            board.scrollLeft += xMovement;
            board.scrollTop += yMovement;
        }
    };
    PicaToolMove.prototype.mouseOut = function () {
        this.lastPoint = null;
        UI.Pica.Board.Canvas.getCanvas().classList.remove("moving");
    };
    PicaToolMove.prototype.mouseWheel = function (up, point) {
        var board = UI.Pica.Board.getBoard();
        var availScrollTop = board.scrollHeight - UI.Pica.Board.getAvailHeight();
        if (availScrollTop < 1)
            availScrollTop = 1;
        var availScrollLeft = board.scrollWidth - UI.Pica.Board.getAvailWidth();
        if (availScrollLeft < 1)
            availScrollLeft = 1;
        var relLeft = board.scrollLeft / availScrollLeft;
        var relTop = board.scrollTop / availScrollTop;
        UI.Pica.Board.changeRatio(up);
        var availScrollTop = board.scrollHeight - UI.Pica.Board.getAvailHeight();
        if (availScrollTop < 1)
            availScrollTop = 1;
        var availScrollLeft = board.scrollWidth - UI.Pica.Board.getAvailWidth();
        if (availScrollLeft < 1)
            availScrollLeft = 1;
        board.scrollLeft = availScrollLeft * relLeft;
        board.scrollTop = availScrollTop * relTop;
    };
    PicaToolMove.prototype.updateCanvasClasses = function () {
        if (this.selected) {
            UI.Pica.Board.Canvas.getCanvas().classList.add("move");
        }
        else {
            UI.Pica.Board.Canvas.getCanvas().classList.remove("move");
            UI.Pica.Board.Canvas.getCanvas().classList.remove("moving");
        }
    };
    return PicaToolMove;
}(PicaToolPen));
(function () {
    var move = new PicaToolMove();
    UI.Pica.Toolbar.registerTool(move);
    UI.Pica.Board.Canvas.setPen(move);
})();
var PicaToolPensil = /** @class */ (function (_super) {
    __extends(PicaToolPensil, _super);
    function PicaToolPensil() {
        var _this = _super.call(this) || this;
        _this.art = null;
        _this.lastPoint = null;
        _this.id = "pensil";
        _this.setIcon("icons-picaToolPensil");
        _this.setTitleLingo("_PICAPENSIL_");
        return _this;
    }
    PicaToolPensil.prototype.mouseDown = function (point) {
        this.art = new PicaCanvasArt();
        this.art.setUserId(Application.getMyId());
        this.art.addPoint(point);
        this.art.setSpecial("width", UI.Pica.Board.Canvas.getPenWidth());
        this.art.setSpecial("color", UI.Pica.Board.Canvas.getPenColor());
        this.art.setPen(this);
        this.beginDrawing(this.art);
    };
    PicaToolPensil.prototype.mouseMove = function (point) {
        if (this.art != null) {
            this.art.addPoint(point);
            this.drawTo(point);
            this.stroke();
        }
    };
    PicaToolPensil.prototype.mouseUp = function (point) {
        if (this.art != null) {
            this.art.addPoint(point);
            this.mouseOut();
        }
    };
    PicaToolPensil.prototype.mouseOut = function () {
        if (this.art != null) {
            var art = this.art;
            this.art = null;
            art.cleanUpPoints();
            UI.Pica.ArtManager.addArt(art);
        }
    };
    PicaToolPensil.prototype.beginDrawing = function (art) {
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = art.getSpecial("width", 1);
        ctx.strokeStyle = '#' + art.getSpecial("color", "000000");
        ctx.beginPath();
        var point = art.points[0];
        ctx.moveTo(point.getX(), point.getY());
        this.lastPoint = point;
    };
    PicaToolPensil.prototype.drawTo = function (point) {
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        var x = (point.getX() + this.lastPoint.getX()) / 2;
        var y = (point.getY() + this.lastPoint.getY()) / 2;
        ctx.lineTo(point.getX(), point.getY());
        ctx.moveTo(point.getX(), point.getY());
        this.lastPoint = point;
    };
    PicaToolPensil.prototype.stroke = function () {
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        ctx.stroke();
    };
    PicaToolPensil.prototype.redraw = function () {
        if (this.art != null) {
            this.beginDrawing(this.art);
            for (var i = 1; i < this.art.points.length; i++) {
                this.drawTo(this.art.points[i]);
                this.stroke();
            }
        }
    };
    PicaToolPensil.prototype.drawFromArt = function (art) {
        this.beginDrawing(art);
        for (var i = 1; i < art.points.length; i++) {
            this.drawTo(art.points[i]);
        }
        this.stroke();
    };
    PicaToolPensil.prototype.updateCanvasClasses = function () {
        if (this.selected) {
            UI.Pica.Board.Canvas.getCanvas().classList.add("draw");
        }
        else {
            UI.Pica.Board.Canvas.getCanvas().classList.remove("draw");
        }
    };
    return PicaToolPensil;
}(PicaToolPen));
(function () {
    var pensil = new PicaToolPensil();
    UI.Pica.Toolbar.registerTool(pensil);
    PicaToolPen.registerPen("pensil", pensil);
})();
var PicaToolRINE = /** @class */ (function (_super) {
    __extends(PicaToolRINE, _super);
    function PicaToolRINE() {
        var _this = _super.call(this) || this;
        _this.art = null;
        _this.lastPoint = null;
        _this.id = "rine";
        _this.setIcon("icons-picaToolRine");
        _this.setTitleLingo("_PICARINE_");
        return _this;
    }
    PicaToolRINE.prototype.mouseDown = function (point) {
        this.art = new PicaCanvasArt();
        this.art.setUserId(Application.getMyId());
        this.art.addPoint(point);
        this.art.setSpecial("width", UI.Pica.Board.Canvas.getPenWidth());
        this.art.setSpecial("color", UI.Pica.Board.Canvas.getPenColor());
        this.art.setPen(this);
        this.lastPoint = point;
    };
    PicaToolRINE.prototype.mouseMove = function (point) {
        if (this.art != null) {
            this.lastPoint = point;
            this.draw(this.art);
            UI.Pica.Board.Canvas.redraw();
        }
    };
    PicaToolRINE.prototype.mouseUp = function (point) {
        this.lastPoint = point;
        this.mouseOut();
    };
    PicaToolRINE.prototype.mouseOut = function () {
        if (this.art != null) {
            this.art.addPoint(this.lastPoint);
            var art = this.art;
            this.art = null;
            this.lastPoint = null;
            UI.Pica.ArtManager.addArt(art);
        }
    };
    PicaToolRINE.prototype.draw = function (art) {
        var p1 = art.points[0];
        var p2 = art.points.length > 1 ? art.points[1] : this.lastPoint != null ? this.lastPoint : p1;
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        ctx.lineWidth = art.getSpecial("width", 1);
        ctx.strokeStyle = '#' + art.getSpecial("color", "000000");
        ctx.beginPath();
        ctx.moveTo(p1.getX(), p1.getY());
        ctx.lineTo(p2.getX(), p2.getY());
        ctx.stroke();
        ctx.beginPath();
        var angle = Math.atan2(p2.getY() - p1.getY(), p2.getX() - p1.getX());
        ctx.moveTo(p2.getX(), p2.getY());
        var headlen = 10; // length of head in pixels
        ctx.lineTo(p2.getX() - headlen * Math.cos(angle - Math.PI / 7), p2.getY() - headlen * Math.sin(angle - Math.PI / 7));
        //path from the side point of the arrow, to the other side point
        ctx.lineTo(p2.getX() - headlen * Math.cos(angle + Math.PI / 7), p2.getY() - headlen * Math.sin(angle + Math.PI / 7));
        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        ctx.lineTo(p2.getX(), p2.getY());
        // the fuck is this?
        ctx.lineTo(p2.getX() - headlen * Math.cos(angle - Math.PI / 7), p2.getY() - headlen * Math.sin(angle - Math.PI / 7));
        // Draws arrows and fills them
        ctx.lineWidth = art.getSpecial("width", 1);
        ctx.strokeStyle = '#' + art.getSpecial("color", "000000");
        ctx.fillStyle = '#' + art.getSpecial("color", "000000");
        ctx.stroke();
        ctx.fill();
    };
    PicaToolRINE.prototype.redraw = function () {
        if (this.art != null) {
            this.draw(this.art);
        }
    };
    PicaToolRINE.prototype.drawFromArt = function (art) {
        this.draw(art);
    };
    PicaToolRINE.prototype.updateCanvasClasses = function () {
        if (this.selected) {
            UI.Pica.Board.Canvas.getCanvas().classList.add("draw");
        }
        else {
            UI.Pica.Board.Canvas.getCanvas().classList.remove("draw");
        }
    };
    return PicaToolRINE;
}(PicaToolPen));
(function () {
    var pensil = new PicaToolRINE();
    UI.Pica.Toolbar.registerTool(pensil);
    PicaToolPen.registerPen("rine", pensil);
})();
var PicaToolSircu = /** @class */ (function (_super) {
    __extends(PicaToolSircu, _super);
    function PicaToolSircu() {
        var _this = _super.call(this) || this;
        _this.art = null;
        _this.lastPoint = null;
        _this.id = "sircu";
        _this.setIcon("icons-picaToolSircu");
        _this.setTitleLingo("_PICASIRCU_");
        return _this;
    }
    PicaToolSircu.prototype.mouseDown = function (point) {
        this.art = new PicaCanvasArt();
        this.art.setUserId(Application.getMyId());
        this.art.addPoint(point);
        this.art.setSpecial("width", UI.Pica.Board.Canvas.getPenWidth());
        this.art.setSpecial("color", UI.Pica.Board.Canvas.getPenColor());
        this.art.setPen(this);
        this.lastPoint = point;
    };
    PicaToolSircu.prototype.mouseMove = function (point) {
        if (this.art != null) {
            this.lastPoint = point;
            this.draw(this.art);
            UI.Pica.Board.Canvas.redraw();
        }
    };
    PicaToolSircu.prototype.mouseUp = function (point) {
        this.lastPoint = point;
        this.mouseOut();
    };
    PicaToolSircu.prototype.mouseOut = function () {
        if (this.art != null) {
            this.art.addPoint(this.lastPoint);
            var art = this.art;
            this.art = null;
            this.lastPoint = null;
            UI.Pica.ArtManager.addArt(art);
        }
    };
    PicaToolSircu.prototype.draw = function (art) {
        var p1 = art.points[0];
        var p2 = art.points.length > 1 ? art.points[1] : this.lastPoint != null ? this.lastPoint : p1;
        var radius = Math.sqrt(Math.pow((p2.getX() - p1.getX()), 2) + Math.pow((p2.getY() - p1.getY()), 2));
        var centerX = p1.getX();
        var centerY = p1.getY();
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        ctx.lineWidth = art.getSpecial("width", 1);
        ctx.strokeStyle = '#' + art.getSpecial("color", "000000");
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.stroke();
    };
    PicaToolSircu.prototype.redraw = function () {
        if (this.art != null) {
            this.draw(this.art);
        }
    };
    PicaToolSircu.prototype.drawFromArt = function (art) {
        this.draw(art);
    };
    PicaToolSircu.prototype.updateCanvasClasses = function () {
        if (this.selected) {
            UI.Pica.Board.Canvas.getCanvas().classList.add("draw");
        }
        else {
            UI.Pica.Board.Canvas.getCanvas().classList.remove("draw");
        }
    };
    return PicaToolSircu;
}(PicaToolPen));
(function () {
    var pensil = new PicaToolSircu();
    UI.Pica.Toolbar.registerTool(pensil);
    PicaToolPen.registerPen("sircu", pensil);
})();
var PicaToolSqua = /** @class */ (function (_super) {
    __extends(PicaToolSqua, _super);
    function PicaToolSqua() {
        var _this = _super.call(this) || this;
        _this.art = null;
        _this.lastPoint = null;
        _this.id = "squa";
        _this.setIcon("icons-picaToolSqua");
        _this.setTitleLingo("_PICASQUA_");
        return _this;
    }
    PicaToolSqua.prototype.mouseDown = function (point) {
        this.art = new PicaCanvasArt();
        this.art.setUserId(Application.getMyId());
        this.art.addPoint(point);
        this.art.setSpecial("width", UI.Pica.Board.Canvas.getPenWidth());
        this.art.setSpecial("color", UI.Pica.Board.Canvas.getPenColor());
        this.art.setPen(this);
        this.lastPoint = point;
    };
    PicaToolSqua.prototype.mouseMove = function (point) {
        if (this.art != null) {
            this.lastPoint = point;
            this.draw(this.art);
            UI.Pica.Board.Canvas.redraw();
        }
    };
    PicaToolSqua.prototype.mouseUp = function (point) {
        this.lastPoint = point;
        this.mouseOut();
    };
    PicaToolSqua.prototype.mouseOut = function () {
        if (this.art != null) {
            this.art.addPoint(this.lastPoint);
            var art = this.art;
            this.art = null;
            this.lastPoint = null;
            UI.Pica.ArtManager.addArt(art);
        }
    };
    PicaToolSqua.prototype.draw = function (art) {
        var p1 = art.points[0];
        var p2 = art.points.length > 1 ? art.points[1] : this.lastPoint != null ? this.lastPoint : p1;
        var centerX = p1.getX();
        var centerY = p1.getY();
        var distX = Math.abs(p1.getX() - p2.getX());
        var distY = Math.abs(p1.getY() - p2.getY());
        var dist = distX > distY ? distX : distY;
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        ctx.lineWidth = art.getSpecial("width", 1);
        ctx.strokeStyle = '#' + art.getSpecial("color", "000000");
        ctx.beginPath();
        var s1 = [p1.getX() - dist, p1.getY() - dist];
        var s2 = [p1.getX() + dist, p1.getY() - dist];
        var s3 = [p1.getX() + dist, p1.getY() + dist];
        var s4 = [p1.getX() - dist, p1.getY() + dist];
        var square = [s1, s2, s3, s4];
        for (var i = 0; i < square.length; i++) {
            if (i == 0) {
                ctx.moveTo(square[i][0], square[i][1]);
            }
            else {
                ctx.lineTo(square[i][0], square[i][1]);
            }
        }
        ctx.lineTo(square[0][0], square[0][1]);
        ctx.stroke();
    };
    PicaToolSqua.prototype.redraw = function () {
        if (this.art != null) {
            this.draw(this.art);
        }
    };
    PicaToolSqua.prototype.drawFromArt = function (art) {
        this.draw(art);
    };
    PicaToolSqua.prototype.updateCanvasClasses = function () {
        if (this.selected) {
            UI.Pica.Board.Canvas.getCanvas().classList.add("draw");
        }
        else {
            UI.Pica.Board.Canvas.getCanvas().classList.remove("draw");
        }
    };
    return PicaToolSqua;
}(PicaToolPen));
(function () {
    var pensil = new PicaToolSqua();
    UI.Pica.Toolbar.registerTool(pensil);
    PicaToolPen.registerPen("squa", pensil);
})();
var PicaToolConu = /** @class */ (function (_super) {
    __extends(PicaToolConu, _super);
    function PicaToolConu() {
        var _this = _super.call(this) || this;
        _this.art = null;
        _this.lastPoint = null;
        _this.id = "conu";
        _this.setIcon("icons-picaToolConu");
        _this.setTitleLingo("_PICACONU_");
        return _this;
    }
    PicaToolConu.prototype.mouseDown = function (point) {
        this.art = new PicaCanvasArt();
        this.art.setUserId(Application.getMyId());
        this.art.addPoint(point);
        this.art.setSpecial("width", UI.Pica.Board.Canvas.getPenWidth());
        this.art.setSpecial("color", UI.Pica.Board.Canvas.getPenColor());
        this.art.setPen(this);
        this.lastPoint = point;
    };
    PicaToolConu.prototype.mouseMove = function (point) {
        if (this.art != null) {
            this.lastPoint = point;
            this.draw(this.art);
            UI.Pica.Board.Canvas.redraw();
        }
    };
    PicaToolConu.prototype.mouseUp = function (point) {
        this.lastPoint = point;
        this.mouseOut();
    };
    PicaToolConu.prototype.mouseOut = function () {
        if (this.art != null) {
            this.art.addPoint(this.lastPoint);
            var art = this.art;
            this.art = null;
            this.lastPoint = null;
            UI.Pica.ArtManager.addArt(art);
        }
    };
    PicaToolConu.prototype.draw = function (art) {
        var p1 = art.points[0];
        var p2 = art.points.length > 1 ? art.points[1] : this.lastPoint != null ? this.lastPoint : p1;
        var ctx = UI.Pica.Board.Canvas.getCanvasContext();
        ctx.lineWidth = art.getSpecial("width", 1);
        ctx.strokeStyle = '#' + art.getSpecial("color", "000000");
        ctx.beginPath();
        // Draw triangle
        var triangleHeight = p1.getRealDistanceTo(p2);
        var sideLength = (triangleHeight * 2) / Math.sqrt(3);
        var angle = Math.atan2(p1.getY() - p2.getY(), p1.getX() - p2.getX());
        ctx.moveTo(p1.getX(), p1.getY());
        ctx.lineTo(p1.getX() - sideLength * Math.cos(angle - Math.PI / 6), p1.getY() - sideLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(p1.getX() - sideLength * Math.cos(angle + Math.PI / 6), p1.getY() - sideLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(p1.getX(), p1.getY());
        ctx.stroke();
    };
    PicaToolConu.prototype.redraw = function () {
        if (this.art != null) {
            this.draw(this.art);
        }
    };
    PicaToolConu.prototype.drawFromArt = function (art) {
        this.draw(art);
    };
    PicaToolConu.prototype.updateCanvasClasses = function () {
        if (this.selected) {
            UI.Pica.Board.Canvas.getCanvas().classList.add("draw");
        }
        else {
            UI.Pica.Board.Canvas.getCanvas().classList.remove("draw");
        }
    };
    return PicaToolConu;
}(PicaToolPen));
(function () {
    var pensil = new PicaToolConu();
    UI.Pica.Toolbar.registerTool(pensil);
    PicaToolPen.registerPen("conu", pensil);
})();
var PicaToolColor = /** @class */ (function (_super) {
    __extends(PicaToolColor, _super);
    function PicaToolColor() {
        var _this = _super.call(this) || this;
        _this.a = document.createElement("input");
        _this.a.id = "colopica";
        _this.a.type = "color";
        _this.a.addEventListener("change", function () {
            UI.Pica.Board.Canvas.setPenColor(this.value.substr(1));
        });
        UI.Pica.Board.Canvas.addPenListener({
            a: _this.a,
            handleEvent: function () {
                this.a.value = "#" + UI.Pica.Board.Canvas.getPenColor();
            }
        });
        _this.setTitleLingo("_PICACOLOR_");
        return _this;
    }
    return PicaToolColor;
}(PicaTool));
UI.Pica.Toolbar.registerTool(new PicaToolColor());
var PicaToolShare = /** @class */ (function (_super) {
    __extends(PicaToolShare, _super);
    function PicaToolShare() {
        var _this = _super.call(this) || this;
        _this.setIcon("icons-picaToolShare");
        _this.setLeftSide();
        _this.setTitleLingo("_PICASHARE_");
        return _this;
    }
    PicaToolShare.prototype.onClick = function () {
        var url = UI.Pica.Board.getUrl();
        var newImage = new MessageImage();
        newImage.findPersona();
        newImage.setName("Pica"); // WE don't hold on to the name, so this is not possibru!
        newImage.setMsg(url);
        UI.Chat.sendMessage(newImage);
    };
    return PicaToolShare;
}(PicaTool));
var PicaToolLock = /** @class */ (function (_super) {
    __extends(PicaToolLock, _super);
    function PicaToolLock() {
        var _this = _super.call(this) || this;
        _this.lockedIcon = "icons-picaToolLockLocked";
        _this.unlockedIcon = "icons-picaToolLockUnlocked";
        _this.setIcon(_this.lockedIcon);
        _this.setRightSide();
        _this.setTitleLingo("_PICALOCK_");
        return _this;
    }
    PicaToolLock.prototype.updateVisibility = function () {
        var m = Server.Chat.Memory.getConfiguration("Pica");
        if (m.isPicaAllowed()) {
            this.a.classList.add(this.unlockedIcon);
            this.a.classList.remove(this.lockedIcon);
        }
        else {
            this.a.classList.add(this.lockedIcon);
            this.a.classList.remove(this.unlockedIcon);
        }
    };
    PicaToolLock.prototype.onClick = function () {
        var room = Server.Chat.getRoom();
        if (room != null) {
            var me = room.getMe();
            if (me.isStoryteller()) {
                var m = Server.Chat.Memory.getConfiguration("Pica");
                m.picaAllowedStore(!m.isPicaAllowed());
            }
        }
    };
    return PicaToolLock;
}(PicaTool));
UI.Pica.Toolbar.registerTool(new PicaToolLock());
var PicaToolClean = /** @class */ (function (_super) {
    __extends(PicaToolClean, _super);
    function PicaToolClean() {
        var _this = _super.call(this) || this;
        _this.setIcon("icons-picaToolClean");
        _this.setRightSide();
        _this.setTitleLingo("_PICACLEAN_");
        return _this;
    }
    PicaToolClean.prototype.onClick = function () {
        var msg = new MessagePica();
        var url = UI.Pica.Board.getUrl();
        msg.setUrl(url);
        msg.setCleanArts(true);
        UI.Chat.sendMessage(msg);
    };
    return PicaToolClean;
}(PicaTool));
UI.Pica.Toolbar.registerTool(new PicaToolClean());
var PicaToolScaling = /** @class */ (function (_super) {
    __extends(PicaToolScaling, _super);
    function PicaToolScaling() {
        var _this = _super.call(this) || this;
        _this.scaling = -1;
        _this.ratio = 1;
        UI.Pica.Board.addResizeListener({
            scaler: _this,
            handleEvent: function () {
                this.scaler.updateEquality();
            }
        });
        return _this;
    }
    PicaToolScaling.prototype.onClick = function () {
        UI.Pica.Board.setImageScaling(this.scaling);
        if (this.scaling == UI.Pica.Board._IMAGE_SCALING_USE_RATIO) {
            UI.Pica.Board.setRatio(this.ratio);
        }
    };
    PicaToolScaling.prototype.updateEquality = function () {
        var cS = UI.Pica.Board.getScaling();
        if (this.scaling == UI.Pica.Board._IMAGE_SCALING_USE_RATIO && cS == this.scaling) {
            this.setSelected(UI.Pica.Board.getImageRatio() == this.ratio);
        }
        else {
            this.setSelected(cS == this.scaling);
        }
    };
    return PicaToolScaling;
}(PicaTool));
var PicaToolScaling0 = /** @class */ (function (_super) {
    __extends(PicaToolScaling0, _super);
    function PicaToolScaling0() {
        var _this = _super.call(this) || this;
        _this.scaling = UI.Pica.Board._IMAGE_SCALING_FIT_NO_STRETCH;
        _this.setIcon("icons-picaToolRatio1Fit");
        _this.setTitleLingo("_PICASCALEFITNOSTRETCH_");
        return _this;
    }
    return PicaToolScaling0;
}(PicaToolScaling));
UI.Pica.Toolbar.registerTool(new PicaToolScaling0());
var PicaToolScaling1 = /** @class */ (function (_super) {
    __extends(PicaToolScaling1, _super);
    function PicaToolScaling1() {
        var _this = _super.call(this) || this;
        _this.scaling = UI.Pica.Board._IMAGE_SCALING_FIT_STRETCH;
        _this.setIcon("icons-picaToolFit");
        _this.setTitleLingo("_PICASCALEFITSTRETCH_");
        return _this;
    }
    return PicaToolScaling1;
}(PicaToolScaling));
UI.Pica.Toolbar.registerTool(new PicaToolScaling1());
var PicaToolScaling2 = /** @class */ (function (_super) {
    __extends(PicaToolScaling2, _super);
    function PicaToolScaling2() {
        var _this = _super.call(this) || this;
        _this.scaling = UI.Pica.Board._IMAGE_SCALING_USE_RATIO;
        _this.ratio = 1;
        _this.setIcon("icons-picaToolRatio1");
        _this.setTitleLingo("_PICASCALERATIO1_");
        return _this;
    }
    return PicaToolScaling2;
}(PicaToolScaling));
UI.Pica.Toolbar.registerTool(new PicaToolScaling2());
/// <reference path='../PicaTool.ts' />
/// <reference path='../PicaToolPen.ts' />
/// <reference path='PicaToolMove.ts' />
/// <reference path='PicaToolPensil.ts' />
/// <reference path='PicaToolRINE.ts' />
/// <reference path='PicaToolSircu.ts' />
/// <reference path='PicaToolSqua.ts' />
/// <reference path='PicaToolConu.ts' />
/// <reference path='PicaToolColor.ts' />
/// <reference path='PicaToolShare.ts' />
/// <reference path='PicaToolLock.ts' />
/// <reference path='PicaToolClean.ts' />
/// <reference path='PicaToolScaling.ts' />
/// <reference path='PicaToolScaling0.ts' />
/// <reference path='PicaToolScaling1.ts' />
/// <reference path='PicaToolScaling2.ts' />
/// <reference path='Classes/References.ts' />
/// <reference path='Board.ts' />
/// <reference path='Toolbar.ts' />
/// <reference path='PicaTool.ts' />
/// <reference path='PicaToolPen.ts' />
/// <reference path='ArtManager.ts' />
/// <reference path='Board/References.ts' />
/// <reference path='Tool/References.ts' />
var UI;
(function (UI) {
    var Sounds;
    (function (Sounds) {
        document.getElementById("soundsButton").addEventListener("click", function () { UI.Sounds.callSelf(); });
        document.getElementById("dropboxSoundsButton").addEventListener("click", function () { UI.Sounds.callDropbox(); });
        var bgmInput = document.getElementById("dropboxSoundsIsBGM");
        var folderInput = document.getElementById("dropboxFolderName");
        var target = document.getElementById("soundsTarget");
        var loadError = document.getElementById("soundsLoadError");
        var saveError = document.getElementById("soundsSaveError");
        target.removeChild(saveError);
        target.removeChild(loadError);
        var autoFolder = null;
        function emptyTarget() {
            while (target.firstChild !== null) {
                target.removeChild(target.lastChild);
            }
        }
        function callSelf() {
            UI.PageManager.callPage(UI.idSounds);
            var cbs = { handleEvent: function () {
                    UI.Sounds.printSounds();
                } };
            var cbe = { handleEvent: function (data) {
                    UI.Sounds.printError(data, true);
                } };
            Server.Storage.requestSounds(cbs, cbe);
        }
        Sounds.callSelf = callSelf;
        function printSounds() {
            emptyTarget();
            var sounds = DB.SoundDB.getSoundsByFolder();
            for (var i = 0; i < sounds.length; i++) {
                var folder = new SoundsFolder(sounds[i]);
                if (folder.getName() === autoFolder) {
                    folder.open();
                }
                target.appendChild(folder.getHTML());
            }
            autoFolder = null;
        }
        Sounds.printSounds = printSounds;
        function stayInFolder(name) {
            autoFolder = name;
        }
        Sounds.stayInFolder = stayInFolder;
        function printError(data, onLoad) {
            emptyTarget();
            if (onLoad) {
                target.appendChild(loadError);
            }
            else {
                target.appendChild(saveError);
            }
        }
        Sounds.printError = printError;
        function callDropbox() {
            var options = {
                success: function (files) {
                    UI.Sounds.addDropbox(files);
                },
                linkType: "preview",
                multiselect: true,
                extensions: ['audio'],
            };
            Dropbox.choose(options);
        }
        Sounds.callDropbox = callDropbox;
        function addDropbox(files) {
            var intendedFolder = folderInput.value.trim();
            folderInput.value = "";
            var folders = [];
            var links = [];
            for (var i = 0; i < files.length; i++) {
                var originalName = files[i]['name'].substring(0, files[i]['name'].lastIndexOf('.'));
                ;
                var originalUrl = Server.URL.fixURL(files[i]['link']);
                var name;
                var folderName;
                var hiphenPos = originalName.indexOf("-");
                if (intendedFolder !== "") {
                    folderName = intendedFolder;
                    name = originalName.trim();
                }
                else if (hiphenPos === -1) {
                    folderName = "";
                    name = originalName.trim();
                }
                else {
                    folderName = originalName.substr(0, hiphenPos).trim();
                    name = originalName.substr(hiphenPos + 1, originalName.length - (hiphenPos + 1)).trim();
                }
                var link = new SoundLink(name, originalUrl, folderName, bgmInput.checked);
                links.push(link);
                if (folders.indexOf(folderName) === -1) {
                    folders.push(folderName);
                }
            }
            DB.SoundDB.addSounds(links);
            if (folders.length === 1) {
                autoFolder = folders[0];
            }
            else {
                autoFolder = null;
            }
            printSounds();
        }
        Sounds.addDropbox = addDropbox;
    })(Sounds = UI.Sounds || (UI.Sounds = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Styles;
    (function (Styles) {
        document.getElementById("sheetsStyleButton").addEventListener("click", function () { UI.Styles.callSelf(); });
        var target = document.getElementById("styleListTarget");
        function callSelf() {
            UI.PageManager.callPage(UI.idStyles);
            var cbs = {
                handleEvent: function (styles) {
                    UI.Styles.printStyles(styles);
                }
            };
            Server.Sheets.updateStyles(cbs);
        }
        Styles.callSelf = callSelf;
        function emptyTarget() {
            while (target.firstChild)
                target.removeChild(target.firstChild);
        }
        Styles.emptyTarget = emptyTarget;
        function printStyles(styles) {
            emptyTarget();
            // %p.mainWindowParagraph.language.textLink.hoverable
            for (var i = 0; i < styles.length; i++) {
                if (styles[i].name.indexOf("RedPG1") !== -1) {
                    continue;
                }
                var p = document.createElement("p");
                p.classList.add("mainWindowParagraph");
                p.classList.add("hoverable");
                p.classList.add("textLink");
                p.appendChild(document.createTextNode(styles[i].name));
                p.addEventListener("click", {
                    id: styles[i].id,
                    handleEvent: function () {
                        UI.Styles.StyleDesigner.callSelf(this.id);
                    }
                });
                target.appendChild(p);
            }
        }
        Styles.printStyles = printStyles;
    })(Styles = UI.Styles || (UI.Styles = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Styles;
    (function (Styles) {
        var StyleDesigner;
        (function (StyleDesigner) {
            var nameInput = document.getElementById("styleEditorName");
            var publicStyleInput = document.getElementById("styleEditorPublic");
            var gameSelect = document.getElementById("styleEditorGameSelect");
            var copySelect = document.getElementById("styleEditorCopySelect");
            var remainInput = document.getElementById("styleEditorRemain");
            var htmlInput = document.getElementById("styleEditorHTML");
            var cssInput = document.getElementById("styleEditorCSS");
            var jsInput = document.getElementById("styleEditorJS");
            var publicCodeInput = document.getElementById("styleEditorPublicCode");
            var publicStyleLabel = document.getElementById("styleEditorPublicLabel");
            var copyLabel = document.getElementById("styleEditorCopyLabel");
            var gameLabel = document.getElementById("styleEditorGameLabel");
            var remainLabel = document.getElementById("styleEditorRemainLabel");
            var currentStyle = null;
            document.getElementById("styleEditorCopyButton").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Styles.StyleDesigner.copy();
            });
            document.getElementById("styleEditorForm").addEventListener("submit", function (e) {
                e.preventDefault();
                UI.Styles.StyleDesigner.submit();
            });
            document.getElementById("stylesNewStyleButton").addEventListener("click", function (e) {
                e.preventDefault();
                UI.Styles.StyleDesigner.callSelf();
            });
            function empty() {
                nameInput.value = "";
                htmlInput.value = "";
                cssInput.value = "";
                jsInput.value = "";
                publicCodeInput.value = "";
                publicStyleInput.checked = false;
            }
            function emptyGameSelect() {
                while (gameSelect.firstChild !== null)
                    gameSelect.removeChild(gameSelect.firstChild);
            }
            function callSelf(id) {
                UI.PageManager.callPage(UI.idStyleDesigner);
                if (Application.getMe().isAdmin()) {
                    publicStyleLabel.style.display = "";
                }
                else {
                    publicStyleLabel.style.display = "none";
                }
                var games = DB.GameDB.getOrderedGameList();
                if (games.length < 1) {
                    emptyGameSelect();
                    var option = document.createElement("option");
                    option.value = "0";
                    gameSelect.appendChild(option);
                    gameSelect.value = "0";
                    gameLabel.style.display = "none";
                }
                else {
                    gameLabel.style.display = "";
                    emptyGameSelect();
                    for (var i = 0; i < games.length; i++) {
                        var game = games[i];
                        var option = document.createElement("option");
                        option.value = game.getId().toString();
                        option.appendChild(document.createTextNode(game.getName()));
                        gameSelect.appendChild(option);
                    }
                }
                var styles = DB.StyleDB.getStyles();
                copyLabel.style.display = "none";
                while (copySelect.firstChild !== null)
                    copySelect.removeChild(copySelect.firstChild);
                for (var i = 0; i < styles.length; i++) {
                    var style = styles[i];
                    if (id !== undefined && style.id.toString() === id.toString())
                        continue;
                    copyLabel.style.display = "";
                    var option = document.createElement("option");
                    option.value = style.id.toString();
                    option.appendChild(document.createTextNode(style.name));
                    copySelect.appendChild(option);
                }
                empty();
                currentStyle = null;
                if (id !== undefined) {
                    var cbs = {
                        id: id,
                        handleEvent: function () {
                            UI.Styles.StyleDesigner.loadStyle(this.id);
                        }
                    };
                    var cbe = {
                        handleEvent: function () { UI.Styles.callSelf(); }
                    };
                    Server.Sheets.loadStyle(id, cbs, cbe);
                }
                if (id !== undefined) {
                    remainLabel.style.display = "";
                }
                else {
                    remainLabel.style.display = "none";
                }
            }
            StyleDesigner.callSelf = callSelf;
            function copy() {
                fillWithStyle(DB.StyleDB.getStyle(parseInt(copySelect.value)), true);
            }
            StyleDesigner.copy = copy;
            function loadStyle(id) {
                currentStyle = DB.StyleDB.getStyle(id);
                fillWithStyle(currentStyle);
            }
            StyleDesigner.loadStyle = loadStyle;
            function fillWithStyle(style, copy) {
                if (copy !== true) {
                    nameInput.value = style.name;
                    publicStyleInput.checked = style.publicStyle;
                    gameSelect.value = style.gameid.toString();
                }
                htmlInput.value = style.html;
                cssInput.value = style.css;
                jsInput.value = style.mainCode;
                publicCodeInput.value = style.publicCode;
            }
            StyleDesigner.fillWithStyle = fillWithStyle;
            function submit() {
                var style;
                if (currentStyle === null) {
                    // CREATE
                    style = new StyleInstance();
                }
                else {
                    style = currentStyle;
                }
                style.name = nameInput.value;
                style.mainCode = jsInput.value;
                style.css = cssInput.value;
                style.publicCode = publicCodeInput.value;
                style.html = htmlInput.value;
                style.publicStyle = publicStyleInput.checked;
                style.gameid = parseInt(gameSelect.value);
                var cbs = function () { UI.Styles.StyleDesigner.finish(); };
                var cbe = function () { };
                Server.Sheets.sendStyle(style, cbs, cbe);
            }
            StyleDesigner.submit = submit;
            function finish() {
                if (!remainInput.checked || currentStyle === null) {
                    UI.Styles.callSelf();
                }
            }
            StyleDesigner.finish = finish;
        })(StyleDesigner = Styles.StyleDesigner || (Styles.StyleDesigner = {}));
    })(Styles = UI.Styles || (UI.Styles = {}));
})(UI || (UI = {}));
// Language Files
/// <reference path='Languages/Lingo.ts' />
/// <reference path='Languages/LingoPTBR.ts' />
/// <reference path='UI.ts' />
/// <reference path='RAPS.ts' />
/// <reference path='Modules/WindowManager.ts' />
/// <reference path='Modules/Logger.ts' />
/// <reference path='Modules/Config.ts' />
/// <reference path='Modules/Changelog.ts' />
/// <reference path='Modules/PageManager.ts' />
/// <reference path='Modules/Images.ts' />
/// <reference path='Modules/Loading.ts' />
/// <reference path='Modules/Login.ts' />
/// <reference path='Modules/Login/NewAccount.ts' />
/// <reference path='Modules/Handles.ts' />
/// <reference path='Modules/Language.ts' />
/// <reference path='Modules/IFrame.ts' />
/// <reference path='Modules/Sheets.ts' />
/// <reference path='Modules/Sheets/SheetPermissionDesigner.ts' />
/// <reference path='Modules/Sheets/SheetManager.ts' />
/// <reference path='Modules/Sheets/SheetDesigner.ts' />
/// <reference path='Modules/Rooms.ts' />
/// <reference path='Modules/Rooms/Designer.ts' />
/// <reference path='Modules/Games.ts' />
/// <reference path='Modules/Games/Invites.ts' />
/// <reference path='Modules/Games/InviteDesigner.ts' />
/// <reference path='Modules/Games/RoomDesigner.ts' />
/// <reference path='Modules/Games/Designer.ts' />
/// <reference path='Modules/SoundController.ts' />
/// <reference path='Modules/SoundController/MusicPlayer.ts' />
/// <reference path='Modules/Chat.ts' />
/// <reference path='Modules/Chat/Avatar.ts' />
/// <reference path='Modules/Chat/Forms.ts' />
/// <reference path='Modules/Chat/Notification.ts' />
/// <reference path='Modules/Chat/Lingo.ts' />
/// <reference path='Modules/Chat/Combat.ts' />
/// <reference path='Modules/Chat/PersonaManager.ts' />
/// <reference path='Modules/Chat/PersonaDesigner.ts' />
/// <reference path='Modules/Chat/Filters.ts' />
/// <reference path='Modules/Pica.ts' />
/// <reference path='Modules/Pica/References.ts' />
/// <reference path='Modules/Sounds.ts' />
/// <reference path='Modules/Styles.ts' />
/// <reference path='Modules/Styles/StyleDesigner.ts' />
// Message Classes
/// <reference path='Message/References.ts' />
/// <reference path='../typings/jquery/jquery.d.ts' />
/// <reference path='../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../typings/NonLatin.d.ts' />
/// <reference path='../typings/math.js.d.ts' />
/// <reference path='Debug.ts' />
/// <reference path='OnReady.ts' />
//Kind references
/// <reference path='Kinds/References.ts' />
/// <reference path='UI/Message/References.ts' />
// DB Modules
/// <reference path='DB/References.ts' />
// Main Modules
/// <reference path='Application/References.ts' />
/// <reference path='Server/References.ts' />
/// <reference path='UI/References.ts' />
// Changelog
/// <reference path="Changelog.ts" />
/// <reference path='References.ts' />
if (location.href.indexOf("http://") == 0) {
    location.href = location.href.replace("http://", "https://");
}
else {
    // Set up language
    UI.Language.searchLanguage();
    // Read and detach pages
    UI.PageManager.readWindows();
    // Update window sizes
    UI.WindowManager.updateWindowSizes();
    // Set up initial pages of main window
    UI.PageManager.callPage(UI.idChangelog);
    UI.PageManager.callPage(UI.idHome);
    // Return to loginWindow on logout, return to mainWindow on login
    Application.Login.addListener({
        handleEvent: function () {
            if (Application.Login.isLogged()) {
                UI.WindowManager.callWindow(('mainWindow'));
            }
            else {
                UI.Login.callSelf();
                UI.Login.resetState();
                UI.Login.resetFocus();
            }
        }
    });
    // Search for old logins and fill out remembered inputs
    Application.Login.searchLogin();
    UI.Login.resetState();
    // Do we have a session we can use or do we go straight to login screen?
    UI.WindowManager.callWindow("loginWindow");
    if (Application.Login.hasSession()) {
        Server.Login.requestSession(false);
    }
    else {
        UI.Login.resetFocus();
    }
    document.write("<script src='" + Server.CLIENT_URL + "js/Changelog.js' type='text/javascript'>" + "<" + "/" + "script>");
    // Call any onReady listeners
    allReady();
}
//# sourceMappingURL=Application.js.map