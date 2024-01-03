const cartPage = document.getElementById("cartpage");
const emptyCart = document.getElementById("emptyCart");
const loader = document.getElementById("loader");
const cartContainer = document.getElementById("cartContainer");
const noOfItems = document.getElementById("noOfItems");
const dDate = document.getElementById("dDate");
const totalBox = document.getElementById("p_tot");
const subTotalBox = document.getElementById("p_subtot");
const savingBox = document.getElementById("p_save");
const deliveryBox = document.getElementById("p_del");
const extraBox = document.getElementById("p_extra");
const couponAmtBox = document.getElementById("p_coupon");
const grandTotalBox = document.getElementById("p_grandtot");
const checkoutBtn = document.getElementById("checkout_btn");
const giftBox = document.getElementById("giftBox");
const giftBoxBtn = document.getElementById("bbox");
const coupons = document.getElementById("coupons");

let mins = {};

cartPage.classList.add("hidden");
emptyCart.classList.add("hidden");

let deliveryCharge = 35;
const codCharge = 25;
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 5);
let extras = 0;

// Array of month names
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const date = `${futureDate.getDate().toString().padStart(2, '0')} ${months[futureDate.getMonth()]} ${futureDate.getFullYear().toString()}`;

async function getCoupons() {
	fetch('/getData/coupons').then(response => response.json()).then(data => {
		if (data.success === true) {
			if (parseInt(data.noOfCoupons) !== 0) {
				data.coupons.forEach(coupon => {
					let discount = (coupon.DISCOUNT) ? `${coupon.DISCOUNT}% OFF` : "";
					let upto;
					if (coupon.UPTO === null) upto = "";
					else if (coupon.DISCOUNT) upto = ` upto ₹${coupon.UPTO}`;
					else upto = `₹${coupon.UPTO} CASHBACK`;
					mins[coupon.COUPONID] = parseInt(coupon.MIN);
					coupons.innerHTML += `
						<div class="coupon-items flex-colunm margin-top w-full brad dashed-border" id="coupon-${coupon.COUPONID}">
							<div class="flex-row item-space-between w-full">
								<p class="coupon-heading">${coupon.NAME}</p>
								<div class="green-box hidden" id="freeDel-${coupon.COUPONID}">
									<p class="coupon-special">FREE DELIVERY</p>
								</div>
								<div class="orange-box" id="limOffer-${coupon.COUPONID}">
									<p class="coupon-special">LIMITED OFFER</p>
								</div>
							</div>
							<div class="flex-row item-space-between w-full">
								<p class="text coupon-offer">${discount}${upto}</p>
								<p class="text coupon-offer">Min order value: ₹${parseInt(coupon.MIN)}</p>
							</div>
							<div class="flex-row item-space-between w-full">
								<p class="text coupon-desc">${coupon.DESCRIPTION}</p>
								<button type="button" disabled=true id="applyCoupon-${coupon.COUPONID}" class="applyCouponBtn applyCouponBtnDisabled"
									onclick="applyCoupon(${coupon.COUPONID})">APPLY</button>
							</div>
							<div class="flex-row item-space-between w-full error-box">
								<p class="center" id="error-${coupon.COUPONID}">${coupon.ERROR}</p>
							</div>
						</div>
					`
					const startTimestamp = new Date(coupon.START).getTime();
					const endTimestamp = new Date(coupon.END).getTime();
					const diff = 16 * 24 * 60 * 60 * 1000;

					if (parseInt(coupon.DELIVERY) === 1 && endTimestamp - startTimestamp > diff) {
						document.getElementById(`freeDel-${coupon.COUPONID}`).classList.remove('hidden');
						document.getElementById(`limOffer-${coupon.COUPONID}`).classList.add('hidden');
					}
					else if (parseInt(coupon.DELIVERY) === 0 && endTimestamp - startTimestamp > diff) {
						document.getElementById(`freeDel-${coupon.COUPONID}`).classList.add('hidden');
						document.getElementById(`limOffer-${coupon.COUPONID}`).classList.add('hidden');
					}

				});

			} else {
				coupons.innerHTML = `
					<div class="coupon-items flex-colunm margin-top w-full">
						<div class="flex-row item-space-between w-full">
							<p class="coupon-heading">NO COUPONS AVAILABLE</p>
						</div>
					</div>
				`
			}
		} else {
			coupons.innerHTML = `
				<div class="coupon-items flex-colunm margin-top w-full">
					<div class="flex-row item-space-between w-full">
						<p class="coupon-heading">NO COUPONS AVAILABLE</p>
					</div>
				</div>
				`
			console.log(data);
			throw Error(data.error);
		}
	}).catch(error => {
		coupons.innerHTML = `
			<div class="coupon-items flex-colunm margin-top w-full">
				<div class="flex-row item-space-between w-full">
					<p class="coupon-heading">NO COUPONS AVAILABLE</p>
				</div>
			</div>
			`
		console.log(error);
	})
}

