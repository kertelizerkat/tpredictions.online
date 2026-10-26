let date2 = 18
let date1 = 17
let steps_to_remove_loader = 0
let state__p = ''
let extact3_no=0
let product4_no=0
let liveMatchesFetchBusy = false
let liveMatchPollTimer = null
let liveSlipsFetchBusy = false
let liveSlipPollTimer = null
let pieChart=null;
let lineChart=null;
let lineChart2=null;
let lineChart3=null;
storeInfo('refresh','disallow')

// --- Helper function to animate numbers ---

function extract3(){

  storeInfo('refresh','disallow')
   let refreshBtn3=document.getElementById('refreshBtn')
   if (refreshBtn3){
refreshBtn3.classList.remove('refresh-active')
 refreshBtn3.style.cursor="none"
refreshBtn3.style.opacity='0.5'
   }
  




   
      try{
        const summary = JSON.parse(localStorage.getItem("matchSummary"));

      }catch{
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        localStorage.setItem('continueoff','Disallow')
        localStorage.setItem('UseLogOffline','Disallow')
        return null

      }
      const summary = JSON.parse(localStorage.getItem("matchSummary"));
      if (summary) {
     
      } else {
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        localStorage.setItem('continueoff','Disallow')
        return null

      }
      let allMatches = summary.allMatches

      try{
             let rawData=summary.histdata_
             if (rawData){
              analysis3(rawData)

             }
             
      }catch{

      }
   

      // start

      const totalMatches = Math.floor(allMatches.length);
      const correctCount = summary.correctCount;
      const avgConfidence = summary.avgConfidence;

      if (avgConfidence && correctCount && totalMatches && allMatches) {

      } else {
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        window.location.reload()

      }
      //remove the loader


      let ptagstate3 = document.getElementById('state_loader')
      ptagstate3.textContent = 'Are you TechNifyied?'
      let ldata2 = document.getElementById('ldata')
      ldata2.classList.add('checked')
      let loader = document.querySelector('.loading-container')

      loader.style.display = 'none'

      // Animate summary counters over 2000ms.
      animateNumber("total-matches", 0, totalMatches, 6000);
      animateNumber("accuracy", 0, (correctCount / totalMatches) * 100, 10000, '%');
      animateNumber("avg-confidence", 0, avgConfidence, 10000, '%');

      const finalPieData = summary.finalPieData
      if (finalPieData) {

      } else {
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        window.location.reload()

      }

      // --- Create Pie Chart with initial zero data ---
      const pieCtx = document.getElementById('pieChart').getContext('2d');
      if (pieChart){
        pieChart.destroy()
      }
       pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Draws Correct', 'Draws Lost', 'Win Correct', 'Win Lost', 'Win Lost by Draw'],
          datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: ['#60A5FA', '#FBBF24', '#10B981', '#EF4444', '#8B5CF6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      // Animate pie chart values over 40 frames (~2000ms total)
      let pieFrame = 0;
      const totalPieFrames = 40;
      const pieInterval = setInterval(() => {
        pieFrame++;
        const newData = finalPieData.map(val => Math.floor(val * (pieFrame / totalPieFrames)));
        pieChart.data.datasets[0].data = newData;
        pieChart.update();
        if (pieFrame >= totalPieFrames) clearInterval(pieInterval);
      }, 50);
      //  const summaryData = { finalPieData, allMatches, avgConfidence,correctCount, totalMatches,winMatches,lossMatches,finalWinData,finalLossData};
      // --- Line Chart Animation ---
      // Extract the win and loss datasets.
      const winMatches = summary.winMatches;
      const lossMatches = summary.lossMatches;
      const finalWinData = summary.finalWinData;
      const finalLossData = summary.finalLossData;
      if (finalWinData && finalLossData) {

      } else {
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        window.location.reload()

      }

      // Create line chart with empty datasets.
      if (lineChart){
          lineChart.destroy()
      }
       lineCtx = document.getElementById('lineChart').getContext('2d');
       lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Win',
              data: [],
              borderColor: '#10B981',
              fill: false,
              tension: 0.1,
              pointRadius: 0
            },
            {
              label: 'Loss',
              data: [],
              borderColor: '#EF4444',
              fill: false,
              tension: 0.1,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: { display: true, text: 'Match Number' },
              ticks: { stepSize: 1 }
            },
            y: {
              title: { display: true, text: 'Prediction Percentage (%)' }
            }
          }
        }
      });

      // Animate the line chart by adding data points one at a time.
      let currentIndex = 0;
      const maxPoints = Math.max(finalWinData.length, finalLossData.length);
      const lineInterval = setInterval(() => {
        if (currentIndex < finalWinData.length) {
          lineChart.data.datasets[0].data.push(finalWinData[currentIndex]);
        }
        if (currentIndex < finalLossData.length) {
          lineChart.data.datasets[1].data.push(finalLossData[currentIndex]);
        }
        lineChart.update();
        currentIndex++;
        if (currentIndex >= maxPoints) clearInterval(lineInterval);
      },10);


     let tbody = document.getElementById('match-table');
      if (!tbody){
        tbody=document.querySelector('.mainT')
      }
      if (!tbody){
        tbody=document.querySelector('tbody')
      }


      // --- Populate the Matches Table ---
    
        if (summary.tbdinner) {

      

      } else {
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        window.location.reload()

      }


      if (tbody){
        tbody.innerHTML = summary.tbdinner

      }


      if (summary.tbdinner) {

        sort_tables()

      } else {
        storeInfo('matchSummary', '')
        storeInfo('lastStoredTime', '')
        window.location.reload()

      }


      //end
      if (!(localStorage.getItem('continueoff')=='allow')){

        updatecontent()

      

      }
   setTimeout(()=>{

    let refreshBtn2=document.getElementById('refreshBtn')
          if (refreshBtn2){
            storeInfo('refresh','allow')
            refreshBtn2.style.opacity=1
             refreshBtn2.style.cursor="pointer"
            refreshBtn2.classList.add('refresh-active')

            
          }

   },20000)
      
        
      



    }




function extract4(){
  
    
       
    
      const container = document.getElementById("betslip-container");
      let sum_=JSON.parse(accessInfo('matchSummary4'))
      if (sum_){}else{
          return null
      }
      
      let stake = 20;
      if (sum_.stake){
           stake=sum_.stake
      }
      
      const slipsByCategory = sum_.slipsByCategory
      function fadeIn(el) {
        el.classList.add("animate-slip");
        setTimeout(() => el.classList.remove("animate-slip"), 800);
      }
      function renderSlips(category) {
        container.innerHTML = "";
        const slips = slipsByCategory[category];
        if (!slips || slips.length === 0) {
          const empty = document.createElement("div");
          empty.className = "w-full text-center text-slate-400 py-16 text-lg animate-slip col-span-full";
          empty.textContent = "No slips in this category.";
          container.appendChild(empty);
          return;
        }
        slips.forEach(({ slipId, slipMatches, idx, slipState }) => {
          let slipBg = "glass";
          let slipText = "text-slate-800";
          let slipRing = "";
          let slipIcon = "";
          if (slipState === "won") {
            slipBg = "glass border-green-400/60 shadow-green-200/40";
            slipText = "text-green-900";
            slipRing = "ring-2 ring-green-400/60";
            slipIcon = "<span class='inline-block text-green-500 text-xl mr-1 align-middle'>🏆</span>";
          } else if (slipState === "lost") {
            slipBg = "glass border-red-400/60 shadow-red-200/40";
            slipText = "text-red-900";
            slipRing = "ring-2 ring-red-400/60";
            slipIcon = "<span class='inline-block text-red-500 text-xl mr-1 align-middle'>❌</span>";
          } else if (slipState === "pending") {
            slipBg = "glass border-blue-400/60 shadow-blue-200/40";
            slipText = "text-blue-900";
            slipRing = "ring-2 ring-blue-400/60";
            slipIcon = "<span class='inline-block text-blue-500 text-xl mr-1 align-middle'>⏳</span>";
          } else {
            slipBg = "glass border-gray-200/30";
            slipText = "text-slate-800";
            slipRing = "";
            slipIcon = "<span class='inline-block text-gray-400 text-xl mr-1 align-middle'>📝</span>";
          }
          const slipWrapper = document.createElement("div");
          slipWrapper.className = `slip-card ${slipBg} ${slipText} ${slipRing} flex flex-col gap-1`;
          fadeIn(slipWrapper);
          // Header
          const header = document.createElement("div");
          header.className = "slip-header";
          header.innerHTML = `${slipIcon} Betslip #${parseInt(slipId)}`;
          slipWrapper.appendChild(header);
          let totalOdds = 1;
          Object.entries(slipMatches).forEach(([id, data]) => {
            const legOdds = Number(data.odds);
            if (Number.isFinite(legOdds) && legOdds > 0) totalOdds *= legOdds;
           
            let predictedOutcome = "";
            if (data.prediction_ && data.prediction_.toLowerCase().includes("win")) predictedOutcome = "win";
            else if (data.prediction_ && data.prediction_.toLowerCase().includes("draw")) predictedOutcome = "draw";
            else if (data.prediction_ && data.prediction_.toLowerCase().includes("lose")) predictedOutcome = "lose";
            else predictedOutcome = "win";
            
            const teams = data.match.split(" vs ");
            let predictedTeam = "";
            if (predictedOutcome === "win") predictedTeam = teams[0] || data.match;
            else if (predictedOutcome === "lose") predictedTeam = teams[1] || data.match;
            else if (predictedOutcome === "draw") predictedTeam = teams.join(" - ");
            // Card for each match
            let matchCardBg = "match-card";
            let matchCardText = "";
            let matchStatus = "";
            if (data.state === "Match Ended") {
              matchStatus = `<span class='match-status ${data.actual === "correct" ? "won" : "lost"}'>Match Ended</span>`;
              if (data.actual === "correct") {
                matchCardBg += " won";
                matchCardText = "text-green-900";
              } else {
                matchCardBg += " lost";
                matchCardText = "text-red-900";
              }
            } else if (data.state === "pending" && data.score != 'none') {
              matchStatus = `<span class='match-status live'>LIVE</span>`;
              matchCardBg += " live";
              matchCardText = "text-blue-900";
            }
            let scoreHtml = "";
            if ((data.state === "Match Ended" && data.score)) {
              scoreHtml = `<div class='mt-1 text-xs font-semibold'>Score: <span class='inline-block px-2 py-0.5 rounded bg-gray-200'>${data.score}</span></div>`;
            }
            let actualResultHtml = "";
            if (data.state === "Match Ended" && data.actual_result) {
              actualResultHtml = `<div class='mt-1 text-xs font-semibold'>Actual Result: <span class='inline-block px-2 py-0.5 rounded bg-blue-200'>${data.actual_result}</span></div>`;
            }
            let timeHtml = "";
            if (data.state !== "Match Ended") {
              if (data.score != 'none') {
                scoreHtml = `<div class='mt-1 text-xs font-semibold'><span class='inline-block px-2 py-0.5 rounded bg-blue-600 text-white animate-pulse'>LIVE</span>: <span class='inline-block px-2 py-0.5 rounded live-score bg-white-200'>${data.score}</span></div>`;
                timeHtml = `<span class='text-xs text-blue-500 font-bold animate-pulse'>${data.time}</span>`;
              } else {
                timeHtml = `<span class='text-xs text-gray-500'>${data.time}</span>`;
              }
            }
            // Match card
            const matchCard = document.createElement("div");
            matchCard.className = `${matchCardBg} ${matchCardText}`;
            matchCard.innerHTML = `
              <div class='flex justify-between items-center'>
                <h3 class='text-base font-semibold'>${data.match}</h3>
                ${timeHtml}
                ${matchStatus}
              </div>
              <p class='mt-1 text-xs'>Prediction: <span class='font-medium'>${data.prediction_}</span></p>
              <p class='mt-1 text-xs'>Odds: <span class='font-semibold text-blue-700'>${data.odds}</span></p>
              ${scoreHtml}
              ${actualResultHtml}
            `;
            slipWrapper.appendChild(matchCard);
          });
          // Summary section
          const summary = document.createElement("div");
          summary.className = "slip-summary";
          summary.innerHTML = `
            <div class='flex justify-between'>
              <span>Stake</span>
              <span>R${stake}</span>
            </div>
            <div class='flex justify-between'>
              <span>Total Odds</span>
              <span>${totalOdds.toFixed(2)}</span>
            </div>
            <div class='flex justify-between font-semibold text-base mt-1 ${slipState === "won" ? "text-green-700" : slipState === "lost" ? "text-red-700" : "text-slate-700"}'>
              <span>Potential Win</span>
              <span>R${(stake * totalOdds).toFixed(2)}</span>
            </div>
            ${slipState === "won" ? `<div class='slip-state won'>SLIP WON</div>` : ""}
            ${slipState === "lost" ? `<div class='slip-state lost'>SLIP LOST</div>` : ""}
            ${slipState === "pending" ? `<div class='slip-state pending'>SLIP PENDING</div>` : ""}
          `;
          slipWrapper.appendChild(summary);
          container.appendChild(slipWrapper);
        });
      }
      const tabBtns = document.querySelectorAll('.tab-btn');
      function setActiveTab(tab) {
        tabBtns.forEach(btn => {
          btn.classList.remove('active');
        });
        tab.classList.add('active');
      }
      document.getElementById('tab-pending').onclick = function() {
        storeInfo('activeSlipCategory', 'pending');
        setActiveTab(this);
        renderSlips('pending');
      };
      document.getElementById('tab-won').onclick = function() {
        storeInfo('activeSlipCategory', 'won');
        setActiveTab(this);
        renderSlips('won');
      };
      document.getElementById('tab-lost').onclick = function() {
        storeInfo('activeSlipCategory', 'lost');
        setActiveTab(this);
        renderSlips('lost');
      };
      document.getElementById('tab-completed').onclick = function() {
        storeInfo('activeSlipCategory', 'completed');
        setActiveTab(this);
        renderSlips('completed');
      };
      const activeCategory = accessInfo('activeSlipCategory') || 'pending';
      const activeButton = document.getElementById(`tab-${activeCategory}`) || document.getElementById('tab-pending');
      setActiveTab(activeButton);
      renderSlips(activeCategory);
    
}


