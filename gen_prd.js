// 《资金心电图》产品需求文档 V1.0 生成脚本
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, Footer, PageNumber
} = require("docx");
const fs = require("fs");

const FONT_HEAD = "微软雅黑";   // 微软雅黑
const FONT_BODY = "宋体";               // 宋体
const C_MAIN = "1F4E79";
const C_GRAY = "808080";
const USABLE = 9026;

const thin = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const BORDERS = { top: thin, bottom: thin, left: thin, right: thin };

function P(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 120, line: 320 },
    children: [new TextRun({
      text, font: opts.font || FONT_BODY,
      size: opts.size || 21,
      bold: opts.bold || false,
      color: opts.color || "000000"
    })]
  });
}

function H1(t) { return new Paragraph({ text: t, heading: HeadingLevel.HEADING_1 }); }
function H2(t) { return new Paragraph({ text: t, heading: HeadingLevel.HEADING_2 }); }
function H3(t) { return new Paragraph({ text: t, heading: HeadingLevel.HEADING_3 }); }

function bullet(text, boldHead) {
  const runs = [];
  if (boldHead) {
    runs.push(new TextRun({ text: boldHead, bold: true, font: FONT_BODY, size: 21 }));
    runs.push(new TextRun({ text: text, font: FONT_BODY, size: 21 }));
  } else {
    runs.push(new TextRun({ text, font: FONT_BODY, size: 21 }));
  }
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80, line: 300 },
    children: runs
  });
}

function cell(content, { header = false, w, align = AlignmentType.LEFT } = {}) {
  const texts = Array.isArray(content) ? content : [String(content)];
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: "center",
    shading: header ? { type: ShadingType.CLEAR, fill: "DCE6F1" } : undefined,
    children: texts.map(t => new Paragraph({
      alignment: align,
      spacing: { after: 0, line: 280 },
      children: [new TextRun({
        text: String(t), font: header ? FONT_HEAD : FONT_BODY,
        size: header ? 20 : 20, bold: header, color: header ? C_MAIN : "000000"
      })]
    }))
  });
}

function mkTable(widths, headers, rows) {
  const wsum = widths.reduce((a, b) => a + b, 0);
  const dxa = widths.map(x => Math.round(x / wsum * USABLE));
  return new Table({
    width: { size: USABLE, type: WidthType.DXA },
    columnWidths: dxa,
    borders: BORDERS,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => cell(h, { header: true, w: dxa[i], align: AlignmentType.CENTER }))
      }),
      ...rows.map(r => new TableRow({
        children: r.map((c, i) => cell(c, { w: dxa[i], align: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT }))
      }))
    ]
  });
}

const GAP = () => new Paragraph({ spacing: { after: 160 }, children: [] });

/* ==================== 封面 ==================== */
const cover = [
  new Paragraph({ spacing: { before: 2600 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [new TextRun({ text: "资金心电图", font: FONT_HEAD, size: 72, bold: true, color: C_MAIN })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: "企业经营财务风险模拟与预警系统", font: FONT_HEAD, size: 28, color: "595959" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "产品需求文档（PRD）", font: FONT_HEAD, size: 36, bold: true, color: "000000" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 2200 },
    children: [new TextRun({ text: "版本 V1.0", font: FONT_HEAD, size: 26, color: C_GRAY })]
  }),
];

const coverInfo = mkTable(
  [30, 70],
  ["项目", "内容"],
  [
    ["文档编号", "XDT-PRD-2026-001"],
    ["当前状态", "草案（待评审）"],
    ["编制人", ""],
    ["编制日期", "2026年8月25日"],
    ["密级", "公开"]
  ]
);
cover.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 400 },
  children: []
}));
cover.push(coverInfo);

/* ==================== 正文 ==================== */
const body = [];

/* ---- 修订记录 ---- */
body.push(H1("修订记录"));
body.push(mkTable([12, 18, 55, 15],
  ["版本", "日期", "修订内容", "修订人"],
  [["V1.0", "2026-08-25",
    ["初稿。相对概念稿的关键调整：①输入层以银行流水与合同为核心；②免费版改为浅体检，预测能力全部入墙；③新增LLM处理层与60案先验库；④英雄指标改为断粮日+回本日；⑤移出蒙特卡洛至V2.0"],
    ""]]));

