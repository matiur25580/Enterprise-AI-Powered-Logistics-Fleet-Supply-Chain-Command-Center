// Demand forecasting: exponential smoothing + linear trend.
// Pure function (no DB) so it can be unit-tested.
function forecast(dailyCounts, daysAhead, alpha) {
  daysAhead = daysAhead || 7; alpha = alpha || 0.4;
  if (!Array.isArray(dailyCounts) || dailyCounts.length === 0)
    return Array(daysAhead).fill(0);
  var n = dailyCounts.length, sx = 0, sy = 0, sxx = 0, sxy = 0, i, y;
  for (i = 0; i < n; i++) { y = dailyCounts[i]; sx += i; sy += y; sxx += i*i; sxy += i*y; }
  var denom = n*sxx - sx*sx;
  var slope = denom === 0 ? 0 : (n*sxy - sx*sy) / denom;
  var level = dailyCounts[0];
  for (i = 0; i < n; i++) { level = alpha*dailyCounts[i] + (1-alpha)*level; }
  var out = [];
  for (var h = 1; h <= daysAhead; h++)
    out.push(Math.max(0, Math.round(level + slope*h)));
  return out;
}
module.exports = { forecast: forecast };
