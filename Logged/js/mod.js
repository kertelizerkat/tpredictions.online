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
let activePerformanceDataset = 'simulated';
let performanceRequestVersion = 0;
let performanceRenderEpoch = 0;
const performanceAnimationTimers = new Set();
const performanceOutcomeSelection = {
  simulated: { group: 'won', subtabs: { won: 0, lost: 0 } },
  real: { group: 'won', subtabs: { won: 0, lost: 0 } },
};

function clearPerformanceAnimations() {
  for (const timer of performanceAnimationTimers) clearInterval(timer);
  performanceAnimationTimers.clear();
}

function runPerformanceInterval(callback, delay, epoch = performanceRenderEpoch) {
  const timer = setInterval(() => {
    if (epoch !== performanceRenderEpoch) {
      clearInterval(timer);
      performanceAnimationTimers.delete(timer);
      return;
    }
    if (callback()) {
      clearInterval(timer);
      performanceAnimationTimers.delete(timer);
    }
  }, delay);
  performanceAnimationTimers.add(timer);
  return timer;
}

function destroyPerformanceCharts() {
  for (const chart of [pieChart, lineChart, lineChart2, lineChart3]) {
    if (chart && typeof chart.destroy === 'function') {
      try { chart.destroy(); } catch (_) { /* already destroyed */ }
    }
  }
  pieChart = lineChart = lineChart2 = lineChart3 = null;
}

function clearPerformanceView(message = '') {
  destroyPerformanceCharts();
  document.querySelectorAll('.outcome-report').forEach(report => report.remove());
  const sourceTable = document.getElementById('match-table-source');
  const sourceBody = document.getElementById('match-table');
  if (sourceBody) sourceBody.replaceChildren();
  if (sourceTable) sourceTable.hidden = true;
  const host = document.querySelector('.htables');
  if (host) {
    document.getElementById('performance-empty-state')?.remove();
    if (message) {
      const status = document.createElement('div');
      status.id = 'performance-empty-state';
      status.className = 'performance-empty-state';
      status.textContent = message;
      host.appendChild(status);
    }
  }
  for (const id of ['total-matches', 'accuracy', 'avg-confidence']) {
    const element = document.getElementById(id);
    if (element) element.textContent = '—';
  }
  const stats = document.getElementById('stats');
  if (stats) stats.textContent = '';
}

function matchProbabilityLabel(value) {
  if (value === null || value === undefined || value === '') return '—';
  const probability = Number(value);
  return Number.isFinite(probability) ? `${probability}%` : '—';
}

function matchProbabilityWidth(value) {
  if (value === null || value === undefined || value === '') return 0;
  const probability = Number(value);
  return Number.isFinite(probability) ? Math.max(0, Math.min(100, probability)) : 0;
}

function populatePerformanceTable(tbody, matches) {
  if (!tbody) return '';
  tbody.replaceChildren();
  for (const match of Array.isArray(matches) ? matches : []) {
    if (!match || typeof match !== 'object') continue;
    const fixtureId = match.fixture_id || match.fixtureId || match.match_id || match.matchId || match.id || '';
    const actual = String(match['actual results'] || '').trim();
    const pending = !actual || /^(pending|missing|unknown|n\/a|—|-|none)$/i.test(actual);
    const row = document.createElement('tr');
    row.className = 'odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700';
    if (fixtureId) row.dataset.fixtureId = String(fixtureId);
    const values = [
      match.match,
      match.prediction,
      actual,
      pending ? '—' : (outcomeIsCorrect(match) ? '✅' : '❌'),
      match.date,
      match.real_score || match.score || match['actual score'],
    ];
    values.forEach((value, index) => {
      const cell = document.createElement('td');
      cell.className = `px-4 py-2 border${index === 4 ? ' dttt' : ''}`;
      cell.textContent = value === null || value === undefined ? '' : String(value);
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  }
  return tbody.innerHTML;
}

storeInfo('refresh','disallow')

function normalizeOutcomeTeam(value) {
  let text = String(value || '').trim();
  try { text = decodeURIComponent(text); } catch (_) { /* already decoded or malformed */ }
  try { text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (_) {}
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function outcomeDateOrdinal(value) {
  const text = String(value || '').trim();
  let parts = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  let year, month, day;
  if (parts) {
    day = Number(parts[1]); month = Number(parts[2]); year = Number(parts[3]);
  } else {
    parts = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T].*)?$/);
    if (!parts) return null;
    year = Number(parts[1]); month = Number(parts[2]); day = Number(parts[3]);
  }
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return Math.floor(timestamp / 86400000);
}

function outcomeIdentity(match, score) {
  let text = String(match || '').trim();
  try { text = decodeURIComponent(text); } catch (_) {}
  const teams = text.split(/\s+(?:vs?\.?|v)\s+/i);
  if (teams.length !== 2) return null;
  const home = normalizeOutcomeTeam(teams[0]);
  const away = normalizeOutcomeTeam(teams[1]);
  if (!home || !away || home === away) return null;
  const scoreParts = String(score || '').trim().match(/^(\d+)\s*[-–:]\s*(\d+)$/);
  if (!scoreParts) return null;
  const leftScore = Number(scoreParts[1]);
  const rightScore = Number(scoreParts[2]);
  if (home < away) return `${home}|${away}:${leftScore}-${rightScore}`;
  return `${away}|${home}:${rightScore}-${leftScore}`;
}

function outcomeRecordId(record) {
  for (const field of ['fixture_id', 'fixtureId', 'match_id', 'matchId', 'id']) {
    if (record && record[field] !== undefined && record[field] !== null && String(record[field]).trim()) {
      return String(record[field]).trim();
    }
  }
  return '';
}

function outcomeIsCorrect(record) {
  const value = record && record.correct_prediction;
  return value === true || value === 1 || value === '✅' || String(value).toLowerCase() === 'true';
}

function dedupeAdjacentOutcomes(items, getMatch, getScore, getDate, getId) {
  const records = items.map((item, index) => ({
    item, index,
    identity: outcomeIdentity(getMatch(item), getScore(item)),
    day: outcomeDateOrdinal(getDate(item)),
    id: getId ? String(getId(item) || '') : outcomeRecordId(item),
  }));
  const chronological = records.slice().sort((a, b) => {
    if (a.day === null) return b.day === null ? a.index - b.index : 1;
    if (b.day === null) return -1;
    return a.day - b.day || a.index - b.index;
  });
  const observed = new Map();
  const keep = new Set();
  for (const record of chronological) {
    if (!record.identity || record.day === null) {
      keep.add(record.index);
      continue;
    }
    const priorRecords = observed.get(record.identity) || [];
    const duplicate = priorRecords.some(prior => {
      if (record.id && prior.id && record.id !== prior.id) return false;
      return Math.abs(record.day - prior.day) <= 1;
    });
    if (!duplicate) keep.add(record.index);
    priorRecords.push(record);
    observed.set(record.identity, priorRecords);
  }
  return records.filter(record => keep.has(record.index)).map(record => record.item);
}

function dedupeOutcomeHistory(history) {
  if (!history || typeof history !== 'object' || Array.isArray(history)) return history;
  const candidates = [];
  const wrappedByBucket = new Map();
  for (const [bucket, entries] of Object.entries(history)) {
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) continue;
    for (const [key, entry] of Object.entries(entries)) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const wrapped = { bucket, key, entry };
      candidates.push(wrapped);
      wrappedByBucket.set(`${bucket}\u0000${key}`, wrapped);
    }
  }
  const kept = new Set(dedupeAdjacentOutcomes(
    candidates,
    item => item.entry.match,
    item => item.entry.real_score || item.entry.score || item.entry['actual score'],
    item => item.entry.date,
    item => outcomeRecordId(item.entry),
  ));
  const cleaned = { ...history };
  for (const [bucket, entries] of Object.entries(history)) {
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) continue;
    const nextEntries = {};
    for (const [key, entry] of Object.entries(entries)) {
      const wrapped = wrappedByBucket.get(`${bucket}\u0000${key}`);
      if (!wrapped || kept.has(wrapped)) nextEntries[key] = entry;
    }
    cleaned[bucket] = nextEntries;
  }
  return cleaned;
}

function dedupeOutcomeTableHtml(html, sourceHistory) {
  if (typeof html !== 'string' || !html.trim()) return html;
  const template = document.createElement('template');
  template.innerHTML = html;
  const rows = Array.from(template.content.querySelectorAll('tr'));
  const sourceIdsByFixture = new Map();
  if (sourceHistory && typeof sourceHistory === 'object') {
    for (const entries of Object.values(sourceHistory)) {
      if (!entries || typeof entries !== 'object' || Array.isArray(entries)) continue;
      for (const entry of Object.values(entries)) {
        if (!entry || typeof entry !== 'object') continue;
        const identity = outcomeIdentity(entry.match, entry.real_score || entry.score || entry['actual score']);
        const day = outcomeDateOrdinal(entry.date);
        if (!identity || day === null) continue;
        const fixtureKey = `${identity}\u0000${day}`;
        if (!sourceIdsByFixture.has(fixtureKey)) sourceIdsByFixture.set(fixtureKey, []);
        sourceIdsByFixture.get(fixtureKey).push(outcomeRecordId(entry));
      }
    }
  }
  rows.forEach(row => {
    if (row.dataset.fixtureId || row.dataset.matchId) return;
    const identity = outcomeIdentity(
      row.cells[0] && row.cells[0].textContent,
      row.cells[5] && row.cells[5].textContent,
    );
    const day = outcomeDateOrdinal(row.cells[4] && row.cells[4].textContent);
    if (!identity || day === null) return;
    const ids = sourceIdsByFixture.get(`${identity}\u0000${day}`);
    if (ids && ids.length) {
      const sourceId = ids.shift();
      if (sourceId) row.dataset.fixtureId = sourceId;
    }
  });
  const keptRows = new Set(dedupeAdjacentOutcomes(
    rows,
    row => row.cells[0] && row.cells[0].textContent,
    row => row.cells[5] && row.cells[5].textContent,
    row => row.cells[4] && row.cells[4].textContent,
    row => row.dataset.fixtureId || row.dataset.matchId || '',
  ));
  rows.forEach(row => { if (!keptRows.has(row)) row.remove(); });
  return template.innerHTML;
}