getCoupons();

async function fetchCartData() {
	fetch('/api/getCart').then(response => response.json()).then(data => {
		if (data.success === true) {
			if (data.products !== null) {
				loader.classList.add("hidden");
				cartPage.classList.remove("hidden");
				data.products.forEach((item, index) => {
					cartContainer.innerHTML += `
						<div class="cartitem flex-row" id="${data.cartItems[index].ITEMID}-${item.PID}">
							<div class="flex item-center">
								<a href="/products?id=${item.PID}&name=${encodeURIComponent(item.NAME)}">
									<img src="${item.IMG}" alt="${item.NAME}" class="cart-img" loading="lazy" title="${item.NAME}">
								</a>
							</div>
							<div class="flex-colunm margin-left-right prod_det">
								<a href="/products?id=${item.PID}&name=${encodeURIComponent(item.NAME)}">
									<span id="productName-${data.cartItems[index].ITEMID}" class="h-6 product-name">${item.NAME.substring(0, 45)}</span>
								</a>
								<div class="cartBtns flex-row margin-bottom margin-top">
									<button id="removeBtn-${data.cartItems[index].ITEMID}" class="btnlink h-8" type="button" onclick="removeFromCart(${item.PID}, ${data.cartItems[index].ITEMID}, ${data.cartItems[index].QTY})"> <img src="img/trash.svg" class="trash-icon">Delete</button>
									<div class="qty h-8 black unselectable">
										<div class="qtybox flex item-center">
											<span class="minus unselectable us" id="minus-${data.cartItems[index].ITEMID}" onclick="decrement(${item.PID}, ${data.cartItems[index].ITEMID}, ${data.cartItems[index].QTY})">-</span>
											<span class="num" id="num-${data.cartItems[index].ITEMID}">${data.cartItems[index].QTY}</span>
											<span class="plus unselectable us" id="plus-${data.cartItems[index].ITEMID}" onclick="increment(${item.PID}, ${data.cartItems[index].ITEMID}, ${data.cartItems[index].QTY})">+</span>
										</div>
									</div>
								</div>
							</div>
							<div class="flex-colunm item-price-box item-center">
								<strike class="h-1" id="item-mrp">
									&#8377;${item.MRP}
								</strike>
								<span class="h-1" id="item-price">
									&#8377;${item.SP}x(${data.cartItems[index].QTY})
								</span>
							</div>
						</div>
	
						<div class="margin-bottom">
							<div></div>
						</div>
						<div class="hrstyle"></div>
						<div class="margin-bottom">
							<div></div>
						</div>
					`;
				});
				noOfItems.innerText = data.cart[0].ITEMS;
				dDate.innerText = "Arrives by " + date;
				totalBox.innerText = data.cart[0].TOTAL;
				subTotalBox.innerText = data.cart[0].SUBTOTAL;
				savingBox.innerText = data.cart[0].TOTAL - data.cart[0].SUBTOTAL;
				extraBox.innerText = extras;
				updateCoupon(data.cart[0].COUPON);
				let couponAmtVal = (data.cart[0].COUPONAMT) ? parseInt(data.cart[0].COUPONAMT) : 0;
				deliveryBox.innerText = deliveryCharge;
				couponAmtBox.innerText = couponAmtVal;
				grandTotalBox.innerText = data.cart[0].SUBTOTAL + deliveryCharge - couponAmtVal;
			}
			else {
				loader.classList.add("hidden");
				cartPage.classList.add("hidden");
				emptyCart.classList.remove('hidden');
			}
		}
		else {
			console.log(data);
			loader.classList.add("hidden");
			cartPage.classList.add("hidden");
			emptyCart.classList.remove('hidden');
		}
	}).catch(error => {
		console.log(error);
		loader.classList.add("hidden");
		cartPage.classList.add("hidden");
		emptyCart.classList.remove('hidden');
	})
}

fetchCartData();

