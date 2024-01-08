const category_Container = document.querySelector(".category-container");

fetch('/getData/categories').then(response => response.json()).then(data => {
	const { categories } = data;
	categories.forEach(category => {
		if (category.PARENT != 35 && category.PARENT != 10) {
			const fragment = document.createDocumentFragment(); // Create a document fragment

			const catCard = document.createElement('div');
			catCard.classList.add('category-card');
			catCard.id = category.NAME;
			catCard.addEventListener('click', () => {
				categoryPage(category.CATID, category.NAME);
			})

			const catImage = document.createElement('div');
			catImage.classList.add('category-image', 'flex', 'item-center');

			const catImg = document.createElement('img');
			catImg.src = category.IMG;
			catImg.classList.add('category-thumb');
			catImg.alt = category.NAME;
			catImg.loading = 'lazy';
			catImg.title = category.NAME;
			catImage.appendChild(catImg);

			const catInfo = document.createElement('div');
			catInfo.classList.add('category-info');
			const catName = document.createElement('h3');
			catName.classList.add('category-name');
			catName.innerText = category.NAME;
			catInfo.appendChild(catName);
			catImage.appendChild(catInfo);

			catCard.appendChild(catImage);

			fragment.appendChild(catCard);
			category_Container.appendChild(fragment);
		}
	})

}).catch(error => {
	console.error(error);
});

const categoryPage = (cid, cname) => {
	if (cid == 10) {
		window.location.href = '/manga';
	}
	else {
		const encodedName = encodeURIComponent(cname);
		const url = `/category?id=${cid}&name=${encodedName}`;
		window.location.href = url;
	}
}