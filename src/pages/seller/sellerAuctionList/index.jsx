import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";

import "./index.scss";

function SellerAuctionList() {
  const auctions = [
    {
      id: 1,
      product: "Iphone 15 Pro Max",
      startPrice: "20.000.000đ",
      currentBid: "28.500.000đ",
      status: "Active",
    },
    {
      id: 2,
      product: "Macbook Pro M3",
      startPrice: "30.000.000đ",
      currentBid: "35.200.000đ",
      status: "Active",
    },
    {
      id: 3,
      product: "Sony A7IV",
      startPrice: "18.000.000đ",
      currentBid: "22.000.000đ",
      status: "Ended",
    },
  ];

  return (
    <>
      <SellerSidebar />
      <SellerHeader />

      <div className="auction-page">
        <div className="page-header">
          <h1>Active Listings</h1>

          <button>
            + Create Auction
          </button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Start Price</th>
                <th>Current Bid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {auctions.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>

                  <td>{item.product}</td>

                  <td>{item.startPrice}</td>

                  <td>{item.currentBid}</td>

                  <td>
                    <span
                      className={
                        item.status === "Active"
                          ? "status active"
                          : "status ended"
                      }
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <button className="view-btn">
                      View
                    </button>

                    <button className="edit-btn">
                      Edit
                    </button>

                    <button className="delete-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SellerAuctionList;