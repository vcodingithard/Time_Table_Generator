import Institute from "../models/Institute.js";

export const authService = {
  registerInstitute: async (data) => {
    const { institute_name, email, password, phone, address, department_name } = data;
    const newInstitute = new Institute({
      institute_name,
      email,
      phone,
      address,
      department_name,
    });

    // passport-local-mongoose handles hashing and saving
    return await Institute.register(newInstitute, password);
  },

  // Passport's req.login is callback-based, so we wrap it in a Promise for the controller
  loginUser: (req, user) => {
    return new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) reject(err);
        resolve(user);
      });
    });
  }
};