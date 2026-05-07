const db = require('../config/db');

/**
 * Generates 1-hour slots for a lab for the next N days.
 * Skips slots that already exist (UNIQUE constraint handles dupes).
 * Returns the count of slots created.
 */
const generateSlotsForLab = async (lab, daysAhead = 7) => {
  const slots = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // Parse lab operating hours
    const [startHour] = lab.operating_start_time.split(':').map(Number);
    const [endHour] = lab.operating_end_time.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00:00`;
      slots.push([lab.id, dateStr, startTime, endTime]);
    }
  }

  if (slots.length === 0) return 0;

  // Bulk insert with INSERT IGNORE — duplicate slots silently skipped
  const [result] = await db.query(
    'INSERT IGNORE INTO slots (lab_id, date, start_time, end_time) VALUES ?',
    [slots]
  );

  return result.affectedRows;
};

module.exports = { generateSlotsForLab };