/* ---- 目录（静态） ---- */
body.push(H1("目录"));
[
  "1. 产品概述",
  "2. 核心概念体系",
  "3. V1.0功能规格",
  "4. 60案先验库设计",
  "5. 收费分层",
  "6. 责任声明与合规",
  "7. V0.1规格（首单项目脚本模拟器）",
  "8. 技术架构概览",
  "9. 里程碑与排期"
].forEach((t, i) => {
  body.push(P(t, { font: FONT_HEAD, size: 22, after: 100 }));
});
body.push(GAP());

/* ---- 1 产品概述 ---- */
body.push(H1("1. 产品概述"));

body.push(H2("1.1 一句话定位"));
body.push(P("AI驱动的企业资金流模拟、推演与预警工具——把企业的银行流水和合同变成一张资金心电图，让决策者在断粮之前看到断粮日。"));

body.push(H2("1.2 目标用户画像"));
body.push(mkTable([20, 30, 28, 22],
  ["用户群", "特征", "核心痛点", "付费动机"],
  [
    ["中小项目公司决策者", "房地产、建安、生产型企业；无专职财务总监，老板一支笔管资金", "不知道钱什么时候不够用；签了合同忘了付款节奏", "免于突然断链"],
    ["政府专班与处置机构", "保交楼、烂尾项目处置；多方案比选需求强", "方案比选缺乏动态工具，拍脑决策", "维稳责任压力"],
    ["金融机构（银行、AMC）", "贷后监测、不良资产收购定价", "预警滞后于暴雷；收购定价缺依据", "风控合规要求"],
    ["破产管理人与清算组", "清算价值测算、续建可行性判断", "缺少可信的测算工具", "法定职责需要"]
  ]));
body.push(GAP());

body.push(H2("1.3 核心价值主张"));
body.push(bullet("以现金流而非利润为唯一主线。利润是观点，现金是事实；所有输出围绕资金余额曲线展开。"));
body.push(bullet("尸检校准的先验。风险参数来自60余个真实困境项目的审计底稿，而非教科书假设；每个预警阈值能回答“依据是什么”。"));
body.push(bullet("数据质量透明。ABCD分级，输出强度与数据可信度挂钩；宁可不算，不可乱算。"));
body.push(bullet("决策即游戏。拖动滑杆看日期变化，英雄指标是断粮日与回本日；白箱可溯源，每个数字能点开看它怎么来的。"));

body.push(H2("1.4 与传统工具的差异"));
body.push(mkTable([16, 21, 21, 21, 21],
  ["维度", "记账财务软件", "Excel模型", "BI报表", "资金心电图"],
  [
    ["时间方向", "向后看，记录已发生", "静态一次性", "展示历史", "向前看，推演未来12个月"],
    ["交互性", "无", "改公式易错", "筛选下钻", "滑杆实时重算，对话式推演"],
    ["风险知识", "无", "依赖建模者水平", "无", "60案先验库+六类死亡剧本预警"],
    ["数据诚信", "不评估", "不评估", "不评估", "ABCD分级，输出随质量降级"],
    ["可解释性", "黑箱", "在个人脑子里", "黑箱", "白箱溯源，逐笔可追"]
  ]));
body.push(GAP());

/* ---- 2 核心概念 ---- */
body.push(H1("2. 核心概念体系"));

body.push(H2("2.1 资金心电图（三条曲线）"));
body.push(bullet("银行流水汇总的月度净流量与余额，一切分析的锚点。", "历史真实曲线："));
body.push(bullet("合同付款节点与固定支出排布的未来12个月刚性支出；解决“签了合同忘了付款节奏”这一最常见盲区。", "未来义务曲线："));
body.push(bullet("用户预算或AI草稿，随决策滑杆实时变形。", "预算情景曲线："));

body.push(H2("2.2 英雄指标：断粮日与回本日"));
body.push(bullet("预测资金余额首次穿零的日期。精度随数据等级变化：A级±15天，B级±45天，C级±120天，D级不给具体日期，只给高危状态。", "断粮日："));
body.push(bullet("累计现金流由负转正的日期。", "回本日："));
body.push(bullet("所有滑杆操作最终都映射为这两个日期的变化量（天数），界面高亮显示。决策者记日期，不记金额。", "映射规则："));

