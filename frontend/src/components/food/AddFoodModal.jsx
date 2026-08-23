import React, { useState } from 'react';
import { X, Utensils } from 'lucide-react';
import { foodService } from '../../services/foodService';

export const AddFoodModal = ({ isOpen, onClose, restaurantId, restaurantName, onFoodAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    available: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.price || !formData.category.trim()) {
      setErrorMsg('Name, price, and category are required.');
      return;
    }
    if (Number(formData.price) <= 0) {
      setErrorMsg('Price must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      const newFood = await foodService.addFoodItem({
        restaurantId: Number(restaurantId),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        available: formData.available,
      });

      setFormData({ name: '', description: '', price: '', category: 'Main Course', available: true });
      if (onFoodAdded) onFoodAdded(newFood);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils style={{ color: '#ea580c' }} /> Add Food Item for {restaurantName}
          </h3>
          <button onClick={onClose} style={{ color: '#64748b' }}><X size={20} /></button>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Paneer Butter Masala"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Starters">Starters</option>
              <option value="Main Course">Main Course</option>
              <option value="Biryani">Biryani</option>
              <option value="Breads">Breads</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              className="form-input"
              placeholder="e.g. 280.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Rich and creamy gravy made with fresh paneer and butter."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="availableCheck"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#ea580c' }}
            />
            <label htmlFor="availableCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Available for Ordering
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
