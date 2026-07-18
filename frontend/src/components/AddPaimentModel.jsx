function AddPaymentModal({ onClose, onAddPayment ,setNewInvoiceData , setShowAddInvoice,  t , handleAddPayment, newInvoiceData , showAddInvoice     }) {
    return (
        <div className="modal-overlay" onClick={() => setShowAddInvoice(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>{t.recordPayment}</h2>
            <form onSubmit={handleAddPayment}>
              <div className="form-group">
                <label>{t.paymentAmount}</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required
                  placeholder="e.g. 150"
                  value={newInvoiceData.amount}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.transactionDate}</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newInvoiceData.date}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.method}</label>
                <select 
                  className="form-control"
                  value={newInvoiceData.method}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, method: e.target.value })}
                >
                  
                  <option value="Cash">{t.cash}</option>
                
                </select>
              </div>
             

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddInvoice(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary">{t.logPayment}</button>
              </div>
            </form>
          </div>
        </div>
    )
}
export default AddPaymentModal;