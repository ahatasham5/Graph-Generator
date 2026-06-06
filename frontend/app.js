/* ─────────────────────────────────────────────
   GraphForge — app.js  (Vanilla JavaScript)
───────────────────────────────────────────── */

const API_BASE = 'http://127.0.0.1:8000';

const PRESET_COLORS = [
  '#6366f1','#a855f7','#ec4899','#f59e0b',
  '#22c55e','#06b6d4','#f97316','#ef4444',
  '#34d399','#38bdf8','#fb923c','#a78bfa',
];

// ── STATE ────────────────────────────────────
let tabs        = [];       // { id, name, color, rawText, parsedPoints, rowCount }
let activeTabId = null;
let chartInst   = null;
let renamingId  = null;
let tabCounter  = 0;
let graphTheme  = 'dark';
let currentGraphData = null;

// ── DOM ──────────────────────────────────────
const tabBar       = document.getElementById('tab-bar');
const tabPanels    = document.getElementById('tab-panels');
const btnAddTab    = document.getElementById('btn-add-tab');
const btnGenerate  = document.getElementById('btn-generate');
const btnReset     = document.getElementById('btn-reset');
const btnDlPng     = document.getElementById('btn-download-png');
const btnDlSvg     = document.getElementById('btn-download-svg');
const statusBar    = document.getElementById('status-bar');
const chartCanvas  = document.getElementById('main-chart');
const chartHolder  = document.getElementById('chart-placeholder');
const chartLoading = document.getElementById('chart-loading');
const statsPanel   = document.getElementById('stats-panel');
const chartTitle   = document.getElementById('chart-title-display');
const chartSub     = document.getElementById('chart-subtitle');

const renameOverlay = document.getElementById('rename-overlay');
const renameInput   = document.getElementById('rename-input');
const renameCancel  = document.getElementById('rename-cancel');
const renameConfirm = document.getElementById('rename-confirm');
const renameClose   = document.getElementById('rename-close');

const toastContainer = document.getElementById('toast-container');
const statusDot      = document.getElementById('status-dot');
const statusLabel    = document.getElementById('status-label');

// ── INIT ─────────────────────────────────────
function init() {
  addTab();
  bindGlobal();
  checkBackend();
}

function bindGlobal() {
  btnAddTab.addEventListener('click', addTab);
  btnGenerate.addEventListener('click', generateGraph);
  btnReset.addEventListener('click', resetAll);
  btnDlPng.addEventListener('click', () => downloadChart('png'));
  btnDlSvg.addEventListener('click', () => downloadChart('svg'));

  [renameCancel, renameClose].forEach(b => b.addEventListener('click', closeRenameModal));
  renameConfirm.addEventListener('click', confirmRename);
  renameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  confirmRename();
    if (e.key === 'Escape') closeRenameModal();
  });
  renameOverlay.addEventListener('click', e => {
    if (e.target === renameOverlay) closeRenameModal();
  });

  // Live graph title update
  document.getElementById('graph-title').addEventListener('input', () => {
    if (chartInst) chartTitle.textContent = document.getElementById('graph-title').value || 'My Graph';
  });

  // Theme toggle
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      graphTheme = e.target.dataset.theme;
      document.getElementById('chart-container').dataset.theme = graphTheme;
      if (currentGraphData) renderChart(currentGraphData);
    });
  });
}

// ── BACKEND HEALTH CHECK ──────────────────────
async function checkBackend() {
  try {
    const r = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      statusDot.className   = 'status-dot online';
      statusLabel.textContent = 'Backend online';
    } else throw new Error();
  } catch {
    statusDot.className   = 'status-dot offline';
    statusLabel.textContent = 'Backend offline';
    toast('Backend not reachable. Start start-backend.bat first.', 'error');
  }
}

