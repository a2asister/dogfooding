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
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Tag,
  Image,
  Phone,
  User,
  Calendar,
  Building2,
  Check,
  X,
} from "lucide-react";
import { mockProperties, mockUsers } from "@/data/mockData";
import { Property, PropertyStatus, PropertyType } from "@/types";
import { formatCurrency, maskPhone, formatDate } from "@/lib/utils";
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

const getStatusBadge = (status: PropertyStatus) => {
  const statusMap: Record<PropertyStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
    available: { label: "可售/可租", variant: "success" },
    reserved: { label: "已预订", variant: "warning" },
    rented: { label: "已出租", variant: "info" },
    sold: { label: "已售出", variant: "secondary" },
    offline: { label: "已下架", variant: "danger" },
    maintenance: { label: "维护中", variant: "warning" },
  };
  const info = statusMap[status];
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

const getTypeLabel = (type: PropertyType) => {
  const typeMap: Record<PropertyType, string> = {
    apartment: "公寓",
    house: "住宅",
    villa: "别墅",
    commercial: "商业",
    office: "写字楼",
    shop: "商铺",
    industrial: "厂房",
  };
  return typeMap[type];
};

const propertyTypeOptions = [
  { value: "apartment", label: "公寓" },
  { value: "house", label: "住宅" },
  { value: "villa", label: "别墅" },
  { value: "commercial", label: "商业" },
  { value: "office", label: "写字楼" },
  { value: "shop", label: "商铺" },
  { value: "industrial", label: "厂房" },
];

const propertyStatusOptions = [
  { value: "available", label: "可售/可租" },
  { value: "reserved", label: "已预订" },
  { value: "rented", label: "已出租" },
  { value: "sold", label: "已售出" },
  { value: "offline", label: "已下架" },
  { value: "maintenance", label: "维护中" },
];

const districtOptions = [
  { value: "朝阳区", label: "朝阳区" },
  { value: "海淀区", label: "海淀区" },
  { value: "西城区", label: "西城区" },
  { value: "东城区", label: "东城区" },
  { value: "丰台区", label: "丰台区" },
];

interface PropertyFormData {
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  price: string;
  priceUnit: "total" | "month";
  area: string;
  bedrooms: string;
  bathrooms: string;
  district: string;
  address: string;
  description: string;
  features: string;
  tags: string;
  ownerName: string;
  ownerPhone: string;
  assignedAgentId: string;
}

