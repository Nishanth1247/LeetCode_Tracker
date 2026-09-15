/**
 * Helper to calculate Monday-Sunday inactivity for a member.
 * Sources active solve dates from leetcode_submissions.
 */

function getMonToSunCurrentWeekRange(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  // Get day of week: 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const dayOfWeek = d.getDay();
  
  // Calculate distance to Monday
  // If today is Sunday (0), Monday was 6 days ago (-6)
  // If today is Monday (1), Monday is 0 days ago
  const distToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + distToMon);
  monday.setHours(0, 0, 0, 0);

  const mondayStr = monday.toISOString().split('T')[0];
  const todayStr = d.toISOString().split('T')[0];

  return { monday, referenceDate: d, mondayStr, todayStr };
}

function calculateWeeklyInactivity(solveDatesSet, referenceDate = new Date()) {
  const { monday, referenceDate: d, mondayStr } = getMonToSunCurrentWeekRange(referenceDate);
  
  // Iterate from Monday up to today (inclusive)
  let inactiveDays = 0;
  const daysBreakdown = []; // For detailed breakdowns e.g. Mon, Tue, etc.
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let curr = new Date(monday);
  while (curr <= d) {
    const dateStr = curr.toISOString().split('T')[0];
    const dayName = dayNames[curr.getDay()];
    const isActive = solveDatesSet.has(dateStr);
    
    if (!isActive) {
      inactiveDays++;
    }
    
    daysBreakdown.push({
      day: dayName,
      date: dateStr,
      active: isActive,
    });

    curr.setDate(curr.getDate() + 1);
  }

  return {
    inactiveDays,
    mondayStr,
    todayStr: d.toISOString().split('T')[0],
    daysBreakdown,
  };
}

module.exports = {
  getMonToSunCurrentWeekRange,
  calculateWeeklyInactivity,
};
