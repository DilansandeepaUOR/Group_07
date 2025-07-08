import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, ConfigProvider, Switch, message, Card, Typography, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();

  // --- State for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/notifications/notification-templates');
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
      is_active: template.is_active
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const response = await fetch(`http://localhost:3001/api/notifications/notification-templates/${currentTemplate.template_id}`, {
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
    },
    {
      title: 'Vaccine Name',
      dataIndex: 'vaccine_name',
      key: 'vaccine_name',
      render: (name) => <Tag color="blue">{name}</Tag>
    },
    {
      title: 'Age Condition',
      dataIndex: 'age_condition',
      key: 'age_condition',
      render: (condition) => (
        <Text>
          {condition} weeks
          <InfoCircleOutlined 
            style={{ marginLeft: 4, color: '#1890ff' }} 
            title={`Triggers when pet is ${condition} weeks old`}
          />
        </Text>
      )
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
        <Button type="primary" onClick={() => handleEdit(record)}>
          Edit Template
        </Button>
      )
    }
  ];

  // --- Pagination Logic ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTemplates = templates.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(templates.length / rowsPerPage);

  return (
    <ConfigProvider
    theme={{
        token: {
          // 3. Set the base font size
          fontSize: 16,
        },
      }}
    >
    <Card style={{ margin: '24px' }}>
      <Title level={2}>Vaccination Notification Templates</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Templates are automatically triggered based on pet age and vaccine requirements.
      </Text>

      {templates.length === 0 && !loading ? (
        <div style={{ padding: 16, textAlign: 'center' }}>
          No notification templates found.
          <Button type="link" onClick={fetchTemplates}>Refresh</Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={currentTemplates}
            loading={loading}
            rowKey="template_id"
            pagination={false} // Disable default pagination
            scroll={{ x: true }}
          />

          {/* --- Custom Pagination Controls --- */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span style={{ margin: '0 15px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="cursor-pointer px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        title={`Edit Template: ${currentTemplate?.template_name || ''}`}
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
            label="Notification will send before one week of next vaccination date!" 
          >
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
    </ConfigProvider>
  );
};

// --- Styles for Pagination ---
const styles = {
    pagination: {
        marginTop: '20px',
        textAlign: 'right',
    }
};

export default NotificationTemplates;