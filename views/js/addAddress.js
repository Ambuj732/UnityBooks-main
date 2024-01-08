const loginContainer = document.getElementById("login-container");
const loader = document.getElementById("loader");

loader.classList.add("hidden");

const form = document.getElementById("signup");
const inputFields = document.querySelectorAll('.field-value');
const submitBtn = document.querySelector('#submitBtn');

// get the error box element
const errorBox = document.querySelector('.error-box');
const errorText = document.querySelector('#error-box')

// Regex patterns for validation
const phoneRegex = /^\d{10}$/;

function showError(message) {
	submitBtn.removeAttribute('disabled');
	errorBox.style.display = 'flex';
	errorText.style.display = 'flex';
	errorText.textContent = message;
	setTimeout(() => {
		errorText.textContent = "";
		errorText.style.display = 'none';
		errorBox.style.display = 'none';
	}, 2000);
}

// Function to check if all fields are not empty
function checkAllFieldsNotEmpty() {
	let allFieldsNotEmpty = true;
	inputFields.forEach((inputField) => {
		if (inputField.hasAttribute('required') && inputField.value === '') {
			allFieldsNotEmpty = false;
		}
	});
	return allFieldsNotEmpty;
}

// Add an event listener to each input field to check if it's not empty
inputFields.forEach((inputField) => {
	inputField.addEventListener('input', () => {
		if (checkAllFieldsNotEmpty()) {
			submitBtn.classList.remove('btn-unselect');
			submitBtn.removeAttribute('disabled');
		} else {
			submitBtn.classList.add('btn-unselect');
			submitBtn.setAttribute('disabled', true);
		}
	});
});

// add an event listener to the form's submit event
form.addEventListener('submit', (event) => {
	submitBtn.setAttribute('disabled', true);

	// prevent the default form submission behavior
	event.preventDefault();

	// get the form fields
	const addressLine1Field = document.querySelector('#A1');
	const addressLine2Field = document.querySelector('#A2');
	const cityField = document.querySelector('#Acity');
	const stateField = document.querySelector('#Astate');
	const pinField = document.querySelector('#Apin');
	const addressNameField = document.querySelector('#Aname');
	const phoneField = document.querySelector('#cPhone');

	// clear any existing error messages
	errorBox.style.display = 'none';
	errorText.textContent = '';

	// validate all the fields
	const address1 = addressLine1Field.value.trim();
	if (!address1) {
		showError('Please enter your Address Line 1');
		addressLine1Field.focus();
		return;
	}

	const address2 = addressLine2Field.value.trim();
	if (!address2) {
		showError('Please enter your Address Line 2');
		addressLine2Field.focus();
		return;
	}

	const city = cityField.value.trim();
	if (!city) {
		showError('Please enter your City');
		cityField.focus();
		return;
	}

	const state = stateField.value.trim();
	if (!state) {
		showError('Please enter your State');
		stateField.focus();
		return;
	}

	const addressName = addressNameField.value.trim();
	if (!addressName) {
		showError('Please enter your Address Name');
		addressNameField.focus();
		return;
	}

	const phone = phoneField.value.trim();
	if (!phone) {
		showError('Please enter your Phone Number');
		phoneField.focus();
		return;
	}

	if (!phoneRegex.test(phone)) {
		showError('Please enter a valid Phone Number');
		phoneField.focus();
		return;
	}

	const pin = pinField.value.trim();
	if (pin.length != 6) {
		showError('Please enter valid Pin/Zip Code');
		pinField.focus();
		return;
	}

	loginContainer.classList.add("hidden");
	loader.classList.remove("hidden");

	// if all fields are valid, submit the form data via AJAX
	fetch('/setData/address', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Aname: addressName,
			Apin: pin,
			A1: address1,
			A2: address2,
			Acity: city,
			Astate: state,
			cPhone: phone
		})
	})
		// .then(response => {
		//     if (!response.ok) {
		//         throw Error(response.statusText);
		//     }
		//     return response;
		// })
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if (data.error) {
				// Handle error and show error message
				errorBox.style.display = 'flex';
				errorText.style.display = 'flex';
				console.log(data.error);
				errorText.innerText = data.error;
				submitBtn.removeAttribute('disabled');
			}
			else window.location.href = '/profile';
		})
		.catch(error => {

			// Handle error and show error message
			submitBtn.removeAttribute('disabled');
			errorBox.style.display = 'flex';
			errorText.style.display = 'flex';
			console.log(error);
			if (error.response && error.response.status === 401) {
				errorText.innerHTML = 'Account already exists';
			} else if (error.response && error.response.status === 400) {
				errorText.innerHTML = 'Internal Server Error';
			} else {
				errorText.innerHTML = 'Internal Server Error';
			}
			if (error.response && error.response.body) {
				try {
					const errorJson = JSON.parse(error.response.body);
					console.log(errorJson);
					if (errorJson.error && errorJson.error.message) {
						errorText.innerHTML = errorJson.error.message;
					}
				} catch (e) {
					// do nothing if response body is not a valid JSON string
				}
			}
		});
});