function updatecontent4() {
  if (!document.getElementById('betslip-container')) return;
  extract4();
  product4();
  if (liveSlipPollTimer === null) {
    liveSlipPollTimer = setInterval(() => {
      if (!document.hidden && document.getElementById('betslip-container')) product4();
    }, 8000);
  }
}

function product4(){
      if (liveSlipsFetchBusy) return;
      liveSlipsFetchBusy = true;
      fetch(line+'/betslips_', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('slips'),
      cache: 'no-store'
    })
    .then(response => response.json())
    .then(data4 => {
      const requestedCategory = accessInfo('activeSlipCategory') || 'pending';
      const matches = data4.slips;

         storeInfo('late4', 'done')
      // console.log(data4)
      const container = document.getElementById("betslip-container");
      const stake = 20;
      const slipsByCategory = { pending: [], won: [], lost: [], completed: [] };
      Object.entries(matches).forEach(([slipId, slipMatches], idx) => {
        let slipState = "complete", allCorrect = true, anyIncorrect = false, anyPending = false;
        Object.values(slipMatches).forEach(data => {
          if (data.state === "pending") anyPending = true;
          if (data.state === "Match Ended") {
            if (data.actual === "incorrect") anyIncorrect = true;
            if (data.actual !== "correct") allCorrect = false;
          } else { allCorrect = false; }
        });
        if (anyPending) slipState = "pending";
        else if (anyIncorrect) slipState = "lost";
        else if (allCorrect) slipState = "won";
        else slipState = "complete";
        slipsByCategory[slipState === "pending" ? "pending" : slipState === "won" ? "won" : slipState === "lost" ? "lost" : "completed"].push({ slipId, slipMatches, idx, slipState });
        if (slipState === "won" || slipState === "lost") {
          slipsByCategory.completed.push({ slipId, slipMatches, idx, slipState });
        }
      });
      summaryData4={slipsByCategory,stake}
      localStorage.setItem("matchSummary4", JSON.stringify(summaryData4));
      
      function fadeIn(el) {
        el.classList.add("animate-slip");
        setTimeout(() => el.classList.remove("animate-slip"), 800);
      }
      function renderSlips(category) {
        container.innerHTML = "";
        const slips = slipsByCategory[category];
        if (!slips || slips.length === 0) {
          const empty = document.createElement("div");
          empty.className = "w-full text-center text-slate-400 py-16 text-lg animate-slip col-span-full";
          empty.textContent = "No slips in this category.";
          container.appendChild(empty);
          return;
        }
        slips.forEach(({ slipId, slipMatches, idx, slipState }) => {
          let slipBg = "glass";
          let slipText = "text-slate-800";
          let slipRing = "";
          let slipIcon = "";
          if (slipState === "won") {
            slipBg = "glass border-green-400/60 shadow-green-200/40";
            slipText = "text-green-900";
            slipRing = "ring-2 ring-green-400/60";
            slipIcon = "<span class='inline-block text-green-500 text-xl mr-1 align-middle'>🏆</span>";
          } else if (slipState === "lost") {
            slipBg = "glass border-red-400/60 shadow-red-200/40";
            slipText = "text-red-900";
            slipRing = "ring-2 ring-red-400/60";
            slipIcon = "<span class='inline-block text-red-500 text-xl mr-1 align-middle'>❌</span>";
          } else if (slipState === "pending") {
            slipBg = "glass border-blue-400/60 shadow-blue-200/40";
            slipText = "text-blue-900";
            slipRing = "ring-2 ring-blue-400/60";
            slipIcon = "<span class='inline-block text-blue-500 text-xl mr-1 align-middle'>⏳</span>";
          } else {
            slipBg = "glass border-gray-200/30";
            slipText = "text-slate-800";
            slipRing = "";
            slipIcon = "<span class='inline-block text-gray-400 text-xl mr-1 align-middle'>📝</span>";
          }
          const slipWrapper = document.createElement("div");
          slipWrapper.className = `slip-card ${slipBg} ${slipText} ${slipRing} flex flex-col gap-1`;
          fadeIn(slipWrapper);
          // Header
          const header = document.createElement("div");
          header.className = "slip-header";
          header.innerHTML = `${slipIcon} Betslip #${parseInt(slipId)}`;
          slipWrapper.appendChild(header);
          let totalOdds = 1;
          Object.entries(slipMatches).forEach(([id, data]) => {
            const legOdds = Number(data.odds);
            if (Number.isFinite(legOdds) && legOdds > 0) totalOdds *= legOdds;
           
            let predictedOutcome = "";
            if (data.prediction_ && data.prediction_.toLowerCase().includes("win")) predictedOutcome = "win";
            else if (data.prediction_ && data.prediction_.toLowerCase().includes("draw")) predictedOutcome = "draw";
            else if (data.prediction_ && data.prediction_.toLowerCase().includes("lose")) predictedOutcome = "lose";
            else predictedOutcome = "win";
            
            const teams = data.match.split(" vs ");
            let predictedTeam = "";
            if (predictedOutcome === "win") predictedTeam = teams[0] || data.match;
            else if (predictedOutcome === "lose") predictedTeam = teams[1] || data.match;
            else if (predictedOutcome === "draw") predictedTeam = teams.join(" - ");
            // Card for each match
            let matchCardBg = "match-card";
            let matchCardText = "";
            let matchStatus = "";
            if (data.state === "Match Ended") {
              matchStatus = `<span class='match-status ${data.actual === "correct" ? "won" : "lost"}'>Match Ended</span>`;
              if (data.actual === "correct") {
                matchCardBg += " won";
                matchCardText = "text-green-900";
              } else {
                matchCardBg += " lost";
                matchCardText = "text-red-900";
              }
            } else if (data.state === "pending" && data.score != 'none') {
              matchStatus = `<span class='match-status live'>LIVE</span>`;
              matchCardBg += " live";
              matchCardText = "text-blue-900";
            }
            let scoreHtml = "";
            if ((data.state === "Match Ended" && data.score)) {
              scoreHtml = `<div class='mt-1 text-xs font-semibold'>Score: <span class='inline-block px-2 py-0.5 rounded bg-gray-200'>${data.score}</span></div>`;
            }
            let actualResultHtml = "";
            if (data.state === "Match Ended" && data.actual_result) {
              actualResultHtml = `<div class='mt-1 text-xs font-semibold'>Actual Result: <span class='inline-block px-2 py-0.5 rounded bg-blue-200'>${data.actual_result}</span></div>`;
            }
            let timeHtml = "";
            if (data.state !== "Match Ended") {
              if (data.score != 'none') {
                scoreHtml = `<div class='mt-1 text-xs font-semibold'><span class='inline-block px-2 py-0.5 rounded bg-blue-600 text-white animate-pulse'>LIVE</span>: <span class='inline-block px-2 py-0.5 rounded live-score bg-white-200'>${data.score}</span></div>`;
                timeHtml = `<span class='text-xs text-blue-500 font-bold animate-pulse'>${data.time}</span>`;
              } else {
                timeHtml = `<span class='text-xs text-gray-500'>${data.time}</span>`;
              }
            }
            // Match card
            const matchCard = document.createElement("div");
            matchCard.className = `${matchCardBg} ${matchCardText}`;
            matchCard.innerHTML = `
              <div class='flex justify-between items-center'>
                <h3 class='text-base font-semibold'>${data.match}</h3>
                ${timeHtml}
                ${matchStatus}
              </div>
              <p class='mt-1 text-xs'>Prediction: <span class='font-medium'>${data.prediction_}</span></p>
              <p class='mt-1 text-xs'>Odds: <span class='font-semibold text-blue-700'>${data.odds}</span></p>
              ${scoreHtml}
              ${actualResultHtml}
            `;
            slipWrapper.appendChild(matchCard);
          });
          // Summary section
          const summary = document.createElement("div");
          summary.className = "slip-summary";
          summary.innerHTML = `
            <div class='flex justify-between'>
              <span>Stake</span>
              <span>R${stake}</span>
            </div>
            <div class='flex justify-between'>
              <span>Total Odds</span>
              <span>${totalOdds.toFixed(2)}</span>
            </div>
            <div class='flex justify-between font-semibold text-base mt-1 ${slipState === "won" ? "text-green-700" : slipState === "lost" ? "text-red-700" : "text-slate-700"}'>
              <span>Potential Win</span>
              <span>R${(stake * totalOdds).toFixed(2)}</span>
            </div>
            ${slipState === "won" ? `<div class='slip-state won'>SLIP WON</div>` : ""}
            ${slipState === "lost" ? `<div class='slip-state lost'>SLIP LOST</div>` : ""}
            ${slipState === "pending" ? `<div class='slip-state pending'>SLIP PENDING</div>` : ""}
          `;
          slipWrapper.appendChild(summary);
          container.appendChild(slipWrapper);
        });
      }
      const tabBtns = document.querySelectorAll('.tab-btn');
      function setActiveTab(tab) {
        tabBtns.forEach(btn => {
          btn.classList.remove('active');
        });
        tab.classList.add('active');
      }
      document.getElementById('tab-pending').onclick = function() {
        storeInfo('activeSlipCategory', 'pending');
        setActiveTab(this);
        renderSlips('pending');
      };
      document.getElementById('tab-won').onclick = function() {
        storeInfo('activeSlipCategory', 'won');
        setActiveTab(this);
        renderSlips('won');
      };
      document.getElementById('tab-lost').onclick = function() {
        storeInfo('activeSlipCategory', 'lost');
        setActiveTab(this);
        renderSlips('lost');
      };
      document.getElementById('tab-completed').onclick = function() {
        storeInfo('activeSlipCategory', 'completed');
        setActiveTab(this);
        renderSlips('completed');
      };
      const activeButton = document.getElementById(`tab-${requestedCategory}`) || document.getElementById('tab-pending');
      setActiveTab(activeButton);
      renderSlips(requestedCategory);
    })
    .catch(error => {
      storeInfo('late4', 'failed')
    })
    .finally(() => { liveSlipsFetchBusy = false; });
}


