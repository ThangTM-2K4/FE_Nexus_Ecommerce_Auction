import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import {
  walletStats,
  transactions,
  withdrawals,
  formatCurrency,
} from "../../../data/sellerMockData";

export default function WalletPage() {
  return (
    <div className="slr-page">
      <PageHeader
        title="Quản lý ví và thanh toán"
        subtitle="Số dư, giao dịch và lịch sử rút tiền"
      />

      <section className="slr-section">
        <div className="slr-wallet-cards">
          <div className="slr-wallet-card primary">
            <span>Available Balance</span>
            <strong>
              <AnimatedValue value={walletStats.availableBalance} />
            </strong>
          </div>
          <div className="slr-wallet-card">
            <span>Pending Balance</span>
            <strong>
              <AnimatedValue value={walletStats.pendingBalance} />
            </strong>
          </div>
          <div className="slr-wallet-card">
            <span>Withdrawn Amount</span>
            <strong>
              <AnimatedValue value={walletStats.withdrawnAmount} />
            </strong>
          </div>
        </div>

        <div className="slr-page-split">
          <div className="slr-panel-card">
            <h4>Lịch sử giao dịch</h4>
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.desc}</td>
                    <td className={t.amount < 0 ? "neg" : "pos"}>
                      {t.amount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(t.amount))}
                    </td>
                    <td>{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="slr-panel-card">
            <h4>Lịch sử rút tiền</h4>
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td>{w.id}</td>
                    <td>{formatCurrency(w.amount)}</td>
                    <td>{w.status}</td>
                    <td>{w.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
