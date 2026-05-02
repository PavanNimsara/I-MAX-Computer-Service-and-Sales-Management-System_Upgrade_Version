import User from '../models/User.js';
import PDFDocument from 'pdfkit';

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });
    
    res.status(201).json({
      success: true,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }
    
    if (email !== admin.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }
    
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    
    await admin.save();
    
    res.json({
      success: true,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own admin account' 
      });
    }
    
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({ 
      success: true, 
      message: 'Admin deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// GET ALL USERS WITH FILTERING
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,           // Filter by role: 'user' or 'admin'
      search,         // Search by name or email
      page = 1,       // Page number
      limit = 10,     // Items per page
      sortBy = 'createdAt', // Sort field
      order = 'desc'  // Sort order: 'asc' or 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Role filter
    if (role) {
      filter.role = role;
    }

    // Search filter (name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [users, totalCount] = await Promise.all([
      User.find(filter)
          .select('-password') // Exclude password
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          role,
          search,
          sortBy,
          order
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const exportUsersPDF = async (req, res) => {
  try {
    const { role, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const users = await User.find(filter)
        .select('-password')
        .sort({ [sortBy]: sortOrder });

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=users-report-${Date.now()}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(24)
        .font('Helvetica-Bold')
        .text('IMAX Users Report', { align: 'center' });

    doc.moveDown(0.5);

    doc.fontSize(10)
        .font('Helvetica')
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.moveDown(1);

    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Summary:', 50, doc.y);

    doc.fontSize(10)
        .font('Helvetica');

    doc.text(`Total Users: ${users.length}`, 70, doc.y + 5);
    doc.text(`Regular Users: ${users.filter(u => u.role === 'user').length}`, 70, doc.y + 5);
    doc.text(`Administrators: ${users.filter(u => u.role === 'admin').length}`, 70, doc.y + 5);

    doc.moveDown(2);

    const tableTop = doc.y;
    const rowHeight = 30;

    doc.fontSize(10)
        .font('Helvetica-Bold');

    doc.text('Name', 50, tableTop);
    doc.text('Email', 150, tableTop);
    doc.text('Role', 320, tableTop);
    doc.text('Joined', 400, tableTop);

    doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

    doc.font('Helvetica').fontSize(9);
    let currentY = tableTop + 25;

    users.forEach((user, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Name', 50, currentY);
        doc.text('Email', 150, currentY);
        doc.text('Role', 320, currentY);
        doc.text('Joined', 400, currentY);
        doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();

        currentY += 25;
        doc.font('Helvetica').fontSize(9);
      }

      const name = user.name.length > 20
          ? user.name.substring(0, 20) + '...'
          : user.name;
      const email = user.email.length > 30
          ? user.email.substring(0, 30) + '...'
          : user.email;

      doc.text(name, 50, currentY);
      doc.text(email, 150, currentY);
      doc.text(user.role.toUpperCase(), 320, currentY);
      doc.text(new Date(user.createdAt).toLocaleDateString(), 400, currentY);

      currentY += rowHeight;

      if (index < users.length - 1) {
        doc.moveTo(50, currentY - 5)
            .lineTo(550, currentY - 5)
            .stroke();
      }
    });

    doc.end();

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const exportUsersCSV = async (req, res) => {
  try {
    const { role, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const users = await User.find(filter)
        .select('-password')
        .sort({ [sortBy]: sortOrder });

    const csvHeader = 'Name,Email,Phone,Address,Role,Joined Date\n';

    const csvRows = users.map(user => {
      return [
        `"${user.name || ''}"`,
        `"${user.email || ''}"`,
        `"${user.phone || 'N/A'}"`,
        `"${user.address || 'N/A'}"`,
        user.role,
        new Date(user.createdAt).toLocaleDateString()
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=users-report-${Date.now()}.csv`
    );

    res.send(csv);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};