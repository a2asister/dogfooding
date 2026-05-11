import { createSignal, onMount, Show } from 'solid-js';
import { getBatches, createBatch, updateBatch, deleteBatch } from '../api';

const Admin = () => {
  const [batches, setBatches] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [editingBatch, setEditingBatch] = createSignal(null);
  const [status, setStatus] = createSignal({ type: '', message: '' });
  
  const [newBatch, setNewBatch] = createSignal({
    name: '',
    amount: '',
    total_count: '',
    win_probability: ''
  });

  const [editForm, setEditForm] = createSignal({
    name: '',
    amount: '',
    total_count: '',
    win_probability: ''
  });

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await getBatches();
      setBatches(data);
    } catch (err) {
      setStatus({ type: 'error', message: '加载批次失败' });
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadBatches();
  });

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const batch = {
        name: newBatch().name,
        amount: parseFloat(newBatch().amount),
        total_count: parseInt(newBatch().total_count),
        win_probability: parseFloat(newBatch().win_probability)
      };

      await createBatch(batch);
      setStatus({ type: 'success', message: '批次创建成功！' });
      setNewBatch({ name: '', amount: '', total_count: '', win_probability: '' });
      loadBatches();
    } catch (err) {
      setStatus({ type: 'error', message: '创建批次失败' });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setEditForm({
      name: batch.name,
      amount: batch.amount.toString(),
      total_count: batch.total_count.toString(),
      win_probability: batch.win_probability.toString()
    });
  };

  const closeEditModal = () => {
    setEditingBatch(null);
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    if (!editingBatch()) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const batch = {
        name: editForm().name,
        amount: parseFloat(editForm().amount),
        total_count: parseInt(editForm().total_count),
        win_probability: parseFloat(editForm().win_probability)
      };

      await updateBatch(editingBatch().id, batch);
      setStatus({ type: 'success', message: '批次更新成功！' });
      closeEditModal();
      loadBatches();
    } catch (err) {
      setStatus({ type: 'error', message: '更新批次失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!confirm('确定要删除这个批次吗？')) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await deleteBatch(id);
      setStatus({ type: 'success', message: '批次删除成功！' });
      loadBatches();
    } catch (err) {
      setStatus({ type: 'error', message: '删除批次失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="admin-container">
      <h2>🎫 优惠券批次管理</h2>
      
      <form class="admin-form" onSubmit={handleCreateBatch}>
        <div class="form-group">
          <label>批次名称</label>
          <input
            type="text"
            value={newBatch().name}
            onInput={(e) => setNewBatch({ ...newBatch(), name: e.target.value })}
            placeholder="例如：10元优惠券"
            required
          />
        </div>
        <div class="form-group">
          <label>面额 (元)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={newBatch().amount}
            onInput={(e) => setNewBatch({ ...newBatch(), amount: e.target.value })}
            placeholder="10"
            required
          />
        </div>
        <div class="form-group">
          <label>总数量</label>
          <input
            type="number"
            min="1"
            value={newBatch().total_count}
            onInput={(e) => setNewBatch({ ...newBatch(), total_count: e.target.value })}
            placeholder="100"
            required
          />
        </div>
        <div class="form-group">
          <label>中奖概率 (0-1)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={newBatch().win_probability}
            onInput={(e) => setNewBatch({ ...newBatch(), win_probability: e.target.value })}
            placeholder="0.3"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" disabled={loading()}>
          {loading() ? '创建中...' : '创建批次'}
        </button>
      </form>

      {status().message && (
        <div class={`status-message ${status().type}`}>
          {status().message}
        </div>
      )}

      <div class="batches-list">
        {batches().map(batch => (
          <div class="batch-item">
            <div class="batch-info">
              <h3>{batch.name}</h3>
              <p>
                面额: ¥{batch.amount} | 
                数量: {batch.used_count}/{batch.total_count} | 
                概率: {(batch.win_probability * 100).toFixed(1)}%
              </p>
            </div>
            <div class="batch-actions">
              <button 
                class="btn btn-secondary" 
                onClick={() => openEditModal(batch)}
              >
                编辑
              </button>
              <button 
                class="btn btn-danger" 
                onClick={() => handleDeleteBatch(batch.id)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
        
        {batches().length === 0 && !loading() && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            暂无批次数据，请创建新批次
          </div>
        )}
      </div>

      <Show when={editingBatch()}>
        <div class="edit-modal" onClick={closeEditModal}>
          <div class="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>编辑批次</h3>
            <form onSubmit={handleUpdateBatch}>
              <div class="form-group">
                <label>批次名称</label>
                <input
                  type="text"
                  value={editForm().name}
                  onInput={(e) => setEditForm({ ...editForm(), name: e.target.value })}
                  required
                />
              </div>
              <div class="form-group">
                <label>面额 (元)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm().amount}
                  onInput={(e) => setEditForm({ ...editForm(), amount: e.target.value })}
                  required
                />
              </div>
              <div class="form-group">
                <label>总数量</label>
                <input
                  type="number"
                  min="1"
                  value={editForm().total_count}
                  onInput={(e) => setEditForm({ ...editForm(), total_count: e.target.value })}
                  required
                />
              </div>
              <div class="form-group">
                <label>中奖概率 (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={editForm().win_probability}
                  onInput={(e) => setEditForm({ ...editForm(), win_probability: e.target.value })}
                  required
                />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onClick={closeEditModal}>
                  取消
                </button>
                <button type="submit" class="btn btn-primary" disabled={loading()}>
                  {loading() ? '更新中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Admin;
