import { reactive } from 'vue';

export type UserRole = 'V1' | 'V2' | 'V3';
export type LeadStatus = 'PENDING' | 'MEASURED' | 'SIGNED' | 'WATER_ELEC' | 'FURNITURE' | 'COMPLETED' | 'INVALID';
export type IntentionLevel = 'A' | 'B' | 'C';

export interface TimelineEvent {
  time: string;
  title: string;
  desc: string;
  icon: string;
}

export interface UpsellItem {
  name: string;
  amount: number;
  comm: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  parentId: string | null;
  balance: number;       
  pendingBalance: number;
  avatar: string;
}

export interface Lead {
  id: string;
  referrerId: string;
  clientName: string;
  clientPhone: string;
  community: string;
  area: number;
  status: LeadStatus;
  createDate: string;
  updateDate: string;
  totalAmount?: number;
  intentionLevel: IntentionLevel;
  protectionExpireDate: string; 
  upsellItems: UpsellItem[];
  timeline: TimelineEvent[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'MEASURE_BONUS' | 'SIGN_COMM' | 'STAGE_COMM' | 'COMPLETE_COMM' | 'DIFF_COMM' | 'TAX_DEDUCTION' | 'UPSELL_COMM' | 'BONUS_POOL' | 'WITHDRAW';
  sourceLeadId?: string;
  desc: string;
  date: string;
  status: 'SETTLED' | 'PENDING';
}

export interface RadarLog {
  id: string;
  visitorName: string;
  avatar: string;
  viewTime: string;
  articleTitle: string;
  duration: number; // seconds
}

export const ROLE_RATES = { 'V1': 0.03, 'V2': 0.04, 'V3': 0.05 };
export const STAGE_PAYOUT_RATES = { 'SIGNED': 0.3, 'WATER_ELEC': 0.2, 'FURNITURE': 0.2, 'COMPLETED': 0.3 };

// 公共展示名称（各页面共用，避免重复定义）
export const ROLE_NAMES: Record<UserRole, string> = { 'V1': '普通推客', 'V2': '高级合伙人', 'V3': '城市大队长' };
export const STATUS_NAMES: Record<LeadStatus, string> = {
  'PENDING': '待跟进', 'MEASURED': '已量房', 'SIGNED': '已签约',
  'WATER_ELEC': '水电进场', 'FURNITURE': '软装进场', 'COMPLETED': '已竣工', 'INVALID': '已失效'
};

export const store = reactive({
  currentUser: null as unknown as User,

  users: [
    { id: 'u1', name: '李大队', role: 'V3', parentId: null, balance: 4500, pendingBalance: 12000, avatar: '👨🏻‍💼' },
    { id: 'u2', name: '张主管', role: 'V2', parentId: 'u1', balance: 1500, pendingBalance: 3200, avatar: '👩🏻‍💼' },
    { id: 'u3', name: '赵合伙', role: 'V2', parentId: 'u1', balance: 0, pendingBalance: 0, avatar: '🧔🏻‍♂️' },
    { id: 'u4', name: '推客小王', role: 'V1', parentId: 'u2', balance: 200, pendingBalance: 0, avatar: '👱🏻‍♀️' },
    { id: 'u5', name: '推客小李', role: 'V1', parentId: 'u3', balance: 0, pendingBalance: 0, avatar: '👨🏽‍🔧' },
  ] as User[],

  leads: [] as Lead[],
  transactions: [] as Transaction[],
  radarLogs: [] as RadarLog[],

  loginAs(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) this.currentUser = user;
  },

  getUser(id: string) { return this.users.find(u => u.id === id); },

  getDownlines(userId: string) {
    const fakeComms: Record<string, number> = { u2: 15600, u3: 4200, u4: 5800, u5: 1200 };
    const downlines: Array<{ user: User, distance: number, contributedComm: number, daysSinceLastLead: number }> = [];
    const findChildren = (pid: string, dist: number) => {
      const children = this.users.filter(u => u.parentId === pid);
      for (const child of children) {
        downlines.push({ 
          user: child, distance: dist, contributedComm: fakeComms[child.id] || 0,
          daysSinceLastLead: child.id === 'u4' ? 32 : 5 // 模拟小王30天未开单预警
        });
        findChildren(child.id, dist + 1);
      }
    };
    findChildren(userId, 1);
    return downlines;
  },

  getTeamStats(userId: string) {
    const downlines = this.getDownlines(userId);
    const downlineIds = downlines.map(d => d.user.id);
    const teamLeadsCount = this.leads.filter(l => downlineIds.includes(l.referrerId)).length + 128; // 加点假数据基数
    const myDiffTransactions = this.transactions.filter(t => t.userId === userId && t.type === 'DIFF_COMM' && t.status === 'SETTLED');
    const teamDiffCommTotal = myDiffTransactions.reduce((sum, t) => sum + t.amount, 0) + 24500;

    return { teamSize: downlines.length + 12, teamLeadsCount, teamDiffCommTotal };
  },

  getLeaderboard(userId: string) {
    // 模拟排行榜数据
    return [
      { name: '推客小刘', avatar: '👨🏻‍💻', value: 15, label: '单' },
      { name: '推客老张', avatar: '🧔🏻‍♂️', value: 12, label: '单' },
      { name: this.getUser(userId)?.name || '我', avatar: this.getUser(userId)?.avatar || '👤', value: 5, label: '单' }
    ];
  },

  addLead(leadData: Omit<Lead, 'id' | 'status' | 'createDate' | 'updateDate' | 'timeline' | 'intentionLevel' | 'protectionExpireDate' | 'upsellItems'>) {
    const now = new Date();
    const dateStr = now.toLocaleString();
    const expire = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleString(); // 30天后

    const newLead: Lead = {
      ...leadData,
      id: 'L' + Date.now(),
      status: 'PENDING',
      createDate: dateStr,
      updateDate: dateStr,
      intentionLevel: 'B',
      protectionExpireDate: expire,
      upsellItems: [],
      totalAmount: 0,
      timeline: [{
        time: dateStr,
        title: '客户线索已入库',
        desc: `进入30天推客专属保护期，超时未转化将掉入公海。`,
        icon: '🛡'
      }]
    };
    this.leads.unshift(newLead);
    return newLead;
  },

  updateLeadStatus(leadId: string, newStatus: LeadStatus, amount?: number) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    lead.status = newStatus;
    const dateStr = new Date().toLocaleString();
    lead.updateDate = dateStr;
    if (amount) lead.totalAmount = amount;

    const referrer = this.getUser(lead.referrerId);
    if (!referrer) return;

    if (newStatus === 'MEASURED') {
      lead.timeline.unshift({ time: dateStr, title: '设计师已上门量房', desc: '初步勘测完毕，客户对方案很感兴趣，意向升级！', icon: '📏' });
      lead.intentionLevel = 'A'; // 升级意向
      const bonus = 50;
      referrer.balance += bonus;
      this.transactions.unshift({
        id: Date.now() + '_m', userId: referrer.id, amount: bonus, type: 'MEASURE_BONUS',
        sourceLeadId: lead.id, desc: `【${lead.clientName}】量房辛苦津贴`, date: dateStr, status: 'SETTLED'
      });
    } 
    else if (newStatus === 'SIGNED') {
      lead.timeline.unshift({ time: dateStr, title: '成功签约支付定金', desc: `合同金额 ${amount} 元，首期款已到账。触发首付分润！`, icon: '🤝' });
      this.distributeCommission(lead, dateStr, 'SIGNED');
    }
    else if (newStatus === 'WATER_ELEC') {
      lead.timeline.unshift({ time: dateStr, title: '水电进场验收', desc: `隐蔽工程验收通过，阶段款项支付，触发节点分润！`, icon: '⚡' });
      this.distributeCommission(lead, dateStr, 'WATER_ELEC');
    }
    else if (newStatus === 'FURNITURE') {
      lead.timeline.unshift({ time: dateStr, title: '软装/全屋定制进场', desc: `客户增购了全屋定制套餐，触发供应链节点分润！`, icon: '🛋' });
      this.distributeCommission(lead, dateStr, 'FURNITURE');
    }
    else if (newStatus === 'COMPLETED') {
      lead.timeline.unshift({ time: dateStr, title: '竣工验收及尾款结清', desc: '客户验收满意，尾款支付完毕。所有在途佣金已结清。', icon: '🎉' });
      this.distributeCommission(lead, dateStr, 'COMPLETED');
    }
  },

