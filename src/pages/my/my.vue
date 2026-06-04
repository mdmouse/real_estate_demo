<template>
  <view class="container">
    <!-- 顶部资料区 -->
    <view class="profile-bar">
      <view class="pb-avatar">{{ currentUser?.avatar || '👤' }}</view>
      <view class="pb-info">
        <text class="pb-name">{{ currentUser?.name }}</text>
        <view class="pb-meta">
          <text class="pb-role">{{ roleNames[currentUser?.role] }}</text>
          <text class="pb-id">No.88{{ currentUser?.id }}</text>
        </view>
      </view>
      <text class="pb-qr">▦</text>
    </view>

    <!-- 余额条 -->
    <view class="balance-bar">
      <view class="bb-left">
        <text class="bb-lbl">可提现余额 (元)</text>
        <text class="bb-val">¥{{ currentUser?.balance.toLocaleString() }}</text>
      </view>
      <button class="bb-btn" @click="openWithdraw">合规提现</button>
    </view>
    <view class="measure-tip">
      <text class="mt-lbl">本月量房 {{ currentUser?.monthlyMeasureCount || 0 }} 次</text>
      <text class="mt-hint">满 {{ REWARDS.PERF_MEASURE_THRESHOLD }} 次得 ¥{{ REWARDS.PERF_BONUS }} 业绩奖</text>
    </view>

    <!-- 菜单组一：核心资产 -->
    <view class="menu-group">
      <view class="menu-row" @click="openWithdraw">
        <view class="mr-icon ic-red">¥</view>
        <text class="mr-txt">我的账户</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="goTransactions">
        <view class="mr-icon ic-purple">📈</view>
        <text class="mr-txt">我的收入</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" v-if="currentUser?.role === 'V3'" @click="goSeniorIncome">
        <view class="mr-icon ic-gold">👑</view>
        <text class="mr-txt">渠道收益</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="goWorkbench">
        <view class="mr-icon ic-teal">📋</view>
        <text class="mr-txt">我的客户</text>
        <text class="mr-arrow">›</text>
      </view>
    </view>

    <!-- 菜单组二：团队与服务 -->
    <view class="menu-group">
      <view class="menu-row" @click="goTeam">
        <view class="mr-icon ic-blue">👥</view>
        <text class="mr-txt">我的团队</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="goMarketing">
        <view class="mr-icon ic-green">🔗</view>
        <text class="mr-txt">我要推广</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="comingSoon">
        <view class="mr-icon ic-cyan">🏦</view>
        <text class="mr-txt">灵活用工收款账户</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="comingSoon">
        <view class="mr-icon ic-slate">🛡️</view>
        <text class="mr-txt">安全中心</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="comingSoon">
        <view class="mr-icon ic-indigo">💬</view>
        <text class="mr-txt">意见反馈</text>
        <text class="mr-arrow">›</text>
      </view>
      <view class="menu-row" @click="comingSoon">
        <view class="mr-icon ic-cyan">📞</view>
        <text class="mr-txt">联系客服</text>
        <text class="mr-arrow">›</text>
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

          <view class="tax-calc-box" v-if="typeof withdrawAmount === 'number' && withdrawAmount > 0">
            <view class="tc-row">
              <text class="tc-lbl">申请提现总额</text>
              <text class="tc-val">¥{{ withdrawAmount.toLocaleString() }}</text>
            </view>
            <view class="tc-row tax-row">
              <text class="tc-lbl">提现手续费 (8% + 3元/笔)</text>
              <text class="tc-val">- ¥{{ feeAmount.toFixed(2) }}</text>
            </view>
            <view class="tc-divider"></view>
            <view class="tc-row final-row">
              <text class="tc-lbl">实际到账金额</text>
              <text class="tc-val-big">¥{{ actualAmount.toFixed(2) }}</text>
            </view>
            <text class="tax-note">提现规则：单笔需满 100 元整数，单日最多 3 笔且累计不超过 1 万元。资金于发起申请后 24 小时内结算至绑定结算卡；如遇系统繁忙等情况延迟到账，详情请留意系统通知。</text>
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
import { store, ROLE_NAMES, REWARDS } from '../../store/mockData';

const currentUser = computed(() => store.currentUser);
const roleNames: Record<string, string> = ROLE_NAMES;

const showWithdraw = ref(false);
const withdrawAmount = ref<number | ''>('');

// 费用明细：仅收取手续费 8%+3元/笔（不再叠加个税）
const feeAmount = computed(() => typeof withdrawAmount.value === 'number' ? withdrawAmount.value * 0.08 + 3 : 0);
const actualAmount = computed(() => typeof withdrawAmount.value === 'number' ? withdrawAmount.value - feeAmount.value : 0);

