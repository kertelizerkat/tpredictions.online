let prev_state_s = accessInfo(de('state',date2))
if (prev_state_s){

}else{
    prev_state_s='login'
}
storeInfo(en('state',date2), 'verify')


document.addEventListener('DOMContentLoaded', function() {
    const verificationForm = document.getElementById('verificationForm');
    const verificationCodeInput = document.getElementById('verificationCode');
    const messageElement = document.getElementById('message');
    const timerElement = document.getElementById('timer');
    const countdownElement = document.getElementById('countdown');
    const resendButton = document.getElementById('resendButton');
    let countdown = 30;
    let countup = 0;

    function startCountdown() {
        countdownElement.style.display = 'block';
        const countdownInterval = setInterval(() => {
            countdown--;
            countup++;
            timerElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                resendButton.disabled = false;
                countdownElement.style.display = 'none';
                countup = 0;
            } else {
                resendButton.style.opacity = countup / 30;
            }
        }, 1000);
    }

    verificationCodeInput.addEventListener('input', function() {
        if (verificationCodeInput.value.length === 5) {
         
            const verificationCode = verificationCodeInput.value;
            const email=  accessInfo(en('email',date2))
            let data={ verificationCode: verificationCode, email_P: email   }
            // verificationCodeInput.value=''
            
            
            fetch(line+'/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data['message']=='varified') {
                    messageElement.textContent = 'Verification successful!';
                    messageElement.style.color = 'green';
                    window.location.assign("../login/index.html")
                    // console.error('Error:', 'success');
                } 
                    if (data['message']== 'incorrect'){
                        messageElement.textContent = 'Verification failed. incorrect code';
                        messageElement.style.color = 'red';

                    }
                    if (data['message']== 'Avarified'){
                        messageElement.textContent = 'Already varified';
                        messageElement.style.color = 'red';

                    }
                    if (data['message']== 'not_found'){
                        messageElement.textContent = 'Verification failed, email not found in database';
                        messageElement.style.color = 'red';

                    }

                    
                    // console.error('Error:', data);
                
            })
            .catch(error => {
                messageElement.textContent = 'Verification failed';
                messageElement.style.color = 'red';

            });
        }
    });

    resendButton.addEventListener('click', function() {
        countdown = 30;
        timerElement.textContent = countdown;
        resendButton.disabled = true;
        countdownElement.style.display = 'block';
        startCountdown();
        const email=  accessInfo(en('email',date2))
        let data={ email_P: email}
        // Add your code to resend the verification code here
        fetch(line+'/resend_c', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message=='verified'){
                window.location.assign("../login/index.html")
            }
           
        })
        .catch(error => {
            console.log(error)
        });
        console.log('Resend verification code');
    });

    startCountdown();

    // Prevent the user from refreshing the page
    // window.addEventListener('beforeunload', function(event) {
    //     event.preventDefault();
    //     event.returnValue = '';
    // });

    // Prevent the user from using F5 or Ctrl+R to refresh the page
    // document.addEventListener('keydown', function(event) {
    //     if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
    //         event.preventDefault();
    //     }
    // });
});

document.addEventListener('DOMContentLoaded', function() {
// alert(accessInfo(en('email',date2)))
let emailC= accessInfo(en('email',date2))
if (emailC){
    // alert(emailC)
    document.querySelector('.eml').textContent = emailC
}else{
    emailC=  de(accessInfo(en('email',date1)),date1)
    if (emailC){}else{
    window.location.assign('../login')}
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
        window.location.assign(`../${prev_state_s}`)

    }
   
})
.catch(error => {
    console.log(error)
    window.location.assign('../login')

});
})