  addUpsell(leadId: string, itemName: string, amount: number, commRate: number) {
    const lead = this.leads.find(l => l.id === leadId);
    if(!lead) return;
    const comm = amount * commRate;
    lead.upsellItems.push({ name: itemName, amount, comm });
    
    lead.timeline.unshift({
      time: new Date().toLocaleString(),
      title: `客户增购：${itemName}`,
      desc: `购买金额 ¥${amount}，您获得专属供应链返佣 ¥${comm}。`,
      icon: '🛍'
    });

    const referrer = this.getUser(lead.referrerId);
    if(referrer) {
      referrer.balance += comm;
      this.transactions.unshift({
        id: Date.now() + '_upsell', userId: referrer.id, amount: comm, type: 'UPSELL_COMM',
        sourceLeadId: lead.id, desc: `【${lead.clientName}】${itemName}供应链返佣`, date: new Date().toLocaleString(), status: 'SETTLED'
      });
    }
  },

  distributeCommission(lead: Lead, dateStr: string, stage: 'SIGNED' | 'WATER_ELEC' | 'FURNITURE' | 'COMPLETED') {
    if (!lead.totalAmount) return;
    const payoutRatio = STAGE_PAYOUT_RATES[stage];
    const referrer = this.getUser(lead.referrerId);
    if(!referrer) return;

    const baseRate = ROLE_RATES[referrer.role];
    const selfComm = lead.totalAmount * baseRate * payoutRatio;
    
    if (stage === 'SIGNED') {
      referrer.pendingBalance += (lead.totalAmount * baseRate * (1 - STAGE_PAYOUT_RATES['SIGNED']));
    } else {
      referrer.pendingBalance -= selfComm;
      if(referrer.pendingBalance < 0) referrer.pendingBalance = 0;
    }

    referrer.balance += selfComm;
    this.transactions.unshift({
      id: Date.now() + '_s' + stage, userId: referrer.id, amount: selfComm,
      type: stage === 'SIGNED' ? 'SIGN_COMM' : (stage === 'COMPLETED' ? 'COMPLETE_COMM' : 'STAGE_COMM'),
      sourceLeadId: lead.id, desc: `【${lead.clientName}】${stage}节点直达佣金`, date: dateStr, status: 'SETTLED'
    });

    let currentParentId = referrer.parentId;
    let currentMaxRate = baseRate;

    while (currentParentId) {
      const parent = this.getUser(currentParentId);
      if (!parent) break;

      const parentRate = ROLE_RATES[parent.role];
      if (parentRate > currentMaxRate) {
        const diffRate = parentRate - currentMaxRate;
        const diffComm = lead.totalAmount * diffRate * payoutRatio;
        
        if (stage === 'SIGNED') {
          parent.pendingBalance += (lead.totalAmount * diffRate * (1 - STAGE_PAYOUT_RATES['SIGNED']));
        } else {
          parent.pendingBalance -= diffComm;
          if(parent.pendingBalance < 0) parent.pendingBalance = 0;
        }

        parent.balance += diffComm;
        this.transactions.unshift({
          id: Date.now() + '_diff_' + parent.id + stage, userId: parent.id, amount: diffComm,
          type: 'DIFF_COMM', sourceLeadId: lead.id, desc: `【${lead.clientName}】团队级差贡献`, date: dateStr, status: 'SETTLED'
        });
        currentMaxRate = parentRate;
      }
      currentParentId = parent.parentId;
    }
  },

