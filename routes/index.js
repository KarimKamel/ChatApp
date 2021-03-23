var express = require('express');
const path = require('path');
var router = express.Router();
const multer = require('multer');

const userTakeErrorMessage = 'name already in use, try a different name...';
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
	const nameList = nicknameAndIdList.map(function (value) {
		return value.nickname;
	});
	return !nameList.includes(nickname);
}

// function fileFilter(req, file, cb) {
// 	const nickname = req.body.nickname;

// 	if (!nicknameIsAvailable(nickname)) {
// 		return cb(new Error('nickname is already taken'), false);
// 	} else if (
// 		file.mimetype == 'image/png' ||
// 		file.mimetype == 'image/jpg' ||
// 		file.mimetype == 'image/jpeg'
// 	) {
// 		return cb(null, true);
// 	} else {
// 		// cb(null, false);
// 		return cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
// 	}
// }

// var upload = multer({
// 	fileFilter: fileFilter,
// 	storage: storage,
// });

router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
	var { nickname, imageURL } = req.body;

	if (nicknameIsAvailable(nickname)) {
		// if (res.req.file) {
		//   filename = res.req.file.filename;
		// }

		if (!imageURL || imageURL === 'undefined') {
			imageURL =
				'https://res.cloudinary.com/dtwtrdg4s/image/upload/v1616154021/chat/Screenshot_2021-02-25_131600_dyzqzp.png';
		}
		let user = {
			nickname: nickname,
			id: '',
			image: imageURL,
		};
		nicknameAndIdList.push(user);
		res.cookie('nickname', nickname, { signed: false });
		res.render('chat', { nickname: nickname });
	} else {
		console.log('rejecting user ' + nickname + ' is already taken');
		res.render('index', { message: userTakeErrorMessage });
	}
});

module.exports.router = router;
module.exports.nicknameAndIdList = nicknameAndIdList;
