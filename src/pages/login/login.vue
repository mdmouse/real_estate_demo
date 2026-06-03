<template>
  <view class="login-container">
    <view class="cyber-bg">
      <view class="glow-orb orb-1"></view>
      <view class="glow-orb orb-2"></view>
    </view>

    <view class="content-wrapper">
      <view class="brand-section">
        <view class="logo-box">
          <text class="logo-txt">家</text>
        </view>
        <text class="brand-title">紫钰家装推客</text>
        <text class="brand-subtitle">Ziyu Flagship Demo System</text>
      </view>

      <view class="roles-section">
        <text class="section-tip">请选择演示角色进入系统</text>

        <view class="role-card" @click="handleLogin('u4')">
          <view class="r-icon-box v1-theme">👤</view>
          <view class="r-info">
            <view class="r-head">
              <text class="r-name">小王</text>
              <text class="r-badge v1-badge">注册推荐官 V1</text>
            </view>
            <text class="r-desc">带单赚奖励：量房200 + 签单200 + 节点返佣3%</text>
          </view>
          <view class="r-arrow">→</view>
        </view>

        <view class="role-card" @click="handleLogin('u2')">
          <view class="r-icon-box v2-theme">👔</view>
          <view class="r-info">
            <view class="r-head">
              <text class="r-name">张经纪</text>
              <text class="r-badge v2-badge">经纪人 V2</text>
            </view>
            <text class="r-desc">带单收益 + 开发渠道，冲刺高级经纪人</text>
          </view>
          <view class="r-arrow">→</view>
        </view>

        <view class="role-card" @click="handleLogin('u1')">
          <view class="r-icon-box v3-theme">👑</view>
          <view class="r-info">
            <view class="r-head">
              <text class="r-name">李队长</text>
              <text class="r-badge v3-badge">高级经纪人 V3</text>
            </view>
            <text class="r-desc">管理分润30%/20% + 渠道返佣3‰ + 里程碑奖</text>
          </view>
          <view class="r-arrow">→</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { store } from '../../store/mockData';

const handleLogin = (userId: string) => {
  store.loginAs(userId);
  uni.showLoading({ title: '身份验证中...', mask: true });
  setTimeout(() => {
    uni.hideLoading();
    uni.switchTab({ url: '/pages/index/index' });
  }, 600);
};
</script>

<style>
/* 深邃高定暗金风格 */
.login-container {
  background: #0b0914;
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cyber-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 10s infinite alternate ease-in-out;
}

.orb-1 {
  width: 300px; height: 300px;
  background: #7e57c2;
  top: -100px; left: -100px;
}

.orb-2 {
  width: 250px; height: 250px;
  background: #d4af37;
  bottom: 100px; right: -50px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 60px 24px 40px;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}

.logo-box {
  width: 90px;
  height: 90px;
  border-radius: 45px;
  background: linear-gradient(135deg, #b388ff 0%, #4a148c 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 30px rgba(126, 87, 194, 0.6), inset 0 0 15px rgba(255,255,255,0.3);
  margin-bottom: 20px;
  border: 2px solid rgba(255,255,255,0.1);
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 30px rgba(126, 87, 194, 0.6); }
  50% { box-shadow: 0 0 50px rgba(126, 87, 194, 0.9); }
  100% { box-shadow: 0 0 30px rgba(126, 87, 194, 0.6); }
}

.logo-txt {
  font-size: 40px;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.brand-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.brand-subtitle {
  font-size: 12px;
  color: #a78bfa;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.roles-section {
  flex: 1;
}

.section-tip {
  font-size: 13px;
  color: #8b5cf6;
  margin-bottom: 24px;
  display: block;
  text-align: center;
  letter-spacing: 1px;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.role-card:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.08);
}

.r-icon-box {
  font-size: 28px;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  border: 1px solid rgba(255,255,255,0.1);
}

.v1-theme { background: linear-gradient(135deg, rgba(168,192,255,0.2), rgba(63,43,150,0.4)); }
.v2-theme { background: linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.4)); }
.v3-theme { background: linear-gradient(135deg, rgba(212,175,55,0.3), rgba(184,134,11,0.5)); }

.r-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.r-head {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.r-name {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-right: 10px;
}

.r-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: bold;
}
.v1-badge { background: rgba(255,255,255,0.1); color: #a8c0ff; }
.v2-badge { background: rgba(79,172,254,0.15); color: #4facfe; }
.v3-badge { background: rgba(212,175,55,0.15); color: #d4af37; border: 1px solid rgba(212,175,55,0.3);}

.r-desc {
  font-size: 12px;
  color: #9ca3af;
}

.r-arrow {
  color: rgba(255,255,255,0.3);
  font-size: 20px;
}
</style>
