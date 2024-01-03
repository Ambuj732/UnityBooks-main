// Function to insert the image gallery
const insertImageGallery = (imgUrl) => {
	// Title
	const params = window.location.search;
	const urlParams = new URLSearchParams(params);
	const pid = urlParams.get('id');
	const pName = decodeURIComponent(urlParams.get('name'));

	let pageTitle = pName + " | Unitybooks.in"
	document.title = pageTitle;

	// Insert image
	const imgGallery = document.getElementById('imgGallery');
	imgGallery.innerHTML += `
	<img src="${imgUrl}" alt="" decoding="async" loading="lazy" id="myImg" title="Zoom In" />
	<div id="myModal" class="modal">
	<img class="modal-content" id="img01" alt="" decoding="async" loading="lazy" title="Zoom Out" />
	</div>
	`;
	const imgUrlBox = document.getElementById('img_url');
	imgUrlBox.innerHTML = "";

	// Check if out of stock or not
	const productQty = document.getElementById('productQty');
	const outOfStock = document.getElementById('outOfStock');

	if (productQty.innerText === '0') outOfStock.classList.remove('hidden');

	// Calculate discount amount
	const mrp = parseFloat(document.getElementById('mrp').innerText);
	const sp = parseFloat(document.getElementById('sp').innerText);
	const discountAmt = document.getElementById('discountAmt');

	const discountAmount = mrp - sp;
	discountAmt.innerText = math.round(discountAmount);

	// Product Link
	const productLink = document.getElementById('pLink');
	const productName = document.getElementById('pName');
	let pNameText = productName.innerText.trim();
	productLink.innerText = (pNameText.length > 25) ? `${pNameText.substring(0, 25)}...` : pNameText;

	// Prod Description
	const prodDesc = document.getElementById('prodDesc');
	const descTextBox = document.getElementById('desc');
	let descText = prodDesc.innerText;
	descTextBox.innerHTML = (descText.length > 300) ? `${descText.substring(0, 300).trim()} ...<a class="color-sec" id="readMore">Read More</a>` : descText.trim();

	// Zoom in and Out for Image
	var modal = document.getElementById("myModal");
	var img = document.getElementById("myImg");
	var modalImg = document.getElementById("img01");
	img.onclick = function () {
		modalImg.src = this.src;
		setTimeout(function () {
			modal.style.display = "block";
		}, 300);
	};

	//Share btn
	const shareData = {
		title: 'Check out this amazing product!',
		url: window.location.href
	};

	const facebookBtn = document.getElementById('facebookBtn');
	const whatsappBtn = document.getElementById('whatsappBtn');
	const twitterBtn = document.getElementById('twitterBtn');
	const instagramBtn = document.getElementById('instagramBtn');

	const text = `${shareData.title} \n ${shareData.url}`;
	facebookBtn.addEventListener('click', () => shareToSocialMedia('facebook'));
	whatsappBtn.addEventListener('click', () => shareToSocialMedia('whatsapp'));
	twitterBtn.addEventListener('click', () => shareToSocialMedia('twitter'));
	instagramBtn.addEventListener('click', () => shareToSocialMedia('instagram'));

	const shareToSocialMedia = async (platform) => {
		const socialMediaUrls = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
			twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`,
			instagram: `https://www.instagram.com/`,
			whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.title + ' ' + shareData.url)}`,
		};

		const socialMediaUrl = socialMediaUrls[platform];
		if (socialMediaUrl) window.open(socialMediaUrl, '_blank');
	};

	// When the user clicks on <span> (x), close the modal
	modal.onclick = function () {
		modalImg.className += " out";
		setTimeout(function () {
			modal.style.display = "none";
			modalImg.className = "modal-content";
		}, 300);
	};

	const cartbtn = document.getElementById("cartbtn");
	const buybtn = document.getElementById("buybtn");

	cartbtn.addEventListener("click", () => {
		const qty = document.getElementById('qty').innerText;
		addToCart(pid, qty);
	})

	buybtn.addEventListener("click", () => {
		const qty = document.getElementById('qty').innerText;
		addToCart(pid, qty);
	})

	// Quantity Box
	const plus = document.querySelector(".plus"), minus = document.querySelector(".minus"), num = document.querySelector(".num");
	let a = 1;
	plus.addEventListener("click", () => {
		if (a < 5) {
			a++;
			num.innerText = a;
		}
	});
	minus.addEventListener("click", () => {
		if (a > 1) {
			a--;
			num.innerText = "" + a;
		}
	});

	// Description and Details
	var btn1 = document.getElementById("btn1");
	var btn2 = document.getElementById("btn2");
	var desc = document.getElementById("prod_desc");
	var dets = document.getElementById("prod_details");
	var s1 = document.getElementById("s1");
	var s2 = document.getElementById("s2");

	btn2.addEventListener("click", () => {
		dets.style.display = "block";
		desc.style.display = "none";
		btn1.classList.remove("active");
		btn2.classList.add("active");
		s1.classList.remove("activespan");
		s2.classList.add("activespan");
	});

	btn1.addEventListener("click", () => {
		dets.style.display = "none";
		desc.style.display = "block";
		btn1.classList.add("active");
		btn2.classList.remove("active");
		s1.classList.add("activespan");
		s2.classList.remove("activespan");
	});

	readMore.addEventListener("click", () => {
		if (btn1.classList.contains("active")) {
			s1.scrollIntoView({ behavior: 'smooth' });
		}
		else {
			dets.style.display = "none";
			desc.style.display = "block";
			btn1.classList.add("active");
			btn2.classList.remove("active");
			s1.classList.add("activespan");
			s2.classList.remove("activespan");
			s1.scrollIntoView({ behavior: 'smooth' });
		}
	})
};

// Function to check if the URL is added to the span element
const checkUrlAdded = () => {
	const imgUrl = document.getElementById('img_url').innerText;
	if (imgUrl.trim() !== '') insertImageGallery(imgUrl); // Insert the image gallery once the URL is added
	else setTimeout(checkUrlAdded, 250); // If the URL is not added yet, wait and check again after a short delay
};

// Start the initial check
checkUrlAdded();

/**
 * Toggles the visibility of the shareMain element.
 *
 * @return {undefined} No return value.
 */
const toggleShare = () => {
	const shareMain = document.getElementById('shareMain');
	const share = document.getElementsByClassName('share')[0];
	setTimeout(() => {
		share.classList.toggle('shadow');
		share.classList.toggle('brad');
		shareMain.classList.toggle('hidden');
	}, 150);
}
