const btn00 = document.getElementById('menu-btn');
    const closeBtn00 = document.getElementById('close-btn');
    const menu00 = document.getElementById('side-menu');
    const overlay00 = document.getElementById('overlay');
    const bar100 = document.getElementById('bar1');
    const bar200 = document.getElementById('bar2');
    const bar300 = document.getElementById('bar3');

    const openMenu00 = () => {
      menu00.classList.remove('translate-x-full');
      menu00.classList.add('translate-x-0');
      overlay00.classList.remove('opacity-0', 'pointer-events-none');
      bar100.classList.add('opacity-0');
      bar200.classList.add('opacity-0');
      bar300.classList.add('opacity-0');
    };

    const closeMenu00 = () => {
      menu00.classList.add('translate-x-full');
      menu00.classList.remove('translate-x-0');
      overlay00.classList.add('opacity-0', 'pointer-events-none');
     bar100.classList.remove('opacity-0');
      bar200.classList.remove('opacity-0');
      bar300.classList.remove('opacity-0');
    };

    btn00.addEventListener('click', openMenu00);
    overlay00.addEventListener('click', closeMenu00);
    closeBtn00.addEventListener('click', closeMenu00);


// const header = document.querySelector("header");
// let val=0;
// let w= window.scrollY
// window.addEventListener("scroll", () => {
//   if (window.scrollY > w) {
//     val=val+2;
//     header.style.backgroundColor = "rgba(0,0,0,0."+ String(val)+ ")";
//     w= window.scrollY
//   } else {
//     val=val-2;
//     header.style.backgroundColor = "rgba(0,0,0,0."+ String(val)+ ")";
//     w= window.scrollY
//   }
// });




window.addEventListener('DOMContentLoaded',()=>{
  getUsers()
})



function getUsers(){
  fetch(line+ '/products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({message:'users'})
})
.then(response => response.json())
.then(data => {
    if (true){
        if (data.message){

       console.log(data.message)
    //    alert('data recieved')
       localStorage.setItem('udata',JSON.stringify(data.message))
      //  console.log(data.message)
    }
     
    }else{
    
   
    }

   
})
.catch(error => {
    console.log('failed to recieve data')
    // location.reload()
        
});
}




 getUsers2()

