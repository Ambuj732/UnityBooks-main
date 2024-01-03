const Containers = [document.querySelector('.category-container'), ...document.querySelectorAll('.product-container'), document.querySelector('.author-container')];
const nxtBtn = [...document.querySelectorAll('.nxt-btn')];
const preBtn = [...document.querySelectorAll('.pre-btn')];

Containers.forEach((item, i) => {
    let containerDimensions = item.getBoundingClientRect();
    let containerWidth = (containerDimensions.width);

    nxtBtn[i].addEventListener('click', () => {
        item.scrollLeft += containerWidth;
    })

    preBtn[i].addEventListener('click', () => {
        item.scrollLeft -= containerWidth;
    })
})
