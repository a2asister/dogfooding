import { useState, useEffect, useCallback } from 'react';
import BillCard from './BillCard';
import MonthlySummary from './MonthlySummary';
import AddBillModal from './AddBillModal';

interface Bill {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
  createdAt: string;
}

interface Summary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
}

const API_URL = 'http://localhost:3987';

export default function BillApp() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBillId, setNewBillId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/bills?month=${selectedMonth}`);
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    }
  }, [selectedMonth]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/bills/summary?month=${selectedMonth}`);
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchBills();
    fetchSummary();
  }, [fetchBills, fetchSummary]);

  const handleAddBill = async (billData: Omit<Bill, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
      const newBill = await res.json();
      setBills((prev) => [newBill, ...prev]);
      setNewBillId(newBill.id);
      setTimeout(() => setNewBillId(null), 1000);
      fetchSummary();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add bill:', error);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/bills/${id}`, { method: 'DELETE' });
      setTimeout(() => {
        setBills((prev) => prev.filter((b) => b.id !== id));
        setDeletingId(null);
        fetchSummary();
      }, 600);
    } catch (error) {
      console.error('Failed to delete bill:', error);
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💰 账单管理</h1>
        <div style={styles.monthSelector}>
          <button
            onClick={() => {
              const d = new Date(selectedMonth + '-01');
              d.setMonth(d.getMonth() - 1);
              setSelectedMonth(d.toISOString().slice(0, 7));
            }}
            style={styles.monthBtn}
          >
            ◀
          </button>
          <span style={styles.monthText}>{selectedMonth}</span>
          <button
            onClick={() => {
              const d = new Date(selectedMonth + '-01');
              d.setMonth(d.getMonth() + 1);
              setSelectedMonth(d.toISOString().slice(0, 7));
            }}
            style={styles.monthBtn}
          >
            ▶
          </button>
        </div>
      </div>

      {summary && <MonthlySummary summary={summary} />}

      <button onClick={() => setIsModalOpen(true)} style={styles.addBtn}>
        + 添加账单
      </button>

      <div style={styles.timeline}>
        {bills.map((bill, index) => (
          <BillCard
            key={bill.id}
            bill={bill}
            isNew={bill.id === newBillId}
            isDeleting={bill.id === deletingId}
            onDelete={handleDelete}
          />
        ))}
        {bills.length === 0 && (
          <div style={styles.empty}>暂无账单记录</div>
        )}
      </div>

      <AddBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBill}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: 'white',
    fontSize: '28px',
    fontWeight: 700,
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.2)',
    padding: '8px 12px',
    borderRadius: '20px',
  },
  monthBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  monthText: {
    color: 'white',
    fontWeight: 600,
    minWidth: '80px',
    textAlign: 'center',
  },
  addBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
  },
  timeline: {
    position: 'relative',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    padding: '40px',
    fontSize: '16px',
  },
};
