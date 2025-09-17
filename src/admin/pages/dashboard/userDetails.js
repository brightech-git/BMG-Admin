import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { MyContext } from '../../context/themeContext/themeContext';
import dashBoardDetailsService from '../../service/dashBoardDetailsService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import {
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSearch,
  FaSyncAlt,
  FaFilter,
  FaEllipsisV,
  FaChevronDown,
  FaChevronUp,
  FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { useMediaQuery } from 'react-responsive';
import classes from './UserDetails.module.css';

function UserDetails() {
  const { themeMode } = useContext(MyContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    username: true,
    email: true,
    contactNumber: true,
    roles: true,
  });

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  // Define columns with responsive visibility
  const columns = useMemo(() => [
    { key: 'id', label: 'ID', visible: !isMobile },
    { key: 'username', label: 'Username', visible: true },
    { key: 'email', label: 'Email', visible: !isMobile },
    { key: 'contactNumber', label: 'Contact', visible: !isMobile },
    { key: 'roles', label: 'Roles', visible: !isMobile },
  ], [isMobile]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashBoardDetailsService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply search filter whenever searchTerm changes
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = users.filter(user =>
      Object.values(user).some(val =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort users based on sortConfig
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = Array.isArray(a[sortConfig.key])
        ? a[sortConfig.key].join(', ')
        : a[sortConfig.key] || '';
      const bValue = Array.isArray(b[sortConfig.key])
        ? b[sortConfig.key].join(', ')
        : b[sortConfig.key] || '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Refresh data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashBoardDetailsService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      setSearchTerm('');
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const handleSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  // Toggle column visibility
  const toggleColumnVisibility = (key) => {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Data export functions
  const handleExportExcel = useCallback(() => {
    if (filteredUsers.length === 0) {
      setError('No user data available to export.');
      return;
    }

    try {
      const data = filteredUsers.map((user, index) => ({
        'S.No': index + 1,
        'ID': user.id,
        'Username': user.username,
        'Email': user.email,
        'Contact Number': user.contactNumber,
        'Roles': user.roles?.length ? user.roles.join(', ') : 'None',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'UserDetails');

      // Auto-size columns
      const wscols = [
        { wch: 8 },  // S.No
        { wch: 10 }, // ID
        { wch: 20 }, // Username
        { wch: 30 }, // Email
        { wch: 15 }, // Contact
        { wch: 25 }, // Roles
        { wch: 12 }  // Status
      ];
      ws['!cols'] = wscols;

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(file, `User_Details_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to generate Excel file. Please try again.');
    }
  }, [filteredUsers]);

  const handleExportPDF = useCallback(() => {
    if (filteredUsers.length === 0) {
      setError('No user data available to export.');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const date = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).split("/").join("-");

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text("User Details Report", 14, 14);
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp} ${date}`, 14, 22);
      doc.text(`Total Users: ${filteredUsers.length}`, 14, 28);

      const headers = [["S.No", "ID", "Username", "Email", "Contact", "Roles"]];
      const data = filteredUsers.map((user, index) => [
        index + 1,
        user.id || "N/A",
        user.username || "N/A",
        user.email || "N/A",
        user.contactNumber || "N/A",
        user.roles?.length ? user.roles.join(', ') : 'None'
      ]);

      autoTable(doc, {
        startY: 34,
        head: headers,
        body: data,
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak',
          valign: 'middle',
          halign: 'left',
          minCellHeight: 10
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },  // S.No
          1: { cellWidth: 20, halign: 'center' },  // ID
          2: { cellWidth: 30 },                    // Username
          3: { cellWidth: 50 },                    // Email
          4: { cellWidth: 30, halign: 'center' },  // Contact
          5: { cellWidth: 40 }                     // Roles
        },
        margin: { top: 34, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(8);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            data.settings.margin.left,
            pageHeight - 5
          );
        }
      });

      doc.save(`User_Details_${date}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  }, [filteredUsers]);

  const handlePrint = useCallback(() => {
    if (filteredUsers.length === 0) {
      setError('No user data available to print.');
      return;
    }

    const printWindow = window.open('', '_blank');
    const printDate = new Date().toLocaleString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>User Details Report</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              @page { size: A4 landscape; margin: 10mm; }
              body { 
                  font-family: var(--font-primary); 
                  margin: 0; 
                  padding: 20px; 
                  color: var(--primary-text-color);
                  background-color: var(--card-background-color);
              }
              .print-header { 
                  margin-bottom: 20px; 
                  padding-bottom: 15px; 
                  border-bottom: 2px solid var(--border-color);
              }
              .print-header h2 { 
                  color: var(--primary-color);
                  margin: 0 0 5px 0;
                  font-size: 24px;
              }
              .print-meta {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  color: var(--secondary-text-color);
              }
              .print-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 15px; 
                  font-size: 12px;
                  table-layout: fixed;
              }
              .print-table th { 
                  background-color: var(--primary-color);
                  color: white;
                  font-weight: 600;
                  text-align: left;
                  padding: 8px 10px;
                  position: sticky;
                  top: 0;
              }
              .print-table td { 
                  padding: 8px 10px;
                  border-bottom: 1px solid var(--border-color);
                  word-wrap: break-word;
              }
              .print-table tr:nth-child(even) {
                  background-color: var(--active-bg);
              }
              .print-table tr:hover {
                  background-color: rgba(0, 0, 0, 0.05);
              }
              .print-footer {
                  margin-top: 20px;
                  padding-top: 10px;
                  border-top: 1px solid var(--border-color);
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-align: right;
              }
              @media print {
                  body { padding: 0; }
                  .print-table th { 
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                  }
              }
          </style>
      </head>
      <body>
          <div class="print-header">
              <h2>User Details Report</h2>
              <div class="print-meta">
                  <span><strong>Generated:</strong> ${printDate}</span>
                  <span><strong>Total Users:</strong> ${filteredUsers.length}</span>
              </div>
          </div>
          <table class="print-table">
              <thead>
                  <tr>
                      <th width="5%">S.No</th>
                      <th width="10%">ID</th>
                      <th width="15%">Username</th>
                      <th width="25%">Email</th>
                      <th width="12%">Contact</th>
                      <th width="20%">Roles</th>
                      <th width="10%">Status</th>
                  </tr>
              </thead>
              <tbody>
                  ${sortedUsers.map((user, index) => `
                      <tr>
                          <td>${index + 1}</td>
                          <td>${user.id}</td>
                          <td>${user.username}</td>
                          <td>${user.email}</td>
                          <td>${user.contactNumber || 'N/A'}</td>
                          <td>${user.roles?.length ? user.roles.join(', ') : 'None'}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
          <div class="print-footer">
              Confidential - Internal Use Only
          </div>
          <script>
              window.onload = () => {
                  setTimeout(() => { 
                      window.print(); 
                      window.close(); 
                  }, 200);
              };
          </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [filteredUsers, sortedUsers]);

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />;
  };

  // Mobile user card component
  const MobileUserCard = ({ user }) => (
    <motion.div
      className={classes.mobileCard}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
    >
      <div className={classes.mobileCardHeader}>
        <div className={classes.mobileUserInfo}>
          <span className={classes.mobileUsername}>{user.username}</span>
        </div>
        {selectedUser?.id === user.id ? <FaChevronUp /> : <FaChevronDown />}
      </div>

      {selectedUser?.id === user.id && (
        <motion.div
          className={classes.mobileCardDetails}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={classes.mobileDetailRow}>
            <span className={classes.mobileDetailLabel}>ID:</span>
            <span className={classes.mobileDetailValue}>{user.id}</span>
          </div>
          <div className={classes.mobileDetailRow}>
            <span className={classes.mobileDetailLabel}>Email:</span>
            <a href={`mailto:${user.email}`} className={classes.mobileDetailValue}>
              {user.email}
            </a>
          </div>
          {user.contactNumber && (
            <div className={classes.mobileDetailRow}>
              <span className={classes.mobileDetailLabel}>Contact:</span>
              <span className={classes.mobileDetailValue}>{user.contactNumber}</span>
            </div>
          )}
          <div className={classes.mobileDetailRow}>
            <span className={classes.mobileDetailLabel}>Roles:</span>
            <div className={classes.mobileRoles}>
              {user.roles?.length ? (
                user.roles.map((role, i) => (
                  <span key={i} className={classes.mobileRoleBadge}>
                    {role}
                  </span>
                ))
              ) : (
                <span className={classes.mobileNoRole}>None</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className={`${classes.container} ${themeMode === 'dark' ? classes.dark : ''}`}>
      <div className={classes.header}>
        <div className={classes.titleGroup}>
          <h1 className={classes.heading}>User Management</h1>
          <p className={classes.subtitle}>View and manage all registered users</p>
        </div>

        <div className={classes.controls}>
          <div className={classes.searchContainer}>
            <FaSearch className={classes.searchIcon} />
            <input
              type="text"
              placeholder="Search users..."
              className={classes.searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchTerm}
            />
            {searchTerm && (
              <button
                className={classes.clearSearchButton}
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {!isMobile && (
            <div className={classes.buttonGroup}>
              <motion.button
                className={`${classes.button} ${classes.refreshButton}`}
                onClick={handleRefresh}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                <FaSyncAlt className={`${classes.icon} ${loading ? classes.spin : ''}`} />
                Refresh
              </motion.button>

              <motion.button
                className={`${classes.button} ${classes.excelButton}`}
                onClick={handleExportExcel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || filteredUsers.length === 0}
              >
                <FaFileExcel className={classes.icon} />
                Excel
              </motion.button>

              <motion.button
                className={`${classes.button} ${classes.pdfButton}`}
                onClick={handleExportPDF}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || filteredUsers.length === 0}
              >
                <FaFilePdf className={classes.icon} />
                PDF
              </motion.button>

              <motion.button
                className={`${classes.button} ${classes.printButton}`}
                onClick={handlePrint}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || filteredUsers.length === 0}
              >
                <FaPrint className={classes.icon} />
                Print
              </motion.button>
            </div>
          )}

          {isMobile && (
            <div className={classes.mobileActions}>
              <motion.button
                className={classes.mobileMenuButton}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                whileTap={{ scale: 0.95 }}
              >
                <FaEllipsisV />
              </motion.button>

              <AnimatePresence>
                {showMobileMenu && (
                  <motion.div
                    className={classes.mobileMenu}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.button
                      className={classes.mobileMenuItem}
                      onClick={handleRefresh}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                    >
                      <FaSyncAlt className={`${classes.icon} ${loading ? classes.spin : ''}`} />
                      Refresh
                    </motion.button>
                    <motion.button
                      className={classes.mobileMenuItem}
                      onClick={handleExportExcel}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading || filteredUsers.length === 0}
                    >
                      <FaFileExcel className={classes.icon} />
                      Export Excel
                    </motion.button>
                    <motion.button
                      className={classes.mobileMenuItem}
                      onClick={handleExportPDF}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading || filteredUsers.length === 0}
                    >
                      <FaFilePdf className={classes.icon} />
                      Export PDF
                    </motion.button>
                    <motion.button
                      className={classes.mobileMenuItem}
                      onClick={handlePrint}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading || filteredUsers.length === 0}
                    >
                      <FaPrint className={classes.icon} />
                      Print
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          className={classes.error}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className={classes.errorContent}>
            <span>{error}</span>
            <button
              className={classes.dismissError}
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      <div className={classes.tableContainer}>
        <AnimatePresence>
          {loading ? (
            <motion.div
              className={classes.loading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={classes.spinner}></div>
              <span>Loading user data...</span>
              <div className={classes.loadingProgress}></div>
            </motion.div>
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <motion.div
                  className={classes.emptyState}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {searchTerm ? (
                    <>
                      <h3>No matching users found</h3>
                      <p>Try adjusting your search criteria</p>
                      <motion.button
                        className={classes.clearSearch}
                        onClick={() => setSearchTerm('')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear search
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <h3>No users available</h3>
                      <p>The user list is currently empty</p>
                    </>
                  )}
                </motion.div>
              ) : isMobile ? (
                <div className={classes.mobileList}>
                  {sortedUsers.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <>
                  <motion.table
                    className={classes.table}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <thead>
                      <tr className={classes.headerRow}>
                        {columns.map(column => column.visible && (
                          <th
                            key={column.key}
                            className={classes.headerCell}
                            onClick={() => requestSort(column.key)}
                          >
                            <div className={classes.headerCellContent}>
                              {column.label}
                              <span className={classes.sortIndicator}>
                                {renderSortIndicator(column.key)}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          className={`${classes.dataRow} ${index % 2 === 0 ? classes.evenRow : ''}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          whileHover={{ backgroundColor: 'var(--active-bg)' }}
                        >
                          {columns.map(column => column.visible && (
                            <td key={column.key} className={classes.dataCell}>
                              {column.key === 'username' && (
                                <div className={classes.userCell}>
                                  <span className={classes.username}>{user.username}</span>
                                </div>
                              )}
                              {column.key === 'email' && (
                                <a href={`mailto:${user.email}`} className={classes.emailLink}>
                                  {user.email}
                                </a>
                              )}
                              {column.key === 'contactNumber' && (
                                user.contactNumber || 'N/A'
                              )}
                              {column.key === 'roles' && (
                                <div className={classes.roles}>
                                  {user.roles?.length ? (
                                    user.roles.map((role, i) => (
                                      <span key={i} className={classes.roleBadge}>
                                        {role}
                                      </span>
                                    ))
                                  ) : (
                                    <span className={classes.noRole}>None</span>
                                  )}
                                </div>
                              )}
                              {column.key === 'id' && user.id}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>

                  <div className={classes.tableFooter}>
                    <div className={classes.footerInfo}>
                      Showing {filteredUsers.length} of {users.length} users
                      {searchTerm && ' (filtered)'}
                    </div>
                    <div className={classes.footerControls}>
                      <button
                        className={classes.columnToggle}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                      >
                        <FaFilter /> Columns
                      </button>
                      <AnimatePresence>
                        {showMobileMenu && (
                          <motion.div
                            className={classes.columnMenu}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            {columns.map(column => (
                              <label key={column.key} className={classes.columnMenuItem}>
                                <input
                                  type="checkbox"
                                  checked={columnVisibility[column.key]}
                                  onChange={() => toggleColumnVisibility(column.key)}
                                />
                                {column.label}
                              </label>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UserDetails;