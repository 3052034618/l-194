import { useState, useEffect } from 'react'
import {
  Card, Tabs, Table, Tag, Space, Typography, Descriptions,
  Row, Col, Form, Input, Button, Modal, App, Empty, InputNumber, Select,
  Divider, List, Steps, Timeline, Radio, message as AntMessage
} from 'antd'
import {
  SearchOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RetweetOutlined,
  PrinterOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  PayCircleOutlined,
  UserOutlined,
  ScanOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { Step } = Steps
const { TextArea } = Input

function Returns() {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState('process')
  const [orderNo, setOrderNo] = useState('')
  const [orderData, setOrderData] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return')
  const [returnReason, setReturnReason] = useState('')
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [pendingReturns, setPendingReturns] = useState<any[]>([])
  const [allReturns, setAllReturns] = useState<any[]>([])
  const [showReviewModal, setShowReviewModal] = useState<any>(null)
  const [showPrintModal, setShowPrintModal] = useState<any>(null)
  const [reviewForm] = Form.useForm()

  useEffect(() => {
    loadReturns()
  }, [])

  const loadReturns = async () => {
    try {
      const [pending, all] = await Promise.all([
        window.api.return.list('pending'),
        window.api.return.list()
      ])
      setPendingReturns(pending)
      setAllReturns(all)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSearchOrder = async () => {
    if (!orderNo.trim()) {
      message.warning('请输入小票号')
      return
    }
    try {
      const data = await window.api.order.byNo(orderNo.trim())
      if (!data) {
        message.error('未找到该小票号的订单')
        setOrderData(null)
        return
      }
      if (data.order.is_void) {
        message.warning('该订单已作废')
      }
      setOrderData(data)
      setSelectedItems(data.items.map((item: any) => ({ ...item, returnQty: 0 })))
      message.success('订单查询成功')
    } catch (e) {
      console.error(e)
      message.error('查询失败')
    }
  }

  const toggleSelectItem = (item: any, checked: boolean) => {
    const newItems = selectedItems.map((si: any) => {
      if (si.id === item.id) {
        return checked ? { ...si, returnQty: item.quantity } : { ...si, returnQty: 0 }
      }
      return si
    })
    setSelectedItems(newItems)
  }

  const updateReturnQty = (itemId: number, qty: number) => {
    const newItems = selectedItems.map((si: any) => {
      if (si.id === itemId) {
        return { ...si, returnQty: Math.max(0, Math.min(qty, si.quantity)) }
      }
      return si
    })
    setSelectedItems(newItems)
  }

  const calculateReturnAmount = () => {
    return selectedItems
      .filter((i: any) => i.returnQty > 0)
      .reduce((sum: number, i: any) => sum + (i.price * i.returnQty * (i.discount / 100)), 0)
  }

  const handleSubmitReturn = async () => {
    const returnItemsList = selectedItems.filter((i: any) => i.returnQty > 0)
    if (returnItemsList.length === 0) {
      message.warning('请选择要退换的商品')
      return
    }
    if (!returnReason.trim()) {
      message.warning('请填写退换货原因')
      return
    }

    try {
      const returnItemsData = returnItemsList.map((item: any) => ({
        orderItemId: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.returnQty,
        price: item.price,
        subtotal: item.price * item.returnQty * (item.discount / 100)
      }))

      const result = await window.api.return.create({
        orderId: orderData.order.id,
        orderNo: orderData.order.order_no,
        type: returnType,
        status: 'pending',
        amount: calculateReturnAmount(),
        reason: returnReason,
        items: returnItemsData,
        shiftId: orderData.order.shift_id
      })

      AntMessage.success(`${returnType === 'return' ? '退货' : '换货'}申请已提交，单号：${result.returnNo}`)
      setReturnItems([...returnItems, { ...result, items: returnItemsData, order: orderData }])
      resetForm()
      loadReturns()
    } catch (e: any) {
      console.error(e)
      message.error('提交失败：' + (e?.message || '未知错误'))
    }
  }

  const resetForm = () => {
    setOrderNo('')
    setOrderData(null)
    setSelectedItems([])
    setReturnType('return')
    setReturnReason('')
  }

  const handleReview = async (values: any) => {
    if (!showReviewModal) return
    try {
      await window.api.return.review(
        showReviewModal.id,
        values.status,
        values.reviewer || '主管001'
      )
      message.success(`审核${values.status === 'approved' ? '通过' : '拒绝'}成功`)
      setShowReviewModal(null)
      reviewForm.resetFields()
      loadReturns()
    } catch (e) {
      console.error(e)
      message.error('审核失败')
    }
  }

  const orderColumns = [
    {
      title: '商品名称',
      dataIndex: 'product_name',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.product_name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>条码: {record.barcode || '-'}</div>
        </div>
      )
    },
    { title: '单价', dataIndex: 'price', width: 90, align: 'right',
      render: (v) => `¥${v?.toFixed(2)}`
    },
    { title: '原数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '折扣', dataIndex: 'discount', width: 80, align: 'center',
      render: (v) => v === 100 ? '无' : `${v}%`
    },
    { title: '小计', dataIndex: 'subtotal', width: 100, align: 'right',
      render: (v) => <span style={{ fontWeight: 600 }}>¥{v?.toFixed(2)}</span>
    },
    {
      title: '选择', width: 70, align: 'center',
      render: (_, record) => {
        const selected = selectedItems.find((s: any) => s.id === record.id)
        return (
          <input
            type="checkbox"
            checked={selected?.returnQty > 0}
            onChange={(e) => toggleSelectItem(record, e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
        )
      }
    },
    {
      title: '退/换数量', width: 140, align: 'center',
      render: (_, record) => {
        const selected = selectedItems.find((s: any) => s.id === record.id)
        return (
          <InputNumber
            size="small"
            min={0}
            max={record.quantity}
            value={selected?.returnQty || 0}
            onChange={(v) => updateReturnQty(record.id, v || 0)}
            disabled={!selected?.returnQty}
            style={{ width: 100 }}
          />
        )
      }
    }
  ]

  const returnColumns = [
    {
      title: '退换单号', dataIndex: 'return_no', width: 130,
      render: (v) => <Tag color="blue" style={{ fontFamily: 'monospace' }}>{v}</Tag>
    },
    {
      title: '关联订单', dataIndex: 'order_no', width: 160,
      render: (v) => <Text copyable style={{ fontFamily: 'monospace' }}>{v}</Text>
    },
    {
      title: '类型', dataIndex: 'type', width: 80, align: 'center',
      render: (v) => (
        <Tag color={v === 'return' ? 'red' : 'orange'} icon={v === 'return' ? <ArrowLeftOutlined /> : <RetweetOutlined />}>
          {v === 'return' ? '退货' : '换货'}
        </Tag>
      )
    },
    {
      title: '状态', dataIndex: 'status', width: 100, align: 'center',
      render: (v) => {
        const map: any = {
          'pending': { color: 'orange', icon: <ClockCircleOutlined />, text: '待审核' },
          'approved': { color: 'green', icon: <CheckCircleOutlined />, text: '已通过' },
          'rejected': { color: 'red', icon: <CloseCircleOutlined />, text: '已拒绝' }
        }
        const cfg = map[v] || { color: 'default', text: v }
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.text}</Tag>
      }
    },
    {
      title: '金额', dataIndex: 'amount', width: 100, align: 'right',
      render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{v?.toFixed(2)}</span>
    },
    { title: '原因', dataIndex: 'reason' },
    {
      title: '收银员', dataIndex: 'cashier', width: 100,
      render: (v) => <span><UserOutlined /> {v}</span>
    },
    {
      title: '创建时间', dataIndex: 'created_at', width: 160,
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作', width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => setShowReviewModal(record)}
            >
              审核
            </Button>
          )}
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => setShowPrintModal(record)}
          >
            重打小票
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        size="small"
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #fff1f0 0%, #fff 100%)',
              borderRadius: 8,
              border: '1px solid #ffa39e'
            }}>
              <Space>
                <ClockCircleOutlined style={{ fontSize: 20, color: '#faad14' }} />
                <div>
                  <div style={{ fontSize: 12, color: '#999' }}>待审核退款</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#faad14' }}>{pendingReturns.length} 笔</div>
                </div>
              </Space>
            </div>
          </Col>
          <Col span={6}>
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #fff7e6 0%, #fff 100%)',
              borderRadius: 8,
              border: '1px solid #ffd591'
            }}>
              <Space>
                <ArrowLeftOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                <div>
                  <div style={{ fontSize: 12, color: '#999' }}>今日退货</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fa8c16' }}>
                    {allReturns.filter((r: any) => r.type === 'return' && dayjs(r.created_at).isSame(dayjs(), 'day')).length} 笔
                  </div>
                </div>
              </Space>
            </div>
          </Col>
          <Col span={6}>
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #e6f7ff 0%, #fff 100%)',
              borderRadius: 8,
              border: '1px solid #91d5ff'
            }}>
              <Space>
                <RetweetOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <div>
                  <div style={{ fontSize: 12, color: '#999' }}>今日换货</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>
                    {allReturns.filter((r: any) => r.type === 'exchange' && dayjs(r.created_at).isSame(dayjs(), 'day')).length} 笔
                  </div>
                </div>
              </Space>
            </div>
          </Col>
          <Col span={6}>
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)',
              borderRadius: 8,
              border: '1px solid #b7eb8f'
            }}>
              <Space>
                <PayCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                <div>
                  <div style={{ fontSize: 12, color: '#999' }}>待退款金额</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}>
                    ¥{pendingReturns.reduce((s: number, r: any) => s + r.amount, 0).toFixed(2)}
                  </div>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{ padding: '0 16px', borderBottom: '1px solid #f0f0f0', margin: 0 }}
          items={[
            {
              key: 'process',
              label: <Space><SwapOutlined />发起退换货</Space>,
              children: (
                <div style={{ padding: 16 }}>
                  <Card 
                    size="small" 
                    style={{ marginBottom: 16 }}
                    title={<Space><SearchOutlined />查询订单</Space>}
                  >
                    <Space.Compact style={{ width: '100%', maxWidth: 600 }}>
                      <Input
                        size="large"
                        prefix={<FileTextOutlined />}
                        placeholder="请输入小票号（订单号）"
                        value={orderNo}
                        onChange={(e) => setOrderNo(e.target.value)}
                        onPressEnter={handleSearchOrder}
                      />
                      <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearchOrder}>
                        查询
                      </Button>
                    </Space.Compact>
                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary" style={{ marginRight: 8, fontSize: 12 }}>提示：可直接扫描小票上的条码</Text>
                      <Button size="small" icon={<ScanOutlined />} onClick={() => {
                        setOrderNo('X' + dayjs().format('YYYYMMDDHHmmss'))
                        message.info('请在实际使用时扫描真实小票条码')
                      }}>
                        生成测试单号
                      </Button>
                    </div>
                  </Card>

                  {orderData && (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      <Card size="small" title={<Space><ShoppingOutlined />订单信息</Space>}>
                        <Descriptions column={4} size="small" bordered>
                          <Descriptions.Item label="小票号">
                            <Text copyable style={{ fontFamily: 'monospace' }} strong>{orderData.order.order_no}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="下单时间">
                            {dayjs(orderData.order.created_at).format('YYYY-MM-DD HH:mm:ss')}
                          </Descriptions.Item>
                          <Descriptions.Item label="收银员">{orderData.order.cashier}</Descriptions.Item>
                          <Descriptions.Item label="支付方式">
                            <Tag>
                              {orderData.order.payment_method === 'cash' ? '现金' :
                               orderData.order.payment_method === 'wechat' ? '微信' :
                               orderData.order.payment_method === 'alipay' ? '支付宝' : orderData.order.payment_method}
                            </Tag>
                          </Descriptions.Item>
                          {orderData.member && (
                            <Descriptions.Item label="会员" span={2}>
                              <Tag color="blue">{orderData.member.name} ({orderData.member.phone})</Tag>
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label="商品总额">¥{orderData.order.total_amount?.toFixed(2)}</Descriptions.Item>
                          <Descriptions.Item label="实付金额">
                            <span style={{ color: '#52c41a', fontWeight: 600 }}>
                              ¥{orderData.order.paid_amount?.toFixed(2)}
                            </span>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>

                      <Card size="small" title={<Space><FileTextOutlined />商品明细（请选择要退换的商品）</Space>}>
                        <Table
                          size="small"
                          dataSource={selectedItems}
                          columns={orderColumns}
                          rowKey="id"
                          pagination={false}
                        />
                        {selectedItems.some((i: any) => i.returnQty > 0) && (
                          <div style={{
                            marginTop: 12,
                            padding: 12,
                            background: '#fff7e6',
                            borderRadius: 6,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Space>
                              <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />
                              <span>
                                已选择 {selectedItems.filter((i: any) => i.returnQty > 0).length} 种商品，
                                共 {selectedItems.reduce((s: number, i: any) => s + i.returnQty, 0)} 件
                              </span>
                            </Space>
                            <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                              预计{returnType === 'return' ? '退款' : '换货价值'}: ¥{calculateReturnAmount().toFixed(2)}
                            </Text>
                          </div>
                        )}
                      </Card>

                      <Card size="small" title={<Space><SwapOutlined />退换货信息</Space>}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <div style={{ marginBottom: 12 }}>
                              <Text strong style={{ display: 'block', marginBottom: 8 }}>类型</Text>
                              <Radio.Group
                                value={returnType}
                                onChange={(e) => setReturnType(e.target.value)}
                                style={{ width: '100%' }}
                              >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <Radio.Button value="return" style={{ width: '100%', height: 48, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                    <Space>
                                      <ArrowLeftOutlined style={{ color: '#ff4d4f' }} />
                                      <div>
                                        <div style={{ fontWeight: 600 }}>退货退款</div>
                                        <div style={{ fontSize: 12, color: '#999' }}>商品退回，款项退还</div>
                                      </div>
                                    </Space>
                                  </Radio.Button>
                                  <Radio.Button value="exchange" style={{ width: '100%', height: 48, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                    <Space>
                                      <RetweetOutlined style={{ color: '#fa8c16' }} />
                                      <div>
                                        <div style={{ fontWeight: 600 }}>换货</div>
                                        <div style={{ fontSize: 12, color: '#999' }}>商品更换，差价多退少补</div>
                                      </div>
                                    </Space>
                                  </Radio.Button>
                                </Space>
                              </Radio.Group>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: 12 }}>
                              <Text strong style={{ display: 'block', marginBottom: 8 }}>退换货原因</Text>
                              <TextArea
                                rows={4}
                                placeholder="请填写退换货原因，如：商品质量问题、顾客不喜欢、尺寸不合适等"
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                              />
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {['质量问题', '商品损坏', '与描述不符', '顾客不喜欢', '发错商品', '过期商品'].map(reason => (
                                <Button
                                  key={reason}
                                  size="small"
                                  onClick={() => setReturnReason(reason)}
                                >
                                  {reason}
                                </Button>
                              ))}
                            </div>
                          </Col>
                        </Row>
                        <Divider style={{ margin: '16px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size="large">
                            <div>
                              <Text type="secondary">预计{returnType === 'return' ? '退款金额' : '换货金额'}：</Text>
                              <Text strong style={{ fontSize: 24, color: '#ff4d4f', marginLeft: 8 }}>
                                ¥{calculateReturnAmount().toFixed(2)}
                              </Text>
                            </div>
                            {orderData.order.payment_method === 'cash' && returnType === 'return' && (
                              <Tag color="orange">
                                <InfoCircleOutlined /> 现金支付订单需手动退款
                              </Tag>
                            )}
                          </Space>
                          <Space>
                            <Button size="large" onClick={resetForm}>
                              取消
                            </Button>
                            <Button
                              type="primary"
                              size="large"
                              icon={returnType === 'return' ? <ArrowLeftOutlined /> : <RetweetOutlined />}
                              onClick={handleSubmitReturn}
                              disabled={calculateReturnAmount() <= 0}
                            >
                              提交{returnType === 'return' ? '退货' : '换货'}申请
                            </Button>
                          </Space>
                        </div>
                      </Card>
                    </Space>
                  )}
                </div>
              )
            },
            {
              key: 'pending',
              label: <Space><ClockCircleOutlined />待审核 ({pendingReturns.length})</Space>,
              children: (
                <div style={{ padding: 16 }}>
                  {pendingReturns.length === 0 ? (
                    <Empty description="暂无待审核的退换货申请" style={{ padding: 60 }} />
                  ) : (
                    <Table
                      size="small"
                      dataSource={pendingReturns}
                      columns={returnColumns}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  )}
                </div>
              )
            },
            {
              key: 'all',
              label: <Space><FileTextOutlined />全部记录</Space>,
              children: (
                <div style={{ padding: 16 }}>
                  {allReturns.length === 0 ? (
                    <Empty description="暂无退换货记录" style={{ padding: 60 }} />
                  ) : (
                    <Table
                      size="small"
                      dataSource={allReturns}
                      columns={returnColumns}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={<Space><ExclamationCircleOutlined style={{ color: '#faad14' }} />退换货审核</Space>}
        open={!!showReviewModal}
        onCancel={() => setShowReviewModal(null)}
        footer={null}
        width={650}
        destroyOnClose
      >
        {showReviewModal && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="退换单号">
                  <Tag color="blue">{showReviewModal.return_no}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="关联订单">{showReviewModal.order_no}</Descriptions.Item>
                <Descriptions.Item label="类型">
                  <Tag color={showReviewModal.type === 'return' ? 'red' : 'orange'}>
                    {showReviewModal.type === 'return' ? '退货退款' : '换货'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请金额">
                  <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 16 }}>
                    ¥{showReviewModal.amount?.toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="申请原因" span={2}>{showReviewModal.reason}</Descriptions.Item>
                <Descriptions.Item label="申请人">{showReviewModal.cashier}</Descriptions.Item>
                <Descriptions.Item label="申请时间">
                  {dayjs(showReviewModal.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Steps direction="vertical" size="small" current={1}>
              <Step title="提交申请" description={`${showReviewModal.cashier} 于 ${dayjs(showReviewModal.created_at).format('YYYY-MM-DD HH:mm')} 提交`} />
              <Step title="主管审核" description="请审核该申请的合理性" />
              <Step title="完成处理" />
            </Steps>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleReview}
              initialValues={{ status: 'approved', reviewer: '主管001' }}
            >
              <Form.Item label="审核结果" name="status" rules={[{ required: true }]}>
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio.Button value="approved" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>审核通过</div>
                          <div style={{ fontSize: 12, color: '#999' }}>同意退换货，{showReviewModal.type === 'return' ? '款项将原路退回' : '安排换货'}</div>
                        </div>
                      </Space>
                    </Radio.Button>
                    <Radio.Button value="rejected" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                      <Space>
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>拒绝申请</div>
                          <div style={{ fontSize: 12, color: '#999' }}>不符合退换货条件</div>
                        </div>
                      </Space>
                    </Radio.Button>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="审核人" name="reviewer">
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item>
                <Space style={{ width: '100%' }}>
                  <Button onClick={() => setShowReviewModal(null)} style={{ flex: 1 }} size="large">
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" style={{ flex: 1 }} size="large">
                    确认审核
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>

      <Modal
        title={<Space><PrinterOutlined />打印退换货小票</Space>}
        open={!!showPrintModal}
        onCancel={() => setShowPrintModal(null)}
        onOk={() => {
          message.success('小票打印成功')
          setShowPrintModal(null)
        }}
        okText="打印"
        width={400}
      >
        {showPrintModal && (
          <div style={{
            background: '#fff',
            border: '1px dashed #d9d9d9',
            padding: 20,
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.8
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>智慧零售超市</div>
              <div>退换货小票</div>
            </div>
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>退换单号：{showPrintModal.return_no}</span>
            </div>
            <div>关联订单：{showPrintModal.order_no}</div>
            <div>类型：{showPrintModal.type === 'return' ? '退货退款' : '换货'}</div>
            <div>状态：{
              showPrintModal.status === 'pending' ? '待审核' :
              showPrintModal.status === 'approved' ? '已通过' : '已拒绝'
            }</div>
            <div>收银员：{showPrintModal.cashier}</div>
            <div>时间：{dayjs(showPrintModal.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div>原因：{showPrintModal.reason}</div>
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
              <span>{showPrintModal.type === 'return' ? '退款金额' : '换货金额'}</span>
              <span>¥{showPrintModal.amount?.toFixed(2)}</span>
            </div>
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ textAlign: 'center' }}>
              <div>客服电话：400-123-4567</div>
              <div>谢谢惠顾！</div>
            </div>
          </div>
        )}
      </Modal>
    </Space>
  )
}

export default Returns
