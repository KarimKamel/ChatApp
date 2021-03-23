function updateButtonStatus() {
	const inputText = $('#nicknameInput').val();
	if (!inputText) {
		$('#submitButton').attr('disabled', true);
	} else {
		$('#submitButton').attr('disabled', false);
	}
}

function clickHiddenInput() {
	$('#imageFile').click();
}

var image_url;
function uploadCustomAvatar(event) {
	const url = 'https://api.cloudinary.com/v1_1/dtwtrdg4s/image/upload';
	if (event.target.files && event.target.files[0]) {
		var customImage = $('#profileImage');
		var defaultImage = $('.fa-user');
		const files = document.querySelector('[type=file]#imageFile').files;
		const formData = new FormData();

		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			formData.append('file', file);
			formData.append('upload_preset', 'zsm6cuam');

			fetch(url, {
				method: 'POST',
				body: formData,
			})
				.then((response) => {
					console.log(response);

					return response.text();
				})
				.then((data) => {
					console.log(data);
					const jsonData = JSON.parse(data);
					image_url = jsonData.url;
					console.log(image_url);
					customImage.attr('src', image_url);
					console.log(customImage);
					customImage.show();
					defaultImage.hide();
				});
		}
	}
}

function post(path, params, method = 'post') {
	// The rest of this code assumes you are not using a library.
	// It can be made less verbose if you use one.
	const form = document.createElement('form');
	form.method = method;
	form.action = path;

	for (const key in params) {
		if (params.hasOwnProperty(key)) {
			const hiddenField = document.createElement('input');
			hiddenField.type = 'hidden';
			hiddenField.name = key;
			hiddenField.value = params[key];

			form.appendChild(hiddenField);
		}
	}

	document.body.appendChild(form);
	form.submit();
}

function submitForm(event) {
	const params = {
		nickname: document.querySelector('#nicknameInput').value,
		imageURL: image_url,
	};
	console.log(params);
	post('/', params, 'post');
}

$('document').ready(() => {
	$('#profileImage').hide();
	updateButtonStatus();
});
$(window).on('popstate', function (event, state) {
	// Here comes the code to execute when the back button is pressed
	event.preventDefault();
	console.log('Popstate');
	document.cookie = 'nickname= ; expires = Thu, 01 Jan 1970 00:00:00 GMT';
});
// window.onbeforeunload = function (event) {
// 	debugger;
// 	console.log('refreshing');
// 	alert('refresh');
// 	return confirm('Confirm refresh');
// };
jQuery(document).ready(function ($) {
	console.log('ready1');
	if (window.history && window.history.pushState) {
		console.log('ready2');
		$(window).on('popstate', function () {
			console.log('ready3');
			//when back is clicked popstate event executes
			//code here will execute on back click
		});
	}
});
