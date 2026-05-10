let lastRequestTime = 0;
const MIN_INTERVAL = 500;

function throttleRequest() {
  const now = Date.now();
  if (now - lastRequestTime < MIN_INTERVAL) {
    return false;
  }
  lastRequestTime = now;
  return true;
}

export async function getActivity() {
  try {
    const response = await fetch('/api/activity');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取活动信息失败:', error);
    return null;
  }
}

export async function getActivities() {
  try {
    const response = await fetch('/api/activities');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return null;
  }
}

export async function createActivity(activityData) {
  try {
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('创建活动失败:', error);
    return null;
  }
}

export async function purchase(activityId, userId, sliderToken) {
  if (!throttleRequest()) {
    return {
      success: false,
      message: '请求过于频繁，请稍后再试'
    };
  }
  
  try {
    const response = await fetch('/api/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activity_id: activityId,
        user_id: userId,
        slider_token: sliderToken
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('抢购失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后再试'
    };
  }
}
