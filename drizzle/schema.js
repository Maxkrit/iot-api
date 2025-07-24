const { sqliteTable, text } = require('drizzle-orm/sqlite-core');

const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  dob: text('dob'),
  gender: text('gender'),
});

module.exports = { students };
