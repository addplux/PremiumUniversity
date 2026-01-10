# Role-Based Access Control System - Setup Guide

## Initial Setup

### 1. Create First System Admin Account

After deploying the new RBAC system, you need to create the first System Admin account to bootstrap user management.

**Run the bootstrap script:**

```bash
cd backend
node scripts/createSystemAdmin.js
```

Follow the prompts to enter:
- First Name
- Last Name
- Email
- Phone
- Password (minimum 6 characters)

The script will create a System Admin account with full access to user management, system monitoring, and security features.

### 2. Update Existing Admin Accounts (If Any)

If you have existing admin accounts in the database, you'll need to update their roles manually:

**Option A: Using MongoDB Compass or Studio 3T**
1. Connect to your database
2. Navigate to the `users` collection
3. Find admin users (where `role: "admin"`)
4. Update their `role` field to one of:
   - `system_admin` - For full system access
   - `finance_admin` - For finance management
   - `academic_admin` - For academic management

**Option B: Using MongoDB Shell**

```javascript
// Update specific user by email
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "system_admin" } }
)

// Or update all old admin accounts to system_admin
db.users.updateMany(
  { role: "admin" },
  { $set: { role: "system_admin" } }
)
```

## Role Descriptions

### 🔧 System Admin
**Full system access** - Can manage all users, monitor system health, view audit logs, and manage security.

**Capabilities:**
- Create/edit/delete any user account
- Assign roles to users
- View system health metrics
- Access audit logs
- Monitor security events
- Manage database

**Cannot access:**
- Finance operations (payments, fees)
- Academic operations (grades, assignments, timetables)

### 🏦 Finance Admin
**Financial management** - Can manage student fees and payment records.

**Capabilities:**
- Record student payments
- View payment history
- Track outstanding fees
- Generate financial reports
- View financial statistics

**Cannot access:**
- User management
- Academic operations
- System administration

### 📚 Academic Admin
**Academic management** - Can manage courses, assignments, grades, and timetables.

**Capabilities:**
- Create/edit courses
- Post assignments
- Grade submissions
- Post CA marks and GPA
- Manage timetables/schedules
- Schedule online classes
- Upload course materials

**Cannot access:**
- User management
- Finance operations
- System administration

### 👨‍🎓 Student
**Student access** - Can view their own data and submit assignments.

**Capabilities:**
- View enrolled courses
- Submit assignments
- View grades and GPA
- View payment history
- View timetable
- Join online classes

## API Endpoints by Role

### System Admin Only
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Change user role
- `DELETE /api/users/:id` - Delete user
- `GET /api/system/health` - System health
- `GET /api/system/logs` - Audit logs
- `GET /api/system/stats` - System statistics
- `GET /api/system/security` - Security monitoring

### Finance Admin Only
- `POST /api/finance` - Record payment
- `GET /api/finance` - View all payments
- `GET /api/finance/student/:id` - View student payments
- `GET /api/finance/stats` - Financial statistics

### Academic Admin Only
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/submission/:id/grade` - Grade assignment
- `POST /api/grades` - Post grades
- `PUT /api/grades/:id` - Update grades
- `POST /api/schedules` - Create timetable
- `POST /api/online-classes` - Schedule online class

### Student Access
- `GET /api/finance/my` - View own payments
- `GET /api/grades/my` - View own grades
- `GET /api/schedules/my` - View own timetable
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/online-classes/my` - View enrolled classes

## Security Features

### Audit Logging
All admin actions are automatically logged with:
- User who performed the action
- Action type
- Timestamp
- IP address
- User agent
- Details of the action

View audit logs via: `GET /api/system/logs` (System Admin only)

### Role Validation
Every protected route validates the user's role before allowing access. Unauthorized access attempts are logged and rejected with a 403 Forbidden response.

### Password Security
All passwords are hashed using bcrypt before storage. Passwords are never returned in API responses.

## Testing the System

1. **Create test accounts for each role:**
   ```bash
   # Use the System Admin account to create:
   POST /api/users
   {
     "firstName": "Finance",
     "lastName": "Admin",
     "email": "finance@psohs.ac.zm",
     "phone": "1234567890",
     "password": "password123",
     "role": "finance_admin"
   }
   ```

2. **Test role restrictions:**
   - Try accessing finance routes with academic admin credentials (should fail)
   - Try accessing system routes with finance admin credentials (should fail)
   - Verify students can only access their own data

3. **Verify audit logging:**
   - Perform admin actions
   - Check audit logs via `GET /api/system/logs`

## Troubleshooting

### "Not authorized - System Admin access required"
- Verify your account has `role: "system_admin"`
- Check that you're sending the correct JWT token
- Ensure the token hasn't expired

### "User already exists with this email"
- The email is already registered
- Use a different email or update the existing user's role

### Cannot create first System Admin
- Run the bootstrap script: `node scripts/createSystemAdmin.js`
- Or manually create in database with `role: "system_admin"`

## Next Steps

After setting up the RBAC system:
1. Create admin accounts for each role
2. Update frontend to support role-based routing
3. Test all role permissions thoroughly
4. Train staff on their specific admin interfaces
5. Monitor audit logs regularly for security