// --- Helper function to animate numbers ---

function extract3(){

  const summaryStorageKey = activePerformanceDataset === 'real' ? 'realMatchSummary' : 'matchSummary';
  const renderDataset = activePerformanceDataset;
  const renderEpoch = ++performanceRenderEpoch;
  clearPerformanceAnimations();

  storeInfo('refresh','disallow')
   let refreshBtn3=document.getElementById('refreshBtn')
   if (refreshBtn3){
refreshBtn3.classList.remove('refresh-active')
 refreshBtn3.style.cursor="none"
refreshBtn3.style.opacity='0.5'
   }
  




   
      try{
        const summary = JSON.parse(localStorage.getItem(summaryStorageKey));

      }catch{
        storeInfo(summaryStorageKey, '')
        storeInfo('lastStoredTime', '')
        localStorage.setItem('continueoff','Disallow')
        localStorage.setItem('UseLogOffline','Disallow')
        const host = document.querySelector('.htables');
        if (host) {
          const status = document.getElementById('performance-empty-state') || document.createElement('div');
          status.id = 'performance-empty-state';
          status.className = 'performance-empty-state';
          status.textContent = 'No saved results are available offline.';
          if (!status.parentElement) host.appendChild(status);
        }
        return null

      }
      const summary = JSON.parse(localStorage.getItem(summaryStorageKey));
      if (summary && typeof summary === 'object' && !Array.isArray(summary)) {
     
      } else {
        storeInfo(summaryStorageKey, '')
        storeInfo('lastStoredTime', '')
        localStorage.setItem('continueoff','Disallow')
        const host = document.querySelector('.htables');
        if (host) {
          const status = document.getElementById('performance-empty-state') || document.createElement('div');
          status.id = 'performance-empty-state';
          status.className = 'performance-empty-state';
          status.textContent = 'No saved results are available offline.';
          if (!status.parentElement) host.appendChild(status);
        }
        return null

      }
      if (summary.dataset && summary.dataset !== renderDataset) {
        const host = document.querySelector('.htables');
        if (host) {
          const status = document.getElementById('performance-empty-state') || document.createElement('div');
          status.id = 'performance-empty-state';
          status.className = 'performance-empty-state';
          status.textContent = 'Saved results belong to a different data source.';
          if (!status.parentElement) host.appendChild(status);
        }
        return null;
      }
      document.getElementById('performance-empty-state')?.remove();
      summary.histdata_ = dedupeOutcomeHistory(summary.histdata_);
      summary.tbdinner = dedupeOutcomeTableHtml(summary.tbdinner, summary.histdata_);
      if (summary.histdata_ && typeof summary.histdata_ === 'object') {
        summary.winMatches = Object.values(summary.histdata_.win || {});
        summary.lossMatches = Object.values(summary.histdata_.loss || {});
        const chartPoints = matches => matches
          .map((match, index) => ({ x: index + 1, y: Number(match && match.prediction_p) }))
          .filter(point => Number.isFinite(point.y));
        summary.finalWinData = chartPoints(summary.winMatches);
        summary.finalLossData = chartPoints(summary.lossMatches);
      }
      const historyMatches = summary.histdata_ && typeof summary.histdata_ === 'object'
        ? Object.values(summary.histdata_).flatMap(bucket => bucket && typeof bucket === 'object' ? Object.values(bucket) : [])
        : [];
      const cachedMatches = Array.isArray(summary.allMatches) && summary.allMatches.length
        ? summary.allMatches : historyMatches;
      const allMatches = dedupeAdjacentOutcomes(
        cachedMatches,
        match => match && match.match,
        match => match && (match.real_score || match.score || match['actual score']),
        match => match && match.date,
      );
      summary.allMatches = allMatches;
      summary.totalMatches = allMatches.length;
      const settledMatches = allMatches.filter(match => {
        const actual = String(match && match['actual results'] || '').trim();
        return actual && !/^(pending|missing|unknown|n\/a|—|-|none)$/i.test(actual);
      });
      summary.settledMatches = settledMatches.length;
      summary.correctCount = settledMatches.filter(outcomeIsCorrect).length;
      const confidenceValues = allMatches
        .map(match => match && match.prediction_p)
        .filter(value => value !== null && value !== undefined && value !== '')
        .map(Number)
        .filter(Number.isFinite);
      if (confidenceValues.length) {
        summary.avgConfidence = confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length;
      } else {
        summary.avgConfidence = 0;
      }
      if (summary.histdata_ && typeof summary.histdata_ === 'object') {
        const history = summary.histdata_;
        const values = bucket => Object.values(history[bucket] || {});
        const lostResults = values('loss');
        const lostByDraw = lostResults.filter(entry => String(entry && entry['actual results'] || '').trim().toLowerCase() === 'draw').length;
        summary.finalPieData = [
          values('drawW').filter(outcomeIsCorrect).length,
          values('drawL').length,
          values('win').filter(outcomeIsCorrect).length,
          lostResults.length - lostByDraw,
          lostByDraw,
        ];
      }
      localStorage.setItem(summaryStorageKey, JSON.stringify(summary));

      try{
             let rawData=summary.histdata_
             if (rawData){
              analysis3(rawData)

             }
             
      }catch{

      }
   

      // start

      const totalMatches = Math.floor(allMatches.length);
      const correctCount = Number(summary.correctCount) || 0;
      const avgConfidence = Number(summary.avgConfidence) || 0;

      const safeAvgConfidence = Number.isFinite(avgConfidence) ? avgConfidence : 0;
      //remove the loader


      let ptagstate3 = document.getElementById('state_loader')
      if (ptagstate3) ptagstate3.textContent = 'Are you TechNifyied?'
      let ldata2 = document.getElementById('ldata')
      if (ldata2) ldata2.classList.add('checked')
      let loader = document.querySelector('.loading-container')

      if (loader) loader.style.display = 'none'

      // Animate summary counters over 2000ms.
      animateNumber("total-matches", 0, totalMatches, 6000);
      animateNumber("accuracy", 0, settledMatches.length ? (correctCount / settledMatches.length) * 100 : 0, 10000, '%');
      animateNumber("avg-confidence", 0, safeAvgConfidence, 10000, '%');

      const finalPieData = Array.isArray(summary.finalPieData) ? summary.finalPieData : [0, 0, 0, 0, 0];

      // --- Create Pie Chart with initial zero data ---
      const pieCanvas = document.getElementById('pieChart');
      if (pieChart){
        pieChart.destroy()
      }
       pieChart = pieCanvas && typeof Chart !== 'undefined' ? new Chart(pieCanvas.getContext('2d'), {
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
      }) : null;

      // Animate pie chart values over 40 frames (~2000ms total)
      let pieFrame = 0;
      const totalPieFrames = 40;
      runPerformanceInterval(() => {
        if (renderDataset !== activePerformanceDataset || !pieChart) return true;
        pieFrame++;
        const newData = finalPieData.map(val => Math.floor(val * (pieFrame / totalPieFrames)));
        pieChart.data.datasets[0].data = newData;
        pieChart.update();
        return pieFrame >= totalPieFrames;
      }, 50, renderEpoch);
      //  const summaryData = { finalPieData, allMatches, avgConfidence,correctCount, totalMatches,winMatches,lossMatches,finalWinData,finalLossData};
      // --- Line Chart Animation ---
      // Extract the win and loss datasets.
      const winMatches = Array.isArray(summary.winMatches) ? summary.winMatches : [];
      const lossMatches = Array.isArray(summary.lossMatches) ? summary.lossMatches : [];
      const finalWinData = Array.isArray(summary.finalWinData) ? summary.finalWinData : [];
      const finalLossData = Array.isArray(summary.finalLossData) ? summary.finalLossData : [];

      // Create line chart with empty datasets.
      if (lineChart){
          lineChart.destroy()
      }
       const lineCanvas = document.getElementById('lineChart');
       lineChart = lineCanvas && typeof Chart !== 'undefined' ? new Chart(lineCanvas.getContext('2d'), {
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
      }) : null;

      // Animate the line chart by adding data points one at a time.
      let currentIndex = 0;
      const maxPoints = Math.max(finalWinData.length, finalLossData.length);
      runPerformanceInterval(() => {
        if (renderDataset !== activePerformanceDataset || !lineChart) return true;
        if (currentIndex < finalWinData.length) {
          lineChart.data.datasets[0].data.push(finalWinData[currentIndex]);
        }
        if (currentIndex < finalLossData.length) {
          lineChart.data.datasets[1].data.push(finalLossData[currentIndex]);
        }
        lineChart.update();
        currentIndex++;
        return currentIndex >= maxPoints;
      }, 10, renderEpoch);


     const tbody = document.getElementById('match-table');
      if (!tbody) return;
      populatePerformanceTable(tbody, allMatches);
      sort_tables();


      //end
      if (!(localStorage.getItem('continueoff')=='allow')){

        updatecontent()

      

      }
   setTimeout(()=>{
    if (renderEpoch !== performanceRenderEpoch || renderDataset !== activePerformanceDataset) return;

    let refreshBtn2=document.getElementById('refreshBtn')
          if (refreshBtn2){
            storeInfo('refresh','allow')
            refreshBtn2.style.opacity=1
             refreshBtn2.style.cursor="pointer"
            refreshBtn2.classList.add('refresh-active')

            
          }

   },20000)
      
        
      



    }




function updatecontent4() {
  if (!document.getElementById('betslip-container')) return;
  product4();
  if (liveSlipPollTimer === null) {
    liveSlipPollTimer = setInterval(() => {
      if (!document.hidden && document.getElementById('betslip-container')) product4();
    }, 8000);
  }
}

