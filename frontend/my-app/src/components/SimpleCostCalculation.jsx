import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { jsPDF } from "jspdf";


function SimpleCostCalculation({ caseData, onSubmit,campDetails}) {
  const [priceRanges, setPriceRanges] = useState({});
  const [subserviceCosts, setSubserviceCosts] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  console.log(campDetails)

  useEffect(() => {
    console.log('caseData:', caseData);
  }, [caseData]);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const [priceResponse, subserviceResponse] = await Promise.all([
          axios.get('http://15.206.159.215:8000/api/prices/'),
          axios.get('http://15.206.159.215:8000/api/service_costs/'),
        ]);

        const priceData = priceResponse.data.reduce((acc, service) => {
          acc[service.name] = service.price_ranges.map(range => ({
            maxCases: range.max_cases,
            pricePerCase: parseFloat(range.price),
          }));
          return acc;
        }, {});

        const subserviceData = subserviceResponse.data.reduce((acc, service) => {
          if (['CBC', 'Complete Hemogram', 'Hemoglobin', 'Urine Routine', 'Stool Examination', 'Lipid Profile', 'Kidney Profile', 'LFT', 'KFT', 'Random Blood Glucose', 'Blood Grouping'].includes(service.test_type_name)) {
            acc[service.test_type_name] = {
              salary: parseFloat(service.salary),
              incentive: parseFloat(service.incentive),
              misc: parseFloat(service.misc),
              equipment: parseFloat(service.equipment),
              reporting: parseFloat(service.reporting),
            };
          }
          return acc;
        }, {});

        setPriceRanges(priceData);
        setSubserviceCosts(subserviceData);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching service prices or costs:', error);
      }
    };

    if (!initialized) {
      fetchServiceData();
    }
  }, [initialized]);

  const calculateTotalPrice = (service, totalCase) => {
    if (subserviceCosts.hasOwnProperty(service)) {
      const { salary, incentive, misc, equipment, reporting } = subserviceCosts[service] || {};
      return (salary + incentive + misc + equipment + reporting) * totalCase;
    } else {
      const ranges = priceRanges[service] || [];
      let pricePerCase = 0;

      for (let i = 0; i < ranges.length; i++) {
        if (totalCase <= ranges[i].maxCases) {
          pricePerCase = ranges[i].pricePerCase;
          break;
        }
      }
      const reportTypeCost = caseData[service]?.reportTypeCost || 0;
      return (totalCase * pricePerCase) + reportTypeCost;
    }
  };

  const calculateGrandTotal = () => {
    const total = Object.keys(caseData).reduce((total, service) => {
      const totalCase = caseData[service]?.totalCase || 0;
      return total + calculateTotalPrice(service, totalCase);
    }, 0);
    return total * ((100 - discount) / 100);
  };
  const calculateTotalCases = () => {
    return Object.keys(caseData).reduce((totalCases, service) => {
      return totalCases + (caseData[service]?.totalCase || 0);
    }, 0);
  };

  const handleCouponSubmit = async () => {
    try {
      const response = await axios.get(`http://15.206.159.215:8000/api/api/validate-coupon/${couponCode}/`);
      setDiscount(response.data.discount_percentage);
      setError('');
    } catch (error) {
      setDiscount(0);
      setError('Invalid coupon code');
    }
  };
  

  const handleSubmit = async () => {
    const costData = Object.keys(caseData).map(service => ({
      service_name: service,
      total_cases: caseData[service]?.totalCase || 0,
    }));
  
    const postData = {
      company_name: campDetails.companyName,
      grand_total: grandTotal.toFixed(2),
      services: costData,
    };
  
    try {
      await axios.post('http://15.206.159.215:8000/api/company-details/', postData);
      onSubmit(costData);
      navigate('/CoordinatorLogin');
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  const grandTotal = calculateGrandTotal();
  const totalCases = calculateTotalCases();
  const perCasePrice = totalCases > 0 ? grandTotal / totalCases : 0;
  const generatePDF = () => {
    // Switch to landscape 'a3' for more horizontal space
    const doc = new jsPDF('l', 'mm', 'a3'); // Landscape, A3 size
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15; // Margin remains the same
    const rowHeight = 12;
    const headerHeight = 10;
    const sectionSpacing = 10;

    // Adjusted column widths to fit more content on the wider page
    const columnWidths = [40, 60, 60, 40, 35, 45, 45];

    // Set PDF title
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text("U4RAD CAMP CALCULATOR", margin, margin);

    // Company Details Section
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Company Details", margin, margin + 25);
    doc.setFontSize(12);

    // Company Details Grid
    const companyDetails = [
        { label: "Company Name", value: campDetails.companyName },
        { label: "Company Landmark", value: campDetails.companyLandmark },
        { label: "Company District", value: campDetails.companyDistrict },
        { label: "Company State", value: campDetails.companyState },
        { label: "Company Pin Code", value: campDetails.companyPinCode },
    ];

    let currentY = margin + 35;
    doc.setFont("Helvetica", "bold");
    companyDetails.forEach(detail => {
        doc.text(`${detail.label}: ${detail.value}`, margin, currentY);
        currentY += rowHeight + 2;
    });

    // Camps Section
    doc.setFontSize(18);
    currentY += sectionSpacing;
    doc.text("Camps", margin, currentY);
    const camps = campDetails.camps;

    // Draw Camps Table Header
    const campHeaders = ["District", "Location", "Landmark", "State", "Pin Code", "Start Date", "End Date"];
    const campHeaderY = currentY + 10;

    // Draw Camps Header with Borders and Background Color
    doc.setFillColor(0, 153, 255);
    doc.rect(margin, campHeaderY - headerHeight, pageWidth - 2 * margin, headerHeight, 'F');
    doc.setFont("Helvetica", "bold");

    campHeaders.forEach((header, index) => {
        const xPos = margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
        doc.text(header, xPos + 2, campHeaderY);
    });

    // Draw Camps Rows with alternating colors and increased spacing
    let campStartY = campHeaderY + 8;
    camps.forEach((camp, index) => {
        if (campStartY + rowHeight > doc.internal.pageSize.height - margin) {
            doc.addPage();
            campStartY = margin;
        }
        doc.setFillColor(index % 2 === 0 ? 240 : 255);
        doc.rect(margin, campStartY, pageWidth - 2 * margin, rowHeight, 'F');
        doc.setFont("Helvetica", "normal");

        let xOffset = margin;
        doc.text(camp.campDistrict, xOffset, campStartY + 6);
        xOffset += columnWidths[0];
        doc.text(camp.campLocation, xOffset, campStartY + 6);
        xOffset += columnWidths[1];
        doc.text(camp.campLandmark, xOffset, campStartY + 6);
        xOffset += columnWidths[2];
        doc.text(camp.campState, xOffset, campStartY + 6);
        xOffset += columnWidths[3];
        doc.text(camp.campPinCode, xOffset, campStartY + 6);
        xOffset += columnWidths[4];

        // Format and fit the Start Date and End Date with proper spacing
        const startDateFormatted = new Date(camp.startDate).toLocaleDateString();
        const endDateFormatted = new Date(camp.endDate).toLocaleDateString();
        doc.text(startDateFormatted, xOffset, campStartY + 6);
        xOffset += columnWidths[5];
        doc.text(endDateFormatted, xOffset, campStartY + 6);

        campStartY += rowHeight + 4;
    });

    // Service Costs Section
    doc.setFontSize(18);
    currentY = campStartY + sectionSpacing;
    doc.text("Service Costs", margin, currentY);

    // Draw Service Costs Table Header
    const serviceHeaders = ["Service", "Total Cases"];
    const serviceHeaderY = currentY + 10;

    // Draw Service Header with Borders and Background Color
    doc.setFillColor(0, 153, 255);
    doc.rect(margin, serviceHeaderY - headerHeight, pageWidth - 2 * margin, headerHeight, 'F');
    doc.setFont("Helvetica", "bold");
    serviceHeaders.forEach((header, index) => {
        const xPos = margin + index * 100; // Increased spacing to fit wider page
        doc.text(header, xPos + 2, serviceHeaderY);
    });

    // Draw Service Costs Rows with alternating colors and increased spacing
    let serviceStartY = serviceHeaderY + 8;
    Object.keys(caseData).forEach((service, index) => {
        if (serviceStartY + rowHeight > doc.internal.pageSize.height - margin) {
            doc.addPage();
            serviceStartY = margin;
        }
        const totalCase = caseData[service]?.totalCase || 0;
        doc.setFillColor(index % 2 === 0 ? 240 : 255);
        doc.rect(margin, serviceStartY, pageWidth - 2 * margin, rowHeight, 'F');
        doc.setFont("Helvetica", "normal");
        doc.text(service, margin + 0, serviceStartY + 6);
        doc.text(totalCase.toString(), margin + 100, serviceStartY + 6); // Adjusted positioning
        serviceStartY += rowHeight + 4;
    });

    // Calculate Grand Total and Per-Case Price
    const grandTotal = calculateGrandTotal();
    const totalCases = calculateTotalCases();
    const perCasePrice = totalCases > 0 ? grandTotal / totalCases : 0;

    // Grand Total Section
    doc.setFontSize(16);
    doc.setFont("Helvetica", "bold");
    currentY = serviceStartY + sectionSpacing;
    doc.setTextColor(0, 102, 204);
    doc.text(`Grand Total: ${grandTotal.toFixed(0)}`, margin, currentY);
    doc.text(`Per-Case Price: ${perCasePrice.toFixed(0)}`, margin, currentY + 10);

    // Save PDF
    doc.save("camp_calculator.pdf");
};

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
     <h2 className="text-4xl font-extrabold mb-6 text-blue-600 text-center shadow-lg p-4 rounded-md bg-gray-50 border border-gray-200">
  U4RAD 
</h2>

      <div className="space-y-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Test Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total Cases</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(caseData).map(service => {
              const totalCase = caseData[service]?.totalCase || 0;
              return (
                <tr key={service} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{service}</td>
                  <td className="px-4 py-3">{totalCase}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4">
          <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
            Discount Coupon
          </label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
            <button
              onClick={handleCouponSubmit}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Apply
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <div className="text-lg font-bold text-gray-800">
            Grand Total: ₹{grandTotal.toFixed(0)}
          </div>
          <div className="text-lg font-bold text-gray-800">
          Per-Case Price: ₹{perCasePrice.toFixed(0)}
          </div>
        </div>
        <div>
  <button
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    onClick={generatePDF}
  >
    Generate PDF
  </button>
</div>

        <div className="flex justify-between mt-4">
          <Link to="/login">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              Logout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SimpleCostCalculation;
