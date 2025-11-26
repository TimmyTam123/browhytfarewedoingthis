document.addEventListener('DOMContentLoaded', () => {
  // DOM references
  const tempEl = document.getElementById('temperature');
  const gaugeFill = document.getElementById('gaugeFill');
  const decreaseBtn = document.getElementById('decreaseTemp');
  const increaseBtn = document.getElementById('increaseTemp');
  const powerBtn = document.getElementById('powerBtn');
  const chartSvgs = document.querySelectorAll('.chart-svg');
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById("toggleTheme");
  const root = document.documentElement;
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const dateButtonsContainer = document.getElementById('dateButtonsProfile');
  const chartId = 'profileChart';

  // Theme setup
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  if (toggleBtn) {
    toggleBtn.textContent = savedTheme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
    toggleBtn.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      toggleBtn.textContent = newTheme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
    });
  }

  // Gauge logic
  const displayMin = 0;
  const displayMax = 40;
  const controlMin = 10;
  const controlMax = 30;
  const arcLength = 283;
  let powerOn = true;

  function updateGauge(temp) {
    const percent = (temp - displayMin) / (displayMax - displayMin);
    const fillLength = percent * arcLength;
    gaugeFill?.setAttribute('stroke-dasharray', `${fillLength} ${arcLength - fillLength}`);

    if (temp > 23) {
      gaugeFill?.setAttribute('stroke', 'url(#gaugeRed)');
    } else if (temp < 17) {
      gaugeFill?.setAttribute('stroke', 'url(#gaugeBlue)');
    } else {
      gaugeFill?.setAttribute('stroke', '#69c2e9');
    }
  }

  function setTemp(newTemp) {
    const clamped = Math.max(controlMin, Math.min(controlMax, newTemp));
    if (!tempEl) return;

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

  decreaseBtn?.addEventListener('click', () => {
    const current = parseInt(tempEl?.textContent);
    setTemp(current - 1);
  });

  increaseBtn?.addEventListener('click', () => {
    const current = parseInt(tempEl?.textContent);
    setTemp(current + 1);
  });

  hamburger?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  powerBtn?.addEventListener('click', () => {
    powerOn = !powerOn;
    powerBtn.classList.toggle('grayscale', !powerOn);
    chartSvgs.forEach(svg => svg.classList.toggle('grayscale', !powerOn));
    document.querySelector('.gauge-svg')?.classList.toggle('grayscale', !powerOn);
  });

  // Home charts
  function renderChart(id, data) {
    const chart = document.getElementById(id);
    if (!chart || data.length < 2) return;

    const chartHeight = 80;
    const stepX = 200 / (data.length - 1);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const coords = data.map((val, i) => {
      const x = i * stepX;
      const y = chartHeight - ((val - min) / range) * chartHeight;
      return [x, y];
    });

    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      const xc = (x1 + x2) / 2;
      const yc = (y1 + y2) / 2;
      d += ` Q ${x1},${y1} ${xc},${yc}`;
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
    chart.classList.add('animated');
  }

  renderChart('chart7', [2, 4, 3, 5, 6, 4, 3]);
  renderChart('chart24', [1, 1, 1, 1, 1, 2, 3, 4, 2, 3, 2, 2, 2, 5, 4, 1, 3, 2, 1, 1, 1, 2, 1, 1]);

  // Profile chart
  const dailyData = {
    Mon: [2, 3, 4, 3, 5, 4, 3],
    Tue: [1, 2, 3, 2, 4, 3, 2],
    Wed: [3, 4, 5, 4, 6, 5, 4],
    Thu: [2, 2, 3, 3, 4, 4, 3],
    Fri: [1, 1, 2, 2, 3, 3, 2],
    Sat: [2, 3, 2, 3, 4, 3, 2],
    Sun: [3, 3, 4, 4, 5, 5, 4]
  };

  const weeklyData = {
    Week1: [10, 12, 14, 13, 15, 14, 13],
    Week2: [9, 11, 13, 12, 14, 13, 12],
    Week3: [8, 10, 12, 11, 13, 12, 11],
    Week4: [7, 9, 11, 10, 12, 11, 10]
  };

function renderProfileChart(id, data) {
  const chart = document.getElementById(id);
  if (!chart || data.length < 2) return;

  const chartHeight = 100;
  const chartWidth = 220;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = chartWidth / (data.length - 1);

  const coords = data.map((val, i) => {
    const x = i * stepX;
    const y = chartHeight - ((val - min) / range) * chartHeight;
    return [x, y];
  });

  let d = `M ${coords[0][0]},${coords[0][1]}`;
  for (let i = 1; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    const xc = (x1 + x2) / 2;
    const yc = (y1 + y2) / 2;
    d += ` Q ${x1},${y1} ${xc},${yc}`;
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
  function updateDateButtons(mode) {
  const dateButtonsContainer = document.getElementById('dateButtonsProfile');
  dateButtonsContainer.innerHTML = '';

  const dataSet = mode === 'Daily' ? dailyData : weeklyData;

  Object.entries(dataSet).forEach(([label, values]) => {
    const btn = document.createElement('button');
    btn.className = 'mini-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      renderProfileChart('profileChart', values);
    });
    dateButtonsContainer.appendChild(btn);
  });

  // Auto-render first dataset
  const firstKey = Object.keys(dataSet)[0];
  renderProfileChart('profileChart', dataSet[firstKey]);
}


  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateDateButtons(btn.textContent);
    });
  });

  // Initial render
  updateDateButtons('Daily');
});