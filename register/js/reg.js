const currentDate = new Date();
const currentYear = currentDate.getFullYear();

function validateForm() {
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const symbols = "~!@#$%^&*()_+=-{}[]\\|'\"<>,.?/;:` \n";
    const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    const numbers = "1234567890";
    const characters = symbols + letters + numbers;
    const reg_h= document.querySelector('.reg_h')
    // Check if fields are empty
    if (email === '' || phone === '' || username === '' || password === '') {
        
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        reg_h.style.color='red'
        return false;
    }  

    //Username V
    const UsernamePattern = /^[a-zA-Z][a-zA-Z0-9_-]{2,15}$/;
    if (!UsernamePattern.test(username)) {
        reg_h.textContent='Invalid Username'
        reg_h.style.color='red'


        setTimeout(()=>{
            c_btn.textContent='Try again';
            c_btn.style.backgroundColor='#007bff';
            reg_h.textContent='Register'
            reg_h.style.color='#ADD8E6'
        }, 2000);
        return false;
    }


    // Phone number validation (example: 10 digits)
    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(phone)) {
         reg_h.textContent='Invalid Number'
        reg_h.style.color='red'


        setTimeout(()=>{
            c_btn.textContent='Try again';
            c_btn.style.backgroundColor='#007bff';
            reg_h.textContent='Register'
            reg_h.style.color='#ADD8E6'
        }, 2000);
        return false;
    }

    // Password validation (example: minimum 8 characters, at least one number and one special character)
    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
        reg_h.textContent='Weak Password'
        reg_h.style.color='red'


        setTimeout(()=>{
            c_btn.textContent='Try again';
            c_btn.style.backgroundColor='#007bff';
            reg_h.textContent='Register'
            reg_h.style.color='#ADD8E6'
        }, 2000);
        return false;
    }



    // Additional security measure: sanitize input to prevent XSS
    const sanitizedEmail = email.replace(/[^\w\s@.-]/gi, '');
    const sanitizedPhone = phone.replace(/[^\d]/gi, '');
    const sanitizedUsername = username.replace(/[^\w\s@.-]/gi, '');
    const sanitizedPassword = password

    // You can now safely use sanitizedEmail, sanitizedPhone, sanitizedUsername, and sanitizedPassword
    const formData_ = {
        email: en(sanitizedEmail, currentYear),
        phone: en(sanitizedPhone, currentYear),
        username: en(sanitizedUsername, currentYear),
        password: en(sanitizedPassword, currentYear),
        cy: currentYear
    };
    const data = { data: `${formData_.email}(@)${formData_.phone}(@)${formData_.username}(@)${formData_.password}(@)${formData_.cy}(@)` }

    // Alert user and return true for successful validation

    const btn_s = document.getElementById('btn_s')
    btn_s.classList.add('load')
    btn_s.style.backgroundColor='black'
    sendFormData(data,sanitizedEmail);
    



    return false; // Prevent form from submitting the traditional way
}




function sendFormData(data,sanitizedEmail) {
    // Send data to Flask application using fetch

    const http = line + "/register";
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
            console.log("Data from server:", data);
            if (data['message'] == 'Registration Passed!') {
                const reg_h= document.querySelector('.reg_h')
                const c_btn = document.getElementById('btn_s')
                c_btn.classList.remove('load')
                c_btn.textContent = 'Done'
                c_btn.style.backgroundColor = '#28a745'
                reg_h.textContent='Register'
                    reg_h.style.color='#ADD8E6'
                
                setTimeout(()=>{
                    storeInfo(en('email',date2), sanitizedEmail)
                    window.location.assign("../verify/index.html")
                }, 1000);
 // 2000 milliseconds = 2 seconds
            // window.location.assign("../login/index.html")

                
                
            } else {
                const reg_h= document.querySelector('.reg_h')
                const c_btn = document.getElementById('btn_s')
                if (data['reason']=="EXemail"){
                    reg_h.textContent='Invalid Email'
                    reg_h.style.color='red'

                }
                if (data['reason']=="email"){
                    reg_h.textContent='Email Exist'
                    reg_h.style.color='red'

                }
                if (data['reason']=="phone"){
                    reg_h.textContent='Phone No: Exist'
                    reg_h.style.color='red'

                }
                if (data['reason']=="username"){
                    reg_h.textContent='Username taken'
                    reg_h.style.color='red'

                }
                if (data['reason']=="password"){
                    reg_h.textContent='Password taken'
                    reg_h.style.color='red'

                }
                
                
                c_btn.classList.remove('load')
                c_btn.textContent = 'Failed'
                c_btn.style.backgroundColor = 'red'
                setTimeout(()=>{
                    c_btn.textContent='Try again';
                    c_btn.style.backgroundColor='#007bff';
                    reg_h.textContent='Register'
                    reg_h.style.color='#0056b3'
                }, 1000); // 2000 milliseconds = 2 seconds
                

             
            }


        })
        .catch(error => {
            console.log("Something went wrong with the response", error);
            const c_btn = document.getElementById('btn_s')
            c_btn.classList.remove('load')

                c_btn.textContent = 'Failed'
                c_btn.style.backgroundColor = 'red'
                setTimeout(()=>{
                    c_btn.textContent='Try again';
                    c_btn.style.backgroundColor='#007bff'
                }, 1000); // 2000 milliseconds = 2 seconds
         

        });

    // return "passed"// Prevent form from submitting the traditional way n Incorrect2007@
}
