var localNickname;

$(document).ready(function () {
	localNickname = document.cookie.substring(9);
	// checkNickName();
	updateInputButtonStatus();
});

// function triggered by chat message input onchange
//enables send button when chat input contains a message (i.e: disables sending empty messages)
//in case this function is triggered by the enter key and message input is not empty. the message input value is sent as a message (i.e sends message when enter is pressed)
function updateInputButtonStatus(event) {
	if ($('#inputWindow').val()) {
		//code 13 = enter key
		if (event.keyCode === 13) {
			sendMessage();
		} else {
			//attr is set to true if send button is disabled
			//checks if send is disabled before enabling it
			var attr = $('#inputButton').attr('disabled');
			if (typeof attr !== 'undefined' && attr !== false) {
				$('#inputButton').attr('disabled', false);
			}
		}
	} else {
		$('#inputButton').attr('disabled', true);
	}
}

function whisperIconFunction() {
	const username = $(this).parent().text();
	if ($(`#${username}Tab`).length === 0) {
		createNewTab(username);
	} else {
		$('.chat-tab, .chat-pane').removeClass('active');
		$('.chat-pane').removeClass('show');
		$(`#${username}Tab > a`).addClass('active');
		$(`#${username}Pane`).addClass('active');
	}
}
var socket = io({
	reconnection: false,
	timeout: 1000 * 60 * 60 * 60,
});
socket.on('connect', () => {
	alert('connection established');
});
socket.on('disconnect', () => {
	alert('connection lost');
	window.location.replace('/');
});
function outsideClick(event, notelem) {
	notelem = $(notelem); // jquerize (optional)
	// check outside click for multiple elements
	var clickedOut = true,
		i,
		len = notelem.length;
	for (i = 0; i < len; i++) {
		if (event.target == notelem[i] || notelem[i].contains(event.target)) {
			clickedOut = false;
		}
	}
	if (clickedOut) return true;
	else return false;
}

socket.on('usersUpdate', (nicknameImgList) => {
	$('#userWindow').empty();
	nicknameImgList.forEach((nameAndImg) => {
		const nickname = nameAndImg.nickname;
		const image = nameAndImg.image;
		$('<div/>')
			.addClass('user-avatar-block')
			.append(
				$('<img>').attr('src', image).addClass('avatar'),
				$('<span>' + nickname + '</span>').addClass('nickname-span'),
				$('<i/>')
					.addClass('fas fa-paper-plane')
					.click(whisperIconFunction)
					.hide(),
			)
			.on('mouseup', function (e) {
				$(this).addClass('active');
				var target = $(this).find($('.fa-paper-plane'));
				target.show();
			})

			.appendTo('#userWindow');
	});
});
function sendWhisper(receiverNickname, messageText) {
	const senderId = socket.id;

	socket.emit('whisper', {
		senderId: senderId,
		messageText: messageText,
		receiverNickname: receiverNickname,
	});

	$('#inputWindow').val('');
	return false;
}

function sendMessage() {
	const messageText = $('#inputWindow').val();

	debugger;
	const senderId = socket.id;
	const tabText = $('.nav-link.active').text();

	if (tabText === 'Home') {
		socket.emit('message', { userID: senderId, messageText: messageText });
		$('#inputWindow').val('');
	} else {
		const receiverNickname = tabText;
		sendWhisper(receiverNickname, messageText);
	}
	updateInputButtonStatus();

	return false;
}

socket.on('message', (message) => {
	const nickname = message.nickname;
	const messageText = message.message;
	const messageElement = $('<p>' + nickname + ' : ' + messageText + '</p>');
	if (nickname === localNickname) {
		messageElement.css('font-weight', 'bold');
	}
	if (nickname === 'SYSTEM') {
		messageElement.css('color', 'green');
	}

	$('#HomePane').append(messageElement);
});
function closeTab() {
	const targetName = $(this).parent().text();
	const targetTab = targetName + 'Tab';
	const targetPane = targetName + 'Pane';
	$(`#${targetTab}`).remove();
	$(`#${targetPane}`).remove();
	$('#HomeTab > a').addClass('active');
	$('#HomePane').addClass('show active');
}
function createNewTab(partnerName) {
	//remove active show from current tab and content window
	$('.chat-tab, .chat-pane').removeClass('active');
	$('.chat-pane').removeClass('show');
	//create new active show tab and content window
	$('<li/>')
		.addClass('nav-item')
		.attr({
			id: `${partnerName}Tab`,
		})

		.append(
			$('<a/>')
				.addClass('nav-link active chat-tab')
				.attr({
					'data-toggle': 'tab',
					href: `#${partnerName}Pane`,
				})

				.text(`${partnerName}`)
				.append($('<i/>').addClass('fas fa-times').click(closeTab)),
		)

		.appendTo('#tabWindow');

	$('<div/>')
		.addClass('tab-pane chat-pane show active')
		.attr({ id: `${partnerName}Pane` })
		.appendTo('#chatWindow');
}
socket.on('createNewTab', (sender) => {
	createNewTab(sender);
});
socket.on('whisperMessage', (message) => {
	const nicknameSender = message.nickname;
	const nicknameReceiver = message.nicknameTwo;
	const messageText = message.messageText;
	const messageParagraph = $('<p></p>').addClass('whisper');
	if (message.systemMsg) {
		messageParagraph.text('SYSTEM ALERT : ' + messageText);
	} else {
		messageParagraph.text(nicknameSender + ' : ' + messageText);
	}
	//if this is the sender
	//look for receiver tab
	if (nicknameSender === localNickname) {
		if ($(`#${nicknameReceiver}Pane`).length === 0) {
			createNewTab(nicknameReceiver);
		}
		messageParagraph.css('font-weight', 'bold');
		messageParagraph.appendTo(`#${nicknameReceiver}Pane`);
	}
	//if this is receiver
	//look for sender tab
	else {
		if ($(`#${nicknameSender}Pane`).length === 0) {
			createNewTab(nicknameSender);
		}
		messageParagraph.appendTo(`#${nicknameSender}Pane`);
	}
});

window.addEventListener('mousedown', function (e) {
	var activeUser = $('.user-avatar-block.active');
	var textElement = $('.input-window');
	if (outsideClick(e, activeUser) && outsideClick(e, textElement)) {
		var iconElem = activeUser.find($('.fa-paper-plane'));
		iconElem.hide();
		activeUser.removeClass('active');
	}
});