body.push(H2("2.3 健康分（90天义务覆盖率）"));
body.push(P("健康分 = 可用资金 ÷ 未来90天刚性支出。一屏一数一色：≥1.5绿；1.0～1.5黄；<1.0红；数据不足灰。"));

body.push(H2("2.4 六类死亡剧本（风险分类学）"));
body.push(mkTable([8, 16, 30, 46],
  ["编号", "剧本名称", "关键征兆（信号）", "锚点案例（脱敏）"],
  [
    ["S1", "抽逃断链型", "贷款到账当日或次日等额转出；其他应收款激增", "某项目3000万贷款到账当天转入关联往来，体外循环"],
    ["S2", "扩张失血型", "经营性现金持续为负且投资性流出大额刚性", "大型房企挪预售资金拿地，高周转扩张崩盘"],
    ["S3", "高息拖垮型", "融资源从银行→信托→民间借贷逐级降级；综合融资成本高于资产回报率", "某项目民间借贷2490万；监理费合约130万拖成600余万的时间失血"],
    ["S4", "合同义务失控型", "无付款计划合同占比上升；90天义务覆盖率骤降；签约主体与收款主体不一致", "某配电合同签约主体与实际收款方不一致，内控失效"],
    ["S5", "账期漂移型", "应付账款账期逐季拉长；新增商票支付；供应商诉讼激增", "行业性商票危机，大企业占压供应链资金"],
    ["S6", "停工空转型", "监理费、租赁、留守工资等纯消耗性支出占比攀升，产值停滞", "停工期间费用空转，付款与产值增长脱钩"]
  ]));
body.push(GAP());
body.push(P("六类剧本同时用作：预警分类语言、流水打标体系、反方唱票的质疑规则、先验库的案例归档结构。分类学本身就是产品语言。"));

body.push(H2("2.5 数据质量评分（ABCD四级）"));
body.push(H3("2.5.1 四维度打分"));
body.push(mkTable([18, 12, 70],
  ["维度", "权重", "评分要点"],
  [
    ["来源可靠性", "25%", "银行流水原始导出=满分；账套导出次之；手工录入降半；口头估算最低"],
    ["一致性", "25%", "流水、账套、报表三口径勾稽差异率：<1%满分，>10%零分"],
    ["完整性", "25%", "时间覆盖≥36个月且账户齐全；按缺失月数比例扣分"],
    ["时效性", "25%", "最新数据距今天数：≤30天满分，>180天零分"]
  ]));
body.push(GAP());
body.push(H3("2.5.2 四级判定与输出影响"));
body.push(mkTable([10, 14, 22, 54],
  ["等级", "分数段", "断粮日精度", "功能边界"],
  [
    ["A", "≥85", "±15天", "全功能，预警强提示，完整白箱"],
    ["B", "70～84", "±45天", "全功能，预警正常提示"],
    ["C", "50～69", "±120天（季度级）", "禁用精细输出（如蒙特卡洛类），预警中提示"],
    ["D", "<50", "不给日期", "不出预测结论，仅出体检清单与数据改进建议"]
  ]));
body.push(GAP());
body.push(P("产品诚实原则：宁可不算，不可乱算。D级数据上的沉默是产品信用的建立，不是功能缺陷。"));

/* ---- 3 V1.0 功能规格 ---- */
body.push(H1("3. V1.0功能规格"));

body.push(H2("3.1 输入层"));
body.push(H3("3.1.1 银行流水导入"));
body.push(P("格式CSV/XLSX，内置20余家主流网银导出模板识别规则；字段自动映射（交易日期、金额、对方户名、摘要）；支持多账户合并；同一账户重复文件按流水号自动去重。流水是唯一造假困难的真值锚，一切分析以它为基准。"));
body.push(H3("3.1.2 合同上传与结构化抽取"));
body.push(P("支持PDF、Word、扫描件（OCR）。抽取字段：合同编号、对手方、金额、付款计划节点、质保金条款、争议解决条款。抽取结果经人工确认后入库（人机协同，AI抽取+人工一键确认）。风险条款即时提示：无付款计划、无限连带责任、解约权不对等。"));
body.push(H3("3.1.3 手工补录"));
body.push(P("所有手工条目强制标记来源为手工，评分时降权；补录项在曲线上以空心点显示，与实证数据区分。"));

