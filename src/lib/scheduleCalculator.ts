export function calculateSchedule(frequency: string, timingAdvice?: string | null) {
  const lowerFreq = frequency.toLowerCase();
  const schedule = {
    morning: false,
    afternoon: false,
    evening: false,
    night: false
  };

  if (lowerFreq.includes('günde bir') || lowerFreq.includes('once daily')) {
    schedule.morning = true;
  } else if (lowerFreq.includes('günde iki') || lowerFreq.includes('twice daily')) {
    schedule.morning = true;
    schedule.evening = true;
  } else if (lowerFreq.includes('günde üç') || lowerFreq.includes('three times')) {
    schedule.morning = true;
    schedule.afternoon = true;
    schedule.evening = true;
  } else if (lowerFreq.includes('günde dört') || lowerFreq.includes('four times')) {
    schedule.morning = true;
    schedule.afternoon = true;
    schedule.evening = true;
    schedule.night = true;
  } else if (lowerFreq.includes('gece') || lowerFreq.includes('night')) {
    schedule.night = true;
  } else {
    // Default to morning if unknown
    schedule.morning = true;
  }

  // Adjust based on timing advice if possible
  if (timingAdvice) {
    const lowerAdvice = timingAdvice.toLowerCase();
    if (lowerAdvice.includes('gece yatmadan')) {
      schedule.morning = false;
      schedule.afternoon = false;
      schedule.evening = false;
      schedule.night = true;
    }
  }

  return schedule;
}
