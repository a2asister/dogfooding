const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3002;
const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

app.use(cors());
app.use(express.json());

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { notes: [], tags: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

app.get('/api/notes', (req, res) => {
  const { keyword, tag, archived, startDate, endDate } = req.query;
  let data = readData();
  let notes = data.notes;

  if (keyword) {
    const kw = keyword.toLowerCase();
    notes = notes.filter(note => 
      note.content.toLowerCase().includes(kw) ||
      (note.source && note.source.toLowerCase().includes(kw))
    );
  }

  if (tag) {
    notes = notes.filter(note => note.tags.includes(tag));
  }

  if (archived !== undefined) {
    const isArchived = archived === 'true';
    notes = notes.filter(note => note.archived === isArchived);
  }

  if (startDate) {
    notes = notes.filter(note => new Date(note.createdAt) >= new Date(startDate));
  }

  if (endDate) {
    notes = notes.filter(note => new Date(note.createdAt) <= new Date(endDate));
  }

  notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({ notes, tags: data.tags });
});

app.post('/api/notes', (req, res) => {
  const data = readData();
  const now = new Date().toISOString();
  const newNote = {
    id: uuidv4(),
    content: req.body.content,
    tags: req.body.tags || [],
    source: req.body.source || '原创',
    createdAt: now,
    updatedAt: now,
    archived: false
  };

  data.notes.push(newNote);

  req.body.tags?.forEach(tag => {
    if (!data.tags.includes(tag)) {
      data.tags.push(tag);
    }
  });

  if (writeData(data)) {
    res.status(201).json(newNote);
  } else {
    res.status(500).json({ error: 'Failed to save note' });
  }
});

app.put('/api/notes/:id', (req, res) => {
  const data = readData();
  const noteIndex = data.notes.findIndex(n => n.id === req.params.id);

  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const updatedNote = {
    ...data.notes[noteIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  data.notes[noteIndex] = updatedNote;

  req.body.tags?.forEach(tag => {
    if (!data.tags.includes(tag)) {
      data.tags.push(tag);
    }
  });

  if (writeData(data)) {
    res.json(updatedNote);
  } else {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const data = readData();
  const initialLength = data.notes.length;
  data.notes = data.notes.filter(n => n.id !== req.params.id);

  if (data.notes.length === initialLength) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (writeData(data)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.post('/api/notes/batch-delete', (req, res) => {
  const data = readData();
  const idsToDelete = req.body.ids || [];
  data.notes = data.notes.filter(n => !idsToDelete.includes(n.id));

  if (writeData(data)) {
    res.json({ success: true, deleted: idsToDelete.length });
  } else {
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});

app.post('/api/notes/batch-archive', (req, res) => {
  const data = readData();
  const idsToArchive = req.body.ids || [];
  const archive = req.body.archive !== false;

  data.notes.forEach(note => {
    if (idsToArchive.includes(note.id)) {
      note.archived = archive;
      note.updatedAt = new Date().toISOString();
    }
  });

  if (writeData(data)) {
    res.json({ success: true, updated: idsToArchive.length });
  } else {
    res.status(500).json({ error: 'Failed to archive notes' });
  }
});

app.get('/api/tags', (req, res) => {
  const data = readData();
  res.json(data.tags);
});

app.post('/api/tags', (req, res) => {
  const data = readData();
  const newTag = req.body.tag;

  if (!newTag || data.tags.includes(newTag)) {
    return res.status(400).json({ error: 'Tag already exists or is invalid' });
  }

  data.tags.push(newTag);

  if (writeData(data)) {
    res.status(201).json({ tag: newTag });
  } else {
    res.status(500).json({ error: 'Failed to save tag' });
  }
});

app.delete('/api/tags/:tag', (req, res) => {
  const data = readData();
  const tagToDelete = decodeURIComponent(req.params.tag);
  const initialLength = data.tags.length;
  
  data.tags = data.tags.filter(t => t !== tagToDelete);
  data.notes.forEach(note => {
    note.tags = note.tags.filter(t => t !== tagToDelete);
  });

  if (data.tags.length === initialLength) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  if (writeData(data)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
