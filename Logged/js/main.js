
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
            <section class="predictor-progress" id="predictor-progress" aria-live="polite" hidden>
              <div class="predictor-progress-heading">
                <span class="predictor-progress-orbit" aria-hidden="true"><span></span></span>
                <div class="predictor-progress-copy">
                  <h3 id="predictor-progress-stage">Getting started</h3>
                  <p id="predictor-progress-detail">Preparing your match search.</p>
                </div>
                <strong class="predictor-progress-percent" id="predictor-progress-percent">0%</strong>
              </div>
              <div class="predictor-progress-track" role="progressbar" aria-label="Prediction progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div class="predictor-progress-fill" id="predictor-progress-fill"></div>
              </div>
              <div class="predictor-progress-meta">
                <span id="predictor-progress-source">Saved match data</span>
                <span id="predictor-progress-count">Waiting for the first update</span>
                <span id="predictor-progress-remaining"></span>
              </div>
            </section>
            <div class="output"></div>
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
      <button id="tab-unresolved" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Missing data <span class="tab-count">0</span></button>
      <button id="tab-won" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Won</button>
      <button id="tab-lost" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Lost</button>
      <button id="tab-completed" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Completed</button>
    </div>
    <div class="betslip-filter-row" aria-label="Filter and sort bet slips">
      <label class="betslip-filter-field">Match date from<input id="betslip-date-from" type="date" /></label>
      <label class="betslip-filter-field">Match date to<input id="betslip-date-to" type="date" /></label>
      <label class="betslip-filter-field betslip-sort-field">Sort slips<select id="betslip-sort">
        <option value="newest">Newest slips</option>
        <option value="oldest">Oldest slips</option>
        <option value="most-active">Most active (live matches)</option>
        <option value="most-outcomes">Most settled outcomes (pending first)</option>
        <option value="most-matches">Most matches</option>
      </select></label>
      <button id="betslip-clear-filters" type="button" class="betslip-clear-filters">Clear date filters</button>
    </div>
    <p class="betslip-filter-hint">Date range and sorting work with the selected status tab above.</p>
    <div class="betslip-search-row flex flex-wrap justify-center items-center gap-2 mb-4">
      <input id="betslip-search" type="search" placeholder="Find a slip or match" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
      <button id="betslip-search-button" type="button" class="px-4 py-2 rounded-lg bg-blue-600 text-white">Find</button>
    </div>
    <div id="betslip-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 min-h-[300px] transition-all duration-500"></div>
    <div class="flex justify-center items-center gap-4 mt-5">
      <button id="betslip-prev" type="button" class="px-3 py-2 rounded-lg bg-slate-200 disabled:opacity-40">← Previous</button>
      <span id="betslip-page-status" class="text-sm text-slate-600">Page 1 of 1 · 0 slips</span>
      <button id="betslip-next" type="button" class="px-3 py-2 rounded-lg bg-slate-200 disabled:opacity-40">Next →</button>
    </div>
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
            <section class="predictor-progress" id="predictor-progress" aria-live="polite" hidden>
              <div class="predictor-progress-heading">
                <span class="predictor-progress-orbit" aria-hidden="true"><span></span></span>
                <div class="predictor-progress-copy">
                  <h3 id="predictor-progress-stage">Getting started</h3>
                  <p id="predictor-progress-detail">Preparing your match search.</p>
                </div>
                <strong class="predictor-progress-percent" id="predictor-progress-percent">0%</strong>
              </div>
              <div class="predictor-progress-track" role="progressbar" aria-label="Prediction progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div class="predictor-progress-fill" id="predictor-progress-fill"></div>
              </div>
              <div class="predictor-progress-meta">
                <span id="predictor-progress-source">Saved match data</span>
                <span id="predictor-progress-count">Waiting for the first update</span>
                <span id="predictor-progress-remaining"></span>
              </div>
            </section>
            <div class="output"></div>
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
  const queryInput = document.getElementById('input');
  const button = document.querySelector('.btn33');
  const output = document.querySelector('.output');
  const content = document.getElementById('contentArea');
  const holder = document.querySelector('.holder');
  const progressPanel = document.getElementById('predictor-progress');
  const requestMode = main_state;
  const query = requestMode === 'premium' ? 'premium' : String(queryInput && queryInput.value || '').trim();

  if (!query || !button || !output || !progressPanel) return;

  let endpoint = '';
  if (requestMode === 'wining_matches') endpoint = line + '/receive_message';
  else if (requestMode === 'individual_matches') endpoint = line + '/individual_receive_message';
  else if (requestMode === 'premium') endpoint = line + '/premium';
  if (!endpoint) return;

  const taskId = window.crypto && typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `predict_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const previousButtonText = button.textContent;
  const source = requestMode === 'wining_matches'
    ? 'Saved tournament and match summaries'
    : requestMode === 'premium'
      ? 'Saved tournament report'
      : 'Stored team form and match-history records';
  let progressRequestActive = false;
  let progressFinished = false;
  let progressTimer = null;

  const renderProgress = (data) => {
    const value = Math.max(0, Math.min(100, Number(data.progress) || 0));
    const stage = document.getElementById('predictor-progress-stage');
    const detail = document.getElementById('predictor-progress-detail');
    const percent = document.getElementById('predictor-progress-percent');
    const fill = document.getElementById('predictor-progress-fill');
    const sourceText = document.getElementById('predictor-progress-source');
    const countText = document.getElementById('predictor-progress-count');
    const remainingText = document.getElementById('predictor-progress-remaining');
    const track = progressPanel.querySelector('[role="progressbar"]');

    progressPanel.hidden = false;
    progressPanel.classList.toggle('is-complete', data.status === 'complete');
    progressPanel.classList.toggle('is-error', data.status === 'error');
    if (stage) stage.textContent = data.stage || 'Working on your request';
    if (detail) detail.textContent = data.detail || 'Checking the saved match data.';
    if (percent) percent.textContent = `${value}%`;
    if (fill) fill.style.width = `${value}%`;
    if (track) track.setAttribute('aria-valuenow', String(value));
    if (sourceText) sourceText.textContent = data.source || source;

    const processed = Number(data.processed);
    const total = Number(data.total);
    const hasCounts = data.processed !== null && data.processed !== undefined
      && data.total !== null && data.total !== undefined
      && Number.isFinite(processed) && Number.isFinite(total) && total >= 0;
    const found = Number(data.found);
    const hasFound = data.found !== null && data.found !== undefined && Number.isFinite(found);
    if (countText) {
      if (hasCounts) {
        countText.textContent = `${processed.toLocaleString()} of ${total.toLocaleString()} checked`;
      } else if (hasFound) {
        countText.textContent = `${found.toLocaleString()} matches found`;
      } else {
        countText.textContent = data.status === 'complete' ? 'All checks finished' : 'Checking the saved data';
      }
      if (hasCounts && hasFound) countText.textContent += ` · ${found.toLocaleString()} found`;
    }
    if (remainingText) {
      remainingText.textContent = hasCounts
        ? `${Math.max(0, Number(data.remaining ?? total - processed)).toLocaleString()} left`
        : data.status === 'running' ? 'Counting items…' : '';
    }
    if (track) track.setAttribute('aria-valuetext', `${data.stage || 'Working'}: ${value}%`);
  };

  const refreshProgress = async () => {
    if (progressRequestActive || progressFinished) return;
    progressRequestActive = true;
    try {
      const progressUrl = `${String(line).replace(/\/+$/, '')}/predictor_progress/${encodeURIComponent(taskId)}`;
      const response = await fetch(progressUrl, { method: 'GET', cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      renderProgress(data);
      if (data.status === 'complete' || data.status === 'error') {
        progressFinished = true;
        if (progressTimer) clearInterval(progressTimer);
      }
    } catch (error) {
      // Keep the prediction request running if an individual progress poll is missed.
    } finally {
      progressRequestActive = false;
    }
  };

  content.classList.remove('shiningBG');
  if (holder) holder.classList.add('flex');
  button.disabled = true;
  button.textContent = 'Working…';
  renderProgress({
    status: 'running',
    stage: requestMode === 'wining_matches'
      ? 'Preparing your search'
      : requestMode === 'premium' ? 'Opening the saved tournament report' : 'Finding both teams',
    detail: requestMode === 'wining_matches'
      ? 'Getting the saved match summaries ready to check.'
      : requestMode === 'premium' ? 'Loading the latest prepared tournament report.'
        : 'Searching stored team data for your match.',
    progress: 1,
    source
  });
  progressTimer = setInterval(refreshProgress, 650);
  refreshProgress();

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, task_id: taskId })
  })
    .then(response => {
      if (!response.ok) throw new Error('The request could not be completed. Please try again.');
      return response.json();
    })
    .then(data => {
      const result = requestMode === 'wining_matches' ? data.results : data.response;
      if (typeof result !== 'string') throw new Error('The server returned an empty report. Please try again.');
      if (/you did not login|account not verified|please log out and in/i.test(result)) {
        logout();
        return;
      }
      output.innerHTML = result;
      const resultCount = requestMode === 'wining_matches'
        ? (result.match(/class=["']results["']/g) || []).length
        : undefined;
      renderProgress({
        status: 'complete',
        stage: 'Report ready',
        detail: requestMode === 'wining_matches'
          ? `${resultCount.toLocaleString()} matching fixture${resultCount === 1 ? '' : 's'} found.`
          : requestMode === 'premium'
            ? result.includes('No prepared tournament report')
              ? 'There is no prepared tournament report to show right now.'
              : 'The saved tournament report is ready to view.'
            : result.includes('No results found')
              ? 'No matching team records were found.'
              : 'Your team comparison is ready.',
        progress: 100,
        found: resultCount,
        source
      });
      predicter_innerhtml = content.innerHTML;
      scrollDown100px();
    })
    .catch(error => {
      output.textContent = error && error.message === 'Failed to fetch'
        ? 'The service could not be reached. Please try again in a moment.'
        : (error.message || 'The request could not be completed.');
      renderProgress({
        status: 'error',
        stage: 'Could not finish this search',
        detail: error.message || 'Please check your connection and try again.',
        progress: 100,
        source
      });
      progressFinished = true;
    })
    .finally(() => {
      if (progressTimer) clearInterval(progressTimer);
      button.disabled = false;
      button.textContent = previousButtonText || (requestMode === 'premium' ? 'Initiate' : 'Submit');
      predicter_innerhtml = content.innerHTML;
    });
}
