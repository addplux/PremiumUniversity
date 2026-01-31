import { useState, useEffect } from 'react';
import axios from 'axios';
import './ECatalogue.css';

const ECatalogue = () => {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchItems();
    }, [category]); // Re-fetch when category changes

    const fetchItems = async () => {
        setLoading(true);
        try {
            const query = category ? `?category=${category}` : '';
            const res = await axios.get(`/api/ecatalogue${query}`);
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const handleCheckout = async () => {
        try {
            const payload = {
                items: cart.map(i => ({ itemId: i._id, quantity: i.qty }))
            };
            await axios.post('/api/ecatalogue/checkout', payload);
            alert('Requisition generated successfully!');
            setCart([]);
        } catch (error) {
            alert('Checkout failed');
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);

    return (
        <div className="catalogue-page yard-store-theme">
            <header className="cat-header">
                <div>
                    <h1 className="yard-title">Yard Marketplace</h1>
                    <p className="yard-subtitle">Internal Procurement Store</p>
                </div>
                <div className="cart-summary premium-pill">
                    <span>🛒 {cart.length} Items</span>
                    <strong>${cartTotal.toLocaleString()}</strong>
                    <button
                        className="btn btn-primary btn-sm ml-2"
                        disabled={cart.length === 0}
                        onClick={handleCheckout}
                    >
                        Checkout
                    </button>
                </div>
            </header>

            <div className="cat-layout">
                <aside className="cat-sidebar">
                    <h3>Categories</h3>
                    <ul>
                        <li onClick={() => setCategory('')} className={!category ? 'active' : ''}>All Categories</li>
                        {['Office Supplies', 'IT Equipment', 'Furniture', 'Lab Equipment'].map(c => (
                            <li
                                key={c}
                                onClick={() => setCategory(c)}
                                className={category === c ? 'active' : ''}
                            >
                                {c}
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="cat-grid">
                    {loading ? <p>Loading products...</p> : items.length === 0 ? (
                        <p>No items found.</p>
                    ) : items.map(item => (
                        <div key={item._id} className="product-card">
                            <div className="img-placeholder">Image</div>
                            <div className="product-info">
                                <h4>{item.name}</h4>
                                <p className="price">${item.unitPrice}</p>
                                <button className="btn btn-outline btn-sm w-full" onClick={() => addToCart(item)}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                    {/* Mock Items for Demo if API returns empty */}
                    {items.length === 0 && !loading && (
                        <>
                            <div className="product-card">
                                <div className="img-placeholder">💻</div>
                                <div className="product-info">
                                    <h4>Dell Latitude Laptop</h4>
                                    <p className="price">$1,200</p>
                                    <button className="btn btn-outline btn-sm w-full" onClick={() => addToCart({ _id: '1', name: 'Laptop', unitPrice: 1200 })}>Add to Cart</button>
                                </div>
                            </div>
                            <div className="product-card">
                                <div className="img-placeholder">🪑</div>
                                <div className="product-info">
                                    <h4>Ergonomic Chair</h4>
                                    <p className="price">$250</p>
                                    <button className="btn btn-outline btn-sm w-full" onClick={() => addToCart({ _id: '2', name: 'Chair', unitPrice: 250 })}>Add to Cart</button>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ECatalogue;
