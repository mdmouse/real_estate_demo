<template>
  <view class="container">
    <view class="m-header">
      <view class="mh-left">
        <text class="title">营销拓客库</text>
        <text class="subtitle">精选家装案例，一键转发锁粉</text>
      </view>
      <view class="mh-right" @click="showRadar = true">
        <view class="radar-btn">
          <text class="radar-icon">📡</text>
          <text class="radar-txt">访客雷达</text>
          <view class="radar-badge" v-if="radarLogs.length">{{ radarLogs.length }}</view>
        </view>
      </view>
    </view>

    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 0 }" @click="activeTab = 0">最新活动</view>
      <view class="tab" :class="{ active: activeTab === 1 }" @click="activeTab = 1">实景案例</view>
      <view class="tab" :class="{ active: activeTab === 2 }" @click="activeTab = 2">知识干货</view>
    </view>

    <view class="content">
      <!-- 选项卡 1：最新活动 -->
      <view v-show="activeTab === 0">
        <view class="poster-card card">
          <view class="poster-img bg1"></view>
          <view class="poster-info">
            <text class="p-title">【紫钰整装】秋季感恩回馈，899元/㎡起</text>
            <text class="p-desc">推荐客户即享千元津贴，上不封顶。</text>
            <view class="p-action">
              <text class="reads">👀 2,341 人看过</text>
              <button class="btn-primary share-btn" @click="openPoster('bg1')">发给客户自动锁粉</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 选项卡 2：实景案例 -->
      <view v-show="activeTab === 1">
        <view class="poster-card card">
          <view class="poster-img bg2"></view>
          <view class="poster-info">
            <text class="p-title">星河丹堤 120㎡ 极简法式完工实景</text>
            <text class="p-desc">客户转发此案例，新客留电自动绑定在您名下。</text>
            <view class="p-action">
              <text class="reads">👀 892 人看过</text>
              <button class="btn-primary share-btn" @click="openPoster('bg2')">发给客户自动锁粉</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 选项卡 3：知识干货 -->
      <view v-show="activeTab === 2">
        <view class="article-card card" v-for="n in 3" :key="n">
          <view class="a-info">
            <text class="a-title">{{ n===1 ? '推客新手必读：如何发朋友圈更能吸引客户留资？' : n===2 ? '避坑指南：家装客户最关心的10个增项陷阱' : '销冠话术库：当客户说“我再看看”时该怎么接？' }}</text>
            <text class="a-desc">带有您专属参数的干货文章，好友阅读自动追踪时长并静默绑定上下级...</text>
            <view class="a-meta">
              <text class="reads">👀 5,421 阅读</text>
              <text class="share-btn-small" @click="simulateShare">一键转发并追踪</text>
            </view>
          </view>
          <view class="a-img" :class="'bg-art'+n"></view>
        </view>
      </view>

      <!-- 访客雷达弹窗 -->
      <view class="modal-mask" v-if="showRadar" @click.self="showRadar = false">
        <view class="radar-modal">
          <view class="rm-header">
            <text class="rm-title">📡 智能访客雷达</text>
            <view class="rm-close" @click="showRadar = false">×</view>
          </view>
          <view class="rm-desc">实时监控您的专属物料分享效果，精准识别高意向潜在客户。</view>
          
          <view class="radar-list">
            <view class="radar-item" v-for="log in radarLogs" :key="log.id">
              <view class="ri-avatar">{{ log.avatar }}</view>
              <view class="ri-content">
                <view class="ri-top">
                  <text class="ri-name">{{ log.visitorName }}</text>
                  <text class="ri-time">{{ log.viewTime }}</text>
                </view>
                <text class="ri-action">浏览了您的分享: <text class="ri-highlight">《{{ log.articleTitle }}》</text></text>
                <view class="ri-bot">
                  <text class="ri-duration">停留时长: {{ log.duration }}秒</text>
                  <button class="ri-btn">提醒跟进</button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 海报弹窗 -->
      <view class="poster-modal" v-if="showPoster" @click.self="closePoster">
        <view class="poster-content" :class="currentPosterUrl">
          <view class="poster-close" @click="closePoster">×</view>
          
          <view class="poster-overlay">
             <view class="po-text">系统已自动嵌入您的推广参数</view>
          </view>
          
          <!-- 底部专属人信息 -->
          <view class="poster-footer">
            <view class="pf-user">
              <text class="pf-avatar">{{ currentUser?.avatar }}</text>
              <view class="pf-info">
                <text class="pf-name">{{ currentUser?.name }}</text>
                <text class="pf-role">紫钰家装专属顾问</text>
              </view>
            </view>
            <view class="pf-qr">
              <image class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://ziyu.demo/referral" mode="aspectFit"></image>
              <text class="qr-tip">扫码自动绑定</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { store } from '../../store/mockData';

const activeTab = ref(0);
const showPoster = ref(false);
const showRadar = ref(false);
const currentPosterUrl = ref('');
const currentUser = computed(() => store.currentUser);
const radarLogs = computed(() => store.radarLogs);

