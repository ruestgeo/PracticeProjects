
export const getValue = (target: EventTarget): string => {
  return (target as HTMLInputElement).value;
};

export const getNumValue = (target: EventTarget): number => {
  return parseInt(getValue(target));
};