// ── TAB MANAGEMENT ───────────────────────────
function addTab() {
  const id    = ++tabCounter;
  const color = PRESET_COLORS[(tabs.length) % PRESET_COLORS.length];
  const name  = `Series ${id}`;
  const tab   = { id, name, color, rawText: '', parsedPoints: [], rowCount: 0 };
  tabs.push(tab);
  renderTabBar();
  buildTabPanel(tab);
  switchTab(id);
}

function removeTab(id) {
  if (tabs.length === 1) { toast('At least one series is required.', 'error'); return; }
  tabs = tabs.filter(t => t.id !== id);
  document.getElementById(`tab-btn-${id}`)?.remove();
  document.getElementById(`tab-panel-${id}`)?.remove();
  if (activeTabId === id) switchTab(tabs[tabs.length - 1].id);
}

function switchTab(id) {
  activeTabId = id;
  document.querySelectorAll('.tab').forEach(el =>
    el.classList.toggle('active', +el.dataset.tabId === id));
  document.querySelectorAll('.tab-panel').forEach(el =>
    el.classList.toggle('active', +el.dataset.tabId === id));
}

function renderTabBar() {
  tabBar.innerHTML = '';
  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className     = 'tab';
    btn.id            = `tab-btn-${tab.id}`;
    btn.dataset.tabId = tab.id;
    btn.innerHTML = `
      <span class="tab-color-dot" style="background:${tab.color};box-shadow:0 0 5px ${tab.color}88"></span>
      <span class="tab-name">${esc(tab.name)}</span>
      <span class="tab-close" title="Remove">✕</span>`;
    btn.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) {
        e.stopPropagation(); removeTab(tab.id);
      } else { switchTab(tab.id); }
    });
    tabBar.appendChild(btn);
  });
}

function refreshTabButton(tab) {
  const btn = document.getElementById(`tab-btn-${tab.id}`);
  if (!btn) return;
  btn.querySelector('.tab-color-dot').style.background  = tab.color;
  btn.querySelector('.tab-color-dot').style.boxShadow   = `0 0 5px ${tab.color}88`;
  btn.querySelector('.tab-name').textContent = tab.name;
}

// ── BUILD TAB PANEL ──────────────────────────
function buildTabPanel(tab) {
  const panel = document.createElement('div');
  panel.className     = 'tab-panel';
  panel.id            = `tab-panel-${tab.id}`;
  panel.dataset.tabId = tab.id;

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="rename-btn" id="rename-btn-${tab.id}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 9L8.5 1.5 10.5 3.5 3 11 1 11.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
        Rename
      </button>
      <div class="color-picker-wrapper">
        <label>Color</label>
        <div class="color-swatch-row" id="swatches-${tab.id}">
          ${PRESET_COLORS.map(c => `
            <div class="color-swatch${c === tab.color ? ' selected' : ''}"
                 style="background:${c}" data-color="${c}" title="${c}"></div>
          `).join('')}
          <input type="color" class="custom-color" id="custom-color-${tab.id}"
                 value="${tab.color}" title="Custom color" />
        </div>
      </div>
    </div>

    <div class="data-header">
      <div>
        <div class="data-label-text">Paste Data from Spreadsheet (X, Y)</div>
        <div class="data-hint">Copy and paste directly from Excel or Google Sheets. Columns can be separated by tabs, commas, or spaces.</div>
      </div>
      <span id="rowcount-${tab.id}" class="row-count-badge">0 rows</span>
    </div>

    <textarea class="data-textarea" id="textarea-${tab.id}"
      placeholder="1&#9;10&#10;2&#9;35&#10;3&#9;22&#10;4&#9;60&#10;5&#9;45&#10;..."></textarea>

    <div class="parse-info" id="parse-info-${tab.id}"></div>`;

  tabPanels.appendChild(panel);

  // Rename
  panel.querySelector(`#rename-btn-${tab.id}`)
       .addEventListener('click', () => openRenameModal(tab.id));

  // Color swatches
  panel.querySelector(`#swatches-${tab.id}`)
       .addEventListener('click', e => {
         const sw = e.target.closest('.color-swatch');
         if (sw) setTabColor(tab.id, sw.dataset.color);
       });

  // Custom color picker
  panel.querySelector(`#custom-color-${tab.id}`)
       .addEventListener('input', e => setTabColor(tab.id, e.target.value));

  // Live row count
  panel.querySelector(`#textarea-${tab.id}`)
       .addEventListener('input', () => updateRowCount(tab.id));
}

