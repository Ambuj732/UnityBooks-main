let categories = [];
let cat1 = null, cat2 = null;

const catboxClicked = (id) => {
	const catbox = document.getElementById(id);
	catbox.classList.toggle("checked");
	const catName = catbox.textContent.toUpperCase().trim();
	if (!categories.includes(catName)) categories.push(catName);
	else categories.splice(categories.indexOf(catName), 1);
}