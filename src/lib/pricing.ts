/** All monetary calculations and presentation use whole Indian rupees. */
export const roundRupees = (value: number) => Math.round(value);
export const formatINR = (value: number) => '₹' + roundRupees(value).toLocaleString('en-IN', { maximumFractionDigits: 0 });