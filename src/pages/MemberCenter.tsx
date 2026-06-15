import { useState } from 'react'
import {
  Card, Tabs, Table, Tag, Space, Typography, Descriptions, Statistic,
  Row, Col, Form, Input, Button, Modal, App, Avatar, DatePicker, Empty, Progress, Divider, List
} from 'antd'
import {
  UserOutlined,
  CrownOutlined,
  GiftOutlined,
  DollarOutlined,
  HistoryOutlined,
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined,
  EditOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import MemberSelector from '../components/MemberSelector'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface Member {
  id: number
  phone: string
  name: string
  level: string
  points: number
  total_spent: number
  birthday?: string
}

function MemberCenter() {
  const { message } = App.useApp()
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [showSelector, setShowSelector] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [coupons, setCoupons] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [editForm] = Form.useForm()
  const [createForm] = Form.useForm()

  const loadMemberDetail = async (member: Member) => {
    setCurrentMember(member)
    try {
      const [cps, txs] = await Promise.all([
        window.api.member.coupons(member.id),
        window.api.member.transactions(member.id)
      ])
      setCoupons(cps)
      setTransactions(txs)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSearchMember = async () => {
    if (!searchKeyword.trim()) return
    try {
      const member = await window.api.member.byPhone(searchKeyword.trim())
      if (member) {
        setSearchResults([member])
      } else {
        setSearchResults([])
        message.info('未找到该会员')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditSubmit = async (values: any) => {
    if (!currentMember) return
    try {
      const updated = await window.api.member.update(currentMember.id, {
        name: values.name,
        phone: values.phone,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      })
      setCurrentMember(updated)
      setShowEdit(false)
      editForm.resetFields()
      message.success('会员信息更新成功')
    } catch (e) {
      console.error(e)
      message.error('更新失败')
    }
  }

  const handleCreateMember = async (values: any) => {
    try {
      const existing = await window.api.member.byPhone(values.phone)
      if (existing) {
        message.error('该手机号已注册')
        return
      }
      const member = await window.api.member.create({
        phone: values.phone,
        name: values.name,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      })
      message.success('会员创建成功')
      createForm.resetFields()
      setShowCreate(false)
      loadMemberDetail(member)
    } catch (e) {
      console.error(e)
      message.error('创建失败')
    }
  }

  const levelColors: any = {
    '普通会员': 'default',
    '黄金会员': 'gold',
    '钻石会员': 'purple'
  }

  const levelConfig: any = {
    '普通会员': { min: 0, max: 1000, color: '#1677ff', icon: <StarOutlined /> },
    '黄金会员': { min: 1000, max: 5000, color: '#faad14', icon: <CrownOutlined /> },
    '钻石会员': { min: 5000, max: 999999, color: '#722ed1', icon: <TrophyOutlined /> }
  }

  const nextLevel = (member: Member) => {
    if (member.level === '钻石会员') return null
    const current = levelConfig[member.level]
    const nextKey = member.level === '普通会员' ? '黄金会员' : '钻石会员'
    const remaining = current.max - member.total_spent
    return { nextKey, remaining }
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {!currentMember ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card
            size="small"
            styles={{ body: { padding: 40, textAlign: 'center' } }}
          >
            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff', marginBottom: 16 }} />
            <Title level={4} style={{ marginBottom: 24 }}>会员中心</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
              <Input.Search
                size="large"
                prefix={<PhoneOutlined />}
                placeholder="输入会员手机号查询"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearchMember}
                onPressEnter={handleSearchMember}
                enterButton
              />
              <div>
                <Text type="secondary" style={{ marginRight: 8 }}>快速测试：</Text>
                {['13800138000', '13900139000', '13700137000'].map(phone => (
                  <Button
                    key={phone}
                    size="small"
                    style={{ marginRight: 4 }}
                    onClick={async () => {
                      const m = await window.api.member.byPhone(phone)
                      if (m) loadMemberDetail(m)
                    }}
                  >
                    {phone}
                  </Button>
                ))}
              </div>
            </Space>

            {searchResults.length > 0 && (
              <Table
                size="small"
                dataSource={searchResults}
                rowKey="id"
                pagination={false}
                style={{ marginTop: 24, maxWidth: 700, margin: '24px auto 0' }}
                columns={[
                  { title: '姓名', dataIndex: 'name', width: 120 },
                  { title: '手机号', dataIndex: 'phone', width: 140 },
                  {
                    title: '等级', dataIndex: 'level',
                    render: (v) => <Tag color={levelColors[v]}>{v}</Tag>
                  },
                  {
                    title: '积分', dataIndex: 'points',
                    render: (v) => <span style={{ color: '#faad14', fontWeight: 600 }}>{v}</span>
                  },
                  {
                    title: '累计消费', dataIndex: 'total_spent',
                    render: (v) => `¥${v?.toFixed(2)}`
                  },
                  {
                    title: '操作',
                    render: (_, record) => (
                      <Button type="primary" size="small" onClick={() => loadMemberDetail(record as Member)}>
                        查看详情
                      </Button>
                    )
                  }
                ]}
              />
            )}

            <Divider plain style={{ margin: '32px 0' }}>或者</Divider>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setShowCreate(true)}
              style={{ minWidth: 200 }}
            >
              新建会员
            </Button>
          </Card>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card
            size="small"
            styles={{
              body: {
                padding: 24,
                background: `linear-gradient(135deg, ${levelConfig[currentMember.level]?.color || '#1677ff'}33 0%, ${levelConfig[currentMember.level]?.color || '#722ed1'}11 100%)`
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
              <div style={{ display: 'flex', gap: 20, flex: 1 }}>
                <Avatar
                  size={80}
                  icon={levelConfig[currentMember.level]?.icon || <UserOutlined />}
                  style={{
                    backgroundColor: levelConfig[currentMember.level]?.color || '#1677ff',
                    fontSize: 40,
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Space style={{ marginBottom: 8 }}>
                    <Title level={3} style={{ margin: 0 }}>{currentMember.name}</Title>
                    <Tag color={levelColors[currentMember.level]} style={{ fontSize: 14, padding: '2px 10px' }}>
                      <CrownOutlined /> {currentMember.level}
                    </Tag>
                  </Space>
                  <Space size="large" style={{ marginBottom: 12 }}>
                    <Text type="secondary"><PhoneOutlined /> {currentMember.phone}</Text>
                    {currentMember.birthday && (
                      <Text type="secondary"><CalendarOutlined /> {currentMember.birthday}</Text>
                    )}
                  </Space>
                  {nextLevel(currentMember) && (
                    <div style={{ maxWidth: 400 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <span>距离 {nextLevel(currentMember)?.nextKey}</span>
                        <span>再消费 ¥{nextLevel(currentMember)?.remaining?.toFixed(2)}</span>
                      </div>
                      <Progress
                        percent={Math.min(100, (currentMember.total_spent / levelConfig[currentMember.level]?.max) * 100)}
                        showInfo={false}
                        strokeColor={levelConfig[currentMember.level]?.color}
                      />
                    </div>
                  )}
                </div>
              </div>
              <Space>
                <Button icon={<EditOutlined />} onClick={() => {
                  editForm.setFieldsValue({
                    name: currentMember.name,
                    phone: currentMember.phone,
                    birthday: currentMember.birthday ? dayjs(currentMember.birthday) : null
                  })
                  setShowEdit(true)
                }}>
                  编辑资料
                </Button>
                <Button onClick={() => {
                  setCurrentMember(null)
                  setSearchResults([])
                }}>
                  切换会员
                </Button>
              </Space>
            </div>

            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title={<Space><StarOutlined /><span>可用积分</span></Space>}
                    value={currentMember.points}
                    suffix="分"
                    valueStyle={{ color: '#faad14' }}
                  />
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    可抵扣 ¥{(currentMember.points / 100)?.toFixed(2)}
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title={<Space><DollarOutlined /><span>累计消费</span></Space>}
                    value={currentMember.total_spent}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    共产生消费记录
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title={<Space><GiftOutlined /><span>可用优惠券</span></Space>}
                    value={coupons.length}
                    suffix="张"
                    valueStyle={{ color: '#1677ff' }}
                  />
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    待使用优惠券
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card size="small">
            <Tabs
              defaultActiveKey="coupons"
              size="large"
              items={[
                {
                  key: 'coupons',
                  label: <Space><GiftOutlined />优惠券 ({coupons.length})</Space>,
                  children: (
                    coupons.length === 0 ? (
                      <Empty description="暂无可用优惠券" style={{ padding: 40 }} />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {coupons.map((coupon) => (
                          <Col span={8} key={coupon.id}>
                            <div style={{
                              border: `2px solid ${coupon.type === 'fixed' ? '#ff4d4f' : '#fa8c16'}`,
                              borderRadius: 8,
                              overflow: 'hidden',
                              display: 'flex'
                            }}>
                              <div style={{
                                width: 100,
                                background: coupon.type === 'fixed' ? '#ff4d4f' : '#fa8c16',
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 12
                              }}>
                                {coupon.type === 'fixed' ? (
                                  <>
                                    <div style={{ fontSize: 12 }}>立减</div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>¥{coupon.value}</div>
                                  </>
                                ) : (
                                  <>
                                    <div style={{ fontSize: 12 }}>折扣</div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>{10 - coupon.value / 10}折</div>
                                  </>
                                )}
                              </div>
                              <div style={{ flex: 1, padding: 12, background: '#fff' }}>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>{coupon.name}</div>
                                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                                  券号: {coupon.code}
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  {coupon.min_amount > 0 ? `满¥${coupon.min_amount?.toFixed(2)}可用` : '无门槛使用'}
                                </div>
                                {coupon.expire_at && (
                                  <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 2 }}>
                                    有效期至: {coupon.expire_at}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    )
                  )
                },
                {
                  key: 'transactions',
                  label: <Space><HistoryOutlined />消费记录</Space>,
                  children: (
                    transactions.length === 0 ? (
                      <Empty description="暂无消费记录" style={{ padding: 40 }} />
                    ) : (
                      <Table
                        size="small"
                        dataSource={transactions}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        columns={[
                          {
                            title: '时间', dataIndex: 'created_at', width: 160,
                            render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
                          },
                          {
                            title: '类型', dataIndex: 'type', width: 100,
                            render: (v) => {
                              const map: any = {
                                'purchase': { tag: 'blue', text: '消费', icon: <ShoppingCartOutlined /> },
                                'points_use': { tag: 'orange', text: '积分使用', icon: <StarOutlined /> },
                                'refund': { tag: 'red', text: '退款', icon: <DollarOutlined /> }
                              }
                              const cfg = map[v] || { tag: 'default', text: v }
                              return <Tag icon={cfg.icon} color={cfg.tag}>{cfg.text}</Tag>
                            }
                          },
                          {
                            title: '金额', dataIndex: 'amount', width: 100, align: 'right',
                            render: (v: number, record) => (
                              <span style={{
                                color: record.type === 'refund' ? '#52c41a' : record.type === 'purchase' ? '#ff4d4f' : '#666',
                                fontWeight: 600
                              }}>
                                {record.type === 'refund' ? '+' : v > 0 ? '-' : ''}¥{Math.abs(v)?.toFixed(2)}
                              </span>
                            )
                          },
                          {
                            title: '积分变动', dataIndex: 'points', width: 100, align: 'right',
                            render: (v: number) => (
                              <span style={{
                                color: v > 0 ? '#faad14' : v < 0 ? '#ff4d4f' : '#666',
                                fontWeight: 600
                              }}>
                                {v > 0 ? '+' : ''}{v} 分
                              </span>
                            )
                          },
                          { title: '关联订单', dataIndex: 'order_no', width: 160 },
                          { title: '说明', dataIndex: 'description' }
                        ]}
                      />
                    )
                  )
                }
              ]}
            />
          </Card>
        </Space>
      )}

      <MemberSelector
        open={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={(m) => {
          loadMemberDetail(m)
          setShowSelector(false)
        }}
        onClear={() => {
          setCurrentMember(null)
          setShowSelector(false)
        }}
        currentMember={currentMember}
      />

      <Modal
        title={<Space><EditOutlined />编辑会员信息</Space>}
        open={showEdit}
        onCancel={() => setShowEdit(false)}
        footer={null}
        width={450}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input size="large" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input size="large" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item label="生日" name="birthday">
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%' }}>
              <Button onClick={() => setShowEdit(false)} style={{ flex: 1 }} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" style={{ flex: 1 }} size="large">
                保存修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Space><PlusOutlined />新建会员</Space>}
        open={showCreate}
        onCancel={() => setShowCreate(false)}
        footer={null}
        width={450}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateMember}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input size="large" placeholder="请输入会员姓名" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input size="large" placeholder="请输入手机号" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item label="生日" name="birthday">
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              placeholder="请选择生日（选填）"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%' }}>
              <Button onClick={() => setShowCreate(false)} style={{ flex: 1 }} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" style={{ flex: 1 }} size="large" icon={<PlusOutlined />}>
                确认创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default MemberCenter