body.push(H2("3.2 LLM处理层"));
body.push(H3("3.2.1 流水智能清洗与打标"));
body.push(P("分类体系：经营流入、工程与货款支付、税费、工资、融资进出、关联往来、费用、异常待审。规则引擎优先（金额+户名+摘要规则），冲突或低置信度交LLM二次判断，仍不确定标待人工。性能目标：单万行流水处理时间小于3分钟。"));
body.push(H3("3.2.2 合同关键信息抽取"));
body.push(P("见第3.1.2节，抽取字段与风险条款提示同此处理，抽取置信度低的字段标黄邀请人工复核。"));
body.push(H3("3.2.3 对话式推演（受限域）"));
body.push(P("仅回答资金与财务风险域问题。反幻觉铁律：LLM只负责理解意图和组织语言，回答中的每一个数字必须引自确定性引擎的计算结果，禁止LLM自由生成数值。典型问法：“下个月拿2000万拿地行不行”“回款晚两个月会怎样”“再融资500万断粮日推后多少天”。"));
body.push(H3("3.2.4 反方唱票"));
body.push(P("每次重大参数调整或新合同入库，自动匹配六类剧本并生成质疑（例：“该付款计划使S4合同义务失控概率上调，因为……”）。质疑必须引用具体证据（哪笔流水、哪份合同第几条）。用户可忽略，但系统留痕。"));

body.push(H2("3.3 数据质量评分层"));
body.push(P("算法见第2.5节。每次导入自动重评；评分报告列出问题清单与改进建议（例：“缺少2025年3至5月流水，建议补导”“手工录入占比过高，建议改为网银导出”）。评分变化历史可查。"));

body.push(H2("3.4 推理引擎层"));
body.push(H3("3.4.1 逐月现金流模型"));
body.push(P("期初余额+流入-流出=期末余额，逐月递推；历史月用实际值，未来月用义务排布与情景参数。未来90天内切换周粒度。"));
body.push(H3("3.4.2 盈亏平衡分析"));
body.push(P("月度固定成本、变动成本率、盈亏平衡收入线；项目型业务输出盈亏平衡去化速度（套/月）。"));
body.push(H3("3.4.3 六类剧本预警逻辑"));
body.push(mkTable([10, 62, 28],
  ["编号", "触发阈值示例（V1.0初始值，可配置）", "预警分级"],
  [
    ["S1", "单笔流出≥500万且到账后3日内转关联方；其他应收款季增幅>40%", "关注/警告/危险"],
    ["S2", "经营性现金连续6月为负且投资性流出占流入>50%", "同上"],
    ["S3", "新增融资年化利率>15%；利息支出占营收>20%", "同上"],
    ["S4", "90天义务覆盖率<1.0；无付款条款合同金额占比>30%", "同上"],
    ["S5", "应付账款平均账期连续2季拉长>15%；新增商票开立", "同上"],
    ["S6", "纯消耗性支出占比连续3月>25%且产值增长≤0", "同上"]
  ]));
body.push(GAP());
body.push(P("命中即点亮预警灯，每条预警附证据链（具体流水、合同、科目）。阈值依60案先验库校准，随回测迭代。"));
body.push(H3("3.4.4 敏感性分析"));
body.push(P("龙卷风图。变量集：回款速度±30%、大额抽调、融资成本±200bp、工期延误N月、单价波动±10%。输出各变量对断粮日的位移排序——告诉决策者哪个变量最先弄死企业。"));
body.push(H3("3.4.5 场景对比"));
body.push(P("乐观、中性、悲观三场景并行渲染三条曲线，附参数差异表。"));

body.push(H2("3.5 仪表盘层"));
body.push(P("首屏布局：顶部健康分（一屏一数一色）与英雄指标区（断粮日、回本日及其置信区间）；中部三条曲线主图；底部六类预警灯区。所有数字带数据来源等级角标（实证、陈述、愿望）。"));

body.push(H2("3.6 交互层"));
body.push(bullet("月去化、回款延迟天数、新增融资额与成本、一次性支出、抽调金额、工期。拖动实时重算，响应目标小于500ms（引擎本地确定性计算保障）。", "决策滑杆："));
body.push(bullet("保存当前参数为方案快照，A/B并排对比断粮日与回本日的变化量及90天覆盖率差异。", "方案对比："));
body.push(bullet("曲线上任一点击开展：当月流入流出明细（按标签聚合）、取数来源（流水批次号、合同编号、手工补录）、计算公式。", "白箱溯源："));

