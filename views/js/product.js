const product_Containers = document.querySelectorAll(".product-container");
const category_Container = document.querySelector(".category-container");
const author_Container = document.querySelector(".author-container");

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

product_Containers.forEach(productContainer => {
    let categoryName = productContainer.id;
    fetch('/getData/prodcat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            category: categoryName
        })
    }).then(response => response.json()).then(data => {
        const { products, noOfProducts } = data;
        const fragment = document.createDocumentFragment(); // Create a document fragment

        products.forEach((product, index) => {
            let pid = product.PID;
            let pName = (product.NAME.length > 30) ? `${product.NAME.trim().substring(0, 30)}...` : product.NAME.trim();
            let pAuth = (product.AUTHOR.length > 25) ? `${product.AUTHOR.trim().substring(0, 25)}...` : product.AUTHOR.trim();

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

            if (categoryName.toUpperCase() === 'BESTSELLERS') {
                const bestSellersTag = document.createElement('div');
                bestSellersTag.classList.add('bestsellers-tag');
                bestSellersTag.textContent = (index + 1);
                productImage.appendChild(bestSellersTag);
            }

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
            productShortDes.textContent = pAuth;
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
})

fetch('/getData/authors').then(response => response.json()).then(data => {
    const { authors } = data;
    authors.forEach(author => {
        const fragment = document.createDocumentFragment(); // Create a document fragment

        const authorCard = document.createElement('div');
        authorCard.classList.add('author-card');
        authorCard.id = author.NAME;
        authorCard.addEventListener('click', () => {
            categoryPage(author.CATID, author.NAME);
        })

        const authorImage = document.createElement('div');
        authorImage.classList.add('author-image', 'flex', 'item-center');

        const authorImg = document.createElement('img');
        authorImg.src = author.IMG;
        authorImg.classList.add('author-thumb');
        authorImg.alt = author.NAME;
        authorImg.loading = 'lazy';
        authorImg.title = author.NAME;
        authorImage.appendChild(authorImg);
        authorCard.appendChild(authorImage);

        const authorInfo = document.createElement('div');
        authorInfo.classList.add('author-info');
        const authorName = document.createElement('h3');
        authorName.classList.add('author-name');
        authorName.innerText = author.NAME;
        authorInfo.appendChild(authorName);
        authorCard.appendChild(authorInfo);

        fragment.appendChild(authorCard);
        author_Container.appendChild(fragment);
    })
}).catch(error => {
    console.error(error);
});

// Opens the Product Page
const productPage = (pid, pname) => {
    const encodedName = encodeURIComponent(pname);
    const url = `/products?id=${pid}&name=${encodedName}`;
    window.location.href = url;
};

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