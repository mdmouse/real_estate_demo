<template>
  <view class="container">
    <view class="header-section">
      <text class="page-title">资金与流水</text>
      <text class="page-subtitle">每一笔收益都清晰可见</text>
    </view>

    <view class="list-container">
      <view class="empty-state" v-if="myTransactions.length === 0">
        <text class="empty-emoji">💰</text>
        <text>暂无收益流水</text>
      </view>

      <view class="tx-card" v-for="item in myTransactions" :key="item.id">
        <view class="tx-left">
          <view class="tx-icon" :class="getIconClass(item.type)">
            <text>{{ getIconText(item.type) }}</text>
          </view>
          <view class="tx-info">
            <text class="tx-title">{{ item.desc }}</text>
            <view class="tx-meta">
              <text class="tx-date">{{ item.date }}</text>
              <text class="tx-type-tag" :class="item.type">{{ getTypeName(item.type) }}</text>
            </view>
          </view>
        </view>
        <view class="tx-right">
          <text class="tx-amount" :class="{ negative: item.amount < 0 }">{{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store } from '../../store/mockData';

const currentUser = computed(() => store.currentUser);

const myTransactions = computed(() => {
  if (!currentUser.value) return [];
  return store.transactions.filter(t => t.userId === currentUser.value.id);
});

const getIconText = (type: string) => {
  const map: any = {
    LEAD_BONUS: '奖', SIGN_BONUS: '奖', PERF_BONUS: '绩', NODE_COMM: '佣', UPSELL_COMM: '增',
    MGMT_SHARE: '管', CHANNEL_OVERRIDE: '渠', CHANNEL_MGMT_AWARD: '渠', ASSIST_AWARD: '助',
    WITHDRAW: '提', TAX_DEDUCTION: '税'
  };
  return map[type] || '收';
};

const getIconClass = (type: string) => {
  if (['LEAD_BONUS', 'SIGN_BONUS', 'PERF_BONUS'].includes(type)) return 'icon-bonus';
  if (['MGMT_SHARE', 'CHANNEL_OVERRIDE', 'CHANNEL_MGMT_AWARD', 'ASSIST_AWARD'].includes(type)) return 'icon-diff';
  if (['WITHDRAW', 'TAX_DEDUCTION'].includes(type)) return 'icon-out';
  return 'icon-comm';
};

const getTypeName = (type: string) => {
  const map: any = {
    'LEAD_BONUS': '带单奖励', 'SIGN_BONUS': '签单奖励', 'NODE_COMM': '节点返佣',
    'PERF_BONUS': '业绩奖金', 'MGMT_SHARE': '管理分润', 'CHANNEL_OVERRIDE': '渠道返佣',
    'CHANNEL_MGMT_AWARD': '渠道管理奖', 'ASSIST_AWARD': '助力奖', 'UPSELL_COMM': '供应链返佣',
    'TAX_DEDUCTION': '个税代扣', 'WITHDRAW': '提现'
  };
  return map[type] || '其他';
};
</script>

<style>
.container { padding-bottom: 20px; background: #f8fbff; min-height: 100vh;}
.header-section { padding: 30px 20px 20px; }
.page-title { font-size: 26px; font-weight: 800; color: #2c3e50; display: block; margin-bottom: 6px;}
.page-subtitle { font-size: 14px; color: #7f8c8d; display: block; }

.list-container { padding: 0 20px; }
.tx-card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; }

.tx-left { display: flex; align-items: center; }
.tx-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 16px; font-weight: bold; color: white; margin-right: 14px; }

.icon-bonus { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.icon-comm { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
.icon-diff { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.icon-out { background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); }

.tx-info { display: flex; flex-direction: column; }
.tx-title { font-size: 15px; font-weight: bold; color: #2c3e50; margin-bottom: 6px; }
.tx-meta { display: flex; align-items: center; gap: 8px;}
.tx-date { font-size: 11px; color: #95a5a6; }
.tx-type-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;}

.tx-type-tag.LEAD_BONUS { background: #fff0f6; color: #eb2f96; }
.tx-type-tag.SIGN_BONUS { background: #fff0f6; color: #eb2f96; }
.tx-type-tag.PERF_BONUS { background: #fff7e6; color: #fa8c16; }
.tx-type-tag.NODE_COMM { background: #e6f7ff; color: #1890ff; }
.tx-type-tag.UPSELL_COMM { background: #e6fffb; color: #13c2c2; }
.tx-type-tag.MGMT_SHARE { background: #f9f0ff; color: #722ed1; }
.tx-type-tag.CHANNEL_OVERRIDE { background: #f9f0ff; color: #722ed1; }
.tx-type-tag.CHANNEL_MGMT_AWARD { background: #fffbe6; color: #d48806; }
.tx-type-tag.ASSIST_AWARD { background: #fffbe6; color: #d48806; }
.tx-type-tag.TAX_DEDUCTION { background: #f3f4f6; color: #6b7280; }
.tx-type-tag.WITHDRAW { background: #f3f4f6; color: #6b7280; }

.tx-right { display: flex; align-items: center; }
.tx-amount { font-size: 18px; font-weight: 800; color: #d35400; }
.tx-amount.negative { color: #6b7280; }
.empty-state { text-align: center; padding: 60px 0; display: flex; flex-direction: column; align-items: center;}
.empty-emoji { font-size: 48px; margin-bottom: 16px;}
</style>
