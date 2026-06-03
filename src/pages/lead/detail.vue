<template>
  <view class="container" v-if="lead">
    <!-- Header Card -->
    <view class="header card">
      <view class="h-top">
        <view class="name-box">
          <text class="name">{{ lead.clientName }}</text>
          <text class="intention-tag" :class="lead.intentionLevel">{{ lead.intentionLevel }}类客户</text>
        </view>
        <text class="status-badge" :class="lead.status">{{ statusNames[lead.status] }}</text>
      </view>
      <text class="meta">电话：{{ lead.clientPhone }}</text>
      <text class="meta">意向小区：{{ lead.community }} ({{ lead.area }}㎡)</text>
      <text class="meta">录入时间：{{ lead.createDate }}</text>
      
      <view class="protection-box" v-if="['PENDING', 'MEASURED'].includes(lead.status)">
        <text class="p-icon">⏳</text>
        <text class="p-text">公海保护期至：{{ lead.protectionExpireDate }}</text>
      </view>
      
      <view class="amount-box" v-if="lead.totalAmount && lead.totalAmount > 0">
        <text>主合同签约额：¥{{ lead.totalAmount.toLocaleString() }}</text>
      </view>
    </view>

    <!-- 供应链增项 -->
    <view class="upsell-section" v-if="lead.upsellItems && lead.upsellItems.length > 0">
      <text class="section-title">供应链增项收益</text>
      <view class="upsell-card" v-for="(item, idx) in lead.upsellItems" :key="idx">
        <view class="u-info">
          <text class="u-name">🛍 {{ item.name }}</text>
          <text class="u-amount">客户增购金额: ¥{{ item.amount.toLocaleString() }}</text>
        </view>
        <view class="u-comm">
          <text class="u-lbl">为您创收</text>
          <text class="u-val">+¥{{ item.comm.toLocaleString() }}</text>
        </view>
      </view>
    </view>

    <view class="timeline-section">
      <text class="section-title">业务跟进时间轴</text>
      <view class="timeline">
        <view class="tl-item" v-for="(ev, index) in lead.timeline" :key="index">
          <view class="tl-line" v-if="index !== lead.timeline.length - 1"></view>
          <view class="tl-icon">{{ ev.icon }}</view>
          <view class="tl-content">
            <text class="tl-title">{{ ev.title }}</text>
            <text class="tl-time">{{ ev.time }}</text>
            <view class="tl-desc">{{ ev.desc }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { store, Lead } from '../../store/mockData';

const statusNames: any = { 
  'PENDING': '待跟进', 'MEASURED': '已量房', 'SIGNED': '已签约', 
  'WATER_ELEC': '水电进场', 'FURNITURE': '软装进场', 'COMPLETED': '已竣工', 'INVALID': '已失效' 
};
const lead = ref<Lead | null>(null);

onLoad((options: any) => {
  if (options.id) {
    lead.value = store.leads.find(l => l.id === options.id) || null;
  }
});
</script>

<style>
.container { padding: 20px; background: #f8f9fc; min-height: 100vh;}
.card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.header { padding: 24px; margin-bottom: 24px; }
.h-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.name-box { display: flex; align-items: center; }
.name { font-size: 24px; font-weight: bold; color: #1f2937; }

.intention-tag { margin-left: 8px; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 6px; border: 1px solid transparent;}
.intention-tag.A { color: #dc2626; background: #fef2f2; border-color: #fca5a5; }
.intention-tag.B { color: #d97706; background: #fffbeb; border-color: #fcd34d; }
.intention-tag.C { color: #4b5563; background: #f3f4f6; border-color: #d1d5db; }

.status-badge { font-size: 12px; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
.status-badge.PENDING { background: #e0e7ff; color: #4f46e5; }
.status-badge.MEASURED { background: #fef3c7; color: #d97706; }
.status-badge.SIGNED { background: #d1fae5; color: #059669; }
.status-badge.WATER_ELEC, .status-badge.FURNITURE { background: #ccfbf1; color: #0f766e; }
.status-badge.COMPLETED { background: #f3e8ff; color: #9333ea; }

.meta { font-size: 14px; color: #6b7280; display: block; margin-bottom: 8px; }

.protection-box { margin-top: 16px; padding: 12px; background: #fee2e2; color: #b91c1c; border-radius: 8px; font-size: 13px; display: flex; align-items: center;}
.p-icon { margin-right: 6px; font-size: 16px; }

.amount-box { margin-top: 16px; padding: 12px; background: #fef3c7; color: #d97706; border-radius: 8px; font-weight: bold; font-size: 15px; }

.upsell-section { margin-bottom: 24px; }
.upsell-card { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #f0f9ff, #e0f2fe); padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #bae6fd;}
.u-info { display: flex; flex-direction: column; }
.u-name { font-size: 15px; font-weight: bold; color: #0369a1; margin-bottom: 4px; }
.u-amount { font-size: 12px; color: #0284c7; }
.u-comm { display: flex; flex-direction: column; align-items: flex-end; }
.u-lbl { font-size: 11px; color: #0284c7; }
.u-val { font-size: 18px; font-weight: 900; color: #0ea5e9; font-family: 'DIN Alternate', sans-serif;}

.section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 20px; display: block; padding-left: 4px; border-left: 4px solid #7e57c2;}

.timeline { padding: 0 8px; }
.tl-item { position: relative; padding-left: 40px; padding-bottom: 30px; }
.tl-line { position: absolute; left: 15px; top: 30px; bottom: 0; width: 2px; background: #e5e7eb; }
.tl-icon { position: absolute; left: 0; top: 0; width: 32px; height: 32px; border-radius: 16px; background: white; display: flex; justify-content: center; align-items: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 2; }
.tl-content { background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.02); }
.tl-title { font-size: 16px; font-weight: bold; color: #1f2937; display: block; margin-bottom: 4px; }
.tl-time { font-size: 12px; color: #9ca3af; display: block; margin-bottom: 12px; }
.tl-desc { font-size: 14px; color: #4b5563; line-height: 1.5; background: #f9fafb; padding: 12px; border-radius: 8px; }
</style>
