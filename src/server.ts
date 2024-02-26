import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

// Import functions

import { messageSendV1, messageSendDmV1, messageEditV1, messageRemoveV1, messageSendLaterV1, messageSendLaterDmV1, messagePinV1, messageUnpinV1, messageReactV1, messageUnreactV1, messageShare } from './message';
import { authLoginV2, authRegisterV1, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels';
import { channelDetailsV1, channelMessagesV1, channelJoinV1, channelInviteV1, channelAddownerV1, channelRemoveownerV1, channelLeaveV1 } from './channel';
import { clearV1 } from './other';
import { dmCreateV1, dmMessagesV1, dmListV1, dmDetailsV1, dmLeaveV1, dmRemoveV1 } from './dm';
import { userProfileV1, userProfileSethandleV1, userProfileSetnameV1, userProfileSetemailV1, usersAllV1, userProfileUploadphoto } from './users';
import { searchV1 } from './search';
import { adminUserRemoveV1, adminUserpermissionChangeV1 } from './admin';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { notificationsGet } from './notifications';

// Import Data
import fs from 'fs';
import { getData, setData } from './dataStore';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Data Persistence
let data = getData();
const dataBaseFile = './database.json';

if (fs.existsSync(dataBaseFile)) {
  const dataBase = fs.readFileSync(dataBaseFile);
  data = JSON.parse(String(dataBase));
  setData(data);
}

const save = () => {
  data = getData();
  const jsonstr = JSON.stringify(data);
  fs.writeFileSync(dataBaseFile, jsonstr);
};

// Profile Images Folder
if (!fs.existsSync(__dirname + '/static')) {
  fs.mkdirSync(__dirname + '/static');
}

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// Apps
//* *
// Auth Functions
//* *
// Auth Login
app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;
    const ret = res.json(authLoginV2(email, password));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Auth Register
app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const ret = res.json(authRegisterV1(email, password, nameFirst, nameLast));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Auth Logout
app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const ret = res.json(authLogoutV1(token));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Auth Password Reset Request
app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;
    const ret = res.json(authPasswordResetRequestV1(email));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Auth Password Reset Reset
app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  try {
    const { resetCode, newPassword } = req.body;
    const ret = res.json(authPasswordResetResetV1(resetCode, newPassword));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Channels Create
app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { name, isPublic } = req.body;
    const ret = res.json(channelsCreateV1(token as string, name as string, isPublic as boolean));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Send
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.body.channelId as string;
    const message = req.body.message as string;
    const ret = res.json(messageSendV1(token, parseInt(channelId), message));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Send Dm
app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.body.dmId as string;
    const message = req.body.message as string;
    const ret = res.json(messageSendDmV1(token, parseInt(dmId), message));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Edit
app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const messageId = req.body.messageId as string;
    const message = req.body.message as string;
    const ret = res.json(messageEditV1(token, parseInt(messageId), message));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Remove
app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const messageId = req.query.messageId as string;
    const ret = res.json(messageRemoveV1(token, parseInt(messageId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message react
app.post('/message/react/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const messageId = req.body.messageId as string;
    const reactId = req.body.reactId as string;
    const ret = res.json(messageReactV1(token, parseInt(messageId), parseInt(reactId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message unreact
app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const messageId = req.body.messageId as string;
    const reactId = req.body.reactId as string;
    const ret = res.json(messageUnreactV1(token, parseInt((messageId)), parseInt(reactId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// USER/ USERS FUNCTIONS
app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const uId = req.query.uId as string;
    return res.json(userProfileV1(token, parseInt(uId)));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { handleStr } = req.body;
    const ret = res.json(userProfileSethandleV1(token, handleStr));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { nameFirst, nameLast } = req.body;
    const ret = res.json(userProfileSetnameV1(token, nameFirst, nameLast));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    return res.json(usersAllV1(token));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { email } = req.body;
    const ret = res.json(userProfileSetemailV1(token, email));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    const ret = res.json(userProfileUploadphoto(token, imgUrl, parseInt(xStart), parseInt(yStart), parseInt(xEnd), parseInt(yEnd)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Clear
app.delete('/clear/v1', (req: Request, res: Response, next) => {
  const ret = res.json(clearV1());
  save();
  return ret;
});

// dmCreate
app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { uIds } = req.body;
    const ret = res.json(dmCreateV1(token, uIds));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// dmMessages
app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.query.dmId as string;
    const start = req.query.start as string;
    const ret = res.json(dmMessagesV1(token, parseInt(dmId), parseInt(start)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

/* CHANNEL FUNCTIONS */

// Channel Details
app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.query.channelId as string;
    return res.json(channelDetailsV1(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

// Channel Join
app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    const ret = res.json(channelJoinV1(token, channelId));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Channel Invite
app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    const ret = res.json(channelInviteV1(token, channelId, uId));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// CHANNELS FUNCTIONS //
app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    return res.json(channelsListV1(token));
  } catch (err) {
    next(err);
  }
});

// Channel Messages
app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.query.channelId as string;
    const start = req.query.start as string;
    return res.json(channelMessagesV1(token, parseInt(channelId), parseInt(start)));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listAll/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    return res.json(channelsListAllV1(token));
  } catch (err) {
    next(err);
  }
});

// Channel Leave
app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    const ret = res.json(channelLeaveV1(token, channelId));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Channel Addowner
app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    const ret = res.json(channelAddownerV1(token, channelId, uId));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Channel Removeowner
app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    const ret = res.json(channelRemoveownerV1(token, channelId, uId));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// DM FUNCTIONS
app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.query.dmId as string;
    return res.json(dmDetailsV1(token as string, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    return res.json(dmListV1(token));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { dmId } = req.body;
    const ret = res.json(dmLeaveV1(token, parseInt(dmId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.query.dmId as string;
    const ret = res.json(dmRemoveV1(token as string, parseInt(dmId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const queryStr = req.query.queryStr as string;
    return res.json(searchV1(token, queryStr));
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const uId = req.query.uId as string;
    const ret = res.json(adminUserRemoveV1(token, parseInt(uId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { uId, permissionId } = req.body;
    const ret = res.json(adminUserpermissionChangeV1(token, uId, permissionId));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// STANDUP FUNCTIONS //
app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, length } = req.body;
    const ret = res.json(standupStartV1(token, parseInt(channelId), parseInt(length)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.query.channelId as string;
    return res.json(standupActiveV1(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, message } = req.body;
    const ret = res.json(standupSendV1(token, parseInt(channelId), message));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Send
app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const channelId = req.body.channelId as string;
    const message = req.body.message as string;
    const timeSent = req.body.timeSent as string;
    const ret = res.json(messageSendLaterV1(token, parseInt(channelId), message, parseInt(timeSent)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Send Dm
app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const dmId = req.body.dmId as string;
    const message = req.body.message as string;
    const timeSent = req.body.timeSent as string;
    const ret = res.json(messageSendLaterDmV1(token, parseInt(dmId), message, parseInt(timeSent)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Share
app.post('/message/share/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { ogMessageId, message, channelId, dmId } = req.body;
    const ret = res.json(messageShare(token, parseInt(ogMessageId), message, parseInt(channelId), parseInt(dmId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// Message Pin
app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const messageId = req.body.messageId as string;
    const ret = res.json(messagePinV1(token, parseInt(messageId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const messageId = req.body.messageId as string;
    const ret = res.json(messageUnpinV1(token, parseInt(messageId)));
    save();
    return ret;
  } catch (err) {
    next(err);
  }
});

// NOTIFICATIONS
app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    return res.json(notificationsGet(token));
  } catch (err) {
    next(err);
  }
});

// Upload user profile image photos
app.use('/static', express.static(__dirname + '/static'));

// handles errors nicely
app.use(errorHandler());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
