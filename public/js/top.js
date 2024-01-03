var mybutton = document.getElementById("myBtn");
var btn_box = document.getElementById("top_btn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
// Create Navbar
const createNav = () => {
    let nav = document.querySelector('.navbar');

    nav.innerHTML = `<div class="nav flex item-center">
            <a href="/"><img class="brand-logo cur-point" src="img/UNITY.webp" alt="logo" loading="lazy"></a>
            <div class="nav-items flex item-center">
                <form class="search flex" id="searchBox">
                    <input type="text" class="search-box" id="searchVal" placeholder="Press Enter or Search button to Search...">
                    <button type="submit" class="search-btn flex item-center" id="searchBtn"><svg version="1.1" id="search-svg" x="0px" y="0px"  viewBox="0 0 122.879 119.799" enable-background="new 0 0 122.879 119.799" xmlns="http://www.w3.org/2000/svg">
                    <g>
                    <path d="M49.988,0h0.016v0.007C63.803,0.011,76.298,5.608,85.34,14.652c9.027,9.031,14.619,21.515,14.628,35.303h0.007v0.033v0.04 h-0.007c-0.005,5.557-0.917,10.905-2.594,15.892c-0.281,0.837-0.575,1.641-0.877,2.409v0.007c-1.446,3.66-3.315,7.12-5.547,10.307 l29.082,26.139l0.018,0.016l0.157,0.146l0.011,0.011c1.642,1.563,2.536,3.656,2.649,5.78c0.11,2.1-0.543,4.248-1.979,5.971 l-0.011,0.016l-0.175,0.203l-0.035,0.035l-0.146,0.16l-0.016,0.021c-1.565,1.642-3.654,2.534-5.78,2.646 c-2.097,0.111-4.247-0.54-5.971-1.978l-0.015-0.011l-0.204-0.175l-0.029-0.024L78.761,90.865c-0.88,0.62-1.778,1.209-2.687,1.765 c-1.233,0.755-2.51,1.466-3.813,2.115c-6.699,3.342-14.269,5.222-22.272,5.222v0.007h-0.016v-0.007 c-13.799-0.004-26.296-5.601-35.338-14.645C5.605,76.291,0.016,63.805,0.007,50.021H0v-0.033v-0.016h0.007 c0.004-13.799,5.601-26.296,14.645-35.338C23.683,5.608,36.167,0.016,49.955,0.007V0H49.988L49.988,0z M50.004,11.21v0.007h-0.016 h-0.033V11.21c-10.686,0.007-20.372,4.35-27.384,11.359C15.56,29.578,11.213,39.274,11.21,49.973h0.007v0.016v0.033H11.21 c0.007,10.686,4.347,20.367,11.359,27.381c7.009,7.012,16.705,11.359,27.403,11.361v-0.007h0.016h0.033v0.007 c10.686-0.007,20.368-4.348,27.382-11.359c7.011-7.009,11.358-16.702,11.36-27.4h-0.006v-0.016v-0.033h0.006 c-0.006-10.686-4.35-20.372-11.358-27.384C70.396,15.56,60.703,11.213,50.004,11.21L50.004,11.21z" style="fill: rgb(0, 186, 242); fill-rule: evenodd; paint-order: fill;"/>
                    </g>
                    </svg></button>
                </form>
                <div class="nav-btns flex-row item-center">
                    <a href="/profile" aria-label="profile" rel="nooperner" >
                        <svg id="profile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <defs>
                                <linearGradient gradientUnits="userSpaceOnUse" x1="224" y1="0" x2="224" y2="512" id="gradient-0" gradientTransform="matrix(0.999993, 0.003872, -0.007432, 1.919566, 0.001699, -1.411014)">
                                    <stop offset="0" style="stop-color: rgba(0, 46, 111, 1)"/>
                                    <stop offset="1" style="stop-color: rgba(0, 4, 9, 1)"/>
                                </linearGradient>
                            </defs>
                            <path d="M272 304h-96C78.8 304 0 382.8 0 480c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32C448 382.8 369.2 304 272 304zM48.99 464C56.89 400.9 110.8 352 176 352h96c65.16 0 119.1 48.95 127 112H48.99zM224 256c70.69 0 128-57.31 128-128c0-70.69-57.31-128-128-128S96 57.31 96 128C96 198.7 153.3 256 224 256zM224 48c44.11 0 80 35.89 80 80c0 44.11-35.89 80-80 80S144 172.1 144 128C144 83.89 179.9 48 224 48z" style="fill: url(#gradient-0);"/>
                        </svg>
                    </a>
                    <a href="/cart" aria-label="cart" rel="nooperner">
                        <svg id="cart" viewBox="0 0 573.755 512">
                            <path d="M96 0C107.5 0 117.4 8.19 119.6 19.51L121.1 32H541.8C562.1 32 578.3 52.25 572.6 72.66L518.6 264.7C514.7 278.5 502.1 288 487.8 288H170.7L179.9 336H488C501.3 336 512 346.7 512 360C512 373.3 501.3 384 488 384H159.1C148.5 384 138.6 375.8 136.4 364.5L76.14 48H24C10.75 48 0 37.25 0 24C0 10.75 10.75 0 24 0H96zM128 464C128 437.5 149.5 416 176 416C202.5 416 224 437.5 224 464C224 490.5 202.5 512 176 512C149.5 512 128 490.5 128 464zM512 464C512 490.5 490.5 512 464 512C437.5 512 416 490.5 416 464C416 437.5 437.5 416 464 416C490.5 416 512 437.5 512 464z" style="fill: rgb(0, 46, 111);"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
        <ul class="links-container unselectable flex-row item-center">
            <li class="link-item"><a href="/" class="link">Home</a></li>
            <li class="link-item"><a href="/categories" class="link">Categories</a></li>
            <li class="link-item"><a href="/category?id=34&name=BESTSELLERS" class="link">Bestsellers</a></li>
            <li class="link-item"><a href="/login" class="link" id="login">Login</a></li>
            <li class="link-item"><a href="/auth/signout" class="link" id="logout">Logout</a></li>
        </ul>
    `;
}

createNav();


// Create Footer
const createFoot = () => {
    let foot = document.querySelector("footer");

    foot.innerHTML = ` 
    <div class="rows">
        <div class="cols" id="foot_img">
            <img loading="lazy" id="logou" src="img/logoU.webp" alt="logo">
        </div>
        <div class="cols del hidden">
            <h4 class="h-secondary">WE DELIVER TO</h4>
            <ul>
                <li class="text">Ahemdabad</li>
                <li class="text">Gandhinagar</li>
                <li class="text">And all over Gujarat</li>
            </ul>
            <label for="Language"></label>
            <select name="Language" id="Language">
                <option value="English"  selected><i class="fa-solid fa-globe"></i> English <i class="fa-solid fa-angle-down"></i></option>
                <option value="Hindi">हिन्दी</option>
                <option value="Gujarati">ગુજરાતી</option>
            </select>
        </div>
        <div class="rows flex-row" id="mainfotter">
            <div class="cols">
                <h4 class="h-secondary">COMPANY</h4>
                <ul class="text">
                    <li>
                        <p><a target="_blank" href="company.html#aboutus" rel="noopener noreferrer">About Us</a></p>
                    </li>
                    <li>
                        <p><a target="_blank" href="/contact" rel="noopener noreferrer">Help & Support</a></p>
                    </li>
                    <li>
                        <p><a target="_blank" href="company.html#unitycash" rel="noopener noreferrer">UnityCoins</a>
                        </p>
                    </li>
                </ul>
            </div>
            <div class="cols">
                <h4 class="h-secondary">LEGAL</h4>
                <ul class="text">
                    <li>
                        <p><a target="_blank" href="company.html#termsofservice" rel="noopener noreferrer">Terms of
                                Service</a>
                        </p>
                    </li>
                    <li>
                        <p><a target="_blank" href="company.html#returnandcanell" rel="noopener noreferrer">Return &
                                Cancellation</a></p>
                    </li>
                    <li>
                        <p><a target="_blank" href="company.html#cookiepolicy" rel="noopener noreferrer">Cookie
                                Policy</a></p>
                    </li>
                    <li>
                        <p><a target="_blank" href="company.html#privacypolicy" rel="noopener noreferrer">Privacy
                                Policy</a>
                        </p>
                    </li>
                </ul>
            </div>
            <div class="cols" id="contacts">
                <h4 class="h-secondary">CONTACT</h4>
                <ul class="text">
                    <li>
                        <p><a target="_blank" rel="noopener noreferrer"
                                href="mailto:contact@unitybooks.in">contact@unitybooks.in</a>
                        </p>
                    </li>
                    <li>
                        <h4><a target="_blank" rel="noopener noreferrer"
                                href="https://api.whatsapp.com/message/HJFV7CZRCD7BG1?autoload=1&app_absent=0"><img
                                    loading="lazy" id="wh" src="img/wh.webp" alt="">7779056420</a></h4>
                    </li>
                </ul>
            </div>
            <div class="cols flex-colunm item-center" id="slinks">
                <h4 class="h-secondary">SOCIAL</h4>
                <div class="social-icons">
                    <a href="https://m.facebook.com/unityboooks/" target="_blank" rel="noopener noreferrer"
                        class="fa-brands"><img loading="lazy" class="sc" src="img/fb.svg"
                            alt="facebook"></a>
                    <a href="https://www.instagram.com/unitybooks.in/" target="_blank" rel="noopener noreferrer"
                        class="fa-brands"><img loading="lazy" class="sc" src="img/ig.svg" alt="insta"></a>
                    <a href="https://www.twitter.com/unitybooks_in/" target="_blank" rel="noopener noreferrer"
                        class="fa-brands"><img loading="lazy" class="sc" src="img/tw.svg" alt="twitter"></a>
                </div>
                <div>
                    <a href="https://play.google.com/store/apps/details?id=com.Pageturners_tech.book_Land_AIA_store"
                        target="_blank" rel="noopener noreferrer"><img loading="lazy" id="gs"
                            src="img/play-store.webp" alt="gstore"></a>
                </div>
            </div>
        </div>
        <div class="rows flex-row foot item-center">
            <p id="tnc" class="text center">By continuing past this page, you agree to our Terms of Service, Cookie
                Policy
                & Privacy Policy. 2022 © Falcon Innov™. All rights reserved</p>
            <hr class="sto">
        </div>
    </div>
    `;
}

createFoot();

const cookieChecker = () => {
    const cookieValue = document.cookie.split('; ').find((cookie) => cookie.startsWith('isLoggedIn='))?.split('=')[1];
    if (cookieValue) {
        document.getElementById('logout').style.display = 'inline';
        document.getElementById('login').style.display = 'none';
    }
    else {
        document.getElementById('logout').style.display = 'none';
        document.getElementById('login').style.display = 'inline';
    }
}

cookieChecker();

document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchBox');

    searchBox.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchString = document.getElementById('searchVal').value.trim();
        const encodedName = encodeURIComponent(searchString);
        const url = `/search?name=${encodedName}`;
        window.location.href = url;
    });
});
