document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
    let theme=accessInfo('theme_+-----');
    if (theme){
      if (theme=='Dark'){
        changeStylesheet('css/Dts_and_cs.css')
      }
    }
    
  });
  


  // Function to change the stylesheet link
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
  
  window.addEventListener('load',()=>{
    // alert('hey')
      document.getElementById('bs2_').style.visibility='visible'
      // document.getElementById('bs2_').style.backgroundColor=''
  
  })