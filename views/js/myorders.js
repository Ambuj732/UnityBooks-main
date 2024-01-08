const myOrdersPage = document.getElementById("myOrders");
const emptyOrders = document.getElementById("emptyOrders");
const loader = document.getElementById("loader");

myOrdersPage.classList.add("hidden");

fetch('/api/myorders').then(response => response.json()).then(data => {
	if (data.success === true) {
		if (data.orders !== null) {
			console.log(data);

			const fragment = document.createDocumentFragment();
			data.orders.forEach((order, index) => {
				const oid = order.OID;
				const orderItems = data.orderItems[index]; // Get items for the current order

				const orderContainer = document.createElement('div');
				orderContainer.classList.add('margin-bottom', 'brad', 'shadow');
				orderContainer.id = 'orderContainer-' + oid;

				const orderStatus = order.STATUS;
				const modifiedDate = new Date(order.MODIFIED);
				const modifiedDateArray = modifiedDate.toDateString().split(' ');
				const orderDate = new Date(order.CREATED);
				const orderDateArray = orderDate.toDateString().split(' ');
				const delDate = new Date(order.CREATED);
				delDate.setDate(delDate.getDate() + 7);
				const today = new Date();
				today.setDate(today.getDate() + 2);
				const date = (today > delDate) ? today.toDateString().split(' ') : delDate.toDateString().split(' ');
				let deliveryStatusText = (orderStatus === 4) ? `Delivered on ${modifiedDateArray[2]} ${modifiedDateArray[1]} ${modifiedDateArray[3]}` : `Arriving by ${date[2]} ${date[1]} ${date[3]}`;

				const deliveryStatusHeading = document.createElement('h1');
				deliveryStatusHeading.classList.add('h-1', 'b', 'padding');
				deliveryStatusHeading.textContent = deliveryStatusText;
				orderContainer.appendChild(deliveryStatusHeading);

				const hrBeforeOrderDetails = document.createElement('div');
				hrBeforeOrderDetails.classList.add('hrstyle');
				orderContainer.appendChild(hrBeforeOrderDetails);

				const orderDetails = document.createElement('div');
				orderDetails.classList.add('flex-row', 'h-8', 'order-details');
				orderDetails.id = 'orderDetails-' + oid;

				const orderPlaced = document.createElement('div');
				orderPlaced.classList.add('flex-column', 'item-center');
				orderPlaced.innerHTML = `
				<div>ORDER DATE</div>
				<div>${orderDateArray[2]} ${orderDateArray[1]} ${orderDateArray[3]} at ${orderDate.toLocaleTimeString()}</div>`;
				orderDetails.appendChild(orderPlaced);

				const orderTotal = document.createElement('div');
				orderTotal.classList.add('flex-column', 'item-center', 'center');
				orderTotal.innerHTML = `
				<div>TOTAL</div>
				<div>&#8377;${order.TOTAL.toFixed(2)}</div>`;
				orderDetails.appendChild(orderTotal);

				const orderId = document.createElement('div');
				orderId.innerHTML = `ORDER # ${oid}`;
				orderDetails.appendChild(orderId);

				orderContainer.appendChild(orderDetails);

				const hrAfterOrderDetails = document.createElement('div');
				hrAfterOrderDetails.classList.add('hrstyle');
				orderContainer.appendChild(hrAfterOrderDetails);

				const orderDivisions = document.createElement('div');
				orderDivisions.classList.add('flex-column', 'padding', 'cartdivisions');
				orderDivisions.id = 'orderDivisions-' + oid;

				orderItems.forEach((item, i) => {
					const itemId = item.ITEMID;
					const product = data.products[index][i];

					const div1 = document.createElement('div');
					const div2 = document.createElement('div');
					const div3 = document.createElement('div');
					// const div4 = document.createElement('div');
					const div5 = document.createElement('div');
					const striker = document.createElement('strike');
					const span1 = document.createElement('span');
					// const span2 = document.createElement('span');

					div1.classList.add('cartitem', 'flex-row');
					div1.id = `${itemId}-${product.PID}`;

					div2.classList.add('flex', 'item-center');
					const a1 = document.createElement('a');
					a1.href = `/products?id=${product.PID}&name=${encodeURIComponent(product.NAME)}`;
					const img = document.createElement('img');
					img.src = product.IMG;
					img.alt = product.NAME;
					img.classList.add('cart-img');
					img.loading = 'lazy';
					img.title = product.NAME;
					a1.appendChild(img);
					div2.appendChild(a1);

					div3.classList.add('flex-colunm', 'margin-left-right', 'prod_det');
					const a2 = document.createElement('a');
					a2.href = `/products?id=${product.PID}&name=${encodeURIComponent(product.NAME)}`;
					const span3 = document.createElement('span');
					span3.id = `productName-${itemId}`;
					span3.classList.add('h-6', 'product-name');
					span3.textContent = product.NAME.substring(0, 45);
					a2.appendChild(span3);
					div3.appendChild(a2);

					// div4.classList.add('cartBtns', 'flex-row', 'margin-bottom', 'margin-top', 'margin-left-right');
					// const span4 = document.createElement('span');
					// span4.classList.add('num');
					// span4.id = `num-${itemId}`;
					// span4.textContent = item.QTY;
					// div4.appendChild(span4);

					div5.classList.add('flex-colunm', 'item-price-box', 'item-center');
					striker.classList.add('h-1');
					striker.id = `item-mrp-${itemId}`;
					striker.innerHTML = `&#8377;${product.MRP}`;
					div5.appendChild(striker);

					span1.classList.add('h-1');
					span1.id = `item-price-${itemId}`;
					span1.innerHTML = `&#8377;${product.SP}x(${item.QTY})`;
					div5.appendChild(span1);

					div1.appendChild(div2);
					div1.appendChild(div3);
					// div1.appendChild(div4);
					div1.appendChild(div5);
					orderDivisions.appendChild(div1);


					if (i < orderItems.length - 1) {
						const div6 = document.createElement('div');
						const div7 = document.createElement('div');
						div6.classList.add('margin-bottom');
						div6.appendChild(document.createElement('div'));
						div7.classList.add('hrstyle');
						const div8 = document.createElement('div');
						div8.classList.add('margin-bottom');
						div8.appendChild(document.createElement('div'));
						orderDivisions.appendChild(div6);
						orderDivisions.appendChild(div7);
						orderDivisions.appendChild(div8);
					}
				});
				// Append the orderContainer to the page if it has items
				if (orderItems.length > 0) {
					orderContainer.appendChild(orderDivisions);
					fragment.appendChild(orderContainer);
				}
			})
			myOrdersPage.classList.remove("hidden");
			loader.classList.add("hidden");
			myOrdersPage.appendChild(fragment);
		} else {
			console.log("No Orders Available");
			loader.classList.add("hidden");
			emptyOrders.classList.remove("hidden");
		}
	}
	else {
		console.log(data.error)
		loader.classList.add("hidden");
		emptyOrders.classList.remove("hidden");
	}
});