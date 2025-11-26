document.addEventListener('DOMContentLoaded', () => {
  const tempEl = document.getElementById('temperature');
  const gaugeFill = document.getElementById('gaugeFill');
  const decreaseBtn = document.getElementById('decreaseTemp');
  const increaseBtn = document.getElementById('increaseTemp');
  const powerBtn = document.getElementById('powerBtn');
  const chartSvgs = document.querySelectorAll('.chart-svg'); // whole SVGs
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById("toggleTheme");
  const root = document.documentElement;
  sidebar.classList.add('ready');

  // Load saved theme from localStorage, or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  toggleBtn.textContent = savedTheme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";

  toggleBtn.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    toggleBtn.textContent = newTheme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
  });

  const displayMin = 0;
  const displayMax = 40;
  const controlMin = 10;
  const controlMax = 30;
  const arcLength = 283;

  let powerOn = true;

  function updateGauge(temp) {
    const percent = (temp - displayMin) / (displayMax - displayMin);
    const fillLength = percent * arcLength;
    gaugeFill.setAttribute('stroke-dasharray', arcLength);
    gaugeFill.style.transition = 'stroke-dashoffset 0.6s ease-out, stroke 0.6s ease';
    gaugeFill.style.strokeDashoffset = arcLength - fillLength;

    if (temp > 23) {
      gaugeFill.setAttribute('stroke', 'url(#gaugeRed)');
    } else if (temp < 17) {
      gaugeFill.setAttribute('stroke', 'url(#gaugeBlue)');
    } else {
      gaugeFill.setAttribute('stroke', '#69c2e9');
    }
  }

  function setTemp(newTemp) {
    const clamped = Math.max(controlMin, Math.min(controlMax, newTemp));
    tempEl.style.opacity = 0;

    setTimeout(() => {
      tempEl.textContent = `${clamped}°`;
      tempEl.getBoundingClientRect();
      tempEl.style.opacity = 1;
      updateGauge(clamped);

      const useRed = clamped > 23;
      const useBlue = clamped < 17;
      chartSvgs.forEach(svg => {
        const path = svg.querySelector('path[id^="chart"]');
        if (!path) return;
        if (useRed) path.setAttribute('stroke', 'url(#chartRed)');
        else if (useBlue) path.setAttribute('stroke', 'url(#chartBlue)');
        else path.setAttribute('stroke', '#69c2e9');
      });
    }, 200);
  }

  if (decreaseBtn && tempEl) {
    decreaseBtn.addEventListener('click', () => {
      const current = parseInt(tempEl.textContent);
      setTemp(current - 1);
    });
  }

  if (increaseBtn && tempEl) {
    increaseBtn.addEventListener('click', () => {
      const current = parseInt(tempEl.textContent);
      setTemp(current + 1);
    });
  }

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      console.log('Hamburger clicked, sidebar toggled.');
    });
  }

  powerBtn.addEventListener('click', () => {
    powerOn = !powerOn;
    powerBtn.classList.toggle('grayscale', !powerOn);
    chartSvgs.forEach(svg => svg.classList.toggle('grayscale', !powerOn));
    document.querySelector('.gauge-svg')?.classList.toggle('grayscale', !powerOn);
  });

  setTemp(parseInt(tempEl.textContent));

  // Chart rendering function
   // Chart rendering function (shared by home + profile)
  function renderChart(id, data) {
    const chart = document.getElementById(id);
    if (!chart) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const chartHeight = 80;
    const stepX = 200 / (data.length - 1);

    const coords = data.map((val, i) => {
      const x = i * stepX;
      const y = chartHeight - ((val - min) / range) * chartHeight;
      return [x, y];
    });

    if (coords.length < 2) return;

    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length - 1; i++) {
      const [x0, y0] = coords[i - 1];
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      const xc2 = (x1 + x2) / 2;
      const yc2 = (y1 + y2) / 2;
      d += ` Q ${x1},${y1} ${xc2},${yc2}`;
    }
    const [xn, yn] = coords[coords.length - 1];
    d += ` T ${xn},${yn}`;

    chart.setAttribute('d', d);

    const length = chart.getTotalLength();
    chart.style.strokeDasharray = length;
    chart.style.strokeDashoffset = length;
    chart.style.transition = 'stroke-dashoffset 1s ease-out';
    chart.getBoundingClientRect();
    chart.style.strokeDashoffset = '0';
  }

  // --- HOME PAGE CHARTS ---
  renderChart('chart7', [2, 4, 3, 5, 6, 4, 3]);
  renderChart('chart24', [
    1, 1, 1, 1, 1, 2, 3, 4, 2, 3, 2, 2,
    2, 5, 4, 1, 3, 2, 1, 1, 1, 2, 1, 1
  ]);

  // --- PROFILE PAGE: Daily/Weekly toggle + dynamic chart ---
  (function initProfileData() {
    const profileRoot = document.getElementById('profileData');
    if (!profileRoot) return; // only run if profile section exists

    const dateButtonsEl = document.getElementById('dateButtonsProfile');
    const graphLabelsEl = document.getElementById('graphLabelsProfile');
    const profileChartId = 'profileChart';

    const dailyDates = ["23 Tuesday", "24 Wednesday", "25 Thursday", "26 Friday"];
    const weeklyRanges = ["Nov 1–7", "Nov 8–14", "Nov 15–21", "Nov 22–28"];

    const chartData = {
      "23 Tuesday": [10, 20, 30, 25],
      "24 Wednesday": [15, 25, 35, 20],
      "25 Thursday": [20, 30, 40, 30],
      "26 Friday": [12, 22, 32, 18],
      "Nov 1–7": [5, 15, 10, 8],
      "Nov 8–14": [10, 20, 15, 12],
      "Nov 15–21": [8, 18, 14, 10],
      "Nov 22–28": [12, 22, 18, 14]
    };

    let profileMode = 'daily';

    function setProfileMode(mode) {
      profileMode = mode;
      profileRoot.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === mode);
      });

      const labels = mode === 'daily' ? dailyDates : weeklyRanges;
      dateButtonsEl.innerHTML = '';
      labels.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'date-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => updateProfileChart(label));
        dateButtonsEl.appendChild(btn);
      });

      updateProfileChart(labels[0]);
    }

    function updateProfileChart(label) {
      const values = chartData[label];
      graphLabelsEl.innerHTML = '';

      const timeLabels = profileMode === 'daily'
        ? ['0:00', '6:00', '12:00', '18:00']
        : ['Mon', 'Wed', 'Fri', 'Sun'];

      timeLabels.forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        graphLabelsEl.appendChild(span);
      });

      renderChart(profileChartId, values);
    }

    // Hook up toggle buttons
    profileRoot.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setProfileMode(btn.textContent.toLowerCase());
      });
    });

    // Initialize
    setProfileMode('daily');
  })();
  });