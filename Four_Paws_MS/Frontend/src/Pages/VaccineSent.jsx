import React, { useState, useEffect } from 'react';
import { Table, Select, message, Card, Typography, Tag, Button } from 'antd';

const { Title } = Typography;

const SentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    console.log('VaccineSent component mounted');
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      
      console.log('Fetching notifications with params:', params.toString());
      const response = await fetch(`http://localhost:3001/api/notification-history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Pet Name',
      dataIndex: 'Pet_name',
      key: 'Pet_name',
      width: '15%'
    },
    {
      title: 'Owner',
      dataIndex: 'Owner_name',
      key: 'Owner_name',
      width: '15%'
    },
    {
      title: 'Template',
      dataIndex: 'template_name',
      key: 'template_name',
      width: '20%'
    },
    {
      title: 'Sent Date',
      dataIndex: 'sent_date',
      key: 'sent_date',
      width: '15%',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: '25%'
    }
  ];

  return (
    <Card style={{ margin: '24px' }}>
      <Title level={2}>Sent Notifications History</Title>
      
      <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
        <Select
          style={{ width: 200 }}
          placeholder="Filter by status"
          allowClear
          onChange={(value) => setFilter({ ...filter, status: value })}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="sent">Sent</Select.Option>
          <Select.Option value="failed">Failed</Select.Option>
        </Select>
        <Button onClick={fetchNotifications}>Refresh</Button>
        <Button 
  type="primary" 
  onClick={async () => {
    try {
      await fetch('http://localhost:3001/api/trigger-notifications', {
        method: 'POST'
      });
      message.success('Notifications processed successfully');
      fetchNotifications();
    } catch {
      message.error('Failed to trigger notifications');
    }
  }}
>
  Process Notifications Now
</Button>
      </div>
      
      {notifications.length === 0 && !loading ? (
        <div style={{ padding: 16, textAlign: 'center' }}>
          No notifications found. 
          <Button type="link" onClick={fetchNotifications}>Refresh</Button>
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={notifications} 
          loading={loading}
          rowKey="notification_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
};

export default SentNotifications;