function product4() {
  if (liveSlipsFetchBusy) return;
  liveSlipsFetchBusy = true;
  fetch(line + '/betslips_', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify('slips'),
    cache: 'no-store'
  })
    .then(response => {
      if (!response.ok) throw new Error(`Betslip request failed (${response.status})`);
      return response.json();
    })
    .then(data4 => {
      const container = document.getElementById('betslip-container');
      if (!container) return;
      const matches = data4 && data4.slips && typeof data4.slips === 'object' ? data4.slips : {};
      const stake = 20;
      const slipsByCategory = { pending: [], unresolved: [], won: [], lost: [], completed: [] };
      const allSlips = [];

      function toISODate(value) {
        const text = String(value || '').trim();
        let parts = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (parts) {
          const [, year, month, day] = parts;
          const maxDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
          return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= maxDay
            ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';
        }
        parts = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (parts) {
          const [, day, month, year] = parts;
          const maxDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
          return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= maxDay
            ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';
        }
        return '';
      }

      function displayDate(isoDate) {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}-${month}-${year}`;
      }

      Object.entries(matches).forEach(([slipId, slipMatches], idx) => {
        if (!slipMatches || typeof slipMatches !== 'object') return;
        const legs = Object.values(slipMatches).filter(leg => leg && typeof leg === 'object');
        let anyPending = false;
        let anyUnresolved = false;
        let anyIncorrect = false;
        let allCorrect = legs.length > 0;
        legs.forEach(leg => {
          if (leg.result_status === 'unavailable' || leg.state === 'Result Unavailable') {
            anyUnresolved = true;
            allCorrect = false;
          } else if (leg.state !== 'Match Ended') {
            anyPending = true;
            allCorrect = false;
          } else if (leg.actual === 'incorrect') {
            anyIncorrect = true;
            allCorrect = false;
          } else if (leg.actual !== 'correct') {
            allCorrect = false;
          }
        });
        const slipState = anyUnresolved ? 'unresolved' : anyPending ? 'pending' : anyIncorrect ? 'lost' : allCorrect ? 'won' : 'complete';
        const settledCount = legs.filter(leg => leg.state === 'Match Ended' &&
          (leg.actual === 'correct' || leg.actual === 'incorrect' || Boolean(String(leg.actual_result || '').trim()))).length;
        const liveCount = legs.filter(leg => {
          if (leg.state !== 'pending' || leg.result_status === 'unavailable') return false;
          const score = String(leg.score || '').trim();
          return score !== '' && score.toLocaleLowerCase() !== 'none' && /^\d{1,2}\s*[-–]\s*\d{1,2}$/.test(score);
        }).length;
        const matchDates = [...new Set(legs.map(leg => toISODate(leg.date)).filter(Boolean))].sort();
        const item = {
          slipId: String(slipId), slipMatches, idx, slipState,
          legCount: legs.length, settledCount, liveCount, matchDates,
          latestMatchDate: matchDates[matchDates.length - 1] || '',
          matchDateLabel: matchDates.length > 1
            ? `${displayDate(matchDates[0])} – ${displayDate(matchDates[matchDates.length - 1])}`
            : displayDate(matchDates[0]) || 'Date unavailable'
        };
        allSlips.push(item);
        const category = slipState === 'unresolved' ? 'unresolved' : slipState === 'pending' ? 'pending' : slipState === 'won' ? 'won' : slipState === 'lost' ? 'lost' : 'completed';
        slipsByCategory[category].push(item);
        if (category === 'won' || category === 'lost') slipsByCategory.completed.push(item);
      });

      localStorage.setItem('matchSummary4', JSON.stringify({ slipsByCategory, stake }));
      storeInfo('late4', 'done');

      const pageKey = 'betslipPages';
      let pages = {};
      try { pages = JSON.parse(localStorage.getItem(pageKey) || '{}') || {}; } catch (_) { pages = {}; }
      const filterKey = 'betslipFilters';
      let savedFilters = {};
      try { savedFilters = JSON.parse(localStorage.getItem(filterKey) || '{}') || {}; } catch (_) { savedFilters = {}; }
      const dateFrom = document.getElementById('betslip-date-from');
      const dateTo = document.getElementById('betslip-date-to');
      const sortSelect = document.getElementById('betslip-sort');
      const clearFilters = document.getElementById('betslip-clear-filters');
      if (dateFrom && !dateFrom.dataset.initialized) {
        dateFrom.value = toISODate(savedFilters.from) || '';
        dateFrom.dataset.initialized = 'true';
      }
      if (dateTo && !dateTo.dataset.initialized) {
        dateTo.value = toISODate(savedFilters.to) || '';
        dateTo.dataset.initialized = 'true';
      }
      if (sortSelect && !sortSelect.dataset.initialized) {
        sortSelect.value = ['newest', 'oldest', 'most-active', 'most-outcomes', 'most-matches'].includes(savedFilters.sort)
          ? savedFilters.sort : 'newest';
        sortSelect.dataset.initialized = 'true';
      }
      let activeCategory = accessInfo('activeSlipCategory') || 'pending';
      if (!slipsByCategory[activeCategory]) activeCategory = 'pending';

      function stateStyle(state) {
        return state === 'won' ? 'glass slip-state-won' :
          state === 'lost' ? 'glass slip-state-lost' :
          state === 'pending' ? 'glass slip-state-pending' :
          state === 'unresolved' ? 'glass slip-state-unresolved' :
          'glass slip-state-complete';
      }

      function createLeg(data, rowId) {
        const leg = document.createElement('div');
        leg.className = 'match-card';
        leg.dataset.legId = String(rowId);
        leg.innerHTML = `
          <div class="match-card-heading">
            <h3 class="text-base font-semibold" data-role="match"></h3>
            <div class="match-card-meta">
              <span class="text-xs" data-role="time"></span>
              <span class="match-status" data-role="status"></span>
            </div>
          </div>
          <p class="mt-1 text-xs">Prediction: <span class="font-medium" data-role="prediction"></span></p>
          <p class="mt-1 text-xs">Odds: <span class="font-semibold text-blue-700" data-role="odds"></span></p>
          <div class="mt-1 text-xs font-semibold" data-role="score-wrap"><span data-role="score-label">Score:</span> <span class="inline-block px-2 py-0.5 rounded bg-gray-200" data-role="score"></span></div>
          <div class="mt-1 text-xs font-semibold" data-role="actual-wrap">Actual Result: <span class="inline-block px-2 py-0.5 rounded bg-blue-200" data-role="actual-result"></span></div>`;
        patchLeg(leg, data);
        return leg;
      }

      function patchLeg(leg, data) {
        const role = name => leg.querySelector(`[data-role="${name}"]`);
        const matchName = data.match || '';
        if (role('match').textContent !== matchName) role('match').textContent = matchName;
        if (role('prediction').textContent !== (data.prediction_ || '')) role('prediction').textContent = data.prediction_ || '';
        const oddsText = data.odds == null ? '' : String(data.odds);
        if (role('odds').textContent !== oddsText) role('odds').textContent = oddsText;
        const ended = data.state === 'Match Ended';
        const unavailable = data.result_status === 'unavailable' || data.state === 'Result Unavailable';
        const live = !ended && !unavailable && data.state === 'pending' && data.score && data.score !== 'none';
        const time = role('time');
        const timeText = ended || unavailable ? '' : (data.time && data.time !== 'none' ? String(data.time) : '');
        if (time.textContent !== timeText) time.textContent = timeText;
        const timeClass = live ? 'text-xs text-blue-500 font-bold' : 'text-xs text-gray-500';
        if (time.className !== timeClass) time.className = timeClass;
        const status = role('status');
        const statusText = unavailable ? 'RESULT UNAVAILABLE' : ended ? 'Match Ended' : live ? 'LIVE' : '';
        if (status.textContent !== statusText) status.textContent = statusText;
        const statusClass = `match-status ${unavailable ? 'unavailable' : ended ? (data.actual === 'correct' ? 'won' : data.actual === 'incorrect' ? 'lost' : '') : live ? 'live' : ''}`;
        if (status.className !== statusClass) status.className = statusClass;
        leg.classList.toggle('won', ended && data.actual === 'correct');
        leg.classList.toggle('lost', ended && data.actual !== 'correct');
        leg.classList.toggle('live', live);
        leg.classList.toggle('unavailable', unavailable);
        const scoreWrap = role('score-wrap');
        scoreWrap.hidden = !data.score || data.score === 'none';
        const scoreLabel = role('score-label');
        if (scoreLabel) scoreLabel.textContent = unavailable ? 'Last known score:' : 'Score:';
        const scoreText = data.score && data.score !== 'none' ? String(data.score) : '';
        if (role('score').textContent !== scoreText) role('score').textContent = scoreText;
        const actualWrap = role('actual-wrap');
        actualWrap.hidden = !ended || !data.actual_result;
        const actualText = ended ? (data.actual_result || '') : '';
        if (role('actual-result').textContent !== actualText) role('actual-result').textContent = actualText;
      }

      function createSlipCard(item) {
        const card = document.createElement('article');
        card.className = `slip-card ${stateStyle(item.slipState)} flex flex-col gap-1`;
        card.dataset.slipId = item.slipId;
        const header = document.createElement('div');
        header.className = 'slip-header';
        const icon = item.slipState === 'won' ? '🏆' : item.slipState === 'lost' ? '❌' : item.slipState === 'pending' ? '⏳' : item.slipState === 'unresolved' ? '⚠️' : '📝';
        const headerText = `${icon} Betslip #${item.slipId}`;
        if (header.textContent !== headerText) header.textContent = headerText;
        card.appendChild(header);
        const legsHolder = document.createElement('div');
        legsHolder.dataset.role = 'legs';
        card.appendChild(legsHolder);
        const metrics = document.createElement('div');
        metrics.className = 'slip-metrics';
        metrics.dataset.role = 'slip-metrics';
        card.appendChild(metrics);
        const summary = document.createElement('div');
        summary.className = 'slip-summary';
        summary.dataset.role = 'summary';
        summary.innerHTML = `
          <div class="flex justify-between"><span>Stake</span><span data-role="stake"></span></div>
          <div class="flex justify-between"><span>Total Odds</span><span data-role="total-odds"></span></div>
          <div class="flex justify-between font-semibold text-base mt-1"><span>Potential Win</span><span data-role="potential-win"></span></div>
          <div class="slip-state" data-role="slip-state"></div>`;
        card.appendChild(summary);
        patchSlipCard(card, item, stake);
        return card;
      }

      function patchSlipCard(card, item, currentStake) {
        if (card.dataset.slipState !== item.slipState) {
          card.className = `slip-card ${stateStyle(item.slipState)} flex flex-col gap-1`;
          card.dataset.slipState = item.slipState;
        }
        const header = card.querySelector('.slip-header');
        const icon = item.slipState === 'won' ? '🏆' : item.slipState === 'lost' ? '❌' : item.slipState === 'pending' ? '⏳' : item.slipState === 'unresolved' ? '⚠️' : '📝';
        const headerText = `${icon} Betslip #${item.slipId}`;
        if (header.textContent !== headerText) header.textContent = headerText;
        const holder = card.querySelector('[data-role="legs"]');
        const rows = Object.entries(item.slipMatches || {});
        rows.forEach(([rowId, data], index) => {
          let leg = holder.children[index];
          if (!leg || leg.dataset.legId !== String(rowId)) {
            leg = Array.from(holder.children).find(child => child.dataset.legId === String(rowId));
            if (!leg) leg = createLeg(data, rowId);
            const before = holder.children[index] || null;
            if (before !== leg) holder.insertBefore(leg, before);
          }
          patchLeg(leg, data);
        });
        while (holder.children.length > rows.length) holder.lastElementChild.remove();

        const metrics = card.querySelector('[data-role="slip-metrics"]');
        const metricsText = `${item.legCount} matches · ${item.settledCount} outcomes · ${item.liveCount} live · ${item.matchDateLabel}`;
        if (metrics && metrics.textContent !== metricsText) metrics.textContent = metricsText;

        let totalOdds = 1;
        rows.forEach(([, data]) => {
          const odds = Number(data.odds);
          if (Number.isFinite(odds) && odds > 0) totalOdds *= odds;
        });
        const summary = card.querySelector('[data-role="summary"]');
        const stateLabel = item.slipState === 'won' ? 'SLIP WON' : item.slipState === 'lost' ? 'SLIP LOST' : item.slipState === 'pending' ? 'SLIP PENDING' : item.slipState === 'unresolved' ? 'RESULT DATA MISSING' : '';
        const summaryValues = {
          stake: `R${currentStake}`,
          'total-odds': totalOdds.toFixed(2),
          'potential-win': `R${(currentStake * totalOdds).toFixed(2)}`,
          'slip-state': stateLabel
        };
        Object.entries(summaryValues).forEach(([name, value]) => {
          const node = summary.querySelector(`[data-role="${name}"]`);
          if (node && node.textContent !== value) node.textContent = value;
        });
        const stateNode = summary.querySelector('[data-role="slip-state"]');
        stateNode.className = `slip-state ${stateLabel ? item.slipState : ''}`;
        stateNode.hidden = !stateLabel;
      }

      const pageSize = 10;
      function getFilteredSortedList(category) {
        const allInCategory = slipsByCategory[category] || [];
        const from = dateFrom ? dateFrom.value : '';
        const to = dateTo ? dateTo.value : '';
        const invalidRange = Boolean(from && to && from > to);
        let list = invalidRange ? [] : allInCategory.filter(item => {
          if (!from && !to) return true;
          return item.matchDates.some(date => (!from || date >= from) && (!to || date <= to));
        });
        const sortMode = sortSelect ? sortSelect.value : 'newest';
        const idOrder = (a, b) => {
          const aId = Number(a.slipId), bId = Number(b.slipId);
          if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) return bId - aId;
          return b.idx - a.idx;
        };
        list = list.slice().sort((a, b) => {
          if (sortMode === 'oldest') return -idOrder(a, b);
          if (sortMode === 'most-active') return b.liveCount - a.liveCount || idOrder(a, b);
          if (sortMode === 'most-outcomes') {
            const aPendingRank = a.slipState === 'pending' ? 0 : 1;
            const bPendingRank = b.slipState === 'pending' ? 0 : 1;
            return aPendingRank - bPendingRank || b.settledCount - a.settledCount || idOrder(a, b);
          }
          if (sortMode === 'most-matches') return b.legCount - a.legCount || idOrder(a, b);
          return idOrder(a, b);
        });
        return { list, invalidRange, allInCategory };
      }

      function renderSlips(category, highlightSlipId = null) {
        const { list, invalidRange, allInCategory } = getFilteredSortedList(category);
        const maxPage = Math.max(0, Math.ceil(list.length / pageSize) - 1);
        const page = Math.max(0, Math.min(Number(pages[category]) || 0, maxPage));
        pages[category] = page;
        localStorage.setItem(pageKey, JSON.stringify(pages));
        const visible = list.slice(page * pageSize, (page + 1) * pageSize);
        const existing = new Map(Array.from(container.querySelectorAll('.slip-card[data-slip-id]')).map(card => [card.dataset.slipId, card]));
        if (!list.length) {
          Array.from(container.querySelectorAll('.slip-card[data-slip-id]')).forEach(card => card.remove());
          let empty = container.querySelector('[data-role="empty-slips"]');
          if (!empty) {
            empty = document.createElement('div');
            empty.dataset.role = 'empty-slips';
            empty.className = 'w-full text-center text-slate-400 py-16 text-lg col-span-full';
            container.appendChild(empty);
          }
          empty.textContent = invalidRange
            ? 'The start date must be on or before the end date.'
            : allInCategory.length ? 'No slips match these filters.' : 'No slips in this category.';
        } else {
          const empty = container.querySelector('[data-role="empty-slips"]');
          if (empty) empty.remove();
          visible.forEach((item, index) => {
            let card = existing.get(item.slipId);
            if (!card) card = createSlipCard(item);
            patchSlipCard(card, item, stake);
            const atPosition = container.children[index];
            if (atPosition !== card) container.insertBefore(card, atPosition || null);
          });
          const visibleIds = new Set(visible.map(item => item.slipId));
          Array.from(container.querySelectorAll('.slip-card[data-slip-id]')).forEach(card => {
            if (!visibleIds.has(card.dataset.slipId)) card.remove();
          });
        }
        const status = document.getElementById('betslip-page-status');
        if (status) status.textContent = `Page ${page + 1} of ${Math.max(1, maxPage + 1)} · ${list.length} slips`;
        const prev = document.getElementById('betslip-prev');
        const next = document.getElementById('betslip-next');
        if (prev) prev.disabled = page <= 0;
        if (next) next.disabled = page >= maxPage;
        if (highlightSlipId) {
          const target = Array.from(container.querySelectorAll('.slip-card')).find(card => card.dataset.slipId === String(highlightSlipId));
          if (target) {
            target.classList.remove('betslip-search-highlight');
            void target.offsetWidth;
            target.classList.add('betslip-search-highlight');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }

      const tabs = { pending: 'tab-pending', unresolved: 'tab-unresolved', won: 'tab-won', lost: 'tab-lost', completed: 'tab-completed' };
      const unresolvedCount = document.querySelector('#tab-unresolved .tab-count');
      if (unresolvedCount) unresolvedCount.textContent = String(slipsByCategory.unresolved.length);
      function selectCategory(category) {
        if (!slipsByCategory[category]) return;
        activeCategory = category;
        storeInfo('activeSlipCategory', category);
        Object.entries(tabs).forEach(([name, id]) => {
          const button = document.getElementById(id);
          if (button) button.classList.toggle('active', name === category);
        });
        renderSlips(category);
      }
      Object.entries(tabs).forEach(([category, id]) => {
        const button = document.getElementById(id);
        if (button) button.onclick = () => selectCategory(category);
      });

      const prev = document.getElementById('betslip-prev');
      const next = document.getElementById('betslip-next');
      if (prev) prev.onclick = () => { pages[activeCategory] = Math.max(0, (Number(pages[activeCategory]) || 0) - 1); renderSlips(activeCategory); };
      if (next) next.onclick = () => { pages[activeCategory] = (Number(pages[activeCategory]) || 0) + 1; renderSlips(activeCategory); };
      function saveSlipFilters(resetPage = true) {
        const filters = {
          from: dateFrom ? dateFrom.value : '',
          to: dateTo ? dateTo.value : '',
          sort: sortSelect ? sortSelect.value : 'newest'
        };
        localStorage.setItem(filterKey, JSON.stringify(filters));
        if (resetPage) pages[activeCategory] = 0;
        renderSlips(activeCategory);
      }
      if (dateFrom) dateFrom.onchange = () => saveSlipFilters();
      if (dateTo) dateTo.onchange = () => saveSlipFilters();
      if (sortSelect) sortSelect.onchange = () => saveSlipFilters();
      if (clearFilters) clearFilters.onclick = () => {
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        saveSlipFilters();
      };
      const search = document.getElementById('betslip-search');
      const searchButton = document.getElementById('betslip-search-button');
      function findSlip() {
        const query = search ? search.value.trim().toLocaleLowerCase() : '';
        if (!query) return;
        const found = allSlips.find(item => String(item.slipId).toLocaleLowerCase().includes(query) ||
          Object.values(item.slipMatches).some(row => row && String(row.match || '').toLocaleLowerCase().includes(query)));
        if (!found) {
          if (search) search.setCustomValidity('No matching slip or match found.');
          if (search) search.reportValidity();
          return;
        }
        if (search) search.setCustomValidity('');
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        localStorage.setItem(filterKey, JSON.stringify({ from: '', to: '', sort: sortSelect ? sortSelect.value : 'newest' }));
        let category = Object.keys(slipsByCategory).find(name => slipsByCategory[name].some(item => item.slipId === found.slipId)) || 'pending';
        if (category === 'completed') category = found.slipState === 'won' || found.slipState === 'lost' ? found.slipState : 'completed';
        const list = getFilteredSortedList(category).list;
        const index = list.findIndex(item => item.slipId === found.slipId);
        pages[category] = Math.floor(Math.max(0, index) / pageSize);
        selectCategory(category);
        requestAnimationFrame(() => renderSlips(category, found.slipId));
      }
      if (search) {
        search.onkeydown = event => {
          if (event.key === 'Enter') { event.preventDefault(); findSlip(); }
        };
        search.oninput = () => search.setCustomValidity('');
      }
      if (searchButton) searchButton.onclick = findSlip;
      selectCategory(activeCategory);
    })
    .catch(error => {
      console.error('Betslip refresh failed:', error);
      storeInfo('late4', 'failed');
    })
    .finally(() => { liveSlipsFetchBusy = false; });
}

