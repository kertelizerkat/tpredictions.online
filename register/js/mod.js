let date2=18
let date1=17
let state__p=''

// theme="Dark"
// Function to change the stylesheet link
document.addEventListener('DOMContentLoaded', () => {
  function changeStylesheet(newHref) {
    // Select the <link> element with rel="stylesheet"
    const linkElement = document.querySelector('link[rel="stylesheet"]');
  
    // Check if the <link> element exists
    if (linkElement) {
      // Change its href attribute to the new stylesheet path
      linkElement.href = newHref;
      console.log(`Stylesheet changed to: ${newHref}`);
    } else {
      console.error('Stylesheet link not found.');
    }
  }
  
  
  })


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


// let ps = accessInfo(en('password',date1))
// let p= accessInfo(en('phone',date1))



window.addEventListener('load',()=>{
  // alert('hey')
    document.getElementById('bs2_').style.visibility='visible'

})

function logout(){
  storeInfo(en('state',date2),'')
  storeInfo(en('password',date1),'')
  storeInfo(en('phone',date1),'')
  storeInfo(en('username',date1),'')
  storeInfo(en('email',date1),'')
  storeInfo(en('logged',date1),'')
  
   
  }
  logout()

