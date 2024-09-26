





let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
    setTimeout(showSlides, 5000);
    // Change image every 5 seconds
}

let wininfoimg1 = document.getElementsByClassName("wininfo")[0];
let wininfoimg2 = document.getElementsByClassName("wininfo")[1];

setInterval(() => {
    if (wininfoimg1.style.display === "block") {
        wininfoimg1.style.display = "none";
        wininfoimg2.style.display = "block";
    } else if (wininfoimg1.style.display === "none") {
        wininfoimg1.style.display = "block";
        wininfoimg2.style.display = "none";
    }
}, 2000);



//  scripts.js                      
window.addEventListener('load', function () {
    setTimeout(function () {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 1500); // Change this value to adjust how long the splash screen stays
});

function comingsoon() {
    let gameMenuHtml = ``;
    let a = document.getElementsByClassName("game_menu_list")[0];
    gameMenuHtml = a.innerHTML;
    a.innerHTML = `<div id="gifContainer" class="gif-container" style="width: 100%;">
                        <img src="images/comingsoon.gif" alt="Your GIF" width="300px" height="250px"/>
                    </div>`
    setTimeout(() => {
        a.innerHTML = gameMenuHtml;
    }, 1000);
}