function countCardsInTabMarkup(markup) {
  if (typeof markup !== 'string' || !markup) return 0;
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content.querySelectorAll('.matchids').length;
}

function matchCountBadge(count) {
  const safeCount = Math.max(0, Number(count) || 0);
  return `<span class="match-tab-count" aria-label="${safeCount} matches">${safeCount}</span>`;
}

function retrieveSum2() {

  let summery = null;
  try { summery = JSON.parse(accessInfo('matchSummary2')); } catch (_) { summery = null; }
  if (summery) {
    let r_data;
    let r_data_ended = summery.r_data_ended;
    let r_data_live = summery.r_data_live;
    let r_data_upcoming = summery.r_data_upcoming;
    let rl = summery.rl
    let rup = summery.rup
    let ren = summery.ren
    const liveCount = Number.isFinite(Number(summery.liveCount))
      ? Number(summery.liveCount) : countCardsInTabMarkup(r_data_live);
    const upcomingCount = Number.isFinite(Number(summery.upcomingCount))
      ? Number(summery.upcomingCount) : countCardsInTabMarkup(r_data_upcoming);
    const endedCount = Number.isFinite(Number(summery.endedCount))
      ? Number(summery.endedCount) : countCardsInTabMarkup(r_data_ended);

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
      <div id='live-tab1' class="tab live-tab active"><span class="match-tab-label">Live</span>${matchCountBadge(liveCount)}</div>
      <div id='upcoming-tab1' class="tab upcoming-tab"><span class="match-tab-label">Upcoming</span>${matchCountBadge(upcomingCount)}</div>
      <div id='ended-tab1' class="tab ended-tab"><span class="match-tab-label">Ended</span>${matchCountBadge(endedCount)}</div>
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


    initMatchSearch();
  }
}

