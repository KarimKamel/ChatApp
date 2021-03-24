var express = require('express');
const path = require('path');
var router = express.Router();
const multer = require('multer');

const userTakeErrorMessage = 'name already in use, try a different name...';
const sessionInChatError = 'you have already joined the chat with this client';
const nicknameAndIdList = [];

const storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './public/images');
	},
	filename: function (req, file, callback) {
		callback(null, req.body.nickname + path.extname(file.originalname));
	},
});

function nicknameIsAvailable(nickname) {
	const nameTaken = nicknameAndIdList.some(
		(value) => value.nickname === nickname,
	);
	return !nameTaken;
}
function sessionIsInChat(sessionID) {
	const sessionInChat = nicknameAndIdList.some(
		(value) => value.sessionID === sessionID,
	);
	return sessionInChat;
}
function assignDefaultImage(imageURL) {
	imageURL =
		'https://res.cloudinary.com/dtwtrdg4s/image/upload/v1616154021/chat/Screenshot_2021-02-25_131600_dyzqzp.png';
	return imageURL;
}
function getSessionID(cookie) {
	let regExp = new RegExp('sessionID=([^;]*)(;|$)');
	let sessionID = cookie.match(regExp);
	return sessionID[1];
}

function getUserObject(sessionID) {
	const userObject = nicknameAndIdList.find(
		(userObject) => userObject.sessionID === sessionID,
	);
	return userObject;
}

router.get('/', function (req, res, next) {
	const sessionID = getSessionID(req.headers.cookie);
	sessionInChat = sessionIsInChat(sessionID);
	res.render('index', {
		title: 'Express',
		sessionInChat: sessionInChat,
		sessionErrorMessage: sessionInChatError,
	});
});

router.get('/checkSession', function (req, res, next) {
	const sessionID = getSessionID(req.headers.cookie);
	sessionInChat = sessionIsInChat(sessionID);
	res.json({ sessionInChat: sessionInChat });
});

router.post('/', function (req, res) {
	var { nickname, imageURL } = req.body;

	if (!imageURL || imageURL === 'undefined') {
		imageURL = assignDefaultImage(imageURL);
	}
	const sessionID = getSessionID(req.headers.cookie);

	if (!sessionIsInChat(sessionID)) {
		if (nicknameIsAvailable(nickname)) {
			let user = {
				nickname: nickname,
				id: '',
				image: imageURL,
				sessionID: sessionID,
			};
			nicknameAndIdList.push(user);
			res.cookie('nickname', nickname, { signed: false });
			res.render('chat', { nickname: nickname });
		} else {
			console.log('rejecting user ' + nickname + ' is already taken');
			res.render('index', { message: userTakeErrorMessage });
		}
	} else {
		const userObject = getUserObject(sessionID);
		nicknameAndIdList.push(userObject);
		res.cookie('nickname', nickname, { signed: false });
		res.render('chat', { nickname: nickname });
	}
});

module.exports.router = router;
module.exports.nicknameAndIdList = nicknameAndIdList;
