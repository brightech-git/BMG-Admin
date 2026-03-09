import React from "react";

const SchemeSummaryCards = ({ schemeSummary = [] }) => {  // Added default empty array
  // Calculate totals with safe navigation
  const totals = (schemeSummary || []).reduce(
    (acc, scheme) => ({
      colAmount: (acc.colAmount || 0) + (scheme?.colAmount || 0),
      totalCount: (acc.totalCount || 0) + (scheme?.totalCount || 0),
      todayCount: (acc.todayCount || 0) + (scheme?.todayCount || 0),
    }),
    {}
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  // If no data, show empty state
  if (!schemeSummary || schemeSummary.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No schemes available</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Scheme Name</th>
              <th style={styles.th}>Total Collection</th>
              <th style={styles.th}>Total Members</th>
              <th style={styles.th}>Today's Join</th>
              <th style={styles.th}>Receipt Range</th>
            </tr>
          </thead>
          
          <tbody>
            {schemeSummary.map((scheme, index) => (
              <tr key={index} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.schemeCell}>
                    <span style={styles.schemeName}>{scheme?.schemeName || 'N/A'}</span>
                    <span style={styles.activeDot}></span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.currencyValue}>{formatCurrency(scheme?.colAmount)}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.numberValue}>{formatNumber(scheme?.totalCount)}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.todayValue}>{formatNumber(scheme?.todayCount)}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.rangeValue}>
                    {scheme?.fromReceipt || 0} - {scheme?.toReceipt || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          
          <tfoot style={styles.tfoot}>
            <tr>
              <td style={styles.tfootTd}>
                <span style={styles.totalLabel}>TOTAL</span>
              </td>
              <td style={styles.tfootTd}>
                <span style={styles.totalCurrency}>{formatCurrency(totals.colAmount)}</span>
              </td>
              <td style={styles.tfootTd}>
                <span style={styles.totalNumber}>{formatNumber(totals.totalCount)}</span>
              </td>
              <td style={styles.tfootTd}>
                <span style={styles.totalNumber}>{formatNumber(totals.todayCount)}</span>
              </td>
              <td style={styles.tfootTd}>—</td>

            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Cards */}
      
        
        
        
      
    </div>
  );
};

export default SchemeSummaryCards;

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  emptyState: {
    padding: "48px",
    textAlign: "center",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    color: "#6b7280",
    fontSize: "1rem",
  },

  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    marginBottom: "24px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderSpacing: 0,
  },

  thead: {
    backgroundColor: "#f3f4f6",
  },

  th: {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tr: {
    ":hover": {
      backgroundColor: "#f9fafb",
    },
  },

  td: {
    padding: "14px 20px",
    fontSize: "0.95rem",
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  schemeCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  schemeName: {
    fontWeight: "500",
    color: "#111827",
  },

  activeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    display: "inline-block",
  },

  currencyValue: {
    color: "#059669",
    fontWeight: "500",
  },

  numberValue: {
    color: "#3b82f6",
    fontWeight: "500",
  },

  todayValue: {
    color: "#7c3aed",
    fontWeight: "600",
  },

  rangeValue: {
    color: "#6b7280",
    fontFamily: "monospace",
  },

  tfoot: {
    backgroundColor: "#f8fafc",
  },

  tfootTd: {
    padding: "14px 20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    borderTop: "2px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  totalLabel: {
    color: "#111827",
    fontSize: "0.9rem",
    fontWeight: "700",
  },

  totalCurrency: {
    color: "#059669",
    fontWeight: "700",
  },

  totalNumber: {
    color: "#3b82f6",
    fontWeight: "600",
  },

  totalGst: {
    color: "#d97706",
    fontWeight: "600",
  },

  summaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  },

  summaryContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  summaryLabel: {
    fontSize: "0.8rem",
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  summaryValue: {
    fontSize: "1.5rem",
    color: "#111827",
    fontWeight: "700",
    lineHeight: "1.2",
  },

  // Responsive styles
  "@media (max-width: 1024px)": {
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      minWidth: "1000px",
    },
    summaryContainer: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },

  "@media (max-width: 640px)": {
    container: {
      padding: "16px",
    },
    summaryContainer: {
      gridTemplateColumns: "1fr",
    },
  },
};

// Add CSS for hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  tr:hover {
    background-color: #f9fafb;
  }
  
  @media (max-width: 1024px) {
    .table-wrapper {
      overflow-x: auto;
    }
  }
  
  @media (max-width: 640px) {
    .summary-container {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);