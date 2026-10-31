console.log("Focus Filter Extension is Running");
//I want my users to add productive keywords by themselevs (as vary from person to person), but i can't able to complete that functionality on time 
let productiveKeywords =["job","internship","startup","business","freelance","study","work","school","focus"];
function filterNonProductiveContent(){
    const posts = document.querySelectorAll("p,span,div");
    posts.forEach(post=>{
    const text = (post.innerText).toLowerCase();
    let isProductive = productiveKeywords.some(keyword => text.includes(keyword));
    if(!isProductive){
        post.style.filter = "blur(5px)";
    }
});
}

filterNonProductiveContent();
const observer = new MutationObserver(filterNonProductiveContent); 

observer.observe(document.body, {
  childList: true,
  subtree: true
});
