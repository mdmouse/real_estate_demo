<template>
  <view class="container">
    <view class="header-section">
      <view class="bg"></view>
      <view class="content">
        <view class="avatar">{{ currentUser?.avatar || '👤' }}</view>
        <view class="info">
          <text class="name">{{ currentUser?.name }}</text>
          <text class="uid">身份: {{ roleNames[currentUser?.role] }} | 编码: No.88{{ currentUser?.id }}</text>
        </view>
      </view>
      
      <view class="wallet-card">
        <view class="w-top">
          <view class="w-item">
            <text class="w-lbl">可提现余额 (元)</text>
            <text class="w-val">¥{{ currentUser?.balance.toLocaleString() }}</text>
          </view>
          <button class="btn-gold withdraw-btn" @click="openWithdraw">合规提现</button>
        </view>
        <view class="w-bot">
          <text class="pending-lbl">在途预估佣金(元)：</text>
          <text class="pending-val">¥{{ currentUser?.pendingBalance.toLocaleString() }}</text>
        </view>
      </view>
    </view>

    <!-- 大队长专属分红池 -->
    <view class="bonus-pool-card" v-if="currentUser?.role === 'V3'">
      <view class="bp-header">
        <text class="bp-title">🏆 城市大队长年终分红池</text>
        <text class="bp-tag">预计分红</text>
      </view>
      <view class="bp-content">
        <text class="bp-amount">¥{{ bonusPool.toLocaleString() }}</text>
        <text class="bp-desc">全城年度总业绩金额的 1% 将作为年终奖分发</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item card" @click="goTransactions">
        <text class="m-icon">🧾</text>
        <text class="m-txt">资产流水明细</text>
        <text class="m-arrow">→</text>
      </view>
      <view class="menu-item card">
        <text class="m-icon">🏦</text>
        <text class="m-txt">灵活用工收款账户</text>
        <text class="m-arrow">→</text>
      </view>
      <view class="menu-item card">
        <text class="m-icon">📞</text>
        <text class="m-txt">联系合伙人</text>
        <text class="m-arrow">→</text>
      </view>
    </view>
    
    <view class="logout-wrap">
      <button class="logout-btn" @click="handleLogout">退出登录 / 切换账号</button>
    </view>

    <!-- 云账户提现模态框 -->
    <view class="modal-mask" v-if="showWithdraw" @click.self="showWithdraw = false">
      <view class="withdraw-modal">
        <view class="wm-header">
          <text class="wm-title">云账户安全提现</text>
          <view class="wm-close" @click="showWithdraw = false">×</view>
        </view>
        
        <view class="wm-body">
          <view class="form-item">
            <text class="f-lbl">提现金额</text>
            <input type="number" class="f-input" v-model.number="withdrawAmount" placeholder="请输入提现金额" />
          </view>

          <view class="tax-calc-box" v-if="withdrawAmount > 0">
            <view class="tc-row">
              <text class="tc-lbl">申请提现总额</text>
              <text class="tc-val">¥{{ withdrawAmount.toLocaleString() }}</text>
            </view>
            <view class="tc-row tax-row">
              <text class="tc-lbl">个税代扣代缴 (6%)</text>
              <text class="tc-val">- ¥{{ (withdrawAmount * 0.06).toLocaleString() }}</text>
            </view>
            <view class="tc-divider"></view>
            <view class="tc-row final-row">
              <text class="tc-lbl">实际到账金额</text>
              <text class="tc-val-big">¥{{ (withdrawAmount * 0.94).toLocaleString() }}</text>
            </view>
            <text class="tax-note">由云账户灵活用工平台依法代扣代缴个人所得税，资金直达个人微信零钱，安全合规。</text>
          </view>
        </view>
        
        <button class="btn-primary confirm-btn" :disabled="!canWithdraw" @click="submitWithdraw">
          确认提现
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { store } from '../../store/mockData';

const currentUser = computed(() => store.currentUser);
const roleNames: Record<string, string> = { 'V1': '普通推客', 'V2': '高级合伙人', 'V3': '城市大队长' };

// 模拟全市总业绩分红池
const bonusPool = computed(() => {
  const totalCitySales = store.leads.length * 150000; 
  return totalCitySales * 0.01; 
});

const showWithdraw = ref(false);
const withdrawAmount = ref<number | ''>('');

const canWithdraw = computed(() => {
  if (typeof withdrawAmount.value !== 'number' || withdrawAmount.value <= 0) return false;
  return withdrawAmount.value <= (currentUser.value?.balance || 0);
});

const openWithdraw = () => {
  if((currentUser.value?.balance || 0) <= 0) {
    uni.showToast({ title: '余额不足', icon: 'none' });
    return;
  }
  withdrawAmount.value = currentUser.value?.balance;
  showWithdraw.value = true;
};

