/* TPREDICTIONS — Predicter result report renderer.
 * Parses the server's saved-data report HTML (App1.getinfo) into a structured,
 * accessible card. All server values are inserted as text; the only innerHTML
 * sink is the explicitly allowed .pcr-raw fallback (same trust level as before).
 */
(function () {
  'use strict';

  var REPORT_CLASS = 'predictor-report-output';
  var FALLBACK_NOTE = 'Predictions are estimates from saved match data, not guarantees.';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function clampPct(value) {
    var number = Number(value);
    if (!isFinite(number)) return null;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function normaliseName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/['\u2019]s\b/g, '')
      .replace(/[^a-z0-9\u00c0-\u024f\s.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sideForName(candidate, homeName, awayName) {
    var value = normaliseName(candidate);
    var home = normaliseName(homeName);
    var away = normaliseName(awayName);
    if (!value || !home || !away || home === away) return null;
    if (value === home) return 'home';
    if (value === away) return 'away';
    var homeMatch = home.indexOf(value + ' ') === 0 || value.indexOf(home + ' ') === 0;
    var awayMatch = away.indexOf(value + ' ') === 0 || value.indexOf(away + ' ') === 0;
    if (homeMatch === awayMatch) return null;
    return homeMatch ? 'home' : 'away';
  }

  function parseQueryTeams(query) {
    var parts = String(query || '').trim().split(/\s+vs\.?\s+/i);
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
      return [parts[0].trim(), parts[1].trim()];
    }
    return null;
  }

  function collectLines(root) {
    var nodes = root.querySelectorAll('.info_line');
    var lines = [];
    for (var i = 0; i < nodes.length; i++) {
      var text = (nodes[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      lines.push({
        text: text,
        cls: ' ' + (nodes[i].className || '') + ' ',
        evidenceHome: nodes[i].getAttribute('data-evidence-home'),
        evidenceAway: nodes[i].getAttribute('data-evidence-away'),
        evidenceUsed: nodes[i].getAttribute('data-evidence-used'),
        featureCount: nodes[i].getAttribute('data-feature-count'),
        modelMeta: nodes[i].getAttribute('data-model-meta'),
        modelName: nodes[i].getAttribute('data-model-name'),
        modelFeatureCount: nodes[i].getAttribute('data-model-feature-count'),
        activeFeatureCount: nodes[i].getAttribute('data-active-feature-count'),
        modelVersion: nodes[i].getAttribute('data-model-version'),
        modelStatus: nodes[i].getAttribute('data-model-status'),
        modelTrainingExamples: nodes[i].getAttribute('data-training-examples'),
        modelPromotedAt: nodes[i].getAttribute('data-promoted-at')
      });
    }
    return lines;
  }

  function parse(rawHtml, query) {
    var html = String(rawHtml || '').trim();
    if (!html) return null;

    var doc;
    try {
      doc = new DOMParser().parseFromString(html, 'text/html');
    } catch (error) {
      return null;
    }
    var lines = collectLines(doc);
    if (!lines.length) return null;
    var payload = doc.querySelector('.prediction-payload');
    var home = payload && payload.getAttribute('data-home');
    var away = payload && payload.getAttribute('data-away');
    var resolvedQuery = home && away ? home + ' vs ' + away : query;
    return parseLines(lines, resolvedQuery);
  }

  function parseLines(lines, query) {
    var capabilities = [];
    var untypedCapabilities = [];
    var capabilityOrder = 0;
    var wins = [];
    var drawPct = null;
    var predictionText = null;
    var evidenceMatches = null;
    var evidenceUsed = null;
    var featureCount = null;
    var modelInputs = [];
    var modelFeatureValues = null;
    var trainingExamples = null;
    var validationAccuracy = null;
    var validationScale = null;
    var knnK = null;
    var pickerModel = null;

    lines.forEach(function (line) {
      var text = line.text;
      var match;

      if (line.modelName !== null && line.modelName !== undefined) {
        var modelFeatureCount = Number(line.modelFeatureCount);
        var availableFeatureCount = Number(line.activeFeatureCount);
        var trainingCount = Number(line.modelTrainingExamples);
        pickerModel = {
          name: line.modelName || 'Current picker model',
          featureCount: Number.isInteger(modelFeatureCount) && modelFeatureCount > 0 ? modelFeatureCount : null,
          availableFeatureCount: Number.isInteger(availableFeatureCount) && availableFeatureCount >= 0 ? availableFeatureCount : null,
          version: line.modelVersion || '',
          status: line.modelStatus || '',
          trainingExamples: Number.isInteger(trainingCount) && trainingCount >= 0 ? trainingCount : null,
          promotedAt: line.modelPromotedAt || '',
          detail: text
        };
        return;
      }

      if (line.cls.indexOf(' POutcome ') !== -1 || /^prediction\s*:/i.test(text) || /^match is unpredictable/i.test(text)) {
        predictionText = text.replace(/^prediction\s*:\s*/i, '').trim();
        return;
      }
      if (line.evidenceHome !== null && line.evidenceHome !== undefined &&
          line.evidenceAway !== null && line.evidenceAway !== undefined) {
        var homeEvidence = Number(line.evidenceHome);
        var awayEvidence = Number(line.evidenceAway);
        if (Number.isInteger(homeEvidence) && homeEvidence >= 0 &&
            Number.isInteger(awayEvidence) && awayEvidence >= 0) {
          evidenceMatches = { home: homeEvidence, away: awayEvidence };
        }
        evidenceUsed = line.evidenceUsed === 'true';
        var parsedFeatureCount = Number(line.featureCount);
        if (Number.isInteger(parsedFeatureCount) && parsedFeatureCount >= 0) featureCount = parsedFeatureCount;
        return;
      }
      if (/^model inputs\s*:/i.test(text)) {
        modelInputs = text.replace(/^model inputs\s*:\s*/i, '').replace(/[.\s]+$/, '')
          .split(/\s*,\s*/).filter(Boolean);
        var inputFeatureCount = Number(line.featureCount);
        if (Number.isInteger(inputFeatureCount) && inputFeatureCount >= 0) featureCount = inputFeatureCount;
        if (line.modelMeta) {
          try {
            var meta = JSON.parse(line.modelMeta);
            if (meta && typeof meta === 'object') {
              modelFeatureValues = meta.feature_values && typeof meta.feature_values === 'object' ? meta.feature_values : null;
              trainingExamples = meta.training_examples && typeof meta.training_examples === 'object' ? meta.training_examples : null;
              validationAccuracy = meta.validation_accuracy && typeof meta.validation_accuracy === 'object' ? meta.validation_accuracy : null;
              validationScale = meta.validation_accuracy_scale || null;
              knnK = meta.knn_k && typeof meta.knn_k === 'object' ? meta.knn_k : null;
            }
          } catch (error) {
            // Keep the readable input labels when an older or partial report
            // contains malformed optional diagnostics.
          }
        }
        return;
      }
      var evidenceText = /^evidence records\s*:\s*(.+?),\s*(\d+)\s*;\s*(.+?),\s*(\d+)\.?$/i.exec(text);
      if (evidenceText) {
        var evidenceHomeText = Number(evidenceText[2]);
        var evidenceAwayText = Number(evidenceText[4]);
        if (Number.isInteger(evidenceHomeText) && Number.isInteger(evidenceAwayText)) {
          evidenceMatches = { home: evidenceHomeText, away: evidenceAwayText };
        }
        return;
      }
      if (/capability\s*:/i.test(text)) {
        match = /^(.+?)(?:['\u2019]s)?\s+(wining|winning|losing|drawing)\s+capability\s*:\s*([\d.]+)\s*%/i.exec(text);
        if (match) {
          capabilities.push({ name: match[1].trim(), kind: match[2].toLowerCase(), pct: clampPct(match[3]), index: capabilityOrder });
        } else {
          // Multi-word team names get mangled by the server-side label builder
          // (e.g. "Manchester's City's capability: 78%"), losing the result kind.
          // The saved payload always emits capabilities in this fixed order, so
          // recover them positionally instead of dropping the whole form block.
          var untypedPct = /capability\s*:\s*([\d.]+)\s*%/i.exec(text);
          untypedCapabilities.push({ index: capabilityOrder, pct: untypedPct ? clampPct(untypedPct[1]) : null });
        }
        capabilityOrder += 1;
        return;
      }
      match = /^(.+?)\s+has\s+a\s+([\d.]+)\s*%\s+(?:probability|chance)\s+of\s+winn?ing/i.exec(text);
      if (match) {
        wins.push({ name: match[1].trim(), pct: clampPct(match[2]) });
        return;
      }
      match = /draw\s+probability\s*:\s*([\d.]+)\s*%/i.exec(text)
        || /probability\s+of\s+draw\s*:?\s*([\d.]+)\s*%/i.exec(text);
      if (match) {
        drawPct = clampPct(match[1]);
      }
    });

    var queryTeams = parseQueryTeams(query);
    var homeName = queryTeams ? queryTeams[0] : (wins[0] ? wins[0].name : (capabilities[0] ? capabilities[0].name : 'Home'));
    var awayName = queryTeams ? queryTeams[1] : (wins[1] ? wins[1].name : (capabilities[1] ? capabilities[1].name : 'Away'));

    function sideOf(name) {
      return sideForName(name, homeName, awayName);
    }

    var homeWin = null;
    var awayWin = null;
    var unmappedWins = [];
    wins.forEach(function (entry) {
      var side = sideOf(entry.name);
      if (side === 'home' && homeWin === null) homeWin = entry.pct;
      else if (side === 'away' && awayWin === null) awayWin = entry.pct;
      else unmappedWins.push({ entry: entry, blockedSide: side });
    });
    if (wins.length === 2 && unmappedWins.length === 1 && !unmappedWins[0].blockedSide) {
      if (homeWin === null && awayWin !== null) homeWin = unmappedWins[0].entry.pct;
      else if (awayWin === null && homeWin !== null) awayWin = unmappedWins[0].entry.pct;
    } else if (wins.length === 2 && unmappedWins.length === 2 && homeWin === null && awayWin === null) {
      // The source's two team-win probability lines are emitted home first.
      homeWin = wins[0].pct;
      awayWin = wins[1].pct;
    }

    var home = { name: homeName, form: { win: null, draw: null, loss: null } };
    var away = { name: awayName, form: { win: null, draw: null, loss: null } };
    var capabilitySlots = [
      { team: 'home', kind: 'win' }, { team: 'away', kind: 'win' },
      { team: 'home', kind: 'loss' }, { team: 'away', kind: 'loss' },
      { team: 'home', kind: 'draw' }, { team: 'away', kind: 'draw' }
    ];
    capabilities.forEach(function (entry) {
      var side = sideOf(entry.name);
      if (!side) {
        // Only use the source's documented six-line ordering when the complete
        // capability set is present; otherwise leave ambiguous data unmapped.
        if (capabilities.length + untypedCapabilities.length !== 6) return;
        var fallbackSlot = capabilitySlots[entry.index % capabilitySlots.length];
        if (!fallbackSlot) return;
        side = fallbackSlot.team;
      }
      var team = side === 'home' ? home : away;
      if (entry.kind === 'losing') team.form.loss = entry.pct;
      else if (entry.kind === 'drawing') team.form.draw = entry.pct;
      else team.form.win = entry.pct;
    });

    // Fixed order used by the server payload:
    // home win, away win, home loss, away loss, home draw, away draw.
    untypedCapabilities.forEach(function (entry) {
      var slot = capabilitySlots[entry.index % capabilitySlots.length];
      if (!slot || entry.pct === null) return;
      var team = slot.team === 'home' ? home : away;
      if (team.form[slot.kind] === null) team.form[slot.kind] = entry.pct;
    });

    var outcomes = [];
    if (homeWin !== null) outcomes.push({ key: 'home', label: homeName, pct: homeWin });
    if (drawPct !== null) outcomes.push({ key: 'draw', label: 'Draw', pct: drawPct });
    if (awayWin !== null) outcomes.push({ key: 'away', label: awayName, pct: awayWin });

    var highest = null;
    outcomes.forEach(function (outcome) {
      if (!highest || outcome.pct > highest.pct) highest = outcome;
    });
    var highestIsUnique = highest && outcomes.filter(function (outcome) { return outcome.pct === highest.pct; }).length === 1;
    outcomes.forEach(function (outcome) {
      outcome.isPick = !!(highestIsUnique && highest && outcome.pct === highest.pct);
    });

    var pick = null;
    if (predictionText && /unpredictable|no clear|n\/a|not enough/i.test(predictionText)) {
      pick = { label: 'No clear pick', tone: 'unpredictable', pct: null, note: 'The model could not separate these teams.' };
    } else if (predictionText) {
      if (/^draw(?:\b|$)/i.test(predictionText)) {
        pick = { label: 'Draw', tone: 'draw', pct: drawPct, note: drawPct !== null ? drawPct + '% outcome probability' : 'Selected by the saved predictor.' };
      } else if (sideForName(predictionText, homeName, awayName) === 'home') {
        pick = { label: homeName + ' to win', tone: 'win', pct: homeWin, note: homeWin !== null ? homeWin + '% outcome probability' : 'Selected by the saved predictor.' };
      } else if (sideForName(predictionText, homeName, awayName) === 'away') {
        pick = { label: awayName + ' to win', tone: 'win', pct: awayWin, note: awayWin !== null ? awayWin + '% outcome probability' : 'Selected by the saved predictor.' };
      } else {
        pick = { label: 'No clear pick', tone: 'unpredictable', pct: null, note: 'The saved selection did not match either fixture team.' };
      }
    } else if (highest) {
      if (highest.key === 'draw') {
        pick = { label: 'Draw', tone: 'draw', pct: highest.pct, note: 'Most likely outcome in this report.', derived: true };
      } else {
        pick = { label: highest.label + ' to win', tone: 'win', pct: highest.pct, note: 'Most likely outcome in this report.', derived: true };
      }
    }

    var hasForm = ['win', 'draw', 'loss'].some(function (key) { return home.form[key] !== null || away.form[key] !== null; });
    if (!pick && !outcomes.length && !hasForm) return null;

    return {
      home: home,
      away: away,
      drawPct: drawPct,
      outcomes: outcomes,
      pick: pick,
      hasForm: hasForm,
      evidenceMatches: evidenceMatches,
      evidenceUsed: evidenceUsed,
      featureCount: featureCount,
      modelInputs: modelInputs,
      modelFeatureValues: modelFeatureValues,
      trainingExamples: trainingExamples,
      validationAccuracy: validationAccuracy,
      validationScale: validationScale,
      knnK: knnK,
      pickerModel: pickerModel
    };
  }

  function buildSummary(model) {
    var parts = ['Match prediction: ' + model.home.name + ' vs ' + model.away.name + '.'];
    if (model.outcomes.length) {
      parts.push(model.outcomes.map(function (outcome) { return outcome.label + ' ' + outcome.pct + '%'; }).join(', ') + '.');
    }
    if (model.pick) parts.push('Model pick: ' + model.pick.label + '.');
    return parts.join(' ');
  }

  function buildHead(model) {
    // NOTE: must not be a <header> element: the dashboard's global `header`
    // selector is position:fixed and would lift the report head out of its card.
    var head = el('div', 'pcr-head');
    head.appendChild(el('p', 'pcr-eyebrow', 'Match prediction'));
    var title = el('h2', 'pcr-match');
    title.appendChild(el('span', 'pcr-team', model.home.name));
    title.appendChild(el('span', 'pcr-vs', 'vs'));
    title.appendChild(el('span', 'pcr-team', model.away.name));
    head.appendChild(title);
    head.appendChild(el('p', 'pcr-source', 'Based on saved team capabilities, outcome probabilities and match-history evidence.'));
    return head;
  }

  function buildPick(model) {
    var pick = el('section', 'pcr-pick');
    pick.setAttribute('data-tone', model.pick.tone);
    pick.appendChild(el('p', 'pcr-pick-label', 'Model pick'));
    pick.appendChild(el('p', 'pcr-pick-value', model.pick.label));
    if (model.pick.note) pick.appendChild(el('p', 'pcr-pick-note', model.pick.note));
    return pick;
  }

  function buildOutcomes(model) {
    var section = el('section', 'pcr-section pcr-section--outcomes');
    var head = el('div', 'pcr-section-head');
    head.appendChild(el('h3', 'pcr-section-title', 'Match outcome probabilities'));
    head.appendChild(el('p', 'pcr-section-hint', 'Estimated chance of each result, from 0% to 100%.'));
    section.appendChild(head);

    var grid = el('div', 'pcr-outcomes');
    model.outcomes.forEach(function (outcome, index) {
      var card = el('div', 'pcr-outcome');
      if (outcome.isPick) card.setAttribute('data-pick', 'true');
      card.style.setProperty('--pcr-delay', (index * 40) + 'ms');

      var top = el('div', 'pcr-outcome-top');
      top.appendChild(el('span', 'pcr-outcome-name', outcome.label));
      top.appendChild(el('strong', 'pcr-outcome-value', outcome.pct + '%'));
      card.appendChild(top);

      var meter = el('div', 'pcr-meter');
      meter.setAttribute('role', 'img');
      meter.setAttribute('aria-label', outcome.label + ': ' + outcome.pct + '%');
      var fill = el('span', 'pcr-meter-fill');
      fill.style.setProperty('--pcr-value', String(outcome.pct));
      meter.appendChild(fill);
      card.appendChild(meter);

      if (outcome.isPick) card.appendChild(el('span', 'pcr-outcome-tag', 'Most likely'));
      grid.appendChild(card);
    });
    section.appendChild(grid);
    return section;
  }

  function buildFormTeam(team) {
    var card = el('article', 'pcr-form');
    card.appendChild(el('h4', 'pcr-form-team', team.name));

    var bar = el('div', 'pcr-form-bar');
    var legend = el('dl', 'pcr-form-legend');
    var seen = 0;
    bar.setAttribute('role', 'img');

    [
      { key: 'win', label: 'Win', cls: 'pcr-form-seg--win' },
      { key: 'draw', label: 'Draw', cls: 'pcr-form-seg--draw' },
      { key: 'loss', label: 'Loss', cls: 'pcr-form-seg--loss' }
    ].forEach(function (item) {
      var value = team.form[item.key];
      if (value === null) return;
      seen += 1;
      var segment = el('span', 'pcr-form-seg ' + item.cls);
      segment.style.setProperty('--pcr-value', String(value));
      bar.appendChild(segment);

      var entry = el('div');
      entry.appendChild(el('dt', null, item.label));
      entry.appendChild(el('dd', null, value + '%'));
      legend.appendChild(entry);
    });

    var labelParts = [];
    if (team.form.win !== null) labelParts.push(team.form.win + '% wins');
    if (team.form.draw !== null) labelParts.push(team.form.draw + '% draws');
    if (team.form.loss !== null) labelParts.push(team.form.loss + '% losses');
    bar.setAttribute('aria-label', team.name + ' saved capabilities: ' + (labelParts.join(', ') || 'not available'));

    card.appendChild(bar);
    if (seen) card.appendChild(legend);
    return card;
  }

  function buildForms(model) {
    var teams = [];
    if (model.home.form && (model.home.form.win !== null || model.home.form.draw !== null || model.home.form.loss !== null)) teams.push(model.home);
    if (model.away.form && (model.away.form.win !== null || model.away.form.draw !== null || model.away.form.loss !== null)) teams.push(model.away);
    if (!teams.length) return null;

    var section = el('section', 'pcr-section pcr-section--form');
    var head = el('div', 'pcr-section-head');
    head.appendChild(el('h3', 'pcr-section-title', 'Team capabilities'));
    head.appendChild(el('p', 'pcr-section-hint', 'Saved win, draw and loss capability values for each team.'));
    section.appendChild(head);

    var grid = el('div', 'pcr-forms');
    teams.forEach(function (team) { grid.appendChild(buildFormTeam(team)); });
    section.appendChild(grid);
    return section;
  }

  function buildEvidence(model) {
    var evidence = model && model.evidenceMatches;
    var inputs = model && Array.isArray(model.modelInputs) ? model.modelInputs : [];
    if (!evidence && !inputs.length && !model.modelFeatureValues && !model.trainingExamples && !model.validationAccuracy && !model.knnK && !model.pickerModel) return null;

    var section = el('section', 'pcr-section pcr-section--evidence');
    var head = el('div', 'pcr-section-head');
    head.appendChild(el('h3', 'pcr-section-title', 'Model evidence and inputs'));
    head.appendChild(el('p', 'pcr-section-hint', 'Saved evidence for each team and the data fields used in this prediction.'));
    section.appendChild(head);

    if (model.pickerModel) {
      var picker = model.pickerModel;
      var pickerCard = el('div', 'pcr-picker-summary');
      var pickerTop = el('div', 'pcr-picker-summary-top');
      var pickerName = picker.name;
      if (picker.version) pickerName += ' · version ' + picker.version;
      pickerTop.appendChild(el('strong', 'pcr-picker-name', pickerName));
      var isUsed = picker.status === 'used';
      pickerTop.appendChild(el(
        'span', 'pcr-picker-status' + (isUsed ? ' is-used' : ' is-not-used'),
        isUsed ? 'Used for this match' : 'Not used for this match'
      ));
      pickerCard.appendChild(pickerTop);
      var pickerMeta = [];
      if (picker.featureCount !== null) pickerMeta.push(picker.featureCount + ' active features');
      if (picker.trainingExamples !== null) pickerMeta.push(picker.trainingExamples + ' training records');
      if (picker.promotedAt) {
        var promotedDate = new Date(picker.promotedAt);
        pickerMeta.push('promoted ' + (isFinite(promotedDate.getTime())
          ? promotedDate.toLocaleDateString() : picker.promotedAt));
      }
      if (pickerMeta.length) pickerCard.appendChild(el('p', 'pcr-picker-meta', pickerMeta.join(' · ')));
      if (!isUsed) {
        var pickerExplanation = picker.status === 'unavailable'
          ? 'The promoted model could not be loaded, so no model-backed selection was returned.'
          : 'This fixture does not contain every input required by the current picker, so no three-feature fallback was used.';
        pickerCard.appendChild(el(
          'p', 'pcr-picker-explanation',
          pickerExplanation
        ));
      }
      section.appendChild(pickerCard);
    }

    if (evidence) {
      var grid = el('div', 'pcr-evidence-grid');
      [
        { team: model.home.name, count: evidence.home },
        { team: model.away.name, count: evidence.away }
      ].forEach(function (item) {
        var card = el('div', 'pcr-evidence-card');
        card.appendChild(el('span', 'pcr-evidence-team', item.team));
        card.appendChild(el('strong', 'pcr-evidence-count', String(item.count)));
        card.appendChild(el('span', 'pcr-evidence-label', 'historical match records'));
        grid.appendChild(card);
      });
      section.appendChild(grid);
      if (model.evidenceUsed === true) {
        section.appendChild(el('p', 'pcr-evidence-note', 'Historical evidence coverage was used as a model input.'));
      } else if (model.evidenceUsed === false) {
        section.appendChild(el('p', 'pcr-evidence-note', 'Evidence counts were available; the active model did not use them as input features.'));
      }
    }

    if (inputs.length) {
      var inputWrap = el('div', 'pcr-model-inputs');
      var inputsWereUsed = !model.pickerModel || model.pickerModel.status === 'used';
      inputWrap.appendChild(el('span', 'pcr-evidence-label', model.featureCount !== null && model.featureCount !== undefined
        ? (inputsWereUsed ? 'Inputs used (' : 'Available fields (') + model.featureCount + ' model features)'
        : 'Inputs used'));
      var featureValues = model.modelFeatureValues && typeof model.modelFeatureValues === 'object'
        ? Object.keys(model.modelFeatureValues) : [];
      if (featureValues.length) {
        featureValues.forEach(function (key) {
          var value = Number(model.modelFeatureValues[key]);
          if (!isFinite(value)) return;
          inputWrap.appendChild(el('span', 'pcr-input-chip', humaniseFeatureName(key) + ': ' + (Math.round(value * 100) / 100) + '%'));
        });
      } else {
        inputs.forEach(function (input) { inputWrap.appendChild(el('span', 'pcr-input-chip', input)); });
      }
      section.appendChild(inputWrap);
    }

    if (model.trainingExamples) {
      var training = model.trainingExamples;
      var trainingText = 'Training records: ' + (training.total || 0);
      var classParts = [];
      if (training.home_win !== undefined) classParts.push('home wins ' + training.home_win);
      if (training.draw !== undefined) classParts.push('draws ' + training.draw);
      if (training.away_win !== undefined) classParts.push('away wins ' + training.away_win);
      if (classParts.length) trainingText += ' (' + classParts.join(', ') + ')';
      section.appendChild(el('p', 'pcr-evidence-note', trainingText));
    }

    if (model.validationAccuracy) {
      var validationParts = [];
      [
        ['home_win', model.home.name + ' win'],
        ['draw', 'Draw'],
        ['away_win', model.away.name + ' win']
      ].forEach(function (item) {
        var rawValue = model.validationAccuracy[item[0]];
        if (rawValue === undefined || rawValue === null) return;
        var value = Number(rawValue);
        if (!isFinite(value)) return;
        if (model.validationScale === '0_to_1' || (model.validationScale !== 'percent' && value <= 1)) value *= 100;
        validationParts.push(item[1] + ' ' + Math.round(Math.max(0, Math.min(100, value))) + '%');
      });
      if (validationParts.length) section.appendChild(el('p', 'pcr-evidence-note', 'Saved validation accuracy: ' + validationParts.join(' · ')));
    }
    if (model.knnK) {
      var neighborParts = [];
      [['home_win', model.home.name], ['draw', 'Draw'], ['away_win', model.away.name]].forEach(function (item) {
        var value = Number(model.knnK[item[0]]);
        if (Number.isInteger(value) && value > 0) neighborParts.push(item[1] + ' ' + value);
      });
      if (neighborParts.length) section.appendChild(el('p', 'pcr-evidence-note', 'Selected comparison neighbors (K): ' + neighborParts.join(' · ')));
    }
    return section;
  }

  function buildReport(model) {
    var report = el('article', 'pcr-report');
    if (model.pick) report.setAttribute('data-tone', model.pick.tone);
    report.appendChild(el('p', 'pcr-sr', buildSummary(model)));
    report.appendChild(buildHead(model));
    if (model.pick) report.appendChild(buildPick(model));
    if (model.outcomes.length) report.appendChild(buildOutcomes(model));
    var forms = buildForms(model);
    if (forms) report.appendChild(forms);
    var evidence = buildEvidence(model);
    if (evidence) report.appendChild(evidence);
    report.appendChild(el('p', 'pcr-footnote', FALLBACK_NOTE));
    return report;
  }

  function markIn(output, report) {
    output.classList.add(REPORT_CLASS);
    output.classList.remove('is-raw');
    output.classList.remove('predictor-tournament-output');
    output.classList.remove('predictor-search-output');
    output.setAttribute('aria-busy', 'false');
    var activated = false;
    var activate = function () {
      if (activated) return;
      activated = true;
      report.classList.add('is-in');
    };
    // Two frames so the CSS reveal transitions from the initial state; the
    // timer is a fallback for throttled/background tabs where rAF may not run.
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () { requestAnimationFrame(activate); });
    }
    window.setTimeout(activate, 450);
  }

  function render(output, rawHtml, query) {
    if (!output) return { ok: false };
    var model = parse(rawHtml, query);
    if (!model) return { ok: false };
    var report = buildReport(model);
    output.replaceChildren(report);
    markIn(output, report);
    return { ok: true, model: model };
  }

  function renderEmpty(output, options) {
    if (!output) return;
    var mode = (options && options.mode) || 'individual';
    var premium = mode === 'premium';

    var report = el('article', 'pcr-report pcr-report--empty');
    report.appendChild(el('p', 'pcr-eyebrow', 'Match prediction'));
    report.appendChild(el('h2', 'pcr-empty-title', premium ? 'Saved tournament report' : 'Ready when you are'));
    var text;
    if (premium) {
      text = el('p', 'pcr-empty-text', 'The prepared tournament report will appear here.');
    } else {
      text = el('p', 'pcr-empty-text');
      text.appendChild(document.createTextNode('Enter a fixture as '));
      text.appendChild(el('strong', null, 'Team A vs Team B'));
      text.appendChild(document.createTextNode(', then select Predict. Results use saved team capabilities and match-history records.'));
    }
    report.appendChild(text);

    if (!premium) {
      var examples = el('div', 'pcr-examples');
      [
        'Liverpool vs Chelsea',
        'Arsenal vs Tottenham'
      ].forEach(function (example) {
        var button = el('button', 'pcr-example', example);
        button.type = 'button';
        button.setAttribute('data-pcr-action', 'example');
        button.setAttribute('data-pcr-example', example);
        examples.appendChild(button);
      });
      report.appendChild(examples);
    }

    output.replaceChildren(report);
    markIn(output, report);
  }

  function renderError(output, options) {
    if (!output) return;
    var opts = options || {};
    var kind = opts.kind || 'server';
    var query = opts.query ? String(opts.query) : '';
    var titles = {
      'no-results': 'No saved data for this fixture',
      'format': 'Check the match format',
      'network': 'Could not reach the prediction service',
      'server': 'Prediction could not be completed'
    };
    var texts = {
      'no-results': 'No stored team records matched' + (query ? ' \u201c' + query + '\u201d' : ' this fixture') + '. Check the spelling, or try another fixture.',
      'format': 'Use the format Team A vs Team B, for example Liverpool vs Chelsea.',
      'network': 'Check the connection and try again.',
      'server': 'The report could not be completed. Please try again.'
    };

    var report = el('article', 'pcr-report pcr-report--error');
    report.setAttribute('data-kind', kind);
    report.appendChild(el('p', 'pcr-eyebrow', 'Match prediction'));
    report.appendChild(el('h2', 'pcr-error-title', titles[kind] || titles.server));
    report.appendChild(el('p', 'pcr-error-text', opts.message || texts[kind] || texts.server));
    var retry = el('button', 'pcr-retry', 'Try again');
    retry.type = 'button';
    retry.setAttribute('data-pcr-action', 'retry');
    report.appendChild(retry);

    output.replaceChildren(report);
    markIn(output, report);
  }

  function renderFallback(output, rawHtml, query) {
    if (!output) return;
    var report = el('article', 'pcr-report pcr-report--raw');
    report.setAttribute('data-kind', 'raw');
    report.appendChild(el('p', 'pcr-eyebrow', 'Match prediction'));
    report.appendChild(el('h2', 'pcr-error-title', 'Report format not recognised'));
    report.appendChild(el('p', 'pcr-error-text', 'The saved report was shown in its original form.'));
    var raw = el('div', 'pcr-raw');
    raw.innerHTML = String(rawHtml || '');
    report.appendChild(raw);
    output.replaceChildren(report);
    markIn(output, report);
    output.classList.add('is-raw');
  }

  /* ------------------------------------------------------------------ *
   * Tournament report (premium / T mode)
   * html.pkl is a sequence of:
   *   <ydiv class="t-and-info"><span class="time">14:30</span>
   *     <div id="vs_info">...same info_line payload as a single fixture...</div>
   *   </ydiv>
   * ------------------------------------------------------------------ */

  function normaliseTime(value) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text || text.toLowerCase() === 'none') return '\u2014';
    return text;
  }

  function readPct(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    return clampPct(String(value).replace(/%/g, '').trim());
  }

  function humaniseFeatureName(value) {
    return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function parseCurrentTournamentFixture(block) {
    var nameNode = block.querySelector('.match-name');
    var homeNode = block.querySelector('.match-name .t1_');
    var awayNode = block.querySelector('.match-name .t2_');
    var homeName = homeNode ? homeNode.textContent.trim() : '';
    var awayName = awayNode ? awayNode.textContent.trim() : '';
    if ((!homeName || !awayName) && nameNode) {
      var pair = (nameNode.textContent || '').trim().split(/\s+vs\.?\s+/i);
      if (pair.length === 2) {
        homeName = homeName || pair[0].trim();
        awayName = awayName || pair[1].trim();
      }
    }
    if (!homeName || !awayName || normaliseName(homeName) === normaliseName(awayName)) return null;

    var embedded = block.querySelector('.predictor-model-data');
    var modelData = null;
    if (embedded) {
      try {
        modelData = JSON.parse(embedded.getAttribute('data-model') || '{}');
      } catch (error) {
        modelData = null;
      }
    }
    if (!modelData || typeof modelData !== 'object') modelData = {};

    var probabilitiesNode = block.querySelector('.probabilities');
    var probabilityData = modelData.probabilities || {};
    var homeWin = readPct(probabilityData.home_win);
    var drawPct = readPct(probabilityData.draw);
    var awayWin = readPct(probabilityData.away_win);
    if (probabilitiesNode) {
      if (homeWin === null) homeWin = readPct(probabilitiesNode.getAttribute('data-home'));
      if (drawPct === null) drawPct = readPct(probabilitiesNode.getAttribute('data-draw'));
      if (awayWin === null) awayWin = readPct(probabilitiesNode.getAttribute('data-away'));
      var text = probabilitiesNode.textContent || '';
      var parsed = /home\s+([\d.]+)%.*?draw\s+([\d.]+)%.*?away\s+([\d.]+)%/i.exec(text);
      if (parsed) {
        if (homeWin === null) homeWin = readPct(parsed[1]);
        if (drawPct === null) drawPct = readPct(parsed[2]);
        if (awayWin === null) awayWin = readPct(parsed[3]);
      }
    }
    if (homeWin === null && drawPct === null && awayWin === null) return null;

    var home = { name: homeName, form: { win: null, draw: null, loss: null } };
    var away = { name: awayName, form: { win: null, draw: null, loss: null } };
    var capabilities = modelData.capabilities || {};
    ['win', 'draw', 'lose'].forEach(function (key) {
      var formKey = key === 'lose' ? 'loss' : key;
      if (capabilities.home && readPct(capabilities.home[key]) !== null) home.form[formKey] = readPct(capabilities.home[key]);
      if (capabilities.away && readPct(capabilities.away[key]) !== null) away.form[formKey] = readPct(capabilities.away[key]);
    });

    var outcomes = [];
    if (homeWin !== null) outcomes.push({ key: 'home', label: homeName, pct: homeWin });
    if (drawPct !== null) outcomes.push({ key: 'draw', label: 'Draw', pct: drawPct });
    if (awayWin !== null) outcomes.push({ key: 'away', label: awayName, pct: awayWin });
    var highest = null;
    outcomes.forEach(function (outcome) { if (!highest || outcome.pct > highest.pct) highest = outcome; });
    var uniqueHighest = highest && outcomes.filter(function (outcome) { return outcome.pct === highest.pct; }).length === 1;
    outcomes.forEach(function (outcome) { outcome.isPick = !!(uniqueHighest && highest && outcome.pct === highest.pct); });

    var predictionNode = block.querySelector('.prediction');
    var predictionText = (predictionNode ? predictionNode.textContent : '').replace(/^prediction\s*:\s*/i, '').trim();
    var pick = null;
    if (/unavailable|unpredictable|no clear|n\/a/i.test(predictionText)) {
      pick = { label: 'No prediction available', tone: 'unpredictable', pct: null, note: 'The saved fixture has no usable model selection.' };
    } else if (/^draw(?:\b|$)/i.test(predictionText)) {
      pick = { label: 'Draw', tone: 'draw', pct: drawPct, note: drawPct === null ? 'Selected by the saved model.' : drawPct + '% outcome probability' };
    } else {
      var side = sideForName(predictionText, homeName, awayName);
      if (side === 'home') pick = { label: homeName + ' to win', tone: 'win', pct: homeWin, note: homeWin === null ? 'Selected by the saved model.' : homeWin + '% outcome probability' };
      if (side === 'away') pick = { label: awayName + ' to win', tone: 'win', pct: awayWin, note: awayWin === null ? 'Selected by the saved model.' : awayWin + '% outcome probability' };
    }
    if (!pick && highest && uniqueHighest) {
      pick = highest.key === 'draw'
        ? { label: 'Draw', tone: 'draw', pct: highest.pct, note: 'Most likely outcome in this saved report.', derived: true }
        : { label: highest.label + ' to win', tone: 'win', pct: highest.pct, note: 'Most likely outcome in this saved report.', derived: true };
    }

    var evidenceRaw = modelData.evidence_matches;
    var evidence = null;
    if (evidenceRaw && Number.isFinite(Number(evidenceRaw.home)) && Number.isFinite(Number(evidenceRaw.away))) {
      evidence = { home: Math.max(0, Math.floor(Number(evidenceRaw.home))), away: Math.max(0, Math.floor(Number(evidenceRaw.away))) };
    }
    var featureCount = Number.isFinite(Number(modelData.effective_feature_count)) ? Number(modelData.effective_feature_count) : null;
    var usedFeatures = modelData.features_used_by_name && typeof modelData.features_used_by_name === 'object'
      ? Object.keys(modelData.features_used_by_name) : [];
    var featureLabels = {
      home_win_probability: 'Home win probability', draw_probability: 'Draw probability',
      away_win_probability: 'Away win probability', home_win_capability: 'Home win capability',
      away_win_capability: 'Away win capability', home_lose_capability: 'Home loss capability',
      away_lose_capability: 'Away loss capability', home_draw_capability: 'Home draw capability',
      away_draw_capability: 'Away draw capability', home_evidence_coverage: 'Home evidence coverage',
      away_evidence_coverage: 'Away evidence coverage'
    };
    var modelInputs = usedFeatures.map(function (key) { return featureLabels[key] || key.replace(/_/g, ' '); });
    var modelFeatureValues = null;
    if (usedFeatures.length) {
      modelFeatureValues = {};
      usedFeatures.forEach(function (key) {
        modelFeatureValues[featureLabels[key] || key.replace(/_/g, ' ')] = modelData.features_used_by_name[key];
      });
    }
    if (!modelInputs.length) {
      modelInputs.push('Outcome probabilities');
      if (modelData.uses_capabilities) modelInputs.push('Team capabilities');
      if (modelData.uses_evidence_features) modelInputs.push('Historical evidence coverage');
    }
    var validation = modelData.validation_accuracy && typeof modelData.validation_accuracy === 'object'
      ? modelData.validation_accuracy : null;
    var training = modelData.training_examples && typeof modelData.training_examples === 'object'
      ? modelData.training_examples : null;

    return {
      home: home, away: away, drawPct: drawPct, outcomes: outcomes, pick: pick,
      hasForm: ['win', 'draw', 'loss'].some(function (key) { return home.form[key] !== null || away.form[key] !== null; }),
      evidenceMatches: evidence,
      evidenceUsed: typeof modelData.uses_evidence_features === 'boolean' ? modelData.uses_evidence_features : null,
      featureCount: featureCount,
      modelInputs: modelInputs,
      modelFeatureValues: modelFeatureValues,
      trainingExamples: training,
      validationAccuracy: validation,
      validationScale: modelData.validation_accuracy_scale,
      knnK: modelData.knn_k || null
    };
  }

  function parseTournamentBlock(block) {
    var timeNode = block.querySelector('.time');
    var time = normaliseTime(timeNode ? timeNode.textContent : '');
    var infoRoot = block.querySelector('#vs_info') || block.querySelector("[id^='vs_info']") || block;
    var lines = collectLines(infoRoot);
    var model = parseCurrentTournamentFixture(block);
    if (!model && lines.length) model = parseLines(lines, null);
    var text = (block.textContent || '').replace(/\s+/g, ' ').trim();
    var reason = '';
    if (!model) {
      reason = /no info|no results found/i.test(text)
        ? 'No stored prediction data for this fixture.'
        : 'This saved entry could not be read as a prediction.';
    }
    var competitionNode = block.querySelector('.competition');
    var dateNode = block.querySelector('.fixture-date');
    return {
      time: time,
      competition: competitionNode ? (competitionNode.textContent || '').trim() : '',
      date: dateNode ? (dateNode.textContent || '').trim() : '',
      model: model,
      reason: reason
    };
  }

  function humaniseNotice(text) {
    var value = String(text || '').replace(/\s+/g, ' ').trim();
    if (!value) return '';
    if (/format is incorrect/i.test(value)) return 'One saved entry had an unreadable match name and was skipped.';
    if (/no info|no results/i.test(value)) return 'Some saved entries had no prediction data.';
    return value.length > 160 ? value.slice(0, 157) + '\u2026' : value;
  }

  function parseTournament(rawHtml) {
    var html = String(rawHtml || '').trim();
    if (!html) return { entries: [], notices: [] };
    var doc;
    try {
      doc = new DOMParser().parseFromString(html, 'text/html');
    } catch (error) {
      return { entries: [], notices: [] };
    }

    var entries = [];
    var blocks = doc.querySelectorAll('.t-and-info');
    for (var i = 0; i < blocks.length; i++) {
      entries.push(parseTournamentBlock(blocks[i]));
    }

    var notices = [];
    var errorNodes = doc.querySelectorAll('#red');
    for (var j = 0; j < errorNodes.length; j++) {
      var node = errorNodes[j];
      var notice = humaniseNotice((node.textContent || '').replace(/\s+/g, ' ').trim());
      if (!notice) continue;
      var parentBlock = typeof node.closest === 'function' ? node.closest('.t-and-info') : null;
      if (!parentBlock && notices.indexOf(notice) === -1) notices.push(notice);
    }

    if (!entries.length) {
      var lines = collectLines(doc);
      if (lines.length) {
        var single = parseLines(lines, null);
        if (single) entries.push({ time: '\u2014', model: single, reason: '' });
      }
    }
    return { entries: entries, notices: notices };
  }

  function buildCompactOutcomes(model) {
    var wrap = el('div', 'pcr-fixture-outcomes');
    model.outcomes.forEach(function (outcome) {
      var row = el('div', 'pcr-fixture-outcome');
      if (outcome.isPick) row.setAttribute('data-pick', 'true');
      var top = el('div', 'pcr-fixture-outcome-top');
      top.appendChild(el('span', 'pcr-fixture-outcome-name', outcome.label));
      top.appendChild(el('strong', 'pcr-fixture-outcome-value', outcome.pct + '%'));
      row.appendChild(top);
      var meter = el('div', 'pcr-meter');
      meter.setAttribute('role', 'img');
      meter.setAttribute('aria-label', outcome.label + ': ' + outcome.pct + '%');
      var fill = el('span', 'pcr-meter-fill');
      fill.style.setProperty('--pcr-value', String(outcome.pct));
      meter.appendChild(fill);
      row.appendChild(meter);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function buildCompactForms(model) {
    var teams = [];
    [model.home, model.away].forEach(function (team) {
      if (team.form && (team.form.win !== null || team.form.draw !== null || team.form.loss !== null)) teams.push(team);
    });
    if (!teams.length) return null;
    var wrap = el('div', 'pcr-fixture-forms');
    teams.forEach(function (team) { wrap.appendChild(buildFormTeam(team)); });
    return wrap;
  }

  function buildFixture(entry, initiallyOpen) {
    var model = entry.model;
    var card = el('details', 'pcr-fixture');
    card.open = !!initiallyOpen;

    var searchText = '';
    if (model) {
      searchText = model.home.name + ' ' + model.away.name + ' ' + (model.pick ? model.pick.label : '');
    }
    card.setAttribute('data-search', (searchText + ' ' + entry.time + ' ' + entry.competition + ' ' + entry.date).toLowerCase());

    var summary = el('summary', 'pcr-fixture-summary');
    summary.appendChild(el('span', 'pcr-fixture-time', entry.time));

    var teams = el('div', 'pcr-fixture-teams');
    var pair = el('div', 'pcr-fixture-team-pair');
    if (model) {
      pair.appendChild(el('span', 'pcr-fixture-team', model.home.name));
      pair.appendChild(el('span', 'pcr-fixture-vs', 'vs'));
      pair.appendChild(el('span', 'pcr-fixture-team', model.away.name));
    } else {
      pair.appendChild(el('span', 'pcr-fixture-team', 'Saved fixture'));
    }
    teams.appendChild(pair);
    var submeta = [entry.competition, entry.date].filter(Boolean).join(' · ');
    if (submeta) teams.appendChild(el('span', 'pcr-fixture-submeta', submeta));
    summary.appendChild(teams);

    if (model && model.pick) {
      var pick = el('span', 'pcr-fixture-pick', model.pick.label);
      pick.setAttribute('data-tone', model.pick.tone);
      if (model.pick.derived) {
        pick.setAttribute('data-derived', 'true');
        pick.setAttribute('title', 'Most likely outcome in this saved report');
      }
      summary.appendChild(pick);
      summary.appendChild(el('span', 'pcr-fixture-max', model.pick.pct !== null && model.pick.pct !== undefined ? model.pick.pct + '%' : ''));
    } else {
      summary.appendChild(el('span', 'pcr-fixture-pick', 'No pick'));
      summary.appendChild(el('span', 'pcr-fixture-max', ''));
    }

    card.appendChild(summary);

    if (model) {
      var body = el('div', 'pcr-fixture-body');
      if (model.outcomes.length) {
        body.appendChild(el('h4', 'pcr-fixture-section-title', 'Outcome probabilities'));
        body.appendChild(buildCompactOutcomes(model));
      }
      var forms = buildCompactForms(model);
      if (forms) {
        body.appendChild(el('h4', 'pcr-fixture-section-title', 'Team capabilities'));
        body.appendChild(forms);
      }
      var evidence = buildEvidence(model);
      if (evidence) body.appendChild(evidence);
      if (model.modelInputs && model.modelInputs.length && !model.evidenceMatches && !model.trainingExamples && !model.validationAccuracy) {
        var inputs = el('div', 'pcr-fixture-inputs');
        inputs.appendChild(el('span', 'pcr-evidence-label', 'Inputs used'));
        model.modelInputs.forEach(function (input) { inputs.appendChild(el('span', 'pcr-input-chip', input)); });
        body.appendChild(inputs);
      }
      if (!body.childNodes.length) {
        body.appendChild(el('p', 'pcr-fixture-empty', 'Stored data for this fixture has no probabilities.'));
      }
      card.appendChild(body);
    } else {
      card.appendChild(el('p', 'pcr-fixture-empty', entry.reason));
    }

    return card;
  }

  function buildTournamentSummary(data) {
    var withModel = data.entries.filter(function (entry) { return !!entry.model; }).length;
    var withPick = data.entries.filter(function (entry) { return entry.model && entry.model.pick && !entry.model.pick.derived; }).length;
    var parts = ['Saved tournament report: ' + data.entries.length + ' fixtures, ' + withModel + ' with prediction data.'];
    if (withPick) parts.push(withPick + ' fixtures have a model pick.');
    return parts.join(' ');
  }

  function renderTournament(output, rawHtml) {
    if (!output) return false;
    var data = parseTournament(rawHtml);
    if (!data.entries.length) return false;

    var report = el('article', 'pcr-report pcr-report--tournament');
    report.appendChild(el('p', 'pcr-sr', buildTournamentSummary(data)));

    var head = el('div', 'pcr-head');
    head.appendChild(el('p', 'pcr-eyebrow', 'Saved tournament report'));
    head.appendChild(el('h2', 'pcr-match', 'Tournament predictions'));
    head.appendChild(el('p', 'pcr-source', 'Prepared from the latest saved fixture snapshot. Open a match to inspect probabilities, team capabilities and model evidence.'));

    var withModel = data.entries.filter(function (entry) { return !!entry.model; }).length;
    var withPick = data.entries.filter(function (entry) { return entry.model && entry.model.pick && !entry.model.pick.derived; }).length;
    var meta = el('div', 'pcr-tournament-meta');
    meta.appendChild(el('span', 'pcr-tournament-chip', String(data.entries.length) + ' fixtures'));
    meta.appendChild(el('span', 'pcr-tournament-chip', String(withModel) + ' with prediction data'));
    meta.appendChild(el('span', 'pcr-tournament-chip', String(withPick) + ' model picks'));
    var toneCounts = { win: 0, draw: 0, unpredictable: 0 };
    data.entries.forEach(function (entry) {
      var modelPick = entry.model && entry.model.pick;
      if (!modelPick || modelPick.derived) return;
      if (toneCounts[modelPick.tone] !== undefined) toneCounts[modelPick.tone] += 1;
    });
    if (toneCounts.win) meta.appendChild(el('span', 'pcr-tournament-chip', String(toneCounts.win) + ' win picks'));
    if (toneCounts.draw) meta.appendChild(el('span', 'pcr-tournament-chip', String(toneCounts.draw) + ' draw picks'));
    if (toneCounts.unpredictable) meta.appendChild(el('span', 'pcr-tournament-chip', String(toneCounts.unpredictable) + ' no clear pick'));
    head.appendChild(meta);
    report.appendChild(head);

    if (data.notices.length) {
      var notice = el('div', 'pcr-tournament-notice');
      notice.appendChild(el('strong', null, 'Report note'));
      notice.appendChild(document.createTextNode(' ' + data.notices.slice(0, 3).join(' \u00b7 ')));
      report.appendChild(notice);
    }

    var toolbar = el('div', 'pcr-tournament-toolbar');
    var searchWrap = el('label', 'pcr-tournament-search-wrap');
    searchWrap.appendChild(el('span', 'pcr-sr', 'Filter saved fixtures'));
    var search = el('input', 'pcr-tournament-search');
    search.type = 'search';
    search.setAttribute('placeholder', 'Filter by team, pick, competition or date');
    search.setAttribute('autocomplete', 'off');
    searchWrap.appendChild(search);
    var count = el('span', 'pcr-tournament-count', String(data.entries.length) + ' fixtures');
    count.setAttribute('aria-live', 'polite');
    toolbar.appendChild(searchWrap);
    toolbar.appendChild(count);
    report.appendChild(toolbar);

    var pageSize = 10;
    var currentPage = 0;
    var pager = el('div', 'pcr-pager');
    var pageControls = el('div', 'pcr-page-controls');
    var previous = el('button', 'pcr-page-button', 'Previous');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous fixture page');
    var pageLabel = el('span', 'pcr-page-label', 'Page 1 of 1');
    pageLabel.setAttribute('aria-live', 'polite');
    var next = el('button', 'pcr-page-button', 'Next');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next fixture page');
    pageControls.appendChild(previous);
    pageControls.appendChild(pageLabel);
    pageControls.appendChild(next);
    var disclosureControls = el('div', 'pcr-disclosure-controls');
    var expandPage = el('button', 'pcr-page-button pcr-page-button--quiet', 'Expand this page');
    expandPage.type = 'button';
    var collapsePage = el('button', 'pcr-page-button pcr-page-button--quiet', 'Collapse this page');
    collapsePage.type = 'button';
    disclosureControls.appendChild(expandPage);
    disclosureControls.appendChild(collapsePage);
    pager.appendChild(pageControls);
    pager.appendChild(disclosureControls);
    report.appendChild(pager);

    var listWrap = el('div', 'pcr-tournament-list');
    var list = el('div', 'pcr-fixtures');
    data.entries.forEach(function (entry) { list.appendChild(buildFixture(entry, false)); });
    var cards = Array.prototype.slice.call(list.querySelectorAll('.pcr-fixture'));
    listWrap.appendChild(list);
    var empty = el('p', 'pcr-fixtures-empty', 'No saved fixtures match that filter.');
    empty.hidden = true;
    listWrap.appendChild(empty);
    report.appendChild(listWrap);

    report.appendChild(el('p', 'pcr-footnote', 'Predictions are estimates from saved match data, not guarantees.'));

    function refreshFixturePage(resetPage) {
      if (resetPage) currentPage = 0;
      var term = String(search.value || '').toLowerCase().trim();
      var filtered = cards.filter(function (card) {
        return !term || (card.getAttribute('data-search') || '').indexOf(term) !== -1;
      });
      var pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
      currentPage = Math.max(0, Math.min(currentPage, pageCount - 1));
      var start = currentPage * pageSize;
      var end = Math.min(filtered.length, start + pageSize);
      var pageCards = filtered.slice(start, end);
      var pageSet = new Set(pageCards);
      cards.forEach(function (card) { card.hidden = !pageSet.has(card); });
      count.textContent = filtered.length
        ? 'Showing ' + (start + 1) + '–' + end + ' of ' + filtered.length + ' fixtures'
        : '0 fixtures';
      pageLabel.textContent = 'Page ' + (currentPage + 1) + ' of ' + pageCount;
      previous.disabled = currentPage <= 0;
      next.disabled = currentPage >= pageCount - 1;
      empty.hidden = filtered.length > 0;
      expandPage.disabled = pageCards.length === 0;
      collapsePage.disabled = pageCards.length === 0;
    }

    previous.addEventListener('click', function () {
      if (currentPage > 0) { currentPage -= 1; refreshFixturePage(false); }
    });
    next.addEventListener('click', function () {
      currentPage += 1;
      refreshFixturePage(false);
    });
    expandPage.addEventListener('click', function () {
      cards.forEach(function (card) { if (!card.hidden) card.open = true; });
    });
    collapsePage.addEventListener('click', function () {
      cards.forEach(function (card) { if (!card.hidden) card.open = false; });
    });
    search.addEventListener('input', function () { refreshFixturePage(true); });
    refreshFixturePage(false);

    output.replaceChildren(report);
    markIn(output, report);
    output.classList.add('predictor-tournament-output');
    return true;
  }

  function renderMatchSearch(output, rawHtml, query) {
    if (!output) return false;
    var doc;
    try {
      doc = new DOMParser().parseFromString(String(rawHtml || ''), 'text/html');
    } catch (error) {
      return false;
    }

    var sourceCards = doc.querySelectorAll('.results');
    var records = [];
    for (var i = 0; i < sourceCards.length; i++) {
      var source = sourceCards[i];
      var competitionNode = source.querySelector('.match_head');
      var matchNode = source.querySelector('.match');
      var infoNode = source.querySelector('.match_info');
      var competition = competitionNode ? (competitionNode.textContent || '').replace(/\s+/g, ' ').trim() : '';
      var matchText = matchNode ? (matchNode.textContent || '').replace(/\s+/g, ' ').trim() : '';
      var dataText = infoNode ? (infoNode.textContent || '').replace(/\s+/g, ' ').trim() : '';
      if (!competition && !matchText && !dataText) continue;
      var teams = matchText.split(/\s+vs\.?\s+/i);
      records.push({
        competition: competition || 'Saved competition',
        home: teams.length === 2 ? teams[0].trim() : matchText || 'Saved match',
        away: teams.length === 2 ? teams[1].trim() : '',
        data: dataText,
        search: (competition + ' ' + matchText + ' ' + dataText).toLowerCase()
      });
    }

    var report = el('article', 'pcr-report pcr-report--match-search');
    report.appendChild(el('p', 'pcr-sr', 'Saved match search: ' + records.length + ' records for ' + String(query || '').trim() + '.'));
    var head = el('div', 'pcr-head');
    head.appendChild(el('p', 'pcr-eyebrow', 'Saved match search'));
    head.appendChild(el('h2', 'pcr-match-search-title', 'Match records'));
    head.appendChild(el('p', 'pcr-source', 'Matches are shown from the saved results archive.'));
    head.appendChild(el('span', 'pcr-tournament-chip', records.length + ' records'));
    report.appendChild(head);

    if (!records.length) {
      var rawMessage = doc.body ? (doc.body.textContent || '').replace(/\s+/g, ' ').trim() : '';
      report.appendChild(el('p', 'pcr-empty-text', rawMessage || 'No saved matches matched that search.'));
      output.replaceChildren(report);
      markIn(output, report);
      output.classList.add('predictor-search-output');
      return true;
    }

    var toolbar = el('div', 'pcr-tournament-toolbar');
    var searchWrap = el('label', 'pcr-tournament-search-wrap');
    searchWrap.appendChild(el('span', 'pcr-sr', 'Filter saved matches'));
    var search = el('input', 'pcr-tournament-search');
    search.type = 'search';
    search.setAttribute('placeholder', 'Filter by team, competition or saved data');
    search.setAttribute('autocomplete', 'off');
    searchWrap.appendChild(search);
    var count = el('span', 'pcr-tournament-count', records.length + ' records');
    count.setAttribute('aria-live', 'polite');
    toolbar.appendChild(searchWrap);
    toolbar.appendChild(count);
    report.appendChild(toolbar);

    var pageSize = 10;
    var page = 0;
    var pager = el('div', 'pcr-pager');
    var pageControls = el('div', 'pcr-page-controls');
    var previous = el('button', 'pcr-page-button', 'Previous');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous saved-match page');
    var pageLabel = el('span', 'pcr-page-label', 'Page 1 of 1');
    pageLabel.setAttribute('aria-live', 'polite');
    var next = el('button', 'pcr-page-button', 'Next');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next saved-match page');
    pageControls.appendChild(previous);
    pageControls.appendChild(pageLabel);
    pageControls.appendChild(next);
    pager.appendChild(pageControls);
    report.appendChild(pager);

    var list = el('div', 'pcr-match-search-results');
    var cards = records.map(function (record) {
      var card = el('article', 'pcr-match-search-card');
      card.setAttribute('data-search', record.search);
      card.appendChild(el('p', 'pcr-match-search-competition', record.competition));
      var match = el('h3', 'pcr-match-search-match');
      match.appendChild(el('span', null, record.home));
      if (record.away) {
        match.appendChild(el('span', 'pcr-fixture-vs', 'vs'));
        match.appendChild(el('span', null, record.away));
      }
      card.appendChild(match);
      if (record.data) {
        var details = el('div', 'pcr-match-search-data');
        var dataParts = record.data.split(/\s*\|\s*/).filter(Boolean);
        dataParts.forEach(function (value, index) {
          var item = el('div', 'pcr-match-search-metric');
          item.appendChild(el('span', 'pcr-evidence-label', 'Saved value ' + (index + 1)));
          item.appendChild(el('strong', null, value));
          details.appendChild(item);
        });
        card.appendChild(details);
      }
      list.appendChild(card);
      return card;
    });
    report.appendChild(list);
    var empty = el('p', 'pcr-fixtures-empty', 'No saved matches match that filter.');
    empty.hidden = true;
    report.appendChild(empty);

    function refreshPage(reset) {
      if (reset) page = 0;
      var term = String(search.value || '').toLowerCase().trim();
      var filtered = cards.filter(function (card) {
        return !term || (card.getAttribute('data-search') || '').indexOf(term) !== -1;
      });
      var pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.max(0, Math.min(page, pageCount - 1));
      var start = page * pageSize;
      var end = Math.min(filtered.length, start + pageSize);
      var pageCards = new Set(filtered.slice(start, end));
      cards.forEach(function (card) { card.hidden = !pageCards.has(card); });
      count.textContent = filtered.length ? 'Showing ' + (start + 1) + '–' + end + ' of ' + filtered.length + ' records' : '0 records';
      pageLabel.textContent = 'Page ' + (page + 1) + ' of ' + pageCount;
      previous.disabled = page <= 0;
      next.disabled = page >= pageCount - 1;
      empty.hidden = filtered.length > 0;
    }
    previous.addEventListener('click', function () { if (page > 0) { page -= 1; refreshPage(false); } });
    next.addEventListener('click', function () { page += 1; refreshPage(false); });
    search.addEventListener('input', function () { refreshPage(true); });
    refreshPage(false);

    output.replaceChildren(report);
    markIn(output, report);
    output.classList.add('predictor-search-output');
    return true;
  }

  window.PredictorView = {
    version: '1.2.0',
    parse: parse,
    parseTournament: parseTournament,
    render: render,
    renderEmpty: renderEmpty,
    renderError: renderError,
    renderFallback: renderFallback,
    renderTournament: renderTournament,
    renderMatchSearch: renderMatchSearch
  };
})();
