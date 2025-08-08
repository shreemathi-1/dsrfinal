"use client";

import { useState } from "react";

export default function FormFieldManagement({ 
  formFields, 
  setFormFields 
}) {
  const [editingField, setEditingField] = useState(null);

  const handleFieldUpdate = (fieldId, updates) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
    setEditingField(null);
    alert("Field updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Complaint Form Fields Configuration
          </h2>
          <p className="text-sm text-gray-600">
            Manage field properties, default values, and validation rules
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Editable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formFields.map((field) => (
                  <tr key={field.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {field.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingField === field.id ? (
                        <input
                          type="text"
                          defaultValue={field.label}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={(e) =>
                            handleFieldUpdate(field.id, {
                              label: e.target.value,
                            })
                          }
                        />
                      ) : (
                        field.label
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.type}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          handleFieldUpdate(field.id, {
                            required: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingField === field.id ? (
                        <input
                          type="text"
                          defaultValue={field.defaultValue}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={(e) =>
                            handleFieldUpdate(field.id, {
                              defaultValue: e.target.value,
                            })
                          }
                        />
                      ) : (
                        field.defaultValue || "-"
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={field.editable}
                        onChange={(e) =>
                          handleFieldUpdate(field.id, {
                            editable: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          setEditingField(
                            editingField === field.id ? null : field.id
                          )
                        }
                        className="text-purple-600 hover:text-purple-900"
                      >
                        {editingField === field.id ? "Cancel" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 