const canWithdraw = computed(() => {
  const v = withdrawAmount.value;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 100) return false;
  return v <= (currentUser.value?.balance || 0);
});

const openWithdraw = () => {
  if((currentUser.value?.balance || 0) < 100) {
    uni.showToast({ title: '可提现余额需满 100 元', icon: 'none' });
    return;
  }
  // 默认预填为不超过余额的整数额度
  withdrawAmount.value = Math.floor(currentUser.value?.balance || 0);
  showWithdraw.value = true;
};

const submitWithdraw = () => {
  if(typeof withdrawAmount.value !== 'number') return;
  const res = store.withdraw(withdrawAmount.value);
  if (res.ok) {
    showWithdraw.value = false;
    uni.showToast({ title: res.msg, icon: 'none', duration: 2800 });
  } else {
    uni.showToast({ title: res.msg, icon: 'none', duration: 2800 });
  }
};

const goTransactions = () => { uni.navigateTo({ url: '/pages/transactions/transactions' }); };
const goSeniorIncome = () => { uni.navigateTo({ url: '/pages/senior-income/senior-income' }); };
const goWorkbench = () => { uni.switchTab({ url: '/pages/index/index' }); };
const goTeam = () => { uni.switchTab({ url: '/pages/team/team' }); };
const goMarketing = () => { uni.switchTab({ url: '/pages/marketing/marketing' }); };
const comingSoon = () => { uni.showToast({ title: '功能开发中，敬请期待', icon: 'none' }); };
const handleLogout = () => { uni.reLaunch({ url: '/pages/login/login' }); };
</script>

<style>
.container { min-height: 100vh; background: #f8f9fc; padding-bottom: 20px;}

/* 顶部资料区 */
.profile-bar { background: linear-gradient(135deg, #4a148c, #7e57c2); padding: 28px 20px 24px; display: flex; align-items: center; }
.pb-avatar { font-size: 30px; width: 56px; height: 56px; border-radius: 28px; background: rgba(255,255,255,0.18); display: flex; justify-content: center; align-items: center; border: 2px solid rgba(255,255,255,0.4); margin-right: 14px; }
.pb-info { flex: 1; display: flex; flex-direction: column; color: white; }
.pb-name { font-size: 20px; font-weight: bold; margin-bottom: 6px; }
.pb-meta { display: flex; align-items: center; gap: 8px; }
.pb-role { font-size: 11px; background: rgba(212,175,55,0.95); color: #4a148c; font-weight: bold; padding: 2px 8px; border-radius: 8px; }
.pb-id { font-size: 12px; opacity: 0.85; }
.pb-qr { font-size: 26px; color: rgba(255,255,255,0.9); }

/* 余额条 */
.balance-bar { margin: -12px 20px 0; background: #ffffff; border-radius: 16px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 6px 20px rgba(74,20,140,0.10); position: relative; z-index: 2; }
.bb-left { display: flex; flex-direction: column; }
.bb-lbl { font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.bb-val { font-size: 28px; font-weight: bold; color: #4a148c; font-family: 'DIN Alternate', sans-serif; }
.bb-btn { margin: 0; padding: 0 20px; height: 36px; line-height: 36px; font-size: 14px; border-radius: 18px; background: linear-gradient(90deg, #d4af37, #fde047); color: #4a148c; font-weight: bold; border: none; }
.bb-btn::after { border: none; }

.measure-tip { margin: 10px 20px 0; display: flex; align-items: center; gap: 8px; }
.mt-lbl { font-size: 12px; color: #6b7280; font-weight: 600; }
.mt-hint { font-size: 11px; color: #9ca3af; }

/* 圆形图标菜单组 */
.menu-group { margin: 18px 20px 0; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden; }
.menu-row { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f3f4f6; }
.menu-row:last-child { border-bottom: none; }
.menu-row:active { background: #f9fafb; }
.mr-icon { width: 36px; height: 36px; border-radius: 18px; display: flex; justify-content: center; align-items: center; font-size: 18px; color: white; margin-right: 14px; flex-shrink: 0; }
.mr-txt { flex: 1; font-size: 15px; color: #1f2937; }
.mr-arrow { color: #d1d5db; font-size: 20px; }
.ic-red { background: #f87171; }
.ic-purple { background: #7e57c2; }
.ic-gold { background: #d4af37; }
.ic-teal { background: #14b8a6; }
.ic-blue { background: #3b82f6; }
.ic-green { background: #22c55e; }
.ic-cyan { background: #06b6d4; }
.ic-slate { background: #64748b; }
.ic-indigo { background: #6366f1; }

.card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

.logout-wrap { padding: 20px; }
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
