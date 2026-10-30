
let theme='none';
window.addEventListener('DOMContentLoaded',()=>{
  
  const storageKey = 'theme_+-----';
   theme = localStorage.getItem(storageKey);
    
    
    
    
    if (!theme){
      const currentPath = window.location.pathname;
        // localStorage.setItem('prev_path',currentPath)

       basePath= currentPath.split('/')
       let npath=''
        for ( i in basePath){
          npath=npath + '/' + basePath[i]
          // console.log(npath)
          if (basePath[i]=='WEBAPP' ){
            break
          }
      }
      // console.log(npath)

      window.location.assign(`${getHomePath()}/theme.html`)
    
    }
})
let line="https://sculpin-charming-directly.ngrok-free.app"
// line="http://localhost:5700"
// let theme_m=''
// localStorage.setItem('theme_+-----', theme_m)
let access_="domaContent"
let online=false
let cpath = window.location.pathname;
let bpath;
if (line=='https://sculpin-charming-directly.ngrok-free.app'){
  // bpath='https://tpredictions.online'
  bpath='https://kertelizerkat.github.io/tpredictions.online'
}else{

}



let pp=localStorage.getItem('Freeprev_path')
if (pp){}else{
  pp=`${getHomePath()}/Logged/posts/index.html`
}

let k2=cpath.split('/')
   
   k2=k2[k2.length-2]

let k9=pp.split('/')
   
   k9=pp[pp.length-2]


   
if ((k2=='Logged'|| k2=='profile') || (k9=='Logged'|| k9=='profile'  )){
  let str1=localStorage.getItem(en('phone', date1))
  let str2=localStorage.getItem(en('username', date1))
  let str3=localStorage.getItem(en('email', date1))
  let str4=localStorage.getItem(en('logged', date1))
  let str5=localStorage.getItem('matchSummary')
  let str6=localStorage.getItem('matchSummary2')

  if(str1 && str2 && str3 &&  str4 && str5 && str6 ){
    localStorage.setItem('UseLogOffline','allow')

  }else{
    if(str1 && str2 && str3 && str4){
      localStorage.setItem('UseprofileOffline','allow')
    }else{
      localStorage.setItem('UseprofileOffline','Disallow')

    }

  }
    
}else{
  localStorage.setItem('UseLogOffline','Disallow')
}
  


if(pp==cpath){
  let homepath= getHomePath()
  localStorage.setItem('Freeprev_path',`${homepath}/index.html`)
  localStorage.setItem('typeOfPath','Return to Home')

}


if (k2=='posts' ){
  localStorage.setItem('Freeprev_path',cpath)
  localStorage.setItem('typeOfPath','Return to Trends')


}

if (k2=='login' ){
  localStorage.setItem('Freeprev_path',cpath)
  localStorage.setItem('typeOfPath','Return to Login')


}

if (k2=='Logged' ){
  if(localStorage.getItem('UseLogOffline')=='allow'){
     localStorage.setItem('Freeprev_path',cpath)
  localStorage.setItem('typeOfPath','Return to Dashboard')
  }
  


}

if (k2=='profile' ){
  if(localStorage.getItem('UseLogOffline')=='allow' || localStorage.getItem('UseprofileOffline')=='allow')
  localStorage.setItem('Freeprev_path',cpath)
  localStorage.setItem('typeOfPath','Return to Profile ')


}

if(!localStorage.getItem('Freeprev_path')){
  let homepath= getHomePath()
  localStorage.setItem('Freeprev_path',`${homepath}/index.html`)
  localStorage.setItem('typeOfPath','Return to Home')
}




function getHomePath(){
  basePath= window.location.pathname.split('/')

       let npath=''
       if (line=='https://sculpin-charming-directly.ngrok-free.app'){

        npath=bpath
       }else{
             for ( i in basePath){
          npath=npath + '/' + basePath[i]
          // console.log(npath)
          if (basePath[i]=='WEBAPP'){
            break
          }
      }
       }
       
    return npath
}



