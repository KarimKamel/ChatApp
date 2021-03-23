var index = require('../routes/index');
const defaultAvatar = 'cactus.jpg';
const fs = require('fs');
const path = require('path');
var nicknameAndIdList = index.nicknameAndIdList;

const debug = require('../util/chatUtils').createDebug('chatapp:main');

function mainChat(io) {
	function getUserObject(socket) {
		if (socket.request.headers.cookie) {
			const nickname = socket.request.headers.cookie.substring(9);
			const userObject = nicknameAndIdList.find(
				(element) => element.nickname === nickname,
			);
			debug(`${nickname} attempting to connect with socketid ${socket.id}`);
			if (userObject) {
				return userObject;
			} else {
				debug(`${nickname} not found in nick to id list`);
				debug('denying access');
				return null;
			}
		} else {
			debug(`something went wrong, cookie not set in ${nickname}'s browser`);
			return null;
		}
	}
	function attachIdAndImage(userObject, socket) {
		userObject.id = socket.id;
	}
	function broadCastConnection(io, nickname, join = true) {
		if (join) {
			debug(`broadcasting ${nickname} joining chat`);
			io.emit('message', {
				nickname: 'SYSTEM',
				message: `${nickname} has joined the chat`,
			});
		} else {
			debug(`broadcasting ${nickname} leaving chat`);
			io.emit('message', {
				nickname: 'SYSTEM',
				message: `${nickname} has left the chat`,
			});
		}
	}
	function updateUserList(io) {
		const nicknameImgList = nicknameAndIdList.map((element) => {
			return { nickname: element.nickname, image: element.image };
		});
		debug('sending updated user list');
		io.emit('usersUpdate', nicknameImgList);
	}

	io.on('connection', (socket) => {
		//broadcast updated user list on user connection

		const userObject = getUserObject(socket);
		if (userObject) {
			attachIdAndImage(userObject, socket);
			debug('users currently in chat ' + JSON.stringify(nicknameAndIdList));
			console.log(
				`${userObject.nickname} with id ${socket.id} is joining chat`,
			);
			broadCastConnection(io, userObject.nickname, (join = true));
			updateUserList(io);
		} else {
			console.log(`${socket.id} was denied access to chat`);
			socket.disconnect();
		}

		// On client disconect
		socket.on('disconnect', () => {
			const id = socket.id;
			const userIndex = nicknameAndIdList.findIndex((element) => {
				return element.id === id;
			});
			const nickname = nicknameAndIdList[userIndex].nickname;

			debug(`${nickname}, socketid: ${socket.id} has disconnected`);
			broadCastConnection(io, nickname, (join = false));
			nicknameAndIdList.splice(userIndex, 1);

			const nicknameList = nicknameAndIdList.map((element) => {
				return element.nickname;
			});
			debug('currently in chat ' + JSON.stringify(nicknameAndIdList));
			updateUserList(io);
		});
		socket.on('whisper', (msg) => {
			//retrieve nickname and id of both sender and receiver
			const receiver = nicknameAndIdList.find((element) => {
				return element.nickname === msg.receiverNickname;
			});
			const sender = nicknameAndIdList.find((element) => {
				return element.id === msg.senderId;
			});

			const message = {
				nickname: sender.nickname,
				nicknameTwo: msg.receiverNickname,
				systemMsg: false,
			};
			if (!receiver) {
				const messageText = `${msg.receiverNickname} has the left the chat`;

				message.systemMsg = true;
				message.messageText = messageText;
				debug(message);
			} else {
				message.messageText = msg.messageText;
				debug(message);
				io.to(receiver.id).emit('whisperMessage', message);
			}
			io.to(sender.id).emit('whisperMessage', message);

			//send message
		});

		socket.on('message', (msg) => {
			debug(msg);
			const message = msg.messageText;
			//get sender nickname
			const nicknameAndId = nicknameAndIdList.filter((element) => {
				return element.id === msg.userID;
			});
			const nickname = nicknameAndId[0].nickname;
			//send message
			io.emit('message', { nickname: nickname, message: message });
		});
	});
}
module.exports = mainChat;
