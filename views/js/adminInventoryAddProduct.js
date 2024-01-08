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
const img = document.getElementById('img');
const description = document.getElementById('description');
const category_1 = document.getElementById('category-1');
const category_2 = document.getElementById('category-2');

const cat_boxes = document.querySelectorAll(".cat-box");

const addProduct = () => {

	if (category_1.value !== "") categories.push(category_1.value);
	if (category_2.value !== "") categories.push(category_2.value);

	const prodVal = (productName.value) ? productName.value.trim() : null;
	const isbnVal = (isbn.value) ? parseInt(isbn.value.trim()) : null;
	const authorVal = (author.value) ? author.value.trim() : null;
	const formatVal = (format.value) ? format.value.trim().toUpperCase() : "PAPERBACK";
	const languageVal = (language.value) ? language.value.trim().toUpperCase() : "ENGLISH";
	const conditionVal = (condition.value) ? condition.value.trim().toUpperCase() : "NEW";
	const mrpVal = (mrp.value) ? parseInt(mrp.value.trim()) : null;
	const cpVal = (cp.value) ? parseInt(cp.value.trim()) : null;
	const spVal = (sp.value) ? parseInt(sp.value.trim()) : null;
	const quantityVal = (quantity.value) ? parseInt(quantity.value.trim()) : 1;
	const pagesVal = (pages.value) ? parseInt(pages.value.trim()) : null;
	const weightVal = (weight.value) ? parseInt(weight.value.trim()) : 200;
	const imgVal = (img.value) ? img.value.trim() : null;
	const descriptionVal = (description.value) ? description.value.trim() : null;

	const discount = (((parseInt(mrp.value.trim()) - parseInt(sp.value.trim())) / parseInt(mrp.value.trim())) * 100).toFixed(1);

	fetch("/admin/addProduct", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: prodVal,
			isbn: isbnVal,
			author: authorVal,
			format: formatVal,
			language: languageVal,
			condition: conditionVal,
			mrp: mrpVal,
			cp: cpVal,
			sp: spVal,
			discount: discount,
			quantity: quantityVal,
			pages: pagesVal,
			weight: weightVal,
			description: descriptionVal,
			category: categories,
			img: imgVal
		})
	}).then(response => { return response.json(); }).then(data => {
		if (data.success === true) location.href = '/admin/inventory';
		else alert(data.error);
	}).catch(error => { console.error(error); })
}