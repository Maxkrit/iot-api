const express = require('express'); 
const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { students } = require('../drizzle/schema');
const { eq } = require('drizzle-orm/sql');

console.log('students:', students);

const app = express();
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

// ✅ Create students table if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    dob TEXT,
    gender TEXT
  );
`);

const API_KEY = '123456';
app.use(express.json());

// Middleware to check API key
app.use((req, res, next) => {
  const key = req.header('x-api-key');
  if (key !== API_KEY) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

// GET all students
app.get('/', (req, res) => {
  try {
    const result = db.select().from(students).all();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one student by id
app.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const student = db.select().from(students).where(eq(students.id, id)).get();
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add student
app.post('/', (req, res) => {
  try {
    db.insert(students).values(req.body).run();
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student by id
app.put('/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updated = db.update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .run();
    
    if (updated.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student by id
app.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const deleted = db.delete(students)
      .where(eq(students.id, id))
      .run();

    if (deleted.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Not found');
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
