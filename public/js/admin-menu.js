const menu = (itemId) => {
	const items = document.getElementsByClassName('menu-item');
	Array.from(items).forEach(item => {
		item.classList.remove('active');
	});
	const menuItem = document.getElementById(itemId);
	menuItem.classList.add('active');
}