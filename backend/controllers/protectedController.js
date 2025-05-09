exports.getProtectedData = (req, res) => {
    try {
      // Access the verified doctor information from the token
      const doctor = req.doctor;
      
      res.status(200).json({
        success: true,
        message: 'Access granted to protected dental data',
        doctor: {
          id: doctor.id,
          username: doctor.username,
          // Add other doctor info you might have in the token
        },
        dentalData: {
          // Add any protected dental data you want to return
          appointments: [],
          patients: [],
          // etc.
        }
      });
    } catch (error) {
      console.error('Protected controller error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };