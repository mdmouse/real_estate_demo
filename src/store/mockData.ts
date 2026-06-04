import { reactive } from 'vue';

// 角色：V1 注册推荐官 / V2 经纪人 / V3 高级经纪人
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
  pendingBalance: number;       // 保留字段（新模型签约即全额结算，通常为 0）
  avatar: string;
  monthlyMeasureCount: number;  // 本月量房次数（满 5 次发业绩奖）
  perfBonusGranted: boolean;    // 本月业绩奖是否已发（去重）
  channelOverrideMonth: number; // 本月已计提渠道返佣（用于 3 万封顶）
  withdrawCountToday: number;   // 当日已提现笔数（单日 ≤ 3 笔）
  withdrawAmountToday: number;  // 当日已提现金额（单日 ≤ 1 万）
  lastWithdrawDate: string;     // 上次提现日期 YYYY-MM-DD（跨日重置计数）
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

export type TxType =
  | 'LEAD_BONUS'          // 带单奖励（量房完成）
  | 'SIGN_BONUS'          // 签单奖励（签约完成）
  | 'NODE_COMM'           // 节点返佣（合同 3%）
  | 'PERF_BONUS'          // 业绩奖金（5 次量房/月）
  | 'MGMT_SHARE'          // 管理分润（下属节点佣金 30%/20%）
  | 'CHANNEL_OVERRIDE'    // 渠道返佣（直属签约额 3‰，封顶 3 万/月）
  | 'CHANNEL_MGMT_AWARD'  // 渠道管理奖（开发 3 个经纪人）
  | 'ASSIST_AWARD'        // 助力奖（帮扶晋级高级经纪人）
  | 'UPSELL_COMM'         // 供应链增项返佣
  | 'TAX_DEDUCTION'       // 个税代扣
  | 'WITHDRAW';           // 提现

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TxType;
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

// 奖励规则常量（对应业务图）
export const REWARDS = {
  LEAD_BONUS: 200,              // 带单奖励：200 元/单（量房完成）
  SIGN_BONUS: 200,             // 签单奖励：200 元/单（签约完成）
  PERF_BONUS: 1000,            // 业绩奖金：1000 元（5 次量房/月）
  PERF_MEASURE_THRESHOLD: 5,   // 业绩奖金量房阈值
  NODE_RATE: 0.03,             // 节点返佣：合同 3%
  MGMT_SHARE_V3: 0.30,         // 管理分润：下属为高级经纪人 30%
  MGMT_SHARE_V2: 0.20,         // 管理分润：下属为经纪人 20%
  CHANNEL_RATE: 0.003,         // 渠道返佣：直属签约总额 3‰
  CHANNEL_CAP: 30000,          // 渠道返佣月封顶 3 万
  CHANNEL_MGMT_AWARD: 2000,    // 渠道管理奖（开发 3 个经纪人）
  ASSIST_AWARD: 1000,          // 助力奖（帮扶晋级高级经纪人）
  PROMO_VALID_CUSTOMERS: 3,    // 注册推荐官 → 经纪人（上传 3 个有效客户）
  PROMO_AGENTS: 3,             // 经纪人 → 高级经纪人（开发 3 个经纪人）
};

// 公共展示名称（各页面共用，避免重复定义）
export const ROLE_NAMES: Record<UserRole, string> = { 'V1': '注册推荐官', 'V2': '经纪人', 'V3': '高级经纪人' };
export const STATUS_NAMES: Record<LeadStatus, string> = {
  'PENDING': '待跟进', 'MEASURED': '已量房', 'SIGNED': '已签约',
  'WATER_ELEC': '水电进场', 'FURNITURE': '软装进场', 'COMPLETED': '已竣工', 'INVALID': '已失效'
};

// 有效客户 = 到店或量房（即状态已达量房及以后）
const VALID_CUSTOMER_STATUSES: LeadStatus[] = ['MEASURED', 'SIGNED', 'WATER_ELEC', 'FURNITURE', 'COMPLETED'];

function newUser(u: Partial<User> & { id: string; name: string; role: UserRole; parentId: string | null; avatar: string }): User {
  return {
    balance: 0, pendingBalance: 0,
    monthlyMeasureCount: 0, perfBonusGranted: false, channelOverrideMonth: 0,
    withdrawCountToday: 0, withdrawAmountToday: 0, lastWithdrawDate: '',
    ...u,
  } as User;
}

