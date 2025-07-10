import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, ConfigProvider, message, Card, Typography, Space } from 'antd';
import { FaCat, FaDog } from 'react-icons/fa';

const { Title, Text } = Typography;

const DewormNotify = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [animalType, setAnimalType] = useState('dog'); // 'dog' or 'cat'
  const [form] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchTemplates();
  }, [animalType]);

  const fetchTemplates = async () => {
    setLoading(true);
    // Determine the correct static endpoint based on the animalType state
    const endpoint = animalType === 'dog' ? 'dog-templates' : 'cat-templates';
    const url = `http://localhost:3001/api/${endpoint}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error(`Failed to fetch ${animalType} templates. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    form.setFieldsValue({
      deworm_name: template.deworm_name,
      age_condition: template.age_condition,
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Determine the correct static endpoint
      const endpoint = animalType === 'dog' ? 'dog-templates' : 'cat-templates';
      const url = `http://localhost:3001/api/${endpoint}/${currentTemplate.id}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Template updated successfully');
      setVisible(false);
      await fetchTemplates(); // Use await to ensure data is fresh
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update template. Please try again.');
    }
  };

  const columns = [
    {
      title: 'Deworming Name',
      dataIndex: 'deworm_name',
      key: 'deworm_name',
    },
    {
      title: 'Age Condition (weeks)',
      dataIndex: 'age_condition',
      key: 'age_condition',
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
      ),
    },
  ];

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTemplates = templates.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(templates.length / rowsPerPage);

  return (
    <ConfigProvider theme={{ token: { fontSize: 16 } }}>
      <Card style={{ margin: '24px' }}>
        <Title level={3}>Deworming Notification Templates</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          These templates determine the deworming schedule for pets.
        </Text>

        <Space style={{ marginBottom: 16 }}>
          <Button
            type={animalType === 'dog' ? 'primary' : 'default'}
            icon={<FaDog />}
            onClick={() => setAnimalType('dog')}
          >
            Dogs
          </Button>
          <Button
            type={animalType === 'cat' ? 'primary' : 'default'}
            icon={<FaCat />}
            onClick={() => setAnimalType('cat')}
          >
            Cats
          </Button>
        </Space>

        {templates.length === 0 && !loading ? (
          <div style={{ padding: 16, textAlign: 'center' }}>
            No deworming templates found for {animalType}s.
            <Button type="link" onClick={fetchTemplates}>Refresh</Button>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={currentTemplates}
              loading={loading}
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
            />
            {totalPages > 1 && (
              <div style={{ marginTop: '20px', textAlign: 'right'}}>
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
          title={`Edit ${animalType.charAt(0).toUpperCase() + animalType.slice(1)} Deworming Template`}
          visible={visible}
          onOk={handleSubmit}
          onCancel={() => setVisible(false)}
          width={800}
          okText="Save Changes"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="deworm_name"
              label="Deworming Name"
              rules={[{ required: true, message: 'Please enter the deworming name' }]}
            >
              <Input placeholder="Enter deworming name" />
            </Form.Item>
            <Form.Item
              name="age_condition"
              label="Age Condition (in weeks)"
              rules={[{ required: true, message: 'Please enter the age condition' }]}
            >
              <Input placeholder="e.g., '2' or 'last notified+4'" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </ConfigProvider>
  );
};

export default DewormNotify;