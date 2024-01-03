const loginContainer = document.getElementById("login-container");
const loader = document.getElementById("loader");

loader.classList.add("hidden");

const form = document.getElementById("signup");
const nameInput = document.getElementById("cName");
const phoneInput = document.getElementById("cPhone");
const emailInput = document.getElementById("cEmail");
const passInput = document.getElementById("pass");
const cpassInput = document.getElementById("cpass");
const ageCheckbox = document.getElementById("age_checkbox");
const signupBtn = document.getElementById("signupBtn");
const inputFields = document.querySelectorAll('.field-value');
const ageCheck = document.querySelector('#age_checkbox');
const referral = document.getElementById("referralCode")
const submitBtn = document.querySelector('#signupBtn');
const codeBtn = document.querySelector('#codeCheck');


// Step Btns
const formSteps = document.querySelectorAll('.step');
const nextBtns = document.querySelectorAll('.nextBtn');
const prevBtns = document.querySelectorAll('.prevBtn');


// get the error box element
const errorBox = document.querySelector('.error-box');
const errorText = document.querySelector('#error-box')


// Regex patterns for validation
const strongPassRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+={}[\]:";'<>,.?/\\])(?=.{8,})/;
const phoneRegex = /^\d{10}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

// Set the current step to 1
let currentStep = 1;

// Password Eye toggle
function togglePasswordVisibility() {
    var passField = document.getElementById("pass");
    var showBtn = document.querySelector(".show-password-btn");

    if (passField.type === "password") {
        passField.type = "text";
    } else {
        passField.type = "password";
    }
}

function toggleCPasswordVisibility() {
    var passField = document.getElementById("cpass");
    var showBtn = document.querySelector(".show-password-btn");

    if (passField.type === "password") {
        passField.type = "text";
    } else {
        passField.type = "password";
    }
}

function hideSteps() {
    formSteps.forEach((step) => {
        step.classList.add('hidden');
    });
    formSteps[currentStep - 1].classList.remove('hidden');
}

function showNext() {
    currentStep++;
    hideSteps();
}

function showPrev() {
    currentStep--;
    hideSteps();
}

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

nextBtns.forEach((nextBtn) => {
    nextBtn.addEventListener('click', () => {
        // console.log("clicked");
        if (currentStep === 1) {
            if (nameInput.checkValidity() && phoneInput.checkValidity()) {
                showNext();
            } else {
                showError('Please enter a valid Name and Phone number.');
            }
        } else if (currentStep === 2) {
            if (emailInput.checkValidity()) {
                showNext();
            } else {
                showError('Please enter a valid Email and Password.');
            }
        }
        // else if (currentStep === 3) {
        //     if (passInput.checkValidity() && cpassInput.checkValidity()) {
        //         showNext();
        //     } else {
        //         showError('Please enter Password and Confirm password.');
        //     }
        // }
    });
});

prevBtns.forEach((prevBtn) => {
    prevBtn.addEventListener('click', () => {
        showPrev();
    });
});

// Hide all the steps except the first one
hideSteps();

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
        if (checkAllFieldsNotEmpty() && ageCheck.checked) {
            submitBtn.classList.remove('btn-unselect');
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.classList.add('btn-unselect');
            submitBtn.setAttribute('disabled', true);
        }
    });
});

// Add an event listener to the age check checkbox to toggle the submit button
ageCheck.addEventListener('click', () => {
    if (checkAllFieldsNotEmpty() && ageCheck.checked) {
        submitBtn.classList.remove('btn-unselect');
        submitBtn.removeAttribute('disabled');

        // get the form element
        const signUpForm = document.querySelector('#signup');

        // add an event listener to the form's submit event
        signUpForm.addEventListener('submit', (event) => {
            submitBtn.setAttribute('disabled', true);

            // prevent the default form submission behavior
            event.preventDefault();

            // get the form fields
            const nameField = document.querySelector('#cName');
            const phoneField = document.querySelector('#cPhone');
            const emailField = document.querySelector('#cEmail');
            const passwordField = document.querySelector('#pass');
            const confirmPasswordField = document.querySelector('#cpass');
            const ageCheckbox = document.querySelector('#age_checkbox');
            // const addressLine1Field = document.querySelector('#A1');
            // const addressLine2Field = document.querySelector('#A2');
            // const cityField = document.querySelector('#Acity');
            // const stateField = document.querySelector('#Astate');
            // const pinField = document.querySelector('#Apin');
            // const addressNameField = document.querySelector('#Aname');

            // clear any existing error messages
            errorBox.style.display = 'none';
            errorText.textContent = '';

            // validate the name field
            const name = nameField.value.trim();
            if (!name) {
                showError('Please enter your name')
                nameField.focus();
                return;
            }

            // validate the phone number field
            const phone = phoneField.value.trim();
            if (!phone) {
                showError('Please enter your phone number')
                phoneField.focus();
                return;
            }

            if (!phoneRegex.test(phone)) {
                console.log("Please enter a valid phone number")
                showError('Please enter a valid phone number')
                phoneField.focus();
                return;
            }

            // validate the email field
            const email = emailField.value.trim();
            if (!email) {
                showError('Please enter your email address')
                emailField.focus();
                return;
            }

            if (!emailRegex.test(email)) {
                showError('Please enter a valid email address')
                referral.focus();
                return;
            }

            // validate the password field
            const password = passwordField.value.trim();
            if (!password) {
                showError('Please enter your password')
                passwordField.focus();
                return;
            }

            if (!strongPassRegex.test(password)) {
                showError('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character')
                passwordField.focus();
                return;
            }

            // validate the confirm password field
            const confirmPassword = confirmPasswordField.value.trim();
            if (!confirmPassword) {
                showError('Please confirm your password')
                referral.focus();
                return;
            }

            // validate that password and confirm password match
            if (password !== confirmPassword) {
                showError('Password and confirm password do not match')
                referral.focus();
                return;
            }

            // const pin = pinField.value.trim();
            // if (pin.length != 6) {
            //     showError('Please enter vaild Pin/Zip Code')
            //     pinField.focus();
            //     return;
            // }

            // validate the age checkbox
            if (!ageCheckbox.checked) {
                showError('Please confirm that your age and agree to the terms')
                referral.focus();
                return;
            }

            loginContainer.classList.add("hidden");
            loader.classList.remove("hidden");

            // if all fields are valid, submit the form data via AJAX
            fetch('/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cName: name,
                    cPhone: phone,
                    cEmail: email,
                    pass: password,
                    cpass: confirmPassword,
                    age_checkbox: ageCheckbox.value,
                    // Aname: addressNameField.value.trim(),
                    // Apin: pin,
                    // A1: addressLine1Field.value.trim(),
                    // A2: addressLine2Field.value.trim(),
                    // Acity: cityField.value.trim(),
                    // Astate: stateField.value.trim()
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
                    window.location.href = '/';
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
    } else {
        submitBtn.classList.add('btn-unselect');
        submitBtn.setAttribute('disabled', true);
    }
});
