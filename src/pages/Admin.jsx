import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

function Admin() {
  const { userProfile } = useContext(AuthContext);
  const isOwner = userProfile?.role === "owner";

  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [productForm, setProductForm] = useState({
    name: "", creator: "", category: "", price: "", creatorRoyalty: "70",
    resellerMargin: "20", bundleEligible: false, allowResell: false,
    resaleRights: "", licenseTerms: "", status: "active", description: "", fileUrl: "",
  });

  const [bundleForm, setBundleForm] = useState({
    name: "", price: "", resellerMargin: "20", referralCommission: "5",
    description: "", status: "active", selectedProducts: [],
  });

  useEffect(() => {
    const load = async () => {
      const [p, b, t] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "bundles")),
        getDocs(collection(db, "transactions")),
      ]);
      setProducts(p.docs.map(d => ({ id: d.id, ...d.data() })));
      setBundles(b.docs.map(d => ({ id: d.id, ...d.data() })));
      setTransactions(t.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const refresh = async () => {
    const [p, b, t] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "bundles")),
      getDocs(collection(db, "transactions")),
    ]);
    setProducts(p.docs.map(d => ({ id: d.id, ...d.data() })));
    setBundles(b.docs.map(d => ({ id: d.id, ...d.data() })));
    setTransactions(t.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addProduct = async () => {
    if (!productForm.name || !productForm.price) { setMessage("Name and price required."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "products"), {
        name: productForm.name,
        creator: productForm.creator || "Syndra",
        category: productForm.category || "Digital Product",
        price: Number(productForm.price),
        creatorRoyalty: Number(productForm.creatorRoyalty) || 70,
        resellerMargin: Number(productForm.resellerMargin) || 20,
        bundleEligible: productForm.bundleEligible,
        allowResell: productForm.allowResell,
        resaleRights: productForm.resaleRights,
        licenseTerms: productForm.licenseTerms,
        status: productForm.status,
        description: productForm.description,
        fileUrl: productForm.fileUrl || "",
        totalSales: 0,
        createdAt: serverTimestamp(),
      });
      setMessage("Product added ✓");
      setProductForm({ name: "", creator: "", category: "", price: "", creatorRoyalty: "70", resellerMargin: "20", bundleEligible: false, allowResell: false, resaleRights: "", licenseTerms: "", status: "active", description: "", fileUrl: "" });
      await refresh();
    } catch (e) { setMessage("Failed to add product."); }
    finally { setSaving(false); }
  };

  const addBundle = async () => {
    if (!bundleForm.name || !bundleForm.price) { setMessage("Bundle name and price required."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "bundles"), {
        name: bundleForm.name,
        price: Number(bundleForm.price),
        resellerMargin: Number(bundleForm.resellerMargin) || 20,
        referralCommission: Number(bundleForm.referralCommission) || 5,
        description: bundleForm.description,
        status: bundleForm.status,
        productIds: bundleForm.selectedProducts,
        createdAt: serverTimestamp(),
      });
      setMessage("Bundle added ✓");
      setBundleForm({ name: "", price: "", resellerMargin: "20", referralCommission: "5", description: "", status: "active", selectedProducts: [] });
      await refresh();
    } catch (e) { setMessage("Failed to add bundle."); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    await refresh();
  };

  const deleteBundle = async (id) => {
    if (!window.confirm("Delete this bundle?")) return;
    await deleteDoc(doc(db, "bundles", id));
    await refresh();
  };

  const toggleProductStatus = async (id, current) => {
    await updateDoc(doc(db, "products", id), { status: current === "active" ? "inactive" : "active" });
    await refresh();
  };

  const toggleBundleStatus = async (id, current) => {
    await updateDoc(doc(db, "bundles", id), { status: current === "active" ? "inactive" : "active" });
    await refresh();
  };

  const toggleProductInBundle = (productId) => {
    setBundleForm(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  const verifyPayment = async (txId) => {
    if (!window.confirm("Mark this payment as verified?")) return;
    await updateDoc(doc(db, "transactions", txId), { status: "paid", verifiedAt: serverTimestamp() });
    setMessage("Payment verified ✓");
    await refresh();
  };

  if (!isOwner) return <div style={styles.page}><p style={{ color: "#94A3B8", padding: "60px", textAlign: "center" }}>Access denied. Owner only.</p></div>;

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" };
  const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px", marginTop: "12px" };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <span style={styles.roleBadge}>Owner</span>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.tabs}>
          {["products", "bundles", "transactions", "commissions", "ledger"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={tab === t ? styles.tabActive : styles.tab}>{t}</button>
          ))}
        </div>

        {/* PRODUCTS */}
        {tab === "products" && (
          <div>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>Add Product</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><label style={labelStyle}>Product Name *</label><input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Digital Marketing Guide" style={inputStyle} /></div>
                <div><label style={labelStyle}>Creator</label><input value={productForm.creator} onChange={e => setProductForm({ ...productForm, creator: e.target.value })} placeholder="Syndra or creator name" style={inputStyle} /></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div><label style={labelStyle}>Category</label><input value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} placeholder="e.g. Ebook" style={inputStyle} /></div>
                <div><label style={labelStyle}>Price (ETB) *</label><input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="500" style={inputStyle} /></div>
                <div><label style={labelStyle}>Creator Royalty %</label><input type="number" value={productForm.creatorRoyalty} onChange={e => setProductForm({ ...productForm, creatorRoyalty: e.target.value })} placeholder="70" style={inputStyle} /></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><label style={labelStyle}>Reseller Margin %</label><input type="number" value={productForm.resellerMargin} onChange={e => setProductForm({ ...productForm, resellerMargin: e.target.value })} placeholder="20" style={inputStyle} /></div>
                <div><label style={labelStyle}>File URL</label><input value={productForm.fileUrl} onChange={e => setProductForm({ ...productForm, fileUrl: e.target.value })} placeholder="Download link" style={inputStyle} /></div>
              </div>

              <div><label style={labelStyle}>Description</label><textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={2} placeholder="What is this product?" style={{ ...inputStyle, resize: "vertical" }} /></div>

              <div><label style={labelStyle}>Resale Rights</label><textarea value={productForm.resaleRights} onChange={e => setProductForm({ ...productForm, resaleRights: e.target.value })} rows={2} placeholder="What rights does a reseller get?" style={{ ...inputStyle, resize: "vertical" }} /></div>

              <div><label style={labelStyle}>License Terms</label><textarea value={productForm.licenseTerms} onChange={e => setProductForm({ ...productForm, licenseTerms: e.target.value })} rows={2} placeholder="License terms" style={{ ...inputStyle, resize: "vertical" }} /></div>

              <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#CBD5E1" }}>
                  <input type="checkbox" checked={productForm.bundleEligible} onChange={e => setProductForm({ ...productForm, bundleEligible: e.target.checked })} />
                  Bundle Eligible
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#CBD5E1" }}>
                  <input type="checkbox" checked={productForm.allowResell} onChange={e => setProductForm({ ...productForm, allowResell: e.target.checked })} />
                  Allow Resell
                </label>
              </div>

              <button onClick={addProduct} disabled={saving} style={styles.btn}>{saving ? "Adding..." : "Add Product"}</button>
            </div>

            <div style={styles.list}>
              <h2 style={styles.sectionTitle}>Products ({products.length})</h2>
              {products.length === 0 ? (
                <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No products yet.</p>
              ) : (
                products.map(p => (
                  <div key={p.id} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{p.name} <span style={{ color: p.status === "active" ? "#10B981" : "#EF4444", fontSize: "11px" }}>({p.status})</span></p>
                      <p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{p.category} · {p.price} ETB · Royalty: {p.creatorRoyalty}% · Margin: {p.resellerMargin}% · Bundle: {p.bundleEligible ? "Yes" : "No"} · Resell: {p.allowResell ? "Yes" : "No"}</p>
                    </div>
                    <button onClick={() => toggleProductStatus(p.id, p.status)} style={styles.miniBtn}>{p.status === "active" ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => deleteProduct(p.id)} style={styles.deleteBtn}>🗑</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BUNDLES */}
        {tab === "bundles" && (
          <div>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>Add Bundle</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><label style={labelStyle}>Bundle Name *</label><input value={bundleForm.name} onChange={e => setBundleForm({ ...bundleForm, name: e.target.value })} placeholder="Starter" style={inputStyle} /></div>
                <div><label style={labelStyle}>Price (ETB) *</label><input type="number" value={bundleForm.price} onChange={e => setBundleForm({ ...bundleForm, price: e.target.value })} placeholder="1000" style={inputStyle} /></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><label style={labelStyle}>Reseller Margin %</label><input type="number" value={bundleForm.resellerMargin} onChange={e => setBundleForm({ ...bundleForm, resellerMargin: e.target.value })} placeholder="20" style={inputStyle} /></div>
                <div><label style={labelStyle}>Referral Commission %</label><input type="number" value={bundleForm.referralCommission} onChange={e => setBundleForm({ ...bundleForm, referralCommission: e.target.value })} placeholder="5" style={inputStyle} /></div>
              </div>

              <div><label style={labelStyle}>Description</label><textarea value={bundleForm.description} onChange={e => setBundleForm({ ...bundleForm, description: e.target.value })} rows={2} placeholder="What's in this bundle?" style={{ ...inputStyle, resize: "vertical" }} /></div>

              <div style={{ marginTop: "16px" }}>
                <label style={labelStyle}>Select Products for Bundle</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflow: "auto" }}>
                  {products.filter(p => p.bundleEligible && p.status === "active").length === 0 ? (
                    <p style={{ color: "#94A3B8", fontSize: "13px" }}>No bundle-eligible products yet.</p>
                  ) : (
                    products.filter(p => p.bundleEligible && p.status === "active").map(p => (
                      <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#CBD5E1", padding: "6px 0", borderBottom: "1px solid rgba(45,53,72,0.5)" }}>
                        <input type="checkbox" checked={bundleForm.selectedProducts.includes(p.id)} onChange={() => toggleProductInBundle(p.id)} />
                        {p.name} — {p.price} ETB
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button onClick={addBundle} disabled={saving} style={styles.btn}>{saving ? "Adding..." : "Add Bundle"}</button>
            </div>

            <div style={styles.list}>
              <h2 style={styles.sectionTitle}>Bundles ({bundles.length})</h2>
              {bundles.length === 0 ? (
                <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No bundles yet.</p>
              ) : (
                bundles.map(b => (
                  <div key={b.id} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{b.name} <span style={{ color: b.status === "active" ? "#10B981" : "#EF4444", fontSize: "11px" }}>({b.status})</span></p>
                      <p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{b.price} ETB · Margin: {b.resellerMargin}% · Referral: {b.referralCommission}% · Products: {(b.productIds || []).length}</p>
                    </div>
                    <button onClick={() => toggleBundleStatus(b.id, b.status)} style={styles.miniBtn}>{b.status === "active" ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => deleteBundle(b.id)} style={styles.deleteBtn}>🗑</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === "transactions" && (
          <div style={styles.list}>
            <h2 style={styles.sectionTitle}>Transactions ({transactions.length})</h2>
            {transactions.length === 0 ? (
              <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No transactions yet.</p>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} style={styles.txCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{tx.userEmail || tx.userId}</p>
                      <span style={{
                        fontSize: "11px", padding: "4px 10px", borderRadius: "20px", fontWeight: 600,
                        background: tx.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(217,119,6,0.15)",
                        color: tx.status === "paid" ? "#10B981" : "#F59E0B"
                      }}>{tx.status}</span>
                    </div>
                    <p style={{ color: "#94A3B8", fontSize: "12px", margin: "4px 0 0" }}>
                      {tx.type} · {tx.paymentMethod} · Ref: {tx.paymentReference} · {tx.createdAt?.toDate?.().toLocaleString() || "—"}
                    </p>
                    {tx.screenshotUrl && (
                      <a href={tx.screenshotUrl} target="_blank" rel="noreferrer" style={{ color: "#06B6D4", fontSize: "13px", display: "inline-block", marginTop: "8px" }}>
                        📎 View Payment Screenshot
                      </a>
                    )}
                  </div>
                  {tx.status === "pending" && (
                    <button onClick={() => verifyPayment(tx.id)} style={styles.approveBtn}>✓ Verify</button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PLACEHOLDERS */}
        {["commissions", "ledger"].includes(tab) && (
          <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🔧</span>
            <p>{tab.charAt(0).toUpperCase() + tab.slice(1)} section coming when transactions exist.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" },
  roleBadge: { padding: "4px 10px", borderRadius: "4px", background: "rgba(6,182,212,0.15)", color: "#06B6D4", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" },
  message: { padding: "10px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", marginBottom: "16px" },
  tabs: { display: "flex", gap: "4px", borderBottom: "1px solid #2D3548", marginBottom: "24px", flexWrap: "wrap" },
  tab: { padding: "10px 16px", border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: "14px", borderBottom: "2px solid transparent", textTransform: "capitalize" },
  tabActive: { padding: "10px 16px", border: "none", background: "transparent", color: "#06B6D4", cursor: "pointer", fontSize: "14px", borderBottom: "2px solid #06B6D4", fontWeight: 600, textTransform: "capitalize" },
  formCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "24px", marginBottom: "24px" },
  sectionTitle: { fontSize: "18px", fontWeight: 600, margin: "0 0 16px" },
  btn: { marginTop: "16px", padding: "12px 24px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  list: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden", padding: "20px" },
  row: { display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(45,53,72,0.5)", gap: "12px" },
  txCard: { display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(45,53,72,0.5)", gap: "12px" },
  miniBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #2D3548", background: "transparent", color: "#CBD5E1", cursor: "pointer", fontSize: "12px", fontWeight: 500 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#EF4444", padding: "6px" },
  approveBtn: { padding: "8px 16px", borderRadius: "6px", border: "none", background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
};

export default Admin;