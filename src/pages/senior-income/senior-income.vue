<template>
  <view class="container">
    <view class="page-head">
      <text class="ph-title">👑 高级经纪人渠道收益</text>
      <text class="ph-sub">仅高级经纪人可见的渠道权益明细</text>
    </view>

    <view class="senior-card" v-if="currentUser?.role === 'V3'">
      <view class="sc-header">
        <text class="sc-title">本月渠道收益</text>
        <text class="sc-tag">本月</text>
      </view>
      <view class="sc-row">
        <text class="sc-lbl">渠道返佣（直属签约 3‰）</text>
        <text class="sc-val">¥{{ (currentUser.channelOverrideMonth || 0).toLocaleString() }}<text class="sc-cap"> / 3万封顶</text></text>
      </view>
      <view class="sc-bar"><view class="sc-bar-fill" :style="{ width: channelPct + '%' }"></view></view>
      <view class="sc-divider"></view>
      <view class="sc-row">
        <text class="sc-lbl">已开发经纪人</text>
        <text class="sc-val">{{ developedAgents }} 人</text>
      </view>
      <view class="sc-row" style="margin-top: 10px;">
        <text class="sc-lbl">管理分润 / 里程碑奖</text>
        <text class="sc-val">¥{{ seniorTeamIncome.toLocaleString() }}</text>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-emoji">🔒</text>
      <text class="empty-text">该模块仅对高级经纪人开放</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store, REWARDS } from '../../store/mockData';

const currentUser = computed(() => store.currentUser);

const developedAgents = computed(() => store.developedAgentsCount(currentUser.value?.id));
const channelPct = computed(() => Math.min(100, Math.round((currentUser.value?.channelOverrideMonth || 0) / REWARDS.CHANNEL_CAP * 100)));
const seniorTeamIncome = computed(() => {
  const types = ['MGMT_SHARE', 'CHANNEL_OVERRIDE', 'CHANNEL_MGMT_AWARD', 'ASSIST_AWARD'];
  return store.transactions
    .filter(t => t.userId === currentUser.value?.id && types.includes(t.type))
    .reduce((s, t) => s + t.amount, 0);
});
</script>

<style>
.container { min-height: 100vh; background: #f8f9fc; padding: 20px; }
.page-head { padding: 10px 4px 20px; }
.ph-title { font-size: 20px; font-weight: 800; color: #92400e; display: block; margin-bottom: 6px; }
.ph-sub { font-size: 12px; color: #b45309; }

/* 渠道收益卡 */
.senior-card { background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 16px; padding: 20px; border: 1px solid #fde68a; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.05); }
.sc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.sc-title { font-size: 16px; font-weight: bold; color: #92400e; }
.sc-tag { font-size: 10px; background: #f59e0b; color: white; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
.sc-row { display: flex; justify-content: space-between; align-items: center; }
.sc-lbl { font-size: 13px; color: #b45309; }
.sc-val { font-size: 16px; font-weight: 800; color: #b45309; font-family: 'DIN Alternate', sans-serif; }
.sc-cap { font-size: 11px; font-weight: normal; color: #d97706; }
.sc-bar { height: 8px; background: #fde68a; border-radius: 4px; margin-top: 8px; overflow: hidden; }
.sc-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 4px; transition: width 0.4s; }
.sc-divider { height: 1px; background: #fde68a; margin: 16px 0; }

.empty-state { text-align: center; padding: 80px 0; display: flex; flex-direction: column; align-items: center; }
.empty-emoji { font-size: 48px; margin-bottom: 16px; }
.empty-text { font-size: 14px; color: #9ca3af; }
</style>