/* ---- 4 先验库 ---- */
body.push(H1("4. 60案先验库设计"));
body.push(P("先验库是本产品相对通用BI与财务工具的核心壁垒：其他产品拍脑袋设参数，本产品用建筑与房地产困境领域60余个真实审计案例回归校准参数。"));

body.push(H2("4.1 行业基准值库"));
body.push(P("从审计底稿提取：行业毛利率、月度管理费用基线、工程款支付节奏、质保金比例、停工概率与时长分布等。每项标注样本量与离散度，供引擎在客户自身数据不足时作默认值。"));

body.push(H2("4.2 贝叶斯先验分布"));
body.push(P("关键不确定参数（回款速度因子、抽逃概率等）以先验分布注入模拟；客户实际数据到达后按贝叶斯更新收敛至客户自身分布。单次更新幅度设上限（不超过先验方差的一定比例），异常偏差弹人工确认，防过拟合与黑天鹅污染。"));

body.push(H2("4.3 死亡剧本库"));
body.push(P("六类剧本的量化特征向量+案例叙事+脱敏判例引用。用于反方唱票的质疑生成与预警阈值校准。"));

body.push(H2("4.4 更新与脱敏机制"));
body.push(bullet("新案例按流程入库：审计报告→标准化特征向量→双人复核→入库。"));
body.push(bullet("全部案例脱敏：公司名代号化，金额可等比缩放。"));
body.push(bullet("隐私铁律：客户自有数据永不进入共享库，仅用于该客户自身计算。"));

/* ---- 5 收费分层 ---- */
body.push(H1("5. 收费分层"));
body.push(mkTable([16, 54, 30],
  ["版本", "功能范围", "定位"],
  [
    ["免费版（浅体检）", ["上传流水→自动打标→数据质量评分→健康分；", "D级数据给诊断建议。", "边界：无预测曲线、无滑杆、无预警明细"], "获客与教育；评分结果自然生长付费动机"],
    ["付费版（完整版）", ["三条曲线、英雄指标、六类预警、敏感性分析、场景对比、", "决策滑杆、方案对比、白箱溯源、对话推演、反方唱票、", "数据质量报告"], "按年订阅+按项目数阶梯"],
    ["企业版（预留）", "API对接、银行直连、多项目管理、私有化部署、先验库行业子库定制", "单独报价"]
  ]));
body.push(GAP());
body.push(P("订阅与定价策略要点：预测能力不免费——免费送出错的预测会无声砸招牌，白箱才可辩护；政府专班与处置机构项目单独报价，可与咨询服务打包。"));

/* ---- 6 责任声明 ---- */
body.push(H1("6. 责任声明与合规"));
body.push(H2("6.1 输出声明"));
body.push(P("每份导出报告首页固定声明：本报告为基于所提供数据的情景推演结果，不构成审计意见、鉴证结论或投资建议；预测存在不确定性，实际结果可能与推演显著不同。"));
body.push(H2("6.2 数据安全"));
body.push(P("客户数据封闭循环，仅用于该客户自身计算；LLM调用采用不留存训练策略的服务接口；提供私有化部署选项。"));
body.push(H2("6.3 免责边界"));
body.push(P("D级数据不出结论；所有预测带置信区间；重大决策前提示建议结合尽职调查与专业意见。把职业怀疑写进产品基因。"));

/* ---- 7 V0.1 规格 ---- */
body.push(H1("7. V0.1规格（首单项目脚本模拟器）"));
body.push(H2("7.1 背景"));
body.push(P("华南某保交楼住宅项目（政府专班委托），政府专班两方案比选：全部完成3栋 vs 先完成2#、3#栋。V0.1目标是用最小成本验证引擎逻辑，并在专班汇报场景实战演示，不做产品化UI。"));
body.push(H2("7.2 三滑杆定义"));
body.push(mkTable([22, 30, 18, 30],
  ["滑杆", "取值范围", "默认值", "说明"],
  [
    ["续建范围", "全部3栋 / 仅2#、3#栋", "全部3栋", "决定续建支出总盘与工期"],
    ["月去化套数", "0～20套", "当前销售速率", "决定回款节奏"],
    ["专户资金到位节奏", "一次性 / 按工程节点分期", "按节点分期", "决定可用资金分布"]
  ]));
