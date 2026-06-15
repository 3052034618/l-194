import { Layout, Menu, Avatar, Badge, Typography, Space, Button } from 'antd'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ShoppingCartOutlined,
  SearchOutlined,
  UserOutlined,
  SwapOutlined,
  FileTextOutlined,
  ReloadOutlined,
  BellOutlined,
  CoffeeOutlined
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useAppStore } from '../store/posStore'
import dayjs from 'dayjs'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const menuItems = [
  { key: '/cashier', icon: <ShoppingCartOutlined />, label: '快速收银' },
  { key: '/product', icon: <SearchOutlined />, label: '商品查询' },
  { key: '/member', icon: <UserOutlined />, label: '会员中心' },
  { key: '/returns', icon: <SwapOutlined />, label: '退换货' },
  { key: '/shift', icon: <FileTextOutlined />, label: '交班汇总' },
]

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentShift, cashierName, setCurrentShift } = useAppStore()
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'))
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    checkShift()
    loadPendingCount()
  }, [])

  const checkShift = async () => {
    try {
      const shift = await window.api.shift.current()
      if (!shift) {
        const newShift = await window.api.shift.start(cashierName)
        setCurrentShift(newShift)
      } else {
        setCurrentShift(shift)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadPendingCount = async () => {
    try {
      const summary = await window.api.shift.todaySummary()
      setPendingCount(summary?.pendingRefundCount || 0)
    } catch (e) {}
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider 
        width={200} 
        theme="dark"
        style={{ 
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ 
          padding: '20px 16px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <CoffeeOutlined style={{ fontSize: 32, color: '#4096ff', marginBottom: 8 }} />
          <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 600 }}>
            智慧零售收银
          </Title>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.key === '/returns' ? (
              <Badge count={item.key === '/returns' ? pendingCount : 0} size="small">
                {item.icon}
              </Badge>
            ) : item.icon,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, borderRight: 0 }}
        />

        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 12
        }}>
          <div>版本 v1.0.0</div>
        </div>
      </Sider>

      <Layout>
        <Header 
          style={{ 
            background: '#fff', 
            padding: '0 24px', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 60
          }}
        >
          <Space size="large">
            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
              {menuItems.find(m => m.key === location.pathname)?.label || '智慧零售收银系统'}
            </Title>
            {currentShift && (
              <Tag color="blue">
                班次: {currentShift.shift_no}
              </Tag>
            )}
          </Space>

          <Space size="large">
            <Space size="middle" style={{ color: '#666' }}>
              <Text>{currentTime}</Text>
              <Badge count={pendingCount} size="small" offset={[-2, 2]}>
                <Link to="/returns">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    style={{ color: pendingCount > 0 ? '#ff4d4f' : '#666' }}
                  />
                </Link>
              </Badge>
              <Button 
                type="text" 
                icon={<ReloadOutlined />} 
                onClick={() => window.location.reload()}
              />
            </Space>
            
            <Space size="small">
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
              <Text strong>{cashierName}</Text>
            </Space>
          </Space>
        </Header>

        <Content 
          style={{ 
            margin: 0, 
            padding: 16, 
            overflow: 'auto',
            background: '#f0f2f5',
            flex: 1
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: 12,
      borderRadius: 4,
      background: color === 'blue' ? '#e6f4ff' : '#f6ffed',
      color: color === 'blue' ? '#1677ff' : '#52c41a',
      border: `1px solid ${color === 'blue' ? '#91caff' : '#b7eb8f'}`
    }}>
      {children}
    </span>
  )
}

export default MainLayout
