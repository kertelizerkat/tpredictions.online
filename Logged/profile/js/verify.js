
window.addEventListener('DOMContentLoaded',()=>{
    let date2=18 
    let date1=17
    let pstate=accessInfo(en('state',date2))
    let pasw=accessInfo(en('password',date1))
    let phone=accessInfo(en('phone',date1))
    let usern=accessInfo(en('username',date1))
    let email= accessInfo(en('email',date1))
    let bio= accessInfo(en('bio',date1))
    let web= accessInfo(en('website',date1))
    let loc= accessInfo(en('address',date1))
    let logged= accessInfo(en('logged',date1))
    const hasLocalProfileFields = Boolean(bio || web || loc)
    if (pasw && phone && usern && email && logged=='true'){
        
        if (!(pstate=='cost' || pstate=='login' || pstate=='verify' || pstate=='register' || pstate=='BTS'|| pstate=="logged")){window.location.assign('../logged')};
        pstate=accessInfo(en('state',date2))
         
         phone=de(phone,date1)
         usern=de(usern,date1)
         email= de(email,date1)
         bio= bio ? de(bio,date1) : ''
         web= web ? de(web,date1) : ''
         loc= loc ? de(loc,date1) : ''
       
        let username= document.getElementById('username');
        let emailA= document.getElementById('email');
        let phonen= document.getElementById('phone');
        // let password= document.getElementById('password');


        let bioA= document.getElementById('bio')
        let webA= document.getElementById('website')
        let locA= document.getElementById('Location_')
        let lgname=document.querySelector('.logo_name')
        emailA.textContent=email
        phonen.textContent=phone
        username.textContent=usern
        bioA.textContent=bio
        webA.textContent=web
        locA.textContent=loc
   
        lgname.textContent=usern

    // The account record is authoritative so edits made on another device
    // appear here even when this browser has an older local profile cache.
    fetch(line + '/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ email, password: de(pasw, date1) })
    })
    .then(response => response.json().then(payload => {
        if (!response.ok) throw new Error(payload.message || 'Profile could not be loaded.');
        return payload;
    }))
    .then(payload => {
        if (window.profileEditStarted) return;
        const profile = payload.profile;
        if (!profile) return;
        if (profile.username) {
            username.textContent = profile.username;
            if (lgname) lgname.textContent = profile.username;
        }
        if (profile.has_profile) {
            bioA.textContent = profile.bio || '';
            locA.textContent = profile.address || '';
            webA.textContent = profile.website || '';
            const websiteText = String(profile.website || '').trim();
            const websiteUrl = /^https?:\/\//i.test(websiteText) ? websiteText : (websiteText ? `https://${websiteText}` : '');
            try {
                const parsed = websiteUrl ? new URL(websiteUrl) : null;
                webA.href = parsed && ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
                webA.target = webA.href === '#' ? '' : '_blank';
                webA.rel = 'noopener noreferrer';
            } catch (_) { webA.href = '#'; webA.removeAttribute('target'); }
        } else if (hasLocalProfileFields) {
            // Migrate profiles previously saved only in this browser so the
            // same profile is available from other devices and future sessions.
            fetch(line + '/saveP', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({
                    username: profile.username || usern,
                    bio: bio || '',
                    address: loc || '',
                    website: web || '',
                    email,
                    password: de(pasw, date1),
                })
            }).then(response => response.json().then(result => {
                if (!response.ok || result.message !== 'Saving Passed!') {
                    throw new Error(result.message || 'Existing profile could not be synced.');
                }
            })).catch(error => console.warn('Could not migrate the local profile to the account server:', error));
        }
        try {
            if (profile.username) storeInfo(en('username', date1), en(profile.username, date1));
            if (profile.has_profile) {
                storeInfo(en('bio', date1), en(profile.bio || '', date1));
                storeInfo(en('website', date1), en(profile.website || '', date1));
                storeInfo(en('address', date1), en(profile.address || '', date1));
            }
        } catch (error) {
            console.warn('Profile loaded from the server; local cache could not encode all characters.', error);
        }
    })
    .catch(error => console.warn('Could not sync profile from the account server:', error));

    const emailC=email
    if (emailC){
        // alert(emailC)
        // document.querySelector('.eml').textContent = emailC
    }else{
        
        window.location.assign('../login')
    }
    let dataC={ email_P: emailC + "+check"  }
    
    fetch(line+'/resend_c', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataC)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message=='verified'){
        let status= document.getElementById("verified-status")
        status.textContent='Verified'
        status.style.color='#007ACC'
        // status.style.paddingLeft='20px'
        status.style.fontWeight='600'
    
        }
        if(data.message=='Nverified'){
            let status= document.getElementById("verified-status")
            status.textContent='Not Verified'
            status.style.color='rgb(255,0,0)'
            status.style.fontWeight='600'
            status.style.cursor='pointer'
            status.style.textDecoration='underline'
            status.addEventListener('mouseover',()=>{
                status.style.color='white'
                status.style.textDecoration='none'
            })
            status.addEventListener('mouseout',()=>{
                status.style.color='red'
                status.style.textDecoration='underline'
            })
            status.addEventListener('click',()=>{
                window.location.assign('../../verify/index.html')
            })
    

        }

       
    })
    .catch(error => {
        console.log(error)
        let status= document.getElementById("verified-status")
        status.textContent='unknown..'
        if (localStorage.getItem('theme_+-----')=='Light'){
        status.style.color='black'}else{
            status.style.color='yellow'
        }
       
    
    });
    
       

    
    }
    else{window.location.assign("../index.html")}
        
    
})


let intervalId = setInterval(() => {
    let st=document.getElementById("verified-status")

    
       
    if (!(st.textContent=='unknown')) {
        console.log("Condition met! Stopping the loop.");
        clearInterval(intervalId); // Stop the loop
    }else{
        if (!st.textContent=='checking'){
        st.textContent='checking'
        let emailC2=  de(accessInfo(en('email',date1)),date1)
        let dataC={ email_P: emailC2 + "+check"  }
        fetch(line+'/resend_c', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataC)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message=='verified'){
            let status= document.getElementById("verified-status")
            status.textContent='Verified'
            status.style.color='rgb(0,255,0)'
        
            }
            if(data.message=='Nverified'){
                let status= document.getElementById("verified-status")
                status.textContent='Not Verified'
                status.style.color='rgb(255,0,0)'
                status.style.cursor='pointer'
                status.style.textDecoration='underline'
                status.addEventListener('click',()=>{
                    window.location.assign('../../verify')
                })
        
    
            }
    
           
        })
        .catch(error => {
            console.log(error)
            let status= document.getElementById("verified-status")
            status.textContent='unknown'
            status.style.color='yellow'
           
        
        });
    }
     
    }
}, 7000);

// let con=document.querySelector(".loading-container");

