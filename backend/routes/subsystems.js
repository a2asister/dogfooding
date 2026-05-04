const express = require('express');
const { readData } = require('../utils/fileStorage');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const subsystems = readData('subsystems.json');
    const userSubsystems = req.user.subsystems || [];
    
    const accessibleSubsystems = subsystems.filter(
      subsystem => userSubsystems.includes(subsystem.id)
    );

    res.json({
      success: true,
      data: accessibleSubsystems
    });
  } catch (error) {
    console.error('Get subsystems error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/all', authenticateToken, (req, res) => {
  try {
    const subsystems = readData('subsystems.json');
    res.json({
      success: true,
      data: subsystems
    });
  } catch (error) {
    console.error('Get all subsystems error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const subsystems = readData('subsystems.json');
    const subsystem = subsystems.find(s => s.id === id);

    if (!subsystem) {
      return res.status(404).json({ success: false, message: '子系统不存在' });
    }

    const userSubsystems = req.user.subsystems || [];
    if (!userSubsystems.includes(subsystem.id)) {
      return res.status(403).json({ 
        success: false, 
        message: '没有权限访问该子系统' 
      });
    }

    res.json({
      success: true,
      data: subsystem
    });
  } catch (error) {
    console.error('Get subsystem error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