function animateNumber(id, start, end, duration, suffix = '') {
  const element = document.getElementById(id);
  if (!element) return;
  const renderEpoch = performanceRenderEpoch;
  const dataset = activePerformanceDataset;
  let startTime = null;
  function updateNumber(timestamp) {
    if (renderEpoch !== performanceRenderEpoch || dataset !== activePerformanceDataset) return;
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


function syncMatchCards(markup) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  const incomingTemplate = document.createElement('template');
  incomingTemplate.innerHTML = markup;
  const incomingRoot = incomingTemplate.content.querySelector('.tab-container');
  if (!incomingRoot) return;
  let currentRoot = grid.querySelector('.tab-container');
  if (!currentRoot) {
    grid.replaceChildren(incomingRoot.cloneNode(true));
    currentRoot = grid.querySelector('.tab-container');
  }
  if (!currentRoot) return;
  const incomingCounts = {
    live: matchCountBadge(countCardsInTabMarkup(incomingRoot.querySelector('.live-content .tab_holder_1')?.innerHTML || '')),
    upcoming: matchCountBadge(countCardsInTabMarkup(incomingRoot.querySelector('.upcoming-content .tab_holder_1')?.innerHTML || '')),
    ended: matchCountBadge(countCardsInTabMarkup(incomingRoot.querySelector('.ended-content .tab_holder_1')?.innerHTML || ''))
  };
  Object.entries(incomingCounts).forEach(([state, badgeMarkup]) => {
    const tab = currentRoot.querySelector(`#${state}-tab1`);
    if (!tab) return;
    const incomingTemplate = document.createElement('template');
    incomingTemplate.innerHTML = badgeMarkup;
    const count = incomingTemplate.content.firstElementChild;
    let currentCount = tab.querySelector('.match-tab-count');
    if (!currentCount) {
      currentCount = document.createElement('span');
      currentCount.className = 'match-tab-count';
      tab.appendChild(currentCount);
    }
    currentCount.textContent = count ? count.textContent : '0';
    currentCount.setAttribute('aria-label', `${currentCount.textContent} matches`);
  });
  const tabs = Array.from(currentRoot.querySelectorAll('.tab-header .tab'));
  const panels = Array.from(currentRoot.querySelectorAll('.tab-content > .content'));
  if (!currentRoot.dataset.bound) {
    currentRoot.dataset.bound = '1';
    tabs.forEach((tab, index) => {
      tab.onclick = () => {
        tabs.forEach(item => item.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));
        tab.classList.add('active');
        if (panels[index]) panels[index].classList.add('active');
        localStorage.setItem('activeMatchTab', tab.id);
      };
    });
    const initialTab = tabs.find(tab => tab.id === localStorage.getItem('activeMatchTab')) || tabs[0];
    if (initialTab) initialTab.click();
  }
  const stateToPanel = {
    live: currentRoot.querySelector('.live-content .tab_holder_1'),
    upcoming: currentRoot.querySelector('.upcoming-content .tab_holder_1'),
    ended: currentRoot.querySelector('.ended-content .tab_holder_1')
  };
  const incomingCards = new Map();
  ['live', 'upcoming', 'ended'].forEach(state => {
    const holder = incomingRoot.querySelector(`.${state}-content .tab_holder_1`);
    if (holder) Array.from(holder.children).forEach(card => {
      if (card.id && card.querySelector('.matchids')) incomingCards.set(card.id, { card, state });
    });
  });
  const existingCards = new Map(Array.from(currentRoot.querySelectorAll('.tab_holder_1 > [id]'))
    .filter(card => card.querySelector('.matchids')).map(card => [card.id, card]));
  function patchCard(oldCard, freshCard) {
    const pairs = [
      ['.matchids', '.matchids', 'html'],
      ['.text-right', '.text-right', 'html'],
      ['.bg-lime-100', '.bg-lime-100', 'text'],
      ['[id^="match-time-"]', '[id^="match-time-"]', 'html']
    ];
    pairs.forEach(([oldSelector, newSelector, mode]) => {
      const oldNode = oldCard.querySelector(oldSelector), newNode = freshCard.querySelector(newSelector);
      if (!oldNode || !newNode) return;
      if (oldSelector === '.matchids') {
        oldNode.id = newNode.id;
        oldNode.setAttribute('data', newNode.getAttribute('data') || '');
      }
      const oldValue = mode === 'html' ? oldNode.innerHTML : oldNode.textContent;
      const newValue = mode === 'html' ? newNode.innerHTML : newNode.textContent;
      if (oldValue !== newValue) {
        if (mode === 'html') oldNode.innerHTML = newValue;
        else oldNode.textContent = newValue;
      }
    });
    const oldCells = oldCard.querySelectorAll('.grid.grid-cols-3 > div');
    const newCells = freshCard.querySelectorAll('.grid.grid-cols-3 > div');
    for (let i = 0; i < Math.min(oldCells.length, newCells.length); i++) {
      const oldValue = oldCells[i].querySelector('button span'), newValue = newCells[i].querySelector('button span');
      const oldLabel = oldCells[i].querySelector('.relative > span'), newLabel = newCells[i].querySelector('.relative > span');
      const oldBar = oldCells[i].querySelector('.relative > div'), newBar = newCells[i].querySelector('.relative > div');
      if (oldValue && newValue && oldValue.textContent !== newValue.textContent) oldValue.textContent = newValue.textContent;
      if (oldLabel && newLabel && oldLabel.textContent !== newLabel.textContent) oldLabel.textContent = newLabel.textContent;
      if (oldBar && newBar && oldBar.style.width !== newBar.style.width) oldBar.style.width = newBar.style.width;
    }
  }
  incomingCards.forEach(({ card: freshCard, state }, id) => {
    const holder = stateToPanel[state];
    if (!holder) return;
    let card = existingCards.get(id);
    if (card) patchCard(card, freshCard);
    else card = freshCard.cloneNode(true);
    Array.from(holder.children).forEach(child => { if (child !== card && !child.querySelector('.matchids')) child.remove(); });
    if (card.parentElement !== holder) holder.appendChild(card);
  });
  existingCards.forEach((card, id) => { if (!incomingCards.has(id)) card.remove(); });
  Object.entries(stateToPanel).forEach(([state, holder]) => {
    if (!holder) return;
    const hasCards = Array.from(holder.children).some(child => child.querySelector('.matchids'));
    if (!hasCards) {
      Array.from(holder.children).forEach(child => { if (!child.querySelector('.matchids')) child.remove(); });
    }
    if (!hasCards && !holder.querySelector('.empty-match-state')) {
      const empty = document.createElement('div');
      empty.className = 'empty-match-state text-center text-slate-500 py-12';
      empty.textContent = state === 'live' ? 'No live matches right now.' : state === 'upcoming' ? 'No upcoming matches right now.' : 'No ended matches available.';
      holder.appendChild(empty);
    } else if (hasCards) holder.querySelectorAll('.empty-match-state').forEach(node => node.remove());
  });
}