body.push(GAP());
body.push(H2("7.3 一曲线定义"));
body.push(P("专户资金余额曲线，未来18个月、月粒度。支出侧：分栋续建产值+管理人员工资（按每月口径）+备案费用；流入侧：销售回款+专户拨款。穿零点标红。"));
body.push(H2("7.4 两方案对比"));
body.push(P("A方案（全部完成）vs B方案（先完成2#、3#栋）并排输出：完工所需总资金峰值、资金穿零风险点、各方案交付时间。"));
body.push(H2("7.5 校准与验收"));
body.push(P("使用首单项目审核报告（编号略）核定数据：未完工程产值、已付未付、分栋测算系数（直接归属+面积分摊23.24%/76.76%）。验收标准：V0.1输出的续建总盘子与报告审定值偏差小于5%；实际向专班演示一次。"));
body.push(H2("7.6 技术形态"));
body.push(P("Python脚本+简易Web页面；参数与口径写死在配置文件中，与报告数据同源可追。"));

/* ---- 8 技术架构 ---- */
body.push(H1("8. 技术架构概览"));
body.push(H2("8.1 模块划分"));
body.push(P("输入适配模块→清洗打标模块→数据质量评分模块→确定性计算引擎（现金流递推、敏感性、场景）→展示层（仪表盘、滑杆、溯源）→对话编排层（LLM意图识别+话术组织，数字全部引自引擎）。"));
body.push(H2("8.2 数据流"));
body.push(P("原始凭证→结构化入库（SQLite/PostgreSQL）→标签层→引擎层→展示层。每层带版本戳，支持任意结果回溯到输入批次。"));
body.push(H2("8.3 LLM调用边界（铁律）"));
body.push(bullet("LLM不产出任何进入计算的数字。"));
body.push(bullet("LLM输出仅限：分类标签建议、抽取建议、解释文本、质疑文本。"));
body.push(bullet("所有数值经确定性引擎复核后才可展示。"));

/* ---- 9 里程碑 ---- */
body.push(H1("9. 里程碑与排期"));
body.push(mkTable([14, 16, 44, 26],
  ["阶段", "时间", "内容", "验收标准"],
  [
    ["V0.1", "第1～2周", "W1：引擎+数据录入；W2：滑杆+方案对比+校验报告", "专班场景演示一次，续建盘子偏差<5%"],
    ["V1.0", "第1～3月", "M1：输入层+打标；M2：评分+引擎完善+仪表盘；M3：交互+对话+内测", "3家真实企业试点（含1家专班）"],
    ["V2.0", "规划", "动态学习闭环、蒙特卡洛、市场风险插件、银行API、移动端查看", "另行评审"]
  ]));
body.push(GAP());
body.push(P("明确移出 V1.0：蒙特卡洛模拟（决策者需要确定性区间而非概率云）、插件层实现（仅预留接口定义）、移动端。", { color: "595959" }));

/* ==================== 组装文档 ==================== */
const doc = new Document({
  creator: "",
  title: "资金心电图 产品需求文档 V1.0",
  styles: {
    default: {
      document: { run: { font: FONT_BODY, size: 21 } },
      heading1: {
        run: { font: FONT_HEAD, size: 30, bold: true, color: C_MAIN },
        paragraph: { spacing: { before: 400, after: 220 } }
      },
      heading2: {
        run: { font: FONT_HEAD, size: 25, bold: true, color: "2E5E8C" },
        paragraph: { spacing: { before: 280, after: 160 } }
      },
      heading3: {
        run: { font: FONT_BODY, size: 22, bold: true, color: "000000" },
        paragraph: { spacing: { before: 200, after: 120 } }
      }
    }
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 240 } } }
      }]
    }]
  },
  sections: [
    {
      properties: {},
      children: cover
    },
    {
      properties: { page: { pageNumbers: { start: 1 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              children: ["— ", PageNumber.CURRENT, " —"],
              font: FONT_BODY, size: 16, color: C_GRAY
            })]
          })]
        })
      },
      children: body
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("./资金心电图产品需求文档_V1.0.docx", buf);
  console.log("OK bytes=" + buf.length);
});