const submitWithdraw = () => {
  if(!canWithdraw.value || typeof withdrawAmount.value !== 'number') return;
  store.withdraw(withdrawAmount.value);
  showWithdraw.value = false;
  uni.showToast({ title: '提现申请已提交', icon: 'success' });
};

const goTransactions = () => { uni.navigateTo({ url: '/pages/transactions/transactions' }); };
const handleLogout = () => { uni.reLaunch({ url: '/pages/login/login' }); };
</script>

<style>
.container { min-height: 100vh; background: #f8f9fc; padding-bottom: 20px;}
.header-section { position: relative; padding-bottom: 20px; }
.bg { position: absolute; top: 0; left: 0; right: 0; height: 160px; background: linear-gradient(135deg, #4a148c, #7e57c2); z-index: 0; border-radius: 0 0 20px 20px; }

.content { position: relative; z-index: 1; padding: 30px 24px; display: flex; align-items: center; }
.avatar { font-size: 36px; margin-right: 16px; background: rgba(255,255,255,0.15); width: 64px; height: 64px; border-radius: 32px; display: flex; justify-content: center; align-items: center; border: 2px solid rgba(255,255,255,0.4); backdrop-filter: blur(10px);}
.info { display: flex; flex-direction: column; color: white; }
.name { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
.uid { font-size: 12px; opacity: 0.9; }

.wallet-card { position: relative; z-index: 2; margin: 0 20px; background: linear-gradient(135deg, #1f2937, #111827); border-radius: 20px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
.w-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 16px; }
.w-lbl { color: #9ca3af; font-size: 13px; display: block; margin-bottom: 8px; }
.w-val { color: #d4af37; font-size: 32px; font-weight: bold; font-family: 'DIN Alternate', sans-serif;}
.withdraw-btn { margin: 0; padding: 0 20px; height: 36px; line-height: 36px; font-size: 14px; border-radius: 18px; background: linear-gradient(90deg, #d4af37, #fde047); color: #4a148c; font-weight: bold; border: none;}

.w-bot { display: flex; align-items: center; }
.pending-lbl { color: #6b7280; font-size: 12px; }
.pending-val { color: #e5e7eb; font-size: 16px; font-weight: 600; font-family: 'DIN Alternate', sans-serif;}

/* 城市大队长分红池 */
.bonus-pool-card { margin: 0 20px 20px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 16px; padding: 20px; border: 1px solid #fde68a; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.05); }
.bp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.bp-title { font-size: 16px; font-weight: bold; color: #92400e; }
.bp-tag { font-size: 10px; background: #f59e0b; color: white; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
.bp-content { display: flex; flex-direction: column; }
.bp-amount { font-size: 32px; font-weight: 900; color: #b45309; font-family: 'DIN Alternate', sans-serif; margin-bottom: 8px; }
.bp-desc { font-size: 12px; color: #b45309; opacity: 0.8; }

.menu-list { padding: 0 20px 20px; }
.card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.menu-item { display: flex; align-items: center; padding: 20px; margin-bottom: 12px; }
.menu-item:active { background: #f3f4f6; }
.m-icon { font-size: 24px; margin-right: 16px; }
.m-txt { flex: 1; font-size: 15px; color: #1f2937; font-weight: bold; }
.m-arrow { color: #d1d5db; font-size: 20px; font-weight: bold; }

.logout-wrap { padding: 0 20px; }
.logout-btn { background: white; color: #ef4444; border: none; font-size: 15px; font-weight: bold; padding: 12px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.logout-btn::after { border: none; }

/* 提现模态框 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 999; display: flex; justify-content: center; align-items: flex-end; animation: fadeIn 0.3s; }
.withdraw-modal { width: 100%; background: white; border-radius: 24px 24px 0 0; padding: 24px; animation: slideUp 0.3s; }
.wm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.wm-title { font-size: 18px; font-weight: bold; color: #1f2937; }
.wm-close { font-size: 24px; color: #9ca3af; padding: 0 8px; }
.form-item { margin-bottom: 24px; }
.f-lbl { font-size: 14px; color: #4b5563; margin-bottom: 12px; display: block; }
.f-input { font-size: 32px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; height: 50px; font-family: 'DIN Alternate', sans-serif;}

.tax-calc-box { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
.tc-row { display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center; }
.tc-lbl { font-size: 13px; color: #6b7280; }
.tc-val { font-size: 14px; font-weight: 500; color: #1f2937; }
.tax-row .tc-lbl, .tax-row .tc-val { color: #ef4444; }
.tc-divider { height: 1px; background: #e5e7eb; margin: 12px 0; }
.final-row .tc-val-big { font-size: 20px; font-weight: bold; color: #059669; }
.tax-note { font-size: 11px; color: #9ca3af; display: block; margin-top: 12px; line-height: 1.4; }

.confirm-btn { width: 100%; height: 48px; line-height: 48px; border-radius: 24px; font-size: 16px; background: #4a148c; }
.confirm-btn[disabled] { background: #d1d5db; color: #9ca3af; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
