<template>
  <view class="container">
    <view class="m-header">
      <text class="title">推荐新客户</text>
      <text class="subtitle">线索一经核实，立刻锁定关系，佣金有保障</text>
    </view>

    <view class="form-card card">
      <view class="form-item">
        <text class="label">客户姓名 <text class="required">*</text></text>
        <input class="input" v-model="form.clientName" placeholder="如：张先生 / 李女士" placeholder-class="ph" />
      </view>

      <view class="form-item">
        <text class="label">联系电话 <text class="required">*</text></text>
        <input class="input" type="number" v-model="form.clientPhone" placeholder="请输入11位手机号码" placeholder-class="ph" />
      </view>

      <view class="form-item">
        <text class="label">意向小区 <text class="required">*</text></text>
        <input class="input" v-model="form.community" placeholder="请输入准备装修的小区名称" placeholder-class="ph" />
      </view>

      <view class="form-item">
        <text class="label">房屋面积 (㎡) <text class="required">*</text></text>
        <input class="input" type="number" v-model="form.area" placeholder="如：120" placeholder-class="ph" />
      </view>
    </view>

    <view class="submit-wrap">
      <button class="btn-primary submit-btn" @click="submit">一键报备，绑定客户</button>
      <text class="tips">⚠️ 报备后2小时内会有专属设计师联系客户</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { store } from '../../store/mockData';

const form = reactive({
  clientName: '', clientPhone: '', community: '', area: ''
});

const submit = () => {
  if (!form.clientName || !form.clientPhone || !form.community || !form.area) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '系统报备中...' });
  setTimeout(() => {
    store.addLead({
      referrerId: store.currentUser.id,
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      community: form.community,
      area: Number(form.area)
    });
    uni.hideLoading();
    uni.showToast({ title: '线索报备成功', icon: 'success' });
    setTimeout(() => { uni.navigateBack(); }, 1500);
  }, 800);
};
</script>

<style>
.container { padding-bottom: 30px; }
.m-header { padding: 30px 24px 20px; }
.title { font-size: 26px; font-weight: 800; color: #1f2937; display: block; margin-bottom: 6px; }
.subtitle { font-size: 13px; color: #6b7280; }

.form-card { margin: 0 20px; padding: 10px 20px; }
.form-item { padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
.form-item:last-child { border-bottom: none; }

.label { font-size: 15px; font-weight: 600; color: #374151; display: block; margin-bottom: 12px; }
.required { color: #ef4444; margin-left: 4px; }
.input { font-size: 16px; color: #1f2937; height: 36px; line-height: 36px; }
.ph { color: #9ca3af; font-size: 15px; }

.submit-wrap { padding: 40px 20px; text-align: center; }
.submit-btn { height: 50px; line-height: 50px; font-size: 17px; border-radius: 25px; margin-bottom: 16px; }
.tips { font-size: 12px; color: #9ca3af; }
</style>
