import { useEffect, useState, useCallback } from 'react';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import TopUpModal from '../../../components/common/TopUpModal';
import { getMyWallets, getMyWalletTransactions, getMyTopUps } from '../../../services/walletService';
import ErrorBoundary from '../../../components/common/errorBoundary';
import './index.scss';

export default function BuyerWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyWallets();
      if (res?.wallets) {
        const buyerWd = res.wallets.find((w) => w.walletType === 'BUYER') || res.wallets[0];
        setWallet(buyerWd);
      }

      const txRes = await getMyWalletTransactions({ walletType: 'BUYER' });
      const filteredTxns = (txRes?.items || []).filter((t) => !t.walletType || t.walletType === 'BUYER');
      setTransactions(filteredTxns);

      const topUpRes = await getMyTopUps({ walletType: 'BUYER' });
      setTopUps(topUpRes?.items || []);
    } catch (err) {
      console.warn('Error loading buyer wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableBalance = wallet?.availableBalance ?? 0;
  const pendingBalance = wallet?.pendingBalance ?? 0;

  // Tính tổng số tiền đã nạp thành công
  const totalTopUp = topUps
    .filter((t) => t.status === 'SUCCESS' || t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 5500000);

  return (
    <div className="account-page buyer-wallet-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout title="Ví Nexus Pay" description="Quản lý số dư cá nhân, lịch sử nạp tiền và cọc đấu giá">
          <ErrorBoundary message="Không thể tải dữ liệu ví. Vui lòng thử lại sau.">
            <div className="b-wallet-container">
              {/* Hero Stats */}
              <div className="b-wallet-cards">
                <div className="b-wallet-card primary">
                  <div className="b-wallet-card__header">
                    <span className="b-wallet-card__title">💳 Số dư khả dụng</span>
                    <button
                      type="button"
                      className="b-wallet-topup-btn"
                      onClick={() => setShowTopUp(true)}
                    >
                      + Nạp tiền
                    </button>
                  </div>
                  <strong className="b-wallet-card__amount">
                    {availableBalance.toLocaleString('vi-VN')} ₫
                  </strong>
                  <span className="b-wallet-card__sub">Ví Người Mua (BUYER)</span>
                </div>

                <div className="b-wallet-card muted">
                  <span className="b-wallet-card__title">🔒 Tiền cọc đóng băng</span>
                  <strong className="b-wallet-card__amount warn">
                    {pendingBalance.toLocaleString('vi-VN')} ₫
                  </strong>
                  <span className="b-wallet-card__sub">Dùng giữ cọc phiên đấu giá</span>
                </div>

                <div className="b-wallet-card info">
                  <span className="b-wallet-card__title">📥 Tổng đã nạp</span>
                  <strong className="b-wallet-card__amount success">
                    {totalTopUp.toLocaleString('vi-VN')} ₫
                  </strong>
                  <span className="b-wallet-card__sub">Qua cổng thanh toán VNPay</span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="b-wallet-history">
                <div className="b-wallet-history__header">
                  <h3>📜 Lịch sử giao dịch & Nạp tiền (Ví Người mua)</h3>
                  <button type="button" className="b-wallet-refresh-btn" onClick={loadData}>
                    🔄 Tải lại
                  </button>
                </div>

                {loading ? (
                  <p className="b-wallet-loading">Đang tải dữ liệu giao dịch...</p>
                ) : (
                  <div className="b-wallet-table-wrap">
                    <table className="b-wallet-table">
                      <thead>
                        <tr>
                          <th>Mã giao dịch</th>
                          <th>Loại</th>
                          <th>Mô tả</th>
                          <th>Số tiền</th>
                          <th>Thời gian</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length === 0 && topUps.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="b-wallet-empty">
                              Chưa có giao dịch nạp tiền nào.
                            </td>
                          </tr>
                        ) : (
                          <>
                            {topUps.map((t) => (
                              <tr key={t.topUpId || t.id}>
                                <td className="code-cell">{t.topUpId || t.id || 'TOPUP-VNPAY'}</td>
                                <td><span className="badge topup">Nạp tiền</span></td>
                                <td>Nạp tiền qua VNPay ({t.provider || 'VNPay'})</td>
                                <td className="amount-cell in">
                                  +{(Number(t.amount) || 0).toLocaleString('vi-VN')} ₫
                                </td>
                                <td>{t.createdAtUtc ? new Date(t.createdAtUtc).toLocaleString('vi-VN') : 'Vừa xong'}</td>
                                <td>
                                  <span className={`status-badge ${t.status?.toLowerCase() === 'success' ? 'success' : 'pending'}`}>
                                    {t.status === 'SUCCESS' ? 'Thành công' : t.status || 'Hoàn thành'}
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {transactions.map((tx) => (
                              <tr key={tx.id || tx.transactionId}>
                                <td className="code-cell">{tx.id || tx.transactionId}</td>
                                <td>
                                  <span className={`badge ${tx.type === 'in' ? 'topup' : 'spend'}`}>
                                    {tx.type === 'in' ? 'Nạp tiền' : 'Thanh toán'}
                                  </span>
                                </td>
                                <td>{tx.desc || tx.description || 'Giao dịch ví'}</td>
                                <td className={`amount-cell ${tx.amount >= 0 ? 'in' : 'out'}`}>
                                  {tx.amount >= 0 ? '+' : ''}{(Number(tx.amount) || 0).toLocaleString('vi-VN')} ₫
                                </td>
                                <td>{tx.date || tx.createdAt ? new Date(tx.date || tx.createdAt).toLocaleString('vi-VN') : '—'}</td>
                                <td>
                                  <span className="status-badge success">Thành công</span>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </ErrorBoundary>
        </AccountLayout>
      </main>
      <Footer />

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
