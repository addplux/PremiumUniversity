import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Table, Button, Tag, Space, Card, Statistic, Row, Col, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import OrganizationForm from './OrganizationForm';

const { Content } = Layout;

const SuperAdminDashboard = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, trialling: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/organizations');
            if (res.data.success) {
                setOrganizations(res.data.data);

                // Simple stats calculation
                const total = res.data.data.length;
                const active = res.data.data.filter(org => org.isActive).length;
                const trialling = res.data.data.filter(org => org.subscription?.plan === 'trial').length;
                setStats({ total, active, trialling });
            }
        } catch (error) {
            message.error('Failed to fetch organizations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleToggleStatus = async (org) => {
        try {
            const res = await axios.put(`/api/organizations/${org._id}`, {
                isActive: !org.isActive
            });
            if (res.data.success) {
                message.success(`Organization ${org.isActive ? 'deactivated' : 'activated'} successfully`);
                fetchOrganizations();
            }
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        {
            title: 'Institution Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 'bold' }}>{text}</span>
                    <small style={{ color: '#888' }}>{record.slug}.premiumuni.com</small>
                </Space>
            ),
        },
        {
            title: 'Plan',
            dataIndex: ['subscription', 'plan'],
            key: 'plan',
            render: (plan) => (
                <Tag color={plan === 'enterprise' ? 'gold' : plan === 'professional' ? 'blue' : 'green'}>
                    {plan?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Students',
            dataIndex: ['usage', 'students'],
            key: 'students',
            render: (usage, record) => `${usage || 0} / ${record.limits?.maxStudents || 100}`
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingOrg(record);
                            setIsModalVisible(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        danger={record.isActive}
                        icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                        onClick={() => handleToggleStatus(record)}
                    >
                        {record.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Content style={{ padding: '24px' }}>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Institutions" value={stats.total} prefix={<GlobalOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Active" value={stats.active} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="In Free Trial" value={stats.trialling} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Institution Management"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingOrg(null);
                            setIsModalVisible(true);
                        }}
                    >
                        Add Institution
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={organizations}
                    rowKey="_id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingOrg ? "Edit Institution" : "Add New Institution"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <OrganizationForm
                    initialValues={editingOrg}
                    onSuccess={() => {
                        setIsModalVisible(false);
                        fetchOrganizations();
                    }}
                />
            </Modal>
        </Content>
    );
};

export default SuperAdminDashboard;
