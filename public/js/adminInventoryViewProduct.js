// Ids of all the inputs and category boxes
const productName = document.getElementById('productName');
const isbn = document.getElementById('isbn');
const author = document.getElementById('author');
const format = document.getElementById('format');
const language = document.getElementById('language');
const condition = document.getElementById('condition');
const mrp = document.getElementById('mrp');
const cp = document.getElementById('cp');
const sp = document.getElementById('sp');
const quantity = document.getElementById('quantity');
const pages = document.getElementById('pages');
const weight = document.getElementById('weight');
const description = document.getElementById('description');
const img = document.getElementById('img');
const category_1 = document.getElementById('category-1');
const category_2 = document.getElementById('category-2');

const cat_boxes = document.querySelectorAll(".cat-box");

// Get PID from URL
const params = window.location.search;
const urlParams = new URLSearchParams(params);
const pid = urlParams.get('id');

// Make a Queue to store bid
const bid = [];

// Sends the Product ID to the server and fetches the product details from the database
fetch('/admin/product', {
	method: "POST",
	headers: {
		"Content-Type": "application/json"
	},
	body: JSON.stringify({ pid: pid })
}).then(response => { return response.json(); }).then(data => {
	if (data.success === true) {
		// Set page title as the product name
		let pageTitle = data.product[0].NAME + " | View/Edit Product | Sales Dashboard | Unitybooks.In"
		document.title = pageTitle;

		// Update the product details in the DOM
		productName.value = data.product[0].NAME;
		isbn.value = data.product[0].ISBN;
		author.value = data.product[0].AUTHOR;
		format.value = data.product[0].FORMAT;
		language.value = data.product[0].LANG;
		condition.value = data.product[0].COND;
		mrp.value = data.product[0].MRP;
		cp.value = data.product[0].CP;
		sp.value = data.product[0].SP;
		quantity.value = data.product[0].QTY;
		pages.value = data.product[0].PAGES;
		weight.value = data.product[0].WEIGHT;
		description.value = data.product[0].DESCRIPTION;
		img.value = data.product[0].IMG;

		bid.push(data.product[0].BID);

		// Update the product categories in the DOM
		Array.from(data.categories).forEach(cat => {
			categories.push(cat.NAME);
			if ((cat.PARENT !== null && cat.PARENT !== 34 && cat.PARENT !== 35) || cat.CATID === 34 || cat.CATID === 112) {
				let checked = 0;
				Array.from(cat_boxes).forEach(cat_box => {
					let catName = cat_box.textContent.toUpperCase().trim();
					if (cat.NAME === catName) {
						cat_box.classList.add("checked");
						checked = 1;
					}
				});
				if (checked === 0) {
					if (category_1.value === null || category_1.value === '') {
						category_1.value = cat.NAME;
						cat1 = cat.NAME;
					}
					else if (category_2.value === null || category_2.value === '') {
						category_2.value = cat.NAME;
						cat2 = cat.NAME;
					}
				}
			}
		})
	}
})