function initMatchSearch() {
  const input = document.querySelector('.search-input');
  const suggestions = document.getElementById('suggestions');
  const searchBox = document.getElementById('conttt');
  if (!input || !suggestions) return;
  if (searchBox) searchBox.style.display = '';
  if (input.dataset.bound) return;
  input.dataset.bound = '1';
  const findMatches = query => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized ? Array.from(document.querySelectorAll('.products-grid .matchids'))
      .filter(node => node.textContent.toLocaleLowerCase().includes(normalized)).slice(0, 6) : [];
  };
  const selectMatch = match => {
    if (!match) return;
    const state = match.getAttribute('data');
    const tab = document.getElementById(state === 'live' ? 'live-tab1' : state === 'upcoming' ? 'upcoming-tab1' : 'ended-tab1');
    if (tab) tab.click();
    scrollAndHighlight(match.id);
    const card = match.closest('.tab_holder_1 > [id]');
    if (card) { card.classList.add('betslip-search-highlight'); setTimeout(() => card.classList.remove('betslip-search-highlight'), 2500); }
    suggestions.replaceChildren();
    suggestions.classList.remove('visible');
  };
  input.addEventListener('input', () => {
    const matches = findMatches(input.value);
    suggestions.replaceChildren();
    if (!matches.length) { suggestions.classList.remove('visible'); return; }
    const list = document.createElement('ul');
    matches.forEach(match => {
      const item = document.createElement('li');
      item.textContent = match.textContent.trim();
      item.addEventListener('mousedown', event => event.preventDefault());
      item.addEventListener('click', () => selectMatch(match));
      list.appendChild(item);
    });
    suggestions.appendChild(list);
    suggestions.classList.add('visible');
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); selectMatch(findMatches(input.value)[0]); }
  });
  input.addEventListener('blur', () => setTimeout(() => suggestions.classList.remove('visible'), 150));
}

function normalizeMatchState(value) {
  const state = String(value || '').trim().toLocaleLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  if (/^(?:\d{1,3}\s*(?:['′]|min(?:ute)?s?)\s*)?(?:live|in progress|in play|playing|1h|2h|ht|half time|halftime|extra time|penalties|suspended)\b/.test(state)) return 'live';
  if (/^(?:upcoming|scheduled|not started|fixture|pre match|prematch|postponed)\b/.test(state)) return 'upcoming';
  if (/^(?:ended|match ended|finished|full time|fulltime|ft|aet|after extra time|final)\b/.test(state)) return 'ended';
  return '';
}

function hasVisibleMatchPrediction(card) {
  const prediction = String(card && card.prediction_ || '').trim().toLocaleLowerCase();
  return !['', 'n/a', 'na', 'none', 'null', 'unavailable', 'prediction unavailable', 'no prediction', 'no prediction available'].includes(prediction);
}

function setLiveUpdateStatus(message, state = 'updated') {
  let status = document.getElementById('live-update-status');
  if (!status) {
    status = document.createElement('div');
    status.id = 'live-update-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
  }

  const welcome = document.getElementById('user');
  const productsGrid = document.querySelector('.products-grid');
  if (welcome && welcome.nextElementSibling !== status) {
    welcome.insertAdjacentElement('afterend', status);
  } else if (!welcome && productsGrid && status.parentElement !== productsGrid.parentElement) {
    productsGrid.parentElement.insertBefore(status, productsGrid);
  }

  status.className = 'live-update-status';
  status.dataset.state = state;
  status.textContent = message;
  return status;
}

function getproducts2(silent = false) {
  if (liveMatchesFetchBusy) return Promise.resolve(false);
  liveMatchesFetchBusy = true;
  if (!silent) storeInfo('late', 'busy')
  let loader888=document.querySelector('.loader88')
  if (loader888 && !silent){
    loader888.setAttribute('style','border:3px solid #007BFF;border-top-color: transparent;')
 
  

    
  }
  // alert('fetching')
  return fetch(line + '/products', {
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
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Live data response was not a JSON object.');
      }
      if (data.message === '<span id="red">You did not login!</span>') {
        logout();
        return false;
      }
      const snapshotFresh = data.snapshot_valid !== false;
      const expireActiveMatches = data.expire_active_matches === true;
      if (!snapshotFresh && !expireActiveMatches) {
        throw new Error(data.error || 'The live match snapshot is unavailable.');
      }
      if (!data.message || typeof data.message !== 'object' || Array.isArray(data.message)) {
        throw new Error('Live data response did not contain a match snapshot.');
      }

      const cards_data = {};
      Object.entries(data.message).forEach(([id, rawCard]) => {
        if (!rawCard || typeof rawCard !== 'object' || !hasVisibleMatchPrediction(rawCard)) return;
        const state = normalizeMatchState(rawCard.state);
        if (!state) return;
        cards_data[id] = { ...rawCard, state };
      });

      const productsGrid = document.querySelector('.products-grid');
      const existingMatchCount = productsGrid ? productsGrid.querySelectorAll('.tab_holder_1 .matchids').length : 0;
      if (!Object.keys(cards_data).length && existingMatchCount > 0 &&
          !snapshotFresh && !expireActiveMatches) {
        setLiveUpdateStatus('Live update delayed; showing last available data.', 'delayed');
        storeInfo('late', 'done');
        const loader88 = document.querySelector('.loader88');
        if (loader88) loader88.style.display = 'none';
        return false;
      }

      const sourceUpdatedAt = Number(data.updated_at);
      const hasSourceTimestamp = Number.isFinite(sourceUpdatedAt) && sourceUpdatedAt > 0;
      const refreshedAt = hasSourceTimestamp
        ? new Date(sourceUpdatedAt * 1000).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
          })
        : 'unavailable';
      if (hasSourceTimestamp) storeInfo('live_updated_at', sourceUpdatedAt);
      if (snapshotFresh) {
        setLiveUpdateStatus(`Live data refreshed ${refreshedAt}`, 'updated');
      } else {
        setLiveUpdateStatus(
          `Live data delayed; stale live/upcoming matches hidden. Last successful source refresh ${refreshedAt}.`,
          'delayed'
        );
      }
      if (true) {
        {



          const matchCounts = { live: 0, upcoming: 0, ended: 0 };
          Object.values(cards_data).forEach(card => { matchCounts[card.state]++; });
          let r_data = '';
          let r_data_ended = '';
          let r_data_live = '';
          let r_data_upcoming = '';
          let rl = false
          let rup = false
          let ren = false
          for (const r in cards_data) {
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
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${matchProbabilityLabel(cards_data[r].win)}</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${matchProbabilityLabel(cards_data[r].win)}</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].win)}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${matchProbabilityLabel(cards_data[r].draw)}</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${matchProbabilityLabel(cards_data[r].draw)}</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].draw)}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${matchProbabilityLabel(cards_data[r].lose)}</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${matchProbabilityLabel(cards_data[r].lose)}</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].lose)}%;"></div>
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
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${matchProbabilityLabel(cards_data[r].win)}</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${matchProbabilityLabel(cards_data[r].win)}</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].win)}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${matchProbabilityLabel(cards_data[r].draw)}</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${matchProbabilityLabel(cards_data[r].draw)}</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].draw)}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${matchProbabilityLabel(cards_data[r].lose)}</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${matchProbabilityLabel(cards_data[r].lose)}</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].lose)}%;"></div>
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
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700"><span class='winp_'>${matchProbabilityLabel(cards_data[r].win)}</span>  Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-green-700 font-medium">${matchProbabilityLabel(cards_data[r].win)}</span>
                <div class="h-full bg-green-400 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].win)}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-yellow-400 text-gray-800 hover:bg-yellow-500"><span class='drawp_'>${matchProbabilityLabel(cards_data[r].draw)}</span> Draw</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span class="absolute left-1 top-[-1.5rem] text-[10px] text-yellow-700 font-medium">${matchProbabilityLabel(cards_data[r].draw)}</span>
                <div class="h-full bg-yellow-300 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].draw)}%;"></div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button class="text-xs font-medium uppercase px-2 py-1 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600"><span class='losep_'>${matchProbabilityLabel(cards_data[r].lose)}</span> Win</button>
              <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <span id='red' class="absolute red left-1 top-[-1.5rem] text-[10px] text-red-700 font-medium">${matchProbabilityLabel(cards_data[r].lose)}</span>
                <div class="h-full bg-red-400 transition-all duration-700 ease-out" style="width: ${matchProbabilityWidth(cards_data[r].lose)}%;"></div>
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
      <div id='live-tab1' class="tab live-tab active"><span class="match-tab-label">Live</span>${matchCountBadge(matchCounts.live)}</div>
      <div id='upcoming-tab1' class="tab upcoming-tab"><span class="match-tab-label">Upcoming</span>${matchCountBadge(matchCounts.upcoming)}</div>
      <div id='ended-tab1' class="tab ended-tab"><span class="match-tab-label">Ended</span>${matchCountBadge(matchCounts.ended)}</div>
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


          syncMatchCards(r_data)



          storeInfo('late', 'done')
          initMatchSearch();
          let suggestionList = getTextContentsByClass('matchids');
          let suggestionObject = getTextContentIdMapping('matchids');
          let matchSummary2 = {
            suggestionList, suggestionObject, r_data_ended, r_data_live, r_data_upcoming,
            rl, rup, ren,
            liveCount: matchCounts.live,
            upcomingCount: matchCounts.upcoming,
            endedCount: matchCounts.ended
          }
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
      setLiveUpdateStatus('Live update delayed; showing last available data.', 'delayed');
      console.warn('Live match refresh failed; keeping the last displayed snapshot.', error);
      storeInfo('late', 'failed')



    })
    .finally(() => { liveMatchesFetchBusy = false; });
}
function getproducts2_() {
  storeInfo('late7', 'busy');
  return getproducts2(true)
    .then(() => storeInfo('late7', 'done'))
    .catch(error => {
      console.error('Background match refresh failed:', error);
      storeInfo('late7', 'failed');
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


function switchPerformanceDataset(dataset) {
  activePerformanceDataset = dataset === 'real' ? 'real' : 'simulated';
  extact3_no = 0;
  clearPerformanceView(`Loading ${activePerformanceDataset === 'real' ? 'real-life' : 'simulated'} results…`);
  const simulatedButton = document.getElementById('performance-mode-simulated');
  const realButton = document.getElementById('performance-mode-real');
  const note = document.getElementById('performance-mode-note');
  const totalLabel = document.getElementById('total-matches-label');
  if (simulatedButton) simulatedButton.setAttribute('aria-selected', String(activePerformanceDataset === 'simulated'));
  if (realButton) realButton.setAttribute('aria-selected', String(activePerformanceDataset === 'real'));
  if (note) note.textContent = activePerformanceDataset === 'real'
    ? 'Predictions are saved once; accuracy includes settled matches only.'
    : 'Simulated results';
  if (totalLabel) totalLabel.textContent = activePerformanceDataset === 'real'
    ? 'Predictions Recorded' : 'Total Matches';
  getproducts_2_3(true, activePerformanceDataset);
}

function getproducts_2_3(update_=true, dataset=activePerformanceDataset) {
  dataset = dataset === 'real' ? 'real' : 'simulated';
  activePerformanceDataset = dataset;
  const requestVersion = ++performanceRequestVersion;
  ++performanceRenderEpoch;
  clearPerformanceAnimations();


  // alert('fetching')
  storeInfo('late2', 'busy')
  let ptagstate = document.getElementById('state_loader')
  if (ptagstate) ptagstate.textContent = 'Fetching TechNify Data...'
  let fdata__ = document.getElementById('fdata__')
  if (fdata__) fdata__.classList.remove('hide_bx')
  fetch(line + '/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: dataset === 'real' ? 'real_analysis' : 'analysis' })
  })
    .then(response => {
      if (!response.ok) throw new Error(`Performance request failed (${response.status})`);
      let ldata = document.getElementById('ldata')
      if (ldata) ldata.classList.remove('hide_bx')
      let ptagstate2 = document.getElementById('state_loader')
      if (ptagstate2) ptagstate2.textContent = 'Loading Data...'
      let fdata__2 = document.getElementById('fdata__')
      if (fdata__2) fdata__2.classList.add('checked')


      return response.json()
    })
    .then(data3 => {
      if (requestVersion !== performanceRequestVersion || dataset !== activePerformanceDataset) return;
      const renderEpoch = ++performanceRenderEpoch;
      clearPerformanceAnimations();
      document.getElementById('performance-empty-state')?.remove();
      const sourceTbody = document.getElementById('match-table');
      if (!sourceTbody) throw new Error('Performance table is missing from the page');
      let data = dedupeOutcomeHistory(data3 && data3.message);
      if (!data || typeof data !== 'object') data = {};
      analysis3(data)
      let histdata_=data
 


      storeInfo('late2', 'done')



      // --- Aggregating Data for Summary and Table ---

      const allMatches = [];
      for (const category in data) {
        if (data.hasOwnProperty(category)) {
          const catData = data[category];
          for (const key in catData) {
            if (catData.hasOwnProperty(key)) {
              const match = catData[key];
              if (match && typeof match === 'object') allMatches.push(match);
            }
          }
        }
      }


      // --- Summary Calculations ---
      const totalMatches = Math.floor(allMatches.length);
      const settledMatches = allMatches.filter(match => {
        const actual = String(match && match['actual results'] || '').trim();
        return actual && !/^(pending|missing|unknown|n\/a|—|-|none)$/i.test(actual);
      });
      const pendingCount = Math.max(0, allMatches.length - settledMatches.length);
      const performanceNote = document.getElementById('performance-mode-note');
      if (performanceNote && dataset === 'real') {
        performanceNote.textContent = totalMatches
          ? `${pendingCount} pending; accuracy uses settled predictions only.`
          : 'No real-life predictions are recorded yet; new eligible predictions will be saved automatically.';
      }
      const correctCount = settledMatches.filter(outcomeIsCorrect).length;
      const confidenceValues = allMatches
        .map(match => match && match.prediction_p)
        .filter(value => value !== null && value !== undefined && value !== '')
        .map(Number)
        .filter(Number.isFinite);
      const avgConfidence = confidenceValues.length
        ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
        : 0;


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
      animateNumber("accuracy", 0, settledMatches.length ? (correctCount / settledMatches.length) * 100 : 0, 10000, '%');
      animateNumber("avg-confidence", 0, avgConfidence, 10000, '%');

      // --- Pie Chart Data Calculations ---
      // Draws:
      //   - "drawW" holds draws predicted correctly.
      //   - "drawL" holds draws lost.
      const drawsCorrect = data.drawW ? Object.values(data.drawW).filter(outcomeIsCorrect).length : 0;
      const drawsLost = data.drawL ? Object.values(data.drawL).length : 0;

      const winCorrect = data.win ? Object.values(data.win).filter(outcomeIsCorrect).length : 0;
      const losses = data.loss ? Object.values(data.loss) : [];
      const winLostByDraw = losses.filter(match => String(match && match["actual results"] || '').trim().toLowerCase() === "draw").length;
      const winLost = losses.length - winLostByDraw;

      const finalPieData = [drawsCorrect, drawsLost, winCorrect, winLost, winLostByDraw];




      // --- Create Pie Chart with initial zero data ---
      const pieCanvas = document.getElementById('pieChart');
       if (pieChart){
        pieChart.destroy()
      }
      pieChart = pieCanvas && typeof Chart !== 'undefined' ? new Chart(pieCanvas.getContext('2d'), {
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
      }) : null;

      // Animate pie chart values over 40 frames (~2000ms total)
      let pieFrame = 0;
      const totalPieFrames = 40;
      runPerformanceInterval(() => {
        if (!pieChart) return true;
        pieFrame++;
        const newData = finalPieData.map(val => Math.floor(val * (pieFrame / totalPieFrames)));
        pieChart.data.datasets[0].data = newData;
        pieChart.update();
        return pieFrame >= totalPieFrames;
      }, 50, renderEpoch);

      // --- Line Chart Animation ---
      // Extract the win and loss datasets.
      const winMatches = data.win ? Object.values(data.win) : [];
      const lossMatches = data.loss ? Object.values(data.loss) : [];
      const finalWinData = winMatches
        .map((match, i) => ({ x: i + 1, y: Number(match && match.prediction_p) }))
        .filter(point => Number.isFinite(point.y));
      const finalLossData = lossMatches
        .map((match, i) => ({ x: i + 1, y: Number(match && match.prediction_p) }))
        .filter(point => Number.isFinite(point.y));

      // Create line chart with empty datasets.
      const lineCanvas = document.getElementById('lineChart');
       if (lineChart){
          lineChart.destroy()
      }
       lineChart = lineCanvas && typeof Chart !== 'undefined' ? new Chart(lineCanvas.getContext('2d'), {
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
      }) : null;

      // Animate the line chart by adding data points one at a time.
      let currentIndex = 0;
      const maxPoints = Math.max(finalWinData.length, finalLossData.length);
      runPerformanceInterval(() => {
        if (!lineChart) return true;
        if (currentIndex < finalWinData.length) {
          lineChart.data.datasets[0].data.push(finalWinData[currentIndex]);
        }
        if (currentIndex < finalLossData.length) {
          lineChart.data.datasets[1].data.push(finalLossData[currentIndex]);
        }
        lineChart.update();
        currentIndex++;
        return currentIndex >= maxPoints;
      }, 10, renderEpoch); // Keep callbacks bound to the selected dataset.

      // --- Populate the Matches Table ---
      let tbody = sourceTbody;
      const tableMatches = allMatches.slice().reverse();
      const tbdinner = populatePerformanceTable(tbody, tableMatches);
      

      const summaryData = { dataset, finalPieData, allMatches, avgConfidence, correctCount, settledMatches: settledMatches.length, totalMatches, winMatches, lossMatches, finalWinData, finalLossData, tbdinner, histdata_ };
      localStorage.setItem(dataset === 'real' ? "realMatchSummary" : "matchSummary", JSON.stringify(summaryData));
      storeCurrentTime()
      steps_to_remove_loader = 2
      
      updatecontent()
      try { sort_tables(); } catch (error) { console.error('Could not build outcome filters:', error); }
      
      

      let dtt= document.getElementById('histecc')
        let lod2= document.getElementById('mainloader2')
        if (lod2 && dtt){
           lod2.classList.add('hide')
           dtt.setAttribute('style','position:relative')

        }
   setTimeout(()=>{
    if (requestVersion !== performanceRequestVersion || dataset !== activePerformanceDataset) return;

    let refreshBtn2=document.getElementById('refreshBtn')
          if (refreshBtn2){
            storeInfo('refresh','allow')
            refreshBtn2.style.opacity=1
             refreshBtn2.style.cursor="pointer"
            refreshBtn2.classList.add('refresh-active')

            
          }

   },20000)






    }).catch(error => {
      if (requestVersion !== performanceRequestVersion || dataset !== activePerformanceDataset) return;
      steps_to_remove_loader = 1
      const host = document.querySelector('.htables');
      if (host) {
        const status = document.getElementById('performance-empty-state') || document.createElement('div');
        status.id = 'performance-empty-state';
        status.className = 'performance-empty-state';
        status.textContent = 'Could not load the selected results.';
        if (!status.parentElement) host.appendChild(status);
      }
      if (localStorage.getItem('continueoff')){
       if (extact3_no==0){
            extract3()
            extact3_no=1
      }
        let loader = document.querySelector('.loading-container')
        if (loader) loader.style.display = 'none'
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
    if (requestVersion !== performanceRequestVersion || dataset !== activePerformanceDataset) return;

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







function sort_tables() {
  const dataset = activePerformanceDataset === 'real' ? 'real' : 'simulated';
  const summaryKey = dataset === 'real' ? 'realMatchSummary' : 'matchSummary';
  const selection = performanceOutcomeSelection[dataset];
  const sourceTable = document.getElementById('match-table-source');
  const originalTbody = document.getElementById('match-table');
  if (!sourceTable || !originalTbody || !sourceTable.parentElement) return;

  const host = sourceTable.parentElement;
  const originalThead = sourceTable.querySelector('thead');
  if (!originalThead) return;
  host.querySelectorAll('.outcome-report').forEach(report => report.remove());

  let cachedSummary = null;
  try { cachedSummary = JSON.parse(localStorage.getItem(summaryKey) || 'null'); } catch (_) {}
  const cleanedRowsHtml = dedupeOutcomeTableHtml(
    originalTbody.innerHTML,
    cachedSummary && cachedSummary.histdata_,
  );
  if (cleanedRowsHtml !== originalTbody.innerHTML) originalTbody.innerHTML = cleanedRowsHtml;

  const visibleRows = Array.from(originalTbody.querySelectorAll('tr')).filter(row => row.cells.length >= 6);
  if (cachedSummary && typeof cachedSummary === 'object') {
    cachedSummary.tbdinner = originalTbody.innerHTML;
    cachedSummary.histdata_ = dedupeOutcomeHistory(cachedSummary.histdata_);
    if (Array.isArray(cachedSummary.allMatches)) {
      cachedSummary.allMatches = dedupeAdjacentOutcomes(
        cachedSummary.allMatches,
        match => match && match.match,
        match => match && (match.real_score || match.score || match['actual score']),
        match => match && match.date,
      );
      const settledMatches = cachedSummary.allMatches.filter(match => {
        const actual = String(match && match['actual results'] || '').trim();
        return actual && !/^(pending|missing|unknown|n\/a|—|-|none)$/i.test(actual);
      });
      cachedSummary.totalMatches = cachedSummary.allMatches.length;
      cachedSummary.settledMatches = settledMatches.length;
      cachedSummary.correctCount = settledMatches.filter(outcomeIsCorrect).length;
    }
    try { localStorage.setItem(summaryKey, JSON.stringify(cachedSummary)); } catch (_) {}
  }

  const categories = {
    straightWin: [],
    correctDraw: [],
    straightLoss: [],
    lossByDraw: [],
    pending: [],
  };
  visibleRows.forEach(row => {
    const correctText = (row.cells[3].textContent || '').trim();
    const actualText = (row.cells[2].textContent || '').trim().toLowerCase();
    const isPending = correctText === '—' || !actualText || /^(pending|missing|unknown|n\/a|—|-|none)$/i.test(actualText);
    if (isPending) {
      categories.pending.push(row.cloneNode(true));
    } else if (correctText === '✅') {
      (actualText.includes('draw') ? categories.correctDraw : categories.straightWin).push(row.cloneNode(true));
    } else if (correctText === '❌') {
      (actualText.includes('draw') ? categories.lossByDraw : categories.straightLoss).push(row.cloneNode(true));
    }
  });

  const tabs = document.createElement('div');
  tabs.id = `performance-${dataset}-outcome-tabs`;
  tabs.className = 'outcome-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', `${dataset === 'real' ? 'Real-life' : 'Simulated'} match outcomes`);

  function buildOutcomeTable(tableRows, label) {
    const thead = originalThead.cloneNode(true);
    const tbody = document.createElement('tbody');
    tbody.className = originalTbody.className;
    if (tableRows.length) {
      tableRows.forEach(row => tbody.appendChild(row));
    } else {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'performance-no-rows';
      cell.textContent = `No ${label.toLowerCase()} recorded.`;
      row.appendChild(cell);
      tbody.appendChild(row);
    }
    const table = document.createElement('table');
    table.className = sourceTable.className;
    table.append(thead, tbody);
    return table;
  }

  function buildOutcomeGroup(groupKey, label, options) {
    const group = document.createElement('section');
    group.id = `performance-${dataset}-${groupKey}-content`;
    group.className = 'outcome-group';
    group.setAttribute('role', 'tabpanel');
    const savedSubtab = Number(selection.subtabs[groupKey]);
    const activeIndex = Number.isInteger(savedSubtab) && savedSubtab >= 0 && savedSubtab < options.length ? savedSubtab : 0;
    const subTabs = document.createElement('div');
    subTabs.className = 'outcome-subtabs';
    subTabs.setAttribute('role', 'tablist');
    subTabs.setAttribute('aria-label', `${label} breakdown`);
    const panels = [];

    options.forEach((option, index) => {
      const panel = document.createElement('div');
      panel.id = `performance-${dataset}-${groupKey}-panel-${index + 1}`;
      panel.className = 'outcome-subpanel';
      panel.hidden = index !== activeIndex;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-label', option.label);
      panel.appendChild(buildOutcomeTable(option.rows, option.label));

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `sub-tab-button${index === activeIndex ? ' active' : ''}`;
      button.textContent = option.label;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      button.setAttribute('aria-selected', String(index === activeIndex));
      button.addEventListener('click', () => {
        selection.subtabs[groupKey] = index;
        panels.forEach(item => {
          item.panel.hidden = item.index !== index;
          item.button.classList.toggle('active', item.index === index);
          item.button.setAttribute('aria-selected', String(item.index === index));
        });
      });
      subTabs.appendChild(button);
      panels.push({ button, panel, index });
    });
    group.append(subTabs, ...panels.map(item => item.panel));
    return group;
  }

  const groups = [
    {
      key: 'won', label: 'Winning Trades',
      options: [
        { label: 'Straight Win', rows: categories.straightWin },
        { label: 'Correct Draw', rows: categories.correctDraw },
      ],
    },
    {
      key: 'lost', label: 'Losing Trades',
      options: [
        { label: 'Straight Loss', rows: categories.straightLoss },
        { label: 'Loss by Draw', rows: categories.lossByDraw },
      ],
    },
  ];
  if (categories.pending.length) {
    groups.push({ key: 'pending', label: 'Pending', options: [{ label: 'Pending', rows: categories.pending }] });
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'outcome-report';
  const groupElements = new Map();
  groups.forEach(groupInfo => {
    const button = document.createElement('button');
    button.id = `performance-${dataset}-${groupInfo.key}-tab`;
    button.type = 'button';
    button.className = 'tab-button';
    button.textContent = groupInfo.label;
    button.setAttribute('role', 'tab');

    const content = buildOutcomeGroup(groupInfo.key, groupInfo.label, groupInfo.options);
    button.setAttribute('aria-controls', content.id);
    button.addEventListener('click', () => {
      selection.group = groupInfo.key;
      showOutcomeGroup(groupInfo.key);
    });
    tabs.appendChild(button);
    groupElements.set(groupInfo.key, { button, content });
    wrapper.appendChild(content);
  });
  wrapper.insertBefore(tabs, wrapper.firstChild);

  function showOutcomeGroup(groupKey) {
    const activeGroup = groupElements.has(groupKey) ? groupKey : groups[0].key;
    selection.group = activeGroup;
    groupElements.forEach((item, key) => {
      const selected = key === activeGroup;
      item.content.hidden = !selected;
      item.button.classList.toggle('active', selected);
      item.button.setAttribute('aria-selected', String(selected));
    });
  }

  host.insertBefore(wrapper, sourceTable.nextSibling);
  sourceTable.hidden = true;
  showOutcomeGroup(selection.group);
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
  const text = String(dateStr || '').trim();
  const makeUtcDate = (year, month, day) => {
    const value = new Date(Date.UTC(year, month - 1, day));
    return value.getUTCFullYear() === year && value.getUTCMonth() === month - 1 && value.getUTCDate() === day
      ? value : null;
  };
  let parts = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (parts) return makeUtcDate(Number(parts[3]), Number(parts[2]), Number(parts[1]));
  parts = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T].*)?$/);
  if (parts) return makeUtcDate(Number(parts[1]), Number(parts[2]), Number(parts[3]));
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function analysis3(rawData) {
  console.log('analysis3');
  rawData = dedupeOutcomeHistory(rawData);
  if (!rawData || typeof rawData !== 'object') return;
  const winCounts = {}, lossCounts = {}, accuracy = {};
  const matchData = {};

  // Process wins
  for (const [k, entry] of Object.entries(rawData.win || {})) {
    if (!entry || typeof entry !== 'object' || !parseDate(entry.date)) continue;
    const date = String(entry.date);
    winCounts[date] = (winCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`✅ ${entry.match}`);
  }
  for (const [k, entry] of Object.entries(rawData.drawW || {})) {
    if (!entry || typeof entry !== 'object' || !parseDate(entry.date)) continue;
    const date = String(entry.date);
    winCounts[date] = (winCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`✅ ${entry.match}`);
  }

  // Process losses
  for (const [k, entry] of Object.entries(rawData.loss || {})) {
    if (!entry || typeof entry !== 'object' || !parseDate(entry.date)) continue;
    const date = String(entry.date);
    lossCounts[date] = (lossCounts[date] || 0) + 1;
    if (!matchData[date]) matchData[date] = [];
    matchData[date].push(`❌ ${entry.match}`);
  }
  for (const [k, entry] of Object.entries(rawData.drawL || {})) {
    if (!entry || typeof entry !== 'object' || !parseDate(entry.date)) continue;
    const date = String(entry.date);
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
  const datePairs = allDateStr.map(dateStr => [dateStr, parseDate(dateStr)]).filter(pair => pair[1]);
  datePairs.sort((a, b) => a[1] - b[1]);
  const sortedDateStr = datePairs.map(pair => pair[0]);
  const earliestDate = datePairs.length ? datePairs[0][1] : new Date();
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
  const drawWinsTotal = Object.values(rawData.drawW || {}).filter(outcomeIsCorrect).length;
  const straightWinsTotal = Object.values(rawData.win || {}).filter(outcomeIsCorrect).length;
      const statsElement = document.getElementById('stats');
      if (statsElement) statsElement.innerHTML = `<strong>Straight Wins:</strong> ${straightWinsTotal} | <strong>Draw Wins:</strong> ${drawWinsTotal} | <strong>Losses:</strong> ${totalLosses} | <strong>Accuracy:</strong> ${overallAccuracy}%`;

  // Get chart contexts
  const resultsCanvas = document.getElementById('resultsChart');
  const accuracyCanvas = document.getElementById('accuracyChart');
  if (!resultsCanvas || !accuracyCanvas || typeof Chart === 'undefined') return;
  const ctx11 = resultsCanvas.getContext('2d');
  const ctx22 = accuracyCanvas.getContext('2d');

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
    

   

const matchHighlightStyles = document.createElement('style');
matchHighlightStyles.textContent = '.betslip-search-highlight{outline:3px solid #facc15!important;box-shadow:0 0 0 6px rgba(250,204,21,.28)!important;transition:box-shadow .2s ease,outline .2s ease}';
document.head.appendChild(matchHighlightStyles);