function retrieveSum2() {

  let summery = JSON.parse(accessInfo('matchSummary2'))
  if (summery) {
    let r_data;
    let r_data_ended = summery.r_data_ended;
    let r_data_live = summery.r_data_live;
    let r_data_upcoming = summery.r_data_upcoming;
    let rl = summery.rl
    let rup = summery.rup
    let ren = summery.ren

    // let liveco = summery.liveco
    // let upco = summery.upco
    // let endco = summery.endco


    if (!r_data_live) {
      r_data_live = `<style>
              :root {
                --white: #ffffff;
                --red: #e63946;
                --dark-red: #b91c1c;
                --light-red: #feca57;
              }

              

              .container9 {
                text-align: center;
              
                width:100%;
                height:100%;
                display: flex;
                justify-content: center;
                align-items:center;
                z-index: 20; /* High z-index to ensure visibility */
              }

              .message9 {
                font-size: 3rem;
                font-weight: bold;
                color: var(--red);
                opacity: 0;
                animation: fadeIn9 1.5s ease-in-out forwards;
                display: inline-block;
                white-space: nowrap;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
              }

              .typewriter9 {
                overflow: hidden;
                animation: typewriter9 3s steps(40) 0.5s 1 normal both;
              }

              @keyframes fadeIn9 {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }

              @keyframes typewriter9 {
                from { width: 0; }
                to { width: 100%; }
              }

              .pulse-circle9 {
                
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, var(--red) 10%, transparent 70%);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: pulse9 2s infinite ease-in-out;
                z-index: 10; /* Below message */
              }

              @keyframes pulse9 {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
              }

              #particle-canvas9 {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0; /* Behind everything */
                opacity: 0.2;
              }

              .fallback-message9 {
                font-size: 1.5rem;
                color: var(--dark-red);
                display: none;
              }

              @media (max-width: 768px) {
                .message9 {
                  font-size: 2rem;
                }
                .pulse-circle9 {
                  width: 80px;
                  height: 80px;
                }
              }
            </style>
                <div class="container9">
              <div class="pulse-circle9"></div>
              <div class="message9 typewriter9">No Data!</div>
              <div class="fallback-message9">No Data!</div>
            </div>
            <canvas id="particle-canvas9"></canvas>`
      rl = true

    }
    if (!r_data_upcoming) {
      r_data_upcoming = `<style>
              :root {
                --white: #ffffff;
                --blue: #0056b3;
                --dark-blue: #0056b3;
                --light-blue: #00bcd4;
              }

              

              .container92 {
                text-align: center;
              
                width:100%;
                height:100%;
                display: flex;
                justify-content: center;
                align-items:center;
                z-index: 20; /* High z-index to ensure visibility */
              }

              .message92 {
                font-size: 3rem;
                font-weight: bold;
                color: var(--blue);
                opacity: 0;
                animation: fadeIn92 1.5s ease-in-out forwards;
                display: inline-block;
                white-space: nowrap;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
              }

              .typewriter92 {
                overflow: hidden;
                animation: typewriter92 3s steps(40) 0.5s 1 normal both;
              }

              @keyframes fadeIn92 {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }

              @keyframes typewriter92 {
                from { width: 0; }
                to { width: 100%; }
              }

              .pulse-circle92 {
                
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, var(--blue) 10%, transparent 70%);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: pulse92 2s infinite ease-in-out;
                z-index: 10; /* Below message */
              }

              @keyframes pulse92 {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
              }

              #particle-canvas92 {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0; /* Behind everything */
                opacity: 0.2;
              }

              .fallback-message92 {
                font-size: 1.5rem;
                color: var(--dark-blue);
                display: none;
              }

              @media (max-width: 768px) {
                .message92 {
                  font-size: 2rem;
                }
                .pulse-circle92 {
                  width: 80px;
                  height: 80px;
                }
              }
            </style>
                <div class="container92">
              <div class="pulse-circle92"></div>
              <div class="message92 typewriter92">No Data!</div>
              <div class="fallback-message92">No Data!</div>
            </div>
            <canvas id="particle-canvas92"></canvas>`
      rup = true

    }
    if (!r_data_ended) {
      r_data_ended = `<style>
              :root {
                --white: #ffffff;
                --black: #000;
                --dark-black: #000;
                --light-black: rgba(0,0,0,0.5);
              }

              

              .container93 {
                text-align: center;
              
                width:100%;
                height:100%;
                display: flex;
                justify-content: center;
                align-items:center;
                z-index: 20; /* High z-index to ensure visibility */
              }

              .message93 {
                font-size: 3rem;
                font-weight: bold;
                color: var(--black);
                opacity: 0;
                animation: fadeIn93 1.5s ease-in-out forwards;
                display: inline-block;
                white-space: nowrap;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
              }

              .typewriter93 {
                overflow: hidden;
                animation: typewriter93 3s steps(40) 0.5s 1 normal both;
              }

              @keyframes fadeIn93 {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }

              @keyframes typewriter93 {
                from { width: 0; }
                to { width: 100%; }
              }

              .pulse-circle93 {
                
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, var(--black) 10%, transparent 70%);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: pulse93 2s infinite ease-in-out;
                z-index: 10; /* Below message */
              }

              @keyframes pulse93 {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
              }

              #particle-canvas93 {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0; /* Behind everything */
                opacity: 0.2;
              }

              .fallback-message93 {
                font-size: 1.5rem;
                color: var(--dark-black);
                display: none;
              }

              @media (max-width: 768px) {
                .message93 {
                  font-size: 2rem;
                }
                .pulse-circle93 {
                  width: 80px;
                  height: 80px;
                }
              }
            </style>
                <div class="container93">
              <div class="pulse-circle93"></div>
              <div class="message93 typewriter93">No Data!</div>
              <div class="fallback-message93">No Data!</div>
            </div>
            <canvas id="particle-canvas93"></canvas>`
      ren = true

    }


    let cards = document.querySelector(".products-grid")
    r_data = `  <div class="tab-container">
    <!-- Tab Headers -->
     <div class="tab-header">
      <div id='live-tab1' class="tab live-tab active">Live <span class='liveco' style=''></span> </div>
      <div id='upcoming-tab1' class="tab upcoming-tab">Upcoming<span class='upco' style=''></span> </div>
      <div id='ended-tab1' class="tab ended-tab">Ended<span class='endco' style=''></span> </div>
    </div>
    
    <!-- Tab Content -->
  
      <div class="tab-content">
        <div class="content live-content active">
       
          <div  class='tab_holder_1'>${r_data_live}</div>
        </div>
        <div  class="content upcoming-content">
        
          <div class='tab_holder_1'>${r_data_upcoming}</div>
        </div>
        <div  class="content ended-content">
          
          <div class='tab_holder_1'>${r_data_ended}</div>
        </div>
      </div>
  
  </div>`


    cards.innerHTML = r_data


    const tabs = document.querySelectorAll('.tab-header div');
    const contents = document.querySelectorAll('.tab-content > div');

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Remove active state from all tabs and contents
        tabs.forEach(item => item.classList.remove('active'));
        contents.forEach(item => item.classList.remove('active'));

        // Activate clicked tab and its content panel
        tab.classList.add('active');
        contents[index].classList.add('active');
      });

    });
          if (rl) {
            if (!rup) {

              let lr = document.getElementById('upcoming-tab1')
              if (lr) {
                lr.click()
              }
              if (ren) {
                message993()

              }

            } else {
              message992()
              let lr = document.getElementById('ended-tab1')
              if (lr) {
                lr.click()
              }
              if (ren) {
                message993()

              }

            }

            message99()
          }else{
            if(rup){
              message992()
            }
            if (ren){
              message993()
            }
          }


    const suggestionList = summery.suggestionList
    let suggestionObject = summery.suggestionObject
    // let seeIfClosed=document.getElementById('tday_dt')

    // Get references to the search input and suggestion container
    let inputField = document.querySelector('.search-input');
    document.getElementById('conttt').setAttribute('style', '')

    const suggestionsContainer = document.getElementById('suggestions');

    // Filter suggestions from the list based on the query (case-insensitive)
    function filterSuggestions(query) {
      query = query.toLowerCase();
      const filtered = suggestionList.filter(item => item.toLowerCase().includes(query));
      return filtered.slice(0, 3); // only return top 3 results
    }

    // Update the suggestions list in the DOM
    inputField.addEventListener('input', function (e) {
      const query = e.target.value;
      const results = filterSuggestions(query);

      // Clear any existing suggestions
      suggestionsContainer.innerHTML = '';

      // If the query isn't empty and there are suggestions, display them
      if (query.trim() !== '' && results.length > 0) {
        const ul = document.createElement('ul');
        results.forEach(suggestion => {
          const li = document.createElement('li');
          li.textContent = suggestion;
          li.addEventListener('click', function () {
            inputField.value = suggestion;
            let tge = document.getElementById(suggestionObject[suggestion.trim()])
            let livep = document.getElementById('live-tab1')
            let upp = document.getElementById('upcoming-tab1')
            let endp = document.getElementById('ended-tab1')


            if (tge) {
              if (tge.getAttribute('data') == 'upcoming') {

                if (upp) {
                  upp.click()

                }
              } else {
                if (tge.getAttribute('data') == 'live') {
                  if (livep) {
                    livep.click()

                  }
                } else {
                  if (tge.getAttribute('data') == 'ended') {
                    if (endp) {
                      endp.click()

                    }
                  }
                }
              }
            }


            scrollAndHighlight(suggestionObject[suggestion.trim()])

            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('visible');
          });
          ul.appendChild(li);
        });
        suggestionsContainer.appendChild(ul);
        suggestionsContainer.classList.add('visible');
      } else {
        suggestionsContainer.classList.remove('visible');
      }
    });

    inputField.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { // Detect Enter key press
        e.preventDefault(); // Prevent default form submission (if applicable)

        // Get the first suggestion element
        const firstSuggestion = suggestionsContainer.querySelector('ul li');

        // If a suggestion exists, scroll and highlight it
        if (firstSuggestion) {
          const selectedText = firstSuggestion.textContent.trim();
          inputField.value = selectedText; // Autofill input with first suggestion



          scrollAndHighlight(suggestionObject[selectedText]); // Scroll and highlight the element

          // Clear suggestions
          suggestionsContainer.innerHTML = '';
          suggestionsContainer.classList.remove('visible');
        }
      }
    })

      ;


    // Optional: Hide suggestions when the input loses focus
    inputField.addEventListener('blur', function () {
      // Delay hiding so that click events on suggestions can be captured
      setTimeout(() => {
        suggestionsContainer.classList.remove('visible');
      }, 150);
    });
  }
}

