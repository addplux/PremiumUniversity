import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Divider, Row, Col, InputNumber, Switch, Select, message } from 'react-redux';
// Note: Using standard antd as assuming it's available based on project patterns
import { Form as AntForm, Input as AntInput, Button as AntButton, Divider as AntDivider, Row as AntRow, Col as AntCol, InputNumber as AntInputNumber, Switch as AntSwitch, Select as AntSelect } from 'antd';

const OrganizationForm = ({ initialValues, onSuccess }) => {
    const [form] = AntForm.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const url = initialValues ? `/api/organizations/${initialValues._id}` : '/api/organizations';
            const method = initialValues ? 'put' : 'post';

            const res = await axios[method](url, values);

            if (res.data.success) {
                message.success(`Institution ${initialValues ? 'updated' : 'created'} successfully`);
                onSuccess();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AntForm
            form={form}
            layout="vertical"
            initialValues={initialValues || {
                subscription: { plan: 'trial' },
                limits: { maxStudents: 100, maxStaff: 10, maxCourses: 50 },
                isActive: true
            }}
            onFinish={onFinish}
        >
            <AntRow gutter={16}>
                <AntCol span={12}>
                    <AntForm.Item name="name" label="Institution Name" rules={[{ required: true }]}>
                        <AntInput placeholder="e.g. Silver Maple University" />
                    </AntForm.Item>
                </AntCol>
                <AntCol span={12}>
                    <AntForm.Item name="slug" label="URL Slug (Subdomain)" rules={[{ required: true }]}>
                        <AntInput placeholder="e.g. silver-maple" disabled={!!initialValues} />
                    </AntForm.Item>
                </AntCol>
            </AntRow>

            <AntDivider>Subscription & Limits</AntDivider>

            <AntRow gutter={16}>
                <AntCol span={12}>
                    <AntForm.Item name={['subscription', 'plan']} label="Plan">
                        <AntSelect>
                            <AntSelect.Option value="trial">Trial</AntSelect.Option>
                            <AntSelect.Option value="basic">Basic</AntSelect.Option>
                            <AntSelect.Option value="professional">Professional</AntSelect.Option>
                            <AntSelect.Option value="enterprise">Enterprise</AntSelect.Option>
                        </AntSelect>
                    </AntForm.Item>
                </AntCol>
                <AntCol span={12}>
                    <AntForm.Item name="isActive" label="Active Status" valuePropName="checked">
                        <AntSwitch />
                    </AntForm.Item>
                </AntCol>
            </AntRow>

            <AntRow gutter={16}>
                <AntCol span={8}>
                    <AntForm.Item name={['limits', 'maxStudents']} label="Max Students">
                        <AntInputNumber min={1} style={{ width: '100%' }} />
                    </AntForm.Item>
                </AntCol>
                <AntCol span={8}>
                    <AntForm.Item name={['limits', 'maxStaff']} label="Max Staff">
                        <AntInputNumber min={1} style={{ width: '100%' }} />
                    </AntForm.Item>
                </AntCol>
                <AntCol span={8}>
                    <AntForm.Item name={['limits', 'maxCourses']} label="Max Courses">
                        <AntInputNumber min={1} style={{ width: '100%' }} />
                    </AntForm.Item>
                </AntCol>
            </AntRow>

            <AntDivider>Primary Contact</AntDivider>

            <AntRow gutter={16}>
                <AntCol span={12}>
                    <AntForm.Item name={['contact', 'adminEmail']} label="Admin Email" rules={[{ required: true, type: 'email' }]}>
                        <AntInput placeholder="admin@institution.com" />
                    </AntForm.Item>
                </AntCol>
                <AntCol span={12}>
                    <AntForm.Item name={['contact', 'country']} label="Country">
                        <AntInput defaultValue="Zambia" />
                    </AntForm.Item>
                </AntCol>
            </AntRow>

            <AntForm.Item>
                <AntButton type="primary" htmlType="submit" loading={loading} block size="large">
                    {initialValues ? 'Update Institution' : 'Create Institution'}
                </AntButton>
            </AntForm.Item>
        </AntForm>
    );
};

export default OrganizationForm;
