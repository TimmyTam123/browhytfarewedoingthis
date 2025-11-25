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

  // Load saved theme from localStorage, or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  toggleBtn.textContent = savedTheme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";

  toggleBtn.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", newTheme);

    // Save to localStorage
    localStorage.setItem("theme", newTheme);

    // Update button text/icon
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

  // Always keep full dasharray
  gaugeFill.setAttribute('stroke-dasharray', arcLength);

  // Animate offset instead of dasharray
  gaugeFill.style.transition = 'stroke-dashoffset 0.6s ease-out, stroke 0.6s ease';
  gaugeFill.style.strokeDashoffset = arcLength - fillLength;

  // Color logic relative to 20°
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

  // Fade out
  tempEl.style.opacity = 0;

  setTimeout(() => {
    // Update text while invisible
    tempEl.textContent = `${clamped}°`;

    // Force a reflow so the browser registers the opacity change
    tempEl.getBoundingClientRect();

    // Fade back in
    tempEl.style.opacity = 1;

    // Update gauge arc and color
    updateGauge(clamped);

    // Switch charts’ gradient based on the same rule
    const useRed = clamped > 23;
    const useBlue = clamped < 17;
    chartSvgs.forEach(svg => {
      const path = svg.querySelector('path[id^="chart"]');
      if (!path) return;
      if (useRed) path.setAttribute('stroke', 'url(#chartRed)');
      else if (useBlue) path.setAttribute('stroke', 'url(#chartBlue)');
      else path.setAttribute('stroke', '#69c2e9');
    });
  }, 200); // wait 200ms before swapping text
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
  // Power toggle → grayscale entire SVGs + button
  powerBtn.addEventListener('click', () => {
    powerOn = !powerOn;
    powerBtn.classList.toggle('grayscale', !powerOn);
    chartSvgs.forEach(svg => svg.classList.toggle('grayscale', !powerOn));
    // Gauge SVG too
    document.querySelector('.gauge-svg')?.classList.toggle('grayscale', !powerOn);
  });

  // Initialize gauge and charts
  setTemp(parseInt(tempEl.textContent));

  // Your renderChart function + calls should remain as you had them, inside DOMContentLoaded.

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
    const xc1 = (x0 + x1) / 2;
    const yc1 = (y0 + y1) / 2;
    const xc2 = (x1 + x2) / 2;
    const yc2 = (y1 + y2) / 2;
    d += ` Q ${x1},${y1} ${xc2},${yc2}`;
  }

  const [xn, yn] = coords[coords.length - 1];
  d += ` T ${xn},${yn}`;

  chart.setAttribute('d', d);

  // 🔥 Animate the stroke drawing
  const length = chart.getTotalLength();
  chart.style.strokeDasharray = length;
  chart.style.strokeDashoffset = length;
  chart.style.transition = 'stroke-dashoffset 1s ease-out';
  chart.getBoundingClientRect(); // force reflow
  chart.style.strokeDashoffset = '0';


  chart.classList.add('animated');
  }

  // ✅ These must be inside DOMContentLoaded
  renderChart('chart7', [2, 4, 3, 5, 6, 4, 3]);
  renderChart('chart24', [
    1, 1, 1, 1, 1, 2, 3, 4, 2, 3, 2, 2,
    2, 5, 4, 1, 3, 2, 1, 1, 1, 2, 1, 1
  ]);

  setTemp(parseInt(tempEl.textContent));
});