function animateNumber(id, start, end, duration, suffix = '') {
  const element = document.getElementById(id);
  let startTime = null;
  function updateNumber(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = progress * (end - start) + start;
    if (id == 'total-matches') {
      element.textContent = Math.floor((suffix ? Math.floor(value) : value.toFixed(2)) + suffix);
    } else {
      element.textContent = (suffix ? Math.floor(value) : value.toFixed(2)) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  requestAnimationFrame(updateNumber);
}
function storeCurrentTime() {
  const now = Date.now(); // Get the current timestamp in milliseconds
  localStorage.setItem("lastStoredTime", now);
  console.log('Current time stored')
}
function checkTimeElapsed() {
  const lastStoredTime = localStorage.getItem("lastStoredTime");

  if (lastStoredTime || localStorage.getItem('continueoff')=='allow' ) {

    let elapsedMinutes
    if(lastStoredTime){
          elapsedMinutes = (Date.now() - parseInt(lastStoredTime)) / (1000 * 60);
          if (elapsedMinutes >= 90){
        storeInfo('lastStoredTime','') }
    }else{
         elapsedMinutes=95
    }

    if (elapsedMinutes >= 90 && !localStorage.getItem('continueoff')=='allow' ) {
      // Run the specific function
      console.log('90 minutes has passed')

      updatecontent_2_3();
      // Store the new current time
    } else {
      
      // console.log('90 minutes has not passed')
      storeInfo('late2', 'done')
      if (extact3_no==0){
            extract3()
            extact3_no=1
      }


      


      
  }} else {
    console.log('Time was not stored')

    updatecontent_2_3();

  }
}

function renderMatchCard(category, key, matchData) {
  let container = document.getElementById("c_1");

  const {
    match,
    prediction,
    prediction_p,
    score_p,
    real_score,
    ["actual results"]: actualResults,
    ["correct_prediction"]: correct
  } = matchData;

  const isCorrect = !!correct;
  const borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
  const bgColor = isCorrect ? 'bg-green-50' : 'bg-red-50';
  const badgeColor = isCorrect ? 'text-green-700' : 'text-red-700';
  const badgeBg = isCorrect ? 'bg-green-100' : 'bg-red-100';

  const card = document.createElement("div");
  card.className = `c_1s fade-in transform hover:scale-[1.015] transition-all duration-300 ease-out border-l-4 ${borderColor} ${bgColor} shadow-md rounded-lg p-5`;

  card.innerHTML = `
       <div class="text-sm text-gray-500 mb-1 uppercase tracking-wide">Match</div>
      <div class="font-semibold text-lg mb-3">${match}</div>
        <div class="space-y-1">
         <p><span class="font-medium">Prediction:</span> ${prediction}</p>
        <p><span class="font-medium">Prediction %:</span> ${prediction_p}</p>
        <p><span class="font-medium">Score Match :</span> ${real_score}</p>
        <p><span class="font-medium">Actual Result:</span> ${actualResults}</p>
        </div>
       <div class="mt-4 inline-block px-3 py-1 text-sm font-semibold rounded-full ${badgeColor} ${bgColor}">
        ${isCorrect ? '✅ Correct Prediction' : '❌ Wrong Prediction'}
        </div>
      `;

  container.appendChild(card);
}



function storeInfo(key, value) {
  localStorage.setItem(key, value);
  // console.log(`Data stored: ${key} = ${value}`);
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
function en(text, key) {
  const symbols = "~!@#$%^&*()_+=-{}[]\\|'\"<>,.?/;:` \n";
  const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  const numbers = "1234567890";
  const characters = symbols + letters + numbers;

  const knowledgeBase = {};
  let x = 0;
  const allTk = [];
  let counter = 0;

  for (let c of characters) {
    x += 1;
    let y = (x ** 2) + (x * text.length) - parseFloat(key);
    y = parseInt(y)
    if (allTk.includes(y)) {
      counter += 1;

    } else {
      allTk.push(y);
    }
    try {
      knowledgeBase[c] = String(y);
    } catch (e) {
      // Handle error if needed
    }
  }


  const newText = [];

  for (let letter of text) {
    letter = knowledgeBase[letter];
    newText.push(letter);
  }

  let ntext = newText.join("..423..");
  const ftype = 'text';

  let codename;
  if (ftype === "text") {
    codename = "123456789009876543211234567890";
  } else {
    codename = "0987654321112345678900987654321";
  }

  ntext = ntext + "..423.." + codename;

  const encryptedText = ntext;
  return encryptedText;
}
function getHomePath(){
  basePath= window.location.pathname.split('/')
       let npath=''
        for ( i in basePath){
          npath=npath + '/' + basePath[i]
          // console.log(npath)
          if (basePath[i]=='WEBAPP'){
            break
          }
      }
    return npath
}

function logout() {
  storeInfo(en('state', date2), '')
  storeInfo(en('password', date1), '')
  storeInfo(en('phone', date1), '')
  storeInfo(en('username', date1), '')
  storeInfo(en('email', date1), '')
  storeInfo(en('logged', date1), '')
  // storeInfo('lastStoredTime','')
  //   storeInfo('matchSummary','')
  storeInfo('domContent2', ''),
    storeInfo('domContentdate2', ''),
    storeInfo('main_state2', ''),

    storeInfo('prev-theme',accessInfo('theme_+-----'))
    storeInfo('theme_+-----','Dark')
    
     
     window.location.assign(`${getHomePath()}/index.html`)


    
 
}


function de(encryptedText, key) {
  let dtext = encryptedText.split("..423..");
  let codename;

  if (dtext[dtext.length - 1] === "123456789009876543211234567890") {
    codename = "text";
  } else if (dtext[dtext.length - 1] === "0987654321112345678900987654321") {
    return "Cannot accept bytes";
  } else {
    return "Unable to identify Character Type--";
  }

  dtext.pop(); // Remove the last element
  const length = dtext.length;
  const symbols = "~!@#$%^&*()_+=-{}[]\\|'\"<>,.?/;:` \n";
  const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  const numbers = "1234567890";
  const characters = symbols + letters + numbers;

  const knowledgeBase = {};
  let x = 0;

  for (let c of characters) {
    x += 1;
    let y = (x ** 2) + (x * length) - parseFloat(key);
    try {
      knowledgeBase[c] = String(y);
    } catch (e) {
      // Handle error if needed
    }
  }

  const newText = [];

  for (let value of dtext) {
    for (let char in knowledgeBase) {
      if (knowledgeBase[char] === value) {
        newText.push(char);
        break;
      }
    }
  }

  const decryptedText = newText.join("");
  return decryptedText;
}

function getTextContentsByClass(className) {
  // Select all elements with the provided class name
  const elements = document.querySelectorAll(`.${className}`);

  // Map over the NodeList and extract the trimmed textContent of each element
  const textContents = Array.from(elements, element => element.textContent.trim());

  return textContents;
}

function getTextContentIdMapping(className) {
  // Get all elements with the given class name
  const elements = document.querySelectorAll(`.${className}`);

  // Create an object to store the mapping
  const mapping = {};

  // Iterate through each element
  elements.forEach(element => {
    // Use the trimmed text content as the key
    const key = element.textContent.trim();
    // Use the id attribute as the value
    mapping[key] = element.id;
  });

  return mapping;
}


function scrollAndHighlight(targetId) {
  // Get the target element
  const targetElement = document.getElementById(targetId);

  if (!targetElement) return; // Exit if element doesn't exist

  // Scroll to the target element smoothly
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  // Apply temporary highlighting effect
  targetElement.style.transition = "background-color 0.5s ease-in-out";
  targetElement.style.backgroundColor = "#ffeb3b"; // Yellow highlight

  // Remove highlight after a few seconds
  setTimeout(() => {
    targetElement.style.backgroundColor = "";
  }, 2000); // Highlight disappears after 2 seconds
}
function message99() {
  try {
    const canvas = document.getElementById('particle-canvas9');
    const message = document.querySelector('.message9');
    const fallback = document.querySelector('.fallback-message9');

    // Check if elements exist
    if (!canvas) {
      console.error('Canvas element not found');
      fallback.style.display = 'block';
      return;
    }
    if (!message) {
      console.error('Message element not found');
      fallback.style.display = 'block';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      fallback.style.display = 'block';
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Force animation restart if not visible
    setTimeout(() => {
      if (window.getComputedStyle(message).opacity === '0') {

        // message.style.animation = 'none';
        message.offsetHeight; // Trigger reflow
        message.style.animation = 'fadeIn9 1.5s ease-in-out forwards, typewriter9 3s steps(40) 0.5s 1 normal both';
      }
    }, 3000);
  } catch (error) {
    console.error('Error initializing animation:', error);
    document.querySelector('.fallback-message').style.display = 'block';
  }
};
function message992() {
  try {
    const canvas = document.getElementById('particle-canvas92');
    const message = document.querySelector('.message92');
    const fallback = document.querySelector('.fallback-message92');

    // Check if elements exist
    if (!canvas) {
      console.error('Canvas element not found');
      fallback.style.display = 'block';
      return;
    }
    if (!message) {
      console.error('Message element not found');
      fallback.style.display = 'block';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      fallback.style.display = 'block';
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = '#00d2ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Force animation restart if not visible
    setTimeout(() => {
      if (window.getComputedStyle(message).opacity === '0') {
       
        // message.style.animation = 'none';
        message.offsetHeight; // Trigger reflow
        message.style.animation = 'fadeIn92 1.5s ease-in-out forwards, typewriter92 3s steps(40) 0.5s 1 normal both';
      }
    }, 3000);
  } catch (error) {
    console.error('Error initializing animation:', error);
    document.querySelector('.fallback-message').style.display = 'block';
  }
};
function message993() {
  try {
    const canvas = document.getElementById('particle-canvas93');
    const message = document.querySelector('.message93');
    const fallback = document.querySelector('.fallback-message93');

    // Check if elements exist
    if (!canvas) {
      console.error('Canvas element not found');
      fallback.style.display = 'block';
      return;
    }
    if (!message) {
      console.error('Message element not found');
      fallback.style.display = 'block';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      fallback.style.display = 'block';
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Force animation restart if not visible
    setTimeout(() => {
      if (window.getComputedStyle(message).opacity === '0') {
     
        // message.style.animation = 'none';
        message.offsetHeight; // Trigger reflow
        message.style.animation = 'fadeIn93 1.5s ease-in-out forwards, typewriter93 3s steps(40) 0.5s 1 normal both';
      }
    }, 3000);
  } catch (error) {
    console.error('Error initializing animation:', error);
    document.querySelector('.fallback-message').style.display = 'block';
  }
};


function getproducts2(silent = false) {
  if (liveMatchesFetchBusy) return;
  liveMatchesFetchBusy = true;
  if (!silent) storeInfo('late', 'busy')
  let loader888=document.querySelector('.loader88')
  if (loader888 && !silent){
    loader888.setAttribute('style','border:3px solid #007BFF;border-top-color: transparent;')
 
  

    
  }
  // alert('fetching')
  fetch(line + '/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Logged' }),
    cache: 'no-store'
  })
    .then(response => {
      if (!response.ok) throw new Error(`Live data request failed (${response.status})`);
      return response.json();
    })
    .then(data => {
      const sourceUpdatedAt = Number(data.updated_at) || Date.now() / 1000;
      storeInfo('live_updated_at', sourceUpdatedAt);
      let liveStatus = document.getElementById('live-update-status');
      const productsGrid = document.querySelector('.products-grid');
      if (!liveStatus && productsGrid && productsGrid.parentElement) {
        liveStatus = document.createElement('div');
        liveStatus.id = 'live-update-status';
        liveStatus.className = 'mb-2 text-xs text-slate-500';
        productsGrid.parentElement.insertBefore(liveStatus, productsGrid);
      }
      if (liveStatus) {
        liveStatus.textContent = `Live data refreshed ${new Date(sourceUpdatedAt * 1000).toLocaleTimeString()}`;
      }
      if (true) {
        if (data.message) {



          let cards_data = data.message
          if (cards_data == '<span id="red">You did not login!</span>') {
            logout()

          }
          let r_data = '';
          let r_data_ended = '';
          let r_data_live = '';
          let r_data_upcoming = '';
          let rl = false
          let rup = false
          let ren = false
          for (r in cards_data) {
            if (cards_data[r].state == 'live') {
              r_data_live = r_data_live + `  <div id="${cards_data[r].id2}"  class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='live' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}" class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }
            if (cards_data[r].state == 'ended') {
              r_data_ended = r_data_ended + `  <div id="${cards_data[r].id2}" class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='ended' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}" class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }
            if (cards_data[r].state == 'upcoming') {
              r_data_upcoming = r_data_upcoming + `  <div id="${cards_data[r].id2}" class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='upcoming' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}" class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }















          }

          if (!r_data_live) {
            r_data_live = `<style>
    :root {
      --white: #ffffff;
      --red: #e63946;
      --dark-red: #b91c1c;
      --light-red: #feca57;
    }

    

    .container9 {
      text-align: center;
    
      width:100%;
      height:100%;
      display: flex;
      justify-content: center;
      align-items:center;
      z-index: 20; /* High z-index to ensure visibility */
    }

    .message9 {
      font-size: 3rem;
      font-weight: bold;
      color: var(--red);
      opacity: 0;
      animation: fadeIn9 1.5s ease-in-out forwards;
      display: inline-block;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
    }

    .typewriter9 {
      overflow: hidden;
      animation: typewriter9 3s steps(40) 0.5s 1 normal both;
    }

    @keyframes fadeIn9 {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typewriter9 {
      from { width: 0; }
      to { width: 100%; }
    }

    .pulse-circle9 {
      
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, var(--red) 10%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse9 2s infinite ease-in-out;
      z-index: 10; /* Below message */
    }

    @keyframes pulse9 {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    #particle-canvas9 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* Behind everything */
      opacity: 0.2;
    }

    .fallback-message9 {
      font-size: 1.5rem;
      color: var(--dark-red);
      display: none;
    }

    @media (max-width: 768px) {
      .message9 {
        font-size: 2rem;
      }
      .pulse-circle9 {
        width: 80px;
        height: 80px;
      }
    }
  </style>
      <div class="container9">
    <div class="pulse-circle9"></div>
    <div class="message9 typewriter9">No Data!</div>
    <div class="fallback-message9">No Data!</div>
  </div>
  <canvas id="particle-canvas9"></canvas>`
            rl = true

          }
          if (!r_data_upcoming) {
            r_data_upcoming = `<style>
    :root {
      --white: #ffffff;
      --blue: #0056b3;
      --dark-blue: #0056b3;
      --light-blue: #00bcd4;
    }

    

    .container92 {
      text-align: center;
    
      width:100%;
      height:100%;
      display: flex;
      justify-content: center;
      align-items:center;
      z-index: 20; /* High z-index to ensure visibility */
    }

    .message92 {
      font-size: 3rem;
      font-weight: bold;
      color: var(--blue);
      opacity: 0;
      animation: fadeIn92 1.5s ease-in-out forwards;
      display: inline-block;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
    }

    .typewriter92 {
      overflow: hidden;
      animation: typewriter92 3s steps(40) 0.5s 1 normal both;
    }

    @keyframes fadeIn92 {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typewriter92 {
      from { width: 0; }
      to { width: 100%; }
    }

    .pulse-circle92 {
      
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, var(--blue) 10%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse92 2s infinite ease-in-out;
      z-index: 10; /* Below message */
    }

    @keyframes pulse92 {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    #particle-canvas92 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* Behind everything */
      opacity: 0.2;
    }

    .fallback-message92 {
      font-size: 1.5rem;
      color: var(--dark-blue);
      display: none;
    }

    @media (max-width: 768px) {
      .message92 {
        font-size: 2rem;
      }
      .pulse-circle92 {
        width: 80px;
        height: 80px;
      }
    }
  </style>
      <div class="container92">
    <div class="pulse-circle92"></div>
    <div class="message92 typewriter92">No Data!</div>
    <div class="fallback-message92">No Data!</div>
  </div>
  <canvas id="particle-canvas92"></canvas>`
            rup = true

          }
          if (!r_data_ended) {
            r_data_ended = `<style>
    :root {
      --white: #ffffff;
      --black: #000;
      --dark-black: #000;
      --light-black: rgba(0,0,0,0.5);
    }

    

    .container93 {
      text-align: center;
    
      width:100%;
      height:100%;
      display: flex;
      justify-content: center;
      align-items:center;
      z-index: 20; /* High z-index to ensure visibility */
    }

    .message93 {
      font-size: 3rem;
      font-weight: bold;
      color: var(--black);
      opacity: 0;
      animation: fadeIn93 1.5s ease-in-out forwards;
      display: inline-block;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
    }

    .typewriter93 {
      overflow: hidden;
      animation: typewriter93 3s steps(40) 0.5s 1 normal both;
    }

    @keyframes fadeIn93 {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typewriter93 {
      from { width: 0; }
      to { width: 100%; }
    }

    .pulse-circle93 {
      
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, var(--black) 10%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse93 2s infinite ease-in-out;
      z-index: 10; /* Below message */
    }

    @keyframes pulse93 {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    #particle-canvas93 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* Behind everything */
      opacity: 0.2;
    }

    .fallback-message93 {
      font-size: 1.5rem;
      color: var(--dark-black);
      display: none;
    }

    @media (max-width: 768px) {
      .message93 {
        font-size: 2rem;
      }
      .pulse-circle93 {
        width: 80px;
        height: 80px;
      }
    }
  </style>
      <div class="container93">
    <div class="pulse-circle93"></div>
    <div class="message93 typewriter93">No Data!</div>
    <div class="fallback-message93">No Data!</div>
  </div>
  <canvas id="particle-canvas93"></canvas>`
            ren = true

          }


          let cards = document.querySelector(".products-grid")
          r_data = `  <div class="tab-container">
    <!-- Tab Headers -->
    <div class="tab-header">
      <div id='live-tab1' class="tab live-tab active">Live</div>
      <div id='upcoming-tab1' class="tab upcoming-tab">Upcoming</div>
      <div id='ended-tab1' class="tab ended-tab">Ended</div>
    </div>
    
    <!-- Tab Content -->
  
      <div class="tab-content">
        <div class="content live-content active">
       
          <div  class='tab_holder_1'>${r_data_live}</div>
        </div>
        <div  class="content upcoming-content">
        
          <div class='tab_holder_1'>${r_data_upcoming}</div>
        </div>
        <div  class="content ended-content">
          
          <div class='tab_holder_1'>${r_data_ended}</div>
        </div>
      </div>
  
  </div>`


          cards.innerHTML = r_data



          storeInfo('late', 'done')
          const tabs = document.querySelectorAll('.tab-header div');
          const contents = document.querySelectorAll('.tab-content > div');

          tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
              // Remove active state from all tabs and contents
              tabs.forEach(item => item.classList.remove('active'));
              contents.forEach(item => item.classList.remove('active'));

              // Activate clicked tab and its content panel
              tab.classList.add('active');
              contents[index].classList.add('active');
            });

          });
          if (rl) {
            if (!rup) {

              let lr = document.getElementById('upcoming-tab1')
              if (lr) {
                lr.click()
              }
              if (ren) {
                message993()

              }

            } else {
              message992()
              let lr = document.getElementById('ended-tab1')
              if (lr) {
                lr.click()
              }
              if (ren) {
                message993()

              }

            }

            message99()
          }else{
            if(rup){
              message992()
            }
            if (ren){
              message993()
            }
          }
          


          const suggestionList = getTextContentsByClass('matchids')
          let suggestionObject = getTextContentIdMapping('matchids')
          // let seeIfClosed=document.getElementById('tday_dt')

          // Get references to the search input and suggestion container
          let inputField = document.querySelector('.search-input');
          document.getElementById('conttt').setAttribute('style', '')

          const suggestionsContainer = document.getElementById('suggestions');

          // Filter suggestions from the list based on the query (case-insensitive)
          function filterSuggestions(query) {
            query = query.toLowerCase();
            const filtered = suggestionList.filter(item => item.toLowerCase().includes(query));
            return filtered.slice(0, 3); // only return top 3 results
          }

          // Update the suggestions list in the DOM
          inputField.addEventListener('input', function (e) {
            const query = e.target.value;
            const results = filterSuggestions(query);

            // Clear any existing suggestions
            suggestionsContainer.innerHTML = '';

            // If the query isn't empty and there are suggestions, display them
            if (query.trim() !== '' && results.length > 0) {
              const ul = document.createElement('ul');
              results.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.addEventListener('click', function () {
                  inputField.value = suggestion;
                  let tge = document.getElementById(suggestionObject[suggestion.trim()])
                  let livep = document.getElementById('live-tab1')
                  let upp = document.getElementById('upcoming-tab1')
                  let endp = document.getElementById('ended-tab1')


                  if (tge) {
                    if (tge.getAttribute('data') == 'upcoming') {

                      if (upp) {
                        upp.click()

                      }
                    } else {
                      if (tge.getAttribute('data') == 'live') {
                        if (livep) {
                          livep.click()

                        }
                      } else {
                        if (tge.getAttribute('data') == 'ended') {
                          if (endp) {
                            endp.click()

                          }
                        }
                      }
                    }
                  }


                  scrollAndHighlight(suggestionObject[suggestion.trim()])

                  suggestionsContainer.innerHTML = '';
                  suggestionsContainer.classList.remove('visible');
                });
                ul.appendChild(li);
              });
              suggestionsContainer.appendChild(ul);
              suggestionsContainer.classList.add('visible');
            } else {
              suggestionsContainer.classList.remove('visible');
            }
          });

          inputField.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { // Detect Enter key press
              e.preventDefault(); // Prevent default form submission (if applicable)

              // Get the first suggestion element
              const firstSuggestion = suggestionsContainer.querySelector('ul li');

              // If a suggestion exists, scroll and highlight it
              if (firstSuggestion) {
                const selectedText = firstSuggestion.textContent.trim();
                inputField.value = selectedText; // Autofill input with first suggestion



                scrollAndHighlight(suggestionObject[selectedText]); // Scroll and highlight the element

                // Clear suggestions
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.remove('visible');
              }
            }
          });


          // Optional: Hide suggestions when the input loses focus
          inputField.addEventListener('blur', function () {
            // Delay hiding so that click events on suggestions can be captured
            setTimeout(() => {
              suggestionsContainer.classList.remove('visible');
            }, 150);
          });

          let matchSummary2 = { suggestionList, suggestionObject, r_data_ended, r_data_live, r_data_upcoming, rl, rup, ren }
          localStorage.setItem("matchSummary2", JSON.stringify(matchSummary2));
          let loader88=document.querySelector('.loader88')
          if (loader88){
            loader88.style.display= 'none'
          }













        }

      } else {


      }


    })
    .catch(error => {
      let loader88=document.querySelector('.loader88')
          if (loader88){
            loader88.style.display= 'none'
          }
      storeInfo('late', 'failed')



    })
    .finally(() => { liveMatchesFetchBusy = false; });
}
function getproducts2_() {
  storeInfo('late7', 'busy')
 
  let loader888=document.querySelector('.loader88')
  if (loader888){
    loader888.setAttribute('style','border:3px solid #007BFF;border-top-color: transparent;')
 
  

    
  }
  // alert('fetching')
  fetch(line + '/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Logged' })
  })
    .then(response => response.json())
    .then(data => {
      if (true) {
        if (data.message) {



          console.log(data.message)
          //    alert('data recieved')
          let cards_data = data.message
          if (cards_data == '<span id="red">You did not login!</span>') {
            logout()

          }
          let liveco=0
          let upco=0
          let endco=0
          let r_data = '';
          let r_data_ended = '';
          let r_data_live = '';
          let r_data_upcoming = '';
          let rl = false
          let rup = false
          let ren = false
          let all=0
          let ujp=true
         
          for (r in cards_data) {

            if(document.getElementById(cards_data[r].id2)){

              let b= document.getElementById(cards_data[r].id1)
              if (b){
                b.innerHTML=cards_data[r].time 


              }else{

              }


                if (cards_data[r].state == 'live') {
              liveco++
             
              r_data_live = r_data_live + `  <div id="${cards_data[r].id2}"    class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='live' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}"  class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }
            if (cards_data[r].state == 'ended') {
              endco++
              r_data_ended = r_data_ended + `  <div id="${cards_data[r].id2}"  class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='ended' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}" class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }
            if (cards_data[r].state == 'upcoming') {
              upco++
              r_data_upcoming = r_data_upcoming + `  <div id="${cards_data[r].id2}"  class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='upcoming' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}"  class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }


              r_data_live=true
              r_data_upcoming=true
              r_data_ended=true
              continue
            
            }
            if(true){
              ujp=false

        

           
            if (cards_data[r].state == 'live') {
              liveco++
             
              r_data_live = r_data_live + `  <div id="${cards_data[r].id2}"    class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='live' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}"  class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }
            if (cards_data[r].state == 'ended') {
              endco++
              r_data_ended = r_data_ended + `  <div id="${cards_data[r].id2}"  class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='ended' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}" class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }
            if (cards_data[r].state == 'upcoming') {
              upco++
              r_data_upcoming = r_data_upcoming + `  <div id="${cards_data[r].id2}"  class="relative _move_2 rounded-2xl shadow-xl bg-cover bg-center min-h-[320px] flex flex-col justify-between p-4 text-gray-900 animate-fade-in" >
        <div class="bg-white/80 w-full h-full p-4 flex flex-col justify-between backdrop-blur-sm rounded-2xl">
          <div class="mb-3">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${cards_data[r].type_}</h2>
            <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap mb-2">
              <!-- Match Status Component Placeholder -->
              <div class="text-sm font-semibold">
                <div style='gap:10px; ' class="flex   text-right">
                  ${cards_data[r].where}
                </div>
              </div>
            </div>
            <div id='match_${r}' data='upcoming' class="text-center matchids text-lg font-extrabold text-gray-800 animate-zoom-in mb-2">
              ${cards_data[r].match}
            </div>
            <div class="text-center text-sm font-medium text-gray-700 bg-lime-100 px-3 py-1 rounded-full w-fit mx-auto max-w-full truncate">
              Prediction: ${cards_data[r].prediction_}
            </div>
            <div class="text-sm font-semibold">
                <div id="${cards_data[r].id1}"  class="flex flex-col items-center text-center">
                ${cards_data[r].time}
                </div>
              </div>
          </div>


          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${cards_data[r].win}%</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${cards_data[r].win}%</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].win}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${cards_data[r].draw}%</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${cards_data[r].draw}%</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${cards_data[r].draw}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${cards_data[r].lose}%</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${cards_data[r].lose}%</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${cards_data[r].lose}%;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
                  `
            }


    }












          }

          if (!r_data_live) {
            r_data_live = `<style>
    :root {
      --white: #ffffff;
      --red: #e63946;
      --dark-red: #b91c1c;
      --light-red: #feca57;
    }

    

    .container9 {
      text-align: center;
    
      width:100%;
      height:100%;
      display: flex;
      justify-content: center;
      align-items:center;
      z-index: 20; /* High z-index to ensure visibility */
    }

    .message9 {
      font-size: 3rem;
      font-weight: bold;
      color: var(--red);
      opacity: 0;
      animation: fadeIn9 1.5s ease-in-out forwards;
      display: inline-block;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
    }

    .typewriter9 {
      overflow: hidden;
      animation: typewriter9 3s steps(40) 0.5s 1 normal both;
    }

    @keyframes fadeIn9 {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typewriter9 {
      from { width: 0; }
      to { width: 100%; }
    }

    .pulse-circle9 {
      
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, var(--red) 10%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse9 2s infinite ease-in-out;
      z-index: 10; /* Below message */
    }

    @keyframes pulse9 {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    #particle-canvas9 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* Behind everything */
      opacity: 0.2;
    }

    .fallback-message9 {
      font-size: 1.5rem;
      color: var(--dark-red);
      display: none;
    }

    @media (max-width: 768px) {
      .message9 {
        font-size: 2rem;
      }
      .pulse-circle9 {
        width: 80px;
        height: 80px;
      }
    }
  </style>
      <div class="container9">
    <div class="pulse-circle9"></div>
    <div class="message9 typewriter9">No Data!</div>
    <div class="fallback-message9">No Data!</div>
  </div>
  <canvas id="particle-canvas9"></canvas>`
            rl = true

          }
          if (!r_data_upcoming) {
            r_data_upcoming = `<style>
    :root {
      --white: #ffffff;
      --blue: #0056b3;
      --dark-blue: #0056b3;
      --light-blue: #00bcd4;
    }

    

    .container92 {
      text-align: center;
    
      width:100%;
      height:100%;
      display: flex;
      justify-content: center;
      align-items:center;
      z-index: 20; /* High z-index to ensure visibility */
    }

    .message92 {
      font-size: 3rem;
      font-weight: bold;
      color: var(--blue);
      opacity: 0;
      animation: fadeIn92 1.5s ease-in-out forwards;
      display: inline-block;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
    }

    .typewriter92 {
      overflow: hidden;
      animation: typewriter92 3s steps(40) 0.5s 1 normal both;
    }

    @keyframes fadeIn92 {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typewriter92 {
      from { width: 0; }
      to { width: 100%; }
    }

    .pulse-circle92 {
      
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, var(--blue) 10%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse92 2s infinite ease-in-out;
      z-index: 10; /* Below message */
    }

    @keyframes pulse92 {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    #particle-canvas92 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* Behind everything */
      opacity: 0.2;
    }

    .fallback-message92 {
      font-size: 1.5rem;
      color: var(--dark-blue);
      display: none;
    }

    @media (max-width: 768px) {
      .message92 {
        font-size: 2rem;
      }
      .pulse-circle92 {
        width: 80px;
        height: 80px;
      }
    }
  </style>
      <div class="container92">
    <div class="pulse-circle92"></div>
    <div class="message92 typewriter92">No Data!</div>
    <div class="fallback-message92">No Data!</div>
  </div>
  <canvas id="particle-canvas92"></canvas>`
            rup = true

          }
          if (!r_data_ended) {
            r_data_ended = `<style>
    :root {
      --white: #ffffff;
      --black: #000;
      --dark-black: #000;
      --light-black: rgba(0,0,0,0.5);
    }

    

    .container93 {
      text-align: center;
    
      width:100%;
      height:100%;
      display: flex;
      justify-content: center;
      align-items:center;
      z-index: 20; /* High z-index to ensure visibility */
    }

    .message93 {
      font-size: 3rem;
      font-weight: bold;
      color: var(--black);
      opacity: 0;
      animation: fadeIn93 1.5s ease-in-out forwards;
      display: inline-block;
      white-space: nowrap;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhance readability */
    }

    .typewriter93 {
      overflow: hidden;
      animation: typewriter93 3s steps(40) 0.5s 1 normal both;
    }

    @keyframes fadeIn93 {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typewriter93 {
      from { width: 0; }
      to { width: 100%; }
    }

    .pulse-circle93 {
      
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, var(--black) 10%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse93 2s infinite ease-in-out;
      z-index: 10; /* Below message */
    }

    @keyframes pulse93 {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    #particle-canvas93 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* Behind everything */
      opacity: 0.2;
    }

    .fallback-message93 {
      font-size: 1.5rem;
      color: var(--dark-black);
      display: none;
    }

    @media (max-width: 768px) {
      .message93 {
        font-size: 2rem;
      }
      .pulse-circle93 {
        width: 80px;
        height: 80px;
      }
    }
  </style>
      <div class="container93">
    <div class="pulse-circle93"></div>
    <div class="message93 typewriter93">No Data!</div>
    <div class="fallback-message93">No Data!</div>
  </div>
  <canvas id="particle-canvas93"></canvas>`
            ren = true

          }


          let cards = document.querySelector(".products-grid")
          r_data = `  <div class="tab-container">
    <!-- Tab Headers -->
    <div class="tab-header">
      <div id='live-tab1' class="tab live-tab active">Live : <span class='liveco' style=''>${liveco}</span> </div>
      <div id='upcoming-tab1' class="tab upcoming-tab">Upcoming : <span class='upco' style=''>${upco}</span> </div>
      <div id='ended-tab1' class="tab ended-tab">Ended : <span class='endco' style=''>${endco}</span> </div>
    </div>
    
    <!-- Tab Content -->
  
      <div class="tab-content">
        <div class="content live-content active">
       
          <div  class='tab_holder_1'>${r_data_live}</div>
        </div>
        <div  class="content upcoming-content">
        
          <div class='tab_holder_1'>${r_data_upcoming}</div>
        </div>
        <div  class="content ended-content">
          
          <div class='tab_holder_1'>${r_data_ended}</div>
        </div>
      </div>
  
  </div>`

          storeInfo('late7', 'done')


          if (!ujp){
            cards.innerHTML = r_data
          const tabs = document.querySelectorAll('.tab-header div');
          const contents = document.querySelectorAll('.tab-content > div');
            
          tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
              // Remove active state from all tabs and contents
              tabs.forEach(item => item.classList.remove('active'));
              contents.forEach(item => item.classList.remove('active'));

              // Activate clicked tab and its content panel
              tab.classList.add('active');
              contents[index].classList.add('active');
            });

          });
          if (rl) {
            if (!rup) {

              let lr = document.getElementById('upcoming-tab1')
              if (lr) {
                lr.click()
              }
              if (ren) {
                message993()

              }

            } else {
              message992()
              let lr = document.getElementById('ended-tab1')
              if (lr) {
                lr.click()
              }
              if (ren) {
                message993()

              }

            }

            message99()
          }else{
            if(rup){
              message992()
            }
            if (ren){
              message993()
            }
          }


            
          const suggestionList = getTextContentsByClass('matchids')
          let suggestionObject = getTextContentIdMapping('matchids')
          // let seeIfClosed=document.getElementById('tday_dt')

          // Get references to the search input and suggestion container
          let inputField = document.querySelector('.search-input');
          document.getElementById('conttt').setAttribute('style', '')

          const suggestionsContainer = document.getElementById('suggestions');

          // Filter suggestions from the list based on the query (case-insensitive)
          function filterSuggestions(query) {
            query = query.toLowerCase();
            const filtered = suggestionList.filter(item => item.toLowerCase().includes(query));
            return filtered.slice(0, 3); // only return top 3 results
          }

          // Update the suggestions list in the DOM
          inputField.addEventListener('input', function (e) {
            const query = e.target.value;
            const results = filterSuggestions(query);

            // Clear any existing suggestions
            suggestionsContainer.innerHTML = '';

            // If the query isn't empty and there are suggestions, display them
            if (query.trim() !== '' && results.length > 0) {
              const ul = document.createElement('ul');
              results.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.addEventListener('click', function () {
                  inputField.value = suggestion;
                  let tge = document.getElementById(suggestionObject[suggestion.trim()])
                  let livep = document.getElementById('live-tab1')
                  let upp = document.getElementById('upcoming-tab1')
                  let endp = document.getElementById('ended-tab1')


                  if (tge) {
                    if (tge.getAttribute('data') == 'upcoming') {

                      if (upp) {
                        upp.click()

                      }
                    } else {
                      if (tge.getAttribute('data') == 'live') {
                        if (livep) {
                          livep.click()

                        }
                      } else {
                        if (tge.getAttribute('data') == 'ended') {
                          if (endp) {
                            endp.click()

                          }
                        }
                      }
                    }
                  }


                  scrollAndHighlight(suggestionObject[suggestion.trim()])

                  suggestionsContainer.innerHTML = '';
                  suggestionsContainer.classList.remove('visible');
                });
                ul.appendChild(li);
              });
              suggestionsContainer.appendChild(ul);
              suggestionsContainer.classList.add('visible');
            } else {
              suggestionsContainer.classList.remove('visible');
            }
          });

          inputField.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { // Detect Enter key press
              e.preventDefault(); // Prevent default form submission (if applicable)

              // Get the first suggestion element
              const firstSuggestion = suggestionsContainer.querySelector('ul li');

              // If a suggestion exists, scroll and highlight it
              if (firstSuggestion) {
                const selectedText = firstSuggestion.textContent.trim();
                inputField.value = selectedText; // Autofill input with first suggestion



                scrollAndHighlight(suggestionObject[selectedText]); // Scroll and highlight the element

                // Clear suggestions
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.remove('visible');
              }
            }
          });


          // Optional: Hide suggestions when the input loses focus
          inputField.addEventListener('blur', function () {
            // Delay hiding so that click events on suggestions can be captured
            setTimeout(() => {
              suggestionsContainer.classList.remove('visible');
            }, 150);
          });

          // let matchSummary2 = { suggestionList, suggestionObject, r_data_ended, r_data_live, r_data_upcoming, rl, rup, ren ,endco,upco,liveco}
          // localStorage.setItem("matchSummary2", JSON.stringify(matchSummary2));



          }
          

          


          let loader88=document.querySelector('.loader88')
          if (loader88){
            loader88.style.display= 'none'
          }













        }

      } else {


      }


    })
    .catch(error => {
      let loader88=document.querySelector('.loader88')
          if (loader88){
            loader88.style.display= 'none'
          }
      storeInfo('late7', 'failed')



    });
}


