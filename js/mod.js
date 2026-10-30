let date2=18
let date1=17
let state__p='leave'
function en(text, key) {
  const symbols = "~!@#$%^&*()_+=-{}[]\\|'\"<>,.?/;:` \n";
  const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  const numbers = "1234567890";
  const characters = symbols + letters + numbers;

  const knowledgeBase = {};
  let x = 0;
  const allTk = [];
  let counter = 0;

  for (let c of characters) {
    x += 1;
    let y = (x ** 2) + (x * text.length) - parseFloat(key);
    y=parseInt(y)
    if (allTk.includes(y)) {
      counter += 1;
      
    } else {
      allTk.push(y);
    }
    try {
      knowledgeBase[c] = String(y);
    } catch (e) {
      // Handle error if needed
    }
  }
 

  const newText = [];

  for (let letter of text) {
    letter = knowledgeBase[letter];
    newText.push(letter);
  }

  let ntext = newText.join("..423..");
  const ftype = 'text';

  let codename;
  if (ftype === "text") {
    codename = "123456789009876543211234567890";
  } else {
    codename = "0987654321112345678900987654321";
  }

  ntext = ntext + "..423.." + codename;

  const encryptedText = ntext;
  return encryptedText;
}

// Example usage
// const text = "exampleText";
// const key = "12345";
// const encryptedText = en(text, key);
// console.log("Encrypted Text:", encryptedText);



function de(encryptedText, key) {
  let dtext = encryptedText.split("..423..");
  let codename;

  if (dtext[dtext.length - 1] === "123456789009876543211234567890") {
    codename = "text";
  } else if (dtext[dtext.length - 1] === "0987654321112345678900987654321") {
    return "Cannot accept bytes";
  } else {
    return "Unable to identify Character Type--";
  }

  dtext.pop(); // Remove the last element
  const length = dtext.length;
  const symbols = "~!@#$%^&*()_+=-{}[]\\|'\"<>,.?/;:` \n";
  const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  const numbers = "1234567890";
  const characters = symbols + letters + numbers;

  const knowledgeBase = {};
  let x = 0;

  for (let c of characters) {
    x += 1;
    let y = (x ** 2) + (x * length) - parseFloat(key);
    try {
      knowledgeBase[c] = String(y);
    } catch (e) {
      // Handle error if needed
    }
  }

  const newText = [];

  for (let value of dtext) {
    for (let char in knowledgeBase) {
      if (knowledgeBase[char] === value) {
        newText.push(char);
        break;
      }
    }
  }

  const decryptedText = newText.join("");
  return decryptedText;
}

// Example usage


// const decryptedText = de(encryptedText, key);
// console.log("Decrypted Text:", decryptedText);

function identify(text, qry) {
  const textLen = text.length;
  const qryLen = qry.length;

  for (let i = 0; i <= textLen - qryLen; i++) {
    if (text.substring(i, i + qryLen) === qry) {
      return true;
    }
  }
  return false;
}

// Example usage
// const text_ = "This is a sample text.";
// const qry = "sample";
// const result = identify(text_, qry);
// console.log("Query found:", result);


function storeInfo(key, value) {
  localStorage.setItem(key, value);
  // console.log(`Data stored: ${key} = ${value}`);
}
function accessInfo(key) {
  const value = localStorage.getItem(key);
  if (value) {
      // console.log(`Data retrieved: ${key} = ${value}`);
      return value;
  } else {
      // console.log(`No data found for key: ${key}`);
      return null;
  }
}




// Function to set the last visit time in local storage
function setLastVisitTime() {
  const currentTime = new Date().getTime();
  localStorage.setItem('lastVisitTime', currentTime);
}

// Function to clear local storage if 2 hours have passed
function clearLocalStorageIfExpired() {
  const lastVisitTime = localStorage.getItem('lastVisitTime');
  const currentTime = new Date().getTime();
  const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;

  if (lastVisitTime && (currentTime - lastVisitTime > twoHoursInMilliseconds)) {
          // let ps = accessInfo(en('password',date1))
      // let p= accessInfo(en('phone',date1))
      let us=accessInfo(en('username',date1))
      let em=accessInfo(en('email',date1))

      let thme=accessInfo('theme_+-----')
      localStorage.clear() 
      storeInfo('theme_+-----',thme)

      // storeInfo(en('password',date1),ps)
      // storeInfo(en('phone',date1),p)
      storeInfo(en('username',date1),us)
storeInfo(en('email',date1),em)

      console.log("Local storage has been cleared.");
  }
}

