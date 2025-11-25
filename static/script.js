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
    newTemp = Math.max(controlMin, Math.min(controlMax, newTemp));
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

  updateGauge(parseInt(tempEl.textContent));
});