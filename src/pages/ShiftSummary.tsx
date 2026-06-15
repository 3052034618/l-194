import { useState, useEffect } from 'react'
import {
  Card, Table, Tag, Space, Typography, Descriptions,
  Row, Col, Button, Modal, App, Statistic, Empty, Progress, Divider, List, Alert, Timeline
} from 'antd'
import {
  FileTextOutlined,
  PayCircleOutlined,
  MobileOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  DollarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

function ShiftSummary() {
  const { message, confirm } = App.useApp()
  const [summary, setSummary] = useState<any>(null)
  const [currentShift, setCurrentShift] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showEndShiftModal, setShowEndShiftModal] = useState(false)
  const [showAbnormalOrders, setShowAbnormalOrders] = useState(false)
  const [showPendingRefunds, setShowPendingRefunds] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [shift, todaySummary] = await Promise.all([
        window.api.shift.current(),
        window.api.shift.todaySummary()
      ])
      setCurrentShift(shift)
      setSummary(todaySummary)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEndShift = () => {
    if (!currentShift) return
    confirm({
      title: '确认交班',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <p>您确定要结束当前班次吗？</p>
          {summary?.pendingRefundCount > 0 && (
            <Alert
              message={`还有 ${summary.pendingRefundCount} 笔退款审核未完成，请及时处理`}
              type="warning"
              showIcon
            />
          )}
          <Descriptions size="small" column={1} style={{ marginTop: 12 }}>
            <Descriptions.Item label="班次号">{currentShift.shift_no}</Descriptions.Item>
            <Descriptions.Item label="收银员">{currentShift.cashier}</Descriptions.Item>
            <Descriptions.Item label="开始时间">{dayjs(currentShift.start_time).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="当前时间">{dayjs().format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          </Descriptions>
        </Space>
      ),
      okText: '确认交班',
      cancelText: '取消',
      onOk: async () => {
        try {
          await window.api.shift.close(currentShift.id)
          message.success('交班成功！')
          const newShift = await window.api.shift.start(currentShift.cashier)
          setCurrentShift(newShift)
          setShowEndShiftModal(false)
          loadData()
        } catch (e) {
          console.error(e)
          message.error('交班失败')
        }
      }
    })
  }

  const startNewShift = async () => {
    try {
      const shift = await window.api.shift.start('收银员001')
      setCurrentShift(shift)
      message.success('新班次已开始')
      loadData()
    } catch (e) {
      console.error(e)
      message.error('启动班次失败')
    }
  }

  const summaryCards = summary ? [
    {
      title: '现金收款',
      icon: <PayCircleOutlined />,
      value: summary.cashAmount,
      prefix: '¥',
      color: '#52c41a',
      bg: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)',
      border: '#b7eb8f',
      count: 0
    },
    {
      title: '移动支付',
      icon: <MobileOutlined />,
      value: summary.mobileAmount,
      prefix: '¥',
      color: '#1677ff',
      bg: 'linear-gradient(135deg, #e6f7ff 0%, #fff 100%)',
      border: '#91d5ff',
      count: 0
    },
    {
      title: '销售总额',
      icon: <RiseOutlined />,
      value: summary.totalSales,
      prefix: '¥',
      color: '#722ed1',
      bg: 'linear-gradient(135deg, #f9f0ff 0%, #fff 100%)',
      border: '#d3adf7',
      count: summary.orderCount
    },
    {
      title: '订单数',
      icon: <ShoppingCartOutlined />,
      value: summary.orderCount,
      suffix: '笔',
      color: '#13c2c2',
      bg: 'linear-gradient(135deg, #e6fffb 0%, #fff 100%)',
      border: '#87e8de',
      count: 0
    }
  ] : []

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        size="small"
        styles={{ body: { padding: 16 } }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
            <Button icon={<PrinterOutlined />}>打印报表</Button>
            {currentShift ? (
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleEndShift}
              >
                交班
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={startNewShift}
              >
                开始班次
              </Button>
            )}
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={6}>
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              color: '#fff'
            }}>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>当前班次</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {currentShift?.shift_no || '无'}
              </div>
              <Space size="small">
                <UserOutlined />
                <span>{currentShift?.cashier}</span>
              </Space>
            </div>
          </Col>
          <Col span={18}>
            <Row gutter={16}>
              {summaryCards.map((card, idx) => (
                <Col span={6} key={idx}>
                  <div style={{
                    padding: '16px 20px',
                    background: card.bg,
                    borderRadius: 8,
                    border: `1px solid ${card.border}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#666' }}>{card.title}</span>
                      <span style={{ color: card.color, fontSize: 18 }}>{card.icon}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>
                      {card.prefix}{card.value}{card.suffix}
                    </div>
                    {card.count > 0 && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        共 {card.count} 笔订单
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            size="small"
            title={<Space><AlertOutlined />异常订单</Space>}
            extra={
              <Button
                type="link"
                onClick={() => setShowAbnormalOrders(true)}
                disabled={!summary?.abnormalCount}
              >
                查看全部
              </Button>
            }
            styles={{ body: { padding: summary?.abnormalCount > 0 ? 0 : undefined } }}
          >
            {!summary?.abnormalCount ? (
              <Empty description="暂无异常订单" style={{ padding: 40 }} />
            ) : (
              <div style={{ padding: 16 }}>
                <Alert
                  type="error"
                  showIcon
                  message={`检测到 ${summary.abnormalCount} 笔异常订单`}
                  description="这些订单已作废或存在异常，请在下方列表中查看详情"
                  style={{ marginBottom: 16 }}
                />
                <List
                  size="small"
                  dataSource={summary.voidOrders?.slice(0, 5)}
                  renderItem={(order: any) => (
                    <List.Item
                      actions={[
                        <Tag color="red">已作废</Tag>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="blue">{order.order_no}</Tag>
                            <span style={{ fontSize: 12, color: '#999' }}>
                              {dayjs(order.created_at).format('YYYY-MM-DD HH:mm')}
                            </span>
                          </Space>
                        }
                        description={
                          <Space>
                            <span>应收: ¥{order.payable_amount?.toFixed(2)}</span>
                            <span>支付: {
                              order.payment_method === 'cash' ? '现金' :
                              order.payment_method === 'wechat' ? '微信' :
                              order.payment_method === 'alipay' ? '支付宝' : order.payment_method
                            }</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            size="small"
            title={
              <Space>
                <ClockCircleOutlined style={{ color: summary?.pendingRefundCount > 0 ? '#faad14' : undefined }} />
                待退款审核
                {summary?.pendingRefundCount > 0 && (
                  <Tag color="orange" style={{ animation: 'pulse 2s infinite' }}>
                    {summary.pendingRefundCount} 笔待处理
                  </Tag>
                )}
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() => setShowPendingRefunds(true)}
                disabled={!summary?.pendingRefundCount}
              >
                去审核
              </Button>
            }
            styles={{ body: { padding: summary?.pendingRefundCount > 0 ? 0 : undefined } }}
          >
            {!summary?.pendingRefundCount ? (
              <Empty description="暂无待审核的退款" style={{ padding: 40 }} />
            ) : (
              <div style={{ padding: 16 }}>
                <Alert
                  type="warning"
                  showIcon
                  message={
                    <Space>
                      <WarningOutlined />
                      <span>
                        有 <strong style={{ color: '#faad14' }}>{summary.pendingRefundCount}</strong> 笔退款申请等待审核
                      </span>
                    </Space>
                  }
                  description="请及时处理，避免影响顾客体验和交班结算"
                  style={{ marginBottom: 16 }}
                />
                <List
                  size="small"
                  dataSource={summary.pendingReturns?.slice(0, 5)}
                  renderItem={(ret: any) => (
                    <List.Item
                      actions={[
                        <Tag color={ret.type === 'return' ? 'red' : 'orange'}>
                          {ret.type === 'return' ? '退货' : '换货'}
                        </Tag>,
                        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{ret.amount?.toFixed(2)}</span>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="blue">{ret.return_no}</Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              订单: {ret.order_no}
                            </Text>
                          </Space>
                        }
                        description={
                          <Space size="small">
                            <ClockCircleOutlined style={{ color: '#999' }} />
                            <span style={{ fontSize: 12, color: '#999' }}>
                              {dayjs(ret.created_at).format('YYYY-MM-DD HH:mm')}
                            </span>
                            <span style={{ fontSize: 12, color: '#666' }}>|</span>
                            <span style={{ fontSize: 12, color: '#666' }}>{ret.reason}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card size="small" title={<Space><FileTextOutlined />交班汇总明细</Space>}>
        <Row gutter={16}>
          <Col span={16}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="交班日期">{dayjs().format('YYYY年MM月DD日 dddd')}</Descriptions.Item>
              <Descriptions.Item label="交班时间">{dayjs().format('HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="收银员">
                <Space><UserOutlined />{currentShift?.cashier || '未开始'}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="班次号">
                <Tag color="blue">{currentShift?.shift_no || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="工作时长">
                {currentShift ? (
                  <span>
                    {dayjs(currentShift.start_time).format('HH:mm')} - 至今
                    （{dayjs().diff(dayjs(currentShift.start_time), 'hour')}小时
                    {dayjs().diff(dayjs(currentShift.start_time), 'minute') % 60}分钟）
                  </span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="订单总数">
                <Text strong style={{ color: '#1677ff' }}>{summary?.orderCount || 0}</Text> 笔
              </Descriptions.Item>
            </Descriptions>

            <Divider plain>收款明细</Divider>

            <Table
              size="small"
              pagination={false}
              rowKey="key"
              columns={[
                { title: '项目', dataIndex: 'name', width: 180 },
                { title: '笔数', dataIndex: 'count', width: 100, align: 'right' },
                { title: '金额（元）', dataIndex: 'amount', width: 150, align: 'right',
                  render: (v) => <span style={{ fontWeight: 600 }}>¥{v}</span>
                },
                { title: '占比', dataIndex: 'percent',
                  render: (v, record: any) => (
                    <Progress
                      percent={v}
                      size="small"
                      status={record.key === 'abnormal' ? 'exception' : 'active'}
                      showInfo={false}
                      style={{ maxWidth: 200 }}
                    />
                  )
                },
                { title: '备注', dataIndex: 'remark' }
              ]}
              dataSource={[
                {
                  key: 'cash',
                  name: <Space><PayCircleOutlined style={{ color: '#52c41a' }} />现金收款</Space>,
                  count: Math.floor(parseFloat(summary?.cashAmount || '0') / 50) || 0,
                  amount: parseFloat(summary?.cashAmount || '0').toFixed(2),
                  percent: summary && parseFloat(summary.totalSales) > 0
                    ? Math.round(parseFloat(summary.cashAmount) / parseFloat(summary.totalSales) * 100)
                    : 0,
                  remark: '实收现金，下班需清点'
                },
                {
                  key: 'mobile',
                  name: <Space><MobileOutlined style={{ color: '#1677ff' }} />移动支付</Space>,
                  count: Math.floor(parseFloat(summary?.mobileAmount || '0') / 80) || 0,
                  amount: parseFloat(summary?.mobileAmount || '0').toFixed(2),
                  percent: summary && parseFloat(summary.totalSales) > 0
                    ? Math.round(parseFloat(summary.mobileAmount) / parseFloat(summary.totalSales) * 100)
                    : 0,
                  remark: '微信+支付宝，自动入账'
                },
                {
                  key: 'total',
                  name: <Space strong><CheckCircleOutlined />合计</Space>,
                  count: summary?.orderCount || 0,
                  amount: parseFloat(summary?.totalSales || '0').toFixed(2),
                  percent: 100,
                  remark: ''
                },
                {
                  key: 'abnormal',
                  name: <Space><AlertOutlined style={{ color: '#ff4d4f' }} />异常/作废订单</Space>,
                  count: summary?.abnormalCount || 0,
                  amount: '0.00',
                  percent: 0,
                  remark: <Tag color="red">需核查处理</Tag>
                },
                {
                  key: 'pending',
                  name: <Space><ClockCircleOutlined style={{ color: '#faad14' }} />待审核退款</Space>,
                  count: summary?.pendingRefundCount || 0,
                  amount: summary?.pendingReturns?.reduce((s: number, r: any) => s + r.amount, 0).toFixed(2) || '0.00',
                  percent: 0,
                  remark: summary?.pendingRefundCount > 0
                    ? <Tag color="orange">交班后务必处理</Tag>
                    : '暂无'
                }
              ]}
            />
          </Col>

          <Col span={8}>
            <div style={{
              padding: 20,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              color: '#fff',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>今日销售总额</div>
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
                ¥{summary?.totalSales || '0.00'}
              </div>
              <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>订单数</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{summary?.orderCount || 0} 笔</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>客单价</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ¥{summary?.orderCount ? (parseFloat(summary.totalSales) / summary.orderCount).toFixed(2) : '0.00'}
                  </div>
                </Col>
              </Row>
            </div>

            <Card size="small" title={<Space><InfoCircleOutlined />交班须知</Space>}>
              <Timeline
                size="small"
                items={[
                  {
                    color: 'green',
                    dot: <CheckCircleOutlined />,
                    children: '核对现金与系统金额一致'
                  },
                  {
                    color: summary?.pendingRefundCount > 0 ? 'red' : 'green',
                    dot: summary?.pendingRefundCount > 0 ? <WarningOutlined /> : <CheckCircleOutlined />,
                    children: `处理所有退款审核 ${summary?.pendingRefundCount > 0 ? `（剩${summary.pendingRefundCount}笔）` : ''}`
                  },
                  {
                    color: summary?.abnormalCount > 0 ? 'orange' : 'green',
                    dot: summary?.abnormalCount > 0 ? <InfoCircleOutlined /> : <CheckCircleOutlined />,
                    children: `核查异常订单 ${summary?.abnormalCount > 0 ? `（共${summary.abnormalCount}笔）` : ''}`
                  },
                  {
                    color: 'blue',
                    children: '打印交班小票并签字确认'
                  },
                  {
                    color: 'purple',
                    children: '与下一班收银员交接签字'
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title={<Space><AlertOutlined />异常订单列表</Space>}
        open={showAbnormalOrders}
        onCancel={() => setShowAbnormalOrders(false)}
        footer={[
          <Button key="close" onClick={() => setShowAbnormalOrders(false)}>关闭</Button>
        ]}
        width={900}
      >
        {!summary?.voidOrders?.length ? (
          <Empty description="暂无异常订单" style={{ padding: 40 }} />
        ) : (
          <Table
            size="small"
            dataSource={summary.voidOrders}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              { title: '订单号', dataIndex: 'order_no', width: 160,
                render: (v) => <Tag color="blue" style={{ fontFamily: 'monospace' }}>{v}</Tag>
              },
              { title: '时间', dataIndex: 'created_at', width: 160,
                render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
              },
              { title: '收银员', dataIndex: 'cashier', width: 100 },
              {
                title: '支付方式', dataIndex: 'payment_method', width: 100,
                render: (v) => (
                  <Tag>
                    {v === 'cash' ? '现金' : v === 'wechat' ? '微信' : v === 'alipay' ? '支付宝' : v}
                  </Tag>
                )
              },
              {
                title: '应收金额', dataIndex: 'payable_amount', width: 100, align: 'right',
                render: (v) => <span style={{ fontWeight: 600 }}>¥{v?.toFixed(2)}</span>
              },
              {
                title: '实收金额', dataIndex: 'paid_amount', width: 100, align: 'right',
                render: (v) => <span>¥{v?.toFixed(2)}</span>
              },
              {
                title: '状态', dataIndex: 'is_void', width: 100, align: 'center',
                render: (v) => <Tag color="red" icon={<AlertOutlined />}>已作废</Tag>
              }
            ]}
          />
        )}
      </Modal>

      <Modal
        title={<Space><ClockCircleOutlined />待退款审核列表</Space>}
        open={showPendingRefunds}
        onCancel={() => setShowPendingRefunds(false)}
        footer={[
          <Button key="close" onClick={() => setShowPendingRefunds(false)}>关闭</Button>
        ]}
        width={900}
      >
        {!summary?.pendingReturns?.length ? (
          <Empty description="暂无待审核的退款" style={{ padding: 40 }} />
        ) : (
          <Table
            size="small"
            dataSource={summary.pendingReturns}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              { title: '退换单号', dataIndex: 'return_no', width: 140,
                render: (v) => <Tag color="blue" style={{ fontFamily: 'monospace' }}>{v}</Tag>
              },
              { title: '关联订单', dataIndex: 'order_no', width: 160 },
              {
                title: '类型', dataIndex: 'type', width: 80, align: 'center',
                render: (v) => <Tag color={v === 'return' ? 'red' : 'orange'}>
                  {v === 'return' ? '退货' : '换货'}
                </Tag>
              },
              {
                title: '退款金额', dataIndex: 'amount', width: 100, align: 'right',
                render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 700 }}>¥{v?.toFixed(2)}</span>
              },
              { title: '原因', dataIndex: 'reason' },
              { title: '申请人', dataIndex: 'cashier', width: 100 },
              {
                title: '申请时间', dataIndex: 'created_at', width: 160,
                render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
              }
            ]}
          />
        )}
      </Modal>
    </Space>
  )
}

export default ShiftSummary