const openPoster = (bg: string) => {
  currentPosterUrl.value = bg;
  showPoster.value = true;
};
const closePoster = () => {
  showPoster.value = false;
};
const simulateShare = () => {
  uni.showToast({ title: '分享链接已复制！客户点击后将在雷达中提醒您。', icon: 'none', duration: 3000 });
};
</script>

<style>
.container { padding-bottom: 20px; background: #f8f9fc; min-height: 100vh;}
.m-header { padding: 20px 24px 10px; display: flex; justify-content: space-between; align-items: center;}
.mh-left { display: flex; flex-direction: column; }
.title { font-size: 24px; font-weight: 800; color: #1f2937; display: block; margin-bottom: 4px; }
.subtitle { font-size: 13px; color: #6b7280; }

.radar-btn { display: flex; align-items: center; background: white; padding: 6px 12px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: relative;}
.radar-icon { margin-right: 4px; }
.radar-txt { font-size: 13px; font-weight: bold; color: #4a148c; }
.radar-badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 10px; width: 16px; height: 16px; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-weight: bold;}

.tabs { display: flex; padding: 10px 24px; gap: 20px; margin-bottom: 10px; }
.tab { font-size: 15px; color: #6b7280; padding-bottom: 4px; transition: all 0.3s; }
.tab.active { color: #4a148c; font-weight: bold; border-bottom: 3px solid #7e57c2; }

.content { padding: 0 20px; }
.card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.poster-card { margin-bottom: 20px; overflow: hidden; animation: fadeIn 0.3s ease-in-out;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.poster-img { height: 160px; background-size: cover; background-position: center; }
.bg1 { background-image: linear-gradient(135deg, rgba(126,87,194,0.5), rgba(74,20,140,0.8)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'); }
.bg2 { background-image: linear-gradient(135deg, rgba(212,175,55,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80'); }

.poster-info { padding: 16px; }
.p-title { font-size: 16px; font-weight: bold; color: #1f2937; display: block; margin-bottom: 6px; }
.p-desc { font-size: 12px; color: #6b7280; display: block; margin-bottom: 16px; line-height: 1.5; }
.p-action { display: flex; justify-content: space-between; align-items: center; }
.reads { font-size: 12px; color: #9ca3af; }
.share-btn { margin: 0; font-size: 13px; padding: 6px 16px; border-radius: 20px; background: linear-gradient(135deg, #7e57c2 0%, #4a148c 100%); color: white;}

/* 访客雷达模态框 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 999; display: flex; justify-content: center; align-items: flex-end; animation: fadeIn 0.3s; }
.radar-modal { width: 100%; background: #f8f9fc; border-radius: 24px 24px 0 0; padding: 24px; animation: slideUp 0.3s; max-height: 80vh; overflow-y: auto;}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.rm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.rm-title { font-size: 18px; font-weight: bold; color: #1f2937; }
.rm-close { font-size: 24px; color: #9ca3af; padding: 0 8px; }
.rm-desc { font-size: 12px; color: #6b7280; margin-bottom: 20px; line-height: 1.5;}

.radar-list { display: flex; flex-direction: column; }
.radar-item { background: white; border-radius: 12px; padding: 16px; display: flex; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);}
.ri-avatar { font-size: 32px; margin-right: 12px; }
.ri-content { flex: 1; display: flex; flex-direction: column; }
.ri-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
.ri-name { font-size: 15px; font-weight: bold; color: #1f2937; }
.ri-time { font-size: 11px; color: #9ca3af; }
.ri-action { font-size: 13px; color: #4b5563; margin-bottom: 8px; }
.ri-highlight { color: #4a148c; font-weight: bold; }
.ri-bot { display: flex; justify-content: space-between; align-items: center; }
.ri-duration { font-size: 11px; color: #ef4444; background: #fef2f2; padding: 2px 6px; border-radius: 4px;}
.ri-btn { margin: 0; font-size: 12px; padding: 4px 12px; border-radius: 12px; background: #4a148c; color: white; line-height: normal;}

/* 海报弹窗样式 */
.poster-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 20px; animation: fadeIn 0.3s; }
.poster-content { position: relative; width: 100%; max-width: 340px; height: 560px; border-radius: 20px; background-size: cover; background-position: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; }
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

.article-card { display: flex; padding: 16px; margin-bottom: 16px; align-items: center; justify-content: space-between; animation: fadeIn 0.3s ease-in-out;}
.a-info { flex: 1; padding-right: 16px; display: flex; flex-direction: column; }
.a-title { font-size: 15px; font-weight: bold; color: #1f2937; margin-bottom: 6px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; line-height: 1.4;}
.a-desc { font-size: 12px; color: #6b7280; margin-bottom: 12px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; line-height: 1.4; }
.a-meta { display: flex; justify-content: space-between; align-items: center; }
.share-btn-small { font-size: 11px; color: white; background: #4a148c; padding: 4px 10px; border-radius: 12px;}
.a-img { width: 80px; height: 80px; border-radius: 8px; background-size: cover; background-position: center; flex-shrink: 0; }
.bg-art1 { background-image: url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=200&q=80'); }
.bg-art2 { background-image: url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80'); }
.bg-art3 { background-image: url('https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=200&q=80'); }
</style>
