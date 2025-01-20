frappe.ui.form.on('Lead', {
    refresh: function(frm) {
        frm.add_custom_button('Call Customer', function() {
            if (!frm.doc.mobile_no) {
                frappe.msgprint('Please enter a Mobile Number first.');
                return;
            }
            frappe.call({
                method: 'aabee.telecmi.telecmi.initiate_full_process',
                args: {
                    number: frm.doc.mobile_no
                },
                callback: function(response) {
                    if (response.message) {
                        frappe.msgprint('Call initiated successfully!');
                    }
                }
            });
        });
    }
});



// frappe.ui.form.on('Lead', {
//     refresh: function(frm) {
//         console.log("Lead form refresh");
//         if (frm.doc.phone) {
//             console.log("Phone number exists:", frm.doc.phone);
//             frm.add_custom_button(__('Call'), async function() {
//                 console.log("Call button clicked");
//                 try {
//                     if (frappe.telecmi && frappe.telecmi.piopiy) {
//                         console.log("Attempting to make call to:", frm.doc.phone);
//                         // Wait for the make_call function to complete
//                         await frappe.telecmi.make_call(frm.doc.phone);
//                     } else {
//                         console.error("Telecmi or PIOPIY not initialized");
//                         frappe.show_alert({
//                             message: 'Telecmi not initialized properly. Please refresh the page.',
//                             indicator: 'red'
//                         });
//                     }
//                 } catch (error) {
//                     console.error("Error making call:", error);
//                     frappe.show_alert({
//                         message: 'Error making call: ' + error.message,
//                         indicator: 'red'
//                     });
//                 }
//             }, __('Telecmi'));
//         }
//     }
// });



// frappe.ui.form.on('Lead', {
//     refresh: function(frm) {
//         // Create container for TeleCMI iframe if it doesn't exist
//         if (!document.getElementById('telecmi-container')) {
//             const container = document.createElement('div');
//             container.id = 'telecmi-container';
//             container.style.cssText = `
//                 position: fixed;
//                 bottom: 20px;
//                 right: 20px;
//                 z-index: 1000;
//                 width: 300px;
//                 height: 500px;
//             `;
            
//             // Create the iframe
//             const iframe = document.createElement('iframe');
//             iframe.src = 'https://iframe.telecmi.com/hubspot/'; // Replace with your actual TeleCMI URL
//             iframe.style.cssText = `
//                 width: 100%;
//                 height: 100%;
//                 border: none;
//                 border-radius: 8px;
//                 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//             `;
            
//             container.appendChild(iframe);
//             document.body.appendChild(container);
//         }
//     }
// });