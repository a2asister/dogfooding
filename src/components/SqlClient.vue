<template>
  <div class="app">
    <header class="header">
      <h1>SQL 可视化工具</h1>
      <div class="status" :class="{ connected: isConnected }">
        {{ isConnected ? '已连接' : '未连接' }}
      </div>
    </header>

    <div class="main">
      <aside class="sidebar">
        <div class="section">
          <h3>数据库连接</h3>
          <input
            v-model="dbPath"
            type="text"
            placeholder="SQLite 文件路径"
            class="input"
          />
          <button @click="connectDb" class="btn btn-primary">连接</button>
        </div>

        <div class="section" v-if="isConnected">
          <h3>数据表</h3>
          <ul class="table-list">
            <li
              v-for="table in tables"
              :key="table"
              @click="selectTable(table)"
              :class="{ active: selectedTable === table }"
            >
              {{ table }}
            </li>
          </ul>
        </div>

        <div class="section" v-if="selectedTableStructure.length > 0">
          <h3>表结构: {{ selectedTable }}</h3>
          <table class="structure-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col in selectedTableStructure" :key="col.name">
                <td>{{ col.name }}</td>
                <td>{{ col.type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </aside>

      <section class="content">
        <div class="sql-editor">
          <h3>SQL 编辑器</h3>
          <textarea ref="sqlTextarea" v-model="sql" class="sql-textarea"></textarea>
          <div class="editor-actions">
            <button @click="executeSql" class="btn btn-primary">执行 SQL</button>
            <button @click="clearSql" class="btn">清空</button>
          </div>
        </div>

        <div class="result-section">
          <h3 v-if="resultColumns.length > 0 || resultRowsAffected !== undefined">
            执行结果
          </h3>
          <div v-if="resultError" class="error">{{ resultError }}</div>
          <div v-if="resultRowsAffected !== undefined" class="info">
            影响行数: {{ resultRowsAffected }}
          </div>
          <div v-if="resultColumns.length > 0" class="table-container">
            <table class="result-table">
              <thead>
                <tr>
                  <th v-for="col in resultColumns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in resultData" :key="idx">
                  <td v-for="col in resultColumns" :key="col">
                    {{ formatValue(row[col]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="logs-section">
          <h3>执行日志</h3>
          <div class="logs-container">
            <div
              v-for="log in logs"
              :key="log.id"
              class="log-item"
              :class="{ success: log.success, error: !log.success }"
            >
              <div class="log-time">{{ formatTime(log.timestamp) }}</div>
              <div class="log-sql">{{ log.sql }}</div>
              <div v-if="!log.success" class="log-error">{{ log.error }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

interface TableColumn {
  name: string;
  type: string;
  notnull: number;
  pk: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  sql: string;
  success: boolean;
  error?: string;
  rowsAffected?: number;
}

type CodeMirrorType = typeof import('codemirror');
type CodeMirrorEditor = InstanceType<CodeMirrorType['Editor']>;

const dbPath = ref('');
const isConnected = ref(false);
const tables = ref<string[]>([]);
const selectedTable = ref('');
const selectedTableStructure = ref<TableColumn[]>([]);
const sql = ref('SELECT * FROM sqlite_master;');
const sqlTextarea = ref<HTMLTextAreaElement | null>(null);
const resultColumns = ref<string[]>([]);
const resultData = ref<Record<string, unknown>[]>([]);
const resultRowsAffected = ref<number | undefined>(undefined);
const resultError = ref('');
const logs = ref<LogEntry[]>([]);

let editor: CodeMirrorEditor | null = null;
let CodeMirrorModule: CodeMirrorType | null = null;

const initCodeMirror = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  if (!CodeMirrorModule) {
    CodeMirrorModule = await import('codemirror');
    await import('codemirror/mode/sql/sql.js');
    await import('codemirror/lib/codemirror.css');
  }
};

onMounted(async () => {
  await nextTick();
  await initCodeMirror();
  
  if (sqlTextarea.value && CodeMirrorModule) {
    editor = CodeMirrorModule.fromTextArea(sqlTextarea.value, {
      mode: 'sql',
      lineNumbers: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
    });
    editor.on('change', () => {
      if (editor) {
        sql.value = editor.getValue();
      }
    });
  }
  await loadLogs();
});

const apiCall = async (
  endpoint: string,
  method: string = 'GET',
  body?: unknown
): Promise<unknown> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${endpoint}`, options);
  return res.json();
};

const connectDb = async (): Promise<void> => {
  const result = (await apiCall('/connect', 'POST', {
    dbPath: dbPath.value,
  })) as { success: boolean; message: string };
  if (result.success) {
    isConnected.value = true;
    await loadTables();
    await loadLogs();
  } else {
    alert(result.message);
  }
};

const loadTables = async (): Promise<void> => {
  const result = (await apiCall('/tables')) as {
    success: boolean;
    data: string[];
  };
  if (result.success) {
    tables.value = result.data;
  }
};

const selectTable = async (tableName: string): Promise<void> => {
  selectedTable.value = tableName;
  const result = (await apiCall(`/tables/${tableName}`)) as {
    success: boolean;
    data: TableColumn[];
  };
  if (result.success) {
    selectedTableStructure.value = result.data;
  }
};

const executeSql = async (): Promise<void> => {
  resultColumns.value = [];
  resultData.value = [];
  resultRowsAffected.value = undefined;
  resultError.value = '';

  const result = (await apiCall('/execute', 'POST', {
    sql: sql.value,
  })) as {
    success: boolean;
    columns?: string[];
    data?: Record<string, unknown>[];
    rowsAffected?: number;
    error?: string;
  };

  if (result.success) {
    resultColumns.value = result.columns || [];
    resultData.value = result.data || [];
    resultRowsAffected.value = result.rowsAffected;
  } else {
    resultError.value = result.error || '执行失败';
  }
  await loadLogs();
  await loadTables();
};

const clearSql = (): void => {
  sql.value = '';
  if (editor) {
    editor.setValue('');
  }
};

const loadLogs = async (): Promise<void> => {
  const result = (await apiCall('/logs')) as {
    success: boolean;
    data: LogEntry[];
  };
  if (result.success) {
    logs.value = result.data;
  }
};

const formatValue = (val: unknown): string => {
  if (val === null || val === undefined) return 'NULL';
  return String(val);
};

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #16213e;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #0f3460;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
}

.status {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  background: #555;
}

.status.connected {
  background: #28a745;
}

.main {
  flex: 1;
  display: flex;
  gap: 0;
}

.sidebar {
  width: 280px;
  background: #16213e;
  border-right: 1px solid #0f3460;
  padding: 16px;
  overflow-y: auto;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #888;
}

.input {
  width: 100%;
  padding: 10px 12px;
  background: #0f0f23;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  margin-bottom: 8px;
}

.input:focus {
  outline: none;
  border-color: #007bff;
}

.btn {
  padding: 10px 16px;
  border: 1px solid #333;
  background: #2a2a4a;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #3a3a5a;
}

.btn-primary {
  background: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background: #0056b3;
}

.table-list {
  list-style: none;
}

.table-list li {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 14px;
}

.table-list li:hover {
  background: #2a2a4a;
}

.table-list li.active {
  background: #007bff;
}

.structure-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.structure-table th,
.structure-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #333;
}

.sql-editor {
  margin-bottom: 24px;
}

.sql-editor h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.sql-textarea {
  display: none;
}

.editor-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.result-section,
.logs-section {
  margin-bottom: 24px;
}

.result-section h3,
.logs-section h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.error {
  padding: 12px;
  background: #dc354520;
  border: 1px solid #dc3545;
  border-radius: 4px;
  color: #ff6b6b;
  margin-bottom: 12px;
}

.info {
  padding: 12px;
  background: #17a2b820;
  border: 1px solid #17a2b8;
  border-radius: 4px;
  color: #17a2b8;
  margin-bottom: 12px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #333;
  border-radius: 4px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 100%;
}

.result-table th {
  background: #16213e;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #333;
  position: sticky;
  top: 0;
}

.result-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #333;
}

.result-table tbody tr:hover {
  background: #2a2a4a;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 4px;
}

.log-item {
  padding: 10px 12px;
  border-bottom: 1px solid #333;
  font-size: 13px;
}

.log-item.success {
  border-left: 3px solid #28a745;
}

.log-item.error {
  border-left: 3px solid #dc3545;
}

.log-time {
  color: #888;
  font-size: 11px;
  margin-bottom: 4px;
}

.log-sql {
  font-family: monospace;
  word-break: break-all;
}

.log-error {
  color: #ff6b6b;
  margin-top: 4px;
  font-size: 12px;
}
</style>
