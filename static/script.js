document.addEventListener('DOMContentLoaded', () => {
  const tempEl = document.getElementById('temperature');
  const gaugeArc = document.getElementById('gaugeArc');
  const decreaseBtn = document.getElementById('decreaseTemp');
  const increaseBtn = document.getElementById('increaseTemp');

  const minTemp = 0;
  const maxTemp = 40;

  function updateGauge(temp) {
    const percent = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
    gaugeArc.style.background = `conic-gradient(from 180deg, var(--accent) 0% ${percent}%, #2a3442 ${percent}% 100%)`;
  }

  function setTemp(newTemp) {
    newTemp = Math.max(minTemp, Math.min(maxTemp, newTemp));
    tempEl.textContent = `${newTemp}°`;
    updateGauge(newTemp);
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
  updateGauge(parseInt(tempEl.textContent));
});