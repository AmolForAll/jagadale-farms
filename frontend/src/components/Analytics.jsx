import React, { useState, useEffect } from 'react';

const Analytics = ({ records, summary }) => {
  const [chartData, setChartData] = useState({
    monthlyData: [],
    statusData: [],
    rateDistribution: []
  });

  useEffect(() => {
    if (records && records.length > 0) {
      generateChartData();
    }
  }, [records]);

  const generateChartData = () => {
    // Monthly lending data
    const monthlyMap = {};
    const currentDate = new Date();
    
    // Generate last 6 months data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthKey] = { month: monthName, amount: 0, count: 0, interest: 0 };
    }

    records.forEach(record => {
      const recordDate = new Date(record.startDate);
      const monthKey = recordDate.toISOString().substring(0, 7);
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].amount += record.amount;
        monthlyMap[monthKey].count += 1;
        monthlyMap[monthKey].interest += record.interest || 0;
      }
    });

    const monthlyData = Object.values(monthlyMap);

    // Status distribution
    const statusMap = { Active: 0, Completed: 0, Overdue: 0 };
    records.forEach(record => {
      statusMap[record.status || 'Active']++;
    });

    const statusData = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percentage: records.length > 0 ? ((count / records.length) * 100).toFixed(1) : 0
    }));

    // Interest rate distribution
    const rateRanges = {
      '0-5%': 0,
      '5-10%': 0,
      '10-15%': 0,
      '15-20%': 0,
      '20%+': 0
    };

    records.forEach(record => {
      const rate = record.rateOfInterest;
      if (rate < 5) rateRanges['0-5%']++;
      else if (rate < 10) rateRanges['5-10%']++;
      else if (rate < 15) rateRanges['10-15%']++;
      else if (rate < 20) rateRanges['15-20%']++;
      else rateRanges['20%+']++;
    });

    const rateDistribution = Object.entries(rateRanges).map(([range, count]) => ({
      range,
      count,
      percentage: records.length > 0 ? ((count / records.length) * 100).toFixed(1) : 0
    }));

    setChartData({ monthlyData, statusData, rateDistribution });
  };

  const SimpleBarChart = ({ data, xKey, yKey, color = '#2e7d32', title }) => (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      height: '300px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32', textAlign: 'center' }}>{title}</h3>
      <div style={{ 
        height: '200px', 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'space-around',
        borderBottom: '2px solid #eee',
        borderLeft: '2px solid #eee',
        padding: '10px',
        position: 'relative'
      }}>
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d[yKey]));
          const height = maxValue > 0 ? (item[yKey] / maxValue) * 150 : 0;
          
          return (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1
            }}>
              <div style={{ 
                backgroundColor: color,
                width: '40px',
                height: `${height}px`,
                borderRadius: '4px 4px 0 0',
                marginBottom: '5px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px'
              }}>
                {item[yKey] > 0 && item[yKey]}
              </div>
              <div style={{ 
                fontSize: '11px', 
                textAlign: 'center',
                transform: 'rotate(-45deg)',
                whiteSpace: 'nowrap',
                marginTop: '10px'
              }}>
                {item[xKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const PieChart = ({ data, title, colorMap }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        height: '300px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32', textAlign: 'center' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
          {/* Simple pie representation */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: colorMap[item.status] || colorMap[item.range] || '#ccc',
                  borderRadius: '4px'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {item.status || item.range}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.count} records ({item.percentage}%)
                  </div>
                </div>
                <div style={{ 
                  width: `${total > 0 ? (item.count / total) * 100 : 0}%`, 
                  height: '8px', 
                  backgroundColor: colorMap[item.status] || colorMap[item.range] || '#ccc',
                  borderRadius: '4px',
                  minWidth: '20px'
                }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const KPICard = ({ title, value, subtitle, icon, color = '#2e7d32' }) => (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
      border: `2px solid ${color}`
    }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color, marginBottom: '5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {subtitle}
      </div>
    </div>
  );

  const statusColors = {
    Active: '#28a745',
    Completed: '#007bff',
    Overdue: '#dc3545'
  };

  const rateColors = {
    '0-5%': '#28a745',
    '5-10%': '#17a2b8',
    '10-15%': '#ffc107',
    '15-20%': '#fd7e14',
    '20%+': '#dc3545'
  };

  const avgInterestRate = records.length > 0 
    ? (records.reduce((sum, record) => sum + record.rateOfInterest, 0) / records.length).toFixed(1)
    : 0;

  const totalPrincipal = records.reduce((sum, record) => sum + record.amount, 0);
  const totalInterest = records.reduce((sum, record) => sum + (record.interest || 0), 0);
  const portfolioValue = totalPrincipal + totalInterest;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#2e7d32', marginBottom: '30px', textAlign: 'center' }}>
        📊 Portfolio Analytics
      </h2>

      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <KPICard
          title="Portfolio Value"
          value={`₹${portfolioValue.toLocaleString()}`}
          subtitle="Principal + Interest"
          icon="💼"
          color="#2e7d32"
        />
        <KPICard
          title="Total Principal"
          value={`₹${totalPrincipal.toLocaleString()}`}
          subtitle="Amount lended"
          icon="💰"
          color="#1976d2"
        />
        <KPICard
          title="Expected Interest"
          value={`₹${totalInterest.toLocaleString()}`}
          subtitle="Total earnings"
          icon="📈"
          color="#f57c00"
        />
        <KPICard
          title="Avg Interest Rate"
          value={`${avgInterestRate}%`}
          subtitle="Per annum"
          icon="🎯"
          color="#7b1fa2"
        />
        <KPICard
          title="Active Loans"
          value={chartData.statusData.find(s => s.status === 'Active')?.count || 0}
          subtitle="Currently running"
          icon="🔄"
          color="#28a745"
        />
        <KPICard
          title="Total Records"
          value={records.length}
          subtitle="All time"
          icon="📋"
          color="#6c757d"
        />
      </div>

      {/* Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        <SimpleBarChart
          data={chartData.monthlyData}
          xKey="month"
          yKey="amount"
          color="#2e7d32"
          title="📅 Monthly Lending Trend"
        />

        <PieChart
          data={chartData.statusData}
          title="📊 Portfolio Status Distribution"
          colorMap={statusColors}
        />

        <SimpleBarChart
          data={chartData.monthlyData}
          xKey="month"
          yKey="interest"
          color="#ff9800"
          title="💰 Monthly Interest Income"
        />

        <PieChart
          data={chartData.rateDistribution}
          title="📈 Interest Rate Distribution"
          colorMap={rateColors}
        />
      </div>

      {/* Performance Summary */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>📋 Performance Summary</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🎯 Portfolio Health</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>Active Loans: <strong>{chartData.statusData.find(s => s.status === 'Active')?.count || 0}</strong></div>
              <div>Completed Loans: <strong>{chartData.statusData.find(s => s.status === 'Completed')?.count || 0}</strong></div>
              <div>Overdue Loans: <strong style={{ color: '#dc3545' }}>{chartData.statusData.find(s => s.status === 'Overdue')?.count || 0}</strong></div>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>💡 Key Insights</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>Average Loan Size: <strong>₹{records.length > 0 ? (totalPrincipal / records.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}</strong></div>
              <div>Highest Interest Rate: <strong>{records.length > 0 ? Math.max(...records.map(r => r.rateOfInterest)) : 0}%</strong></div>
              <div>Portfolio ROI: <strong>{totalPrincipal > 0 ? ((totalInterest / totalPrincipal) * 100).toFixed(1) : 0}%</strong></div>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>⚡ Quick Actions</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>Records This Month: <strong>{chartData.monthlyData[chartData.monthlyData.length - 1]?.count || 0}</strong></div>
              <div>Avg Monthly Volume: <strong>₹{chartData.monthlyData.length > 0 ? (chartData.monthlyData.reduce((sum, m) => sum + m.amount, 0) / chartData.monthlyData.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}</strong></div>
              <div>Growth Trend: <strong style={{ color: '#28a745' }}>📈 Positive</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
