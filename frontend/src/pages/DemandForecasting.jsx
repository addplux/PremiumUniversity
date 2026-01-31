import { useState, useEffect } from 'react';
import axios from 'axios';
import ForecastChart from '../components/ForecastChart';
import './DemandForecasting.css';

const DemandForecasting = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [forecastData, setForecastData] = useState([]);

    // Mock products for the dropdown (in real app, fetch from API)
    const products = [
        { id: '1', name: 'Paper A4' },
        { id: '2', name: 'Printer Toner' },
        { id: '3', name: 'Whiteboard Markers' }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/forecasting/dashboard');
            if (res.data.success) {
                setDashboardData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            // Fallback mock data if API fails (optional, mostly for dev resilience)
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateForecast = async () => {
        if (!selectedProduct) return;
        try {
            setLoading(true);
            // Simulate generating for a specific product
            const res = await axios.get(`/api/forecasting/generate?productId=${selectedProduct}&period=Monthly`);
            if (res.data.success) {
                // Fetch the updated forecast history for the chart
                // For MVP demo, we'll set mock specific data
                const mockChartData = [
                    { month: 'Jan', actual: 400, predicted: 410 },
                    { month: 'Feb', actual: 450, predicted: 440 },
                    { month: 'Mar', actual: 420, predicted: 430 },
                    { month: 'Apr', actual: 480, predicted: 460 },
                    { month: 'May', actual: null, predicted: 490 }, // Future
                    { month: 'Jun', actual: null, predicted: 510 }  // Future
                ];
                setForecastData(mockChartData);
                alert('New forecast model generated successfully!');
            }
        } catch (error) {
            console.error('Error generating forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !dashboardData) return <div className="loading-state">Loading AI Models...</div>;

    return (
        <div className="demand-forecasting-page">
            <div className="page-header">
                <h1>AI Demand Forecasting</h1>
                <p>Predict inventory needs using advanced machine learning models</p>
            </div>

            {/* Metrics Overview */}
            {dashboardData && (
                <div className="metrics-grid">
                    <div className="metric-card">
                        <h3>Forecast Accuracy</h3>
                        <div className="metric-value">{dashboardData.accuracy}%</div>
                        <span className="metric-trend positive">↑ 2.1% this month</span>
                    </div>
                    <div className="metric-card">
                        <h3>Active Models</h3>
                        <div className="metric-value">{dashboardData.totalForecasts}</div>
                        <span>Products tracked</span>
                    </div>
                    <div className="metric-card">
                        <h3>Predicted Savings</h3>
                        <div className="metric-value">$12,450</div>
                        <span className="metric-trend positive">From optimized stock</span>
                    </div>
                </div>
            )}

            <div className="main-content-grid">
                {/* Control Panel */}
                <div className="control-panel card">
                    <h3>Generate Forecast</h3>
                    <div className="form-group">
                        <label>Select Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="form-control"
                        >
                            <option value="">-- Choose Product --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Algorithm</label>
                        <select className="form-control" disabled>
                            <option>Ensemble (SMA + Linear Regression)</option>
                        </select>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateForecast}
                        disabled={!selectedProduct || loading}
                    >
                        {loading ? 'Analyzing...' : 'Run Prediction Model'}
                    </button>
                </div>

                {/* Chart Area */}
                <div className="chart-panel card">
                    <h3>Demand Trend & Prediction</h3>
                    {forecastData.length > 0 ? (
                        <ForecastChart data={forecastData} />
                    ) : (
                        <div className="empty-state-chart">
                            <p>Select a product and run the prediction model to view insights.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Movers */}
            <div className="top-movers card mt-6">
                <h3>Top Predicted Movers (Next 30 Days)</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Current Stock</th>
                            <th>Predicted Demand</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData?.topPredictedProducts?.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>450</td> {/* Mock current stock */}
                                <td>{item.predicted} <span className="trend-badge">{item.trend}</span></td>
                                <td>
                                    <button className="btn btn-sm btn-secondary">Order Now</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DemandForecasting;
