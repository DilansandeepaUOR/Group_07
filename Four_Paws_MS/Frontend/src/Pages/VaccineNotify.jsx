import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, ConfigProvider, Switch, message, Card, Typography, Tag, InputNumber } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();

  // --- State for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

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

  const handleAdd = () => {
    setModalMode('add');
    setCurrentTemplate(null);
    form.resetFields();
    // default value for is_active switch
    form.setFieldsValue({ is_active: true });
    setModalVisible(true);
  };

  const handleEdit = (template) => {
    setModalMode('edit');
    setCurrentTemplate(template);
    form.setFieldsValue({
      template_name: template.template_name,
      vaccine_name: template.vaccine_name,
      age_condition: template.age_condition,
      subject: template.subject,
      message_body: template.message_body,
      is_active: template.is_active,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let response;

      if (modalMode === 'add') {
        response = await fetch('http://localhost:3001/api/notifications/notification-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      } else {
        response = await fetch(`http://localhost:3001/api/notifications/notification-templates/${currentTemplate.template_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      message.success(`Template ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      setModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error('Submit error:', error);
      message.error(`Failed to ${modalMode === 'add' ? 'create' : 'update'} template. ${error.message}`);
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
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span
          style={{
            backgroundColor: isActive ? '#e6f7ff' : '#fff1f0',
            color: isActive ? '#52c41a' : '#f5222d',
            padding: '4px 8px',
            borderRadius: '4px',
            border: `1px solid ${isActive ? '#b7eb8f' : '#ffa39e'}`,
            display: 'inline-block',
            fontWeight: 500
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
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
  
  // --- Validator Function ---
  const validateAgeCondition = (_, value) => {
      if (!value) {
          return Promise.reject(new Error('Please enter the age condition'));
      }
      // Allow numbers, spaces, and the characters '<', '>', '='
      const regex = /^[0-9\s<>=]+$/;
      if (!regex.test(value)) {
          return Promise.reject(new Error('Invalid characters. Only use numbers, spaces, <, >, ='));
      }
      return Promise.resolve();
  };

    const validateNoSymbols = (_, value) => {
    if (value) {
        // Regex to allow letters, numbers, and spaces only
        const regex = /^[a-zA-Z0-9\s]+$/;
        if (!regex.test(value)) {
            return Promise.reject(new Error('Special characters or symbols are not allowed.'));
        }
    }
    return Promise.resolve();
  };


  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: 16,
        },
      }}
    >
      <div style={{ margin: '24px' }}>
        <Title level={2}>Vaccination Notification Templates</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Templates are automatically triggered based on pet age and vaccine requirements.
        </Text>
        <button className='cursor-pointer px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 align-right' onClick={handleAdd}>
          Add New Template
        </button>
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
              pagination={false}
              scroll={{ x: true }}
            />
            {totalPages > 1 && (
    <div className="flex items-center justify-between mt-4">
        {/* Results Text */}
        <div>
          <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstRow + 1} </span> 
              to <span className="font-medium">{Math.min(indexOfLastRow, templates.length)} </span> 
              of <span className="font-medium">{templates.length}</span> results
          </p>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center">
            <button 
                onClick={goToPrevPage} 
                disabled={currentPage === 1} 
                className="cursor-pointer px-4 py-2 mx-1 text-sm bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="mx-4 text-sm">Page {currentPage} of {totalPages}</span>
            <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages} 
                className="cursor-pointer px-4 py-2 mx-1 text-sm bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    </div>
)}
          </>
        )}
        <Modal
          title={modalMode === 'add' ? 'Add New Template' : `Edit Template: ${currentTemplate?.template_name || ''}`}
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={800}
          okText={modalMode === 'add' ? 'Create Template' : 'Save Changes'}
          cancelText="Cancel"
          destroyOnClose // This will reset form state when modal is closed
        >
          <Form form={form} layout="vertical" name="templateForm">
            <Form.Item
              name="template_name"
              label="Template Name"
              tooltip={{ title: 'Enter vaccine dose. e.g., Rabies First Dose', icon: <InfoCircleOutlined /> }}
              rules={[{ required: true, message: 'Please enter the template name' },{ validator: validateNoSymbols }]}
            >
              <Input placeholder="e.g., Rabies First Dose Reminder" disabled={modalMode === 'edit'} />
            </Form.Item>

            <Form.Item
              name="vaccine_name"
              label="Vaccine Name"
              tooltip={{ title: 'Enter vaccine name. e.g., Rabies', icon: <InfoCircleOutlined /> }}
              rules={[{ required: true, message: 'Please enter the vaccine name' },{ validator: validateNoSymbols }]}
            >
              <Input placeholder="e.g., Rabies" disabled={modalMode === 'edit'}/>
            </Form.Item>

            <Form.Item
              name="age_condition"
              label="Age Condition (in weeks)"
              tooltip={{ title: 'Enter a number or a condition. e.g., 12, 14>16, <=8', icon: <InfoCircleOutlined /> }}
              rules={[{ validator: validateAgeCondition }]}
            >
              <Input placeholder="e.g., 8 or >= 6 or > 16" />
            </Form.Item>

            <Form.Item
              name="subject"
              label="Email Subject"
              tooltip={{ title: 'Use {pet_name} for mention pet name. e.g., Upcoming vaccination reminder for {pet_name}', icon: <InfoCircleOutlined /> }}
              rules={[{ required: true, message: 'Please enter the subject' }]}
            >
              <Input placeholder="Enter email subject" />
            </Form.Item>

            <Form.Item
              name="message_body"
              label="Message Body"
              tooltip={{ title: 'Use {pet_name} and {next_vaccination_date} as placeholders for mention pet name and next vaccination date', icon: <InfoCircleOutlined /> }}
              rules={[{ required: true, message: 'Please enter the message body' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter email message body. Use {pet_name} and {next_vaccination_date} as placeholders."
              />
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
      </div>
    </ConfigProvider>
  );
};

export default NotificationTemplates;