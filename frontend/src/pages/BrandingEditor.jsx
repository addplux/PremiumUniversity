import React, { useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Divider, Space, message, Typography } from 'antd';
import { useOrganization } from '../context/OrganizationContext';
import axios from 'axios';

const { Title, Text } = Typography;

const BrandingEditor = () => {
    const { organization, refreshOrganization } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await axios.put(`/api/organizations/${organization._id}`, {
                branding: values
            });
            if (res.data.success) {
                message.success('Branding updated successfully');
                refreshOrganization();
            }
        } catch (error) {
            message.error('Failed to update branding');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2}>Institution Branding</Title>
            <Text type="secondary">Customize how your institution appears to students and staff.</Text>

            <Divider />

            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Theme Colors">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={organization?.branding}
                            onFinish={onFinish}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="primaryColor" label="Primary Color">
                                        <Input type="color" style={{ height: '40px' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="secondaryColor" label="Secondary Color">
                                        <Input type="color" style={{ height: '40px' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="logo" label="Logo URL">
                                <Input placeholder="https://example.com/logo.png" />
                            </Form.Item>

                            <Form.Item name="favicon" label="Favicon URL">
                                <Input placeholder="https://example.com/favicon.ico" />
                            </Form.Item>

                            <Form.Item name="customCSS" label="Custom CSS (Advanced)">
                                <Input.TextArea rows={4} placeholder=".hero { background: ... }" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                    Save Branding Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Live Preview">
                        <div style={{
                            border: '1px solid #ddd',
                            padding: '20px',
                            borderRadius: '8px',
                            background: '#f9f9f9'
                        }}>
                            <div style={{
                                background: organization?.branding?.primaryColor || '#1a56db',
                                padding: '10px',
                                color: 'white',
                                marginBottom: '20px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {organization?.branding?.logo ? (
                                    <img src={organization.branding.logo} alt="Logo" style={{ height: '30px' }} />
                                ) : (
                                    <div style={{ height: '30px', width: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                                )}
                                <span style={{ fontWeight: 'bold' }}>{organization?.name}</span>
                            </div>

                            <Title level={4}>Academic Program</Title>
                            <Text>Experience the future of healthcare education.</Text>

                            <div style={{ marginTop: '20px' }}>
                                <Button style={{
                                    background: organization?.branding?.primaryColor || '#1a56db',
                                    borderColor: organization?.branding?.primaryColor || '#1a56db',
                                    color: 'white'
                                }}>
                                    Primary Action
                                </Button>
                                <Button style={{
                                    marginLeft: '10px',
                                    color: organization?.branding?.secondaryColor || '#4f46e5',
                                    borderColor: organization?.branding?.secondaryColor || '#4f46e5'
                                }}>
                                    Secondary Action
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BrandingEditor;
