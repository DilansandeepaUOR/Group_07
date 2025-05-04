import React, { useState, useEffect } from 'react';
import { Table, Select, message } from 'antd';

const SentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      
      const response = await fetch(`/api/sent-notifications?${params.toString()}`);
      const data = await response.json();
      setNotifications(data);
    } catch {
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Pet Name',
      dataIndex: 'Pet_name',
      key: 'Pet_name'
    },
    {
      title: 'Owner',
      dataIndex: 'Owner_name',
      key: 'Owner_name'
    },
    {
      title: 'Sent Date',
      dataIndex: 'sent_date',
      key: 'sent_date',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'sent' ? 'green' : status === 'failed' ? 'red' : 'orange' }}>
          {status.toUpperCase()}
        </span>
      )
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
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
      </div>
      
      <Table 
        columns={columns} 
        dataSource={notifications} 
        loading={loading}
        rowKey="notification_id"
      />
    </div>
  );
};

export default SentNotifications;