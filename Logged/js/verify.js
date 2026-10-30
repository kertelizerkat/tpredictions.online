
window.addEventListener('load',()=>{
    let dmcon = accessInfo("domaContent2")
    let givendt = accessInfo('domaContentdate2')
    let ons= accessInfo('online') 
    let dd=accessInfo(en('logged',17))
    if (givendt) {
        checkTimeDifference(givendt, onThresholdMet);
    }
    if (dmcon && ons=='true' && dd=='true' && accessInfo(en('password',17)) && accessInfo(en('username',date1)) ) {
    
        document.body.innerHTML = dmcon
    
    }else{

    let date2=18
    let date1=17
    const pstate=accessInfo(en('state',date2))
    const pasw=accessInfo(en('password',date1))
    const phone=accessInfo(en('phone',date1))
    const usern=accessInfo(en('username',date1))
    const email= accessInfo(en('email',date1))
    const logged= accessInfo(en('logged',date1))

    if (pasw && phone && usern && email && logged=='true'){
        if (!(pstate=='cost' || pstate=='login' || pstate=='verify' || pstate=='register' || pstate=="logged" )){window.location.assign('../login')}else{

           
// de(accessInfo(en('username',date1)),date1)
        let usht= document.querySelector('.username');
        usht.innerHTML=de(usern,date1);
        storeInfo(en('state',date2), 'logged')
        data = { data: `${(en(de(email,date1),date2))}(@)${en(de(pasw,date1),date2)}(@)`
        
    
    
    }
      let tt= document.getElementById('state_loader')
       
    let username_lod= document.getElementById('username_loader')
    let vdt= document.getElementById('vdata')
       vdt.classList.remove('hide_bx')
  

     try{
     username_lod.textContent=`Hi ${de(accessInfo(en('username',date1)),date1)}`;
    tt.textContent='Verified';
    document.querySelector('.logo_name').textContent= de(accessInfo(en('username',date1)),date1);
//    tt.classList.add('checked')
    vdt.classList.add('checked');
    resp= 'verified';
    steps_to_remove_loader=1
 

}catch{
        sendFormData(data)
    }


       
   
    
    }
   
        
 
    
    }
    else{
        storeInfo('lastStoredTime','')
        storeInfo('matchSummary','')
        storeInfo(en('logged',date1),'')
        storeInfo(en('username',date1),'')
        storeInfo(en('state',date2),'')
        storeInfo(en('email',date1),'')
        storeInfo(en('password',date1),'')
        
        window.location.assign("../login/index.html")}
        
    
}})

window.addEventListener('load',()=>{
    
        
    checkTimeElapsed()

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

    //   toggleButton.click()
  
 

const header = document.querySelector("header");
let val=0;
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


  
})







    
    









// let con=document.querySelector(".loading-container");




function sendFormData(data) {
    // Send data to Flask application using fetch
    // console.log(data)
    let tt= document.getElementById('state_loader')
       tt.textContent='Validating User info, please wait...'
    let username_lod= document.getElementById('username_loader')
    let vdt= document.getElementById('vdata')
    vdt.classList.remove('hide_bx')
    const http = line + "/login";
    fetch(http, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
        .then(response => {

            if (!response.ok) 
                { throw new Error("Something went wrong, Please try again!");
                    
                } 
                
                return response.json();

        })
        .then(data => {
            // console.log("Data from server:", data);
            
            reg_h=document.querySelector('.reg_h')
            if (data.message=='<span id="red">You did not login!</span>'){
                logout()
            }
            if (data['message']=='Login failed!'){
              if (data['reason']=='incorrect details'){
            window.location.assign("../login/index.html")
              
              }
            }else{
                  
               username_lod.textContent=`Hi ${de(accessInfo(en('username',date1)),date1)}`
               tt.textContent='Verified'
               document.querySelector('.logo_name').textContent= de(accessInfo(en('username',date1)),date1)
            //    tt.classList.add('checked')
               vdt.classList.add('checked')
               resp= 'verified'
               steps_to_remove_loader=1
               

            } 

        })
        .catch(error => {
            steps_to_remove_loader=0
            storeInfo('lastStoredTime','')
            storeInfo('matchSummary','')

            window.location.assign("../login/index.html")
      
            // c_btn.setAttribute('type','')
         

        });
    //    alert(resp)

    // return "passed"// Prevent form from submitting the traditional way n Incorrect2007@
      };



      function saveDOMBeforeReload() {
        window.addEventListener('beforeunload', function () {
            try {
                // Get the current DOM content
                if (accessInfo('online')=='true' && accessInfo(en('logged',17))=='true') {
                const domContent = document.body.innerHTML;
                const exampleDate = new Date();
                // Save it in local storage
                localStorage.setItem('domContent2', domContent);
                localStorage.setItem('domContentdate2', exampleDate);
                localStorage.setItem('main_state2', main_state);
    
                console.log('DOM content saved before reload!');}
            } catch (error) {
                console.error('Error saving DOM content:', error);
            }
        });
    }
    
    // Call the function to start listening for reloads
    // saveDOMBeforeReload();
    function checkTimeDifference(dateGiven, callbackFunction) {
        const currentTime = dateGiven; // Get the current date and time
        const givenTime = new Date(dateGiven); // Convert the given date to a Date object
    
        // Calculate the time difference in milliseconds
        const timeDifference = currentTime - givenTime;
    
        // Check if the time difference is 2 minutes or more (10 minutes = 600,000 milliseconds)
        if (timeDifference >= 120000) {
            ; // Call the provided function
            localStorage.setItem('domContent2', '')
            localStorage.setItem('domContentdate2', '')
            localStorage.setItem('main_state2', '')
        } else {
            console.log('The 10-minute threshold has not yet been reached.');
        }
    }
    
    // Example usage:
    // Define the function to execute
    function onThresholdMet() {
        console.log('10 minutes have passed since the given date!');
    }    