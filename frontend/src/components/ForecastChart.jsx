import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ForecastChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="no-data">No forecast data available</div>;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="actual" stackId="1" stroke="#8884d8" fill="#8884d8" name="Actual Usage" />
                    <Area type="monotone" dataKey="predicted" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Predicted Demand" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ForecastChart;
