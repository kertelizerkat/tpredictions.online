let date2=18
let date1=17
let state__p=''

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


  function logout(){
    storeInfo(en('state',date2),'')
    storeInfo(en('password',date1),'')
    storeInfo(en('grade',date1),'')
    storeInfo(en('username',date1),'')
    storeInfo(en('email',date1),'')
    storeInfo(en('logged',date1),'')
    storeInfo('prev-theme',accessInfo('theme_+-----'))
    storeInfo('theme_+-----','Dark')
    
     
     window.location.assign(`${getHomePath()}/index.html`)
    }


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
