const signInForm = document.getElementById('login');

signInForm.addEventListener('submit', (event) => {
	// prevent the default form submission behavior
	event.preventDefault();

	// get the email and password fields
	const emailField = document.querySelector('#email');
	const passwordField = document.querySelector('#password');

	// get the error box element
	const errorBox = document.querySelector('.error-box');
	const errorText = document.querySelector('#error-box');

	// clear any existing error messages
	errorBox.style.display = 'none';
	errorText.textContent = '';

	// validate the email field
	const email = emailField.value.trim();
	if (!email) {
		errorText.textContent = 'Please enter your email';
		errorBox.style.display = 'flex';
		errorText.style.display = 'flex';
		emailField.focus();
		return;
	}

	// validate the password field
	const password = passwordField.value.trim();
	if (!password) {
		errorText.textContent = 'Please enter your password';
		errorBox.style.display = 'flex';
		errorText.style.display = 'flex';
		passwordField.focus();
		return;
	}

	// if both fields are valid, submit the form data via AJAX
	fetch('/admin/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: email,
			password: password
		})
	}).then(response => {
		return response.json();
	}).then(data => {
		if (data.success === true) window.location.href = '/admin/dashboard';
		else {
			// Handle error and show error message
			console.error(data.error);
			errorBox.style.display = 'flex';
			errorText.style.display = 'flex';
			console.log(data.error);
			errorText.textContent = data.error;
		}
	})
})