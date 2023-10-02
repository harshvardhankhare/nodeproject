console.log("connected js")
document.addEventListener('DOMContentLoaded', function () {
    const leftContainer = document.querySelector('.sliding-left');
    const rightContainer = document.querySelector('.sliding-right');
    
    window.addEventListener('scroll', function () {
      const scrollPosition = window.scrollY;
      
      // Adjust the threshold as needed
      const triggerPosition = 0.5 * window.innerHeight; // Half of the viewport height
      
      if (scrollPosition > triggerPosition) {
        leftContainer.style.display = 'block';
        rightContainer.style.display = 'block';
      }
    });
  });
 const menubtn=document.querySelector(".nav-btn");
const navigation = document.querySelector(".navigation")

menubtn.addEventListener("click",()=>{
menubtn.classList.toggle("active");
navigation.classList.toggle("active");
});


const btns=document.querySelectorAll(".nav-btn");
const slides=document.querySelectorAll(".video-slide")
const contents=document.querySelectorAll(".content")

var slidernav=function(manual){
    btns.forEach((btn)=>{
        btn.classList.remove("active")
    })
    slides.forEach((slide)=>{
        slide.classList.remove("active")
    })
    contents.forEach((content)=>{
        content.classList.remove("active")
    })

    btns[manual].classList.add("active");
    slides[manual].classList.add("active");
    contents[manual].classList.add("active");
}
btns.forEach((btn,i)=>{
    btn.addEventListener("click",()=>{
slidernav(i)
    });
});
  