function updateRowCount(tabId) {
  const tab  = getTab(tabId);
  const ta   = document.getElementById(`textarea-${tabId}`);
  tab.rawText = ta.value;
  const rows  = ta.value.split('\n').filter(l => l.trim()).length;
  tab.rowCount = rows;
  const badge = document.getElementById(`rowcount-${tabId}`);
  if (badge) badge.textContent = `${rows.toLocaleString()} rows`;
}

function setTabColor(tabId, color) {
  const tab = getTab(tabId);
  tab.color = color;
  document.getElementById(`swatches-${tabId}`)
    ?.querySelectorAll('.color-swatch')
    .forEach(s => s.classList.toggle('selected', s.dataset.color === color));
  const picker = document.getElementById(`custom-color-${tabId}`);
  if (picker) picker.value = color;
  refreshTabButton(tab);
  // live-update chart if visible
  if (chartInst) updateChartColor(tabId, color);
}

function updateChartColor(tabId, color) {
  const tab = getTab(tabId);
  const idx = tabs.indexOf(tab);
  if (idx < 0 || !chartInst) return;
  const ds = chartInst.data.datasets[idx];
  if (!ds) return;
  ds.borderColor     = color;
  ds.backgroundColor = color + '22';
  chartInst.update('none');
  // also refresh stats dot
  const dot = document.querySelector(`.stat-card:nth-child(${idx+1}) .stat-dot`);
  if (dot) { dot.style.background = color; dot.style.boxShadow = `0 0 6px ${color}88`; }
}

function getTab(id) { return tabs.find(t => t.id === id); }

// ── RENAME MODAL ─────────────────────────────
function openRenameModal(tabId) {
  renamingId = tabId;
  renameInput.value = getTab(tabId).name;
  renameOverlay.style.display = 'flex';
  setTimeout(() => { renameInput.focus(); renameInput.select(); }, 50);
}
function closeRenameModal() {
  renameOverlay.style.display = 'none';
  renamingId = null;
}
function confirmRename() {
  if (!renamingId) return;
  const val = renameInput.value.trim();
  if (!val) return;
  const tab = getTab(renamingId);
  tab.name = val;
  refreshTabButton(tab);
  // update chart legend live
  if (chartInst) {
    const idx = tabs.indexOf(tab);
    if (chartInst.data.datasets[idx]) {
      chartInst.data.datasets[idx].label = val;
      chartInst.update('none');
    }
  }
  closeRenameModal();
  toast(`Renamed to "${val}"`, 'success');
}

