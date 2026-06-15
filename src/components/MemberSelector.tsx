import { useState } from 'react'
import { Modal, Tabs, Form, Input, Button, Space, Card, Table, Tag, App, DatePicker, Typography } from 'antd'
import { UserOutlined, SearchOutlined, PlusOutlined, PhoneOutlined } from '@ant-design/icons'
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

interface MemberSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (member: Member) => void
  onClear: () => void
  currentMember: Member | null
}

function MemberSelector({ open, onClose, onSelect, onClear, currentMember }: MemberSelectorProps) {
  const { message } = App.useApp()
  const [searchPhone, setSearchPhone] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [form] = Form.useForm()
  const [registerForm] = Form.useForm()

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      message.warning('请输入手机号')
      return
    }
    try {
      const member = await window.api.member.byPhone(searchPhone.trim())
      setSearchResults(member ? [member] : [])
      setHasSearched(true)
      if (!member) {
        message.info('未找到该会员，可在「新建会员」标签页注册')
      }
    } catch (e) {
      console.error(e)
      message.error('查询失败')
    }
  }

  const handleRegister = async (values: any) => {
    try {
      const existing = await window.api.member.byPhone(values.phone)
      if (existing) {
        message.error('该手机号已注册会员')
        return
      }
      const member = await window.api.member.create({
        phone: values.phone,
        name: values.name,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      })
      message.success(`会员注册成功！欢迎：${member.name}`)
      registerForm.resetFields()
      onSelect(member)
    } catch (e) {
      console.error(e)
      message.error('注册失败')
    }
  }

  return (
    <Modal
      title={<Space><UserOutlined />会员中心</Space>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {currentMember && (
        <Card 
          size="small" 
          style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>当前会员：{currentMember.name}</div>
              <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.85)' }}>
                {currentMember.phone} · {currentMember.level}
              </div>
            </div>
            <Button danger size="small" onClick={onClear}>
              解除绑定
            </Button>
          </div>
        </Card>
      )}

      <Tabs
        defaultActiveKey="search"
        items={[
          {
            key: 'search',
            label: <Space><SearchOutlined />查询会员</Space>,
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    size="large"
                    prefix={<PhoneOutlined />}
                    placeholder="请输入会员手机号"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ flex: 1 }}
                  />
                  <Button size="large" type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    查询
                  </Button>
                </Space.Compact>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>快速测试：</Text>
                  <Button size="small" onClick={() => { setSearchPhone('13800138000'); handleSearch(); }}>13800138000</Button>
                  <Button size="small" onClick={() => { setSearchPhone('13900139000'); handleSearch(); }}>13900139000</Button>
                  <Button size="small" onClick={() => { setSearchPhone('13700137000'); handleSearch(); }}>13700137000</Button>
                </div>

                {hasSearched && (
                  searchResults.length > 0 ? (
                    <Table
                      size="small"
                      dataSource={searchResults}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        { title: '姓名', dataIndex: 'name', width: 100 },
                        { title: '手机号', dataIndex: 'phone', width: 130 },
                        { 
                          title: '等级', dataIndex: 'level', width: 100,
                          render: (v) => {
                            const colorMap: any = { '普通会员': 'blue', '黄金会员': 'gold', '钻石会员': 'purple' }
                            return <Tag color={colorMap[v] || 'default'}>{v}</Tag>
                          }
                        },
                        { 
                          title: '积分', dataIndex: 'points', width: 100,
                          render: (v) => <span style={{ color: '#faad14', fontWeight: 600 }}>{v}</span>
                        },
                        { 
                          title: '累计消费', dataIndex: 'total_spent', 
                          render: (v) => <span>¥{v?.toFixed(2)}</span>
                        },
                        {
                          title: '操作', width: 80,
                          render: (_, record) => (
                            <Button type="primary" size="small" onClick={() => onSelect(record as Member)}>
                              选择
                            </Button>
                          )
                        }
                      ]}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: 30, color: '#999' }}>
                      未找到该手机号的会员，建议前往「新建会员」注册
                    </div>
                  )
                )}
              </Space>
            )
          },
          {
            key: 'register',
            label: <Space><PlusOutlined />新建会员</Space>,
            children: (
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegister}
                initialValues={{}}
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
                <Form.Item
                  label="生日"
                  name="birthday"
                >
                  <DatePicker 
                    size="large" 
                    style={{ width: '100%' }} 
                    placeholder="请选择生日（选填）"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" size="large" htmlType="submit" style={{ width: '100%' }} icon={<PlusOutlined />}>
                    立即注册并绑定
                  </Button>
                </Form.Item>
              </Form>
            )
          }
        ]}
      />
    </Modal>
  )
}

export default MemberSelector
