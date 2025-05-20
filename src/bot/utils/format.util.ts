export const formatMilliseconds = (milliseconds: number) => {
  const minutes = Math.floor((milliseconds / (60 * 1000)) % 60);
  const seconds = Math.floor((milliseconds / 1000) % 60);

  return [
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
};