document.addEventListener('DOMContentLoaded', function() {
  
    fetch(line+ '/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify('hi')
    })
    .then(response => response.json())
    .then(data => {


         
        if (data.message=='okay'){
           
          localStorage.setItem('online','true')
        }else{
            online=true
            localStorage.setItem('online','true')
       
        }
        localStorage.setItem('online','true')
        localStorage.setItem('continueoff','Disallow')


      
       
    })
    .catch(error => {
        console.log(error)
        localStorage.setItem('online','false')
        let ll=localStorage.getItem('Freeprev_path').split('/')
           ll=ll[ll.length-2]
        let nn=window.location.pathname
           nn=nn[nn.length-2]
          
        if (state__p=='leave' || (localStorage.getItem('UseLogOffline')=='allow' && (ll=='profile' || (ll=='Logged' ))  )  || (localStorage.getItem('UseLogOffline')=='allow' && ll=='profile' )    ){
          
         localStorage.setItem('continueoff','allow')
         
        }else{

        if(nn=='profile' || nn=='Logged'){
          let homepath= getHomePath()
          localStorage.setItem('Freeprev_path',`${homepath}/index.html`)
          localStorage.setItem('typeOfPath','Return to Home ')

        }


          
        document.querySelector('html').innerHTML=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPREDICTIONS | OFFLINE</title>
    
    <style>
        body{
            height:100vh;
            width:100vw;
            background-color:black;
            overflow: hidden;
            transform: scale(0.8)
        }
        .loading{
 height:100vh;
 overflow: hidden;
 
    
}
.loader{
    height:100vh;
    width:100vw;
    position: absolute;
    z-index: 10000000000000000000;
    background-color: black;
    top:0;
    left:0;
    right:0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    


}
.headl{
    font-size: 2rem;
    color: white;
    letter-spacing: 5px;
}
.hide{
    visibility: hidden;
    min-height: 0px;
    min-width: 0px;
    max-width: 0px;
    max-height: 0px;
    opacity: 0;
    overflow: hidden;
}
.bload{
top:0;
    left:0;
    right:0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
   overflow:hidden;
   height:100vh
    
}
    
    
    @keyframes spin {
  from {
    transform: rotate(0);
  }
  to{
    transform: rotate(359deg);
  }
}

@keyframes spin3D {
  from {
    transform: rotate3d(.5,.5,.5, 360deg);
  }
  to{
    transform: rotate3d(0deg);
  }
}

@keyframes configure-clockwise {
  0% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes configure-xclockwise {
  0% {
    transform: rotate(45deg);
  }
  25% {
    transform: rotate(-45deg);
  }
  50% {
    transform: rotate(-135deg);
  }
  75% {
    transform: rotate(-225deg);
  }
  100% {
    transform: rotate(-315deg);
  }
}

@keyframes pulse {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: .25;
    transform: scale(.75);
  }
}

/* GRID STYLING */

* {
  box-sizing: border-box;
}



.spinner-box {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
}

/* SPINNING CIRCLE */




/* ALTERNATING ORBITS */

.circle-border {
  width: 150px;
  height: 150px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgb(63,249,220);
  background: linear-gradient(0deg, rgba(63,249,220,0.1) 33%, rgba(63,249,220,1) 100%);
  animation: spin .8s linear 0s infinite;
}

.circle-core {
  width: 100%;
  height: 100%;
  background-color: #1d2630;
  border-radius: 50%;
}

/* X-ROTATING BOXES */

.configure-border-1 {
  width: 115px;
  height: 115px;
  padding: 3px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fb5b53;
  animation: configure-clockwise 3s ease-in-out 0s infinite alternate;
}

.configure-border-2 {
  width: 115px;
  height: 115px;
  padding: 3px;
  left: -115px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(63,249,220);
  transform: rotate(45deg);
  animation: configure-xclockwise 3s ease-in-out 0s infinite alternate;
}

.configure-core {
  width: 100%;
  height: 100%;
  background-color: #1d2630;
}

/* PULSE BUBBLES */

.pulse-container {
  width: 120px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pulse-bubble {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #3ff9dc;
}

.pulse-bubble-1 {
    animation: pulse .4s ease 0s infinite alternate;
}
.pulse-bubble-2 {
    animation: pulse .4s ease .2s infinite alternate;
}
.pulse-bubble-3 {
    animation: pulse .4s ease .4s infinite alternate;
}

/* SOLAR SYSTEM */

.solar-system {
  width: 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.orbit {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid #fafbfC;
	border-radius: 50%;
} 

.earth-orbit {
	width: 165px;
	height: 165px;
  animation: spin 12s linear 0s infinite;
  -webkit-animation: spin 12s linear 0s infinite;
}

.venus-orbit {
	width: 120px;
	height: 120px;
  animation: spin 7.4s linear 0s infinite;
  -webkit-animation: spin 7.4s linear 0s infinite;
}

.mercury-orbit {
	width: 90px;
	height: 90px;
 animation: spin 3s linear 0s infinite;
  -webkit-animation: spin 3s linear 0s infinite;
}

.planet {
	position: absolute;
	top: -5px;
  width: 10px;
  height: 10px;
	border-radius: 50%;
  background-color: #3ff9dc;
}

.sun {
	width: 35px;
	height: 35px;
	border-radius: 50%;
	background-color: #ffab91;
}

.leo {
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
}

.blue-orbit {
	width: 165px;
	height: 165px;
  border: 1px solid #91daffa5;
  animation: spin3D 3s linear .2s infinite;
  -webkit-animation: spin3D 3s linear .2s infinite;
}

.green-orbit {
	width: 120px;
	height: 120px;
  border: 1px solid #91ffbfa5;
animation: spin3D 2s linear 0s infinite;
  -webkit-animation: spin3D 2s linear 0s infinite;
}
.inf{
  text-align: center;
  /* transform: scale(1); */
}

.red-orbit {
	width: 90px;
	height: 90px;
  border: 1px solid #ffca91a5;
 animation: spin3D 1s linear 0s infinite;
  -webkit-animation: spin3D 1s linear 0s infinite;
}

.white-orbit {
	width: 60px;
	height: 60px;
  border: 2px solid #ffffff;
  animation: spin3D 10s linear 0s infinite;
  -webkit-animation: spin3D 10s linear 0s infinite;
}

.w1 {
  transform: rotate3D(1, 1, 1, 90deg);
}

.w2 {
  transform: rotate3D(1, 2, .5, 90deg);
}

.w3 {
  transform: rotate3D(.5, 1, 2, 90deg);
}

.three-quarter-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #fb5b53;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin .5s linear 0s infinite;
}


h5{
            color:#A9A9A9;
        }
        
        /* Offline container styling */
        .offline-container {
          text-align: center;
          max-width: 600px;
          padding: 20px;
        }
        
        h1 {
          font-size: 2.5rem;
          color: #007ACC; /* Vibrant red for offline message */
          margin-bottom: 15px;
        }
        
        p {
          font-size: 1.2rem;
          color: #cccccc; /* Light grey text for description */
        }
    </style>
    
</head>
<body>
    <div class="loader" id="loader">
        <div class="headl">TPREDICTIONS </div>
        
        <div class="spinner-box">
            <div class="blue-orbit leo">
            </div>

            <div class="green-orbit leo">
            </div>

            <div class="red-orbit leo">
            </div>

            <div class="white-orbit w1 leo">
            </div>
            <div class="white-orbit w2 leo">
            </div>
            <div class="white-orbit w3 leo">
            </div>
        </div>
<div class="inf">
          <h1>We Are Offline</h1>
          <br>
          
          <p>This section is temporarily disconnected!</p><br>
          <p><a style='color: red;text-decoration:underline;' href=${localStorage.getItem('Freeprev_path')}>${localStorage.getItem('typeOfPath')} </a></p><br><br><br>
          <footer>
              <h5>Copyright 2025 &copy; TPREDICTIONS . All rights reserved</h5>
            </footer>
        </div>
    </div>
   
</div>


<script>
</script>
    
    
</body>
</html>`
function check(){
  fetch(line+ '/status', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify('hi')
})
.then(response => response.json())
.then(data => {
    if (data.message=='okay'){
       
      
          
    }else{
    
   
    }
    if (false) {

    }else{
      window.location.reload()
    }

    
   
})
.catch(error => {
    console.log('testing')
});
}
setInterval(check,5000)

}




            
    });
})




    
    
    
   
    



// (function() {
//   // Store the original body content to restore it later.
//   let body=document.querySelector('body')
//   var originalContent = body.innerHTML;

//   // Create an overlay message element.
//   var messageDiv = document.createElement("div");
//   messageDiv.id = "compatibilityMessage";
//   messageDiv.style.cssText =
//     "position: fixed; top: 0; left: 0; width: 100%; height: 100%; " +
//     "background: #f8f8f8; display: flex; flex-direction: column; " +
//     "justify-content: center; align-items: center; text-align: center; " +
//     "z-index: 9999; opacity: 0;";
//   messageDiv.innerHTML =
//     '<div style="padding: 20px;">' +
//       '<h2 style="color: #333;">Sorry, your device width is not compatible.</h2>' +
//       '<p style="color: #555;">Please use a wider screen to enjoy this page.</p>' +
//       '<div style="margin-top: 20px; width: 50px; height: 50px; ' +
//            'border: 6px solid #007bff; border-top: 6px solid #fff; ' +
//            'border-radius: 50%; animation: spin 1s linear infinite;"></div>' +
//     '</div>';

//   // You may need to supply the CSS keyframes for the spinner animation via a stylesheet:
//   // @keyframes spin {
//   //   from { transform: rotate(0deg); }
//   //   to { transform: rotate(360deg); }
//   // }

//   // Helper function to wrap Tainwan's animation call.
//   // Adjust these options as required by your Tainwan library.
//   function animateElement(element, targetProps, duration, onComplete) {
//     Tainwan.animate(element, targetProps, {
//       duration: duration,
//       easing: "easeOut",
//       onComplete: onComplete || function() {}
//     });
//   }

  // The function that checks window.innerWidth and toggles the conte

function register(){
     window.location.assign(`${getHomePath()}/register/index.html`)
  }



  function scrollDown100px() {
  window.scrollBy({
    top: 250,
    left: 0,
    behavior: 'smooth' // Optional: makes the scroll animated
  });
}
