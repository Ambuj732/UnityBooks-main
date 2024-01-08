const productContainer = document.querySelector(".product-container");

const params = window.location.search;
const urlParams = new URLSearchParams(params);
const searchString = decodeURIComponent(urlParams.get('name'));

let pageTitle = `Search Results: "${searchString}" | Unitybooks.in`;
document.title = pageTitle;

const Cname = document.getElementById('name');
Cname.innerText = `"${searchString}"`;

const searchText = searchString.toLowerCase().trim();

fetch('/getData/search', {
	method: "POST",
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		search: searchText
	})
}).then(response => response.json()).then(data => {
	const { products, noOfProducts } = data;
	console.log(data);
	const fragment = document.createDocumentFragment();

	products.forEach(product => {
		let pid = product.PID;
		let pName = (product.NAME.length > 30) ? `${product.NAME.trim().substring(0, 30)}...` : product.NAME.trim();

		const productCard = document.createElement('div');
		productCard.classList.add('product-card');
		productCard.id = product.PID;
		productCard.addEventListener('click', () => {
			productPage(pid, product.NAME);
		});

		const productImage = document.createElement('div');
		productImage.classList.add('product-image', 'flex', 'item-center');

		const discountTag = document.createElement('span');
		discountTag.classList.add('discount-tag');
		discountTag.textContent = `${Math.round(product.DISCOUNT)}% off`;
		productImage.appendChild(discountTag);

		const productThumb = document.createElement('img');
		productThumb.src = product.IMG;
		productThumb.classList.add('product-thumb');
		productThumb.alt = product.NAME;
		productThumb.loading = 'lazy';
		productThumb.title = product.NAME;
		productImage.appendChild(productThumb);

		const cardBtn = document.createElement('a');
		cardBtn.classList.add('card-btn');
		cardBtn.textContent = 'Add to Cart';
		cardBtn.addEventListener('click', () => {
			addToCart(pid, 1);
		});
		productImage.appendChild(cardBtn);

		productCard.appendChild(productImage);

		const productInfo = document.createElement('div');
		productInfo.classList.add('product-info');

		const productBrand = document.createElement('h3');
		productBrand.classList.add('product-brand');
		productBrand.textContent = pName;
		productInfo.appendChild(productBrand);

		const productShortDes = document.createElement('p');
		productShortDes.classList.add('product-short-des');
		productShortDes.textContent = product.AUTHOR.trim().substring(0, 40);
		productInfo.appendChild(productShortDes);

		const actualPrice = document.createElement('span');
		actualPrice.classList.add('actual-price');
		actualPrice.innerHTML = `&#8377;${product.MRP}`;
		productInfo.appendChild(actualPrice);

		const price = document.createElement('span');
		price.classList.add('price');
		price.innerHTML = `&#8377;${product.SP}`;
		productInfo.appendChild(price);

		productCard.appendChild(productInfo);

		fragment.appendChild(productCard); // Append the product card to the document fragment
	});
	productContainer.appendChild(fragment); // Append the document fragment to the DOM

}).catch(err => {
	console.log(err);
});

const productPage = (pid, pname) => {
	const encodedName = encodeURIComponent(pname);
	const url = `/products?id=${pid}&name=${encodedName}`;
	window.location.href = url;
};
