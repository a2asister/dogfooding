"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  FileText,
  Check,
  X,
  Clock,
  Building2,
  Users,
  Trash2,
  User,
  Phone,
  MessageSquare,
} from "lucide-react";
import {
  mockViewings,
  mockContracts,
  mockCommissions,
  mockFollowUpRecords,
  mockProperties,
  mockClients,
  mockUsers,
} from "@/data/mockData";
import { ViewingStatus, ContractStatus, CommissionStatus, Viewing, Contract, Commission, FollowUpRecord } from "@/types";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import {
  Modal,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

const getViewingStatusBadge = (status: ViewingStatus) => {
  const statusMap: Record<ViewingStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
    scheduled: { label: "已预约", variant: "info" },
    confirmed: { label: "已确认", variant: "warning" },
    completed: { label: "已完成", variant: "success" },
    cancelled: { label: "已取消", variant: "secondary" },
    no_show: { label: "客户未到", variant: "danger" },
  };
  const info = statusMap[status];
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

const getContractStatusBadge = (status: ContractStatus) => {
  const statusMap: Record<ContractStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
    draft: { label: "草稿", variant: "secondary" },
    pending: { label: "待审核", variant: "warning" },
    signed: { label: "已签约", variant: "info" },
    completed: { label: "已完成", variant: "success" },
    terminated: { label: "已终止", variant: "danger" },
  };
  const info = statusMap[status];
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

const getCommissionStatusBadge = (status: CommissionStatus) => {
  const statusMap: Record<CommissionStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
    pending: { label: "待审核", variant: "warning" },
    approved: { label: "已批准", variant: "info" },
    paid: { label: "已发放", variant: "success" },
    rejected: { label: "已驳回", variant: "danger" },
  };
  const info = statusMap[status];
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

const getFollowUpTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    phone: "电话",
    wechat: "微信",
    visit: "到访",
    viewing: "带看",
    other: "其他",
  };
  return map[type] || type;
};