function getPredictionAccuracyChartConfig(color1, darkBod, darkBod2, darkBack, darkBack2, accurateData, inaccurateData, labels) {
  return {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Accurate Predictions',
          data: accurateData,
          borderColor: darkBod,
          backgroundColor: darkBack,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'transparent',//darkbod
          pointBorderColor: 'transparent',// fff
          pointHoverBackgroundColor: 'transparent',//  ff
          pointHoverBorderColor: 'transparent' //darkbod
        },
        {
          label: 'Inaccurate Predictions',
          data: inaccurateData,
          borderColor: darkBod2,
          backgroundColor: darkBack2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'transparent',//darkbod2
          pointBorderColor: 'transparent',// #fff
          pointHoverBackgroundColor: 'rgba(255,0,0,0.1)',//  #ff2
          pointHoverBorderColor: 'rgba(255,0,0,0.1)' //darkbod2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: color1,
            callback: value => value + '%'
          },
          title: {
            display: true,
            text: 'Prediction Accuracy (%)',
            color: color1
          }
        },
        x: {
          ticks: {
            color: color1,
          },
          title: {
            display: true,
            text: 'Match Number',
            color: color1
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: color1
          }
        },
        tooltip: {
          callbacks: {
            label: context => context.parsed.y + '%'
          }
        }
      }
    }
  };
}




