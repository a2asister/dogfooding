import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Reservation.css';

function Reservation() {
  const [formData, setFormData] = useState({
    phone: '',
    channel: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // 手机号格式校验
  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 表单校验
  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '请输入正确的手机号格式';
    }

    if (!formData.channel) {
      newErrors.channel = '请选择预约渠道';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '请勾选用户协议';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // 调用后端预约接口
      const response = await fetch('/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone,
          channel: formData.channel
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        // 重置表单
        setFormData({
          phone: '',
          channel: '',
          agreeTerms: false
        });
      } else {
        setSubmitStatus('error');
        setErrors({
          submit: data.message || '预约失败，请稍后重试'
        });
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrors({
        submit: '网络错误，请稍后重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reservation-page">
      <div className="container">
        <div className="page-header">
          <Link to="/" className="back-link">← 返回首页</Link>
          <h1 className="page-title">公测预约</h1>
          <p className="page-subtitle">填写以下信息完成公测预约</p>
        </div>

        <div className="reservation-form-container">
          {submitStatus === 'success' && (
            <div className="success-message">
              <h3>预约成功！</h3>
              <p>您已成功预约公测资格，我们将在3个工作日内通过短信通知您。</p>
              <Link to="/query" className="btn btn-primary">查看预约状态</Link>
            </div>
          )}

          {submitStatus !== 'success' && (
            <form className="reservation-form" onSubmit={handleSubmit}>
              {/* 手机号输入 */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  手机号 <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入手机号"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  maxLength={11}
                />
                {errors.phone && (
                  <p className="error-message">{errors.phone}</p>
                )}
              </div>

              {/* 预约渠道选择 */}
              <div className="form-group">
                <label className="form-label">
                  预约渠道 <span className="required">*</span>
                </label>
                <div className="channel-options">
                  <label className={`channel-option ${formData.channel === 'android' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="channel"
                      value="android"
                      checked={formData.channel === 'android'}
                      onChange={handleInputChange}
                      className="channel-radio"
                    />
                    <span className="channel-label">Android</span>
                  </label>
                  <label className={`channel-option ${formData.channel === 'ios' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="channel"
                      value="ios"
                      checked={formData.channel === 'ios'}
                      onChange={handleInputChange}
                      className="channel-radio"
                    />
                    <span className="channel-label">iOS</span>
                  </label>
                  <label className={`channel-option ${formData.channel === 'pc' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="channel"
                      value="pc"
                      checked={formData.channel === 'pc'}
                      onChange={handleInputChange}
                      className="channel-radio"
                    />
                    <span className="channel-label">PC</span>
                  </label>
                </div>
                {errors.channel && (
                  <p className="error-message">{errors.channel}</p>
                )}
              </div>

              {/* 用户协议勾选 */}
              <div className="form-group">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="terms-checkbox"
                  />
                  <span className="terms-text">
                    我已阅读并同意
                    <a href="#" className="terms-link">《用户协议》</a>
                    和
                    <a href="#" className="terms-link">《隐私政策》</a>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="error-message">{errors.agreeTerms}</p>
                )}
              </div>

              {/* 提交错误信息 */}
              {errors.submit && (
                <div className="submit-error">
                  <p className="error-message">{errors.submit}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                className="btn btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '立即预约'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reservation;
