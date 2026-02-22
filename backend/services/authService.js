import mongoose from "mongoose";
import Institute from "../models/Institute.js";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";

export const authService = {
  /**
   * REGISTER INSTITUTE
   * Creates an Institute and automatically assigns the FREE plan.
   * Uses a Transaction to ensure data integrity.
   */
  registerInstitute: async (data) => {
    const { institute_name, email, password, phone, address, department_name } = data;

    // Start a Mongoose Session for Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create the Institute instance
      const newInstitute = new Institute({
        institute_name,
        email,
        phone,
        address,
        department_name,
      });

      // 2. Register via Passport (hashes & saves)
      // Note: pass the session to the save operation if your library supports it, 
      // but passport-local-mongoose's .register() usually handles its own save.
      const registeredInstitute = await Institute.register(newInstitute, password);

      // 3. Find the default "FREE" plan
      const freePlan = await Plan.findOne({ name: "FREE" }).session(session);
      
      if (!freePlan) {
        throw new Error("Default registration plan (FREE) not found in system.");
      }

      // 4. Create the initial Subscription
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (freePlan.validity_days || 30));

      await Subscription.create([{
        institute: registeredInstitute._id,
        plan: freePlan._id,
        status: "ACTIVE",
        expiry_date: expiryDate,
        calls_used: 0
      }], { session });

      // If everything is successful, commit the transaction
      await session.commitTransaction();
      return registeredInstitute;

    } catch (err) {
      // If any step fails, rollback all changes
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },

  /**
   * LOGIN USER
   * Wraps Passport's callback-based login into a Promise.
   */
  loginUser: (req, user) => {
    return new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) reject(err);
        resolve(user);
      });
    });
  }
};