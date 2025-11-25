
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
  const chart = document.getElementById(id);
console.log("Chart found:", chart);


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

  // Final segment to last point
  const [xn, yn] = coords[coords.length - 1];
  d += ` T ${xn},${yn}`;

  chart.setAttribute('d', d);

console.log("Path data for", id, ":", d);
}
renderChart('chart7', [2, 4, 3, 5, 6, 4, 3]);
  renderChart('chart24', [
    1, 1, 1, 1, 1, 2, 3, 4, 2, 3, 2, 2,
    2, 5, 4, 1, 3, 2, 1, 1, 1, 2, 1, 1
  ]);

});