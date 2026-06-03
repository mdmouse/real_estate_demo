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

    <!-- 业务推进（演示用，驱动分佣引擎） -->
    <view class="action-card card" v-if="nextStep">
      <text class="section-title">业务推进</text>
      <text class="action-hint">点击模拟真实业务节点，系统会自动结算佣金、更新时间轴与流水。</text>
      <button class="btn-primary action-btn" @click="advance">{{ nextStep.label }} →</button>
      <button class="btn-gold action-btn" v-if="lead.totalAmount && lead.totalAmount > 0" @click="openUpsell">+ 添加供应链增项</button>
    </view>
    <view class="action-card card done-card" v-else-if="lead.status === 'COMPLETED'">
      <text class="done-emoji">🎉</text>
      <text class="done-text">该订单已全部完成，佣金已结清</text>
      <button class="btn-gold action-btn" @click="openUpsell">+ 追加供应链增项</button>
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

    <!-- 签约金额录入弹窗 -->
    <view class="modal-mask" v-if="showAmount" @click.self="showAmount = false">
      <view class="input-modal">
        <text class="im-title">录入合同签约金额</text>
        <input type="number" class="im-input" v-model.number="amountInput" placeholder="如 150000" />
        <view class="im-actions">
          <button class="im-btn cancel" @click="showAmount = false">取消</button>
          <button class="im-btn confirm" @click="confirmAmount">确认签约</button>
        </view>
      </view>
    </view>

    <!-- 供应链增项录入弹窗 -->
    <view class="modal-mask" v-if="showUpsell" @click.self="showUpsell = false">
      <view class="input-modal">
        <text class="im-title">添加供应链增项</text>
        <input class="im-input small" v-model="upsell.name" placeholder="增项名称（如 中央空调）" />
        <input type="number" class="im-input small" v-model.number="upsell.amount" placeholder="客户增购金额（元）" />
        <input type="number" class="im-input small" v-model.number="upsell.rate" placeholder="返佣比例（%）如 5" />
        <view class="im-actions">
          <button class="im-btn cancel" @click="showUpsell = false">取消</button>
          <button class="im-btn confirm" @click="confirmUpsell">确认录入</button>
        </view>
      </view>
    </view>
  </view>

  <!-- 深链兜底：线索不存在 -->
  <view v-else class="not-found">
    <text class="nf-emoji">🔍</text>
    <text class="nf-text">线索不存在或已被移除</text>
    <button class="btn-primary nf-btn" @click="goBack">返回</button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { store, Lead, LeadStatus, STATUS_NAMES } from '../../store/mockData';

const statusNames: any = STATUS_NAMES;
const lead = ref<Lead | null>(null);

onLoad((options: any) => {
  if (options.id) {
    lead.value = store.leads.find(l => l.id === options.id) || null;
  }
});

// 各状态对应的「下一步」配置
const stepMap: Record<string, { to: LeadStatus; label: string; needAmount?: boolean }> = {
  PENDING:    { to: 'MEASURED',   label: '模拟设计师上门量房' },
  MEASURED:   { to: 'SIGNED',     label: '模拟客户签约（录入合同金额）', needAmount: true },
  SIGNED:     { to: 'WATER_ELEC', label: '模拟水电进场验收' },
  WATER_ELEC: { to: 'FURNITURE',  label: '模拟软装 / 全屋定制进场' },
  FURNITURE:  { to: 'COMPLETED',  label: '模拟竣工验收结算' },
};
const nextStep = computed(() => (lead.value ? stepMap[lead.value.status] : undefined));

const goBack = () => { uni.navigateBack(); };

// 签约金额弹窗
const showAmount = ref(false);
const amountInput = ref<number | ''>('');
const advance = () => {
  if (!lead.value || !nextStep.value) return;
  if (nextStep.value.needAmount) {
    amountInput.value = '';
    showAmount.value = true;
  } else {
    store.updateLeadStatus(lead.value.id, nextStep.value.to);
    uni.showToast({ title: '业务已推进', icon: 'success' });
  }
};
const confirmAmount = () => {
  if (!lead.value || typeof amountInput.value !== 'number' || amountInput.value <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' });
    return;
  }
  store.updateLeadStatus(lead.value.id, 'SIGNED', amountInput.value);
  showAmount.value = false;
  uni.showToast({ title: '签约成功，已触发分润', icon: 'success' });
};

// 供应链增项弹窗
const showUpsell = ref(false);
const upsell = ref<{ name: string; amount: number | ''; rate: number | '' }>({ name: '', amount: '', rate: '' });
const openUpsell = () => { upsell.value = { name: '', amount: '', rate: '' }; showUpsell.value = true; };
const confirmUpsell = () => {
  const u = upsell.value;
  if (!lead.value || !u.name || typeof u.amount !== 'number' || u.amount <= 0 || typeof u.rate !== 'number' || u.rate <= 0) {
    uni.showToast({ title: '请填写完整增项信息', icon: 'none' });
    return;
  }
  store.addUpsell(lead.value.id, u.name, u.amount, u.rate / 100);
  showUpsell.value = false;
  uni.showToast({ title: '增项已录入', icon: 'success' });
};
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
.status-badge.INVALID { background: #f3f4f6; color: #6b7280; }

.meta { font-size: 14px; color: #6b7280; display: block; margin-bottom: 8px; }

.protection-box { margin-top: 16px; padding: 12px; background: #fee2e2; color: #b91c1c; border-radius: 8px; font-size: 13px; display: flex; align-items: center;}
.p-icon { margin-right: 6px; font-size: 16px; }

.amount-box { margin-top: 16px; padding: 12px; background: #fef3c7; color: #d97706; border-radius: 8px; font-weight: bold; font-size: 15px; }

/* 业务推进操作区 */
.action-card { padding: 24px; margin-bottom: 24px; }
.action-hint { font-size: 12px; color: #9ca3af; line-height: 1.5; display: block; margin: 8px 0 18px; }
.action-btn { height: 48px; line-height: 48px; border-radius: 24px; font-size: 15px; font-weight: bold; margin-bottom: 12px; }
.action-btn:last-child { margin-bottom: 0; }
.done-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
.done-emoji { font-size: 40px; margin-bottom: 8px; }
.done-text { font-size: 15px; font-weight: bold; color: #059669; margin-bottom: 18px; }

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

/* 弹窗 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 24px; }
.input-modal { width: 100%; max-width: 320px; background: white; border-radius: 20px; padding: 24px; }
.im-title { font-size: 17px; font-weight: bold; color: #1f2937; display: block; margin-bottom: 20px; text-align: center; }
.im-input { border: 1px solid #e5e7eb; border-radius: 12px; height: 48px; padding: 0 16px; font-size: 16px; color: #1f2937; margin-bottom: 12px; background: #f9fafb; }
.im-input.small { height: 44px; font-size: 14px; }
.im-actions { display: flex; gap: 12px; margin-top: 8px; }
.im-btn { flex: 1; height: 44px; line-height: 44px; border-radius: 22px; font-size: 15px; font-weight: bold; }
.im-btn.cancel { background: #f3f4f6; color: #6b7280; }
.im-btn.confirm { background: #4a148c; color: white; }

/* 深链兜底 */
.not-found { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8f9fc; }
.nf-emoji { font-size: 56px; margin-bottom: 16px; }
.nf-text { font-size: 15px; color: #9ca3af; margin-bottom: 24px; }
.nf-btn { padding: 0 40px; height: 44px; line-height: 44px; border-radius: 22px; font-size: 15px; }
</style>