export const store = reactive({
  currentUser: null as unknown as User,
  pendingNotice: '' as string, // 晋升/里程碑提示，UI 读取后清空

  users: [
    newUser({ id: 'u1', name: '李队长', role: 'V3', parentId: null, avatar: '👨🏻‍💼', balance: 6800 }),
    newUser({ id: 'u2', name: '张经纪', role: 'V2', parentId: 'u1', avatar: '👩🏻‍💼', balance: 1500 }),
    newUser({ id: 'u3', name: '赵经纪', role: 'V2', parentId: 'u1', avatar: '🧔🏻‍♂️', balance: 0 }),
    newUser({ id: 'u4', name: '小王', role: 'V1', parentId: 'u2', avatar: '👱🏻‍♀️', balance: 0 }),
    newUser({ id: 'u5', name: '小李', role: 'V1', parentId: 'u3', avatar: '👨🏽‍🔧', balance: 0 }),
  ] as User[],

  leads: [] as Lead[],
  transactions: [] as Transaction[],
  radarLogs: [] as RadarLog[],

  loginAs(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) this.currentUser = user;
  },

  getUser(id: string) { return this.users.find(u => u.id === id); },

  // 找最近的「高级经纪人」上级
  findSeniorAncestor(userId: string): User | undefined {
    let pid = this.getUser(userId)?.parentId || null;
    while (pid) {
      const p = this.getUser(pid);
      if (!p) break;
      if (p.role === 'V3') return p;
      pid = p.parentId;
    }
    return undefined;
  },

  // 有效客户数（到店/量房及以后）
  validCustomerCount(userId: string) {
    return this.leads.filter(l => l.referrerId === userId && VALID_CUSTOMER_STATUSES.includes(l.status)).length;
  },

  // 直接开发且为「经纪人」的下级数量
  developedAgentsCount(userId: string) {
    return this.users.filter(u => u.parentId === userId && u.role === 'V2').length;
  },

  getDownlines(userId: string) {
    const downlines: Array<{ user: User; distance: number; contributedComm: number; daysSinceLastLead: number }> = [];
    const walk = (pid: string, dist: number) => {
      for (const child of this.users.filter(u => u.parentId === pid)) {
        const childLeads = this.leads.filter(l => l.referrerId === child.id);
        const contributedComm = this.transactions
          .filter(t => t.userId === child.id && t.amount > 0)
          .reduce((s, t) => s + t.amount, 0);
        downlines.push({
          user: child, distance: dist, contributedComm,
          daysSinceLastLead: childLeads.length ? 3 : 35, // 无任何线索的下级视为流失风险
        });
        walk(child.id, dist + 1);
      }
    };
    walk(userId, 1);
    return downlines;
  },

  // 仅「直接推广」的下级（直属一代），名单与「推广部」人数均基于此口径
  getDirectDownlines(userId: string) {
    return this.users
      .filter(u => u.parentId === userId)
      .map(child => {
        const childLeads = this.leads.filter(l => l.referrerId === child.id);
        return {
          user: child,
          distance: 1,
          leadsCount: childLeads.length,         // 直客线索总数
          daysSinceLastLead: childLeads.length ? 3 : 35, // 流失风险启发式
        };
      });
  },

  getTeamStats(userId: string) {
    const downlines = this.getDownlines(userId);
    const downlineIds = downlines.map(d => d.user.id);
    const teamLeadsCount = this.leads.filter(l => downlineIds.includes(l.referrerId)).length;
    // 团队级收益 = 管理分润 + 渠道返佣 + 里程碑奖
    const teamTypes: TxType[] = ['MGMT_SHARE', 'CHANNEL_OVERRIDE', 'CHANNEL_MGMT_AWARD', 'ASSIST_AWARD'];
    const teamMgmtTotal = this.transactions
      .filter(t => t.userId === userId && teamTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);
    // 「推广部」人数只统计直接推广的下级（间接开发不计入）
    const directSize = this.users.filter(u => u.parentId === userId).length;
    return { teamSize: directSize, teamLeadsCount, teamMgmtTotal };
  },

  getLeaderboard(userId: string) {
    const me = this.getUser(userId);
    const pool = [me, ...this.getDownlines(userId).map(d => d.user)].filter(Boolean) as User[];
    return pool
      .map(u => ({ name: u.name, avatar: u.avatar, value: this.leads.filter(l => l.referrerId === u.id).length, label: '单' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
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
        desc: `进入30天专属保护期，超时未转化将掉入公海。`,
        icon: '🛡'
      }]
    };
    this.leads.unshift(newLead);
    return newLead;
  },

  pushTx(userId: string, amount: number, type: TxType, desc: string, sourceLeadId?: string) {
    this.transactions.unshift({
      id: Date.now() + '_' + type + '_' + Math.random().toString(36).slice(2, 6),
      userId, amount, type, sourceLeadId, desc, date: new Date().toLocaleString(), status: 'SETTLED'
    });
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
      lead.timeline.unshift({ time: dateStr, title: '设计师已上门量房', desc: '初步勘测完毕，客户意向升级，触发带单奖励！', icon: '📏' });
      lead.intentionLevel = 'A';
      // 带单奖励 200
      referrer.balance += REWARDS.LEAD_BONUS;
      this.pushTx(referrer.id, REWARDS.LEAD_BONUS, 'LEAD_BONUS', `【${lead.clientName}】带单奖励（量房完成）`, lead.id);
      // 月度量房计数 → 业绩奖金
      referrer.monthlyMeasureCount += 1;
      if (referrer.monthlyMeasureCount === REWARDS.PERF_MEASURE_THRESHOLD && !referrer.perfBonusGranted) {
        referrer.perfBonusGranted = true;
        referrer.balance += REWARDS.PERF_BONUS;
        this.pushTx(referrer.id, REWARDS.PERF_BONUS, 'PERF_BONUS', `本月累计 ${REWARDS.PERF_MEASURE_THRESHOLD} 次量房，业绩奖金达成！`, lead.id);
        if (referrer.id === this.currentUser?.id) this.pendingNotice = `🏅 本月量房满${REWARDS.PERF_MEASURE_THRESHOLD}次，业绩奖¥${REWARDS.PERF_BONUS}已到账`;
      }
      this.checkPromotion(referrer.id); // 量房使其成为有效客户，可能触发晋升
    }
    else if (newStatus === 'SIGNED') {
      lead.timeline.unshift({ time: dateStr, title: '成功签约支付定金', desc: `合同金额 ¥${(amount || 0).toLocaleString()}，触发签单奖励与节点返佣分配！`, icon: '🤝' });
      this.distributeOnSign(lead, dateStr);
    }
    else if (newStatus === 'WATER_ELEC') {
      lead.timeline.unshift({ time: dateStr, title: '水电进场验收', desc: '隐蔽工程验收通过，项目进入施工阶段。', icon: '⚡' });
    }
    else if (newStatus === 'FURNITURE') {
      lead.timeline.unshift({ time: dateStr, title: '软装/全屋定制进场', desc: '客户增购全屋定制套餐，项目稳步推进。', icon: '🛋' });
    }
    else if (newStatus === 'COMPLETED') {
      lead.timeline.unshift({ time: dateStr, title: '竣工验收及尾款结清', desc: '客户验收满意，订单全部完成。', icon: '🎉' });
    }
  },

  // 签约时一次性分配：签单奖 + 节点返佣 3% + 管理分润 + 渠道返佣
  distributeOnSign(lead: Lead, dateStr: string) {
    const referrer = this.getUser(lead.referrerId);
    if (!referrer || !lead.totalAmount) return;
    const amount = lead.totalAmount;

    // 1) 签单奖励 200
    referrer.balance += REWARDS.SIGN_BONUS;
    this.pushTx(referrer.id, REWARDS.SIGN_BONUS, 'SIGN_BONUS', `【${lead.clientName}】签单奖励（签约完成）`, lead.id);

    // 2) 节点返佣 3%（一次性全额）
    const nodeComm = amount * REWARDS.NODE_RATE;
    referrer.balance += nodeComm;
    this.pushTx(referrer.id, nodeComm, 'NODE_COMM', `【${lead.clientName}】节点返佣（合同 ${REWARDS.NODE_RATE * 100}%）`, lead.id);

    // 3) 管理分润：最近的高级经纪人上级，按下属节点佣金抽成（推荐官带单不分）
    const shareRate = referrer.role === 'V3' ? REWARDS.MGMT_SHARE_V3
      : referrer.role === 'V2' ? REWARDS.MGMT_SHARE_V2 : 0;
    if (shareRate > 0) {
      const senior = this.findSeniorAncestor(referrer.id);
      if (senior) {
        const mgmt = nodeComm * shareRate;
        senior.balance += mgmt;
        this.pushTx(senior.id, mgmt, 'MGMT_SHARE', `下属【${referrer.name}】签约，管理分润 ${shareRate * 100}%`, lead.id);
      }
    }

    // 4) 渠道返佣：直属上级若为高级经纪人，按签约额 3‰，封顶 3 万/月
    const parent = referrer.parentId ? this.getUser(referrer.parentId) : undefined;
    if (parent && parent.role === 'V3') {
      const raw = amount * REWARDS.CHANNEL_RATE;
      const room = Math.max(0, REWARDS.CHANNEL_CAP - parent.channelOverrideMonth);
      const pay = Math.min(raw, room);
      if (pay > 0) {
        parent.channelOverrideMonth += pay;
        parent.balance += pay;
        const capped = pay < raw ? '（已达本月封顶）' : '';
        this.pushTx(parent.id, pay, 'CHANNEL_OVERRIDE', `渠道返佣：直属【${referrer.name}】签约额 ${REWARDS.CHANNEL_RATE * 1000}‰${capped}`, lead.id);
      }
    }
  },

  addUpsell(leadId: string, itemName: string, amount: number, commRate: number) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return;
    const comm = amount * commRate;
    lead.upsellItems.push({ name: itemName, amount, comm });

    lead.timeline.unshift({
      time: new Date().toLocaleString(),
      title: `客户增购：${itemName}`,
      desc: `购买金额 ¥${amount.toLocaleString()}，您获得专属供应链返佣 ¥${comm.toLocaleString()}。`,
      icon: '🛍'
    });

    const referrer = this.getUser(lead.referrerId);
    if (referrer) {
      referrer.balance += comm;
      this.pushTx(referrer.id, comm, 'UPSELL_COMM', `【${lead.clientName}】${itemName}供应链返佣`, lead.id);
    }
  },

  // 模拟「开发下级」：用于演示渠道裂变与晋升
  recruit(parentId: string, role: UserRole) {
    const parent = this.getUser(parentId);
    if (!parent) return;
    const avatars = ['🧑🏻', '👩🏻', '🧔🏻‍♂️', '👨🏽', '👩🏽‍💼', '🧑🏽‍💻'];
    const seq = this.users.length + 1;
    const id = 'u' + seq + '_' + Date.now().toString().slice(-4);
    const baseName = role === 'V2' ? '经纪人' : '推荐官';
    this.users.push(newUser({
      id, name: `${baseName}${seq}号`, role, parentId,
      avatar: avatars[seq % avatars.length],
    }));
    this.checkPromotion(parentId); // 开发经纪人可能让 parent 晋升
  },

  // 晋升判定：满足条件自动升级，并发放里程碑奖
  checkPromotion(userId: string) {
    const user = this.getUser(userId);
    if (!user) return;

    // 注册推荐官 → 经纪人：上传 3 个有效客户
    if (user.role === 'V1' && this.validCustomerCount(user.id) >= REWARDS.PROMO_VALID_CUSTOMERS) {
      user.role = 'V2';
      if (user.id === this.currentUser?.id) this.pendingNotice = '🎖 恭喜晋升「经纪人」！已可开发渠道、享团队分润';
      return;
    }

    // 经纪人 → 高级经纪人：开发满 3 个经纪人（完成渠道部组建）
    if (user.role === 'V2' && this.developedAgentsCount(user.id) >= REWARDS.PROMO_AGENTS) {
      user.role = 'V3';
      // 渠道管理奖 2000
      user.balance += REWARDS.CHANNEL_MGMT_AWARD;
      this.pushTx(user.id, REWARDS.CHANNEL_MGMT_AWARD, 'CHANNEL_MGMT_AWARD', `开发满 ${REWARDS.PROMO_AGENTS} 名经纪人，完成渠道部组建`);
      // 上级助力奖 1000
      const parent = user.parentId ? this.getUser(user.parentId) : undefined;
      if (parent) {
        parent.balance += REWARDS.ASSIST_AWARD;
        this.pushTx(parent.id, REWARDS.ASSIST_AWARD, 'ASSIST_AWARD', `帮扶下属【${user.name}】晋级高级经纪人`);
      }
      if (user.id === this.currentUser?.id) this.pendingNotice = `👑 恭喜晋升「高级经纪人」！渠道管理奖¥${REWARDS.CHANNEL_MGMT_AWARD}已到账`;
    }
  },

  // 合规提现：手续费 8%+3元/笔 与 个税 6% 叠加；单笔满 100 整数，单日 ≤3 笔且 ≤1 万
  withdraw(amount: number): { ok: boolean; msg: string } {
    const user = this.currentUser;
    if (!Number.isInteger(amount) || amount < 100) {
      return { ok: false, msg: '单笔提现需为满 100 元的整数' };
    }
    if (amount > user.balance) {
      return { ok: false, msg: '可提现余额不足' };
    }
    // 跨日重置当日计数
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastWithdrawDate !== today) {
      user.lastWithdrawDate = today;
      user.withdrawCountToday = 0;
      user.withdrawAmountToday = 0;
    }
    if (user.withdrawCountToday >= 3) {
      return { ok: false, msg: '今日提现已达 3 笔上限，请明日再试' };
    }
    if (user.withdrawAmountToday + amount > 10000) {
      const left = 10000 - user.withdrawAmountToday;
      return { ok: false, msg: `超出当日额度（每日最高 1 万元，今日剩余可提 ¥${left.toLocaleString()}）` };
    }
    const fee = amount * 0.08 + 3;       // 手续费 8% + 3 元/笔
    const tax = amount * 0.06;           // 个税代扣代缴 6%
    const actual = amount - fee - tax;   // 实际到账
    user.balance -= amount;
    user.withdrawCountToday += 1;
    user.withdrawAmountToday += amount;
    this.pushTx(user.id, -amount, 'WITHDRAW',
      `提现 ¥${amount.toLocaleString()}，实际到账 ¥${actual.toFixed(2)}（手续费 ¥${fee.toFixed(2)} + 个税 ¥${tax.toFixed(2)}，预计 24h 内到账绑定结算卡）`);
    return { ok: true, msg: `提现申请已提交，实际到账 ¥${actual.toFixed(2)}，预计 24 小时内到账` };
  },

  // 取出并清空一次性提示
  takeNotice(): string {
    const n = this.pendingNotice;
    this.pendingNotice = '';
    return n;
  }
});

