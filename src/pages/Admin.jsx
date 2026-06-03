import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getAdminOverview,
  getTopProducts,
  getRecentUsers,
  getRecentClicks,
} from "../services/analyticsService";
import {
  getPendingProducts,
  getApprovedProducts,
  updateProductStatus,
  deleteProduct,
} from "../services/productService";
import {
  getPendingPromoters,
  getApprovedPromoters,
  updatePromoterStatus,
} from "../services/promotionService";
import {
  getTeamMembers,
  getAllUsers,
  updateUserRole,
  getTeamMemberStats,
} from "../services/adminService";
import {
  sendProductApprovedEmail,
  sendProductRejectedEmail,
  sendPromoterApprovedEmail,
  sendPromoterRejectedEmail,
} from "../services/emailService";
import {
  getPendingWithdrawals,
  updateWithdrawalStatus,
  markWithdrawalPaid,
} from "../services/withdrawalService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function Admin() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const adminRole = userProfile?.role;
  const isOwner = adminRole === "owner";
  const isAdmin = adminRole === "admin" || isOwner;

  const [stats, setStats] = useState({ users: 0, products: 0, clicks: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentClicks, setRecentClicks] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [pendingPromoters, setPendingPromoters] = useState([]);
  const [approvedPromoters, setApprovedPromoters] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMemberStats, setSelectedMemberStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [teamTab, setTeamTab] = useState("members");

  const refreshWithdrawals = async () => {
    const [pending, approved] = await Promise.all([
      getPendingWithdrawals(),
      getDocs(query(collection(db, "withdrawals"), where("status", "==", "approved"))),
    ]);
    setPendingWithdrawals(pending);
    setApprovedWithdrawals(approved.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overview, users, clicks, top, pending, approved, pendingPromos, approvedPromos] =
          await Promise.all([
            getAdminOverview(),
            getRecentUsers(5),
            getRecentClicks(8),
            getTopProducts(6),
            getPendingProducts(),
            getApprovedProducts(),
            getPendingPromoters(),
            getApprovedPromoters(10),
          ]);

        setStats(overview);
        setRecentUsers(users);
        setRecentClicks(clicks);
        setTopProducts(top);
        setPendingProducts(pending);
        setApprovedProducts(approved);
        setPendingPromoters(pendingPromos);
        setApprovedPromoters(approvedPromos);
        await refreshWithdrawals();
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshPending = async () => {
    const pending = await getPendingProducts();
    setPendingProducts(pending);
  };

  const refreshApproved = async () => {
    const approved = await getApprovedProducts();
    setApprovedProducts(approved);
  };

  const handleApprove = async (productId) => {
    setUpdatingProductId(productId);
    try {
      await updateProductStatus(productId, "approved", currentUser.uid);
      await Promise.all([refreshPending(), refreshApproved()]);

      const product = [...pendingProducts, ...approvedProducts].find((p) => p.id === productId);
      if (product?.creatorEmail) {
        sendProductApprovedEmail(product.creatorEmail, product.title || product.name);
      }
    } catch (error) {
      console.error("Unable to approve product:", error);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleReject = async (productId) => {
    setUpdatingProductId(productId);
    try {
      await updateProductStatus(productId, "rejected", currentUser.uid);
      await refreshPending();

      const product = pendingProducts.find((p) => p.id === productId);
      if (product?.creatorEmail) {
        sendProductRejectedEmail(product.creatorEmail, product.title || product.name);
      }
    } catch (error) {
      console.error("Unable to reject product:", error);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Permanently delete this product?")) return;
    setUpdatingProductId(productId);
    try {
      await deleteProduct(productId);
      await Promise.all([refreshPending(), refreshApproved()]);
    } catch (error) {
      console.error("Unable to delete product:", error);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handlePromoterApprove = async (promoterId) => {
    setUpdatingProductId(promoterId);
    try {
      await updatePromoterStatus(promoterId, "approved");
      const [pending, approved] = await Promise.all([getPendingPromoters(), getApprovedPromoters(10)]);
      setPendingPromoters(pending);
      setApprovedPromoters(approved);

      const promoter = approved.find((p) => p.id === promoterId) || pendingPromoters.find((p) => p.id === promoterId);
      if (promoter?.email) {
        sendPromoterApprovedEmail(promoter.email, promoter.slug);
      }
    } catch (error) {
      console.error("Failed to approve promoter:", error);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handlePromoterReject = async (promoterId) => {
    setUpdatingProductId(promoterId);
    try {
      await updatePromoterStatus(promoterId, "rejected");
      const pending = await getPendingPromoters();
      setPendingPromoters(pending);

      const promoter = pendingPromoters.find((p) => p.id === promoterId);
      if (promoter?.email) {
        sendPromoterRejectedEmail(promoter.email);
      }
    } catch (error) {
      console.error("Failed to reject promoter:", error);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleWithdrawApprove = async (id) => {
    await updateWithdrawalStatus(id, "approved", currentUser.uid);
    await refreshWithdrawals();
  };

  const handleWithdrawReject = async (id) => {
    await updateWithdrawalStatus(id, "rejected", currentUser.uid);
    await refreshWithdrawals();
  };

  const handleMarkPaid = async (id) => {
    await markWithdrawalPaid(id, currentUser.uid);
    await refreshWithdrawals();
  };

  const loadTeamData = async () => {
    const [members, users] = await Promise.all([getTeamMembers(), getAllUsers()]);
    setTeamMembers(members);
    setAllUsers(users);
  };

  const handleAddTeamMember = async (uid, role) => {
    await updateUserRole(uid, role);
    setShowAddModal(false);
    await loadTeamData();
  };

  const handleRemoveTeamMember = async (uid) => {
    if (!window.confirm("Remove this team member?")) return;
    await updateUserRole(uid, "user");
    await loadTeamData();
  };

  const handleViewStats = async (uid) => {
    const stats = await getTeamMemberStats(uid);
    setSelectedMemberStats(stats);
    setTeamTab("stats");
  };

  const formatDate = (value) => {
    if (!value || !value.toDate) return "-";
    return value.toDate().toLocaleString();
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h2>Admin Dashboard</h2>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {isOwner ? "Owner Dashboard" : isAdmin ? "Admin Dashboard" : "Moderator Dashboard"}
          </h1>
          <p style={styles.subtitle}>
            {isOwner
              ? "Full platform control, team management, and analytics."
              : isAdmin
              ? "Review products, promoters, and view analytics."
              : "Review and manage pending products."}
          </p>
        </div>
      </div>

      {(isOwner || isAdmin) && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><h3>Total Users</h3><p style={styles.statValue}>{stats.users}</p></div>
          <div style={styles.statCard}><h3>Total Products</h3><p style={styles.statValue}>{stats.products}</p></div>
          <div style={styles.statCard}><h3>Total Clicks</h3><p style={styles.statValue}>{stats.clicks}</p></div>
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Product Review</h2>
        <div style={styles.reviewGrid}>
          {pendingProducts.length > 0 ? (
            pendingProducts.map((product) => (
              <div key={product.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>
                    <h3 style={styles.reviewTitle}>{product.title || product.name}</h3>
                    <p style={styles.reviewMeta}>{product.category || "Uncategorized"}</p>
                  </div>
                  <span style={styles.reviewStatus}>{product.status}</span>
                </div>
                <p style={styles.reviewDescription}>{product.description}</p>
                <div style={styles.reviewFooter}>
                  <div><p style={styles.reviewLabel}>Creator</p><p style={styles.reviewValue}>{product.creatorEmail || "Unknown"}</p></div>
                  <div><p style={styles.reviewLabel}>Price</p><p style={styles.reviewValue}>${product.price?.toFixed(2) ?? "0.00"}</p></div>
                </div>
                <div style={styles.reviewActions}>
                  <button onClick={() => handleApprove(product.id)} disabled={updatingProductId === product.id} style={styles.approveBtn}>
                    {updatingProductId === product.id ? "…" : "Approve"}
                  </button>
                  <button onClick={() => handleReject(product.id)} disabled={updatingProductId === product.id} style={styles.rejectBtn}>
                    Reject
                  </button>
                  <button onClick={() => handleDelete(product.id)} disabled={updatingProductId === product.id} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>No pending products.</div>
          )}
        </div>
      </div>

      {(isOwner || isAdmin) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Approved Products</h2>
          <div style={styles.reviewGrid}>
            {approvedProducts.length > 0 ? (
              approvedProducts.map((product) => (
                <div key={product.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div>
                      <h3 style={styles.reviewTitle}>{product.title || product.name}</h3>
                      <p style={styles.reviewMeta}>{product.category || "Uncategorized"}</p>
                    </div>
                    <span style={{ ...styles.reviewStatus, background: "rgba(34,197,94,0.14)", color: "#bbf7d0" }}>approved</span>
                  </div>
                  <p style={styles.reviewDescription}>{product.description}</p>
                  <div style={styles.reviewFooter}>
                    <div><p style={styles.reviewLabel}>Creator</p><p style={styles.reviewValue}>{product.creatorEmail || "Unknown"}</p></div>
                    <div><p style={styles.reviewLabel}>Price</p><p style={styles.reviewValue}>${product.price?.toFixed(2) ?? "0.00"}</p></div>
                  </div>
                  <div style={styles.reviewActions}>
                    <button onClick={() => handleDelete(product.id)} disabled={updatingProductId === product.id} style={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>No approved products yet.</div>
            )}
          </div>
        </div>
      )}

      {(isOwner || isAdmin) && (
        <>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Promoter Applications</h2>
            <div style={styles.reviewGrid}>
              {pendingPromoters.length > 0 ? (
                pendingPromoters.map((promo) => (
                  <div key={promo.id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <div><h3 style={styles.reviewTitle}>@{promo.slug}</h3><p style={styles.reviewMeta}>{promo.email}</p></div>
                      <span style={styles.reviewStatus}>{promo.status}</span>
                    </div>
                    <div style={styles.reviewFooter}>
                      <div><p style={styles.reviewLabel}>Instagram</p><p style={styles.reviewValue}>{promo.socialStats?.instagram?.handle || "-"} ({promo.socialStats?.instagram?.followers || 0})</p></div>
                      <div><p style={styles.reviewLabel}>TikTok</p><p style={styles.reviewValue}>{promo.socialStats?.tiktok?.handle || "-"} ({promo.socialStats?.tiktok?.followers || 0})</p></div>
                    </div>
                    <p style={styles.reviewDescription}>{promo.experience || "No experience listed."}</p>
                    <div style={styles.reviewActions}>
                      <button onClick={() => handlePromoterApprove(promo.id)} disabled={updatingProductId === promo.id} style={styles.approveBtn}>Approve</button>
                      <button onClick={() => handlePromoterReject(promo.id)} disabled={updatingProductId === promo.id} style={styles.rejectBtn}>Reject</button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>No pending promoter applications.</div>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Approved Promoters</h2>
            <div style={styles.productGrid}>
              {approvedPromoters.length > 0 ? (
                approvedPromoters.map((promo) => (
                  <div key={promo.id} style={styles.productCard}>
                    <div style={styles.productHeader}><span style={styles.productName}>@{promo.slug}</span><span style={styles.productBadge}>{promo.totalClicks || 0} clicks</span></div>
                    <p style={styles.productCategory}>{promo.email}</p>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>No approved promoters yet.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* WITHDRAWAL REQUESTS */}
      {(isOwner || isAdmin) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Withdrawal Requests</h2>
          <div style={styles.reviewGrid}>
            {pendingWithdrawals.length > 0 ? (
              pendingWithdrawals.map((w) => (
                <div key={w.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div>
                      <h3 style={styles.reviewTitle}>${w.amount.toFixed(2)}</h3>
                      <p style={styles.reviewMeta}>{w.email} · {w.role}</p>
                    </div>
                    <span style={styles.reviewStatus}>{w.status}</span>
                  </div>
                  <div style={styles.reviewActions}>
                    <button onClick={() => handleWithdrawApprove(w.id)} style={styles.approveBtn}>Approve</button>
                    <button onClick={() => handleWithdrawReject(w.id)} style={styles.rejectBtn}>Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>No pending withdrawal requests.</div>
            )}
          </div>
        </div>
      )}

      {/* APPROVED — READY TO PAY */}
      {(isOwner || isAdmin) && approvedWithdrawals.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Approved — Ready to Pay</h2>
          <div style={styles.reviewGrid}>
            {approvedWithdrawals.map((w) => (
              <div key={w.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>
                    <h3 style={styles.reviewTitle}>${w.amount.toFixed(2)}</h3>
                    <p style={styles.reviewMeta}>{w.email} · {w.role}</p>
                  </div>
                  <span style={{ ...styles.reviewStatus, background: "rgba(34,197,94,0.14)", color: "#bbf7d0" }}>approved</span>
                </div>
                <div style={styles.reviewActions}>
                  <button onClick={() => handleMarkPaid(w.id)} style={styles.approveBtn}>Mark as Paid</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwner && (
        <div style={styles.section}>
          <div style={{ display: "flex", gap: "16px", marginBottom: "18px" }}>
            <button onClick={() => { setTeamTab("members"); setSelectedMemberStats(null); }} style={teamTab === "members" ? styles.tabActive : styles.tab}>Team Members</button>
            {selectedMemberStats && (
              <button onClick={() => setTeamTab("stats")} style={teamTab === "stats" ? styles.tabActive : styles.tab}>Member Stats</button>
            )}
            <button onClick={async () => { await loadTeamData(); setShowAddModal(true); }} style={styles.approveBtn}>+ Add Member</button>
          </div>

          {teamTab === "members" && (
            <div style={styles.table}>
              <div style={styles.tableHeader}><span>Email</span><span>Role</span><span>Actions</span></div>
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} style={styles.tableRow}>
                    <span>{member.email}</span>
                    <span style={{ textTransform: "capitalize", fontWeight: 700, color: member.role === "owner" ? "#fbbf24" : "#a5b4ff" }}>{member.role}</span>
                    <span style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleViewStats(member.id)} style={styles.viewBtn}>Stats</button>
                      {member.role !== "owner" && (
                        <button onClick={() => handleRemoveTeamMember(member.id)} style={styles.deleteBtn}>Remove</button>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", color: "#94a3b8" }}>No team members yet.</div>
              )}
            </div>
          )}

          {teamTab === "stats" && selectedMemberStats && (
            <div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}><h3>Total Reviewed</h3><p style={styles.statValue}>{selectedMemberStats.total}</p></div>
                <div style={styles.statCard}><h3>Approved</h3><p style={styles.statValue}>{selectedMemberStats.approved}</p></div>
                <div style={styles.statCard}><h3>Rejected</h3><p style={styles.statValue}>{selectedMemberStats.rejected}</p></div>
              </div>
            </div>
          )}

          {showAddModal && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <h3>Add Team Member</h3>
                <p style={{ color: "#94a3b8", marginBottom: "16px" }}>Select a user and assign a role.</p>
                <div style={{ maxHeight: "300px", overflow: "auto", marginBottom: "16px" }}>
                  {allUsers
                    .filter((u) => u.role === "user" || u.role === "creator" || u.role === "promoter" || u.role === "buyer")
                    .map((u) => (
                      <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
                        <span>{u.email}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleAddTeamMember(u.id, "admin")} style={styles.approveBtn}>Make Admin</button>
                          <button onClick={() => handleAddTeamMember(u.id, "moderator")} style={styles.rejectBtn}>Make Moderator</button>
                        </div>
                      </div>
                    ))}
                </div>
                <button onClick={() => setShowAddModal(false)} style={styles.logoutBtn}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {(isOwner || isAdmin) && (
        <>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Top Products</h2>
            <div style={styles.productGrid}>
              {topProducts.map((product) => (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.productHeader}><span style={styles.productName}>{product.name || product.id}</span><span style={styles.productBadge}>{product.totalClicks || 0} clicks</span></div>
                  <p style={styles.productCategory}>{product.category || "Promo product"}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent Users</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}><span>Email</span><span>Role</span><span>Joined</span></div>
              {recentUsers.map((user) => (
                <div key={user.id} style={styles.tableRow}><span>{user.email}</span><span>{user.role || "user"}</span><span>{formatDate(user.createdAt)}</span></div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent Clicks</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}><span>Product</span><span>Promoter</span><span>Time</span></div>
              {recentClicks.map((click) => (
                <div key={click.id} style={styles.tableRow}><span>{click.productId || "-"}</span><span>{click.promoterRef || "direct"}</span><span>{formatDate(click.timestamp)}</span></div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 20px", color: "#fff", fontFamily: "Inter, sans-serif" },
  header: { marginBottom: "32px" },
  title: { fontSize: "40px", margin: 0, background: "linear-gradient(135deg, #ffffff, #a5b4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  subtitle: { color: "#94a3b8", marginTop: "10px", maxWidth: "760px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" },
  statCard: { padding: "24px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(79,124,255,0.18)", minHeight: "130px" },
  statValue: { fontSize: "32px", fontWeight: 700, marginTop: "12px", color: "#fff" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "24px", marginBottom: "18px" },
  reviewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" },
  reviewCard: { padding: "22px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(79,124,255,0.14)", display: "flex", flexDirection: "column", gap: "16px" },
  reviewHeader: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" },
  reviewTitle: { fontSize: "18px", margin: 0 },
  reviewMeta: { color: "#94a3b8", marginTop: "6px" },
  reviewStatus: { padding: "8px 14px", borderRadius: "999px", background: "rgba(79,124,255,0.14)", color: "#a5b4ff", textTransform: "capitalize", fontWeight: 700, fontSize: "12px" },
  reviewDescription: { color: "#cbd5e1", lineHeight: 1.7 },
  reviewFooter: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  reviewLabel: { margin: 0, color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  reviewValue: { margin: "8px 0 0", fontSize: "15px", color: "#fff" },
  reviewActions: { display: "flex", gap: "12px", flexWrap: "wrap" },
  approveBtn: { flex: 1, minWidth: "80px", padding: "12px 16px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700 },
  rejectBtn: { flex: 1, minWidth: "80px", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.08)", color: "#fecaca", cursor: "pointer", fontWeight: 700 },
  deleteBtn: { flex: 1, minWidth: "80px", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.15)", color: "#fca5a5", cursor: "pointer", fontWeight: 700 },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
  productCard: { padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(79,124,255,0.14)" },
  productHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px" },
  productName: { fontSize: "16px", fontWeight: 700 },
  productBadge: { fontSize: "12px", fontWeight: 700, color: "#a5b4ff" },
  productCategory: { color: "#cbd5e1", fontSize: "14px" },
  emptyState: { gridColumn: "1/-1", padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", color: "#94a3b8" },
  table: { width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(79,124,255,0.14)", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", padding: "16px 20px", background: "rgba(79,124,255,0.1)", fontWeight: 700, color: "#dbeafe" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" },
  tab: { padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(79,124,255,0.2)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600 },
  tabActive: { padding: "10px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700 },
  viewBtn: { padding: "8px 14px", borderRadius: "10px", background: "rgba(79,124,255,0.15)", color: "#a5b4ff", border: "none", cursor: "pointer", fontWeight: 600 },
  logoutBtn: { padding: "12px 20px", borderRadius: "14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", cursor: "pointer", fontWeight: 600 },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200 },
  modalContent: { padding: "32px", borderRadius: "24px", background: "#0f172a", border: "1px solid rgba(79,124,255,0.2)", maxWidth: "600px", width: "90%", maxHeight: "80vh", overflow: "auto" },
};

export default Admin;