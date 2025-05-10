import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message, Card, Typography } from 'antd';

const { Title } = Typography;

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/notification-templates');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error('Failed to fetch templates. Please try again later.');
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
      const response = await fetch(`http://localhost:3001/api/notification-templates/${currentTemplate.template_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Template updated successfully');
      setVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update template. Please try again.');
    }
  };

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'template_name',
      key: 'template_name',
      width: '20%'
    },
    {
      title: 'Trigger Condition',
      dataIndex: 'trigger_condition',
      key: 'trigger_condition',
      width: '25%'
    },
    {
      title: 'Days Before',
      dataIndex: 'days_before',
      key: 'days_before',
      width: '15%'
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: '15%',
      render: (active) => <Switch checked={active} disabled />
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '25%',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleEdit(record)}>
          Edit Template
        </Button>
      )
    }
  ];

  return (
    
    <Card style={{ margin: '24px' }}>
      <Title level={2}>Vaccination Notification Templates</Title>
      
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
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
      <Modal
        title="Edit Notification Template"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={800}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="subject" 
            label="Subject" 
            rules={[{ required: true, message: 'Please enter the subject' }]}
          >
            <Input placeholder="Enter email subject" />
          </Form.Item>
          
          <Form.Item 
            name="message_body" 
            label="Message Body" 
            rules={[{ required: true, message: 'Please enter the message body' }]}
          >
            <Input.TextArea 
              rows={6} 
              placeholder="Enter email message body. Use {pet_name} and {next_vaccination_date} as placeholders."
            />
          </Form.Item>
          
          <Form.Item 
            name="days_before" 
            label="Days Before" 
            rules={[{ required: true, message: 'Please enter the number of days' }]}
          >
            <InputNumber min={1} placeholder="Enter number of days" />
          </Form.Item>
          
          <Form.Item 
            name="is_active" 
            label="Active" 
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default NotificationTemplates;