function generateStringNumbers(n) {
  return Array.from({ length: n }, (_, i) => (i + 1).toString());
}


function getChartConfig(dark) {

  return {
    type: 'line',
    data: {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      datasets: [{
        label: 'Prediction Accuracy',
        data: [34, 59, 43, 34, 62, 33, 54, 83, 33],
        borderColor: dark ? '#90CAF9' : '#4A90E2',
        backgroundColor: dark ? 'rgba(144, 202, 249, 0.2)' : 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: dark ? '#90CAF9' : '#4A90E2',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: dark ? '#90CAF9' : '#4A90E2'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: dark ? '#eee' : '#333',
            callback: value => value + '%'
          },
          title: {
            display: true,
            text: 'Prediction(%)',
            color: dark ? '#eee' : '#333'
          }
        },
        x: {
          ticks: {
            color: dark ? '#eee' : '#333',
          },
          title: {
            display: true,
            text: 'Matches(Win)',
            color: dark ? '#eee' : '#333'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: dark ? '#eee' : '#333'
          }
        },
        tooltip: {
          callbacks: {
            label: context => context.parsed.y + '%'
          }
        }
      }
    }
  };
}
function getChartConfig2(dark, dtas, c) {

  return {
    type: 'line',
    data: {
      labels: c,
      datasets: [{
        label: 'Match Predicted Accurately',
        data: dtas,
        borderColor: dark ? '#90CAF9' : '#4A90E2',
        backgroundColor: dark ? 'rgba(144, 202, 249, 0.2)' : 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: dark ? '#90CAF9' : '#4A90E2',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: dark ? '#90CAF9' : '#4A90E2'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: dark ? '#eee' : '#333',
            callback: value => value + '%'
          },
          title: {
            display: true,
            text: 'Prediction(%)',
            color: dark ? '#eee' : '#333'
          }
        },
        x: {
          ticks: {
            color: dark ? '#eee' : '#333',
          },
          title: {
            display: true,
            text: 'Number Of Matches',
            color: dark ? '#eee' : '#333'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: dark ? '#eee' : '#333'
          }
        },
        tooltip: {
          callbacks: {
            label: context => context.parsed.y + '%'
          }
        }
      }
    }
  };
}


