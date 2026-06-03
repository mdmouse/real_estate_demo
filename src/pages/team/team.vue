<template>
  <view class="container">
    <view class="m-header">
      <text class="title">{{ pageTitle }}</text>
      <text class="subtitle">洞察团队生态，赋能级差分销</text>
    </view>

    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 0 }" @click="activeTab = 0">拓扑网络</view>
      <view class="tab" :class="{ active: activeTab === 1 }" @click="activeTab = 1">团队英雄榜</view>
    </view>

    <view class="tree-container" v-show="activeTab === 0">
      <view class="empty-state" v-if="downlines.length === 0">
        <text class="empty-emoji">🌱</text>
        <text class="empty-text">您的团队正在萌芽中...</text>
        <button class="btn-primary invite-btn" @click="openPoster">邀请推客加入</button>
      </view>

      <view class="t-node card" v-for="(item, index) in downlines" :key="index">
        <!-- 连线装饰 -->
        <view class="t-line" v-if="item.distance > 1"></view>
        
        <view class="t-main" :class="'dist-' + item.distance">
          <view class="t-avatar">{{ item.user.avatar }}</view>
          <view class="t-info">
            <text class="t-name">{{ item.user.name }}</text>
            <view class="t-tags">
              <text class="t-role" :class="item.user.role">{{ roleNames[item.user.role] }}</text>
              <text class="t-dist">L{{ item.distance }} 级下线</text>
            </view>
          </view>
          <view class="t-perf">
            <text class="p-lbl">贡献佣金</text>
            <text class="p-val">¥{{ item.contributedComm.toLocaleString() }}</text>
          </view>
        </view>

        <!-- 🚨 流失预警横幅 -->
        <view class="churn-warning" v-if="item.daysSinceLastLead >= 30">
          <view class="cw-left">
            <text class="cw-icon">⚠️</text>
            <text class="cw-txt">已 {{ item.daysSinceLastLead }} 天未出单，存在流失风险</text>
          </view>
          <button class="cw-btn" @click="simulateCare">一键关怀</button>
        </view>
      </view>
      
      <!-- 邀请按钮 (仅对有下线但还需要邀请的人显示，为了演示我们放在底部) -->
      <view class="add-more-box" v-if="downlines.length > 0">
        <button class="btn-primary invite-btn-outline" @click="openPoster">继续招募裂变</button>
      </view>
    </view>

    <view class="leaderboard-container" v-show="activeTab === 1">
      <view class="lb-header">
        <text class="lb-title">🔥 本月拓客排行榜</text>
        <text class="lb-subtitle">团队内部比拼，激发拓客潜力</text>
      </view>
      
      <view class="lb-list">
        <view class="lb-item card" v-for="(u, idx) in leaderboards" :key="idx">
          <view class="lb-rank">
            <text class="rank-icon" v-if="idx === 0">🥇</text>
            <text class="rank-icon" v-else-if="idx === 1">🥈</text>
            <text class="rank-icon" v-else-if="idx === 2">🥉</text>
            <text class="rank-num" v-else>{{ idx + 1 }}</text>
          </view>
          <view class="lb-avatar">{{ u.avatar }}</view>
          <text class="lb-name">{{ u.name }}</text>
          <view class="lb-score">
            <text class="s-val">{{ u.value }}</text>
            <text class="s-lbl">{{ u.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 招募海报弹窗 -->
    <view class="poster-modal" v-if="showPoster" @click.self="closePoster">
      <view class="poster-content bg-recruit">
        <view class="poster-close" @click="closePoster">×</view>
        <view class="poster-overlay">
            <view class="po-text">长按保存专属招募海报</view>
        </view>
        
        <view class="poster-footer">
          <view class="pf-user">
            <text class="pf-avatar">{{ currentUser?.avatar }}</text>
            <view class="pf-info">
              <text class="pf-name">{{ currentUser?.name }}</text>
              <text class="pf-role">邀请您加入紫钰团队</text>
            </view>
          </view>
          <view class="pf-qr">
            <image class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://ziyu.demo/recruit" mode="aspectFit"></image>
            <text class="qr-tip">扫码自动锁粉</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { store, ROLE_NAMES } from '../../store/mockData';

const activeTab = ref(0);
const currentUser = computed(() => store.currentUser);
const roleNames: Record<string,string> = ROLE_NAMES;
const pageTitle = computed(() => (currentUser.value?.role === 'V3' ? '大队长数据雷达' : '我的团队'));

const downlines = computed(() => {
  if (!currentUser.value) return [];
  return store.getDownlines(currentUser.value.id);
});

const leaderboards = computed(() => {
  if (!currentUser.value) return [];
  return store.getLeaderboard(currentUser.value.id);
});

const showPoster = ref(false);
const openPoster = () => { showPoster.value = true; };
const closePoster = () => { showPoster.value = false; };
const simulateCare = () => {
  uni.showToast({ title: '已通过微信模板消息向该推客发送专属关怀问候及拓客秘籍', icon: 'none', duration: 3000 });
}
</script>

<style>
.container { padding-bottom: 20px; background: #f8f9fc; min-height: 100vh;}
.m-header { padding: 30px 24px 10px; }
.title { font-size: 24px; font-weight: 800; color: #1f2937; display: block; margin-bottom: 4px; }
.subtitle { font-size: 13px; color: #6b7280; }

.tabs { display: flex; padding: 10px 24px; gap: 20px; margin-bottom: 10px; }
.tab { font-size: 15px; color: #6b7280; padding-bottom: 4px; transition: all 0.3s; }
.tab.active { color: #4a148c; font-weight: bold; border-bottom: 3px solid #7e57c2; }

.tree-container, .leaderboard-container { padding: 0 20px; }
.card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

/* 网络拓扑 */
.t-node { position: relative; padding: 16px; margin-bottom: 16px; animation: fadeIn 0.3s ease-in-out;}
.t-main { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 2;}
.t-main.dist-2 { margin-left: 16px; }
.t-main.dist-3 { margin-left: 32px; }
.t-line { position: absolute; left: 38px; top: -16px; bottom: 50%; width: 2px; background: #e5e7eb; z-index: 1;}

.t-avatar { width: 44px; height: 44px; border-radius: 22px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; font-size: 20px; margin-right: 12px; border: 1px solid #e5e7eb;}
.t-info { flex: 1; display: flex; flex-direction: column; }
.t-name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 6px; }

.t-tags { display: flex; gap: 8px; }
.t-role { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.t-role.V1 { background: #f3f4f6; color: #4b5563; }
.t-role.V2 { background: #fef3c7; color: #d97706; }
.t-role.V3 { background: #ffe4e6; color: #e11d48; }
.t-dist { font-size: 10px; background: #e0e7ff; color: #4f46e5; padding: 2px 8px; border-radius: 4px; }

.t-perf { display: flex; flex-direction: column; align-items: flex-end; }
.p-lbl { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
.p-val { font-size: 15px; font-weight: 900; color: #4a148c; font-family: 'DIN Alternate', sans-serif;}

/* 流失预警横幅 */
.churn-warning { margin-top: 16px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;}
.cw-left { display: flex; align-items: center; }
.cw-icon { font-size: 14px; margin-right: 6px; }
.cw-txt { font-size: 12px; color: #be123c; font-weight: bold;}
.cw-btn { margin: 0; padding: 4px 10px; font-size: 11px; background: #e11d48; color: white; border-radius: 12px; line-height: normal;}

.add-more-box { display: flex; justify-content: center; margin-top: 24px; margin-bottom: 40px;}
.invite-btn-outline { background: white; color: #4a148c; border: 1px solid #4a148c; border-radius: 20px; font-size: 14px; padding: 0 24px; height: 40px; line-height: 40px;}

.empty-state { text-align: center; padding: 60px 0; display: flex; flex-direction: column; align-items: center; }
.empty-emoji { font-size: 48px; margin-bottom: 16px; }
.empty-text { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }
.invite-btn { padding: 0 30px; height: 40px; line-height: 40px; font-size: 15px; border-radius: 20px; background: linear-gradient(135deg, #7e57c2 0%, #4a148c 100%); color: white;}

/* 排行榜 */
.lb-header { padding: 10px 0 20px; text-align: center; }
.lb-title { font-size: 20px; font-weight: 900; color: #b45309; display: block; margin-bottom: 6px;}
.lb-subtitle { font-size: 12px; color: #d97706; }

.lb-list { display: flex; flex-direction: column; }
.lb-item { display: flex; align-items: center; padding: 16px; margin-bottom: 12px; animation: fadeIn 0.3s ease-in-out;}
.lb-rank { width: 40px; text-align: center; font-size: 24px; }
.rank-num { font-size: 18px; font-weight: 900; color: #9ca3af; font-family: 'DIN Alternate', sans-serif;}
.lb-avatar { font-size: 32px; margin: 0 12px; }
.lb-name { flex: 1; font-size: 16px; font-weight: bold; color: #1f2937; }
.lb-score { display: flex; align-items: baseline; }
.s-val { font-size: 24px; font-weight: 900; color: #4a148c; font-family: 'DIN Alternate', sans-serif; margin-right: 4px;}
.s-lbl { font-size: 12px; color: #6b7280; }

/* 招募海报弹窗样式 */
.poster-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 20px; animation: fadeIn 0.3s; }
.poster-content { position: relative; width: 100%; max-width: 340px; height: 560px; border-radius: 20px; background-size: cover; background-position: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; }
.bg-recruit { background-image: linear-gradient(135deg, rgba(74,20,140,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'); }
.poster-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: rgba(0,0,0,0.4); color: white; border-radius: 16px; font-size: 24px; display: flex; justify-content: center; align-items: center; z-index: 10; line-height: 1; }
.poster-overlay { position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.4); }
.po-text { color: white; font-size: 12px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.poster-footer { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.pf-user { display: flex; align-items: center; flex: 1; }
.pf-avatar { font-size: 36px; margin-right: 12px; }
.pf-info { display: flex; flex-direction: column; }
.pf-name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 4px; }
.pf-role { font-size: 11px; color: #7e57c2; background: rgba(126, 87, 194, 0.1); padding: 2px 6px; border-radius: 4px; display: inline-block; align-self: flex-start; }
.pf-qr { display: flex; flex-direction: column; align-items: center; margin-left: 16px; }
.qr-img { width: 56px; height: 56px; margin-bottom: 4px; border-radius: 4px; }
.qr-tip { font-size: 9px; color: #6b7280; font-weight: bold;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
