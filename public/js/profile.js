const account = document.getElementById('account');
const loader = document.getElementById('loader');

account.classList.add('hidden');

const nameField = document.querySelector('#cName');
const phoneField = document.querySelector('#cPhone');
const emailField = document.querySelector('#cEmail');
const photoField = document.querySelector('#photo');
const addressField = document.querySelector('#cAdd');

fetch('/getData/address').then(response => response.json()).then(data => {
	if (data.success === true) {
		fetch('/api/getDetails').then(response => response.json()).then(data => {
			// console.log(data)
			if (data.success === true) {
				photoField.innerHTML = (data.photo) ? `<img src="${data.photo}">` : `<img src="img/avatar.png">`;
				nameField.textContent = data.name;
				phoneField.textContent = data.phone;
				emailField.textContent = data.email;
				addressField.textContent = data.address1 + ", " + data.address2 + ", " + data.city + ", " + data.state + ", " + data.pin;

				loader.classList.add('hidden');
				account.classList.remove('hidden');
			}
		}).catch(error => {
			console.log(error);
		})
	}
	else {
		window.location.href = "/addAddress";
	}
})