function updatecontent() {
  const activeTab = accessInfo('statec') || 'today';
  if (activeTab !== 'today') return false;

  if (document.querySelector('.products-grid')) getproducts2(false);
  if (liveMatchPollTimer === null) {
    liveMatchPollTimer = setInterval(() => {
      const currentTab = accessInfo('statec') || 'today';
      if (!document.hidden && currentTab === 'today' && document.querySelector('.products-grid')) {
        getproducts2(true);
      }
    }, 8000);
  }
  return true;
}


function getproducts_2_3(update_=true) {


  // alert('fetching')
  storeInfo('late2', 'busy')
  let ptagstate = document.getElementById('state_loader')
  ptagstate.textContent = 'Fetching TechNify Data...'
  let fdata__ = document.getElementById('fdata__')
  fdata__.classList.remove('hide_bx')
  fetch(line + '/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'analysis' })
  })
    .then(response => {
      let ldata = document.getElementById('ldata')
      ldata.classList.remove('hide_bx')
      let ptagstate2 = document.getElementById('state_loader')
      ptagstate2.textContent = 'Loading Data...'
      let fdata__2 = document.getElementById('fdata__')
      fdata__2.classList.add('checked')


      return response.json()
    })
    .then(data3 => {
      let data = data3.message;
      analysis3(data)
      console.log(data)
      let histdata_=data
 


      storeInfo('late2', 'done')



      // --- Aggregating Data for Summary and Table ---

      const allMatches = [];
      for (const category in data) {
        if (data.hasOwnProperty(category)) {
          const catData = data[category];
          for (const key in catData) {
            if (catData.hasOwnProperty(key)) {
              allMatches.push(catData[key]);
            }
          }
        }
      }


      // --- Summary Calculations ---
      const totalMatches = Math.floor(allMatches.length);
      const correctCount = allMatches.filter(match => match["correct_prediction"]).length;
      const avgConfidence = allMatches.reduce((sum, match) => sum + match.prediction_p, 0) / totalMatches;


      //remove the loader

      try{let ptagstate3 = document.getElementById('state_loader')
      ptagstate3.textContent = 'Are you TechNifyied?'
      let ldata2 = document.getElementById('ldata')
      ldata2.classList.add('checked')}catch{}
      try{
        let loader = document.querySelector('.loading-container')

      loader.style.display = 'none'
      }catch{}
      

      // Animate summary counters over 2000ms.
      animateNumber("total-matches", 0, totalMatches, 6000);
      animateNumber("accuracy", 0, (correctCount / totalMatches) * 100, 10000, '%');
      animateNumber("avg-confidence", 0, avgConfidence, 10000, '%');

      // --- Pie Chart Data Calculations ---
      // Draws:
      //   - "drawW" holds draws predicted correctly.
      //   - "drawL" holds draws lost.
      const drawsCorrect = data.drawW ? Object.values(data.drawW).filter(match => match["correct_prediction"]).length : 0;
      const drawsLost = data.drawL ? Object.values(data.drawL).length : 0;

      const winCorrect = data.win ? Object.values(data.win).filter(match => match["correct_prediction"]).length : 0;
      const losses = data.loss ? Object.values(data.loss) : [];
      const winLostByDraw = losses.filter(match => match["actual results"].toLowerCase() === "draw").length;
      const winLost = losses.length - winLostByDraw;

      const finalPieData = [drawsCorrect, drawsLost, winCorrect, winLost, winLostByDraw];




      // --- Create Pie Chart with initial zero data ---
       let pieCtx = document.getElementById('pieChart').getContext('2d');
      
       if (pieChart){
        pieChart.destroy()
      }

       pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Draws Correct', 'Draws Lost', 'Win Correct', 'Win Lost', 'Win Lost by Draw'],
          datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: ['#60A5FA', '#FBBF24', '#10B981', '#EF4444', '#8B5CF6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      // Animate pie chart values over 40 frames (~2000ms total)
      let pieFrame = 0;
      const totalPieFrames = 40;
      const pieInterval = setInterval(() => {
        pieFrame++;
        const newData = finalPieData.map(val => Math.floor(val * (pieFrame / totalPieFrames)));
        pieChart.data.datasets[0].data = newData;
        pieChart.update();
        if (pieFrame >= totalPieFrames) clearInterval(pieInterval);
      }, 50);

      // --- Line Chart Animation ---
      // Extract the win and loss datasets.
      const winMatches = data.win ? Object.values(data.win) : [];
      const lossMatches = data.loss ? Object.values(data.loss) : [];
      const finalWinData = winMatches.map((match, i) => ({ x: i + 1, y: match.prediction_p }));
      const finalLossData = lossMatches.map((match, i) => ({ x: i + 1, y: match.prediction_p }));

      // Create line chart with empty datasets.
      const lineCtx = document.getElementById('lineChart').getContext('2d');
       if (lineChart){
          lineChart.destroy()
      }
       lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Win',
              data: [],
              borderColor: '#10B981',
              fill: false,
              tension: 0.1,
              pointRadius: 0
            },
            {
              label: 'Loss',
              data: [],
              borderColor: '#EF4444',
              fill: false,
              tension: 0.1,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: { display: true, text: 'Match Number' },
              ticks: { stepSize: 1 }
            },
            y: {
              title: { display: true, text: 'Prediction Percentage (%)' }
            }
          }
        }
      });

      // Animate the line chart by adding data points one at a time.
      let currentIndex = 0;
      const maxPoints = Math.max(finalWinData.length, finalLossData.length);
      const lineInterval = setInterval(() => {
        if (currentIndex < finalWinData.length) {
          lineChart.data.datasets[0].data.push(finalWinData[currentIndex]);
        }
        if (currentIndex < finalLossData.length) {
          lineChart.data.datasets[1].data.push(finalLossData[currentIndex]);
        }
        lineChart.update();
        currentIndex++;
        if (currentIndex >= maxPoints) clearInterval(lineInterval);
      }, 10); // Adjust delay (in ms) per data point as needed.

      // --- Populate the Matches Table ---
      let tbody = document.getElementById('match-table');
      if (!tbody){
        tbody=document.querySelector('.mainT')
      }
      if (!tbody){
        tbody=document.querySelector('tbody')
      }
      tbody.innerHTML=''
      allMatches.reverse().forEach(match => {
        tbody.innerHTML += `
        <tr class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
          <td class="px-4 py-2 border">${match.match}</td>
          <td class="px-4 py-2 border">${match.prediction}</td>
          <td class="px-4 py-2 border">${match["actual results"]}</td>
          <td class="px-4 py-2 border">${match["correct_prediction"] ? '✅' : '❌'}</td>
          <td class="px-4 py-2 border dttt">${match.date}</td>
          <td class="px-4 py-2 border">${match.real_score}</td>
        </tr>
      `;
      });
      let tbdinner = tbody.innerHTML
      

      const summaryData = { finalPieData, allMatches, avgConfidence, correctCount, totalMatches, winMatches, lossMatches, finalWinData, finalLossData, tbdinner, histdata_ };
      localStorage.setItem("matchSummary", JSON.stringify(summaryData));
      storeCurrentTime()
      steps_to_remove_loader = 2
      
      updatecontent()
      if (update_){
        try{sort_tables()}catch{
        
      }

      }
      
      

      let dtt= document.getElementById('histecc')
        let lod2= document.getElementById('mainloader2')
        if (lod2 && dtt){
           lod2.classList.add('hide')
           dtt.setAttribute('style','position:relative')

        }
         setTimeout(()=>{

    let refreshBtn2=document.getElementById('refreshBtn')
          if (refreshBtn2){
            storeInfo('refresh','allow')
            refreshBtn2.style.opacity=1
             refreshBtn2.style.cursor="pointer"
            refreshBtn2.classList.add('refresh-active')

            
          }

   },20000)






    }).catch(error => {
      steps_to_remove_loader = 1
      if (localStorage.getItem('continueoff')){
       if (extact3_no==0){
            extract3()
            extact3_no=1
      }
        let loader = document.querySelector('.loading-container')

        loader.style.display = 'none'
      }
   console.log(`something went wrong :${error}`)

       
      
      storeInfo('late2', 'failed')
 let dtt= document.getElementById('histecc')
        let lod2= document.getElementById('mainloader2')
        if (lod2 && dtt){
           lod2.classList.add('hide')
           dtt.setAttribute('style','position:relative')

        }
         setTimeout(()=>{

    let refreshBtn2=document.getElementById('refreshBtn')
          if (refreshBtn2){
            storeInfo('refresh','allow')
            refreshBtn2.style.opacity=1
             refreshBtn2.style.cursor="pointer"
            refreshBtn2.classList.add('refresh-active')

            
          }

   },20000)



      // console.log('failed to recieve data:' + error)

    });
}

function updatecontent_2_3() {


  if (!(localStorage.getItem('continueoff')=='allow') ) {
    if (!(localStorage.getItem('continueoff')=='allow') ) {


      // location.reload(false)
      let count_ = 0
      let state__int2 = setInterval(() => {

        count_ = count_ + 1
        let do_;
        let st = accessInfo('late2')
        if (count_ == 1) {
          do_ = true
          storeInfo('late2', null)
          // console.log('Requesting')

        }

        if (st == 'done') {
          if (count_ == 1) {
            do_ = true
            storeInfo('late2', null)


          } else {
            do_ = false


            clearInterval(state__int2)
          }

        } else {
          if (st == 'failed') {
            do_ = true
            storeInfo('late2', null)
            count_ = 0
            // console.log('Retrying..')


          } else {
            if (st == 'busy') {
              // console.log('Busy..')
              do_ = false
            } else {
              do_ = true
            }
          }
        }
        if (!(localStorage.getItem('continueoff')=='allow')) {

          if (do_) {
            if (steps_to_remove_loader == 1) {
              if(!(localStorage.getItem('continueoff')=='allow')){
                if (!(localStorage.getItem('continueoff')=='allow') ){
                       getproducts_2_3()
                }else{
                 if (extact3_no==0){
            extract3()
            extact3_no=1
      }
                  clearInterval(state__int2)

                }
              }
            } else {
              console.log('validation has not taken place..')
            }
          }



        }else{
          if (extact3_no==0){
            extract3()
            extact3_no=1
      }
          clearInterval(state__int2)

        }


      }, 10000)






    }else{
      
    }
  }else{
    
  }
}







