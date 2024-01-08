const createProdRow = (() => {
	const prodRow = document.querySelector(".products-container");
	fetch('/admin/products').then(response => { return response.json() }).then(data => {
		const { products, noOfProducts } = data;
		const fragment = document.createDocumentFragment();
		products.forEach(product => {
			let pid = product.PID;
			let pName = (product.NAME.length > 25) ? `${product.NAME.trim().substring(0, 25)}...` : product.NAME.trim();

			// Create the product row container
			const productRow = document.createElement('div');
			productRow.classList.add('product-rows');
			productRow.classList.add('flex-row');
			productRow.id = `product-${pid}`;

			// Create the checkbox
			const checkboxDiv = document.createElement('div');
			checkboxDiv.classList.add('checkbox');
			checkboxDiv.id = `check-${pid}`;
			checkboxDiv.setAttribute('onclick', 'check(this.id)');

			checkboxDiv.innerHTML = `<svg class="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<mask id="mask0_33_557" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
						<rect width="24" height="24" fill="#F9FBFC" />
					</mask>
					<g mask="url(#mask0_33_557)">
						<path
							d="M9.99991 12.775L15.4999 7.27505C15.8166 6.95838 16.1832 6.80005 16.5999 6.80005C17.0166 6.80005 17.3832 6.95838 17.6999 7.27505C18.0166 7.59172 18.1749 7.96255 18.1749 8.38755C18.1749 8.81255 18.0166 9.18338 17.6999 9.50005L11.1249 16.1C10.8082 16.4167 10.4332 16.575 9.99991 16.575C9.56658 16.575 9.19158 16.4167 8.87491 16.1L6.27491 13.5C5.95824 13.1834 5.80408 12.8125 5.81241 12.3875C5.82074 11.9625 5.98324 11.5917 6.29991 11.275C6.61658 10.9584 6.98741 10.8 7.41241 10.8C7.83741 10.8 8.20824 10.9584 8.52491 11.275L9.99991 12.775Z"
							fill="#F9FBFC" />
					</g>
				</svg>`

			// Append the checkbox div to the product row container
			productRow.appendChild(checkboxDiv);

			// Create and append the rest of the product information (name, seller, price, mrp, view)
			// Create the product name element
			const productName = document.createElement('div');
			productName.classList.add('product-row', 'name');

			// Create the product image element
			const productImage = document.createElement('img');
			productImage.classList.add('product-image');
			productImage.alt = '';
			productImage.src = product.IMG;

			// Create the product name span
			const productNameSpan = document.createElement('span');
			productNameSpan.id = `name-${pid}`;
			productNameSpan.textContent = pName;

			// Append the product image and name span to the product name element
			productName.appendChild(productImage);
			productName.appendChild(productNameSpan);

			// // Create the product seller element
			// const productSeller = document.createElement('div');
			// productSeller.classList.add('product-row', 'seller');

			// // Create the product seller span
			// const productSellerSpan = document.createElement('span');
			// productSellerSpan.id = `seller-${pid}`;
			// productSellerSpan.textContent = product.SID;

			// // Append the product seller span to the product seller element
			// productSeller.appendChild(productSellerSpan);

			// Create the product price element
			const productPrice = document.createElement('div');
			productPrice.classList.add('product-row', 'price');

			// Create the product price span
			const productPriceSpan = document.createElement('span');
			productPriceSpan.id = `price-${pid}`;
			productPriceSpan.textContent = `₹${product.SP}`;

			// Append the product price span to the product price element
			productPrice.appendChild(productPriceSpan);

			// Create the product MRP element
			const productMRP = document.createElement('div');
			productMRP.classList.add('product-row', 'mrp');

			// Create the product MRP span
			const productMRPSpan = document.createElement('span');
			productMRPSpan.id = `mrp-${pid}`;
			productMRPSpan.textContent = `₹${product.MRP}`;

			// Append the product MRP span to the product MRP element
			productMRP.appendChild(productMRPSpan);

			// Create the product Weight element
			const productWeight = document.createElement('div');
			productWeight.classList.add('product-row', 'seller');

			// Create the product Weight span
			const productWeightSpan = document.createElement('span');
			productWeightSpan.id = `weight-${pid}`;
			productWeightSpan.textContent = product.WEIGHT;

			// Append the product Weight span to the product Weight element
			productWeight.appendChild(productWeightSpan);

			// Create the product view element
			const productView = document.createElement('div');
			productView.classList.add('product-row', 'view');

			// Create the product view anchor
			const productViewAnchor = document.createElement('a');
			productViewAnchor.classList.add('link-btn');
			productViewAnchor.id = `view-${pid}`;
			productViewAnchor.href = `/admin/inventoryViewProduct?id=${pid}`;

			// Create the product view span
			const productViewSpan = document.createElement('span');
			productViewSpan.classList.add('link-text');
			productViewSpan.textContent = 'View';

			productViewAnchor.innerHTML = `<span class="link-text">View</span>
			<svg class="link-icon" height="24" viewBox="0 -960 960 960" width="24" xmlns="http://www.w3.org/2000/svg">
				<path d="M508-481 343-647q-14-13-13.5-31.5T344-711q12-13 31.5-13t32.5 13l197 197q6 6 10.5 15t4.5 18q0 9-4.5 18T605-448L407-250q-13 13-32 12.5T344-251q-14-14-14-33t14-32l164-165Z" style="fill: rgb(0, 46, 111);"></path>
			</svg>`;

			// Append the product view anchor to the product view element
			productView.appendChild(productViewAnchor);

			// Append all the created elements to the product row container
			productRow.appendChild(productName);
			// productRow.appendChild(productSeller);
			productRow.appendChild(productPrice);
			productRow.appendChild(productMRP);
			productRow.appendChild(productWeight);
			productRow.appendChild(productView);

			// Append the product row container to the fragment
			fragment.appendChild(productRow);
		})

		// Append the fragment to the product rows container
		prodRow.appendChild(fragment);
	})
})();

const check = (checkboxId) => {
	const checkboxMain = document.getElementById(checkboxId);
	if (checkboxId === "check-all") {
		const checkboxes = document.getElementsByClassName("checkbox");
		if (checkboxMain.classList.contains('checked')) {
			// Convert HTMLCollection to an array and then iterate through it
			Array.from(checkboxes).forEach(checkbox => {
				checkbox.classList.remove('checked');
			});
		}
		else {
			// Convert HTMLCollection to an array and then iterate through it
			Array.from(checkboxes).forEach(checkbox => {
				checkbox.classList.add('checked');
			});
		}
	}
	else checkboxMain.classList.toggle('checked');
}
