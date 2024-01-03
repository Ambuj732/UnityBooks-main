//Adds the Product to Cart
function addToCart(pid, qty) {
	// const cookieValue = document.cookie.split('; ').find((cookie) => cookie.startsWith('isLoggedIn='))?.split('=')[1];
	// if (cookieValue) {
	fetch('/api/addToCart', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			pid: pid,
			qty: qty
		})
	})
		.then(response => {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.indexOf('application/json') !== -1) {
				return response.json();
			} else {
				return response.text();
			}
		})
		.then(data => {
			if (typeof data === 'string') {
				// The response is HTML, so redirect to the provided URL
				window.location.href = data;
			}
			else if (data.success === true) {
				window.location.href = '/cart';
			}
			else {
				console.log(data.error);
			}
		})
		.catch(error => {
			console.log(error);
		})
	// }
	// else {
	// 	window.location.href = '/login';
	// }
}