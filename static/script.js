document.addEventListener('DOMContentLoaded', () => {
  const tempEl = document.getElementById('temperature');
  const gaugeFill = document.getElementById('gaugeFill');
  const decreaseBtn = document.getElementById('decreaseTemp');
  const increaseBtn = document.getElementById('increaseTemp');

  const displayMin = 0;
  const displayMax = 40;
  const controlMin = 10;
  const controlMax = 30;
  const arcLength = 283;

  function updateGauge(temp) {
    const percent = (temp - displayMin) / (displayMax - displayMin);
    const fillLength = percent * arcLength;
    gaugeFill.setAttribute('stroke-dasharray', `${fillLength} ${arcLength - fillLength}`);
  }

  function setTemp(newTemp) {
    const clamped = Math.max(controlMin, Math.min(controlMax, newTemp));
    tempEl.textContent = `${clamped}°`;
    updateGauge(clamped);
  }

  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(tempEl.textContent);
    setTemp(current - 1);
  });

  increaseBtn.addEventListener('click', () => {
    const current = parseInt(tempEl.textContent);
    setTemp(current + 1);
  });

  // Initialize gauge
  setTemp(parseInt(tempEl.textContent));

  // Chart rendering
 function renderChart(id, data) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const chartHeight = 80;
  const stepX = 200 / (data.length - 1);

  const points = data.map((val, i) => {
    const y = chartHeight - ((val - min) / range) * chartHeight;
    return `${i * stepX},${y}`;
  }).join(' ');

  const chart = document.getElementById(id);
  if (chart) chart.setAttribute('points', points);
}
renderChart('chart7', [2, 4, 3, 5, 6, 4, 3]);
  renderChart('chart24', [
    1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2,
    1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2
  ]);
});