const initialFormData: PropertyFormData = {
  title: "",
  type: "apartment",
  status: "available",
  price: "",
  priceUnit: "total",
  area: "",
  bedrooms: "1",
  bathrooms: "1",
  district: "",
  address: "",
  description: "",
  features: "",
  tags: "",
  ownerName: "",
  ownerPhone: "",
  assignedAgentId: "",
};

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProperties, setLocalProperties] = useState<Property[]>(mockProperties);

  const filteredProperties = localProperties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    const matchesType =
      typeFilter === "all" || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setFormData(initialFormData);
    setIsAddModalOpen(true);
  };

  const handleViewDetail = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      title: property.title,
      type: property.type,
      status: property.status,
      price: property.price.toString(),
      priceUnit: property.priceUnit,
      area: property.area.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      district: property.district,
      address: property.address,
      description: property.description || "",
      features: property.features.join(", "),
      tags: property.tags.join(", "),
      ownerName: property.owner.name,
      ownerPhone: property.owner.phone,
      assignedAgentId: property.assignedAgent?.id || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProperty) {
      setLocalProperties((prev) =>
        prev.filter((p) => p.id !== selectedProperty.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedProperty(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isAddModalOpen) {
      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        title: formData.title,
        type: formData.type,
        status: formData.status,
        price: parseFloat(formData.price),
        priceUnit: formData.priceUnit,
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        district: formData.district,
        address: formData.address,
        description: formData.description,
        features: formData.features.split(",").map((s) => s.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((s) => s.trim()).filter(Boolean),
        images: ["https://picsum.photos/800/600?random=1"],
        owner: {
          id: `owner-${Date.now()}`,
          name: formData.ownerName,
          phone: formData.ownerPhone,
          idCard: "",
        },
        assignedAgent: formData.assignedAgentId
          ? mockUsers.find((u) => u.id === formData.assignedAgentId) || null
          : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            id: `history-${Date.now()}`,
            status: formData.status,
            changedAt: new Date().toISOString(),
            changedBy: mockUsers[0],
            reason: "新增房源",
          },
        ],
      };
      setLocalProperties((prev) => [newProperty, ...prev]);
      setIsAddModalOpen(false);
    } else if (isEditModalOpen && selectedProperty) {
      setLocalProperties((prev) =>
        prev.map((p) =>
          p.id === selectedProperty.id
            ? {
                ...p,
                title: formData.title,
                type: formData.type,
                status: formData.status,
                price: parseFloat(formData.price),
                priceUnit: formData.priceUnit,
                area: parseFloat(formData.area),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                district: formData.district,
                address: formData.address,
                description: formData.description,
                features: formData.features.split(",").map((s) => s.trim()).filter(Boolean),
                tags: formData.tags.split(",").map((s) => s.trim()).filter(Boolean),
                owner: {
                  ...p.owner,
                  name: formData.ownerName,
                  phone: formData.ownerPhone,
                },
                assignedAgent: formData.assignedAgentId
                  ? mockUsers.find((u) => u.id === formData.assignedAgentId) || null
                  : null,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      setIsEditModalOpen(false);
    }

    setFormData(initialFormData);
    setSelectedProperty(null);
    setIsSubmitting(false);
  };

  const agentOptions = mockUsers
    .filter((u) => u.roles.some((r) => r.name === "经纪人" || r.name === "店长"))
    .map((u) => ({ value: u.id, label: u.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">房源管理</h1>
          <p className="text-gray-500 mt-1">管理所有房源信息、状态和多媒体资料</p>
        </div>
        <Button onClick={handleAddProperty} className="flex items-center gap-2">
          <Plus size={18} />
          新增房源
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="搜索房源标题、地址、区域..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as PropertyStatus | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">全部状态</option>
                {propertyStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as PropertyType | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">全部类型</option>
                {propertyTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter size={18} />
                更多筛选
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  价格区间
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">全部价格</option>
                  <option value="0-5000000">500万以下</option>
                  <option value="5000000-10000000">500万-1000万</option>
                  <option value="10000000-20000000">1000万-2000万</option>
                  <option value="20000000+">2000万以上</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  面积区间
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">全部面积</option>
                  <option value="0-50">50㎡以下</option>
                  <option value="50-100">50-100㎡</option>
                  <option value="100-150">100-150㎡</option>
                  <option value="150+">150㎡以上</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  卧室数量
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">不限</option>
                  <option value="1">1室</option>
                  <option value="2">2室</option>
                  <option value="3">3室</option>
                  <option value="4+">4室及以上</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属区域
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">全部区域</option>
                  {districtOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共找到 <span className="font-medium text-gray-900">{filteredProperties.length}</span> 套房源
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
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handleViewDetail}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <EmptyState
            icon={<Building2 size={32} className="text-gray-400" />}
            title="暂无符合条件的房源"
            description="尝试调整筛选条件或添加新的房源"
            action={
              <Button onClick={handleAddProperty} className="flex items-center gap-2">
                <Plus size={16} />
                新增房源
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
          setFormData(initialFormData);
        }}
        title={isAddModalOpen ? "新增房源" : "编辑房源"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setFormData(initialFormData);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {isAddModalOpen ? "保存房源" : "更新房源"}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="房源标题" required>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入房源标题"
              />
            </FormField>
            <FormField label="房源类型" required>
              <Select
                options={propertyTypeOptions}
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as PropertyType })
                }
                placeholder="请选择房源类型"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="价格" required>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="请输入价格"
              />
            </FormField>
            <FormField label="价格单位">
              <Select
                options={[
                  { value: "total", label: "总价" },
                  { value: "month", label: "每月租金" },
                ]}
                value={formData.priceUnit}
                onChange={(e) =>
                  setFormData({ ...formData, priceUnit: e.target.value as "total" | "month" })
                }
              />
            </FormField>
            <FormField label="状态" required>
              <Select
                options={propertyStatusOptions}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as PropertyStatus })
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="面积(㎡)" required>
              <Input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="请输入面积"
              />
            </FormField>
            <FormField label="卧室数量">
              <Select
                options={[
                  { value: "1", label: "1室" },
                  { value: "2", label: "2室" },
                  { value: "3", label: "3室" },
                  { value: "4", label: "4室" },
                  { value: "5", label: "5室及以上" },
                ]}
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </FormField>
            <FormField label="卫生间数量">
              <Select
                options={[
                  { value: "1", label: "1卫" },
                  { value: "2", label: "2卫" },
                  { value: "3", label: "3卫" },
                  { value: "4", label: "4卫及以上" },
                ]}
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="所属区域" required>
              <Select
                options={districtOptions}
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="请选择区域"
              />
            </FormField>
            <FormField label="详细地址" required>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="请输入详细地址"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="房源特色" helperText="多个特色用逗号分隔">
              <Input
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="例如: 南北通透, 精装修, 地铁附近"
              />
            </FormField>
            <FormField label="标签" helperText="多个标签用逗号分隔">
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="例如: 学区房, 急售, 性价比高"
              />
            </FormField>
          </div>

          <FormField label="房源描述">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入房源详细描述"
              rows={4}
            />
          </FormField>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">业主信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="业主姓名" required>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="请输入业主姓名"
                />
              </FormField>
              <FormField label="联系电话" required>
                <Input
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="请输入联系电话"
                />
              </FormField>
            </div>
          </div>

          <FormField label="分配经纪人">
            <Select
              options={[{ value: "", label: "不分配" }, ...agentOptions]}
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
              placeholder="请选择经纪人"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen && !!selectedProperty}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProperty(null);
        }}
        title="房源详情"
        size="xl"
        footer={
          selectedProperty && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditProperty(selectedProperty);
                }}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                编辑房源
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
        {selectedProperty && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {selectedProperty.images.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {selectedProperty.images.slice(1, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`房源图片 ${idx + 2}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                    {selectedProperty.images.length > 4 && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">
                          +{selectedProperty.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">价格</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(selectedProperty.price)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {selectedProperty.priceUnit === "month" ? "/月" : ""}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">状态</p>
                  {getStatusBadge(selectedProperty.status)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">类型</p>
                  <p className="font-medium">{getTypeLabel(selectedProperty.type)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">基本信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">面积</p>
                    <p className="font-medium">{selectedProperty.area}㎡</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">户型</p>
                    <p className="font-medium">
                      {selectedProperty.bedrooms}室{selectedProperty.bathrooms}卫
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">区域</p>
                    <p className="font-medium">{selectedProperty.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">地址</p>
                    <p className="font-medium">{selectedProperty.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.tags.map((tag) => (
                    <Badge key={tag} variant="info">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h4 className="font-medium text-gray-900 mt-4">房源特色</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selectedProperty.description && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">房源描述</h4>
                <p className="text-gray-600">{selectedProperty.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">业主信息</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span>{selectedProperty.owner.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{maskPhone(selectedProperty.owner.phone)}</span>
                  </div>
                </div>
              </div>

              {selectedProperty.assignedAgent && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">负责经纪人</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span>{selectedProperty.assignedAgent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>{selectedProperty.assignedAgent?.phone ? maskPhone(selectedProperty.assignedAgent.phone) : "-"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedProperty.statusHistory && selectedProperty.statusHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">状态历史</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          状态
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          变更时间
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          变更人
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          原因
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProperty.statusHistory?.map((history) => (
                        <tr key={history.id} className="border-t border-gray-100">
                          <td className="py-3 px-4">
                            {getStatusBadge(history.status)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(history.changedAt)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {history.changedBy.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {history.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen && !!selectedProperty}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProperty(null);
        }}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedProperty(null);
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
          <p className="text-gray-900 font-medium mb-2">确认删除该房源？</p>
          <p className="text-gray-500 text-sm">
            {selectedProperty?.title}
          </p>
          <p className="text-red-500 text-sm mt-2">
            此操作不可撤销
          </p>
        </div>
      </Modal>
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

function PropertyCard({ property, onView, onEdit, onDelete }: PropertyCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-48 flex-shrink-0 cursor-pointer" onClick={() => onView(property)}>
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              <h3
                className="text-lg font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                onClick={() => onView(property)}
              >
                {property.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getStatusBadge(property.status)}
                <Badge variant="info">{getTypeLabel(property.type)}</Badge>
                {property.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(property.price)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {property.priceUnit === "month" ? "/月" : ""}
                </span>
              </p>
              {property.priceUnit === "month" ? (
                <p className="text-sm text-gray-500">
                  {formatCurrency((property.price * 12) / property.area)}/㎡·年
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formatCurrency(property.price / property.area)}/㎡
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {property.district} · {property.address}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 size={14} />
              {property.area}㎡
            </span>
            <span className="flex items-center gap-1">
              <BedDouble size={14} />
              {property.bedrooms}室
            </span>
            <span className="flex items-center gap-1">
              <Bath size={14} />
              {property.bathrooms}卫
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {property.features.slice(0, 5).map((feature) => (
              <span
                key={feature}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 5 && (
              <span className="text-xs text-gray-400">
                +{property.features.length - 5} 更多
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <User size={14} />
                房东：{property.owner.name}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {maskPhone(property.owner.phone)}
              </span>
              {property.assignedAgent && (
                <span className="flex items-center gap-1">
                  <Check size={14} className="text-green-500" />
                  负责人：{property.assignedAgent.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(property)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
                title="查看详情"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => onEdit(property)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
                title="编辑"
              >
                <Edit size={18} />
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
                      <button
                        onClick={() => {
                          setShowActions(false);
                          onView(property);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye size={14} />
                        查看详情
                      </button>
                      <button
                        onClick={() => {
                          setShowActions(false);
                          onEdit(property);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit size={14} />
                        编辑房源
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Tag size={14} />
                        修改状态
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <User size={14} />
                        分配经纪人
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setShowActions(false);
                          onDelete(property);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        删除房源
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
