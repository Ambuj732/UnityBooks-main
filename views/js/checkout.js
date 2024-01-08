const checkOutPage = document.getElementById('checkOutPage');
const loader = document.getElementById('loader');

checkOutPage.classList.add('hidden');

const noOfItems = document.getElementById("noOfItems");
const dDate = document.getElementById("dDate");
const subTotalBox = document.getElementById("p_subtot");
const savingBox = document.getElementById("p_save");
const deliveryBox = document.getElementById("p_del");
const totalBox = document.getElementById("p_tot");
const extraBox = document.getElementById("p_extra");
const couponAmtBox = document.getElementById("p_coupon");
const checkoutBtn = document.getElementById("checkout_btn");
const onlineRadio = document.getElementById('online');
const codRadio = document.getElementById('cod');

const nameField = document.querySelector('#cName');
const phoneField = document.querySelector('#cPhone');
const emailField = document.querySelector('#cEmail');
const addressLine1Field = document.querySelector('#A1');
const addressLine2Field = document.querySelector('#A2');
const cityField = document.querySelector('#Acity');
const stateField = document.querySelector('#Astate');
const pinField = document.querySelector('#Apin');

let amt;
let cod = 0;

const deliveryCharge = (localStorage.getItem('deliveryCharge') !== null) ? parseInt(localStorage.getItem('deliveryCharge')) : 35;
const extraCharge = (localStorage.getItem('extras') !== null) ? parseInt(localStorage.getItem('extras')) : 0;
const codCharges = 25;
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 5);

// Array of month names
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const date = `${futureDate.getDate().toString().padStart(2, '0')} ${months[futureDate.getMonth()]} ${futureDate.getFullYear().toString()}`;

fetch('/getData/address').then(response => response.json()).then(data => {
	if (!(data.success === true & data.address.length > 0)) window.location.href = '/addAddress';
})

fetch('/api/getCart').then(response => response.json()).then(data => {
	if (data.success === true) {
		if (data.products !== null) {
			loader.classList.add('hidden');
			checkOutPage.classList.remove('hidden');
			noOfItems.innerText = data.cart[0].ITEMS;
			dDate.innerText += " " + date;
			subTotalBox.innerText = data.cart[0].SUBTOTAL;
			savingBox.innerText = data.cart[0].TOTAL - data.cart[0].SUBTOTAL;
			deliveryBox.innerText = deliveryCharge;
			extraBox.innerText = extraCharge;
			let couponAmt = (data.cart[0].COUPONAMT) ? data.cart[0].COUPONAMT : 0;
			couponAmtBox.innerText = couponAmt;
			amt = parseFloat(data.cart[0].SUBTOTAL) + parseFloat(deliveryCharge) + parseFloat(extraCharge) - parseFloat(couponAmt);
			totalBox.innerText = amt;
		}
		else {
			window.location.href = "/cart";
		}
	}
	else {
		console.log(data);
		window.location.href = "/cart";
	}
}).catch(error => {
	console.log(error);
})

fetch('/api/getDetails').then(response => response.json()).then(data => {
	if (data.success === true) {
		nameField.value = data.name;
		phoneField.value = data.phone;
		emailField.value = data.email;
		addressLine1Field.value = data.address1;
		addressLine2Field.value = data.address2;
		cityField.value = data.city;
		stateField.value = data.state;
		pinField.value = data.pin;
	}
}).catch(error => {
	console.log(error);
})

codRadio.addEventListener('click', () => {
	let extraCharges = parseInt(extraBox.innerText);
	if (extraCharges < codCharges + extraCharge) {
		let oldAmt = parseFloat(totalBox.innerText);
		extraBox.innerText = extraCharges + codCharges;
		amt = oldAmt + codCharges
		totalBox.innerText = amt;
		cod = 1;
	}
})

onlineRadio.addEventListener('click', () => {
	let extraCharges = parseInt(extraBox.innerText);
	if (extraCharges >= codCharges) {
		let oldAmt = parseFloat(totalBox.innerText);
		extraBox.innerText = extraCharges - codCharges;
		amt = oldAmt - codCharges
		totalBox.innerText = amt;
		cod = 0;
	}
})

checkoutBtn.addEventListener('click', async () => {
	let extraCharges = parseInt(extraBox.innerText);
	let charges = deliveryCharge + extraCharges;
	if (cod === 1) {
		console.log(true);
		let responses = await fetch('/api/orders', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				amt: amt,
				paymentId: "COD",
				deliveryCharge: charges,
			})
		})
		let payResponse = await responses.json();
		if (payResponse.success === true) {
			location.href = '/success';
		}
	}

	else {
		let response = await fetch('/orders', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				amount: amt,
			})
		})

		let orderData = await response.json();

		fetch('/razorpay/pay')
			.then(response => response.json())
			.then(data => {
				const name = data.name;
				const phone = data.phone;
				const email = data.email;

				var options = {
					"key": "rzp_live_uQGjObim82lWnp",
					"amount": amt * 100,
					"currency": "INR",
					"order_id": orderData.id,
					"name": "Unity Books",
					"description": "Book Purchase | Online Order",
					"image": "img/logoU.png",
					"handler": function (response) {
						if (typeof response.razorpay_payment_id == 'undefined' || response.razorpay_payment_id < 1) {
							location.href = '/failure';
						} else {
							async function paymentSuccess() {
								let responses = await fetch('/api/orders', {
									method: "POST",
									headers: {
										"Content-Type": "application/json"
									},
									body: JSON.stringify({
										amt: amt,
										paymentId: response.razorpay_payment_id,
										deliveryCharge: charges,
									})
								})
								let payResponse = await responses.json();
								console.log(payResponse);
								if (payResponse.success === true) {
									location.href = '/success';
								}
							}
							paymentSuccess();
						}
					},
					"prefill": {
						"name": name,
						"email": email,
						"contact": phone
					},
					"theme": {
						"color": "#002e6f"
					}
				};
				var rzp1 = new Razorpay(options);
				rzp1.open();
			})
			.catch(error => console.error(error));
	}
})
