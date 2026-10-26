
    // Object to store HTML content for each tab
    let mcont=document.querySelector('.container22')
    

    let rliadt=[]
    storeInfo('mode','black')
    let first=true
    

    let tod= document.getElementById('today')
    let yes= document.getElementById('analysis')
    
    let predicter= document.getElementById('predicter')
    let statec= 'today'
    let on=''
    let mstate='main'
    let main=document.getElementById('Dashboard')
    let bts=document.getElementById('BTS')
    let main_state="individual_matches"
    let state2_='individual_matches'
    let change=true
    let predicter_innerhtml=`
                  <div class="container33">

        <div class="holder">
          <div id="cencon" class="container-bts">
            <div class="form">
              <div class="cap"><img
                style="height:50px;width:50px; border-radius: 50%;display: inline;" src="../favicon.ico"> TPREDICTIONS <span id="M"></span><span id="T"></span><span id="E"></span></div>
              <label id='label33' style='font-size: small' for="input"
                >Match:
                <input
                  id="input" style='font-size: small; min-width: 75%;'
                  placeholder="Liverpool vs Chealsea"
                  type="text"
                  minlength="4"
              /></label>
              <button class="btn btn33" onclick="predict()" >Predict</button>
             
             
            </div>
          </div>
          
          <div>
            <div class="output"></div>
            <div class="progress-container hide">
        <div class="progress-bar" id="progress-bar">50%</div>
    </div>
    <div class="progress-label hide">Progress: <span id="progress-text">50%</span></div>
    
          </div>
        </div>
      </div>`
    
    
    tod.addEventListener('click',()=>{
      stl= statec=='today'
      statec= 'today'
      storeInfo('statec',statec)
      let cont2= document.getElementById('contentArea')
       cont2.classList.add('today_')
       if(first){
       retrieveSum2()
      updatecontent()
        first=false
      }else{
        if(!stl){
         let loader999=document.querySelector('.loader88')
          if (loader999){
            loader999.setAttribute('style','border:2px solid #fff;border-top-color: transparent;')
           
          }
         retrieveSum2()
         updatecontent()


        }else{

        }
      }
     
      
      
      

    })
    yes.addEventListener('click',()=>{
      statec='analysis'
      storeInfo('statec',statec)
     

    })
  
    predicter.addEventListener('click',()=>{
      statec='predicter'
      storeInfo('statec',statec)
       
    
    })
    let statec_=accessInfo('statec')
   
   
    let contentMap = {
      today: `  <div class="SOM">
          <div id="conttt"   title="Search Live , Upcoming or Ended Games " class="search-container">
            <input type="text" class="search-input" placeholder="TechNify Search..." />
            <div style="cursor:pointer" id='search-icon' class="search-icon">&#128269;</div>
          </div>
          <div class="suggestions-list" id="suggestions"></div>
          <div class="products-grid c1 ">
            <div class="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>`,
      analysis: `
      <div class='lineg'>

      
          <div style='background:transparent' class='light-mode ' id='gfl'>

            <div id='c-btn_344' class="theme-toggle hide">
                <span class="toggle-label">Theme Changer</span>
                <label class="switch">
                  <input type="checkbox" id="themeSwitcher">
                  <span class="slider"></span>
                </label>
            </div>

           <div class="min-h-screen relative">
  <div class="animated-bg"></div>
  <div class="max-w-6xl mx-auto px-2 sm:px-6 py-8">
    <h1 class="text-4xl sm:text-5xl font-extrabold text-center text-slate-800 drop-shadow-lg mb-10 tracking-tight select-none">
      <span class="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-700 bg-clip-text text-transparent">Betting Slips</span>
    </h1>
    <div class="flex justify-center mb-8 gap-2 flex-wrap">
      <button id="tab-pending" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Pending</button>
      <button id="tab-won" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Won</button>
      <button id="tab-lost" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Lost</button>
      <button id="tab-completed" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Completed</button>
    </div>
    <div id="betslip-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 min-h-[300px] transition-all duration-500"></div>
  </div>
 
</div>
          
          

          </div>
      
    


      </div>


      
      `,
      tips: `<h2>Tips</h2>
             <p>Here are some valuable tips. These tips will help you to improve your predictions by learning from data and expert insights.</p>`,
      predicter: `
                  <div class="container33">

        <div class="holder">
          <div id="cencon" class="container-bts">
            <div class="form">
              <div class="cap">TechNified Predictions <span id="M">M</span>.<span id="T">T</span>.<span id="E">E</span></div>
              <label id='label33' for="input"
                >Match:
                <input
                  id="input"
                  placeholder="Liverpool vs Chealsea"
                  type="text"
                  minlength="4"
              /></label>
              <button class="btn btn33" onclick="predict()" >Predict</button>
             
             
            </div>
          </div>
          
          <div>
            <div class="output"></div>
            <div class="progress-container hide">
        <div class="progress-bar" id="progress-bar">50%</div>
    </div>
    <div class="progress-label hide">Progress: <span id="progress-text">50%</span></div>
    
          </div>
        </div>
      </div>`
    };

     if (statec_){
      if (statec=='today'){
        tod.click()

      }
      if (statec_=='analysis'){
         yes.click()


      }
      if (statec_=='predicter'){
      predicter.click()

      }
    }else{
      storeInfo('statec','today')
      tod.click()
    }
    
  
    // Function to switch content based on clicked tab
    function switchContent(tab) {
      // Update the content area with the corresponding HTML
      if (tab==statec){
        return false
      }
      if (!(contentMap[tab]==predicter_innerhtml) && tab=='predicter'){
        document.getElementById('contentArea').innerHTML=predicter_innerhtml
        change=true
      }else{
      document.getElementById('contentArea').innerHTML = contentMap[tab]
      

      change=false;}
      

  if (tab=='predicter'){
        
        let qry = document.getElementById("input");
        let cont= document.getElementById('contentArea');
        cont.setAttribute('style','')
        let out_ = document.querySelector(".output");
        if (out_.innerHTML==''){
          cont.classList.add('shiningBG')
        }
        if (!change){
        cont.classList.add('shiningBG')}
        let btn33=document.querySelector('.btn33')
        let label33=document.getElementById('label33')
        let M = document.getElementById("M");
        let T = document.getElementById("T");
        let E = document.getElementById("E");
        if (true){
          if(main_state=='individual_matches'){
            
            state2_='individual_matches'
            M.style.color='#007BFF'
            T.style.color='unset'
            E.style.color='unset'
            main_state="individual_matches"
            qry.setAttribute('class', '');
            label33.style.display = 'unset';
            qry.style.display='unset'
            qry.setAttribute("placeholder", "Liverpool vs Chelsea");
            btn33.style.transform = 'scale(1)';
            btn33.textContent = 'Submit';
            btn33.style.marginBottom="unset"
            btn33.style.marginTop="20px"
          }
          if (main_state=='wining_matches'){
           
            state2_='wining_matches'
            E.style.color='#007BFF'
            T.style.color='unset'
            M.style.color='unset'
            main_state='wining_matches'
            qry.setAttribute('class', '');
            label33.style.display = 'unset';
            qry.style.display='unset'
            qry.setAttribute("placeholder", "E.g Country-China");
          
            btn33.style.transform = 'scale(1)';
            btn33.textContent = 'Submit';
            btn33.style.marginBottom="unset"
            btn33.style.marginTop="20px"
          }
          if (main_state=='premium'){
            predicter_innerhtml=cont.innerHTML
            state2_='premium'
            T.style.color='#007BFF'
            M.style.color='unset'
            E.style.color='unset'
            main_state="premium"
            qry.style.display='none'

        
           
            qry.setAttribute("placeholder", "");
            qry.setAttribute('class', 'Removebtn');
          
           
            btn33.textContent = 'Initiate';
            btn33.style.marginBottom="20px"
            btn33.style.marginTop="-4px"
            btn33.style.transform = 'scale(2)';
      
            label33.style.display = 'none';
          }
      }
      
        
        qry.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') { predict();}});
       
       if (!change){
        M.style.color='#007BFF'
       
      }
        M.style.cursor="pointer"
        T.style.cursor="pointer"
        E.style.cursor="pointer"
       
        M.addEventListener('click',()=>{
            predicter_innerhtml=cont.innerHTML
            state2_='individual_matches'
            M.style.color='#007BFF'
            T.style.color='unset'
            E.style.color='unset'
            main_state="individual_matches"
            qry.setAttribute('class', '');
            label33.style.display = 'unset';
            qry.style.display='unset'
            qry.setAttribute("placeholder", "Liverpool vs Chelsea");
            btn33.style.transform = 'scale(1)';
            btn33.textContent = 'Submit';
            btn33.style.marginBottom="unset"
            btn33.style.marginTop="20px"
            // predicter_innerhtml=cont.innerHTML
        })
        E.addEventListener('click',()=>{
          predicter_innerhtml=cont.innerHTML
            state2_='wining_matches'
            E.style.color='#007BFF'
            T.style.color='unset'
            M.style.color='unset'
            main_state='wining_matches'
            qry.setAttribute('class', '');
            label33.style.display = 'unset';
            qry.style.display='unset'
            qry.setAttribute("placeholder", "E.g Country-China");
          
            btn33.style.transform = 'scale(1)';
            btn33.textContent = 'Submit';
            btn33.style.marginBottom="unset"
            btn33.style.marginTop="20px"
        })
        T.addEventListener('click',()=>{
            predicter_innerhtml=cont.innerHTML
            state2_='premium'
            T.style.color='#007BFF'
            M.style.color='unset'
            E.style.color='unset'
            main_state="premium"
            qry.style.display='none'

        
           
            qry.setAttribute("placeholder", "");
            qry.setAttribute('class', 'Removebtn');
          
           
            btn33.textContent = 'Initiate';
            btn33.style.marginBottom="20px"
            btn33.style.marginTop="-4px"
            btn33.style.transform = 'scale(2)';
      
            label33.style.display = 'none';
          
        })
        
        
        

       
      }else{
       
        let cont= document.getElementById('contentArea')
        cont.classList.remove('shiningBG')
     

        if (tab=='analysis'){
          let area= document.getElementById('contentArea')
          area.style.flexDirection='column'

            updatecontent4()

       
     

          



  


          }else{
            let cont1= document.getElementById('contentArea');
            cont1.setAttribute('style','')
          }
      }
      // Update active styling for header items
      const headers = document.querySelectorAll('.header div');
      headers.forEach(header => {
        if (header.id === tab) {
          header.classList.add('active');
        } else {
          header.classList.remove('active');
        }
      });
    }
    
    function predict() {


  let qry = document.getElementById("input");
  
  let btn = document.querySelector('.btn33');
  let cencon = document.getElementById("cencon");
  let out = document.querySelector(".output");
  let cont= document.getElementById('contentArea')
  if (true){
   
  }
  
    

    
    cont.classList.add('shiningBG')
  

  let holder = document.querySelector(".holder");

  let bordero = out.style.border;
  let inno = out.innerHTML;
   if (main_state == "premium") {
    qry.value='premium'
   }

  

  

if (qry.value ) {
    // qry.setAttribute("placeholder","e.g. " + qry.value)
    // qry.value="";
    // out.innerHTML=''
    let ocikon=cencon.innerHTML
    cont.classList.remove('shiningBG')
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
     

    


    

    cencon.innerHTML= `  <div style='background-color: black;border-radius:40px;z-index:1000000' class="loading-container11">
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
    
 
    
    if (main_state == "wining_matches") {
        http = line+ "/receive_message";

    }
    if (main_state == "individual_matches") {
        http = line+"/individual_receive_message";
    }
    if (main_state == "premium") {
        http = line+"/premium";
        qry.value='premium'
     
    
    }
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

            //ceco
         
            cont.classList.remove('shiningBG')

            // out.style.border="2px solid rgba(65,25,65)"
            out.innerHTML = "<span id='green'>Loading (received) Content</span>"
            return response.json();
        })
        .then(data => {
            // console.log("data from server:", data)
            if (main_state == "wining_matches") {
                res = data.results;
                if (res=='<span id="red">You did not login!</span>'){
                  logout()
                }
            }
            if (main_state == "individual_matches" || main_state == "premium") {
                res = data.response;
                if (res=='<span id="red">You did not login!</span>'){
                  logout()
                }

            }


            console.log(res)

            holder.classList.add("flex")
            out.innerHTML = res
      
            
            cencon.innerHTML=ocikon
            predicter_innerhtml=cont.innerHTML
            scrollDown100px() 
        })
        .catch(error => {
            console.log("something wrong with the response", error)
            if (String(error) == "SyntaxError: Unexpected end of JSON input") {
                error = "Content being updated in the server, please try again later!"
            }

             if (String(error)=="TypeError: Failed to fetch"){
               out.innerHTML = `<span id='red' style='text-align:center'>👥: SORRY, WE ARE OFFLINE !!!<br>Please try again later.</span>`


            }else{
               out.innerHTML = `<span id='red'>${error}</span>`


            }
           
          
       
         
             cencon.innerHTML=ocikon
            holder.classList.add("flex");
            
            
        });


}

}
 
function longRunningTask() {
    console.log("Starting task...");
    let pcon = document.querySelector('.progress-container');
    let plabel = document.querySelector('.progress-label');
    let ptext = document.getElementById('progress-text');
    let pbar = document.getElementById('progress-bar');
    let out2 = document.querySelector(".output");
    pcon.classList.add('hide')
    plabel.classList.add('hide')
    ptext.textContent = "0" + '%'
    pbar.textContent = "0" + '%'
    pbar.style.width = "0" + '%'
    
    setTimeout(() => {
        console.log("Task running...");

        let value2=de(accessInfo(en('username',date1)),date1)
        out2.innerHTML=''
        let intervalID = setInterval(() => {

            fetch(line +'/status', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value2)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("<span id='red'>Something went wrong, Please try again!</span>");
        
        
        
                    }
                   
                
                    return response.json();
                })
                .then(data => {
                     
                  pcon.classList.remove('hide')
                  plabel.classList.remove('hide')
                  ptext.textContent = data.progress + '%'
                  pbar.textContent = data.progress + '%'
                  pbar.style.width = data.progress + '%'
                  if (data.progress=='100'){
                    clearInterval(intervalID);
                    pcon.classList.add('hide')
                    plabel.classList.add('hide')
                    ptext.textContent = '0%'
                    pbar.textContent = '0%'
                    pbar.style.width = '0%'
                  }
    
    
                })
                .catch(error => {
                    clearInterval(intervalID);
                    pcon.classList.add('hide')
                    plabel.classList.add('hide')
                    ptext.textContent = '0%'
                    pbar.textContent = '0%'
                    pbar.style.width = '0%'
                    
                   
            
                });
         
        }
        
        ,   8000);

       
        
    }, 4000); // Runs after 2 seconds, but doesn’t block execution

    console.log("Function call ended, but task is still running.");
}
