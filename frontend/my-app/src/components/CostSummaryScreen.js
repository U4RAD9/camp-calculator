import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
function CostSummaryScreen({ caseData, costDetails, campDetails, companyId,onSubmit,}) {
    const [markup, setMarkup] = useState({});
    // Helper functions to handle billing counter
    const getBillingCounter = () => {
        let storedCounter = localStorage.getItem('billingCounter');
        if (!storedCounter) {
            storedCounter = '0'; // Set to zero if no value is stored
            localStorage.setItem('billingCounter', storedCounter);
        }
        return parseInt(storedCounter, 10);
    };

    const setBillingCounter = (counter) => {
        localStorage.setItem('billingCounter', counter);
    };

    // Function to generate a unique billing number
    const generateBillingNumber = () => {
        const uniqueString = 'U4RAD'; // Fixed unique identifier
        const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Date in YYYYMMDD format
        let billingCounter = getBillingCounter();
        const incrementingNumber = billingCounter.toString().padStart(3, '0'); // 3-digit formatted number
        setBillingCounter(billingCounter + 1); // Increment counter and store it
        return `${uniqueString}-${currentDate}-${incrementingNumber}`;
    };

    // Function to calculate revised unit price
    const calculateRevisedUnitPrice = (unitPrice, markupValue) => {
        return unitPrice * markupValue;
    };

    // Function to calculate total price
    const calculateTotalPrice = (revisedUnitPrice, totalCase) => {
        return revisedUnitPrice * totalCase;
    };

    // Service rows for the table
    const serviceRows = Object.keys(caseData).map((service) => {
        const { totalCase } = caseData[service];
        const { unitPrice } = costDetails[service] || { unitPrice: 0 }; // Default to 0 if undefined
        const serviceMarkup = markup[service] || 1; // Default markup value to 1 if undefined
        const revisedUnitPrice = calculateRevisedUnitPrice(unitPrice, serviceMarkup);
        const totalPrice = calculateTotalPrice(revisedUnitPrice, totalCase);

        return (
            <tr key={service} className="border-b border-gray-200">
                <td className="py-2 px-4">{service}</td>
                <td className="py-2 px-4 text-right">{totalCase || 0}</td>
                <td className="py-2 px-4 text-right">
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceMarkup}
                        onChange={(e) => handleMarkupChange(service, parseFloat(e.target.value))}
                        className="w-20 p-1 border rounded text-right"
                    />
                </td>
                <td className="py-2 px-4 text-right">₹{isNaN(revisedUnitPrice) ? '0.00' : revisedUnitPrice.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">₹{isNaN(totalPrice) ? '0.00' : totalPrice.toFixed(2)}</td>
            </tr>
        );
    });

    // Grand total calculation
    const grandTotal = Object.keys(caseData).reduce((total, service) => {
        const { totalCase } = caseData[service];
        const { unitPrice } = costDetails[service] || { unitPrice: 0 }; // Default to 0 if undefined
        const serviceMarkup = markup[service] || 1; // Default markup value to 1 if undefined
        const revisedUnitPrice = calculateRevisedUnitPrice(unitPrice, serviceMarkup);
        const totalPrice = calculateTotalPrice(revisedUnitPrice, totalCase);
        return total + totalPrice;
    }, 0);

    // Handle markup change
    const handleMarkupChange = (service, value) => {
        setMarkup((prev) => ({
            ...prev,
            [service]: value,
        }));
    };

    // Generate and download the PDF
    const handleDownloadComprehensivePDF = () => {
        const doc = new jsPDF();

        // Billing Number
        const billingNumber = generateBillingNumber();
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Billing Number: ${billingNumber}`, 14, 35);

        // Title
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 102);
        doc.text('ESTIMATION', 105, 22, { align: 'center' });
        doc.setLineWidth(1);
        doc.line(14, 28, 200, 28); // Horizontal line

        // Company Details
        doc.setFontSize(14);
        const { companyName, companyState, companyDistrict, companyPinCode, companyLandmark, companyAddress } = campDetails;

        let positionY = 45;
        if (companyName) {
            doc.text(`Company Name: ${companyName}`, 14, positionY);
            positionY += 10;
        }
        if (companyState) {
            doc.text(`State: ${companyState}`, 14, positionY);
            positionY += 10;
        }
        if (companyDistrict) {
            doc.text(`District: ${companyDistrict}`, 14, positionY);
            positionY += 10;
        }
        if (companyPinCode) {
            doc.text(`Pin Code: ${companyPinCode}`, 14, positionY);
            positionY += 10;
        }
        if (companyLandmark) {
            doc.text(`Landmark: ${companyLandmark}`, 14, positionY);
            positionY += 10;
        }
        if (companyAddress) {
            doc.text(`Company Address: ${companyAddress}`, 14, positionY);
            positionY += 10;
        }

        // Camp Locations & Dates
        doc.setFontSize(12);
        doc.text('Camp Locations & Dates:', 14, positionY);
        doc.setFontSize(10);

        const locations = campDetails.camps || [];
        if (locations.length > 0) {
            locations.forEach((camp, idx) => {
                const startDateStr = new Date(camp.startDate).toDateString();
                const endDateStr = new Date(camp.endDate).toDateString();
                const { campLocation, campState, campDistrict } = camp;

                positionY += 8;
                if (positionY > doc.internal.pageSize.height - 40) {
                    doc.addPage();
                    positionY = 20;
                }
                doc.text(
                    `- Location: ${campLocation}, State: ${campState}, District: ${campDistrict}, Dates: ${startDateStr} to ${endDateStr}`,
                    20,
                    positionY
                );
            });
        } else {
            doc.text('No camp locations provided.', 20, positionY);
        }

        // Table for Services
        const serviceRows = Object.keys(caseData).map((service) => {
            const { totalCase } = caseData[service];
            const { unitPrice } = costDetails[service] || { unitPrice: 0 }; // Default to 0 if undefined
            const serviceMarkup = markup[service] || 1; // Default markup value to 1 if undefined
            const revisedUnitPrice = calculateRevisedUnitPrice(unitPrice, serviceMarkup);
            const totalPrice = calculateTotalPrice(revisedUnitPrice, totalCase);

            return [
                service,
                totalCase || 0,
                `${revisedUnitPrice.toFixed(2)}`,
                `${totalPrice.toFixed(2)}`
            ];
        });

        doc.autoTable({
            startY: positionY + 10,
            head: [['Test Service', 'Total Case', 'Revised Unit Price', 'Total Price']],
            body: serviceRows,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 5, fillColor: [245, 245, 245] },
            headStyles: { fillColor: [0, 51, 102], textColor: 255 },
            columnStyles: {
                2: { halign: 'right' },
                3: { halign: 'right' },
            },
            margin: { top: 10 },
            pageBreak: 'auto',
        });

        // Grand Total
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Grand Total: ${grandTotal.toLocaleString()}`, 14, doc.autoTable.previous.finalY + 10);

        // Footer with Quotes
        const quotes = [
            "“The only way to do great work is to love what you do.” – Steve Jobs",
            "“Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.” – Albert Schweitzer",
            "“You don’t have to be great to start, but you have to start to be great.” – Zig Ziglar",
            "“Success usually comes to those who are too busy to be looking for it.” – Henry David Thoreau"
        ];
        doc.setFontSize(10);
        doc.setTextColor(0, 51, 102);
        doc.text(quotes[Math.floor(Math.random() * quotes.length)], 14, doc.internal.pageSize.height - 30, {
            align: 'center',
            maxWidth: 180
        });

        // Save the PDF
        doc.save(`Estimation_${billingNumber}.pdf`);
    };

    // Handle form submission
    const handleSubmit = async () => {
        const billingNumber = generateBillingNumber();
        const data = {
            company_id: companyId,
            billing_number: billingNumber,
            company_name: campDetails.companyName || '',
            company_state: campDetails.companyState || '',
            company_district: campDetails.companyDistrict || '',
            company_pincode: campDetails.companyPinCode || '',
            company_landmark: campDetails.companyLandmark || '',
            company_address: campDetails.companyAddress || '',
            camp_details: campDetails.camps || [],
            service_details: Object.keys(caseData).map((service) => {
                const { totalCase } = caseData[service];
                const { unitPrice } = costDetails[service] || { unitPrice: 0 };
                const serviceMarkup = markup[service] || 1;
                const revisedUnitPrice = calculateRevisedUnitPrice(unitPrice, serviceMarkup);
                const totalPrice = calculateTotalPrice(revisedUnitPrice, totalCase);
                return {
                    service,
                    totalCase,
                    unitPrice,
                    revisedUnitPrice,
                    totalPrice,
                };
            }),
            grand_total: grandTotal,
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/costsummaries/', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            alert('Data submitted successfully!');
        } catch (error) {
            console.error('Error submitting data:', error);
            alert('Failed to submit data.');
        }

    };
    
    return (
        <div className="p-4 bg-white rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Cost Summary</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left">Test Service</th>
                            <th className="py-2 px-4 text-right">Total Case</th>
                            <th className="py-2 px-4 text-right">Markup</th>
                            <th className="py-2 px-4 text-right">Revised Unit Price</th>
                            <th className="py-2 px-4 text-right">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviceRows}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <div className="text-right font-bold">Grand Total: ₹{grandTotal.toFixed(2)}</div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
                <button
                    onClick={handleDownloadComprehensivePDF}
                    className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-700"
                >
                    Download Estimation PDF
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white py-2 px-4 rounded shadow hover:bg-green-700"
                >
                    Submit
                </button>
                
            </div>
        </div>
    );
}

export default CostSummaryScreen;