// ── STATUS / TOAST ────────────────────────────
function setStatus(msg, type = '') {
  statusBar.textContent = msg;
  statusBar.className   = `status-bar ${type}`;
}
function toast(msg, type = 'info', duration = 3500) {
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || ''}</span><span>${msg}</span>`;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 320);
  }, duration);
}

// ── GENERATE GRAPH ────────────────────────────
async function generateGraph() {
  setStatus('Parsing data…', 'loading');
  btnGenerate.disabled = true;
  chartHolder.style.display  = 'none';
  chartCanvas.style.display  = 'none';
  chartLoading.style.display = 'flex';

  try {
    // 1. Parse each tab's text
    const parseResults = await Promise.all(tabs.map(async tab => {
      const text = (document.getElementById(`textarea-${tab.id}`)?.value || '').trim();
      if (!text) return { tabId: tab.id, points: [], errors: [], parsed: 0 };
      const res = await fetch(`${API_BASE}/api/parse-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text }),
      });
      if (!res.ok) throw new Error(`Parse failed for "${tab.name}"`);
      const data = await res.json();
      return { tabId: tab.id, points: data.points, errors: data.errors, parsed: data.parsed_count };
    }));

    // Update parse-info badges
    parseResults.forEach(r => {
      const el  = document.getElementById(`parse-info-${r.tabId}`);
      const tab = getTab(r.tabId);
      if (!el || !tab) return;
      tab.parsedPoints = r.points;
      const ok   = r.parsed || 0;
      const errs = r.errors?.length || 0;
      let html = ok   > 0  ? `<span class="badge badge-success">✓ ${ok.toLocaleString()} points</span>` : '';
      html    += errs > 0  ? `<span class="badge badge-warn">⚠ ${errs} skipped</span>` : '';
      if (!ok && !errs)      html = `<span class="badge badge-warn">No data entered</span>`;
      el.innerHTML = html;
    });

    // 2. Build request payload
    const lines = tabs
      .map(tab => ({ name: tab.name, color: tab.color, data: tab.parsedPoints || [] }))
      .filter(l => l.data.length > 0);

    if (lines.length === 0) {
      chartLoading.style.display = 'none';
      chartHolder.style.display  = 'flex';
      setStatus('No valid data found. Check your input.', 'error');
      btnGenerate.disabled = false;
      return;
    }

    const graphTitle = document.getElementById('graph-title').value || 'My Graph';
    const xLabel     = document.getElementById('x-label').value   || 'X';
    const yLabel     = document.getElementById('y-label').value   || 'Y';

    setStatus('Rendering chart…', 'loading');

    const graphRes = await fetch(`${API_BASE}/api/generate-graph-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, graph_title: graphTitle, x_label: xLabel, y_label: yLabel }),
    });
    if (!graphRes.ok) throw new Error('Graph generation failed');
    const graphData = await graphRes.json();

    chartLoading.style.display = 'none';
    currentGraphData = graphData;
    renderChart(graphData);
    renderStats(graphData);
    setStatus(
      `✓ ${graphData.total_lines} line(s) · ${graphData.total_points.toLocaleString()} total points`,
      'success'
    );
    toast(`Graph generated: ${graphData.total_lines} series`, 'success');

  } catch (err) {
    console.error(err);
    chartLoading.style.display = 'none';
    chartHolder.style.display  = 'flex';
    setStatus('Error: ' + (err.message || 'Is the backend running?'), 'error');
    toast(err.message || 'Backend error', 'error');
  } finally {
    btnGenerate.disabled = false;
  }
}

// ── RENDER CHART ──────────────────────────────
function renderChart(graphData) {
  chartTitle.textContent       = graphData.graph_title;
  chartSub.textContent         = `${graphData.total_lines} series · ${graphData.total_points.toLocaleString()} points`;
  chartSub.style.display       = 'block';
  chartCanvas.style.display    = 'block';
  btnDlPng.style.display       = 'flex';
  btnDlSvg.style.display       = 'flex';

  if (chartInst) { chartInst.destroy(); chartInst = null; }

  const xLabel = document.getElementById('x-label').value || 'X';
  const yLabel = document.getElementById('y-label').value || 'Y';

  const isLight = graphTheme === 'light';
  const textColor = isLight ? '#475569' : '#a5a8c8';
  const axisColor = isLight ? '#64748b' : '#626690';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
  const tooltipBg = isLight ? '#ffffff' : '#1a1d3a';
  const tooltipText = isLight ? '#334155' : '#a5a8c8';
  const tooltipTitle = isLight ? '#0f172a' : '#eef0ff';
  const tooltipBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(99,102,241,0.35)';

  const datasets = graphData.datasets.map(ds => ({
    label:            ds.label,
    data:             ds.points.map(p => ({ x: p.x, y: p.y })),
    borderColor:      ds.color,
    backgroundColor:  ds.color + '20',
    borderWidth:      2.5,
    pointRadius:      ds.point_count > 800 ? 0 : (ds.point_count > 200 ? 2 : 3.5),
    pointHoverRadius: 6,
    tension:          0.3,
    fill:             false,
    borderCapStyle:   'round',
    borderJoinStyle:  'round',
  }));

  const bgColorPlugin = {
    id: 'bgColorPlugin',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = isLight ? '#ffffff' : '#14162e';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };

  chartInst = new Chart(chartCanvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 700, easing: 'easeInOutQuart' },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            font: { family: 'Inter', size: 12 },
            usePointStyle: true,
            pointStyleWidth: 10,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          borderColor:     tooltipBorder,
          borderWidth: 1,
          titleColor: tooltipTitle,
          bodyColor:  tooltipText,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: (${ctx.parsed.x}, ${ctx.parsed.y})`,
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: xLabel, color: axisColor, font: { family: 'Inter', size: 11 } },
          grid:  { color: gridColor },
          ticks: { color: axisColor, font: { family: 'Inter', size: 11 } },
        },
        y: {
          title: { display: true, text: yLabel, color: axisColor, font: { family: 'Inter', size: 11 } },
          grid:  { color: gridColor },
          ticks: { color: axisColor, font: { family: 'Inter', size: 11 } },
        },
      },
    },
    plugins: [bgColorPlugin]
  });
}

// ── STATS PANEL ───────────────────────────────
function renderStats(graphData) {
  statsPanel.style.display = 'flex';
  statsPanel.innerHTML = graphData.datasets.map(ds => `
    <div class="stat-card">
      <div class="stat-dot" style="background:${ds.color};box-shadow:0 0 6px ${ds.color}88"></div>
      <div class="stat-info">
        <div class="stat-name" title="${esc(ds.label)}">${esc(ds.label)}</div>
        <div class="stat-pts">${ds.point_count.toLocaleString()} pts · X[${ds.x_min}→${ds.x_max}] · Y[${ds.y_min}→${ds.y_max}]</div>
      </div>
    </div>`).join('');
}

// ── DOWNLOAD ──────────────────────────────────
function downloadChart(format) {
  if (!chartInst) return;
  const name = (document.getElementById('graph-title').value || 'graph').replace(/\s+/g, '_');
  if (format === 'png') {
    const url  = chartCanvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = url; link.download = `${name}.png`; link.click();
  } else if (format === 'svg') {
    // Fallback: download as PNG with svg extension note
    toast('SVG export: use PNG for now (SVG needs server-side render)', 'info');
  }
}

// ── RESET ─────────────────────────────────────
function resetAll() {
  if (!confirm('Clear all data and reset? This cannot be undone.')) return;
  tabs = []; tabCounter = 0; activeTabId = null;
  tabBar.innerHTML = ''; tabPanels.innerHTML = '';
  if (chartInst) { chartInst.destroy(); chartInst = null; }
  chartCanvas.style.display    = 'none';
  chartLoading.style.display   = 'none';
  chartHolder.style.display    = 'flex';
  btnDlPng.style.display       = 'none';
  btnDlSvg.style.display       = 'none';
  statsPanel.style.display     = 'none';
  chartTitle.textContent       = 'Graph Preview';
  chartSub.style.display       = 'none';
  document.getElementById('graph-title').value = 'My Graph';
  document.getElementById('x-label').value     = 'X Axis';
  document.getElementById('y-label').value     = 'Y Axis';
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === 'dark'));
  graphTheme = 'dark';
  document.getElementById('chart-container').dataset.theme = 'dark';
  currentGraphData = null;
  setStatus('');
  addTab();
  toast('Reset complete', 'info');
}

// ── UTILS ─────────────────────────────────────
function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── START ─────────────────────────────────────
init();
