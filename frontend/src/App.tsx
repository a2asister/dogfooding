import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import ApprovalFlowChart from './components/ApprovalFlowChart';
import {
  GET_APPROVAL_PROCESS,
  GET_ALL_PROCESSES,
  CREATE_SAMPLE_PROCESS,
  UPDATE_APPROVAL,
} from './graphql/queries';
import { ApprovalProcess } from './types';

const App: React.FC = () => {
  const [processId, setProcessId] = useState<number | null>(null);

  const { data: allData, refetch: refetchAll } = useQuery(GET_ALL_PROCESSES, {
    fetchPolicy: 'network-only',
  });

  const { data, loading, refetch, error } = useQuery(GET_APPROVAL_PROCESS, {
    variables: { id: processId },
    skip: !processId,
    fetchPolicy: 'network-only',
  });

  const [createSampleProcess] = useMutation(CREATE_SAMPLE_PROCESS, {
    onCompleted: (result) => {
      setProcessId(result.createSampleApprovalProcess.id);
      refetchAll();
    },
  });

  const [updateApproval] = useMutation(UPDATE_APPROVAL, {
    refetchQueries: [
      { query: GET_APPROVAL_PROCESS, variables: { id: processId } },
      { query: GET_ALL_PROCESSES },
    ],
    awaitRefetchQueries: true,
    onError: (error) => {
      console.error('审批更新失败:', error);
      alert('操作失败: ' + error.message);
    },
  });

  const handleApprove = (nodeId: number) => {
    const commentInput = document.getElementById('approval-comment') as HTMLTextAreaElement;
    updateApproval({
      variables: {
        input: {
          nodeId,
          action: 'approve',
          approver: '当前用户',
          comment: commentInput?.value || '同意',
        },
      },
    });
  };

  const handleReject = (nodeId: number) => {
    const commentInput = document.getElementById('approval-comment') as HTMLTextAreaElement;
    updateApproval({
      variables: {
        input: {
          nodeId,
          action: 'reject',
          approver: '当前用户',
          comment: commentInput?.value || '驳回',
        },
      },
    });
  };

  const process: ApprovalProcess | undefined = data?.approvalProcess;
  const processes: ApprovalProcess[] = allData?.approvalProcesses || [];

  return (
    <div className="app-container">
      <div className="header">
        <h1>审批流程系统</h1>
        <p>可视化审批流程，支持SVG动画效果和3D卡片展示</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className="btn btn-create" onClick={() => createSampleProcess()}>
          创建示例审批流程
        </button>
      </div>

      {processes.length > 0 && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <select
            value={processId || ''}
            onChange={(e) => setProcessId(Number(e.target.value))}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '14px',
            }}
          >
            <option value="">选择审批流程</option>
            {processes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <div className="loading">加载中...</div>}

      {process && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '8px' }}>
              {process.name}
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>{process.description}</p>
          </div>
          <ApprovalFlowChart nodes={process.nodes} onApprove={handleApprove} onReject={handleReject} />
        </div>
      )}

      {!process && !loading && (
        <div className="loading">
          <p>点击上方按钮创建示例审批流程，或从下拉列表中选择已有的流程</p>
        </div>
      )}
    </div>
  );
};

export default App;
