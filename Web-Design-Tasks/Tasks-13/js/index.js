// let imageChange = () => {
//     let img = document.getElementById('myImg');
//     let betSrc = img.getAttribute('src'); 
//     if (betSrc === "images/image-1.jpg") {
//         img.src = "images/image-2.jpg";
//         console.log("Changed to image 2");
//     } else {
//         img.src = "images/image-1.jpg";
//         console.log("Changed back to image 1");
//     }
// };


// let imageChange = () => {
//     let img = document.getElementById('myImg');
//     console.log("Current image path: " + img.src);
//     if (img.src.endsWith('image-1.jpg')) {
//         img.src = "images/image-2.jpg";
//         console.log("Changed to image 2");
//     } else {
//         img.src = "images/image-1.jpg";
//         console.log("Changed back to image 1");
//     }
// };

function changeColor(clickedLi) {
    let allItems = document.querySelectorAll('ul li');
    allItems.forEach(li => {
        li.classList.remove('active');
    });
    clickedLi.classList.add('active');
}