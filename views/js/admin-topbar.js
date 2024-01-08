const createTopBar = (() => {
    let topBar = document.querySelector(".topbar");

    topBar.innerHTML = `
        <div class="logo-box flex-colunm item-center cur-point" onclick="navigate('dashboard')">
            <img class="logo" src="../img/UNITY.webp" />
        </div>
        <div class="settings-box flex-row item-center" >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs></defs>
                <mask id="mask0_32_372" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"></rect>
                </mask>
                <g mask="url(#mask0_32_372)">
                    <path d="M2.85001 20.1501V16.7501H4.55001V10.6001C4.55001 8.9501 5.02501 7.45843 5.97501 6.1251C6.92501 4.79176 8.20001 3.90843 9.80001 3.4751V3.0501C9.80001 2.43898 10.0138 1.91954 10.4413 1.49177C10.8687 1.06399 11.3878 0.850098 11.9985 0.850098C12.6092 0.850098 13.1288 1.06399 13.5573 1.49177C13.9858 1.91954 14.2 2.43898 14.2 3.0501V3.4751C15.8 3.89176 17.0792 4.76295 18.0375 6.08865C18.9958 7.41436 19.475 8.91818 19.475 10.6001V16.7501H21.175V20.1501H2.85001ZM12.0241 23.5501C11.3422 23.5501 10.7677 23.3151 10.3006 22.8451C9.83355 22.3751 9.60001 21.8101 9.60001 21.1501H14.425C14.425 21.8168 14.1899 22.3834 13.7198 22.8501C13.2496 23.3168 12.6844 23.5501 12.0241 23.5501ZM7.95001 16.7501H16.075V10.6108C16.075 9.47033 15.6785 8.50426 14.8855 7.7126C14.0925 6.92093 13.13 6.5251 11.998 6.5251C10.866 6.5251 9.90834 6.92192 9.12501 7.71557C8.34167 8.50921 7.95001 9.47071 7.95001 10.6001V16.7501Z" fill="#222831"></path>
                </g>
            </svg>
            <div class="profile flex-row" >
                <span class="poppins-18 black left" id="username"></span>
                <img class="user" id="userimg" src="" />
            </div>
        </div>`;
})();