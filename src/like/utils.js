const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
};

const getTimeSince = (dateTime) => {
  let secondsDiff = Math.floor(
    (new Date() - new Date(dateTime).getTime()) / 1000,
  );

  const days = Math.floor(secondsDiff / 86400);
  secondsDiff -= days * 86400;

  const hours = Math.floor(secondsDiff / 3600) % 24;
  secondsDiff -= hours * 3600;

  const minutes = Math.floor(secondsDiff / 60) % 60;
  secondsDiff -= minutes * 60;

  const seconds = Math.floor(secondsDiff % 60);

  let timeSince = '';

  if (days > 0) {
    timeSince += `${days}d `;
  }

  if (hours > 0) {
    timeSince += `${hours}h `;
  }

  if (minutes > 0) {
    timeSince += `${minutes}m `;
  }

  if (seconds > 0) {
    timeSince += `${seconds}s`;
  }

  return timeSince;
};

const hexToRgb = (hex) => hex
  .replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (m, r, g, b) => `#${r + r + g + g + b + b}`,
  )
  .substring(1)
  .match(/.{2}/g)
  .map((x) => parseInt(x, 16));

const isElementInViewport = (el) => {
  const { innerHeight, innerWidth } = window;
  const { clientHeight, clientWidth } = document.documentElement;

  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (innerHeight || clientHeight)
    && rect.right <= (innerWidth || clientWidth)
  );
};

export {
  getRandomColor,
  getTimeSince,
  hexToRgb,
  isElementInViewport,
};
