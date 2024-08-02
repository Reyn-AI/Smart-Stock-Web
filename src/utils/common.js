export function formatCompactNumber(number) {
  if (number < 0) {
    return '-' + formatCompactNumber(-1 * number) // updated
  }
  if (number < 10000000) {
    return number
  } else if (number >= 1_000_0000 && number < 1_000_000_00) {
    return (number / 1_000_00000).toFixed(1).replace(/\.0$/, '') + '亿'
  }
}

export default {}
