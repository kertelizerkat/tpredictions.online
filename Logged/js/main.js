
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
                style="height:50px;width:50px; border-radius: 50%;display: inline;" src="../favicon.ico"> TPREDICTIONS <span id="M" title="Match — predict one fixture"></span><span id="T" title="Tournament report — open the saved report"></span><span id="E" title="Country search — search saved tournament matches"></span></div>
              <label id='label33' style='font-size: small' for="input"
                >Match:
                <input
                  id="input" style='font-size: small; min-width: 75%;'
                  placeholder="Liverpool vs Chealsea"
                  type="text"
                  minlength="4"
              /></label>
              <p id="predictor-input-hint" class="predictor-input-hint" hidden></p>
              <p id="predictor-mode-note" class="predictor-mode-note" hidden></p>
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
    <div class="betslip-dataset-switch" data-betslip-view-control role="tablist" aria-label="Betslip data source">
      <button type="button" class="betslip-dataset-btn active" data-slip-dataset="real" role="tab" aria-selected="true">Real slips</button>
      <button type="button" class="betslip-dataset-btn" data-slip-dataset="simulated" role="tab" aria-selected="false">Simulated slips</button>
    </div>
    <p id="betslip-simulation-report" data-betslip-view-control class="betslip-simulation-report" aria-live="polite" hidden></p>
    <div class="betslip-section-navigation">
      <div id="betslip-status-tabs" class="betslip-status-tabs flex justify-center gap-2 flex-wrap" role="tablist" aria-label="Betslip sections">
        <button id="tab-pending" data-slip-status-tab class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Pending</button>
        <button id="tab-unresolved" data-slip-status-tab class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Missing data <span class="tab-count">0</span></button>
        <button id="tab-won" data-slip-status-tab class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Won</button>
        <button id="tab-lost" data-slip-status-tab class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Lost</button>
        <button id="tab-completed" data-slip-status-tab title="Only slips where every match leg has a verified final result" class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Completed</button>
        <button id="tab-performance" data-slip-real-only hidden class="tab-btn px-5 py-2 rounded-t-lg font-semibold text-slate-700 bg-transparent shadow-none transition-all duration-300 focus:outline-none border-b-2 border-transparent relative">Performance</button>
      </div>
      <button id="tab-back-to-slips" type="button" class="betslip-back-button" hidden>Back to slips</button>
    </div>
    <section id="betslip-performance" class="betslip-performance" aria-labelledby="betslip-performance-title" hidden>
      <div class="betslip-performance-intro">
        <div class="betslip-performance-title-group">
          <p class="betslip-performance-eyebrow">REAL BETS</p>
          <h2 id="betslip-performance-title">Performance</h2>
          <p>Compare full-slip returns with individual match-bet returns at the same stake.</p>
        </div>
        <span class="betslip-performance-stake">Fixed stake · R1</span>
      </div>
      <div class="betslip-performance-sections">
        <section class="betslip-performance-card betslip-performance-card-multi" aria-labelledby="betslip-multi-title">
          <div class="betslip-performance-card-header">
            <span class="betslip-performance-mark" aria-hidden="true">M</span>
            <div class="betslip-performance-card-title">
              <p class="betslip-performance-eyebrow">ACCUMULATOR</p>
              <h3 id="betslip-multi-title">Multi bet</h3>
              <p>One R1 stake per slip. Every leg must win for a payout.</p>
            </div>
            <span class="betslip-performance-kind">R1 / slip</span>
          </div>
          <div class="betslip-performance-stats">
            <div class="betslip-performance-stat"><span>Deposited <small>stake on all saved slips</small></span><strong data-performance="multi-deposit">R0.00</strong></div>
            <div class="betslip-performance-stat gain"><span>Winning profit <small>after winning stakes</small></span><strong data-performance="multi-profit">R0.00</strong></div>
            <div class="betslip-performance-stat loss"><span>Lost stakes <small>settled losing slips</small></span><strong data-performance="multi-loss">R0.00</strong></div>
            <div class="betslip-performance-stat betslip-performance-stat-balance"><span>Balance <small>deposited + profit − losses</small></span><strong data-performance="multi-balance">R0.00</strong></div>
          </div>
          <div class="betslip-performance-counts" aria-label="Multi-bet slip outcomes">
            <span class="is-win"><strong data-performance="multi-won-count">0</strong> won</span>
            <span class="is-loss"><strong data-performance="multi-lost-count">0</strong> lost</span>
            <span><strong data-performance="multi-open-count">0</strong> open · <strong data-performance="multi-open-stake">R0.00</strong></span>
          </div>
          <p class="betslip-performance-warning" data-performance="multi-warning" hidden></p>
        </section>
        <section class="betslip-performance-card betslip-performance-card-single" aria-labelledby="betslip-single-title">
          <div class="betslip-performance-card-header">
            <span class="betslip-performance-mark" aria-hidden="true">S</span>
            <div class="betslip-performance-card-title">
              <p class="betslip-performance-eyebrow">INDIVIDUAL SELECTIONS</p>
              <h3 id="betslip-single-title">Single bets</h3>
              <p>Each match is a separate R1 bet, even when it came from a multi slip.</p>
            </div>
            <span class="betslip-performance-kind">R1 / match</span>
          </div>
          <div class="betslip-performance-stats">
            <div class="betslip-performance-stat"><span>Deposited <small>settled match stakes</small></span><strong data-performance="single-deposit">R0.00</strong></div>
            <div class="betslip-performance-stat gain"><span>Winning profit <small>after winning stakes</small></span><strong data-performance="single-profit">R0.00</strong></div>
            <div class="betslip-performance-stat loss"><span>Lost stakes <small>settled losing matches</small></span><strong data-performance="single-loss">R0.00</strong></div>
            <div class="betslip-performance-stat betslip-performance-stat-balance"><span>Balance <small>deposited + profit − losses</small></span><strong data-performance="single-balance">R0.00</strong></div>
          </div>
          <div class="betslip-performance-counts" aria-label="Individual match outcomes">
            <span><strong data-performance="single-settled-count">0</strong> settled</span>
            <span class="is-win"><strong data-performance="single-won-count">0</strong> won</span>
            <span class="is-loss"><strong data-performance="single-lost-count">0</strong> lost</span>
          </div>
          <p class="betslip-performance-warning" data-performance="single-warning" hidden></p>
        </section>
      </div>
      <p class="betslip-performance-note">Balance starts with the displayed deposited stakes, adds profit from verified wins, and subtracts settled losses. Open multi-slip stakes are included in the deposited amount; individual bets count verified outcomes only.</p>
    </section>
    <div class="betslip-filter-row" data-betslip-view-control aria-label="Filter and sort bet slips">
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
    <p class="betslip-filter-hint" data-betslip-view-control>Date range and sorting work with the selected status tab above.</p>
    <div class="betslip-search-row flex flex-wrap justify-center items-center gap-2 mb-4" data-betslip-view-control>
      <input id="betslip-search" type="search" placeholder="Find a slip or match" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
      <button id="betslip-search-button" type="button" class="px-4 py-2 rounded-lg bg-blue-600 text-white">Find</button>
    </div>
    <div id="betslip-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 min-h-[300px] transition-all duration-500"></div>
    <div class="flex justify-center items-center gap-4 mt-5" data-betslip-view-control>
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
              <div class="cap">TechNified Predictions <span id="M" title="Match — predict one fixture">M</span>.<span id="T" title="Tournament report — open the saved report">T</span>.<span id="E" title="Country search — search saved tournament matches">E</span></div>
              <label id='label33' for="input"
                >Match:
                <input
                  id="input"
                  placeholder="Liverpool vs Chealsea"
                  type="text"
                  minlength="4"
              /></label>
              <p id="predictor-input-hint" class="predictor-input-hint" hidden></p>
              <p id="predictor-mode-note" class="predictor-mode-note" hidden></p>
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
        if (!change){
        cont.classList.add('shiningBG')}
        let M = document.getElementById("M");
        let T = document.getElementById("T");
        let E = document.getElementById("E");
        applyPredictorModeUI(main_state);

        
        qry.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') { predict();}});
        qry.addEventListener('input', function () {
          qry.classList.remove('is-invalid');
          let hint = document.getElementById('predictor-input-hint');
          if (hint) { hint.hidden = true; hint.textContent = ''; }
        });
       
        M.style.cursor="pointer"
        T.style.cursor="pointer"
        E.style.cursor="pointer"
       
        M.addEventListener('click',()=>{
            predicter_innerhtml=cont.innerHTML
            state2_='individual_matches'
            main_state="individual_matches"
            applyPredictorModeUI('individual_matches')
        })
        E.addEventListener('click',()=>{
            predicter_innerhtml=cont.innerHTML
            state2_='wining_matches'
            main_state='wining_matches'
            applyPredictorModeUI('wining_matches')
        })
        T.addEventListener('click',()=>{
            predicter_innerhtml=cont.innerHTML
            state2_='premium'
            main_state="premium"
            applyPredictorModeUI('premium')
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
    
    // Delegated actions for the prediction report. Attached once to the stable
    // contentArea so its buttons keep working after HTML restoration on tab switch.
    (function initPredictorActions() {
      const contentArea = document.getElementById('contentArea');
      if (!contentArea) return;
      contentArea.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('[data-pcr-action]') : null;
        if (!target || !contentArea.contains(target)) return;
        const action = target.getAttribute('data-pcr-action');
        if (action === 'retry') {
          event.preventDefault();
          predict();
          return;
        }
        if (action === 'example') {
          event.preventDefault();
          const input = document.getElementById('input');
          if (!input) return;
          input.value = target.getAttribute('data-pcr-example') || '';
          input.classList.remove('is-invalid');
          const hint = document.getElementById('predictor-input-hint');
          if (hint) { hint.hidden = true; hint.textContent = ''; }
          input.focus();
        }
      });
    })();

    function refreshPredictorEmptyState(mode) {
      const output = document.querySelector('.output');
      if (!output) return;
      const hasResult = output.querySelector('.pcr-report') && !output.querySelector('.pcr-report--empty');
      if (hasResult) return;
      if (window.PredictorView) {
        window.PredictorView.renderEmpty(output, { mode: mode === 'premium' ? 'premium' : 'individual' });
      } else {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) contentArea.classList.add('shiningBG');
      }
    }

    // Single source of truth for the three predictor modes. The legacy code
    // inline-scaled the premium button to 2x and used negative margins; this
    // keeps the control clean, centred and responsive in every mode.
    function applyPredictorModeUI(mode) {
      const qry = document.getElementById('input');
      const btn = document.querySelector('.btn33');
      const label = document.getElementById('label33');
      const note = document.getElementById('predictor-mode-note');
      const card = document.getElementById('cencon');
      if (!qry || !btn || !label) return;

      const configs = {
        individual_matches: {
          placeholder: 'Liverpool vs Chelsea',
          button: 'Predict',
          note: '',
          hideField: false
        },
        wining_matches: {
          placeholder: 'E.g Country-China',
          button: 'Predict',
          note: 'Searches saved tournament summaries by country — try “England”.',
          hideField: false
        },
        premium: {
          placeholder: '',
          button: 'Initiate',
          note: 'Opens the prepared tournament report generated from saved tournament data.',
          hideField: true
        }
      };
      const config = configs[mode] || configs.individual_matches;

      qry.style.display = config.hideField ? 'none' : '';
      qry.classList.remove('Removebtn');
      qry.setAttribute('placeholder', config.placeholder);
      qry.style.transform = '';
      label.style.display = config.hideField ? 'none' : '';

      btn.style.transform = 'scale(1)';
      btn.style.marginTop = '';
      btn.style.marginBottom = '';
      btn.textContent = config.button;

      if (note) {
        note.textContent = config.note;
        note.hidden = !config.note;
      }
      if (card) card.classList.toggle('mode-premium', mode === 'premium');

      const chips = {
        individual_matches: document.getElementById('M'),
        wining_matches: document.getElementById('E'),
        premium: document.getElementById('T')
      };
      Object.keys(chips).forEach((key) => {
        if (chips[key]) chips[key].style.color = key === mode ? '#007BFF' : 'unset';
      });

      refreshPredictorEmptyState(mode);
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

  const hint = document.getElementById('predictor-input-hint');
  if (requestMode !== 'premium' && !query) {
    if (hint) {
      hint.textContent = 'Enter two teams, for example Liverpool vs Chelsea.';
      hint.hidden = false;
    }
    if (queryInput) {
      queryInput.classList.add('is-invalid');
      queryInput.focus();
    }
    return;
  }
  if (queryInput) queryInput.classList.remove('is-invalid');
  if (hint) { hint.hidden = true; hint.textContent = ''; }
  if (!button || !output || !progressPanel) return;

  let endpoint = '';
  if (requestMode === 'wining_matches') endpoint = line + '/receive_message';
  else if (requestMode === 'individual_matches') endpoint = line + '/individual_receive_message';
  else if (requestMode === 'premium') endpoint = line + '/premium';
  if (!endpoint) return;
  output.classList.toggle('individual-prediction-output', requestMode === 'individual_matches');

  const taskId = window.crypto && typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `predict_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const source = requestMode === 'wining_matches'
    ? 'Saved tournament and match summaries'
    : requestMode === 'premium'
      ? 'Saved tournament report'
      : 'Stored team form and match-history records';
  let progressRequestActive = false;
  let progressFinished = false;
  let progressTimer = null;
  let succeeded = false;
  const renderPredictionError = (kind) => {
    if (requestMode === 'individual_matches' && window.PredictorView) {
      window.PredictorView.renderError(output, { kind, query });
    } else {
      output.textContent = kind === 'no-results'
        ? 'No stored records were found for this fixture.'
        : 'Check the match format: Team A vs Team B, for example Liverpool vs Chelsea.';
    }
  };
  const dismissProgress = () => {
    progressFinished = true;
    if (progressTimer) clearInterval(progressTimer);
    progressPanel.hidden = true;
    progressPanel.classList.remove('is-complete', 'is-error');
  };

  const renderProgress = (data) => {
    if (data.status === 'complete' || data.status === 'error') {
      dismissProgress();
      return;
    }
    const value = Math.max(0, Math.min(99, Number(data.progress) || 0));
    const stage = document.getElementById('predictor-progress-stage');
    const detail = document.getElementById('predictor-progress-detail');
    const percent = document.getElementById('predictor-progress-percent');
    const fill = document.getElementById('predictor-progress-fill');
    const sourceText = document.getElementById('predictor-progress-source');
    const countText = document.getElementById('predictor-progress-count');
    const remainingText = document.getElementById('predictor-progress-remaining');
    const track = progressPanel.querySelector('[role="progressbar"]');

    progressPanel.hidden = false;
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
        countText.textContent = 'Checking the saved data';
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
      if (progressFinished) return;
      renderProgress(data);
      if (data.status === 'complete' || data.status === 'error') {
        dismissProgress();
      }
    } catch (error) {
      // Keep the prediction request running if an individual progress poll is missed.
    } finally {
      progressRequestActive = false;
    }
  };

  content.classList.remove('shiningBG');
  if (holder) holder.classList.add('flex');
  output.replaceChildren();
  output.setAttribute('aria-busy', 'true');
  button.disabled = true;
  button.classList.remove('is-success');
  button.classList.add('is-loading');
  button.textContent = 'Analysing…';
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
      if (requestMode === 'wining_matches' && window.PredictorView && typeof window.PredictorView.renderMatchSearch === 'function') {
        succeeded = window.PredictorView.renderMatchSearch(output, result, query);
        if (!succeeded) output.textContent = 'The saved match results could not be displayed.';
      } else if (requestMode === 'premium' && window.PredictorView && typeof window.PredictorView.renderTournament === 'function') {
        if (/no prepared tournament report|report is not available|not available right now/i.test(result)) {
          window.PredictorView.renderError(output, {
            kind: 'server',
            message: 'The saved tournament report is not available yet. Try again after the next data update.'
          });
        } else if (window.PredictorView.renderTournament(output, result)) {
          succeeded = true;
        } else {
          let responseText = '';
          try {
            responseText = new DOMParser().parseFromString(result, 'text/html').body.textContent.trim();
          } catch (parseError) {
            responseText = '';
          }
          window.PredictorView.renderError(output, {
            kind: 'server',
            message: responseText || 'The saved tournament response contained no readable fixture data.'
          });
        }
      } else if (/no results found/i.test(result)) {
        renderPredictionError('no-results');
      } else if (/format is incorrect/i.test(result)) {
        renderPredictionError('format');
      } else if (requestMode === 'individual_matches' && window.PredictorView) {
        const rendered = window.PredictorView.render(output, result, query);
        if (!rendered || !rendered.ok) {
          window.PredictorView.renderFallback(output, result, query);
        } else {
          succeeded = true;
        }
      } else {
        output.innerHTML = result;
        output.classList.remove('predictor-report-output');
      }
      output.classList.toggle('individual-prediction-output', requestMode === 'individual_matches');
      dismissProgress();
      predicter_innerhtml = content.innerHTML;
      scrollDown100px();
    })
    .catch(error => {
      const message = error && error.message === 'Failed to fetch'
        ? 'The service could not be reached. Please try again in a moment.'
        : (error && error.message ? error.message : 'The request could not be completed.');
      if (window.PredictorView && typeof window.PredictorView.renderError === 'function') {
        window.PredictorView.renderError(output, {
          kind: error && error.message === 'Failed to fetch' ? 'network' : 'server',
          query,
          message
        });
      } else {
        output.textContent = message;
      }
      dismissProgress();
    })
    .finally(() => {
      dismissProgress();
      output.setAttribute('aria-busy', 'false');
      output.classList.toggle('individual-prediction-output', requestMode === 'individual_matches');
      button.classList.remove('is-loading');
      button.disabled = false;
      if (succeeded) {
        button.classList.add('is-success');
        button.textContent = requestMode === 'premium' ? 'Opened' : requestMode === 'wining_matches' ? 'Found' : 'Predicted';
        window.setTimeout(() => {
          button.classList.remove('is-success');
          if (!button.disabled) button.textContent = requestMode === 'premium' ? 'Initiate' : 'Predict';
        }, 1200);
      } else {
        button.classList.remove('is-success');
        button.textContent = requestMode === 'premium' ? 'Initiate' : 'Predict';
      }
      predicter_innerhtml = content.innerHTML;
    });
}
