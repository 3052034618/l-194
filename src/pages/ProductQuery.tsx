import { useState, useEffect } from 'react'
import {
  Card, Input, Table, Tag, Space, Statistic, Row, Col, Descriptions,
  Modal, Typography, App, Progress, Empty, Button, InputNumber, Select, Divider
} from 'antd'
import {
  SearchOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  AppstoreOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

function ProductQuery() {
  const { message } = App.useApp()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [detailModal, setDetailModal] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const all = await window.api.product.all()
      setProducts(all)
      const cats = Array.from(new Set(all.map((p: any) => p.category).filter(Boolean))) as string[]
      setCategories(cats)
    } catch (e) {
      console.error(e)
      message.error('加载商品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const results = await window.api.product.search(keyword.trim())
      let filtered = results
      if (category) {
        filtered = filtered.filter((p: any) => p.category === category)
      }
      setProducts(filtered)
    } catch (e) {
      console.error(e)
      message.error('搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const showDetail = async (product: any) => {
    try {
      const detail = await window.api.product.detail(product.id)
      setSelectedProduct(detail)
      setDetailModal(true)
    } catch (e) {
      console.error(e)
    }
  }

  const stockStats = {
    total: products.length,
    lowStock: products.filter((p: any) => p.stock <= 10 && p.stock > 0).length,
    outOfStock: products.filter((p: any) => p.stock === 0).length,
    totalValue: products.reduce((s: number, p: any) => s + p.stock * p.cost, 0)
  }

  const columns = [
    {
      title: '商品信息',
      key: 'info',
      width: 280,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, flexShrink: 0
          }}>
            <AppstoreOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              条码: {record.barcode}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      render: (v: string) => v && <Tag color="blue">{v}</Tag>
    },
    {
      title: '售价',
      dataIndex: 'price',
      width: 90,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{v?.toFixed(2)}</span>
      )
    },
    {
      title: '成本',
      dataIndex: 'cost',
      width: 80,
      align: 'right' as const,
      render: (v: number) => <span>¥{v?.toFixed(2)}</span>
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 120,
      align: 'center' as const,
      render: (v: number, record: any) => {
        let color = 'green'
        let status = '充足'
        if (v === 0) { color = 'red'; status = '缺货' }
        else if (v <= 10) { color = 'orange'; status = '偏低' }
        else if (v <= 50) { color = 'gold'; status = '正常' }
        const percent = v >= 200 ? 100 : (v / 200) * 100
        return (
          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: 2 }}>
              <Tag color={color as any}>{status}</Tag>
              <Text strong style={{ marginLeft: 4 }}>{v}</Text>
              <Text type="secondary"> {record.unit}</Text>
            </div>
            <Progress percent={percent} size="small" showInfo={false} />
          </div>
        )
      }
    },
    {
      title: '货架位置',
      dataIndex: 'shelf_location',
      width: 100,
      render: (v: string) => v && (
        <Tag icon={<EnvironmentOutlined />} color="purple">
          {v}
        </Tag>
      )
    },
    {
      title: '促销',
      dataIndex: 'is_promotion',
      width: 80,
      align: 'center' as const,
      render: (v: number, record: any) => v === 1 ? (
        <Tag color="red">{record.promotion_group || '促销中'}</Tag>
      ) : null
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          size="small" 
          icon={<InfoCircleOutlined />}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      )
    }
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic 
              title={<Space><ShoppingOutlined />商品总数</Space>}
              value={stockStats.total}
              valueStyle={{ color: '#1677ff' }}
              suffix="个 SKU"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic 
              title={<Space><InboxOutlined />库存偏低</Space>}
              value={stockStats.lowStock}
              valueStyle={{ color: '#faad14' }}
              suffix="种"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic 
              title={<Space><AppstoreOutlined />缺货商品</Space>}
              value={stockStats.outOfStock}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="种"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic 
              title={<Space>库存总值</Space>}
              value={stockStats.totalValue}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small">
        <Space wrap size="middle">
          <Select
            style={{ width: 150 }}
            placeholder="选择分类"
            allowClear
            value={category}
            onChange={setCategory}
            size="large"
          >
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          <Input.Search
            size="large"
            placeholder="输入条码/名称/分类搜索"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            style={{ width: 350 }}
            enterButton
          />
          <Button size="large" onClick={loadProducts}>
            刷新全部
          </Button>
        </Space>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          size="small"
          loading={loading}
          dataSource={products}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 12,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 种商品`
          }}
          scroll={{ x: 1200, y: 'calc(100vh - 420px)' }}
          locale={{
            emptyText: <Empty description="暂无商品数据" />
          }}
          onRow={(record) => ({
            onDoubleClick: () => showDetail(record)
          })}
        />
      </Card>

      <Modal
        title={<Space><InfoCircleOutlined />商品详情</Space>}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>关闭</Button>
        ]}
        width={600}
      >
        {selectedProduct && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{
                width: 120, height: 120, borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 48, flexShrink: 0
              }}>
                <AppstoreOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: '0 0 8px' }}>{selectedProduct.name}</Title>
                <Space style={{ marginBottom: 12 }}>
                  <Tag color="blue">{selectedProduct.category}</Tag>
                  {selectedProduct.is_promotion === 1 && (
                    <Tag color="red">{selectedProduct.promotion_group || '促销中'}</Tag>
                  )}
                  {selectedProduct.stock === 0 ? (
                    <Tag color="red">缺货</Tag>
                  ) : selectedProduct.stock <= 10 ? (
                    <Tag color="orange">库存偏低</Tag>
                  ) : (
                    <Tag color="green">库存充足</Tag>
                  )}
                </Space>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>
                  ¥{selectedProduct.price?.toFixed(2)}
                  <span style={{ fontSize: 14, color: '#999', fontWeight: 400, marginLeft: 8 }}>
                    / {selectedProduct.unit}
                  </span>
                </div>
              </div>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="商品条码">{selectedProduct.barcode}</Descriptions.Item>
              <Descriptions.Item label="商品编号">#{selectedProduct.id}</Descriptions.Item>
              <Descriptions.Item label="所属分类">{selectedProduct.category}</Descriptions.Item>
              <Descriptions.Item label="计量单位">{selectedProduct.unit}</Descriptions.Item>
              <Descriptions.Item label="销售价格">
                <span style={{ color: '#ff4d4f' }}>¥{selectedProduct.price?.toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="进货成本">¥{selectedProduct.cost?.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="毛利率">
                {selectedProduct.price > 0 ? (
                  <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    {((selectedProduct.price - selectedProduct.cost) / selectedProduct.price * 100).toFixed(1)}%
                  </span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="库存数量">
                <span style={{ fontWeight: 600 }}>{selectedProduct.stock}</span> {selectedProduct.unit}
              </Descriptions.Item>
              <Descriptions.Item label="货架位置" span={2}>
                <Tag icon={<EnvironmentOutlined />} color="purple">
                  {selectedProduct.shelf_location || '未设置'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {selectedProduct.created_at}
              </Descriptions.Item>
            </Descriptions>

            {selectedProduct.stock > 0 && selectedProduct.stock <= 50 && (
              <div style={{
                padding: '12px 16px',
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 6,
                color: '#d46b08'
              }}>
                <Space>
                  <InfoCircleOutlined />
                  <span>
                    库存数量偏低，建议及时补货。当前库存 {selectedProduct.stock} {selectedProduct.unit}，
                    位于货架 {selectedProduct.shelf_location}
                  </span>
                </Space>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  )
}

export default ProductQuery
