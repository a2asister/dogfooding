import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character, PracticeRecord, ErrorCharacter, Note } from './types';
import { characterApi, practiceApi, noteApi } from './services/api';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isSeparated, setIsSeparated] = useState(false);
  const [showStrokes, setShowStrokes] = useState(false);
  const [activeRadicalIndex, setActiveRadicalIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'practice' | 'notes' | 'errors'>('practice');

  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
  const [errorCharacters, setErrorCharacters] = useState<ErrorCharacter[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [practiceStart, setPracticeStart] = useState<number | null>(null);
  const [practiceRadicals, setPracticeRadicals] = useState<string[]>([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceMessage, setPracticeMessage] = useState('');
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [isPlayingStrokes, setIsPlayingStrokes] = useState(false);

  const loadCharacters = useCallback(async () => {
    try {
      const data = await characterApi.getAll();
      setCharacters(data);
      if (data.length > 0 && !selectedCharacter) {
        setSelectedCharacter(data[0]);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCharacter]);

  const loadPracticeRecords = useCallback(async () => {
    try {
      const data = await practiceApi.getRecords();
      setPracticeRecords(data);
    } catch (error) {
      console.error('Failed to load practice records:', error);
    }
  }, []);

  const loadErrorCharacters = useCallback(async () => {
    try {
      const data = await practiceApi.getErrorCharacters();
      setErrorCharacters(data);
    } catch (error) {
      console.error('Failed to load error characters:', error);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    if (!selectedCharacter) return;
    try {
      const data = await noteApi.getByCharacterId(selectedCharacter.id);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, [selectedCharacter]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  useEffect(() => {
    if (selectedCharacter) {
      loadNotes();
    }
  }, [selectedCharacter, loadNotes]);

  useEffect(() => {
    if (activeTab === 'practice') {
      loadPracticeRecords();
    } else if (activeTab === 'errors') {
      loadErrorCharacters();
    }
  }, [activeTab, loadPracticeRecords, loadErrorCharacters]);

  const handleSeparate = () => {
    setIsSeparated(!isSeparated);
    if (!isSeparated) {
      setShowStrokes(false);
    }
  };

  const handlePlayStrokes = () => {
    if (!selectedCharacter || isPlayingStrokes) return;

    setShowStrokes(true);
    setIsSeparated(true);
    setIsPlayingStrokes(true);
    setStrokeIndex(0);
    setPracticeMessage('笔画回放中...');

    const totalRadicals = selectedCharacter.radicals.length;
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex <= totalRadicals) {
        setStrokeIndex(currentIndex);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsPlayingStrokes(false);
          setShowStrokes(false);
          setIsSeparated(false);
          setStrokeIndex(0);
          setPracticeMessage('笔画回放完成！');
          setTimeout(() => {
            setPracticeMessage('');
          }, 1500);
        }, 500);
      }
    }, 600);
  };

  const handleRadicalClick = (index: number) => {
    setActiveRadicalIndex(activeRadicalIndex === index ? null : index);
  };

  const startPractice = () => {
    if (!selectedCharacter) return;
    setIsPracticeMode(true);
    setIsSeparated(true);
    setPracticeRadicals([]);
    setPracticeMessage('请按正确顺序点击部首');
    setPracticeStart(Date.now());
  };

  const handlePracticeRadicalClick = (radicalName: string, index: number) => {
    if (!isPracticeMode || !selectedCharacter) return;

    const expectedIndex = practiceRadicals.length;
    const isCorrect = index === expectedIndex;

    if (isCorrect) {
      const newPracticeRadicals = [...practiceRadicals, radicalName];
      setPracticeRadicals(newPracticeRadicals);
      setPracticeMessage('正确！继续点击下一个部首');

      if (newPracticeRadicals.length === selectedCharacter.radicals.length) {
        completePractice(true);
      }
    } else {
      setPracticeMessage(`错误！应该点击第 ${expectedIndex + 1} 个部首`);
      completePractice(false);
    }
  };

  const completePractice = async (correct: boolean) => {
    if (!selectedCharacter || !practiceStart) return;

    const duration = Date.now() - practiceStart;
    const errors = correct
      ? []
      : [selectedCharacter.radicals[practiceRadicals.length].name];

    try {
      await practiceApi.createRecord({
        characterId: selectedCharacter.id,
        character: selectedCharacter.char,
        timestamp: Date.now(),
        correct,
        errors,
        duration,
      });

      setPracticeMessage(correct ? '恭喜！练习完成！' : '练习失败，再试一次吧');
      setIsPracticeMode(false);
      setPracticeStart(null);

      setTimeout(() => {
        setIsSeparated(false);
        setPracticeRadicals([]);
        setPracticeMessage('');
      }, 2000);

      loadPracticeRecords();
      loadErrorCharacters();
    } catch (error) {
      console.error('Failed to save practice record:', error);
    }
  };

  const addNote = async () => {
    if (!selectedCharacter || !newNote.trim()) return;

    try {
      const note = await noteApi.create({
        characterId: selectedCharacter.id,
        content: newNote,
        timestamp: Date.now(),
      });
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await noteApi.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>汉字部首拆解学习工具</h1>
        <p>探索汉字结构，轻松学习部首</p>
      </div>

      <div className="main-container">
        <div className="character-panel">
          <div className="character-display">
            <motion.div
              className="character-canvas"
              animate={{
                scale: showStrokes ? 1.05 : 1,
                borderColor: showStrokes ? '#764ba2' : '#667eea',
              }}
              transition={{ duration: 0.3 }}
            >
              {!isSeparated && selectedCharacter ? (
                <motion.div
                  key={selectedCharacter.char}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="main-character"
                >
                  {selectedCharacter.char}
                </motion.div>
              ) : selectedCharacter ? (
                <div className="radicals-container">
                  {selectedCharacter.radicals.map((radical, index) => (
                    <motion.div
                      key={radical.id}
                      initial={{
                        opacity: 0,
                        x: index % 2 === 0 ? -50 : 50,
                        y: -20,
                      }}
                      animate={{
                        opacity: isPlayingStrokes
                          ? index < strokeIndex
                            ? 1
                            : 0
                          : practiceRadicals.includes(radical.name)
                          ? 0.3
                          : 1,
                        x: 0,
                        y: 0,
                        scale: activeRadicalIndex === index ? 1.2 : 1,
                        rotate: activeRadicalIndex === index ? 5 : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.2,
                        type: 'spring',
                        stiffness: 300,
                      }}
                      className={`radical-item ${radical.isErrorProne ? 'error-prone' : ''} ${isPracticeMode ? 'practice-mode' : ''} ${practiceRadicals.includes(radical.name) ? 'completed' : ''}`}
                      onClick={() =>
                        isPracticeMode
                          ? handlePracticeRadicalClick(radical.name, index)
                          : handleRadicalClick(index)
                      }
                      whileHover={!isPracticeMode ? { scale: 1.1 } : {}}
                      whileTap={!isPracticeMode ? { scale: 0.95 } : {}}
                    >
                      {radical.name}
                      {isPracticeMode && (
                        <span className="radical-index">{index + 1}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </motion.div>

            {practiceMessage && (
              <motion.div
                className="practice-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {practiceMessage}
              </motion.div>
            )}

            <div className="controls">
              <motion.button
                className="btn btn-primary"
                onClick={handleSeparate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPracticeMode || isPlayingStrokes}
              >
                {isSeparated ? '重组汉字' : '拆解部首'}
              </motion.button>
              <motion.button
                className={`btn ${isPlayingStrokes ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handlePlayStrokes}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPracticeMode || isPlayingStrokes || !selectedCharacter}
              >
                {isPlayingStrokes ? '播放中...' : '笔画回放'}
              </motion.button>
              <motion.button
                className="btn btn-secondary"
                onClick={startPractice}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPracticeMode || isPlayingStrokes || !selectedCharacter}
              >
                开始练习
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedCharacter && (
              <motion.div
                key={selectedCharacter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="info-panel" style={{ marginTop: 20 }}>
                  <h3>汉字信息</h3>
                  <div className="info-item">
                    <span className="info-label">拼音</span>
                    <span className="info-value">{selectedCharacter.pinyin}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">含义</span>
                    <span className="info-value">{selectedCharacter.meaning}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">总笔画</span>
                    <span className="info-value">{selectedCharacter.totalStrokes}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">结构</span>
                    <span className="info-value">{selectedCharacter.structure}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">部首数量</span>
                    <span className="info-value">{selectedCharacter.radicals.length}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sidebar">
          <div className="character-selector">
            <h3>选择汉字</h3>
            <div className="character-grid">
              {characters.map((char) => (
                <motion.div
                  key={char.id}
                  className={`character-option ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCharacter(char);
                    setIsSeparated(false);
                    setIsPracticeMode(false);
                    setPracticeRadicals([]);
                    setPracticeMessage('');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {char.char}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'practice' ? 'active' : ''}`}
                onClick={() => setActiveTab('practice')}
              >
                练习记录
              </button>
              <button
                className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                学习笔记
              </button>
              <button
                className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
                onClick={() => setActiveTab('errors')}
              >
                易错汉字
              </button>
            </div>

            <div className="tab-content">
              <AnimatePresence mode="wait">
                {activeTab === 'practice' && (
                  <motion.div
                    key="practice"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="records-list"
                  >
                    {practiceRecords.length === 0 ? (
                      <p className="empty-text">暂无练习记录</p>
                    ) : (
                      practiceRecords.slice(0, 10).map((record) => (
                        <div key={record.id} className="record-item">
                          <div className="record-char">{record.character}</div>
                          <div className="record-info">
                            <span className={record.correct ? 'correct' : 'wrong'}>
                              {record.correct ? '✓ 正确' : '✗ 错误'}
                            </span>
                            <span className="record-time">
                              {Math.round(record.duration / 1000)}秒
                            </span>
                          </div>
                          <div className="record-date">
                            {formatDate(record.timestamp)}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="notes-container"
                  >
                    <div className="note-input">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="输入学习笔记..."
                        rows={3}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={addNote}
                        disabled={!newNote.trim()}
                      >
                        添加笔记
                      </button>
                    </div>
                    {notes.length === 0 ? (
                      <p className="empty-text">暂无笔记</p>
                    ) : (
                      <div className="notes-list">
                        {notes.map((note) => (
                          <div key={note.id} className="note-item">
                            <p className="note-content">{note.content}</p>
                            <div className="note-footer">
                              <span className="note-date">
                                {formatDate(note.timestamp)}
                              </span>
                              <button
                                className="delete-btn"
                                onClick={() => deleteNote(note.id)}
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'errors' && (
                  <motion.div
                    key="errors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="errors-list"
                  >
                    {errorCharacters.length === 0 ? (
                      <p className="empty-text">暂无易错汉字</p>
                    ) : (
                      errorCharacters.map((error) => (
                        <div key={error.id} className="error-item">
                          <div className="error-char">{error.character}</div>
                          <div className="error-count">
                            错误 <span>{error.errorCount}</span> 次
                          </div>
                          <div className="error-date">
                            最近: {formatDate(error.lastError)}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
