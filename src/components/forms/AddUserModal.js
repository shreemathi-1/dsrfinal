/**
 * Add User Modal Component
 *
 * A modal form component for adding new users to the Tamil Nadu Cyber Police system.
 * Includes comprehensive validation and integrates with the districts/police stations data.
 *
 * @author Tamil Nadu Cyber Police Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import {
  getAllDistricts,
  getPoliceStationsByDistrict,
} from "../../data/districts";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * Add User Modal Component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onAddUser - Function to handle adding a new user
 */
const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  // Form state
  const [formData, setFormData] = useState({
    userIdentifier: "",
    rankings: "",
    department: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    district: "",
    policeStation: "",
    status: "Active", // Default to Active
    email: "", // New email field
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Districts and police stations data
  const [allDistricts, setAllDistricts] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);

  // Team options (labelled as Team, state as department)
  const departmentOptions = [
    { value: "Admin", label: "Admin" },
    { value: "dsr", label: "DSR" },
    { value: "CCPS", label: "CCPS" },
    { value: "Ncrp", label: "NCRP" },
    { value: "Moa", label: "MOA" },
    { value: "helpline center", label: "helpline center" },
    { value: "sim and content Blocking", label: "sim and content Blocking" },
    { value: "CEIR", label: "CEIR" },
    { value: "JMIS", label: "JMIS" },
    { value: "SCCIC", label: "SCCIC" },
    { value: "Cyber arangam", label: "Cyber arangam" },
  ];

  const rankingsOptions = [
    { value: "ADGP", label: "ADGP" },
    { value: "IG", label: "IG" },
    { value: "DIG", label: "DIG" },
    { value: "Superintendent of Police", label: "Superintendent of Police" },
    { value: "ADSP", label: "ADSP" },
    { value: "ADC", label: "ADC" },
    { value: "DSP", label: "DSP" },
    { value: "Inspector", label: "Inspector" },
    { value: "SI-tech", label: "SI-tech" },
    { value: "SI", label: "SI" },
    { value: "others", label: "others.." },
  ];

  // Status options
  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Load districts data on component mount
  useEffect(() => {
    const districts = getAllDistricts();
    if (!districts.includes("Headquarters")) {
      districts.push("Headquarters");
    }
    setAllDistricts(districts);
  }, []);

  // Update police stations when district changes
  useEffect(() => {
    if (formData.district) {
      const stations = getPoliceStationsByDistrict(formData.district);
      setPoliceStations(stations);
      // Reset police station if current selection is no longer valid
      if (
        formData.policeStation &&
        !stations.includes(formData.policeStation)
      ) {
        setFormData((prev) => ({ ...prev, policeStation: "" }));
      }
    } else {
      setPoliceStations([]);
      setFormData((prev) => ({ ...prev, policeStation: "" }));
    }
  }, [formData.district, formData.policeStation]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      userIdentifier: "",
      rankings: "",
      department: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      phone: "",
      district: "",
      policeStation: "",
      status: "Active", // Default to Active
      email: "", // Reset email field
    });
    setErrors({});
    setIsSubmitting(false);
  };

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle phone number formatting
    if (name === "phone") {
      // Remove any non-digit characters except + at the beginning
      let cleanValue = value.replace(/[^\d+]/g, "");

      // If it doesn't start with +91, add it
      if (cleanValue && !cleanValue.startsWith("+91")) {
        cleanValue = "+91" + cleanValue.replace(/^\+?91?/, "");
      }

      // Limit to +91 + 10 digits
      if (cleanValue.length > 13) {
        cleanValue = cleanValue.substring(0, 13);
      }

      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Email validation helper
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  /**
   * Validate form data
   */
  const validateForm = () => {
    // Rankings is mandatory
    if (!formData.rankings) {
      newErrors.rankings = "Rankings is required";
    }
    // User Identifier is mandatory
    if (!formData.userIdentifier.trim()) {
      newErrors.userIdentifier = "User Identifier is required";
    }
    const newErrors = {};

    // Password and phone number are mandatory
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+91\d{10}$/.test(formData.phone)) {
      newErrors.phone =
        "Please enter a valid 10-digit phone number with +91 prefix";
    }

    // Email validation
    if (!formData.email || !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const { showError } = useNotification();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create user object
    const newUser = {
      id: Date.now(), // In real app, this would be generated by backend
      department: formData.department,
      team: formData.department, // Send as team
      password: formData.password,
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      rankings: formData.rankings,
      userIdentifier: formData.userIdentifier,
      phone: formData.phone.trim(),
      district: formData.district || "Not Assigned",
      policeStation: formData.policeStation.trim(),
      status: formData.status,
      email: formData.email.trim(), // Include email in newUser object
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      // Call the parent component's add user function
      await onAddUser(newUser);
      // Only close/reset if no error thrown
      onClose();
      resetForm();
    } catch (error) {
      // Do NOT close or reset the modal on error
      console.error("Error adding user:", error);
      if (typeof showError === "function") {
        showError(
          error?.message ||
            (typeof error === "string"
              ? error
              : "Failed to add user. Please try again.")
        );
      }
      setErrors({
        submit: error?.message || "Failed to add user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render form field with error handling
   */
  const renderField = (
    name,
    label,
    type = "text",
    required = false,
    options = null,
    placeholder = null
  ) => {
    // Determine if this field should have a red * (Password, Phone Number, User Identifier)
    const showRedAsterisk =
      required && ["password", "phone", "userIdentifier"].includes(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {showRedAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>

        {options ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors[name] ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option
                key={option.value || option}
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors[name] ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            required={required}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        )}

        {/* Show error message for Department, Email, Password fields only when not filled and after submit attempt */}
        {["department", "email", "password"].includes(name) && errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rankings */}
          {renderField("rankings", "Rankings", "select", true, rankingsOptions)}
          {/* User Identifier */}
          {renderField("userIdentifier", "User Identifier", "text", true)}

          {/* Status */}
          {renderField("status", "Status", "select", false, statusOptions)}

          {/* First Name */}
          {renderField("firstName", "First Name", "text", false)}

          {/* Last Name */}
          {renderField("lastName", "Last Name", "text", false)}

          {/* Phone Number */}
          {renderField(
            "phone",
            "Phone Number",
            "tel",
            true,
            null,
            "+91XXXXXXXXXX"
          )}

          {/* Department (labelled as Team) */}
          {renderField(
            "department",
            "Team",
            "select",
            false,
            departmentOptions
          )}

          {/* Password */}
          {renderField("password", "Password", "password", true)}

          {/* Confirm Password */}
          {renderField("confirmPassword", "Confirm Password", "password", true)}

          {/* District */}
          {renderField("district", "District", "select", false, allDistricts)}

          {/* Police Station */}
          {renderField(
            "policeStation",
            "Police Station",
            "select",
            false,
            policeStations
          )}

          {/* Email */}
          {renderField("email", "Email", "email", true)}
        </div>

        {/* Phone Number Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Phone Number Format:
          </h4>
          <p className="text-sm text-green-700">
            • Enter your 10-digit mobile number
            <br />
            • +91 prefix will be added automatically
            <br />• Example: +91XXXXXXXXXX
          </p>
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Password Requirements:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Minimum 8 characters long</li>
            <li>• At least one uppercase letter (A-Z)</li>
            <li>• At least one lowercase letter (a-z)</li>
            <li>• At least one number (0-9)</li>
            <li>• Must match the confirm password field</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding User...
              </>
            ) : (
              "Add User"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