// Call the function to check and clear local storage if expired
clearLocalStorageIfExpired();

// Set the last visit time when the user leaves the site
window.addEventListener('beforeunload', setLastVisitTime);



function predict() {


  let qry = document.getElementById("input");
  
  let btn = document.querySelector('.btn33');
  let cencon = document.getElementById("cencon");
  let out = document.querySelector(".output");


    
 
  

  let holder = document.querySelector(".holder");

  let bordero = out.style.border;
  let inno = out.innerHTML;
  

  

if (qry.value ) {
    // qry.setAttribute("placeholder","e.g. " + qry.value)
    // qry.value="";
    // out.innerHTML=''
    let ocikon=cencon.innerHTML

    let color = btn.style.color;
    let text = btn.textContent;
    let bgcolor = btn.style.backgroundColor;
    let animation = btn.style.animationName
    btn.textContent = "Loading";
    
    if (localStorage.getItem("theme_+-----")=='Dark'){

       btn.style.backgroundColor = "transparent";
       btn.style.color = "#fff"
    }
else{
         btn.style.backgroundColor = "#FFFFFF";
          btn.style.color = "#000"
    }
     

    


    

    cencon.innerHTML= `  <div style='background:  inherit;backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);border-radius:40px;z-index:1000000' class="loading-container11">
        <div class="title11">
          <span style='font-size:x-large' class="letter11">P</span>
          <span style='font-size:x-large' class="letter11">r</span>
          <span style='font-size:x-large' class="letter11">o</span>
          <span style='font-size:x-large' class="letter11">c</span>
          <span style='font-size:x-large' class="letter11">e</span>
          <span style='font-size:x-large' class="letter11">s</span>
          <span style='font-size:x-large' class="letter11">s</span>
          <span style='font-size:x-large' class="letter11">i</span>
          <span style='font-size:x-large' class="letter11">n</span>
          <span style='font-size:x-large' class="letter11">g...</span>
       
        </div>
        <div class="loader11"></div>
        <div id="username_loader11" class="subtitle11"></div>
        <div id="state_loader11" class="subtitle11"></div>

        <div class="checkbox-container11">
          <!-- <div id="vdata" class="check-box  hide_bx11">Validation</div> -->
          <!-- <div id="fdata__" class="check-box  hide_bx11">Fetching Data</div> -->
          <!-- <div id="ldata" class="check-box  hide_bx11">Loading Data</div> -->
        </div>
        <div class="particles11">
          <div class="particle11" style="left: 10%; animation-delay: 0s;"></div>
          <div class="particle11" style="left: 25%; animation-delay: 0.8s;"></div>
          <div class="particle11" style="left: 40%; animation-delay: 1.6s;"></div>
          <div class="particle11" style="left: 60%; animation-delay: 2.4s;"></div>
          <div class="particle11" style="left: 80%; animation-delay: 3.2s;"></div>
          <div class="particle11" style="left: 95%; animation-delay: 4s;"></div>
        </div>

    </div>`+ cencon.innerHTML
    cencon.style.position= 'relative'

    
    //holder
    holder.classList.remove("flex")
    //input border

    out.style.border = bordero
    out.innerHTML = inno
  


    let http;
    
 
    
  

    http = line+"/individual_receive_message";
    
 
    console.log(http)
    fetch(http, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(qry.value)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("<span id='red'>Something went wrong, Please try again!</span>");



            }
       
            //holder
            holder.classList.add("flex")
            

            

            // out.style.border="2px solid rgba(65,25,65)"
            out.innerHTML = "<span id='green'>Loading (received) Content</span>"
            return response.json();
        })
        .then(data => {
            // console.log("data from server:", data)
         
      
                res = data.response;
                if (res=='<span id="red">You did not login!</span>'){
                  logout()
           

            }


            console.log(res)

            holder.classList.add("flex")
            out.innerHTML = res
      
            
            cencon.innerHTML=ocikon
            scrollDown100px() 
          
        })
        .catch(error => {
            console.log("something wrong with the response", error)
            if (String(error) == "SyntaxError: Unexpected end of JSON input") {
                error = "Content being updated in the server, please try again later!"
            }
            
          
       
         
             cencon.innerHTML=ocikon
            holder.classList.add("flex");
            
            
        });


}

}
 