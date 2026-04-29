"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  Shield,
  FileText,
  MapPin,
  Phone,
  Clock,
  Mail,
  Download,
  Check,
  X,
} from "lucide-react";
import {
  mockStores,
  mockRoles,
  mockUsers,
  mockOperationLogs,
} from "@/data/mockData";
import { Store, Role, User, OperationLog } from "@/types";
import { formatDateTime, maskPhone } from "@/lib/utils";
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

const storeStatusOptions = [
  { value: "active", label: "正常营业" },
  { value: "inactive", label: "已停用" },
];

const userStatusOptions = [
  { value: "active", label: "正常" },
  { value: "inactive", label: "停用" },
];

const moduleOptions = [
  { value: "dashboard", label: "数据看板" },
  { value: "properties", label: "房源管理" },
  { value: "clients", label: "客户管理" },
  { value: "sales", label: "销售业务" },
  { value: "organization", label: "组织权限" },
  { value: "settings", label: "系统配置" },
];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<"stores" | "roles" | "users" | "logs">("stores");

  const [localStores, setLocalStores] = useState<Store[]>(mockStores as Store[]);
  const [localRoles, setLocalRoles] = useState<Role[]>(mockRoles);
  const [localUsers, setLocalUsers] = useState<User[]>(mockUsers);

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<"store" | "role" | "user" | "log">("store");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storeOptions = localStores.map((s) => ({ value: s.id, label: s.name }));
  const roleOptions = localRoles.map((r) => ({ value: r.id, label: r.name }));

  const [storeFormData, setStoreFormData] = useState({
    name: "",
    address: "",
    phone: "",
    status: "active" as "active" | "inactive",
    managerId: "",
    managerName: "",
    employeeCount: 0,
  });

  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [userFormData, setUserFormData] = useState({
    name: "",
    phone: "",
    email: "",
    roleId: "",
    roleName: "",
    storeId: "",
    storeName: "",
    status: "active" as "active" | "inactive",
  });

  const handleAddStore = () => {
    setIsEditMode(false);
    setModalType("store");
    setStoreFormData({
      name: "",
      address: "",
      phone: "",
      status: "active",
      managerId: "",
      managerName: "",
      employeeCount: 0,
    });
    setIsStoreModalOpen(true);
  };

  const handleEditStore = (store: Store) => {
    setIsEditMode(true);
    setModalType("store");
    setSelectedItem(store);
    setStoreFormData({
      name: store.name || "",
      address: store.address || "",
      phone: store.phone || "",
      status: store.status || "active",
      managerId: store.managerId || "",
      managerName: store.managerName || "",
      employeeCount: store.employeeCount || 0,
    });
    setIsStoreModalOpen(true);
  };

  const handleAddRole = () => {
    setIsEditMode(false);
    setModalType("role");
    setRoleFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystem) return;
    setIsEditMode(true);
    setModalType("role");
    setSelectedItem(role);
    setRoleFormData({
      name: role.name || "",
      description: role.description || "",
      permissions: role.permissions?.map((p) => p.id) || [],
    });
    setIsRoleModalOpen(true);
  };

  const handleAddUser = () => {
    setIsEditMode(false);
    setModalType("user");
    setUserFormData({
      name: "",
      phone: "",
      email: "",
      roleId: "",
      roleName: "",
      storeId: "",
      storeName: "",
      status: "active",
    });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setModalType("user");
    setSelectedItem(user);
    setUserFormData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      roleId: user.roleId || "",
      roleName: user.roleName || "",
      storeId: user.storeId || "",
      storeName: user.storeName || "",
      status: user.status || "active",
    });
    setIsUserModalOpen(true);
  };

  const handleViewDetail = (item: any, type: "store" | "role" | "user" | "log") => {
    setSelectedItem(item);
    setModalType(type);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (item: any, type: "store" | "role" | "user") => {
    setSelectedItem(item);
    setModalType(type);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (modalType === "store") {
      setLocalStores((prev) => prev.filter((s) => s.id !== selectedItem.id));
    } else if (modalType === "role") {
      setLocalRoles((prev) => prev.filter((r) => r.id !== selectedItem.id));
    } else if (modalType === "user") {
      setLocalUsers((prev) => prev.filter((u) => u.id !== selectedItem.id));
    }

    setIsSubmitting(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitStore = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isEditMode && selectedItem) {
      setLocalStores((prev) =>
        prev.map((s) =>
          s.id === selectedItem.id
            ? {
                ...s,
                name: storeFormData.name,
                address: storeFormData.address,
                phone: storeFormData.phone,
                status: storeFormData.status,
                managerId: storeFormData.managerId,
                managerName: storeFormData.managerName,
                employeeCount: storeFormData.employeeCount,
              }
            : s
        )
      );
    } else {
      const newStore: Store = {
        id: `store-${Date.now()}`,
        name: storeFormData.name,
        address: storeFormData.address,
        phone: storeFormData.phone,
        status: storeFormData.status,
        managerId: storeFormData.managerId,
        managerName: storeFormData.managerName,
        employeeCount: storeFormData.employeeCount,
        createdAt: new Date().toISOString(),
      } as Store;
      setLocalStores((prev) => [newStore, ...prev]);
    }

    setIsSubmitting(false);
    setIsStoreModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitRole = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const selectedPermissions = moduleOptions
      .filter((m) => roleFormData.permissions.includes(m.value))
      .map((m) => ({ id: m.value, name: m.label, module: m.value }));

    if (isEditMode && selectedItem) {
      setLocalRoles((prev) =>
        prev.map((r) =>
          r.id === selectedItem.id
            ? {
                ...r,
                name: roleFormData.name,
                description: roleFormData.description,
                permissions: selectedPermissions,
              }
            : r
        )
      );
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleFormData.name,
        description: roleFormData.description,
        permissions: selectedPermissions,
        isSystem: false,
        createdAt: new Date().toISOString(),
      };
      setLocalRoles((prev) => [newRole, ...prev]);
    }

    setIsSubmitting(false);
    setIsRoleModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitUser = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const store = localStores.find((s) => s.id === userFormData.storeId);
    const role = localRoles.find((r) => r.id === userFormData.roleId);

    if (isEditMode && selectedItem) {
      setLocalUsers((prev) =>
        prev.map((u) =>
          u.id === selectedItem.id
            ? {
                ...u,
                name: userFormData.name,
                phone: userFormData.phone,
                email: userFormData.email,
                roleId: userFormData.roleId,
                roleName: role?.name || u.roleName,
                storeId: userFormData.storeId,
                storeName: store?.name || u.storeName,
                status: userFormData.status,
              }
            : u
        )
      );
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userFormData.name,
        phone: userFormData.phone,
        email: userFormData.email,
        roleId: userFormData.roleId,
        roleName: role?.name || "",
        storeId: userFormData.storeId,
        storeName: store?.name || "",
        status: userFormData.status,
        createdAt: new Date().toISOString(),
        roles: role ? [role] : [],
        permissions: [],
      } as User;
      setLocalUsers((prev) => [newUser, ...prev]);
    }

    setIsSubmitting(false);
    setIsUserModalOpen(false);
    setSelectedItem(null);
  };

  const togglePermission = (moduleId: string) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(moduleId)
        ? prev.permissions.filter((p) => p !== moduleId)
        : [...prev.permissions, moduleId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">组织权限</h1>
          <p className="text-gray-500 mt-1">门店管理、角色管理、用户管理、操作日志</p>
        </div>
        {activeTab === "stores" && (
          <Button onClick={handleAddStore} className="flex items-center gap-2">
            <Plus size={18} />
            新增门店
          </Button>
        )}
        {activeTab === "roles" && (
          <Button onClick={handleAddRole} className="flex items-center gap-2">
            <Plus size={18} />
            新增角色
          </Button>
        )}
        {activeTab === "users" && (
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <Plus size={18} />
            新增用户
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">门店总数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {localStores.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">活跃门店</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {localStores.filter((s) => s.status === "active").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">员工总数</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {localUsers.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">角色数量</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {localRoles.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("stores")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "stores"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} />
              门店管理
            </div>
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "roles"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={18} />
              角色管理
            </div>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "users"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              用户管理
            </div>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "logs"
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} />
              操作日志
            </div>
          </button>
        </div>

        <div className="p-4">
          {activeTab === "stores" && (
            <StoresTab
              stores={localStores}
              onEdit={handleEditStore}
              onView={handleViewDetail}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "roles" && (
            <RolesTab
              roles={localRoles}
              onEdit={handleEditRole}
              onView={handleViewDetail}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "users" && (
            <UsersTab
              users={localUsers}
              onEdit={handleEditUser}
              onView={handleViewDetail}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "logs" && <LogsTab logs={mockOperationLogs} onView={handleViewDetail} />}
        </div>
      </div>

      <Modal
        isOpen={isStoreModalOpen}
        onClose={() => {
          setIsStoreModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑门店" : "新增门店"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsStoreModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitStore} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建门店"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="门店名称" required>
            <Input
              value={storeFormData.name}
              onChange={(e) => setStoreFormData({ ...storeFormData, name: e.target.value })}
              placeholder="请输入门店名称"
            />
          </FormField>
          <FormField label="门店地址" required>
            <Input
              value={storeFormData.address}
              onChange={(e) => setStoreFormData({ ...storeFormData, address: e.target.value })}
              placeholder="请输入门店地址"
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="联系电话" required>
              <Input
                value={storeFormData.phone}
                onChange={(e) => setStoreFormData({ ...storeFormData, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
            </FormField>
            <FormField label="门店状态">
              <Select
                options={storeStatusOptions}
                value={storeFormData.status}
                onChange={(e) => setStoreFormData({ ...storeFormData, status: e.target.value as "active" | "inactive" })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="店长">
              <Select
                options={localUsers.map((u) => ({ value: u.id, label: u.name }))}
                value={storeFormData.managerId}
                onChange={(e) => {
                  const user = localUsers.find((u) => u.id === e.target.value);
                  setStoreFormData({
                    ...storeFormData,
                    managerId: e.target.value,
                    managerName: user?.name || "",
                  });
                }}
                placeholder="请选择店长"
              />
            </FormField>
            <FormField label="员工人数">
              <Input
                type="number"
                value={storeFormData.employeeCount || ""}
                onChange={(e) => setStoreFormData({ ...storeFormData, employeeCount: parseInt(e.target.value) || 0 })}
                placeholder="请输入员工人数"
              />
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑角色" : "新增角色"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitRole} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建角色"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="角色名称" required>
            <Input
              value={roleFormData.name}
              onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
              placeholder="请输入角色名称"
            />
          </FormField>
          <FormField label="角色描述">
            <Textarea
              value={roleFormData.description}
              onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              placeholder="请输入角色描述"
              rows={3}
            />
          </FormField>
          <FormField label="权限模块">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {moduleOptions.map((module) => (
                <label
                  key={module.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    roleFormData.permissions.includes(module.value)
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={roleFormData.permissions.includes(module.value)}
                    onChange={() => togglePermission(module.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{module.label}</span>
                </label>
              ))}
            </div>
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedItem(null);
        }}
        title={isEditMode ? "编辑用户" : "新增用户"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsUserModalOpen(false);
                setSelectedItem(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitUser} loading={isSubmitting}>
              {isEditMode ? "保存修改" : "创建用户"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="姓名" required>
            <Input
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              placeholder="请输入姓名"
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="手机号" required>
              <Input
                value={userFormData.phone}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                placeholder="请输入手机号"
              />
            </FormField>
            <FormField label="邮箱">
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                placeholder="请输入邮箱"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="所属门店" required>
              <Select
                options={storeOptions}
                value={userFormData.storeId}
                onChange={(e) => {
                  const store = localStores.find((s) => s.id === e.target.value);
                  setUserFormData({
                    ...userFormData,
                    storeId: e.target.value,
                    storeName: store?.name || "",
                  });
                }}
                placeholder="请选择门店"
              />
            </FormField>
            <FormField label="角色" required>
              <Select
                options={roleOptions}
                value={userFormData.roleId}
                onChange={(e) => {
                  const role = localRoles.find((r) => r.id === e.target.value);
                  setUserFormData({
                    ...userFormData,
                    roleId: e.target.value,
                    roleName: role?.name || "",
                  });
                }}
                placeholder="请选择角色"
              />
            </FormField>
          </div>
          <FormField label="状态">
            <Select
              options={userStatusOptions}
              value={userFormData.status}
              onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as "active" | "inactive" })}
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
          modalType === "store"
            ? "门店详情"
            : modalType === "role"
            ? "角色详情"
            : modalType === "user"
            ? "用户详情"
            : "日志详情"
        }
        size="lg"
      >
        {selectedItem && modalType === "store" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">门店名称</p>
                <p className="font-medium text-gray-900">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                {selectedItem.status === "active" ? (
                  <Badge variant="success">正常营业</Badge>
                ) : (
                  <Badge variant="secondary">已停用</Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="font-medium text-gray-900">{selectedItem.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">店长</p>
                <p className="font-medium text-gray-900">{selectedItem.managerName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">员工人数</p>
                <p className="font-medium text-gray-900">{selectedItem.employeeCount} 人</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="font-medium text-gray-900">
                  {selectedItem.createdAt ? formatDateTime(selectedItem.createdAt) : "-"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">门店地址</p>
              <p className="text-gray-900">{selectedItem.address}</p>
            </div>
          </div>
        )}
        {selectedItem && modalType === "role" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">角色名称</p>
                <p className="font-medium text-gray-900">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">系统角色</p>
                {selectedItem.isSystem ? (
                  <Badge variant="info">是</Badge>
                ) : (
                  <Badge variant="secondary">否</Badge>
                )}
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">描述</p>
                <p className="font-medium text-gray-900">{selectedItem.description || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">权限模块</p>
              <div className="flex flex-wrap gap-2">
                {selectedItem.permissions?.map((p: any) => (
                  <Badge key={p.id} variant="secondary">{p.name}</Badge>
                ))}
                {(!selectedItem.permissions || selectedItem.permissions.length === 0) && (
                  <span className="text-gray-500">暂无权限</span>
                )}
              </div>
            </div>
          </div>
        )}
        {selectedItem && modalType === "user" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xl">
                  {selectedItem.name.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">{selectedItem.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info">{selectedItem.roleName}</Badge>
                  {selectedItem.status === "active" ? (
                    <Badge variant="success">正常</Badge>
                  ) : (
                    <Badge variant="danger">停用</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">手机号</p>
                <p className="font-medium text-gray-900">{maskPhone(selectedItem.phone)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">邮箱</p>
                <p className="font-medium text-gray-900">{selectedItem.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">所属门店</p>
                <p className="font-medium text-gray-900">{selectedItem.storeName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">最后登录</p>
                <p className="font-medium text-gray-900">
                  {selectedItem.lastLogin ? formatDateTime(selectedItem.lastLogin) : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
        {selectedItem && modalType === "log" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">操作时间</p>
                <p className="font-medium text-gray-900">{formatDateTime(selectedItem.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">操作人</p>
                <p className="font-medium text-gray-900">{selectedItem.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">所属门店</p>
                <p className="font-medium text-gray-900">{selectedItem.storeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IP地址</p>
                <p className="font-medium text-gray-900 font-mono">{selectedItem.ip}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">模块</p>
                <Badge variant="info">{selectedItem.module}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">操作类型</p>
                {selectedItem.action === "创建" ? (
                  <Badge variant="success">{selectedItem.action}</Badge>
                ) : selectedItem.action === "删除" ? (
                  <Badge variant="danger">{selectedItem.action}</Badge>
                ) : (
                  <Badge variant="warning">{selectedItem.action}</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">操作对象</p>
              <p className="font-medium text-gray-900">{selectedItem.targetName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">操作详情</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{selectedItem.details}</p>
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
            确认删除该{modalType === "store" ? "门店" : modalType === "role" ? "角色" : "用户"}？
          </p>
          <p className="text-gray-500 text-sm">
            {selectedItem?.name}
          </p>
          <p className="text-red-500 text-sm mt-2">此操作不可撤销</p>
        </div>
      </Modal>
    </div>
  );
}

interface StoresTabProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onView: (store: Store, type: "store" | "role" | "user" | "log") => void;
  onDelete: (store: Store, type: "store" | "role" | "user") => void;
}

function StoresTab({ stores, onEdit, onView, onDelete }: StoresTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex-1 relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="搜索门店名称、地址..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{store.name}</h4>
                    {store.status === "active" ? (
                      <Badge variant="success">正常营业</Badge>
                    ) : (
                      <Badge variant="secondary">已停用</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  {store.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  {store.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} className="text-gray-400" />
                  员工人数：{store.employeeCount} 人
                </div>
                {store.managerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon size={14} className="text-gray-400" />
                    店长：{store.managerName}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => onView(store, "store")}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  查看
                </button>
                <button
                  onClick={() => onEdit(store)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  编辑
                </button>
                <button
                  onClick={() => onDelete(store, "store")}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 size={32} className="text-gray-400" />}
          title="暂无门店数据"
          description="点击上方按钮新增门店"
        />
      )}
    </div>
  );
}

interface RolesTabProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onView: (role: Role, type: "store" | "role" | "user" | "log") => void;
  onDelete: (role: Role, type: "store" | "role" | "user") => void;
}

function RolesTab({ roles, onEdit, onView, onDelete }: RolesTabProps) {
  return (
    <div className="space-y-4">
      {roles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  角色名称
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  描述
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  权限模块
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  系统角色
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  创建时间
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                        <Shield size={16} className="text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-900">{role.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{role.description}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm) => (
                        <Badge key={perm.id} variant="secondary">{perm.name}</Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{role.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {role.isSystem ? (
                      <Badge variant="info">是</Badge>
                    ) : (
                      <Badge variant="secondary">否</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-sm">
                    {formatDateTime(role.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(role, "role")}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                      {!role.isSystem && (
                        <>
                          <button
                            onClick={() => onEdit(role)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                            title="编辑"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(role, "role")}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
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
          icon={<Shield size={32} className="text-gray-400" />}
          title="暂无角色数据"
          description="点击上方按钮新增角色"
        />
      )}
    </div>
  );
}

interface UsersTabProps {
  users: User[];
  onEdit: (user: User) => void;
  onView: (user: User, type: "store" | "role" | "user" | "log") => void;
  onDelete: (user: User, type: "store" | "role" | "user") => void;
}

function UsersTab({ users, onEdit, onView, onDelete }: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex-1 relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="搜索姓名、电话、邮箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  用户信息
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  联系方式
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  角色
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  所属门店
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  最后登录
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-gray-900">{maskPhone(user.phone)}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="info">{user.roleName}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.storeName}</td>
                  <td className="py-4 px-4">
                    {user.status === "active" ? (
                      <Badge variant="success">正常</Badge>
                    ) : (
                      <Badge variant="danger">停用</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-sm">
                    {user.lastLogin ? formatDateTime(user.lastLogin) : "-"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(user, "user")}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                        title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(user, "user")}
                        className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
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
          icon={<Users size={32} className="text-gray-400" />}
          title="暂无用户数据"
          description="点击上方按钮新增用户"
        />
      )}
    </div>
  );
}

interface LogsTabProps {
  logs: OperationLog[];
  onView: (log: OperationLog, type: "store" | "role" | "user" | "log") => void;
}

function LogsTab({ logs, onView }: LogsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="搜索操作人、模块、操作类型..."
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
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download size={18} />
            导出日志
          </button>
        </div>
      </div>

      {filteredLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作时间
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作人
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  所属门店
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  模块
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作类型
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作详情
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  IP地址
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-500 text-sm whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {log.userName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-900">{log.userName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{log.storeName}</td>
                  <td className="py-4 px-4">
                    <Badge variant="info">{log.module}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    {log.action === "创建" ? (
                      <Badge variant="success">{log.action}</Badge>
                    ) : log.action === "删除" ? (
                      <Badge variant="danger">{log.action}</Badge>
                    ) : (
                      <Badge variant="warning">{log.action}</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600 max-w-xs">
                    <p className="font-medium text-gray-900">{log.targetName}</p>
                    <p className="text-sm text-gray-500 truncate">{log.details}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-sm font-mono">
                    {log.ip}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => onView(log, "log")}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600"
                      title="查看详情"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FileText size={32} className="text-gray-400" />}
          title="暂无操作日志"
          description="操作日志将记录所有系统操作"
        />
      )}
    </div>
  );
}

function UserIcon(props: any) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
