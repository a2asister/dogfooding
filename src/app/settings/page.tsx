"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Bell,
  Upload,
  Code,
  Settings,
  GripVertical,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Key,
  Copy,
  TrendingUp,
  HardDrive,
  AlertCircle,
  User,
  Calendar,
  EyeOff,
} from "lucide-react";
import { mockDictionaries, mockReminders } from "@/data/mockData";
import { Dictionary, Reminder } from "@/types";
import { formatDateTime } from "@/lib/utils";
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

const reminderTypeOptions = [
  { value: "viewing", label: "带看提醒" },
  { value: "follow_up", label: "跟进提醒" },
  { value: "contract", label: "合同提醒" },
  { value: "birthday", label: "生日祝福" },
  { value: "other", label: "其他提醒" },
];

const dictStatusOptions = [
  { value: "active", label: "启用" },
  { value: "inactive", label: "禁用" },
];

const getTypeBadge = (type: string) => {
  const map: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
    viewing: { label: "带看提醒", variant: "info" },
    follow_up: { label: "跟进提醒", variant: "warning" },
    contract: { label: "合同提醒", variant: "success" },
    birthday: { label: "生日祝福", variant: "secondary" },
    other: { label: "其他提醒", variant: "secondary" },
  };
  const info = map[type] || map["other"];
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"dictionaries" | "reminders" | "files" | "api">("dictionaries");

  const [localDictionaries, setLocalDictionaries] = useState<Dictionary[]>(mockDictionaries);
  const [localReminders, setLocalReminders] = useState<Reminder[]>(mockReminders);

  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [isDictItemModalOpen, setIsDictItemModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedDict, setSelectedDict] = useState<string | null>(null);
  const [selectedDictItem, setSelectedDictItem] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<"dictionary" | "dictItem" | "reminder" | "file" | "api">("dictionary");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dictFormData, setDictFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [dictItemFormData, setDictItemFormData] = useState({
    label: "",
    value: "",
    sort: 0,
    status: "active" as "active" | "inactive",
  });

  const [reminderFormData, setReminderFormData] = useState({
    title: "",
    content: "",
    type: "other" as string,
    scheduledAt: "",
    targetType: "",
    targetId: "",
  });

  const selectedDictionary = localDictionaries.find((d) => d.id === selectedDict);

  const handleAddDictionary = () => {
    setIsEditMode(false);
    setModalType("dictionary");
    setDictFormData({
      name: "",
      code: "",
      description: "",
    });
    setIsDictModalOpen(true);
  };

  const handleEditDictionary = () => {
    if (!selectedDictionary) return;
    setIsEditMode(true);
    setModalType("dictionary");
    setSelectedItem(selectedDictionary);
    setDictFormData({
      name: selectedDictionary.name || "",
      code: selectedDictionary.code || "",
      description: selectedDictionary.description || "",
    });
    setIsDictModalOpen(true);
  };

  const handleAddDictItem = () => {
    setIsEditMode(false);
    setModalType("dictItem");
    setDictItemFormData({
      label: "",
      value: "",
      sort: 0,
      status: "active",
    });
    setIsDictItemModalOpen(true);
  };

  const handleEditDictItem = (item: any) => {
    setIsEditMode(true);
    setModalType("dictItem");
    setSelectedDictItem(item);
    setDictItemFormData({
      label: item.label || "",
      value: item.value || "",
      sort: item.sort || 0,
      status: item.status || "active",
    });
    setIsDictItemModalOpen(true);
  };

  const handleAddReminder = () => {
    setIsEditMode(false);
    setModalType("reminder");
    setReminderFormData({
      title: "",
      content: "",
      type: "other",
      scheduledAt: "",
      targetType: "",
      targetId: "",
    });
    setIsReminderModalOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setIsEditMode(true);
    setModalType("reminder");
    setSelectedItem(reminder);
    setReminderFormData({
      title: reminder.title || "",
      content: reminder.content || "",
      type: reminder.type || "other",
      scheduledAt: reminder.scheduledAt ? new Date(reminder.scheduledAt).toISOString().slice(0, 16) : "",
      targetType: reminder.targetType || "",
      targetId: reminder.targetId || "",
    });
    setIsReminderModalOpen(true);
  };

  const handleViewDetail = (item: any, type: "reminder" | "file") => {
    setSelectedItem(item);
    setModalType(type);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (item: any, type: "dictionary" | "dictItem" | "reminder" | "file") => {
    setSelectedItem(item);
    setModalType(type);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (modalType === "dictionary") {
      setLocalDictionaries((prev) => prev.filter((d) => d.id !== selectedItem.id));
      if (selectedDict === selectedItem.id) {
        setSelectedDict(null);
      }
    } else if (modalType === "dictItem") {
      setLocalDictionaries((prev) =>
        prev.map((d) =>
          d.id === selectedDict
            ? { ...d, items: d.items.filter((i) => i.id !== selectedItem.id) }
            : d
        )
      );
    } else if (modalType === "reminder") {
      setLocalReminders((prev) => prev.filter((r) => r.id !== selectedItem.id));
    }

    setIsSubmitting(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitDictionary = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isEditMode && selectedItem) {
      setLocalDictionaries((prev) =>
        prev.map((d) =>
          d.id === selectedItem.id
            ? {
                ...d,
                name: dictFormData.name,
                code: dictFormData.code,
                description: dictFormData.description,
              }
            : d
        )
      );
    } else {
      const newDict: Dictionary = {
        id: `dict-${Date.now()}`,
        name: dictFormData.name,
        code: dictFormData.code,
        description: dictFormData.description,
        items: [],
        createdAt: new Date().toISOString(),
      };
      setLocalDictionaries((prev) => [newDict, ...prev]);
    }

    setIsSubmitting(false);
    setIsDictModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitDictItem = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isEditMode && selectedDictItem) {
      setLocalDictionaries((prev) =>
        prev.map((d) =>
          d.id === selectedDict
            ? {
                ...d,
                items: d.items.map((i) =>
                  i.id === selectedDictItem.id
                    ? {
                        ...i,
                        label: dictItemFormData.label,
                        value: dictItemFormData.value,
                        sort: dictItemFormData.sort,
                        status: dictItemFormData.status,
                      }
                    : i
                ),
              }
            : d
        )
      );
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        label: dictItemFormData.label,
        value: dictItemFormData.value,
        sort: dictItemFormData.sort,
        status: dictItemFormData.status,
      };
      setLocalDictionaries((prev) =>
        prev.map((d) =>
          d.id === selectedDict
            ? { ...d, items: [...d.items, newItem] }
            : d
        )
      );
    }

    setIsSubmitting(false);
    setIsDictItemModalOpen(false);
    setSelectedDictItem(null);
  };

  const handleSubmitReminder = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isEditMode && selectedItem) {
      setLocalReminders((prev) =>
        prev.map((r) =>
          r.id === selectedItem.id
            ? {
                ...r,
                title: reminderFormData.title,
                content: reminderFormData.content,
                type: reminderFormData.type,
                scheduledAt: reminderFormData.scheduledAt,
              }
            : r
        )
      );
    } else {
      const newReminder: Reminder = {
        id: `reminder-${Date.now()}`,
        title: reminderFormData.title,
        content: reminderFormData.content,
        type: reminderFormData.type,
        scheduledAt: reminderFormData.scheduledAt,
        targetType: reminderFormData.targetType,
        targetId: reminderFormData.targetId,
        isRead: false,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      } as Reminder;
      setLocalReminders((prev) => [newReminder, ...prev]);
    }

    setIsSubmitting(false);
    setIsReminderModalOpen(false);
    setSelectedItem(null);
  };

  const toggleReminderRead = (reminder: Reminder) => {
    setLocalReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, isRead: !r.isRead } : r
      )
    );
  };

  const toggleReminderComplete = (reminder: Reminder) => {
    setLocalReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, isCompleted: !r.isCompleted } : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统配置</h1>
          <p className="text-gray-500 mt-1">字典管理、提醒设置、文件存储、开放 API</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dictionaries")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "dictionaries"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              字典管理
            </div>
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "reminders"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell size={18} />
              提醒设置
            </div>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "files"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload size={18} />
              文件存储
            </div>
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "api"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Code size={18} />
              开放 API
            </div>
          </button>
        </div>

        <div className="p-4">
          {activeTab === "dictionaries" && (
            <DictionariesTab
              dictionaries={localDictionaries}
              selectedDict={selectedDict}
              onSelectDict={setSelectedDict}
              onAddDict={handleAddDictionary}
              onEditDict={handleEditDictionary}
              onDeleteDict={(dict) => handleDelete(dict, "dictionary")}
              onAddItem={handleAddDictItem}
              onEditItem={handleEditDictItem}
              onDeleteItem={(item) => handleDelete(item, "dictItem")}
            />
          )}
          {activeTab === "reminders" && (
            <RemindersTab
              reminders={localReminders}
              onAdd={handleAddReminder}
              onEdit={handleEditReminder}
              onDelete={(r) => handleDelete(r, "reminder")}
              onView={(r) => handleViewDetail(r, "reminder")}
              onToggleRead={toggleReminderRead}
              onToggleComplete={toggleReminderComplete}
            />
          )}
          {activeTab === "files" && <FilesTab />}
          {activeTab === "api" && <ApiTab />}
        </div>
      </div>

      <Modal
        isOpen={isDictModalOpen}
        onClose={() => {
          setIsDictModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑字典" : "新增字典"}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDictModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitDictionary} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建字典"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="字典名称" required>
            <Input
              value={dictFormData.name}
              onChange={(e) => setDictFormData({ ...dictFormData, name: e.target.value })}
              placeholder="请输入字典名称"
            />
          </FormField>
          <FormField label="字典编码" required>
            <Input
              value={dictFormData.code}
              onChange={(e) => setDictFormData({ ...dictFormData, code: e.target.value })}
              placeholder="请输入字典编码（如：property_type）"
            />
          </FormField>
          <FormField label="字典描述">
            <Textarea
              value={dictFormData.description}
              onChange={(e) => setDictFormData({ ...dictFormData, description: e.target.value })}
              placeholder="请输入字典描述"
              rows={3}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isDictItemModalOpen}
        onClose={() => {
          setIsDictItemModalOpen(false);
          setSelectedDictItem(null);
        }}
        title={isEditMode ? "编辑字典选项" : "新增字典选项"}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDictItemModalOpen(false);
                setSelectedDictItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitDictItem} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建选项"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="选项标签" required>
              <Input
                value={dictItemFormData.label}
                onChange={(e) => setDictItemFormData({ ...dictItemFormData, label: e.target.value })}
                placeholder="请输入选项标签"
              />
            </FormField>
            <FormField label="选项值" required>
              <Input
                value={dictItemFormData.value}
                onChange={(e) => setDictItemFormData({ ...dictItemFormData, value: e.target.value })}
                placeholder="请输入选项值"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="排序">
              <Input
                type="number"
                value={dictItemFormData.sort || ""}
                onChange={(e) => setDictItemFormData({ ...dictItemFormData, sort: parseInt(e.target.value) || 0 })}
                placeholder="数字越小越靠前"
              />
            </FormField>
            <FormField label="状态">
              <Select
                options={dictStatusOptions}
                value={dictItemFormData.status}
                onChange={(e) => setDictItemFormData({ ...dictItemFormData, status: e.target.value as "active" | "inactive" })}
              />
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑提醒" : "新增提醒"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsReminderModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitReminder} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建提醒"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="提醒标题" required>
            <Input
              value={reminderFormData.title}
              onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
              placeholder="请输入提醒标题"
            />
          </FormField>
          <FormField label="提醒内容">
            <Textarea
              value={reminderFormData.content}
              onChange={(e) => setReminderFormData({ ...reminderFormData, content: e.target.value })}
              placeholder="请输入提醒内容"
              rows={3}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="提醒类型" required>
              <Select
                options={reminderTypeOptions}
                value={reminderFormData.type}
                onChange={(e) => setReminderFormData({ ...reminderFormData, type: e.target.value })}
              />
            </FormField>
            <FormField label="提醒时间" required>
              <Input
                type="datetime-local"
                value={reminderFormData.scheduledAt}
                onChange={(e) => setReminderFormData({ ...reminderFormData, scheduledAt: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen && !!selectedItem}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        title={modalType === "reminder" ? "提醒详情" : "文件详情"}
        size="lg"
      >
        {selectedItem && modalType === "reminder" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">标题</p>
                <p className="font-medium text-gray-900">{selectedItem.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">类型</p>
                {getTypeBadge(selectedItem.type)}
              </div>
              <div>
                <p className="text-sm text-gray-500">提醒时间</p>
                <p className="font-medium text-gray-900">{formatDateTime(selectedItem.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                <div className="flex gap-2">
                  {selectedItem.isRead ? (
                    <Badge variant="success">已读</Badge>
                  ) : (
                    <Badge variant="warning">未读</Badge>
                  )}
                  {selectedItem.isCompleted ? (
                    <Badge variant="success">已完成</Badge>
                  ) : (
                    <Badge variant="info">待处理</Badge>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">提醒内容</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{selectedItem.content}</p>
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
            确认删除该{modalType === "dictionary" ? "字典" : modalType === "dictItem" ? "字典选项" : "提醒"}？
          </p>
          <p className="text-gray-500 text-sm">
            {selectedItem?.name || selectedItem?.label || selectedItem?.title}
          </p>
          <p className="text-red-500 text-sm mt-2">此操作不可撤销</p>
        </div>
      </Modal>
    </div>
  );
}

interface DictionariesTabProps {
  dictionaries: Dictionary[];
  selectedDict: string | null;
  onSelectDict: (id: string) => void;
  onAddDict: () => void;
  onEditDict: () => void;
  onDeleteDict: (dict: Dictionary) => void;
  onAddItem: () => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
}

function DictionariesTab({
  dictionaries,
  selectedDict,
  onSelectDict,
  onAddDict,
  onEditDict,
  onDeleteDict,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: DictionariesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDicts = dictionaries.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDictionary = dictionaries.find((d) => d.id === selectedDict);

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
            placeholder="搜索字典名称、编码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <Button onClick={onAddDict} className="flex items-center gap-2">
          <Plus size={18} />
          新增字典
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">字典列表</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredDicts.length > 0 ? (
                filteredDicts.map((dict) => (
                  <button
                    key={dict.id}
                    onClick={() => onSelectDict(dict.id)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedDict === dict.id ? "bg-primary-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{dict.name}</p>
                        <p className="text-xs text-gray-500">编码：{dict.code}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {dict.items.length} 项
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <BookOpen size={24} className="mx-auto mb-2" />
                  <p>暂无字典数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedDictionary ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{selectedDictionary.name}</p>
                  <p className="text-sm text-gray-500">{selectedDictionary.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={onAddItem} className="text-sm px-3 py-1.5 flex items-center gap-1">
                    <Plus size={14} />
                    新增选项
                  </Button>
                  <Button variant="secondary" onClick={onEditDict} className="p-2">
                    <Edit size={16} />
                  </Button>
                  <Button variant="danger" onClick={() => onDeleteDict(selectedDictionary)} className="p-2">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {selectedDictionary.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          排序
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          标签
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          值
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
                      {selectedDictionary.items
                        .sort((a, b) => a.sort - b.sort)
                        .map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className="text-gray-400">{item.sort}</span>
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {item.label}
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                              {item.value}
                            </td>
                            <td className="py-3 px-4">
                              {item.status === "active" ? (
                                <Badge variant="success">启用</Badge>
                              ) : (
                                <Badge variant="secondary">禁用</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onEditItem(item)}
                                  className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => onDeleteItem(item)}
                                  className="p-1.5 hover:bg-red-50 rounded text-gray-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <EmptyState
                    icon={<BookOpen size={32} />}
                    title="暂无字典选项"
                    description="点击上方按钮新增字典选项"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 border border-gray-200 rounded-lg">
              <BookOpen size={48} className="mb-4" />
              <p>请从左侧选择一个字典查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RemindersTabProps {
  reminders: Reminder[];
  onAdd: () => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
  onView: (reminder: Reminder) => void;
  onToggleRead: (reminder: Reminder) => void;
  onToggleComplete: (reminder: Reminder) => void;
}

function RemindersTab({
  reminders,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onToggleRead,
  onToggleComplete,
}: RemindersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReminders = reminders.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;
  const unreadCount = reminders.filter((r) => !r.isRead).length;

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
            placeholder="搜索提醒标题、内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus size={18} />
          新增提醒
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{pendingCount}</p>
              <p className="text-sm text-blue-600">待处理提醒</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{unreadCount}</p>
              <p className="text-sm text-green-600">未读提醒</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">提醒设置</p>
              <button className="text-sm text-primary-600 hover:underline">
                配置提醒规则 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredReminders.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    标题
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    内容
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    提醒时间
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
                {filteredReminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      !reminder.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4">{getTypeBadge(reminder.type)}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {reminder.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {reminder.content}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {formatDateTime(reminder.scheduledAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {reminder.isRead ? (
                          <Badge variant="success">已读</Badge>
                        ) : (
                          <Badge variant="warning">未读</Badge>
                        )}
                        {reminder.isCompleted ? (
                          <Badge variant="success">已完成</Badge>
                        ) : (
                          <Badge variant="info">待处理</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {!reminder.isRead && (
                          <button
                            onClick={() => onToggleRead(reminder)}
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                            title="标记已读"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {!reminder.isCompleted && (
                          <button
                            onClick={() => onToggleComplete(reminder)}
                            className="p-1.5 hover:bg-green-50 rounded text-green-600"
                            title="标记完成"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onView(reminder)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                          title="查看详情"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onEdit(reminder)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                          title="编辑"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(reminder)}
                          className="p-1.5 hover:bg-red-50 rounded text-gray-500"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Bell size={32} className="text-gray-400" />}
          title="暂无提醒数据"
          description="点击上方按钮新增提醒"
        />
      )}
    </div>
  );
}

function FilesTab() {
  const mockFiles = [
    {
      id: "file-001",
      name: "房源照片_朝阳公园三居室.zip",
      size: 12582912,
      type: "image",
      uploadedAt: "2026-04-28T10:00:00Z",
      uploadedBy: "张三",
    },
    {
      id: "file-002",
      name: "购房合同模板.docx",
      size: 1048576,
      type: "document",
      uploadedAt: "2026-04-27T14:00:00Z",
      uploadedBy: "李四",
    },
    {
      id: "file-003",
      name: "客户身份证扫描件.jpg",
      size: 2097152,
      type: "image",
      uploadedAt: "2026-04-26T16:00:00Z",
      uploadedBy: "王五",
    },
    {
      id: "file-004",
      name: "佣金核算表.xlsx",
      size: 524288,
      type: "document",
      uploadedAt: "2026-04-25T09:00:00Z",
      uploadedBy: "赵六",
    },
    {
      id: "file-005",
      name: "楼盘宣传视频.mp4",
      size: 104857600,
      type: "video",
      uploadedAt: "2026-04-24T11:00:00Z",
      uploadedBy: "张三",
    },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const totalStorage = 10 * 1024 * 1024 * 1024;
  const usedStorage = mockFiles.reduce((sum, f) => sum + f.size, 0);
  const storagePercentage = (usedStorage / totalStorage) * 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">存储使用情况</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-64 bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {formatFileSize(usedStorage)} / {formatFileSize(totalStorage)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex items-center gap-2">
            <RefreshCw size={18} />
            刷新
          </Button>
          <Button className="flex items-center gap-2">
            <Upload size={18} />
            上传文件
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HardDrive size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {mockFiles.length}
              </p>
              <p className="text-sm text-blue-600">文件总数</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">12</p>
              <p className="text-sm text-green-600">今日上传</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">0</p>
              <p className="text-sm text-yellow-600">违规文件</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">存储设置</p>
              <button className="text-sm text-primary-600 hover:underline">
                配置存储 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {mockFiles.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    文件名
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    大小
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    上传时间
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    上传人
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileIcon type={file.type} />
                        </div>
                        <span className="font-medium text-gray-900">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {formatDateTime(file.uploadedAt)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{file.uploadedBy}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="预览">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="下载">
                          <DownloadIcon size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="复制链接">
                          <Copy size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded text-gray-500" title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Upload size={32} className="text-gray-400" />}
          title="暂无文件数据"
          description="点击上方按钮上传文件"
        />
      )}
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case "image":
      return <Upload size={20} className="text-green-600" />;
    case "document":
      return <FileTextIcon size={20} className="text-blue-600" />;
    case "video":
      return <Upload size={20} className="text-purple-600" />;
    default:
      return <Upload size={20} className="text-gray-600" />;
  }
}

function ApiTab() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiModules = [
    {
      name: "房源管理 API",
      description: "房源信息的增删改查、状态管理、智能匹配",
      endpoints: [
        { method: "GET", path: "/api/properties", description: "获取房源列表" },
        { method: "POST", path: "/api/properties", description: "创建新房源" },
        { method: "GET", path: "/api/properties/:id", description: "获取房源详情" },
        { method: "PUT", path: "/api/properties/:id", description: "更新房源信息" },
      ],
    },
    {
      name: "客户管理 API",
      description: "客户信息管理、标签管理、公海分配",
      endpoints: [
        { method: "GET", path: "/api/clients", description: "获取客户列表" },
        { method: "POST", path: "/api/clients", description: "创建新客户" },
        { method: "GET", path: "/api/clients/:id", description: "获取客户详情" },
        { method: "POST", path: "/api/clients/follow-up", description: "添加跟进记录" },
      ],
    },
    {
      name: "签约管理 API",
      description: "合同创建、签约流程、佣金核算",
      endpoints: [
        { method: "GET", path: "/api/contracts", description: "获取合同列表" },
        { method: "POST", path: "/api/contracts", description: "创建新合同" },
        { method: "GET", path: "/api/contracts/:id", description: "获取合同详情" },
        { method: "POST", path: "/api/contracts/:id/sign", description: "签署合同" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Key size={18} />
            API 密钥
          </h3>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前 API Key
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-mono text-sm break-all">
                  {showKey
                    ? "sk_abc123def456ghi789jkl012mno345pqr678stu901vwx"
                    : "sk_***********"}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex items-center gap-2">
                <RefreshCw size={16} />
                刷新密钥
              </Button>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                新增密钥
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            请妥善保管您的 API 密钥，不要泄露给他人。如果怀疑密钥泄露，请立即刷新。
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">API 模块</h3>
        {apiModules.map((module, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h4 className="font-medium text-gray-900">{module.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{module.description}</p>
              </div>
              <Button variant="secondary" className="text-sm px-3 py-1.5 whitespace-nowrap">
                查看文档
                <ExternalLink size={14} className="ml-1" />
              </Button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {module.endpoints.map((endpoint, epIndex) => (
                  <div
                    key={epIndex}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold inline-flex w-fit ${
                        endpoint.method === "GET"
                          ? "bg-green-100 text-green-700"
                          : endpoint.method === "POST"
                          ? "bg-blue-100 text-blue-700"
                          : endpoint.method === "PUT"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-gray-700 font-mono">
                      {endpoint.path}
                    </code>
                    <span className="text-sm text-gray-500">
                      {endpoint.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">API 使用统计</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-700">12,458</p>
              <p className="text-sm text-blue-600">今日调用次数</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-700">99.8%</p>
              <p className="text-sm text-green-600">请求成功率</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-700">142ms</p>
              <p className="text-sm text-yellow-600">平均响应时间</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-700">100,000</p>
              <p className="text-sm text-gray-600">每日限额</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