function sort_tables(){


  // Get the original tbody and table


let originalTbody = document.getElementById('match-table');
      if (!originalTbody){
        tbody=document.querySelector('.mainT')
      }
      if (!originalTbody){
        originalTbody=document.querySelector('tbody')
      }

const originalTable = originalTbody.parentElement;
const originalThead = originalTable.querySelector('thead');

// Get all rows
const rows = originalTbody.querySelectorAll('tr');

// Separate rows into arrays
const winRows = [];
const winLostByDrawRows = [];
const lostWinRows = [];

rows.forEach(row => {
  const correctTd = row.querySelector('td:nth-child(4)'); // Correct column (index 3)
  const actualTd = row.querySelector('td:nth-child(3)'); // Actual column (index 2)
  const correctText = correctTd.textContent.trim();
  const actualText = actualTd.textContent.trim().toLowerCase();

  if (correctText === '✅') {
    winRows.push(row.cloneNode(true));
  } else if (correctText === '❌') {
    if (actualText === 'draw') {
      winLostByDrawRows.push(row.cloneNode(true));
    } else {
      lostWinRows.push(row.cloneNode(true));
    }
  }
});

// Create tabs container
const tabsContainer = document.createElement('div');
tabsContainer.id = 'tabs';

// Create main tab buttons
const wonTabButton = document.createElement('button');
wonTabButton.id = 'won-tab';
wonTabButton.classList.add('tab-button')
wonTabButton.textContent = 'Won Matches';

const lostTabButton = document.createElement('button');
lostTabButton.id = 'lost-tab';
lostTabButton.classList.add('tab-button')
lostTabButton.textContent = 'Lost Matches';

tabsContainer.appendChild(wonTabButton);
tabsContainer.appendChild(lostTabButton);

// Create content divs for main tabs
const wonContent = document.createElement('div');
wonContent.id = 'won-content';
wonContent.style.display = 'none';

const lostContent = document.createElement('div');
lostContent.id = 'lost-content';
lostContent.style.display = 'none';

// Create won matches table
const wonThead = originalThead.cloneNode(true);
const wonTbody = document.createElement('tbody');
wonTbody.className = originalTbody.className;
winRows.forEach(row => wonTbody.appendChild(row));
const wonTable = document.createElement('table');
wonTable.className = originalTable.className;
wonTable.appendChild(wonThead);
wonTable.appendChild(wonTbody);
wonContent.appendChild(wonTable);

// Create lost matches content with sub-tabs
const subTabsContainer = document.createElement('div');
subTabsContainer.id = 'sub-tabs';

const winLostByDrawTabButton = document.createElement('button');
winLostByDrawTabButton.id = 'win-lost-by-draw-tab';
winLostByDrawTabButton.textContent = 'By-Draw';
winLostByDrawTabButton.classList.add('sub-tab-button')

const lostWinTabButton = document.createElement('button');
lostWinTabButton.id = 'lost-win-tab';
lostWinTabButton.textContent = 'Lose';
lostWinTabButton.classList.add('sub-tab-button')

subTabsContainer.appendChild(winLostByDrawTabButton);
subTabsContainer.appendChild(lostWinTabButton);

const winLostByDrawContent = document.createElement('div');
winLostByDrawContent.id = 'win-lost-by-draw-content';
winLostByDrawContent.style.display = 'none';

const lostWinContent = document.createElement('div');
lostWinContent.id = 'lost-win-content';
lostWinContent.style.display = 'none';

// Create win lost by draw table
const winLostByDrawThead = originalThead.cloneNode(true);
const winLostByDrawTbody = document.createElement('tbody');
winLostByDrawTbody.className = originalTbody.className;
winLostByDrawRows.forEach(row => winLostByDrawTbody.appendChild(row));
const winLostByDrawTable = document.createElement('table');
winLostByDrawTable.className = originalTable.className;
winLostByDrawTable.appendChild(winLostByDrawThead);
winLostByDrawTable.appendChild(winLostByDrawTbody);
winLostByDrawContent.appendChild(winLostByDrawTable);

// Create lost win table
const lostWinThead = originalThead.cloneNode(true);
const lostWinTbody = document.createElement('tbody');
lostWinTbody.className = originalTbody.className;
lostWinRows.forEach(row => lostWinTbody.appendChild(row));
const lostWinTable = document.createElement('table');
lostWinTable.className = originalTable.className;
lostWinTable.appendChild(lostWinThead);
lostWinTable.appendChild(lostWinTbody);
lostWinContent.appendChild(lostWinTable);

// Append sub-tabs and sub-contents to lostContent
lostContent.appendChild(subTabsContainer);
lostContent.appendChild(winLostByDrawContent);
lostContent.appendChild(lostWinContent);

// Create wrapper and replace original table
const wrapper = document.createElement('div');
wrapper.appendChild(tabsContainer);
wrapper.appendChild(wonContent);
wrapper.appendChild(lostContent);

const parent = originalTable.parentElement;
parent.replaceChild(wrapper, originalTable);

// Functions to manage tab display
function showContent(contentId) {
  wonContent.style.display = 'none';
  lostContent.style.display = 'none';
  document.getElementById(contentId).style.display = 'block';
}

function showSubContent(subContentId) {
  winLostByDrawContent.style.display = 'none';
  lostWinContent.style.display = 'none';
  document.getElementById(subContentId).style.display = 'block';
}

// Add event listeners for main tabs
wonTabButton.addEventListener('click', () => {
  showContent('won-content');
  wonTabButton.classList.add('active')
  lostTabButton.classList.remove('active')
  lostWinTabButton.classList.remove('active')
  lostWinTabButton.classList.remove('active')
 
});
wonTabButton.classList.add('active')

lostTabButton.addEventListener('click', () => {
  lostTabButton.classList.add('active')
  wonTabButton.classList.remove('active')
  showContent('lost-content');
  showSubContent('win-lost-by-draw-content'); 
  winLostByDrawTabButton.classList.add('active')// Show first sub-tab by default
});

// Add event listeners for sub-tabs
winLostByDrawTabButton.addEventListener('click', () => {
  showSubContent('win-lost-by-draw-content');
  winLostByDrawTabButton.classList.add('active')
  lostWinTabButton.classList.remove('active')
});

lostWinTabButton.addEventListener('click', () => {
  showSubContent('lost-win-content');
  lostWinTabButton.classList.add('active')
  winLostByDrawTabButton.classList.remove('active')
});

// Initially show won matches tab
showContent('won-content');



}














function updatecontent7_0() {
  // console.log(statec)

 


      // location.reload(false)
      let count_ = 0
      let state__int = setInterval(() => {

        count_ = count_ + 1
        let do_;
        let st = accessInfo('late7')
        if (count_ == 1) {
          do_ = true
          storeInfo('late7', null)
          // console.log('Requesting')

        }

        if (st == 'done') {
          if (count_ == 1) {
            do_ = true
            storeInfo('late7', null)


          } else {
            do_ = true
            storeInfo('late7', null)
            
          }

        } else {
          if (st == 'failed') {
            do_ = true
            storeInfo('late7', null)
            count_ = 0
            // console.log('Retrying..')


          } else {
            if (st == 'busy') {
              // console.log('Busy..')
              do_ = false
            } else {
              do_ = true
            }
          }
        }
        if (document.querySelector('.products-grid' ) && accessInfo('statec')=='today' ) {
          if (!(localStorage.getItem('continueoff')=='allow')) {
            if (do_) {
              if (!(localStorage.getItem('continueoff')=='allow')) {
                console.log('requested content')
                if (!(localStorage.getItem('continueoff')=='allow')){
                  let loader979=document.querySelector('.loader88')
                  if (loader979){
                    loader979.setAttribute('style','border:2px solid #fff;border-top-color: transparent;')
                  
                  }
                  getproducts2_()
                  console.log('late7 in progress')
                }else{
                  

                 
                  
                }
                
              }else{
                

                  
              }
            }


          }else{
           
          
 
          }
        } else {
         
        }

      }, 120000)






    
}

setTimeout(updatecontent7_0,20000)

// updatecontent7_0()



 function toggleTheme_z() {
      const dark = document.querySelector('.st_and_ac').classList.toggle('dark-mode22');
      document.querySelector('.toggle-button').textContent = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }


// Function to parse 'DD-MM-YYYY' dates into Date objects
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('-');
  return new Date(`${year}-${month}-${day}`);
}

function analysis3(rawData) {
  console.log('analysis3');
  // console.log(rawData);
  const winCounts = {}, lossCounts = {}, accuracy = {};
  const matchData = {};

  // Process wins
  for (const [k, entry] of Object.entries(rawData.win || {})) {
    const date = entry.date;
    winCounts[date] = (winCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`✅ ${entry.match}`);
  }
  for (const [k, entry] of Object.entries(rawData.drawW || {})) {
    const date = entry.date;
    winCounts[date] = (winCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`✅ ${entry.match}`);
  }

  // Process losses
  for (const [k, entry] of Object.entries(rawData.loss || {})) {
    const date = entry.date;
    lossCounts[date] = (lossCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`❌ ${entry.match}`);
  }
  for (const [k, entry] of Object.entries(rawData.drawL || {})) {
    const date = entry.date;
    lossCounts[date] = (lossCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`❌ ${entry.match}`);
  }

  // Collect all unique date strings
  const allDateStr = Array.from(new Set([...Object.keys(winCounts), ...Object.keys(lossCounts)]));

  // Calculate accuracy for each date
  allDateStr.forEach(dateStr => {
    const win = winCounts[dateStr] || 0;
    const loss = lossCounts[dateStr] || 0;
    accuracy[dateStr] = (win + loss) > 0 ? (win / (win + loss)) * 100 : 0;
  });

  // Sort dates chronologically
  const datePairs = allDateStr.map(dateStr => [dateStr, parseDate(dateStr)]);
  datePairs.sort((a, b) => a[1] - b[1]);
  const sortedDateStr = datePairs.map(pair => pair[0]);
  const earliestDate = datePairs[0][1];
  const dayDifferences = datePairs.map(pair => Math.floor((pair[1] - earliestDate) / (1000 * 60 * 60 * 24)));
  const labels = dayDifferences.map(diff => diff + 1);

  // Prepare data arrays in sorted order
  const winData = sortedDateStr.map(dateStr => winCounts[dateStr] || 0);
  const lossData = sortedDateStr.map(dateStr => lossCounts[dateStr] || 0);
  const accuracyData = sortedDateStr.map(dateStr => accuracy[dateStr] || 0);

  // Calculate totals and overall accuracy
  const totalWins = Object.values(winCounts).reduce((a, b) => 

 a + b, 0);
  const totalLosses = Object.values(lossCounts).reduce((a, b) => a + b, 0);
  const overallAccuracy = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(2) : 0;

  // Update stats display
  document.getElementById('stats').innerHTML = `<strong><span class='twns'>Total Wins:</span></strong> ${totalWins} | <strong><span class='tlss'>Total Losses:</span></strong> ${totalLosses} | <strong><span class='tacs'>Accuracy:</span></strong> ${overallAccuracy}%`;

  // Get chart contexts
  const ctx11 = document.getElementById('resultsChart').getContext('2d');
  const ctx22 = document.getElementById('accuracyChart').getContext('2d');

  // Destroy existing charts if they exist
  if (lineChart2) {
    lineChart2.destroy();
  }
  if (lineChart3) {
    lineChart3.destroy();
  }

  // Create Wins/Losses chart with numerical labels
  lineChart2 = new Chart(ctx11, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Wins',
          data: winData,
          borderColor: 'limegreen',
          backgroundColor: 'rgba(50,205,50,0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Losses',
          data: lossData,
          borderColor: 'crimson',
          backgroundColor: 'rgba(220,20,60,0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).color } }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.body).color } },
        y: { ticks: { color: getComputedStyle(document.body).color } }
      }
    }
  });

  // Create Accuracy chart with numerical labels
  lineChart3 = new Chart(ctx22, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Accuracy (%)',
        data: accuracyData,
        borderColor: 'deepskyblue',
        backgroundColor: 'rgba(0,191,255,0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: 'easeInOutCubic' },
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).color } }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.body).color } },
        y: { ticks: { color: getComputedStyle(document.body).color } }
      }
    }
  });
};
    

   