// ---------------- 初始化假数据引擎 ---------------- //
store.loginAs('u4');

// 访客雷达记录
store.radarLogs = [
  { id: 'r1', visitorName: '李**', avatar: '👩🏻‍🦳', viewTime: '10分钟前', articleTitle: '避坑指南：家装客户最关心的10个增项陷阱', duration: 125 },
  { id: 'r2', visitorName: '王**', avatar: '👨🏼', viewTime: '1小时前', articleTitle: '专属招募海报 (扫码进入)', duration: 45 },
  { id: 'r3', visitorName: '未授权用户', avatar: '👤', viewTime: '昨天 15:30', articleTitle: '【紫钰整装】秋季感恩回馈', duration: 15 },
];

// —— 推荐官小王（u4，默认登录）：2 个有效客户，距晋升经纪人还差 1 个 ——
const lead1 = store.addLead({ referrerId: 'u4', clientName: '刘女士', clientPhone: '13800138000', community: '星河丹堤', area: 120 });
lead1.timeline.unshift({ time: new Date(Date.now() - 3600000).toLocaleString(), title: '电销团队跟进', desc: '客户意向极高，A类客户，周末安排看样板间。', icon: '📞' });
store.updateLeadStatus(lead1.id, 'MEASURED');

const lead2 = store.addLead({ referrerId: 'u4', clientName: '王先生', clientPhone: '13900139000', community: '中海九号公馆', area: 90 });
store.updateLeadStatus(lead2.id, 'MEASURED');
store.updateLeadStatus(lead2.id, 'SIGNED', 150000);
store.updateLeadStatus(lead2.id, 'WATER_ELEC');
store.addUpsell(lead2.id, '格力中央空调一拖五', 25000, 0.05);

const lead3 = store.addLead({ referrerId: 'u4', clientName: '赵大哥', clientPhone: '13700137000', community: '保利时代', area: 140 });
lead3.intentionLevel = 'C';
lead3.protectionExpireDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleString();
lead3.timeline.unshift({ time: new Date(Date.now() - 86400000).toLocaleString(), title: '系统警告', desc: '客户跟进停滞，还有2天将掉入公海，请尽快联系促单！', icon: '⚠️' });

// —— 经纪人张经纪（u2）签一单，演示高级经纪人李队长（u1）的管理分润 + 渠道返佣 ——
const lead4 = store.addLead({ referrerId: 'u2', clientName: '陈女士', clientPhone: '13600136000', community: '华润城润府', area: 160 });
store.updateLeadStatus(lead4.id, 'MEASURED');
store.updateLeadStatus(lead4.id, 'SIGNED', 200000);
