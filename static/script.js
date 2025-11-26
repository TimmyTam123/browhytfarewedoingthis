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

  // Room selector
  const rooms = ["Living Room", "Bedroom", "Kitchen"];
  let currentIndex = 0;

  const prevRoomBtn = document.getElementById("prevRoom");
  const nextRoomBtn = document.getElementById("nextRoom");
  const roomNameEl = document.getElementById("roomName");

  if (prevRoomBtn && nextRoomBtn && roomNameEl) {
    prevRoomBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + rooms.length) % rooms.length;
      roomNameEl.textContent = rooms[currentIndex];
    });

    nextRoomBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % rooms.length;
      roomNameEl.textContent = rooms[currentIndex];
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

  // Profile chart data - Daily data has 24 hours (0-23), each representing kWh used per hour
  const dailyData = {
    Mon: [0.3, 0.2, 0.2, 0.1, 0.2, 0.4, 0.8, 1.2, 1.5, 1.3, 1.1, 1.2, 1.4, 1.6, 1.5, 1.8, 2.1, 2.5, 2.8, 2.3, 1.9, 1.4, 0.9, 0.5],
    Tue: [0.2, 0.2, 0.1, 0.1, 0.3, 0.5, 0.9, 1.1, 1.4, 1.2, 1.0, 1.1, 1.3, 1.5, 1.4, 1.7, 2.0, 2.4, 2.6, 2.1, 1.7, 1.2, 0.8, 0.4],
    Wed: [0.3, 0.2, 0.2, 0.2, 0.3, 0.6, 1.0, 1.3, 1.6, 1.5, 1.3, 1.4, 1.6, 1.8, 1.7, 2.0, 2.3, 2.7, 3.0, 2.5, 2.1, 1.6, 1.0, 0.6],
    Thu: [0.2, 0.1, 0.1, 0.1, 0.2, 0.4, 0.7, 1.0, 1.3, 1.1, 0.9, 1.0, 1.2, 1.4, 1.3, 1.6, 1.9, 2.2, 2.5, 2.0, 1.6, 1.1, 0.7, 0.4],
    Fri: [0.3, 0.2, 0.2, 0.1, 0.3, 0.5, 0.8, 1.2, 1.5, 1.4, 1.2, 1.3, 1.5, 1.7, 1.6, 1.9, 2.2, 2.6, 2.9, 3.2, 2.8, 2.3, 1.5, 0.8],
    Sat: [0.4, 0.3, 0.2, 0.2, 0.2, 0.3, 0.5, 0.9, 1.4, 1.6, 1.8, 2.0, 2.2, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1, 2.9, 2.5, 2.0, 1.3, 0.7],
    Sun: [0.5, 0.3, 0.3, 0.2, 0.2, 0.3, 0.6, 1.0, 1.5, 1.7, 1.9, 2.1, 2.3, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 2.8, 2.4, 1.8, 1.2, 0.6]
  };

  // Weekly data has 7 days (Mon-Sun), each representing total kWh used per day
  const weeklyData = {
    'Week 1': [28.5, 26.3, 32.1, 24.8, 30.9, 35.2, 36.7],  // Mon-Sun
    'Week 2': [27.8, 25.6, 31.4, 23.9, 29.8, 34.5, 35.9],  // Mon-Sun
    'Week 3': [26.9, 24.8, 30.2, 23.1, 28.7, 33.6, 34.8],  // Mon-Sun
    'Week 4': [25.7, 23.5, 29.1, 22.3, 27.5, 32.4, 33.6]   // Mon-Sun
  };

  // Profile chart rendering function
  function renderProfileChart(id, data) {
    const chart = document.getElementById(id);
    if (!chart || data.length < 2) {
      console.log('Chart element not found or insufficient data');
      return;
    }

    const chartHeight = 80; // Reduced to leave padding
    const chartWidth = 200; // Reduced to leave padding
    const padding = 10;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = chartWidth / (data.length - 1);

    const coords = data.map((val, i) => {
      const x = padding + (i * stepX);
      const y = padding + (chartHeight - ((val - min) / range) * chartHeight);
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
    
    // Force visibility
    chart.style.opacity = '1';
    chart.setAttribute('stroke', '#69c2e9');
    chart.setAttribute('stroke-width', '2');
    chart.setAttribute('fill', 'none');

    const length = chart.getTotalLength();
    chart.style.strokeDasharray = length;
    chart.style.strokeDashoffset = length;
    
    // Force reflow
    void chart.getBoundingClientRect();
    
    // Animate in
    setTimeout(() => {
      chart.style.transition = 'stroke-dashoffset 1s ease-out';
      chart.style.strokeDashoffset = '0';
    }, 10);
    
    console.log('Chart rendered:', d);
  }

  // Update date buttons based on mode (Daily or Weekly)
  function updateDateButtons(mode) {
    if (!dateButtonsContainer) return;
    
    dateButtonsContainer.innerHTML = '';

    const dataSet = mode === 'Daily' ? dailyData : weeklyData;

    Object.entries(dataSet).forEach(([label, values], index) => {
      const btn = document.createElement('button');
      btn.className = 'mini-btn';
      btn.textContent = label;
      
      // Add active class to first button
      if (index === 0) {
        btn.classList.add('active');
      }
      
      btn.addEventListener('click', () => {
        // Remove active class from all mini buttons
        dateButtonsContainer.querySelectorAll('.mini-btn').forEach(b => {
          b.classList.remove('active');
        });
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Render the chart with selected data
        renderProfileChart('profileChart', values);
      });
      
      dateButtonsContainer.appendChild(btn);
    });

    // Auto-render first dataset
    const firstKey = Object.keys(dataSet)[0];
    renderProfileChart('profileChart', dataSet[firstKey]);
  }

  // Toggle between Daily and Weekly
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateDateButtons(btn.textContent);
    });
  });

  // Initial render (Daily mode by default)
  updateDateButtons('Daily');
});