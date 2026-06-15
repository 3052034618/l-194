import { useState, useRef, useEffect } from 'react'
import {
  Card, Input, Button, Table, InputNumber, Select, Modal, List, Tag, Divider, App, Space, Typography, message as AntMessage
} from 'antd'
import {
  ScanOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  GiftOutlined,
  SearchOutlined,
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
  MobileOutlined,
  PayCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { usePosStore, useAppStore } from '../store/posStore'
import MemberSelector from '../components/MemberSelector'

const { Title, Text } = Typography
const { Option } = Select

function Cashier() {
  const { message } = App.useApp()
  const {
    cart, currentMember, selectedCoupon, usePoints, pointsUsed,
    addItem, updateQuantity, updateDiscount, removeItem, clearCart,
    setMember, setSelectedCoupon, setUsePoints, restoreCart, getTotals
  } = usePosStore()
  const { currentShift } = useAppStore()
  
  const [barcodeInput, setBarcodeInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [suspendedOrders, setSuspendedOrders] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paidAmount, setPaidAmount] = useState(0)
  const [memberCoupons, setMemberCoupons] = useState<any[]>([])
  const [printModal, setPrintModal] = useState<any>(null)
  const barcodeInputRef = useRef<any>(null)

  const totals = getTotals()

  useEffect(() => {
    barcodeInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (currentMember) {
      loadCoupons()
    } else {
      setMemberCoupons([])
      setSelectedCoupon(null)
      setUsePoints(false, 0)
    }
  }, [currentMember])

  const loadCoupons = async () => {
    if (!currentMember) return
    try {
      const coupons = await window.api.member.coupons(currentMember.id)
      setMemberCoupons(coupons)
    } catch (e) {
      console.error(e)
    }
  }

  const handleBarcodeInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      await addProductByBarcode(barcodeInput.trim())
      setBarcodeInput('')
    }
  }

  const addProductByBarcode = async (barcode: string) => {
    try {
      const product = await window.api.product.byBarcode(barcode)
      if (product) {
        if (product.stock <= 0) {
          message.warning(`商品「${product.name}」库存不足`)
          return
        }
        addItem(product)
        message.success(`已添加：${product.name}`)
      } else {
        message.error('未找到该条码对应的商品')
      }
    } catch (e) {
      console.error(e)
      message.error('商品查询失败')
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }
    try {
      const results = await window.api.product.search(searchKeyword.trim())
      setSearchResults(results)
      setShowProductModal(true)
    } catch (e) {
      console.error(e)
    }
  }

  const addSearchProduct = (product: any) => {
    if (product.stock <= 0) {
      message.warning(`商品「${product.name}」库存不足`)
      return
    }
    addItem(product)
    message.success(`已添加：${product.name}`)
    setShowProductModal(false)
    setSearchKeyword('')
    setSearchResults([])
  }

  const handleSuspend = async () => {
    if (cart.length === 0) {
      message.warning('购物车为空，无法挂单')
      return
    }
    try {
      const suspendNo = await window.api.suspend.create({
        items: cart,
        memberId: currentMember?.id || null
      })
      message.success(`挂单成功，单号：${suspendNo}`)
      clearCart()
      setShowSuspendModal(false)
      loadSuspendedOrders()
    } catch (e) {
      console.error(e)
      message.error('挂单失败')
    }
  }

  const loadSuspendedOrders = async () => {
    try {
      const orders = await window.api.suspend.all()
      setSuspendedOrders(orders)
    } catch (e) {
      console.error(e)
    }
  }

  const handleResume = async (order: any) => {
    try {
      const items = JSON.parse(order.items)
      restoreCart(items, null)
      await window.api.suspend.delete(order.id)
      message.success(`已取单：${order.suspend_no}`)
      setShowSuspendModal(false)
      loadSuspendedOrders()
    } catch (e) {
      console.error(e)
      message.error('取单失败')
    }
  }

  const handlePay = () => {
    if (cart.length === 0) {
      message.warning('请先添加商品')
      return
    }
    setPaidAmount(totals.payableAmount)
    setPaymentMethod('')
    setShowPayModal(true)
  }

  const confirmPayment = async () => {
    if (!paymentMethod) {
      message.warning('请选择支付方式')
      return
    }
    if (paymentMethod === 'cash' && paidAmount < totals.payableAmount) {
      message.warning('实付金额不足')
      return
    }

    try {
      const orderNo = 'X' + dayjs().format('YYYYMMDDHHmmss')
      const change = paymentMethod === 'cash' ? paidAmount - totals.payableAmount : 0

      const result = await window.api.order.create({
        order: {
          orderNo,
          totalAmount: totals.totalAmount,
          discountAmount: totals.discountAmount,
          payableAmount: totals.payableAmount,
          paidAmount: paymentMethod === 'cash' ? paidAmount : totals.payableAmount,
          changeAmount: change,
          paymentMethod
        },
        items: cart,
        memberId: currentMember?.id || null,
        pointsUsed: usePoints ? pointsUsed : 0,
        couponUsed: totals.couponDeducted,
        couponId: selectedCoupon?.id || null,
        shiftId: currentShift?.shift_no
      })

      message.success(`收银成功，单号：${orderNo}`)
      setPrintModal({
        orderNo,
        items: cart,
        totals,
        paidAmount: paymentMethod === 'cash' ? paidAmount : totals.payableAmount,
        change,
        paymentMethod,
        member: currentMember,
        coupon: selectedCoupon,
        pointsUsed,
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })
      setShowPayModal(false)
      clearCart()
    } catch (e: any) {
      console.error(e)
      message.error('收银失败：' + (e?.message || '未知错误'))
    }
  }

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: any, __: any, index: number) => (
        <div>
          <div style={{ fontWeight: 500 }}>{cart[index]?.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{cart[index]?.barcode}</div>
        </div>
      )
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      align: 'right' as const,
      render: (_: any, __: any, index: number) => (
        <span>¥{cart[index]?.price?.toFixed(2)}</span>
      )
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 160,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Space.Compact>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(index, cart[index].quantity - 1)}
          />
          <InputNumber
            size="small"
            value={cart[index]?.quantity}
            onChange={(v) => updateQuantity(index, v || 1)}
            style={{ width: 50, textAlign: 'center' }}
            controls={false}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(index, cart[index].quantity + 1)}
          />
        </Space.Compact>
      )
    },
    {
      title: '折扣(%)',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Select
          size="small"
          value={cart[index]?.discount}
          onChange={(v) => updateDiscount(index, v)}
          style={{ width: 70 }}
        >
          <Option value={100}>无折扣</Option>
          <Option value={95}>95折</Option>
          <Option value={90}>9折</Option>
          <Option value={85}>85折</Option>
          <Option value={80}>8折</Option>
          <Option value={70}>7折</Option>
          <Option value={50}>5折</Option>
        </Select>
      )
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 100,
      align: 'right' as const,
      render: (_: any, __: any, index: number) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>
          ¥{cart[index]?.subtotal?.toFixed(2)}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
        />
      )
    }
  ]

  const quickBarcodes = [
    { code: '6901234567890', name: '矿泉水', price: 2 },
    { code: '6901234567891', name: '可乐', price: 3.5 },
    { code: '6901234567893', name: '方便面', price: 5.5 },
    { code: '6901234567896', name: '牛奶', price: 3.8 },
    { code: '6901234567903', name: '苹果', price: 9.9 },
    { code: '6901234567904', name: '香蕉', price: 5.5 },
  ]

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card size="small" styles={{ body: { padding: 16 } }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                ref={barcodeInputRef}
                size="large"
                prefix={<ScanOutlined style={{ color: '#1677ff' }} />}
                placeholder="扫描条码或手动输入条码后按回车..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeInput}
                style={{ flex: 1 }}
              />
              <Button
                size="large"
                type="primary"
                icon={<ScanOutlined />}
                onClick={() => addProductByBarcode(barcodeInput.trim())}
                style={{ width: 120 }}
              >
                添加
              </Button>
            </Space.Compact>

            <Space.Compact style={{ width: '100%' }}>
              <Input
                size="large"
                prefix={<SearchOutlined />}
                placeholder="搜索商品名称/分类..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearch}
                style={{ flex: 1 }}
              />
              <Button size="large" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
            </Space.Compact>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: 12, width: '100%' }}>
                快捷商品：
              </Text>
              {quickBarcodes.map(item => (
                <Button key={item.code} size="small" onClick={() => addProductByBarcode(item.code)}>
                  {item.name} ¥{item.price}
                </Button>
              ))}
            </div>
          </Space>
        </Card>

        <Card
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>购物车</span>
              <Tag color="blue">{cart.length} 件商品</Tag>
            </Space>
          }
          size="small"
          extra={
            <Space>
              <Button icon={<PauseCircleOutlined />} onClick={() => { loadSuspendedOrders(); setShowSuspendModal(true) }}>
                取单
              </Button>
              <Button icon={<UserOutlined />} onClick={() => setShowMemberModal(true)}>
                {currentMember ? `会员：${currentMember.name}` : '绑定会员'}
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={clearCart}>
                清空
              </Button>
              <Button danger icon={<PauseCircleOutlined />} onClick={handleSuspend}>
                挂单
              </Button>
            </Space>
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0 } }}
        >
          <Table
            size="small"
            dataSource={cart}
            columns={columns}
            pagination={false}
            rowKey={(record, index) => `row-${index}`}
            locale={{ emptyText: '购物车为空，请扫描或搜索商品' }}
            style={{ flex: 1 }}
            scroll={{ y: 'calc(100vh - 500px)' }}
          />
        </Card>
      </div>

      <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {currentMember && (
          <Card size="small" title={<Space><UserOutlined />会员信息</Space>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">姓名</Text>
              <Text strong>{currentMember.name}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">手机号</Text>
              <Text>{currentMember.phone}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">等级</Text>
              <Tag color="gold">{currentMember.level}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">可用积分</Text>
              <Text strong style={{ color: '#faad14' }}>{currentMember.points} 分</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">累计消费</Text>
              <Text>¥{currentMember.total_spent?.toFixed(2)}</Text>
            </div>
          </Card>
        )}

        {currentMember && memberCoupons.length > 0 && (
          <Card size="small" title={<Space><GiftOutlined />优惠券</Space>}>
            <List
              size="small"
              dataSource={memberCoupons}
              renderItem={(coupon) => (
                <List.Item
                  style={{
                    padding: '8px 8px',
                    border: selectedCoupon?.id === coupon.id ? '1px solid #1677ff' : '1px solid #f0f0f0',
                    borderRadius: 4,
                    marginBottom: 6,
                    background: selectedCoupon?.id === coupon.id ? '#e6f4ff' : '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const subtotal = cart.reduce((s, i) => s + i.subtotal, 0)
                    if (subtotal < coupon.min_amount) {
                      message.warning(`需满¥${coupon.min_amount?.toFixed(2)}才能使用`)
                      return
                    }
                    setSelectedCoupon(selectedCoupon?.id === coupon.id ? null : coupon)
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ color: coupon.type === 'fixed' ? '#ff4d4f' : '#fa8c16' }}>
                        {coupon.type === 'fixed' ? `¥${coupon.value}` : `${coupon.value}% OFF`}
                      </Text>
                      <Text>{coupon.name}</Text>
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {coupon.min_amount > 0 ? `满¥${coupon.min_amount?.toFixed(2)}可用` : '无门槛'}
                      <span style={{ marginLeft: 8 }}>券号:{coupon.code}</span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}

        {currentMember && currentMember.points > 0 && (
          <Card size="small" title={<Space><WalletOutlined />积分抵扣</Space>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span>使用积分抵扣（100积分=¥1）</span>
              </label>
            </div>
            {usePoints && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Text type="secondary">使用</Text>
                <InputNumber
                  min={100}
                  max={Math.min(currentMember.points, Math.floor(totals.totalAmount * 100))}
                  step={100}
                  value={pointsUsed}
                  onChange={(v) => setUsePoints(true, v || 0)}
                  style={{ flex: 1 }}
                />
                <Text type="secondary">积分</Text>
                <Tag color="green">抵¥{(pointsUsed / 100)?.toFixed(2)}</Tag>
              </div>
            )}
          </Card>
        )}

        <Card
          size="small"
          style={{ flex: 1 }}
          styles={{ body: { display: 'flex', flexDirection: 'column', padding: 16 } }}
        >
          <Title level={5} style={{ marginTop: 0, marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            <ShoppingCartOutlined /> 收银汇总
          </Title>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">商品件数</Text>
                <Text>{cart.reduce((s, i) => s + i.quantity, 0)} 件</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">商品总额</Text>
                <Text>¥{totals.totalAmount?.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                <Text type="secondary" style={{ color: '#52c41a' }}>优惠减免</Text>
                <Text>-¥{totals.discountAmount?.toFixed(2)}</Text>
              </div>
              {totals.couponDeducted > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <Text type="secondary">优惠券抵扣</Text>
                  <Text style={{ color: '#1677ff' }}>-¥{totals.couponDeducted?.toFixed(2)}</Text>
                </div>
              )}
              {totals.pointsDeducted > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <Text type="secondary">积分抵扣</Text>
                  <Text style={{ color: '#faad14' }}>-¥{totals.pointsDeducted?.toFixed(2)}</Text>
                </div>
              )}
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              borderRadius: 8,
              padding: '20px 16px',
              color: '#fff',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>应收金额</Text>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>
                  ¥{totals.payableAmount?.toFixed(2)}
                </Text>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handlePay}
              disabled={cart.length === 0}
              style={{ height: 50, fontSize: 16, fontWeight: 600 }}
            >
              立即结算
            </Button>
          </div>
        </Card>
      </div>

      <MemberSelector
        open={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSelect={(member) => {
          setMember(member)
          setShowMemberModal(false)
          message.success(`已绑定会员：${member.name}`)
        }}
        onClear={() => {
          setMember(null)
          setShowMemberModal(false)
        }}
        currentMember={currentMember}
      />

      <Modal
        title={<Space><PauseCircleOutlined />取单列表</Space>}
        open={showSuspendModal}
        onCancel={() => setShowSuspendModal(false)}
        footer={null}
        width={600}
      >
        {suspendedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无挂单
          </div>
        ) : (
          <List
            dataSource={suspendedOrders}
            renderItem={(order) => {
              const items = JSON.parse(order.items)
              return (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={() => handleResume(order)}>取单</Button>,
                    <Button danger onClick={async () => {
                      await window.api.suspend.delete(order.id)
                      loadSuspendedOrders()
                      message.success('已删除挂单')
                    }}>删除</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="blue">{order.suspend_no}</Tag>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {dayjs(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
                        </span>
                      </Space>
                    }
                    description={
                      <div>
                        <div>共 {items.length} 种商品，{items.reduce((s: number, i: any) => s + i.quantity, 0)} 件</div>
                        <div style={{ marginTop: 4 }}>
                          {items.slice(0, 3).map((i: any, idx: number) => (
                            <Tag key={idx} style={{ marginRight: 4 }}>{i.name} x{i.quantity}</Tag>
                          ))}
                          {items.length > 3 && <Tag>...等{items.length}种</Tag>}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Modal>

      <Modal
        title={<Space><CreditCardOutlined />结算收银</Space>}
        open={showPayModal}
        onCancel={() => setShowPayModal(false)}
        onOk={confirmPayment}
        okText="确认收款"
        cancelText="取消"
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{
            background: '#f6ffed',
            padding: 20,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <Text type="secondary">应收金额</Text>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a', marginTop: 4 }}>
              ¥{totals.payableAmount?.toFixed(2)}
            </div>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text strong style={{ marginBottom: 8, display: 'block' }}>支付方式</Text>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                size="large"
                icon={<PayCircleOutlined />}
                onClick={() => setPaymentMethod('cash')}
                style={{
                  flex: 1,
                  height: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  border: paymentMethod === 'cash' ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: paymentMethod === 'cash' ? '#e6f4ff' : '#fff'
                }}
              >
                现金
              </Button>
              <Button
                size="large"
                icon={<MobileOutlined />}
                onClick={() => { setPaymentMethod('wechat'); setPaidAmount(totals.payableAmount) }}
                style={{
                  flex: 1,
                  height: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  border: paymentMethod === 'wechat' ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: paymentMethod === 'wechat' ? '#e6f4ff' : '#fff'
                }}
              >
                微信
              </Button>
              <Button
                size="large"
                icon={<CreditCardOutlined />}
                onClick={() => { setPaymentMethod('alipay'); setPaidAmount(totals.payableAmount) }}
                style={{
                  flex: 1,
                  height: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  border: paymentMethod === 'alipay' ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: paymentMethod === 'alipay' ? '#e6f4ff' : '#fff'
                }}
              >
                支付宝
              </Button>
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>实收金额</Text>
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                prefix="¥"
                value={paidAmount}
                onChange={(v) => setPaidAmount(v || 0)}
                min={0}
                step={10}
              />
              {paidAmount > 0 && paidAmount >= totals.payableAmount && (
                <div style={{ marginTop: 12, padding: 12, background: '#fffbe6', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">找零金额</Text>
                    <Text strong style={{ color: '#faad14', fontSize: 18 }}>
                      ¥{(paidAmount - totals.payableAmount)?.toFixed(2)}
                    </Text>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <Button size="small" onClick={() => setPaidAmount(totals.payableAmount)}>正好</Button>
                <Button size="small" onClick={() => setPaidAmount(Math.ceil(totals.payableAmount / 10) * 10)}>
                  取整到¥{Math.ceil(totals.payableAmount / 10) * 10}
                </Button>
                <Button size="small" onClick={() => setPaidAmount(Math.ceil(totals.payableAmount / 50) * 50)}>
                  取整到¥{Math.ceil(totals.payableAmount / 50) * 50}
                </Button>
              </div>
            </div>
          )}
        </Space>
      </Modal>

      <Modal
        title={<Space><SearchOutlined />商品搜索</Space>}
        open={showProductModal}
        onCancel={() => setShowProductModal(false)}
        footer={null}
        width={800}
      >
        {searchResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            未找到匹配商品
          </div>
        ) : (
          <Table
            size="small"
            dataSource={searchResults}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              { title: '条码', dataIndex: 'barcode', width: 140 },
              { title: '商品名称', dataIndex: 'name' },
              { title: '分类', dataIndex: 'category', width: 100 },
              { title: '价格', dataIndex: 'price', width: 80, align: 'right',
                render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{v?.toFixed(2)}</span>
              },
              { title: '库存', dataIndex: 'stock', width: 70, align: 'center',
                render: (v) => v <= 10 ? <Tag color="red">{v}</Tag> : <Tag color="green">{v}</Tag>
              },
              { title: '货架', dataIndex: 'shelf_location', width: 90 },
              {
                title: '操作', width: 80, align: 'center',
                render: (_, record) => (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => addSearchProduct(record)}
                    disabled={record.stock <= 0}
                  >
                    添加
                  </Button>
                )
              }
            ]}
          />
        )}
      </Modal>

      <Modal
        title={<Space><PrinterOutlined />打印小票</Space>}
        open={!!printModal}
        onCancel={() => setPrintModal(null)}
        onOk={() => {
          message.success('小票已打印')
          setPrintModal(null)
        }}
        okText="打印"
        width={400}
      >
        {printModal && (
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
              <div>收银小票</div>
            </div>
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>单号：{printModal.orderNo}</span>
            </div>
            <div>时间：{printModal.time}</div>
            <div>收银员：收银员001</div>
            {printModal.member && (
              <div>会员：{printModal.member.name} ({printModal.member.phone})</div>
            )}
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            {printModal.items.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name} x{item.quantity}</span>
                <span>¥{item.subtotal?.toFixed(2)}</span>
              </div>
            ))}
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>商品总额</span>
              <span>¥{printModal.totals.totalAmount?.toFixed(2)}</span>
            </div>
            {printModal.totals.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                <span>优惠</span>
                <span>-¥{printModal.totals.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            {printModal.coupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1677ff' }}>
                <span>优惠券[{printModal.coupon.name}]</span>
                <span>-¥{printModal.totals.couponDeducted?.toFixed(2)}</span>
              </div>
            )}
            {printModal.pointsUsed > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#faad14' }}>
                <span>积分{printModal.pointsUsed}</span>
                <span>-¥{(printModal.pointsUsed / 100)?.toFixed(2)}</span>
              </div>
            )}
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
              <span>应收</span>
              <span>¥{printModal.totals.payableAmount?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{printModal.paymentMethod === 'cash' ? '现金' : printModal.paymentMethod === 'wechat' ? '微信' : '支付宝'}</span>
              <span>¥{printModal.paidAmount?.toFixed(2)}</span>
            </div>
            {printModal.paymentMethod === 'cash' && printModal.change > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>找零</span>
                <span>¥{printModal.change?.toFixed(2)}</span>
              </div>
            )}
            <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
            <div style={{ textAlign: 'center' }}>
              <div>谢谢惠顾，欢迎下次光临！</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Cashier
