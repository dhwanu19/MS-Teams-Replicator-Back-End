// User Interfaces
interface Member {
        uId: number,
        email: string,
        nameFirst: string,
        nameLast: string,
        handleStr: string,
}

interface Standup {
        isActive: false,
        startMember: null,
        starterToken: null,
        timeFinish: null,
        messages: []
}

// Channel Interfaces
interface Channel {
        name: string,
        channelId: number,
        isPublic: boolean,
        ownerMembers: Member[],
        allMembers: Member[],
        messages: string[],
        standup: Standup
}

interface ChannelDetails {
        name: string,
        isPublic: boolean,
        ownerMembers: Member[],
        allMembers: Member[],
}

interface ChannelId {
        channelId: number
}

interface ChannelSimplified {
        name: string,
        channelId: number,
}
interface ChannelsList {
        channels: ChannelSimplified[]
}
// Message Interfaces
interface Reacts {
        reactId: number,
        uIds: number[],
        isThisUserReacted: boolean
}

interface Message {
        messageId: number,
        uId: number,
        message: string,
        timeSent: number,
        reacts: Reacts[],
        isPinned: boolean
}

interface MessageId {
        messageId: number
}

interface Messages {
        messages: Message[];
        start: number;
        end: number;
}

// Dm Interfaces
interface Dm {
        dmId: number,
        name: string,
        creator: number,
        members: Member[],
        messages: Message[],
}

interface DmSimplified {
        dmId: number,
        name: string
}

interface Dms {
        dms: DmSimplified[]
}

interface DmId {
        dmId: number
}

interface DmDetails {
        name: string,
        members: Member[]
}

interface MessageData {
        message: Message,
        channel: Channel,
        dm: Dm
}

interface Notification {
        channelId: number,
        dmId: number,
        notificationMessage: string
}

// Standup Interfaces
interface StandupStart {
        timeFinish: number
}

interface StandupActive {
        isActive: boolean,
        timeFinish: number
}

// Auth Interfaces
interface LoginInfo {
        token: string,
        authUserId: number
}

// INSERT OTHERS IF REQUIRED //

// Helper Interfaces

export {
  Channel,
  Dm,
  Message,
  MessageData,
  Reacts,
  Member,
  Notification,
  LoginInfo,
  Messages,
  ChannelDetails,
  ChannelId,
  ChannelsList,
  ChannelSimplified,
  DmId,
  DmSimplified,
  Dms,
  DmDetails,
  MessageId,
  StandupStart,
  StandupActive
};
