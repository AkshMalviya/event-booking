export const debounceWithSearch = (
  fn: (...args: any[]) => void,
  delay: number,
) => {
  let timerId: NodeJS.Timeout | undefined;
  return function (...args: unknown[]) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};