function getUsers2(){
  // alert('fetching')
  let em= de(accessInfo(en('email',date1)),date1)
  // alert(em)
  fetch(line+ '/products', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({message:'users',email: em})
  })
  .then(response => response.json())
  .then(data => {
      if (true){
          if (data.message){

         console.log(data.message)
      //    alert('data recieved')
      let cards_data=data.message
      // console.log(cards_data)
      // console.log(cards_data)
      // console.log(cards_data)
      console.log(cards_data)
      console.log('hey')
      if(cards_data){
      // alert('incorporating data')

      }
      else{
      // alert('failed to use data data')
      
  }
      let r_data='';
      for (r in cards_data){
          // r_data= r_data + `<div class="product-card">
          // <div class="img-container">
          //     <img src="../../sources/${cards_data[r].image_loc}" alt="profile">
          //     </div>
          //     <div class="product-info">
          //         <h3>${cards_data[r].type_} ${cards_data[r].status}</h3>
          //         <p> ${cards_data[r].price}</p>
          //         <button class='users_' data='' id='user-${r}'>Add User</button>
          //     </div>
          //   </div>`
          r_data= r_data + ` <div class="bg-gray-900 rounded-2xl p-3 shadow-lg hover:scale-105 transition-transform text-center">
            <img src="../../sources/${cards_data[r].image_loc}" class="w-full h-24 object-cover rounded-xl mb-2" alt="profile" />
            <div class="text-sm text-green-400">Accuracy: 98%  ${cards_data[r].status}</div>
            <div class="font-semibold">${cards_data[r].type_}</div>
          <button class='users_' data='' id='user-${r}'>Add User</button>
            </div>`
           

    }
      let f_data='';
      for (r in cards_data){
          // r_data= r_data + `<div class="product-card">
          // <div class="img-container">
          //     <img src="../../sources/${cards_data[r].image_loc}" alt="profile">
          //     </div>
          //     <div class="product-info">
          //         <h3>${cards_data[r].type_} ${cards_data[r].status}</h3>
          //         <p> ${cards_data[r].price}</p>
          //         <button class='users_' data='' id='user-${r}'>Add User</button>
          //     </div>
          //   </div>`
          f_data= f_data + `<div class="flex items-center bg-gray-900 rounded-xl p-4 shadow-md hover:bg-gray-800 transition-all max-w-sm mx-auto">
            <img src="../../sources/${cards_data[r].image_loc}" class="w-12 h-12 rounded-full mr-3" alt="profile" />
            <div>
              <div class="font-semibold">${cards_data[r].type_}</div>
              <div class="text-sm text-gray-400">Hey, how have you been?</div>
            </div>
          </div>`
           

    }
      let g_data='';
      for (r in cards_data){
          // r_data= r_data + `<div class="product-card">
          // <div class="img-container">
          //     <img src="../../sources/${cards_data[r].image_loc}" alt="profile">
          //     </div>
          //     <div class="product-info">
          //         <h3>${cards_data[r].type_} ${cards_data[r].status}</h3>
          //         <p> ${cards_data[r].price}</p>
          //         <button class='users_' data='' id='user-${r}'>Add User</button>
          //     </div>
          //   </div>`
          g_data= g_data + `<div class="bg-gray-900 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow max-w-md mx-auto">
            <div class="flex items-center space-x-2">
              <img src="../../sources/${cards_data[r].image_loc}" class="w-8 h-8 rounded-full" alt="profile" />
              <div class="font-semibold text-lg">${cards_data[r].type_}</div>
              <div class="text-sm text-gray-400">10:00 PM</div>
            </div>
            <div class="text-gray-300 text-sm mt-1">Loving the new vibes in the city lately 🌆</div>
            <div class="replies-section mt-2">
              <div class="comments-list space-y-2">
                <div class="comment">
                  <img src="../../sources/${cards_data[r].image_loc}" class="w-6 h-6 rounded-full" alt="Eva" />
                  <div>
                    <div class="text-sm font-semibold">${cards_data[r].type_}</div>
                    <div class="text-sm text-gray-400">10:05 PM</div>
                    <div class="text-sm text-gray-300">Looks amazing!</div>
                  </div>
                </div>
              </div>
              <button onclick="toggleReplyForm(this)" class="text-sm text-blue-400 hover:underline">Reply</button>
              <div class="reply-form mt-2">
                <textarea class="w-full bg-gray-800 text-white p-2 rounded-lg" rows="2" placeholder="Write a reply..."></textarea>
                <button onclick="postReply(this)" class="mt-1 bg-[#0056b3] hover:bg-[#004080] text-white px-3 py-1 rounded-lg transition-colors">Post</button>
              </div>
            </div>
          </div>`
           

    }

  let cards= document.getElementById("suds1")
  let cards1= document.getElementById("mess1")
  let cards2= document.getElementById("postList")

  cards.innerHTML= r_data
  cards1.innerHTML= f_data
  cards2.innerHTML= g_data
  let users= document.querySelectorAll('.users_')
  users.forEach(element => {
    element.addEventListener('click',()=>{
      var id= element.getAttribute('id').split('-')[1]
      
      if (element.textContent=='Add User'){
        element.textContent='Del Request';
        // element.style.backgroundColor='transparent';
        console.log(`Request sent to  ${cards_data[id].type_}`)
      }else{
        element.textContent='Add User';
        // element.style.backgroundColor='#0056b3';
        console.log(`Request to  ${cards_data[id].type_} removed`)
      }

    })
    
  });
  

      
  
      }
       
      }else{
      
     
      }

     
  })
  .catch(error => {

      console.log('failed to recieve data')
          
  });
}







    function showTab(tabId) {
      ['suggestions', 'messages', 'posts'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });
      document.getElementById(tabId).classList.remove('hidden');
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('bg-[#004080]'));
      document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('bg-[#004080]');
    }

    function addPost() {
      const content = document.getElementById('postContent').value.trim();
      if (!content) return;

      const post = document.createElement('div');
      post.className = "bg-gray-900 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow post-slide-in max-w-md mx-auto";
      post.innerHTML = `
        <div class="flex items-center space-x-2">
          <img src="https://source.unsplash.com/random/50x50?face" class="w-8 h-8 rounded-full" alt="You" />
          <div class="font-semibold text-lg">You</div>
          <div class="text-sm text-gray-400">Just now</div>
        </div>
        <div class="text-gray-300 text-sm mt-1">${content}</div>
        <div class="replies-section mt-2">
          <div class="comments-list space-y-2"></div>
          <button onclick="toggleReplyForm(this)" class="text-sm text-blue-400 hover:underline">Reply</button>
          <div class="reply-form mt-2">
            <textarea class="w-full bg-gray-800 text-white p-2 rounded-lg" rows="2" placeholder="Write a reply..."></textarea>
            <button onclick="postReply(this)" class="mt-1 bg-[#0056b3] hover:bg-[#004080] text-white px-3 py-1 rounded-lg transition-colors">Post</button>
          </div>
        </div>
        <div class="post-controls">
          <button onclick="editPost(this)" class="text-sm text-blue-400 hover:underline">Edit</button>
          <button onclick="deletePost(this)" class="text-sm text-red-400 hover:underline">Delete</button>
        </div>
      `;
      document.getElementById('postList').prepend(post);
      document.getElementById('postContent').value = '';
    }

    function deletePost(button) {
      const post = button.closest('div.bg-gray-900');
      post.remove();
    }

    function editPost(button) {
      const post = button.closest('div.bg-gray-900');
      const contentDiv = post.querySelector('div.text-gray-300');
      const original = contentDiv.innerText;
      const newText = prompt("Edit your post:", original);
      if (newText) {
        contentDiv.innerText = newText;
      }
    }

    function toggleReplyForm(button) {
      const post = button.closest('.bg-gray-900');
      const replyForm = post.querySelector('.reply-form');
      replyForm.classList.toggle('show');
    }

    function postReply(button) {
      const post = button.closest('.bg-gray-900');
      const textarea = post.querySelector('.reply-form textarea');
      const content = textarea.value.trim();
      if (!content) return;

      const comment = document.createElement('div');
      comment.className = 'comment';
      comment.innerHTML = `
        <img src="https://source.unsplash.com/random/56x56?face" class="w-6 h-6 rounded-full" alt="You" />
        <div>
          <div class="text-sm font-semibold">You</div>
          <div class="text-sm text-gray-400">Just now</div>
          <div class="text-sm text-gray-300">${content}</div>
        </div>
      `;
      const commentsList = post.querySelector('.comments-list');
      commentsList.appendChild(comment);
      textarea.value = '';
      const replyForm = post.querySelector('.reply-form');
      replyForm.classList.remove('show');
    }

    // Set default tab
    showTab('suggestions');
  