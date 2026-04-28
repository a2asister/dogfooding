import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Query.css';

function Query() {
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  // 预约状态枚举
  const RESERVATION_STATUS = {
    NOT_FOUND: 'not_found',
    PENDING: 'pending',
    SUCCESS: 'success',
    EXPIRED: 'expired'
  };

  // 手机号格式校验
  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setPhone(value);

    // 清除错误
    if (errors.phone) {
      setErrors({});
    }
  };

  // 处理查询
  const handleQuery = async (e) => {
    e.preventDefault();

    // 验证手机号
    if (!phone.trim()) {
      setErrors({ phone: '请输入手机号' });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({ phone: '请输入正确的手机号格式' });
      return;
    }

    setIsQuerying(true);
    setErrors({});
    setQueryResult(null);

    try {
      // 调用后端查询接口
      const response = await fetch(`/api/query?phone=${encodeURIComponent(phone)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setQueryResult(data.data);
      } else {
        setErrors({
          submit: data.message || '查询失败，请稍后重试'
        });
      }
    } catch (error) {
      setErrors({
        submit: '网络错误，请稍后重试'
      });
    } finally {
      setIsQuerying(false);
    }
  };

  // 根据状态获取显示文案
  const getStatusInfo = (status) => {
    switch (status) {
      case RESERVATION_STATUS.NOT_FOUND:
        return {
          title: '未找到预约记录',
          description: '您还没有进行公测预约，请先完成预约。',
          className: 'status-not-found',
          showReservationLink: true
        };
      case RESERVATION_STATUS.PENDING:
        return {
          title: '预约审核中',
          description: '您的预约申请正在审核中，请耐心等待。我们将在3个工作日内通过短信通知您审核结果。',
          className: 'status-pending',
          showReservationLink: false
        };
      case RESERVATION_STATUS.SUCCESS:
        return {
          title: '预约成功',
          description: '恭喜您！已成功获取公测资格。公测开启后，我们将通过短信通知您下载游戏。公测福利将在游戏上线后自动发放到您的游戏账号中。',
          className: 'status-success',
          showReservationLink: false
        };
      case RESERVATION_STATUS.EXPIRED:
        return {
          title: '资格已失效',
          description: '您的预约资格已失效。公测资格有效期为7天，请重新预约获取新的测试资格。',
          className: 'status-expired',
          showReservationLink: true
        };
      default:
        return {
          title: '未知状态',
          description: '无法确定您的预约状态，请稍后重试。',
          className: 'status-unknown',
          showReservationLink: false
        };
    }
  };

  return (
    <div className="query-page">
      <div className="container">
        <div className="page-header">
          <Link to="/" className="back-link">← 返回首页</Link>
          <h1 className="page-title">预约资格查询</h1>
          <p className="page-subtitle">输入手机号查询您的预约状态</p>
        </div>

        <div className="query-form-container">
          <form className="query-form" onSubmit={handleQuery}>
            <div className="form-group">
              <label htmlFor="query-phone" className="form-label">
                请输入预约手机号
              </label>
              <input
                type="tel"
                id="query-phone"
                value={phone}
                onChange={handleInputChange}
                placeholder="请输入手机号"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                maxLength={11}
              />
              {errors.phone && (
                <p className="error-message">{errors.phone}</p>
              )}
            </div>

            {errors.submit && (
              <div className="submit-error">
                <p className="error-message">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-submit"
              disabled={isQuerying}
            >
              {isQuerying ? '查询中...' : '立即查询'}
            </button>
          </form>

          {/* 查询结果展示 */}
          {queryResult && (
            <div className="query-result">
              <div className={`result-card ${getStatusInfo(queryResult.status).className}`}>
                <h3 className="result-title">
                  {getStatusInfo(queryResult.status).title}
                </h3>
                <p className="result-description">
                  {getStatusInfo(queryResult.status).description}
                </p>
                
                {queryResult.reservationTime && (
                  <p className="result-info">
                    预约时间：{new Date(queryResult.reservationTime).toLocaleString('zh-CN')}
                  </p>
                )}
                
                {queryResult.channel && (
                  <p className="result-info">
                    预约渠道：{queryResult.channel.toUpperCase()}
                  </p>
                )}

                {getStatusInfo(queryResult.status).showReservationLink && (
                  <Link to="/reservation" className="btn btn-primary">
                    立即预约
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Query;