function updateCoupon(couponExists) {
	localStorage.removeItem("couponId");
	const couponIds = Object.keys(mins);
	const subtotal = parseInt(subTotalBox.innerText);
	if (couponExists) {
		fetch('/setData/checkCoupons').then(response => response.json()).then(data => {
			console.log(data);
			if (data.success === true) {
				couponIds.forEach(couponId => {
					if (parseInt(couponId) === parseInt(couponExists)) {
						const couponsText = document.getElementById("couponsText");
						couponsText.innerText = "Coupon Applied!";
						const id = `applyCoupon-${couponId}`;
						const applyButton = document.getElementById(id);
						applyButton.setAttribute("disabled", true);
						applyButton.classList.add("applyCouponBtnDisabled");
						if (data.result[0].DELIVERY === 1) deliveryCharge = 0;
						localStorage.setItem("couponId", parseInt(couponId));
					}
					else {
						const id = `coupon-${couponId}`;
						const couponIdBox = document.getElementById(id);
						couponIdBox.classList.add("hidden");
						const applyButton = document.getElementById(`applyCoupon-${couponId}`);
						applyButton.setAttribute("disabled", true);
						applyButton.classList.add("applyCouponBtnDisabled");
					}
				});
			}
			else {
				couponIds.forEach(couponId => {
					const min = parseInt(mins[couponId]);
					const id = `applyCoupon-${couponId}`;
					const applyButton = document.getElementById(id);

					if (min <= subtotal) {
						// Enable the button
						applyButton.removeAttribute("disabled");
						applyButton.classList.remove("applyCouponBtnDisabled");
					} else {
						// Disable the button
						applyButton.setAttribute("disabled", true);
						applyButton.classList.add("applyCouponBtnDisabled");
					}
				});
			}
		})
	}
	else {
		couponIds.forEach(couponId => {
			const min = parseInt(mins[couponId]);
			const id = `applyCoupon-${couponId}`;
			const applyButton = document.getElementById(id);

			if (min <= subtotal) {
				// Enable the button
				applyButton.removeAttribute("disabled");
				applyButton.classList.remove("applyCouponBtnDisabled");
			} else {
				// Disable the button
				applyButton.setAttribute("disabled", true);
				applyButton.classList.add("applyCouponBtnDisabled");
			}
		});
	}
}

function applyCoupon(couponId) {
	let coupon = parseInt(couponId);
	fetch('/api/addCoupon', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ coupon: coupon })
	}).then(response => response.json()).then(data => {
		if (data.success === true) {
			updateCoupon(coupon);
			window.location.reload();
		}
		else console.log(data);
	}).catch(error => {
		console.log(error);
	})
}

// Remove the Item from CART_ITEMS Table and Update CART Table
function removeFromCart(pid, itemId, qty) {
	fetch('/api/updateCart', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			itemId: itemId,
			pid: pid,
			qty: qty,
			newQty: 0
		})
	}).then(response => response.json()).then(data => {
		console.log(data);
		if (data.success === true) {
			cartContainer.innerHTML = "";
			localStorage.removeItem("couponId");
			fetchCartData();
		}
	}).catch(error => {
		console.log(error);
	})
}

// Update CART_ITEMS and CART Table
function increment(pid, itemId, qty) {
	let newQty = qty + 1;
	fetch('/api/updateCart', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			itemId: itemId,
			pid: pid,
			qty: qty,
			newQty: newQty
		})
	}).then(response => response.json()).then(data => {
		console.log(data);
		if (data.success === true) {
			cartContainer.innerHTML = "";
			let couponId = parseInt(localStorage.getItem("couponId"));
			if (couponId) applyCoupon(couponId);
			else fetchCartData();
		}
	}).catch(error => {
		console.log(error);
	})
}

function decrement(pid, itemId, qty) {
	let newQty = qty - 1;
	fetch('/api/updateCart', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			itemId: itemId,
			pid: pid,
			qty: qty,
			newQty: newQty
		})
	}).then(response => response.json()).then(data => {
		console.log(data);
		if (data.success === true) {
			cartContainer.innerHTML = ""
			let couponId = parseInt(localStorage.getItem("couponId"));
			if (couponId) applyCoupon(couponId);
			else fetchCartData();
		}
	}).catch(error => {
		console.log(error);
	})
}

// giftBoxBtn.onclick = () => {
// 	giftBox.classList.add('hidden');
// 	extras = 49;
// 	extraBox.innerText = extras;
// }

checkoutBtn.addEventListener('click', () => {
	localStorage.setItem('deliveryCharge', deliveryCharge);
	localStorage.setItem('extraCharge', extras);
	window.location.href = '/checkout';
})