const viewingStatusOptions = [
  { value: "scheduled", label: "已预约" },
  { value: "confirmed", label: "已确认" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
  { value: "no_show", label: "客户未到" },
];

const contractStatusOptions = [
  { value: "draft", label: "草稿" },
  { value: "pending", label: "待审核" },
  { value: "signed", label: "已签约" },
  { value: "completed", label: "已完成" },
  { value: "terminated", label: "已终止" },
];

const contractTypeOptions = [
  { value: "sale", label: "买卖合同" },
  { value: "rental", label: "租赁合同" },
];

const followUpTypeOptions = [
  { value: "phone", label: "电话" },
  { value: "wechat", label: "微信" },
  { value: "visit", label: "到访" },
  { value: "viewing", label: "带看" },
  { value: "other", label: "其他" },
];

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<"viewings" | "follow-ups" | "contracts" | "commission">("viewings");

  const [localViewings, setLocalViewings] = useState<Viewing[]>(mockViewings as Viewing[]);
  const [localContracts, setLocalContracts] = useState<Contract[]>(mockContracts as Contract[]);
  const [localCommissions, setLocalCommissions] = useState<Commission[]>(mockCommissions as Commission[]);
  const [localFollowUps, setLocalFollowUps] = useState<FollowUpRecord[]>(mockFollowUpRecords);

  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<"viewing" | "contract" | "commission" | "followup">("viewing");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>("");

  const propertyOptions = mockProperties.map((p) => ({ value: p.id, label: p.title }));
  const clientOptions = mockClients.map((c) => ({ value: c.id, label: c.name }));
  const agentOptions = mockUsers
    .filter((u) => u.roles.some((r) => r.name === "经纪人" || r.name === "店长"))
    .map((u) => ({ value: u.id, label: u.name }));

  const [viewingFormData, setViewingFormData] = useState({
    propertyId: "",
    clientId: "",
    date: "",
    time: "",
    agentId: "",
    notes: "",
    status: "scheduled" as ViewingStatus,
  });

  const [contractFormData, setContractFormData] = useState({
    contractNo: "",
    type: "sale" as "sale" | "rental",
    propertyId: "",
    clientId: "",
    ownerName: "",
    amount: "",
    commission: "",
    status: "draft" as ContractStatus,
    startDate: "",
    endDate: "",
    notes: "",
  });

  const handleAddViewing = () => {
    setIsEditMode(false);
    setModalType("viewing");
    setViewingFormData({
      propertyId: "",
      clientId: "",
      date: "",
      time: "",
      agentId: "",
      notes: "",
      status: "scheduled",
    });
    setIsViewingModalOpen(true);
  };

  const handleEditViewing = (viewing: any) => {
    setIsEditMode(true);
    setModalType("viewing");
    setSelectedItem(viewing);
    setViewingFormData({
      propertyId: viewing.propertyId || "",
      clientId: viewing.clientId || "",
      date: viewing.date || "",
      time: viewing.time || "",
      agentId: viewing.agentId || "",
      notes: viewing.notes || "",
      status: viewing.status || "scheduled",
    });
    setIsViewingModalOpen(true);
  };

  const handleAddContract = () => {
    setIsEditMode(false);
    setModalType("contract");
    setContractFormData({
      contractNo: `HT-${Date.now().toString().slice(-8)}`,
      type: "sale",
      propertyId: "",
      clientId: "",
      ownerName: "",
      amount: "",
      commission: "",
      status: "draft",
      startDate: "",
      endDate: "",
      notes: "",
    });
    setIsContractModalOpen(true);
  };

  const handleEditContract = (contract: any) => {
    setIsEditMode(true);
    setModalType("contract");
    setSelectedItem(contract);
    setContractFormData({
      contractNo: contract.contractNo || "",
      type: contract.type || "sale",
      propertyId: contract.propertyId || "",
      clientId: contract.clientId || "",
      ownerName: contract.ownerName || "",
      amount: contract.amount?.toString() || "",
      commission: contract.commission?.toString() || "",
      status: contract.status || "draft",
      startDate: contract.startDate || "",
      endDate: contract.endDate || "",
      notes: contract.notes || "",
    });
    setIsContractModalOpen(true);
  };

  const handleViewDetail = (item: any, type: "viewing" | "contract" | "commission") => {
    setSelectedItem(item);
    setModalType(type);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (item: any, type: "viewing" | "contract") => {
    setSelectedItem(item);
    setModalType(type);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = (item: any, type: "viewing" | "contract" | "commission", status: string) => {
    setSelectedItem(item);
    setModalType(type);
    setTargetStatus(status);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (modalType === "viewing") {
      setLocalViewings((prev) =>
        prev.map((v) =>
          v.id === selectedItem.id
            ? { ...v, status: targetStatus as ViewingStatus }
            : v
        )
      );
    } else if (modalType === "contract") {
      setLocalContracts((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id
            ? { ...c, status: targetStatus as ContractStatus }
            : c
        )
      );
    } else if (modalType === "commission") {
      setLocalCommissions((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id
            ? {
                ...c,
                status: targetStatus as CommissionStatus,
                paidAt: targetStatus === "paid" ? new Date().toISOString() : c.paidAt,
              }
            : c
        )
      );
    }

    setIsSubmitting(false);
    setIsStatusModalOpen(false);
    setSelectedItem(null);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (modalType === "viewing") {
      setLocalViewings((prev) => prev.filter((v) => v.id !== selectedItem.id));
    } else if (modalType === "contract") {
      setLocalContracts((prev) => prev.filter((c) => c.id !== selectedItem.id));
    }

    setIsSubmitting(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitViewing = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const property = mockProperties.find((p) => p.id === viewingFormData.propertyId);
    const client = mockClients.find((c) => c.id === viewingFormData.clientId);
    const agent = mockUsers.find((u) => u.id === viewingFormData.agentId);

    if (isEditMode && selectedItem) {
      setLocalViewings((prev) =>
        prev.map((v) =>
          v.id === selectedItem.id
            ? {
                ...v,
                propertyId: viewingFormData.propertyId,
                propertyTitle: property?.title || v.propertyTitle,
                clientId: viewingFormData.clientId,
                clientName: client?.name || v.clientName,
                agentId: viewingFormData.agentId,
                agentName: agent?.name || v.agentName,
                date: viewingFormData.date,
                time: viewingFormData.time,
                notes: viewingFormData.notes,
                status: viewingFormData.status,
              }
            : v
        )
      );
    } else {
      const newViewing: Viewing = {
        id: `viewing-${Date.now()}`,
        propertyId: viewingFormData.propertyId,
        propertyTitle: property?.title || "",
        clientId: viewingFormData.clientId,
        clientName: client?.name || "",
        agentId: viewingFormData.agentId,
        agentName: agent?.name || "",
        date: viewingFormData.date,
        time: viewingFormData.time,
        notes: viewingFormData.notes,
        status: viewingFormData.status,
        createdAt: new Date().toISOString(),
      } as Viewing;
      setLocalViewings((prev) => [newViewing, ...prev]);
    }

    setIsSubmitting(false);
    setIsViewingModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitContract = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const property = mockProperties.find((p) => p.id === contractFormData.propertyId);
    const client = mockClients.find((c) => c.id === contractFormData.clientId);

    if (isEditMode && selectedItem) {
      setLocalContracts((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id
            ? {
                ...c,
                contractNo: contractFormData.contractNo,
                type: contractFormData.type,
                propertyId: contractFormData.propertyId,
                propertyTitle: property?.title || c.propertyTitle,
                clientId: contractFormData.clientId,
                clientName: client?.name || c.clientName,
                ownerName: contractFormData.ownerName,
                amount: parseFloat(contractFormData.amount) || 0,
                commission: parseFloat(contractFormData.commission) || 0,
                status: contractFormData.status,
                startDate: contractFormData.startDate,
                endDate: contractFormData.endDate,
                notes: contractFormData.notes,
              }
            : c
        )
      );
    } else {
      const newContract: Contract = {
        id: `contract-${Date.now()}`,
        contractNo: contractFormData.contractNo,
        type: contractFormData.type,
        propertyId: contractFormData.propertyId,
        propertyTitle: property?.title || "",
        clientId: contractFormData.clientId,
        clientName: client?.name || "",
        ownerName: contractFormData.ownerName,
        amount: parseFloat(contractFormData.amount) || 0,
        commission: parseFloat(contractFormData.commission) || 0,
        status: contractFormData.status,
        startDate: contractFormData.startDate,
        endDate: contractFormData.endDate,
        notes: contractFormData.notes,
        createdAt: new Date().toISOString(),
      } as Contract;
      setLocalContracts((prev) => [newContract, ...prev]);

      if (parseFloat(contractFormData.commission) > 0) {
        const agent = mockUsers[0];
        const newCommission: Commission = {
          id: `commission-${Date.now()}`,
          contractNo: contractFormData.contractNo,
          contractId: newContract.id,
          agentId: agent.id,
          agentName: agent.name,
          amount: parseFloat(contractFormData.commission),
          rate: 0.03,
          status: "pending",
          createdAt: new Date().toISOString(),
        } as Commission;
        setLocalCommissions((prev) => [newCommission, ...prev]);
      }
    }

    setIsSubmitting(false);
    setIsContractModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">销售业务</h1>
          <p className="text-gray-500 mt-1">带看预约、跟进计划、签约管理、佣金核算</p>
        </div>
        {activeTab === "viewings" && (
          <Button onClick={handleAddViewing} className="flex items-center gap-2">
            <Plus size={18} />
            预约带看
          </Button>
        )}
        {activeTab === "contracts" && (
          <Button onClick={handleAddContract} className="flex items-center gap-2">
            <Plus size={18} />
            新建合同
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待确认带看</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {localViewings.filter((v) => v.status === "scheduled" || v.status === "confirmed").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本月签约</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {localContracts.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待发放佣金</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(
                  localCommissions
                    .filter((c) => c.status === "pending" || c.status === "approved")
                    .reduce((sum, c) => sum + c.amount, 0)
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待跟进客户</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {localFollowUps.filter((f) => f.nextFollowUpAt).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("viewings")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "viewings"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              带看预约
              <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                {localViewings.filter((v) => v.status === "scheduled" || v.status === "confirmed").length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("follow-ups")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "follow-ups"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={18} />
              跟进计划
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                {localFollowUps.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "contracts"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} />
              签约管理
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                {localContracts.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "commission"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign size={18} />
              佣金核算
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {localCommissions.length}
              </span>
            </div>
          </button>
        </div>

        <div className="p-4">
          {activeTab === "viewings" && (
            <ViewingsTab
              viewings={localViewings}
              onEdit={handleEditViewing}
              onView={handleViewDetail}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "follow-ups" && (
            <FollowUpsTab followUps={localFollowUps} />
          )}
          {activeTab === "contracts" && (
            <ContractsTab
              contracts={localContracts}
              onEdit={handleEditContract}
              onView={handleViewDetail}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "commission" && (
            <CommissionTab
              commissions={localCommissions}
              onView={handleViewDetail}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isViewingModalOpen}
        onClose={() => {
          setIsViewingModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑带看预约" : "新增带看预约"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsViewingModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitViewing} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "预约带看"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="选择房源" required>
              <Select
                options={propertyOptions}
                value={viewingFormData.propertyId}
                onChange={(e) => setViewingFormData({ ...viewingFormData, propertyId: e.target.value })}
                placeholder="请选择房源"
              />
            </FormField>
            <FormField label="选择客户" required>
              <Select
                options={clientOptions}
                value={viewingFormData.clientId}
                onChange={(e) => setViewingFormData({ ...viewingFormData, clientId: e.target.value })}
                placeholder="请选择客户"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="带看日期" required>
              <Input
                type="date"
                value={viewingFormData.date}
                onChange={(e) => setViewingFormData({ ...viewingFormData, date: e.target.value })}
              />
            </FormField>
            <FormField label="带看时间" required>
              <Input
                type="time"
                value={viewingFormData.time}
                onChange={(e) => setViewingFormData({ ...viewingFormData, time: e.target.value })}
              />
            </FormField>
            <FormField label="带看状态">
              <Select
                options={viewingStatusOptions}
                value={viewingFormData.status}
                onChange={(e) => setViewingFormData({ ...viewingFormData, status: e.target.value as ViewingStatus })}
              />
            </FormField>
          </div>
          <FormField label="负责经纪人" required>
            <Select
              options={agentOptions}
              value={viewingFormData.agentId}
              onChange={(e) => setViewingFormData({ ...viewingFormData, agentId: e.target.value })}
              placeholder="请选择经纪人"
            />
          </FormField>
          <FormField label="备注">
            <Textarea
              value={viewingFormData.notes}
              onChange={(e) => setViewingFormData({ ...viewingFormData, notes: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑合同" : "新建合同"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsContractModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitContract} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建合同"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="合同编号">
              <Input
                value={contractFormData.contractNo}
                onChange={(e) => setContractFormData({ ...contractFormData, contractNo: e.target.value })}
                placeholder="自动生成，可修改"
              />
            </FormField>
            <FormField label="合同类型" required>
              <Select
                options={contractTypeOptions}
                value={contractFormData.type}
                onChange={(e) => setContractFormData({ ...contractFormData, type: e.target.value as "sale" | "rental" })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="选择房源" required>
              <Select
                options={propertyOptions}
                value={contractFormData.propertyId}
                onChange={(e) => setContractFormData({ ...contractFormData, propertyId: e.target.value })}
                placeholder="请选择房源"
              />
            </FormField>
            <FormField label="客户" required>
              <Select
                options={clientOptions}
                value={contractFormData.clientId}
                onChange={(e) => setContractFormData({ ...contractFormData, clientId: e.target.value })}
                placeholder="请选择客户"
              />
            </FormField>
            <FormField label="业主姓名" required>
              <Input
                value={contractFormData.ownerName}
                onChange={(e) => setContractFormData({ ...contractFormData, ownerName: e.target.value })}
                placeholder="请输入业主姓名"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="合同金额" required>
              <Input
                type="number"
                value={contractFormData.amount}
                onChange={(e) => setContractFormData({ ...contractFormData, amount: e.target.value })}
                placeholder="请输入合同金额"
              />
            </FormField>
            <FormField label="佣金金额">
              <Input
                type="number"
                value={contractFormData.commission}
                onChange={(e) => setContractFormData({ ...contractFormData, commission: e.target.value })}
                placeholder="请输入佣金金额"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="合同状态">
              <Select
                options={contractStatusOptions}
                value={contractFormData.status}
                onChange={(e) => setContractFormData({ ...contractFormData, status: e.target.value as ContractStatus })}
              />
            </FormField>
            {contractFormData.type === "rental" && (
              <>
                <FormField label="开始日期">
                  <Input
                    type="date"
                    value={contractFormData.startDate}
                    onChange={(e) => setContractFormData({ ...contractFormData, startDate: e.target.value })}
                  />
                </FormField>
                <FormField label="结束日期">
                  <Input
                    type="date"
                    value={contractFormData.endDate}
                    onChange={(e) => setContractFormData({ ...contractFormData, endDate: e.target.value })}
                  />
                </FormField>
              </>
            )}
          </div>
          <FormField label="备注">
            <Textarea
              value={contractFormData.notes}
              onChange={(e) => setContractFormData({ ...contractFormData, notes: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen && !!selectedItem}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        title={
          modalType === "viewing"
            ? "带看详情"
            : modalType === "contract"
            ? "合同详情"
            : "佣金详情"
        }
        size="lg"
      >
        {selectedItem && modalType === "viewing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">房源</p>
                <p className="font-medium text-gray-900">{selectedItem.propertyTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">客户</p>
                <p className="font-medium text-gray-900">{selectedItem.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">带看日期</p>
                <p className="font-medium text-gray-900">{selectedItem.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">带看时间</p>
                <p className="font-medium text-gray-900">{selectedItem.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">经纪人</p>
                <p className="font-medium text-gray-900">{selectedItem.agentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                {getViewingStatusBadge(selectedItem.status)}
              </div>
            </div>
            {selectedItem.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">备注</p>
                <p className="text-gray-900">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        )}
        {selectedItem && modalType === "contract" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">合同编号</p>
                <p className="font-medium text-primary-600">{selectedItem.contractNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">合同类型</p>
                <p className="font-medium text-gray-900">
                  {selectedItem.type === "sale" ? "买卖合同" : "租赁合同"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">房源</p>
                <p className="font-medium text-gray-900">{selectedItem.propertyTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">客户</p>
                <p className="font-medium text-gray-900">{selectedItem.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">业主</p>
                <p className="font-medium text-gray-900">{selectedItem.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                {getContractStatusBadge(selectedItem.status)}
              </div>
              <div>
                <p className="text-sm text-gray-500">合同金额</p>
                <p className="font-medium text-gray-900">{formatCurrency(selectedItem.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">佣金金额</p>
                <p className="font-medium text-gray-900">{formatCurrency(selectedItem.commission)}</p>
              </div>
            </div>
            {selectedItem.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">备注</p>
                <p className="text-gray-900">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        )}
        {selectedItem && modalType === "commission" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">合同编号</p>
                <p className="font-medium text-primary-600">{selectedItem.contractNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">经纪人</p>
                <p className="font-medium text-gray-900">{selectedItem.agentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">佣金金额</p>
                <p className="font-medium text-gray-900">{formatCurrency(selectedItem.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">提成比例</p>
                <p className="font-medium text-gray-900">{(selectedItem.rate * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                {getCommissionStatusBadge(selectedItem.status)}
              </div>
              <div>
                <p className="text-sm text-gray-500">发放时间</p>
                <p className="font-medium text-gray-900">
                  {selectedItem.paidAt ? formatDate(selectedItem.paidAt) : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen && !!selectedItem}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={isSubmitting}>
              确认删除
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <p className="text-gray-900 font-medium mb-2">
            确认删除该{modalType === "viewing" ? "带看预约" : "合同"}？
          </p>
          <p className="text-gray-500 text-sm">
            {modalType === "viewing"
              ? selectedItem?.propertyTitle
              : selectedItem?.contractNo}
          </p>
          <p className="text-red-500 text-sm mt-2">此操作不可撤销</p>
        </div>
      </Modal>

      <Modal
        isOpen={isStatusModalOpen && !!selectedItem}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedItem(null);
        }}
        title="确认状态变更"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={confirmStatusChange} loading={isSubmitting}>
              确认变更
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <p className="text-gray-900 font-medium mb-2">
            确认将状态变更为：
          </p>
          {targetStatus === "completed" && <Badge variant="success">已完成</Badge>}
          {targetStatus === "cancelled" && <Badge variant="secondary">已取消</Badge>}
          {targetStatus === "signed" && <Badge variant="info">已签约</Badge>}
          {targetStatus === "approved" && <Badge variant="info">已批准</Badge>}
          {targetStatus === "paid" && <Badge variant="success">已发放</Badge>}
          {targetStatus === "rejected" && <Badge variant="danger">已驳回</Badge>}
        </div>
      </Modal>
    </div>
  );
}

interface ViewingsTabProps {
  viewings: Viewing[];
  onEdit: (viewing: Viewing) => void;
  onView: (viewing: Viewing, type: "viewing" | "contract" | "commission") => void;
  onDelete: (viewing: Viewing, type: "viewing" | "contract") => void;
  onStatusChange: (viewing: Viewing, type: "viewing" | "contract" | "commission", status: string) => void;
}

function ViewingsTab({ viewings, onEdit, onView, onDelete, onStatusChange }: ViewingsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredViewings = viewings.filter(
    (v) =>
      v.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜索房源、客户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter size={18} />
            筛选
          </button>
        </div>
      </div>

      {filteredViewings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  房源信息
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  客户
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  带看时间
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  经纪人
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredViewings.map((viewing) => (
                <tr key={viewing.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Building2 size={24} className="text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {viewing.propertyTitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-900">{viewing.clientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{viewing.date}</p>
                      <p className="text-gray-500">{viewing.time}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{viewing.agentName}</td>
                  <td className="py-4 px-4">{getViewingStatusBadge(viewing.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(viewing, "viewing")}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                      {viewing.status !== "completed" && viewing.status !== "cancelled" && (
                        <button
                          onClick={() => onEdit(viewing)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {viewing.status === "scheduled" && (
                        <button
                          onClick={() => onStatusChange(viewing, "viewing", "completed")}
                          className="p-1.5 hover:bg-green-100 rounded text-green-600"
                          title="标记完成"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(viewing, "viewing")}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Calendar size={32} className="text-gray-400" />}
          title="暂无带看预约"
          description="点击上方按钮预约新的带看"
        />
      )}
    </div>
  );
}

interface FollowUpsTabProps {
  followUps: FollowUpRecord[];
}

function FollowUpsTab({ followUps }: FollowUpsTabProps) {
  const [filterType, setFilterType] = useState<"all" | "today" | "overdue">("all");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filterType === "all"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部跟进
        </button>
        <button
          onClick={() => setFilterType("today")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filterType === "today"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          今日待跟进
        </button>
        <button
          onClick={() => setFilterType("overdue")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filterType === "overdue"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          逾期未跟进
        </button>
      </div>

      {followUps.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {followUps.map((followUp) => (
            <div key={followUp.id} className="py-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-medium text-sm">
                    {(followUp.clientName || "-").charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-medium text-gray-900">
                      {followUp.clientName}
                    </h4>
                    <Badge variant="info">{getFollowUpTypeLabel(followUp.type)}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {followUp.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>经纪人：{followUp.agentName}</span>
                    <span>跟进时间：{formatDateTime(followUp.createdAt)}</span>
                    {followUp.nextFollowUpAt && (
                      <span className="text-red-600">下次跟进：{formatDateTime(followUp.nextFollowUpAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600">
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare size={32} className="text-gray-400" />}
          title="暂无跟进记录"
          description="从客户管理中添加跟进记录"
        />
      )}
    </div>
  );
}

interface ContractsTabProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onView: (contract: Contract, type: "viewing" | "contract" | "commission") => void;
  onDelete: (contract: Contract, type: "viewing" | "contract") => void;
  onStatusChange: (contract: Contract, type: "viewing" | "contract" | "commission", status: string) => void;
}

function ContractsTab({ contracts, onEdit, onView, onDelete, onStatusChange }: ContractsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContracts = contracts.filter(
    (c) =>
      (c.contractNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜索合同号、房源、客户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredContracts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  合同编号
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  房源信息
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  客户/业主
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  金额
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-primary-600">{contract.contractNo}</p>
                    <p className="text-xs text-gray-500">
                      {contract.type === "sale" ? "买卖合同" : "租赁合同"}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {contract.propertyTitle}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900">{contract.clientName}</p>
                    <p className="text-xs text-gray-500">业主：{contract.ownerName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(contract.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      佣金：{formatCurrency(contract.commission)}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    {getContractStatusBadge(contract.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(contract, "contract")}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                      {contract.status === "draft" && (
                        <button
                          onClick={() => onEdit(contract)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {contract.status === "draft" && (
                        <button
                          onClick={() => onStatusChange(contract, "contract", "signed")}
                          className="px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          签约
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FileText size={32} className="text-gray-400" />}
          title="暂无合同记录"
          description="点击上方按钮新建合同"
        />
      )}
    </div>
  );
}

interface CommissionTabProps {
  commissions: Commission[];
  onView: (commission: Commission, type: "viewing" | "contract" | "commission") => void;
  onStatusChange: (commission: Commission, type: "viewing" | "contract" | "commission", status: string) => void;
}

function CommissionTab({ commissions, onView, onStatusChange }: CommissionTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">待审核佣金</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {formatCurrency(
              commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0)
            )}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {commissions.filter((c) => c.status === "pending").length} 笔待审核
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">已批准待发放</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {formatCurrency(
              commissions.filter((c) => c.status === "approved").reduce((sum, c) => sum + c.amount, 0)
            )}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {commissions.filter((c) => c.status === "approved").length} 笔待发放
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">已发放佣金</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {formatCurrency(
              commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amount, 0)
            )}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {commissions.filter((c) => c.status === "paid").length} 笔已发放
          </p>
        </div>
      </div>

      {commissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  合同编号
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  经纪人
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  佣金金额
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  提成比例
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  发放时间
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission) => (
                <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-primary-600">{commission.contractNo}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{commission.agentName}</td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(commission.amount)}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    {(commission.rate * 100).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4">
                    {getCommissionStatusBadge(commission.status)}
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {commission.paidAt ? formatDate(commission.paidAt) : "-"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {commission.status === "pending" && (
                        <>
                          <button
                            onClick={() => onStatusChange(commission, "commission", "approved")}
                            className="p-1.5 hover:bg-green-100 rounded text-green-600"
                            title="批准"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => onStatusChange(commission, "commission", "rejected")}
                            className="p-1.5 hover:bg-red-100 rounded text-red-600"
                            title="驳回"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {commission.status === "approved" && (
                        <button
                          onClick={() => onStatusChange(commission, "commission", "paid")}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          确认发放
                        </button>
                      )}
                      <button
                        onClick={() => onView(commission, "commission")}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<DollarSign size={32} className="text-gray-400" />}
          title="暂无佣金记录"
          description="合同签约后将自动生成佣金记录"
        />
      )}
    </div>
  );
}
