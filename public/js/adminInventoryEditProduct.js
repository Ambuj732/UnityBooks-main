const editProduct = () => {
	const discount = (((parseInt(mrp.value.trim()) - parseInt(sp.value.trim())) / parseInt(mrp.value.trim())) * 100).toFixed(1);

	let category1 = category_1.value.toUpperCase().trim();
	let category2 = category_2.value.toUpperCase().trim();

	if (category1 !== '') {
		let index = categories.indexOf(cat1);
		if (index !== -1 && category1 !== cat1) categories[index] = category1;
		else categories.push(category1);
	}
	else {
		let index = categories.indexOf(cat1);
		if (index !== -1) categories.splice(index, 1);
	}

	if (category2 !== '') {
		let index = categories.indexOf(cat2);
		if (index !== -1 && category2 !== cat2) categories[index] = category2;
		else categories.push(category2);
	}
	else {
		let index = categories.indexOf(cat2);
		if (index !== -1) categories.splice(index, 1);
	}

	fetch('/admin/editProduct', {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			pid: parseInt(pid.trim()),
			name: productName.value.trim(),
			isbn: parseInt(isbn.value.trim()),
			author: author.value.trim(),
			format: format.value.toUpperCase().trim(),
			language: language.value.toUpperCase().trim(),
			condition: condition.value.toUpperCase().trim(),
			mrp: parseInt(mrp.value.trim()),
			cp: parseInt(cp.value.trim()),
			sp: parseInt(sp.value.trim()),
			discount: discount,
			quantity: parseInt(quantity.value.trim()),
			pages: parseInt(pages.value.trim()),
			weight: parseInt(weight.value.trim()),
			description: description.value.trim(),
			category: categories,
			bid: bid[0],
			img: img.value.trim()
		})
	}).then(response => { return response.json(); }).then(data => {
		if (data.success === true) location.href = `/admin/inventory#product-${pid}`;
		else alert(data.error);
	}).catch(error => { console.error(error); })
}