const form = document.getElementById("Add");
const nameField = document.querySelector('#cName');
const phoneField = document.querySelector('#cPhone');
const emailField = document.querySelector('#cEmail');
const addressLine1Field = document.querySelector('#A1');
const addressLine2Field = document.querySelector('#A2');
const cityField = document.querySelector('#Acity');
const stateField = document.querySelector('#Astate');
const pinField = document.querySelector('#Apin');
const submitBtn = document.querySelector('#submit');

const errorBox = document.querySelector('.error-box');
const errorText = document.querySelector('#error-box');
const loader = document.getElementById('loader');
loader.classList.add('hidden');

form.addEventListener('submit', (event) => {
	submitBtn.setAttribute('disabled', true);
	event.preventDefault();

	const name = nameField.value.trim();
	const phone = parseInt(phoneField.value.trim());
	const email = emailField.value.trim();
	const addressLine1 = addressLine1Field.value.trim();
	const addressLine2 = addressLine2Field.value.trim();
	const city = cityField.value.trim();
	const state = stateField.value.trim();
	const pin = parseInt(pinField.value.trim());

	fetch('/auth/signup', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			cName: name,
			cPhone: phone,
			cEmail: email,
			pass: null,
			cpass: null,
			age_checkbox: true,
		})
	}).then(response => response.json()).then(data => {
		console.log(data);
		if (data.error) {
			// Handle error and show error message
			errorBox.style.display = 'flex';
			errorText.style.display = 'flex';
			console.log(data.error);
			errorText.innerText = data.error;
			submitBtn.removeAttribute('disabled');
		}
		fetch('/setData/address', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				Aname: "Home",
				Apin: pin,
				A1: addressLine1,
				A2: addressLine2,
				Acity: city,
				Astate: state,
				cPhone: phone,
			})
		}).then(response => response.json()).then(data => {
			console.log(data);
			if (data.error) {
				// Handle error and show error message
				errorBox.style.display = 'flex';
				errorText.style.display = 'flex';
				console.log(data.error);
				errorText.innerText = data.error;
				submitBtn.removeAttribute('disabled');
			}
			try {
				const cookieValue = document.cookie.split('; ').find((cookie) => cookie.startsWith('UnityBooksCart='))?.split('=')[1];
				const decodedCookie = JSON.parse(decodeURIComponent(cookieValue));
				decodedCookie.CART.forEach((item) => {
					addToCart(item.pid, item.qty)
				});
				window.location.href = '/checkout';
			} catch (error) { window.location.href = '/cart'; }
		})
	}).catch(error => {
		// Handle error and show error message
		submitBtn.removeAttribute('disabled');
		errorBox.style.display = 'flex';
		errorText.style.display = 'flex';
		console.log(error);
		if (error.response && error.response.status === 401) errorText.innerHTML = 'Account already exists';
		else if (error.response && error.response.status === 400) errorText.innerHTML = 'Internal Server Error';
		else errorText.innerHTML = 'Internal Server Error';
		if (error.response && error.response.body) {
			try {
				const errorJson = JSON.parse(error.response.body);
				console.log(errorJson);
				if (errorJson.error && errorJson.error.message) errorText.innerHTML = errorJson.error.message;
			} catch (e) { window.location.href = '/signup'; }
		}
	});
})