  withdraw(amount: number) {
    if(this.currentUser.balance >= amount) {
      const tax = amount * 0.06; // 6% 灵活用工个税代扣
      const actual = amount - tax;
      this.currentUser.balance -= amount;

      const dateStr = new Date().toLocaleString();
      this.transactions.unshift({
        id: Date.now() + '_wd', userId: this.currentUser.id, amount: -amount, type: 'WITHDRAW',
        desc: `提现 ¥${amount.toLocaleString()}，实际到账 ¥${actual.toLocaleString()}（云账户已依法代扣个税 ¥${tax.toLocaleString()}）`,
        date: dateStr, status: 'SETTLED'
      });
    }
  }
});

// ---------------- 初始化假数据引擎 ---------------- //
store.loginAs('u4');

// 注入测试访客雷达记录
store.radarLogs = [
  { id: 'r1', visitorName: '李**', avatar: '👩🏻‍🦳', viewTime: '10分钟前', articleTitle: '避坑指南：家装客户最关心的10个增项陷阱', duration: 125 },
  { id: 'r2', visitorName: '王**', avatar: '👨🏼‍', viewTime: '1小时前', articleTitle: '专属招募海报 (扫码进入)', duration: 45 },
  { id: 'r3', visitorName: '未授权用户', avatar: '👤', viewTime: '昨天 15:30', articleTitle: '【紫钰整装】秋季感恩回馈', duration: 15 },
];

const lead1 = store.addLead({ referrerId: 'u4', clientName: '刘女士', clientPhone: '13800138000', community: '星河丹堤', area: 120 });
lead1.timeline.unshift({ time: new Date(Date.now() - 3600000).toLocaleString(), title: '电销团队跟进', desc: '拨打通电话，客户意向极高，A类客户，周末安排看样板间。', icon: '📞' });
lead1.intentionLevel = 'A';

const lead2 = store.addLead({ referrerId: 'u4', clientName: '王先生', clientPhone: '13900139000', community: '中海九号公馆', area: 90 });
lead2.intentionLevel = 'A';
store.updateLeadStatus(lead2.id, 'MEASURED');
store.updateLeadStatus(lead2.id, 'SIGNED', 150000);
store.updateLeadStatus(lead2.id, 'WATER_ELEC', 150000); // 走到了水电节点

// 给王先生增加一个后端供应链增项
store.addUpsell(lead2.id, '格力中央空调一拖五', 25000, 0.05);

const lead3 = store.addLead({ referrerId: 'u4', clientName: '赵大哥', clientPhone: '13700137000', community: '保利时代', area: 140 });
lead3.intentionLevel = 'C';
// 模拟快过期的客户
lead3.protectionExpireDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleString(); // 仅剩 2 天
lead3.timeline.unshift({ time: new Date(Date.now() - 86400000).toLocaleString(), title: '系统警告', desc: '客户跟进停滞，还有2天将掉入公海，请尽快联系促单！', icon: '⚠️' });
