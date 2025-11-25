document.addEventListener('DOMContentLoaded', () => {
  const tempEl = document.getElementById('temperature');
  const gaugeFill = document.getElementById('gaugeFill');
  const decreaseBtn = document.getElementById('decreaseTemp');
  const increaseBtn = document.getElementById('increaseTemp');

  const minTemp = 0;
  const maxTemp = 40;
  const arcLength = 565; // Approximate length of semicircle path

  function updateGauge(temp) {
    const percent = (temp - minTemp) / (maxTemp - minTemp);
    const fillLength = percent * arcLength;
    gaugeFill.setAttribute('stroke-dasharray', `${fillLength} ${arcLength - fillLength}`);
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

  // Initialize
  updateGauge(parseInt(tempEl.textContent));
});