
window.addEventListener('DOMContentLoaded',()=>{
    let date2=18
    let date1=17
    let pstate=accessInfo(en('state',date2))
    let pasw=accessInfo(en('password',date1))
    let phone=accessInfo(en('phone',date1))
    let usern=accessInfo(en('username',date1))
    let email= accessInfo(en('email',date1))
    let logged= accessInfo(en('logged',date1))
    if (pasw && phone && usern && email && logged=='true'){
        let usss= document.getElementById('usname')
        if (usss){
            usss.textContent=de(accessInfo(en('username',date1)),date1)
        }
        
        if (!(pstate=='cost' || pstate=='login' || pstate=='verify' || pstate=='register' || pstate=='BTS'|| pstate=="logged")){window.location.assign('../logged')};
         
        
  
 
 

    
    }
   else{
    if (accessInfo('theme_+-----')!='Dark'){storeInfo('theme_+-----','Dark')
        window.location.reload(false)
    }
           let ll1= document.getElementById('ll1')
           let ll2= document.getElementById('ll2')
           let ot4= document.getElementById('ot4')
           let iconm= document.getElementById('iconm')
            document.getElementById('ot1').style.display='none'
            document.getElementById('ott1').textContent='Main'
            document.getElementById('ot3').textContent='🏠 Main'
            document.getElementById('Dashboard').style.display='none'
            document.getElementById('Dashboard').setAttribute('href',`${getHomePath()}/index.html`)
            document.getElementById('ott1').setAttribute('href',`${getHomePath()}/index.html`)
            document.getElementById('ott2').setAttribute('href',`${getHomePath()}/index.html`)
            document.getElementById('ot3').setAttribute('href',`${getHomePath()}/index.html`)
            document.getElementById('iconm').setAttribute('src','../../favicon.ico')
            document.getElementById('ot2').style.display='none'
            document.getElementById('ott2').style.display='none'
            
            // document.getElementById('Dashboard').style.display='none'
           
           if (ll1){
            ll1.textContent='SignUp'
            ll1.setAttribute('onclick','register()')
            // storeInfo('')
           }
           if (ot4){
            ot4.textContent='SignUp'
            if (ll2){
                ll2.setAttribute('onclick','register()')
                ll2.innerHTML="📝 <span id='ot4'>Sign up</span>"
            }
            
           }
        }
    document.getElementById('naivigation_1').classList.remove('invisible')
    document.getElementById('side-menu').classList.remove('invisible')
        
    
})





document.addEventListener('DOMContentLoaded', () => {
   
});




fetch(line+'/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('slips')
    })
    .then(response => response.json())
    .then(data5 =>{



         const container = document.getElementById('trends-container');
    
    const trends = data5.trends

    trends.forEach((trend, index) => {
        const item = document.createElement('div');
        item.classList.add('trend-item');

        const img = document.createElement('img');
        img.src = trend.img_src;
        img.alt = 'Flag';

        const p = document.createElement('p');
        p.textContent = trend.content;

        item.appendChild(img);
        item.appendChild(p);
        container.appendChild(item);

        // Trigger animation with a staggered delay
        setTimeout(() => {
            item.classList.add('animate');
        }, index * 100); // 100ms delay per item
    });
        

    }).catch(error => {
      console.log(error)
    });

// let intervalId = setInterval(() => {
//     let st=document.getElementById("verified-status")

    
       
//     if (!(st.textContent=='unknown')) {
//         console.log("Condition met! Stopping the loop.");
//         clearInterval(intervalId); // Stop the loop
//     }else{
//         if (!st.textContent=='checking'){
//         st.textContent='checking'
//         let emailC2=  de(accessInfo(en('email',date1)),date1)
//         let dataC={ email_P: emailC2 + "+check"  }
//         fetch(line+'/resend_c', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(dataC)
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.message=='verified'){
//             let status= document.getElementById("verified-status")
//             status.textContent='Verified'
//             status.style.color='rgb(0,255,0)'
        
//             }
//             if(data.message=='Nverified'){
//                 let status= document.getElementById("verified-status")
//                 status.textContent='Not Verified'
//                 status.style.color='rgb(255,0,0)'
//                 status.style.cursor='pointer'
//                 status.style.textDecoration='underline'
//                 status.addEventListener('click',()=>{
//                     window.location.assign('../../verify')
//                 })
        
    
//             }
    
           
//         })
//         .catch(error => {
//             console.log(error)
//             let status= document.getElementById("verified-status")
//             status.textContent='unknown'
//             status.style.color='yellow'
           
        
//         });
//     }
     
//     }
// }, 7000);

// let con=document.querySelector(".loading-container");



const titleEl = document.getElementById('title');
const text = titleEl.textContent;
titleEl.textContent = '';

// wrap and stagger each character
text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'letter';
    span.style.animationDelay = (i * 0.1) + 's';
    titleEl.append(span);
});
