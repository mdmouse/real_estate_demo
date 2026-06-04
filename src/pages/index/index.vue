<template>
  <view class="container">
    <!-- Premium Header -->
    <view class="premium-header">
      <view class="header-content">
        <view class="user-profile">
          <view class="avatar-ring">
            <text class="avatar-emoji">{{ currentUser?.avatar }}</text>
          </view>
          <view class="user-info">
            <text class="greeting">欢迎回来，</text>
            <view class="name-row">
              <text class="user-name">{{ currentUser?.name }}</text>
              <view class="role-badge" :class="currentUser?.role">
                <text class="rb-icon" v-if="currentUser?.role === 'V3'">👑</text>
                <text class="rb-icon" v-else-if="currentUser?.role === 'V2'">👔</text>
                <text class="rb-icon" v-else>👤</text>
                <text class="rb-text">{{ roleNames[currentUser?.role] }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- Decorative Elements -->
      <view class="dec-circle c1"></view>
      <view class="dec-circle c2"></view>
    </view>

    <view class="main-content">
      <!-- 统一的数据看板 (适配所有角色) -->
      <view class="data-board">
        <view class="board-header">
          <text class="bh-title">{{ ['V2', 'V3'].includes(currentUser?.role) ? '团队拓客大盘' : '我的拓客战报' }}</text>
          <text class="bh-more">实时更新 ></text>
        </view>
        
        <view class="board-stats" v-if="['V2', 'V3'].includes(currentUser?.role)">
          <view class="stat-box">
            <text class="s-val">{{ teamStats.teamLeadsCount }}</text>
            <text class="s-lbl">累计线索</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-box">
            <text class="s-val">{{ teamStats.teamSize }}</text>
            <text class="s-lbl">推广部(人)</text>
          </view>
        </view>

        <view class="board-stats" v-else>
          <view class="stat-box">
            <text class="s-val">{{ myLeads.length }}</text>
            <text class="s-lbl">推荐客户</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-box">
            <text class="s-val">{{ (currentUser?.balance || 0).toLocaleString() }}</text>
            <text class="s-lbl">累计收益(元)</text>
          </view>
        </view>
      </view>

      <!-- 成长进度（注册推荐官 / 经纪人） -->
      <view class="growth-card" v-if="showGrowth">
        <view class="g-block">
          <view class="g-head">
            <text class="g-title">🚀 {{ promoLabel }}</text>
            <text class="g-count">{{ promoCur }}/{{ promoTarget }}</text>
          </view>
          <view class="g-bar"><view class="g-bar-fill" :style="{ width: promoPct + '%' }"></view></view>
        </view>
        <view class="g-block">
          <view class="g-head">
            <text class="g-title">📏 本月量房业绩奖（满{{ REWARDS.PERF_MEASURE_THRESHOLD }}次得¥{{ REWARDS.PERF_BONUS }}）</text>
            <text class="g-count">{{ measureCount }}/{{ REWARDS.PERF_MEASURE_THRESHOLD }}</text>
          </view>
          <view class="g-bar"><view class="g-bar-fill gold" :style="{ width: measurePct + '%' }"></view></view>
        </view>
      </view>

      <view class="section-header">
        <view class="sh-left">
          <view class="sh-indicator"></view>
          <text class="sh-title">我的直客线索</text>
        </view>
        <view class="sh-right" v-if="myLeads.length">
          <text class="sh-count">共 {{ myLeads.length }} 单</text>
        </view>
      </view>

      <view class="empty-state" v-if="myLeads.length === 0">
        <view class="empty-img-box">🚀</view>
        <text class="empty-title">暂无跟进线索</text>
        <text class="empty-desc">赶紧去营销大厅转发海报，赚取第一笔佣金吧！</text>
        <button class="btn-action" @click="goAdd">立即推客</button>
      </view>

      <!-- Lead Cards -->
      <view class="lead-card" v-for="lead in myLeads" :key="lead.id" @click="goDetail(lead.id)">
        <view class="lc-header">
          <view class="lc-client">
            <text class="client-name">{{ lead.clientName }}</text>
            <view class="intention-tag" :class="lead.intentionLevel">
              {{ lead.intentionLevel }}类
            </view>
            <text class="client-tag">{{ lead.area }}㎡</text>
          </view>
          <view class="lc-status-pill" :class="lead.status">
            <view class="status-dot"></view>
            <text>{{ statusNames[lead.status] }}</text>
          </view>
        </view>

        <view class="lc-body">
          <view class="info-row">
            <text class="icon">📍</text>
            <text class="text">意向楼盘：{{ lead.community }}</text>
          </view>
          
          <!-- Stepper Progress (5 Steps) -->
          <view class="stepper-wrap">
            <view class="step" :class="{ active: getStepLevel(lead.status) >= 1 }">
              <view class="s-node"></view><text class="s-lbl">报备</text>
            </view>
            <view class="step-line" :class="{ active: getStepLevel(lead.status) >= 2 }"></view>
            <view class="step" :class="{ active: getStepLevel(lead.status) >= 2 }">
              <view class="s-node"></view><text class="s-lbl">量房</text>
            </view>
            <view class="step-line" :class="{ active: getStepLevel(lead.status) >= 3 }"></view>
            <view class="step" :class="{ active: getStepLevel(lead.status) >= 3 }">
              <view class="s-node"></view><text class="s-lbl">签约</text>
            </view>
            <view class="step-line" :class="{ active: getStepLevel(lead.status) >= 4 }"></view>
            <view class="step" :class="{ active: getStepLevel(lead.status) >= 4 }">
              <view class="s-node"></view><text class="s-lbl">施工</text>
            </view>
            <view class="step-line" :class="{ active: getStepLevel(lead.status) >= 5 }"></view>
            <view class="step" :class="{ active: getStepLevel(lead.status) >= 5 }">
              <view class="s-node"></view><text class="s-lbl">竣工</text>
            </view>
          </view>
        </view>

        <view class="lc-footer">
          <text class="lf-icon">🔔</text>
          <text class="lf-text">{{ lead.timeline[0]?.title }} ({{ formatTime(lead.timeline[0]?.time) }})</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { store, LeadStatus, ROLE_NAMES, STATUS_NAMES, REWARDS } from '../../store/mockData';

const roleNames: Record<string, string> = ROLE_NAMES;
const statusNames: Record<string, string> = STATUS_NAMES;

const currentUser = computed(() => store.currentUser);
const myLeads = computed(() => {
  if (!currentUser.value) return [];
  return store.leads.filter(l => l.referrerId === currentUser.value.id);
});
const teamStats = computed(() => {
  if (!currentUser.value) return { teamSize: 0, teamLeadsCount: 0, teamMgmtTotal: 0 };
  return store.getTeamStats(currentUser.value.id);
});

// 成长进度（注册推荐官 / 经纪人）
const showGrowth = computed(() => ['V1', 'V2'].includes(currentUser.value?.role));
const isReferrer = computed(() => currentUser.value?.role === 'V1');
const promoTarget = 3;
const promoLabel = computed(() => (isReferrer.value ? '上传有效客户 · 晋升经纪人' : '开发经纪人 · 晋升高级经纪人'));
const promoCur = computed(() => {
  if (!currentUser.value) return 0;
  return isReferrer.value ? store.validCustomerCount(currentUser.value.id) : store.developedAgentsCount(currentUser.value.id);
});
const promoPct = computed(() => Math.min(100, Math.round(promoCur.value / promoTarget * 100)));
const measureCount = computed(() => currentUser.value?.monthlyMeasureCount || 0);
const measurePct = computed(() => Math.min(100, Math.round(measureCount.value / REWARDS.PERF_MEASURE_THRESHOLD * 100)));

// 晋升/里程碑提示
onShow(() => {
  const n = store.takeNotice();
  if (n) uni.showToast({ title: n, icon: 'none', duration: 2800 });
});

const getStepLevel = (status: LeadStatus) => {
  const map: Record<LeadStatus, number> = { PENDING: 1, MEASURED: 2, SIGNED: 3, WATER_ELEC: 4, FURNITURE: 4, COMPLETED: 5, INVALID: 0 };
  return map[status];
};

const formatTime = (timeStr: string) => {
  if(!timeStr) return '';
  const match = timeStr.match(/\d{1,2}\/\d{1,2}\s\d{1,2}:\d{2}/);
  if (match) return match[0];
  return timeStr.slice(5, 16);
};

const goAdd = () => { uni.navigateTo({ url: '/pages/lead/add' }); };
const goDetail = (id: string) => { uni.navigateTo({ url: `/pages/lead/detail?id=${id}` }); };
</script>

<style scoped>
.container { min-height: 100vh; background: #f4f6f9; padding-bottom: 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

/* Premium Header */
.premium-header { position: relative; background: linear-gradient(135deg, #4a148c 0%, #7e57c2 100%); padding: 50px 24px 70px; overflow: hidden; border-radius: 0 0 32px 32px; box-shadow: 0 10px 30px rgba(126, 87, 194, 0.2); }
.header-content { position: relative; z-index: 2; }
.user-profile { display: flex; align-items: center; }
.avatar-ring { width: 64px; height: 64px; border-radius: 32px; background: rgba(255,255,255,0.15); display: flex; justify-content: center; align-items: center; margin-right: 16px; border: 2px solid rgba(255,255,255,0.4); backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.avatar-emoji { font-size: 32px; }
.user-info { display: flex; flex-direction: column; }
.greeting { font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 4px; letter-spacing: 1px;}
.name-row { display: flex; align-items: center; }
.user-name { font-size: 24px; font-weight: 800; color: #ffffff; margin-right: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.role-badge { display: flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
.role-badge.V1 { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
.role-badge.V2 { background: linear-gradient(90deg, #fdfbfb 0%, #ebedee 100%); color: #4a148c; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.role-badge.V3 { background: linear-gradient(135deg, #d4af37 0%, #ffdf00 100%); color: #4a148c; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.rb-icon { margin-right: 4px; font-size: 12px; }

.dec-circle { position: absolute; border-radius: 50%; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0)); }
.c1 { width: 200px; height: 200px; top: -50px; right: -50px; }
.c2 { width: 120px; height: 120px; bottom: -20px; left: 40px; }

/* Main Content Area */
.main-content { padding: 0 20px; margin-top: -40px; position: relative; z-index: 3; }

/* Dashboard Card */
.data-board { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 20px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); border: 1px solid rgba(255,255,255,0.8); }
.board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.bh-title { font-size: 15px; font-weight: 800; color: #1f2937; }
.bh-more { font-size: 12px; color: #9ca3af; }
.board-stats { display: flex; align-items: center; justify-content: space-around; }
.stat-box { display: flex; flex-direction: column; align-items: center; flex: 1; }
.s-val { font-size: 28px; font-weight: 900; color: #4a148c; margin-bottom: 4px; font-family: 'DIN Alternate', sans-serif;}
.s-lbl { font-size: 12px; color: #6b7280; }
.stat-divider { width: 1px; height: 30px; background: #e5e7eb; }

/* 成长进度卡 */
.growth-card { background: #ffffff; border-radius: 20px; padding: 20px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); }
.g-block { margin-bottom: 16px; }
.g-block:last-child { margin-bottom: 0; }
.g-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.g-title { font-size: 13px; font-weight: 600; color: #374151; }
.g-count { font-size: 13px; font-weight: 800; color: #4a148c; font-family: 'DIN Alternate', sans-serif; }
.g-bar { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.g-bar-fill { height: 100%; background: linear-gradient(90deg, #7e57c2, #4a148c); border-radius: 4px; transition: width 0.4s; }
.g-bar-fill.gold { background: linear-gradient(90deg, #f59e0b, #d4af37); }

/* Section Header */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 4px; }
.sh-left { display: flex; align-items: center; }
.sh-indicator { width: 4px; height: 16px; background: #7e57c2; border-radius: 2px; margin-right: 8px; }
.sh-title { font-size: 18px; font-weight: 800; color: #1f2937; }
.sh-right { display: flex; align-items: center; }
.sh-count { font-size: 12px; color: #6b7280; font-weight: 500; background: #e5e7eb; padding: 2px 8px; border-radius: 10px; }

/* Lead Cards */
.lead-card { background: #ffffff; border-radius: 20px; padding: 20px; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); transition: all 0.3s ease; }
.lead-card:active { transform: translateY(2px) scale(0.99); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.lc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.lc-client { display: flex; align-items: baseline; }
.client-name { font-size: 18px; font-weight: 800; color: #111827; }
.client-tag { font-size: 12px; color: #6b7280; margin-left: 8px; background: #f3f4f6; padding: 2px 8px; border-radius: 6px; }

.lc-status-pill { display: flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
.status-dot { width: 6px; height: 6px; border-radius: 3px; margin-right: 6px; }
.lc-status-pill.PENDING { background: #eef2ff; color: #4f46e5; }
.lc-status-pill.PENDING .status-dot { background: #4f46e5; }
.lc-status-pill.MEASURED { background: #fffbeb; color: #d97706; }
.lc-status-pill.MEASURED .status-dot { background: #d97706; }
.lc-status-pill.SIGNED { background: #ecfdf5; color: #059669; }
.lc-status-pill.SIGNED .status-dot { background: #059669; }
.lc-status-pill.WATER_ELEC, .lc-status-pill.FURNITURE { background: #f0fdfa; color: #0d9488; }
.lc-status-pill.WATER_ELEC .status-dot, .lc-status-pill.FURNITURE .status-dot { background: #0d9488; }
.lc-status-pill.COMPLETED { background: #faf5ff; color: #9333ea; }
.lc-status-pill.COMPLETED .status-dot { background: #9333ea; }

.intention-tag { margin-left: 8px; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid transparent;}
.intention-tag.A { color: #dc2626; background: #fef2f2; border-color: #fca5a5; }
.intention-tag.B { color: #d97706; background: #fffbeb; border-color: #fcd34d; }
.intention-tag.C { color: #4b5563; background: #f3f4f6; border-color: #d1d5db; }

.lc-body { margin-bottom: 20px; }
.info-row { display: flex; align-items: center; margin-bottom: 16px; }
.info-row .icon { font-size: 14px; margin-right: 6px; }
.info-row .text { font-size: 13px; color: #4b5563; }

/* Advanced Stepper */
.stepper-wrap { display: flex; align-items: center; justify-content: space-between; padding: 0 10px; }
.step { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; }
.s-node { width: 12px; height: 12px; border-radius: 6px; background: #e5e7eb; border: 3px solid #fff; box-shadow: 0 0 0 1px #e5e7eb; margin-bottom: 6px; transition: all 0.3s; }
.s-lbl { font-size: 11px; color: #9ca3af; font-weight: 500; transition: color 0.3s; }
.step.active .s-node { background: #7e57c2; border-color: #fff; box-shadow: 0 0 0 1.5px #7e57c2; }
.step.active .s-lbl { color: #4a148c; font-weight: bold; }
.step-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 -10px 18px -10px; position: relative; z-index: 1; transition: background 0.3s; }
.step-line.active { background: #7e57c2; }

/* Timeline Footer */
.lc-footer { background: #f8f9fa; border-radius: 12px; padding: 12px; display: flex; align-items: center; }
.lf-icon { font-size: 14px; margin-right: 8px; }
.lf-text { font-size: 12px; color: #4b5563; font-weight: 500; }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; }
.empty-img-box { font-size: 64px; margin-bottom: 16px; animation: float 3s ease-in-out infinite; }
.empty-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
.empty-desc { font-size: 13px; color: #6b7280; margin-bottom: 24px; text-align: center; width: 80%; line-height: 1.5;}
.btn-action { background: linear-gradient(135deg, #7e57c2 0%, #4a148c 100%); color: white; border-radius: 24px; padding: 0 32px; height: 44px; line-height: 44px; font-size: 15px; font-weight: bold; box-shadow: 0 8px 20px rgba(126,87,194,0.3); }

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
</style>
