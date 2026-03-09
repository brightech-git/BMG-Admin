import React from "react";

const ActiveSchemesPage = ({ dashData }) => {

  const schemes = dashData?.activeSchemes || [];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">

      <h2 className="text-lg font-semibold mb-4">
        Active Schemes
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full border text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">Company ID</th>
              <th className="p-3 border text-left">Scheme ID</th>
              <th className="p-3 border text-left">Scheme Name</th>
              <th className="p-3 border text-left">Short Name</th>
              <th className="p-3 border text-center">Instalment</th>
            </tr>
          </thead>

          <tbody>

            {schemes.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No Active Schemes Found
                </td>
              </tr>
            )}

            {schemes.map((scheme, index) => (
              <tr key={index} className="hover:bg-gray-50">

                <td className="p-3 border">
                  {scheme.companyId}
                </td>

                <td className="p-3 border">
                  {scheme.schemeId}
                </td>

                <td className="p-3 border">
                  {scheme.schemeName}
                </td>

                <td className="p-3 border">
                  {scheme.schemeSName}
                </td>

                <td className="p-3 border text-center">
                  {scheme.instalment}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ActiveSchemesPage;