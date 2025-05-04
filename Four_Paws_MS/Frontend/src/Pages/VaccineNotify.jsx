import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message } from 'antd';


const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();


  useEffect(() => {
    console.log("VaccineNotify component mounted");
    fetchTemplates();
  }, []);

//fetchTemplates function
const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/notification-templates');
      console.log("API Response:", response); 
      const data = await response.json();
      console.log("Parsed Data:", data);
      setTemplates(data);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    form.setFieldsValue({
      subject: template.subject,
      message_body: template.message_body,
      days_before: template.days_before,
      is_active: template.is_active
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await fetch(`http://localhost:3001/api/notification-templates/${currentTemplate.template_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      message.success('Template updated successfully');
      setVisible(false);
      fetchTemplates();
    } catch {
      message.error('Failed to update template');
    }
  };

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'template_name',
      key: 'template_name'
    },
    {
      title: 'Trigger Condition',
      dataIndex: 'trigger_condition',
      key: 'trigger_condition'
    },
    {
      title: 'Days Before',
      dataIndex: 'days_before',
      key: 'days_before'
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => <Switch checked={active} disabled />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div>
        {templates.length === 0 && !loading ? (
        <div style={{ padding: 16, textAlign: 'center' }}>
            No notification templates found. 
            <Button type="link" onClick={fetchTemplates}>Refresh</Button>
        </div>
        ) : (
        <Table 
            columns={columns} 
            dataSource={templates} 
            loading={loading}
            rowKey="template_id"
            locale={{ emptyText: 'No data' }}
        />
        )}
      <Table 
        columns={columns} 
        dataSource={templates} 
        loading={loading}
        rowKey={(record) => record.template_id || record.key}
      />
      
      <Modal
        title="Edit Template"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="message_body" label="Message Body" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="days_before" label="Days Before" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

};

export default NotificationTemplates;