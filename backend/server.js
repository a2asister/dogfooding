const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const MINDMAPS_DIR = path.join(DATA_DIR, 'mindmaps');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MINDMAPS_DIR)) fs.mkdirSync(MINDMAPS_DIR, { recursive: true });

app.get('/api/mindmaps', (req, res) => {
  try {
    const files = fs.readdirSync(MINDMAPS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(MINDMAPS_DIR, file);
        const stat = fs.statSync(filePath);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return {
          id: file.replace('.json', ''),
          title: content.title || 'Untitled',
          createdAt: content.createdAt || stat.birthtime,
          updatedAt: content.updatedAt || stat.mtime,
          isPublic: content.isPublic || false,
          shareToken: content.shareToken || null
        };
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mindmaps' });
  }
});

app.get('/api/mindmaps/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(MINDMAPS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mindmap not found' });
    }
    
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mindmap' });
  }
});

app.post('/api/mindmaps', (req, res) => {
  try {
    const { title, nodes, edges, styles, history } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const mindmap = {
      id,
      title: title || 'Untitled Mind Map',
      nodes: nodes || [],
      edges: edges || [],
      styles: styles || {},
      history: history || [],
      createdAt: now,
      updatedAt: now,
      isPublic: false,
      shareToken: null
    };
    
    const filePath = path.join(MINDMAPS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(mindmap, null, 2));
    
    res.json(mindmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mindmap' });
  }
});

app.put('/api/mindmaps/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(MINDMAPS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mindmap not found' });
    }
    
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mindmap' });
  }
});

app.delete('/api/mindmaps/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(MINDMAPS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mindmap not found' });
    }
    
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mindmap' });
  }
});

app.post('/api/mindmaps/:id/share', (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    const filePath = path.join(MINDMAPS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mindmap not found' });
    }
    
    const mindmap = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    mindmap.isPublic = isPublic;
    mindmap.shareToken = isPublic ? uuidv4() : null;
    mindmap.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(filePath, JSON.stringify(mindmap, null, 2));
    res.json({ 
      success: true, 
      isPublic: mindmap.isPublic, 
      shareToken: mindmap.shareToken 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to share mindmap' });
  }
});

app.get('/api/share/:token', (req, res) => {
  try {
    const { token } = req.params;
    const files = fs.readdirSync(MINDMAPS_DIR)
      .filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(MINDMAPS_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (content.shareToken === token && content.isPublic) {
        return res.json(content);
      }
    }
    
    res.status(404).json({ error: 'Shared mindmap not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared mindmap' });
  }
});

app.listen(PORT, () => {
  console.log(`Mind Map Backend Server running on http://localhost:${PORT}`);
});
