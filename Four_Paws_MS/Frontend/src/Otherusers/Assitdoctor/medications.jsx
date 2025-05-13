import React from 'react';

const Medications = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#028478]">Medications</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Total Medications</p>
          <p className="text-3xl font-bold text-[#028478]">42</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">In Stock</p>
          <p className="text-3xl font-bold text-[#028478]">35</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Low Stock</p>
          <p className="text-3xl font-bold text-[#028478]">5</p>
        </div>
        <div className="bg-[#A6E3E9] p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-900">Out of Stock</p>
          <p className="text-3xl font-bold text-[#028478]">2</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#71C9CE]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Medication
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Medication {item}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {["Antibiotic", "Painkiller", "Vaccine", "Supplement", "Antiparasitic"][item % 5]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item * 5} in stock
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${(item * 5.5).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[#028478] hover:text-[#71C9CE]">
                    Prescribe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medications;