import passport from "passport";
import { authService } from "../services/authService.js";

export const signup = async (req, res, next) => {
  try {

    const registeredInstitute = await authService.registerInstitute(req.body);
    console.log(req.body)
    // Automatically log in after signup
    await authService.loginUser(req, registeredInstitute);
    
    return res.status(201).json({ 
      success: true, 
      message: "Signup successful", 
      user: registeredInstitute 
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

export const login = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: info?.message || "Invalid email or password" 
      });
    }

    try {
      await authService.loginUser(req, user);
      return res.json({ 
        success: true, 
        message: "Login successful", 
        user 
      });
    } catch (loginErr) {
      return res.status(500).json({ success: false, error: loginErr.message });
    }
  })(req, res, next);
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Logged out successfully" });
  });
};

export const getSession = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};