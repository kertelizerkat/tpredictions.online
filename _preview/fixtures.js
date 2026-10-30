/* Sample backend payloads for the Predicter preview. Mirrors App1.getinfo() output shape. */
(function () {
  function line(inner, extraClass) {
    return "<span class='info_line " + (extraClass || '') + "'>" + inner + "</span>";
  }

  function capability(team, kind, pct, ok) {
    return line(team + "'s " + kind + " capability:  <span class='" + (ok ? 'green' : 'red') + "'>" + pct + "%</span>");
  }

  function chance(team, pct) {
    return line("<span class='" + (pct >= 50 ? 'green' : 'red') + "'>" + team + "</span> has a " + pct + "% probability of wining", 'chance_w');
  }

  function draw(pct) {
    return line(" Probability of Draw:  <span class='" + (pct >= 50 ? 'green' : 'red') + "'>" + pct + "% </span>", 'chance_w');
  }

  function predict(inner) {
    return line("Prediction: " + inner, 'chance_w POutcome');
  }

  function wrap(lines) {
    return "<div id='vs_info'>" + lines.join('') + "</div>";
  }

  window.PVR_FIXTURES = {
    win: {
      query: 'Liverpool vs Chelsea',
      raw: wrap([
        capability('Liverpool', 'wining', 74, true),
        capability('Chelsea', 'wining', 42, false),
        capability('Liverpool', 'Losing', 21, true),
        capability('Chelsea', 'Losing', 21, false),
        capability('Liverpool', 'Drawing', 5, true),
        capability('Chelsea', 'Drawing', 37, false),
        chance('Liverpool', 54),
        chance('Chelsea', 31),
        draw(15),
        predict("<span class='green'>Liverpool</span> <span class='green'>(win)</span>")
      ])
    },

    draw: {
      query: 'Arsenal vs Tottenham',
      raw: wrap([
        capability('Arsenal', 'wining', 47, false),
        capability('Tottenham', 'wining', 44, false),
        capability('Arsenal', 'Losing', 28, true),
        capability('Tottenham', 'Losing', 30, false),
        capability('Arsenal', 'Drawing', 25, true),
        capability('Tottenham', 'Drawing', 26, true),
        chance('Arsenal', 33),
        chance('Tottenham', 33),
        draw(34),
        predict("<span class='green'>Draw</span>")
      ])
    },

    away: {
      query: 'Everton vs Manchester City',
      raw: wrap([
        capability('Everton', 'wining', 29, false),
        capability('Manchester City', 'wining', 78, true),
        capability('Everton', 'Losing', 41, false),
        capability('Manchester City', 'Losing', 9, true),
        capability('Everton', 'Drawing', 30, false),
        capability('Manchester City', 'Drawing', 13, true),
        chance('Everton', 14),
        chance('Manchester City', 71),
        draw(15),
        predict("<span class='green'>Manchester City</span> <span class='green'>(win)</span>")
      ])
    },

    unpredictable: {
      query: 'Wolves vs Crystal Palace',
      raw: wrap([
        capability('Wolves', 'wining', 38, false),
        capability('Crystal Palace', 'wining', 36, false),
        capability('Wolves', 'Losing', 33, false),
        capability('Crystal Palace', 'Losing', 34, false),
        capability('Wolves', 'Drawing', 29, true),
        capability('Crystal Palace', 'Drawing', 30, true),
        chance('Wolves', 35),
        chance('Crystal Palace', 34),
        draw(31),
        predict("<span class='bluee'>Unpredictable!</span>")
      ])
    },

    partial: {
      query: 'Leeds vs Fulham',
      raw: wrap([
        capability('Leeds', 'wining', 41, false),
        capability('Fulham', 'wining', 45, false),
        capability('Leeds', 'Losing', 30, false),
        capability('Fulham', 'Losing', 27, true),
        chance('Leeds', 44),
        chance('Fulham', 47)
      ])
    },

    /* Real-server shape for multi-word teams: App1.getinfo builds capability labels
       from the first word only, so "Manchester City" becomes "Manchester's City's".
       The form block must still be recovered positionally. */
    mangled: {
      query: 'Everton vs Manchester City',
      raw: wrap([
        line("Everton's wining capability:  <span class='green'>29%</span>"),
        line("Manchester's City's capability:  <span class='green'>78%</span>"),
        line("Everton's Losing capability:  <span class='red'>41%</span>"),
        line("Manchester's City's capability:  <span class='green'>9%</span>"),
        line("Everton's Drawing capability:  <span class='red'>30%</span>"),
        line("Manchester's City's capability:  <span class='green'>13%</span>"),
        chance('Everton', 14),
        chance('Manchester', 71),
        draw(15),
        predict("<span class='green'>Manchester City</span> <span class='green'>(win)</span>")
      ])
    },

    noresults: {
      query: 'Foo vs Bar',
      raw: "<div id='vs_info'><span style='color:red'>No results found.</span></div>"
    },

    format: {
      query: 'Liverpool',
      raw: "<span id='red'>Format is incorrect! use: A vs B </span>"
    },

    /* html.pkl (T -> Initiate): a sequence of saved fixture blocks. */
    tournament: {
      query: 'Saved tournament report',
      raw: [
        "<span id='red'>Format is incorrect! use: teamA vs teamB not ['bad fixture'] </span>",
        "<ydiv class='t-and-info'><span class='time'>14:30</span>" + wrap([
          capability('Liverpool', 'wining', 74, true),
          capability('Chelsea', 'wining', 42, false),
          capability('Liverpool', 'Losing', 21, true),
          capability('Chelsea', 'Losing', 21, false),
          capability('Liverpool', 'Drawing', 5, true),
          capability('Chelsea', 'Drawing', 37, false),
          chance('Liverpool', 54),
          chance('Chelsea', 31),
          draw(15),
          predict("<span class='green'>Liverpool</span> <span class='green'>(win)</span>")
        ]) + "</ydiv>",
        "<ydiv class='t-and-info'><span class='time'>15:00</span>" + wrap([
          capability('Arsenal', 'wining', 47, false),
          capability('Tottenham', 'wining', 44, false),
          capability('Arsenal', 'Losing', 28, true),
          capability('Tottenham', 'Losing', 30, false),
          capability('Arsenal', 'Drawing', 25, true),
          capability('Tottenham', 'Drawing', 26, true),
          chance('Arsenal', 33),
          chance('Tottenham', 33),
          draw(34),
          predict("<span class='green'>Draw</span>")
        ]) + "</ydiv>",
        "<ydiv class='t-and-info'><span class='time'>16:15</span>" + wrap([
          capability('Everton', 'wining', 29, false),
          capability('Manchester City', 'wining', 78, true),
          capability('Everton', 'Losing', 41, false),
          capability('Manchester City', 'Losing', 9, true),
          capability('Everton', 'Drawing', 30, false),
          capability('Manchester City', 'Drawing', 13, true),
          chance('Everton', 14),
          chance('Manchester City', 71),
          draw(15),
          predict("<span class='green'>Manchester City</span> <span class='green'>(win)</span>")
        ]) + "</ydiv>",
        "<ydiv class='t-and-info'><span class='time'>17:00</span>" + wrap([
          capability('Wolves', 'wining', 38, false),
          capability('Crystal Palace', 'wining', 36, false),
          chance('Wolves', 35),
          chance('Crystal Palace', 34),
          draw(31),
          predict("<span class='bluee'>Unpredictable!</span>")
        ]) + "</ydiv>",
        "<ydiv class='t-and-info'><span class='time'>18:30</span>" + wrap([
          chance('Leeds', 44),
          chance('Fulham', 47)
        ]) + "</ydiv>",
        "<ydiv class='t-and-info'><span class='time'>19:00</span>" +
          "<div id=\"vs_info  \">( Brighton vs Newcastle )</div><br>" +
          "<p style='text-align:center;color:red;'>--No info!</p></ydiv>",
        "<ydiv class='t-and-info'><span class='time'>20:45</span>" + wrap([
          capability('Newcastle', 'wining', 52, true),
          capability('Brighton', 'wining', 45, false),
          chance('Newcastle', 48),
          chance('Brighton', 29),
          draw(23),
          predict("<span class='green'>Newcastle</span> <span class='green'>(win)</span>")
        ]) + "</ydiv>"
      ].join("\n")
    }
  };
})();
