import React, { useEffect, useState } from 'react';
import {
  Search,
  Star,
  MessageSquare,
  ChevronDown,
  X,
  Loader2,
  Reply,
  Pin
} from 'lucide-react';
import {
  getReviews,
  updateReview,
  addReviewReply
} from '../../data/services';
import type { Review } from '../../types';

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pinned' | 'featured' | 'replied'>('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    try {
      const data = await getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchQuery === '' ||
      review.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = selectedRating === 'all' || review.rating === selectedRating;
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'pinned' && review.isPinned) ||
      (selectedStatus === 'featured' && review.isFeatured) ||
      (selectedStatus === 'replied' && review.reply);
    return matchesSearch && matchesRating && matchesStatus;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTogglePin = async (review: Review) => {
    try {
      const updated = { ...review, isPinned: !review.isPinned };
      await updateReview(updated);
      setReviews(reviews.map(r => r.id === review.id ? updated : r));
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleToggleFeatured = async (review: Review) => {
    try {
      const updated = { ...review, isFeatured: !review.isFeatured };
      await updateReview(updated);
      setReviews(reviews.map(r => r.id === review.id ? updated : r));
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleReply = (review: Review) => {
    setReplyingReview(review);
    setReplyContent(review.reply || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyingReview || !replyContent.trim()) return;

    setSaving(true);
    try {
      await addReviewReply(replyingReview.id, replyContent.trim());
      const updatedReview = {
        ...replyingReview,
        reply: replyContent.trim(),
        replyAt: Date.now(),
        updatedAt: Date.now()
      };
      setReviews(reviews.map(r => r.id === replyingReview.id ? updatedReview : r));
      setShowReplyModal(false);
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRatingSummary = () => {
    const summary: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => summary[r.rating]++);
    const total = reviews.length;
    return { summary, total, average: total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0 };
  };

  const ratingSummary = getRatingSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">评价管理</h2>
          <p className="text-gray-500 mt-1">管理用户评价，回复和筛选评价内容</p>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Average Rating */}
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <p className="text-5xl font-bold text-purple-600 mb-2">
              {ratingSummary.average.toFixed(1)}
            </p>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${index < Math.round(ratingSummary.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">共 {ratingSummary.total} 条评价</p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-3">
            <h4 className="font-medium text-gray-900 mb-3">评价分布</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingSummary.summary[rating];
                const percentage = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <Star className={`w-4 h-4 ${rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      <span className="text-sm text-gray-600">{rating}星</span>
                    </div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索评价内容、用户名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedRating.toString()}
                  onChange={(e) => setSelectedRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部星级</option>
                  <option value="5">5星</option>
                  <option value="4">4星</option>
                  <option value="3">3星</option>
                  <option value="2">2星</option>
                  <option value="1">1星</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部状态</option>
                  <option value="pinned">已置顶</option>
                  <option value="featured">已精选</option>
                  <option value="replied">已回复</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-gray-100">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={review.clientAvatar || `https://i.pravatar.cc/48?u=${review.id}`}
                      alt={review.clientName}
                      className="w-12 h-12 rounded-full bg-gray-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{review.clientName}</span>
                        <span className="text-sm text-gray-400">{formatDate(review.createdAt)}</span>
                        {review.isPinned && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            <Pin className="w-3 h-3 mr-1" />
                            置顶
                          </span>
                        )}
                        {review.isFeatured && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                            <Star className="w-3 h-3 mr-1" />
                            精选
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      <p className="text-gray-600 mb-3">{review.content}</p>

                      {/* Review Images */}
                      {review.images.length > 0 && (
                        <div className="flex space-x-2 mb-3">
                          {review.images.slice(0, 4).map((img, index) => (
                            <div key={index} className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              {index === 3 && review.images.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white font-medium">+{review.images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply */}
                      {review.reply && (
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-purple-600">设计师回复</span>
                            <span className="text-xs text-gray-400">
                              {review.replyAt ? formatDate(review.replyAt) : ''}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePin(review)}
                        className={`p-2 rounded-lg transition-colors ${
                          review.isPinned
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                        title={review.isPinned ? '取消置顶' : '置顶'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(review)}
                        className={`p-2 rounded-lg transition-colors ${
                          review.isFeatured
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                        title={review.isFeatured ? '取消精选' : '设为精选'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReply(review)}
                        className="p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                        title="回复评价"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
              <p className="text-gray-500">
                {searchQuery || selectedRating !== 'all' || selectedStatus !== 'all'
                  ? '没有找到匹配的评价，请尝试其他筛选条件'
                  : '等待用户的评价'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && replyingReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReplyModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">回复评价</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                {/* Review Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={replyingReview.clientAvatar || `https://i.pravatar.cc/32?u=${replyingReview.id}`}
                      alt={replyingReview.clientName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{replyingReview.clientName}</p>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-3 h-3 ${index < replyingReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{replyingReview.content}</p>
                </div>

                {/* Reply Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    回复内容
                  </label>
                  <textarea
                    rows={5}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="请输入回复内容..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={saving || !replyContent.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>发送中...</span>
                    </>
                  ) : (
                    <span>发送回复</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
