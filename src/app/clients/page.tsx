"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Calendar,
  Tag,
  User,
  Users,
  TrendingUp,
  Clock,
  Trash2,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { mockClients, mockFollowUpRecords, mockUsers } from "@/data/mockData";
import { Client, ClientStatus, ClientType, FollowUpRecord } from "@/types";
import { formatCurrency, maskPhone, formatDateTime, formatDate, maskIdCard } from "@/lib/utils";
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

const getStatusBadge = (status: ClientStatus) => {
  const statusMap: Record<ClientStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
    active: { label: "活跃", variant: "success" },
    inactive: { label: "不活跃", variant: "secondary" },
    lost: { label: "已流失", variant: "danger" },
    converted: { label: "已成交", variant: "info" },
  };
  const info = statusMap[status];
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

const getTypeLabel = (type: ClientType) => {
  const typeMap: Record<ClientType, string> = {
    buyer: "购房客户",
    tenant: "租房客户",
    both: "购房/租房",
  };
  return typeMap[type];
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

const clientStatusOptions = [
  { value: "active", label: "活跃" },
  { value: "inactive", label: "不活跃" },
  { value: "lost", label: "已流失" },
  { value: "converted", label: "已成交" },
];

const clientTypeOptions = [
  { value: "buyer", label: "购房客户" },
  { value: "tenant", label: "租房客户" },
  { value: "both", label: "购房/租房" },
];

const sourceOptions = [
  { value: "网络推广", label: "网络推广" },
  { value: "转介绍", label: "转介绍" },
  { value: "门店接待", label: "门店接待" },
  { value: "电话咨询", label: "电话咨询" },
  { value: "其他", label: "其他" },
];

const followUpTypeOptions = [
  { value: "phone", label: "电话" },
  { value: "wechat", label: "微信" },
  { value: "visit", label: "到访" },
  { value: "viewing", label: "带看" },
  { value: "other", label: "其他" },
];

interface ClientFormData {
  name: string;
  phone: string;
  idCard: string;
  type: ClientType;
  status: ClientStatus;
  source: string;
  tags: string;
  notes: string;
  budgetMin: string;
  budgetMax: string;
  preferredAreas: string;
  assignedAgentId: string;
}

interface FollowUpFormData {
  type: string;
  content: string;
  nextFollowUpAt: string;
}

const initialClientFormData: ClientFormData = {
  name: "",
  phone: "",
  idCard: "",
  type: "buyer",
  status: "active",
  source: "网络推广",
  tags: "",
  notes: "",
  budgetMin: "",
  budgetMax: "",
  preferredAreas: "",
  assignedAgentId: "",
};

const initialFollowUpFormData: FollowUpFormData = {
  type: "phone",
  content: "",
  nextFollowUpAt: "",
};

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");
  const [activeTab, setActiveTab] = useState<"all" | "sea">("all");

  const [localClients, setLocalClients] = useState<Client[]>(mockClients);
  const [localFollowUps, setLocalFollowUps] = useState<FollowUpRecord[]>(mockFollowUpRecords);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSeaActionModalOpen, setIsSeaActionModalOpen] = useState(false);
  const [seaAction, setSeaAction] = useState<"take" | "move">("take");

  const [clientFormData, setClientFormData] = useState<ClientFormData>(initialClientFormData);
  const [followUpFormData, setFollowUpFormData] = useState<FollowUpFormData>(initialFollowUpFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClients = localClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;
    const matchesType =
      typeFilter === "all" || client.type === typeFilter;
    const matchesTab =
      activeTab === "all" || (activeTab === "sea" ? client.inSea : !client.inSea);
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const agentOptions = mockUsers
    .filter((u) => u.roles.some((r) => r.name === "经纪人" || r.name === "店长"))
    .map((u) => ({ value: u.id, label: u.name }));

  const handleAddClient = () => {
    setSelectedClient(null);
    setClientFormData(initialClientFormData);
    setIsAddModalOpen(true);
  };

  const handleViewDetail = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setClientFormData({
      name: client.name,
      phone: client.phone,
      idCard: client.idCard || "",
      type: client.type,
      status: client.status,
      source: client.source,
      tags: client.tags.join(", "),
      notes: client.notes || "",
      budgetMin: client.budgetMin?.toString() || "",
      budgetMax: client.budgetMax?.toString() || "",
      preferredAreas: client.preferredAreas?.join(", ") || "",
      assignedAgentId: client.assignedAgent?.id || "",
    });
    setIsEditModalOpen(true);
  };

  const handleAddFollowUp = (client: Client) => {
    setSelectedClient(client);
    setFollowUpFormData(initialFollowUpFormData);
    setIsFollowUpModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleSeaAction = (client: Client, action: "take" | "move") => {
    setSelectedClient(client);
    setSeaAction(action);
    setIsSeaActionModalOpen(true);
  };

  const confirmSeaAction = () => {
    if (!selectedClient) return;

    setLocalClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              inSea: seaAction === "move",
              assignedAgent: seaAction === "take" ? mockUsers[0] : null,
            }
          : c
      )
    );
    setIsSeaActionModalOpen(false);
    setSelectedClient(null);
  };

  const confirmDelete = () => {
    if (!selectedClient) return;
    setLocalClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
  };

  const handleSubmitClient = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isAddModalOpen) {
      const newClient: Client = {
        id: `client-${Date.now()}`,
        name: clientFormData.name,
        phone: clientFormData.phone,
        idCard: clientFormData.idCard || undefined,
        type: clientFormData.type,
        status: clientFormData.status,
        source: clientFormData.source,
        tags: clientFormData.tags.split(",").map((s) => s.trim()).filter(Boolean),
        notes: clientFormData.notes || undefined,
        budgetMin: clientFormData.budgetMin ? parseFloat(clientFormData.budgetMin) : undefined,
        budgetMax: clientFormData.budgetMax ? parseFloat(clientFormData.budgetMax) : undefined,
        preferredAreas: clientFormData.preferredAreas
          ? clientFormData.preferredAreas.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        assignedAgent: clientFormData.assignedAgentId
          ? mockUsers.find((u) => u.id === clientFormData.assignedAgentId) || null
          : null,
        inSea: !clientFormData.assignedAgentId,
        followUpCount: 0,
        dealCount: 0,
        totalDealAmount: 0,
        lastFollowUpAt: undefined,
        nextFollowUp: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalClients((prev) => [newClient, ...prev]);
      setIsAddModalOpen(false);
    } else if (isEditModalOpen && selectedClient) {
      setLocalClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                name: clientFormData.name,
                phone: clientFormData.phone,
                idCard: clientFormData.idCard || undefined,
                type: clientFormData.type,
                status: clientFormData.status,
                source: clientFormData.source,
                tags: clientFormData.tags.split(",").map((s) => s.trim()).filter(Boolean),
                notes: clientFormData.notes || undefined,
                budgetMin: clientFormData.budgetMin ? parseFloat(clientFormData.budgetMin) : undefined,
                budgetMax: clientFormData.budgetMax ? parseFloat(clientFormData.budgetMax) : undefined,
                preferredAreas: clientFormData.preferredAreas
                  ? clientFormData.preferredAreas.split(",").map((s) => s.trim()).filter(Boolean)
                  : undefined,
                assignedAgent: clientFormData.assignedAgentId
                  ? mockUsers.find((u) => u.id === clientFormData.assignedAgentId) || null
                  : c.assignedAgent,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      setIsEditModalOpen(false);
    }

    setClientFormData(initialClientFormData);
    setSelectedClient(null);
    setIsSubmitting(false);
  };

  const handleSubmitFollowUp = async () => {
    if (!selectedClient) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newFollowUp: FollowUpRecord = {
      id: `followup-${Date.now()}`,
      clientId: selectedClient.id,
      agentId: mockUsers[0].id,
      agent: mockUsers[0],
      type: followUpFormData.type,
      content: followUpFormData.content,
      createdAt: new Date().toISOString(),
      nextFollowUpAt: followUpFormData.nextFollowUpAt || undefined,
    };

    setLocalFollowUps((prev) => [newFollowUp, ...prev]);
    setLocalClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              followUpCount: c.followUpCount + 1,
              lastFollowUpAt: new Date().toISOString(),
              nextFollowUp: followUpFormData.nextFollowUpAt || c.nextFollowUp,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setIsFollowUpModalOpen(false);
    setFollowUpFormData(initialFollowUpFormData);
    setSelectedClient(null);
    setIsSubmitting(false);
  };

  const getClientFollowUps = (clientId: string) => {
    return localFollowUps.filter((r) => r.clientId === clientId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
          <p className="text-gray-500 mt-1">管理客户线索、跟进记录和公海分配</p>
        </div>
        <Button onClick={handleAddClient} className="flex items-center gap-2">
          <Plus size={18} />
          新增客户
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总客户数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{localClients.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">活跃客户</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {localClients.filter((c) => c.status === "active").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">公海客户</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {localClients.filter((c) => c.inSea).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待跟进</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {localClients.filter((c) => c.nextFollowUp).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全部客户
            </button>
            <button
              onClick={() => setActiveTab("sea")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "sea"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              公海池
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {localClients.filter((c) => c.inSea).length}
              </span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="搜索客户姓名、电话..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ClientStatus | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">全部状态</option>
                {clientStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as ClientType | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">全部类型</option>
                {clientTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter size={18} />
                更多筛选
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共 <span className="font-medium text-gray-900">{filteredClients.length}</span> 位客户
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              导出列表
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              批量操作
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              followUps={getClientFollowUps(client.id)}
              onView={handleViewDetail}
              onEdit={handleEditClient}
              onAddFollowUp={handleAddFollowUp}
              onDelete={handleDeleteClient}
              onSeaAction={handleSeaAction}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <EmptyState
            icon={<User size={32} className="text-gray-400" />}
            title="暂无符合条件的客户"
            description="尝试调整筛选条件或添加新的客户"
            action={
              <Button onClick={handleAddClient} className="flex items-center gap-2">
                <Plus size={16} />
                新增客户
              </Button>
            }
          />
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setClientFormData(initialClientFormData);
        }}
        title={isAddModalOpen ? "新增客户" : "编辑客户"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setClientFormData(initialClientFormData);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitClient} loading={isSubmitting}>
              {isAddModalOpen ? "保存客户" : "更新客户"}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="客户姓名" required>
              <Input
                value={clientFormData.name}
                onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                placeholder="请输入客户姓名"
              />
            </FormField>
            <FormField label="联系电话" required>
              <Input
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="身份证号" helperText="用于隐私脱敏，选填">
              <Input
                value={clientFormData.idCard}
                onChange={(e) => setClientFormData({ ...clientFormData, idCard: e.target.value })}
                placeholder="请输入身份证号"
              />
            </FormField>
            <FormField label="客户类型" required>
              <Select
                options={clientTypeOptions}
                value={clientFormData.type}
                onChange={(e) =>
                  setClientFormData({ ...clientFormData, type: e.target.value as ClientType })
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="客户状态" required>
              <Select
                options={clientStatusOptions}
                value={clientFormData.status}
                onChange={(e) =>
                  setClientFormData({ ...clientFormData, status: e.target.value as ClientStatus })
                }
              />
            </FormField>
            <FormField label="来源渠道" required>
              <Select
                options={sourceOptions}
                value={clientFormData.source}
                onChange={(e) => setClientFormData({ ...clientFormData, source: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="预算下限">
              <Input
                type="number"
                value={clientFormData.budgetMin}
                onChange={(e) => setClientFormData({ ...clientFormData, budgetMin: e.target.value })}
                placeholder="请输入预算下限"
              />
            </FormField>
            <FormField label="预算上限">
              <Input
                type="number"
                value={clientFormData.budgetMax}
                onChange={(e) => setClientFormData({ ...clientFormData, budgetMax: e.target.value })}
                placeholder="请输入预算上限"
              />
            </FormField>
          </div>

          <FormField label="意向区域" helperText="多个区域用逗号分隔">
            <Input
              value={clientFormData.preferredAreas}
              onChange={(e) => setClientFormData({ ...clientFormData, preferredAreas: e.target.value })}
              placeholder="例如: 朝阳区, 海淀区, 丰台区"
            />
          </FormField>

          <FormField label="客户标签" helperText="多个标签用逗号分隔">
            <Input
              value={clientFormData.tags}
              onChange={(e) => setClientFormData({ ...clientFormData, tags: e.target.value })}
              placeholder="例如: 刚需, 改善, 投资"
            />
          </FormField>

          <FormField label="分配经纪人">
            <Select
              options={[{ value: "", label: "不分配（放入公海）" }, ...agentOptions]}
              value={clientFormData.assignedAgentId}
              onChange={(e) => setClientFormData({ ...clientFormData, assignedAgentId: e.target.value })}
              placeholder="请选择经纪人"
            />
          </FormField>

          <FormField label="备注信息">
            <Textarea
              value={clientFormData.notes}
              onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
              placeholder="请输入备注信息"
              rows={4}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen && !!selectedClient}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClient(null);
        }}
        title="客户详情"
        size="xl"
        footer={
          selectedClient && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleAddFollowUp(selectedClient);
                }}
                className="flex items-center gap-2"
              >
                <MessageSquare size={16} />
                添加跟进
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditClient(selectedClient);
                }}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                编辑客户
              </Button>
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false);
                }}
              >
                关闭
              </Button>
            </>
          )
        }
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-medium text-2xl">
                  {selectedClient.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedClient.name}
                  </h3>
                  {getStatusBadge(selectedClient.status)}
                  <Badge variant="info">{getTypeLabel(selectedClient.type)}</Badge>
                  {selectedClient.inSea && <Badge variant="warning">公海池</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {maskPhone(selectedClient.phone)}
                  </span>
                  {selectedClient.idCard && (
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {maskIdCard(selectedClient.idCard)}
                    </span>
                  )}
                  <span>来源：{selectedClient.source}</span>
                  {selectedClient.assignedAgent && (
                    <span>负责人：{selectedClient.assignedAgent.name}</span>
                  )}
                </div>
                {selectedClient.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedClient.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">跟进次数</p>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.followUpCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">成交次数</p>
                <p className="text-2xl font-bold text-green-600">{selectedClient.dealCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">成交金额</p>
                <p className="text-xl font-bold text-primary-600">
                  {selectedClient.totalDealAmount > 0
                    ? formatCurrency(selectedClient.totalDealAmount)
                    : "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">下次跟进</p>
                <p className="text-sm font-medium text-red-600">
                  {selectedClient.nextFollowUp
                    ? formatDateTime(selectedClient.nextFollowUp)
                    : "-"}
                </p>
              </div>
            </div>

            {(selectedClient.budgetMin || selectedClient.budgetMax || selectedClient.preferredAreas) && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">需求信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(selectedClient.budgetMin || selectedClient.budgetMax) && (
                    <div>
                      <p className="text-sm text-gray-500">预算</p>
                      <p className="font-medium">
                        {selectedClient.budgetMin
                          ? `${formatCurrency(selectedClient.budgetMin)} - `
                          : ""}
                        {selectedClient.budgetMax
                          ? formatCurrency(selectedClient.budgetMax)
                          : ""}
                      </p>
                    </div>
                  )}
                  {selectedClient.preferredAreas && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">意向区域</p>
                      <p className="font-medium">{selectedClient.preferredAreas.join("、")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedClient.notes && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">备注</h4>
                <p className="text-gray-600">{selectedClient.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">跟进记录</h4>
              {getClientFollowUps(selectedClient.id).length > 0 ? (
                <div className="space-y-3">
                  {getClientFollowUps(selectedClient.id).slice(0, 10).map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-medium text-xs">
                          {followUp.agent.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {followUp.agent.name}
                          </span>
                          <Badge variant="info">
                            {getFollowUpTypeLabel(followUp.type)}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {formatDateTime(followUp.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{followUp.content}</p>
                        {followUp.nextFollowUpAt && (
                          <p className="text-xs text-red-500 mt-1">
                            下次跟进：{formatDateTime(followUp.nextFollowUpAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<MessageSquare size={24} className="text-gray-400" />}
                  title="暂无跟进记录"
                  description="点击下方按钮添加第一条跟进记录"
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleAddFollowUp(selectedClient);
                      }}
                    >
                      添加跟进
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isFollowUpModalOpen && !!selectedClient}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setFollowUpFormData(initialFollowUpFormData);
        }}
        title={`添加跟进记录 - ${selectedClient?.name}`}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsFollowUpModalOpen(false);
                setFollowUpFormData(initialFollowUpFormData);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitFollowUp} loading={isSubmitting}>
              保存跟进
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <FormField label="跟进方式" required>
            <Select
              options={followUpTypeOptions}
              value={followUpFormData.type}
              onChange={(e) => setFollowUpFormData({ ...followUpFormData, type: e.target.value })}
            />
          </FormField>

          <FormField label="跟进内容" required>
            <Textarea
              value={followUpFormData.content}
              onChange={(e) => setFollowUpFormData({ ...followUpFormData, content: e.target.value })}
              placeholder="请输入跟进内容详情"
              rows={6}
            />
          </FormField>

          <FormField label="下次跟进时间" helperText="选填，设置后将在客户列表中提醒">
            <Input
              type="datetime-local"
              value={followUpFormData.nextFollowUpAt}
              onChange={(e) => setFollowUpFormData({ ...followUpFormData, nextFollowUpAt: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isSeaActionModalOpen && !!selectedClient}
        onClose={() => {
          setIsSeaActionModalOpen(false);
          setSelectedClient(null);
        }}
        title={seaAction === "take" ? "确认领取客户" : "确认移入公海"}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsSeaActionModalOpen(false);
                setSelectedClient(null);
              }}
            >
              取消
            </Button>
            <Button onClick={confirmSeaAction}>
              {seaAction === "take" ? "确认领取" : "确认移入"}
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-primary-600" />
          </div>
          <p className="text-gray-900 font-medium mb-2">
            {seaAction === "take"
              ? `确认将客户「${selectedClient?.name}」领取到自己名下？`
              : `确认将客户「${selectedClient?.name}」移入公海池？`}
          </p>
          <p className="text-gray-500 text-sm">
            {seaAction === "take"
              ? "领取后该客户将分配给您负责"
              : "移入公海后，其他经纪人可以领取该客户"}
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen && !!selectedClient}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedClient(null);
        }}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedClient(null);
              }}
            >
              取消
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <p className="text-gray-900 font-medium mb-2">确认删除该客户？</p>
          <p className="text-gray-500 text-sm">{selectedClient?.name}</p>
          <p className="text-red-500 text-sm mt-2">此操作不可撤销</p>
        </div>
      </Modal>
    </div>
  );
}

interface ClientCardProps {
  client: Client;
  followUps: FollowUpRecord[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onAddFollowUp: (client: Client) => void;
  onDelete: (client: Client) => void;
  onSeaAction: (client: Client, action: "take" | "move") => void;
}

function ClientCard({
  client,
  followUps,
  onView,
  onEdit,
  onAddFollowUp,
  onDelete,
  onSeaAction,
}: ClientCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary-200 transition-colors"
            onClick={() => onView(client)}
          >
            <span className="text-primary-700 font-medium text-lg">
              {client.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-lg font-medium text-gray-900 cursor-pointer hover:text-primary-600"
                onClick={() => onView(client)}
              >
                {client.name}
              </h3>
              {getStatusBadge(client.status)}
              <Badge variant="info">{getTypeLabel(client.type)}</Badge>
              {client.inSea && <Badge variant="warning">公海池</Badge>}
              {client.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {maskPhone(client.phone)}
              </span>
              <span>来源：{client.source}</span>
              {client.assignedAgent && (
                <span>负责人：{client.assignedAgent.name}</span>
              )}
            </div>
          </div>
        </div>

        <div className="md:ml-auto flex flex-wrap items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">跟进次数</p>
            <p className="text-lg font-medium text-gray-900">{client.followUpCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">成交次数</p>
            <p className="text-lg font-medium text-green-600">{client.dealCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">成交金额</p>
            <p className="text-lg font-medium text-primary-600">
              {client.totalDealAmount > 0
                ? formatCurrency(client.totalDealAmount)
                : "-"}
            </p>
          </div>
          {client.nextFollowUp && (
            <div className="text-center">
              <p className="text-xs text-gray-500">下次跟进</p>
              <p className="text-sm font-medium text-red-600">
                {formatDateTime(client.nextFollowUp)}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(client)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
            title="查看详情"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(client)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
            title="编辑信息"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onAddFollowUp(client)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"
            title="添加跟进"
          >
            <MessageSquare size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              title="更多操作"
            >
              <MoreHorizontal size={18} />
            </button>
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {client.inSea ? (
                    <button
                      onClick={() => {
                        setShowActions(false);
                        onSeaAction(client, "take");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Users size={14} />
                      领取客户
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowActions(false);
                        onSeaAction(client, "move");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Users size={14} />
                      移入公海
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onAddFollowUp(client);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Calendar size={14} />
                    预约带看
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onDelete(client);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    删除客户
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {followUps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 ml-16">
          <p className="text-xs text-gray-500 mb-2">最近跟进</p>
          <div className="space-y-2">
            {followUps.slice(0, 2).map((followUp) => (
              <div
                key={followUp.id}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDateTime(followUp.createdAt)}
                </span>
                <Badge variant="info">{getFollowUpTypeLabel(followUp.type)}</Badge>
                <span className="text-gray-600 line-clamp-1">
                  {followUp.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {client.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100 ml-16">
          <p className="text-xs text-gray-500 mb-1">备注</p>
          <p className="text-sm text-gray-600">{client.notes}</p>
        </div>
      )}
    </div>
  );
}
