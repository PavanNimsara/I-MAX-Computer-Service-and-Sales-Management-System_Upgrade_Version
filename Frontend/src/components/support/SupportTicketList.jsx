import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const SupportTicketList = ({ isAdmin = false }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filters, currentPage]);

  const fetchTickets = async () => {
    try {
      const endpoint = isAdmin ? 'http://localhost:5000/api/support-tickets' : 'http://localhost:5000/api/support-tickets/my-tickets';
      const params = new URLSearchParams({
        page: currentPage,
        ...filters
      });
      
      const response = await axios.get(`${endpoint}?${params}`);
      if (response.data.success) {
        setTickets(response.data.tickets);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status, adminReply = '') => {
    try {
      const response = await axios.put(`http://localhost:5000/api/support-tickets/${ticketId}`, {
        status,
        adminReply
      });
      
      if (response.data.success) {
        toast.success('Ticket updated successfully');
        fetchTickets();
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      const response = await axios.delete(`http://localhost:5000/api/support-tickets/${ticketId}`);
      if (response.data.success) {
        toast.success('Ticket deleted successfully');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const handleViewClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const downloadPDF = (ticket) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [59, 130, 246]; // blue-500
  const darkColor = [31, 41, 55]; // gray-800
  const lightGray = [243, 244, 246]; // gray-100
  const mediumGray = [156, 163, 175]; // gray-400
  
  // Page margins
  const pageWidth = 210;
  const pageHeight = 327;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  
  // Header Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Company Logo placeholder (circle)
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 15, 30, 12, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('ST', margin + 15, 33, { align: 'center' });
  
  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('Support Ticket', margin + 35, 30);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Detailed Report', margin + 35, 40);
  
  // Ticket ID Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 60, 20, 50, 20, 5, 5, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`#${ticket._id.slice(-6)}`, pageWidth - margin - 35, 33, { align: 'center' });
  
  let yPos = 80;
  
  // Status and Priority Cards
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, yPos, (contentWidth / 2) - 5, 25, 5, 5, 'F');
  doc.roundedRect(margin + (contentWidth / 2) + 5, yPos, (contentWidth / 2) - 5, 25, 5, 5, 'F');
  
  // Status
  doc.setTextColor(...mediumGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('STATUS', margin + 10, yPos + 8);
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  const statusColor = {
    'open': [156, 163, 175],
    'in-progress': [251, 191, 36],
    'resolved': [34, 197, 94],
    'closed': [107, 114, 128]
  };
  doc.setTextColor(...(statusColor[ticket.status] || darkColor));
  doc.text(ticket.status.toUpperCase(), margin + 10, yPos + 18);
  
  // Priority
  doc.setTextColor(...mediumGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('PRIORITY', margin + (contentWidth / 2) + 15, yPos + 8);
  const priorityColor = {
    'low': [59, 130, 246],
    'medium': [156, 163, 175],
    'high': [251, 146, 60],
    'urgent': [239, 68, 68]
  };
  doc.setTextColor(...(priorityColor[ticket.priority] || darkColor));
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(ticket.priority.toUpperCase(), margin + (contentWidth / 2) + 15, yPos + 18);
  
  yPos += 35;
  
  // Divider
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 15;
  
  // Subject
  doc.setTextColor(...mediumGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('SUBJECT', margin, yPos);
  yPos += 8;
  doc.setTextColor(...darkColor);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  const subjectLines = doc.splitTextToSize(ticket.subject, contentWidth);
  doc.text(subjectLines, margin, yPos);
  yPos += (subjectLines.length * 6) + 10;
  
  // Category and Date Row
  const halfWidth = (contentWidth / 2) - 5;
  
  doc.setTextColor(...mediumGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('CATEGORY', margin, yPos);
  doc.text('CREATED DATE', margin + halfWidth + 10, yPos);
  
  yPos += 8;
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1), margin, yPos);
  doc.text(new Date(ticket.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), margin + halfWidth + 10, yPos);
  
  yPos += 20;
  
  // Description Section
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.line(margin, yPos, margin + 30, yPos);
  
  yPos += 10;
  doc.setTextColor(...mediumGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('DESCRIPTION', margin, yPos);
  
  yPos += 10;
  doc.setFillColor(250, 250, 250);
  const descriptionLines = doc.splitTextToSize(ticket.description, contentWidth - 20);
  const descBoxHeight = (descriptionLines.length * 6) + 20;
  doc.roundedRect(margin, yPos - 5, contentWidth, descBoxHeight, 5, 5, 'F');
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, yPos - 5, contentWidth, descBoxHeight, 5, 5, 'S');
  
  doc.setTextColor(...darkColor);
  doc.setFontSize(11);
  doc.text(descriptionLines, margin + 10, yPos + 5);
  
  yPos += descBoxHeight + 15;
  
  // Admin Reply Section
  if (ticket.adminReply) {
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(2);
    doc.line(margin, yPos, margin + 30, yPos);
    
    yPos += 10;
    doc.setTextColor(...mediumGray);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('ADMIN REPLY', margin, yPos);
    
    if (ticket.repliedBy?.name) {
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.text(`by ${ticket.repliedBy.name}`, margin + 35, yPos);
    }
    
    yPos += 10;
    doc.setFillColor(239, 246, 255); // blue-50
    const replyLines = doc.splitTextToSize(ticket.adminReply, contentWidth - 20);
    const replyBoxHeight = (replyLines.length * 6) + 20;
    doc.roundedRect(margin, yPos - 5, contentWidth, replyBoxHeight, 5, 5, 'F');
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.roundedRect(margin, yPos - 5, contentWidth, replyBoxHeight, 5, 5, 'S');
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.text(replyLines, margin + 10, yPos + 5);
    
    yPos += replyBoxHeight + 10;
    
    if (ticket.repliedAt) {
      doc.setTextColor(...mediumGray);
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.text(`Replied on ${new Date(ticket.repliedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, yPos);
    }
  }
  
  // Footer
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('This is an automatically generated document', pageWidth / 2, pageHeight - 18, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  doc.save(`ticket-${ticket._id}.pdf`);
};

const downloadAllPDF = () => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [59, 130, 246];
  const darkColor = [31, 41, 55];
  const lightGray = [243, 244, 246];
  const mediumGray = [156, 163, 175];
  
  // Page setup
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Header pattern (decorative circles)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  for (let i = 0; i < 5; i++) {
    doc.circle(30 + (i * 40), 25, 15, 'S');
  }
  
  // Header content
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.text('Support Tickets Report', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Comprehensive Overview', margin, 36);
  
  // Report date
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth - margin, 36, { align: 'right' });
  
  // Summary stats box
  const statsY = 60;
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, statsY, pageWidth - (margin * 2), 35, 5, 5, 'F');
  
  // Calculate stats
  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {});
  
  const priorityCounts = tickets.reduce((acc, ticket) => {
    const urgentHigh = ['urgent', 'high'].includes(ticket.priority) ? 'urgent/high' : 'normal';
    acc[urgentHigh] = (acc[urgentHigh] || 0) + 1;
    return acc;
  }, {});
  
  // Total tickets
  doc.setFillColor(...primaryColor);
  doc.circle(margin + 20, statsY + 17.5, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(tickets.length.toString(), margin + 20, statsY + 22, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Total Tickets', margin + 40, statsY + 15);
  
  // Status breakdown
  let xOffset = 100;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(count.toString(), margin + xOffset, statsY + 15);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...mediumGray);
    doc.text(status.replace('-', ' ').toUpperCase(), margin + xOffset, statsY + 23);
    xOffset += 35;
  });
  
  // Priority indicator
  if (priorityCounts['urgent/high']) {
    doc.setFillColor(239, 68, 68); // red-500
    doc.circle(pageWidth - margin - 30, statsY + 17.5, 3, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`${priorityCounts['urgent/high']} Urgent/High`, pageWidth - margin - 25, statsY + 20, { align: 'left' });
  }
  
  // Table
  const tableStartY = statsY + 50;
  
  // Prepare table data with better formatting
  const tableData = tickets.map(ticket => {
    const formattedDate = new Date(ticket.createdAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: '2-digit' 
    });
    
    return [
      `#${ticket._id.slice(-6)}`,
      ticket.subject.length > 40 ? ticket.subject.substring(0, 37) + '...' : ticket.subject,
      ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1),
      ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
      ticket.status.replace('-', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      formattedDate
    ];
  });
  
  // Create styled table
  autoTable(doc, {
    head: [['Ticket ID', 'Subject', 'Category', 'Priority', 'Status', 'Date']],
    body: tableData,
    startY: tableStartY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [...primaryColor],
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 6
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: [...darkColor],
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // gray-50
    },
    columnStyles: {
      0: { 
        cellWidth: 25, 
        fontStyle: 'bold',
        halign: 'center'
      },
      1: { 
        cellWidth: 65 
      },
      2: { 
        cellWidth: 30,
        halign: 'center'
      },
      3: { 
        cellWidth: 25,
        halign: 'center',
        fontStyle: 'bold'
      },
      4: { 
        cellWidth: 30,
        halign: 'center'
      },
      5: { 
        cellWidth: 20,
        halign: 'center'
      }
    },
    didDrawCell: function(data) {
      // Highlight priority cells
      if (data.column.index === 3 && data.cell.section === 'body') {
        const priority = data.cell.raw.toLowerCase();
        if (priority === 'urgent' || priority === 'high') {
          doc.setTextColor(239, 68, 68); // red-500
          doc.text(data.cell.text, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3, {
            align: 'center'
          });
        }
      }
    },
    didDrawPage: function(data) {
      // Page number
      doc.setTextColor(...mediumGray);
      doc.setFontSize(10);
      doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  });
  
  // Summary section on last page
  const finalY = doc.lastAutoTable.finalY || tableStartY;
  if (finalY < pageHeight - 80) {
    // Summary box
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, finalY + 20, pageWidth - (margin * 2), 30, 5, 5, 'F');
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Report Summary:', margin + 10, finalY + 35);
    
    const openTickets = statusCounts['open'] || 0;
    const inProgressTickets = statusCounts['in-progress'] || 0;
    const pendingTickets = openTickets + inProgressTickets;
    
    doc.setFont(undefined, 'bold');
    doc.text(`${pendingTickets} tickets require attention`, margin + 50, finalY + 35);
    
    if (priorityCounts['urgent/high'] > 0) {
      doc.setTextColor(239, 68, 68);
      doc.text(`(${priorityCounts['urgent/high']} high priority)`, margin + 120, finalY + 35);
    }
  }
  
  // Footer
  const footerY = pageHeight - 25;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setTextColor(...mediumGray);
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.text('This document contains confidential information', margin, footerY + 10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, footerY + 10, { align: 'right' });
  
  doc.save(`support-tickets-report-${new Date().toISOString().split('T')[0]}.pdf`);
  toast.success('PDF report downloaded successfully!');
};

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-yellow-50 text-yellow-700',
      resolved: 'bg-green-50 text-green-700',
      closed: 'bg-gray-50 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-50 text-blue-700',
      medium: 'bg-gray-100 text-gray-700',
      high: 'bg-orange-50 text-orange-700',
      urgent: 'bg-red-50 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isAdmin ? 'All Support Tickets' : 'My Support Tickets'}
            </h2>
            <p className="text-gray-600">Manage and track support requests</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ticket ID, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="equipment">Equipment</option>
              <option value="general">General</option>
              <option value="complaint">Complaint</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No support tickets found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                isAdmin={isAdmin}
                onView={handleViewClick}
                onDelete={deleteTicket}
                onDownloadPDF={downloadPDF}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === currentPage
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onUpdate={updateTicketStatus}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
        />
      )}
    </>
  );
};

const TicketCard = ({ ticket, isAdmin, onView, onDelete, onDownloadPDF, getStatusColor, getPriorityColor }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-500">#{ticket._id.slice(-6)}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {ticket.subject}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority.toUpperCase()}
          </span>
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
            {ticket.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          {ticket.adminReply && (
            <span className="flex items-center gap-1 text-blue-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Has Reply
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(ticket)}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-sm"
        >
          View Details
        </button>
        
        <button
          onClick={() => onDownloadPDF(ticket)}
          className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Download PDF"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        
        {isAdmin && (
          <button
            onClick={() => onDelete(ticket._id)}
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const TicketModal = ({ ticket, isAdmin, onClose, onUpdate, getStatusColor, getPriorityColor }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState(ticket.status);

  const handleSubmit = () => {
    if (replyText.trim() || newStatus !== ticket.status) {
      onUpdate(ticket._id, newStatus, replyText);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Ticket Details</h3>
            <p className="text-sm text-gray-500 mt-1">#{ticket._id.slice(-6)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Subject</h4>
            <p className="text-lg font-semibold text-gray-900">{ticket.subject}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Priority</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {ticket.category}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Submitted By</h4>
                <p className="text-gray-900">
                  <span className="font-medium">{ticket.user?.name}</span>
                  <br />
                  <span className="text-sm text-gray-600">{ticket.user?.email}</span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Created Date</h4>
                <p className="text-gray-900">{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {ticket.adminReply && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Admin Reply</h4>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap mb-3">{ticket.adminReply}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{ticket.repliedBy?.name}</span> • {new Date(ticket.repliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {showReplyForm ? 'Cancel Reply' : 'Add Reply'}
                </button>
              </div>

              {showReplyForm && (
                <div className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText('');
                      }}
                      className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Update Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketList;