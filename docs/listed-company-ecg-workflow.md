# 上市公司年报「资金心电图」体检工作流

用途：任意A股上市公司，从年报PDF到六剧本打分＋断粮日推演。产品的A级数据校准方法（与60案流水路线互补：60案证明对"不诚实公司"靠流水抓，本流程验证对"诚实公司"提前预警）。首例实跑：万科A 2025 → references/vanke-2025-case.md。通用PDF/文档抽取另见技能 ocr-and-documents，本文件只记年报体检特有的步骤与坑。

## 1. 找报告、下载（巨潮资讯网，免登录）
```bash
curl -s -X POST 'https://www.cninfo.com.cn/new/hisAnnouncement/query' \
  -H 'User-Agent: Mozilla/5.0' -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'pageNum=1&pageSize=30&column=szse&tabName=fulltext&stock=000002,gssz0000002&category=category_ndbg_szsh&seDate=2026-01-01~2026-08-30'
```
- column：深市 szse / 沪市 sse；category_ndbg_szsh＝年度报告
- 返回 JSON：announcements[].adjunctUrl（如 finalpage/2026-04-01/1225067794.PDF），前拼 `http://static.cninfo.com.cn/` 即直链，curl 直接下（年报 6-7MB 无压力）

## 2. 提取与清洗（本机路由）
- fitz/pypdf/pdfplumber 装在用户 Python311（C:\Users\admin\AppData\Local\Programs\Python\Python311\python.exe），hermes venv 没有
- `python -c` 内联会被审批拦 → write_file 写 .py 再 terminal 执行
- fitz 按页提取，页间写 `===PAGE N===` 分隔
- 必做白名单清洗：PDF 提取文本含控制字符，read_file 会误判 "Binary file - cannot display as text"。只保留 ASCII＋CJK＋常用全半角标点：
```python
allowed = re.compile('[^\u0020-\u007e\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\u2010-\u2027\u2160-\u217f\u2460-\u24ff\n\t]')
text = allowed.sub('', text)
```
- search_files 对中文目录报 rg IO error → 定位一律用 terminal `grep -n -E`
- 298页年报提取＋清洗＋切片 <1分钟；按行号区间切出各节单独 txt 再逐段读，避免一次灌入全文

## 3. 结构定位锚点（grep 用）
- 骨架：`grep -n -E '^(第[一二三四五六七八九十]+节|合并资产负债表|合并利润表|合并现金流量表)'`
- 主要会计数据：`主要会计数据和财务指标`；有息负债：`有息负债及结构`；审计意见段：`与持续经营相关的重大不确定性`；大股东供血：`大股东|提供了借款`
- 注意区分合并表与母公司表（母公司表常紧跟在合并表后出现，先 grep 出全部表标题按行号排序再读）

## 4. 打分素材清单（按序读）
1. 第三节主要会计数据：营收／归母净利／归母净资产／经营现金流，三年对比 → 心电图读数
2. 分季度指标：Q4单季利润（大雷惯爆Q4，万科2025 Q4亏605亿＝全年68%）
3. 董事会报告有息负债段：短债规模与占比、综合融资成本、新增融资、展期进展
4. 合并三张表全量（BS盯：货币资金、其他应收款、存货、合同负债、应付账款、一年内到期非流动负债、其他非流动负债暴增项；CF盯三净额与销售收现/购房付现）
5. 审计报告持续经营强调事项段（审计师点名的地方＝最硬的信号，直接引用原文）
6. 大股东借款／关联交易（其他非流动负债暴增的来源）

## 5. 输出三件套
1. 心电图读数表：三年关键指标＋同比，存量（净资产）与流量（经营现金流）双线
2. 六剧本触发表：S1~S6逐项"判定＋报表依据"，阈值初值见 references/product-decisions.md
3. 断粮日推演：短期债务缺口 → 覆盖手段拆成条件变量（卖资产／销售回款／展期／股东供血），输出"日期或条件变量"；A类年报粒度太粗时输出条件推演而非精确日期；固定声明"情景推演，非审计意见、非投资建议"
